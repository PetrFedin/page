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
