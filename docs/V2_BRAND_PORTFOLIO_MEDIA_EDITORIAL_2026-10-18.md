# V2 — brand clarity, cross-repo maturity, media and editorial admission
**Evidence reviewed:** 18 October 2026. **Deployment rule:** V1 and `syntha.pro` remain unchanged. This document is a review, not proof of public V2 availability.

## 1. Professional brand and commercial path
- The hero now has two primary choices; previous experience/partner/news/contact routes remain available under an expandable disclosure, not deleted.
- Separate client/pilot/investor entry cards and the selected consultation focus still land in the original consent-protected form.
- A three-step `clarify → scope → propose` explanation replaces unqualified delivery commitments.
- Levels of proof are explicit: proposed methodology, tested prototype, and measured client outcome are different.
- Do not cite any self-reported GMROI, turnaround, ROI, revenue or time-saving figure as independently verified until period/source/formula/permissions are documented.
- Route and contact regression must pass at 375, 768 and 1440 px in both languages. Live Cloudflare Turnstile, Telegram delivery and all commercial promises still require independent acceptance.

## 2. Authoritative product-source reconciliation (read-only)
The **main-head** is not necessarily the CI **PR-head**; a green test proves only its own SHA and test scope. Descriptions and source readiness must be rechecked at future release time.

| Portfolio | Repository/snapshot inspected | Source-backed boundary | Media |
|---|---|---|---|
| Syntha | [synth-v2](https://github.com/PetrFedin/synth-v2), main `546ef6afd0dd4f70bda54716fa3770566d014480`; more recent PR CI `c12628d...` | PLM, buying, showroom and SKU-economic workflows; production readiness and first customer pilot require external/runtime evidence | The 26.6-second capture from [run 39130941933](https://github.com/PetrFedin/synth-v2/actions/runs/39130941933) targets **the old V2 landing**, not the product UI: **DO NOT USE AS PRODUCT MEDIA** |
| ChatX | [chat](https://github.com/PetrFedin/chat), main `030ad00bf69e3e9b6d5d39f561ca9bff60ffb611`; [isolated demo run 39129731771](https://github.com/PetrFedin/chat/actions/runs/39129731771), exact capture `1ca91bae...` | Messaging, tasks, calendar, company knowledge and meeting flows; LiveKit/object storage/provider admission are separate from browser demo | 10 real Chromium demo screenshots + 27-second screen recording; review of identities and licences still required |
| Renova | [renova](https://github.com/PetrFedin/renova), main `f62e491aeb2c0b8a36bbbd15af719050d692546c` | Production-readiness document explicitly says `BLOCKED_FOR_BROAD_PRODUCTION`; external integrations, mobile store and ops gates remain | Older portfolio screenshots exist; no current-source, versioned runtime capture established in this audit |
| MFW · BFS · Made in Moscow | [MFW](https://github.com/PetrFedin/MFW), main `7a2e7b98f9192862cbafe638cc3732c2db4f0f01`, newer CI on `9ecc116...` | Multi-event/multi-role platform; production PostgreSQL authority binding requires separate acceptance | Media-run exists but latest artifact was not available for independent inspection at audit time; retain verified old media only with historical label |
| СОСТОЯНИЕ | [promomed](https://github.com/PetrFedin/promomed), main `3471d05af97fe65e9e08b9da03a4c68bf81a2a78`; [live capture 39131050268](https://github.com/PetrFedin/promomed/actions/runs/39131050268) at `638ea8be...` | Functional public preview; **independent concept, not a claim of client sponsorship or endorsement** | 13 screenshots and 25-second iPhone/desktop recordings from the public preview; await editorial/rights review |
| Fashion Management OS | [fashion management source](https://github.com/PetrFedin/yanina-management), master `f794c555220ef7b82ed76b32fea134f4a3b3a9f9`; [media run 38096596430](https://github.com/PetrFedin/yanina-management/actions/runs/38096596430) at `32808de...` | Versioned material/operation rates, costing plan/actual, WIP/order closing and 13-week liquidity; customer-specific identities must not appear publicly | Two actual isolated-running-app tablet screenshots, older than latest main; recapture before announcing them as current |
| THE FUR | [fur-erp](https://github.com/PetrFedin/fur-erp), main `d0cd7a47edb00db987da0281f294b64b56daf644` | Production materials/lots/costing described; recent CI failures block any stronger maturity claims | No independent, current, safe screenshots admitted |
| Antiqua | [antiqua](https://github.com/PetrFedin/antiqua), main `4f3e396ce6052ae8924235eab3ed4ad11cac470c`; later CI green on separate SHA | Desired paintings/graphics research scope conflicts with older README descriptions; preview is not production commerce, expert authentication or settlement | Await licensed artworks, reviewed provenance and privacy-safe current gallery capture |
| IGRA | [igra](https://github.com/PetrFedin/igra), main `eb50e2a88c8c3497df409c9013dc646c5b80261d` | AR assembly, compatible parts and browser demo, but 18 Oct quality gates reported failures across iOS, web and authority checks | No product capture admitted pending working-device proof |
| Private Commercial Showroom | Exact canonical repository still not identified under the linked account; media workflow on [page run 39056271800](https://github.com/PetrFedin/page/actions/runs/39056271800) failed | Product concept and staged prototype only; no independent production/identity readiness established | Failed capture is not a valid product proof |
| SVEDO | Canonical project repository mapping and up-to-date runtime SHA not independently established | Financial scenario tool / local prototype; no verified banking integrations or production obligations | No media; do not substitute a generated screenshot |

## 3. Media admission protocol
1. **Capture** full product UI from isolated seeded demo or authorised live host; record environment, exact source SHA, date and scenario, with no personally identifiable customer records.
2. **Audit** 16:9 desktop screenshots at 1440px and portrait mobile at 390px; record at least one verifiable end-to-end interaction in a 20–30 second MP4; video should show *function*, not an edited mockup. No forced autoplay.
3. **Inspect** screenshots visually for sharp type, credible states and no loading errors; match video and stills to the same code version. Preserve source files, hashes and capture script.
4. **Approve** privacy/IP/rights and labels (demo, preview, external production) before embedding in public V2. Product-owned screenshot cannot prove that an external client deployed it.
5. **Publish** to permanent versioned static asset paths; verify URLs, sizes, posters, fallback, accessible captions, broken media and video playback on iPhone+desktop. Expiring GitHub Action artifacts are **not** permanent media.
6. **Recapture** on materially changed UI routes, or at an agreed review cadence; mark old media as historical and retain a version history.
7. **Keep screenless** portfolio dossiers functional-map based until actual approved and persistent media exist.

## 4. Twice-weekly editorial operations
- **Monday:** source review, two-language drafting, claim verification, dated source links.
- **Thursday:** factual/rights/legal approval, release candidate and rollback-safe publication proposal.
- Oct 15 IGRA, Oct 17 wholesale, Oct 20 Antiqua, Oct 22 Fashion OS are **all review HOLD**. Approved Oct 13 site article remains in source; public V1 publishing receipt is not established by code.
- `scripts/editorial-review-report.mjs` produces a read-only, reproducible review JSON; `scripts/verify-editorial-queue.mjs` rejects overlap, missing translation, incorrect status and accidental auto-queueing.
- The existing V2 scheduled publisher remains disabled without a real isolated V2 runtime, explicit publishing authorisation, idempotency receipt and verified Telegram state. Never publish via V1 as a workaround.
- After authorisation and a deployed V2, release articles in the order supported by evidence, record canonical site URL, Telegram message ID and no-duplicates proof.
- No recurring content task or scheduled draft job by itself means that the public channel received any post.

## 5. Before commercial GO
- Verify one genuine contact using Turnstile → Pages Function → private-only Telegram, including negative failures, permissions and retention.
- Document scope/deliverables/exclusions for each of five services, available client data, duration range subject to qualification, NDA and client approval.
- Verify proof register for claimed personal KPIs; anonymize source and include calculation/period and scope of responsibility.
- Build an internal qualified-lead register with `received → needs_review → contacted → scoped → proposal → won/lost`, no sale attribution from button clicks.
- Finish RU/EN SEO profile links, sitemap, PDF with correct QR and privacy/terms review.
- Confirm the existing Cloudflare Pages account, deployment SHA and rollback procedure; production V1 remains untouched until explicit future approval.

**Current decision:** V2 development continues in an isolated feature branch; **NO production merge/deploy, live editorial publishing or commercial production admission**.
