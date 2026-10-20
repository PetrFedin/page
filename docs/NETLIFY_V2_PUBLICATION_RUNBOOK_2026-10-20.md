# Permanent Netlify V2 review — publication runbook (20 October 2026)

## Scope
- **Hosting: Netlify only.** Do not create or configure Render, Cloudflare Pages production, syntha.pro, the default `main` branch or Telegram publishing.
- Existing staging project: `syntha-v2-preview-petr`, **site ID** `4025c165-6b18-41c5-b69b-ba056cc7fbc8` in Netlify team `PetrFedin's team`.
- Permanent staging address after **successful exact-SHA admission**: https://syntha-v2-preview-petr.netlify.app/
- Source: `PetrFedin/page` → `fix/page-v2-consulting-experience-media-20261019` (PR #37). The source SHA must be taken from the branch HEAD *at deployment*, not copied from a previous run.
- Deployment pipeline: `.github/workflows/v2-isolated-netlify-preview.yml` on that feature branch.
- The deployed Netlify bundle is **static-only**, not Cloudflare Pages Functions; it cannot submit real messages. A visible banner and disabled contact button are intentional.
- The staging output carries **noindex** metadata/headers to prevent competing with syntha.pro.

## One required account-side action: GitHub Actions secret
1. Sign in to **the existing Netlify owner account**, not a new Netlify team. Open https://app.netlify.com/user/applications and create a personal access token for the owned review site.
2. In https://github.com/PetrFedin/page/settings/secrets/actions, select **New repository secret**. Name: `NETLIFY_AUTH_TOKEN`. Paste the token value there and save. **Never put this value into a chat, a PR, a commit, source, screenshots or Netlify public env variables.**
3. Confirm that https://app.netlify.com/projects/syntha-v2-preview-petr is the isolated review site. It should remain on the available/free plan and must not have `syntha.pro` as a custom domain. Do not modify the production website or its domain records.

## Running publication
4. Open https://github.com/PetrFedin/page/actions/workflows/v2-isolated-netlify-preview.yml and select the run for `fix/page-v2-consulting-experience-media-20261019`. If the workflow is not selectable under **Run workflow** (GitHub only exposes some branch-only workflows from the default branch), open the latest failed **V2 permanent Netlify preview - exact SHA** run and use **Re-run all jobs** after saving the secret. Re-runs use the same source SHA; no merge into `main` is required.
5. If GitHub does not expose a re-run or the source has since changed, commit a harmless documentation change to that same V2 branch to trigger its **push** workflow. Do not select `main`.
6. Wait for the full job to finish. A Netlify `ready` deploy alone is not sufficient. Required green steps are: exact branch & SHA → build & public allowlist → Chromium RU/EN before deploy → staging noindex/contact guard → upload to fixed Netlify ID → public `release-health.json` SHA → browser QA on served URL.
7. The accepted permanent link is https://syntha-v2-preview-petr.netlify.app/ **only after** the job is GREEN. Previously it served an outdated October 9 static deploy.

## Independent verification
- Read https://syntha-v2-preview-petr.netlify.app/release-health.json and compare `source_sha` to the workflow's exact `EXPECTED_SHA` and the PR #37 head.
- Open RU https://syntha-v2-preview-petr.netlify.app/ and EN https://syntha-v2-preview-petr.netlify.app/en/.
- Verify 5 evenly distributed consulting cards on desktop, 5 expertise cards including **Интеграция бизнес-решений**, 3 initially featured project cards and all 11 after expansion (including **SVEDO** and **THE FUR**).
- Open and close project modals, verify the calculators and responsive layouts at 390/1440 px. Inspect static profile, analytics and economics pages; ensure no 404s or console errors.
- A top banner must clearly state that this is an isolated static preview. Its contact button must be disabled; live Cloudflare Turnstile/Telegram delivery is **not** claimed.
- Confirm the base domain https://syntha.pro is still unchanged.

## Safety and persistence
- Deployment uses `netlify deploy --prod` **only against the separate Netlify staging site ID**. This updates the staging site's main URL, not syntha.pro.
- If the review site is also connected to automatic Git deployments, a later push to its configured production branch can replace a manually published CLI deploy. In Netlify's project settings, inspect Continuous Deployment and disable undesired automatic publishing for this review site, or manage its deployed snapshot lock intentionally. Do not change settings of syntha.pro.
- Failed Netlify deploys do not replace the previous successful version. If a **successful** staging deploy later has a defect, commit a fix and publish that new SHA instead of claiming the failed deploy needs rollback.
- No paid resources or new production domains are required for this procedure; usage of the existing Netlify free team remains subject to its plan quotas.

## Acceptance criteria
**DONE** only when the Netlify deploy finishes and the separate live `release-health.json` SHA, all public routes, and browser QA pass. If authorization is absent or public tests fail, leave status **HOLD**, provide the actual failing run link, and do not link the old site as the latest V2.
