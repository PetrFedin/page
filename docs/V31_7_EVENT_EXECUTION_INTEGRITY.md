# Marco Pescarolo v31.7 — Event & Execution Integrity

## Purpose

v31.7 verifies that authoritative execution state and business evidence cannot silently diverge. Production Supabase was inspected read-only and was not modified.

## Live audit

Thirteen event-integrity checks returned **0 violations** across Deal, Approval, Payment, Shipment, Reservation, Reorder and POD relations. Current live event counts are small and internally coherent, but `audit_log` and `outbox_events` are currently empty. The existing `outbox_events` structure had no live writer before this candidate.

## Findings

Several server-side operations can change authoritative state without a universal execution receipt. `capture_deal_revision()` and shipment primitives are examples where evidence existed in adjacent tables but was not guaranteed in the Deal event stream. Event FKs also did not prove cross-tenant/cross-deal consistency as one relation.

The Reorder schema admits status `ordered`, while `reorder_events.event_type` has no `ordered` contract. There are no live `ordered` rows; v31.7 therefore treats this state as legacy/unadmitted instead of inventing semantics.

## Controls

### Event relation guards
Before INSERT, Deal / Approval / Payment / Shipment / Reservation / Reorder events verify the authoritative entity, tenant and deal linkage.

### Append-only evidence
Business event tables and `audit_log` reject UPDATE/DELETE. `outbox_events` is deliberately excluded because a dispatcher must update retry/delivery status.

### Deferred same-transaction receipts
Constraint triggers validate before commit that critical state transitions have a matching event created by the same transaction:

- Deal production stage → Deal event to target stage
- Payment status → Payment event to target status
- Shipment `packing / in_transit / delivered` → matching Shipment event
- Reservation state → Reservation event
- Approval request/decision → Approval event
- Reorder state → Reorder event; `ordered` remains blocked

### Evidence bridges
- Deal Revision INSERT → `revision_captured` Deal event
- Shipment packing/shipping/delivery event → Deal event with exact `shipment_event_id` provenance

The shipment bridge originally deduplicated by stage and same transaction. PG17 testing exposed that this could suppress a distinct shipment event when another Deal event used the same stage. v31.7 now deduplicates by the exact source `shipment_event_id`.

### Transactional outbox producer
High-value events create `outbox_events` atomically: approval decisions, payment verification/rejection/reversal, shipment shipped/delivered, and selected reorder decisions. A unique source-event key prevents duplicate enqueue.

**The dispatcher/consumer is NOT QUALIFIED.** Admin execution integrity reports backlog and this explicit hold.

## PG17 qualification

Cumulative PostgreSQL 17.11 chain passed:

- v31.4 Internal Integrity
- v31.5 Lifecycle Consistency
- v31.6 Relation & Concurrency
- v31.7 Event & Execution Integrity

Run: `38937274785`  
Job: `117095821679`  
Commit: `0d00e3ec79045c9058015a9bab29a6ec6278baa2`  
Artifact: `12061572183`  
Artifact SHA-256: `e3e68ef70dadf1169302a128546f58d1e5b9fd06d815b645e0354b42d18ae1e3`

Passed: event relation guards, append-only history, deferred receipts, revision bridge, shipment→deal bridge, transactional outbox producer, legacy `ordered` blocking and rollback/no residue.

## Target authority

Target map becomes **57 capabilities: 52 client-safe / 4 server-only / 1 delegated-to-Admin** by adding the read-only Admin execution integrity snapshot. Live production authority remains unchanged until migration admission.

## Remaining gates

1. qualify outbox dispatcher/consumer and retry/dead-letter semantics;
2. authoritative Supabase branch/full clone;
3. apply exact v30.9 → v31.4 → v31.5 → v31.6 → v31.7 chain;
4. compare Security/Performance Advisors before/after;
5. provision real Auth identities/memberships;
6. signed-role browser E2E;
7. commercial readiness.

**Status: PG17 QUALIFIED / PRODUCTION NOT MIGRATED.**