\set ON_ERROR_STOP on

-- v31.3 hash-faithful dependency patch for exact v30.9 qualification.
-- Mirrors the six live dependency function definitions guarded by v30.9 preflight.

CREATE TABLE IF NOT EXISTS public.size_chart_versions(
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id),
  code text NOT NULL,
  name text NOT NULL,
  audience text NOT NULL,
  category text NOT NULL,
  version integer NOT NULL,
  source_kind text NOT NULL,
  source_ref text,
  unit text NOT NULL DEFAULT 'cm',
  status text NOT NULL DEFAULT 'draft',
  effective_from date,
  effective_to date,
  notes text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.size_chart_entries(
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id),
  chart_version_id uuid NOT NULL REFERENCES public.size_chart_versions(id),
  size_label text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  height_min_cm numeric,height_max_cm numeric,
  chest_min_cm numeric,chest_max_cm numeric,
  waist_min_cm numeric,waist_max_cm numeric,
  hips_min_cm numeric,hips_max_cm numeric,
  inseam_min_cm numeric,inseam_max_cm numeric,
  shoulder_min_cm numeric,shoulder_max_cm numeric,
  sleeve_min_cm numeric,sleeve_max_cm numeric,
  garment_measurements jsonb NOT NULL DEFAULT '{}'::jsonb,
  grading jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.product_fit_rules(
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id),
  product_id uuid NOT NULL REFERENCES public.products(id),
  size_chart_version_id uuid REFERENCES public.size_chart_versions(id),
  rule_version integer NOT NULL DEFAULT 1,
  preferred_fit text NOT NULL DEFAULT 'regular',
  measurement_weights jsonb NOT NULL DEFAULT '{"hips":1,"chest":1,"waist":1,"inseam":0.5}'::jsonb,
  fit_adjustments jsonb NOT NULL DEFAULT '{}'::jsonb,
  source_kind text NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.product_variants(
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id),
  product_id uuid NOT NULL REFERENCES public.products(id),
  sku text NOT NULL,
  color text,
  size text,
  barcode text,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  variant_authority text NOT NULL DEFAULT 'legacy_test',
  sort_order integer NOT NULL DEFAULT 0,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE OR REPLACE FUNCTION private.recalculate_deal_totals(p_deal_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'pg_catalog','public'
AS $$
BEGIN
  UPDATE public.deals d
  SET subtotal=coalesce((SELECT sum(line_total) FROM public.deal_lines l WHERE l.deal_id=d.id),0),
      total_amount=coalesce((SELECT sum(line_total) FROM public.deal_lines l WHERE l.deal_id=d.id),0),
      updated_at=now()
  WHERE d.id=p_deal_id;
END
$$;

CREATE OR REPLACE FUNCTION public.capture_deal_revision(p_deal_id uuid,p_revision_type text,p_actor_user_id uuid,p_reason text)
RETURNS uuid
LANGUAGE plpgsql
SET search_path TO 'pg_catalog','public'
AS $$
DECLARE v uuid:=gen_random_uuid();
BEGIN
  UPDATE public.deals SET current_revision=current_revision+1,updated_at=now() WHERE id=p_deal_id;
  RETURN v;
END
$$;

CREATE OR REPLACE FUNCTION private.mp_brand_admin_actor()
RETURNS public.mp_brand_admin_memberships
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE m public.mp_brand_admin_memberships%ROWTYPE;
BEGIN
  IF auth.uid() IS NULL OR COALESCE((auth.jwt()->>'is_anonymous')::boolean,false)
  THEN RAISE EXCEPTION 'brand_admin_login_required' USING ERRCODE='42501'; END IF;
  SELECT x.* INTO m FROM public.mp_brand_admin_memberships x
  JOIN public.tenants t ON t.id=x.tenant_id AND t.slug='marco-pescarolo' AND t.status='active'
  JOIN public.users u ON u.id=x.public_user_id AND u.tenant_id=x.tenant_id
    AND u.is_active=true AND u.role IN ('owner','admin')
  WHERE x.auth_user_id=auth.uid() AND x.status='active' LIMIT 1;
  IF NOT FOUND THEN RAISE EXCEPTION 'brand_admin_membership_required' USING ERRCODE='42501'; END IF;
  RETURN m;
END
$function$;

CREATE OR REPLACE FUNCTION private.portal_buyer_approve_reorder_internal(p_proposal_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'pg_catalog', 'public', 'private'
AS $function$
declare
  v_membership public.portal_memberships%rowtype;
  v_prop public.reorder_proposals%rowtype;
begin
  v_membership:=private.require_portal_role('buyer');

  select * into v_prop
  from public.reorder_proposals
  where id=p_proposal_id
  for update;

  if not found then raise exception 'reorder proposal not found'; end if;
  if v_prop.tenant_id<>v_membership.tenant_id or v_prop.client_id<>v_membership.client_id then
    raise exception 'proposal is outside current buyer account';
  end if;
  if v_prop.status not in ('proposed','reviewed') then
    raise exception 'buyer approval not allowed from status %',v_prop.status;
  end if;

  update public.reorder_proposals
  set status='buyer_approved',approved_by_buyer_at=now(),updated_at=now()
  where id=v_prop.id;

  insert into public.reorder_events(
    tenant_id,proposal_id,event_type,actor_user_id,actor_kind,reason,payload
  )
  values(
    v_prop.tenant_id,v_prop.id,'buyer_approved',v_membership.public_user_id,'buyer',
    'Buyer approved reorder recommendation',
    jsonb_build_object('auth_user_id',v_membership.auth_user_id,'recommendation_only_before_brand_approval',true)
  );

  return 'buyer_approved';
end;
$function$;

CREATE OR REPLACE FUNCTION public.add_fit_profile_version(p_profile_id uuid, p_source text, p_height_cm numeric, p_chest_cm numeric, p_waist_cm numeric, p_hips_cm numeric, p_inseam_cm numeric, p_shoulder_cm numeric DEFAULT NULL::numeric, p_sleeve_cm numeric DEFAULT NULL::numeric, p_measured_by uuid DEFAULT NULL::uuid, p_notes text DEFAULT NULL::text)
RETURNS uuid
LANGUAGE plpgsql
SET search_path TO 'pg_catalog', 'public'
AS $function$
declare
  v_profile public.private_fit_profiles%rowtype;
  v_version integer;
  v_id uuid;
  v_hash text;
begin
  select * into v_profile from public.private_fit_profiles where id=p_profile_id for update;
  if not found then raise exception 'fit profile not found: %',p_profile_id; end if;
  if p_source not in ('self','advisor','import') then raise exception 'unsupported measurement source'; end if;

  v_version := v_profile.active_version + 1;
  v_hash := md5(
    coalesce(p_height_cm::text,'')||'|'||coalesce(p_chest_cm::text,'')||'|'||
    coalesce(p_waist_cm::text,'')||'|'||coalesce(p_hips_cm::text,'')||'|'||
    coalesce(p_inseam_cm::text,'')||'|'||coalesce(p_shoulder_cm::text,'')||'|'||
    coalesce(p_sleeve_cm::text,'')
  );

  insert into public.private_fit_profile_versions(
    tenant_id,profile_id,version,source,height_cm,chest_cm,waist_cm,hips_cm,inseam_cm,
    shoulder_cm,sleeve_cm,measured_by,notes,snapshot_hash
  ) values (
    v_profile.tenant_id,v_profile.id,v_version,p_source,p_height_cm,p_chest_cm,p_waist_cm,
    p_hips_cm,p_inseam_cm,p_shoulder_cm,p_sleeve_cm,p_measured_by,p_notes,v_hash
  ) returning id into v_id;

  update public.private_fit_profiles set active_version=v_version,updated_at=now() where id=v_profile.id;
  return v_id;
end;
$function$;

CREATE OR REPLACE FUNCTION public.compute_fit_recommendation(p_profile_version_id uuid, p_product_id uuid, p_allow_synthetic boolean DEFAULT false)
RETURNS uuid
LANGUAGE plpgsql
SET search_path TO 'pg_catalog', 'public'
AS $function$
declare
  v_profile public.private_fit_profile_versions%rowtype;
  v_product public.products%rowtype;
  v_rule public.product_fit_rules%rowtype;
  v_chart public.size_chart_versions%rowtype;
  v_candidate record;
  v_confidence numeric;
  v_run uuid;
begin
  select * into v_profile from public.private_fit_profile_versions where id=p_profile_version_id;
  if not found then raise exception 'profile version not found'; end if;

  select * into v_product from public.products where id=p_product_id;
  if not found then raise exception 'product not found'; end if;

  select r.* into v_rule
  from public.product_fit_rules r
  join public.size_chart_versions c on c.id=r.size_chart_version_id
  where r.product_id=p_product_id
    and ((r.status='active' and c.status='active')
      or (p_allow_synthetic and r.status='synthetic_test' and c.status='synthetic_test'))
  order by r.rule_version desc
  limit 1;

  if not found then
    insert into public.fit_recommendation_runs(tenant_id,profile_version_id,product_id,status,explanation)
    values(v_product.tenant_id,p_profile_version_id,p_product_id,'chart_unavailable',
      jsonb_build_object('reason','No active brand-verified size chart / fit rule is available for this product'))
    returning id into v_run;
    return v_run;
  end if;

  select * into v_chart from public.size_chart_versions where id=v_rule.size_chart_version_id;

  if v_profile.chest_cm is null and v_profile.waist_cm is null and v_profile.hips_cm is null then
    insert into public.fit_recommendation_runs(
      tenant_id,profile_version_id,product_id,size_chart_version_id,fit_rule_id,status,explanation
    ) values(
      v_product.tenant_id,p_profile_version_id,p_product_id,v_chart.id,v_rule.id,'insufficient_measurements',
      jsonb_build_object('reason','Chest, waist or hips measurement is required'))
    returning id into v_run;
    return v_run;
  end if;

  select e.*,
    (
      case when v_profile.chest_cm is null or e.chest_min_cm is null or e.chest_max_cm is null then 0
           when v_profile.chest_cm < e.chest_min_cm then e.chest_min_cm-v_profile.chest_cm
           when v_profile.chest_cm > e.chest_max_cm then v_profile.chest_cm-e.chest_max_cm else 0 end
      * coalesce((v_rule.measurement_weights->>'chest')::numeric,1)
      +
      case when v_profile.waist_cm is null or e.waist_min_cm is null or e.waist_max_cm is null then 0
           when v_profile.waist_cm < e.waist_min_cm then e.waist_min_cm-v_profile.waist_cm
           when v_profile.waist_cm > e.waist_max_cm then v_profile.waist_cm-e.waist_max_cm else 0 end
      * coalesce((v_rule.measurement_weights->>'waist')::numeric,1)
      +
      case when v_profile.hips_cm is null or e.hips_min_cm is null or e.hips_max_cm is null then 0
           when v_profile.hips_cm < e.hips_min_cm then e.hips_min_cm-v_profile.hips_cm
           when v_profile.hips_cm > e.hips_max_cm then v_profile.hips_cm-e.hips_max_cm else 0 end
      * coalesce((v_rule.measurement_weights->>'hips')::numeric,1)
      +
      case when v_profile.inseam_cm is null or e.inseam_min_cm is null or e.inseam_max_cm is null then 0
           when v_profile.inseam_cm < e.inseam_min_cm then e.inseam_min_cm-v_profile.inseam_cm
           when v_profile.inseam_cm > e.inseam_max_cm then v_profile.inseam_cm-e.inseam_max_cm else 0 end
      * coalesce((v_rule.measurement_weights->>'inseam')::numeric,0.5)
    ) as score
  into v_candidate
  from public.size_chart_entries e
  where e.chart_version_id=v_chart.id
  order by score,e.sort_order
  limit 1;

  if not found then
    insert into public.fit_recommendation_runs(
      tenant_id,profile_version_id,product_id,size_chart_version_id,fit_rule_id,status,explanation
    ) values(
      v_product.tenant_id,p_profile_version_id,p_product_id,v_chart.id,v_rule.id,'no_matching_size',
      jsonb_build_object('reason','Size chart has no entries'))
    returning id into v_run;
    return v_run;
  end if;

  v_confidence:=greatest(0.35,least(0.97,0.94-(v_candidate.score*0.06)));

  insert into public.fit_recommendation_runs(
    tenant_id,profile_version_id,product_id,size_chart_version_id,fit_rule_id,status,
    recommended_size,confidence,explanation
  ) values(
    v_product.tenant_id,p_profile_version_id,p_product_id,v_chart.id,v_rule.id,'recommended',
    v_candidate.size_label,v_confidence,
    jsonb_build_object(
      'basis','Body measurements evaluated against the assigned chart version and product fit rule',
      'score_cm_weighted',v_candidate.score,
      'preferred_fit',v_rule.preferred_fit,
      'chart_code',v_chart.code,
      'chart_version',v_chart.version,
      'source_kind',v_chart.source_kind,
      'production_eligible',v_chart.status='active' and v_rule.status='active'
    ))
  returning id into v_run;
  return v_run;
end;
$function$;

CREATE OR REPLACE FUNCTION public.brand_approve_reorder(p_proposal_id uuid, p_actor_user_id uuid, p_reason text DEFAULT NULL::text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'pg_catalog', 'public'
AS $function$
declare
  v_actor public.users%rowtype;
  v_prop public.reorder_proposals%rowtype;
begin
  select * into v_actor from public.users where id=p_actor_user_id and is_active=true;
  if not found or v_actor.role not in ('sales','merchandising','commercial_director','owner','admin') then
    raise exception 'commercial or merchandising authority required';
  end if;

  select * into v_prop from public.reorder_proposals where id=p_proposal_id for update;
  if not found then raise exception 'reorder proposal not found'; end if;
  if v_actor.tenant_id<>v_prop.tenant_id then raise exception 'actor tenant mismatch'; end if;
  if v_prop.status<>'buyer_approved' then
    raise exception 'brand approval requires buyer_approved, current %',v_prop.status;
  end if;

  update public.reorder_proposals
  set status='brand_approved',approved_by_brand_at=now(),updated_at=now()
  where id=v_prop.id;

  insert into public.reorder_events(
    tenant_id,proposal_id,event_type,actor_user_id,actor_kind,reason,payload
  )
  values(
    v_prop.tenant_id,v_prop.id,'brand_approved',p_actor_user_id,'brand',p_reason,
    jsonb_build_object('ready_for_order_conversion',true)
  );

  return 'brand_approved';
end;
$function$;

CREATE OR REPLACE FUNCTION public.convert_reorder_to_deal(p_proposal_id uuid, p_actor_user_id uuid, p_code text, p_title text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'pg_catalog', 'public'
AS $function$
declare
  v_actor public.users%rowtype;
  v_prop public.reorder_proposals%rowtype;
  v_client public.clients%rowtype;
  v_deal uuid;
  v_count integer;
begin
  select * into v_actor from public.users where id=p_actor_user_id and is_active=true;
  if not found or v_actor.role not in ('sales','commercial_director','owner','admin') then
    raise exception 'sales/commercial authority required';
  end if;

  select * into v_prop from public.reorder_proposals where id=p_proposal_id for update;
  if not found then raise exception 'reorder proposal not found'; end if;
  if v_actor.tenant_id<>v_prop.tenant_id then raise exception 'actor tenant mismatch'; end if;

  if v_prop.converted_deal_id is not null then
    return v_prop.converted_deal_id;
  end if;

  if v_prop.status<>'brand_approved' then
    raise exception 'conversion requires brand_approved, current %',v_prop.status;
  end if;

  select * into v_client from public.clients where id=v_prop.client_id;

  insert into public.deals(
    tenant_id,code,client_id,owner_user_id,season,stage,currency,
    client_store_id,title,buyer_reference,notes,source_reorder_proposal_id
  )
  values(
    v_prop.tenant_id,p_code,v_prop.client_id,p_actor_user_id,null,'draft',v_prop.currency,
    v_prop.client_store_id,coalesce(nullif(btrim(p_title),''),p_code),p_code,
    'Reorder converted from approved sell-through recommendation',v_prop.id
  )
  returning id into v_deal;

  insert into public.deal_lines(
    tenant_id,deal_id,product_id,product_variant_id,style_snapshot,sku_snapshot,
    qty,unit_price,unit_cost_snapshot,line_total
  )
  select
    v_prop.tenant_id,v_deal,rl.product_id,rl.product_variant_id,p.style_code,
    coalesce(pv.sku,p.style_code),rl.recommended_qty,rl.unit_price,p.unit_cost,
    round(rl.recommended_qty*rl.unit_price,2)
  from public.reorder_lines rl
  join public.products p on p.id=rl.product_id
  left join public.product_variants pv on pv.id=rl.product_variant_id
  where rl.proposal_id=v_prop.id and rl.recommended_qty>0;

  get diagnostics v_count=row_count;
  if v_count=0 then raise exception 'proposal has no positive recommended quantities'; end if;

  perform private.recalculate_deal_totals(v_deal);
  perform public.capture_deal_revision(v_deal,'create',p_actor_user_id,'created from approved reorder proposal');

  update public.reorder_proposals
  set status='converted',converted_deal_id=v_deal,updated_at=now()
  where id=v_prop.id;

  insert into public.reorder_events(
    tenant_id,proposal_id,event_type,actor_user_id,actor_kind,reason,payload
  )
  values(
    v_prop.tenant_id,v_prop.id,'converted',p_actor_user_id,'brand',
    'Approved reorder converted into new draft order',
    jsonb_build_object('deal_id',v_deal,'deal_code',p_code,'line_count',v_count)
  );

  insert into public.deal_events(
    tenant_id,deal_id,event_type,from_stage,to_stage,actor_user_id,payload
  )
  values(
    v_prop.tenant_id,v_deal,'reorder_order_created',null,'draft',p_actor_user_id,
    jsonb_build_object('reorder_proposal_id',v_prop.id,'source_batch_id',v_prop.source_batch_id)
  );

  return v_deal;
end;
$function$;

SELECT jsonb_build_object(
  'mp_brand_admin_actor',md5(pg_get_functiondef('private.mp_brand_admin_actor()'::regprocedure)),
  'portal_buyer_approve_reorder_internal',md5(pg_get_functiondef('private.portal_buyer_approve_reorder_internal(uuid)'::regprocedure)),
  'add_fit_profile_version',md5(pg_get_functiondef('public.add_fit_profile_version(uuid,text,numeric,numeric,numeric,numeric,numeric,numeric,numeric,uuid,text)'::regprocedure)),
  'compute_fit_recommendation',md5(pg_get_functiondef('public.compute_fit_recommendation(uuid,uuid,boolean)'::regprocedure)),
  'brand_approve_reorder',md5(pg_get_functiondef('public.brand_approve_reorder(uuid,uuid,text)'::regprocedure)),
  'convert_reorder_to_deal',md5(pg_get_functiondef('public.convert_reorder_to_deal(uuid,uuid,text,text)'::regprocedure))
) AS v31_3_dependency_hashes;
