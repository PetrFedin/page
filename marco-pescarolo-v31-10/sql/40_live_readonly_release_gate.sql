-- Marco Pescarolo — read-only production admission inventory.
-- Safe to run in Supabase SQL Editor on the authorized project. No DDL/DML, no PII output.
-- This is NOT a migration and never grants permission to deploy.
WITH inventory AS (
 SELECT
 (SELECT count(*)::int FROM auth.users) AS auth_users,
 (SELECT count(*)::int FROM public.portal_memberships) AS portal_memberships,
 (SELECT count(*)::int FROM public.mp_brand_admin_memberships) AS admin_memberships,
 (SELECT count(*)::int FROM public.portal_invitations) AS invitations,
 (SELECT count(*)::int FROM public.products WHERE publication_status='published') AS published_products,
 (SELECT count(*)::int FROM public.products WHERE publication_status='published'
      AND (retail_price IS NULL OR retail_price<=0)) AS missing_retail_price,
 (SELECT count(*)::int FROM public.media_assets) AS media_assets,
 (SELECT count(*)::int FROM public.media_assets WHERE rights_status IN ('brand_owned','brand_authorized')) AS media_rights_qualified,
 (SELECT count(*)::int FROM public.product_media) AS product_media,
 (SELECT count(*)::int FROM public.product_media WHERE mapping_status='verified') AS verified_product_media,
 (SELECT count(*)::int FROM public.products p WHERE p.publication_status='published' AND NOT EXISTS (
    SELECT 1 FROM public.product_media pm
      JOIN public.media_assets ma ON ma.id=pm.media_asset_id AND ma.tenant_id=pm.tenant_id
    WHERE pm.product_id=p.id AND pm.tenant_id=p.tenant_id
      AND pm.mapping_status='verified' AND ma.status='active'
      AND ma.rights_status IN ('brand_owned','brand_authorized')
      AND ma.source_url LIKE 'https://%'
  )) AS published_without_approved_media,
 (SELECT count(*)::int FROM public.deals) AS deals,
 (SELECT count(*)::int FROM public.outbox_events) AS outbox_events,
 (SELECT count(*)::int FROM public.schema_migrations) AS migrations,
 (SELECT count(*)::int FROM pg_tables WHERE schemaname='public') AS public_tables,
 (SELECT count(*)::int FROM pg_tables WHERE schemaname='public' AND rowsecurity) AS public_rls_tables,
 (to_regprocedure('public.mp_worker_outbox_claim(text,integer,integer)') IS NOT NULL) AS outbox_worker_applied
),
integrity AS (
 SELECT
 (SELECT count(*)::int FROM public.deal_events e LEFT JOIN public.deals d ON d.id=e.deal_id
  WHERE d.id IS NULL OR d.tenant_id<>e.tenant_id) AS bad_deal_events,
 (SELECT count(*)::int FROM public.payment_events e LEFT JOIN public.payments p ON p.id=e.payment_id
  WHERE p.id IS NULL OR p.tenant_id<>e.tenant_id OR p.deal_id<>e.deal_id) AS bad_payment_events,
 (SELECT count(*)::int FROM public.shipment_events e LEFT JOIN public.shipments s ON s.id=e.shipment_id
  WHERE s.id IS NULL OR s.tenant_id<>e.tenant_id OR s.deal_id<>e.deal_id) AS bad_shipment_events,
 (SELECT count(*)::int FROM public.reorder_events e LEFT JOIN public.reorder_proposals r ON r.id=e.proposal_id
  WHERE r.id IS NULL OR r.tenant_id<>e.tenant_id) AS bad_reorder_events,
 (SELECT count(*)::int FROM public.payments p WHERE p.status IN ('verified','rejected','reversed')
  AND NOT EXISTS (SELECT 1 FROM public.payment_events e WHERE e.payment_id=p.id AND e.to_status=p.status))
   AS missing_payment_receipts,
 (SELECT count(*)::int FROM public.shipments s WHERE s.status IN ('packing','in_transit','delivered')
  AND NOT EXISTS (SELECT 1 FROM public.shipment_events e WHERE e.shipment_id=s.id
   AND e.event_type=CASE s.status WHEN 'packing' THEN 'packing_started'
    WHEN 'in_transit' THEN 'shipped' ELSE 'delivered' END)) AS missing_shipment_receipts,
 (SELECT count(*)::int FROM public.reorder_proposals r WHERE r.status='ordered') AS inadmissible_ordered_reorders
)
SELECT jsonb_pretty(jsonb_build_object(
 'audit_time_utc', now(),
 'source','live_supabase_authorized_readonly',
 'production_status','HOLD — requires full-clone migration qualification, signed JWT negative E2E, and commercial acceptance',
 'inventory', to_jsonb(inventory),
 'event_integrity',to_jsonb(integrity),
 'integrity_zero_observed_violations',
   (integrity.bad_deal_events+integrity.bad_payment_events+integrity.bad_shipment_events+
    integrity.bad_reorder_events+integrity.missing_payment_receipts+
    integrity.missing_shipment_receipts+integrity.inadmissible_ordered_reorders)=0,
 'commercial_blocked',
   inventory.auth_users=0 OR inventory.portal_memberships=0 OR inventory.admin_memberships=0
   OR inventory.missing_retail_price>0
   OR inventory.published_without_approved_media>0
   OR inventory.verified_product_media<inventory.product_media
   OR NOT inventory.outbox_worker_applied
)) AS marco_release_gate
FROM inventory CROSS JOIN integrity;
