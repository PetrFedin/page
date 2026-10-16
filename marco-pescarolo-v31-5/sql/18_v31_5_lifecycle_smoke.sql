\set ON_ERROR_STOP on

-- Must run in one transaction after the body of 17_lifecycle_consistency_STAGED.sql is loaded.

-- Fixture: one production order with two units on two order lines.
INSERT INTO public.product_variants(id,tenant_id,product_id,sku,status)
VALUES
 ('81000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000101','CI-V1','active'),
 ('81000000-0000-4000-8000-000000000002','00000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000101','CI-V2','active');
INSERT INTO public.deals(id,tenant_id,code,client_id,stage,currency,client_store_id,title,data_class,current_revision,total_amount,advance_required,advance_confirmed)
VALUES('82000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000001','CI-LIFE-1','30000000-0000-4000-8000-000000000001','draft','EUR','40000000-0000-4000-8000-000000000001','Lifecycle CI','production',1,200,100,0);
INSERT INTO public.deal_lines(id,tenant_id,deal_id,product_id,product_variant_id,style_snapshot,sku_snapshot,qty,unit_price,line_total)
VALUES
 ('83000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000001','82000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000101','81000000-0000-4000-8000-000000000001','CI-MP-01','CI-V1',1,100,100),
 ('83000000-0000-4000-8000-000000000002','00000000-0000-4000-8000-000000000001','82000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000101','81000000-0000-4000-8000-000000000002','CI-MP-01','CI-V2',1,100,100);

-- 1) proforma_issued cannot be entered without an issued, matching proforma.
DO $$ BEGIN
  BEGIN
    UPDATE public.deals SET stage='proforma_issued' WHERE id='82000000-0000-4000-8000-000000000001';
    RAISE EXCEPTION 'v31_5_missing_proforma_guard_failed';
  EXCEPTION WHEN check_violation THEN NULL; END;
END $$;
INSERT INTO public.proformas(id,tenant_id,deal_id,version,number,status,currency,amount,advance_amount,balance_amount,issued_at)
VALUES('84000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000001','82000000-0000-4000-8000-000000000001',1,'CI-PF-1','issued','EUR',200,100,100,now());
UPDATE public.deals SET stage='proforma_issued' WHERE id='82000000-0000-4000-8000-000000000001';

-- 2) advance_confirmed requires verified funds and mirrored advance_confirmed amount.
UPDATE public.deals SET stage='advance_pending' WHERE id='82000000-0000-4000-8000-000000000001';
DO $$ BEGIN
  BEGIN
    UPDATE public.deals SET stage='advance_confirmed',advance_confirmed=100 WHERE id='82000000-0000-4000-8000-000000000001';
    RAISE EXCEPTION 'v31_5_unverified_funds_guard_failed';
  EXCEPTION WHEN check_violation THEN NULL; END;
END $$;
INSERT INTO public.payments(id,tenant_id,deal_id,proforma_id,payment_type,provider,external_reference,currency,amount,status,verified_at,verified_by)
VALUES('85000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000001','82000000-0000-4000-8000-000000000001','84000000-0000-4000-8000-000000000001','advance','bank','CI-PAY-1','EUR',100,'verified',now(),'20000000-0000-4000-8000-000000000003');
UPDATE public.deals SET stage='advance_confirmed',advance_confirmed=100 WHERE id='82000000-0000-4000-8000-000000000001';

-- 3) allocated requires exact active reservation coverage on every order line.
DO $$ BEGIN
  BEGIN
    UPDATE public.deals SET stage='allocated' WHERE id='82000000-0000-4000-8000-000000000001';
    RAISE EXCEPTION 'v31_5_incomplete_allocation_guard_failed';
  EXCEPTION WHEN check_violation THEN NULL; END;
END $$;
INSERT INTO public.inventory_positions(id,tenant_id,product_variant_id,location_code,on_hand,reserved,data_class)
VALUES
 ('86000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000001','81000000-0000-4000-8000-000000000001','NAP',10,1,'production'),
 ('86000000-0000-4000-8000-000000000002','00000000-0000-4000-8000-000000000001','81000000-0000-4000-8000-000000000002','NAP',10,1,'production');
INSERT INTO public.inventory_reservations(id,tenant_id,deal_id,deal_line_id,position_id,qty,status,created_by)
VALUES
 ('87000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000001','82000000-0000-4000-8000-000000000001','83000000-0000-4000-8000-000000000001','86000000-0000-4000-8000-000000000001',1,'reserved','20000000-0000-4000-8000-000000000003'),
 ('87000000-0000-4000-8000-000000000002','00000000-0000-4000-8000-000000000001','82000000-0000-4000-8000-000000000001','83000000-0000-4000-8000-000000000002','86000000-0000-4000-8000-000000000002',1,'reserved','20000000-0000-4000-8000-000000000003');
UPDATE public.deals SET stage='allocated' WHERE id='82000000-0000-4000-8000-000000000001';

-- 4) Partial shipment must NOT permit the production order to enter shipped.
INSERT INTO public.shipments(id,tenant_id,deal_id,code,status,carrier,tracking_number,shipped_at)
VALUES('88000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000001','82000000-0000-4000-8000-000000000001','CI-S1','in_transit','CI','TRK-1',now());
INSERT INTO public.shipment_lines(id,tenant_id,shipment_id,deal_id,deal_line_id,reservation_id,product_variant_id,qty,source_location_code,status,shipped_at)
VALUES('89000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000001','88000000-0000-4000-8000-000000000001','82000000-0000-4000-8000-000000000001','83000000-0000-4000-8000-000000000001','87000000-0000-4000-8000-000000000001','81000000-0000-4000-8000-000000000001',1,'NAP','shipped',now());
UPDATE public.deals SET stage='fulfillment' WHERE id='82000000-0000-4000-8000-000000000001';
DO $$ BEGIN
  BEGIN
    UPDATE public.deals SET stage='shipped' WHERE id='82000000-0000-4000-8000-000000000001';
    RAISE EXCEPTION 'v31_5_partial_shipped_guard_failed';
  EXCEPTION WHEN check_violation THEN NULL; END;
END $$;

-- Add the second shipped line: shipped becomes valid.
INSERT INTO public.shipments(id,tenant_id,deal_id,code,status,carrier,tracking_number,shipped_at)
VALUES('88000000-0000-4000-8000-000000000002','00000000-0000-4000-8000-000000000001','82000000-0000-4000-8000-000000000001','CI-S2','in_transit','CI','TRK-2',now());
INSERT INTO public.shipment_lines(id,tenant_id,shipment_id,deal_id,deal_line_id,reservation_id,product_variant_id,qty,source_location_code,status,shipped_at)
VALUES('89000000-0000-4000-8000-000000000002','00000000-0000-4000-8000-000000000001','88000000-0000-4000-8000-000000000002','82000000-0000-4000-8000-000000000001','83000000-0000-4000-8000-000000000002','87000000-0000-4000-8000-000000000002','81000000-0000-4000-8000-000000000002',1,'NAP','shipped',now());
UPDATE public.deals SET stage='shipped' WHERE id='82000000-0000-4000-8000-000000000001';

-- 5) Partial POD must NOT permit delivered. Full POD coverage does.
UPDATE public.shipments SET status='delivered',delivered_at=now() WHERE id='88000000-0000-4000-8000-000000000001';
UPDATE public.shipment_lines SET status='delivered',delivered_at=now() WHERE id='89000000-0000-4000-8000-000000000001';
INSERT INTO public.delivery_receipts(tenant_id,shipment_id,deal_id,receipt_type,external_reference,received_by,delivered_at,actor_user_id)
VALUES('00000000-0000-4000-8000-000000000001','88000000-0000-4000-8000-000000000001','82000000-0000-4000-8000-000000000001','carrier_pod','POD-ONE','Receiver',now(),'20000000-0000-4000-8000-000000000003');
DO $$ BEGIN
  BEGIN
    UPDATE public.deals SET stage='delivered' WHERE id='82000000-0000-4000-8000-000000000001';
    RAISE EXCEPTION 'v31_5_partial_delivery_guard_failed';
  EXCEPTION WHEN check_violation THEN NULL; END;
END $$;
UPDATE public.shipments SET status='delivered',delivered_at=now() WHERE id='88000000-0000-4000-8000-000000000002';
UPDATE public.shipment_lines SET status='delivered',delivered_at=now() WHERE id='89000000-0000-4000-8000-000000000002';
INSERT INTO public.delivery_receipts(tenant_id,shipment_id,deal_id,receipt_type,external_reference,received_by,delivered_at,actor_user_id)
VALUES('00000000-0000-4000-8000-000000000001','88000000-0000-4000-8000-000000000002','82000000-0000-4000-8000-000000000001','carrier_pod','POD-TWO','Receiver',now(),'20000000-0000-4000-8000-000000000003');
UPDATE public.deals SET stage='delivered' WHERE id='82000000-0000-4000-8000-000000000001';

-- 6) Coverage helper exact values.
DO $$ DECLARE c jsonb; BEGIN
  c:=private.mp_deal_fulfillment_coverage('82000000-0000-4000-8000-000000000001');
  IF (c->>'ordered_units')::int<>2 OR (c->>'shipped_units')::int<>2 OR (c->>'delivered_units')::int<>2
     OR NOT (c->>'all_shipped')::boolean OR NOT (c->>'all_delivered')::boolean THEN
    RAISE EXCEPTION 'v31_5_coverage_projection_incorrect: %',c;
  END IF;
END $$;

-- 7) Admin read-only integrity snapshot is browser callable only after real admin auth.
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims','{"sub":"10000000-0000-4000-8000-000000000003","role":"authenticated","is_anonymous":false,"aal":"aal2"}',true);
DO $$ DECLARE s jsonb; BEGIN
  s:=public.mp_admin_integrity_snapshot();
  IF (s->>'scope')<>'production_only' THEN RAISE EXCEPTION 'v31_5_integrity_scope_not_production'; END IF;
  IF (s->'summary'->>'deals_with_integrity_findings')::int<>0 THEN RAISE EXCEPTION 'v31_5_integrity_snapshot_false_positive: %',s; END IF;
END $$;
RESET ROLE;

SELECT jsonb_build_object(
  'gate','v31.5-lifecycle-consistency-smoke',
  'proforma_stage_guard','PASS',
  'verified_funds_guard','PASS',
  'allocation_guard','PASS',
  'partial_shipment_guard','PASS',
  'partial_delivery_guard','PASS',
  'coverage_projection','PASS',
  'admin_integrity_snapshot','PASS'
) AS v31_5_lifecycle_smoke;