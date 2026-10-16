-- Marco Pescarolo v31.1 five-role PG17 admission smoke
\set ON_ERROR_STOP on
BEGIN;

CREATE TEMP TABLE admission_results(test text primary key, pass boolean not null, detail text);
GRANT SELECT,INSERT ON admission_results TO authenticated;

INSERT INTO public.users VALUES
('10000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000001','private@test.invalid','Private','private_client',true),
('10000000-0000-4000-8000-000000000002','00000000-0000-4000-8000-000000000001','hq@test.invalid','HQ','buyer',true),
('10000000-0000-4000-8000-000000000003','00000000-0000-4000-8000-000000000001','paris@test.invalid','Paris','buyer',true),
('10000000-0000-4000-8000-000000000004','00000000-0000-4000-8000-000000000001','dubai@test.invalid','Dubai','buyer',true),
('10000000-0000-4000-8000-000000000005','00000000-0000-4000-8000-000000000001','admin@test.invalid','Admin','admin',true);

INSERT INTO public.clients VALUES
('20000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000001','PRIVATE','private','Private Client'),
('20000000-0000-4000-8000-000000000002','00000000-0000-4000-8000-000000000001','EU','wholesale','Europe Wholesale'),
('20000000-0000-4000-8000-000000000003','00000000-0000-4000-8000-000000000001','DXB','wholesale','Dubai Wholesale');

INSERT INTO public.client_stores VALUES
('30000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000002','PARIS','Paris',true),
('30000000-0000-4000-8000-000000000002','00000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000002','LYON','Lyon',true),
('30000000-0000-4000-8000-000000000003','00000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000003','DUBAI','Dubai',true);

INSERT INTO public.portal_memberships VALUES
('40000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000001','90000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000001',NULL,'private_client','active'),
('40000000-0000-4000-8000-000000000002','00000000-0000-4000-8000-000000000001','90000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000002','20000000-0000-4000-8000-000000000002',NULL,'buyer','active'),
('40000000-0000-4000-8000-000000000003','00000000-0000-4000-8000-000000000001','90000000-0000-4000-8000-000000000003','10000000-0000-4000-8000-000000000003','20000000-0000-4000-8000-000000000002','30000000-0000-4000-8000-000000000001','buyer','active'),
('40000000-0000-4000-8000-000000000004','00000000-0000-4000-8000-000000000001','90000000-0000-4000-8000-000000000004','10000000-0000-4000-8000-000000000004','20000000-0000-4000-8000-000000000003','30000000-0000-4000-8000-000000000003','buyer','active');

INSERT INTO public.mp_brand_admin_memberships VALUES
('50000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000001','90000000-0000-4000-8000-000000000005','10000000-0000-4000-8000-000000000005','active');

INSERT INTO public.products VALUES
('60000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000001','MP-CI-01',100);

INSERT INTO public.private_fit_profiles VALUES
('70000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000001',0);

INSERT INTO public.reorder_proposals VALUES
('80000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000002','30000000-0000-4000-8000-000000000001','proposed'),
('80000000-0000-4000-8000-000000000002','00000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000002','30000000-0000-4000-8000-000000000002','proposed'),
('80000000-0000-4000-8000-000000000003','00000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000003','30000000-0000-4000-8000-000000000003','proposed');

SET LOCAL ROLE authenticated;

-- Private
SELECT set_config('request.jwt.claims','{"sub":"90000000-0000-4000-8000-000000000001","role":"authenticated","aal":"aal1","is_anonymous":false}',true);
DO $$
DECLARE x jsonb; v uuid;
BEGIN
  x:=public.mp_my_access();
  INSERT INTO admission_results VALUES('private_access',x->'memberships'->0->>'access_role'='private',x::text);
  BEGIN
    PERFORM public.mp_client_snapshot('wholesale',NULL);
    INSERT INTO admission_results VALUES('private_wholesale_denied',false,'unexpected allow');
  EXCEPTION WHEN OTHERS THEN
    INSERT INTO admission_results VALUES('private_wholesale_denied',true,SQLERRM);
  END;
  v:=public.mp_private_add_fit_profile_version('70000000-0000-4000-8000-000000000001',182);
  INSERT INTO admission_results VALUES('private_fit_write',v IS NOT NULL,coalesce(v::text,'null'));
END $$;

-- HQ
SELECT set_config('request.jwt.claims','{"sub":"90000000-0000-4000-8000-000000000002","role":"authenticated","aal":"aal1","is_anonymous":false}',true);
DO $$
BEGIN
  PERFORM public.mp_client_snapshot('wholesale','30000000-0000-4000-8000-000000000001');
  INSERT INTO admission_results VALUES('hq_paris_allowed',true,'allowed');
  BEGIN
    PERFORM public.mp_client_snapshot('wholesale','30000000-0000-4000-8000-000000000003');
    INSERT INTO admission_results VALUES('hq_dubai_denied',false,'unexpected allow');
  EXCEPTION WHEN OTHERS THEN
    INSERT INTO admission_results VALUES('hq_dubai_denied',true,SQLERRM);
  END;
END $$;

-- Paris
SELECT set_config('request.jwt.claims','{"sub":"90000000-0000-4000-8000-000000000003","role":"authenticated","aal":"aal1","is_anonymous":false}',true);
DO $$
BEGIN
  PERFORM public.mp_client_snapshot('wholesale','30000000-0000-4000-8000-000000000001');
  INSERT INTO admission_results VALUES('paris_own_store_allowed',true,'allowed');
  BEGIN
    PERFORM public.mp_client_snapshot('wholesale','30000000-0000-4000-8000-000000000002');
    INSERT INTO admission_results VALUES('paris_other_store_denied',false,'unexpected allow');
  EXCEPTION WHEN OTHERS THEN
    INSERT INTO admission_results VALUES('paris_other_store_denied',true,SQLERRM);
  END;
  PERFORM public.mp_wholesale_approve_reorder('80000000-0000-4000-8000-000000000001');
  INSERT INTO admission_results VALUES('paris_reorder_own_store',true,'buyer_approved');
  BEGIN
    PERFORM public.mp_wholesale_approve_reorder('80000000-0000-4000-8000-000000000002');
    INSERT INTO admission_results VALUES('paris_reorder_other_store_denied',false,'unexpected allow');
  EXCEPTION WHEN OTHERS THEN
    INSERT INTO admission_results VALUES('paris_reorder_other_store_denied',true,SQLERRM);
  END;
END $$;

-- Dubai
SELECT set_config('request.jwt.claims','{"sub":"90000000-0000-4000-8000-000000000004","role":"authenticated","aal":"aal1","is_anonymous":false}',true);
DO $$
BEGIN
  PERFORM public.mp_client_snapshot('wholesale','30000000-0000-4000-8000-000000000003');
  INSERT INTO admission_results VALUES('dubai_own_store_allowed',true,'allowed');
  BEGIN
    PERFORM public.mp_client_snapshot('wholesale','30000000-0000-4000-8000-000000000001');
    INSERT INTO admission_results VALUES('dubai_paris_denied',false,'unexpected allow');
  EXCEPTION WHEN OTHERS THEN
    INSERT INTO admission_results VALUES('dubai_paris_denied',true,SQLERRM);
  END;
END $$;

-- Admin AAL
SELECT set_config('request.jwt.claims','{"sub":"90000000-0000-4000-8000-000000000005","role":"authenticated","aal":"aal1","is_anonymous":false}',true);
DO $$
BEGIN
  BEGIN
    PERFORM public.mp_admin_approve_reorder('80000000-0000-4000-8000-000000000001');
    INSERT INTO admission_results VALUES('admin_aal1_denied',false,'unexpected allow');
  EXCEPTION WHEN OTHERS THEN
    INSERT INTO admission_results VALUES('admin_aal1_denied',position('admin_mfa_required' in SQLERRM)>0,SQLERRM);
  END;
END $$;

SELECT set_config('request.jwt.claims','{"sub":"90000000-0000-4000-8000-000000000005","role":"authenticated","aal":"aal2","is_anonymous":false}',true);
DO $$
BEGIN
  PERFORM public.mp_admin_approve_reorder('80000000-0000-4000-8000-000000000001');
  INSERT INTO admission_results VALUES('admin_aal2_allowed',true,'brand_approved');
END $$;

RESET ROLE;

-- Privilege checks
INSERT INTO admission_results
SELECT 'anon_private_fit_exec_denied',
       NOT has_function_privilege('anon','public.mp_private_add_fit_profile_version(uuid,numeric)','EXECUTE'),
       'anon must not execute private fit wrapper';

INSERT INTO admission_results
SELECT 'anon_reorder_exec_denied',
       NOT has_function_privilege('anon','public.mp_wholesale_approve_reorder(uuid)','EXECUTE'),
       'anon must not execute wholesale reorder wrapper';

SET LOCAL ROLE authenticated;
DO $$
BEGIN
  BEGIN
    PERFORM unit_cost FROM public.products LIMIT 1;
    INSERT INTO admission_results VALUES('unit_cost_denied',false,'unexpected allow');
  EXCEPTION WHEN OTHERS THEN INSERT INTO admission_results VALUES('unit_cost_denied',true,SQLERRM); END;
  BEGIN
    PERFORM unit_cost_snapshot FROM public.deal_lines LIMIT 1;
    INSERT INTO admission_results VALUES('unit_cost_snapshot_denied',false,'unexpected allow');
  EXCEPTION WHEN OTHERS THEN INSERT INTO admission_results VALUES('unit_cost_snapshot_denied',true,SQLERRM); END;
  BEGIN
    PERFORM gross_contribution FROM public.deals LIMIT 1;
    INSERT INTO admission_results VALUES('gross_contribution_denied',false,'unexpected allow');
  EXCEPTION WHEN OTHERS THEN INSERT INTO admission_results VALUES('gross_contribution_denied',true,SQLERRM); END;
END $$;
RESET ROLE;

SELECT test,pass,detail FROM admission_results ORDER BY test;

DO $$
DECLARE failed integer;
BEGIN
  SELECT count(*) INTO failed FROM admission_results WHERE NOT pass;
  IF failed<>0 THEN
    RAISE EXCEPTION 'PG17_ADMISSION_FAILED_%',failed;
  END IF;
END $$;

ROLLBACK;
\echo PG17_FIVE_ROLE_SMOKE=PASS
