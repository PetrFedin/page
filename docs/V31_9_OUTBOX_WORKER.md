# Marco Pescarolo v31.9 — server-only outbox staging

This branch adds a candidate outbox claim/ack/nack contract, **without modifying production**. PostgreSQL 17 CI uses the cumulative v31.4–v31.7 fixtures and rolls the entire v31.9 candidate back.

Production read-only audit (2026-10-17): 61 public tables all with RLS; 32 tracked migrations; zero Supabase Auth users and portal memberships; 6 products/108 variants; 4 deals; outbox is empty and has no consumer. Existing Netlify production deploy was published on 2026-10-07.

Worker grants are for service_role only. Client roles anon/authenticated receive no EXECUTE. The functions use SECURITY INVOKER; private schema usage is not changed. The claim function uses SKIP LOCKED, lease UUID fencing, a stable source-event idempotency key, capped batches and retry attempts. ACK and NACK require the current unexpired lease. NACK applies exponential backoff and dead-letter after attempt six; invalid provenance is quarantined. Sensitive exceptions are represented only by sanitized error codes.

**Delivery model:** at-least-once; the external consumer must deduplicate by the provided idempotency key. This branch does not implement or qualify an HTTP dispatcher. A provider could succeed before DB ACK, resulting in a safe duplicate only with provider-side idempotency.

Next release gates: PostgreSQL 17 CI success with exact SHA; live-shape/full clone and advisor comparison; external server-only dispatcher and provider receipts; real Auth users/memberships for five roles; browser E2E and Paris/Dubai access-isolation proofs; explicit production admission. **Status: PRODUCTION HOLD**.
