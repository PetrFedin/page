# syntha.pro — V2 release and conversion programme
**Updated:** 2026-10-13
**Status:** Draft implementation, production HOLD until evidence.

## Scope and current evidence
- Main website: https://syntha.pro/ is served independently of the Netlify preview.
- Main code source: `PetrFedin/page`. Parent release PR: #7.
- Exact parent HEAD `9a7108609127267323984861a121aac7a7cf9624` passed GitHub Actions #38186090399 (JS/build/Chromium RU+EN 375/768/1440, eleven dossiers).
- The connected Netlify preview `syntha-v2-preview-petr` has a published deployment dated **2026-10-09**, with no commit ref. Therefore it is not evidence of the newer PR.
- Main-site Cloudflare Pages Functions and its Turnstile/Telegram credentials cannot be inferred from Netlify preview status. Never claim end-to-end lead delivery until tested with authorised non-production inputs and production health controls.
- Screenshots reviewed from CI: consultation RU desktop 3+2 layout and mobile swipe, fintech dossier desktop/mobile; no approved fabricated project screenshots.

## P0. Publish V2 only when
1. Parent PR #7 passes exact-HEAD CI and independent review.
2. Screenshots/visual checks RU and EN, iPhone/tablet/desktop include readability, no blank grid cells, correct vertical and horizontal navigation.
3. Contact: anti-spam widget verified in Cloudflare environment; authorised test lead visibly arrives at **private** recipient with project, route, and time, with no duplicate/leak. Never use public Telegram channel for lead details.
4. Confirm domain mapping, deployment SHA, and rollback method for the main Cloudflare Pages project. Netlify preview is NOT production.
5. Check the six screenless dossiers make no claims about audited operation where only a future feature map exists.
6. Publish site and confirm live routes, language/canonical, clickable lead CTAs, QR and feeds.

## P1. Qualified conversion routes
- CLIENT / consulting: business case -> advisory scope -> desired outcome -> contact.
- PILOT / partnership: product -> scope of trial -> first workflow -> partner -> contact.
- INVESTOR / investors: project -> maturity and evidence -> scenario assumptions and capital gates -> contact.
- Submitted contact context: `leadRoute`, `leadProject`, `leadGoal`, `leadTiming`. This is zero-trust input, validated/escaped server-side, and processed only with consent.
- Commercial analytics: visit -> route selection -> form opened -> successful send. Avoid counting clicks as qualified deals. A *qualified* lead requires relevant organisation, concrete problem, valid contact and agreed next step after review. No invented conversion rates.
- No paid CRM or additional external analytics required for this stage.

## P1. Dossier format (public safe)
1. Who it serves and what operational problem it solves.
2. Functional workflows at business level, with planned vs validated separated.
3. Public maturity state and next externally meaningful milestone.
4. Buyer of the product, commercial unit (account/user/contract), prospective pilot and acceptance decision.
5. Financial calculator with explicit user's own assumptions; indicative scenarios only. No forecast presented as booked revenue.
6. Evidence of actual paying customers and repeat revenue is `NOT VERIFIED` unless contract/payment/delivery proof exists.
7. Partner/investor actions open a pre-tagged private contact, not a public secure diligence room.

## Editorial restart (no automatic Telegram publishing without approval)
Existing site latest confirmed displayed post: **2026-10-02** at audit time. `channel-queue.json` holds prior `order` and `paused` lists; local `~/.config/syntha-pro/published.json` is not in the repo, so Telegram send state is not independently verified.

| Target date | Editorial topic | RU/EN | Evidence prerequisite | Site | Telegram |
| --- | --- | --- | --- | --- | --- |
| Oct 13 | How to assess a digital platform before first revenue | Prepared | Editorial, not product deployment claim | In V2 source; not live until publish | Paused for approval |
| Oct 15 | IGRA: inventory and reusable building instructions | Draft RU/EN, private hold | Confirm real demo vs future features | Hold | Hold |
| Oct 17 | Marco: buyer size matrix and repeat-order journey | Draft RU/EN, private hold | Confirm lifecycle status | Hold | Hold |
| Oct 20 | Antiqua: artwork provenance and source uncertainty | Planned | Attribute only checked artworks | Hold | Hold |
| Oct 22 | Fashion Management OS: from product to procurement decision | Planned | Demonstrated user journey | Hold | Hold |
| Oct 24 | Debt Stability OS: household cash-gap analysis | Planned | Finance accuracy, legal/disclaimer review | Hold | Hold |
| Oct 27 | Renova: stage acceptance and capital accountability | Planned | Contract/delivery evidence | Hold | Hold |
| Oct 29 | Commercial case: how to scope a pilot and acceptance | Planned | Publish only verified metrics | Hold | Hold |

**Editorial rule:** 2 posts/week is a target, not a fact of historical delivery. Draft RU and EN together; editorial approval, rights and source check required before publication. A post in `NEWS` means on-site scheduling intent, not confirmation that @syntha_pro published it. Never automatically empty the historical paused list or backdate a post to fake a cadence.

## P2. Acceptance metrics
- Every conversion route has a working deep link to contact with topic, route and project context.
- Lead submissions verified in private recipient; no private information in public channel.
- Growth funnel counted from actual requests, not illustrative usage.
- All 11 dossiers available in both languages; mobile, tablet and desktop interactive QA.
- No backend internals, infrastructure IDs, schemas or credentials exposed in public-facing pages.
- SEO checks: canonical/hreflang, all route CTAs, favicon, OG images, sitemap, RSS and JSON Feed; Web Vitals/Lighthouse to be measured on preview and released site.

October 15 and 17 material exists in assets/news.js as site:false, and is also in the Telegram paused list. It cannot appear on the public site or be sent by the automatic queue without editorial approval and a deliberate status change.
