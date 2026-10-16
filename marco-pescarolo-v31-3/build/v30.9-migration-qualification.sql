-- Marco Pescarolo v30.9 isolated migration qualification bundle
-- Applies migration candidates + postflight + five-role admission in one transaction, then always rolls back.
BEGIN;

-- ===== migration-candidates/00_preflight.sql =====
-- Marco Pescarolo v30.9 migration qualification preflight.
-- Read-only assertions. Fail before any candidate DDL if the live authority has drifted.

DO $$
DECLARE
  v_missing text;
BEGIN
  IF current_setting('server_version_num')::integer < 170000
     OR current_setting('server_version_num')::integer >= 180000 THEN
    RAISE EXCEPTION 'v30_9_requires_postgresql_17_current_%', current_setting('server_version');
  END IF;

  SELECT string_agg(x,', ' ORDER BY x) INTO v_missing
  FROM unnest(ARRAY[
    'tenants','users','clients','client_stores','portal_memberships','mp_brand_admin_memberships',
    'products','client_interests','private_fit_profiles','private_fit_profile_versions','fit_recommendation_runs',
    'deals','deal_lines','shipments','shipment_lines','delivery_receipts',
    'reorder_proposals','reorder_lines','reorder_events','audit_log'
  ]) x
  WHERE to_regclass('public.'||x) IS NULL;
  IF v_missing IS NOT NULL THEN
    RAISE EXCEPTION 'v30_9_missing_required_relations_%',v_missing;
  END IF;

  IF to_regprocedure('private.mp_brand_admin_actor()') IS NULL
     OR to_regprocedure('public.add_fit_profile_version(uuid,text,numeric,numeric,numeric,numeric,numeric,numeric,numeric,uuid,text)') IS NULL
     OR to_regprocedure('public.compute_fit_recommendation(uuid,uuid,boolean)') IS NULL
     OR to_regprocedure('public.brand_approve_reorder(uuid,uuid,text)') IS NULL
     OR to_regprocedure('public.convert_reorder_to_deal(uuid,uuid,text,text)') IS NULL
     OR to_regprocedure('private.portal_buyer_approve_reorder_internal(uuid)') IS NULL THEN
    RAISE EXCEPTION 'v30_9_required_dependency_function_missing';
  END IF;

  -- Dependency hashes captured from the authoritative project on 2026-10-16.
  IF md5(pg_get_functiondef(to_regprocedure('private.mp_brand_admin_actor()'))) <> '43258548d12f02374e711a19ad4d9e68' THEN
    RAISE EXCEPTION 'v30_9_dependency_drift_private_mp_brand_admin_actor';
  END IF;
  IF md5(pg_get_functiondef(to_regprocedure('private.portal_buyer_approve_reorder_internal(uuid)'))) <> '18b18e976f27e93643a37666255cfe73' THEN
    RAISE EXCEPTION 'v30_9_dependency_drift_portal_buyer_approve_reorder_internal';
  END IF;
  IF md5(pg_get_functiondef(to_regprocedure('public.add_fit_profile_version(uuid,text,numeric,numeric,numeric,numeric,numeric,numeric,numeric,uuid,text)'))) <> 'e4f14c5e3e8ddcf3333502cbcf126ba3' THEN
    RAISE EXCEPTION 'v30_9_dependency_drift_add_fit_profile_version';
  END IF;
  IF md5(pg_get_functiondef(to_regprocedure('public.compute_fit_recommendation(uuid,uuid,boolean)'))) <> '20aaab1487c7ae339622fff5a6579536' THEN
    RAISE EXCEPTION 'v30_9_dependency_drift_compute_fit_recommendation';
  END IF;
  IF md5(pg_get_functiondef(to_regprocedure('public.brand_approve_reorder(uuid,uuid,text)'))) <> '0dc49456056d4da2a49569b88dd4652e' THEN
    RAISE EXCEPTION 'v30_9_dependency_drift_brand_approve_reorder';
  END IF;
  IF md5(pg_get_functiondef(to_regprocedure('public.convert_reorder_to_deal(uuid,uuid,text,text)'))) <> 'c838f34a4948c7baff64f35280f93008' THEN
    RAISE EXCEPTION 'v30_9_dependency_drift_convert_reorder_to_deal';
  END IF;

  -- New public targets must still be absent. CREATE OR REPLACE is not allowed to hide an unexpected partial install.
  IF to_regprocedure('public.mp_private_add_fit_profile_version(uuid,text,numeric,numeric,numeric,numeric,numeric,numeric,numeric,text)') IS NOT NULL
     OR to_regprocedure('public.mp_private_compute_fit_recommendation(uuid,uuid)') IS NOT NULL
     OR to_regprocedure('public.mp_admin_approve_reorder(uuid,text)') IS NOT NULL
     OR to_regprocedure('public.mp_admin_convert_reorder(uuid,text,text)') IS NOT NULL
     OR to_regprocedure('public.mp_private_set_wishlist(uuid,boolean,text,jsonb)') IS NOT NULL
     OR to_regprocedure('public.mp_private_request_service(uuid,text,integer,text,jsonb)') IS NOT NULL
     OR to_regprocedure('public.mp_wholesale_approve_reorder(uuid)') IS NOT NULL
     OR to_regclass('public.delivery_claims') IS NOT NULL THEN
    RAISE EXCEPTION 'v30_9_target_collision_or_partial_install_detected';
  END IF;

  IF EXISTS(
    SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
    WHERE n.nspname='private' AND p.proname IN (
      'mp_private_add_fit_profile_version_internal','mp_private_compute_fit_recommendation_internal',
      'mp_admin_approve_reorder_internal','mp_admin_convert_reorder_internal',
      'mp_private_set_wishlist_internal','mp_private_wishlist_internal',
      'mp_private_request_service_internal','mp_private_service_history_internal',
      'mp_client_create_delivery_claim_internal','mp_client_set_delivery_claim_line_internal',
      'mp_client_submit_delivery_claim_internal','mp_admin_decide_delivery_claim_internal',
      'mp_client_decide_delivery_claim_internal','mp_admin_record_delivery_claim_execution_internal',
      'mp_admin_close_delivery_claim_internal','mp_client_delivery_claims_internal',
      'mp_admin_delivery_claims_internal','mp_wholesale_approve_reorder_internal'
    )
  ) THEN
    RAISE EXCEPTION 'v30_9_private_internal_collision_detected';
  END IF;

  IF NOT has_schema_privilege('authenticated','private','USAGE')
     OR has_schema_privilege('anon','private','USAGE') THEN
    RAISE EXCEPTION 'v30_9_private_schema_access_pattern_drift';
  END IF;

  IF (SELECT count(*) FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
      WHERE n.nspname='public'
        AND c.relname IN ('v_deal_cash_authority','v_sellthrough_intelligence','v_private_wardrobe_authority','v_private_size_history_authority','v_private_size_signal_authority')
        AND c.reloptions @> ARRAY['security_invoker=true']) <> 5 THEN
    RAISE EXCEPTION 'v30_9_security_invoker_view_drift';
  END IF;

  IF NOT EXISTS(
    SELECT 1 FROM pg_constraint
    WHERE conrelid='public.client_interests'::regclass
      AND pg_get_constraintdef(oid) LIKE '%wishlist%'
      AND pg_get_constraintdef(oid) LIKE '%sample%'
      AND pg_get_constraintdef(oid) LIKE '%appointment%'
      AND pg_get_constraintdef(oid) LIKE '%selection%'
      AND pg_get_constraintdef(oid) LIKE '%recommendation%'
  ) THEN
    RAISE EXCEPTION 'v30_9_client_interests_kind_contract_drift';
  END IF;
END
$$;

SELECT jsonb_build_object(
  'gate','v30.9-preflight',
  'postgres',current_setting('server_version'),
  'dependencies','MATCHED',
  'target_collisions',0,
  'security_invoker_views',5,
  'production_mutated',false
) AS v30_9_preflight;


-- ===== migration-candidates/01_authority_bridge.sql =====
-- Marco Pescarolo v30.9 migration candidate

-- Preserve the existing non-exposed private-schema execution pattern.
GRANT USAGE ON SCHEMA private TO authenticated;
REVOKE USAGE ON SCHEMA private FROM anon;
-- Source: sql/06_authority_bridge_wrappers_STAGED.sql
-- Qualified candidate only; not applied to production.
-- Public browser RPCs use SECURITY INVOKER. Privileged logic lives in private SECURITY DEFINER internals.

-- Marco Pescarolo v30.3 Authority Bridge
-- STAGED ONLY. NOT EXECUTED AGAINST PRODUCTION.
-- Purpose: close specific browser-authority gaps without exposing raw internal RPCs.
-- Validation target: isolated PostgreSQL 17 clone first, then signed-JWT negative tests.

CREATE OR REPLACE FUNCTION private.mp_private_add_fit_profile_version_internal(
  p_profile_id uuid,
  p_source text,
  p_height_cm numeric,
  p_chest_cm numeric,
  p_waist_cm numeric,
  p_hips_cm numeric,
  p_inseam_cm numeric,
  p_shoulder_cm numeric DEFAULT NULL,
  p_sleeve_cm numeric DEFAULT NULL,
  p_notes text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  m public.portal_memberships%ROWTYPE;
  p public.private_fit_profiles%ROWTYPE;
BEGIN
  IF auth.uid() IS NULL OR COALESCE((auth.jwt()->>'is_anonymous')::boolean,false) THEN
    RAISE EXCEPTION 'private_membership_required' USING ERRCODE='42501';
  END IF;

  SELECT pm.* INTO m
  FROM public.portal_memberships pm
  JOIN public.clients c ON c.id=pm.client_id
    AND c.client_type='private'
    AND c.tenant_id=pm.tenant_id
  JOIN public.tenants t ON t.id=pm.tenant_id
    AND t.slug='marco-pescarolo'
    AND t.status='active'
  WHERE pm.auth_user_id=auth.uid()
    AND pm.access_role='private_client'
    AND pm.status='active'
  LIMIT 1;
  IF NOT FOUND THEN RAISE EXCEPTION 'private_membership_required' USING ERRCODE='42501'; END IF;

  SELECT * INTO p
  FROM public.private_fit_profiles
  WHERE id=p_profile_id AND tenant_id=m.tenant_id AND client_id=m.client_id
  FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'fit_profile_not_found' USING ERRCODE='42501'; END IF;

  RETURN public.add_fit_profile_version(
    p.id,p_source,p_height_cm,p_chest_cm,p_waist_cm,p_hips_cm,p_inseam_cm,
    p_shoulder_cm,p_sleeve_cm,m.public_user_id,p_notes
  );
END
$$;

REVOKE ALL ON FUNCTION private.mp_private_add_fit_profile_version_internal(uuid,text,numeric,numeric,numeric,numeric,numeric,numeric,numeric,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.mp_private_add_fit_profile_version_internal(uuid,text,numeric,numeric,numeric,numeric,numeric,numeric,numeric,text) TO authenticated;

CREATE OR REPLACE FUNCTION public.mp_private_add_fit_profile_version(
  p_profile_id uuid,
  p_source text,
  p_height_cm numeric,
  p_chest_cm numeric,
  p_waist_cm numeric,
  p_hips_cm numeric,
  p_inseam_cm numeric,
  p_shoulder_cm numeric DEFAULT NULL,
  p_sleeve_cm numeric DEFAULT NULL,
  p_notes text DEFAULT NULL
)
RETURNS uuid
LANGUAGE sql
SECURITY INVOKER
SET search_path TO 'pg_catalog','public','private'
AS $$
  SELECT private.mp_private_add_fit_profile_version_internal(p_profile_id,p_source,p_height_cm,p_chest_cm,p_waist_cm,p_hips_cm,p_inseam_cm,p_shoulder_cm,p_sleeve_cm,p_notes);
$$;

REVOKE ALL ON FUNCTION public.mp_private_add_fit_profile_version(uuid,text,numeric,numeric,numeric,numeric,numeric,numeric,numeric,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.mp_private_add_fit_profile_version(uuid,text,numeric,numeric,numeric,numeric,numeric,numeric,numeric,text) TO authenticated;

CREATE OR REPLACE FUNCTION private.mp_private_compute_fit_recommendation_internal(
  p_profile_version_id uuid,
  p_product_id uuid
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  m public.portal_memberships%ROWTYPE;
BEGIN
  IF auth.uid() IS NULL OR COALESCE((auth.jwt()->>'is_anonymous')::boolean,false) THEN
    RAISE EXCEPTION 'private_membership_required' USING ERRCODE='42501';
  END IF;

  SELECT pm.* INTO m
  FROM public.portal_memberships pm
  JOIN public.clients c ON c.id=pm.client_id
    AND c.client_type='private'
    AND c.tenant_id=pm.tenant_id
  JOIN public.tenants t ON t.id=pm.tenant_id
    AND t.slug='marco-pescarolo'
    AND t.status='active'
  WHERE pm.auth_user_id=auth.uid()
    AND pm.access_role='private_client'
    AND pm.status='active'
  LIMIT 1;
  IF NOT FOUND THEN RAISE EXCEPTION 'private_membership_required' USING ERRCODE='42501'; END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.private_fit_profile_versions v
    JOIN public.private_fit_profiles p ON p.id=v.profile_id
    WHERE v.id=p_profile_version_id
      AND p.tenant_id=m.tenant_id
      AND p.client_id=m.client_id
  ) THEN
    RAISE EXCEPTION 'fit_profile_version_not_found' USING ERRCODE='42501';
  END IF;

  RETURN public.compute_fit_recommendation(p_profile_version_id,p_product_id,false);
END
$$;

REVOKE ALL ON FUNCTION private.mp_private_compute_fit_recommendation_internal(uuid,uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.mp_private_compute_fit_recommendation_internal(uuid,uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.mp_private_compute_fit_recommendation(
  p_profile_version_id uuid,
  p_product_id uuid
)
RETURNS uuid
LANGUAGE sql
SECURITY INVOKER
SET search_path TO 'pg_catalog','public','private'
AS $$
  SELECT private.mp_private_compute_fit_recommendation_internal(p_profile_version_id,p_product_id);
$$;

REVOKE ALL ON FUNCTION public.mp_private_compute_fit_recommendation(uuid,uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.mp_private_compute_fit_recommendation(uuid,uuid) TO authenticated;

CREATE OR REPLACE FUNCTION private.mp_admin_approve_reorder_internal(
  p_proposal_id uuid,
  p_reason text
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  a public.mp_brand_admin_memberships%ROWTYPE;
BEGIN
  a:=private.mp_brand_admin_actor();
  IF COALESCE(auth.jwt()->>'aal','')<>'aal2' THEN
    RAISE EXCEPTION 'admin_mfa_required' USING ERRCODE='42501';
  END IF;
  IF p_reason IS NULL OR length(btrim(p_reason))<5 THEN
    RAISE EXCEPTION 'reorder_approval_reason_required' USING ERRCODE='22023';
  END IF;
  RETURN public.brand_approve_reorder(p_proposal_id,a.public_user_id,p_reason);
END
$$;

REVOKE ALL ON FUNCTION private.mp_admin_approve_reorder_internal(uuid,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.mp_admin_approve_reorder_internal(uuid,text) TO authenticated;

CREATE OR REPLACE FUNCTION public.mp_admin_approve_reorder(
  p_proposal_id uuid,
  p_reason text
)
RETURNS text
LANGUAGE sql
SECURITY INVOKER
SET search_path TO 'pg_catalog','public','private'
AS $$
  SELECT private.mp_admin_approve_reorder_internal(p_proposal_id,p_reason);
$$;

REVOKE ALL ON FUNCTION public.mp_admin_approve_reorder(uuid,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.mp_admin_approve_reorder(uuid,text) TO authenticated;

CREATE OR REPLACE FUNCTION private.mp_admin_convert_reorder_internal(
  p_proposal_id uuid,
  p_code text,
  p_title text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  a public.mp_brand_admin_memberships%ROWTYPE;
BEGIN
  a:=private.mp_brand_admin_actor();
  IF COALESCE(auth.jwt()->>'aal','')<>'aal2' THEN
    RAISE EXCEPTION 'admin_mfa_required' USING ERRCODE='42501';
  END IF;
  IF p_code IS NULL OR length(btrim(p_code))<3 OR p_title IS NULL OR length(btrim(p_title))<3 THEN
    RAISE EXCEPTION 'reorder_conversion_metadata_required' USING ERRCODE='22023';
  END IF;
  RETURN public.convert_reorder_to_deal(p_proposal_id,a.public_user_id,p_code,p_title);
END
$$;

REVOKE ALL ON FUNCTION private.mp_admin_convert_reorder_internal(uuid,text,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.mp_admin_convert_reorder_internal(uuid,text,text) TO authenticated;

CREATE OR REPLACE FUNCTION public.mp_admin_convert_reorder(
  p_proposal_id uuid,
  p_code text,
  p_title text
)
RETURNS uuid
LANGUAGE sql
SECURITY INVOKER
SET search_path TO 'pg_catalog','public','private'
AS $$
  SELECT private.mp_admin_convert_reorder_internal(p_proposal_id,p_code,p_title);
$$;

REVOKE ALL ON FUNCTION public.mp_admin_convert_reorder(uuid,text,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.mp_admin_convert_reorder(uuid,text,text) TO authenticated;

-- This file is deliberately rollback-only until isolated-clone/JWT admission is GREEN.


-- ===== migration-candidates/02_least_privilege.sql =====
-- Marco Pescarolo v30.9 migration candidate
-- Source: sql/08_least_privilege_surface_STAGED.sql
-- Qualified candidate only; not applied to production.
-- Public browser RPCs use SECURITY INVOKER. Privileged logic lives in private SECURITY DEFINER internals.

-- v30.5 least-privilege surface hardening candidate.
-- Staged only: apply after 06_authority_bridge_wrappers_STAGED.sql in an isolated PG17 environment.
-- This file intentionally ends in ROLLBACK.

-- 1) Old Fit primitives are implementation details once role-scoped wrappers exist.
REVOKE EXECUTE ON FUNCTION public.add_fit_profile_version(
  uuid,text,numeric,numeric,numeric,numeric,numeric,numeric,numeric,uuid,text
) FROM PUBLIC, anon, authenticated;

REVOKE EXECUTE ON FUNCTION public.compute_fit_recommendation(
  uuid,uuid,boolean
) FROM PUBLIC, anon, authenticated;

-- Role-scoped wrappers from v30.3 remain the only browser write/compute surface.
GRANT EXECUTE ON FUNCTION public.mp_private_add_fit_profile_version(
  uuid,text,numeric,numeric,numeric,numeric,numeric,numeric,numeric,text
) TO authenticated;
GRANT EXECUTE ON FUNCTION public.mp_private_compute_fit_recommendation(uuid,uuid) TO authenticated;

-- 2) Browser-facing read-only views receive SELECT only.
REVOKE ALL PRIVILEGES ON TABLE public.v_private_wardrobe_authority FROM PUBLIC, anon, authenticated;
REVOKE ALL PRIVILEGES ON TABLE public.v_private_size_history_authority FROM PUBLIC, anon, authenticated;
REVOKE ALL PRIVILEGES ON TABLE public.v_private_size_signal_authority FROM PUBLIC, anon, authenticated;
REVOKE ALL PRIVILEGES ON TABLE public.v_sellthrough_intelligence FROM PUBLIC, anon, authenticated;

GRANT SELECT ON TABLE public.v_private_wardrobe_authority TO authenticated;
GRANT SELECT ON TABLE public.v_private_size_history_authority TO authenticated;
GRANT SELECT ON TABLE public.v_private_size_signal_authority TO authenticated;
GRANT SELECT ON TABLE public.v_sellthrough_intelligence TO authenticated;

-- 3) Cash authority is not a browser contract. Admin reads it through guarded mp_admin_* RPCs.
REVOKE ALL PRIVILEGES ON TABLE public.v_deal_cash_authority FROM PUBLIC, anon, authenticated;

-- 4) Assertions: fail the isolated admission if the privilege model drifts.
DO $$
BEGIN
  IF has_function_privilege('anon',
      'public.add_fit_profile_version(uuid,text,numeric,numeric,numeric,numeric,numeric,numeric,numeric,uuid,text)',
      'EXECUTE') THEN
    RAISE EXCEPTION 'anon_fit_write_execute_still_granted';
  END IF;
  IF has_function_privilege('authenticated',
      'public.add_fit_profile_version(uuid,text,numeric,numeric,numeric,numeric,numeric,numeric,numeric,uuid,text)',
      'EXECUTE') THEN
    RAISE EXCEPTION 'authenticated_direct_fit_write_execute_still_granted';
  END IF;
  IF has_function_privilege('anon',
      'public.compute_fit_recommendation(uuid,uuid,boolean)', 'EXECUTE') THEN
    RAISE EXCEPTION 'anon_fit_compute_execute_still_granted';
  END IF;
  IF has_table_privilege('anon','public.v_sellthrough_intelligence','SELECT') THEN
    RAISE EXCEPTION 'anon_sellthrough_view_select_still_granted';
  END IF;
  IF has_table_privilege('anon','public.v_deal_cash_authority','SELECT') THEN
    RAISE EXCEPTION 'anon_cash_view_select_still_granted';
  END IF;
  IF NOT has_table_privilege('authenticated','public.v_sellthrough_intelligence','SELECT') THEN
    RAISE EXCEPTION 'authenticated_sellthrough_select_missing';
  END IF;
  IF has_table_privilege('authenticated','public.v_sellthrough_intelligence','UPDATE')
     OR has_table_privilege('authenticated','public.v_private_wardrobe_authority','INSERT')
     OR has_table_privilege('authenticated','public.v_private_size_history_authority','DELETE') THEN
    RAISE EXCEPTION 'browser_view_dml_privilege_present';
  END IF;
END
$$;


-- ===== migration-candidates/03_private_engagement.sql =====
-- Marco Pescarolo v30.9 migration candidate
-- Source: sql/10_private_engagement_wrappers_STAGED.sql
-- Qualified candidate only; not applied to production.
-- Public browser RPCs use SECURITY INVOKER. Privileged logic lives in private SECURITY DEFINER internals.

-- v30.5 Private Engagement wrappers.
-- Reuses the existing append-only public.client_interests event model.
-- No new table is introduced. Ends in ROLLBACK for isolated admission only.

CREATE OR REPLACE FUNCTION private.mp_private_set_wishlist_internal(
  p_product_id uuid,
  p_selected boolean,
  p_source text DEFAULT 'portal',
  p_meta jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  m public.portal_memberships%ROWTYPE;
  v_id uuid;
BEGIN
  IF auth.uid() IS NULL OR COALESCE((auth.jwt()->>'is_anonymous')::boolean,false) THEN
    RAISE EXCEPTION 'private_membership_required' USING ERRCODE='42501';
  END IF;

  SELECT pm.* INTO m
  FROM public.portal_memberships pm
  JOIN public.clients c ON c.id=pm.client_id
    AND c.client_type='private' AND c.tenant_id=pm.tenant_id
  JOIN public.tenants t ON t.id=pm.tenant_id
    AND t.slug='marco-pescarolo' AND t.status='active'
  WHERE pm.auth_user_id=auth.uid()
    AND pm.access_role='private_client'
    AND pm.status='active'
  LIMIT 1;
  IF NOT FOUND THEN RAISE EXCEPTION 'private_membership_required' USING ERRCODE='42501'; END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.products p
    WHERE p.id=p_product_id AND p.tenant_id=m.tenant_id
      AND p.status='active' AND p.publication_status='published'
  ) THEN RAISE EXCEPTION 'product_not_available' USING ERRCODE='22023'; END IF;

  INSERT INTO public.client_interests(
    tenant_id,client_id,product_id,kind,score,source,meta
  ) VALUES (
    m.tenant_id,m.client_id,p_product_id,'wishlist',CASE WHEN p_selected THEN 1 ELSE 0 END,
    nullif(btrim(coalesce(p_source,'')),''),
    coalesce(p_meta,'{}'::jsonb) || jsonb_build_object('selected',p_selected,'auth_user_id',auth.uid())
  ) RETURNING id INTO v_id;

  RETURN v_id;
END
$$;

REVOKE ALL ON FUNCTION private.mp_private_set_wishlist_internal(uuid,boolean,text,jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.mp_private_set_wishlist_internal(uuid,boolean,text,jsonb) TO authenticated;

CREATE OR REPLACE FUNCTION public.mp_private_set_wishlist(
  p_product_id uuid,
  p_selected boolean,
  p_source text DEFAULT 'portal',
  p_meta jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE sql
SECURITY INVOKER
SET search_path TO 'pg_catalog','public','private'
AS $$
  SELECT private.mp_private_set_wishlist_internal(p_product_id,p_selected,p_source,p_meta);
$$;

REVOKE ALL ON FUNCTION public.mp_private_set_wishlist(uuid,boolean,text,jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.mp_private_set_wishlist(uuid,boolean,text,jsonb) TO authenticated;

CREATE OR REPLACE FUNCTION private.mp_private_wishlist_internal()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  m public.portal_memberships%ROWTYPE;
BEGIN
  IF auth.uid() IS NULL OR COALESCE((auth.jwt()->>'is_anonymous')::boolean,false) THEN
    RAISE EXCEPTION 'private_membership_required' USING ERRCODE='42501';
  END IF;

  SELECT pm.* INTO m
  FROM public.portal_memberships pm
  JOIN public.clients c ON c.id=pm.client_id
    AND c.client_type='private' AND c.tenant_id=pm.tenant_id
  JOIN public.tenants t ON t.id=pm.tenant_id
    AND t.slug='marco-pescarolo' AND t.status='active'
  WHERE pm.auth_user_id=auth.uid()
    AND pm.access_role='private_client' AND pm.status='active'
  LIMIT 1;
  IF NOT FOUND THEN RAISE EXCEPTION 'private_membership_required' USING ERRCODE='42501'; END IF;

  RETURN COALESCE((
    WITH latest AS (
      SELECT DISTINCT ON (i.product_id)
        i.product_id,i.score,i.occurred_at,i.meta
      FROM public.client_interests i
      WHERE i.tenant_id=m.tenant_id AND i.client_id=m.client_id AND i.kind='wishlist'
      ORDER BY i.product_id,i.occurred_at DESC,i.id DESC
    )
    SELECT jsonb_agg(jsonb_build_object(
      'product_id',l.product_id,'selected',l.score>0,'occurred_at',l.occurred_at,'meta',l.meta
    ) ORDER BY l.occurred_at DESC)
    FROM latest l WHERE l.score>0
  ),'[]'::jsonb);
END
$$;

REVOKE ALL ON FUNCTION private.mp_private_wishlist_internal() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.mp_private_wishlist_internal() TO authenticated;

CREATE OR REPLACE FUNCTION public.mp_private_wishlist()
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path TO 'pg_catalog','public','private'
AS $$
  SELECT private.mp_private_wishlist_internal();
$$;

REVOKE ALL ON FUNCTION public.mp_private_wishlist() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.mp_private_wishlist() TO authenticated;

CREATE OR REPLACE FUNCTION private.mp_private_request_service_internal(
  p_product_id uuid,
  p_kind text,
  p_qty integer DEFAULT NULL,
  p_source text DEFAULT 'portal',
  p_meta jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  m public.portal_memberships%ROWTYPE;
  v_id uuid;
BEGIN
  IF auth.uid() IS NULL OR COALESCE((auth.jwt()->>'is_anonymous')::boolean,false) THEN
    RAISE EXCEPTION 'private_membership_required' USING ERRCODE='42501';
  END IF;
  IF p_kind NOT IN ('sample','appointment','selection','recommendation') THEN
    RAISE EXCEPTION 'unsupported_private_service_kind' USING ERRCODE='22023';
  END IF;
  IF p_qty IS NOT NULL AND (p_qty<1 OR p_qty>20) THEN
    RAISE EXCEPTION 'private_service_qty_out_of_range' USING ERRCODE='22023';
  END IF;

  SELECT pm.* INTO m
  FROM public.portal_memberships pm
  JOIN public.clients c ON c.id=pm.client_id
    AND c.client_type='private' AND c.tenant_id=pm.tenant_id
  JOIN public.tenants t ON t.id=pm.tenant_id
    AND t.slug='marco-pescarolo' AND t.status='active'
  WHERE pm.auth_user_id=auth.uid()
    AND pm.access_role='private_client' AND pm.status='active'
  LIMIT 1;
  IF NOT FOUND THEN RAISE EXCEPTION 'private_membership_required' USING ERRCODE='42501'; END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.products p
    WHERE p.id=p_product_id AND p.tenant_id=m.tenant_id
      AND p.status='active' AND p.publication_status='published'
  ) THEN RAISE EXCEPTION 'product_not_available' USING ERRCODE='22023'; END IF;

  INSERT INTO public.client_interests(
    tenant_id,client_id,product_id,kind,qty,score,source,meta
  ) VALUES (
    m.tenant_id,m.client_id,p_product_id,p_kind,p_qty,1,
    nullif(btrim(coalesce(p_source,'')),''),
    coalesce(p_meta,'{}'::jsonb) || jsonb_build_object('status','requested','auth_user_id',auth.uid())
  ) RETURNING id INTO v_id;

  RETURN v_id;
END
$$;

REVOKE ALL ON FUNCTION private.mp_private_request_service_internal(uuid,text,integer,text,jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.mp_private_request_service_internal(uuid,text,integer,text,jsonb) TO authenticated;

CREATE OR REPLACE FUNCTION public.mp_private_request_service(
  p_product_id uuid,
  p_kind text,
  p_qty integer DEFAULT NULL,
  p_source text DEFAULT 'portal',
  p_meta jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE sql
SECURITY INVOKER
SET search_path TO 'pg_catalog','public','private'
AS $$
  SELECT private.mp_private_request_service_internal(p_product_id,p_kind,p_qty,p_source,p_meta);
$$;

REVOKE ALL ON FUNCTION public.mp_private_request_service(uuid,text,integer,text,jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.mp_private_request_service(uuid,text,integer,text,jsonb) TO authenticated;

CREATE OR REPLACE FUNCTION private.mp_private_service_history_internal()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  m public.portal_memberships%ROWTYPE;
BEGIN
  IF auth.uid() IS NULL OR COALESCE((auth.jwt()->>'is_anonymous')::boolean,false) THEN
    RAISE EXCEPTION 'private_membership_required' USING ERRCODE='42501';
  END IF;
  SELECT pm.* INTO m
  FROM public.portal_memberships pm
  JOIN public.clients c ON c.id=pm.client_id
    AND c.client_type='private' AND c.tenant_id=pm.tenant_id
  JOIN public.tenants t ON t.id=pm.tenant_id
    AND t.slug='marco-pescarolo' AND t.status='active'
  WHERE pm.auth_user_id=auth.uid()
    AND pm.access_role='private_client' AND pm.status='active'
  LIMIT 1;
  IF NOT FOUND THEN RAISE EXCEPTION 'private_membership_required' USING ERRCODE='42501'; END IF;

  RETURN COALESCE((
    SELECT jsonb_agg(jsonb_build_object(
      'id',i.id,'product_id',i.product_id,'kind',i.kind,'qty',i.qty,
      'source',i.source,'meta',i.meta,'occurred_at',i.occurred_at
    ) ORDER BY i.occurred_at DESC)
    FROM public.client_interests i
    WHERE i.tenant_id=m.tenant_id AND i.client_id=m.client_id
      AND i.kind IN ('sample','appointment','selection','recommendation')
  ),'[]'::jsonb);
END
$$;

REVOKE ALL ON FUNCTION private.mp_private_service_history_internal() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.mp_private_service_history_internal() TO authenticated;

CREATE OR REPLACE FUNCTION public.mp_private_service_history()
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path TO 'pg_catalog','public','private'
AS $$
  SELECT private.mp_private_service_history_internal();
$$;

REVOKE ALL ON FUNCTION public.mp_private_service_history() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.mp_private_service_history() TO authenticated;

DO $$
BEGIN
  IF has_function_privilege('anon','public.mp_private_set_wishlist(uuid,boolean,text,jsonb)','EXECUTE')
     OR has_function_privilege('anon','public.mp_private_request_service(uuid,text,integer,text,jsonb)','EXECUTE') THEN
    RAISE EXCEPTION 'private_engagement_anon_execute_granted';
  END IF;
  IF NOT has_function_privilege('authenticated','public.mp_private_wishlist()','EXECUTE')
     OR NOT has_function_privilege('authenticated','public.mp_private_service_history()','EXECUTE') THEN
    RAISE EXCEPTION 'private_engagement_authenticated_execute_missing';
  END IF;
END
$$;


-- ===== migration-candidates/04_delivery_claims.sql =====
-- Marco Pescarolo v30.9 migration candidate
-- Source: sql/11_delivery_claims_v1_STAGED.sql
-- Qualified candidate only; not applied to production.
-- Public browser RPCs use SECURITY INVOKER. Privileged logic lives in private SECURITY DEFINER internals.

-- Marco Pescarolo v30.6 Delivery Claims v1
-- STAGED ONLY. NOT EXECUTED AGAINST PRODUCTION.
-- Requires existing portal membership, shipment, delivery receipt and Brand Admin authority.

CREATE TABLE public.delivery_claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id),
  deal_id uuid NOT NULL REFERENCES public.deals(id),
  shipment_id uuid NOT NULL REFERENCES public.shipments(id),
  client_id uuid NOT NULL REFERENCES public.clients(id),
  client_store_id uuid NULL REFERENCES public.client_stores(id),
  access_role text NOT NULL CHECK (access_role IN ('private','wholesale')),
  reason text NOT NULL CHECK (reason IN ('shortage','damage','mispick')),
  requested_resolution text NOT NULL CHECK (requested_resolution IN ('replacement','credit_note')),
  brand_decision text NULL CHECK (brand_decision IS NULL OR brand_decision IN ('approve','partial','reject')),
  decision_resolution text NULL CHECK (decision_resolution IS NULL OR decision_resolution IN ('replacement','credit_note')),
  status text NOT NULL DEFAULT 'draft' CHECK (status IN (
    'draft','submitted','brand_review','client_decision','execution_pending','resolved','closed'
  )),
  note text NULL,
  current_version integer NOT NULL DEFAULT 0 CHECK (current_version>=0),
  client_request_id uuid NOT NULL,
  created_by_auth_user_id uuid NOT NULL,
  created_by_user_id uuid NULL REFERENCES public.users(id),
  submitted_at timestamptz NULL,
  brand_decided_at timestamptz NULL,
  client_decided_at timestamptz NULL,
  resolved_at timestamptz NULL,
  closed_at timestamptz NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(tenant_id,client_id,client_request_id)
);

CREATE INDEX delivery_claims_client_status_idx
  ON public.delivery_claims(tenant_id,client_id,status,created_at DESC);
CREATE INDEX delivery_claims_shipment_idx
  ON public.delivery_claims(tenant_id,shipment_id,created_at DESC);

CREATE TABLE public.delivery_claim_lines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_id uuid NOT NULL REFERENCES public.delivery_claims(id) ON DELETE CASCADE,
  shipment_line_id uuid NOT NULL REFERENCES public.shipment_lines(id),
  claimed_qty integer NOT NULL CHECK (claimed_qty>0),
  approved_qty integer NOT NULL DEFAULT 0 CHECK (approved_qty>=0 AND approved_qty<=claimed_qty),
  evidence jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(claim_id,shipment_line_id),
  UNIQUE(id,claim_id)
);

CREATE TABLE public.delivery_claim_executions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_id uuid NOT NULL REFERENCES public.delivery_claims(id) ON DELETE CASCADE,
  claim_line_id uuid NOT NULL,
  execution_type text NOT NULL CHECK (execution_type IN ('replacement','credit_note')),
  qty integer NOT NULL CHECK (qty>0),
  external_reference text NOT NULL,
  evidence_url text NULL,
  executed_by_user_id uuid NOT NULL REFERENCES public.users(id),
  executed_at timestamptz NOT NULL DEFAULT now(),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  FOREIGN KEY (claim_line_id,claim_id)
    REFERENCES public.delivery_claim_lines(id,claim_id) ON DELETE CASCADE
);
CREATE INDEX delivery_claim_executions_line_idx
  ON public.delivery_claim_executions(claim_line_id,executed_at);

CREATE TABLE public.delivery_claim_events (
  id bigserial PRIMARY KEY,
  claim_id uuid NOT NULL REFERENCES public.delivery_claims(id) ON DELETE CASCADE,
  version integer NOT NULL CHECK (version>=0),
  event_type text NOT NULL,
  actor_auth_user_id uuid NULL,
  actor_user_id uuid NULL REFERENCES public.users(id),
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  occurred_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX delivery_claim_events_claim_idx
  ON public.delivery_claim_events(claim_id,id);

ALTER TABLE public.delivery_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_claim_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_claim_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_claim_events ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.delivery_claims FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.delivery_claim_lines FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.delivery_claim_executions FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.delivery_claim_events FROM PUBLIC, anon, authenticated;
REVOKE ALL ON SEQUENCE public.delivery_claim_events_id_seq FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION private.mp_claim_portal_actor(p_access_role text)
RETURNS public.portal_memberships
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE m public.portal_memberships%ROWTYPE;
BEGIN
  IF auth.uid() IS NULL OR COALESCE((auth.jwt()->>'is_anonymous')::boolean,false) THEN
    RAISE EXCEPTION 'portal_membership_required' USING ERRCODE='42501';
  END IF;
  IF p_access_role NOT IN ('private','wholesale') THEN
    RAISE EXCEPTION 'unsupported_access_role' USING ERRCODE='22023';
  END IF;

  SELECT pm.* INTO m
  FROM public.portal_memberships pm
  JOIN public.clients c ON c.id=pm.client_id AND c.tenant_id=pm.tenant_id
  JOIN public.tenants t ON t.id=pm.tenant_id
    AND t.slug='marco-pescarolo' AND t.status='active'
  WHERE pm.auth_user_id=auth.uid() AND pm.status='active'
    AND (
      (p_access_role='private' AND pm.access_role='private_client' AND c.client_type='private')
      OR
      (p_access_role='wholesale' AND pm.access_role='buyer' AND c.client_type='wholesale')
    )
  LIMIT 1;
  IF NOT FOUND THEN RAISE EXCEPTION 'portal_membership_required' USING ERRCODE='42501'; END IF;
  RETURN m;
END
$$;
REVOKE ALL ON FUNCTION private.mp_claim_portal_actor(text) FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION private.mp_claim_event(
  p_claim_id uuid,p_version integer,p_event_type text,p_actor_user_id uuid,p_payload jsonb
) RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path TO ''
AS $$
  INSERT INTO public.delivery_claim_events(
    claim_id,version,event_type,actor_auth_user_id,actor_user_id,payload
  ) VALUES (
    p_claim_id,p_version,p_event_type,auth.uid(),p_actor_user_id,coalesce(p_payload,'{}'::jsonb)
  );
$$;
REVOKE ALL ON FUNCTION private.mp_claim_event(uuid,integer,text,uuid,jsonb) FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION private.mp_client_create_delivery_claim_internal(
  p_access_role text,
  p_deal_id uuid,
  p_shipment_id uuid,
  p_reason text,
  p_requested_resolution text,
  p_note text,
  p_client_request_id uuid
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  m public.portal_memberships%ROWTYPE;
  d public.deals%ROWTYPE;
  s public.shipments%ROWTYPE;
  c public.delivery_claims%ROWTYPE;
BEGIN
  m:=private.mp_claim_portal_actor(p_access_role);
  IF p_client_request_id IS NULL THEN RAISE EXCEPTION 'client_request_id_required' USING ERRCODE='22023'; END IF;
  IF p_reason NOT IN ('shortage','damage','mispick') THEN RAISE EXCEPTION 'unsupported_claim_reason' USING ERRCODE='22023'; END IF;
  IF p_requested_resolution NOT IN ('replacement','credit_note') THEN RAISE EXCEPTION 'unsupported_claim_resolution' USING ERRCODE='22023'; END IF;

  SELECT * INTO d FROM public.deals
  WHERE id=p_deal_id AND tenant_id=m.tenant_id AND client_id=m.client_id
    AND (m.client_store_id IS NULL OR client_store_id=m.client_store_id);
  IF NOT FOUND THEN RAISE EXCEPTION 'claim_deal_not_in_scope' USING ERRCODE='42501'; END IF;

  SELECT * INTO s FROM public.shipments
  WHERE id=p_shipment_id AND tenant_id=m.tenant_id AND deal_id=d.id
    AND status='delivered';
  IF NOT FOUND OR NOT EXISTS(
    SELECT 1 FROM public.delivery_receipts r
    WHERE r.tenant_id=m.tenant_id AND r.shipment_id=p_shipment_id AND r.deal_id=d.id
  ) THEN RAISE EXCEPTION 'delivered_shipment_evidence_required' USING ERRCODE='22023'; END IF;

  SELECT * INTO c FROM public.delivery_claims
  WHERE tenant_id=m.tenant_id AND client_id=m.client_id AND client_request_id=p_client_request_id;
  IF FOUND THEN
    IF c.deal_id<>d.id OR c.shipment_id<>s.id OR c.reason<>p_reason OR c.requested_resolution<>p_requested_resolution THEN
      RAISE EXCEPTION 'claim_idempotency_conflict' USING ERRCODE='40001';
    END IF;
    RETURN c.id;
  END IF;

  INSERT INTO public.delivery_claims(
    tenant_id,deal_id,shipment_id,client_id,client_store_id,access_role,reason,
    requested_resolution,note,client_request_id,created_by_auth_user_id,created_by_user_id
  ) VALUES (
    m.tenant_id,d.id,s.id,m.client_id,d.client_store_id,p_access_role,p_reason,
    p_requested_resolution,nullif(btrim(coalesce(p_note,'')),''),p_client_request_id,auth.uid(),m.public_user_id
  ) RETURNING * INTO c;

  PERFORM private.mp_claim_event(c.id,c.current_version,'claim_created',m.public_user_id,
    jsonb_build_object('reason',c.reason,'requested_resolution',c.requested_resolution));
  RETURN c.id;
END
$$;

REVOKE ALL ON FUNCTION private.mp_client_create_delivery_claim_internal(text,uuid,uuid,text,text,text,uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.mp_client_create_delivery_claim_internal(text,uuid,uuid,text,text,text,uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.mp_client_create_delivery_claim(
  p_access_role text,
  p_deal_id uuid,
  p_shipment_id uuid,
  p_reason text,
  p_requested_resolution text,
  p_note text,
  p_client_request_id uuid
)
RETURNS uuid
LANGUAGE sql
SECURITY INVOKER
SET search_path TO 'pg_catalog','public','private'
AS $$
  SELECT private.mp_client_create_delivery_claim_internal(p_access_role,p_deal_id,p_shipment_id,p_reason,p_requested_resolution,p_note,p_client_request_id);
$$;

CREATE OR REPLACE FUNCTION private.mp_client_set_delivery_claim_line_internal(
  p_claim_id uuid,
  p_expected_version integer,
  p_shipment_line_id uuid,
  p_claimed_qty integer,
  p_evidence jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  c public.delivery_claims%ROWTYPE;
  m public.portal_memberships%ROWTYPE;
  sl public.shipment_lines%ROWTYPE;
  v_id uuid;
BEGIN
  SELECT * INTO c FROM public.delivery_claims WHERE id=p_claim_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'claim_not_found' USING ERRCODE='42501'; END IF;
  m:=private.mp_claim_portal_actor(c.access_role);
  IF c.tenant_id<>m.tenant_id OR c.client_id<>m.client_id
     OR (m.client_store_id IS NOT NULL AND c.client_store_id IS DISTINCT FROM m.client_store_id) THEN
    RAISE EXCEPTION 'claim_not_in_scope' USING ERRCODE='42501';
  END IF;
  IF c.status<>'draft' OR c.current_version<>p_expected_version THEN
    RAISE EXCEPTION 'claim_version_or_state_conflict' USING ERRCODE='40001';
  END IF;
  SELECT * INTO sl FROM public.shipment_lines
  WHERE id=p_shipment_line_id AND tenant_id=c.tenant_id
    AND shipment_id=c.shipment_id AND deal_id=c.deal_id AND status='delivered';
  IF NOT FOUND THEN RAISE EXCEPTION 'delivered_shipment_line_required' USING ERRCODE='22023'; END IF;
  IF p_claimed_qty IS NULL OR p_claimed_qty<1 OR p_claimed_qty>sl.qty THEN
    RAISE EXCEPTION 'claimed_qty_exceeds_delivered_qty' USING ERRCODE='22023'; END IF;

  INSERT INTO public.delivery_claim_lines(claim_id,shipment_line_id,claimed_qty,evidence)
  VALUES(c.id,sl.id,p_claimed_qty,coalesce(p_evidence,'{}'::jsonb))
  ON CONFLICT(claim_id,shipment_line_id) DO UPDATE SET
    claimed_qty=excluded.claimed_qty,approved_qty=0,evidence=excluded.evidence,updated_at=now()
  RETURNING id INTO v_id;

  UPDATE public.delivery_claims SET current_version=current_version+1,updated_at=now() WHERE id=c.id;
  PERFORM private.mp_claim_event(c.id,c.current_version+1,'claim_line_saved',m.public_user_id,
    jsonb_build_object('claim_line_id',v_id,'shipment_line_id',sl.id,'claimed_qty',p_claimed_qty));
  RETURN v_id;
END
$$;

REVOKE ALL ON FUNCTION private.mp_client_set_delivery_claim_line_internal(uuid,integer,uuid,integer,jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.mp_client_set_delivery_claim_line_internal(uuid,integer,uuid,integer,jsonb) TO authenticated;

CREATE OR REPLACE FUNCTION public.mp_client_set_delivery_claim_line(
  p_claim_id uuid,
  p_expected_version integer,
  p_shipment_line_id uuid,
  p_claimed_qty integer,
  p_evidence jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE sql
SECURITY INVOKER
SET search_path TO 'pg_catalog','public','private'
AS $$
  SELECT private.mp_client_set_delivery_claim_line_internal(p_claim_id,p_expected_version,p_shipment_line_id,p_claimed_qty,p_evidence);
$$;

CREATE OR REPLACE FUNCTION private.mp_client_submit_delivery_claim_internal(
  p_claim_id uuid,p_expected_version integer
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE c public.delivery_claims%ROWTYPE; m public.portal_memberships%ROWTYPE; v integer;
BEGIN
  SELECT * INTO c FROM public.delivery_claims WHERE id=p_claim_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'claim_not_found' USING ERRCODE='42501'; END IF;
  m:=private.mp_claim_portal_actor(c.access_role);
  IF c.tenant_id<>m.tenant_id OR c.client_id<>m.client_id
    OR (m.client_store_id IS NOT NULL AND c.client_store_id IS DISTINCT FROM m.client_store_id) THEN
    RAISE EXCEPTION 'claim_not_in_scope' USING ERRCODE='42501'; END IF;
  IF c.status<>'draft' OR c.current_version<>p_expected_version THEN
    RAISE EXCEPTION 'claim_version_or_state_conflict' USING ERRCODE='40001'; END IF;
  IF NOT EXISTS(SELECT 1 FROM public.delivery_claim_lines l WHERE l.claim_id=c.id AND l.claimed_qty>0) THEN
    RAISE EXCEPTION 'claim_lines_required' USING ERRCODE='22023'; END IF;
  v:=c.current_version+1;
  UPDATE public.delivery_claims SET status='submitted',submitted_at=now(),current_version=v,updated_at=now() WHERE id=c.id;
  PERFORM private.mp_claim_event(c.id,v,'claim_submitted',m.public_user_id,'{}'::jsonb);
  RETURN v;
END
$$;

REVOKE ALL ON FUNCTION private.mp_client_submit_delivery_claim_internal(uuid,integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.mp_client_submit_delivery_claim_internal(uuid,integer) TO authenticated;

CREATE OR REPLACE FUNCTION public.mp_client_submit_delivery_claim(
  p_claim_id uuid,p_expected_version integer
)
RETURNS integer
LANGUAGE sql
SECURITY INVOKER
SET search_path TO 'pg_catalog','public','private'
AS $$
  SELECT private.mp_client_submit_delivery_claim_internal(p_claim_id,p_expected_version);
$$;

CREATE OR REPLACE FUNCTION private.mp_admin_decide_delivery_claim_internal(
  p_claim_id uuid,p_expected_version integer,p_decision text,p_resolution text,
  p_reason text,p_line_decisions jsonb DEFAULT '[]'::jsonb
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  a public.mp_brand_admin_memberships%ROWTYPE;
  c public.delivery_claims%ROWTYPE;
  x record; l public.delivery_claim_lines%ROWTYPE; v integer;
BEGIN
  a:=private.mp_brand_admin_actor();
  IF COALESCE(auth.jwt()->>'aal','')<>'aal2' THEN RAISE EXCEPTION 'admin_mfa_required' USING ERRCODE='42501'; END IF;
  IF p_decision NOT IN ('approve','partial','reject') THEN RAISE EXCEPTION 'unsupported_claim_decision' USING ERRCODE='22023'; END IF;
  IF p_decision IN ('approve','partial') AND p_resolution NOT IN ('replacement','credit_note') THEN
    RAISE EXCEPTION 'claim_resolution_required' USING ERRCODE='22023'; END IF;
  IF p_reason IS NULL OR length(btrim(p_reason))<5 THEN RAISE EXCEPTION 'claim_decision_reason_required' USING ERRCODE='22023'; END IF;

  SELECT * INTO c FROM public.delivery_claims WHERE id=p_claim_id AND tenant_id=a.tenant_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'claim_not_found' USING ERRCODE='42501'; END IF;
  IF c.status NOT IN ('submitted','brand_review') OR c.current_version<>p_expected_version THEN
    RAISE EXCEPTION 'claim_version_or_state_conflict' USING ERRCODE='40001'; END IF;

  IF p_decision='approve' THEN
    UPDATE public.delivery_claim_lines SET approved_qty=claimed_qty,updated_at=now() WHERE claim_id=c.id;
  ELSIF p_decision='reject' THEN
    UPDATE public.delivery_claim_lines SET approved_qty=0,updated_at=now() WHERE claim_id=c.id;
  ELSE
    IF jsonb_typeof(coalesce(p_line_decisions,'[]'::jsonb))<>'array' THEN
      RAISE EXCEPTION 'claim_line_decisions_array_required' USING ERRCODE='22023'; END IF;
    UPDATE public.delivery_claim_lines SET approved_qty=0,updated_at=now() WHERE claim_id=c.id;
    FOR x IN SELECT * FROM jsonb_to_recordset(coalesce(p_line_decisions,'[]'::jsonb)) AS q(claim_line_id uuid,approved_qty integer)
    LOOP
      SELECT * INTO l FROM public.delivery_claim_lines WHERE id=x.claim_line_id AND claim_id=c.id FOR UPDATE;
      IF NOT FOUND OR x.approved_qty IS NULL OR x.approved_qty<0 OR x.approved_qty>l.claimed_qty THEN
        RAISE EXCEPTION 'claim_partial_qty_invalid' USING ERRCODE='22023'; END IF;
      UPDATE public.delivery_claim_lines SET approved_qty=x.approved_qty,updated_at=now() WHERE id=l.id;
    END LOOP;
    IF NOT EXISTS(SELECT 1 FROM public.delivery_claim_lines WHERE claim_id=c.id AND approved_qty>0)
       OR NOT EXISTS(SELECT 1 FROM public.delivery_claim_lines WHERE claim_id=c.id AND approved_qty<claimed_qty) THEN
      RAISE EXCEPTION 'partial_claim_requires_mixed_quantities' USING ERRCODE='22023'; END IF;
  END IF;

  v:=c.current_version+1;
  UPDATE public.delivery_claims SET
    brand_decision=p_decision,
    decision_resolution=CASE WHEN p_decision='reject' THEN NULL ELSE p_resolution END,
    status='client_decision',brand_decided_at=now(),current_version=v,updated_at=now()
  WHERE id=c.id;
  PERFORM private.mp_claim_event(c.id,v,'brand_decision',a.public_user_id,
    jsonb_build_object('decision',p_decision,'resolution',p_resolution,'reason',p_reason));
  INSERT INTO public.audit_log(tenant_id,actor_user_id,action,entity_type,entity_id,meta)
  VALUES(a.tenant_id,a.public_user_id,'delivery_claim_decided','delivery_claim',c.id,
    jsonb_build_object('decision',p_decision,'resolution',p_resolution,'reason',p_reason,'auth_uid',auth.uid(),'mfa','aal2'));
  RETURN v;
END
$$;

REVOKE ALL ON FUNCTION private.mp_admin_decide_delivery_claim_internal(uuid,integer,text,text,text,jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.mp_admin_decide_delivery_claim_internal(uuid,integer,text,text,text,jsonb) TO authenticated;

CREATE OR REPLACE FUNCTION public.mp_admin_decide_delivery_claim(
  p_claim_id uuid,p_expected_version integer,p_decision text,p_resolution text,
  p_reason text,p_line_decisions jsonb DEFAULT '[]'::jsonb
)
RETURNS integer
LANGUAGE sql
SECURITY INVOKER
SET search_path TO 'pg_catalog','public','private'
AS $$
  SELECT private.mp_admin_decide_delivery_claim_internal(p_claim_id,p_expected_version,p_decision,p_resolution,p_reason,p_line_decisions);
$$;

CREATE OR REPLACE FUNCTION private.mp_client_decide_delivery_claim_internal(
  p_claim_id uuid,p_expected_version integer,p_decision text
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE c public.delivery_claims%ROWTYPE; m public.portal_memberships%ROWTYPE; v integer; v_approved bigint;
BEGIN
  IF p_decision NOT IN ('accept','re_review') THEN RAISE EXCEPTION 'unsupported_client_claim_decision' USING ERRCODE='22023'; END IF;
  SELECT * INTO c FROM public.delivery_claims WHERE id=p_claim_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'claim_not_found' USING ERRCODE='42501'; END IF;
  m:=private.mp_claim_portal_actor(c.access_role);
  IF c.tenant_id<>m.tenant_id OR c.client_id<>m.client_id
    OR (m.client_store_id IS NOT NULL AND c.client_store_id IS DISTINCT FROM m.client_store_id) THEN
    RAISE EXCEPTION 'claim_not_in_scope' USING ERRCODE='42501'; END IF;
  IF c.status<>'client_decision' OR c.current_version<>p_expected_version THEN
    RAISE EXCEPTION 'claim_version_or_state_conflict' USING ERRCODE='40001'; END IF;
  SELECT coalesce(sum(approved_qty),0) INTO v_approved FROM public.delivery_claim_lines WHERE claim_id=c.id;
  v:=c.current_version+1;
  IF p_decision='re_review' THEN
    UPDATE public.delivery_claims SET status='brand_review',client_decided_at=now(),current_version=v,updated_at=now() WHERE id=c.id;
  ELSIF v_approved=0 THEN
    UPDATE public.delivery_claims SET status='resolved',client_decided_at=now(),resolved_at=now(),current_version=v,updated_at=now() WHERE id=c.id;
  ELSE
    UPDATE public.delivery_claims SET status='execution_pending',client_decided_at=now(),current_version=v,updated_at=now() WHERE id=c.id;
  END IF;
  PERFORM private.mp_claim_event(c.id,v,'client_decision',m.public_user_id,jsonb_build_object('decision',p_decision,'approved_qty',v_approved));
  RETURN v;
END
$$;

REVOKE ALL ON FUNCTION private.mp_client_decide_delivery_claim_internal(uuid,integer,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.mp_client_decide_delivery_claim_internal(uuid,integer,text) TO authenticated;

CREATE OR REPLACE FUNCTION public.mp_client_decide_delivery_claim(
  p_claim_id uuid,p_expected_version integer,p_decision text
)
RETURNS integer
LANGUAGE sql
SECURITY INVOKER
SET search_path TO 'pg_catalog','public','private'
AS $$
  SELECT private.mp_client_decide_delivery_claim_internal(p_claim_id,p_expected_version,p_decision);
$$;

CREATE OR REPLACE FUNCTION private.mp_admin_record_delivery_claim_execution_internal(
  p_claim_id uuid,p_expected_version integer,p_claim_line_id uuid,
  p_execution_type text,p_qty integer,p_external_reference text,p_evidence_url text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  a public.mp_brand_admin_memberships%ROWTYPE;
  c public.delivery_claims%ROWTYPE;
  l public.delivery_claim_lines%ROWTYPE;
  v_done bigint; v_id uuid; v integer; v_complete boolean;
BEGIN
  a:=private.mp_brand_admin_actor();
  IF COALESCE(auth.jwt()->>'aal','')<>'aal2' THEN RAISE EXCEPTION 'admin_mfa_required' USING ERRCODE='42501'; END IF;
  SELECT * INTO c FROM public.delivery_claims WHERE id=p_claim_id AND tenant_id=a.tenant_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'claim_not_found' USING ERRCODE='42501'; END IF;
  IF c.status<>'execution_pending' OR c.current_version<>p_expected_version THEN
    RAISE EXCEPTION 'claim_version_or_state_conflict' USING ERRCODE='40001'; END IF;
  IF p_execution_type NOT IN ('replacement','credit_note') OR p_execution_type IS DISTINCT FROM c.decision_resolution THEN
    RAISE EXCEPTION 'execution_type_does_not_match_resolution' USING ERRCODE='22023'; END IF;
  IF p_qty IS NULL OR p_qty<1 OR p_external_reference IS NULL OR length(btrim(p_external_reference))<3 THEN
    RAISE EXCEPTION 'claim_execution_evidence_required' USING ERRCODE='22023'; END IF;
  SELECT * INTO l FROM public.delivery_claim_lines WHERE id=p_claim_line_id AND claim_id=c.id FOR UPDATE;
  IF NOT FOUND OR l.approved_qty<1 THEN RAISE EXCEPTION 'approved_claim_line_required' USING ERRCODE='22023'; END IF;
  SELECT coalesce(sum(qty),0) INTO v_done FROM public.delivery_claim_executions WHERE claim_line_id=l.id;
  IF v_done+p_qty>l.approved_qty THEN RAISE EXCEPTION 'claim_execution_exceeds_approved_capacity' USING ERRCODE='22023'; END IF;

  INSERT INTO public.delivery_claim_executions(
    claim_id,claim_line_id,execution_type,qty,external_reference,evidence_url,executed_by_user_id
  ) VALUES(c.id,l.id,p_execution_type,p_qty,btrim(p_external_reference),p_evidence_url,a.public_user_id)
  RETURNING id INTO v_id;

  SELECT NOT EXISTS(
    SELECT 1 FROM public.delivery_claim_lines cl
    WHERE cl.claim_id=c.id AND (
      SELECT coalesce(sum(ex.qty),0) FROM public.delivery_claim_executions ex WHERE ex.claim_line_id=cl.id
    ) < cl.approved_qty
  ) INTO v_complete;

  v:=c.current_version+1;
  UPDATE public.delivery_claims SET
    status=CASE WHEN v_complete THEN 'resolved' ELSE 'execution_pending' END,
    resolved_at=CASE WHEN v_complete THEN now() ELSE resolved_at END,
    current_version=v,updated_at=now()
  WHERE id=c.id;
  PERFORM private.mp_claim_event(c.id,v,'execution_recorded',a.public_user_id,
    jsonb_build_object('execution_id',v_id,'claim_line_id',l.id,'qty',p_qty,'complete',v_complete,'reference',p_external_reference));
  INSERT INTO public.audit_log(tenant_id,actor_user_id,action,entity_type,entity_id,meta)
  VALUES(a.tenant_id,a.public_user_id,'delivery_claim_execution','delivery_claim',c.id,
    jsonb_build_object('execution_id',v_id,'qty',p_qty,'complete',v_complete,'auth_uid',auth.uid(),'mfa','aal2'));
  RETURN v_id;
END
$$;

REVOKE ALL ON FUNCTION private.mp_admin_record_delivery_claim_execution_internal(uuid,integer,uuid,text,integer,text,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.mp_admin_record_delivery_claim_execution_internal(uuid,integer,uuid,text,integer,text,text) TO authenticated;

CREATE OR REPLACE FUNCTION public.mp_admin_record_delivery_claim_execution(
  p_claim_id uuid,p_expected_version integer,p_claim_line_id uuid,
  p_execution_type text,p_qty integer,p_external_reference text,p_evidence_url text DEFAULT NULL
)
RETURNS uuid
LANGUAGE sql
SECURITY INVOKER
SET search_path TO 'pg_catalog','public','private'
AS $$
  SELECT private.mp_admin_record_delivery_claim_execution_internal(p_claim_id,p_expected_version,p_claim_line_id,p_execution_type,p_qty,p_external_reference,p_evidence_url);
$$;

CREATE OR REPLACE FUNCTION private.mp_admin_close_delivery_claim_internal(
  p_claim_id uuid,p_expected_version integer,p_reason text
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE a public.mp_brand_admin_memberships%ROWTYPE; c public.delivery_claims%ROWTYPE; v integer;
BEGIN
  a:=private.mp_brand_admin_actor();
  IF COALESCE(auth.jwt()->>'aal','')<>'aal2' THEN RAISE EXCEPTION 'admin_mfa_required' USING ERRCODE='42501'; END IF;
  IF p_reason IS NULL OR length(btrim(p_reason))<5 THEN RAISE EXCEPTION 'claim_close_reason_required' USING ERRCODE='22023'; END IF;
  SELECT * INTO c FROM public.delivery_claims WHERE id=p_claim_id AND tenant_id=a.tenant_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'claim_not_found' USING ERRCODE='42501'; END IF;
  IF c.status<>'resolved' OR c.current_version<>p_expected_version THEN
    RAISE EXCEPTION 'claim_must_be_resolved_before_close' USING ERRCODE='40001'; END IF;
  v:=c.current_version+1;
  UPDATE public.delivery_claims SET status='closed',closed_at=now(),current_version=v,updated_at=now() WHERE id=c.id;
  PERFORM private.mp_claim_event(c.id,v,'claim_closed',a.public_user_id,jsonb_build_object('reason',p_reason));
  INSERT INTO public.audit_log(tenant_id,actor_user_id,action,entity_type,entity_id,meta)
  VALUES(a.tenant_id,a.public_user_id,'delivery_claim_closed','delivery_claim',c.id,
    jsonb_build_object('reason',p_reason,'auth_uid',auth.uid(),'mfa','aal2'));
  RETURN v;
END
$$;

REVOKE ALL ON FUNCTION private.mp_admin_close_delivery_claim_internal(uuid,integer,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.mp_admin_close_delivery_claim_internal(uuid,integer,text) TO authenticated;

CREATE OR REPLACE FUNCTION public.mp_admin_close_delivery_claim(
  p_claim_id uuid,p_expected_version integer,p_reason text
)
RETURNS integer
LANGUAGE sql
SECURITY INVOKER
SET search_path TO 'pg_catalog','public','private'
AS $$
  SELECT private.mp_admin_close_delivery_claim_internal(p_claim_id,p_expected_version,p_reason);
$$;

CREATE OR REPLACE FUNCTION private.mp_client_delivery_claims_internal(
  p_access_role text,p_store_id uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE m public.portal_memberships%ROWTYPE;
BEGIN
  m:=private.mp_claim_portal_actor(p_access_role);
  IF m.client_store_id IS NOT NULL AND p_store_id IS NOT NULL AND p_store_id<>m.client_store_id THEN
    RAISE EXCEPTION 'store_scope_denied' USING ERRCODE='42501'; END IF;
  IF p_store_id IS NOT NULL AND NOT EXISTS(
    SELECT 1 FROM public.client_stores s WHERE s.id=p_store_id AND s.tenant_id=m.tenant_id AND s.client_id=m.client_id AND s.is_active
  ) THEN RAISE EXCEPTION 'store_scope_denied' USING ERRCODE='42501'; END IF;

  RETURN COALESCE((
    SELECT jsonb_agg(jsonb_build_object(
      'id',c.id,'deal_id',c.deal_id,'shipment_id',c.shipment_id,'client_store_id',c.client_store_id,
      'reason',c.reason,'requested_resolution',c.requested_resolution,'brand_decision',c.brand_decision,
      'decision_resolution',c.decision_resolution,'status',c.status,'current_version',c.current_version,
      'note',c.note,'created_at',c.created_at,'submitted_at',c.submitted_at,'brand_decided_at',c.brand_decided_at,
      'client_decided_at',c.client_decided_at,'resolved_at',c.resolved_at,'closed_at',c.closed_at,
      'lines',COALESCE((SELECT jsonb_agg(jsonb_build_object(
        'id',l.id,'shipment_line_id',l.shipment_line_id,'claimed_qty',l.claimed_qty,'approved_qty',l.approved_qty,
        'evidence',l.evidence,'executed_qty',COALESCE((SELECT sum(e.qty) FROM public.delivery_claim_executions e WHERE e.claim_line_id=l.id),0)
      ) ORDER BY l.created_at) FROM public.delivery_claim_lines l WHERE l.claim_id=c.id),'[]'::jsonb)
    ) ORDER BY c.created_at DESC)
    FROM public.delivery_claims c
    WHERE c.tenant_id=m.tenant_id AND c.client_id=m.client_id
      AND (m.client_store_id IS NULL OR c.client_store_id=m.client_store_id)
      AND (p_store_id IS NULL OR c.client_store_id=p_store_id)
  ),'[]'::jsonb);
END
$$;

REVOKE ALL ON FUNCTION private.mp_client_delivery_claims_internal(text,uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.mp_client_delivery_claims_internal(text,uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.mp_client_delivery_claims(
  p_access_role text,p_store_id uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path TO 'pg_catalog','public','private'
AS $$
  SELECT private.mp_client_delivery_claims_internal(p_access_role,p_store_id);
$$;

CREATE OR REPLACE FUNCTION private.mp_admin_delivery_claims_internal(p_status text DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE a public.mp_brand_admin_memberships%ROWTYPE;
BEGIN
  a:=private.mp_brand_admin_actor();
  RETURN COALESCE((
    SELECT jsonb_agg(jsonb_build_object(
      'id',c.id,'deal_id',c.deal_id,'shipment_id',c.shipment_id,'client_id',c.client_id,'client_store_id',c.client_store_id,
      'access_role',c.access_role,'reason',c.reason,'requested_resolution',c.requested_resolution,
      'brand_decision',c.brand_decision,'decision_resolution',c.decision_resolution,'status',c.status,
      'current_version',c.current_version,'created_at',c.created_at,'updated_at',c.updated_at,
      'claimed_qty',COALESCE((SELECT sum(l.claimed_qty) FROM public.delivery_claim_lines l WHERE l.claim_id=c.id),0),
      'approved_qty',COALESCE((SELECT sum(l.approved_qty) FROM public.delivery_claim_lines l WHERE l.claim_id=c.id),0),
      'executed_qty',COALESCE((SELECT sum(e.qty) FROM public.delivery_claim_executions e WHERE e.claim_id=c.id),0)
    ) ORDER BY c.updated_at DESC)
    FROM public.delivery_claims c
    WHERE c.tenant_id=a.tenant_id AND (p_status IS NULL OR c.status=p_status)
  ),'[]'::jsonb);
END
$$;

REVOKE ALL ON FUNCTION private.mp_admin_delivery_claims_internal(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.mp_admin_delivery_claims_internal(text) TO authenticated;

CREATE OR REPLACE FUNCTION public.mp_admin_delivery_claims(p_status text DEFAULT NULL)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path TO 'pg_catalog','public','private'
AS $$
  SELECT private.mp_admin_delivery_claims_internal(p_status);
$$;

-- Browser contract: RPC only. No table grants.
REVOKE ALL ON FUNCTION public.mp_client_create_delivery_claim(text,uuid,uuid,text,text,text,uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.mp_client_set_delivery_claim_line(uuid,integer,uuid,integer,jsonb) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.mp_client_submit_delivery_claim(uuid,integer) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.mp_client_decide_delivery_claim(uuid,integer,text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.mp_client_delivery_claims(text,uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.mp_admin_decide_delivery_claim(uuid,integer,text,text,text,jsonb) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.mp_admin_record_delivery_claim_execution(uuid,integer,uuid,text,integer,text,text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.mp_admin_close_delivery_claim(uuid,integer,text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.mp_admin_delivery_claims(text) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.mp_client_create_delivery_claim(text,uuid,uuid,text,text,text,uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.mp_client_set_delivery_claim_line(uuid,integer,uuid,integer,jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.mp_client_submit_delivery_claim(uuid,integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.mp_client_decide_delivery_claim(uuid,integer,text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.mp_client_delivery_claims(text,uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.mp_admin_decide_delivery_claim(uuid,integer,text,text,text,jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.mp_admin_record_delivery_claim_execution(uuid,integer,uuid,text,integer,text,text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.mp_admin_close_delivery_claim(uuid,integer,text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.mp_admin_delivery_claims(text) TO authenticated;

-- Structural assertions for isolated admission.
DO $$
BEGIN
  IF NOT EXISTS(SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND c.relname='delivery_claims' AND c.relrowsecurity) THEN
    RAISE EXCEPTION 'delivery_claims_rls_missing'; END IF;
  IF has_table_privilege('authenticated','public.delivery_claims','SELECT')
     OR has_table_privilege('authenticated','public.delivery_claim_lines','INSERT')
     OR has_table_privilege('anon','public.delivery_claims','SELECT') THEN
    RAISE EXCEPTION 'claims_direct_table_privilege_present'; END IF;
  IF has_function_privilege('anon','public.mp_client_create_delivery_claim(text,uuid,uuid,text,text,text,uuid)','EXECUTE') THEN
    RAISE EXCEPTION 'anon_claim_rpc_execute_present'; END IF;
  IF NOT has_function_privilege('authenticated','public.mp_client_create_delivery_claim(text,uuid,uuid,text,text,text,uuid)','EXECUTE') THEN
    RAISE EXCEPTION 'authenticated_claim_rpc_execute_missing'; END IF;
END
$$;


-- ===== migration-candidates/05_buyer_reorder_scope.sql =====
-- Marco Pescarolo v30.9 migration candidate
-- Source: sql/12_buyer_reorder_store_scope_STAGED.sql
-- Qualified candidate only; not applied to production.
-- Public browser RPCs use SECURITY INVOKER. Privileged logic lives in private SECURITY DEFINER internals.

-- Marco Pescarolo v30.8
-- Exact store-scope hardening for buyer reorder approval.
-- STAGED ONLY. Validate in isolated PG17 admission before production migration.

CREATE OR REPLACE FUNCTION private.mp_wholesale_approve_reorder_internal(
  p_proposal_id uuid
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  m public.portal_memberships%ROWTYPE;
  p public.reorder_proposals%ROWTYPE;
BEGIN
  IF auth.uid() IS NULL OR COALESCE((auth.jwt()->>'is_anonymous')::boolean,false) THEN
    RAISE EXCEPTION 'buyer_membership_required' USING ERRCODE='42501';
  END IF;

  SELECT pm.* INTO m
  FROM public.portal_memberships pm
  JOIN public.clients c ON c.id=pm.client_id
    AND c.client_type='wholesale'
    AND c.tenant_id=pm.tenant_id
  JOIN public.tenants t ON t.id=pm.tenant_id
    AND t.slug='marco-pescarolo'
    AND t.status='active'
  WHERE pm.auth_user_id=auth.uid()
    AND pm.access_role='buyer'
    AND pm.status='active'
  LIMIT 1;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'buyer_membership_required' USING ERRCODE='42501';
  END IF;

  SELECT * INTO p
  FROM public.reorder_proposals
  WHERE id=p_proposal_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'reorder_proposal_not_found' USING ERRCODE='42501';
  END IF;

  IF p.tenant_id<>m.tenant_id OR p.client_id<>m.client_id THEN
    RAISE EXCEPTION 'reorder_proposal_outside_buyer_account' USING ERRCODE='42501';
  END IF;

  -- HQ buyer: membership.client_store_id IS NULL, therefore all stores in the same client are allowed.
  -- Store-bound buyer: proposal must match the exact bound store.
  IF m.client_store_id IS NOT NULL
     AND p.client_store_id IS DISTINCT FROM m.client_store_id THEN
    RAISE EXCEPTION 'reorder_proposal_outside_buyer_store' USING ERRCODE='42501';
  END IF;

  IF p.status NOT IN ('proposed','reviewed') THEN
    RAISE EXCEPTION 'buyer_reorder_approval_not_allowed_from_status_%',p.status USING ERRCODE='22023';
  END IF;

  UPDATE public.reorder_proposals
  SET status='buyer_approved',approved_by_buyer_at=now(),updated_at=now()
  WHERE id=p.id;

  INSERT INTO public.reorder_events(
    tenant_id,proposal_id,event_type,actor_user_id,actor_kind,reason,payload
  ) VALUES (
    p.tenant_id,p.id,'buyer_approved',m.public_user_id,'buyer',
    'Buyer approved reorder recommendation',
    jsonb_build_object(
      'auth_user_id',m.auth_user_id,
      'client_store_id',m.client_store_id,
      'exact_store_scope_enforced',true,
      'recommendation_only_before_brand_approval',true
    )
  );

  RETURN 'buyer_approved';
END
$$;

REVOKE ALL ON FUNCTION private.mp_wholesale_approve_reorder_internal(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.mp_wholesale_approve_reorder_internal(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.mp_wholesale_approve_reorder(
  p_proposal_id uuid
)
RETURNS text
LANGUAGE sql
SECURITY INVOKER
SET search_path TO 'pg_catalog','public','private'
AS $$
  SELECT private.mp_wholesale_approve_reorder_internal(p_proposal_id);
$$;

REVOKE ALL ON FUNCTION public.mp_wholesale_approve_reorder(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.mp_wholesale_approve_reorder(uuid) TO authenticated;

DO $$
BEGIN
  IF has_function_privilege('anon','public.mp_wholesale_approve_reorder(uuid)','EXECUTE') THEN
    RAISE EXCEPTION 'anon_buyer_reorder_wrapper_execute_granted';
  END IF;
  IF NOT has_function_privilege('authenticated','public.mp_wholesale_approve_reorder(uuid)','EXECUTE') THEN
    RAISE EXCEPTION 'authenticated_buyer_reorder_wrapper_execute_missing';
  END IF;
END
$$;


-- ===== migration-candidates/06_postflight.sql =====
-- Marco Pescarolo v30.9 migration qualification postflight.
-- Must execute in the same isolated transaction after candidate stages 01-05.

DO $$
DECLARE
  v_public_count integer;
  v_public_definers integer;
  v_private_count integer;
  v_claim_rls integer;
BEGIN
  SELECT count(*), count(*) FILTER (WHERE p.prosecdef)
  INTO v_public_count,v_public_definers
  FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
  WHERE n.nspname='public' AND p.proname IN (
    'mp_private_add_fit_profile_version','mp_private_compute_fit_recommendation',
    'mp_admin_approve_reorder','mp_admin_convert_reorder',
    'mp_private_set_wishlist','mp_private_wishlist','mp_private_request_service','mp_private_service_history',
    'mp_client_create_delivery_claim','mp_client_set_delivery_claim_line','mp_client_submit_delivery_claim',
    'mp_admin_decide_delivery_claim','mp_client_decide_delivery_claim','mp_admin_record_delivery_claim_execution',
    'mp_admin_close_delivery_claim','mp_client_delivery_claims','mp_admin_delivery_claims',
    'mp_wholesale_approve_reorder'
  );
  IF v_public_count<>18 THEN RAISE EXCEPTION 'v30_9_public_wrapper_count_%',v_public_count; END IF;
  IF v_public_definers<>0 THEN RAISE EXCEPTION 'v30_9_new_public_security_definer_count_%',v_public_definers; END IF;

  SELECT count(*) INTO v_private_count
  FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
  WHERE n.nspname='private' AND p.prosecdef AND p.proname IN (
    'mp_private_add_fit_profile_version_internal','mp_private_compute_fit_recommendation_internal',
    'mp_admin_approve_reorder_internal','mp_admin_convert_reorder_internal',
    'mp_private_set_wishlist_internal','mp_private_wishlist_internal',
    'mp_private_request_service_internal','mp_private_service_history_internal',
    'mp_client_create_delivery_claim_internal','mp_client_set_delivery_claim_line_internal',
    'mp_client_submit_delivery_claim_internal','mp_admin_decide_delivery_claim_internal',
    'mp_client_decide_delivery_claim_internal','mp_admin_record_delivery_claim_execution_internal',
    'mp_admin_close_delivery_claim_internal','mp_client_delivery_claims_internal',
    'mp_admin_delivery_claims_internal','mp_wholesale_approve_reorder_internal'
  );
  IF v_private_count<>18 THEN RAISE EXCEPTION 'v30_9_private_internal_count_%',v_private_count; END IF;

  IF has_schema_privilege('anon','private','USAGE')
     OR NOT has_schema_privilege('authenticated','private','USAGE') THEN
    RAISE EXCEPTION 'v30_9_private_schema_usage_invalid';
  END IF;

  -- Every public browser wrapper must be executable by authenticated, not anon.
  IF EXISTS(
    SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
    WHERE n.nspname='public'
      AND p.proname LIKE 'mp_%'
      AND p.proname IN (
        'mp_private_add_fit_profile_version','mp_private_compute_fit_recommendation',
        'mp_admin_approve_reorder','mp_admin_convert_reorder',
        'mp_private_set_wishlist','mp_private_wishlist','mp_private_request_service','mp_private_service_history',
        'mp_client_create_delivery_claim','mp_client_set_delivery_claim_line','mp_client_submit_delivery_claim',
        'mp_admin_decide_delivery_claim','mp_client_decide_delivery_claim','mp_admin_record_delivery_claim_execution',
        'mp_admin_close_delivery_claim','mp_client_delivery_claims','mp_admin_delivery_claims',
        'mp_wholesale_approve_reorder'
      )
      AND (has_function_privilege('anon',p.oid,'EXECUTE') OR NOT has_function_privilege('authenticated',p.oid,'EXECUTE'))
  ) THEN
    RAISE EXCEPTION 'v30_9_public_wrapper_execute_grant_invalid';
  END IF;

  IF has_function_privilege('anon','public.add_fit_profile_version(uuid,text,numeric,numeric,numeric,numeric,numeric,numeric,numeric,uuid,text)','EXECUTE')
     OR has_function_privilege('authenticated','public.add_fit_profile_version(uuid,text,numeric,numeric,numeric,numeric,numeric,numeric,numeric,uuid,text)','EXECUTE')
     OR has_function_privilege('anon','public.compute_fit_recommendation(uuid,uuid,boolean)','EXECUTE')
     OR has_function_privilege('authenticated','public.compute_fit_recommendation(uuid,uuid,boolean)','EXECUTE') THEN
    RAISE EXCEPTION 'v30_9_legacy_fit_primitive_execute_not_revoked';
  END IF;

  IF has_table_privilege('anon','public.v_sellthrough_intelligence','SELECT')
     OR has_table_privilege('anon','public.v_deal_cash_authority','SELECT')
     OR has_table_privilege('authenticated','public.v_deal_cash_authority','SELECT') THEN
    RAISE EXCEPTION 'v30_9_browser_authority_view_overexposed';
  END IF;
  IF NOT has_table_privilege('authenticated','public.v_sellthrough_intelligence','SELECT')
     OR NOT has_table_privilege('authenticated','public.v_private_wardrobe_authority','SELECT')
     OR has_table_privilege('authenticated','public.v_sellthrough_intelligence','UPDATE') THEN
    RAISE EXCEPTION 'v30_9_browser_read_view_grants_invalid';
  END IF;

  SELECT count(*) INTO v_claim_rls
  FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
  WHERE n.nspname='public' AND c.relname IN (
    'delivery_claims','delivery_claim_lines','delivery_claim_executions','delivery_claim_events'
  ) AND c.relrowsecurity;
  IF v_claim_rls<>4 THEN RAISE EXCEPTION 'v30_9_claim_rls_count_%',v_claim_rls; END IF;

  IF has_table_privilege('authenticated','public.delivery_claims','SELECT')
     OR has_table_privilege('authenticated','public.delivery_claim_lines','INSERT')
     OR has_table_privilege('anon','public.delivery_claims','SELECT') THEN
    RAISE EXCEPTION 'v30_9_claim_direct_table_grant_present';
  END IF;
END
$$;

SELECT jsonb_build_object(
  'gate','v30.9-postflight',
  'public_browser_wrappers',18,
  'new_public_security_definers',0,
  'private_security_definer_internals',18,
  'claims_rls_tables',4,
  'expected_security_advisor_warn_delta',0,
  'expected_rls_no_policy_info_delta',4
) AS v30_9_postflight;


-- ===== sql/07_five_role_admission_harness.sql (transaction envelope stripped) =====
-- Marco Pescarolo v30.8 executable five-role admission harness.
-- TARGET: isolated PostgreSQL 17 / Supabase development branch only.
-- All synthetic data and mutations are transactional and MUST be rolled back.

DO $$
BEGIN
  IF current_setting('server_version_num')::int < 170000 OR current_setting('server_version_num')::int >= 180000 THEN
    RAISE EXCEPTION 'postgres_17_required';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.tenants WHERE slug='marco-pescarolo' AND status='active') THEN
    RAISE EXCEPTION 'marco_pescarolo_tenant_seed_required';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.products WHERE status='active') THEN
    RAISE EXCEPTION 'at_least_one_active_product_seed_required';
  END IF;
END $$;

CREATE TEMP TABLE admission_results(
  test_name text PRIMARY KEY,
  pass boolean NOT NULL,
  detail text NOT NULL DEFAULT ''
) ON COMMIT DROP;
GRANT SELECT,INSERT,UPDATE ON admission_results TO authenticated;

-- Synthetic auth identities. No real credentials are used and nothing survives ROLLBACK.
INSERT INTO auth.users(id,aud,role,email,raw_app_meta_data,raw_user_meta_data,created_at,updated_at)
VALUES
 ('11111111-1111-4111-8111-111111111111','authenticated','authenticated','v307-private@test.invalid','{}','{}',now(),now()),
 ('22222222-2222-4222-8222-222222222222','authenticated','authenticated','v307-hq@test.invalid','{}','{}',now(),now()),
 ('33333333-3333-4333-8333-333333333333','authenticated','authenticated','v307-paris@test.invalid','{}','{}',now(),now()),
 ('44444444-4444-4444-8444-444444444444','authenticated','authenticated','v307-dubai@test.invalid','{}','{}',now(),now()),
 ('55555555-5555-4555-8555-555555555555','authenticated','authenticated','v307-admin@test.invalid','{}','{}',now(),now());

-- Public actors.
INSERT INTO public.users(id,tenant_id,email,display_name,role,is_active)
SELECT x.id,t.id,x.email,x.display_name,x.role,true
FROM public.tenants t
CROSS JOIN (VALUES
 ('61111111-1111-4111-8111-111111111111'::uuid,'v307-private@test.invalid','v30.8 Private','private_client'),
 ('62222222-2222-4222-8222-222222222222'::uuid,'v307-hq@test.invalid','v30.8 HQ','buyer'),
 ('63333333-3333-4333-8333-333333333333'::uuid,'v307-paris@test.invalid','v30.8 Paris','buyer'),
 ('64444444-4444-4444-8444-444444444444'::uuid,'v307-dubai@test.invalid','v30.8 Dubai','buyer'),
 ('65555555-5555-4555-8555-555555555555'::uuid,'v307-admin@test.invalid','v30.8 Admin','admin')
) AS x(id,email,display_name,role)
WHERE t.slug='marco-pescarolo';

-- Synthetic clients: private, Paris wholesale and Dubai wholesale.
INSERT INTO public.clients(id,tenant_id,code,client_type,name,market,country_code,currency,stage)
SELECT x.id,t.id,x.code,x.client_type,x.name,x.market,x.country_code,'EUR','active'
FROM public.tenants t
CROSS JOIN (VALUES
 ('71111111-1111-4111-8111-111111111111'::uuid,'V307-PRIVATE','private','v30.8 Private','Private','IT'),
 ('72222222-2222-4222-8222-222222222222'::uuid,'V307-PARIS','wholesale','v30.8 Paris','Paris','FR'),
 ('73333333-3333-4333-8333-333333333333'::uuid,'V307-DUBAI','wholesale','v30.8 Dubai','Dubai','AE')
) AS x(id,code,client_type,name,market,country_code)
WHERE t.slug='marco-pescarolo';

-- Store topology: two Paris stores for same client + one Dubai store.
INSERT INTO public.client_stores(id,tenant_id,client_id,code,name,store_type,city,country_code,is_active)
SELECT x.id,t.id,x.client_id,x.code,x.name,'store',x.city,x.country_code,true
FROM public.tenants t
CROSS JOIN (VALUES
 ('81111111-1111-4111-8111-111111111111'::uuid,'72222222-2222-4222-8222-222222222222'::uuid,'V307-PARIS-RG','Paris Rive Gauche','Paris','FR'),
 ('82222222-2222-4222-8222-222222222222'::uuid,'72222222-2222-4222-8222-222222222222'::uuid,'V307-PARIS-MARAIS','Paris Marais','Paris','FR'),
 ('83333333-3333-4333-8333-333333333333'::uuid,'73333333-3333-4333-8333-333333333333'::uuid,'V307-DUBAI-MALL','Dubai Mall','Dubai','AE')
) AS x(id,client_id,code,name,city,country_code)
WHERE t.slug='marco-pescarolo';

-- Portal memberships.
INSERT INTO public.portal_memberships(
 tenant_id,auth_user_id,public_user_id,client_id,client_store_id,access_role,status,activated_at
)
SELECT t.id,x.auth_user_id,x.public_user_id,x.client_id,x.client_store_id,x.access_role,'active',now()
FROM public.tenants t
CROSS JOIN (VALUES
 ('11111111-1111-4111-8111-111111111111'::uuid,'61111111-1111-4111-8111-111111111111'::uuid,'71111111-1111-4111-8111-111111111111'::uuid,NULL::uuid,'private_client'),
 ('22222222-2222-4222-8222-222222222222'::uuid,'62222222-2222-4222-8222-222222222222'::uuid,'72222222-2222-4222-8222-222222222222'::uuid,NULL::uuid,'buyer'),
 ('33333333-3333-4333-8333-333333333333'::uuid,'63333333-3333-4333-8333-333333333333'::uuid,'72222222-2222-4222-8222-222222222222'::uuid,'81111111-1111-4111-8111-111111111111'::uuid,'buyer'),
 ('44444444-4444-4444-8444-444444444444'::uuid,'64444444-4444-4444-8444-444444444444'::uuid,'73333333-3333-4333-8333-333333333333'::uuid,'83333333-3333-4333-8333-333333333333'::uuid,'buyer')
) AS x(auth_user_id,public_user_id,client_id,client_store_id,access_role)
WHERE t.slug='marco-pescarolo';

INSERT INTO public.mp_brand_admin_memberships(tenant_id,auth_user_id,public_user_id,status,activated_at)
SELECT t.id,'55555555-5555-4555-8555-555555555555','65555555-5555-4555-8555-555555555555','active',now()
FROM public.tenants t WHERE t.slug='marco-pescarolo';

-- Private fit fixture.
INSERT INTO public.private_fit_profiles(
 id,tenant_id,client_id,user_id,profile_key,display_name,preferred_fit,status,consent_at
)
SELECT '91111111-1111-4111-8111-111111111111',t.id,
 '71111111-1111-4111-8111-111111111111','61111111-1111-4111-8111-111111111111',
 'v307-main','v30.8 Admission Profile','regular','active',now()
FROM public.tenants t WHERE t.slug='marco-pescarolo';

-- Reorder fixtures. All use an existing product created by authoritative migrations.
INSERT INTO public.reorder_proposals(
 id,tenant_id,client_id,client_store_id,status,currency,horizon_weeks,proposal_value,
 rationale,created_by,proposal_kind,metadata
)
SELECT x.id,t.id,x.client_id,x.store_id,'proposed','EUR',8,1000,
 jsonb_build_object('fixture','v30.8'),x.created_by,'buyer_request','{}'::jsonb
FROM public.tenants t
CROSS JOIN (VALUES
 ('a1111111-1111-4111-8111-111111111111'::uuid,'72222222-2222-4222-8222-222222222222'::uuid,'81111111-1111-4111-8111-111111111111'::uuid,'63333333-3333-4333-8333-333333333333'::uuid),
 ('a2222222-2222-4222-8222-222222222222'::uuid,'72222222-2222-4222-8222-222222222222'::uuid,'82222222-2222-4222-8222-222222222222'::uuid,'62222222-2222-4222-8222-222222222222'::uuid),
 ('a3333333-3333-4333-8333-333333333333'::uuid,'73333333-3333-4333-8333-333333333333'::uuid,'83333333-3333-4333-8333-333333333333'::uuid,'64444444-4444-4444-8444-444444444444'::uuid),
 ('a4444444-4444-4444-8444-444444444444'::uuid,'72222222-2222-4222-8222-222222222222'::uuid,'81111111-1111-4111-8111-111111111111'::uuid,'63333333-3333-4333-8333-333333333333'::uuid)
) AS x(id,client_id,store_id,created_by)
WHERE t.slug='marco-pescarolo';

INSERT INTO public.reorder_lines(
 tenant_id,proposal_id,product_id,current_stock,weekly_velocity,target_wos,recommended_qty,unit_price,line_value,units_sold,period_weeks,rationale
)
SELECT t.id,rp.id,p.id,0,2,8,2,500,1000,4,2,jsonb_build_object('fixture','v30.8')
FROM public.tenants t
JOIN public.reorder_proposals rp ON rp.tenant_id=t.id AND rp.id IN (
 'a1111111-1111-4111-8111-111111111111','a2222222-2222-4222-8222-222222222222',
 'a3333333-3333-4333-8333-333333333333','a4444444-4444-4444-8444-444444444444'
)
CROSS JOIN LATERAL (
 SELECT id FROM public.products WHERE tenant_id=t.id AND status='active' ORDER BY created_at LIMIT 1
) p
WHERE t.slug='marco-pescarolo';

SET LOCAL ROLE authenticated;

-- PRIVATE
SELECT set_config('request.jwt.claims','{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated","aal":"aal1","is_anonymous":false}',true);
DO $$
DECLARE x jsonb; v uuid;
BEGIN
  BEGIN
    x:=public.mp_my_access();
    INSERT INTO admission_results VALUES('private_identity',(x->'memberships'->0->>'access_role')='private',x::text);
  EXCEPTION WHEN OTHERS THEN INSERT INTO admission_results VALUES('private_identity',false,SQLERRM); END;

  BEGIN
    PERFORM public.mp_client_snapshot('wholesale',NULL);
    INSERT INTO admission_results VALUES('private_wholesale_denied',false,'unexpected allow');
  EXCEPTION WHEN OTHERS THEN INSERT INTO admission_results VALUES('private_wholesale_denied',true,SQLERRM); END;

  BEGIN
    v:=public.mp_private_add_fit_profile_version(
      '91111111-1111-4111-8111-111111111111','self',180,102,88,100,82,47,64,'v30.8 admission');
    INSERT INTO admission_results VALUES('private_fit_write',v IS NOT NULL,coalesce(v::text,'null'));
  EXCEPTION WHEN OTHERS THEN INSERT INTO admission_results VALUES('private_fit_write',false,SQLERRM); END;
END $$;

-- HQ BUYER
SELECT set_config('request.jwt.claims','{"sub":"22222222-2222-4222-8222-222222222222","role":"authenticated","aal":"aal1","is_anonymous":false}',true);
DO $$ BEGIN
  BEGIN PERFORM public.mp_client_snapshot('wholesale','81111111-1111-4111-8111-111111111111');
    INSERT INTO admission_results VALUES('hq_paris_store',true,'allowed');
  EXCEPTION WHEN OTHERS THEN INSERT INTO admission_results VALUES('hq_paris_store',false,SQLERRM); END;
  BEGIN PERFORM public.mp_client_snapshot('wholesale','83333333-3333-4333-8333-333333333333');
    INSERT INTO admission_results VALUES('hq_dubai_client_denied',false,'unexpected allow');
  EXCEPTION WHEN OTHERS THEN INSERT INTO admission_results VALUES('hq_dubai_client_denied',true,SQLERRM); END;
END $$;

-- PARIS STORE-BOUND BUYER
SELECT set_config('request.jwt.claims','{"sub":"33333333-3333-4333-8333-333333333333","role":"authenticated","aal":"aal1","is_anonymous":false}',true);
DO $$ BEGIN
  BEGIN PERFORM public.mp_client_snapshot('wholesale','81111111-1111-4111-8111-111111111111');
    INSERT INTO admission_results VALUES('paris_own_store',true,'allowed');
  EXCEPTION WHEN OTHERS THEN INSERT INTO admission_results VALUES('paris_own_store',false,SQLERRM); END;

  BEGIN PERFORM public.mp_client_snapshot('wholesale','82222222-2222-4222-8222-222222222222');
    INSERT INTO admission_results VALUES('paris_other_paris_store_denied',false,'unexpected allow');
  EXCEPTION WHEN OTHERS THEN INSERT INTO admission_results VALUES('paris_other_paris_store_denied',true,SQLERRM); END;

  BEGIN PERFORM public.mp_client_snapshot('wholesale','83333333-3333-4333-8333-333333333333');
    INSERT INTO admission_results VALUES('paris_dubai_denied',false,'unexpected allow');
  EXCEPTION WHEN OTHERS THEN INSERT INTO admission_results VALUES('paris_dubai_denied',true,SQLERRM); END;

  BEGIN PERFORM public.mp_wholesale_approve_reorder('a1111111-1111-4111-8111-111111111111');
    INSERT INTO admission_results VALUES('buyer_reorder_approval',true,'own store allowed');
  EXCEPTION WHEN OTHERS THEN INSERT INTO admission_results VALUES('buyer_reorder_approval',false,SQLERRM); END;

  BEGIN PERFORM public.mp_wholesale_approve_reorder('a2222222-2222-4222-8222-222222222222');
    INSERT INTO admission_results VALUES('buyer_reorder_other_store_denied',false,'unexpected allow');
  EXCEPTION WHEN OTHERS THEN INSERT INTO admission_results VALUES('buyer_reorder_other_store_denied',position('outside_buyer_store' in SQLERRM)>0,SQLERRM); END;
END $$;

-- DUBAI BUYER
SELECT set_config('request.jwt.claims','{"sub":"44444444-4444-4444-8444-444444444444","role":"authenticated","aal":"aal1","is_anonymous":false}',true);
DO $$ BEGIN
  BEGIN PERFORM public.mp_client_snapshot('wholesale','83333333-3333-4333-8333-333333333333');
    INSERT INTO admission_results VALUES('dubai_own_store',true,'allowed');
  EXCEPTION WHEN OTHERS THEN INSERT INTO admission_results VALUES('dubai_own_store',false,SQLERRM); END;
  BEGIN PERFORM public.mp_client_snapshot('wholesale','81111111-1111-4111-8111-111111111111');
    INSERT INTO admission_results VALUES('dubai_paris_denied',false,'unexpected allow');
  EXCEPTION WHEN OTHERS THEN INSERT INTO admission_results VALUES('dubai_paris_denied',true,SQLERRM); END;
END $$;

-- ADMIN AAL1 DENIAL
SELECT set_config('request.jwt.claims','{"sub":"55555555-5555-4555-8555-555555555555","role":"authenticated","aal":"aal1","is_anonymous":false}',true);
DO $$ BEGIN
  BEGIN PERFORM public.mp_admin_approve_reorder('a4444444-4444-4444-8444-444444444444','v30.8 admission');
    INSERT INTO admission_results VALUES('admin_aal1_reorder_denied',false,'unexpected allow');
  EXCEPTION WHEN OTHERS THEN INSERT INTO admission_results VALUES('admin_aal1_reorder_denied',position('admin_mfa_required' in SQLERRM)>0,SQLERRM); END;
END $$;

-- Need proposal buyer-approved before admin AAL2 approval.
SELECT set_config('request.jwt.claims','{"sub":"33333333-3333-4333-8333-333333333333","role":"authenticated","aal":"aal1","is_anonymous":false}',true);
SELECT public.mp_wholesale_approve_reorder('a4444444-4444-4444-8444-444444444444');

-- ADMIN AAL2 ALLOW
SELECT set_config('request.jwt.claims','{"sub":"55555555-5555-4555-8555-555555555555","role":"authenticated","aal":"aal2","is_anonymous":false}',true);
DO $$
DECLARE d uuid;
BEGIN
  BEGIN PERFORM public.mp_admin_approve_reorder('a4444444-4444-4444-8444-444444444444','v30.8 admission');
    INSERT INTO admission_results VALUES('admin_aal2_reorder_approval',true,'brand approved');
  EXCEPTION WHEN OTHERS THEN INSERT INTO admission_results VALUES('admin_aal2_reorder_approval',false,SQLERRM); END;

  BEGIN d:=public.mp_admin_convert_reorder('a4444444-4444-4444-8444-444444444444','V307-REORDER','v30.8 Reorder');
    INSERT INTO admission_results VALUES('admin_aal2_reorder_conversion',d IS NOT NULL,coalesce(d::text,'null'));
  EXCEPTION WHEN OTHERS THEN INSERT INTO admission_results VALUES('admin_aal2_reorder_conversion',false,SQLERRM); END;
END $$;

-- FUNCTION GRANTS
DO $$ BEGIN
  INSERT INTO admission_results VALUES(
    'anon_wrapper_execute_denied',
    NOT has_function_privilege('anon','public.mp_private_add_fit_profile_version(uuid,text,numeric,numeric,numeric,numeric,numeric,numeric,numeric,text)','EXECUTE')
    AND NOT has_function_privilege('anon','public.mp_wholesale_approve_reorder(uuid)','EXECUTE'),
    'anon must not execute private/buyer wrappers'
  );
  INSERT INTO admission_results VALUES(
    'authenticated_wrapper_execute_present',
    has_function_privilege('authenticated','public.mp_private_add_fit_profile_version(uuid,text,numeric,numeric,numeric,numeric,numeric,numeric,numeric,text)','EXECUTE')
    AND has_function_privilege('authenticated','public.mp_wholesale_approve_reorder(uuid)','EXECUTE'),
    'authenticated wrappers present; membership remains authoritative'
  );
END $$;

-- SENSITIVE COST NON-DISCLOSURE
DO $$ BEGIN
  BEGIN EXECUTE 'select unit_cost from public.products limit 1';
    INSERT INTO admission_results VALUES('unit_cost_direct_select_denied',false,'unexpected allow');
  EXCEPTION WHEN insufficient_privilege THEN INSERT INTO admission_results VALUES('unit_cost_direct_select_denied',true,SQLERRM); END;

  BEGIN EXECUTE 'select unit_cost_snapshot from public.deal_lines limit 1';
    INSERT INTO admission_results VALUES('unit_cost_snapshot_direct_select_denied',false,'unexpected allow');
  EXCEPTION WHEN insufficient_privilege THEN INSERT INTO admission_results VALUES('unit_cost_snapshot_direct_select_denied',true,SQLERRM); END;

  BEGIN EXECUTE 'select gross_contribution from public.deals limit 1';
    INSERT INTO admission_results VALUES('gross_contribution_direct_select_denied',false,'unexpected allow');
  EXCEPTION WHEN insufficient_privilege THEN INSERT INTO admission_results VALUES('gross_contribution_direct_select_denied',true,SQLERRM); END;
END $$;

RESET ROLE;

-- The contract expects 20 tests after adding exact store reorder isolation.
DO $$
DECLARE n integer; failed integer;
BEGIN
  SELECT count(*),count(*) FILTER (WHERE NOT pass) INTO n,failed FROM admission_results;
  IF n<>20 THEN RAISE EXCEPTION 'admission_test_count_mismatch expected=20 actual=%',n; END IF;
  IF failed<>0 THEN
    RAISE EXCEPTION 'five_role_admission_failed: %',(
      SELECT jsonb_agg(jsonb_build_object('test',test_name,'detail',detail) ORDER BY test_name)
      FROM admission_results WHERE NOT pass
    );
  END IF;
END $$;

SELECT jsonb_build_object(
  'version','30.8',
  'total',count(*),
  'passed',count(*) FILTER (WHERE pass),
  'failed',count(*) FILTER (WHERE NOT pass),
  'all_green',bool_and(pass),
  'results',jsonb_agg(jsonb_build_object('test',test_name,'pass',pass,'detail',detail) ORDER BY test_name)
) AS admission_report
FROM admission_results;

ROLLBACK;
