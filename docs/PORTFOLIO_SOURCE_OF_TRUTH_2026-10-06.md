# Portfolio Source-of-Truth Registry

Updated: 2026-10-06

This registry defines the evidence sources used to describe projects on the Syntha landing.
A roadmap item from an Integration Master Plan is never treated as implemented until the
current project repository contains implementation/acceptance evidence.

## Syntha

Repository: `PetrFedin/synth-v2`
Audited HEAD: `bf76e71af91c48d929bc7d4c4430c8081335f2cf`

Current-state sources:
- `README.md`
- `ARCHITECTURE.md`

Strategic additions source:
- `docs/SYNTH_V2_INTEGRATION_MASTER_PLAN_2026-10-01.md`
- supporting gap/backlog documents under `docs/`

Current evidence checked:
- PostgreSQL-owned executable core;
- authenticated organisation/RBAC and partner access;
- showroom/catalog pricing, MOQ/ATS, reservations, bilateral confirmation and DealSpace;
- live acceptance gates for collection, product readiness and product commercialisation;
- evidence-backed Supplier Passport v1 and executive supplier evidence route.

Planned, not current:
- Supplier Trust Graph;
- portable production credentials;
- Fashion Supply Network Standard and federated supplier ecosystem.

## ChatX

Repository: `PetrFedin/chat`
Audited HEAD: `9781ed58372773e1ec65e59bbaccc264c7e1ac6a`

Current-state sources:
- `README.md`
- `docs/ROADMAP.md`

Strategic additions source:
- `docs/CHATX_INTEGRATION_MASTER_PLAN_2026-10-01.md`

Current evidence checked:
- PostgreSQL-backed workspace, RBAC, realtime, chat, files, tasks, calendar and organisation structure;
- LiveKit media boundary and evidence-first Meeting Intelligence;
- durable worker/outbox/integrations;
- structured Requests and Approvals with versioned templates, approval chains, amount thresholds, needs-info loop, task generation and queue metrics.

Current boundary:
- repository/local/CI proven;
- live external providers and an external production deployment/pilot are not yet proven.

Planned, not current:
- Work Graph and Execution Risk Radar;
- AI Privacy Gateway;
- secure external workrooms;
- Execution Receipt Standard and Inter-company Execution Network.

## Renova

Repository: `PetrFedin/renova`
Audited HEAD: `f62e491aeb2c0b8a36bbbd15af719050d692546c`

Current-state sources:
- `README.md`
- `PRODUCTION-READINESS.md`
- `docs/DEMO-GUIDE.md`
- `docs/production-readiness-evidence.json`

Strategic additions source:
- `docs/RENOVA_INTEGRATION_MASTER_PLAN_2026-10-01.md`

Current evidence checked:
- iPhone-first Expo/React Native product;
- FastAPI/PostgreSQL API + dedicated worker + Redis + S3-oriented runtime contract;
- estimate/budget, stages, acceptance/evidence, payments, procurement/materials, documents and offline actions;
- investor demo guide and repeatable local demo topology;
- fail-closed production controls, integration registry and release-smoke evidence.

Current boundary:
- broad production verdict is `BLOCKED_FOR_BROAD_PRODUCTION`;
- external infrastructure, live providers, store/legal/security and real pilot evidence remain open.

Planned, not current:
- Verified Execution Record;
- contractor capability credentials;
- verified service/contractor network;
- Property Trust Infrastructure.

## MFW / BFS / Made in Moscow

Repository: `PetrFedin/MFW`
Audited HEAD: `e930f42df2e59bcd4c5b0d04cf73f54c6290b35b`

Current-state sources:
- `CURRENT_STATE.md`
- `README.md`
- `RELEASE_LOG.md`

Strategic additions source:
- `docs/MFW_INTEGRATION_MASTER_PLAN_2026-10-01.md`
- `docs/MFW_MADE_IN_MOSCOW_PARTNERSHIP_2026-10-02.md`

Current evidence checked:
- shared identity and separate MFW/BFS registration;
- participant PWA and global Discover across MFW/BFS/Made in Moscow;
- lifecycle-aware Before/Live/After participant mode;
- Brand CRM/CDP and Owner Control Tower;
- Buyer/Brand Deal Room read-only preview;
- persistent organisation registry v1 and organisation-network investor evidence.

Current boundary:
- production admission remains blocked until the existing PostgreSQL authority is securely bound and `/ready` is green;
- persistent commercial writes remain gated.

Planned, not current:
- Persistent Fashion Industry Network;
- institutional publishers and approved fashion-service network;
- enterprise/association bundles and broader partner API distribution.

## Promomed / СОСТОЯНИЕ

Repository: `PetrFedin/promomed`
Audited HEAD: `9ccbd45b101c4ca9fd321e201b713ccb26685382`

Current-state sources:
- `README.md`
- `docs/IMPLEMENTED_SCOPE.md`
- `docs/DEPLOYMENT_STATE.md`
- `docs/INVESTOR_READINESS_2026-10-05.md`
- `docs/EXECUTIVE_CVC_ROOM_2026-10-05.md`

Strategic additions source:
- `docs/PROMOMED_INTEGRATION_MASTER_PLAN_2026-10-01.md`

Current evidence checked:
- live v1.4 year-round health-media plus 42-event / seven-venue conference experience;
- Pilot Command System, Customer Intelligence and Owner Control Tower;
- Investor / Investment Committee / Executive-CVC / Corporate Security diligence surfaces;
- Personalised Home, Relationship 365 and Discovery authority;
- Transcript Intelligence and Claim Evidence Graph;
- recent Knowledge Change Impact and fail-closed source-trust/publication-hold work.

Current boundary:
- suitable for controlled-pilot diligence, not a claim of production medical governance or market traction;
- durable PostgreSQL admission remains required before Phase 1.

Planned, not current:
- Evidence Governance Standard / Seal;
- Medical Knowledge Syndication API and embedded evidence widgets;
- professional education credentials;
- Scientific Evidence Distribution Network.

## Landing update rule

Before changing any project card, evidence block, commercial model or project publication:

1. Read repository HEAD and recent material commits.
2. Read the current-state/readiness source listed above.
3. Read the canonical Integration Master Plan from repository HEAD.
4. Classify each claim as **implemented/current**, **next gate**, or **planned strategic extension**.
5. Never promote a planned item into implemented/current without repository evidence.
6. Update the audited HEAD in this registry whenever a material landing change is made.
