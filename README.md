# Marco Pescarolo v31.5 — Lifecycle Consistency Candidate

v31.5 continues v31.4 Internal Integrity and makes the order lifecycle itself fail closed.

## What changed

- UI/demo state names now match the real PostgreSQL lifecycle.
- `brand_revision`, `payment_verified` and `shipment_created` remain events/labels, not order stages.
- Added quantity-level fulfilment coverage across deal lines → shipment lines → shipments → carrier POD.
- Added a production stage invariant guard for proforma, verified funds, reservation, shipped and delivered transitions.
- Added an Admin **Integrity Control** target and read-only `mp_admin_integrity_snapshot()` contract.
- Prevents service-side legacy fulfilment primitives from prematurely marking partial orders shipped/delivered once the staged migration is admitted.

## Evidence

- PostgreSQL 17 lifecycle run `38925912712`: **SUCCESS**.
- Partial shipment denial: **PASS**.
- Partial POD delivery denial: **PASS**.
- Full shipment/POD path: **PASS**.
- Rollback / zero residue: **PASS**.
- Full accumulated v30.x–v31.5 regression: **PASS**.
- Production Supabase: **NOT MODIFIED**.

See:

- `docs/V31_5_LIFECYCLE_CONSISTENCY.md`
- `contracts/lifecycle-consistency-v31.5.json`
- `contracts/pg17-lifecycle-consistency-evidence-v31.5.json`
- `contracts/authority-capability-map-v31.5-target.json`
- `sql/17_lifecycle_consistency_STAGED.sql`