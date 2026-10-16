\set ON_ERROR_STOP on

-- Assumes v31.4 -> v31.5 -> v31.6 -> v31.7 bodies are already applied inside one transaction.
-- Uses isolated IDs and forces deferred constraint triggers to validate same-transaction receipts.

-- Seed a production deal and line.
INSERT INTO public.deals(id,tenant_id,code,client_id,stage,currency,client_store_id,title,data_class)
VALUES('91000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000001','CI-EVT-1','30000000-0000-4000-8000-000000000001','draft','EUR','40000000-0000-4000-8000-000000000001','Event Integrity','production');
INSERT INTO public.deal_lines(id,tenant_id,deal_id,product_id,product_variant_id,style_snapshot,sku_snapshot,qty,unit_price,line_total)
VALUES('92000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000001','91000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000101','81000000-0000-4000-8000-000000000010','CI-MP-01','CI-EVT-V1',1,100,100);

-- 1) Cross-scope event insert must fail.
DO $$ BEGIN
  BEGIN
    INSERT INTO public.deal_events(tenant_id,deal_id,event_type,to_stage,payload)
    VALUES('00000000-0000-4000-8000-000000000001','ffffffff-ffff-4fff-8fff-ffffffffffff','bad_scope','draft','{}');
    RAISE EXCEPTION 'v31_7_deal_event_scope_guard_failed';
  EXCEPTION WHEN check_violation THEN NULL; END;
END $$;

-- 2) Deal stage change without event cannot be made immediate/committed.
DO $$ BEGIN
  BEGIN
    UPDATE public.deals SET stage='submitted' WHERE id='91000000-0000-4000-8000-000000000001';
    SET CONSTRAINTS trg_mp_deal_stage_receipt IMMEDIATE;
    RAISE EXCEPTION 'v31_7_missing_deal_receipt_guard_failed';
  EXCEPTION WHEN check_violation THEN NULL; END;
  SET CONSTRAINTS trg_mp_deal_stage_receipt DEFERRED;
END $$;

-- 3) Same transition with same-transaction event passes.
UPDATE public.deals SET stage='submitted' WHERE id='91000000-0000-4000-8000-000000000001';
INSERT INTO public.deal_events(tenant_id,deal_id,event_type,from_stage,to_stage,payload)
VALUES('00000000-0000-4000-8000-000000000001','91000000-0000-4000-8000-000000000001','order_submitted','draft','submitted','{}');
SET CONSTRAINTS trg_mp_deal_stage_receipt IMMEDIATE;
SET CONSTRAINTS trg_mp_deal_stage_receipt DEFERRED;

-- 4) Revision bridge produces an append-only deal event.
INSERT INTO public.deal_revisions(id,tenant_id,deal_id,revision_no,revision_type,actor_user_id,reason)
VALUES('93000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000001','91000000-0000-4000-8000-000000000001',1,'edit','20000000-0000-4000-8000-000000000003','CI revision');
DO $$ BEGIN
  IF NOT EXISTS(SELECT 1 FROM public.deal_events WHERE deal_id='91000000-0000-4000-8000-000000000001' AND event_type='revision_captured') THEN
    RAISE EXCEPTION 'v31_7_revision_bridge_missing';
  END IF;
END $$;

-- 5) Event history is immutable.
DO $$ BEGIN
  BEGIN
    UPDATE public.deal_events SET event_type='tampered' WHERE deal_id='91000000-0000-4000-8000-000000000001' AND event_type='revision_captured';
    RAISE EXCEPTION 'v31_7_event_immutability_failed';
  EXCEPTION WHEN object_not_in_prerequisite_state THEN NULL; END;
END $$;

-- 6) Payment status requires a same-transaction payment event and creates outbox on verified.
INSERT INTO public.proformas(id,tenant_id,deal_id,version,number,status,currency,amount,advance_amount,issued_at)
VALUES('94000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000001','91000000-0000-4000-8000-000000000001',1,'CI-EVT-PF','issued','EUR',100,100,now());
INSERT INTO public.payments(id,tenant_id,deal_id,proforma_id,payment_type,provider,external_reference,currency,amount,status)
VALUES('95000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000001','91000000-0000-4000-8000-000000000001','94000000-0000-4000-8000-000000000001','advance','bank','CI-EVT-PAY','EUR',100,'submitted');
INSERT INTO public.payment_events(tenant_id,payment_id,deal_id,proforma_id,event_type,from_status,to_status,actor_kind,payload)
VALUES('00000000-0000-4000-8000-000000000001','95000000-0000-4000-8000-000000000001','91000000-0000-4000-8000-000000000001','94000000-0000-4000-8000-000000000001','submitted',NULL,'submitted','buyer','{}');
SET CONSTRAINTS trg_mp_payment_receipt IMMEDIATE;
SET CONSTRAINTS trg_mp_payment_receipt DEFERRED;
UPDATE public.payments SET status='verified' WHERE id='95000000-0000-4000-8000-000000000001';
INSERT INTO public.payment_events(tenant_id,payment_id,deal_id,proforma_id,event_type,from_status,to_status,actor_kind,payload)
VALUES('00000000-0000-4000-8000-000000000001','95000000-0000-4000-8000-000000000001','91000000-0000-4000-8000-000000000001','94000000-0000-4000-8000-000000000001','verified','submitted','verified','finance','{}');
SET CONSTRAINTS trg_mp_payment_receipt IMMEDIATE;
SET CONSTRAINTS trg_mp_payment_receipt DEFERRED;
DO $$ BEGIN
  IF NOT EXISTS(SELECT 1 FROM public.outbox_events WHERE aggregate_id='95000000-0000-4000-8000-000000000001' AND event_type='payment.verified') THEN
    RAISE EXCEPTION 'v31_7_payment_outbox_missing';
  END IF;
END $$;

-- 7) Shipment event bridges into Deal event and outbox.
INSERT INTO public.shipments(id,tenant_id,deal_id,code,status,carrier)
VALUES('96000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000001','91000000-0000-4000-8000-000000000001','CI-EVT-SHIP','planned','CI');
UPDATE public.shipments SET status='packing' WHERE id='96000000-0000-4000-8000-000000000001';
INSERT INTO public.shipment_events(tenant_id,shipment_id,deal_id,event_type,payload)
VALUES('00000000-0000-4000-8000-000000000001','96000000-0000-4000-8000-000000000001','91000000-0000-4000-8000-000000000001','packing_started','{}');
SET CONSTRAINTS trg_mp_shipment_receipt IMMEDIATE;
SET CONSTRAINTS trg_mp_shipment_receipt DEFERRED;
UPDATE public.shipments SET status='in_transit' WHERE id='96000000-0000-4000-8000-000000000001';
INSERT INTO public.shipment_events(tenant_id,shipment_id,deal_id,event_type,payload)
VALUES('00000000-0000-4000-8000-000000000001','96000000-0000-4000-8000-000000000001','91000000-0000-4000-8000-000000000001','shipped','{}');
SET CONSTRAINTS trg_mp_shipment_receipt IMMEDIATE;
SET CONSTRAINTS trg_mp_shipment_receipt DEFERRED;
DO $$ BEGIN
  IF NOT EXISTS(SELECT 1 FROM public.deal_events WHERE deal_id='91000000-0000-4000-8000-000000000001' AND event_type='shipment_dispatched') THEN
    RAISE EXCEPTION 'v31_7_shipment_deal_bridge_missing';
  END IF;
  IF NOT EXISTS(SELECT 1 FROM public.outbox_events WHERE aggregate_id='96000000-0000-4000-8000-000000000001' AND event_type='shipment.shipped') THEN
    RAISE EXCEPTION 'v31_7_shipment_outbox_missing';
  END IF;
END $$;

-- 8) Reservation state requires matching event.
INSERT INTO public.inventory_positions(id,tenant_id,product_variant_id,location_code,on_hand,reserved,data_class)
VALUES('97000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000001','81000000-0000-4000-8000-000000000010','CI-EVT',1,1,'production');
INSERT INTO public.inventory_reservations(id,tenant_id,deal_id,deal_line_id,position_id,qty,status,created_by)
VALUES('98000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000001','91000000-0000-4000-8000-000000000001','92000000-0000-4000-8000-000000000001','97000000-0000-4000-8000-000000000001',1,'reserved','20000000-0000-4000-8000-000000000003');
INSERT INTO public.inventory_reservation_events(tenant_id,reservation_id,deal_id,deal_line_id,event_type,qty,payload)
VALUES('00000000-0000-4000-8000-000000000001','98000000-0000-4000-8000-000000000001','91000000-0000-4000-8000-000000000001','92000000-0000-4000-8000-000000000001','reserved',1,'{}');
SET CONSTRAINTS trg_mp_reservation_receipt IMMEDIATE;
SET CONSTRAINTS trg_mp_reservation_receipt DEFERRED;

-- 9) Reorder status is event-backed; legacy ordered state is fail-closed.
INSERT INTO public.reorder_proposals(id,tenant_id,client_id,client_store_id,status,currency)
VALUES('99000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000001','40000000-0000-4000-8000-000000000001','proposed','EUR');
INSERT INTO public.reorder_events(tenant_id,proposal_id,event_type,actor_kind,payload)
VALUES('00000000-0000-4000-8000-000000000001','99000000-0000-4000-8000-000000000001','created','system','{}');
SET CONSTRAINTS trg_mp_reorder_receipt IMMEDIATE;
SET CONSTRAINTS trg_mp_reorder_receipt DEFERRED;
DO $$ BEGIN
  BEGIN
    UPDATE public.reorder_proposals SET status='ordered' WHERE id='99000000-0000-4000-8000-000000000001';
    SET CONSTRAINTS trg_mp_reorder_receipt IMMEDIATE;
    RAISE EXCEPTION 'v31_7_legacy_ordered_state_guard_failed';
  EXCEPTION WHEN check_violation THEN NULL; END;
  SET CONSTRAINTS trg_mp_reorder_receipt DEFERRED;
END $$;

-- 10) Approval decision creates transactional outbox.
INSERT INTO public.approvals(id,tenant_id,deal_id,approval_type,required_role,status,version)
VALUES('9a000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000001','91000000-0000-4000-8000-000000000001','commercial','admin','pending',1);
INSERT INTO public.approval_events(tenant_id,approval_id,deal_id,action,payload)
VALUES('00000000-0000-4000-8000-000000000001','9a000000-0000-4000-8000-000000000001','91000000-0000-4000-8000-000000000001','requested','{}');
SET CONSTRAINTS trg_mp_approval_receipt IMMEDIATE;
SET CONSTRAINTS trg_mp_approval_receipt DEFERRED;
UPDATE public.approvals SET status='approved' WHERE id='9a000000-0000-4000-8000-000000000001';
INSERT INTO public.approval_events(tenant_id,approval_id,deal_id,action,payload)
VALUES('00000000-0000-4000-8000-000000000001','9a000000-0000-4000-8000-000000000001','91000000-0000-4000-8000-000000000001','approved','{}');
SET CONSTRAINTS trg_mp_approval_receipt IMMEDIATE;
SET CONSTRAINTS trg_mp_approval_receipt DEFERRED;
DO $$ BEGIN
  IF NOT EXISTS(SELECT 1 FROM public.outbox_events WHERE aggregate_id='9a000000-0000-4000-8000-000000000001' AND event_type='approval.approved') THEN
    RAISE EXCEPTION 'v31_7_approval_outbox_missing';
  END IF;
END $$;

SELECT jsonb_build_object(
  'gate','v31.7-event-execution-smoke',
  'event_relation_guards','PASS',
  'append_only_events','PASS',
  'deferred_deal_receipt','PASS',
  'deferred_payment_receipt','PASS',
  'deferred_shipment_receipt','PASS',
  'deferred_reservation_receipt','PASS',
  'deferred_reorder_receipt','PASS',
  'deferred_approval_receipt','PASS',
  'revision_bridge','PASS',
  'shipment_deal_bridge','PASS',
  'transactional_outbox','PASS',
  'legacy_ordered_state','BLOCKED'
) AS v31_7_event_execution_smoke;