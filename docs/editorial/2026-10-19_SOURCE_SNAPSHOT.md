# SYNTHA V2 — editorial source report (2026-10-19)

**Decision: HOLD.** Isolated branch editorial/v2-20261019-chatx-mfw-hold only; main, V1, syntha.pro and @syntha_pro unchanged. GitHub tests verify source, not live adoption or licences.

## V2 state

[Draft PR #33](https://github.com/PetrFedin/page/pull/33) head c5fc00a7e2463c34c5d638981c2a09fdf8bc7469 (2026-10-18). [Portfolio exact-head CI](https://github.com/PetrFedin/page/actions/runs/39161371309) and [editorial CI](https://github.com/PetrFedin/page/actions/runs/39161371289) SUCCESS. External deployed SHA, real consent/Turnstile → private Telegram, independent visual/privacy review and rollback remain unverified; see [18 Oct audit](https://github.com/PetrFedin/page/blob/feat/page-v2-brand-clarity-editorial-commerce-20261018/docs/V2_BRAND_PORTFOLIO_MEDIA_EDITORIAL_2026-10-18.md).

## Editorial queue

Checked [NEWS source](https://github.com/PetrFedin/page/blob/feat/page-v2-brand-clarity-editorial-commerce-20261018/assets/news.js) and [queue](https://github.com/PetrFedin/page/blob/feat/page-v2-brand-clarity-editorial-commerce-20261018/channel-queue.json): **23 dated articles = 23 unique dates; order 10; paused 9; 0 intersections; no missing order/paused NEWS dates.** Unresolved historical 2026-10-03 and 2026-10-04 have no approved NEWS items: do not send.

**Human review HOLD:** Oct 15 IGRA, Oct 17 Marco, Oct 20 Antiqua, Oct 22 Fashion Management OS — each site:false and paused. Oct 13 investor article site:true in source; live web delivery and actual Telegram message ID are not independently verified. No access to the local published.json receipt, so code uniqueness is not proof against previously sent channel posts.

**New, not scheduled and not entered into NEWS/order/paused:** [ChatX Decision↔Task bilingual site/TG draft](2026-10-19_CHATX_DECISION_TASK_RU_EN_HOLD.md) and [MFW/BFS lifecycle-evidence bilingual site/TG draft](2026-10-19_MFW_RELATIONSHIP_TIMELINE_RU_EN_HOLD.md). ChatX differs from Sep 28 suggested replies and Sep 30 wiki. No MFW/BFS article among 23 existing entries.

## Product-source audit

**ChatX:** [main 030ad00, Oct 15](https://github.com/PetrFedin/chat/commit/030ad00bf69e3e9b6d5d39f561ca9bff60ffb611), [Draft PR #58](https://github.com/PetrFedin/chat/pull/58), head 10c9c852bd1a5c05acf2d8880ac5f0aac1465a72: Decision ↔ existing Task references, explicit permission and audit, unmerged; [exact CI](https://github.com/PetrFedin/chat/actions/runs/39129742549) both domain/DB SUCCESS. [Draft PR #59](https://github.com/PetrFedin/chat/pull/59), head 080cb53e1ff93f85bc44ceef1b20f699340b56a9, adds Gantt and synthetic 27s capture; [CI success](https://github.com/PetrFedin/chat/actions/runs/39160687679), still unmerged. Neither demonstrates customer production.

**MFW/BFS:** [main 7a2e7b9, Oct 11](https://github.com/PetrFedin/MFW/commit/7a2e7b98f9192862cbafe638cc3732c2db4f0f01); [read-only Brand Timeline PR #15](https://github.com/PetrFedin/MFW/pull/15) merged Oct 8. [Draft integrated PR #35](https://github.com/PetrFedin/MFW/pull/35), head b0b2e412e1fe083f95c38d4a76c16202238cf6a2: seven workflow runs SUCCESS, but [responsive CI #39161614246 FAILED](https://github.com/PetrFedin/MFW/actions/runs/39161614246): expected Made roster-verification badge absent at seven viewport sizes; root cause unknown. [MFW CURRENT_STATE](https://github.com/PetrFedin/MFW/blob/main/CURRENT_STATE.md): production PostgreSQL Phase 0 is not admitted.

**Other HEAD versions rechecked, maturity from [18 Oct matrix](https://github.com/PetrFedin/page/blob/feat/page-v2-brand-clarity-editorial-commerce-20261018/docs/V2_BRAND_PORTFOLIO_MEDIA_EDITORIAL_2026-10-18.md), not fresh full feature audits:** [synth-v2](https://github.com/PetrFedin/synth-v2/commit/546ef6afd0dd4f70bda54716fa3770566d014480) 546ef6a; [renova](https://github.com/PetrFedin/renova/commit/f62e491aeb2c0b8a36bbbd15af719050d692546c) f62e491; [promomed](https://github.com/PetrFedin/promomed/commit/3471d05af97fe65e9e08b9da03a4c68bf81a2a78) 3471d05; [Fashion OS master](https://github.com/PetrFedin/yanina-management/commit/f794c555220ef7b82ed76b32fea134f4a3b3a9f9) f794c55; [fur-erp](https://github.com/PetrFedin/fur-erp/commit/d0cd7a47edb00db987da0281f294b64b56daf644) d0cd7a4; [antiqua](https://github.com/PetrFedin/antiqua/commit/4f3e396ce6052ae8924235eab3ed4ad11cac470c) 4f3e396; [igra](https://github.com/PetrFedin/igra/commit/eb50e2a88c8c3497df409c9013dc646c5b80261d) eb50e2a. [verno](https://github.com/PetrFedin/verno/commit/1c28b397413f8b4826f7f9bc8b7c3698f3046d78) and [gaber](https://github.com/PetrFedin/gaber/commit/9d6eaf42c328db896d412e80e88f9552573f6cea) SHA only. Canonical standalone product/runtime evidence for Marco and SVEDO remains unresolved.

## Rights and go/no-go

[Media evidence registry](https://github.com/PetrFedin/page/blob/feat/page-v2-brand-clarity-editorial-commerce-20261018/assets/portfolio-media-evidence.js): ChatX 27s/10 frames, Promomed 25s/13 frames, old Fashion OS stills all **not approved for embedding**. MFW external media references are not reuse licences. Both new articles are **text only**, no performance metrics, actual customer attribution, event-organiser endorsement or confidential screenshots.

Pending before either publication: product-owner fact check; human RU/EN edit; brand/affiliation and legal/IP/privacy clearance; refresh source SHAs; separate explicit web GO, authenticated Telegram GO and verified duplicate-safe message receipt. App V2 admission further needs exact deployed SHA, genuine private-contact E2E, QA and rollback. Never route via main/V1.
