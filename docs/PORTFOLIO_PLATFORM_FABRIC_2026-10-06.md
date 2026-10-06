# Portfolio Platform Fabric — 2026-10-06

**Repository:** `PetrFedin/page`  
**Canonical file:** `docs/PORTFOLIO_PLATFORM_FABRIC_2026-10-06.md`  
**Scope:** MFW/BFS, Promomed, Renova, Synth-v2, Digital Legal Concierge, FLASHIN, ASTRA, MB16, Antiqua, Moscow, ChatX, Page, IGRA  
**Status:** PLANNED

## Purpose

This document defines a **cross-portfolio platform layer** that allows external companies to build on top of the products without merging their databases, identities or domain authorities.

The goal is to create a portfolio-level moat from:

- reusable API/SDK contracts;
- partner/developer onboarding;
- shared commercial metering;
- certification/qualification;
- trusted webhooks/events;
- capability discovery;
- OEM / white-label packaging;
- cross-product solution bundles;
- evidence-backed trust metadata.

This is a federation layer, **not** a shared business database.

---

# 1. Non-negotiable architecture

## 1.1 No shared domain database

Each product keeps its own source of truth.

Examples:

- MFW owns programme, participant/event and Deal Room state.
- Promomed owns reviewed medical/scientific evidence state.
- Renova owns project/work/evidence/acceptance state.
- Synth-v2 owns PLM/order/supplier/production state.
- Legal Concierge owns case/evidence/timeline state.
- FLASHIN owns commerce/order/payment state.
- ASTRA owns trading qualification/order/risk/accounting evidence.
- MB16 owns clienteling/fitting/wardrobe state.
- Antiqua owns object/provenance/condition/scholarly state.
- Moscow owns destination/itinerary/accessibility state.
- ChatX owns workspace/task/decision/project state.
- IGRA owns entitlement/content/session/classroom state.
- Page owns public/commercial presentation metadata only.

The Fabric never becomes a replacement domain authority.

## 1.2 Federated contracts, not federated truth

The Fabric standardizes:

- identity of partner organisation;
- API contracts;
- webhook/event envelope;
- metering dimensions;
- certification metadata;
- capability registry;
- commercial entitlement;
- developer portal experience.

It does not normalize all domain data into one universal schema.

---

# 2. Portfolio Capability Registry

Create a machine-readable registry of product capabilities.

Each capability record:

- capability ID;
- product;
- name;
- description;
- maturity;
- authority owned by;
- API availability;
- SDK availability;
- webhook availability;
- sandbox availability;
- certification status;
- commercial model;
- required providers;
- current limitations;
- proof/evidence links;
- version;
- deprecation state.

Examples:

- mfw.matchmaking;
- mfw.deal_room;
- promomed.evidence_api;
- renova.quantity_progress;
- synth.supplier_network;
- legal.case_intake;
- flashin.creator_storefront;
- astra.adapter_qualification;
- mb16.clienteling_embed;
- antiqua.provenance_api;
- moscow.itinerary_api;
- chatx.extension_runtime;
- igra.content_distribution.

This registry feeds Page Solution Configurator and developer documentation.

---

# 3. Common Partner Organisation Identity

Define a portfolio-level **partner directory**, not a shared user table.

Partner record:

- global partner ID;
- legal/display name;
- domains;
- contacts;
- contract status;
- enabled products;
- product-specific tenant/org IDs;
- billing account reference;
- support tier;
- approved environments;
- security/compliance notes;
- status.

Each product maintains its own user/member/tenant authorization.

The global partner ID only maps commercial relationships across products.

---

# 4. Contract-first API standard

## 4.1 REST/OpenAPI

Reference:

https://github.com/OpenAPITools/openapi-generator

Every public/partner API should define:

- version;
- auth scopes;
- schemas;
- pagination;
- filtering;
- errors;
- idempotency;
- rate limits;
- data classification;
- freshness;
- deprecation.

SDK generation may be centralized from approved OpenAPI contracts.

## 4.2 Events / Webhooks

Reference:

https://github.com/asyncapi/cli

Use a common event envelope:

- event_id;
- event_type;
- event_version;
- occurred_at;
- product;
- organisation scope;
- resource ID;
- payload;
- trace/correlation ID;
- signature key ID.

Every product owns its event semantics.

## 4.3 Webhook security

Require:

- signed payload;
- replay protection;
- idempotent delivery;
- retry/backoff;
- dead-letter visibility;
- secret rotation;
- endpoint verification.

---

# 5. Common Developer Portal

Create one portfolio-level portal with product-specific sections.

Partner can see:

- products/capabilities;
- APIs;
- SDKs;
- webhooks;
- sandboxes;
- examples;
- changelog;
- versions;
- status;
- rate limits;
- certification requirements;
- commercial access.

A developer chooses product/capability rather than discovering repositories manually.

---

# 6. Sandbox Federation

Each product keeps a separate synthetic sandbox.

The common portal can provision:

partner -> requested capability -> product sandbox tenant -> credentials -> sample data

Examples:

- MFW demo event/brand;
- Promomed synthetic evidence topic;
- Renova demo project;
- Synth-v2 demo brand/supplier;
- Legal demo case;
- FLASHIN demo catalog/order;
- ASTRA synthetic qualification environment;
- MB16 demo boutique/client;
- Antiqua demo collection;
- Moscow demo itinerary;
- ChatX demo workspace;
- IGRA demo content partner.

Never copy production personal/business data into common sandboxes.

---

# 7. Certification / Qualification Registry

Create one registry for **what was tested**, while each product defines the test.

Record:

- certification/qualification ID;
- partner/integration;
- product/capability;
- version;
- test profile;
- environment;
- result;
- evidence checksum;
- issued_at;
- expires/requalify trigger;
- superseded/revoked status.

Examples:

- ASTRA adapter qualified;
- IGRA content package certified;
- MB16 embedded integration validated;
- Synth-v2 Peppol partner mapping validated;
- ChatX extension reviewed;
- Moscow destination-data integration approved.

Never market internal validation as regulatory certification.

---

# 8. Usage Metering and Commercial Entitlements

Reference:

https://github.com/openmeterio/openmeter

Use a common commercial metering service for approved dimensions such as:

- API calls;
- active tenant;
- active seat/stylist;
- itinerary computation;
- qualification run;
- content activation;
- evidence/report generation;
- AI/copilot usage;
- webhook events.

Important boundary:

**metering cannot alter product domain truth.**

Billing outage must not corrupt order, evidence, case, itinerary or task state.

---

# 9. Cross-product Commercial Entitlements

A partner contract may enable several capabilities.

Example:

Luxury brand:
- MFW Deal Room + Intelligence API;
- Synth-v2 Supplier Network;
- MB16 Clienteling SDK;
- FLASHIN Creator Storefront;
- Page Pitch/Trust package.

The commercial entitlement layer only answers:

- which product/capability is purchased;
- plan/tier;
- environment;
- usage quota;
- contract period.

Each product still performs its own authorization.

---

# 10. Cross-product Solution Marketplace

Build a commercial catalogue from real capabilities.

Example solutions:

## Fashion Growth Stack
MFW + Synth-v2 + FLASHIN + MB16

show/event -> buyer network -> wholesale/supplier -> creator commerce -> private clienteling

## Evidence & Trust Stack
Promomed + Legal Concierge + ChatX

evidence -> governed workflow -> collaboration -> review/approval

## Spatial Experience Stack
Moscow + Renova + IGRA + Antiqua

AR/3D -> spatial verification -> digital twin -> cultural/educational content

## Enterprise Work Stack
ChatX + Page + selected domain APIs

work OS -> extensions -> evidence -> RFP/trust/proposal

The marketplace must not pretend all products are one application.

---

# 11. OEM / White-label packaging

For eligible capabilities support:

- SaaS;
- white-label;
- embedded widget;
- SDK;
- API;
- OEM;
- enterprise private deployment;
- implementation/support package.

Every capability declares which modes are actually supported.

---

# 12. Cross-product Event Bridge — CONDITIONAL

Do **not** create a universal event bus immediately.

First standardize event envelopes.

Only when a real commercial workflow requires cross-product automation, allow explicit bridges such as:

MFW buyer handoff -> Synth-v2 partner workflow

Synth-v2 approved retail assortment -> MB16 clienteling catalogue

FLASHIN creator campaign -> MFW campaign analytics reference

Renova completed home asset -> service network

Moscow partner itinerary -> hospitality attribution

Every bridge has:

- source event;
- destination command;
- mapping/version;
- consent/contract;
- idempotency;
- audit;
- rollback/error behavior.

No generic "sync everything".

---

# 13. Trust / Evidence Fabric

Page Trust Center consumes only approved proof projections from products:

- build/release SHA;
- environment/readiness state;
- test evidence;
- certification registry;
- API/SDK version;
- known limitations;
- source master-plan.

This enables buyer due diligence without granting repository/database access.

---

# 14. Shared Design / SDK conventions

Standardize where valuable:

- naming;
- pagination;
- idempotency keys;
- error envelope;
- webhook signature;
- version/deprecation headers;
- correlation IDs;
- audit references;
- SDK generation.

Do not standardize domain semantics that are intentionally different.

---

# 15. Platform security model

Common requirements:

- product-specific credentials;
- least privilege;
- tenant/org scope;
- key rotation;
- webhook signing;
- environment separation;
- sandbox/production separation;
- rate limiting;
- audit;
- revocation;
- no secrets in Page/static repos.

For ChatX third-party extensions, sandboxed WebAssembly may use:

- https://github.com/extism/extism
- https://github.com/bytecodealliance/wasmtime

where technically justified.

---

# 16. Platform economics

Potential revenue layers across portfolio:

1. SaaS subscription.
2. Enterprise tier.
3. API usage.
4. SDK/OEM licence.
5. Data/intelligence subscription.
6. Marketplace/revenue share.
7. Certification/qualification fee.
8. Partner onboarding/integration.
9. Premium support/SLA.
10. Private deployment.

This makes revenue repeatable across capabilities rather than project-by-project consulting only.

---

# 17. Strategic moat

The strongest portfolio-level moat is the combination of:

- longitudinal domain datasets;
- high-trust evidence;
- reusable APIs/SDKs;
- partner integrations;
- certification history;
- marketplace participants;
- cross-product commercial bundles;
- domain-specific authority models.

A competitor can copy a UI.

It is much harder to copy:

- years of verified supplier performance;
- fashion buyer network history;
- evidence-reviewed medical graph;
- construction execution history;
- legal case process evidence;
- art provenance corpus;
- accessibility field data;
- extension ecosystem;
- certified spatial content network.

---

# 18. Required implementation order

1. Product-specific APIs/SDKs remain first.
2. Capability Registry.
3. Common partner identity mapping.
4. Common API/event conventions.
5. Developer Portal.
6. Product sandboxes.
7. Certification Registry.
8. Common metering/commercial entitlements.
9. Solution Marketplace.
10. Explicit cross-product bridges only after real use cases.
11. OEM/licensing operations.
12. Portfolio-level partner analytics.

---

# 19. Non-goals

Do not:

- merge all PostgreSQL databases;
- create one universal user ID that bypasses product auth;
- centralize private domain data;
- sync everything by default;
- create cross-product personal profiling;
- reuse credentials across products;
- turn Page into backend authority;
- let metering/billing corrupt domain state;
- sell raw participant/client/user data;
- claim compliance/certification without scoped evidence.

---

# 20. Definition of success

The Portfolio Platform Fabric is successful when an external company can:

1. discover a capability;
2. understand proof/readiness;
3. get sandbox access;
4. integrate through documented API/SDK;
5. pass product-specific certification;
6. activate commercial entitlement;
7. operate in production with signed events/audit;
8. add another product capability without rebuilding the relationship from zero.

That is the point at which the portfolio behaves like a **technology platform ecosystem**, not a set of isolated applications.

## 21. Federated Trust, Credential and Reputation Fabric

This section defines the cross-product trust layer for the portfolio.

The key rule is:

**federate verification, not identity reputation.**

There must be no universal hidden score for a person, customer, creator, supplier, contractor, lawyer, expert, stylist or partner across products.

Each product owns its own scoped trust evidence and credentials.

### 21.1 Scoped Credential Registry — ADOPT

The Portfolio Fabric may index/verifiably reference credentials issued by product authorities such as:

- MFW Verified Buyer / Brand / Organisation;
- Promomed Evidence Governance / programme credential;
- Renova Verified Execution / contractor capability credential;
- Synth-v2 supplier/facility capability credential;
- Legal Case Readiness / workflow credential;
- FLASHIN Creator Programme / rights workflow credential;
- ASTRA qualification credential;
- MB16 clienteling/integration credential;
- Antiqua scholarly/institutional role credential;
- Moscow verifier/package credential;
- ChatX extension/workflow credential;
- IGRA publisher/content-package credential.

Registry record:

- credential ID;
- issuer product;
- subject type;
- scope;
- standard/profile version;
- issued_at;
- expiry/review date;
- status;
- revocation/supersession;
- verification endpoint;
- optional evidence hash/reference.

The registry does not invent credentials; it references credentials issued by the relevant product.

### 21.2 Verifiable Credential Compatibility — ADAPT

Reference:

https://github.com/w3c/vc-data-model

Where useful, model portable attestations so an external verifier can confirm:

- issuer;
- subject;
- claim/scope;
- issuance/expiry;
- credential status;
- proof.

VC compatibility is a transport/verifiability mechanism. It does not create authority that the issuer does not possess.

### 21.3 Partner Trust Graph — ADOPT

Maintain an internal B2B graph:

partner organisation
-> products enabled
-> integrations
-> certifications/qualifications
-> incidents
-> support/reliability history
-> commercial relationship
-> renewal/status

Useful dimensions:

- legal/domain identity verified;
- integration certification current;
- incident state;
- credential expiry;
- support response where explicitly measured;
- production usage/current compatibility.

No single universal trust score.

### 21.4 Cross-product Credential Reuse — CONDITIONAL

A credential issued by one product may reduce duplicated onboarding in another product only when the receiving product explicitly trusts that credential for a narrow purpose.

Examples:

- verified legal organisation identity may map to partner organisation identity;
- verified enterprise domain may reduce duplicate domain verification;
- certified API partner may reuse common webhook-signature onboarding.

But:

- MFW Verified Buyer does not imply Synth-v2 supplier approval;
- Renova contractor credential does not imply legal counsel status;
- Promomed expert role does not imply Antiqua expertise;
- ChatX extension publisher verification does not imply marketplace trust elsewhere.

Cross-product trust is always explicit, scoped and policy-driven.

### 21.5 Certification Status API — ADOPT

Provide a portfolio-level verification endpoint:

- credential/certification ID;
- issuer;
- product;
- scope;
- current status;
- version;
- issue/expiry;
- verification URL;
- superseded/revoked state.

This supports procurement and partner due diligence.

### 21.6 Artefact Provenance — ADAPT

Reference:

https://github.com/sigstore/cosign

For software/content artefacts where appropriate, support signatures/provenance for:

- ChatX extension packages;
- ASTRA qualified adapter builds;
- IGRA certified content packages;
- generated SDK releases;
- selected product integration bundles.

Keep software/content artefact identity separate from human/company credentials.

### 21.7 Standards Registry — ADOPT

The Fabric should maintain a catalogue of proprietary standards and profiles, including:

- owner product;
- standard/profile name;
- version;
- purpose;
- machine-testable requirements;
- evidence requirements;
- changelog;
- deprecation;
- verification method;
- public/private status.

This turns product operating methods into reusable intellectual property rather than undocumented internal practice.

### 21.8 Open / Closed Boundary — ADOPT

For each standard decide deliberately:

- fully public specification;
- public core + proprietary certification;
- private enterprise standard;
- partner-only profile.

A strong moat may come from publishing enough of a standard to encourage adoption while retaining valuable:

- certification service;
- marketplace;
- trust graph;
- network data;
- tooling;
- support;
- commercial access.

### 21.9 Reputation Rules — REQUIRED

Across the portfolio:

- never create hidden social-credit style scores;
- never merge unrelated product histories into one personal reputation;
- never infer protected/sensitive attributes;
- always distinguish verified, self-declared, external and model-derived evidence;
- expose denominator/period for performance metrics;
- give new participants a neutral no-history state;
- preserve incident/revocation history;
- allow correction/appeal for factual errors where appropriate.

### 21.10 Data Network Effects — ADOPT

The Fabric can map which proprietary datasets compound over time without centralising raw data.

Examples:

- MFW longitudinal buyer/brand network;
- Promomed claim/evidence/expert review graph;
- Renova execution/provider history;
- Synth-v2 supplier/facility production history;
- Legal workflow/readiness patterns;
- FLASHIN creator/commerce rights history;
- ASTRA adapter/provider qualification history;
- MB16 service/clienteling benchmark history;
- Antiqua provenance/scholarly corpus;
- Moscow field/accessibility verification;
- ChatX extension/workflow execution evidence;
- IGRA publisher/package/content network.

The strategic goal is to grow **product-specific data moats** while the Fabric only describes/markets/verifies them.

### 21.11 Marketplace Trust Loop — ADOPT

For products with marketplaces:

publisher/provider
-> onboarding
-> credential/certification
-> marketplace participation
-> real transactions/execution
-> evidence/reliability history
-> credential renewal/status
-> improved discovery

This creates a compounding trust loop.

Examples:

- FLASHIN creators;
- Renova service providers;
- Synth-v2 suppliers;
- ChatX extension publishers;
- IGRA content publishers;
- Antiqua institutional contributors where marketplace/commercial workflows apply.

### 21.12 Acceptance

- no universal cross-product user reputation score exists;
- every credential has issuer, scope, version and status;
- cross-product reuse requires an explicit trust policy;
- revocation/expiry is visible centrally;
- artefact signatures are separate from human/organisation credentials;
- raw private domain data remains in the owning product;
- public verification reveals only the minimum information necessary;
- standards can evolve without rewriting historical credentials.

**Strategic outcome:** partners can build trust with the portfolio over time, but each product preserves the domain-specific meaning of that trust. This creates a networked ecosystem without creating a dangerous or meaningless global reputation system.



## 22. Institutional Distribution and Portfolio Commercial Fabric

The portfolio now needs a common commercial/distribution layer that helps institutions adopt multiple products without collapsing their domain authorities.

### 22.1 Enterprise Account Graph — ADOPT

Maintain a portfolio-level commercial graph:

`organisation -> contacts -> products considered -> pilots -> integrations -> credentials -> contracts -> renewals -> expansion`

This is commercial relationship data only. Domain product data remains in the owning application.

### 22.2 Cross-product Solution Bundles — ADOPT

Package combinations only where there is a credible buyer journey, for example:

- Fashion Operations: Synth-v2 + MFW professional network + Page trust/verification;
- Cultural Infrastructure: Antiqua + Moscow destination distribution;
- Enterprise Evidence: ChatX receipts + Digital Legal readiness + Page verification;
- Physical-Digital Commerce: FLASHIN + IGRA partner distribution;
- Property Trust: Renova + Page trust/verification.

Bundles share commercial packaging and SSO/integration where appropriate, not databases.

### 22.3 Institutional Procurement Pack — ADOPT

For each product/bundle provide a standard procurement surface:

- product scope;
- deployment model;
- security/privacy summary;
- API/integration model;
- evidence/standard registry;
- implementation plan;
- SLA/support model;
- pricing unit;
- pilot acceptance criteria;
- reference architecture;
- data exit/export path.

### 22.4 Pilot-to-Scale Contract — ADOPT

Every enterprise pilot should define before launch:

- buyer problem;
- scope;
- users/data;
- integration;
- success metrics;
- acceptance evidence;
- go/no-go date;
- scale conditions;
- commercial conversion path.

This prevents "successful demo" from being mistaken for a successful enterprise pilot.

### 22.5 Reference Architecture Library — ADOPT

Publish approved patterns for:

- standalone SaaS;
- private/enterprise deployment;
- embedded/OEM;
- API-only;
- white-label;
- partner marketplace;
- federated data contribution.

Each pattern specifies authority boundaries and data flows.

### 22.6 Partner Programme — ADOPT

Portfolio-level partner classes:

- implementation partner;
- integration partner;
- data/content partner;
- distribution/referral partner;
- institutional publisher;
- certified tool/provider.

Product-side certification still defines technical/domain eligibility.

### 22.7 Marketplace / Revenue-share Governance — ADOPT

Where products use revenue share, define common controls:

- partner identity;
- contract/version;
- attribution source;
- transaction basis;
- refund/reversal handling;
- statement;
- dispute;
- payout status.

The Fabric does not calculate domain transaction truth; it standardizes governance around it.

### 22.8 Portfolio Usage / Expansion Intelligence — ADOPT

Track institution-level commercial signals such as:

- activated product;
- active integration;
- credential status;
- API usage band;
- pilot completion;
- renewal state;
- cross-product opportunity.

Do not centralize sensitive domain events just to build a portfolio dashboard.

### 22.9 Institutional Reference Programme — CONDITIONAL

With customer permission, create reference tiers:

- private reference;
- reference call;
- public case study;
- verified integration reference.

No customer/logo claim without explicit consent.

### 22.10 Data Exit and Anti-hostage Principle — REQUIRED

Every enterprise product must document:

- exportable business data;
- evidence/credential export;
- retention after termination;
- verification of historical records;
- deletion policy where applicable.

The portfolio should create high switching cost through accumulated value and integrations, not by trapping customer data.

### 22.11 Active portfolio scope

Current strategic development scope excludes legacy/non-priority repositories explicitly set aside by portfolio governance. Cross-product Fabric documents should reference only products that are actively maintained for this strategy cycle.

### 22.12 Acceptance

- portfolio commercial graph never becomes domain source-of-truth;
- bundle packaging does not imply shared database;
- pilot acceptance is measurable before implementation;
- partner status cannot exceed product-side certification scope;
- every enterprise product has a documented exit/export path;
- public references require customer consent.

**Strategic outcome:** the portfolio becomes easier to buy, pilot, integrate and expand across institutions while each product preserves its own authority, moat and product identity.
