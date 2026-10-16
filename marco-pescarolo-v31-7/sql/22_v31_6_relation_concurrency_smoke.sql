\set ON_ERROR_STOP on

-- v31.6 smoke. Run inside the cumulative transaction after v31.4 + v31.5 + v31.6 bodies.

-- Additional valid fixture entities.
INSERT INTO auth.users(id,email) VALUES
 ('10000000-0000-4000-8000-000000000010','extra@example.test');
INSERT INTO public.users(id,tenant_id,email,display_name,role,is_active) VALUES
 ('20000000-0000-4000-8000-000000000010','00000000-0000-4000-8000-000000000001','extra@example.test','Extra User','sales',true);
INSERT INTO public.client_stores(id,tenant_id,client_id,code,name,is_active) VALUES
 ('40000000-0000-4000-8000-000000000010','00000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000002','PRIVATE-STORE','Invalid Private Store For Deal Tests',true);
INSERT INTO public.products(id,tenant_id,style_code,status,publication_status,unit_cost,created_at) VALUES
 ('00000000-0000-4000-8000-000000000102','00000000-0000-4000-8000-000000000001','CI-MP-02','active','published',110,now());
INSERT INTO public.product_variants(id,tenant_id,product_id,sku,status) VALUES
 ('81000000-0000-4000-8000-000000000010','00000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000101','CI-RC-V1','active'),
 ('81000000-0000-4000-8000-000000000011','00000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000102','CI-RC-V2','active');

-- 1) Role relation mismatch is rejected at the write boundary.
DO $$ BEGIN
  BEGIN
    INSERT INTO public.portal_memberships(tenant_id,auth_user_id,public_user_id,client_id,client_store_id,access_role,status)
    VALUES('00000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000010','20000000-0000-4000-8000-000000000010','30000000-0000-4000-8000-000000000002',NULL,'buyer','active');
    RAISE EXCEPTION 'v31_6_membership_relation_guard_failed';
  EXCEPTION WHEN check_violation THEN NULL; END;
END $$;

-- 2) An auth user can have only one active membership per DB role.
DO $$ BEGIN
  BEGIN
    INSERT INTO public.portal_memberships(tenant_id,auth_user_id,public_user_id,client_id,client_store_id,access_role,status)
    VALUES('00000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000001','40000000-0000-4000-8000-000000000001','buyer','active');
    RAISE EXCEPTION 'v31_6_duplicate_active_membership_guard_failed';
  EXCEPTION WHEN unique_violation THEN NULL; END;
END $$;

-- 3) Wrong store/client link cannot enter a deal.
DO $$ BEGIN
  BEGIN
    INSERT INTO public.deals(id,tenant_id,code,client_id,stage,currency,client_store_id,title,data_class)
    VALUES('82000000-0000-4000-8000-000000000010','00000000-0000-4000-8000-000000000001','CI-RC-BADSTORE','30000000-0000-4000-8000-000000000001','draft','EUR','40000000-0000-4000-8000-000000000010','Bad store relation','production');
    RAISE EXCEPTION 'v31_6_deal_store_guard_failed';
  EXCEPTION WHEN check_violation THEN NULL; END;
END $$;

-- Valid deal A and B for downstream relation/race tests.
INSERT INTO public.deals(id,tenant_id,code,client_id,stage,currency,client_store_id,title,data_class,total_amount)
VALUES
 ('82000000-0000-4000-8000-000000000011','00000000-0000-4000-8000-000000000001','CI-RC-A','30000000-0000-4000-8000-000000000001','draft','EUR','40000000-0000-4000-8000-000000000001','Relation A','production',100),
 ('82000000-0000-4000-8000-000000000012','00000000-0000-4000-8000-000000000001','CI-RC-B','30000000-0000-4000-8000-000000000001','draft','EUR','40000000-0000-4000-8000-000000000002','Relation B','production',100);

-- 4) Variant must belong to the same product/tenant as the deal line.
DO $$ BEGIN
  BEGIN
    INSERT INTO public.deal_lines(id,tenant_id,deal_id,product_id,product_variant_id,style_snapshot,sku_snapshot,qty,unit_price,line_total)
    VALUES('83000000-0000-4000-8000-000000000010','00000000-0000-4000-8000-000000000001','82000000-0000-4000-8000-000000000011','00000000-0000-4000-8000-000000000101','81000000-0000-4000-8000-000000000011','CI-MP-01','BAD-MIX',1,100,100);
    RAISE EXCEPTION 'v31_6_deal_line_variant_guard_failed';
  EXCEPTION WHEN check_violation THEN NULL; END;
END $$;

INSERT INTO public.deal_lines(id,tenant_id,deal_id,product_id,product_variant_id,style_snapshot,sku_snapshot,qty,unit_price,line_total)
VALUES
 ('83000000-0000-4000-8000-000000000011','00000000-0000-4000-8000-000000000001','82000000-0000-4000-8000-000000000011','00000000-0000-4000-8000-000000000101','81000000-0000-4000-8000-000000000010','CI-MP-01','CI-RC-V1',1,100,100),
 ('83000000-0000-4000-8000-000000000012','00000000-0000-4000-8000-000000000001','82000000-0000-4000-8000-000000000012','00000000-0000-4000-8000-000000000102','81000000-0000-4000-8000-000000000011','CI-MP-02','CI-RC-V2',1,100,100);

-- 5) Same variant cannot be inserted twice into one deal under concurrency.
DO $$ BEGIN
  BEGIN
    INSERT INTO public.deal_lines(id,tenant_id,deal_id,product_id,product_variant_id,style_snapshot,sku_snapshot,qty,unit_price,line_total)
    VALUES('83000000-0000-4000-8000-000000000013','00000000-0000-4000-8000-000000000001','82000000-0000-4000-8000-000000000011','00000000-0000-4000-8000-000000000101','81000000-0000-4000-8000-000000000010','CI-MP-01','CI-RC-V1',1,100,100);
    RAISE EXCEPTION 'v31_6_duplicate_variant_line_guard_failed';
  EXCEPTION WHEN unique_violation THEN NULL; END;
END $$;

-- 6) Payment ↔ proforma ↔ deal must remain one coherent relation.
INSERT INTO public.proformas(id,tenant_id,deal_id,version,number,status,currency,amount,advance_amount,balance_amount,issued_at)
VALUES('84000000-0000-4000-8000-000000000010','00000000-0000-4000-8000-000000000001','82000000-0000-4000-8000-000000000011',1,'CI-RC-PF','issued','EUR',100,100,0,now());
DO $$ BEGIN
  BEGIN
    INSERT INTO public.payments(id,tenant_id,deal_id,proforma_id,payment_type,provider,external_reference,currency,amount,status)
    VALUES('85000000-0000-4000-8000-000000000010','00000000-0000-4000-8000-000000000001','82000000-0000-4000-8000-000000000012','84000000-0000-4000-8000-000000000010','advance','bank','CI-RC-BADPAY','EUR',100,'submitted');
    RAISE EXCEPTION 'v31_6_payment_relation_guard_failed';
  EXCEPTION WHEN check_violation THEN NULL; END;
END $$;

-- 7) Shipment code is database-unique, not merely check-then-insert unique.
INSERT INTO public.shipments(id,tenant_id,deal_id,code,status,carrier)
VALUES('88000000-0000-4000-8000-000000000010','00000000-0000-4000-8000-000000000001','82000000-0000-4000-8000-000000000011','CI-RC-SHIP','planned','CI');
DO $$ BEGIN
  BEGIN
    INSERT INTO public.shipments(id,tenant_id,deal_id,code,status,carrier)
    VALUES('88000000-0000-4000-8000-000000000011','00000000-0000-4000-8000-000000000001','82000000-0000-4000-8000-000000000012','CI-RC-SHIP','planned','CI');
    RAISE EXCEPTION 'v31_6_duplicate_shipment_code_guard_failed';
  EXCEPTION WHEN unique_violation THEN NULL; END;
END $$;

-- Reservation for deal A.
INSERT INTO public.inventory_positions(id,tenant_id,product_variant_id,location_code,on_hand,reserved,data_class)
VALUES('86000000-0000-4000-8000-000000000010','00000000-0000-4000-8000-000000000001','81000000-0000-4000-8000-000000000010','NAP-RC',2,1,'production');
INSERT INTO public.inventory_reservations(id,tenant_id,deal_id,deal_line_id,position_id,qty,status,created_by)
VALUES('87000000-0000-4000-8000-000000000010','00000000-0000-4000-8000-000000000001','82000000-0000-4000-8000-000000000011','83000000-0000-4000-8000-000000000011','86000000-0000-4000-8000-000000000010',1,'reserved','20000000-0000-4000-8000-000000000003');

-- 8) Shipment line cannot splice a reservation into a different deal line/deal.
DO $$ BEGIN
  BEGIN
    INSERT INTO public.shipment_lines(id,tenant_id,shipment_id,deal_id,deal_line_id,reservation_id,product_variant_id,qty,source_location_code,status)
    VALUES('89000000-0000-4000-8000-000000000010','00000000-0000-4000-8000-000000000001','88000000-0000-4000-8000-000000000010','82000000-0000-4000-8000-000000000011','83000000-0000-4000-8000-000000000012','87000000-0000-4000-8000-000000000010','81000000-0000-4000-8000-000000000011',1,'NAP-RC','planned');
    RAISE EXCEPTION 'v31_6_shipment_line_relation_guard_failed';
  EXCEPTION WHEN check_violation THEN NULL; END;
END $$;

INSERT INTO public.shipment_lines(id,tenant_id,shipment_id,deal_id,deal_line_id,reservation_id,product_variant_id,qty,source_location_code,status)
VALUES('89000000-0000-4000-8000-000000000011','00000000-0000-4000-8000-000000000001','88000000-0000-4000-8000-000000000010','82000000-0000-4000-8000-000000000011','83000000-0000-4000-8000-000000000011','87000000-0000-4000-8000-000000000010','81000000-0000-4000-8000-000000000010',1,'NAP-RC','shipped');

-- 9) Only one carrier POD can win a concurrent confirmation race.
INSERT INTO public.delivery_receipts(id,tenant_id,shipment_id,deal_id,receipt_type,external_reference,received_by,delivered_at,actor_user_id)
VALUES('8a000000-0000-4000-8000-000000000010','00000000-0000-4000-8000-000000000001','88000000-0000-4000-8000-000000000010','82000000-0000-4000-8000-000000000011','carrier_pod','CI-RC-POD-1','Receiver',now(),'20000000-0000-4000-8000-000000000003');
DO $$ BEGIN
  BEGIN
    INSERT INTO public.delivery_receipts(id,tenant_id,shipment_id,deal_id,receipt_type,external_reference,received_by,delivered_at,actor_user_id)
    VALUES('8a000000-0000-4000-8000-000000000011','00000000-0000-4000-8000-000000000001','88000000-0000-4000-8000-000000000010','82000000-0000-4000-8000-000000000011','carrier_pod','CI-RC-POD-2','Receiver',now(),'20000000-0000-4000-8000-000000000003');
    RAISE EXCEPTION 'v31_6_duplicate_carrier_pod_guard_failed';
  EXCEPTION WHEN unique_violation THEN NULL; END;
END $$;

-- 10) Reorder store must belong to proposal client.
DO $$ BEGIN
  BEGIN
    INSERT INTO public.reorder_proposals(id,tenant_id,client_id,client_store_id,status,currency)
    VALUES('8b000000-0000-4000-8000-000000000010','00000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000001','40000000-0000-4000-8000-000000000010','proposed','EUR');
    RAISE EXCEPTION 'v31_6_reorder_store_relation_guard_failed';
  EXCEPTION WHEN check_violation THEN NULL; END;
END $$;

INSERT INTO public.reorder_proposals(id,tenant_id,client_id,client_store_id,status,currency)
VALUES('8b000000-0000-4000-8000-000000000011','00000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000001','40000000-0000-4000-8000-000000000001','brand_approved','EUR');

-- 11) Reorder line variant/product link is guarded.
DO $$ BEGIN
  BEGIN
    INSERT INTO public.reorder_lines(id,tenant_id,proposal_id,product_id,product_variant_id,recommended_qty,unit_price,line_value)
    VALUES('8c000000-0000-4000-8000-000000000010','00000000-0000-4000-8000-000000000001','8b000000-0000-4000-8000-000000000011','00000000-0000-4000-8000-000000000101','81000000-0000-4000-8000-000000000011',1,100,100);
    RAISE EXCEPTION 'v31_6_reorder_line_variant_guard_failed';
  EXCEPTION WHEN check_violation THEN NULL; END;
END $$;

-- 12) Reorder proposal can map to at most one deal.
INSERT INTO public.deals(id,tenant_id,code,client_id,stage,currency,client_store_id,title,data_class,source_reorder_proposal_id)
VALUES('82000000-0000-4000-8000-000000000013','00000000-0000-4000-8000-000000000001','CI-RC-REORDER-1','30000000-0000-4000-8000-000000000001','draft','EUR','40000000-0000-4000-8000-000000000001','Reorder Deal','production','8b000000-0000-4000-8000-000000000011');
DO $$ BEGIN
  BEGIN
    INSERT INTO public.deals(id,tenant_id,code,client_id,stage,currency,client_store_id,title,data_class,source_reorder_proposal_id)
    VALUES('82000000-0000-4000-8000-000000000014','00000000-0000-4000-8000-000000000001','CI-RC-REORDER-2','30000000-0000-4000-8000-000000000001','draft','EUR','40000000-0000-4000-8000-000000000001','Duplicate Reorder Deal','production','8b000000-0000-4000-8000-000000000011');
    RAISE EXCEPTION 'v31_6_duplicate_reorder_conversion_guard_failed';
  EXCEPTION WHEN unique_violation THEN NULL; END;
END $$;

-- 13) The read-only v31.6 audit must see zero bad rows inside the admitted transaction.
DO $$
DECLARE bad bigint;
BEGIN
  WITH checks AS (
    SELECT count(*)::bigint bad FROM public.portal_memberships m
    LEFT JOIN public.clients c ON c.id=m.client_id
    LEFT JOIN public.users u ON u.id=m.public_user_id
    WHERE c.id IS NULL OR u.id IS NULL OR c.tenant_id<>m.tenant_id OR u.tenant_id<>m.tenant_id
    UNION ALL
    SELECT count(*) FROM public.shipment_lines sl
    JOIN public.shipments sh ON sh.id=sl.shipment_id
    JOIN public.deal_lines dl ON dl.id=sl.deal_line_id
    JOIN public.inventory_reservations r ON r.id=sl.reservation_id
    WHERE sl.tenant_id<>sh.tenant_id OR sl.deal_id<>sh.deal_id OR dl.deal_id<>sl.deal_id OR r.deal_line_id<>sl.deal_line_id
  ) SELECT COALESCE(sum(checks.bad),0) INTO bad FROM checks;
  IF bad<>0 THEN RAISE EXCEPTION 'v31_6_smoke_relation_bad_rows_%',bad; END IF;
END $$;

SELECT jsonb_build_object(
  'gate','v31.6-relation-concurrency-smoke',
  'membership_relation_guard','PASS',
  'active_membership_uniqueness','PASS',
  'deal_store_relation_guard','PASS',
  'deal_variant_relation_guard','PASS',
  'deal_variant_uniqueness','PASS',
  'payment_relation_guard','PASS',
  'shipment_code_uniqueness','PASS',
  'shipment_line_relation_guard','PASS',
  'carrier_pod_uniqueness','PASS',
  'reorder_store_relation_guard','PASS',
  'reorder_line_relation_guard','PASS',
  'reorder_conversion_uniqueness','PASS'
) AS v31_6_relation_concurrency_smoke;