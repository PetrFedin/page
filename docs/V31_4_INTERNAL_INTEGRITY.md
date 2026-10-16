# Marco Pescarolo v31.4 — Internal Integrity Candidate

Date: 2026-10-16

## Purpose

v31.4 audits and hardens the internal connections that join authentication, account scope, orders, money, fulfilment and reorder logic. The goal is not another UI layer; it is to prevent a workflow that looks correct on screen from producing the wrong authority/data semantics underneath.

Production Supabase was **not modified** while preparing or qualifying this candidate.

## Live read-only findings

A production read-only audit checked 31 relationship/lifecycle invariants across clients, stores, memberships, products, variants, deals, deal lines, proformas, payments, shipments, POD, reorder and fit data.

- Cross-tenant/client/store/product/shipment/fit scope mismatches observed: **0**.
- One non-production synthetic fixture (`TEST-P9-ALLOCATION`) is delivered without proforma/payment. This is intentional test data, not a production order, but it proved that all financial/lifecycle authority must explicitly scope by `data_class`.
- Database request idempotency is already present through `uq_deals_client_request`.
- Payment reference uniqueness is already present through `payments_external_ref_uq`.

## P0 defects found

1. `deals.data_class` defaults to `demo`.
2. Wholesale portal order creation did not explicitly set `data_class`, so a real buyer-created order could become `demo`.
3. `copy_deal` did not preserve source `data_class`.
4. `convert_reorder_to_deal` did not propagate source/proposal `data_class`.
5. `mp_client_snapshot` did not exclude demo/synthetic orders.
6. `mp_client_issued_proformas` did not exclude non-production deals.
7. The browser bootstrap used UI labels `private/wholesale` as RPC authorization values, while live PostgreSQL expects `private_client/buyer`.
8. `copy_deal` and `capture_deal_revision` were executable by browser database roles as raw primitives.

## v31.4 hardening target

`sql/14_internal_integrity_hardening_STAGED.sql` introduces a fail-closed facade:

- `private.mp_require_production_deal` centralizes authenticated tenant/client/store/data-class checks.
- Client snapshot/proforma v2 surfaces return production data only.
- Private order/revision/payment v2 mutations reject non-production deals.
- Wholesale create explicitly promotes only a newly created demo-default deal to `production`; idempotent reuse of a pre-existing demo/synthetic request ID is rejected and never promoted.
- Wholesale line, size-run, revision, submit, acceptance, payment and copy operations all pass through the production-deal guard.
- Copy preserves production provenance.
- Sell-through/reorder provenance propagates `metadata.data_class`; unknown source class safely falls back to `demo`, never `production`.
- Browser execution on old mutation primitives is revoked; v2 facades are the intended browser surface.
- Live ownership validation confirmed current application objects are owned by `postgres`, while public-schema default ACLs exist for both `postgres` and `supabase_admin`. The candidate therefore revokes automatic browser grants for both creator roles (conditionally for `supabase_admin`).
- Frontend live bootstrap now takes the DB authorization role from `mp_my_access.memberships[].db_role`, keeping UI role labels separate from database enums.

## PostgreSQL 17 admission evidence

GitHub Actions run: `38899975486`

Commit: `3bd47a4f594d7b4c261fee1e03887ec355ac3dd6`

PostgreSQL: 17

Artifact: `marco-pescarolo-v31-4-internal-integrity`

Artifact digest: `sha256:628b4de1f84872b161f24c35d1e0fa267176ca841c15d0f8fe3c1f5fa7dcffe7`

Passed transaction checks:

- UI role → DB role mapping
- production-only client snapshot
- demo/synthetic mutation denial
- wholesale create → production
- idempotent non-production promotion denial
- copy preserves production
- reorder data-class provenance
- raw browser mutation surface closed
- rollback/no residue

## Authority-map policy

The currently active `contracts/authority-capability-map.json` remains the **live production map**. It is intentionally not switched to v31.4 RPCs because those RPCs do not exist in production yet.

The future post-migration map is stored separately as `contracts/authority-capability-map-v31.4-target.json` and remains:

- 55 total capabilities
- 50 client-safe
- 4 server-only
- 1 delegated to Admin
- 0 unmodelled gaps

## Remaining release gate

v31.4 is qualified on PostgreSQL 17 but remains **CANDIDATE / NOT APPLIED**. Before production migration:

1. create/obtain an authoritative Supabase development branch/full-schema clone;
2. validate object ownership/default privileges on that branch;
3. apply exact v30.9 + v31.4 hardening in the correct migration sequence;
4. run Supabase Security/Performance Advisors and compare with the captured baseline;
5. provision controlled real Auth users/memberships;
6. execute browser E2E for Private, HQ, Paris, Dubai and Admin/AAL2;
7. only then promote the target authority map and production traffic.