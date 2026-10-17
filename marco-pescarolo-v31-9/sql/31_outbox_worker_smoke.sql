\set ON_ERROR_STOP on
SELECT 1/CASE WHEN
 NOT has_function_privilege('anon','public.mp_worker_outbox_claim(text,integer,integer)','EXECUTE')
 AND NOT has_function_privilege('authenticated','public.mp_worker_outbox_claim(text,integer,integer)','EXECUTE')
 AND NOT has_function_privilege('authenticated','public.mp_worker_outbox_ack(bigint,uuid)','EXECUTE')
 AND NOT has_function_privilege('authenticated','public.mp_worker_outbox_nack(bigint,uuid,text)','EXECUTE')
 AND has_function_privilege('service_role','public.mp_worker_outbox_claim(text,integer,integer)','EXECUTE')
 THEN 1 ELSE 0 END AS access_guard;

SELECT 1/CASE WHEN count(*)>=3 THEN 1 ELSE 0 END AS v317_producer_guard
 FROM public.outbox_events WHERE event_type IN ('payment.verified','shipment.shipped','approval.approved');
UPDATE public.outbox_events SET next_attempt_at=clock_timestamp()+interval '1 hour' WHERE event_type<>'payment.verified';
SET ROLE service_role;
SELECT outbox_id,lease_token::text AS token,idempotency_key
 FROM public.mp_worker_outbox_claim('ci-worker-a',1,90) \gset a_
SELECT count(*) AS dup_claims FROM public.mp_worker_outbox_claim('ci-worker-b',1,90) \gset b_
SELECT 1/CASE WHEN public.mp_worker_outbox_ack(:a_outbox_id,:'a_token'::uuid) THEN 1 ELSE 0 END AS ack_guard;
SELECT 1/CASE WHEN NOT public.mp_worker_outbox_ack(:a_outbox_id,:'a_token'::uuid) THEN 1 ELSE 0 END AS duplicate_ack_guard;
RESET ROLE;
SELECT 1/CASE WHEN :b_dup_claims=0 AND status='sent' AND processed_at IS NOT NULL
 AND :'a_idempotency_key' LIKE 'mp-v1:payment_events:%' THEN 1 ELSE 0 END AS sent_guard
 FROM public.outbox_events WHERE id=:a_outbox_id;

UPDATE public.outbox_events SET next_attempt_at=clock_timestamp()-interval '1 minute' WHERE event_type='shipment.shipped';
SET ROLE service_role;
SELECT outbox_id,lease_token::text AS token FROM public.mp_worker_outbox_claim('ci-retry-a',1,90) \gset c_
SELECT 1/CASE WHEN public.mp_worker_outbox_nack(:c_outbox_id,:'c_token'::uuid,'upstream_503') THEN 1 ELSE 0 END AS nack_guard;
RESET ROLE;
SELECT 1/CASE WHEN status='failed' AND attempts=1 AND next_attempt_at>clock_timestamp() THEN 1 ELSE 0 END AS backoff_guard FROM public.outbox_events WHERE id=:c_outbox_id;
UPDATE public.outbox_events SET next_attempt_at=clock_timestamp()-interval '1 minute' WHERE id=:c_outbox_id;
SET ROLE service_role;
SELECT outbox_id,lease_token::text AS token FROM public.mp_worker_outbox_claim('ci-retry-b',1,90) \gset d_
RESET ROLE;
UPDATE public.outbox_events SET leased_until=clock_timestamp()-interval '1 minute' WHERE id=:d_outbox_id;
SET ROLE service_role;
SELECT outbox_id,lease_token::text AS token FROM public.mp_worker_outbox_claim('ci-retry-c',1,90) \gset e_
SELECT 1/CASE WHEN :d_outbox_id=:e_outbox_id AND :'d_token'<>:'e_token' THEN 1 ELSE 0 END AS new_fencing_token;
SELECT 1/CASE WHEN NOT public.mp_worker_outbox_ack(:d_outbox_id,:'d_token'::uuid) THEN 1 ELSE 0 END AS stale_ack_guard;
SELECT 1/CASE WHEN public.mp_worker_outbox_ack(:e_outbox_id,:'e_token'::uuid) THEN 1 ELSE 0 END AS fresh_ack_guard;
RESET ROLE;

UPDATE public.outbox_events SET attempts=5,next_attempt_at=clock_timestamp()-interval '1 minute' WHERE event_type='approval.approved';
SET ROLE service_role;
SELECT outbox_id,lease_token::text AS token FROM public.mp_worker_outbox_claim('ci-dead',1,90) \gset f_
SELECT 1/CASE WHEN public.mp_worker_outbox_nack(:f_outbox_id,:'f_token'::uuid,'provider_down') THEN 1 ELSE 0 END AS terminal_nack_guard;
RESET ROLE;
SELECT 1/CASE WHEN status='dead_letter' AND attempts=6 AND lease_token IS NULL THEN 1 ELSE 0 END AS dead_letter_guard FROM public.outbox_events WHERE id=:f_outbox_id;

INSERT INTO public.outbox_events(tenant_id,event_type,aggregate_type,payload)
VALUES('00000000-0000-4000-8000-000000000001','ci.bad_source','test','{}') RETURNING id \gset g_
SET ROLE service_role;
SELECT count(*) AS bad_claims FROM public.mp_worker_outbox_claim('ci-quarantine',1,90) \gset h_
RESET ROLE;
SELECT 1/CASE WHEN status='dead_letter' AND last_error_code='source_provenance_missing' AND :h_bad_claims=0 THEN 1 ELSE 0 END AS provenance_guard FROM public.outbox_events WHERE id=:g_id;
SELECT 'V31_9_OUTBOX_PG17=PASS' AS result;
