# Marco Pescarolo v31.7 — Event & Execution Integrity Candidate

v31.7 continues the qualified v31.4 → v31.5 → v31.6 chain and makes critical execution evidence fail closed.

## What changed

- Live read-only event audit: 13 checks, 0 current violations.
- Event tables become append-only in the staged target.
- Cross-scope event guards prevent event rows from being attached to the wrong tenant/deal/entity.
- Deferred same-transaction receipts require critical Deal, Payment, Shipment, Reservation, Approval and Reorder state changes to have matching domain evidence before commit.
- Deal Revision and Shipment events bridge into the Deal event trail.
- High-value domain events produce a transactional outbox row atomically.
- The outbox **producer is qualified; the consumer/dispatcher is deliberately NOT qualified yet**.
- Legacy Reorder `ordered` status is blocked until it receives an explicit event contract.
- New Admin target RPC: `mp_admin_execution_integrity_snapshot()`.

## PostgreSQL 17 evidence

- Run `38937274785`: **SUCCESS**
- Job `117095821679`
- Commit `0d00e3ec79045c9058015a9bab29a6ec6278baa2`
- Artifact `12061572183`
- Artifact SHA-256 `e3e68ef70dadf1169302a128546f58d1e5b9fd06d815b645e0354b42d18ae1e3`
- Rollback / zero residue: **PASS**
- Production Supabase: **NOT MODIFIED**

See `docs/V31_7_EVENT_EXECUTION_INTEGRITY.md`, `contracts/event-execution-integrity-v31.7.json`, and `sql/25_event_execution_integrity_STAGED.sql`.