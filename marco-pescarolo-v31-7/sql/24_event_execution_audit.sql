\set ON_ERROR_STOP on

-- Marco Pescarolo v31.7 Event & Execution Integrity — read-only audit.
WITH checks AS (
  SELECT 'deal_event_orphan_or_scope_mismatch' check_name,count(*)::bigint bad
  FROM public.deal_events e LEFT JOIN public.deals d ON d.id=e.deal_id
  WHERE d.id IS NULL OR e.tenant_id<>d.tenant_id

  UNION ALL SELECT 'approval_event_orphan_or_scope_mismatch',count(*)
  FROM public.approval_events e
  LEFT JOIN public.approvals a ON a.id=e.approval_id
  LEFT JOIN public.deals d ON d.id=e.deal_id
  WHERE a.id IS NULL OR d.id IS NULL OR a.deal_id<>e.deal_id
     OR a.tenant_id<>e.tenant_id OR d.tenant_id<>e.tenant_id

  UNION ALL SELECT 'payment_event_orphan_or_scope_mismatch',count(*)
  FROM public.payment_events e
  LEFT JOIN public.payments p ON p.id=e.payment_id
  LEFT JOIN public.deals d ON d.id=e.deal_id
  LEFT JOIN public.proformas f ON f.id=e.proforma_id
  WHERE p.id IS NULL OR d.id IS NULL OR p.deal_id<>e.deal_id
     OR p.tenant_id<>e.tenant_id OR d.tenant_id<>e.tenant_id
     OR (e.proforma_id IS NOT NULL AND (f.id IS NULL OR f.deal_id<>e.deal_id OR f.tenant_id<>e.tenant_id))

  UNION ALL SELECT 'shipment_event_orphan_or_scope_mismatch',count(*)
  FROM public.shipment_events e
  LEFT JOIN public.shipments s ON s.id=e.shipment_id
  LEFT JOIN public.deals d ON d.id=e.deal_id
  WHERE s.id IS NULL OR d.id IS NULL OR s.deal_id<>e.deal_id
     OR s.tenant_id<>e.tenant_id OR d.tenant_id<>e.tenant_id

  UNION ALL SELECT 'reservation_event_orphan_or_scope_mismatch',count(*)
  FROM public.inventory_reservation_events e
  LEFT JOIN public.inventory_reservations r ON r.id=e.reservation_id
  LEFT JOIN public.deals d ON d.id=e.deal_id
  LEFT JOIN public.deal_lines dl ON dl.id=e.deal_line_id
  WHERE r.id IS NULL OR d.id IS NULL OR dl.id IS NULL
     OR r.deal_id<>e.deal_id OR r.deal_line_id<>e.deal_line_id
     OR r.tenant_id<>e.tenant_id OR d.tenant_id<>e.tenant_id OR dl.tenant_id<>e.tenant_id

  UNION ALL SELECT 'reorder_event_orphan_or_scope_mismatch',count(*)
  FROM public.reorder_events e LEFT JOIN public.reorder_proposals p ON p.id=e.proposal_id
  WHERE p.id IS NULL OR p.tenant_id<>e.tenant_id

  UNION ALL SELECT 'approval_state_without_event',count(*)
  FROM public.approvals a
  WHERE a.status IN ('approved','rejected','waived')
    AND NOT EXISTS (
      SELECT 1 FROM public.approval_events e
      WHERE e.approval_id=a.id AND e.tenant_id=a.tenant_id AND e.action=a.status
    )

  UNION ALL SELECT 'payment_state_without_event',count(*)
  FROM public.payments p
  WHERE p.status IN ('verified','rejected','reversed')
    AND NOT EXISTS (
      SELECT 1 FROM public.payment_events e
      WHERE e.payment_id=p.id AND e.tenant_id=p.tenant_id AND e.to_status=p.status
    )

  UNION ALL SELECT 'shipment_state_without_event',count(*)
  FROM public.shipments s
  WHERE s.status IN ('packing','in_transit','delivered')
    AND NOT EXISTS (
      SELECT 1 FROM public.shipment_events e
      WHERE e.shipment_id=s.id AND e.tenant_id=s.tenant_id
        AND e.event_type=CASE s.status WHEN 'packing' THEN 'packing_started' WHEN 'in_transit' THEN 'shipped' ELSE 'delivered' END
    )

  UNION ALL SELECT 'reservation_state_without_event',count(*)
  FROM public.inventory_reservations r
  WHERE r.status IN ('reserved','released','consumed','expired')
    AND NOT EXISTS (
      SELECT 1 FROM public.inventory_reservation_events e
      WHERE e.reservation_id=r.id AND e.tenant_id=r.tenant_id AND e.event_type=r.status
    )

  UNION ALL SELECT 'reorder_state_without_event',count(*)
  FROM public.reorder_proposals p
  WHERE p.status IN ('proposed','reviewed','buyer_approved','brand_approved','rejected','converted','invoiced','allocated','shipped','expired')
    AND NOT EXISTS (
      SELECT 1 FROM public.reorder_events e
      WHERE e.proposal_id=p.id AND e.tenant_id=p.tenant_id
        AND e.event_type=CASE p.status WHEN 'proposed' THEN 'created' ELSE p.status END
    )
)
SELECT jsonb_build_object(
  'gate','v31.7-event-execution-audit',
  'checks',jsonb_agg(jsonb_build_object('check',check_name,'bad_rows',bad) ORDER BY check_name),
  'violations_total',sum(bad),
  'outbox',jsonb_build_object(
    'rows',(SELECT count(*) FROM public.outbox_events),
    'pending',(SELECT count(*) FROM public.outbox_events WHERE status='pending'),
    'failed',(SELECT count(*) FROM public.outbox_events WHERE status='failed'),
    'dead_letter',(SELECT count(*) FROM public.outbox_events WHERE status='dead_letter')
  )
) AS v31_7_event_execution_audit
FROM checks;