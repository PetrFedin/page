# SYNTHA V2 - Cloudflare Pages release admission and rollback

## Freeze and source integrity
- Production: https://syntha.pro/ ; owner confirmation of Cloudflare Pages project, account and custom-domain mapping is still required.
- PR #7 (11 RU/EN dossiers + consulting grid) must complete independent review and exact-HEAD CI before merging into main.
- PR #8 (qualified client/pilot/investor flows and editorial) is stacked on #7 and must be rebased onto the actually merged main, with a fresh exact-HEAD CI and review.
- Do not treat the separate Netlify preview as Cloudflare release evidence: the currently identified preview was deployed October 9 without a matching SHA.
- Branch protection API is currently inaccessible to GitHub integration (403). A mergeable Draft PR and green CI do not prove branch policies are satisfied.

## Public release package
After checkout of the confirmed release SHA:
1. Run npm run build.
2. Run npm run package:pages.
3. Confirm qa-artifacts/pages-release-manifest.json lists only expected public files.
4. Upload dist-pages, **never the repository root**. Keep Pages Functions in repository-root functions/ alongside dist-pages, so Wrangler runs from repo root. This avoids publishing private docs/, scripts/, private/, .github/, Telegram queues and backend source as static assets.
5. Confirm public CSS, ES modules, RU/EN HTML, privacy policy, OG, verification files, _headers, _routes.json.
6. Confirm Pages Function imports and bindings on a real Cloudflare preview. Static GitHub E2E mocks /api/contact and cannot validate worker deployments.

## Cloudflare identity and secrets admission
Before uploading anything, owner confirms **existing** account id, Pages project name, configured production branch and custom domain. Do not create an additional paid or free project without approval.
- TURNSTILE_SECRET_KEY must be set in correct environment; widget sitekey must authorize exact preview/production hostnames. Function fails closed without secret.
- TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID must be set in Pages Function environment; getChat should report type=private. Public channel/group/supergroup is explicitly rejected.
- D1 DB is optional in code; if bound, verify submissions/events schema, rights, retention and removal workflow.
- Never print secrets, chat ids, personal data or live form payload in CI logs.

## Preview drill (after access is confirmed)
Cloudflare docs allow preview deployments with Wrangler. Use a non-production branch and explicit commit SHA:

    npx wrangler pages deploy dist-pages --project-name CONFIRMED_EXISTING_PROJECT --branch v2-acceptance --commit-hash EXACT_SHA

For a Git-integrated project, confirm whether manually uploaded deployments are appropriate for its current delivery model before using this command. Preview must not replace production.

### Acceptance checks
- RU/EN at 375, 768, 1440 px: desktop consulting 3+2, phone snap, all 11 dossiers, calculations, keyboard/focus checks.
- Published assets match exact SHA; imports return 200, no broken images or unexpected redirects.
- Submit an *approved, fictional test enquiry* with genuine Turnstile on approved hostname. Confirm it reaches only the personal Telegram recipient with route/project/goal; avoid real visitor data.
- Verify negative cases: CAPTCHA unavailable/invalid, group/chat mismatch, file+text, long input, Telegram outage; never report a false success.
- Recheck canonical/hreflang, sitemap, RSS/JSON, privacy, OG/QR and Lighthouse/CWV.
- Keep separate review evidence for this live preview. An automated mock test is not live acceptance.

## Production promotion and rollback
1. Record last known good **production** deployment ID, associated commit and health checks before changes.
2. Require owner's explicit approval after independent PR review and preview acceptance. No auto-production workflow is part of this Draft.
3. Publish only the signed-off SHA; verify the main domain and one authorised contact flow.
4. On regression: Cloudflare Pages dashboard > project > Deployments > last known good production deployment > Rollback to this deployment. Only prior production builds are rollback targets; previews cannot be rolled back to production. Official docs: https://developers.cloudflare.com/pages/configuration/rollbacks/.
5. Verify main-domain content, CAPTCHA config and contact after rollback; keep old/current deployment IDs and time in the private release log.

## Verified state (2026-10-13)
- PR #7: prior CI GREEN, human independent review missing.
- PR #8: prior CI GREEN, new contact hardening and allowlisted release bundle now undergoing additional CI.
- No proven Cloudflare admin authorization, exact Pages project identity, Turnstile and Telegram bindings in current connected tools.
- Therefore **PRODUCTION HOLD**; no new Cloudflare deploy or merge and no paid resources.
