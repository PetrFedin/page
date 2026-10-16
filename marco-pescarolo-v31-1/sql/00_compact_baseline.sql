-- Marco Pescarolo v31.1 compact PG17 admission baseline
CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS private;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='anon') THEN CREATE ROLE anon NOLOGIN; END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='authenticated') THEN CREATE ROLE authenticated NOLOGIN; END IF;
END $$;

CREATE OR REPLACE FUNCTION auth.jwt() RETURNS jsonb
LANGUAGE sql STABLE AS $$
  SELECT COALESCE(NULLIF(current_setting('request.jwt.claims',true),''),'{}')::jsonb
$$;
CREATE OR REPLACE FUNCTION auth.uid() RETURNS uuid
LANGUAGE sql STABLE AS $$
  SELECT NULLIF(auth.jwt()->>'sub','')::uuid
$$;

CREATE TABLE public.tenants(
  id uuid PRIMARY KEY, slug text UNIQUE NOT NULL, status text NOT NULL
);
CREATE TABLE public.users(
  id uuid PRIMARY KEY, tenant_id uuid NOT NULL REFERENCES public.tenants(id),
  email text NOT NULL, display_name text NOT NULL, role text NOT NULL, is_active boolean NOT NULL DEFAULT true
);
CREATE TABLE public.clients(
  id uuid PRIMARY KEY, tenant_id uuid NOT NULL REFERENCES public.tenants(id),
  code text NOT NULL, client_type text NOT NULL, name text NOT NULL
);
CREATE TABLE public.client_stores(
  id uuid PRIMARY KEY, tenant_id uuid NOT NULL REFERENCES public.tenants(id),
  client_id uuid NOT NULL REFERENCES public.clients(id),
  code text NOT NULL, name text NOT NULL, is_active boolean NOT NULL DEFAULT true
);
CREATE TABLE public.portal_memberships(
  id uuid PRIMARY KEY, tenant_id uuid NOT NULL REFERENCES public.tenants(id),
  auth_user_id uuid NOT NULL, public_user_id uuid NOT NULL REFERENCES public.users(id),
  client_id uuid NOT NULL REFERENCES public.clients(id), client_store_id uuid REFERENCES public.client_stores(id),
  access_role text NOT NULL, status text NOT NULL
);
CREATE TABLE public.mp_brand_admin_memberships(
  id uuid PRIMARY KEY, tenant_id uuid NOT NULL REFERENCES public.tenants(id),
  auth_user_id uuid NOT NULL, public_user_id uuid NOT NULL REFERENCES public.users(id), status text NOT NULL
);
CREATE TABLE public.products(
  id uuid PRIMARY KEY, tenant_id uuid NOT NULL REFERENCES public.tenants(id),
  style_code text NOT NULL, unit_cost numeric
);
CREATE TABLE public.private_fit_profiles(
  id uuid PRIMARY KEY, tenant_id uuid NOT NULL REFERENCES public.tenants(id),
  client_id uuid NOT NULL REFERENCES public.clients(id), active_version integer NOT NULL DEFAULT 0
);
CREATE TABLE public.private_fit_profile_versions(
  id uuid PRIMARY KEY, profile_id uuid NOT NULL REFERENCES public.private_fit_profiles(id),
  version_no integer NOT NULL, height_cm numeric, chest_cm numeric, waist_cm numeric,
  hips_cm numeric, inseam_cm numeric, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.reorder_proposals(
  id uuid PRIMARY KEY, tenant_id uuid NOT NULL REFERENCES public.tenants(id),
  client_id uuid NOT NULL REFERENCES public.clients(id), client_store_id uuid REFERENCES public.client_stores(id),
  status text NOT NULL
);
CREATE TABLE public.deals(
  id uuid PRIMARY KEY, tenant_id uuid NOT NULL REFERENCES public.tenants(id),
  client_id uuid NOT NULL REFERENCES public.clients(id), client_store_id uuid REFERENCES public.client_stores(id),
  gross_contribution numeric
);
CREATE TABLE public.deal_lines(
  id uuid PRIMARY KEY, deal_id uuid NOT NULL REFERENCES public.deals(id), unit_cost_snapshot numeric
);

CREATE OR REPLACE FUNCTION private.mp_brand_admin_actor()
RETURNS public.mp_brand_admin_memberships
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=''
AS $$
DECLARE a public.mp_brand_admin_memberships%ROWTYPE;
BEGIN
  SELECT * INTO a FROM public.mp_brand_admin_memberships
  WHERE auth_user_id=auth.uid() AND status='active' LIMIT 1;
  IF NOT FOUND THEN RAISE EXCEPTION 'brand_admin_membership_required' USING ERRCODE='42501'; END IF;
  RETURN a;
END $$;

CREATE OR REPLACE FUNCTION public.mp_my_access()
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=''
AS $$
DECLARE m jsonb; a boolean;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'authentication_required' USING ERRCODE='42501'; END IF;
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'access_role',CASE access_role WHEN 'private_client' THEN 'private' WHEN 'buyer' THEN 'wholesale' ELSE access_role END,
    'client_id',client_id,'client_store_id',client_store_id
  )),'[]'::jsonb)
  INTO m FROM public.portal_memberships WHERE auth_user_id=auth.uid() AND status='active';
  SELECT EXISTS(SELECT 1 FROM public.mp_brand_admin_memberships WHERE auth_user_id=auth.uid() AND status='active') INTO a;
  RETURN jsonb_build_object('memberships',m,'admin',a);
END $$;

CREATE OR REPLACE FUNCTION public.mp_client_snapshot(p_access_role text,p_store_id uuid)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=''
AS $$
DECLARE m public.portal_memberships%ROWTYPE;
BEGIN
  IF p_access_role='private' THEN
    SELECT * INTO m FROM public.portal_memberships
    WHERE auth_user_id=auth.uid() AND access_role='private_client' AND status='active' LIMIT 1;
    IF NOT FOUND OR p_store_id IS NOT NULL THEN RAISE EXCEPTION 'private_membership_required' USING ERRCODE='42501'; END IF;
  ELSIF p_access_role='wholesale' THEN
    SELECT * INTO m FROM public.portal_memberships
    WHERE auth_user_id=auth.uid() AND access_role='buyer' AND status='active' LIMIT 1;
    IF NOT FOUND THEN RAISE EXCEPTION 'buyer_membership_required' USING ERRCODE='42501'; END IF;
    IF p_store_id IS NULL AND m.client_store_id IS NOT NULL THEN RAISE EXCEPTION 'store_required' USING ERRCODE='42501'; END IF;
    IF p_store_id IS NOT NULL AND NOT EXISTS(
      SELECT 1 FROM public.client_stores s
      WHERE s.id=p_store_id AND s.tenant_id=m.tenant_id AND s.client_id=m.client_id AND s.is_active
      AND (m.client_store_id IS NULL OR m.client_store_id=s.id)
    ) THEN RAISE EXCEPTION 'store_outside_membership' USING ERRCODE='42501'; END IF;
  ELSE
    RAISE EXCEPTION 'unsupported_access_role';
  END IF;
  RETURN jsonb_build_object('client_id',m.client_id,'client_store_id',COALESCE(p_store_id,m.client_store_id));
END $$;

CREATE OR REPLACE FUNCTION public.mp_private_add_fit_profile_version(p_profile_id uuid,p_height numeric)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=''
AS $$
DECLARE m public.portal_memberships%ROWTYPE; p public.private_fit_profiles%ROWTYPE; v uuid:=gen_random_uuid();
BEGIN
  SELECT * INTO m FROM public.portal_memberships
  WHERE auth_user_id=auth.uid() AND access_role='private_client' AND status='active' LIMIT 1;
  IF NOT FOUND THEN RAISE EXCEPTION 'private_membership_required' USING ERRCODE='42501'; END IF;
  SELECT * INTO p FROM public.private_fit_profiles
  WHERE id=p_profile_id AND tenant_id=m.tenant_id AND client_id=m.client_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'fit_profile_not_found' USING ERRCODE='42501'; END IF;
  INSERT INTO public.private_fit_profile_versions(id,profile_id,version_no,height_cm)
  VALUES(v,p.id,p.active_version+1,p_height);
  UPDATE public.private_fit_profiles SET active_version=active_version+1 WHERE id=p.id;
  RETURN v;
END $$;

CREATE OR REPLACE FUNCTION public.mp_wholesale_approve_reorder(p_proposal_id uuid)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path=''
AS $$
DECLARE m public.portal_memberships%ROWTYPE; p public.reorder_proposals%ROWTYPE;
BEGIN
  SELECT * INTO m FROM public.portal_memberships
  WHERE auth_user_id=auth.uid() AND access_role='buyer' AND status='active' LIMIT 1;
  IF NOT FOUND THEN RAISE EXCEPTION 'buyer_membership_required' USING ERRCODE='42501'; END IF;
  SELECT * INTO p FROM public.reorder_proposals WHERE id=p_proposal_id FOR UPDATE;
  IF NOT FOUND OR p.tenant_id<>m.tenant_id OR p.client_id<>m.client_id
     OR (m.client_store_id IS NOT NULL AND p.client_store_id IS DISTINCT FROM m.client_store_id)
  THEN RAISE EXCEPTION 'reorder_outside_membership' USING ERRCODE='42501'; END IF;
  IF p.status<>'proposed' THEN RAISE EXCEPTION 'invalid_reorder_state'; END IF;
  UPDATE public.reorder_proposals SET status='buyer_approved' WHERE id=p.id;
  RETURN 'buyer_approved';
END $$;

CREATE OR REPLACE FUNCTION public.mp_admin_approve_reorder(p_proposal_id uuid)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path=''
AS $$
DECLARE a public.mp_brand_admin_memberships%ROWTYPE;
BEGIN
  a:=private.mp_brand_admin_actor();
  IF COALESCE(auth.jwt()->>'aal','')<>'aal2' THEN RAISE EXCEPTION 'admin_mfa_required' USING ERRCODE='42501'; END IF;
  UPDATE public.reorder_proposals SET status='brand_approved'
  WHERE id=p_proposal_id AND tenant_id=a.tenant_id AND status='buyer_approved';
  IF NOT FOUND THEN RAISE EXCEPTION 'reorder_not_ready'; END IF;
  RETURN 'brand_approved';
END $$;

REVOKE ALL ON FUNCTION public.mp_private_add_fit_profile_version(uuid,numeric) FROM PUBLIC,anon;
REVOKE ALL ON FUNCTION public.mp_wholesale_approve_reorder(uuid) FROM PUBLIC,anon;
REVOKE ALL ON FUNCTION public.mp_admin_approve_reorder(uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.mp_my_access(),public.mp_client_snapshot(text,uuid),
  public.mp_private_add_fit_profile_version(uuid,numeric),
  public.mp_wholesale_approve_reorder(uuid),public.mp_admin_approve_reorder(uuid)
TO authenticated;

REVOKE ALL ON public.products,public.deals,public.deal_lines FROM anon,authenticated;

INSERT INTO public.tenants VALUES('00000000-0000-4000-8000-000000000001','marco-pescarolo','active');
