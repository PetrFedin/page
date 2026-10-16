\set ON_ERROR_STOP on

-- Marco Pescarolo v31.4 CI live-shape patch.
-- Adds only the live columns/tables/RPC signatures required to execute the
-- v31.4 hardening candidate against the reusable v31.2 full-contract baseline.

ALTER TABLE public.deals
  ADD COLUMN IF NOT EXISTS data_class text NOT NULL DEFAULT 'demo'
    CHECK (data_class IN ('production','demo','synthetic')),
  ADD COLUMN IF NOT EXISTS client_request_id uuid,
  ADD COLUMN IF NOT EXISTS copied_from_deal_id uuid REFERENCES public.deals(id),
  ADD COLUMN IF NOT EXISTS root_deal_id uuid REFERENCES public.deals(id),
  ADD COLUMN IF NOT EXISTS copy_depth integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS discount_amount numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS advance_pct numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS advance_required numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS advance_confirmed numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS expected_delivery_start date,
  ADD COLUMN IF NOT EXISTS expected_delivery_end date;

CREATE UNIQUE INDEX IF NOT EXISTS uq_deals_client_request
  ON public.deals(tenant_id,client_request_id) WHERE client_request_id IS NOT NULL;
ALTER TABLE public.deal_lines ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

CREATE TABLE IF NOT EXISTS public.deal_revisions(
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id),
  deal_id uuid NOT NULL REFERENCES public.deals(id) ON DELETE CASCADE,
  revision_no integer NOT NULL,
  revision_type text NOT NULL,
  actor_user_id uuid,
  source_deal_id uuid,
  source_revision_no integer,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(deal_id,revision_no)
);

CREATE TABLE IF NOT EXISTS public.proformas(
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id),
  deal_id uuid NOT NULL REFERENCES public.deals(id) ON DELETE CASCADE,
  version integer NOT NULL DEFAULT 1,
  number text NOT NULL,
  status text NOT NULL DEFAULT 'issued',
  currency text NOT NULL DEFAULT 'EUR',
  amount numeric NOT NULL DEFAULT 0,
  advance_amount numeric NOT NULL DEFAULT 0,
  document_url text,
  issued_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.payments(
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id),
  deal_id uuid NOT NULL REFERENCES public.deals(id) ON DELETE CASCADE,
  proforma_id uuid REFERENCES public.proformas(id),
  provider text,
  external_reference text,
  currency text NOT NULL DEFAULT 'EUR',
  amount numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'submitted',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.sell_through_batches(
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id),
  client_id uuid NOT NULL REFERENCES public.clients(id),
  client_store_id uuid REFERENCES public.client_stores(id),
  status text NOT NULL DEFAULT 'accepted',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION private.portal_scope_allows(
  p_tenant_id uuid,p_client_id uuid,p_store_id uuid,p_role text
) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $$
 SELECT EXISTS(
   SELECT 1 FROM public.portal_memberships pm
   WHERE pm.auth_user_id=auth.uid() AND pm.status='active'
     AND pm.access_role=p_role AND pm.tenant_id=p_tenant_id AND pm.client_id=p_client_id
     AND (p_role<>'buyer' OR pm.client_store_id IS NULL OR pm.client_store_id=p_store_id)
 );
$$;

CREATE OR REPLACE FUNCTION public.capture_deal_revision(
 p_deal_id uuid,p_revision_type text,p_actor_user_id uuid,p_reason text,
 p_source_deal_id uuid DEFAULT NULL,p_source_revision_no integer DEFAULT NULL
) RETURNS uuid LANGUAGE plpgsql SET search_path='pg_catalog','public' AS $$
DECLARE d public.deals%ROWTYPE; rid uuid; rno integer;
BEGIN
 SELECT * INTO d FROM public.deals WHERE id=p_deal_id FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'deal not found'; END IF;
 rno:=d.current_revision+1;
 INSERT INTO public.deal_revisions(tenant_id,deal_id,revision_no,revision_type,actor_user_id,source_deal_id,source_revision_no,reason)
 VALUES(d.tenant_id,d.id,rno,p_revision_type,p_actor_user_id,p_source_deal_id,p_source_revision_no,p_reason)
 RETURNING id INTO rid;
 UPDATE public.deals SET current_revision=rno,updated_at=now() WHERE id=d.id;
 RETURN rid;
END $$;

CREATE OR REPLACE FUNCTION public.copy_deal(
 p_source_deal_id uuid,p_target_store_id uuid,p_new_code text,p_new_title text,
 p_buyer_reference text,p_actor_user_id uuid
) RETURNS uuid LANGUAGE plpgsql SET search_path='pg_catalog','public' AS $$
DECLARE s public.deals%ROWTYPE; n uuid;
BEGIN
 SELECT * INTO s FROM public.deals WHERE id=p_source_deal_id FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'source deal not found'; END IF;
 INSERT INTO public.deals(
   tenant_id,code,client_id,owner_user_id,season,stage,currency,subtotal,total_amount,
   gross_contribution,client_store_id,title,buyer_reference,copied_from_deal_id,root_deal_id,copy_depth
 ) VALUES(
   s.tenant_id,p_new_code,s.client_id,s.owner_user_id,s.season,'draft',s.currency,s.subtotal,s.total_amount,
   s.gross_contribution,p_target_store_id,p_new_title,p_buyer_reference,s.id,coalesce(s.root_deal_id,s.id),s.copy_depth+1
 ) RETURNING id INTO n;
 INSERT INTO public.deal_lines(tenant_id,deal_id,product_id,product_variant_id,style_snapshot,sku_snapshot,qty,unit_price,unit_cost_snapshot,line_total)
 SELECT tenant_id,n,product_id,product_variant_id,style_snapshot,sku_snapshot,qty,unit_price,unit_cost_snapshot,line_total
 FROM public.deal_lines WHERE deal_id=s.id;
 PERFORM public.capture_deal_revision(n,'copy',p_actor_user_id,'CI copy',s.id,s.current_revision);
 RETURN n;
END $$;

-- Live-compatible access authority: UI role and DB role are separate values.
CREATE OR REPLACE FUNCTION public.mp_my_access() RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path='' AS $$
DECLARE m jsonb; a boolean;
BEGIN
 IF auth.uid() IS NULL THEN RAISE EXCEPTION 'authentication_required'; END IF;
 SELECT COALESCE(jsonb_agg(jsonb_build_object(
   'access_role',CASE access_role WHEN 'private_client' THEN 'private' WHEN 'buyer' THEN 'wholesale' ELSE access_role END,
   'db_role',access_role,'tenant_id',tenant_id,'client_id',client_id,'client_store_id',client_store_id
 )),'[]'::jsonb) INTO m
 FROM public.portal_memberships WHERE auth_user_id=auth.uid() AND status='active';
 SELECT EXISTS(SELECT 1 FROM public.mp_brand_admin_memberships WHERE auth_user_id=auth.uid() AND status='active') INTO a;
 RETURN jsonb_build_object('memberships',m,'admin',a);
END $$;

CREATE OR REPLACE FUNCTION public.mp_client_snapshot(p_access_role text,p_store_id uuid DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path='' AS $$
DECLARE m public.portal_memberships%ROWTYPE;
BEGIN
 IF p_access_role NOT IN ('buyer','private_client') THEN RAISE EXCEPTION 'unsupported_access_role'; END IF;
 m:=private.require_portal_role(p_access_role);
 IF p_access_role='private_client' AND p_store_id IS NOT NULL THEN RAISE EXCEPTION 'private_store_scope_denied'; END IF;
 IF p_access_role='buyer' AND p_store_id IS NOT NULL AND NOT EXISTS(
   SELECT 1 FROM public.client_stores s WHERE s.id=p_store_id AND s.tenant_id=m.tenant_id
     AND s.client_id=m.client_id AND s.is_active AND (m.client_store_id IS NULL OR m.client_store_id=s.id)
 ) THEN RAISE EXCEPTION 'store_scope_denied'; END IF;
 RETURN jsonb_build_object(
   'mode','SERVER','role',p_access_role,'client_id',m.client_id,'store_scope',coalesce(p_store_id,m.client_store_id),
   'orders',coalesce((SELECT jsonb_agg(jsonb_build_object(
      'id',d.id,'code',d.code,'data_class',d.data_class,'stage',d.stage,'created_at',d.created_at
    ) ORDER BY d.created_at DESC)
    FROM public.deals d WHERE d.tenant_id=m.tenant_id AND d.client_id=m.client_id
      AND (p_access_role='private_client' OR p_store_id IS NULL OR d.client_store_id=p_store_id)),'[]'::jsonb)
 );
END $$;

CREATE OR REPLACE FUNCTION public.mp_client_issued_proformas(p_access_role text)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path='' AS $$
DECLARE m public.portal_memberships%ROWTYPE;
BEGIN
 m:=private.require_portal_role(p_access_role);
 RETURN coalesce((SELECT jsonb_agg(jsonb_build_object('id',p.id,'deal_id',p.deal_id,'number',p.number,'status',p.status))
 FROM public.proformas p JOIN public.deals d ON d.id=p.deal_id
 WHERE d.tenant_id=m.tenant_id AND d.client_id=m.client_id AND p.status='issued'),'[]'::jsonb);
END $$;

CREATE OR REPLACE FUNCTION public.mp_private_submit_order(p_deal_id uuid,p_expected_revision integer)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE d public.deals%ROWTYPE; m public.portal_memberships%ROWTYPE; r uuid;
BEGIN
 m:=private.require_portal_role('private_client');
 SELECT * INTO d FROM public.deals WHERE id=p_deal_id AND tenant_id=m.tenant_id AND client_id=m.client_id FOR UPDATE;
 IF NOT FOUND OR d.current_revision<>p_expected_revision THEN RAISE EXCEPTION 'private_order_version_conflict'; END IF;
 UPDATE public.deals SET stage='submitted',updated_at=now() WHERE id=d.id;
 r:=public.capture_deal_revision(d.id,'submit',m.public_user_id,'CI private submit'); RETURN r;
END $$;

CREATE OR REPLACE FUNCTION public.mp_private_accept_revision(p_deal_id uuid,p_expected_revision integer)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE d public.deals%ROWTYPE; m public.portal_memberships%ROWTYPE; r uuid;
BEGIN
 m:=private.require_portal_role('private_client'); SELECT * INTO d FROM public.deals WHERE id=p_deal_id FOR UPDATE;
 IF NOT FOUND OR d.tenant_id<>m.tenant_id OR d.client_id<>m.client_id OR d.current_revision<>p_expected_revision THEN RAISE EXCEPTION 'private_revision_conflict'; END IF;
 UPDATE public.deals SET stage='approval_pending',updated_at=now() WHERE id=d.id;
 r:=public.capture_deal_revision(d.id,'private_accept',m.public_user_id,'CI private accept'); RETURN r;
END $$;

CREATE OR REPLACE FUNCTION public.mp_private_submit_payment_evidence(p_deal_id uuid,p_proforma_id uuid,p_amount numeric,p_provider text,p_reference text)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE m public.portal_memberships%ROWTYPE; d public.deals%ROWTYPE; pid uuid;
BEGIN
 m:=private.require_portal_role('private_client'); SELECT * INTO d FROM public.deals WHERE id=p_deal_id FOR UPDATE;
 IF NOT FOUND OR d.tenant_id<>m.tenant_id OR d.client_id<>m.client_id THEN RAISE EXCEPTION 'private_order_not_found'; END IF;
 INSERT INTO public.payments(tenant_id,deal_id,proforma_id,provider,external_reference,currency,amount,status)
 VALUES(d.tenant_id,d.id,p_proforma_id,p_provider,p_reference,d.currency,p_amount,'submitted') RETURNING id INTO pid;
 RETURN pid;
END $$;

CREATE OR REPLACE FUNCTION public.portal_create_draft_order(p_store_id uuid,p_title text,p_buyer_reference text,p_season text,p_client_request_id uuid)
RETURNS uuid LANGUAGE plpgsql SECURITY INVOKER SET search_path='pg_catalog','public','private' AS $$
DECLARE m public.portal_memberships%ROWTYPE; d uuid; c text;
BEGIN
 m:=private.require_portal_role('buyer');
 IF p_client_request_id IS NOT NULL THEN
   SELECT id INTO d FROM public.deals WHERE tenant_id=m.tenant_id AND client_request_id=p_client_request_id;
   IF FOUND THEN RETURN d; END IF;
 END IF;
 IF NOT EXISTS(SELECT 1 FROM public.client_stores s WHERE s.id=p_store_id AND s.tenant_id=m.tenant_id AND s.client_id=m.client_id AND s.is_active) THEN RAISE EXCEPTION 'store unavailable'; END IF;
 c:='CI-WEB-'||substr(replace(gen_random_uuid()::text,'-',''),1,8);
 INSERT INTO public.deals(tenant_id,code,client_id,season,stage,currency,client_store_id,title,buyer_reference,client_request_id)
 SELECT m.tenant_id,c,m.client_id,p_season,'draft',x.currency,p_store_id,p_title,p_buyer_reference,p_client_request_id
 FROM public.clients x WHERE x.id=m.client_id RETURNING id INTO d;
 PERFORM public.capture_deal_revision(d,'create',m.public_user_id,'CI buyer create'); RETURN d;
END $$;

CREATE OR REPLACE FUNCTION public.portal_set_deal_line(p_deal_id uuid,p_product_id uuid,p_product_variant_id uuid,p_qty integer)
RETURNS uuid LANGUAGE plpgsql SECURITY INVOKER SET search_path='pg_catalog','public','private' AS $$
DECLARE m public.portal_memberships%ROWTYPE; lid uuid;
BEGIN
 m:=private.require_portal_role('buyer');
 IF NOT EXISTS(SELECT 1 FROM public.deals d WHERE d.id=p_deal_id AND d.tenant_id=m.tenant_id AND d.client_id=m.client_id) THEN RAISE EXCEPTION 'deal out of scope'; END IF;
 INSERT INTO public.deal_lines(tenant_id,deal_id,product_id,product_variant_id,style_snapshot,sku_snapshot,qty,unit_price,line_total)
 SELECT m.tenant_id,p_deal_id,p.id,p_product_variant_id,p.style_code,p.style_code,p_qty,100,p_qty*100 FROM public.products p WHERE p.id=p_product_id
 RETURNING id INTO lid; RETURN lid;
END $$;

CREATE OR REPLACE FUNCTION public.portal_apply_size_run(p_deal_id uuid,p_product_id uuid,p_color text,p_quantities jsonb,p_reason text)
RETURNS jsonb LANGUAGE sql SECURITY INVOKER SET search_path='pg_catalog','public','private' AS $$
 SELECT jsonb_build_object('deal_id',p_deal_id,'product_id',p_product_id,'quantities',p_quantities);
$$;
CREATE OR REPLACE FUNCTION public.portal_save_draft_revision(p_deal_id uuid,p_reason text)
RETURNS uuid LANGUAGE plpgsql SECURITY INVOKER SET search_path='pg_catalog','public','private' AS $$
DECLARE m public.portal_memberships%ROWTYPE; BEGIN m:=private.require_portal_role('buyer'); RETURN public.capture_deal_revision(p_deal_id,'edit',m.public_user_id,p_reason); END $$;
CREATE OR REPLACE FUNCTION public.mp_wholesale_submit_order(p_deal_id uuid,p_expected_revision integer)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE m public.portal_memberships%ROWTYPE; d public.deals%ROWTYPE; r uuid; BEGIN m:=private.require_portal_role('buyer'); SELECT * INTO d FROM public.deals WHERE id=p_deal_id FOR UPDATE; IF NOT FOUND OR d.tenant_id<>m.tenant_id OR d.client_id<>m.client_id OR d.current_revision<>p_expected_revision THEN RAISE EXCEPTION 'buyer version conflict'; END IF; UPDATE public.deals SET stage='submitted' WHERE id=d.id; r:=public.capture_deal_revision(d.id,'submit',m.public_user_id,'CI submit'); RETURN r; END $$;
CREATE OR REPLACE FUNCTION public.mp_wholesale_accept_revision(p_deal_id uuid,p_expected_revision integer)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE m public.portal_memberships%ROWTYPE; d public.deals%ROWTYPE; r uuid; BEGIN m:=private.require_portal_role('buyer'); SELECT * INTO d FROM public.deals WHERE id=p_deal_id FOR UPDATE; IF NOT FOUND OR d.tenant_id<>m.tenant_id OR d.client_id<>m.client_id OR d.current_revision<>p_expected_revision THEN RAISE EXCEPTION 'buyer revision conflict'; END IF; UPDATE public.deals SET stage='approval_pending' WHERE id=d.id; r:=public.capture_deal_revision(d.id,'buyer_accept',m.public_user_id,'CI accept'); RETURN r; END $$;
CREATE OR REPLACE FUNCTION public.portal_submit_payment_evidence(p_deal_id uuid,p_proforma_id uuid,p_amount numeric,p_currency text,p_provider text,p_external_reference text,p_evidence_hash text,p_evidence_url text)
RETURNS uuid LANGUAGE plpgsql SECURITY INVOKER SET search_path='pg_catalog','public','private' AS $$
DECLARE m public.portal_memberships%ROWTYPE; d public.deals%ROWTYPE; pid uuid; BEGIN m:=private.require_portal_role('buyer'); SELECT * INTO d FROM public.deals WHERE id=p_deal_id; IF NOT FOUND OR d.tenant_id<>m.tenant_id OR d.client_id<>m.client_id THEN RAISE EXCEPTION 'deal out of scope'; END IF; INSERT INTO public.payments(tenant_id,deal_id,proforma_id,provider,external_reference,currency,amount,status) VALUES(d.tenant_id,d.id,p_proforma_id,p_provider,p_external_reference,p_currency,p_amount,'submitted') RETURNING id INTO pid; RETURN pid; END $$;

CREATE OR REPLACE FUNCTION public.portal_copy_deal(p_source_deal_id uuid,p_target_store_id uuid,p_new_title text,p_buyer_reference text)
RETURNS uuid LANGUAGE plpgsql SECURITY INVOKER SET search_path='pg_catalog','public','private' AS $$
DECLARE m public.portal_memberships%ROWTYPE; c text; BEGIN m:=private.require_portal_role('buyer'); c:='CI-COPY-'||substr(replace(gen_random_uuid()::text,'-',''),1,8); RETURN public.copy_deal(p_source_deal_id,p_target_store_id,c,p_new_title,p_buyer_reference,m.public_user_id); END $$;
CREATE OR REPLACE FUNCTION public.portal_update_draft_header(p_deal_id uuid,p_store_id uuid,p_title text,p_buyer_reference text,p_notes text)
RETURNS uuid LANGUAGE sql SECURITY INVOKER AS $$ SELECT p_deal_id $$;
CREATE OR REPLACE FUNCTION public.portal_remove_deal_line(p_deal_id uuid,p_line_id uuid)
RETURNS void LANGUAGE sql SECURITY INVOKER AS $$ DELETE FROM public.deal_lines WHERE id=p_line_id AND deal_id=p_deal_id $$;
CREATE OR REPLACE FUNCTION public.portal_save_complete_look(p_deal_id uuid,p_primary_product_id uuid,p_group_id uuid,p_items jsonb,p_reason text)
RETURNS jsonb LANGUAGE sql SECURITY INVOKER AS $$ SELECT jsonb_build_object('deal_id',p_deal_id) $$;
CREATE OR REPLACE FUNCTION public.portal_submit_deal(p_deal_id uuid)
RETURNS uuid LANGUAGE sql SECURITY INVOKER AS $$ SELECT public.capture_deal_revision(p_deal_id,'submit',NULL,'CI portal submit') $$;
CREATE OR REPLACE FUNCTION public.portal_accept_brand_revision(p_deal_id uuid)
RETURNS uuid LANGUAGE sql SECURITY INVOKER AS $$ SELECT public.capture_deal_revision(p_deal_id,'buyer_accept',NULL,'CI portal accept') $$;

CREATE OR REPLACE FUNCTION public.create_reorder_proposal_from_batch(p_batch_id uuid,p_actor_user_id uuid,p_target_wos numeric)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path='pg_catalog','public' AS $$
DECLARE b public.sell_through_batches%ROWTYPE; r uuid; BEGIN SELECT * INTO b FROM public.sell_through_batches WHERE id=p_batch_id; IF NOT FOUND THEN RAISE EXCEPTION 'batch missing'; END IF; INSERT INTO public.reorder_proposals(tenant_id,client_id,client_store_id,source_batch_id,status,currency,horizon_weeks,created_by,metadata) SELECT b.tenant_id,b.client_id,b.client_store_id,b.id,'proposed',c.currency,p_target_wos,p_actor_user_id,'{}'::jsonb FROM public.clients c WHERE c.id=b.client_id RETURNING id INTO r; RETURN r; END $$;

-- Old browser surface is deliberately wide before the candidate hardens it.
GRANT EXECUTE ON FUNCTION public.mp_client_snapshot(text,uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.mp_client_issued_proformas(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.mp_private_submit_order(uuid,integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.mp_private_accept_revision(uuid,integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.mp_private_submit_payment_evidence(uuid,uuid,numeric,text,text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.portal_create_draft_order(uuid,text,text,text,uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.portal_set_deal_line(uuid,uuid,uuid,integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.portal_apply_size_run(uuid,uuid,text,jsonb,text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.portal_save_draft_revision(uuid,text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.mp_wholesale_submit_order(uuid,integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.mp_wholesale_accept_revision(uuid,integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.portal_submit_payment_evidence(uuid,uuid,numeric,text,text,text,text,text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.portal_copy_deal(uuid,uuid,text,text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.portal_update_draft_header(uuid,uuid,text,text,text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.portal_remove_deal_line(uuid,uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.portal_save_complete_look(uuid,uuid,uuid,jsonb,text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.portal_submit_deal(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.portal_accept_brand_revision(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.copy_deal(uuid,uuid,text,text,text,uuid) TO anon,authenticated;
GRANT EXECUTE ON FUNCTION public.capture_deal_revision(uuid,text,uuid,text,uuid,integer) TO anon,authenticated;

-- Seed tenant/account identities used by v31.4 smoke.
INSERT INTO auth.users(id,email) VALUES
 ('10000000-0000-4000-8000-000000000001','buyer@example.test'),
 ('10000000-0000-4000-8000-000000000002','private@example.test');
INSERT INTO public.users(id,tenant_id,email,display_name,role,is_active) VALUES
 ('20000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000001','buyer@example.test','Buyer','sales',true),
 ('20000000-0000-4000-8000-000000000002','00000000-0000-4000-8000-000000000001','private@example.test','Private','sales',true),
 ('20000000-0000-4000-8000-000000000003','00000000-0000-4000-8000-000000000001','admin@example.test','Admin','admin',true);
INSERT INTO public.clients(id,tenant_id,code,client_type,name,currency,stage) VALUES
 ('30000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000001','WH','wholesale','Wholesale Client','EUR','active'),
 ('30000000-0000-4000-8000-000000000002','00000000-0000-4000-8000-000000000001','PR','private','Private Client','EUR','active');
INSERT INTO public.client_stores(id,tenant_id,client_id,code,name,is_active) VALUES
 ('40000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000001','PAR','Paris',true),
 ('40000000-0000-4000-8000-000000000002','00000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000001','DXB','Dubai',true);
INSERT INTO public.portal_memberships(tenant_id,auth_user_id,public_user_id,client_id,client_store_id,access_role,status) VALUES
 ('00000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000001',NULL,'buyer','active'),
 ('00000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000002','20000000-0000-4000-8000-000000000002','30000000-0000-4000-8000-000000000002',NULL,'private_client','active');

-- Existing same-account demo fixture: v2 snapshot must hide it and v2 mutations must reject it.
INSERT INTO public.deals(id,tenant_id,code,client_id,stage,currency,client_store_id,title,data_class,current_revision)
VALUES('50000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000001','CI-DEMO','30000000-0000-4000-8000-000000000001','draft','EUR','40000000-0000-4000-8000-000000000001','Demo order','demo',0);