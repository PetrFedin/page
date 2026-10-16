\set ON_ERROR_STOP on
BEGIN;

CREATE TEMP TABLE admission_results(test text primary key,pass boolean not null,detail text not null default '');
GRANT SELECT,INSERT ON admission_results TO authenticated;

CREATE OR REPLACE FUNCTION public.mp_private_add_fit_profile_version(
 p_profile_id uuid,p_source text,p_height_cm numeric,p_chest_cm numeric,p_waist_cm numeric,
 p_hips_cm numeric,p_inseam_cm numeric,p_shoulder_cm numeric DEFAULT NULL,p_sleeve_cm numeric DEFAULT NULL,p_notes text DEFAULT NULL
) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE m public.portal_memberships%ROWTYPE; p public.private_fit_profiles%ROWTYPE;
BEGIN
 SELECT pm.* INTO m FROM public.portal_memberships pm
 JOIN public.clients c ON c.id=pm.client_id AND c.client_type='private' AND c.tenant_id=pm.tenant_id
 WHERE pm.auth_user_id=auth.uid() AND pm.access_role='private_client' AND pm.status='active' LIMIT 1;
 IF NOT FOUND THEN RAISE EXCEPTION 'private_membership_required' USING ERRCODE='42501'; END IF;
 SELECT * INTO p FROM public.private_fit_profiles WHERE id=p_profile_id AND tenant_id=m.tenant_id AND client_id=m.client_id FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'fit_profile_not_found' USING ERRCODE='42501'; END IF;
 RETURN public.add_fit_profile_version(p.id,p_source,p_height_cm,p_chest_cm,p_waist_cm,p_hips_cm,p_inseam_cm,p_shoulder_cm,p_sleeve_cm,m.public_user_id,p_notes);
END $$;
REVOKE ALL ON FUNCTION public.mp_private_add_fit_profile_version(uuid,text,numeric,numeric,numeric,numeric,numeric,numeric,numeric,text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.mp_private_add_fit_profile_version(uuid,text,numeric,numeric,numeric,numeric,numeric,numeric,numeric,text) TO authenticated;

CREATE OR REPLACE FUNCTION public.mp_wholesale_approve_reorder(p_proposal_id uuid)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE m public.portal_memberships%ROWTYPE; p public.reorder_proposals%ROWTYPE;
BEGIN
 SELECT pm.* INTO m FROM public.portal_memberships pm
 JOIN public.clients c ON c.id=pm.client_id AND c.client_type='wholesale' AND c.tenant_id=pm.tenant_id
 WHERE pm.auth_user_id=auth.uid() AND pm.access_role='buyer' AND pm.status='active' LIMIT 1;
 IF NOT FOUND THEN RAISE EXCEPTION 'buyer_membership_required' USING ERRCODE='42501'; END IF;
 SELECT * INTO p FROM public.reorder_proposals WHERE id=p_proposal_id FOR UPDATE;
 IF NOT FOUND OR p.tenant_id<>m.tenant_id OR p.client_id<>m.client_id THEN RAISE EXCEPTION 'reorder_outside_account' USING ERRCODE='42501'; END IF;
 IF m.client_store_id IS NOT NULL AND p.client_store_id IS DISTINCT FROM m.client_store_id THEN RAISE EXCEPTION 'reorder_outside_buyer_store' USING ERRCODE='42501'; END IF;
 IF p.status NOT IN ('proposed','reviewed') THEN RAISE EXCEPTION 'reorder_state_invalid'; END IF;
 UPDATE public.reorder_proposals SET status='buyer_approved',approved_by_buyer_at=now(),updated_at=now() WHERE id=p.id;
 RETURN 'buyer_approved';
END $$;
REVOKE ALL ON FUNCTION public.mp_wholesale_approve_reorder(uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.mp_wholesale_approve_reorder(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.mp_admin_approve_reorder(p_proposal_id uuid,p_reason text)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE a public.mp_brand_admin_memberships%ROWTYPE;
BEGIN
 a:=private.mp_brand_admin_actor();
 IF COALESCE(auth.jwt()->>'aal','')<>'aal2' THEN RAISE EXCEPTION 'admin_mfa_required' USING ERRCODE='42501'; END IF;
 RETURN public.brand_approve_reorder(p_proposal_id,a.public_user_id,p_reason);
END $$;
REVOKE ALL ON FUNCTION public.mp_admin_approve_reorder(uuid,text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.mp_admin_approve_reorder(uuid,text) TO authenticated;

INSERT INTO public.users(id,tenant_id,email,display_name,role,is_active) VALUES
('10000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000001','private@test.invalid','Private','private_client',true),
('10000000-0000-4000-8000-000000000002','00000000-0000-4000-8000-000000000001','hq@test.invalid','HQ','buyer',true),
('10000000-0000-4000-8000-000000000003','00000000-0000-4000-8000-000000000001','paris@test.invalid','Paris','buyer',true),
('10000000-0000-4000-8000-000000000004','00000000-0000-4000-8000-000000000001','dubai@test.invalid','Dubai','buyer',true),
('10000000-0000-4000-8000-000000000005','00000000-0000-4000-8000-000000000001','admin@test.invalid','Admin','admin',true);

INSERT INTO public.clients(id,tenant_id,code,client_type,name,market,country_code,currency,stage) VALUES
('20000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000001','PRIVATE','private','Private Client','Private','IT','EUR','active'),
('20000000-0000-4000-8000-000000000002','00000000-0000-4000-8000-000000000001','EU','wholesale','Europe Wholesale','Paris','FR','EUR','active'),
('20000000-0000-4000-8000-000000000003','00000000-0000-4000-8000-000000000001','DXB','wholesale','Dubai Wholesale','Dubai','AE','EUR','active');

INSERT INTO public.client_stores(id,tenant_id,client_id,code,name,store_type,city,country_code,is_active) VALUES
('30000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000002','PARIS','Paris','store','Paris','FR',true),
('30000000-0000-4000-8000-000000000002','00000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000002','LYON','Lyon','store','Lyon','FR',true),
('30000000-0000-4000-8000-000000000003','00000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000003','DUBAI','Dubai','store','Dubai','AE',true);

INSERT INTO public.portal_memberships(id,tenant_id,auth_user_id,public_user_id,client_id,client_store_id,access_role,status,activated_at) VALUES
('40000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000001','90000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000001',NULL,'private_client','active',now()),
('40000000-0000-4000-8000-000000000002','00000000-0000-4000-8000-000000000001','90000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000002','20000000-0000-4000-8000-000000000002',NULL,'buyer','active',now()),
('40000000-0000-4000-8000-000000000003','00000000-0000-4000-8000-000000000001','90000000-0000-4000-8000-000000000003','10000000-0000-4000-8000-000000000003','20000000-0000-4000-8000-000000000002','30000000-0000-4000-8000-000000000001','buyer','active',now()),
('40000000-0000-4000-8000-000000000004','00000000-0000-4000-8000-000000000001','90000000-0000-4000-8000-000000000004','10000000-0000-4000-8000-000000000004','20000000-0000-4000-8000-000000000003','30000000-0000-4000-8000-000000000003','buyer','active',now());

INSERT INTO public.mp_brand_admin_memberships(id,tenant_id,auth_user_id,public_user_id,status,activated_at)
VALUES('50000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000001','90000000-0000-4000-8000-000000000005','10000000-0000-4000-8000-000000000005','active',now());

INSERT INTO public.private_fit_profiles(id,tenant_id,client_id,user_id,profile_key,display_name,preferred_fit,active_version,status,consent_at,updated_at)
VALUES('70000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','main','Admission Profile','regular',0,'active',now(),now());

INSERT INTO public.reorder_proposals(id,tenant_id,client_id,status,currency,horizon_weeks,proposal_value,rationale,created_by,client_store_id,proposal_kind,metadata) VALUES
('80000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000002','proposed','EUR',8,1000,'{}','10000000-0000-4000-8000-000000000003','30000000-0000-4000-8000-000000000001','buyer_request','{}'),
('80000000-0000-4000-8000-000000000002','00000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000002','proposed','EUR',8,1000,'{}','10000000-0000-4000-8000-000000000002','30000000-0000-4000-8000-000000000002','buyer_request','{}'),
('80000000-0000-4000-8000-000000000003','00000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000003','proposed','EUR',8,1000,'{}','10000000-0000-4000-8000-000000000004','30000000-0000-4000-8000-000000000003','buyer_request','{}');

SET LOCAL ROLE authenticated;

SELECT set_config('request.jwt.claims','{"sub":"90000000-0000-4000-8000-000000000001","role":"authenticated","aal":"aal1","is_anonymous":false}',true);
DO $$
DECLARE x jsonb; v uuid;
BEGIN
 x:=public.mp_my_access();
 INSERT INTO admission_results VALUES('private_access',x->'memberships'->0->>'access_role'='private',x::text);
 BEGIN PERFORM public.mp_client_snapshot('wholesale',NULL); INSERT INTO admission_results VALUES('private_wholesale_denied',false,'unexpected allow');
 EXCEPTION WHEN OTHERS THEN INSERT INTO admission_results VALUES('private_wholesale_denied',true,SQLERRM); END;
 v:=public.mp_private_add_fit_profile_version('70000000-0000-4000-8000-000000000001','self',182,102,88,100,82,47,64,'v31.2');
 INSERT INTO admission_results VALUES('private_fit_write',v IS NOT NULL,coalesce(v::text,'null'));
END $$;

SELECT set_config('request.jwt.claims','{"sub":"90000000-0000-4000-8000-000000000002","role":"authenticated","aal":"aal1","is_anonymous":false}',true);
DO $$ BEGIN
 PERFORM public.mp_client_snapshot('wholesale','30000000-0000-4000-8000-000000000001'); INSERT INTO admission_results VALUES('hq_paris_allowed',true,'allowed');
 BEGIN PERFORM public.mp_client_snapshot('wholesale','30000000-0000-4000-8000-000000000003'); INSERT INTO admission_results VALUES('hq_dubai_denied',false,'unexpected allow');
 EXCEPTION WHEN OTHERS THEN INSERT INTO admission_results VALUES('hq_dubai_denied',true,SQLERRM); END;
END $$;

SELECT set_config('request.jwt.claims','{"sub":"90000000-0000-4000-8000-000000000003","role":"authenticated","aal":"aal1","is_anonymous":false}',true);
DO $$ BEGIN
 PERFORM public.mp_client_snapshot('wholesale','30000000-0000-4000-8000-000000000001'); INSERT INTO admission_results VALUES('paris_own_store_allowed',true,'allowed');
 BEGIN PERFORM public.mp_client_snapshot('wholesale','30000000-0000-4000-8000-000000000002'); INSERT INTO admission_results VALUES('paris_other_store_denied',false,'unexpected allow');
 EXCEPTION WHEN OTHERS THEN INSERT INTO admission_results VALUES('paris_other_store_denied',true,SQLERRM); END;
 PERFORM public.mp_wholesale_approve_reorder('80000000-0000-4000-8000-000000000001'); INSERT INTO admission_results VALUES('paris_reorder_own_store',true,'buyer_approved');
 BEGIN PERFORM public.mp_wholesale_approve_reorder('80000000-0000-4000-8000-000000000002'); INSERT INTO admission_results VALUES('paris_reorder_other_store_denied',false,'unexpected allow');
 EXCEPTION WHEN OTHERS THEN INSERT INTO admission_results VALUES('paris_reorder_other_store_denied',true,SQLERRM); END;
END $$;

SELECT set_config('request.jwt.claims','{"sub":"90000000-0000-4000-8000-000000000004","role":"authenticated","aal":"aal1","is_anonymous":false}',true);
DO $$ BEGIN
 PERFORM public.mp_client_snapshot('wholesale','30000000-0000-4000-8000-000000000003'); INSERT INTO admission_results VALUES('dubai_own_store_allowed',true,'allowed');
 BEGIN PERFORM public.mp_client_snapshot('wholesale','30000000-0000-4000-8000-000000000001'); INSERT INTO admission_results VALUES('dubai_paris_denied',false,'unexpected allow');
 EXCEPTION WHEN OTHERS THEN INSERT INTO admission_results VALUES('dubai_paris_denied',true,SQLERRM); END;
END $$;

SELECT set_config('request.jwt.claims','{"sub":"90000000-0000-4000-8000-000000000005","role":"authenticated","aal":"aal1","is_anonymous":false}',true);
DO $$ BEGIN
 BEGIN PERFORM public.mp_admin_approve_reorder('80000000-0000-4000-8000-000000000001','v31.2 admission'); INSERT INTO admission_results VALUES('admin_aal1_denied',false,'unexpected allow');
 EXCEPTION WHEN OTHERS THEN INSERT INTO admission_results VALUES('admin_aal1_denied',position('admin_mfa_required' in SQLERRM)>0,SQLERRM); END;
END $$;

SELECT set_config('request.jwt.claims','{"sub":"90000000-0000-4000-8000-000000000005","role":"authenticated","aal":"aal2","is_anonymous":false}',true);
DO $$ BEGIN
 PERFORM public.mp_admin_approve_reorder('80000000-0000-4000-8000-000000000001','v31.2 admission');
 INSERT INTO admission_results VALUES('admin_aal2_allowed',true,'brand_approved');
END $$;

RESET ROLE;

INSERT INTO admission_results SELECT 'anon_private_fit_denied',NOT has_function_privilege('anon','public.mp_private_add_fit_profile_version(uuid,text,numeric,numeric,numeric,numeric,numeric,numeric,numeric,text)','EXECUTE'),'anon denied';
INSERT INTO admission_results SELECT 'anon_reorder_denied',NOT has_function_privilege('anon','public.mp_wholesale_approve_reorder(uuid)','EXECUTE'),'anon denied';

SET LOCAL ROLE authenticated;
DO $$ BEGIN
 BEGIN PERFORM unit_cost FROM public.products LIMIT 1; INSERT INTO admission_results VALUES('unit_cost_denied',false,'unexpected allow');
 EXCEPTION WHEN insufficient_privilege THEN INSERT INTO admission_results VALUES('unit_cost_denied',true,SQLERRM); END;
 BEGIN PERFORM unit_cost_snapshot FROM public.deal_lines LIMIT 1; INSERT INTO admission_results VALUES('unit_cost_snapshot_denied',false,'unexpected allow');
 EXCEPTION WHEN insufficient_privilege THEN INSERT INTO admission_results VALUES('unit_cost_snapshot_denied',true,SQLERRM); END;
 BEGIN PERFORM gross_contribution FROM public.deals LIMIT 1; INSERT INTO admission_results VALUES('gross_contribution_denied',false,'unexpected allow');
 EXCEPTION WHEN insufficient_privilege THEN INSERT INTO admission_results VALUES('gross_contribution_denied',true,SQLERRM); END;
END $$;
RESET ROLE;

SELECT test,pass,detail FROM admission_results ORDER BY test;
DO $$ DECLARE failed integer; total integer; BEGIN
 SELECT count(*),count(*) filter(where not pass) INTO total,failed FROM admission_results;
 IF total<>18 THEN RAISE EXCEPTION 'expected_18_tests_actual_%',total; END IF;
 IF failed<>0 THEN RAISE EXCEPTION 'V31_2_FULL_CONTRACT_ADMISSION_FAILED_%',failed; END IF;
END $$;

ROLLBACK;
\echo V31_2_FULL_CONTRACT_ADMISSION=PASS
