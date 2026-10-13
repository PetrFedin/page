# SYNTHA — server-side private contact admission (2026-10-13)

## Scope
This is an isolated security backport from the V2 contact implementation to the existing public-site source. It does not require the V2 project portfolio, calculator or conversion routes and does not modify static HTML or the live domain.

## Behavior
- Consent is checked **server-side**: only `on`, `true` or `1` are accepted; a honeypot drops silently before network calls.
- `TURNSTILE_SECRET_KEY` is **mandatory**. If absent or challenge verification is unavailable, the contact endpoint fails closed; missing or rejected token never allows Telegram delivery.
- `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` must be configured. Before forwarding private lead data, the bot calls Telegram `getChat` and requires `type=private`; channels/groups/supergroups are rejected.
- Escaped long text is split into Telegram-sized messages. Each delivery requires both successful HTTP status and Telegram JSON `ok:true`. Partial delivery and attachment failure never report success.
- The existing optional private D1 contact storage is preserved; no new public storage surfaces are introduced.

## Risk and operational requirements
**Important:** The hardened function can reject all contacts if the current Pages project does not actually have an active valid `TURNSTILE_SECRET_KEY`, or if Telegram is configured to a group/channel. This is intended security behavior, **not** evidence the production contact flow already works. Confirm the existing Cloudflare project and secrets using an authorised operator before enabling in production. Never copy tokens into code or GitHub issues.

The current V1 client form includes `name=consent` and a Turnstile widget and sends form values in JSON or multipart. A mock-only test qualifies this source contract, but it cannot validate sitekey/secret pairing, bot membership, recipient identity or live successful delivery.

## Exact release gates
1. Exact-head GitHub CI passes; read security PR diff independently.
2. Preview deploy against the **identified and authorised existing Cloudflare Pages project**. Both frontend and `functions/api/contact.js` must come from the same reviewed source.
3. With consent and real Turnstile, send a single approved test enquiry and confirm receipt in the **private** intended chat, recording date, preview URL, deployment SHA and receipt without publishing the message to a channel.
4. Negative test without consent, absent/invalid CAPTCHA and rejected recipient before production.
5. Capture known-good deployment ID and rehearse rollback. Confirm post-deployment read-only article/manifest checks and form delivery.
6. Stage integration with PR #13 (static sanitation) and PR #7/#8/#15/#16 (V2) deliberately; do not cherry-pick insecure old function during conflict resolution.

## State
Draft code only. Passing mock tests is not a live acceptance. No production changes, Telegram sends, paid resource creation or secret changes are made by this work.
