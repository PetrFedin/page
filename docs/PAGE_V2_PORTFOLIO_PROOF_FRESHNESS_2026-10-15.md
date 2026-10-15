# SYNTHA V2 — portfolio evidence freshness check
**Read-only check:** 15 October 2026. **This is not a production-readiness audit.**

## Method
Fetched each explicitly known project repository's `main` branch HEAD and inspected available README/current-state text. Compared with the previously audited October 6 registry `PORTFOLIO_SOURCE_OF_TRUTH_2026-10-06.md`. A new Git SHA is evidence of code movement **only**, not of a new deployed feature, valid pilot, contract or financial result.

## Verified GitHub source-heads

| Dossier | Source repository / main SHA (15 Oct 2026) | Prior registry comparison | Source limitations |
|---|---|---|---|
| Syntha V2 | [PetrFedin/synth-v2](https://github.com/PetrFedin/synth-v2), `546ef6afd0dd4f70bda54716fa3770566d014480` | Changed since Oct 6 audit `bf76e71…` | README describes PostgreSQL/RBAC/PLM and evidence-first AI design; separately verify exact migrations, runtime, /ready and commercial pilot |
| ChatX | [PetrFedin/chat](https://github.com/PetrFedin/chat), `9781ed58372773e1ec65e59bbaccc264c7e1ac6a` | Same as Oct 6 audit | Earlier registry reports repository/CI evidence; external production and provider integrations not proven by this check |
| Renova | [PetrFedin/renova](https://github.com/PetrFedin/renova), `f62e491aeb2c0b8a36bbbd15af719050d692546c` | Same as Oct 6 audit | Prior `BLOCKED_FOR_BROAD_PRODUCTION` boundary must not be promoted to green based on stale registry |
| MFW/BFS/Made in Moscow | [PetrFedin/MFW](https://github.com/PetrFedin/MFW), `7a2e7b98f9192862cbafe638cc3732c2db4f0f01` | Changed since Oct 6 audit `e930f42…` | `CURRENT_STATE.md` says its last consolidated state is October 3; existing PostgreSQL Authority binding remains stated as a release blocker. Recheck current HEAD before claims |
| СОСТОЯНИЕ / Promomed concept | [PetrFedin/promomed](https://github.com/PetrFedin/promomed), `3471d05af97fe65e9e08b9da03a4c68bf81a2a78` | Changed since Oct 6 audit `9ccbd45…` | README explicitly identifies this as an independent concept, not an official Promomed company product. Demonstration includes illustrative data |
| Antiqua | [PetrFedin/antiqua](https://github.com/PetrFedin/antiqua), `4f3e396ce6052ae8924235eab3ed4ad11cac470c` | Not previously mapped in Oct 6 registry | **Source conflict:** README still describes antiques/collectibles while the approved landing direction is **paintings, works on paper and engravings only**. This is not production commerce; current README states payments/KYC/persistence missing |
| IGRA | [PetrFedin/igra](https://github.com/PetrFedin/igra), `eb50e2a88c8c3497df409c9013dc646c5b80261d` | Not previously mapped | README describes construction/AR/LDraw/testing; no external-production maturity conclusion from HEAD+README |
| FUR PRODUCTION | [PetrFedin/fur-erp](https://github.com/PetrFedin/fur-erp), `7c6f2af5032e85490665f1b8962e7f543ce77df8` | Not previously mapped | Source README contains legacy client-specific branding; public landing must stay generic FUR PRODUCTION, without revealing unrelated client names. Validate reusable IP and data rights before an enterprise offer |

The appropriate source of truth for project maturity is **current code + its canonical readiness evidence + exact-head CI + deployed-provider proof when claimed**. Branch SHA or README alone is not proof of production.

## Not yet mapped to an authoritative verified source in this check
- Fashion Management OS — establish exact owning repository and independent product-scoping evidence before attaching a build/runtime status.
- Marco Pescarolo Commercial OS — the guessed `PetrFedin/marco-pescarolo-commercial-os` repository path returned 404 under the current connection. This **does not prove the project is missing**; owner/repository may differ. Do not cite a guessed repository or assert deploy readiness.
- Debt Stability OS / Fintech Debt Assistant — source repository/rights not resolved by this check.

## Required remediation order
1. Link each of the 11 public dossiers to its **actual** repository, canonical current-state document and owner-approved rights; keep missing mappings private and marked UNVERIFIED.
2. Antiqua: reconcile source README/product canon with paintings-only scope before new product maturity/capability claims. Do not revert landing to antiques.
3. Confirm Promomed project identity is presented as an **independent concept**, not an official product, commercial endorsement or measured company result.
4. MFW and Syntha V2: refresh current migrations/authority/CI/deployment evidence after changed SHAs; maintain HOLD for prerequisites not verified.
5. FUR: separate reusable product capabilities and demo-safe data from customer-specific records and names.
6. For every investor teaser: show evidence as **Verified / Prototype / Designed / Unverified**, with dated source and version; never create investor ROI, share availability or commercial traction from an unverified README.
7. Reconcile cross-repo source snapshots into landing after human review; **do not automatically publish** repository metadata or confidential source terms.

## What this check did not do
No project application was deployed; no database, client environment, paid resource or GitHub `main` branch was modified. No current customer, revenue, milestone or equity ownership was asserted or verified.
