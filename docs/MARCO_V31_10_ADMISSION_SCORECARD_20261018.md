# Marco Pescarolo — v31.10 read-only admission scorecard

Date: 2026-10-18. Source: live Supabase project (PostgreSQL 17.11) read-only SQL queries, GitHub workflow logs and Netlify published-deploy metadata. This records observed results, not a guarantee about every future row or transaction.

## Verified live counts

| Check | Observed | Gate |
|---|---:|---|
| Public tables with RLS | 61 / 61 | Schema RLS coverage confirmed |
| Tracked database migrations | 32 | No v31.9 production admission |
| Auth users | 0 | BLOCKED |
| Portal memberships | 0 | BLOCKED |
| Brand admin memberships | 0 | BLOCKED |
| Published products | 6 | Exists |
| Published products with null/nonpositive retail price | 6 | BLOCKED |
| Media assets authorized by rights_status | 0 / 13 | No publication rights established; internal references may remain archived |
| Product media links with verified mapping_status | 0 / 24 | BLOCKED |
| Published products with no approved, verified, active HTTPS media | 6 / 6 | BLOCKED |
| Deals | 4 | Exists |
| Outbox records | 0 | Producer/consumer not live admitted |
| v31.9 mp_worker_outbox_claim in production | No | BLOCKED |

Seven read-only event integrity checks returned **zero** observed violations: deal events, payment events, shipment events, reorder events, missing payment receipt, missing shipment receipt, and the unadmitted legacy reorder ordered status. Cross-tenant check results in the same audit cycle were zero for Deal↔Client, Lines↔Deal/Product, Shipment↔Deal, Payment↔Deal, Product Media↔Asset, and Variant↔Product.

Do not infer that functional end-to-end authentication works from RLS coverage. Supabase Auth has zero user identities; no signed, browser-to-Postgres negative 5-role E2E has been run against live data.

## Security notes
Supabase Advisors: 1 anonymous SECURITY DEFINER warning (public showroom catalog) and 30 authenticated SECURITY DEFINER warnings; those are review findings, not automatically exploitable vulnerabilities. The public catalog function implementation selects only product identity and brand-rights-qualified media, not cost or wholesale prices. The definition has been inspected; behavior still needs a security acceptance test.

28 no-policy RLS info findings are intentional deny-by-default candidates until data API permission is deliberately designed; do not grant broad table access just to silence the linter.

## Media evidence and failures
- GitHub Actions 39056271800: real browser screenshots/WebM captured; failed only in MP4 conversion because ffmpeg was absent.
- GitHub Actions 39158910008: PASS; 8 PNG and a 77.96-second H.264 MP4 published to immutable-by-source-fingerprint release [mp-showroom-live-59e62fee9875bcbb](https://github.com/PetrFedin/page/releases/tag/mp-showroom-live-59e62fee9875bcbb).
- GitHub Actions 39158912123: a stricter test opened the product dossier, then failed to dismiss the modal; as a consequence subsequent language and home clicks were obstructed. Source screenshot proves the visible product modal has an icon-only × button. The previous selector selected a hidden cart close button instead. Fix staged in commit e32a541, CI pending at the time of this scorecard.

## Release discipline

1. Qualify real five-role Supabase JWT authentication and negative store-scope access.
2. Approve retail pricing and at least one verified, rights-cleared public image for each published product; reference-only assets do not need to be republished or misrepresented as authorized.
3. Qualify v30.9→v31.9 migrations on exact full PostgreSQL 17 clone with advisors before/after and rollback proof.
4. Add external outbox consumer with idempotent receipts; server-only secret handling; no client service role.
5. Validate cross-device persistence Private → Buyer Paris/Dubai → HQ Admin → execution.
6. Only after signed releases, consider public preview deployment; keep existing Netlify production and personal landing untouched.

A reproducible **read-only** SQL query is in `marco-pescarolo-v31-10/sql/40_live_readonly_release_gate.sql`. Its output is an inventory, **not** a production admission authorization.
