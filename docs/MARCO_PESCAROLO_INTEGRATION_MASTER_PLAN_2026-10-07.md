# MARCO PESCAROLO INTEGRATION MASTER PLAN
Version: 2026-10-07 v5
Authority: canonical product-development checklist for Marco Pescarolo Digital Showroom & Commercial OS

## Mandatory rule before every development cycle
1. Read this file first.
2. Compare planned work with CURRENT STATUS.
3. Do not duplicate already implemented functionality.
4. Preserve the public luxury-brand experience and the commercial/buyer workspace as separate but connected surfaces.
5. Maintain full EN / RU / IT parity for all customer-facing UI, dynamic labels, statuses, product terminology and commercial flows.
6. Never present demo/scenario numbers as real Marco Pescarolo performance.
7. Never replace the current live build until the new version passes the release gate.
8. Every addition must improve buyer convenience, private-client service, brand conversion, cash/margin visibility, repeat ordering, operational control or white-label scalability.

## Product north star
PUBLIC LUXURY BRAND SITE
→ COLLECTION / PRODUCT DISCOVERY
→ WHOLESALE BUYER PORTAL
→ PRIVATE CLIENT EXPERIENCE
→ ORDER / DEAL AUTHORITY
→ PROFORMA / DEPOSIT / CASH
→ INVENTORY / ALLOCATION / SHIPMENT
→ SELL-THROUGH / REORDER
→ BRAND COMMERCIAL OS
→ WHITE-LABEL PLATFORM

Golden path:
Discover → Select → Negotiate → Approve → Proforma → Advance → Confirm → Allocate → Ship → Deliver → Sell-through → Reorder.

## Public brand layer
Required:
- editorial luxury homepage;
- current-season hero;
- Napoli heritage / brand story;
- textile/material research;
- category stories;
- dedicated Collection page;
- dedicated Product Detail Page;
- photo gallery, previous/next, zoom, video, detail/back/front;
- related products and Complete the Look;
- buyer/private-client entry points;
- SYNTHA.PRO attribution without disturbing the brand experience.

## Product master / collection authority
Each style requires:
season, collection, SKU, category/subcategory, role, colorways, sizes, composition, origin, prices, client price rules, MOQ/order multiples, availability mode, on-hand, incoming, pre-book, delivery windows/ETA, media, video, fit notes, active/publication status, related products.

### Complete-look graph
Many-to-many relations managed by the brand:
- 1 top ↔ N bottoms;
- N tops ↔ 1 bottom;
- N tops ↔ N bottoms;
- knitwear / outerwear / shirts / trousers can coexist in one look group.
Future relation types: MATCH / ALTERNATIVE / LAYER / UPSELL / SUBSTITUTE, with priority, season validity and color compatibility.

## Wholesale buyer experience
Login / identity
→ client-specific assortment and price list
→ Collection
→ PDP
→ color/size matrix
→ quantities
→ wishlist
→ working order
→ review
→ commercial terms
→ submit
→ brand revision / negotiation
→ confirmation
→ proforma
→ deposit
→ allocation
→ shipment
→ delivery
→ sell-through
→ reorder.

Buyer requirements:
- multiple draft orders;
- save/resume;
- compare drafts;
- duplicate/copy order;
- rename copied order;
- change store / ship-to / buyer reference;
- edit SKU/color/size/qty;
- add/delete lines;
- totals recalc;
- copied_from_order_id lineage;
- difference view vs source;
- multiple stores/doors under one buying account.


### Wholesale size-run / article ordering UX — mandatory
For store / buyer accounts, ordering must be article-first and size-run driven, not private-client-fit driven.

Required buyer interaction:
- each article exposes all commercial colors;
- selected color opens the full size run in one matrix row;
- every size cell shows on-hand, incoming and order quantity;
- buyer can enter quantities across the size run without opening separate SKU rows;
- article card opens a deep product dossier with official photo/video, composition, product information, availability and Complete the Look;
- Complete the Look can contain one-to-many / many-to-many linked articles;
- “Order complete look” copies the primary article’s size-run quantities into matching sizes of related articles as a starting point;
- unmatched sizes stay explicit and require review;
- buyer can adjust any related article, color, size or quantity before save;
- save commits all chosen article/color/size quantities into the current working order;
- the order editor groups lines back by article → color → size run rather than forcing the buyer to edit one SKU row at a time.

Private-client fit remains a separate experience and must not replace this wholesale matrix.

### Multi-store ordering
Master order → Copy to Store B → edit differences → Copy to Store C → edit → submit independently.
Future: copy selected styles, scale by ratio/store grade, split one order across stores, merge drafts, store allocation matrix, diff-from-master.

## Private client experience
Required:
- advisor-friendly discovery;
- wishlist;
- appointment/request;
- versioned body-measurement profile;
- preferred fit;
- usual jacket/trouser sizes;
- consent/privacy;
- recommended size + confidence;
- in-stock-first recommendations;
- Complete-the-Look recommendations;
- alternatives when recommended size unavailable.

Measurements: height, chest, waist, hips, inseam; later shoulder/sleeve.
Production sizing must use brand size charts + style-specific fit rules. Never imply made-to-measure accuracy from a simple profile.

## Order authority
Canonical states:
draft → selection → negotiation → submitted → approval_pending → approved → proforma_issued → advance_pending → advance_confirmed → allocated → confirmed → fulfilment → shipped → delivered → reorder_candidate → closed / cancelled.

Requirements: immutable order events, line revisions, versioning, actor/timestamp/reason, evidence refs, idempotency, outbox, audit log, buyer/brand comments, exception reasons.
Copying creates a NEW order and never overwrites source history.

## Approval / policy authority
Explicit policy objects for discount, price exception, credit, deposit %, payment terms, MOQ, delivery, reservation, ETA and reorder eligibility.
Roles: Sales Owner, Merchandising, Commercial Director, Finance, Owner/Admin.
Production evidence = actor + role + policy version + timestamp + reason + decision + evidence ref.

## Proforma / payment / cash
Proforma linked to exact approved order version.
Track expected advance, received amount/date/currency/reference/evidence, finance verification, reconciliation, balance due, due date, overdue.
Money Control: requested, submitted, approved, confirmed, advances due/received, cash collected, receivables, expected cash, COGS, gross profit/margin, client/SKU/store profitability, season P&L.

## Inventory / allocation / fulfilment
Authority equation: on_hand - reserved + incoming = available-to-promise according to policy.
Track warehouse/location, size-level inventory, incoming PO/ETA, reservation, allocation gap, split delivery, shipment/tracking, delivery evidence, partial shipment, cancellation/release.
Never show reserved stock unless the DB transaction confirms it.

## Sell-through / reorder
Sources: retailer upload first, then POS/ERP.
Metrics: delivered, sold, ending stock, sell-through, weekly velocity, WOS, stockout risk.
Recommended qty = max(ceil(target_WOS × weekly_velocity − ending_stock), 0).
Statuses: recommended → reviewed → buyer-approved → brand-approved → ordered → invoiced → allocated → shipped.
Do not mix recommended and real invoiced reorder KPIs.

## Brand Studio / Admin
Manage seasons, collections, categories, products, colorways, sizes, prices, client rules, stock, ETA, media/video, composition, fit notes, Complete-look groups, publish state, collection readiness, clients/stores, commercial policies and approval rules.

Media Library authority:
original asset, optimized derivative, image/video type, order/hero flag, EN/RU/IT alt text, status, checksum/version, product/collection/look links.

## Localization authority
EN / RU / IT. Full localization includes public pages, collection, PDP, dynamic labels, categories, colors where appropriate, terms, statuses, system messages, cart/order/payment/shipment, Brand Studio and investor view.
Master identifiers remain unchanged: SKU/order/season IDs, buyer account names, price-list codes.

## Architecture roadmap recovered from existing product work
Phase 2 — Transaction: auth, client catalogues, DB, proforma/invoices, payment links, reconciliation, notifications, immutable approvals.
Phase 3 — Intelligence: sell-through, WOS/stockout, reorder, client scoring, assortment intelligence, margin/contribution.
Phase 4 — Network: white-label, agencies, partner access, buyer network, API/ERP.
Phase 5 — Brand OS: season planning, wholesale forecasting, production commitment, allocation, logistics, finance, lifecycle CRM.

## CURRENT STATUS — do not duplicate
LIVE v6.1:
- EN/RU/IT;
- buyer ordering/commercial OS UI;
- collection;
- PDP modal;
- size/stock/incoming matrix;
- wishlist/cart/order flow;
- order stages;
- business money control;
- investor view.

v6.2 BUILD — not yet canonical live:
- separate editorial public homepage;
- separate collection page;
- separate PDP with media navigation;
- separate buyer portal;
- multi-store draft orders and order copying concept;
- private fit profile concept;
- Complete-look many-to-many concept;
- Brand Studio concept.

v6.3 BUILD — not yet canonical live:
- product gallery hardened with zoom, swipe and keyboard navigation;
- official Marco Pescarolo FW26/27 editorial imagery integrated from the official website for homepage / collection / PDP presentation;
- official editorial video is referenced from the official website;
- media-to-demo-SKU assignments remain presentation_only until brand-verified product-level media mapping exists;
- multi-store store profiles are editable;
- copied orders retain copied_from lineage and source snapshot;
- copied order diff highlights store/name/reference/line/quantity changes;
- order version and updated timestamp added to local MVP authority;
- private fit profile now keeps measurement-version history;
- fit recommendation includes confidence indicator and explicit production disclaimer;
- Brand Studio shows Product Master / Media Library readiness for the next PostgreSQL authority phase.


Buyer UX implementation added in v6.4 local build — not yet canonical live:
- wholesale article cards show size-run availability summary;
- buyer product drill-down is modal/full-depth inside portal;
- product drill-down includes official media, product info, colors, size-run ordering matrix and Complete the Look;
- order editor groups quantities by article → color → size run;
- Complete-Look ordering can seed related articles with the same matching-size quantities, then buyer adjusts before save;
- private-client fit remains separate from wholesale size-run ordering.

PostgreSQL authority implemented on 2026-10-07:
- migration 005 product_media_store_order_authority PASS;
- migration 006 reference_catalogue_and_multistore_seed PASS;
- migration 007 authority_fk_indexes PASS;
- collections authority;
- product localizations EN/RU/IT;
- Media Library authority with rights_status / source_kind / version / alt text;
- official-site media stored as reference_only, not asserted as product-authoritative;
- product_media mappings explicitly marked presentation_only until brand verification;
- Complete-Look group + many-to-many member authority;
- client Stores / Doors authority;
- deals now carry store, title, buyer reference, copied_from, root_deal, copy depth and current revision;
- immutable deal_revisions ledger;
- server-side copy_deal() authority;
- server-side capture_deal_revision() snapshots;
- server-side deal_revision_diff() proof;
- Golden Path proof: Rive Gauche master order copied to Marais, then edited; lineage preserved and diff proves title/reference/notes + qty 8→6 change;
- RLS remains enabled with no public policies by design for trusted-backend-only access until authenticated Buyer Portal is admitted.


PostgreSQL authority additions on 2026-10-07 — P5–P11 continuation:
- migration 008 private_fit_authority PASS;
- migration 009 authenticated_portal_access PASS;
- migration 010 submit_revision_accept_approval_authority PASS;
- migration 011 portal_identity_hardening PASS;
- migration 012 buyer_order_mutation_and_p7_hardening PASS;
- migration 013 proforma_payment_reconciliation_authority PASS;
- migration 014 transaction_safe_inventory_allocation PASS;
- migration 015 shipment_delivery_authority PASS;
- migrations 016a/016b/016c/016d/016e sell-through + reorder authority PASS;
- Private Fit authority now supports versioned measurements, size-chart versions, product fit rules, confidence/explanation, immutable recommendation runs;
- production fit recommendations remain blocked while Marco brand-verified size charts are unavailable; synthetic chart exists only for engine verification and is explicitly production_eligible=false;
- authenticated portal RLS contour exists for tenant/client-scoped catalogue, prices, stores, orders, revisions, fit data, shipments, sell-through and reorder data;
- real Buyer Portal JWT/login Golden Path is still pending creation/admission of a real Supabase Auth buyer identity; do not claim login PASS before that test;
- buyer order mutation authority now includes create draft, header edit, line set/remove, copy, save revision and submit, with client/account scope checks;
- P7 server state machine supports submit → brand revision → buyer accept → approval_pending → approved/rejected with immutable revision/evidence trail;
- P8 proforma is linked to an exact deal revision and approval snapshot; buyer payment evidence remains unverified until Finance verification;
- P8 synthetic Golden Path PASS: €1,720 approved order → €516 advance due → submitted evidence → Finance verified €516 → advance_confirmed; remaining receivable €1,204;
- P9 transaction-safe allocation authority PASS; atomic reservation with row locks and rollback-on-shortage semantics;
- P9 synthetic Golden Path PASS: two variant-level lines fully reserved, allocation_gap=0, deal stage allocated;
- P10 shipment/delivery authority PASS with shipment lines, reservation consumption, on-hand decrement, tracking and immutable delivery receipt;
- P10 synthetic Golden Path PASS: allocated → confirmed → fulfillment → shipped → delivered; 8 units shipped, reservation counters returned to zero, POD receipt recorded;
- P11 sell-through ingestion uses checksum idempotency, row-level validation/errors, store/variant-level data and source-format provenance;
- P11 reorder engine computes weekly velocity, WOS, stockout risk and recommended_qty server-side; recommendation is explicitly not an order until approvals/conversion;
- P11 synthetic Golden Path PASS: MP-25101-M velocity 4.0/WOS 1.0/recommended 28/critical; MP-25114-50 velocity 2.25/WOS 2.22/recommended 13/high; total proposed value €22,940;
- reorder lifecycle supports buyer approval → brand approval → conversion to a new draft order while preserving source_reorder_proposal_id.

Existing PostgreSQL transaction foundation:
tenants/users/clients/products/variants, deals/lines/events, approvals/policies, proformas/payments, inventory/reservations, shipments/events, sell-through/reorder, idempotency/outbox/audit.



PostgreSQL + local buyer binding additions on 2026-10-07 — B2B matrix / Auth bridge continuation:
- migration 019a b2b_variant_matrix_authority PASS; product variants now carry variant_authority and the buyer matrix is article × color × size; current 6-style matrix is explicitly presentation_only/demo until brand-verified color-size data arrives;
- migration 019b b2b_size_run_complete_look_transactions PASS; portal_apply_size_run saves a complete color size-run server-side and portal_save_complete_look persists a linked set transactionally;
- migration 019c b2b_complete_look_transaction_hardening PASS; one complete-look save creates one business revision and uses a no-revision internal component writer;
- migration 019d b2b_buyer_matrix_preview_views PASS; v_buyer_variant_matrix, v_buyer_order_matrix and server-side Complete-Look preview are available to authenticated buyers through RLS;
- migration 020 buyer_invitation_claim_authority PASS; authenticated user can claim only an active, unexpired invitation matching the JWT email, which creates/activates public user + portal membership;
- migration 021 buyer_invitation_admin_authority PASS; brand-side invitation creation is server-only and not granted to anon/authenticated browser roles;
- local build is now marco-pescarolo-v6.4-b2b; portal loads Supabase JS with a publishable key only and includes a server bridge for sign-in/sign-up, invite claim, RLS-scoped stores/orders/matrix, server size-run save, Complete-Look preview/save and server multi-store copy;
- anonymous REST proof PASS: direct anon query to v_buyer_variant_matrix returns HTTP 401 / permission denied;
- Supabase Auth settings verified: email/password enabled, signup enabled, mailer_autoconfirm=false; therefore a real buyer JWT Golden Path requires a real email confirmation or an Auth Admin user created via the official Auth service; do not bypass this with direct SQL writes to auth.users;
- JS syntax gate PASS for app.js and server-bridge.js.

## NEXT STRICT IMPLEMENTATION ORDER
P0 preserve current live.
P1 harden v6.2 public/collection/PDP/buyer UX with full EN/RU/IT parity.
P2 Product Master + Media Library + Complete-look authority in PostgreSQL. — AUTHORITY FOUNDATION PASS; brand-verified product media mapping still pending.
P3 Stores/Doors + multi-store draft order authority. — SERVER FOUNDATION PASS; v6.4 authenticated UI bridge implemented locally; real JWT E2E pending.
P4 Order copy lineage + version history + diff. — SERVER-SIDE GOLDEN PATH PASS; v6.4 multi-store copy is wired to portal_copy_deal when authenticated.
P5 Private Fit Profile + brand size charts + recommendation rules. — AUTHORITY ENGINE PASS; real Marco brand size-chart source still pending. Wholesale ordering now uses a separate B2B article/color/size matrix.
P6 Authenticated Buyer Portal. — RLS / membership / API contour PASS; local v6.4 Supabase client + invitation claim bridge PASS; real confirmed-email buyer JWT Golden Path pending.
P7 Buyer submit → Brand revise → Buyer accept → Approval Authority. — SERVER STATE MACHINE PASS; real buyer-JWT E2E pending.
P8 Proforma → Deposit → Finance reconciliation. — SERVER AUTHORITY + SYNTHETIC GOLDEN PATH PASS.
P9 Transaction-safe inventory reservation/allocation. — ATOMIC AUTHORITY + SYNTHETIC GOLDEN PATH PASS.
P10 Shipment/delivery authority. — SERVER AUTHORITY + DELIVERY-EVIDENCE GOLDEN PATH PASS.
P11 Sell-through import → WOS → reorder. — INGESTION + RECOMMENDATION + APPROVAL/CONVERSION AUTHORITY PASS; real retailer file/API sample pending.
P12 Money Control from PostgreSQL-authoritative facts only. — AUTHORITY VIEW FOUNDATION PASS; production KPI admission still requires production data_class and real transaction sources.
P13 Payment provider + ERP/WMS/POS.
P14 Assortment intelligence / client scoring / forecasting.
P15 White-label / agency / network layer.

## Release gate
Before replacing live: desktop/tablet/mobile, EN/RU/IT, public homepage, collection, PDP/media, buyer context, order create/copy/edit/diff, totals, financial calculations, no unlabelled demo claims, current live recoverable.

## v6.4.1 demo commerce CRUD + cross-surface recalculation status — 2026-10-08
- Demo login cards are live and browser-verified for Store/Buyer and Private Client; Fill login/password → Sign in works for both profiles.
- Buyer demo order editor is browser-verified for edit name, SKU/model, color, size, quantity, store, status and notes.
- Live order value and unit count recalculate immediately after quantity/model edits.
- Save increments order version and persists edited values back into the order list.
- Order duplication preserves copied_from lineage/source snapshot and creates an independent new draft.
- Copy order can be edited independently by store and line values.
- Order delete was hardened to direct deterministic demo deletion; browser regression PASS: deleting the duplicated order removes only the copy and preserves the original.
- Brand Studio consumes the same local demo authority state as Buyer Portal; buyer-side edits are visible in the brand order portfolio.
- Brand Money Control browser regression PASS: Submitted value reflects submitted orders; changing Submitted → Confirmed moves value into confirmed sales and recalculates deposits/receivables.
- Exact regression example PASS: €11,204 submitted → €11,204 confirmed; 30% deposit = €3,361 rounded; receivable = €7,843.
- Brand-side status change syncs back to Buyer Portal; confirmed status, value and units remain consistent across both surfaces.
- No browser JavaScript/UI errors observed in the latest CRUD/recalculation regression.
- Current demo build remains a scenario/demo authority layer. Production commercial truth still requires authenticated PostgreSQL buyer flow and production data_class transaction sources.

## v6.5 role-specific workspace direction — 2026-10-08
### Private Client Workspace — mandatory UX separation
Private client is NOT a reduced wholesale portal. It is a personal luxury wardrobe / clienteling experience.
Required:
- own visual language distinct from wholesale;
- My Wardrobe: purchased Marco Pescarolo pieces, dates, colors, sizes, value and history;
- Selected for You: recommendation engine seeded by owned articles, Complete-Look graph, fit profile, availability and client tier;
- client history, relationship value, tier / loyalty level and personal offers;
- individual commercial stimulation based on spend level and relationship history;
- private services: alterations/hemming, fabric change, special sizing, exclusive models and concierge requests;
- wishlist, appointments, private requests and private offers;
- recommendations must be explainable: why a product is suggested and which owned item it complements;
- future algorithm layer can use purchase history, wardrobe graph, recency, category affinity, spend, fit and availability to generate next-best-product / next-best-offer.

### Wholesale Buyer Workspace — mandatory UX separation
Wholesale is an article-first professional buying workspace, visually distinct from private client.
Required:
- available seasonal collection with article, materials, colors, complete looks, full size run, list price, client net price, commercial discount and delivery/drop windows;
- quantity entry by color × size matrix;
- any number of draft orders per store / platform / city / country / season / year / channel;
- order grouping and aggregation by store, city, country, season, year and channel;
- ability to create consolidated orders from selected grouped drafts while preserving source lineage;
- client-specific price list, discount, advance/payment terms and delivery terms;
- copy/adapt orders between doors; independent submit/confirm per order;
- live totals must recalculate after model/color/size/quantity changes.

### Brand Studio — split Private CRM / Wholesale CRM / Operations / Product Master
Brand Studio must expose different management contours:
1. Commercial cockpit.
2. Private clients — one dossier per person: wardrobe, spend, tier, fit, history, requests, brand notes, private offers and clienteling actions.
3. Wholesale accounts — account → stores/doors → seasonal orders → commercial terms → sell-through/reorder.
4. Orders & fulfilment — brand can revise orders/lines, confirm advance/payment, and record full/partial shipment at order/article level; client-visible state updates after brand actions.
5. Product Master + Media Library — brand creates and edits product cards shown to both private and wholesale clients: names/descriptions EN/RU/IT, category, composition, colors, sizes, price, delivery/drop, publication state, photos and video.

### v6.5 local/demo implementation status
- Private Client demo now has distinct dark luxury navigation and separate workspace: Private Wardrobe, My Wardrobe, Selected for You, Fit Profile, Private Services.
- Private demo seeds purchased wardrobe, relationship value/tier, curated recommendations, private offers/history and concierge service requests.
- Browser verification PASS: private login, distinct UI, 2 owned items, 4 recommendations, fit profile, four private services, offer/history and creating an alteration request.
- Wholesale demo now has a distinct Buying Desk structure: seasonal overview, available collection, article/material/colors/size-run/list vs net price/delivery, Orders, Group Orders and Commercial Terms.
- Wholesale grouping implemented for store/city/country/season/year/channel with consolidated-order creation while preserving groupedFrom lineage in demo state.
- Brand Studio v6.5 now has five top-level tabs: Commercial cockpit, Private clients, Wholesale accounts, Orders & fulfilment, Product master.
- Brand Private Clients dossier implemented with wardrobe/spend/notes/private offers/request statuses.
- Brand Wholesale Account screen implemented for Maison Vela with stores/doors and seasonal order portfolio.
- Brand Operations implemented with brand-side order-line quantity edits, advance confirmation and shipment records in demo state.
- Brand Product Master implemented with editable EN/RU/IT product content, composition, colors, sizes, wholesale price, delivery/drop, publication state and local demo media upload preview/storage for small images.
- Browser verification so far: Private Client workspace and Brand Private Clients dossier PASS; wholesale/ops/product-master require targeted follow-up E2E before release claim.

## v6.6.1 three-role entry / Brand Administrator access — 2026-10-08
- The unified Private Showroom entry must expose three explicit demo role cards: Store / Buyer, Private Client, Brand Administrator.
- Brand Administrator is a separate role, not an alias of buyer/private access.
- Brand Administrator demo credentials must be visible on the entry card and on the Brand Studio login gate; demo only, never production credentials.
- Entry card provides an explicit `Open Brand Studio` action; Brand Studio remains separately gated and requires its own Sign in action.
- Brand Studio role surface owns Private CRM, Wholesale CRM, Orders & Fulfilment, Product Master / Media Library, commercial cockpit and brand-side revisions/payment/shipment controls.
- Private and wholesale clients remain visually and functionally distinct; all three role surfaces share linked demo commerce state while production authority remains PostgreSQL/Auth-gated.

## v6.7 linked commerce authority / UX simplification — 2026-10-08
- Entry-screen demo credentials are now laid out horizontally on desktop in three equal role cards with non-breaking login/password values; responsive layout collapses to one column on narrow screens.
- Private Client, Store/Buyer and Brand Administrator remain separate visual/functional workspaces with a shared linked demo commerce state.
- Added linked demo commerce authority module for order/private-order revisions, product publication state, delivered wholesale counters, reorder signals and delivered-private-order wardrobe propagation.
- Product Master publication state now propagates to Private Client recommendations, Wholesale available collection and Public Collection; unpublished demo products are filtered from client-facing lists.
- Product Master overrides (name/description/composition/colors/sizes/price) are reapplied across surfaces from shared demo state.
- Private order brand operations now record brand revisions; full shipment transitions a private order to delivered and automatically adds/increments delivered products in the private client's My Wardrobe and relationship spend once per order.
- Wholesale brand operations now record line-revision history; partial/full shipment updates shipped/delivered order state and delivered quantity counters.
- Reorder-signal demo calculation is generated from delivered wholesale lines as a labeled demo proxy only; real production reorder remains governed by the PostgreSQL sell-through authority from P11.
- Current draft preview for this layer: Netlify deploy 6ac7b41a6fd39afe267af50a. Production v6.1 remains untouched.
- Syntax gate PASS for v67-commerce-authority.js, v66-client-workspaces.js, v65-brand-studio.js, v66-brand-access.js and demo-login.js before deploy.
- Browser visual check PASS on the v6.7 entry screen: the three demo credentials are visibly horizontal and no longer wrap character-by-character at desktop width.

## v6.8 wholesale size-run order visibility — 2026-10-08
- Wholesale order editor must display article → color → full size run as the primary editing surface.
- Every ordered article/color row shows every commercial size, ordered quantity per size, row units and row value.
- Buyer can edit quantities directly in size cells; zero removes that size from the order on save.
- The editor shows product image, SKU, category, material/composition and color next to the size run.
- Save reconstructs order lines from the article/color/size matrix, increments order version and records a buyer revision.
- Private-client orders remain single-client-fit oriented and must not reuse the wholesale size-run editor.
- This requirement is release-blocking for Store / Buyer UX.
