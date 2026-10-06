# Order Workspace MVP — 2026-10-06

Dedicated demo: https://marco-pescarolo-showroom.vercel.app/
Source: PetrFedin/page, branch marco-pescarolo-showroom. No changes to main or syntha.pro.

## Scope
Catalog administration with activation, complete product metadata, local photo/video uploads; company/store and private client profiles; account discounts and per-article price rules; separate drafts and wishlists; size/colour order matrix; immutable submitted order snapshots; bilateral brand/client approval; revisions invalidate approvals; delivery terms; special colour/composition quotes; optional top/bottom sets; order reports by article, client, city, country and season; saved-but-not-ordered interest and client activity.

Confirmed order value is contractual order volume, not collected cash or profit. Retailer sell-through, weeks of supply, stockout predictions and post-delivery retail sales are outside this release.

## Validation
21 behavioral checks passed via node order-workspace.test.cjs. RU/EN/IT render smoke checks cover eight administration tabs. Live desktop verification: inactive product creation with uploaded photo and MP4; media rendered; account fixed article price displayed in wishlist and matrix; order submitted, brand offered, owning client accepted, confirmed value appeared in report; CSV download completed. Mobile device testing is not claimed.

## Deployment and limitations
Production deployment dpl_6JM5He1kv6RvRJjanyvWybuw6FpZ is READY on the dedicated alias. Application data uses browser storage; uploaded media uses local IndexedDB. Roles are demo switches, not authentication. No shared backend, multi-user synchronization, real notifications, payment accounting or production authorization is implemented. QA mutations occurred only in the test browser.
