# syntha.pro Page — Integration Master Plan

**Status:** PLANNED  
**Date:** 2026-10-01  
**Canonical file:** `docs/PAGE_INTEGRATION_MASTER_PLAN_2026-10-01.md`

## Purpose
Improve quality, resilience and conversion of the static personal/project site while preserving its key advantages: speed, mobile-first presentation and simple deployment.

## Rule
Do not migrate to a heavy framework without a measured maintenance/product need.

## Integration map

| Capability | Source | Decision |
|---|---|---|
| Performance budget | Lighthouse CI | ADOPT |
| Accessibility | axe-core | ADOPT |
| Visual regression | Playwright | ADOPT |
| Media pipeline | Sharp | ADOPT |
| OG generation | Satori | ADOPT |
| Offline/PWA | Workbox | CONDITIONAL |
| Real-user performance | web-vitals | ADOPT |
| Anti-spam | Cloudflare Turnstile | ADOPT |
| Sitemap/hreflang | sitemap.js | ADOPT |
| Link checking | Linkinator | ADOPT |
| Experiments | GrowthBook | DEFER |
| Analytics | Umami | OPTIONAL |
| Static search | Pagefind | DEFER |
| CMS | Decap CMS | DEFER |
| Framework | Astro | REFERENCE/DEFER |
| Gallery | PhotoSwipe | DEFER |

## Phase 0 — Baseline/budgets
Record Lighthouse, page weight, major media weight and representative mobile/desktop paths. Define performance budgets per page type.

## Phase 1 — CI quality
Lighthouse CI catches performance/SEO regressions. axe-core covers accessibility. Playwright provides RU/EN visual regression. Linkinator checks internal/external links, files and anchors.

## Phase 2 — Media build
Sharp creates responsive widths, AVIF/WebP where appropriate, thumbnails and dimensions metadata. Preserve originals; derivatives are build output.

## Phase 3 — SEO/social
sitemap.js generates canonical sitemap and RU/EN hreflang mapping. Satori creates build-time project OG cards from structured metadata.

## Phase 4 — Contact protection
Cloudflare Turnstile is verified server-side in the existing function path. Secret stays server-side; add basic rate/duplicate protection.

## Phase 5 — Real user Web Vitals
Collect minimal LCP/INP/CLS telemetry. Do not collect unnecessary personal browsing profiles.

## Phase 6 — Workbox gate
Only if QR/event/offline usage benefits users. Cache shell, selected project pages, essential media and vCard; never cache stale form/API responses.

## Phase 7 — Analytics/experiments
Umami is optional. GrowthBook only after reliable event measurement and a real conversion hypothesis exists.

## Phase 8 — Deferred scale tools
- Pagefind when content volume needs search;
- Decap when non-developer editing becomes recurring;
- Astro only when static maintenance is a measured bottleneck;
- PhotoSwipe for image-heavy case studies.

## Prohibited
- framework migration for fashion;
- database solely for portfolio;
- blocking analytics;
- unnecessary personal telemetry;
- broken RU/EN canonical pairing;
- oversized unoptimised hero media.

## Issue order
1. PAGE-INT-00 Baseline/budgets
2. PAGE-INT-01 Lighthouse/axe/Playwright/Linkinator
3. PAGE-INT-02 Sharp
4. PAGE-INT-03 sitemap/hreflang
5. PAGE-INT-04 Satori
6. PAGE-INT-05 Turnstile
7. PAGE-INT-06 web-vitals
8. PAGE-INT-07 Workbox gate
9. PAGE-INT-08 optional analytics/experiments
10. PAGE-INT-09 scale gates

**Implementation instruction:** improve quality and conversion without sacrificing static-site simplicity.

## Additional wave — structured data and HTML/security validation

### schema-dts / Schema.org structured data — ADOPT

Reference: https://github.com/google/schema-dts

Generate typed JSON-LD at build time for the site's actual entities:

- Person;
- WebSite;
- ProfilePage / AboutPage where appropriate;
- CreativeWork/SoftwareApplication for projects where the schema truthfully applies;
- Organization only where a real organisation is being described.

Use one structured metadata source to generate JSON-LD and avoid hand-edited divergence between RU/EN pages.

Do not add ratings, awards, employers, products or claims that are not actually supported by the page/content.

### html-validate CI — ADOPT

Reference: https://github.com/html-validate/html-validate

Add deterministic HTML validation to CI alongside Lighthouse/axe/Playwright.

Catch:

- invalid nesting;
- duplicate IDs;
- bad attributes;
- heading/form errors;
- broken ARIA relationships where statically detectable.

This is especially useful because the project intentionally stays static/minimal rather than relying on a framework compiler.

### Security headers / CSP — ADOPT NATIVE CONFIG

Add a documented Content-Security-Policy and related headers appropriate to the current static site + Cloudflare function.

At minimum evaluate:

- Content-Security-Policy;
- Referrer-Policy;
- Permissions-Policy;
- X-Content-Type-Options;
- frame-ancestors;
- form/connect destinations.

Generate/maintain the policy from actual required origins; do not weaken to broad wildcards merely to make a third-party embed work.

Turnstile, analytics and media origins must be explicitly reflected if enabled.

### Acceptance extension

- structured data validates against the rendered content and remains RU/EN consistent;
- HTML CI catches invalid static output;
- CSP does not block required site/contact functionality;
- no structured-data claim exists only for SEO.

**Sequencing:** schema/HTML validation can be added with the SEO phase; CSP should be introduced before adding more third-party analytics/embeds.

