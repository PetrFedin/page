-- Marco Pescarolo v31.4 Internal Integrity Hardening
-- STAGED ONLY. Designed to run AFTER the qualified v30.9 migration.
-- No production execution in this candidate. Ends in ROLLBACK.
BEGIN;

-- ---------------------------------------------------------------------------
-- 0) Fail-safe future Data API defaults for browser roles.
-- Keep service_role unchanged; browser access must always be explicit.
-- ---------------------------------------------------------------------------
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  REVOKE SELECT, INSERT, UPDATE, DELETE ON TABLES FROM anon, authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  REVOKE USAGE, SELECT ON SEQUENCES FROM anon, authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC, anon, authenticated;

-- ---------------------------------------------------------------------------
-- 1) Canonical production-deal guard shared by browser facades.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION private.mp_require_production_deal(
  p_deal_id uuid,
  p_db_role text
)
RETURNS public.deals
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  m public.portal_memberships%ROWTYPE;
  d public.deals%ROWTYPE;
BEGIN
  IF auth.uid() IS NULL OR COALESCE((auth.jwt()->>'is_anonymous')::boolean,false) THEN
    RAISE EXCEPTION 'authenticated_membership_required' USING ERRCODE='42501';
  END IF;
  IF p_db_role NOT IN ('buyer','private_client') THEN
    RAISE EXCEPTION 'unsupported_db_role' USING ERRCODE='22023';
  END IF;

  m:=private.require_portal_role(p_db_role);
  SELECT * INTO d
  FROM public.deals
  WHERE id=p_deal_id
    AND tenant_id=m.tenant_id
    AND client_id=m.client_id
    AND data_class='production';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'production_deal_scope_required' USING ERRCODE='42501';
  END IF;

  IF p_db_role='buyer'
     AND NOT private.portal_scope_allows(d.tenant_id,d.client_id,d.client_store_id,'buyer') THEN
    RAISE EXCEPTION 'buyer_store_scope_denied' USING ERRCODE='42501';
  END IF;

  RETURN d;
END
$$;
REVOKE ALL ON FUNCTION private.mp_require_production_deal(uuid,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.mp_require_production_deal(uuid,text) TO authenticated;

-- ---------------------------------------------------------------------------
-- 2) Production-only client read facades.
-- Keep mature live projection logic, then remove non-production orders.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION private.mp_client_snapshot_v2_internal(
  p_db_role text,
  p_store_id uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  base jsonb;
  production_orders jsonb;
BEGIN
  IF p_db_role NOT IN ('buyer','private_client') THEN
    RAISE EXCEPTION 'unsupported_db_role' USING ERRCODE='22023';
  END IF;

  base:=public.mp_client_snapshot(p_db_role,p_store_id);
  SELECT COALESCE(jsonb_agg(x ORDER BY x->>'created_at'),'[]'::jsonb)
    INTO production_orders
  FROM jsonb_array_elements(COALESCE(base->'orders','[]'::jsonb)) x
  WHERE x->>'data_class'='production';

  RETURN jsonb_set(base,'{orders}',production_orders,true)
    || jsonb_build_object('data_scope','production','contract_version','31.4');
END
$$;
REVOKE ALL ON FUNCTION private.mp_client_snapshot_v2_internal(text,uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.mp_client_snapshot_v2_internal(text,uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.mp_client_snapshot_v2(
  p_access_role text,
  p_store_id uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path TO 'pg_catalog','public','private'
AS $$
  SELECT private.mp_client_snapshot_v2_internal(p_access_role,p_store_id);
$$;
REVOKE ALL ON FUNCTION public.mp_client_snapshot_v2(text,uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.mp_client_snapshot_v2(text,uuid) TO authenticated;

CREATE OR REPLACE FUNCTION private.mp_client_issued_proformas_v2_internal(p_db_role text)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE m public.portal_memberships%ROWTYPE;
BEGIN
  IF auth.uid() IS NULL OR COALESCE((auth.jwt()->>'is_anonymous')::boolean,false)
     OR p_db_role NOT IN ('buyer','private_client') THEN
    RAISE EXCEPTION 'client_login_required' USING ERRCODE='42501';
  END IF;

  SELECT pm.* INTO m
  FROM public.portal_memberships pm
  JOIN public.clients c ON c.id=pm.client_id AND c.tenant_id=pm.tenant_id
  JOIN public.tenants t ON t.id=pm.tenant_id AND t.slug='marco-pescarolo' AND t.status='active'
  WHERE pm.auth_user_id=auth.uid() AND pm.status='active' AND pm.access_role=p_db_role
    AND ((p_db_role='buyer' AND c.client_type='wholesale')
      OR (p_db_role='private_client' AND c.client_type='private'))
  LIMIT 1;
  IF NOT FOUND THEN RAISE EXCEPTION 'client_membership_required' USING ERRCODE='42501'; END IF;

  RETURN COALESCE((
    SELECT jsonb_agg(jsonb_build_object(
      'id',p.id,'deal_id',p.deal_id,'number',p.number,'amount',p.amount,
      'advance_amount',p.advance_amount,'currency',p.currency,'status',p.status,
      'document_url',p.document_url,'version',p.version,'issued_at',p.issued_at
    ) ORDER BY p.issued_at DESC)
    FROM public.proformas p
    JOIN public.deals d ON d.id=p.deal_id AND d.tenant_id=m.tenant_id
    WHERE d.client_id=m.client_id
      AND d.data_class='production'
      AND p.status='issued'
      AND (p_db_role='private_client'
        OR private.portal_scope_allows(d.tenant_id,d.client_id,d.client_store_id,'buyer'))
  ),'[]'::jsonb);
END
$$;
REVOKE ALL ON FUNCTION private.mp_client_issued_proformas_v2_internal(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.mp_client_issued_proformas_v2_internal(text) TO authenticated;

CREATE OR REPLACE FUNCTION public.mp_client_issued_proformas_v2(p_access_role text)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path TO 'pg_catalog','public','private'
AS $$ SELECT private.mp_client_issued_proformas_v2_internal(p_access_role); $$;
REVOKE ALL ON FUNCTION public.mp_client_issued_proformas_v2(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.mp_client_issued_proformas_v2(text) TO authenticated;

-- ---------------------------------------------------------------------------
-- 3) Private write facades: non-production deal IDs are fail-closed.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION private.mp_private_submit_order_v2_internal(p_deal_id uuid,p_expected_revision integer)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path TO '' AS $$
BEGIN
  PERFORM private.mp_require_production_deal(p_deal_id,'private_client');
  RETURN public.mp_private_submit_order(p_deal_id,p_expected_revision);
END $$;
CREATE OR REPLACE FUNCTION public.mp_private_submit_order_v2(p_deal_id uuid,p_expected_revision integer)
RETURNS uuid LANGUAGE sql SECURITY INVOKER SET search_path TO 'pg_catalog','public','private'
AS $$ SELECT private.mp_private_submit_order_v2_internal(p_deal_id,p_expected_revision); $$;

CREATE OR REPLACE FUNCTION private.mp_private_accept_revision_v2_internal(p_deal_id uuid,p_expected_revision integer)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path TO '' AS $$
BEGIN
  PERFORM private.mp_require_production_deal(p_deal_id,'private_client');
  RETURN public.mp_private_accept_revision(p_deal_id,p_expected_revision);
END $$;
CREATE OR REPLACE FUNCTION public.mp_private_accept_revision_v2(p_deal_id uuid,p_expected_revision integer)
RETURNS uuid LANGUAGE sql SECURITY INVOKER SET search_path TO 'pg_catalog','public','private'
AS $$ SELECT private.mp_private_accept_revision_v2_internal(p_deal_id,p_expected_revision); $$;

CREATE OR REPLACE FUNCTION private.mp_private_submit_payment_evidence_v2_internal(
  p_deal_id uuid,p_proforma_id uuid,p_amount numeric,p_provider text,p_reference text
) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path TO '' AS $$
BEGIN
  PERFORM private.mp_require_production_deal(p_deal_id,'private_client');
  RETURN public.mp_private_submit_payment_evidence(p_deal_id,p_proforma_id,p_amount,p_provider,p_reference);
END $$;
CREATE OR REPLACE FUNCTION public.mp_private_submit_payment_evidence_v2(
  p_deal_id uuid,p_proforma_id uuid,p_amount numeric,p_provider text,p_reference text
) RETURNS uuid LANGUAGE sql SECURITY INVOKER SET search_path TO 'pg_catalog','public','private'
AS $$ SELECT private.mp_private_submit_payment_evidence_v2_internal(p_deal_id,p_proforma_id,p_amount,p_provider,p_reference); $$;

-- ---------------------------------------------------------------------------
-- 4) Wholesale browser facade. Existing mature portal functions remain server
--    primitives, while browser routes become production-only.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION private.mp_wholesale_create_order_v2_internal(
  p_store_id uuid,p_title text,p_buyer_reference text,p_season text,p_client_request_id uuid
) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path TO '' AS $$
DECLARE m public.portal_memberships%ROWTYPE; v_deal uuid; v_existing public.deals%ROWTYPE;
BEGIN
  m:=private.require_portal_role('buyer');

  -- An idempotent retry may return an existing deal. Never promote an old
  -- demo/synthetic fixture into production simply because the request id is reused.
  IF p_client_request_id IS NOT NULL THEN
    SELECT * INTO v_existing
    FROM public.deals
    WHERE tenant_id=m.tenant_id AND client_request_id=p_client_request_id
    FOR UPDATE;
    IF FOUND THEN
      IF v_existing.client_id<>m.client_id THEN
        RAISE EXCEPTION 'buyer_request_id_conflict' USING ERRCODE='42501';
      END IF;
      IF v_existing.data_class<>'production' THEN
        RAISE EXCEPTION 'request_id_bound_to_nonproduction_deal' USING ERRCODE='40001';
      END IF;
      PERFORM private.mp_require_production_deal(v_existing.id,'buyer');
      RETURN v_existing.id;
    END IF;
  END IF;

  v_deal:=public.portal_create_draft_order(p_store_id,p_title,p_buyer_reference,p_season,p_client_request_id);
  UPDATE public.deals
     SET data_class='production',updated_at=now()
   WHERE id=v_deal AND tenant_id=m.tenant_id AND client_id=m.client_id
     AND data_class='demo';
  IF NOT FOUND THEN
    RAISE EXCEPTION 'wholesale_create_data_class_transition_failed' USING ERRCODE='40001';
  END IF;
  PERFORM private.mp_require_production_deal(v_deal,'buyer');
  RETURN v_deal;
END $$;
CREATE OR REPLACE FUNCTION public.mp_wholesale_create_order_v2(
  p_store_id uuid,p_title text,p_buyer_reference text,p_season text,p_client_request_id uuid
) RETURNS uuid LANGUAGE sql SECURITY INVOKER SET search_path TO 'pg_catalog','public','private'
AS $$ SELECT private.mp_wholesale_create_order_v2_internal(p_store_id,p_title,p_buyer_reference,p_season,p_client_request_id); $$;

CREATE OR REPLACE FUNCTION private.mp_wholesale_set_deal_line_v2_internal(
 p_deal_id uuid,p_product_id uuid,p_product_variant_id uuid,p_qty integer
) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path TO '' AS $$
BEGIN
 PERFORM private.mp_require_production_deal(p_deal_id,'buyer');
 RETURN public.portal_set_deal_line(p_deal_id,p_product_id,p_product_variant_id,p_qty);
END $$;
CREATE OR REPLACE FUNCTION public.mp_wholesale_set_deal_line_v2(
 p_deal_id uuid,p_product_id uuid,p_product_variant_id uuid,p_qty integer
) RETURNS uuid LANGUAGE sql SECURITY INVOKER SET search_path TO 'pg_catalog','public','private'
AS $$ SELECT private.mp_wholesale_set_deal_line_v2_internal(p_deal_id,p_product_id,p_product_variant_id,p_qty); $$;

CREATE OR REPLACE FUNCTION private.mp_wholesale_apply_size_run_v2_internal(
 p_deal_id uuid,p_product_id uuid,p_color text,p_quantities jsonb,p_reason text
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO '' AS $$
BEGIN
 PERFORM private.mp_require_production_deal(p_deal_id,'buyer');
 RETURN public.portal_apply_size_run(p_deal_id,p_product_id,p_color,p_quantities,p_reason);
END $$;
CREATE OR REPLACE FUNCTION public.mp_wholesale_apply_size_run_v2(
 p_deal_id uuid,p_product_id uuid,p_color text,p_quantities jsonb,p_reason text
) RETURNS jsonb LANGUAGE sql SECURITY INVOKER SET search_path TO 'pg_catalog','public','private'
AS $$ SELECT private.mp_wholesale_apply_size_run_v2_internal(p_deal_id,p_product_id,p_color,p_quantities,p_reason); $$;

CREATE OR REPLACE FUNCTION private.mp_wholesale_save_revision_v2_internal(p_deal_id uuid,p_reason text)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path TO '' AS $$
BEGIN
 PERFORM private.mp_require_production_deal(p_deal_id,'buyer');
 RETURN public.portal_save_draft_revision(p_deal_id,p_reason);
END $$;
CREATE OR REPLACE FUNCTION public.mp_wholesale_save_revision_v2(p_deal_id uuid,p_reason text)
RETURNS uuid LANGUAGE sql SECURITY INVOKER SET search_path TO 'pg_catalog','public','private'
AS $$ SELECT private.mp_wholesale_save_revision_v2_internal(p_deal_id,p_reason); $$;

CREATE OR REPLACE FUNCTION private.mp_wholesale_submit_order_v2_internal(p_deal_id uuid,p_expected_revision integer)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path TO '' AS $$
BEGIN
 PERFORM private.mp_require_production_deal(p_deal_id,'buyer');
 RETURN public.mp_wholesale_submit_order(p_deal_id,p_expected_revision);
END $$;
CREATE OR REPLACE FUNCTION public.mp_wholesale_submit_order_v2(p_deal_id uuid,p_expected_revision integer)
RETURNS uuid LANGUAGE sql SECURITY INVOKER SET search_path TO 'pg_catalog','public','private'
AS $$ SELECT private.mp_wholesale_submit_order_v2_internal(p_deal_id,p_expected_revision); $$;

CREATE OR REPLACE FUNCTION private.mp_wholesale_accept_revision_v2_internal(p_deal_id uuid,p_expected_revision integer)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path TO '' AS $$
BEGIN
 PERFORM private.mp_require_production_deal(p_deal_id,'buyer');
 RETURN public.mp_wholesale_accept_revision(p_deal_id,p_expected_revision);
END $$;
CREATE OR REPLACE FUNCTION public.mp_wholesale_accept_revision_v2(p_deal_id uuid,p_expected_revision integer)
RETURNS uuid LANGUAGE sql SECURITY INVOKER SET search_path TO 'pg_catalog','public','private'
AS $$ SELECT private.mp_wholesale_accept_revision_v2_internal(p_deal_id,p_expected_revision); $$;

CREATE OR REPLACE FUNCTION private.mp_wholesale_submit_payment_evidence_v2_internal(
 p_deal_id uuid,p_proforma_id uuid,p_amount numeric,p_currency text,p_provider text,
 p_external_reference text,p_evidence_hash text,p_evidence_url text
) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path TO '' AS $$
BEGIN
 PERFORM private.mp_require_production_deal(p_deal_id,'buyer');
 RETURN public.portal_submit_payment_evidence(
  p_deal_id,p_proforma_id,p_amount,p_currency,p_provider,p_external_reference,p_evidence_hash,p_evidence_url
 );
END $$;
CREATE OR REPLACE FUNCTION public.mp_wholesale_submit_payment_evidence_v2(
 p_deal_id uuid,p_proforma_id uuid,p_amount numeric,p_currency text,p_provider text,
 p_external_reference text,p_evidence_hash text,p_evidence_url text
) RETURNS uuid LANGUAGE sql SECURITY INVOKER SET search_path TO 'pg_catalog','public','private'
AS $$ SELECT private.mp_wholesale_submit_payment_evidence_v2_internal(
 p_deal_id,p_proforma_id,p_amount,p_currency,p_provider,p_external_reference,p_evidence_hash,p_evidence_url); $$;

CREATE OR REPLACE FUNCTION private.mp_wholesale_copy_order_v2_internal(
 p_source_deal_id uuid,p_target_store_id uuid,p_new_title text,p_buyer_reference text
) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path TO '' AS $$
DECLARE d public.deals%ROWTYPE; v_new uuid;
BEGIN
 d:=private.mp_require_production_deal(p_source_deal_id,'buyer');
 v_new:=public.portal_copy_deal(p_source_deal_id,p_target_store_id,p_new_title,p_buyer_reference);
 UPDATE public.deals SET data_class=d.data_class,updated_at=now()
  WHERE id=v_new AND tenant_id=d.tenant_id AND client_id=d.client_id;
 PERFORM private.mp_require_production_deal(v_new,'buyer');
 RETURN v_new;
END $$;
CREATE OR REPLACE FUNCTION public.mp_wholesale_copy_order_v2(
 p_source_deal_id uuid,p_target_store_id uuid,p_new_title text,p_buyer_reference text
) RETURNS uuid LANGUAGE sql SECURITY INVOKER SET search_path TO 'pg_catalog','public','private'
AS $$ SELECT private.mp_wholesale_copy_order_v2_internal(p_source_deal_id,p_target_store_id,p_new_title,p_buyer_reference); $$;

-- ---------------------------------------------------------------------------
-- 5) Reorder provenance facade: safely propagate source metadata to the deal.
-- Missing/invalid data_class falls back to demo, never production.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.create_reorder_proposal_from_batch_v2(
 p_batch_id uuid,p_actor_user_id uuid,p_target_wos numeric
) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'pg_catalog','public' AS $$
DECLARE v_proposal uuid; v_class text;
BEGIN
 SELECT CASE WHEN lower(metadata->>'data_class') IN ('production','demo','synthetic')
             THEN lower(metadata->>'data_class') ELSE 'demo' END
   INTO v_class FROM public.sell_through_batches WHERE id=p_batch_id;
 IF NOT FOUND THEN RAISE EXCEPTION 'sell-through batch not found'; END IF;
 v_proposal:=public.create_reorder_proposal_from_batch(p_batch_id,p_actor_user_id,p_target_wos);
 UPDATE public.reorder_proposals
    SET metadata=COALESCE(metadata,'{}'::jsonb)||jsonb_build_object('data_class',v_class),updated_at=now()
  WHERE id=v_proposal;
 RETURN v_proposal;
END $$;
REVOKE ALL ON FUNCTION public.create_reorder_proposal_from_batch_v2(uuid,uuid,numeric) FROM PUBLIC,anon,authenticated;

CREATE OR REPLACE FUNCTION public.convert_reorder_to_deal_v2(
 p_proposal_id uuid,p_actor_user_id uuid,p_code text,p_title text
) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'pg_catalog','public' AS $$
DECLARE v_deal uuid; v_class text; v_existing uuid; v_existing_class text;
BEGIN
 SELECT converted_deal_id,
        CASE WHEN lower(metadata->>'data_class') IN ('production','demo','synthetic')
             THEN lower(metadata->>'data_class') ELSE 'demo' END
   INTO v_existing,v_class
 FROM public.reorder_proposals WHERE id=p_proposal_id FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'reorder proposal not found'; END IF;

 IF v_existing IS NOT NULL THEN
   SELECT data_class INTO v_existing_class FROM public.deals WHERE id=v_existing;
   IF v_existing_class IS DISTINCT FROM v_class THEN
     RAISE EXCEPTION 'reorder_data_class_conflict' USING ERRCODE='40001';
   END IF;
   RETURN v_existing;
 END IF;

 v_deal:=public.convert_reorder_to_deal(p_proposal_id,p_actor_user_id,p_code,p_title);
 UPDATE public.deals SET data_class=v_class,updated_at=now()
  WHERE id=v_deal AND source_reorder_proposal_id=p_proposal_id;
 RETURN v_deal;
END $$;
REVOKE ALL ON FUNCTION public.convert_reorder_to_deal_v2(uuid,uuid,text,text) FROM PUBLIC,anon,authenticated;

-- ---------------------------------------------------------------------------
-- 5b) Private v31.4 internals are callable only through authenticated facades.
-- The private schema is not an exposed Data API schema; these grants are still
-- explicit so direct SQL privileges cannot silently widen through PUBLIC.
-- ---------------------------------------------------------------------------
REVOKE ALL ON FUNCTION private.mp_private_submit_order_v2_internal(uuid,integer) FROM PUBLIC,anon;
REVOKE ALL ON FUNCTION private.mp_private_accept_revision_v2_internal(uuid,integer) FROM PUBLIC,anon;
REVOKE ALL ON FUNCTION private.mp_private_submit_payment_evidence_v2_internal(uuid,uuid,numeric,text,text) FROM PUBLIC,anon;
REVOKE ALL ON FUNCTION private.mp_wholesale_create_order_v2_internal(uuid,text,text,text,uuid) FROM PUBLIC,anon;
REVOKE ALL ON FUNCTION private.mp_wholesale_set_deal_line_v2_internal(uuid,uuid,uuid,integer) FROM PUBLIC,anon;
REVOKE ALL ON FUNCTION private.mp_wholesale_apply_size_run_v2_internal(uuid,uuid,text,jsonb,text) FROM PUBLIC,anon;
REVOKE ALL ON FUNCTION private.mp_wholesale_save_revision_v2_internal(uuid,text) FROM PUBLIC,anon;
REVOKE ALL ON FUNCTION private.mp_wholesale_submit_order_v2_internal(uuid,integer) FROM PUBLIC,anon;
REVOKE ALL ON FUNCTION private.mp_wholesale_accept_revision_v2_internal(uuid,integer) FROM PUBLIC,anon;
REVOKE ALL ON FUNCTION private.mp_wholesale_submit_payment_evidence_v2_internal(uuid,uuid,numeric,text,text,text,text,text) FROM PUBLIC,anon;
REVOKE ALL ON FUNCTION private.mp_wholesale_copy_order_v2_internal(uuid,uuid,text,text) FROM PUBLIC,anon;
REVOKE ALL ON FUNCTION private.mp_client_snapshot_v2_internal(text,uuid) FROM PUBLIC,anon;
REVOKE ALL ON FUNCTION private.mp_client_issued_proformas_v2_internal(text) FROM PUBLIC,anon;

GRANT EXECUTE ON FUNCTION private.mp_private_submit_order_v2_internal(uuid,integer) TO authenticated;
GRANT EXECUTE ON FUNCTION private.mp_private_accept_revision_v2_internal(uuid,integer) TO authenticated;
GRANT EXECUTE ON FUNCTION private.mp_private_submit_payment_evidence_v2_internal(uuid,uuid,numeric,text,text) TO authenticated;
GRANT EXECUTE ON FUNCTION private.mp_wholesale_create_order_v2_internal(uuid,text,text,text,uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION private.mp_wholesale_set_deal_line_v2_internal(uuid,uuid,uuid,integer) TO authenticated;
GRANT EXECUTE ON FUNCTION private.mp_wholesale_apply_size_run_v2_internal(uuid,uuid,text,jsonb,text) TO authenticated;
GRANT EXECUTE ON FUNCTION private.mp_wholesale_save_revision_v2_internal(uuid,text) TO authenticated;
GRANT EXECUTE ON FUNCTION private.mp_wholesale_submit_order_v2_internal(uuid,integer) TO authenticated;
GRANT EXECUTE ON FUNCTION private.mp_wholesale_accept_revision_v2_internal(uuid,integer) TO authenticated;
GRANT EXECUTE ON FUNCTION private.mp_wholesale_submit_payment_evidence_v2_internal(uuid,uuid,numeric,text,text,text,text,text) TO authenticated;
GRANT EXECUTE ON FUNCTION private.mp_wholesale_copy_order_v2_internal(uuid,uuid,text,text) TO authenticated;
GRANT EXECUTE ON FUNCTION private.mp_client_snapshot_v2_internal(text,uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION private.mp_client_issued_proformas_v2_internal(text) TO authenticated;

-- ---------------------------------------------------------------------------
-- 6) Browser API grants: allow only v2 facades; raw mutation primitives become
-- backend-only. Old APIs remain available to owner/server code for delegation.
-- ---------------------------------------------------------------------------
REVOKE EXECUTE ON FUNCTION public.mp_client_snapshot(text,uuid) FROM PUBLIC,anon,authenticated;
REVOKE EXECUTE ON FUNCTION public.mp_client_issued_proformas(text) FROM PUBLIC,anon,authenticated;
REVOKE EXECUTE ON FUNCTION public.mp_private_submit_order(uuid,integer) FROM PUBLIC,anon,authenticated;
REVOKE EXECUTE ON FUNCTION public.mp_private_accept_revision(uuid,integer) FROM PUBLIC,anon,authenticated;
REVOKE EXECUTE ON FUNCTION public.mp_private_submit_payment_evidence(uuid,uuid,numeric,text,text) FROM PUBLIC,anon,authenticated;
REVOKE EXECUTE ON FUNCTION public.portal_create_draft_order(uuid,text,text,text,uuid) FROM PUBLIC,anon,authenticated;
REVOKE EXECUTE ON FUNCTION public.portal_set_deal_line(uuid,uuid,uuid,integer) FROM PUBLIC,anon,authenticated;
REVOKE EXECUTE ON FUNCTION public.portal_apply_size_run(uuid,uuid,text,jsonb,text) FROM PUBLIC,anon,authenticated;
REVOKE EXECUTE ON FUNCTION public.portal_save_draft_revision(uuid,text) FROM PUBLIC,anon,authenticated;
REVOKE EXECUTE ON FUNCTION public.mp_wholesale_submit_order(uuid,integer) FROM PUBLIC,anon,authenticated;
REVOKE EXECUTE ON FUNCTION public.mp_wholesale_accept_revision(uuid,integer) FROM PUBLIC,anon,authenticated;
REVOKE EXECUTE ON FUNCTION public.portal_submit_payment_evidence(uuid,uuid,numeric,text,text,text,text,text) FROM PUBLIC,anon,authenticated;
REVOKE EXECUTE ON FUNCTION public.portal_copy_deal(uuid,uuid,text,text) FROM PUBLIC,anon,authenticated;
REVOKE EXECUTE ON FUNCTION public.portal_update_draft_header(uuid,uuid,text,text,text) FROM PUBLIC,anon,authenticated;
REVOKE EXECUTE ON FUNCTION public.portal_remove_deal_line(uuid,uuid) FROM PUBLIC,anon,authenticated;
REVOKE EXECUTE ON FUNCTION public.portal_save_complete_look(uuid,uuid,uuid,jsonb,text) FROM PUBLIC,anon,authenticated;
REVOKE EXECUTE ON FUNCTION public.portal_submit_deal(uuid) FROM PUBLIC,anon,authenticated;
REVOKE EXECUTE ON FUNCTION public.portal_accept_brand_revision(uuid) FROM PUBLIC,anon,authenticated;
REVOKE EXECUTE ON FUNCTION public.copy_deal(uuid,uuid,text,text,text,uuid) FROM PUBLIC,anon,authenticated;
REVOKE EXECUTE ON FUNCTION public.capture_deal_revision(uuid,text,uuid,text,uuid,integer) FROM PUBLIC,anon,authenticated;

GRANT EXECUTE ON FUNCTION public.mp_client_snapshot_v2(text,uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.mp_client_issued_proformas_v2(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.mp_private_submit_order_v2(uuid,integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.mp_private_accept_revision_v2(uuid,integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.mp_private_submit_payment_evidence_v2(uuid,uuid,numeric,text,text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.mp_wholesale_create_order_v2(uuid,text,text,text,uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.mp_wholesale_set_deal_line_v2(uuid,uuid,uuid,integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.mp_wholesale_apply_size_run_v2(uuid,uuid,text,jsonb,text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.mp_wholesale_save_revision_v2(uuid,text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.mp_wholesale_submit_order_v2(uuid,integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.mp_wholesale_accept_revision_v2(uuid,integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.mp_wholesale_submit_payment_evidence_v2(uuid,uuid,numeric,text,text,text,text,text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.mp_wholesale_copy_order_v2(uuid,uuid,text,text) TO authenticated;

-- ---------------------------------------------------------------------------
-- 7) Assertions. Candidate must fail if any old browser bypass remains.
-- ---------------------------------------------------------------------------
DO $$
DECLARE fn text;
BEGIN
  FOREACH fn IN ARRAY ARRAY[
    'public.mp_client_snapshot(text,uuid)',
    'public.mp_client_issued_proformas(text)',
    'public.mp_private_submit_order(uuid,integer)',
    'public.mp_private_accept_revision(uuid,integer)',
    'public.mp_private_submit_payment_evidence(uuid,uuid,numeric,text,text)',
    'public.portal_create_draft_order(uuid,text,text,text,uuid)',
    'public.portal_set_deal_line(uuid,uuid,uuid,integer)',
    'public.portal_apply_size_run(uuid,uuid,text,jsonb,text)',
    'public.portal_save_draft_revision(uuid,text)',
    'public.mp_wholesale_submit_order(uuid,integer)',
    'public.mp_wholesale_accept_revision(uuid,integer)',
    'public.portal_submit_payment_evidence(uuid,uuid,numeric,text,text,text,text,text)',
    'public.portal_copy_deal(uuid,uuid,text,text)',
    'public.copy_deal(uuid,uuid,text,text,text,uuid)',
    'public.capture_deal_revision(uuid,text,uuid,text,uuid,integer)'
  ] LOOP
    IF has_function_privilege('authenticated',fn,'EXECUTE') OR has_function_privilege('anon',fn,'EXECUTE') THEN
      RAISE EXCEPTION 'v31_4_old_browser_bypass_still_executable_%',fn;
    END IF;
  END LOOP;

  IF NOT has_function_privilege('authenticated','public.mp_client_snapshot_v2(text,uuid)','EXECUTE')
     OR NOT has_function_privilege('authenticated','public.mp_wholesale_create_order_v2(uuid,text,text,text,uuid)','EXECUTE')
     OR NOT has_function_privilege('authenticated','public.mp_private_submit_order_v2(uuid,integer)','EXECUTE') THEN
    RAISE EXCEPTION 'v31_4_v2_browser_surface_missing';
  END IF;
END
$$;

SELECT jsonb_build_object(
  'gate','v31.4-internal-integrity-hardening',
  'production_deal_guard',true,
  'client_reads_production_only',true,
  'wholesale_create_explicit_production',true,
  'copy_preserves_production_via_facade',true,
  'reorder_data_class_provenance',true,
  'raw_browser_mutation_primitives_revoked',true,
  'default_browser_privileges_fail_closed',true,
  'production_mutated',false
) AS v31_4_hardening;

ROLLBACK;