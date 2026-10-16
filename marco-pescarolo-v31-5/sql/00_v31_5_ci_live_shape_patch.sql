\set ON_ERROR_STOP on

-- Additional live-shape objects needed by the v31.5 lifecycle gate.
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS payment_type text NOT NULL DEFAULT 'advance';
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS verified_at timestamptz;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS verified_by uuid;
ALTER TABLE public.proformas ADD COLUMN IF NOT EXISTS balance_amount numeric NOT NULL DEFAULT 0;

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
  variant_authority text NOT NULL DEFAULT 'presentation_only',
  sort_order integer NOT NULL DEFAULT 0,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE(tenant_id,sku)
);

CREATE TABLE IF NOT EXISTS public.inventory_positions(
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id),
  product_variant_id uuid NOT NULL REFERENCES public.product_variants(id),
  location_code text NOT NULL,
  on_hand integer NOT NULL DEFAULT 0,
  incoming integer NOT NULL DEFAULT 0,
  reserved integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  data_class text NOT NULL DEFAULT 'demo',
  source_kind text NOT NULL DEFAULT 'manual'
);
CREATE TABLE IF NOT EXISTS public.inventory_reservations(
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id),
  deal_id uuid NOT NULL REFERENCES public.deals(id),
  deal_line_id uuid NOT NULL REFERENCES public.deal_lines(id),
  position_id uuid NOT NULL REFERENCES public.inventory_positions(id),
  qty integer NOT NULL,
  status text NOT NULL DEFAULT 'reserved',
  expires_at timestamptz,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  source_bucket text NOT NULL DEFAULT 'on_hand',
  allocation_batch_id uuid,
  released_at timestamptz,
  consumed_at timestamptz,
  release_reason text
);

-- A real Admin identity for the read-only integrity RPC smoke.
INSERT INTO auth.users(id,email) VALUES
 ('10000000-0000-4000-8000-000000000003','admin@example.test')
ON CONFLICT DO NOTHING;
INSERT INTO public.mp_brand_admin_memberships(tenant_id,auth_user_id,public_user_id,status)
VALUES('00000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000003','20000000-0000-4000-8000-000000000003','active')
ON CONFLICT DO NOTHING;