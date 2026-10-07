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

## Additional wave — content registry, feeds and supply-chain-safe static delivery

This wave adds distribution/reuse without sacrificing static-first simplicity.

### Single Project Content Registry — ADOPT

Move repeated project metadata into one structured build-time registry:

- slug;
- RU/EN title/summary;
- role/context;
- date/status;
- technologies/topics;
- hero/media refs;
- canonical URL;
- related-project tags;
- external links;
- visibility/publish state.

Use that registry to generate:

- project cards;
- project navigation;
- JSON-LD;
- sitemap/hreflang;
- OG metadata;
- RSS/JSON Feed entries;
- related-project links.

The generated HTML remains static. This prevents SEO/feed/card metadata from drifting apart.

### RSS + JSON Feed — ADOPT/CONDITIONAL

For published projects/updates, generate static feeds from the same registry.

Fields:

- stable ID;
- canonical URL;
- title/summary;
- published/updated date;
- language;
- tags;
- optional hero.

Do not publish drafts/private contact data.

If the site is not updated frequently enough to justify a feed, the implementation can remain dormant but generation should be deterministic.

### Related Projects / Topic Graph — ADOPT

Use explicit tags/relationships in the registry to render:

- related project;
- same domain;
- same capability;
- previous/next relevant case study.

No recommendation service is needed. Deterministic build-time relations keep the site fast and explainable.

### Subresource Integrity / Third-party Asset Inventory — ADOPT

For any externally loaded static script/style that is pinned and supports it, use integrity metadata (SRI) and a documented third-party asset inventory.

Inventory:

- dependency/origin;
- purpose;
- version/hash;
- CSP origin;
- privacy effect;
- fallback/criticality.

Prefer self-hosted/pinned assets when practical.

Do not use SRI with mutable unversioned resources where the hash would unpredictably break the site; remove or pin those dependencies instead.

### Static Build Manifest — ADOPT

Generate a small release manifest containing:

- Git SHA;
- build timestamp;
- content-registry version/hash;
- key generated artefact hashes;
- sitemap/feed generation status.

This improves deployment verification without adding a backend.

### Additional acceptance

- project card/JSON-LD/sitemap/feed derive from the same metadata source;
- RU/EN variants remain explicitly linked;
- related-project output is deterministic;
- third-party assets are inventoried and compatible with CSP;
- release manifest identifies exact content/build state.

**Sequencing:** content registry first -> reuse for structured data/sitemap/OG -> feeds/related projects -> SRI inventory/build manifest.

## Additional wave — minimal asset build pipeline without framework migration

The site should stay static-first, but a small deterministic build can improve cacheability and payload size without introducing React/Next/Astro.

### Lightning CSS build step — ADOPT

Reference: https://github.com/parcel-bundler/lightningcss

Use Lightning CSS at build time for:

- minification;
- vendor-prefix/transformation where required;
- syntax lowering for declared browser targets;
- source-map generation in non-production/debug builds;
- optional CSS modules only if the current architecture actually needs them.

Keep source CSS human-readable in the repository. Generated CSS is a deployment artefact.

### esbuild JavaScript step — ADOPT/CONDITIONAL

Reference: https://github.com/evanw/esbuild

Use a very small esbuild configuration only when it materially improves the existing static JS:

- bundling modules;
- minification;
- dead-code removal;
- target-browser lowering;
- content-hashed output names.

Do not use this as justification to migrate the site to an SPA or framework.

If the current JS remains simpler and smaller unbundled, keep esbuild conditional.

### Content-hashed asset manifest — ADOPT

Build output should create stable immutable assets such as:

- app.[hash].js;
- styles.[hash].css;
- generated project/OG assets where appropriate.

Generate a manifest mapping logical source to output asset.

HTML generation references the manifest so cache-busting is deterministic.

### Cache-Control strategy — ADOPT

Recommended deployment semantics:

- hashed assets: long immutable cache;
- HTML: shorter/revalidate;
- feeds/sitemap: revalidate;
- contact/API responses: never treated like immutable static assets.

This complements Workbox rather than depending on it.

### Bundle / Payload budget gate — ADOPT

Add CI thresholds for:

- main CSS compressed size;
- main JS compressed size;
- critical page total transfer;
- number of third-party origins.

A build step is only successful if it reduces/controls payload without harming accessibility or maintainability.

### Additional acceptance

- source remains framework-free/static-first;
- production CSS/JS output is deterministic from Git SHA/config;
- hashed assets can be cached immutably;
- HTML references only existing manifest assets;
- Lighthouse/Playwright/axe gates remain green after minification/bundling;
- the build pipeline can be removed without changing content authority.

**Sequencing:** content registry + existing CI first -> Lightning CSS -> optional esbuild -> hashed manifest/cache headers -> payload budgets.

**Dependency note:** Lightning CSS currently uses MPL-2.0 and esbuild MIT upstream; re-check exact version/license before vendoring or redistribution.

## Additional wave — navigation speculation and resource-hint governance

This wave targets perceived navigation speed while keeping the site static and avoiding unnecessary framework/runtime code.

### Speculation Rules — CONDITIONAL NATIVE WEB PLATFORM

Reference/spec work:

https://github.com/WICG/nav-speculation

For a small set of high-confidence same-origin navigations, evaluate browser-native prefetch/prerender rules.

Candidate use:

- homepage -> featured project;
- project -> explicitly selected related project;
- RU <-> EN counterpart only if user action strongly indicates navigation.

Do not prerender every project link.

### Privacy / Cost Rules — ADOPT

Before prefetch/prerender, classify links:

- safe static GET;
- heavy media;
- third-party;
- contact/action;
- query carrying sensitive data.

Never speculate:

- form submission;
- Cloudflare contact function;
- external authenticated URLs;
- analytics/action endpoints;
- downloads where cost is substantial and unlikely.

### Resource Hint Budget — ADOPT

Govern:

- preload;
- modulepreload;
- preconnect;
- dns-prefetch.

Each hint should have:

- target;
- reason;
- pages;
- expected benefit;
- measured before/after;
- owner/config source.

Too many preloads can slow down the critical page; treat hints as a performance budget, not free optimization.

### Hero / Critical Media Priority — ADOPT

Use explicit fetch/loading priority only for genuinely above-the-fold media.

Rules:

- one/few critical assets;
- responsive correct size;
- no eager loading of entire case-study gallery;
- video poster before full video where appropriate.

### Performance Experiment Gate — ADOPT

Any speculation/resource-hint change should be checked against:

- Lighthouse;
- Web Vitals RUM where available;
- transferred bytes/request count;
- mobile network profile;
- back/forward navigation behavior.

Keep the change only if it improves the intended journey without significant bandwidth/privacy regression.

### Additional acceptance

- speculation rules target same-origin safe pages only;
- contact/API actions are excluded;
- resource-hint count is bounded;
- mobile data transfer is measured;
- unsupported browsers fall back to normal navigation;
- site remains fully functional with all speculation disabled.

**Sequencing:** current static build/performance budgets -> critical resource audit -> hints -> limited speculation rules -> RUM validation.

**Dependency note:** this uses native web-platform capabilities/reference specs rather than adding a new framework dependency.

## Premium innovation wave — interactive proof cards and live product demonstrations

This wave makes the portfolio stronger in sales conversations: visitors can verify and interact with selected product proof instead of seeing only screenshots and claims.

### Project Proof Manifest — ADOPT

Extend the build-time Project Content Registry with:

- repository/project ID;
- proof type;
- release SHA;
- last verified date;
- live demo URL;
- video/demo asset;
- key capability;
- status: live / controlled demo / prototype / concept;
- evidence/reference links;
- device targets;
- fallback media.

Never label a prototype or mocked provider flow as production/live.

### Interactive Proof Card — ADOPT

For selected projects provide one compact expandable surface:

- problem;
- solution;
- one interactive/live proof;
- one measurable/technical proof;
- architecture/authority highlight;
- current status;
- open full case.

### Sandboxed Live Demo Embed — CONDITIONAL

For safe approved demos:

- lazy-load iframe;
- restrictive sandbox/permissions;
- explicit open-interactive-demo action;
- no automatic camera/microphone/location;
- fallback screenshot/video;
- mobile timeout/size guard.

Never embed admin/private/secret-bearing surfaces.

### 3D / Spatial Proof — ADOPT/CONDITIONAL

Reference:

https://github.com/google/model-viewer

Use model-viewer only where 3D materially proves capability, e.g. Renova, Moscow or Antiqua.

Load a small validated GLB derivative, not production master assets.

### Live Status Truth Boundary — REQUIRED

Claims such as production, live, PostgreSQL, real provider, pilot or field verified must come from maintained proof metadata, not inference from repository screenshots.

### Sales Demo Mode — ADOPT

Add an optional presentation route with:

- 5–7 strongest projects;
- problem -> solution -> innovation -> proof;
- one CTA per project;
- iPhone/iPad/desktop responsive;
- same registry data as full site.

### Additional acceptance

- every interactive module has static fallback;
- status claims resolve to proof manifest fields;
- private/admin credentials cannot be exposed;
- demo failure does not damage core portfolio;
- 3D is lazy-loaded and performance budgets stay green;
- RU/EN proof remains paired;
- live/prototype/concept labels are unambiguous.

**Sequencing:** Content Registry + proof metadata -> Proof Cards -> safe embeds -> 3D proof -> Sales Demo Mode.

## Premium commercial wave — generated Client Pitch Rooms

This wave turns syntha.pro from a public portfolio into a reusable sales instrument for specific clients, partners and investors without introducing a heavy CMS/application backend.

### Pitch Room Definition — ADOPT

Create build-time structured pitch-room metadata:

- pitch ID/slug;
- audience/client category;
- language;
- headline/value proposition;
- selected projects;
- selected proof cards;
- selected capabilities;
- relevant metrics/evidence;
- CTA;
- expiry/archive status;
- public / unlisted / protected-delivery classification.

Do not put confidential client information into a public static build.

### Generated Proposal Microsite — ADOPT

From the same canonical project/proof registry generate a focused route:

problem/context -> why relevant -> selected solutions -> innovation -> proof -> delivery model -> next step

No manual copy-paste of project claims; reuse canonical proof metadata so status cannot drift.

### Capability Bundle View — ADOPT

Allow a pitch to group capabilities across projects, e.g.:

- Event Platform;
- Fashion PLM/Commerce;
- AI Work OS;
- City/Spatial Experience;
- Evidence/Legal;
- High-trust Analytics.

This shows that the portfolio is a reusable technology capability base rather than disconnected demos.

### QR / Presentation Handoff — ADOPT

Generate QR and short presentation-safe URL for a pitch room.

Use cases:

- meeting;
- event;
- investor demo;
- proposal follow-up.

QR is a navigation link only; no private credentials embedded.

### Print / PDF-friendly Proposal — ADOPT

Provide a print stylesheet and deterministic proposal export surface using the same page content.

If a PDF artefact is generated, it is derived from the pitch-room version and records:

- pitch version/hash;
- generated_at;
- source Git SHA.

### Protected Delivery — CONDITIONAL

For genuinely non-public material, use an external access-control layer or separate controlled delivery mechanism rather than pretending an obscure static URL is secure.

Public static Page repository must not contain confidential proposal content.

### Pitch Analytics — ADOPT/OPTIONAL

Privacy-safe events:

- pitch opened;
- project proof opened;
- live demo opened;
- CTA used.

Do not track individual recipients more deeply than consent/purpose requires.

### Additional acceptance

- pitch claims derive from canonical project/proof metadata;
- live/prototype/concept status cannot be overridden locally;
- public build contains no confidential client data;
- pitch works on iPhone/iPad/desktop;
- print/PDF matches exact pitch version;
- archived/expired room is clearly marked/removed according to deployment policy.

**Sequencing:** Project Content Registry + Proof Manifest -> pitch definitions -> generated rooms -> QR/print -> optional protected delivery/analytics.

**Commercial framing:** one codebase can generate tailored, evidence-backed proposals for a client or investor in minutes while preserving truth and visual quality.


## Статус на 2026-10-04
Сделано: карта сайта и hreflang (`scripts/make-sitemap.mjs`), OG-карточки проектов (`scripts/make-og.mjs`), Turnstile с проверкой на сервере, RSS и JSON Feed (`scripts/make-feed.mjs`), Speculation Rules, структурированные данные (JSON-LD), политика CSP и кэширование в `_headers`, проверка внутренних ссылок (ошибок нет), контроль единства оформления по RU/EN и светлой/тёмной темам.
Отложено по правилу «без тяжёлых инструментов, пока нет измеренной потребности»: Lighthouse CI, Playwright, Sharp, Workbox, Pagefind, Decap, GrowthBook, сборка CSS/JS, Web Vitals, страницы-предложения (Pitch Rooms).
Следующий шаг при необходимости: Lighthouse CI и html-validate как проверка при сборке, затем минимальная телеметрия Web Vitals.

## Premium enterprise wave — Trust Center and technical due-diligence room

This wave turns the portfolio into a stronger sales/due-diligence asset for enterprise buyers and investors.

### Trust Center Registry — ADOPT

Create build-time structured data for publishable trust facts:

- project;
- architecture summary;
- authentication model;
- data authority;
- encryption/storage notes;
- audit/evidence capability;
- backup/recovery state;
- privacy posture;
- deployment/provider state;
- last verified date;
- proof/evidence link;
- disclosure/publication status.

Never publish secrets, credentials, internal endpoints or unsupported compliance claims.

### Project Readiness Matrix — ADOPT

For each project expose only verified categories such as:

- prototype;
- controlled demo;
- pilot-ready;
- field-tested;
- production;
- external-provider dependency;
- database/state mode;
- tested device/platform.

Definitions must be consistent across projects.

### Technical Due-diligence Room — ADOPT

Generate a focused buyer/investor route with:

- architecture diagram;
- authority boundaries;
- key integrations;
- security/privacy controls;
- release/deployment proof;
- test/E2E evidence;
- known dependencies/risks;
- roadmap;
- selected repository/document links.

Use the existing Proof Manifest as source.

### Capability Graph — ADOPT

Show reusable portfolio capabilities across products:

- identity/auth;
- PostgreSQL state;
- evidence/audit;
- AI governance;
- media/AR/3D;
- event/CRM;
- commerce/payments;
- analytics;
- integrations.

This demonstrates platform/IP reuse without pretending projects share one database/codebase when they do not.

### Compliance Claim Boundary — REQUIRED

Do not claim:

- SOC 2;
- ISO certification;
- HIPAA compliance;
- PCI certification;
- GDPR compliance as a blanket statement;

unless an actual scoped assessment/certification exists.

Instead state concrete controls that are actually implemented/verified.

### Exportable Due-diligence Snapshot — ADOPT

Generate a versioned print/PDF-friendly snapshot:

- source Git SHA;
- proof registry version;
- generated_at;
- project statuses;
- selected technical evidence.

### Additional acceptance

- every public trust claim has source/proof/verified date;
- stale/unverified claims are not presented as current;
- secrets/private architecture data stay out of public build;
- readiness terms use one shared definition;
- due-diligence room works on mobile/desktop and static fallback;
- exported snapshot identifies exact source version.

**Sequencing:** Proof Manifest + Pitch Rooms -> Trust Registry -> Readiness Matrix -> Due-diligence Room -> Capability Graph/export.

**Commercial framing:** enterprise buyers can evaluate technical maturity and risk without relying only on marketing language, which increases credibility and sales value.

## Moat wave — RFP and security-questionnaire response engine

This wave turns the Trust Center, Proof Manifest and project registry into a sales-operations engine that can materially reduce enterprise procurement friction.

### Canonical Answer Registry — ADOPT

Create structured, versioned answers for recurring topics:

- architecture;
- hosting;
- authentication;
- data storage;
- encryption;
- backup/recovery;
- incident handling;
- privacy;
- AI governance;
- integrations;
- accessibility;
- support;
- deployment;
- product status;
- commercial scope.

Each answer stores:

- question/topic key;
- approved text;
- applicable projects;
- evidence/proof links;
- owner;
- verified date;
- expiry/review date;
- confidentiality level.

### RFP / Questionnaire Intake — ADOPT

Accept:

- XLSX;
- CSV;
- DOCX/PDF extraction;
- structured form;
- pasted questions.

Flow:

document -> question extraction -> dedup/topic mapping -> candidate answer -> evidence links -> reviewer -> approved response -> export

No generated answer can be marked final without evidence/review.

### Evidence-grounded Drafting — ADAPT

Use the same source hierarchy as Trust Center:

canonical registry -> project proof -> approved technical docs -> draft answer

AI may rewrite for question wording, but cannot invent certifications, production state or provider support.

### OSCAL-inspired Control Mapping — ADAPT/REFERENCE

Reference:

https://github.com/usnistgov/OSCAL

Use OSCAL concepts as inspiration for structured control/evidence mapping where useful:

control/topic -> implementation statement -> evidence -> status -> responsible project/system

Do not claim NIST/OSCAL compliance merely because the schema concepts are used.

### Answer Reuse / Drift Detection — ADOPT

When project facts change:

source proof changed -> affected approved answers -> review queue

This prevents old procurement answers from surviving after architecture/deployment changes.

### Proposal / RFP Export — ADOPT

Generate:

- completed spreadsheet;
- response document;
- technical annex;
- evidence appendix;
- source/version manifest.

Every export records:

- request ID/version;
- registry version;
- source Git SHA;
- generated_at;
- reviewer.

### Bid / No-bid Intelligence — ADOPT

Before investing in a response, classify explicit requirement gaps:

- supported;
- supported with configuration;
- roadmap;
- unsupported;
- requires paid/external integration;
- prohibited/unsafe claim.

This is a transparent requirement matrix, not an AI win-probability score.

### Additional acceptance

- answers link to current proof/evidence;
- unsupported certifications are never fabricated;
- stale source triggers answer review;
- confidential answers are excluded from public Page build;
- exported response is reproducible from registry/version;
- human approval remains mandatory for external submission.

**Sequencing:** Proof Manifest + Trust Center -> answer registry -> questionnaire intake -> evidence-grounded drafting -> drift detection -> export.

**Commercial framing:** reduces enterprise sales cycle and turns technical maturity into a repeatable procurement advantage.



## Confidential disclosure override — REQUIRED

The public Page must never become a mirror of project repositories or a public technical due-diligence room.

Public project surfaces may expose only:
- business problem;
- audience / buyer;
- product value;
- safe user-facing capabilities;
- maturity/readiness at a high level;
- next externally verifiable milestone;
- commercial path and participation route.

Public surfaces must not expose:
- internal architecture or data-flow diagrams;
- infrastructure topology;
- database or queue internals;
- internal authority/module names;
- migration/schema details;
- repository SHA/branches/commit history as product proof;
- internal release/acceptance/security mechanics;
- unique implementation know-how.

Any deeper technical due-diligence capability in this master plan is reclassified as
**CONTROLLED ACCESS**, not public static content.

Disclosure ladder:
1. Public view — value, maturity, next milestone.
2. Qualified demo — deeper user flows and pilot scope.
3. NDA / diligence — selected implementation evidence under agreed scope.

Protected delivery must use a controlled mechanism outside the public static repository.
If a milestone cannot be described safely at business-result level, it is not published.

This override takes precedence over older roadmap text that could be interpreted as
publishing architecture, implementation details or technical evidence directly on
the public landing.


### Implementation note — V2.20

A lightweight subset of the Client Pitch Room concept is now implemented in V2 as a
**session-only First Meeting Room** generated from the Mini Brief.

Implemented:
- route/project-or-business-context/timing brief;
- deterministic recommendation for first meeting;
- preparation checklist;
- suggested participants;
- expected meeting output;
- next gate;
- copy and browser print/PDF;
- no public client-specific URL;
- no confidential implementation evidence.

The full Generated Proposal Microsite / protected client room remains deferred until there
is a concrete external client/investor case that justifies persistent or protected delivery.

This implementation follows the Confidential disclosure override: public/static Page does
not contain client confidential data or project technical due-diligence material.


### Implementation note — V2.21 UX journey audit

A full V2 conversion-path audit found that the page had accumulated three competing
top-of-page routing mechanisms: stakeholder role, “Where shall we start?” cards, and the
Decision Layer.

Resolved:
- Decision Layer is the single primary routing mechanism;
- Mini Brief follows directly after it;
- Portfolio Intelligence follows the Mini Brief;
- Stakeholder Lens is secondary, below the portfolio, and collapsed by default;
- project cards expose only “Open dossier” and “Start with this project”;
- commercial/evidence/investor-readiness expansion is kept in the dossier;
- a clear post-portfolio next step leads to Contact or back to the Mini Brief.

This follows the master-plan principle of progressive disclosure: proof remains available,
but the public sales journey does not require visitors to understand the site's internal
information architecture before taking action.


### Implementation note — V2.22 breakpoint QA

A responsive hardening pass was completed for the primary V2 journey at monitor, tablet
and phone breakpoint classes.

Covered:
- hero CTA visibility;
- tablet navigation crowding;
- Mini Brief sticky-height limits;
- long dossier modal scrolling;
- narrow-phone CTA stacking;
- contact form column collapse;
- First Meeting Room viewport containment;
- horizontal overflow guards in public dossier content.

This pass is explicitly a code/CSS breakpoint audit. Screenshot-based visual certification
remains a separate QA step whenever a connected browser with viewport control is available.


### Implementation note — V2.23 executive dossier

Project Dossier was consolidated into a progressive executive-reading hierarchy.

Public modal now follows:
1. **60-second decision snapshot** — problem, buyer, maturity, evidence, commercial path, next milestone and current ask.
2. **Commercial & Proof** — collapsed by default; pilot economics, validation gaps, primary risk and scale/revise/stop logic.
3. **Access & diligence** — collapsed by default; public → qualified demo → NDA/diligence.

The previous independent Decision / Commercial / Proof / Confidentiality / Disclosure blocks are not mounted separately in V2.

No underlying factual registry was removed. The change is presentation and progressive disclosure, reducing vertical length while preserving deeper evidence when deliberately requested.

Product walkthrough is also collapsed by default (gallery, facts, status, collaboration details) and can be opened explicitly from the executive snapshot.

The Confidential disclosure override remains authoritative.
