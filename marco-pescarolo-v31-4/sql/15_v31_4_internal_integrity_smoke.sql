\set ON_ERROR_STOP on

-- Must run in the same transaction after 14 candidate body is loaded.

-- 1) Auth mapping: UI label and database role stay separate.
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims','{"sub":"10000000-0000-4000-8000-000000000001","role":"authenticated","is_anonymous":false}',true);
DO $$
DECLARE a jsonb;
BEGIN
  a:=public.mp_my_access();
  IF a->'memberships'->0->>'access_role'<>'wholesale'
     OR a->'memberships'->0->>'db_role'<>'buyer' THEN
    RAISE EXCEPTION 'v31_4_access_role_db_role_mapping_failed';
  END IF;
END $$;

-- 2) Snapshot v2 must not expose demo/synthetic deals.
DO $$
DECLARE s jsonb;
BEGIN
  s:=public.mp_client_snapshot_v2('buyer',NULL);
  IF EXISTS(SELECT 1 FROM jsonb_array_elements(s->'orders') x WHERE x->>'data_class'<>'production') THEN
    RAISE EXCEPTION 'v31_4_snapshot_nonproduction_leak';
  END IF;
  IF EXISTS(SELECT 1 FROM jsonb_array_elements(s->'orders') x WHERE x->>'code'='CI-DEMO') THEN
    RAISE EXCEPTION 'v31_4_snapshot_demo_leak';
  END IF;
END $$;

-- 3) Production guard rejects an existing demo deal.
DO $$ BEGIN
  BEGIN
    PERFORM public.mp_wholesale_set_deal_line_v2(
      '50000000-0000-4000-8000-000000000001',
      '00000000-0000-4000-8000-000000000101',NULL,1);
    RAISE EXCEPTION 'v31_4_demo_mutation_was_allowed';
  EXCEPTION WHEN insufficient_privilege THEN
    NULL;
  END;
END $$;

-- 4) Browser create explicitly becomes production and is visible in v2 snapshot.
DO $$
DECLARE d uuid; s jsonb;
BEGIN
  d:=public.mp_wholesale_create_order_v2(
    '40000000-0000-4000-8000-000000000001','Real CI order','REF-1','FW26',
    '60000000-0000-4000-8000-000000000001');
  s:=public.mp_client_snapshot_v2('buyer',NULL);
  IF NOT EXISTS(SELECT 1 FROM jsonb_array_elements(s->'orders') x WHERE x->>'id'=d::text AND x->>'data_class'='production') THEN
    RAISE EXCEPTION 'v31_4_production_order_missing_from_snapshot';
  END IF;
END $$;

-- 5) Same request id bound to non-production is fail-closed; it is not promoted.
-- Fixture creation is test-harness/admin work, never browser work.
RESET ROLE;
INSERT INTO public.deals(id,tenant_id,code,client_id,stage,currency,client_store_id,title,data_class,current_revision,client_request_id)
VALUES('50000000-0000-4000-8000-000000000002','00000000-0000-4000-8000-000000000001','CI-OLD-DEMO',
 '30000000-0000-4000-8000-000000000001','draft','EUR','40000000-0000-4000-8000-000000000001','Old demo','demo',0,
 '60000000-0000-4000-8000-000000000002');
SET LOCAL ROLE authenticated;
DO $$ BEGIN
  BEGIN
    PERFORM public.mp_wholesale_create_order_v2(
      '40000000-0000-4000-8000-000000000001','Retry','REF-OLD','FW26',
      '60000000-0000-4000-8000-000000000002');
    RAISE EXCEPTION 'v31_4_nonproduction_retry_promoted';
  EXCEPTION WHEN serialization_failure THEN NULL;
  END;
END $$;
RESET ROLE;
DO $$ BEGIN
  IF (SELECT data_class FROM public.deals WHERE id='50000000-0000-4000-8000-000000000002')<>'demo' THEN
    RAISE EXCEPTION 'v31_4_nonproduction_retry_changed_class';
  END IF;
END $$;
SET LOCAL ROLE authenticated;

-- 6) Copy facade preserves production and old raw copy is no longer executable.
DO $$
DECLARE src uuid; cp uuid; s jsonb;
BEGIN
 s:=public.mp_client_snapshot_v2('buyer',NULL);
 SELECT (x->>'id')::uuid INTO src FROM jsonb_array_elements(s->'orders') x WHERE x->>'code'<>'CI-DEMO' ORDER BY x->>'created_at' DESC LIMIT 1;
 IF src IS NULL THEN RAISE EXCEPTION 'v31_4_copy_source_missing_from_snapshot'; END IF;
 cp:=public.mp_wholesale_copy_order_v2(src,'40000000-0000-4000-8000-000000000002','Dubai copy','REF-COPY');
 s:=public.mp_client_snapshot_v2('buyer',NULL);
 IF NOT EXISTS(SELECT 1 FROM jsonb_array_elements(s->'orders') x WHERE x->>'id'=cp::text AND x->>'data_class'='production') THEN RAISE EXCEPTION 'v31_4_copy_lost_production_class'; END IF;
 IF has_function_privilege('authenticated','public.copy_deal(uuid,uuid,text,text,text,uuid)','EXECUTE') THEN RAISE EXCEPTION 'v31_4_raw_copy_still_executable'; END IF;
 IF has_function_privilege('authenticated','public.capture_deal_revision(uuid,text,uuid,text,uuid,integer)','EXECUTE') THEN RAISE EXCEPTION 'v31_4_raw_revision_still_executable'; END IF;
END $$;

RESET ROLE;

-- 7) Reorder data-class provenance is server-only and fail-safe.
INSERT INTO public.sell_through_batches(id,tenant_id,client_id,client_store_id,status,metadata) VALUES
 ('70000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000001','40000000-0000-4000-8000-000000000001','accepted','{"data_class":"production"}'),
 ('70000000-0000-4000-8000-000000000002','00000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000001','40000000-0000-4000-8000-000000000001','accepted','{}');
DO $$
DECLARE rp uuid; rd uuid;
BEGIN
 rp:=public.create_reorder_proposal_from_batch_v2('70000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000003',8);
 IF (SELECT metadata->>'data_class' FROM public.reorder_proposals WHERE id=rp)<>'production' THEN RAISE EXCEPTION 'v31_4_reorder_production_provenance_lost'; END IF;
 UPDATE public.reorder_proposals SET status='brand_approved' WHERE id=rp;
 INSERT INTO public.reorder_lines(tenant_id,proposal_id,product_id,recommended_qty,unit_price,line_value)
 VALUES('00000000-0000-4000-8000-000000000001',rp,'00000000-0000-4000-8000-000000000101',2,100,200);
 rd:=public.convert_reorder_to_deal_v2(rp,'20000000-0000-4000-8000-000000000003','REORDER-PROD','Reorder production');
 IF (SELECT data_class FROM public.deals WHERE id=rd)<>'production' THEN RAISE EXCEPTION 'v31_4_reorder_deal_production_lost'; END IF;

 rp:=public.create_reorder_proposal_from_batch_v2('70000000-0000-4000-8000-000000000002','20000000-0000-4000-8000-000000000003',8);
 IF (SELECT metadata->>'data_class' FROM public.reorder_proposals WHERE id=rp)<>'demo' THEN RAISE EXCEPTION 'v31_4_reorder_missing_class_not_demo'; END IF;
END $$;

-- 8) New browser surface exists, legacy browser surface is closed.
DO $$
BEGIN
 IF NOT has_function_privilege('authenticated','public.mp_client_snapshot_v2(text,uuid)','EXECUTE')
    OR NOT has_function_privilege('authenticated','public.mp_wholesale_create_order_v2(uuid,text,text,text,uuid)','EXECUTE') THEN
   RAISE EXCEPTION 'v31_4_v2_surface_missing';
 END IF;
 IF has_function_privilege('authenticated','public.portal_create_draft_order(uuid,text,text,text,uuid)','EXECUTE')
    OR has_function_privilege('authenticated','public.mp_client_snapshot(text,uuid)','EXECUTE') THEN
   RAISE EXCEPTION 'v31_4_legacy_surface_still_open';
 END IF;
 IF has_function_privilege('anon','public.copy_deal(uuid,uuid,text,text,text,uuid)','EXECUTE')
    OR has_function_privilege('anon','public.capture_deal_revision(uuid,text,uuid,text,uuid,integer)','EXECUTE') THEN
   RAISE EXCEPTION 'v31_4_anon_raw_primitive_still_open';
 END IF;
END $$;

SELECT jsonb_build_object(
 'gate','v31.4-internal-integrity-smoke','db_role_mapping','PASS',
 'snapshot_production_only','PASS','demo_mutation_denied','PASS',
 'wholesale_create_production','PASS','idempotent_nonproduction_promotion_denied','PASS',
 'copy_preserves_production','PASS','reorder_provenance','PASS','raw_browser_surface_closed','PASS'
) AS v31_4_internal_integrity_smoke;