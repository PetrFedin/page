# Advisory presentation: content audit and improvement backlog (2026-10-11)

## Evidence examined

- `assets/content.js` — the RU/EN consulting section, detailed four consulting formats, experience, conversion messaging.
- `assets/deck.js` — one bilingual presentation source; current sections: `directions`, `requests`, `flow`, `digital`, `outcome`, `experience`.
- `assets/app.js`, `index.html`, `en/index.html`, `assets/styles.css` — interactive deck entry, anchors, modal rendering and responsive layout.
- `scripts/deck-print.html`, `scripts/make-deck-pdf.mjs` — PDF printing from the same `DECK` source.
- Base: `syntha-v2-preview-product-refresh` at `4edad10eb52efc11a304fad4e3d772b50b16b671`. Production `main` must remain untouched.

## Diagnosis

The deck has strong expert coverage of market -> product -> buying -> inventory -> cash, plus owner requests, data infrastructure, deliverables and experience. Its weakness is conversion, not scope: it describes what the consultant can do, but gives much less detail than the landing page about how a client engages, when results arrive and which proof is available.

### Verified gaps between site and deck

| Priority | Site already contains | Deck currently contains | Recommended addition |
|---|---|---|---|
| P0 | Four engagement formats with timelines, deliverables, inputs, fit/not-fit | Refers to formats only in text | One clear format-comparison panel, aligned with site |
| P0 | Diagnostic project: 4–6 weeks, deliverable model and season plan | Areas of expertise only | Explain the first 4–6 weeks and what the owner receives |
| P0 | Specific product-merchandising problems | 16 short owner requests | Use 3–4 deeper problem -> intervention -> decision -> KPI scenarios instead of 16 equally weighted cards |
| P1 | Explicit execution mechanics and checkpoints | General “data -> decision” sequence | Show owner decision cadence, responsibilities and data-quality admission |
| P1 | Broad product portfolio: Syntha / digital products | One digital/PLM list | Show verified working product proof and the boundary between advice and software |
| P1 | Detailed work outputs | Generic “what stays” list | Add representative artifacts with redacted/example data and exact deliverable descriptions |
| P1 | Experience scale 500+ brands, 30,000+ SKU | Same figures already present | Add independently approved before/after metrics with denominator, period and source; do not invent results |
| P2 | Contact form and project/portfolio destinations | PDF download only | Strong final website/contact handoff, QR for desktop/print, direct link for mobile |

### Verified advisory formats (from RU landing copy)

1. **Диагностика** — 4–6 недель. Outcomes: prioritized problem map, calculations in client-owned files, season action plan with owners.
2. **Советник собственника** — from 3 months. Outcomes: decision rules, plan-vs-actual metrics, management cadence transferred to team.
3. **Руководство программой** — 4–6 months. Outcomes: stabilization, accountability, recovery management and handoff.
4. **Данные, аналитика и PLM** — 3–6 months. Outcomes: target architecture, governed data model, decision-dashboard prototype and implementation roadmap.

These are stated offers, not guarantees of business outcomes.

## Proposed vNext storyline

1. **Promise:** calculate the consequences before a purchase, production order or investment becomes irreversible.
2. **Proof:** clearly distinguished management scale, verified project experience and substantiated impact.
3. **Four business symptoms:** margin erosion, frozen stock, weak cash conversion, slow decisions.
4. **How value is measured:** gross / contribution margin, GMROI, stock turnover/WOS, OTB adherence, working capital and cash.
5. **Owner decision journey:** question -> source data -> validated calculation -> decision -> implementation -> result check.
6. **Engagement modes:** the four actual site formats, including time, client inputs, output and role boundaries.
7. **Two to three examples:** anonymized actual cases only after consent and verification, otherwise clearly labeled worked examples using synthetic data.
8. **Technology as leverage:** verified Syntha/product workflows demonstrating PLM, decision dashboards or replenishment; distinguish ready/live from prototype/planned.
9. **Next step:** focused diagnostic conversation, list of required inputs, direct website and contact link.

## Metrics / evidence rules

- Do not add an improvement percentage, monetary effect, client brand, logo, testimonial, or timeframe without a verifiable source and permission.
- Distinguish gross margin from contribution margin; inventory age from stock turnover; theoretical automation benefit from observed labor-time savings.
- On economic examples state base period, cohort/category, numerator, denominator and assumptions. Example formulas can be shown without asserting actual savings:
  - `GMROI = gross margin / average inventory at cost`.
  - `Turnover days = average inventory at cost / COGS × days in period`.
  - `Incremental gross profit = revenue delta × gross margin rate` (only for a constant-rate illustrative case).
- Every project/product visual needs an exact working build and honest maturity label.

## Implementation in this change

The QR/link improvement is implemented separately from substantial sales-copy changes:
- new decoded/verified SVG QR, target `https://syntha.pro`;
- linked URL + QR near the top and end of both interactive RU/EN decks;
- linked URL + QR on cover and final block of both PDF templates;
- a dedicated GitHub Actions PDF build for the isolated feature branch;
- no edits to production `main`, CRM submission or personal contact data.

## Acceptance gate

1. No JS syntax errors and no missing deck IDs on RU/EN.
2. URL in all links equals `https://syntha.pro`; QR decodes to this exact URL.
3. Mobile: hyperlink is easily tappable; QR does not cause overflow.
4. PDF RU/EN regenerate, include source URL on first and closing page and a visible scannable QR.
5. Visual QA on phone/tablet/desktop and rendered PDF pages, with any issues corrected before merge.
6. Review PR remains Draft, based on the V2 preview branch, until checks pass; no direct main changes.
