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

## Platform economics wave — Solution Configurator and capability licensing

This wave makes Page the commercial control surface for packaging reusable technology from the portfolio into client-specific solutions.

### Capability Registry — ADOPT

Create structured capabilities such as:

- identity/RBAC;
- evidence/audit;
- AI governance;
- event/agenda;
- B2B matchmaking;
- commerce/order;
- CRM/clienteling;
- AR/3D;
- itinerary/routing;
- scientific evidence;
- legal workflow;
- analytics/intelligence;
- partner APIs/SDKs.

Each capability links to:

- source project;
- maturity/readiness;
- dependencies;
- proof;
- reusable/embedded status;
- delivery constraints;
- supported deployment model.

### Solution Bundle Definition — ADOPT

Define packages such as:

- Fashion Event & B2B Network;
- Luxury Clienteling;
- Fashion PLM & Supplier Network;
- AI Work OS;
- City/Destination Platform;
- Evidence-backed Medical Platform;
- Legal Resolution Platform;
- Spatial/AR Education Platform.

A bundle is generated from real capabilities, not marketing-only text.

### Interactive Solution Configurator — ADOPT

Visitor/client selects:

- industry;
- audience;
- required modules;
- integrations;
- deployment preference;
- languages;
- AI/3D/AR needs;
- pilot scale.

Output:

- recommended capability bundle;
- source projects/components;
- dependencies;
- what exists now;
- what requires integration/customization;
- suggested pilot path;
- relevant proof cards.

Do not generate a binding price or delivery promise without commercial review.

### Reusable Component / License Map — ADOPT

For internal sales/delivery expose:

- reusable proprietary module;
- open-source dependency;
- license constraints;
- project-specific code;
- extraction/refactor needed;
- partner/provider dependency.

This prevents selling "reusable platform" where only a bespoke demo exists.

### Commercial Package Authority — ADOPT

Version:

- package name;
- included capabilities;
- optional modules;
- support tier;
- commercial model;
- deployment assumptions;
- validity period.

Pricing can remain private/internal.

### Proposal Generation — REUSE

Feed Solution Configurator into existing Pitch Rooms and RFP engine:

configured solution -> selected proof -> technical annex -> proposal microsite -> procurement answers

### Capability Licensing / OEM — CONDITIONAL

For mature reusable modules, support commercial models:

- SaaS;
- white-label;
- embedded API/SDK;
- OEM;
- annual platform license;
- implementation + support.

Actual license terms require legal/commercial approval.

### Additional acceptance

- every capability links to real source project/proof;
- readiness is not inflated;
- dependencies/licensing are visible;
- configuration cannot promise unsupported integration;
- proposal uses exact selected capability version/status;
- public site does not expose confidential pricing/legal terms.

**Sequencing:** Proof/Trust/RFP registries -> Capability Registry -> bundles -> Configurator -> proposal generation -> licensing/OEM map.

**Commercial framing:** Page becomes a productization layer for the whole portfolio, enabling one technology base to generate multiple enterprise offers rather than selling repositories one by one.

## Portfolio-level platform overlay

Cross-product API/SDK, partner onboarding, certification, metering, developer portal and solution-marketplace architecture is defined in:

- [PORTFOLIO_PLATFORM_FABRIC_2026-10-06.md](./PORTFOLIO_PLATFORM_FABRIC_2026-10-06.md)

This overlay must **not** merge product databases or domain authorities. Product-specific master plans remain authoritative for implementation sequencing inside each application.

## Defensibility wave — Portfolio Trust Registry and integration-partner credentials

This wave turns Page/Trust Center into the public verification surface for the portfolio's standards, partner status and certification artefacts.

### Portfolio Trust Registry — ADOPT

Maintain public/non-public records for:

- product capability;
- API/SDK version;
- integration certification;
- partner status;
- product readiness;
- trust/evidence standard;
- credential issuer;
- credential/status endpoint;
- certification evidence hash;
- issued/reviewed/expired/superseded state.

The registry references product authorities; it does not issue domain facts on their behalf unless explicitly designated as issuer.

### Standard Registry — ADOPT

List proprietary/versioned standards such as:

- MFW Network Trust Passport standard;
- Promomed Evidence Governance Standard;
- Renova Verified Execution Record;
- Synth-v2 Supplier Trust Credential profile;
- Legal Case Readiness Standard;
- ChatX Execution Receipt Standard;
- Moscow Destination Package Standard;
- IGRA Content Certification profile;
- ASTRA Qualification profile.

Every standard includes:

- scope;
- version;
- owner;
- required evidence;
- current status;
- changelog;
- deprecation/supersession policy.

### Integration Partner Credential — ADAPT

Use verifiable credentials where beneficial to state narrow facts:

- API Integration Verified;
- SDK Integration Verified;
- Certified Content Publisher;
- Qualified Adapter;
- Evidence Syndication Partner.

Credential cannot exceed the underlying product certification scope.

### Public Verification Page — ADOPT

A buyer can verify:

- credential/status ID;
- issuer;
- product/capability;
- version;
- issue/expiry;
- current status;
- evidence scope;
- superseded/revoked state.

No private implementation evidence is exposed unnecessarily.

### Partner Trust Graph — ADOPT

Internal commercial graph:

partner -> products -> integrations -> certification -> support/incidents -> renewal/usage

This supports relationship management and prioritisation.

It is not a universal moral/reputation score.

### Trust Center Integration — REUSE

Trust Center surfaces:

- current standards;
- technical evidence;
- certification status;
- deprecated versions;
- supported deployment/integration modes.

### Additional acceptance

- every public credential/status maps to a real product-side record;
- expired/revoked status is immediately visible;
- registry never claims regulatory certification by implication;
- partner graph does not expose confidential commercial terms publicly;
- standard version history is immutable;
- product team remains authority for its own certification evidence.

**Sequencing:** product standards/credentials -> Portfolio Platform Fabric certification registry -> Trust Registry -> public verification -> partner graph.

**Moat:** standards and integration credentials make the portfolio easier to trust, integrate and procure while increasing switching costs for certified partners.

