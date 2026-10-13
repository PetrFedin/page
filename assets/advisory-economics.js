/*
 * Educational stock economics tool for the SYNTHA advisory deck.
 * No network requests, storage, inferred company values or automatic lead payloads.
 * All calculations use annual cost of goods sold and average inventory at cost.
 */

const MAX_AMOUNT = 1e15;
const MAX_DAYS = 3650;

export function calculateInventoryScenario({ annualCogs, averageInventory, targetDays }) {
  const raw = [annualCogs, averageInventory, targetDays];
  if (raw.some((v) => v === '' || v === null || v === undefined || (typeof v === 'string' && !v.trim()))) {
    return { ok: false, error: 'missing' };
  }
  const [cogs, stock, days] = raw.map(Number);
  if (![cogs, stock, days].every(Number.isFinite) || cogs <= 0 || stock < 0 ||
      days <= 0 || cogs > MAX_AMOUNT || stock > MAX_AMOUNT || days > MAX_DAYS) {
    return { ok: false, error: 'invalid' };
  }
  const currentDays = 365 * stock / cogs;
  const targetInventory = cogs * days / 365;
  const inventoryChange = stock - targetInventory;
  return {
    ok: true,
    currentDays,
    targetInventory,
    releasedCapital: Math.max(0, inventoryChange),
    additionalCapital: Math.max(0, -inventoryChange),
    inventoryChange
  };
}

const WORDS = {
  ru: {
    eyebrow: 'Интерактивная экономика · учебная модель',
    title: 'Сколько оборотного капитала связано в товарном запасе?',
    description: 'Введите годовую себестоимость продаж, средний запас по себестоимости и целевой срок оборота. Модель показывает изменение потребности в товарном капитале при прочих равных.',
    cogs: 'Годовая себестоимость продаж',
    stock: 'Средний товарный запас по себестоимости',
    target: 'Целевая оборачиваемость, дней',
    currency: 'Валюта исходных данных',
    sample: 'Подставить учебный пример',
    contact: 'Обсудить диагностику',
    current: 'Текущая оборачиваемость',
    targetStock: 'Целевой средний запас',
    released: 'Теоретически высвобождаемый капитал',
    additional: 'Дополнительная потребность в капитале',
    daySuffix: ' дн.',
    empty: 'Заполните все три показателя, чтобы увидеть расчёт. Значения не собираются и не передаются.',
    invalid: 'Проверьте ввод: себестоимость и срок должны быть больше нуля, запас — неотрицательным.',
    hypothetical: 'Учебный пример: все суммы вымышлены. Не является прогнозом или подтверждённым эффектом.',
    unverified: 'Ваш сценарий: введённые показатели не проверены и не сохраняются.',
    positive: 'Потенциальное изменение среднего запаса, не денежный поток и не гарантированное высвобождение.',
    negative: 'Выбранный целевой срок требует большего среднего запаса; высвобождения капитала в модели нет.',
    caveat: 'Формула: средний запас ÷ годовая себестоимость продаж × 365. Для реального решения необходимы сезонность, страховой запас, сроки пополнения, ограничения поставщиков, спрос и структура себестоимости. Изменение запаса ≠ прибыль или гарантированное поступление денег.',
    privacy: 'Никакой автоматической отправки введённых финансовых данных. Запрос диагностики открывает обычную форму без этих чисел.'
  },
  en: {
    eyebrow: 'Interactive economics · educational scenario',
    title: 'How much working capital is tied up in inventory?',
    description: 'Enter annual cost of goods sold, average inventory at cost and target inventory days. The model estimates the change in inventory capital required, all else equal.',
    cogs: 'Annual cost of goods sold',
    stock: 'Average inventory at cost',
    target: 'Target inventory days',
    currency: 'Input currency',
    sample: 'Use fictional example',
    contact: 'Discuss a diagnostic',
    current: 'Current inventory days',
    targetStock: 'Target average inventory',
    released: 'Theoretical capital released',
    additional: 'Additional capital needed',
    daySuffix: ' days',
    empty: 'Enter all three values to calculate. No input is collected or sent.',
    invalid: 'Check values: cost of goods sold and days must be positive; inventory cannot be negative.',
    hypothetical: 'Educational example: all amounts are fictional. Not a forecast or verified business result.',
    unverified: 'Your scenario: figures are unverified and are not stored.',
    positive: 'Potential change in average inventory, not cash flow or guaranteed capital release.',
    negative: 'The target requires higher average inventory, so this scenario releases no capital.',
    caveat: 'Formula: average inventory ÷ annual cost of goods sold × 365. Actual decisions also need seasonality, safety stock, replenishment lead times, supplier constraints, demand and consistent cost basis. Inventory change is not profit or guaranteed cash inflow.',
    privacy: 'Your financial inputs are never sent automatically. The diagnostic button opens the standard contact form without these figures.'
  }
};

export function mountAdvisoryEconomics(host, language, onContact) {
  if (!host || typeof host.querySelector !== 'function') throw new TypeError('A mount element is required');
  const t = WORDS[language] || WORDS.ru;
  const locale = language === 'en' ? 'en-GB' : 'ru-RU';
  host.classList.add('advisory-economics');
  host.innerHTML = [
    '<div class="advisory-economics-head">',
    '<p class="deck-eyebrow">' + t.eyebrow + '</p>',
    '<h3>' + t.title + '</h3>',
    '<p class="sub">' + t.description + '</p>',
    '</div>',
    '<div class="advisory-economics-grid">',
    '<label>' + t.cogs + '<input data-economics="cogs" type="number" min="0.01" max="1000000000000000" step="any" inputmode="decimal" autocomplete="off"></label>',
    '<label>' + t.stock + '<input data-economics="stock" type="number" min="0" max="1000000000000000" step="any" inputmode="decimal" autocomplete="off"></label>',
    '<label>' + t.target + '<input data-economics="days" type="number" min="0.01" max="3650" step="any" inputmode="decimal" autocomplete="off"></label>',
    '<label>' + t.currency + '<select data-economics="currency"><option value="RUB">RUB</option><option value="EUR">EUR</option><option value="USD">USD</option></select></label>',
    '</div>',
    '<div class="advisory-economics-actions">',
    '<button type="button" class="btn" data-economics-action="sample">' + t.sample + '</button>',
    '<button type="button" class="btn btn-primary" data-economics-action="contact">' + t.contact + '</button>',
    '</div>',
    '<p class="advisory-economics-status" data-economics-status role="status" aria-live="polite"></p>',
    '<dl class="advisory-economics-results" data-economics-results hidden>',
    '<div><dt>' + t.current + '</dt><dd data-economics-result="days"></dd></div>',
    '<div><dt>' + t.targetStock + '</dt><dd data-economics-result="target"></dd></div>',
    '<div><dt>' + t.released + '</dt><dd data-economics-result="released"></dd></div>',
    '<div><dt>' + t.additional + '</dt><dd data-economics-result="additional"></dd></div>',
    '</dl>',
    '<p class="advisory-economics-interpretation" data-economics-interpretation hidden></p>',
    '<p class="advisory-economics-note">' + t.caveat + '</p>',
    '<p class="advisory-economics-note">' + t.privacy + '</p>'
  ].join('');

  const field = (name) => host.querySelector('[data-economics="' + name + '"]');
  const result = (name) => host.querySelector('[data-economics-result="' + name + '"]');
  const status = host.querySelector('[data-economics-status]');
  const metrics = host.querySelector('[data-economics-results]');
  const interpretation = host.querySelector('[data-economics-interpretation]');
  const number = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 });
  let fictional = false;

  function update() {
    const values = {
      annualCogs: field('cogs').value,
      averageInventory: field('stock').value,
      targetDays: field('days').value
    };
    const r = calculateInventoryScenario(values);
    if (!r.ok) {
      metrics.hidden = true;
      interpretation.hidden = true;
      status.textContent = r.error === 'missing' ? t.empty : t.invalid;
      return;
    }
    const currency = field('currency').value;
    const money = new Intl.NumberFormat(locale, {
      style: 'currency', currency, maximumFractionDigits: 0
    });
    result('days').textContent = number.format(r.currentDays) + t.daySuffix;
    result('target').textContent = money.format(r.targetInventory);
    result('released').textContent = money.format(r.releasedCapital);
    result('additional').textContent = money.format(r.additionalCapital);
    metrics.hidden = false;
    interpretation.hidden = false;
    interpretation.textContent = r.additionalCapital > 0 ? t.negative : t.positive;
    status.textContent = fictional ? t.hypothetical : t.unverified;
  }

  host.addEventListener('input', (e) => {
    if (e.target.matches('[data-economics]')) {
      fictional = false;
      update();
    }
  });
  host.addEventListener('change', (e) => {
    if (e.target.matches('[data-economics]')) update();
  });
  host.addEventListener('click', (e) => {
    const button = e.target.closest('[data-economics-action]');
    if (!button) return;
    if (button.dataset.economicsAction === 'sample') {
      field('cogs').value = '120000000';
      field('stock').value = '30000000';
      field('days').value = '75';
      field('currency').value = 'RUB';
      fictional = true;
      update();
    } else if (button.dataset.economicsAction === 'contact' && typeof onContact === 'function') {
      onContact();
    }
  });
  update();
}
