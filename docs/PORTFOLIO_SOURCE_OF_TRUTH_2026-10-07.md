# Portfolio Source-of-Truth Registry

Updated: 2026-10-07

This registry defines the evidence sources used to describe projects on the Syntha landing.
A roadmap item from an Integration Master Plan is never treated as implemented until the
current project repository contains implementation/acceptance evidence.

## Syntha

Repository: `PetrFedin/synth-v2`
Audited HEAD: `99311b4e`

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
- evidence-backed Supplier Passport v1 and executive supplier evidence route;
- persistent EntityThread / immutable messages / Decision Ledger with real PostgreSQL integration proof.

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
Audited HEAD: `6f941b59`

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
- persistent organisation registry v1 and organisation-network investor evidence;
- separate monitor/tablet/phone responsive layouts with regression coverage;
- fail-closed Capital Authority admission contract requiring PostgreSQL, schema reconciliation and hash-chain verification.

Current boundary:
- production admission remains blocked until the existing PostgreSQL authority is securely bound and `/ready` is green;
- persistent commercial writes remain gated.

Planned, not current:
- Persistent Fashion Industry Network;
- institutional publishers and approved fashion-service network;
- enterprise/association bundles and broader partner API distribution.

## Promomed / СОСТОЯНИЕ

Repository: `PetrFedin/promomed`
Audited HEAD: `a98489fa`

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
- recent Knowledge Change Impact and fail-closed source-trust/publication-hold work;
- External Verification Interoperability v1: issuer lifecycle, Ed25519 public-key verification, status lists and retrievable immutable signed checkpoints.

Current boundary:
- suitable for controlled-pilot diligence, not a claim of production medical governance or market traction;
- durable PostgreSQL admission remains required before Phase 1.

Planned, not current:
- Evidence Governance Standard / Seal;
- Medical Knowledge Syndication API and embedded evidence widgets;
- professional education credentials;
- Scientific Evidence Distribution Network.

## Moscow — internal / not published in the public portfolio

The project remains in the internal project inventory, but as of 2026-10-07 it is intentionally **not published as a portfolio card**. Its government-pilot and field-verification materials must not be projected into the public landing until a separate publication decision is made.

## Confidential Fashion Management OS

Public identity: `Fashion Management OS`
Source: confidential client implementation; client/brand name is intentionally excluded from the landing and from this registry.
Audited implementation HEAD: `700c290a`

Current evidence checked:
- end-to-end model/catalogue → order → workshop operations → materials/payments flow;
- Plan / Actual / CTC / Forecast cost engine with snapshot rates/prices and frozen final-cost close;
- WIP, capacity, bottleneck and allocation queue;
- 13-week liquidity, month close and benefits/evidence register;
- role-scoped access, audit trail, safe update/rollback and responsive design work across monitor/tablet/phone.

Public boundary:
- do not expose client/brand identity, people, real orders, prices, payment/cash-flow data, contracts or internal documents;
- describe only the product architecture, governance model and evidenced operating capabilities.

## Confidential FUR PRODUCTION OS

Public identity: `FUR PRODUCTION OS`
Source: confidential client implementation; client/brand name is intentionally excluded from the landing and from this registry.
Audited implementation HEAD: `72e4553a`

Current evidence checked:
- procurement → specific raw-material lot → stock → production → finished-goods traceability;
- specific-identification costing rather than average-cost inventory;
- landed-cost components, lot-level stock movements, norms/BOM and production consumption;
- payments, documents, fittings, audit history and transactional corrections;
- backup/restore and concurrent-write/data-integrity protections.

Public boundary:
- do not expose client/brand identity, suppliers, buyers, real lot/order identifiers, prices, payment details, source registers or uploaded documents;
- public proof should stay at architecture, traceability, data-integrity and operational-control level.

## Antiqua

Repository: `PetrFedin/antiqua`
Audited HEAD: `dfef3116`

Current-state sources:
- gallery-first implementation commits (`f85af36e`, `174bc586`, `af34547f`);
- current production-admission and research-trust implementation on main;
- root `README.md` is known to contain stale legacy antique/object wording and is **not** accepted as current product framing where it conflicts with the gallery-first implementation.

Strategic additions source:
- `docs/ANTIQUA_INTEGRATION_MASTER_PLAN_2026-10-01.md`

Current evidence checked:
- Gallery → Artwork → Artist → Related Works journey;
- Collections → Taste retention loop;
- explicit focus on painting, drawing, graphics, engraving/printmaking and works on paper;
- Art Network design built around authoritative art entities rather than a generic social feed;
- machine-verifiable production admission and research trust stack on current main.

Current boundary:
- remaining legacy antique/object language must continue to be removed from product surfaces;
- production PostgreSQL integrity/admission proof and external gallery/collection pilot are still required.

## Landing update rule

Before changing any project card, evidence block, commercial model or project publication:

1. Read repository HEAD and recent material commits.
2. Read the current-state/readiness source listed above.
3. Read the canonical Integration Master Plan from repository HEAD.
4. Classify each claim as **implemented/current**, **next gate**, or **planned strategic extension**.
5. Never promote a planned item into implemented/current without repository evidence.
6. Update the audited HEAD in this registry whenever a material landing change is made.
