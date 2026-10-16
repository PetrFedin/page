\set ON_ERROR_STOP on
CREATE EXTENSION IF NOT EXISTS pgcrypto;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='anon') THEN CREATE ROLE anon NOLOGIN; END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='authenticated') THEN CREATE ROLE authenticated NOLOGIN; END IF;
END $$;
CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS private;
GRANT USAGE ON SCHEMA public,auth,private TO authenticated;
GRANT USAGE ON SCHEMA public,auth TO anon;
REVOKE USAGE ON SCHEMA private FROM anon;

CREATE OR REPLACE FUNCTION auth.jwt() RETURNS jsonb LANGUAGE sql STABLE AS $$
  SELECT COALESCE(NULLIF(current_setting('request.jwt.claims',true),''),'{}')::jsonb
$$;
CREATE OR REPLACE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$
  SELECT NULLIF(auth.jwt()->>'sub','')::uuid
$$;

CREATE TABLE auth.users(
 id uuid PRIMARY KEY,aud text,role text,email text,raw_app_meta_data jsonb NOT NULL DEFAULT '{}'::jsonb,
 raw_user_meta_data jsonb NOT NULL DEFAULT '{}'::jsonb,created_at timestamptz DEFAULT now(),updated_at timestamptz DEFAULT now()
);
CREATE TABLE public.tenants(id uuid PRIMARY KEY,slug text UNIQUE NOT NULL,status text NOT NULL);
CREATE TABLE public.users(
 id uuid PRIMARY KEY,tenant_id uuid NOT NULL REFERENCES public.tenants(id),email text NOT NULL,
 display_name text NOT NULL,role text NOT NULL,is_active boolean NOT NULL DEFAULT true
);
CREATE TABLE public.clients(
 id uuid PRIMARY KEY,tenant_id uuid NOT NULL REFERENCES public.tenants(id),code text NOT NULL,
 client_type text NOT NULL,name text NOT NULL,market text,country_code text,currency text NOT NULL DEFAULT 'EUR',stage text NOT NULL DEFAULT 'active'
);
CREATE TABLE public.client_stores(
 id uuid PRIMARY KEY,tenant_id uuid NOT NULL REFERENCES public.tenants(id),client_id uuid NOT NULL REFERENCES public.clients(id),
 code text NOT NULL,name text NOT NULL,store_type text NOT NULL DEFAULT 'store',city text,country_code text,is_active boolean NOT NULL DEFAULT true
);
CREATE TABLE public.portal_memberships(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),tenant_id uuid NOT NULL REFERENCES public.tenants(id),auth_user_id uuid NOT NULL,
 public_user_id uuid NOT NULL REFERENCES public.users(id),client_id uuid NOT NULL REFERENCES public.clients(id),
 client_store_id uuid REFERENCES public.client_stores(id),access_role text NOT NULL,status text NOT NULL,activated_at timestamptz
);
CREATE TABLE public.mp_brand_admin_memberships(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),tenant_id uuid NOT NULL REFERENCES public.tenants(id),auth_user_id uuid NOT NULL,
 public_user_id uuid NOT NULL REFERENCES public.users(id),status text NOT NULL,activated_at timestamptz
);
CREATE TABLE public.products(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),tenant_id uuid NOT NULL REFERENCES public.tenants(id),style_code text NOT NULL,
 status text NOT NULL DEFAULT 'active',publication_status text NOT NULL DEFAULT 'published',unit_cost numeric,created_at timestamptz DEFAULT now()
);
CREATE TABLE public.private_fit_profiles(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),tenant_id uuid NOT NULL REFERENCES public.tenants(id),client_id uuid NOT NULL REFERENCES public.clients(id),
 user_id uuid REFERENCES public.users(id),profile_key text NOT NULL,display_name text NOT NULL,preferred_fit text NOT NULL DEFAULT 'regular',
 active_version integer NOT NULL DEFAULT 0,status text NOT NULL DEFAULT 'active',consent_at timestamptz,updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.private_fit_profile_versions(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),tenant_id uuid NOT NULL REFERENCES public.tenants(id),profile_id uuid NOT NULL REFERENCES public.private_fit_profiles(id),
 version integer NOT NULL,source text,height_cm numeric,chest_cm numeric,waist_cm numeric,hips_cm numeric,inseam_cm numeric,shoulder_cm numeric,sleeve_cm numeric,
 measured_by uuid,notes text,snapshot_hash text,created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.fit_recommendation_runs(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),tenant_id uuid NOT NULL REFERENCES public.tenants(id),profile_version_id uuid NOT NULL,
 product_id uuid NOT NULL,size_chart_version_id uuid,fit_rule_id uuid,status text NOT NULL DEFAULT 'recommended',recommended_size text,
 confidence numeric,explanation jsonb NOT NULL DEFAULT '{}'::jsonb,availability_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,created_at timestamptz DEFAULT now()
);
CREATE TABLE public.client_interests(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),tenant_id uuid NOT NULL REFERENCES public.tenants(id),client_id uuid NOT NULL REFERENCES public.clients(id),
 product_id uuid NOT NULL REFERENCES public.products(id),kind text NOT NULL CHECK(kind IN ('view','wishlist','sample','appointment','selection','recommendation')),
 score numeric NOT NULL DEFAULT 1,qty integer,source text,occurred_at timestamptz NOT NULL DEFAULT now(),meta jsonb NOT NULL DEFAULT '{}'::jsonb
);
CREATE TABLE public.reorder_proposals(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),tenant_id uuid NOT NULL REFERENCES public.tenants(id),client_id uuid NOT NULL REFERENCES public.clients(id),
 status text NOT NULL DEFAULT 'draft',currency text NOT NULL DEFAULT 'EUR',horizon_weeks numeric NOT NULL DEFAULT 8,proposal_value numeric NOT NULL DEFAULT 0,
 rationale jsonb NOT NULL DEFAULT '{}'::jsonb,created_by uuid,created_at timestamptz NOT NULL DEFAULT now(),updated_at timestamptz NOT NULL DEFAULT now(),
 client_store_id uuid REFERENCES public.client_stores(id),source_batch_id uuid,proposal_kind text NOT NULL DEFAULT 'system_recommendation',expires_at timestamptz,
 approved_by_buyer_at timestamptz,approved_by_brand_at timestamptz,converted_deal_id uuid,metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);
CREATE TABLE public.reorder_lines(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),tenant_id uuid NOT NULL REFERENCES public.tenants(id),proposal_id uuid NOT NULL REFERENCES public.reorder_proposals(id),
 product_id uuid NOT NULL REFERENCES public.products(id),current_stock integer NOT NULL DEFAULT 0,weekly_velocity numeric NOT NULL DEFAULT 0,wos numeric,target_wos numeric NOT NULL DEFAULT 8,
 recommended_qty integer NOT NULL DEFAULT 0,unit_price numeric NOT NULL DEFAULT 0,line_value numeric NOT NULL DEFAULT 0,product_variant_id uuid,source_sellthrough_row_id uuid,
 units_sold integer NOT NULL DEFAULT 0,period_weeks numeric NOT NULL DEFAULT 1,stockout_risk text,rationale jsonb NOT NULL DEFAULT '{}'::jsonb
);
CREATE TABLE public.reorder_events(
 id bigserial PRIMARY KEY,tenant_id uuid NOT NULL,proposal_id uuid NOT NULL,event_type text NOT NULL,actor_user_id uuid,actor_kind text,reason text,payload jsonb NOT NULL DEFAULT '{}'::jsonb
);
CREATE TABLE public.deals(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),tenant_id uuid NOT NULL REFERENCES public.tenants(id),code text NOT NULL,client_id uuid NOT NULL REFERENCES public.clients(id),
 owner_user_id uuid,season text,stage text NOT NULL DEFAULT 'draft',currency text NOT NULL DEFAULT 'EUR',subtotal numeric NOT NULL DEFAULT 0,total_amount numeric NOT NULL DEFAULT 0,
 gross_contribution numeric,client_store_id uuid REFERENCES public.client_stores(id),title text,buyer_reference text,notes text,source_reorder_proposal_id uuid,
 current_revision integer NOT NULL DEFAULT 0,created_at timestamptz DEFAULT now(),updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.reorder_proposals ADD CONSTRAINT reorder_proposals_converted_deal_fk FOREIGN KEY(converted_deal_id) REFERENCES public.deals(id);
CREATE TABLE public.deal_lines(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),tenant_id uuid NOT NULL REFERENCES public.tenants(id),deal_id uuid NOT NULL REFERENCES public.deals(id),
 product_id uuid NOT NULL REFERENCES public.products(id),product_variant_id uuid,style_snapshot text NOT NULL,sku_snapshot text,qty integer NOT NULL,
 unit_price numeric NOT NULL,unit_cost_snapshot numeric,line_total numeric NOT NULL,created_at timestamptz DEFAULT now()
);
CREATE TABLE public.deal_events(
 id bigserial PRIMARY KEY,tenant_id uuid NOT NULL,deal_id uuid NOT NULL,event_type text NOT NULL,from_stage text,to_stage text,actor_user_id uuid,
 payload jsonb NOT NULL DEFAULT '{}'::jsonb,occurred_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.shipments(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),tenant_id uuid NOT NULL REFERENCES public.tenants(id),deal_id uuid NOT NULL REFERENCES public.deals(id),code text NOT NULL,
 status text NOT NULL DEFAULT 'planned',carrier text,tracking_number text,eta_from date,eta_to date,shipped_at timestamptz,delivered_at timestamptz,
 created_at timestamptz NOT NULL DEFAULT now(),updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.shipment_lines(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),tenant_id uuid NOT NULL REFERENCES public.tenants(id),shipment_id uuid NOT NULL REFERENCES public.shipments(id),
 deal_id uuid NOT NULL REFERENCES public.deals(id),deal_line_id uuid NOT NULL,reservation_id uuid NOT NULL,product_variant_id uuid NOT NULL,qty integer NOT NULL,
 source_location_code text NOT NULL,status text NOT NULL DEFAULT 'planned',shipped_at timestamptz,delivered_at timestamptz,metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.delivery_receipts(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),tenant_id uuid NOT NULL REFERENCES public.tenants(id),shipment_id uuid NOT NULL REFERENCES public.shipments(id),
 deal_id uuid NOT NULL REFERENCES public.deals(id),receipt_type text NOT NULL,external_reference text,evidence_hash text,evidence_url text,received_by text,
 delivered_at timestamptz NOT NULL,actor_user_id uuid,metadata jsonb NOT NULL DEFAULT '{}'::jsonb,created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.audit_log(
 id bigserial PRIMARY KEY,tenant_id uuid NOT NULL,actor_user_id uuid,action text NOT NULL,entity_type text NOT NULL,entity_id uuid,
 before_state jsonb,after_state jsonb,meta jsonb NOT NULL DEFAULT '{}'::jsonb,occurred_at timestamptz NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION private.require_portal_role(p_role text) RETURNS public.portal_memberships
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path='' AS $$
DECLARE m public.portal_memberships%ROWTYPE;
BEGIN
  SELECT * INTO m FROM public.portal_memberships WHERE auth_user_id=auth.uid() AND access_role=p_role AND status='active' LIMIT 1;
  IF NOT FOUND THEN RAISE EXCEPTION 'portal_role_required' USING ERRCODE='42501'; END IF;
  RETURN m;
END $$;
CREATE OR REPLACE FUNCTION private.mp_brand_admin_actor() RETURNS public.mp_brand_admin_memberships
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path='' AS $$
DECLARE m public.mp_brand_admin_memberships%ROWTYPE;
BEGIN
  IF auth.uid() IS NULL OR COALESCE((auth.jwt()->>'is_anonymous')::boolean,false) THEN RAISE EXCEPTION 'brand_admin_login_required' USING ERRCODE='42501'; END IF;
  SELECT x.* INTO m FROM public.mp_brand_admin_memberships x
  JOIN public.tenants t ON t.id=x.tenant_id AND t.slug='marco-pescarolo' AND t.status='active'
  JOIN public.users u ON u.id=x.public_user_id AND u.tenant_id=x.tenant_id AND u.is_active=true AND u.role IN ('owner','admin')
  WHERE x.auth_user_id=auth.uid() AND x.status='active' LIMIT 1;
  IF NOT FOUND THEN RAISE EXCEPTION 'brand_admin_membership_required' USING ERRCODE='42501'; END IF;
  RETURN m;
END $$;
CREATE OR REPLACE FUNCTION public.add_fit_profile_version(
 p_profile_id uuid,p_source text,p_height_cm numeric,p_chest_cm numeric,p_waist_cm numeric,p_hips_cm numeric,p_inseam_cm numeric,
 p_shoulder_cm numeric DEFAULT NULL,p_sleeve_cm numeric DEFAULT NULL,p_measured_by uuid DEFAULT NULL,p_notes text DEFAULT NULL
) RETURNS uuid LANGUAGE plpgsql SET search_path='pg_catalog','public' AS $$
DECLARE p public.private_fit_profiles%ROWTYPE; v integer; rid uuid; h text;
BEGIN
 SELECT * INTO p FROM public.private_fit_profiles WHERE id=p_profile_id FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'fit profile not found'; END IF;
 IF p_source NOT IN ('self','advisor','import') THEN RAISE EXCEPTION 'unsupported measurement source'; END IF;
 v:=p.active_version+1; h:=md5(coalesce(p_height_cm::text,'')||'|'||coalesce(p_chest_cm::text,'')||'|'||coalesce(p_waist_cm::text,''));
 INSERT INTO public.private_fit_profile_versions(tenant_id,profile_id,version,source,height_cm,chest_cm,waist_cm,hips_cm,inseam_cm,shoulder_cm,sleeve_cm,measured_by,notes,snapshot_hash)
 VALUES(p.tenant_id,p.id,v,p_source,p_height_cm,p_chest_cm,p_waist_cm,p_hips_cm,p_inseam_cm,p_shoulder_cm,p_sleeve_cm,p_measured_by,p_notes,h) RETURNING id INTO rid;
 UPDATE public.private_fit_profiles SET active_version=v,updated_at=now() WHERE id=p.id; RETURN rid;
END $$;
CREATE OR REPLACE FUNCTION public.compute_fit_recommendation(p_profile_version_id uuid,p_product_id uuid,p_allow_synthetic boolean DEFAULT false)
RETURNS uuid LANGUAGE plpgsql SET search_path='pg_catalog','public' AS $$
DECLARE rid uuid; t uuid;
BEGIN
 SELECT p.tenant_id INTO t FROM public.private_fit_profile_versions v JOIN public.private_fit_profiles p ON p.id=v.profile_id WHERE v.id=p_profile_version_id;
 IF t IS NULL THEN RAISE EXCEPTION 'profile version not found'; END IF;
 IF NOT EXISTS(SELECT 1 FROM public.products WHERE id=p_product_id) THEN RAISE EXCEPTION 'product not found'; END IF;
 INSERT INTO public.fit_recommendation_runs(tenant_id,profile_version_id,product_id,status,explanation)
 VALUES(t,p_profile_version_id,p_product_id,'chart_unavailable',jsonb_build_object('reason','CI contract baseline')) RETURNING id INTO rid;
 RETURN rid;
END $$;
CREATE OR REPLACE FUNCTION public.brand_approve_reorder(p_proposal_id uuid,p_actor_user_id uuid,p_reason text DEFAULT NULL)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path='pg_catalog','public' AS $$
DECLARE a public.users%ROWTYPE; p public.reorder_proposals%ROWTYPE;
BEGIN
 SELECT * INTO a FROM public.users WHERE id=p_actor_user_id AND is_active=true;
 IF NOT FOUND OR a.role NOT IN ('sales','merchandising','commercial_director','owner','admin') THEN RAISE EXCEPTION 'commercial or merchandising authority required'; END IF;
 SELECT * INTO p FROM public.reorder_proposals WHERE id=p_proposal_id FOR UPDATE;
 IF NOT FOUND OR a.tenant_id<>p.tenant_id THEN RAISE EXCEPTION 'actor tenant mismatch'; END IF;
 IF p.status<>'buyer_approved' THEN RAISE EXCEPTION 'brand approval requires buyer_approved, current %',p.status; END IF;
 UPDATE public.reorder_proposals SET status='brand_approved',approved_by_brand_at=now(),updated_at=now() WHERE id=p.id;
 INSERT INTO public.reorder_events(tenant_id,proposal_id,event_type,actor_user_id,actor_kind,reason,payload)
 VALUES(p.tenant_id,p.id,'brand_approved',p_actor_user_id,'brand',p_reason,jsonb_build_object('ready_for_order_conversion',true));
 RETURN 'brand_approved';
END $$;
CREATE OR REPLACE FUNCTION public.convert_reorder_to_deal(p_proposal_id uuid,p_actor_user_id uuid,p_code text,p_title text)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path='pg_catalog','public' AS $$
DECLARE a public.users%ROWTYPE; p public.reorder_proposals%ROWTYPE; d uuid; n integer;
BEGIN
 SELECT * INTO a FROM public.users WHERE id=p_actor_user_id AND is_active=true;
 IF NOT FOUND OR a.role NOT IN ('sales','commercial_director','owner','admin') THEN RAISE EXCEPTION 'sales/commercial authority required'; END IF;
 SELECT * INTO p FROM public.reorder_proposals WHERE id=p_proposal_id FOR UPDATE;
 IF NOT FOUND OR a.tenant_id<>p.tenant_id THEN RAISE EXCEPTION 'proposal not available'; END IF;
 IF p.converted_deal_id IS NOT NULL THEN RETURN p.converted_deal_id; END IF;
 IF p.status<>'brand_approved' THEN RAISE EXCEPTION 'conversion requires brand_approved, current %',p.status; END IF;
 INSERT INTO public.deals(tenant_id,code,client_id,owner_user_id,stage,currency,client_store_id,title,buyer_reference,notes,source_reorder_proposal_id)
 VALUES(p.tenant_id,p_code,p.client_id,a.id,'draft',p.currency,p.client_store_id,p_title,p_code,'CI conversion',p.id) RETURNING id INTO d;
 INSERT INTO public.deal_lines(tenant_id,deal_id,product_id,style_snapshot,sku_snapshot,qty,unit_price,unit_cost_snapshot,line_total)
 SELECT p.tenant_id,d,rl.product_id,pr.style_code,pr.style_code,rl.recommended_qty,rl.unit_price,pr.unit_cost,round(rl.recommended_qty*rl.unit_price,2)
 FROM public.reorder_lines rl JOIN public.products pr ON pr.id=rl.product_id WHERE rl.proposal_id=p.id AND rl.recommended_qty>0;
 GET DIAGNOSTICS n=ROW_COUNT; IF n=0 THEN RAISE EXCEPTION 'proposal has no positive recommended quantities'; END IF;
 UPDATE public.reorder_proposals SET status='converted',converted_deal_id=d,updated_at=now() WHERE id=p.id;
 INSERT INTO public.reorder_events(tenant_id,proposal_id,event_type,actor_user_id,actor_kind,reason,payload)
 VALUES(p.tenant_id,p.id,'converted',a.id,'brand','CI converted',jsonb_build_object('deal_id',d,'line_count',n));
 RETURN d;
END $$;
CREATE OR REPLACE FUNCTION private.portal_buyer_approve_reorder_internal(p_proposal_id uuid) RETURNS text
LANGUAGE plpgsql SECURITY DEFINER SET search_path='pg_catalog','public','private' AS $$
DECLARE m public.portal_memberships%ROWTYPE; p public.reorder_proposals%ROWTYPE;
BEGIN
 m:=private.require_portal_role('buyer'); SELECT * INTO p FROM public.reorder_proposals WHERE id=p_proposal_id FOR UPDATE;
 IF NOT FOUND OR p.tenant_id<>m.tenant_id OR p.client_id<>m.client_id THEN RAISE EXCEPTION 'proposal is outside current buyer account'; END IF;
 UPDATE public.reorder_proposals SET status='buyer_approved',approved_by_buyer_at=now(),updated_at=now() WHERE id=p.id; RETURN 'buyer_approved';
END $$;

CREATE VIEW public.v_private_wardrobe_authority WITH (security_invoker=true) AS SELECT id,client_id,active_version FROM public.private_fit_profiles;
CREATE VIEW public.v_private_size_history_authority WITH (security_invoker=true) AS SELECT id,client_id,active_version FROM public.private_fit_profiles;
CREATE VIEW public.v_private_size_signal_authority WITH (security_invoker=true) AS SELECT id,client_id,active_version FROM public.private_fit_profiles;
CREATE VIEW public.v_sellthrough_intelligence WITH (security_invoker=true) AS SELECT id,client_id,status FROM public.reorder_proposals;
CREATE VIEW public.v_deal_cash_authority WITH (security_invoker=true) AS SELECT id,client_id,total_amount,gross_contribution FROM public.deals;

CREATE OR REPLACE FUNCTION public.mp_my_access() RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path='' AS $$
DECLARE m jsonb; a boolean; BEGIN
 IF auth.uid() IS NULL THEN RAISE EXCEPTION 'authentication_required'; END IF;
 SELECT COALESCE(jsonb_agg(jsonb_build_object('access_role',CASE access_role WHEN 'private_client' THEN 'private' WHEN 'buyer' THEN 'wholesale' ELSE access_role END,'client_id',client_id,'client_store_id',client_store_id)),'[]'::jsonb)
 INTO m FROM public.portal_memberships WHERE auth_user_id=auth.uid() AND status='active';
 SELECT EXISTS(SELECT 1 FROM public.mp_brand_admin_memberships WHERE auth_user_id=auth.uid() AND status='active') INTO a;
 RETURN jsonb_build_object('memberships',m,'admin',a); END $$;
REVOKE ALL ON FUNCTION public.mp_my_access() FROM PUBLIC,anon; GRANT EXECUTE ON FUNCTION public.mp_my_access() TO authenticated;
CREATE OR REPLACE FUNCTION public.mp_client_snapshot(p_access_role text,p_store_id uuid) RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path='' AS $$
DECLARE m public.portal_memberships%ROWTYPE; BEGIN
 IF p_access_role='private' THEN
   SELECT pm.* INTO m FROM public.portal_memberships pm JOIN public.clients c ON c.id=pm.client_id AND c.client_type='private'
   WHERE pm.auth_user_id=auth.uid() AND pm.access_role='private_client' AND pm.status='active' LIMIT 1;
   IF NOT FOUND OR p_store_id IS NOT NULL THEN RAISE EXCEPTION 'private_membership_required'; END IF;
 ELSIF p_access_role='wholesale' THEN
   SELECT pm.* INTO m FROM public.portal_memberships pm JOIN public.clients c ON c.id=pm.client_id AND c.client_type='wholesale'
   WHERE pm.auth_user_id=auth.uid() AND pm.access_role='buyer' AND pm.status='active' LIMIT 1;
   IF NOT FOUND THEN RAISE EXCEPTION 'buyer_membership_required'; END IF;
   IF p_store_id IS NOT NULL AND NOT EXISTS(SELECT 1 FROM public.client_stores s WHERE s.id=p_store_id AND s.tenant_id=m.tenant_id AND s.client_id=m.client_id AND (m.client_store_id IS NULL OR s.id=m.client_store_id) AND s.is_active) THEN RAISE EXCEPTION 'store_outside_membership'; END IF;
 ELSE RAISE EXCEPTION 'unsupported_access_role'; END IF;
 RETURN jsonb_build_object('client_id',m.client_id,'client_store_id',COALESCE(p_store_id,m.client_store_id)); END $$;
REVOKE ALL ON FUNCTION public.mp_client_snapshot(text,uuid) FROM PUBLIC,anon; GRANT EXECUTE ON FUNCTION public.mp_client_snapshot(text,uuid) TO authenticated;

INSERT INTO public.tenants VALUES('00000000-0000-4000-8000-000000000001','marco-pescarolo','active');
INSERT INTO public.products(id,tenant_id,style_code,status,publication_status,unit_cost,created_at)
VALUES('00000000-0000-4000-8000-000000000101','00000000-0000-4000-8000-000000000001','CI-MP-01','active','published',100,now());

REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon,authenticated;
GRANT SELECT ON public.portal_memberships,public.reorder_proposals,public.private_fit_profiles,public.private_fit_profile_versions TO authenticated;
GRANT SELECT,INSERT,UPDATE,DELETE ON public.v_private_wardrobe_authority,public.v_private_size_history_authority,public.v_private_size_signal_authority,public.v_sellthrough_intelligence TO authenticated;
GRANT SELECT ON public.v_sellthrough_intelligence,public.v_deal_cash_authority TO anon;
GRANT SELECT ON public.v_deal_cash_authority TO authenticated;
