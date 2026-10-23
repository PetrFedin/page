/** Marco Pescarolo Commercial OS / deterministic business math. No financial floats. */
export class CommerceError extends Error {
  constructor(code, message = code) { super(message); this.name = 'CommerceError'; this.code = code; }
}
const INT = /^-?\d+$/;
const MONEY = /^(-?)(\d+)(?:\.(\d{1,2}))?$/;
const VALID_CURRENCY = /^[A-Z]{3}$/;
const moneyValue = x => x === null || x === undefined ? null : String(x);
export function minor(value, name = 'amount') {
  const s = moneyValue(value);
  const m = typeof s === 'string' ? MONEY.exec(s) : null;
  if (!m) throw new CommerceError('INVALID_MONEY', `${name}: decimal amount with at most 2 digits required`);
  const n = BigInt(m[2]) * 100n + BigInt((m[3] || '').padEnd(2, '0') || '0');
  return m[1] ? -n : n;
}
export function decimal(amount) {
  const n = BigInt(amount);
  return `${n < 0n ? '-' : ''}${(n < 0n ? -n : n) / 100n}.${String((n < 0n ? -n : n) % 100n).padStart(2, '0')}`;
}
export function qty(value, label = 'quantity') {
  if ((typeof value !== 'number' && typeof value !== 'string') || !INT.test(String(value))) {
    throw new CommerceError('INVALID_QUANTITY', `${label} must be an integer`);
  }
  const n = Number(value);
  if (!Number.isSafeInteger(n) || n < 0) throw new CommerceError('INVALID_QUANTITY', label);
  return n;
}
export function currency(value) {
  if (!VALID_CURRENCY.test(String(value))) throw new CommerceError('INVALID_CURRENCY', 'ISO currency required');
  return value;
}
export function array(value) { return Array.isArray(value) ? value : []; }
export function formatAmount(amount, iso = 'EUR', lang = 'en') {
  currency(iso);
  const cents = typeof amount === 'bigint' ? amount : minor(amount);
  const n = Number(cents);
  if (!Number.isSafeInteger(n)) return `${decimal(cents)} ${iso}`;
  return new Intl.NumberFormat(lang === 'ru' ? 'ru-RU' : lang === 'it' ? 'it-IT' : 'en-GB', {
    style: 'currency', currency: iso, minimumFractionDigits: 2, maximumFractionDigits: 2
  }).format(n / 100);
}
export function percentBp(numerator, denominator) {
  const n = BigInt(numerator), d = BigInt(denominator);
  return d > 0n ? Number(n * 10000n / d) : null;
}
export function validId(value) { return typeof value === 'string' && /^[a-f0-9-]{36}$/i.test(value); }
function assert(condition, code) { if (!condition) throw new CommerceError(code); }

/** Fail closed: a buyer can only read the signed-in, non-null, active store. */
export function verifyClientScope(snapshot, ledger, selected, proformas = []) {
  assert(snapshot && snapshot.mode === 'SERVER', 'UNVERIFIED_SERVER_SNAPSHOT');
  assert(selected && (selected.db_role === 'buyer' || selected.db_role === 'private_client'), 'ROLE_NOT_GRANTED');
  assert(selected.client_id === snapshot.client_id, 'CROSS_CLIENT_SNAPSHOT');
  assert(validId(selected.tenant_id) && validId(selected.client_id), 'MISSING_AUTHORITY');
  const buyer = selected.db_role === 'buyer';
  if (buyer) {
    assert(validId(selected.client_store_id), 'BUYER_STORE_UNASSIGNED');
    assert(snapshot.store_scope === selected.client_store_id, 'CROSS_STORE_SNAPSHOT');
  } else assert(snapshot.store_scope === null || snapshot.store_scope === undefined, 'PRIVATE_STORE_SCOPE_UNEXPECTED');
  const orders = array(snapshot.orders), ids = new Set();
  for (const order of orders) {
    assert(validId(order.id), 'INVALID_ORDER_ID');
    assert(!ids.has(order.id), 'DUPLICATE_ORDER');
    ids.add(order.id);
    if (buyer) assert(order.store_id === selected.client_store_id, 'CROSS_STORE_ORDER');
    currency(order.currency);
  }
  if (ledger !== null && ledger !== undefined) {
    assert(ledger.mode === 'SERVER' && ledger.access_role === selected.db_role, 'UNVERIFIED_DELIVERY_LEDGER');
    if (buyer) assert(ledger.requested_store === selected.client_store_id, 'CROSS_STORE_DELIVERY_QUERY');
    for (const order of array(ledger.orders)) {
      if (buyer) assert(order.store_id === selected.client_store_id, 'CROSS_STORE_DELIVERY');
      assert(order.client_id === selected.client_id, 'CROSS_CLIENT_DELIVERY');
    }
  }
  const visible = array(proformas).filter(p => ids.has(p.deal_id));
  if (visible.some(p => !orders.find(o => o.id === p.deal_id && o.currency === p.currency))) {
    throw new CommerceError('CROSS_CURRENCY_PROFORMA');
  }
  return { orders, proformas: visible, delivery: ledger ? array(ledger.orders) : [], truncated: orders.length >= 100 };
}

/** Only a server-provided carrier POD ledger is treated as proof of receipt. */
export function analyzeClientOrder(order, delivery = null) {
  const code = String(order.code || '').trim();
  const lines = array(order.lines), warnings = [];
  let lineValue = 0n, orderedUnits = 0;
  for (const [i, row] of lines.entries()) {
    const amount = minor(row.line_total, `lines[${i}].line_total`);
    const u = qty(row.quantity, `lines[${i}].quantity`);
    const price = minor(row.unit_price, `lines[${i}].unit_price`);
    if (amount < 0n || price < 0n) warnings.push('NEGATIVE_LINE_VALUE');
    if (BigInt(u) * price !== amount) warnings.push('PRICE_SNAPSHOT_DELTA');
    lineValue += amount;
    orderedUnits += u;
  }
  const serverTotal = minor(order.total_amount, 'total_amount');
  if (serverTotal < 0n) warnings.push('NEGATIVE_ORDER_TOTAL');
  const verified = array(order.payments).filter(p => p.status === 'verified' && p.currency === order.currency)
    .reduce((s, p) => s + minor(p.amount), 0n);
  const submitted = array(order.payments).filter(p => p.status === 'submitted' && p.currency === order.currency)
    .reduce((s, p) => s + minor(p.amount), 0n);
  // No receipt evidence from a server ledger => delivered is UNKNOWN, not zero.
  let deliveredUnits = null, awaitingUnits = null;
  if (delivery) {
    assert(delivery.id === order.id && delivery.currency === order.currency, 'DELIVERY_ORDER_MISMATCH');
    deliveredUnits = qty(delivery.delivered_units, 'delivered_units');
    awaitingUnits = qty(delivery.undelivered_units, 'undelivered_units');
    if (deliveredUnits > orderedUnits) warnings.push('OVER_DELIVERED');
    if (deliveredUnits + awaitingUnits !== orderedUnits) warnings.push('DELIVERY_BALANCE_MISMATCH');
    if (qty(delivery.undocumented_units || 0) > 0) warnings.push('DELIVERY_WITHOUT_POD');
  }
  return { id: order.id, code, currency: currency(order.currency), stage: order.stage,
    orderedUnits, lineValue, authoritativeTotal: serverTotal, verifiedEvidence: verified,
    pendingEvidence: submitted, deliveredUnits, awaitingUnits, deliveryRatioBp: deliveredUnits === null ? null : percentBp(deliveredUnits, orderedUnits),
    warnings: [...new Set(warnings)] };
}

/** No sum across different currencies and no invented revenue recognition. */
export function projectAdmin(admin, money, queue) {
  assert(admin?.mode === 'SERVER' && validId(admin.tenant_id), 'UNVERIFIED_ADMIN_SNAPSHOT');
  assert(money?.authority === 'postgresql', 'UNVERIFIED_FINANCE_AUTHORITY');
  assert(queue?.mode === 'SERVER', 'UNVERIFIED_FULFILLMENT_QUEUE');
  const orders = array(admin.orders), currencies = new Map(), warnings = [];
  for (const item of array(money.by_currency)) {
    const iso = currency(item.currency);
    assert(!currencies.has(iso), 'DUPLICATE_CURRENCY_GROUP');
    const metrics = {};
    for (const key of ['booked_gmv', 'approved_order_value', 'verified_settlement', 'unverified_payment_evidence',
      'issued_proforma_open_balance', 'delivered_goods_value']) metrics[key] = minor(item[key] ?? '0', key);
    metrics.contribution = item.delivered_contribution_estimate == null ? null : minor(item.delivered_contribution_estimate);
    metrics.deliveredUnits = qty(item.delivered_units || 0);
    metrics.missingCogsUnits = qty(item.delivered_units_missing_cogs || 0);
    if (metrics.missingCogsUnits > 0) { metrics.contribution = null; warnings.push(`${iso}:MISSING_DELIVERED_COGS`); }
    currencies.set(iso, metrics);
  }
  const pendingApprovals = array(admin.approvals).filter(a => a.status === 'pending');
  const unverified = array(queue.payments).filter(p => p.status === 'submitted');
  const release = array(admin.products).filter(p => p.publication_status === 'published' && (!p.retail_price || minor(p.retail_price) <= 0n)).length;
  if (release) warnings.push('PUBLISHED_WITHOUT_RETAIL_PRICE');
  if (unverified.length) warnings.push('UNVERIFIED_PAYMENT_EVIDENCE');
  if (pendingApprovals.length) warnings.push('PENDING_APPROVALS');
  return { currencies, orders, pendingApprovals, unverified, productsMissingRetailPrice: release,
    shipments: array(queue.shipments), proformas: array(queue.proformas), warnings: [...new Set(warnings)],
    recognizedRevenue: null, ordersTruncated: orders.length >= 100 };
}

/** Weighted last-4-week demand is a what-if scenario, not server-confirmed sales. */
export function planReorder({sales, onHand, inbound = 0, leadWeeks, safetyWeeks = 1, moq = 1, multiple = 1} = {}) {
  assert(Array.isArray(sales) && sales.length === 4, 'FOUR_WEEKS_REQUIRED');
  const volume = sales.map((s, i) => qty(s, `sales[${i}]`));
  const hand = qty(onHand, 'onHand'), due = qty(inbound, 'inbound'), minimum = qty(moq, 'moq'), pack = qty(multiple, 'multiple');
  assert(pack > 0, 'ZERO_ORDER_MULTIPLE');
  const weeks = x => { const s = String(x); assert(/^(?:\d+)(?:\.\d)?$/.test(s), 'INVALID_COVERAGE_WEEKS'); return Number(s) * 10; };
  const w = weeks(leadWeeks), safety = weeks(safetyWeeks);
  assert(w > 0 && safety >= 0 && w + safety <= 1040, 'INVALID_COVERAGE_WEEKS');
  const weighted = volume.reduce((sum, s, i) => sum + s * (i + 1), 0);
  const target = Math.ceil(weighted * (w + safety) / 100);
  const shortage = Math.max(0, target - hand - due);
  const suggested = shortage === 0 ? 0 : Math.ceil(Math.max(shortage, minimum) / pack) * pack;
  return { method: 'FOUR_WEEK_WEIGHTED_SCENARIO', weightedWeeklyUnits: weighted / 10, targetStockUnits: target,
    onHand: hand, inbound: due, suggestedUnits: suggested, estimatedWeeksCover: weighted === 0 ? null : (hand * 10 / weighted),
    isForecast: false };
}
export function sellThrough(netSold, openingStock, receipts = 0) {
  const sold = qty(netSold), base = qty(openingStock) + qty(receipts);
  return sold > base ? { basisPoints: null, warning: 'SOLD_EXCEEDS_AVAILABLE' } : { basisPoints: percentBp(sold, base), warning: null };
}
export function gmroi(grossMarginValue, averageStockCost) {
  const margin = minor(grossMarginValue), stock = minor(averageStockCost);
  return stock > 0n ? Number(margin * 10000n / stock) : null;
}
