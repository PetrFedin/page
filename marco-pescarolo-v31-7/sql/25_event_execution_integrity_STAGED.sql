\set ON_ERROR_STOP on

-- Marco Pescarolo v31.7 Event & Execution Integrity
-- STAGED ONLY. Rollback-safe. Must be admitted on isolated PostgreSQL 17 first.
BEGIN;

-- ---------------------------------------------------------------------------
-- 0) Preflight. Existing data must be internally coherent before guards exist.
-- ---------------------------------------------------------------------------
DO $$
DECLARE bad bigint;
BEGIN
  WITH checks AS (
    SELECT count(*)::bigint bad
    FROM public.deal_events e LEFT JOIN public.deals d ON d.id=e.deal_id
    WHERE d.id IS NULL OR e.tenant_id<>d.tenant_id
    UNION ALL
    SELECT count(*) FROM public.payment_events e
    LEFT JOIN public.payments p ON p.id=e.payment_id
    LEFT JOIN public.deals d ON d.id=e.deal_id
    LEFT JOIN public.proformas f ON f.id=e.proforma_id
    WHERE p.id IS NULL OR d.id IS NULL OR p.deal_id<>e.deal_id OR p.tenant_id<>e.tenant_id OR d.tenant_id<>e.tenant_id
       OR (e.proforma_id IS NOT NULL AND (f.id IS NULL OR f.deal_id<>e.deal_id OR f.tenant_id<>e.tenant_id))
    UNION ALL
    SELECT count(*) FROM public.shipment_events e
    LEFT JOIN public.shipments s ON s.id=e.shipment_id
    LEFT JOIN public.deals d ON d.id=e.deal_id
    WHERE s.id IS NULL OR d.id IS NULL OR s.deal_id<>e.deal_id OR s.tenant_id<>e.tenant_id OR d.tenant_id<>e.tenant_id
    UNION ALL
    SELECT count(*) FROM public.inventory_reservation_events e
    LEFT JOIN public.inventory_reservations r ON r.id=e.reservation_id
    LEFT JOIN public.deal_lines dl ON dl.id=e.deal_line_id
    WHERE r.id IS NULL OR dl.id IS NULL OR r.deal_id<>e.deal_id OR r.deal_line_id<>e.deal_line_id
       OR r.tenant_id<>e.tenant_id OR dl.tenant_id<>e.tenant_id
    UNION ALL
    SELECT count(*) FROM public.reorder_events e LEFT JOIN public.reorder_proposals p ON p.id=e.proposal_id
    WHERE p.id IS NULL OR p.tenant_id<>e.tenant_id
  ) SELECT coalesce(sum(checks.bad),0) INTO bad FROM checks;
  IF bad<>0 THEN RAISE EXCEPTION 'v31_7_event_preflight_bad_rows_%',bad; END IF;
END $$;

-- ---------------------------------------------------------------------------
-- 1) Append-only event history. Outbox is intentionally mutable by a worker.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION private.mp_event_immutable_guard()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN
  RAISE EXCEPTION 'event_log_is_append_only_%',TG_TABLE_NAME USING ERRCODE='55000';
END $$;
REVOKE ALL ON FUNCTION private.mp_event_immutable_guard() FROM PUBLIC,anon,authenticated;

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['deal_events','approval_events','payment_events','shipment_events','inventory_reservation_events','reorder_events','audit_log'] LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS trg_mp_event_immutable ON public.%I',t);
    EXECUTE format('CREATE TRIGGER trg_mp_event_immutable BEFORE UPDATE OR DELETE ON public.%I FOR EACH ROW EXECUTE FUNCTION private.mp_event_immutable_guard()',t);
  END LOOP;
END $$;

-- ---------------------------------------------------------------------------
-- 2) Cross-scope event relation guards.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION private.mp_deal_event_relation_guard()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN
  IF NOT EXISTS(SELECT 1 FROM public.deals d WHERE d.id=NEW.deal_id AND d.tenant_id=NEW.tenant_id) THEN
    RAISE EXCEPTION 'deal_event_scope_invalid' USING ERRCODE='23514';
  END IF;
  IF NEW.actor_user_id IS NOT NULL AND NOT EXISTS(SELECT 1 FROM public.users u WHERE u.id=NEW.actor_user_id AND u.tenant_id=NEW.tenant_id) THEN
    RAISE EXCEPTION 'deal_event_actor_scope_invalid' USING ERRCODE='23514';
  END IF;
  RETURN NEW;
END $$;

CREATE OR REPLACE FUNCTION private.mp_approval_event_relation_guard()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN
  IF NOT EXISTS(
    SELECT 1 FROM public.approvals a JOIN public.deals d ON d.id=a.deal_id
    WHERE a.id=NEW.approval_id AND a.tenant_id=NEW.tenant_id AND a.deal_id=NEW.deal_id AND d.tenant_id=NEW.tenant_id
  ) THEN RAISE EXCEPTION 'approval_event_scope_invalid' USING ERRCODE='23514'; END IF;
  IF NEW.actor_user_id IS NOT NULL AND NOT EXISTS(SELECT 1 FROM public.users u WHERE u.id=NEW.actor_user_id AND u.tenant_id=NEW.tenant_id) THEN
    RAISE EXCEPTION 'approval_event_actor_scope_invalid' USING ERRCODE='23514';
  END IF;
  RETURN NEW;
END $$;

CREATE OR REPLACE FUNCTION private.mp_payment_event_relation_guard()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN
  IF NOT EXISTS(
    SELECT 1 FROM public.payments p JOIN public.deals d ON d.id=p.deal_id
    LEFT JOIN public.proformas f ON f.id=NEW.proforma_id
    WHERE p.id=NEW.payment_id AND p.tenant_id=NEW.tenant_id AND p.deal_id=NEW.deal_id AND d.tenant_id=NEW.tenant_id
      AND (NEW.proforma_id IS NULL OR (f.id IS NOT NULL AND f.tenant_id=NEW.tenant_id AND f.deal_id=NEW.deal_id))
  ) THEN RAISE EXCEPTION 'payment_event_scope_invalid' USING ERRCODE='23514'; END IF;
  IF NEW.actor_user_id IS NOT NULL AND NOT EXISTS(SELECT 1 FROM public.users u WHERE u.id=NEW.actor_user_id AND u.tenant_id=NEW.tenant_id) THEN
    RAISE EXCEPTION 'payment_event_actor_scope_invalid' USING ERRCODE='23514';
  END IF;
  RETURN NEW;
END $$;

CREATE OR REPLACE FUNCTION private.mp_shipment_event_relation_guard()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN
  IF NOT EXISTS(
    SELECT 1 FROM public.shipments s JOIN public.deals d ON d.id=s.deal_id
    WHERE s.id=NEW.shipment_id AND s.tenant_id=NEW.tenant_id AND s.deal_id=NEW.deal_id AND d.tenant_id=NEW.tenant_id
  ) THEN RAISE EXCEPTION 'shipment_event_scope_invalid' USING ERRCODE='23514'; END IF;
  RETURN NEW;
END $$;

CREATE OR REPLACE FUNCTION private.mp_reservation_event_relation_guard()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN
  IF NOT EXISTS(
    SELECT 1 FROM public.inventory_reservations r JOIN public.deal_lines dl ON dl.id=r.deal_line_id
    WHERE r.id=NEW.reservation_id AND r.tenant_id=NEW.tenant_id AND r.deal_id=NEW.deal_id
      AND r.deal_line_id=NEW.deal_line_id AND dl.tenant_id=NEW.tenant_id AND dl.deal_id=NEW.deal_id
  ) THEN RAISE EXCEPTION 'reservation_event_scope_invalid' USING ERRCODE='23514'; END IF;
  IF NEW.actor_user_id IS NOT NULL AND NOT EXISTS(SELECT 1 FROM public.users u WHERE u.id=NEW.actor_user_id AND u.tenant_id=NEW.tenant_id) THEN
    RAISE EXCEPTION 'reservation_event_actor_scope_invalid' USING ERRCODE='23514';
  END IF;
  RETURN NEW;
END $$;

CREATE OR REPLACE FUNCTION private.mp_reorder_event_relation_guard()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN
  IF NOT EXISTS(SELECT 1 FROM public.reorder_proposals p WHERE p.id=NEW.proposal_id AND p.tenant_id=NEW.tenant_id) THEN
    RAISE EXCEPTION 'reorder_event_scope_invalid' USING ERRCODE='23514';
  END IF;
  IF NEW.actor_user_id IS NOT NULL AND NOT EXISTS(SELECT 1 FROM public.users u WHERE u.id=NEW.actor_user_id AND u.tenant_id=NEW.tenant_id) THEN
    RAISE EXCEPTION 'reorder_event_actor_scope_invalid' USING ERRCODE='23514';
  END IF;
  RETURN NEW;
END $$;

REVOKE ALL ON FUNCTION private.mp_deal_event_relation_guard() FROM PUBLIC,anon,authenticated;
REVOKE ALL ON FUNCTION private.mp_approval_event_relation_guard() FROM PUBLIC,anon,authenticated;
REVOKE ALL ON FUNCTION private.mp_payment_event_relation_guard() FROM PUBLIC,anon,authenticated;
REVOKE ALL ON FUNCTION private.mp_shipment_event_relation_guard() FROM PUBLIC,anon,authenticated;
REVOKE ALL ON FUNCTION private.mp_reservation_event_relation_guard() FROM PUBLIC,anon,authenticated;
REVOKE ALL ON FUNCTION private.mp_reorder_event_relation_guard() FROM PUBLIC,anon,authenticated;

DROP TRIGGER IF EXISTS trg_mp_deal_event_relation ON public.deal_events;
CREATE TRIGGER trg_mp_deal_event_relation BEFORE INSERT ON public.deal_events FOR EACH ROW EXECUTE FUNCTION private.mp_deal_event_relation_guard();
DROP TRIGGER IF EXISTS trg_mp_approval_event_relation ON public.approval_events;
CREATE TRIGGER trg_mp_approval_event_relation BEFORE INSERT ON public.approval_events FOR EACH ROW EXECUTE FUNCTION private.mp_approval_event_relation_guard();
DROP TRIGGER IF EXISTS trg_mp_payment_event_relation ON public.payment_events;
CREATE TRIGGER trg_mp_payment_event_relation BEFORE INSERT ON public.payment_events FOR EACH ROW EXECUTE FUNCTION private.mp_payment_event_relation_guard();
DROP TRIGGER IF EXISTS trg_mp_shipment_event_relation ON public.shipment_events;
CREATE TRIGGER trg_mp_shipment_event_relation BEFORE INSERT ON public.shipment_events FOR EACH ROW EXECUTE FUNCTION private.mp_shipment_event_relation_guard();
DROP TRIGGER IF EXISTS trg_mp_reservation_event_relation ON public.inventory_reservation_events;
CREATE TRIGGER trg_mp_reservation_event_relation BEFORE INSERT ON public.inventory_reservation_events FOR EACH ROW EXECUTE FUNCTION private.mp_reservation_event_relation_guard();
DROP TRIGGER IF EXISTS trg_mp_reorder_event_relation ON public.reorder_events;
CREATE TRIGGER trg_mp_reorder_event_relation BEFORE INSERT ON public.reorder_events FOR EACH ROW EXECUTE FUNCTION private.mp_reorder_event_relation_guard();

-- ---------------------------------------------------------------------------
-- 3) Bridges for technical operations that already have authoritative evidence.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION private.mp_revision_to_deal_event()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE d public.deals%ROWTYPE;
BEGIN
  SELECT * INTO d FROM public.deals WHERE id=NEW.deal_id;
  INSERT INTO public.deal_events(tenant_id,deal_id,event_type,from_stage,to_stage,actor_user_id,payload)
  VALUES(NEW.tenant_id,NEW.deal_id,'revision_captured',d.stage,d.stage,NEW.actor_user_id,
    jsonb_build_object('revision_id',NEW.id,'revision_no',NEW.revision_no,'revision_type',NEW.revision_type,'reason',NEW.reason));
  RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION private.mp_revision_to_deal_event() FROM PUBLIC,anon,authenticated;
DROP TRIGGER IF EXISTS trg_mp_revision_to_deal_event ON public.deal_revisions;
CREATE TRIGGER trg_mp_revision_to_deal_event AFTER INSERT ON public.deal_revisions FOR EACH ROW EXECUTE FUNCTION private.mp_revision_to_deal_event();

CREATE OR REPLACE FUNCTION private.mp_shipment_event_to_deal_event()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE d public.deals%ROWTYPE; v_type text;
BEGIN
  IF NEW.event_type NOT IN ('packing_started','shipped','delivered') THEN RETURN NEW; END IF;
  SELECT * INTO d FROM public.deals WHERE id=NEW.deal_id;
  v_type:=CASE NEW.event_type WHEN 'packing_started' THEN 'shipment_packing_started' WHEN 'shipped' THEN 'shipment_dispatched' ELSE 'delivery_completed' END;
  IF NOT EXISTS(
    SELECT 1 FROM public.deal_events e
    WHERE e.deal_id=NEW.deal_id AND e.tenant_id=NEW.tenant_id
      AND e.payload->>'shipment_event_id'=NEW.id::text
  ) THEN
    INSERT INTO public.deal_events(tenant_id,deal_id,event_type,from_stage,to_stage,payload)
    VALUES(NEW.tenant_id,NEW.deal_id,v_type,NULL,d.stage,
      jsonb_build_object('shipment_id',NEW.shipment_id,'shipment_event_id',NEW.id,'source','shipment_event_bridge'));
  END IF;
  RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION private.mp_shipment_event_to_deal_event() FROM PUBLIC,anon,authenticated;
DROP TRIGGER IF EXISTS trg_mp_shipment_event_to_deal_event ON public.shipment_events;
CREATE TRIGGER trg_mp_shipment_event_to_deal_event AFTER INSERT ON public.shipment_events FOR EACH ROW EXECUTE FUNCTION private.mp_shipment_event_to_deal_event();

-- ---------------------------------------------------------------------------
-- 4) Deferred same-transaction execution receipts.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION private.mp_require_deal_stage_receipt()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN
  IF NEW.data_class='production' AND OLD.stage IS DISTINCT FROM NEW.stage THEN
    IF NOT EXISTS(
      SELECT 1 FROM public.deal_events e
      WHERE e.deal_id=NEW.id AND e.tenant_id=NEW.tenant_id AND e.to_stage=NEW.stage
        AND e.xmin::text=pg_current_xact_id()::text
    ) THEN RAISE EXCEPTION 'deal_stage_without_same_tx_event_%_%',OLD.stage,NEW.stage USING ERRCODE='23514'; END IF;
  END IF;
  RETURN NEW;
END $$;

CREATE OR REPLACE FUNCTION private.mp_require_payment_receipt()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN
  IF (TG_OP='INSERT' AND NEW.status='submitted') OR (TG_OP='UPDATE' AND OLD.status IS DISTINCT FROM NEW.status) THEN
    IF NOT EXISTS(
      SELECT 1 FROM public.payment_events e
      WHERE e.payment_id=NEW.id AND e.tenant_id=NEW.tenant_id AND e.to_status=NEW.status
        AND e.xmin::text=pg_current_xact_id()::text
    ) THEN RAISE EXCEPTION 'payment_state_without_same_tx_event_%',NEW.status USING ERRCODE='23514'; END IF;
  END IF;
  RETURN NEW;
END $$;

CREATE OR REPLACE FUNCTION private.mp_require_shipment_receipt()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE expected text;
BEGIN
  IF TG_OP='UPDATE' AND OLD.status IS DISTINCT FROM NEW.status AND NEW.status IN ('packing','in_transit','delivered') THEN
    expected:=CASE NEW.status WHEN 'packing' THEN 'packing_started' WHEN 'in_transit' THEN 'shipped' ELSE 'delivered' END;
    IF NOT EXISTS(
      SELECT 1 FROM public.shipment_events e
      WHERE e.shipment_id=NEW.id AND e.tenant_id=NEW.tenant_id AND e.event_type=expected
        AND e.xmin::text=pg_current_xact_id()::text
    ) THEN RAISE EXCEPTION 'shipment_state_without_same_tx_event_%',NEW.status USING ERRCODE='23514'; END IF;
  END IF;
  RETURN NEW;
END $$;

CREATE OR REPLACE FUNCTION private.mp_require_reservation_receipt()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN
  IF TG_OP='INSERT' OR (TG_OP='UPDATE' AND OLD.status IS DISTINCT FROM NEW.status) THEN
    IF NEW.status IN ('reserved','released','consumed','expired') AND NOT EXISTS(
      SELECT 1 FROM public.inventory_reservation_events e
      WHERE e.reservation_id=NEW.id AND e.tenant_id=NEW.tenant_id AND e.event_type=NEW.status
        AND e.xmin::text=pg_current_xact_id()::text
    ) THEN RAISE EXCEPTION 'reservation_state_without_same_tx_event_%',NEW.status USING ERRCODE='23514'; END IF;
  END IF;
  RETURN NEW;
END $$;

CREATE OR REPLACE FUNCTION private.mp_require_approval_receipt()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE expected text;
BEGIN
  IF TG_OP='INSERT' THEN expected:='requested';
  ELSIF OLD.status IS DISTINCT FROM NEW.status AND NEW.status IN ('approved','rejected','waived') THEN expected:=NEW.status;
  ELSE RETURN NEW; END IF;
  IF NOT EXISTS(
    SELECT 1 FROM public.approval_events e
    WHERE e.approval_id=NEW.id AND e.tenant_id=NEW.tenant_id AND e.action=expected
      AND e.xmin::text=pg_current_xact_id()::text
  ) THEN RAISE EXCEPTION 'approval_state_without_same_tx_event_%',NEW.status USING ERRCODE='23514'; END IF;
  RETURN NEW;
END $$;

CREATE OR REPLACE FUNCTION private.mp_require_reorder_receipt()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE expected text;
BEGIN
  IF NEW.status='ordered' THEN RAISE EXCEPTION 'reorder_ordered_state_unadmitted' USING ERRCODE='23514'; END IF;
  IF TG_OP='INSERT' THEN
    IF NEW.status='draft' THEN RETURN NEW; END IF;
    expected:=CASE NEW.status WHEN 'proposed' THEN 'created' ELSE NEW.status END;
  ELSIF OLD.status IS DISTINCT FROM NEW.status THEN
    IF NEW.status='draft' THEN RETURN NEW; END IF;
    expected:=CASE NEW.status WHEN 'proposed' THEN 'created' ELSE NEW.status END;
  ELSE RETURN NEW; END IF;
  IF expected NOT IN ('created','reviewed','buyer_approved','brand_approved','rejected','converted','invoiced','allocated','shipped','expired') THEN
    RAISE EXCEPTION 'reorder_state_without_event_contract_%',NEW.status USING ERRCODE='23514';
  END IF;
  IF NOT EXISTS(
    SELECT 1 FROM public.reorder_events e
    WHERE e.proposal_id=NEW.id AND e.tenant_id=NEW.tenant_id AND e.event_type=expected
      AND e.xmin::text=pg_current_xact_id()::text
  ) THEN RAISE EXCEPTION 'reorder_state_without_same_tx_event_%',NEW.status USING ERRCODE='23514'; END IF;
  RETURN NEW;
END $$;

REVOKE ALL ON FUNCTION private.mp_require_deal_stage_receipt() FROM PUBLIC,anon,authenticated;
REVOKE ALL ON FUNCTION private.mp_require_payment_receipt() FROM PUBLIC,anon,authenticated;
REVOKE ALL ON FUNCTION private.mp_require_shipment_receipt() FROM PUBLIC,anon,authenticated;
REVOKE ALL ON FUNCTION private.mp_require_reservation_receipt() FROM PUBLIC,anon,authenticated;
REVOKE ALL ON FUNCTION private.mp_require_approval_receipt() FROM PUBLIC,anon,authenticated;
REVOKE ALL ON FUNCTION private.mp_require_reorder_receipt() FROM PUBLIC,anon,authenticated;

DROP TRIGGER IF EXISTS trg_mp_deal_stage_receipt ON public.deals;
CREATE CONSTRAINT TRIGGER trg_mp_deal_stage_receipt AFTER UPDATE ON public.deals DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW EXECUTE FUNCTION private.mp_require_deal_stage_receipt();
DROP TRIGGER IF EXISTS trg_mp_payment_receipt ON public.payments;
CREATE CONSTRAINT TRIGGER trg_mp_payment_receipt AFTER INSERT OR UPDATE ON public.payments DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW EXECUTE FUNCTION private.mp_require_payment_receipt();
DROP TRIGGER IF EXISTS trg_mp_shipment_receipt ON public.shipments;
CREATE CONSTRAINT TRIGGER trg_mp_shipment_receipt AFTER UPDATE ON public.shipments DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW EXECUTE FUNCTION private.mp_require_shipment_receipt();
DROP TRIGGER IF EXISTS trg_mp_reservation_receipt ON public.inventory_reservations;
CREATE CONSTRAINT TRIGGER trg_mp_reservation_receipt AFTER INSERT OR UPDATE ON public.inventory_reservations DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW EXECUTE FUNCTION private.mp_require_reservation_receipt();
DROP TRIGGER IF EXISTS trg_mp_approval_receipt ON public.approvals;
CREATE CONSTRAINT TRIGGER trg_mp_approval_receipt AFTER INSERT OR UPDATE ON public.approvals DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW EXECUTE FUNCTION private.mp_require_approval_receipt();
DROP TRIGGER IF EXISTS trg_mp_reorder_receipt ON public.reorder_proposals;
CREATE CONSTRAINT TRIGGER trg_mp_reorder_receipt AFTER INSERT OR UPDATE ON public.reorder_proposals DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW EXECUTE FUNCTION private.mp_require_reorder_receipt();

-- ---------------------------------------------------------------------------
-- 5) Transactional outbox producer for high-value business events only.
--    Consumer/dispatcher remains a separate release gate.
-- ---------------------------------------------------------------------------
CREATE UNIQUE INDEX IF NOT EXISTS uq_v317_outbox_source_event
ON public.outbox_events((payload->>'source_table'),(payload->>'source_event_id'))
WHERE payload ? 'source_table' AND payload ? 'source_event_id';

CREATE OR REPLACE FUNCTION private.mp_event_to_outbox()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE v_event_type text; v_aggregate_type text; v_aggregate_id uuid; v_payload jsonb;
BEGIN
  IF TG_TABLE_NAME='approval_events' THEN
    IF NEW.action NOT IN ('approved','rejected','waived') THEN RETURN NEW; END IF;
    v_event_type:='approval.'||NEW.action; v_aggregate_type:='approval'; v_aggregate_id:=NEW.approval_id;
    v_payload:=jsonb_build_object('deal_id',NEW.deal_id,'action',NEW.action,'actor_user_id',NEW.actor_user_id,'reason',NEW.reason);
  ELSIF TG_TABLE_NAME='payment_events' THEN
    IF NEW.event_type NOT IN ('verified','rejected','reversed') THEN RETURN NEW; END IF;
    v_event_type:='payment.'||NEW.event_type; v_aggregate_type:='payment'; v_aggregate_id:=NEW.payment_id;
    v_payload:=jsonb_build_object('deal_id',NEW.deal_id,'proforma_id',NEW.proforma_id,'to_status',NEW.to_status,'actor_user_id',NEW.actor_user_id);
  ELSIF TG_TABLE_NAME='shipment_events' THEN
    IF NEW.event_type NOT IN ('shipped','delivered') THEN RETURN NEW; END IF;
    v_event_type:='shipment.'||NEW.event_type; v_aggregate_type:='shipment'; v_aggregate_id:=NEW.shipment_id;
    v_payload:=jsonb_build_object('deal_id',NEW.deal_id,'event_type',NEW.event_type);
  ELSIF TG_TABLE_NAME='reorder_events' THEN
    IF NEW.event_type NOT IN ('brand_approved','converted','rejected') THEN RETURN NEW; END IF;
    v_event_type:='reorder.'||NEW.event_type; v_aggregate_type:='reorder_proposal'; v_aggregate_id:=NEW.proposal_id;
    v_payload:=jsonb_build_object('event_type',NEW.event_type,'actor_user_id',NEW.actor_user_id,'reason',NEW.reason);
  ELSE RETURN NEW; END IF;

  INSERT INTO public.outbox_events(tenant_id,event_type,aggregate_type,aggregate_id,payload)
  VALUES(NEW.tenant_id,v_event_type,v_aggregate_type,v_aggregate_id,
    v_payload||jsonb_build_object('source_table',TG_TABLE_NAME,'source_event_id',NEW.id::text))
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION private.mp_event_to_outbox() FROM PUBLIC,anon,authenticated;

DROP TRIGGER IF EXISTS trg_mp_approval_event_outbox ON public.approval_events;
CREATE TRIGGER trg_mp_approval_event_outbox AFTER INSERT ON public.approval_events FOR EACH ROW EXECUTE FUNCTION private.mp_event_to_outbox();
DROP TRIGGER IF EXISTS trg_mp_payment_event_outbox ON public.payment_events;
CREATE TRIGGER trg_mp_payment_event_outbox AFTER INSERT ON public.payment_events FOR EACH ROW EXECUTE FUNCTION private.mp_event_to_outbox();
DROP TRIGGER IF EXISTS trg_mp_shipment_event_outbox ON public.shipment_events;
CREATE TRIGGER trg_mp_shipment_event_outbox AFTER INSERT ON public.shipment_events FOR EACH ROW EXECUTE FUNCTION private.mp_event_to_outbox();
DROP TRIGGER IF EXISTS trg_mp_reorder_event_outbox ON public.reorder_events;
CREATE TRIGGER trg_mp_reorder_event_outbox AFTER INSERT ON public.reorder_events FOR EACH ROW EXECUTE FUNCTION private.mp_event_to_outbox();

-- ---------------------------------------------------------------------------
-- 6) Admin read-only execution integrity surface.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION private.mp_admin_execution_integrity_snapshot_internal()
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path='' AS $$
DECLARE a public.mp_brand_admin_memberships%ROWTYPE; v_rel bigint; v_missing bigint; v_outbox jsonb;
BEGIN
  a:=private.mp_brand_admin_actor();
  IF COALESCE(auth.jwt()->>'aal','')<>'aal2' THEN RAISE EXCEPTION 'admin_mfa_required' USING ERRCODE='42501'; END IF;

  WITH checks AS (
    SELECT count(*)::bigint bad FROM public.deal_events e LEFT JOIN public.deals d ON d.id=e.deal_id WHERE d.id IS NULL OR e.tenant_id<>d.tenant_id
    UNION ALL SELECT count(*) FROM public.payment_events e LEFT JOIN public.payments p ON p.id=e.payment_id WHERE p.id IS NULL OR p.tenant_id<>e.tenant_id OR p.deal_id<>e.deal_id
    UNION ALL SELECT count(*) FROM public.shipment_events e LEFT JOIN public.shipments s ON s.id=e.shipment_id WHERE s.id IS NULL OR s.tenant_id<>e.tenant_id OR s.deal_id<>e.deal_id
    UNION ALL SELECT count(*) FROM public.reorder_events e LEFT JOIN public.reorder_proposals p ON p.id=e.proposal_id WHERE p.id IS NULL OR p.tenant_id<>e.tenant_id
  ) SELECT coalesce(sum(bad),0) INTO v_rel FROM checks;

  WITH checks AS (
    SELECT count(*)::bigint bad FROM public.payments p WHERE p.status IN ('verified','rejected','reversed') AND NOT EXISTS(SELECT 1 FROM public.payment_events e WHERE e.payment_id=p.id AND e.to_status=p.status)
    UNION ALL SELECT count(*) FROM public.shipments s WHERE s.status IN ('packing','in_transit','delivered') AND NOT EXISTS(SELECT 1 FROM public.shipment_events e WHERE e.shipment_id=s.id AND e.event_type=CASE s.status WHEN 'packing' THEN 'packing_started' WHEN 'in_transit' THEN 'shipped' ELSE 'delivered' END)
    UNION ALL SELECT count(*) FROM public.reorder_proposals p WHERE p.status IN ('proposed','reviewed','buyer_approved','brand_approved','rejected','converted','invoiced','allocated','shipped','expired') AND NOT EXISTS(SELECT 1 FROM public.reorder_events e WHERE e.proposal_id=p.id AND e.event_type=CASE p.status WHEN 'proposed' THEN 'created' ELSE p.status END)
  ) SELECT coalesce(sum(bad),0) INTO v_missing FROM checks;

  SELECT jsonb_build_object(
    'pending',count(*) FILTER(WHERE status='pending'),
    'processing',count(*) FILTER(WHERE status='processing'),
    'failed',count(*) FILTER(WHERE status='failed'),
    'dead_letter',count(*) FILTER(WHERE status='dead_letter'),
    'oldest_pending_at',min(created_at) FILTER(WHERE status='pending')
  ) INTO v_outbox FROM public.outbox_events WHERE tenant_id=a.tenant_id;

  RETURN jsonb_build_object(
    'tenant_id',a.tenant_id,
    'event_relation_violations',v_rel,
    'missing_execution_receipts',v_missing,
    'outbox',v_outbox,
    'outbox_consumer','NOT_QUALIFIED',
    'legacy_reorder_ordered_state','UNADMITTED'
  );
END $$;
REVOKE ALL ON FUNCTION private.mp_admin_execution_integrity_snapshot_internal() FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION private.mp_admin_execution_integrity_snapshot_internal() TO authenticated;

CREATE OR REPLACE FUNCTION public.mp_admin_execution_integrity_snapshot()
RETURNS jsonb LANGUAGE sql SECURITY INVOKER SET search_path='pg_catalog','public','private' AS $$
  SELECT private.mp_admin_execution_integrity_snapshot_internal();
$$;
REVOKE ALL ON FUNCTION public.mp_admin_execution_integrity_snapshot() FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.mp_admin_execution_integrity_snapshot() TO authenticated;

ROLLBACK;