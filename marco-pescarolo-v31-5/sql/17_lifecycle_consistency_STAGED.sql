\set ON_ERROR_STOP on

-- Marco Pescarolo v31.5 Lifecycle Consistency candidate.
-- STAGED ONLY. Exact production Supabase is not modified by this file.
-- Purpose:
--   1) centralize fulfilment coverage calculations,
--   2) fail closed when a production deal tries to enter an impossible critical stage,
--   3) expose a read-only Admin integrity snapshot.

BEGIN;

CREATE OR REPLACE FUNCTION private.mp_deal_fulfillment_coverage(p_deal_id uuid)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path=''
AS $$
WITH line_coverage AS (
  SELECT
    dl.id AS deal_line_id,
    dl.product_variant_id,
    dl.qty AS ordered_qty,
    COALESCE((
      SELECT sum(sl.qty)
      FROM public.shipment_lines sl
      JOIN public.shipments sh ON sh.id=sl.shipment_id
      WHERE sl.deal_line_id=dl.id
        AND sl.deal_id=dl.deal_id
        AND sl.status<>'cancelled'
        AND sh.status<>'cancelled'
    ),0)::bigint AS assigned_qty,
    COALESCE((
      SELECT sum(sl.qty)
      FROM public.shipment_lines sl
      JOIN public.shipments sh ON sh.id=sl.shipment_id
      WHERE sl.deal_line_id=dl.id
        AND sl.deal_id=dl.deal_id
        AND sl.status IN ('shipped','delivered')
        AND sh.status IN ('in_transit','picked_up','delivered')
    ),0)::bigint AS shipped_qty,
    COALESCE((
      SELECT sum(sl.qty)
      FROM public.shipment_lines sl
      JOIN public.shipments sh ON sh.id=sl.shipment_id
      WHERE sl.deal_line_id=dl.id
        AND sl.deal_id=dl.deal_id
        AND sl.status='delivered'
        AND sh.status='delivered'
        AND EXISTS (
          SELECT 1 FROM public.delivery_receipts pod
          WHERE pod.shipment_id=sh.id
            AND pod.deal_id=dl.deal_id
            AND pod.tenant_id=dl.tenant_id
            AND pod.receipt_type='carrier_pod'
        )
    ),0)::bigint AS delivered_qty
  FROM public.deal_lines dl
  WHERE dl.deal_id=p_deal_id
), agg AS (
  SELECT
    count(*)::bigint AS line_count,
    COALESCE(sum(ordered_qty),0)::bigint AS ordered_units,
    COALESCE(sum(assigned_qty),0)::bigint AS assigned_units,
    COALESCE(sum(shipped_qty),0)::bigint AS shipped_units,
    COALESCE(sum(delivered_qty),0)::bigint AS delivered_units,
    COALESCE(bool_and(assigned_qty=ordered_qty),false) AND count(*)>0 AS all_assigned,
    COALESCE(bool_and(shipped_qty=ordered_qty),false) AND count(*)>0 AS all_shipped,
    COALESCE(bool_and(delivered_qty=ordered_qty),false) AND count(*)>0 AS all_delivered,
    COALESCE(bool_or(assigned_qty>ordered_qty),false) AS over_assigned,
    COALESCE(bool_or(shipped_qty>ordered_qty),false) AS over_shipped,
    COALESCE(bool_or(delivered_qty>ordered_qty),false) AS over_delivered,
    COALESCE(jsonb_agg(jsonb_build_object(
      'deal_line_id',deal_line_id,
      'variant_id',product_variant_id,
      'ordered_qty',ordered_qty,
      'assigned_qty',assigned_qty,
      'shipped_qty',shipped_qty,
      'delivered_qty',delivered_qty,
      'open_to_assign',greatest(ordered_qty-assigned_qty,0),
      'open_to_ship',greatest(ordered_qty-shipped_qty,0),
      'open_to_deliver',greatest(ordered_qty-delivered_qty,0)
    ) ORDER BY deal_line_id),'[]'::jsonb) AS lines
  FROM line_coverage
)
SELECT jsonb_build_object(
  'deal_id',p_deal_id,
  'line_count',line_count,
  'ordered_units',ordered_units,
  'assigned_units',assigned_units,
  'shipped_units',shipped_units,
  'delivered_units',delivered_units,
  'all_assigned',all_assigned,
  'all_shipped',all_shipped,
  'all_delivered',all_delivered,
  'over_assigned',over_assigned,
  'over_shipped',over_shipped,
  'over_delivered',over_delivered,
  'lines',lines
) FROM agg;
$$;

REVOKE ALL ON FUNCTION private.mp_deal_fulfillment_coverage(uuid) FROM PUBLIC,anon,authenticated;

CREATE OR REPLACE FUNCTION private.mp_deal_stage_invariant_guard()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path=''
AS $$
DECLARE
  v_cov jsonb;
  v_verified numeric:=0;
  v_required numeric:=0;
  v_bad_reservation boolean:=false;
BEGIN
  -- Demo/synthetic fixtures intentionally remain outside production authority.
  IF NEW.data_class<>'production' OR NEW.stage IS NOT DISTINCT FROM OLD.stage THEN
    RETURN NEW;
  END IF;

  IF NEW.stage='proforma_issued' THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.proformas p
      WHERE p.deal_id=NEW.id AND p.tenant_id=NEW.tenant_id
        AND p.status='issued' AND p.currency=NEW.currency
        AND p.amount=NEW.total_amount
    ) THEN
      RAISE EXCEPTION 'production_stage_guard: issued proforma matching order amount/currency required'
        USING ERRCODE='23514';
    END IF;
  ELSIF NEW.stage='advance_confirmed' THEN
    v_required:=CASE WHEN COALESCE(NEW.advance_required,0)>0
      THEN NEW.advance_required ELSE NEW.total_amount END;
    SELECT COALESCE(sum(p.amount),0) INTO v_verified
    FROM public.payments p
    WHERE p.deal_id=NEW.id AND p.tenant_id=NEW.tenant_id
      AND p.status='verified'
      AND COALESCE(p.payment_type,'advance') IN ('advance','balance');
    IF NEW.total_amount<=0 OR v_verified<v_required OR NEW.advance_confirmed<v_required THEN
      RAISE EXCEPTION 'production_stage_guard: verified funds required before advance_confirmed'
        USING ERRCODE='23514';
    END IF;
  ELSIF NEW.stage='allocated' THEN
    SELECT EXISTS(
      SELECT 1
      FROM public.deal_lines dl
      LEFT JOIN LATERAL (
        SELECT COALESCE(sum(r.qty),0)::bigint qty
        FROM public.inventory_reservations r
        WHERE r.deal_line_id=dl.id AND r.deal_id=NEW.id AND r.tenant_id=NEW.tenant_id
          AND r.status='reserved'
      ) x ON true
      WHERE dl.deal_id=NEW.id AND x.qty<>dl.qty
    ) INTO v_bad_reservation;
    IF NOT EXISTS(SELECT 1 FROM public.deal_lines dl WHERE dl.deal_id=NEW.id)
       OR v_bad_reservation THEN
      RAISE EXCEPTION 'production_stage_guard: full variant-level reservation required before allocated'
        USING ERRCODE='23514';
    END IF;
  ELSIF NEW.stage='shipped' THEN
    v_cov:=private.mp_deal_fulfillment_coverage(NEW.id);
    IF COALESCE((v_cov->>'all_shipped')::boolean,false)=false
       OR COALESCE((v_cov->>'over_shipped')::boolean,false)=true THEN
      RAISE EXCEPTION 'production_stage_guard: complete non-over shipment coverage required before shipped'
        USING ERRCODE='23514';
    END IF;
  ELSIF NEW.stage='delivered' THEN
    v_cov:=private.mp_deal_fulfillment_coverage(NEW.id);
    IF COALESCE((v_cov->>'all_delivered')::boolean,false)=false
       OR COALESCE((v_cov->>'over_delivered')::boolean,false)=true THEN
      RAISE EXCEPTION 'production_stage_guard: complete POD-backed delivery coverage required before delivered'
        USING ERRCODE='23514';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION private.mp_deal_stage_invariant_guard() FROM PUBLIC,anon,authenticated;

DROP TRIGGER IF EXISTS trg_mp_deal_stage_invariant_guard ON public.deals;
CREATE TRIGGER trg_mp_deal_stage_invariant_guard
BEFORE UPDATE OF stage ON public.deals
FOR EACH ROW
EXECUTE FUNCTION private.mp_deal_stage_invariant_guard();

CREATE OR REPLACE FUNCTION public.mp_admin_integrity_snapshot()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path=''
AS $$
DECLARE
  a public.mp_brand_admin_memberships%ROWTYPE;
  v_summary jsonb;
  v_findings jsonb;
BEGIN
  a:=private.mp_brand_admin_actor();

  WITH prod AS (
    SELECT d.*,
           private.mp_deal_fulfillment_coverage(d.id) cov,
           COALESCE((SELECT sum(p.amount) FROM public.payments p
             WHERE p.deal_id=d.id AND p.tenant_id=d.tenant_id
               AND p.status='verified'
               AND COALESCE(p.payment_type,'advance') IN ('advance','balance')),0) verified_funds,
           CASE WHEN COALESCE(d.advance_required,0)>0 THEN d.advance_required ELSE d.total_amount END required_funds,
           NOT EXISTS(
             SELECT 1 FROM public.deal_lines dl
             LEFT JOIN LATERAL (
               SELECT COALESCE(sum(r.qty),0)::bigint qty
               FROM public.inventory_reservations r
               WHERE r.deal_line_id=dl.id AND r.deal_id=d.id AND r.tenant_id=d.tenant_id
                 AND r.status='reserved'
             ) x ON true
             WHERE dl.deal_id=d.id AND x.qty<>dl.qty
           ) AND EXISTS(SELECT 1 FROM public.deal_lines dl WHERE dl.deal_id=d.id) AS reservation_complete,
           EXISTS(SELECT 1 FROM public.proformas pf
             WHERE pf.deal_id=d.id AND pf.tenant_id=d.tenant_id
               AND pf.status='issued' AND pf.currency=d.currency AND pf.amount=d.total_amount) AS issued_proforma_ok
    FROM public.deals d
    WHERE d.tenant_id=a.tenant_id AND d.data_class='production'
  ), flags AS (
    SELECT *, ARRAY_REMOVE(ARRAY[
      CASE WHEN stage='proforma_issued' AND NOT issued_proforma_ok THEN 'PROFORMA_STAGE_WITHOUT_MATCHING_ISSUED_PROFORMA' END,
      CASE WHEN stage='advance_confirmed' AND (verified_funds<required_funds OR advance_confirmed<required_funds) THEN 'ADVANCE_CONFIRMED_WITHOUT_VERIFIED_FUNDS' END,
      CASE WHEN stage='allocated' AND NOT reservation_complete THEN 'ALLOCATED_WITHOUT_COMPLETE_RESERVATION' END,
      CASE WHEN stage='shipped' AND NOT COALESCE((cov->>'all_shipped')::boolean,false) THEN 'SHIPPED_WITHOUT_FULL_ORDER_COVERAGE' END,
      CASE WHEN stage='delivered' AND NOT COALESCE((cov->>'all_delivered')::boolean,false) THEN 'DELIVERED_WITHOUT_FULL_POD_COVERAGE' END,
      CASE WHEN COALESCE((cov->>'over_assigned')::boolean,false) OR COALESCE((cov->>'over_shipped')::boolean,false) OR COALESCE((cov->>'over_delivered')::boolean,false) THEN 'FULFILLMENT_OVER_COVERAGE' END,
      CASE WHEN stage='confirmed' THEN 'LEGACY_CONFIRMED_STAGE' END
    ],NULL) AS issues
    FROM prod
  )
  SELECT jsonb_build_object(
    'production_deals',count(*),
    'deals_with_integrity_findings',count(*) FILTER (WHERE cardinality(issues)>0),
    'shipped_without_full_coverage',count(*) FILTER (WHERE 'SHIPPED_WITHOUT_FULL_ORDER_COVERAGE'=ANY(issues)),
    'delivered_without_full_pod_coverage',count(*) FILTER (WHERE 'DELIVERED_WITHOUT_FULL_POD_COVERAGE'=ANY(issues)),
    'allocated_without_complete_reservation',count(*) FILTER (WHERE 'ALLOCATED_WITHOUT_COMPLETE_RESERVATION'=ANY(issues)),
    'advance_confirmed_without_verified_funds',count(*) FILTER (WHERE 'ADVANCE_CONFIRMED_WITHOUT_VERIFIED_FUNDS'=ANY(issues)),
    'proforma_stage_without_matching_issued_proforma',count(*) FILTER (WHERE 'PROFORMA_STAGE_WITHOUT_MATCHING_ISSUED_PROFORMA'=ANY(issues)),
    'fulfillment_over_coverage',count(*) FILTER (WHERE 'FULFILLMENT_OVER_COVERAGE'=ANY(issues)),
    'legacy_confirmed_stage',count(*) FILTER (WHERE 'LEGACY_CONFIRMED_STAGE'=ANY(issues))
  ) INTO v_summary FROM flags;

  WITH prod AS (
    SELECT d.*,
           private.mp_deal_fulfillment_coverage(d.id) cov,
           COALESCE((SELECT sum(p.amount) FROM public.payments p
             WHERE p.deal_id=d.id AND p.tenant_id=d.tenant_id
               AND p.status='verified'
               AND COALESCE(p.payment_type,'advance') IN ('advance','balance')),0) verified_funds,
           CASE WHEN COALESCE(d.advance_required,0)>0 THEN d.advance_required ELSE d.total_amount END required_funds,
           NOT EXISTS(
             SELECT 1 FROM public.deal_lines dl
             LEFT JOIN LATERAL (
               SELECT COALESCE(sum(r.qty),0)::bigint qty
               FROM public.inventory_reservations r
               WHERE r.deal_line_id=dl.id AND r.deal_id=d.id AND r.tenant_id=d.tenant_id
                 AND r.status='reserved'
             ) x ON true
             WHERE dl.deal_id=d.id AND x.qty<>dl.qty
           ) AND EXISTS(SELECT 1 FROM public.deal_lines dl WHERE dl.deal_id=d.id) AS reservation_complete,
           EXISTS(SELECT 1 FROM public.proformas pf
             WHERE pf.deal_id=d.id AND pf.tenant_id=d.tenant_id
               AND pf.status='issued' AND pf.currency=d.currency AND pf.amount=d.total_amount) AS issued_proforma_ok
    FROM public.deals d
    WHERE d.tenant_id=a.tenant_id AND d.data_class='production'
  ), flags AS (
    SELECT *, ARRAY_REMOVE(ARRAY[
      CASE WHEN stage='proforma_issued' AND NOT issued_proforma_ok THEN 'PROFORMA_STAGE_WITHOUT_MATCHING_ISSUED_PROFORMA' END,
      CASE WHEN stage='advance_confirmed' AND (verified_funds<required_funds OR advance_confirmed<required_funds) THEN 'ADVANCE_CONFIRMED_WITHOUT_VERIFIED_FUNDS' END,
      CASE WHEN stage='allocated' AND NOT reservation_complete THEN 'ALLOCATED_WITHOUT_COMPLETE_RESERVATION' END,
      CASE WHEN stage='shipped' AND NOT COALESCE((cov->>'all_shipped')::boolean,false) THEN 'SHIPPED_WITHOUT_FULL_ORDER_COVERAGE' END,
      CASE WHEN stage='delivered' AND NOT COALESCE((cov->>'all_delivered')::boolean,false) THEN 'DELIVERED_WITHOUT_FULL_POD_COVERAGE' END,
      CASE WHEN COALESCE((cov->>'over_assigned')::boolean,false) OR COALESCE((cov->>'over_shipped')::boolean,false) OR COALESCE((cov->>'over_delivered')::boolean,false) THEN 'FULFILLMENT_OVER_COVERAGE' END,
      CASE WHEN stage='confirmed' THEN 'LEGACY_CONFIRMED_STAGE' END
    ],NULL) AS issues
    FROM prod
  )
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'deal_id',id,'code',code,'stage',stage,'client_id',client_id,'store_id',client_store_id,
    'issues',issues,'coverage',cov,'verified_funds',verified_funds,'required_funds',required_funds
  ) ORDER BY updated_at DESC),'[]'::jsonb)
  INTO v_findings
  FROM (SELECT * FROM flags WHERE cardinality(issues)>0 ORDER BY updated_at DESC LIMIT 50) x;

  RETURN jsonb_build_object(
    'authority','postgresql',
    'scope','production_only',
    'tenant_id',a.tenant_id,
    'as_of',now(),
    'summary',v_summary,
    'findings',v_findings,
    'stage_model',jsonb_build_array('draft','selection','negotiation','submitted','approval_pending','approved','proforma_issued','advance_pending','advance_confirmed','allocated','fulfillment','shipped','delivered','closed','cancelled'),
    'legacy_stage','confirmed'
  );
END;
$$;

REVOKE ALL ON FUNCTION public.mp_admin_integrity_snapshot() FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.mp_admin_integrity_snapshot() TO authenticated;

SELECT jsonb_build_object(
  'gate','v31.5-lifecycle-consistency',
  'production_mutated',false,
  'fulfillment_coverage_helper',true,
  'production_stage_guard',true,
  'admin_integrity_snapshot',true,
  'legacy_partial_ship_fail_closed',true,
  'legacy_partial_delivery_fail_closed',true
) AS v31_5_lifecycle_candidate;

ROLLBACK;