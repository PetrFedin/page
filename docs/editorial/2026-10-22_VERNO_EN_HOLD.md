# Verno: the asking price is not the entire cost

**EN · Landing page + Telegram · 22 October 2026 · HOLD (do not publish)**

## Landing-page article

A property's asking price is only one part of a purchase decision. Upfront cash, financing payments, remaining debt and changes to the terms can all reshape the commitment. In the experimental Verno model, cash-flow scenarios are calculated separately from a bank's approval or an independently verified property valuation. [1]

A buyer also needs to know **which version** of an offer they are evaluating. Verno's engineering branch records successive revisions of proposed terms and connects a reservation request to a specific revision. A request is not automatically a booking: a seller-side actor must make a separate decision. The current controls neither verify a real developer's identity nor establish a legally binding price. [2][3]

The prototype then connects that decision to a demonstration accounting flow: a modelled charge, demo invoice, simulated settlement, release and refund. Its server code explicitly rules out real money movement and verified revenue. This distinction matters to a future marketplace operator: receiving a lead, confirming a hold and earning a fee are not interchangeable events. [4]

**As of 22 October 2026:** this is an unmerged Draft PR #1 using synthetic data, demo roles and SQLite. The remote workflow for the exact commit failed before executing its tests. Real accounts, authoritative developer inventory, actual payments and independent browser acceptance remain outside the verified scope. [5][6]

## Telegram @syntha_pro — draft

**Verno: a property purchase doesn't start with a magic “Reserve” button.**

First, buyers need intelligible future cash flows. Then a versioned offer, a request and a distinct seller decision. Verno's development candidate models this path with synthetic data. A connected ledger tracks demo charges and refunds, but **not actual revenue**.

This is engineering work under review, not a live transaction service. Source and status: https://github.com/PetrFedin/verno/pull/1

## Sources and boundaries

[1] [Scenario decision model, 15 Oct](https://github.com/PetrFedin/verno/blob/fd9bf6d24f97e5d3579211e31671ac77082a4eea/docs/DECISION-ENGINE-V1.md).  
[2] [Versioned Quote Ledger](https://github.com/PetrFedin/verno/blob/fd9bf6d24f97e5d3579211e31671ac77082a4eea/docs/QUOTE-LEDGER-V1.md).  
[3] [Actual opt-in buyer/seller workspace](https://github.com/PetrFedin/verno/blob/fd9bf6d24f97e5d3579211e31671ac77082a4eea/web/src/pages/ReservationWorkspace.tsx).  
[4] [Demo accounting source](https://github.com/PetrFedin/verno/blob/fd9bf6d24f97e5d3579211e31671ac77082a4eea/server/src/commercialLedger.ts).  
[5] [Continuity and limitations report, 22 Oct](https://github.com/PetrFedin/verno/blob/fd9bf6d24f97e5d3579211e31671ac77082a4eea/docs/CONTINUITY-2026-10-22.md).  
[6] [Exact-head CI failed with no executed steps](https://github.com/PetrFedin/verno/actions/runs/39697153544).

**Media:** none. Rights to property photos, developer marks and customer materials could not be verified. Product-owner, editorial, IP/privacy and separately authorised web/Telegram approvals are required.
