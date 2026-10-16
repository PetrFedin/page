\set ON_ERROR_STOP on

-- Additional live-shape objects required by v31.7 PG17 qualification.
ALTER TABLE public.reorder_events ADD COLUMN IF NOT EXISTS occurred_at timestamptz NOT NULL DEFAULT now();

CREATE TABLE IF NOT EXISTS public.approvals(
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id),
  deal_id uuid NOT NULL REFERENCES public.deals(id),
  approval_type text NOT NULL DEFAULT 'commercial',
  required_role text NOT NULL DEFAULT 'admin',
  status text NOT NULL DEFAULT 'pending',
  threshold_amount numeric,
  version integer NOT NULL DEFAULT 1,
  decision_by uuid,
  decision_at timestamptz,
  reason text
);
CREATE TABLE IF NOT EXISTS public.approval_events(
  id bigserial PRIMARY KEY,tenant_id uuid NOT NULL REFERENCES public.tenants(id),approval_id uuid NOT NULL REFERENCES public.approvals(id) ON DELETE CASCADE,
  deal_id uuid NOT NULL REFERENCES public.deals(id),action text NOT NULL,actor_user_id uuid REFERENCES public.users(id),reason text,payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  occurred_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.payment_events(
  id bigserial PRIMARY KEY,tenant_id uuid NOT NULL REFERENCES public.tenants(id),payment_id uuid NOT NULL REFERENCES public.payments(id) ON DELETE CASCADE,
  deal_id uuid NOT NULL REFERENCES public.deals(id),proforma_id uuid REFERENCES public.proformas(id),event_type text NOT NULL,
  from_status text,to_status text,actor_user_id uuid REFERENCES public.users(id),actor_kind text NOT NULL DEFAULT 'system',reason text,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,occurred_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.shipment_events(
  id bigserial PRIMARY KEY,tenant_id uuid NOT NULL REFERENCES public.tenants(id),shipment_id uuid NOT NULL REFERENCES public.shipments(id) ON DELETE CASCADE,
  deal_id uuid NOT NULL REFERENCES public.deals(id),event_type text NOT NULL,location text,payload jsonb NOT NULL DEFAULT '{}'::jsonb,occurred_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.inventory_reservation_events(
  id bigserial PRIMARY KEY,tenant_id uuid NOT NULL REFERENCES public.tenants(id),reservation_id uuid NOT NULL REFERENCES public.inventory_reservations(id) ON DELETE CASCADE,
  deal_id uuid NOT NULL REFERENCES public.deals(id),deal_line_id uuid NOT NULL REFERENCES public.deal_lines(id),event_type text NOT NULL,qty integer NOT NULL,
  actor_user_id uuid REFERENCES public.users(id),reason text,payload jsonb NOT NULL DEFAULT '{}'::jsonb,occurred_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.outbox_events(
  id bigserial PRIMARY KEY,tenant_id uuid NOT NULL REFERENCES public.tenants(id),event_type text NOT NULL,aggregate_type text NOT NULL,aggregate_id uuid,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,status text NOT NULL DEFAULT 'pending',attempts integer NOT NULL DEFAULT 0,
  next_attempt_at timestamptz NOT NULL DEFAULT now(),created_at timestamptz NOT NULL DEFAULT now(),processed_at timestamptz
);
CREATE INDEX IF NOT EXISTS outbox_pending_idx ON public.outbox_events(status,next_attempt_at,id) WHERE status IN ('pending','failed');

-- v31.7 tests need exact live-style revision columns absent from the compact v31.4 fixture.
ALTER TABLE public.deal_revisions
  ADD COLUMN IF NOT EXISTS header_snapshot jsonb,
  ADD COLUMN IF NOT EXISTS lines_snapshot jsonb,
  ADD COLUMN IF NOT EXISTS snapshot_hash text;