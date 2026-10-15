# SYNTHA V2 — unified, preapproval release candidate
**Date:** 2026-10-15. **Status:** DRAFT / PRODUCTION HOLD.  
**Target:** `feat/page-v2-unified-preapproval-20261015` → preview for owner review only.  
**Unchanged:** `main`, current `syntha.pro`, public Telegram, production Cloudflare bindings, billing.

## Why this branch
A chain of PRs #7 → #8 → #15 → #18 → #19 had tested V2 components but its first branch was behind `main`, so normal merge showed conflicts. This candidate resolves them **outside `main`** and is the first single reviewable V2 branch based on the verified current main commit.

### Reconciliation provenance
- Current main parent: `6f0c03b71ca15d3d599ec30c624ba969f6f8c9e9`.
- V2 parent: PR #19 source commit `523c122d6db99c35975bbf3affe92b377d44c75d` (exact-head CI GREEN in [GitHub Actions #38647096756](https://github.com/PetrFedin/page/actions/runs/38647096756)).
- Staging merge commit: `257ac3fbcb210004b414ee1548584bc33217c6fb`, explicitly given **two parents** (main + reviewed V2 source). It does not merge PRs into main.
- Merge tree: `31f960fb287ea34705f86891ba6b6201f6755462`. 169 tracked files; 53 changed/new V2 files over main; all 5 main-only editorial files preserved.
- Main-only preserved: `.github/workflows/editorial-hotfix.yml`, `.github/workflows/tg-publisher-check.yml`, `scripts/tg-publish-date.mjs`, `scripts/verify-oct13-publication.mjs`, `scripts/verify-telegram-date.mjs`.
- `.github/workflows/editorial-hotfix.yml` adapted to run the V2 editorial-contract test when V2 is present, while preserving strict V1 editorial-only checking on V1 branches. The full V2 Actions checks broader integration.
- `functions/api/contact.js` same content SHA `1ca85c33a68dd54a777713cae66457e694ef364a` as hardened PR #17. Its mocked negative/consent/privacy tests are included in the unified exact-head CI.
- PR #13 headless Chromium startup recovery is included, as is independent V2 Turnstile token sanitation. The public V2 static package includes the exact Git source SHA in HTML and `release-health.json`.

**Important:** A synthetic merge commit records a deliberate integration tree; it is **not** independent human approval or a GitHub auto-merge. Review every differing file and exact-source CI after the complete integration.

## Scope of release candidate
- Eleven RU/EN project dossiers, functional maps and evidence/limitations.
- Consulting presentation with working-capital sensitivity and scenario examples.
- Bilingual commercial studio: bespoke vs integration, operational redesign economics, hypothetical early-access terms and primary/secondary equity/founder-retention sensitivity.
- Each project has investment milestones and a link to the existing 12/24/36-month investor projection.
- Client/pilot/investor lead paths, routed contact context and server-enforced consent, Turnstile and private-only Telegram recipient.
- Editorial: approved Oct 13 RU/EN on website in code and RSS/JSON; Oct 15 and 17 still unpublished. No post auto-sent.
- Dynamic external release check resolves **served** JS/CSS versions, recursively follows module imports, compares exact SHA from HTML/public manifest and checks private-source denials.
- Financial model inputs are never sent through contact payloads. A language-change prompt prevents accidental silent loss of locally entered figures without storing those figures.

## Acceptance checklist (not completed by adding code)
1. [ ] Exact GitHub Actions CI on **current RC HEAD**: portfolio, editor, Telegram safety, backend negative tests, finance arithmetic, prerender and static package.
2. [ ] Six-device-mode RU/EN browser QA with screenshots and manual visual inspection (375, 768, 1440), keyboard, labels, overflow and reading hierarchy.
3. [ ] Validate sources and maturity statements against current heads of *each* project repository; registry audited Oct 6 cannot establish Oct 15 production status.
4. [ ] Owner approves which project offerings, team capacity and indicative commercial terms should actually appear. No unapproved SYNTHA prices or known share blocks.
5. [ ] Legal/IP verification of equity, early-access preorder terms and privacy/retention before publishing any binding offer.
6. [ ] Separate review of RU/EN 6–8-page consulting PDFs and QR after final online V2 design.
7. [ ] Independent reviewer: whole diff, serverless Functions, source leaks, CSS/JS safety, negative fraud/consent scenarios, editorial rules.
8. [ ] Owner-controlled GitHub branch protection / required reviews and checks. Main metadata currently shows `protected=false`.
9. [ ] Authenticated **existing** Cloudflare Pages project and non-production preview; no new paid resource.
10. [ ] Verify genuine Turnstile on approved preview hostname, the full Functions binding, private Telegram test receipt and negative paths.
11. [ ] Record actual Cloudflare preview SHA, deployment ID, current production deployment ID, rollback runbook and independent preview acceptance.
12. [ ] **Owner GO/NO-GO** for public V2 swap. Only explicit GO authorizes production changes; no auto-merge/deploy.
13. [ ] After approved release, reconcile Telegram one-off editorial publication and new article calendar, confirm message IDs/URLs and real contact conversion metrics.

## What cannot honestly be claimed now
- Live V2, tested production contact submission, channel delivery or any investor/client revenue.
- Availability of equity interests, a 100% buyout, confirmed founder cap table, pricing or financing commitments.
- Exact delivery budgets and market-relative savings without a scoped bill of work and signed commercial terms.
- Current production readiness of every listed project based only on Oct 6 source-of-truth registry.

## Gates independent from V2 scope
- Existing V1 stays live and must remain operational.
- No new cloud project, paid subscription, extra compute, live API token or public Telegram action.
- No direct update of main or production from this branch.

**Reviewer guide:** [Audit backlog](PAGE_V2_RELEASE_AUDIT_2026-10-15.md), [Integration Master Plan](PAGE_INTEGRATION_MASTER_PLAN_2026-10-01.md), [release/rollback guide](PAGE_V2_CLOUDFLARE_RELEASE_ADMISSION_2026-10-13.md).
