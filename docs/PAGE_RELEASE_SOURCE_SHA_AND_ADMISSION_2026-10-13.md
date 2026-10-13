# SYNTHA — release source provenance and production admission (2026-10-13)

## What is implemented in PR #13

- The static bundle is assembled from an explicit public allowlist into `dist-pages/`.
- Both language pages are checked for a single empty Turnstile host and no prerendered challenge response.
- RU/EN October 13 article and all 19 feed entries must be present and ordered correctly.
- `release-health.json` includes the full Git source SHA, `bundle: public-static-only` and `functions_bundled: false`.
- Pull-request CI validates that the SHA in the artifact matches the exact checked-out PR HEAD.
- No deployment, Telegram send or production config change is triggered by this PR.

## Hard gates before release

1. Finish exact HEAD Actions successfully. Do not reuse results from older SHAs.
2. Obtain independent review, including checking the packaged files and Cloudflare Pages Functions behavior.
3. Identify the existing authorised Cloudflare Pages project serving `syntha.pro`, its production branch, output path and Functions build configuration. Do not create a paid resource.
4. Publish a preview from the approved source commit. The static build output is `dist-pages/`; separately ensure Cloudflare Pages Functions under repository `functions/` are included by the actual deployment mechanism. The uploaded static artifact alone cannot provide the contact endpoint.
5. Inspect the preview on mobile/tablet/desktop, in RU and EN. Validate real Turnstile against the preview hostname, consent rules, private Telegram destination and an actual authorised test lead. No mock-only pass qualifies.
6. Before promotion, record the current production deployment ID and a rollback procedure. Promote only after approval.
7. Verify on production: `/`, `/en/`, `/feed.xml`, `/en/feed.xml`, both JSON feeds, article anchors and correct article order. Check `/release-health.json` returns the expected full `source_sha`. This manifest is a *source provenance fingerprint*, not proof of Cloudflare identity or runtime integrity by itself.
8. Execute the guarded one-off Telegram channel publication only when the public article has been verified and the bot/channel admin access is authenticated. Record the real Telegram message URL and id; do not invent them.
9. Post-release monitor form failure rate, article reach and qualified lead conversion, keeping private personal data outside the public static bundle.

## Reconciliation of legacy README instructions

Historical README sections say there is no build step and recommend deploying the repo root. Those instructions are **obsolete for the sanitized V2 release** and must not be used as-is. The current release contract requires an explicit public allowlist plus separately bundled Cloudflare Functions; the Pages account and source mapping still need verification. Do not treat a GitHub merge as a production deploy.

## Current known state

PR #7 and #8 remain Draft, unmerged and without independent reviews. PR #13 remains Draft until review. A successful PR build does not mean `syntha.pro` is up to date; site and Telegram delivery have separate admission requirements. No production deployment or sending is performed by this document.

## Independent live admission script (read-only)

After the approved Cloudflare deployment, execute:

```bash
RELEASE_URL=https://syntha.pro VERIFY_DATE=2026-10-13 node scripts/verify-live-publication.mjs
```

For exact-source admission of the sanitized package, **also** supply the full Git commit SHA used in the deployed bundle:

```bash
RELEASE_URL=https://syntha.pro VERIFY_DATE=2026-10-13 EXPECTED_SHA=<40-hex-source-sha> node scripts/verify-live-publication.mjs
```

The script performs only GETs with cache-busting query parameters, checks RU/EN home HTML and RSS/JSON feeds and verifies the expected article as the first entry. With `EXPECTED_SHA`, the full release gate additionally rejects stale Turnstile HTML and requires JSON at `/release-health.json` with the matching source SHA.

Once this workflow is merged to the default branch, GitHub Actions → **Read-only live SYNTHA release admission** → **Run workflow** offers the same probe with explicit URL/date/SHA inputs. A green run is **not** proof that a form submission, private Telegram receipt, Cloudflare account identity or rollback has been tested. The workflow is manual and does not create a deployment or post to Telegram.

Without `EXPECTED_SHA`, the check is **editorial-only** and does not certify the Turnstile fix. Use `EXPECTED_SHA` for the complete sanitized-package gate, and separately test real CAPTCHA, private Telegram receipt and rollback; do not confuse editorial visibility with full release admission.
