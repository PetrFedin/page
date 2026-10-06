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


## Decision layer v2.1

The preview now includes an isolated decision layer between the initial route cards
and the contact form. It supports four concrete commercial scenarios:

- advisory / economics and management;
- product pilot / one measurable Golden Path;
- partnership / shared asset and commercial model;
- investment / milestone-capital-evidence discussion.

Each scenario shows: best-fit conditions, minimum inputs, expected outputs and a
direct "prepare enquiry" action. That action preselects the relevant contact topic,
adds a concise browser-side message prompt and scrolls to the form.

A new browser-only text brief download is available from the contact form. It does
not send or persist data; it only exports the currently entered preview fields as a
local .txt file. This keeps V2 safe to demonstrate without production bindings.

The original portfolio, consulting, partnership, news, contact and project
sections are still present. V2 remains additive: no production V1 route or domain
is changed by this iteration.


## Portfolio Intelligence v2.2

V2 now adds an intelligence layer above the detailed project cards. It reads the
same published PROJECTS registry used by the existing site and therefore does not
invent portfolio entries that are not present in the public showcase.

Published projects are grouped into the currently evidenced sectors:
Fashion, Enterprise, Events and Consumer. Fintech, Art and Infrastructure remain
visible as intentionally unpublished sectors with zero entries until matching
projects are formally added to this repository's public portfolio.

Each project summary exposes:
- sector;
- normalized maturity (Concept / MVP / Pilot-ready / Production);
- current stage from the existing project content;
- published audience description;
- a conservative commercial-path statement;
- direct actions for product detail, pilot, partnership and investment discussion.

The monetisation field intentionally does not claim validated pricing or revenue
models where the current public project dossier does not provide them. It describes
the next commercial validation path instead.

The original detailed cards remain below this layer unchanged.


## Stakeholder Lens v2.3

The first screen now reflects both sides of the site: advisory work and the product
portfolio. It no longer frames the whole page primarily as fashion consulting.

A new stakeholder lens lets a visitor choose one of four perspectives before
reading the full site:
- Client;
- CEO / owner;
- Investor;
- Strategic partner.

Each perspective changes the questions highlighted on the page and routes the
visitor to the most relevant evidence: experience, decision layer, portfolio
maturity or partnership/investment path.

The hero now includes a compact proof bar derived from the published PROJECTS
registry. It reports only currently published project and maturity counts; it does
not introduce financial or traction claims that are absent from the source data.


## Executive Evidence Layer v2.4

V2 restores the original progressive-reveal behaviour for the detailed projects:
the page starts with three project cards, then "Show more", then "Collapse".
The existing news feed keeps its own three-item "Show more / Collapse" behaviour.

Portfolio Intelligence now adds an optional Executive brief to each published
project. The brief is deliberately compact and follows one seven-part structure:

Problem → Product → Evidence → Current maturity → Next milestone →
Commercial path → Capital / partner ask.

Evidence statements are derived from the existing public project dossier. Where
real production use, validated monetisation, traction or revenue are not publicly
established, the brief says so instead of inferring them.

The brief is additive: the original project card, status modal, news, comparison
and detailed project pages remain available.


## Portfolio editorial and QA v2.5

Portfolio Intelligence is now titled "Портфель как система" in Russian and
"The portfolio as a system" in English.

The intelligence grid uses progressive disclosure independently from the legacy
project section:
- first view: 2 portfolio cards;
- Show more / Показать ещё: all matching cards;
- Collapse / Свернуть: returns to 2 cards;
- changing a sector filter resets the grid to its compact state.

The detailed project section keeps its own existing 3-card progressive reveal,
and the news feed keeps its own 3-item progressive reveal.

Russian V2 copy now prefers Russian product and management terminology wherever
the English term is not a proper name or established abbreviation. Examples:
Portfolio Intelligence -> карта / портфель проектов, milestone -> этап,
evidence -> подтверждение, de-risking -> снижение риска, Golden Path ->
ключевой сценарий. Established abbreviations and product names such as CEO, MVP,
B2B, MFW and BFS remain unchanged where appropriate.

The hero positioning is also more concrete: commercial analytics, operating
model, margin, inventory, working capital, digital product, pilot and rollout.

A source-level V2 regression contract is available as:
npm run check:v2

It verifies the two-card portfolio reveal, legacy project/news reveal controls,
RU terminology, stakeholder routes, executive evidence fields, contact anchors,
RU/EN entry pages and the V2 project-registry binding.


## Project dossiers v2.6

Project copy was rewritten as decision material rather than promotional copy.
For each published product the Russian dossier now separates:
- product;
- audience;
- problem;
- operating logic;
- evidenced stage;
- next verifiable milestone;
- what is needed now.

The shared project vocabulary is also more precise:
"Открыть досье", "Обсудить следующий шаг", "Проблема", "Продукт",
"Стадия и следующий проверяемый этап", "Что требуется сейчас".

The V2 project modal now adds a compact "Досье для решения" before the long
status and participation sections. It surfaces Problem, Evidence now,
Next milestone, Commercial path and What is needed now. The existing detailed
status, screenshots, participation options, comparisons and full project pages
remain available below it.

This preserves depth while reducing the time a CEO, partner or investor needs
to understand whether the project is relevant.


## Commercial Clarity v2.7

Each published project now has an explicit commercial-clarity layer built around
the questions a buyer, partner or investor needs answered before discussing terms:

Buyer → What they pay for → First sellable pilot → What we measure →
Pilot-to-contract gate → Possible revenue mechanics.

The layer is intentionally conservative. It does not invent pricing, ARR, margin,
traction or conversion figures. Where a revenue mechanism is not yet validated,
the UI labels it as a working commercial hypothesis and ties validation to the
pilot.

The same commercial model is visible both in Portfolio Intelligence and inside
the project modal, alongside the existing decision dossier. This gives a short
commercial view without removing the deeper status, evidence, screenshots,
participation formats or full project pages.

Current working commercial hypotheses:
- Syntha: recurring access/licence + implementation/integration + enterprise support + go-to-market partnership.
- ChatX: per-user or organisation licence/subscription + migration/rollout + integrations + enterprise support.
- Renova: consumer access, B2B licence and service/transaction mechanics remain hypotheses until a real closed test.
- MFW/BFS/Made in Moscow: event/season licence + implementation/operations + annual layer; brand modules and white-label remain hypotheses until a real event pilot.
- Promomed/SOSTOYANIE: event licence + implementation/support; year-round community, partner modules and white-label remain hypotheses until pilot validation.
