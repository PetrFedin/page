\set ON_ERROR_STOP on

-- Marco Pescarolo v31.6 Relation & Concurrency Integrity
-- STAGED ONLY. The file is rollback-safe and MUST be admitted on an isolated PG17 clone before production.

BEGIN;

-- ---------------------------------------------------------------------------
-- 0) Preflight: existing data must already satisfy the new one-to-one/race
--    barriers. Never hide bad data behind a unique index creation failure.
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS(SELECT 1 FROM public.portal_memberships WHERE status='active' GROUP BY auth_user_id,access_role HAVING count(*)>1) THEN
    RAISE EXCEPTION 'v31_6_duplicate_active_portal_role_preflight';
  END IF;
  IF EXISTS(SELECT 1 FROM public.mp_brand_admin_memberships WHERE status='active' GROUP BY auth_user_id HAVING count(*)>1) THEN
    RAISE EXCEPTION 'v31_6_duplicate_active_brand_admin_preflight';
  END IF;
  IF EXISTS(SELECT 1 FROM public.shipments GROUP BY tenant_id,code HAVING count(*)>1) THEN
    RAISE EXCEPTION 'v31_6_duplicate_shipment_code_preflight';
  END IF;
  IF EXISTS(SELECT 1 FROM public.delivery_receipts WHERE receipt_type='carrier_pod' GROUP BY shipment_id HAVING count(*)>1) THEN
    RAISE EXCEPTION 'v31_6_duplicate_carrier_pod_preflight';
  END IF;
  IF EXISTS(SELECT 1 FROM public.deal_lines WHERE product_variant_id IS NOT NULL GROUP BY deal_id,product_variant_id HAVING count(*)>1) THEN
    RAISE EXCEPTION 'v31_6_duplicate_deal_variant_preflight';
  END IF;
  IF EXISTS(SELECT 1 FROM public.deals WHERE source_reorder_proposal_id IS NOT NULL GROUP BY source_reorder_proposal_id HAVING count(*)>1) THEN
    RAISE EXCEPTION 'v31_6_duplicate_reorder_conversion_preflight';
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- 1) Database-level concurrency barriers.
--    These close check-then-insert races and remove ambiguous role resolution.
-- ---------------------------------------------------------------------------
CREATE UNIQUE INDEX IF NOT EXISTS uq_v316_portal_active_role
  ON public.portal_memberships(auth_user_id,access_role)
  WHERE status='active';

CREATE UNIQUE INDEX IF NOT EXISTS uq_v316_brand_admin_active
  ON public.mp_brand_admin_memberships(auth_user_id)
  WHERE status='active';

CREATE UNIQUE INDEX IF NOT EXISTS uq_v316_shipment_code
  ON public.shipments(tenant_id,code);

CREATE UNIQUE INDEX IF NOT EXISTS uq_v316_carrier_pod
  ON public.delivery_receipts(shipment_id)
  WHERE receipt_type='carrier_pod';

CREATE UNIQUE INDEX IF NOT EXISTS uq_v316_deal_variant_line
  ON public.deal_lines(deal_id,product_variant_id)
  WHERE product_variant_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_v316_reorder_conversion
  ON public.deals(source_reorder_proposal_id)
  WHERE source_reorder_proposal_id IS NOT NULL;

-- ---------------------------------------------------------------------------
-- 2) Fail closed instead of LIMIT 1 ambiguity.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION private.require_portal_role(p_role text)
RETURNS public.portal_memberships
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path=''
AS $$
DECLARE
  m public.portal_memberships%ROWTYPE;
  n integer;
BEGIN
  IF auth.uid() IS NULL OR COALESCE((auth.jwt()->>'is_anonymous')::boolean,false) THEN
    RAISE EXCEPTION 'portal_login_required' USING ERRCODE='42501';
  END IF;

  SELECT count(*) INTO n
  FROM public.portal_memberships pm
  WHERE pm.auth_user_id=auth.uid() AND pm.access_role=p_role AND pm.status='active';

  IF n=0 THEN
    RAISE EXCEPTION 'portal_role_required' USING ERRCODE='42501';
  ELSIF n>1 THEN
    RAISE EXCEPTION 'portal_role_ambiguous' USING ERRCODE='23514';
  END IF;

  SELECT * INTO STRICT m
  FROM public.portal_memberships pm
  WHERE pm.auth_user_id=auth.uid() AND pm.access_role=p_role AND pm.status='active';
  RETURN m;
END;
$$;
REVOKE ALL ON FUNCTION private.require_portal_role(text) FROM PUBLIC,anon,authenticated;

CREATE OR REPLACE FUNCTION private.mp_brand_admin_actor()
RETURNS public.mp_brand_admin_memberships
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path=''
AS $$
DECLARE
  m public.mp_brand_admin_memberships%ROWTYPE;
  n integer;
BEGIN
  IF auth.uid() IS NULL OR COALESCE((auth.jwt()->>'is_anonymous')::boolean,false) THEN
    RAISE EXCEPTION 'brand_admin_login_required' USING ERRCODE='42501';
  END IF;

  SELECT count(*) INTO n
  FROM public.mp_brand_admin_memberships x
  JOIN public.tenants t ON t.id=x.tenant_id AND t.slug='marco-pescarolo' AND t.status='active'
  JOIN public.users u ON u.id=x.public_user_id AND u.tenant_id=x.tenant_id
    AND u.is_active=true AND u.role IN ('owner','admin')
  WHERE x.auth_user_id=auth.uid() AND x.status='active';

  IF n=0 THEN
    RAISE EXCEPTION 'brand_admin_membership_required' USING ERRCODE='42501';
  ELSIF n>1 THEN
    RAISE EXCEPTION 'brand_admin_membership_ambiguous' USING ERRCODE='23514';
  END IF;

  SELECT x.* INTO STRICT m
  FROM public.mp_brand_admin_memberships x
  JOIN public.tenants t ON t.id=x.tenant_id AND t.slug='marco-pescarolo' AND t.status='active'
  JOIN public.users u ON u.id=x.public_user_id AND u.tenant_id=x.tenant_id
    AND u.is_active=true AND u.role IN ('owner','admin')
  WHERE x.auth_user_id=auth.uid() AND x.status='active';
  RETURN m;
END;
$$;
REVOKE ALL ON FUNCTION private.mp_brand_admin_actor() FROM PUBLIC,anon,authenticated;

-- ---------------------------------------------------------------------------
-- 3) Cross-table relationship guards. FKs prove existence, these guards prove
--    tenant/client/store/product semantic consistency.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION private.mp_portal_membership_relation_guard()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE c public.clients%ROWTYPE; s public.client_stores%ROWTYPE; u public.users%ROWTYPE;
BEGIN
  IF NOT EXISTS(SELECT 1 FROM auth.users au WHERE au.id=NEW.auth_user_id) THEN
    RAISE EXCEPTION 'membership_auth_user_missing' USING ERRCODE='23514';
  END IF;
  SELECT * INTO u FROM public.users WHERE id=NEW.public_user_id;
  SELECT * INTO c FROM public.clients WHERE id=NEW.client_id;
  IF NOT FOUND OR u.id IS NULL OR u.tenant_id<>NEW.tenant_id OR c.tenant_id<>NEW.tenant_id THEN
    RAISE EXCEPTION 'membership_tenant_relation_invalid' USING ERRCODE='23514';
  END IF;
  IF NEW.access_role='private_client' THEN
    IF c.client_type<>'private' OR NEW.client_store_id IS NOT NULL THEN
      RAISE EXCEPTION 'private_membership_scope_invalid' USING ERRCODE='23514';
    END IF;
  ELSIF NEW.access_role='buyer' THEN
    IF c.client_type<>'wholesale' THEN RAISE EXCEPTION 'buyer_membership_client_type_invalid' USING ERRCODE='23514'; END IF;
  ELSE
    RAISE EXCEPTION 'membership_role_unsupported' USING ERRCODE='23514';
  END IF;
  IF NEW.client_store_id IS NOT NULL THEN
    SELECT * INTO s FROM public.client_stores WHERE id=NEW.client_store_id;
    IF NOT FOUND OR s.tenant_id<>NEW.tenant_id OR s.client_id<>NEW.client_id OR NOT s.is_active THEN
      RAISE EXCEPTION 'membership_store_relation_invalid' USING ERRCODE='23514';
    END IF;
  END IF;
  RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION private.mp_portal_membership_relation_guard() FROM PUBLIC,anon,authenticated;
DROP TRIGGER IF EXISTS trg_mp_portal_membership_relation_guard ON public.portal_memberships;
CREATE TRIGGER trg_mp_portal_membership_relation_guard
BEFORE INSERT OR UPDATE OF tenant_id,auth_user_id,public_user_id,client_id,client_store_id,access_role,status
ON public.portal_memberships FOR EACH ROW EXECUTE FUNCTION private.mp_portal_membership_relation_guard();

CREATE OR REPLACE FUNCTION private.mp_brand_admin_membership_relation_guard()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE u public.users%ROWTYPE;
BEGIN
  IF NOT EXISTS(SELECT 1 FROM auth.users au WHERE au.id=NEW.auth_user_id) THEN
    RAISE EXCEPTION 'brand_admin_auth_user_missing' USING ERRCODE='23514';
  END IF;
  SELECT * INTO u FROM public.users WHERE id=NEW.public_user_id;
  IF NOT FOUND OR u.tenant_id<>NEW.tenant_id OR NOT u.is_active OR u.role NOT IN ('owner','admin') THEN
    RAISE EXCEPTION 'brand_admin_public_user_invalid' USING ERRCODE='23514';
  END IF;
  IF NOT EXISTS(SELECT 1 FROM public.tenants t WHERE t.id=NEW.tenant_id AND t.status='active') THEN
    RAISE EXCEPTION 'brand_admin_tenant_invalid' USING ERRCODE='23514';
  END IF;
  RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION private.mp_brand_admin_membership_relation_guard() FROM PUBLIC,anon,authenticated;
DROP TRIGGER IF EXISTS trg_mp_brand_admin_membership_relation_guard ON public.mp_brand_admin_memberships;
CREATE TRIGGER trg_mp_brand_admin_membership_relation_guard
BEFORE INSERT OR UPDATE OF tenant_id,auth_user_id,public_user_id,status
ON public.mp_brand_admin_memberships FOR EACH ROW EXECUTE FUNCTION private.mp_brand_admin_membership_relation_guard();

CREATE OR REPLACE FUNCTION private.mp_deal_relation_guard()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE c public.clients%ROWTYPE; s public.client_stores%ROWTYPE;
BEGIN
  SELECT * INTO c FROM public.clients WHERE id=NEW.client_id;
  IF NOT FOUND OR c.tenant_id<>NEW.tenant_id THEN
    RAISE EXCEPTION 'deal_client_relation_invalid' USING ERRCODE='23514';
  END IF;
  IF NEW.client_store_id IS NOT NULL THEN
    SELECT * INTO s FROM public.client_stores WHERE id=NEW.client_store_id;
    IF NOT FOUND OR s.tenant_id<>NEW.tenant_id OR s.client_id<>NEW.client_id OR NOT s.is_active THEN
      RAISE EXCEPTION 'deal_store_relation_invalid' USING ERRCODE='23514';
    END IF;
  END IF;
  RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION private.mp_deal_relation_guard() FROM PUBLIC,anon,authenticated;
DROP TRIGGER IF EXISTS trg_mp_deal_relation_guard ON public.deals;
CREATE TRIGGER trg_mp_deal_relation_guard
BEFORE INSERT OR UPDATE OF tenant_id,client_id,client_store_id ON public.deals
FOR EACH ROW EXECUTE FUNCTION private.mp_deal_relation_guard();

CREATE OR REPLACE FUNCTION private.mp_deal_line_relation_guard()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE d public.deals%ROWTYPE; p public.products%ROWTYPE; v public.product_variants%ROWTYPE;
BEGIN
  IF NEW.qty<=0 THEN RAISE EXCEPTION 'deal_line_qty_must_be_positive' USING ERRCODE='23514'; END IF;
  SELECT * INTO d FROM public.deals WHERE id=NEW.deal_id;
  SELECT * INTO p FROM public.products WHERE id=NEW.product_id;
  IF d.id IS NULL OR p.id IS NULL OR d.tenant_id<>NEW.tenant_id OR p.tenant_id<>NEW.tenant_id THEN
    RAISE EXCEPTION 'deal_line_parent_relation_invalid' USING ERRCODE='23514';
  END IF;
  IF NEW.product_variant_id IS NOT NULL THEN
    SELECT * INTO v FROM public.product_variants WHERE id=NEW.product_variant_id;
    IF NOT FOUND OR v.tenant_id<>NEW.tenant_id OR v.product_id<>NEW.product_id THEN
      RAISE EXCEPTION 'deal_line_variant_relation_invalid' USING ERRCODE='23514';
    END IF;
  END IF;
  RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION private.mp_deal_line_relation_guard() FROM PUBLIC,anon,authenticated;
DROP TRIGGER IF EXISTS trg_mp_deal_line_relation_guard ON public.deal_lines;
CREATE TRIGGER trg_mp_deal_line_relation_guard
BEFORE INSERT OR UPDATE OF tenant_id,deal_id,product_id,product_variant_id,qty ON public.deal_lines
FOR EACH ROW EXECUTE FUNCTION private.mp_deal_line_relation_guard();

CREATE OR REPLACE FUNCTION private.mp_payment_relation_guard()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE d public.deals%ROWTYPE; pf public.proformas%ROWTYPE; u public.users%ROWTYPE;
BEGIN
  IF NEW.amount<=0 THEN RAISE EXCEPTION 'payment_amount_must_be_positive' USING ERRCODE='23514'; END IF;
  SELECT * INTO d FROM public.deals WHERE id=NEW.deal_id;
  IF NOT FOUND OR d.tenant_id<>NEW.tenant_id OR d.currency<>NEW.currency THEN
    RAISE EXCEPTION 'payment_deal_relation_invalid' USING ERRCODE='23514';
  END IF;
  IF NEW.proforma_id IS NOT NULL THEN
    SELECT * INTO pf FROM public.proformas WHERE id=NEW.proforma_id;
    IF NOT FOUND OR pf.deal_id<>NEW.deal_id OR pf.tenant_id<>NEW.tenant_id OR pf.currency<>NEW.currency THEN
      RAISE EXCEPTION 'payment_proforma_relation_invalid' USING ERRCODE='23514';
    END IF;
  END IF;
  IF NEW.status='verified' AND (NEW.verified_at IS NULL OR NEW.verified_by IS NULL) THEN
    RAISE EXCEPTION 'verified_payment_requires_verifier' USING ERRCODE='23514';
  END IF;
  IF NEW.verified_by IS NOT NULL THEN
    SELECT * INTO u FROM public.users WHERE id=NEW.verified_by;
    IF NOT FOUND OR u.tenant_id<>NEW.tenant_id THEN
      RAISE EXCEPTION 'payment_verifier_relation_invalid' USING ERRCODE='23514';
    END IF;
  END IF;
  RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION private.mp_payment_relation_guard() FROM PUBLIC,anon,authenticated;
DROP TRIGGER IF EXISTS trg_mp_payment_relation_guard ON public.payments;
CREATE TRIGGER trg_mp_payment_relation_guard
BEFORE INSERT OR UPDATE OF tenant_id,deal_id,proforma_id,currency,amount,status,verified_at,verified_by ON public.payments
FOR EACH ROW EXECUTE FUNCTION private.mp_payment_relation_guard();

CREATE OR REPLACE FUNCTION private.mp_shipment_relation_guard()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE d public.deals%ROWTYPE;
BEGIN
  IF btrim(coalesce(NEW.code,''))='' THEN RAISE EXCEPTION 'shipment_code_required' USING ERRCODE='23514'; END IF;
  SELECT * INTO d FROM public.deals WHERE id=NEW.deal_id;
  IF NOT FOUND OR d.tenant_id<>NEW.tenant_id THEN
    RAISE EXCEPTION 'shipment_deal_relation_invalid' USING ERRCODE='23514';
  END IF;
  RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION private.mp_shipment_relation_guard() FROM PUBLIC,anon,authenticated;
DROP TRIGGER IF EXISTS trg_mp_shipment_relation_guard ON public.shipments;
CREATE TRIGGER trg_mp_shipment_relation_guard
BEFORE INSERT OR UPDATE OF tenant_id,deal_id,code ON public.shipments
FOR EACH ROW EXECUTE FUNCTION private.mp_shipment_relation_guard();

CREATE OR REPLACE FUNCTION private.mp_shipment_line_relation_guard()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE sh public.shipments%ROWTYPE; dl public.deal_lines%ROWTYPE; r public.inventory_reservations%ROWTYPE; v public.product_variants%ROWTYPE;
BEGIN
  IF NEW.qty<=0 THEN RAISE EXCEPTION 'shipment_line_qty_must_be_positive' USING ERRCODE='23514'; END IF;
  SELECT * INTO sh FROM public.shipments WHERE id=NEW.shipment_id;
  SELECT * INTO dl FROM public.deal_lines WHERE id=NEW.deal_line_id;
  SELECT * INTO r FROM public.inventory_reservations WHERE id=NEW.reservation_id;
  SELECT * INTO v FROM public.product_variants WHERE id=NEW.product_variant_id;
  IF sh.id IS NULL OR dl.id IS NULL OR r.id IS NULL OR v.id IS NULL
     OR sh.tenant_id<>NEW.tenant_id OR sh.deal_id<>NEW.deal_id
     OR dl.tenant_id<>NEW.tenant_id OR dl.deal_id<>NEW.deal_id
     OR r.tenant_id<>NEW.tenant_id OR r.deal_id<>NEW.deal_id OR r.deal_line_id<>NEW.deal_line_id
     OR dl.product_variant_id IS DISTINCT FROM NEW.product_variant_id
     OR v.tenant_id<>NEW.tenant_id OR r.qty<NEW.qty THEN
    RAISE EXCEPTION 'shipment_line_relation_invalid' USING ERRCODE='23514';
  END IF;
  RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION private.mp_shipment_line_relation_guard() FROM PUBLIC,anon,authenticated;
DROP TRIGGER IF EXISTS trg_mp_shipment_line_relation_guard ON public.shipment_lines;
CREATE TRIGGER trg_mp_shipment_line_relation_guard
BEFORE INSERT OR UPDATE OF tenant_id,shipment_id,deal_id,deal_line_id,reservation_id,product_variant_id,qty ON public.shipment_lines
FOR EACH ROW EXECUTE FUNCTION private.mp_shipment_line_relation_guard();

CREATE OR REPLACE FUNCTION private.mp_delivery_receipt_relation_guard()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE sh public.shipments%ROWTYPE; u public.users%ROWTYPE;
BEGIN
  SELECT * INTO sh FROM public.shipments WHERE id=NEW.shipment_id;
  IF NOT FOUND OR sh.tenant_id<>NEW.tenant_id OR sh.deal_id<>NEW.deal_id THEN
    RAISE EXCEPTION 'delivery_receipt_shipment_relation_invalid' USING ERRCODE='23514';
  END IF;
  IF NEW.actor_user_id IS NOT NULL THEN
    SELECT * INTO u FROM public.users WHERE id=NEW.actor_user_id;
    IF NOT FOUND OR u.tenant_id<>NEW.tenant_id THEN
      RAISE EXCEPTION 'delivery_receipt_actor_relation_invalid' USING ERRCODE='23514';
    END IF;
  END IF;
  RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION private.mp_delivery_receipt_relation_guard() FROM PUBLIC,anon,authenticated;
DROP TRIGGER IF EXISTS trg_mp_delivery_receipt_relation_guard ON public.delivery_receipts;
CREATE TRIGGER trg_mp_delivery_receipt_relation_guard
BEFORE INSERT OR UPDATE OF tenant_id,shipment_id,deal_id,actor_user_id ON public.delivery_receipts
FOR EACH ROW EXECUTE FUNCTION private.mp_delivery_receipt_relation_guard();

CREATE OR REPLACE FUNCTION private.mp_reorder_proposal_relation_guard()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE c public.clients%ROWTYPE; s public.client_stores%ROWTYPE; d public.deals%ROWTYPE;
BEGIN
  SELECT * INTO c FROM public.clients WHERE id=NEW.client_id;
  IF NOT FOUND OR c.tenant_id<>NEW.tenant_id OR c.client_type<>'wholesale' THEN
    RAISE EXCEPTION 'reorder_client_relation_invalid' USING ERRCODE='23514';
  END IF;
  IF NEW.client_store_id IS NOT NULL THEN
    SELECT * INTO s FROM public.client_stores WHERE id=NEW.client_store_id;
    IF NOT FOUND OR s.tenant_id<>NEW.tenant_id OR s.client_id<>NEW.client_id OR NOT s.is_active THEN
      RAISE EXCEPTION 'reorder_store_relation_invalid' USING ERRCODE='23514';
    END IF;
  END IF;
  IF NEW.converted_deal_id IS NOT NULL THEN
    SELECT * INTO d FROM public.deals WHERE id=NEW.converted_deal_id;
    IF NOT FOUND OR d.tenant_id<>NEW.tenant_id OR d.client_id<>NEW.client_id OR d.source_reorder_proposal_id IS DISTINCT FROM NEW.id THEN
      RAISE EXCEPTION 'reorder_conversion_relation_invalid' USING ERRCODE='23514';
    END IF;
  END IF;
  RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION private.mp_reorder_proposal_relation_guard() FROM PUBLIC,anon,authenticated;
DROP TRIGGER IF EXISTS trg_mp_reorder_proposal_relation_guard ON public.reorder_proposals;
CREATE TRIGGER trg_mp_reorder_proposal_relation_guard
BEFORE INSERT OR UPDATE OF tenant_id,client_id,client_store_id,converted_deal_id ON public.reorder_proposals
FOR EACH ROW EXECUTE FUNCTION private.mp_reorder_proposal_relation_guard();

CREATE OR REPLACE FUNCTION private.mp_reorder_line_relation_guard()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE rp public.reorder_proposals%ROWTYPE; p public.products%ROWTYPE; v public.product_variants%ROWTYPE;
BEGIN
  SELECT * INTO rp FROM public.reorder_proposals WHERE id=NEW.proposal_id;
  SELECT * INTO p FROM public.products WHERE id=NEW.product_id;
  IF rp.id IS NULL OR p.id IS NULL OR rp.tenant_id<>NEW.tenant_id OR p.tenant_id<>NEW.tenant_id THEN
    RAISE EXCEPTION 'reorder_line_parent_relation_invalid' USING ERRCODE='23514';
  END IF;
  IF NEW.product_variant_id IS NOT NULL THEN
    SELECT * INTO v FROM public.product_variants WHERE id=NEW.product_variant_id;
    IF NOT FOUND OR v.tenant_id<>NEW.tenant_id OR v.product_id<>NEW.product_id THEN
      RAISE EXCEPTION 'reorder_line_variant_relation_invalid' USING ERRCODE='23514';
    END IF;
  END IF;
  RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION private.mp_reorder_line_relation_guard() FROM PUBLIC,anon,authenticated;
DROP TRIGGER IF EXISTS trg_mp_reorder_line_relation_guard ON public.reorder_lines;
CREATE TRIGGER trg_mp_reorder_line_relation_guard
BEFORE INSERT OR UPDATE OF tenant_id,proposal_id,product_id,product_variant_id ON public.reorder_lines
FOR EACH ROW EXECUTE FUNCTION private.mp_reorder_line_relation_guard();

-- ---------------------------------------------------------------------------
-- 4) Structural assertions. No browser grants are introduced by this layer.
-- ---------------------------------------------------------------------------
DO $$
DECLARE n integer;
BEGIN
  SELECT count(*) INTO n FROM pg_trigger
  WHERE tgname IN (
    'trg_mp_portal_membership_relation_guard','trg_mp_brand_admin_membership_relation_guard',
    'trg_mp_deal_relation_guard','trg_mp_deal_line_relation_guard','trg_mp_payment_relation_guard',
    'trg_mp_shipment_relation_guard','trg_mp_shipment_line_relation_guard','trg_mp_delivery_receipt_relation_guard',
    'trg_mp_reorder_proposal_relation_guard','trg_mp_reorder_line_relation_guard'
  ) AND NOT tgisinternal;
  IF n<>10 THEN RAISE EXCEPTION 'v31_6_relation_trigger_count_%',n; END IF;

  IF has_function_privilege('anon','private.require_portal_role(text)','EXECUTE')
     OR has_function_privilege('authenticated','private.require_portal_role(text)','EXECUTE')
     OR has_function_privilege('anon','private.mp_brand_admin_actor()','EXECUTE')
     OR has_function_privilege('authenticated','private.mp_brand_admin_actor()','EXECUTE') THEN
    RAISE EXCEPTION 'v31_6_private_authority_function_exposed';
  END IF;
END $$;

SELECT jsonb_build_object(
  'gate','v31.6-relation-concurrency-hardening',
  'production_mutated',false,
  'race_barriers',6,
  'relation_guards',10,
  'ambiguous_role_resolution','fail_closed',
  'speculative_performance_indexes_added',0
) AS v31_6_candidate;

ROLLBACK;