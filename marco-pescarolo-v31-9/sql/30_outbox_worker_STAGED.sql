-- Marco Pescarolo v31.9 — STAGING ONLY / no production admission.
-- PostgreSQL 17 RPC contract, at-least-once handoff, not an HTTP consumer.
BEGIN;

DO $preflight$
BEGIN
 IF to_regclass('public.outbox_events') IS NULL THEN
   RAISE EXCEPTION 'v319_outbox_missing';
 END IF;
 IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='service_role') THEN
   RAISE EXCEPTION 'v319_service_role_missing';
 END IF;
 IF EXISTS (SELECT 1 FROM public.outbox_events WHERE status='processing') THEN
   RAISE EXCEPTION 'v319_processing_rows_must_be_reconciled_before_upgrade';
 END IF;
END $preflight$;

ALTER TABLE public.outbox_events
 ADD COLUMN IF NOT EXISTS lease_token uuid,
 ADD COLUMN IF NOT EXISTS leased_until timestamptz,
 ADD COLUMN IF NOT EXISTS worker_id text,
 ADD COLUMN IF NOT EXISTS last_error_code text;

DO $constraints$
BEGIN
 IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid='public.outbox_events'::regclass AND conname='mp_v319_lease_shape_chk') THEN
  ALTER TABLE public.outbox_events ADD CONSTRAINT mp_v319_lease_shape_chk CHECK (
    (status='processing' AND lease_token IS NOT NULL AND leased_until IS NOT NULL AND worker_id IS NOT NULL)
    OR
    (status<>'processing' AND lease_token IS NULL AND leased_until IS NULL AND worker_id IS NULL)
  );
 END IF;
 IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid='public.outbox_events'::regclass AND conname='mp_v319_attempts_chk') THEN
  ALTER TABLE public.outbox_events ADD CONSTRAINT mp_v319_attempts_chk CHECK (attempts>=0);
 END IF;
 IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid='public.outbox_events'::regclass AND conname='mp_v319_error_code_chk') THEN
  ALTER TABLE public.outbox_events ADD CONSTRAINT mp_v319_error_code_chk CHECK (
    last_error_code IS NULL OR last_error_code ~ '^[a-z0-9_]{1,64}$'
  );
 END IF;
END $constraints$;

CREATE INDEX IF NOT EXISTS mp_v319_outbox_expired_lease_idx
 ON public.outbox_events(leased_until,id) WHERE status='processing';

-- Invoker-only public RPCs: service_role can SELECT/UPDATE public.outbox_events,
-- while grant on the private schema remains unchanged (no private USAGE needed).
CREATE OR REPLACE FUNCTION public.mp_worker_outbox_claim(
  p_worker_id text, p_batch_limit integer DEFAULT 25, p_lease_seconds integer DEFAULT 90
)
RETURNS TABLE(
  outbox_id bigint,event_tenant_id uuid,event_type text,aggregate_type text,
  aggregate_id uuid,event_payload jsonb,idempotency_key text,
  attempt_number integer,lease_token uuid,leased_until timestamptz
)
LANGUAGE plpgsql VOLATILE SECURITY INVOKER SET search_path=''
AS $f$
DECLARE v_now timestamptz := clock_timestamp();
BEGIN
 IF p_worker_id IS NULL OR p_worker_id !~ '^[a-zA-Z0-9_.-]{1,64}$' THEN
  RAISE EXCEPTION 'mp_outbox_invalid_worker_id' USING ERRCODE='22023';
 END IF;
 IF p_batch_limit IS NULL OR p_batch_limit<1 OR p_batch_limit>100 THEN
  RAISE EXCEPTION 'mp_outbox_invalid_batch_limit' USING ERRCODE='22023';
 END IF;
 IF p_lease_seconds IS NULL OR p_lease_seconds<30 OR p_lease_seconds>300 THEN
  RAISE EXCEPTION 'mp_outbox_invalid_lease' USING ERRCODE='22023';
 END IF;

 -- Expired max-attempt leases and missing source provenance are quarantined.
 WITH stale AS (
  SELECT o.id,CASE
    WHEN length(coalesce(o.payload->>'source_table',''))=0
      OR length(coalesce(o.payload->>'source_event_id',''))=0
    THEN 'source_provenance_missing'
    ELSE 'delivery_attempts_exhausted'
  END AS reason
  FROM public.outbox_events o
  WHERE (
    (o.status IN ('pending','failed') AND o.next_attempt_at<=v_now)
    OR (o.status='processing' AND o.leased_until<=v_now)
  )
  AND (o.attempts>=6
    OR length(coalesce(o.payload->>'source_table',''))=0
    OR length(coalesce(o.payload->>'source_event_id',''))=0)
  ORDER BY o.id LIMIT 100 FOR UPDATE OF o SKIP LOCKED
 )
 UPDATE public.outbox_events o
    SET status='dead_letter',last_error_code=stale.reason,
        lease_token=NULL,leased_until=NULL,worker_id=NULL,next_attempt_at=v_now
   FROM stale WHERE o.id=stale.id;

 RETURN QUERY
 WITH ready AS (
  SELECT o.id FROM public.outbox_events o
  WHERE (
    (o.status IN ('pending','failed') AND o.next_attempt_at<=v_now)
    OR (o.status='processing' AND o.leased_until<=v_now)
  )
  AND o.attempts<6
  AND length(coalesce(o.payload->>'source_table',''))>0
  AND length(coalesce(o.payload->>'source_event_id',''))>0
  ORDER BY o.next_attempt_at,o.id LIMIT p_batch_limit
  FOR UPDATE OF o SKIP LOCKED
 ),
 claimed AS (
  UPDATE public.outbox_events o
     SET status='processing',attempts=o.attempts+1,
         lease_token=pg_catalog.gen_random_uuid(),
         leased_until=v_now + pg_catalog.make_interval(secs=>p_lease_seconds),
         worker_id=p_worker_id,last_error_code=NULL
    FROM ready WHERE o.id=ready.id
  RETURNING o.id,o.tenant_id,o.event_type,o.aggregate_type,o.aggregate_id,
            o.payload,o.attempts,o.lease_token,o.leased_until
 )
 SELECT c.id,c.tenant_id,c.event_type,c.aggregate_type,c.aggregate_id,c.payload,
        'mp-v1:'||(c.payload->>'source_table')||':'||(c.payload->>'source_event_id'),
        c.attempts,c.lease_token,c.leased_until
 FROM claimed c ORDER BY c.id;
END $f$;

CREATE OR REPLACE FUNCTION public.mp_worker_outbox_ack(
 p_outbox_id bigint,p_lease_token uuid
) RETURNS boolean
LANGUAGE plpgsql VOLATILE SECURITY INVOKER SET search_path=''
AS $f$
DECLARE v_rows integer;
BEGIN
 IF p_outbox_id IS NULL OR p_lease_token IS NULL THEN
  RAISE EXCEPTION 'mp_outbox_ack_missing_identity' USING ERRCODE='22023';
 END IF;
 UPDATE public.outbox_events o
    SET status='sent',processed_at=clock_timestamp(),last_error_code=NULL,
        lease_token=NULL,leased_until=NULL,worker_id=NULL
  WHERE o.id=p_outbox_id AND o.status='processing'
    AND o.lease_token=p_lease_token AND o.leased_until>clock_timestamp();
 GET DIAGNOSTICS v_rows=ROW_COUNT;
 RETURN v_rows=1;
END $f$;

CREATE OR REPLACE FUNCTION public.mp_worker_outbox_nack(
 p_outbox_id bigint,p_lease_token uuid,p_error_code text
) RETURNS boolean
LANGUAGE plpgsql VOLATILE SECURITY INVOKER SET search_path=''
AS $f$
DECLARE v_rows integer;
BEGIN
 IF p_outbox_id IS NULL OR p_lease_token IS NULL THEN
  RAISE EXCEPTION 'mp_outbox_nack_missing_identity' USING ERRCODE='22023';
 END IF;
 IF p_error_code IS NULL OR p_error_code !~ '^[a-z0-9_]{1,64}$' THEN
  RAISE EXCEPTION 'mp_outbox_nack_invalid_error_code' USING ERRCODE='22023';
 END IF;
 UPDATE public.outbox_events o
    SET status=CASE WHEN o.attempts>=6 THEN 'dead_letter' ELSE 'failed' END,
        next_attempt_at=clock_timestamp() + pg_catalog.make_interval(
          secs=>LEAST(3600,15*CAST(pg_catalog.power(2,LEAST(o.attempts-1,8)) AS integer))
        ),
        last_error_code=p_error_code,processed_at=NULL,
        lease_token=NULL,leased_until=NULL,worker_id=NULL
  WHERE o.id=p_outbox_id AND o.status='processing'
    AND o.lease_token=p_lease_token AND o.leased_until>clock_timestamp();
 GET DIAGNOSTICS v_rows=ROW_COUNT;
 RETURN v_rows=1;
END $f$;

REVOKE ALL ON FUNCTION public.mp_worker_outbox_claim(text,integer,integer) FROM PUBLIC,anon,authenticated;
REVOKE ALL ON FUNCTION public.mp_worker_outbox_ack(bigint,uuid) FROM PUBLIC,anon,authenticated;
REVOKE ALL ON FUNCTION public.mp_worker_outbox_nack(bigint,uuid,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.mp_worker_outbox_claim(text,integer,integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.mp_worker_outbox_ack(bigint,uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.mp_worker_outbox_nack(bigint,uuid,text) TO service_role;

ROLLBACK;
