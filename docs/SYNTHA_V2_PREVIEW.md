# Parallel V2

Branch: `syntha-v2-preview`. Production main remains unchanged.

The existing warm palette, typography, portrait, Russian and English content,
experience, consulting, projects, investors, news, contact and press sections remain.
Project data is unchanged; all project cards are expanded by default.

V2 adds a clearer business headline, three visitor routes, a description of the
first steps, and a simpler contact-method selector. Its form validates but does
not send submissions. Tracking and CAPTCHA are disabled for this preview.

## Language routing on Cloudflare Pages

First visits to `/` use `request.cf.country`: RU, BY, KZ, AM, AZ, KG, MD, TJ,
UZ, TM remain Russian; other known countries redirect to `/en/` with HTTP 302.
This is an explicit product region, not a claim about current formal membership.
Georgia and Ukraine are currently in the English region; the list is configurable.
When country is unavailable, the leading browser language is the fallback.
Manual selection is saved in a one-year first-party cookie and overrides geography.
Explicit `?lang=ru` or `?lang=en` takes priority. Direct `/en/` and project links
remain stable. Bots are not redirected. Redirect responses are not cached.
IP geography reflects the VPN/proxy exit country, not citizenship or location permission.

Static hosting cannot execute Cloudflare middleware. A static V2 preview alone
does not demonstrate the server country routing; deploy this branch as a separate
Cloudflare Pages preview to verify it end to end.

Validation: `node scripts/check-language.mjs`, JavaScript syntax checks.
Visual browser review and a working hosted preview remain outstanding.
No merge into main or domain switch is performed by this change.

## Isolation, transfer and removal

- Keep the production branch set to `main` and the production domain on V1.
- Publish V2 only as a branch preview, without assigning `syntha.pro` to it.
- Do not give the preview production DB bindings, notification credentials or
  other production secrets. The preview contact form is deliberately non-sending.
- Review and transfer individual approved changes into V1. Do not merge the
  complete V2 branch: it includes preview banners, noindex, disabled form sending
  and other preview-only behavior.
- Language routing and its tests are independently transferable. Cookie writing
  in the language switcher must accompany server routing so manual selection works.
- After V1 is validated, remove the V2 preview deployment/project and remote branch
  `syntha-v2-preview`. Deleting the branch alone may leave hosted preview URLs alive.
- Remove temporary V2 assets/banners from V1 only if they were explicitly copied
  there. V1 does not depend on this branch or on its preview assets.
- Keep the existing production content and backend configuration intact throughout.

Baseline V1 commit: `9e2dca0e0c0e681e82a8c8bdae4720fedc84c018`.
No production rollback is needed while production remains on this baseline.
