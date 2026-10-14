# SYNTHA V2 — implementation audit, consolidation and release gates
**Audited:** 15 October 2026. **Branch:** `feat/page-v2-release-candidate-audit-20261015` (stacked on PR #18). **Production:** V1 unchanged. **Approval:** not granted.

## Operating rule: complete V2 without replacing V1
All functionality is developed on isolated Draft branches, reviewed and browser-qualified together. Do **not** merge or deploy to `main`/syntha.pro until the owner approves the completed preview. Do not publish news or send Telegram messages simply because GitHub CI passed. No new paid resources.

## Confirmed snapshot before this branch
- `main` commit `6f0c03b71ca15d3d599ec30c624ba969f6f8c9e9`, branch protection absent in GitHub branch metadata.
- PR #7: 11 bilingual dossiers, consulting-grid improvement and project-specific investment forecasts; **merge conflict** against `main`.
- PR #8: qualified client/pilot/investor leads, privacy/Turnstile protections, release packaging and editorial controls. Stacked on #7.
- PR #13: safe static Cloudflare package and Chromium prerender diagnostics, Draft; production not deployed.
- PR #15: advisory inventory-capital calculator and contact route, Draft stacked on #8.
- PR #16: preserves approved 13 October investor article and 19-item RU/EN feeds; 15/17 October posts remain unpublished drafts; Draft stacked on #8.
- PR #17: security-only V1 contact backport. Its `functions/api/contact.js` file content SHA **equals V2's contact file** (`1ca85c33a68dd54a777713cae66457e694ef364a`); avoid redundant incompatible backports.
- PR #18: Four bilingual commercial scenarios (build/integrate, business transformation, early access, primary/secondary equity with founder floor), 11 project financing plans, existing detailed 12–36 month project model. Exact-head CI GREEN `cd6f4a4b622af622240f92516f39348f015eaeec`. Draft, not production.

These are **code and test results**, not evidence of deployment, revenue, shares for sale, commercial prices or a finished investment transaction.

## Real gaps discovered on this pass

| ID | Severity | Gap | Implementation / acceptance |
|---|---|---|---|
| V2-A01 | P0 | Approved Oct 13 article reverted to `site:false` in #18; feeds stale | Reapply #16 approved status, restore 19 RU/EN entries and protect against generated diff |
| V2-A02 | P0 | `verify-live-release.mjs` tests 20261013 cached CSS/JS instead of actual 20261014 app | Extract exact versioned resources from served RU/EN HTML, fetch the complete module graph, reject HTML fallback, verify SHA and approved news |
| V2-A03 | P0 | V2 prerender lacks PR #13 Linux Chrome failure diagnostics | Backport CI-only Linux arguments while preserving V2 Turnstile extraction cleanup |
| V2-A04 | P0 | Mainline and PR #7 differ on app/index documents | Build an integrated release candidate on a separate branch; preserve approved news, route/security fixes; then independently review; no blind merge |
| V2-A05 | P0 | Real Cloudflare Pages preview not qualified | Authorized owner must identify exact existing project/domain/bindings. Real Turnstile → server function → authorized private Telegram test + deployment/rollback IDs |
| V2-A06 | P0 | `main` branch not protected and no independent reviews | Owner enable required reviewers/checks in repo settings; collect signoff before promotion |
| V2-A07 | P1 | User project and monetary assumptions were lost on RU/EN switch in Opportunity Studio | Warn before RU/EN URL navigation discards financial numbers, while keeping in-page calculator tab drafts; never persist private figures in storage, links or leads |
| V2-A08 | P1 | Live release verifier lacked mock-only regression contract | Add negative HTTP/MIME/SHA/private-path and editorial freshness tests; CI runs offline |
| V2-A09 | P1 | Source-of-truth project evidence registry last audited 6 Oct | Recheck each project's live repository HEAD, canonical implementation/readiness and actual external pilot proof before changing maturity statements. No silent upgrading a design to production claim |
| V2-A10 | P1 | Consulting RU/EN PDF older than online deck | Update 6–8-page visual PDF after V2 design approval; ensure syntha.pro and QR, source references and no unverified case outcomes |
| V2-A11 | P1 | No published, approved commercial offers/cap table/capital needs | Build per-project quantified funding packs and quotations only after validating source business cases, IP ownership, shareholder rights and approved budgets |
| V2-A12 | P1 | Accessibility, broken-link and Lighthouse gate incomplete | Add axe/HTML/link/visual-performance CI with pinned and trusted dependencies, audit false positives and benchmark device transfer |
| V2-A13 | P2 | Free/Founding/Business/Enterprise terms only conceptual | Costed tier matrix, capacity, features, refund/priority constraints, legally approved early access and privacy policy |
| V2-A14 | P2 | No verified attribution from qualified leads to pilots and paid revenue | Privacy-compliant funnel with consent, real source and outcome evidence; never use fabricated GMV/revenue/ROI |
| V2-A15 | P2 | Editorial automation not resumed | Website proof for Oct13 → authenticated Telegram one-off send with real message receipt; review Oct15 and Oct17 content separately |
| V2-A16 | P2 | SEO/content/performance enhancements in Integration Master Plan not all built | Prioritise data registry, JSON-LD evidence control, image payload budgets and cache-strategy against measured actual site problems; no framework migration solely for aesthetics |

## Admission order — do not mix branches or ship prematurely

1. **This branch:** reconcile #16 approved editorial with #18 full commercial functionality, repair stale asset-URL checker and Chrome CI diagnostics, add exact-head tests.
2. **Product QA:** check 11 dossiers, founder equity paths, 4 financial scenarios, 12–36-month models and consented contact routing at 375/768/1440 RU+EN; independently inspect browser screenshots for overflow and visual quality.
3. **Documented cross-branch cherry-pick/integration:** reconcile #13 security/static package and #17 contact behavior (already code-identical in V2). Never overwrite approved PR #10 article with older #8 flags or resurrect unguarded Telegram queue.
4. **Owner approval of content/terms:** rights, ownership and pricing evidence; all market examples are labelled illustrative. No public 100% stake availability, equity guarantee, automatic early-access prepayment or unsupported comparisons to market.
5. **External acceptance:** repo protection, independent review, authenticated Cloudflare preview and real challenge/private Telegram tests. Obtain rollback proof.
6. **Owner's final V2 approval:** only then promote reviewed SHA to the existing Cloudflare production and reconcile PDF and publishing calendar.

## Source-backed acceptance links
- Prior commercial V2 [PR #18](https://github.com/PetrFedin/page/pull/18), [exact-head CI #38605440574](https://github.com/PetrFedin/page/actions/runs/38605440574)
- Editorial repair [PR #16](https://github.com/PetrFedin/page/pull/16)
- Static security [PR #13](https://github.com/PetrFedin/page/pull/13) and contact [PR #17](https://github.com/PetrFedin/page/pull/17)
- [Release blockers #9](https://github.com/PetrFedin/page/issues/9), [public editorial gap #12](https://github.com/PetrFedin/page/issues/12)
- Canonical backlog: `docs/PAGE_INTEGRATION_MASTER_PLAN_2026-10-01.md`; project maturity: `docs/PORTFOLIO_SOURCE_OF_TRUTH_2026-10-06.md`

**No deploy. No merge to main. No private message send. No new paid resources.**
