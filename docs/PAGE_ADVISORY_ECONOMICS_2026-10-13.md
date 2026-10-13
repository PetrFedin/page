# SYNTHA advisory: evidence-first inventory economics and consulting conversion (13 October 2026)

## Product intent
The consulting deck already discusses strategy, assortment, stock, cash and PLM. This increment helps a potential client understand a concrete decision before making contact; it does **not** assert any company-specific economics, case study, revenue or proven impact.

## Implemented on the isolated feature branch
- A bilingual RU/EN interactive model embedded **inside the existing `#deck` dialog**.
- Four decision-oriented bilingual sections: diagnostic, illustrative cases, collaboration formats, evidence / attribution.
- Distinct buttons for a fictional example and for opening an ordinary diagnostic enquiry.
- No network access, cookies, local storage, analytics calls or server submission in the calculator. The contact route does not include entered financial figures.
- Existing PDF documents are not updated in this branch. Online additions are disclosed as separate from the downloadable PDF.
- Responsive styles for 375 / 768 / 1440 px and keyboard-focus styling.
- Pure arithmetic tests, input validation, no-PII connection assertions, and automated bilingual browser screenshots.

## Model definition

Inputs use **a consistent cost basis** and one currency (no FX conversion):
- `annualCogs`: cost of goods sold across a full comparable year
- `averageInventory`: average inventory over the relevant period, valued at cost
- `targetDays`: target average inventory days

```
current_days         = averageInventory / annualCogs * 365
target_avg_inventory = annualCogs / 365 * targetDays
inventory_change     = averageInventory - target_avg_inventory
potential_release    = max(inventory_change, 0)
additional_need      = max(-inventory_change, 0)
```

The model is a **static, all-else-equal sensitivity**, not an inventory optimization algorithm, cash flow, profit forecast or capital return guarantee. A lower target may be infeasible if service levels, seasonality, replenishment time or size availability are binding. Operational validation and baseline acceptance are required before any client recommendation.

The example button inserts entirely hypothetical figures of `120000000` annual COGS, `30000000` average stock, `75` target days. These numbers are **not sourced from a real client** and never appear as default production assumptions.

## Admission gates
1. Pure arithmetic tests pass on exact feature SHA.
2. Browser tests pass on both languages and all target device widths, including editable scenarios, validation, contact routing, and no viewport overflow.
3. Independently review privacy, accessible controls, design, and financial explanation.
4. Finish upstream release work before promotion: #13 packaging admission; #7/#8 are stacked V2 feature branches and touch overlapping `assets/app.js` / `assets/styles.css` files. Rebase this feature onto the accepted upstream version and rerun exact-head CI rather than fast-forwarding changes into unreviewed code.
5. Confirm Cloudflare preview and live, consented contact operation prior to any production merge.
6. Reconcile updated live deck with RU/EN PDF presentation in a separate, explicitly approved publishing step.

## Next product iteration after browser proof
- Optional multi-scenario sensitivity for assortment, markdown and turnover **only with auditable assumptions**.
- A baseline/evidence ledger linking input quality, proposed decision, responsible owner and verified post-implementation result.
- Consent-based lead intent classification, keeping sensitive financial inputs out of automatic contact payloads.
- Commercial funnel instrumentation with the user's permission and a privacy-compliant analytics design.

## State
Feature branch only. No assertion that the new deck, updated PDF, contact form or Telegram content is live. No production, paid resource, or external data transfer is authorized by this document.
