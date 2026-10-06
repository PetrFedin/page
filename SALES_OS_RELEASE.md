# Sales OS v1 — Marco Pescarolo Showroom

## What changed
Retailer-specific, dated weekly sales history and closing stock now drive weeks of supply, risk and replenishment proposals. CSV import no longer modifies the brand's ATS stock. History for Concept Store Milano and Atelier Paris is seeded explicitly as demo data.

## Calculation policy
Use the last four consecutive closed Monday-based weeks. Latest observation must match the latest closed week. WOS = retailer closing stock / average units sold per week. Zero sales, gaps, stale or absent data produce unknown risk and no automated recommendation.

Demo policy: replenishment lead time 2 weeks, target 6 weeks, safety 1 week. High risk means WOS < lead time; medium means WOS < lead time + safety. Suggested quantity = ceil(max(0, average weekly sales * (target + safety) - retailer stock - confirmed undelivered allocations)). This is a planning policy, not a validated demand forecast. Product production lead-time copy and pre-book dates are demo values; pre-book has no confirmed arrival promise and cannot be shipped as ATS.

## Workflow
Create proposal -> manager approval -> local Buyer Portal notification -> buyer review of editable size matrix -> submit -> allocation -> commercial order approval -> simulated deposit -> demo shipment -> recorded delivery -> four complete post-delivery sales weeks. Proposal stores a calculation snapshot and audit events. Changing quantities requires another manager approval. The initial size split is a starter distribution, not evidence of size-level availability. Allocation is idempotent and only at product level.

## Import contract
Header: retailer,article,week,sold,stock. Week is a closed Monday (YYYY-MM-DD). Retailer must be registered in this demo; article must exist. Quantities must be non-negative safe integers. Batch size 1-5000 rows. Duplicate keys within a batch or a previously imported key are rejected. Seed rows may be replaced once. Every row is validated before any mutation. CSV parsing intentionally supports unquoted simple comma-separated values only; reject extra columns. A future production importer needs staged corrections and provenance approval.

## Verification
Run `node sales-os.test.cjs`. Fifteen behavioral regression checks cover retailer separation, import atomicity, missing/stale/zero demand, proposal approval, exact matrix quantities, order/invoice linkage, idempotent reservations, shipment gates, delivery, and post-delivery observation requirements. JavaScript compile check passed. Live desktop flow is verified through the public Vercel site. Phone/tablet browser verification was not completed in this environment; responsive card breakpoints are implemented but should still be device-tested.

## Prototype boundaries
Unofficial concept, all commercial records and policies are fictional. State stays in localStorage in one browser. Role switching is a demo control, not authentication or authorization. Notifications are local, no email or messaging integration. Payments and shipments are simulated. No backend, shared account persistence, ERP stock synchronization, real carrier ETA, certified inventory or measured revenue uplift. Observation before/after is descriptive and does not prove causal uplift.

## Isolated publication
Public project: https://marco-pescarolo-showroom.vercel.app/
Source: PetrFedin/page, branch marco-pescarolo-showroom. page/main and syntha.pro are not modified by this release. This is a separate branch and deployment, not yet a separate GitHub repository.
