# Marco Pescarolo v31.5 — Lifecycle Consistency

## Purpose

v31.5 aligns the user-facing workflow, database state machine and fulfilment evidence so there is one authoritative lifecycle instead of parallel UI/backend meanings.

Production Supabase was inspected read-only and was **not modified**.

## Live findings

### 1. UI events had drifted into order stages

The preview previously used `brand_revision`, `payment_submitted`, `payment_verified` and `shipment_created` as order stages. The live PostgreSQL contract uses those concepts as events/labels while the authoritative stages are:

`draft → submitted → negotiation → approval_pending → approved → proforma_issued → advance_pending → advance_confirmed → allocated → fulfillment → shipped → delivered`.

v31.5 aligns the preview and workflow tests with that model. `selection`, `closed` and `cancelled` remain valid states. `confirmed` is treated as a monitored legacy stage.

### 2. Legacy partial-shipment state risk

The server-only legacy `ship_shipment()` primitive can infer `shipped` from the shipment lines that already exist without proving that every ordered quantity was placed into a shipment.

The server-only legacy `confirm_shipment_delivery()` primitive can infer `delivered` from the shipments that already exist without proving that the complete order quantity is represented and POD-backed.

Both primitives are currently unavailable to `anon` and `authenticated`, but remain executable by `service_role`; therefore the invariant belongs in PostgreSQL, not only in browser/Admin wrappers.

### 3. No live production orders currently exist

Read-only live classification at qualification time:

- production deals: **0**
- demo deals: **2**
- synthetic deals: **2**
- v31.5 lifecycle objects in production: **not installed**
- legacy `ship_shipment` / `confirm_shipment_delivery`: service-only, still present

This means v31.5 can be introduced before real production orders without having to repair live production lifecycle data.

## v31.5 controls

### `private.mp_deal_fulfillment_coverage(deal_id)`

Computes quantity-level coverage for every deal line:

- ordered
- assigned
- shipped
- POD-backed delivered
- open to assign / ship / deliver
- over-assignment / over-shipment / over-delivery

A unit is considered delivered only when the shipment line is delivered, the shipment is delivered, and a `carrier_pod` delivery receipt exists.

### `private.mp_deal_stage_invariant_guard()`

Fail-closed production-only trigger guard:

- `proforma_issued` requires an issued proforma matching deal amount/currency;
- `advance_confirmed` requires sufficient verified funds;
- `allocated` requires exact reservation coverage for all order lines;
- `shipped` requires complete non-over shipment coverage;
- `delivered` requires complete POD-backed delivery coverage.

Demo/synthetic fixtures are intentionally outside this production authority.

### `public.mp_admin_integrity_snapshot()`

Read-only Admin integrity surface that reports production deals in impossible or legacy states, including:

- proforma stage without matching issued proforma;
- advance confirmed without verified funds;
- allocation without full reservation;
- shipped without full order coverage;
- delivered without full POD coverage;
- fulfilment over-coverage;
- legacy `confirmed` stage.

The preview exposes an **Integrity Control** tab but does not fake live RPC results while the migration remains unapplied.

## Executable qualification

GitHub Actions PostgreSQL 17 run:

- run: `38925912712`
- job: `117057267620`
- commit: `28a74f9f96d7db7d9a136a0a47b42be0bd57e25b`
- artifact: `12056392727`
- artifact SHA-256: `d5292ce82cd0252c3b531042465b1d9c163b5d6b43c69b1e5f303eb6e26608b7`

Passed:

- matching-proforma stage guard;
- verified-funds stage guard;
- exact allocation coverage;
- partial shipment denial;
- full shipment acceptance;
- partial POD denial;
- full POD delivery acceptance;
- coverage projection;
- authenticated Admin integrity snapshot;
- rollback / zero residue.

The test applies v31.4 hardening first and v31.5 second, so this is cumulative qualification rather than an isolated toy schema.

## Regression result

All accumulated v30.x–v31.5 contract tests pass. The workflow state machine remains:

- Private: delivered
- Paris: delivered
- Dubai: draft
- Claim: closed
- Reorder: converted
- Wishlist: persisted

## Current Supabase advisor baseline

Read-only advisor snapshot after qualification:

- Security WARN: **31**
- Security INFO: **28**
- Performance WARN: **0**
- Performance INFO: **142**
  - unindexed foreign keys: **83**
  - unused indexes: **59**

These are baseline findings, not new v31.5 regressions because production DDL was not changed.

The next performance step should prioritize indexes only for measured critical joins (shipments, shipment lines, payments, reservations, memberships, sell-through) instead of creating all 83 missing FK indexes indiscriminately.

## Admission state

**CANDIDATE QUALIFIED / PRODUCTION NOT MIGRATED.**

Remaining release gates:

1. authoritative Supabase branch/full clone;
2. apply exact v30.9 → v31.4 → v31.5 chain;
3. Security/Performance Advisor delta;
4. real Auth identities/memberships for Private, HQ, Paris, Dubai and Admin;
5. signed-role negative cross-scope tests;
6. real browser E2E;
7. commercial readiness (prices, variant authority, media rights).