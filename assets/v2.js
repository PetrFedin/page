/* Isolated V2 presentation; original content and project registry are preserved. */
const V2_PATHS = {"ru":[{"id":"consulting","n":"01","tab":"Консалтинг","kicker":"Экономика и управление","title":"Нужно улучшить прибыль, запасы или управляемость бизнеса","body":"Разбираем экономику решения, товарный цикл, каналы, оборотный капитал и управленческие ограничения. Результат — решение, которое можно внедрять, а не отчёт на полке.","when":["маржа или денежный поток не сходятся","остатки и закупка требуют пересборки","решение нужно принять на данных"],"need":["управленческие данные и ограничения","контекст решения и сроки","критерий, по которому задача считается решённой"],"gets":["диагностика и приоритеты","модель решения и экономика","план внедрения с контрольными точками"],"topic":"consulting","prompt":"Коротко опишите бизнес-задачу, что сейчас не устраивает и какой результат нужен."},{"id":"pilot","n":"02","tab":"Пилот продукта","kicker":"Продукт и разработка","title":"Нужно проверить цифровой продукт на реальном бизнес-сценарии","body":"Выбираем один измеримый Golden Path, ограничиваем объём пилота и заранее фиксируем критерии PASS / FAIL. Так продукт проверяется в работе, а не только на демо.","when":["есть процесс, который можно оцифровать","гипотезу нужно проверить до большого внедрения","важен измеримый результат пилота"],"need":["описание текущего процесса","владелец процесса и тестовый контур","данные или примеры для одного Golden Path"],"gets":["границы пилота и критерии приёмки","рабочий сценарий / прототип","evidence результата и решение о следующем этапе"],"topic":"launch","prompt":"Опишите процесс или задачу, которую хотите проверить в пилоте, и что должно измениться после него."},{"id":"partnership","n":"03","tab":"Партнёрство","kicker":"Совместный рост","title":"Есть актив, компетенция или рынок, которые можно соединить","body":"Сначала определяем взаимный вклад, коммерческую механику и ответственность сторон. Затем — ограниченный совместный кейс, где ценность можно подтвердить цифрами.","when":["есть доступ к клиентам, данным или инфраструктуре","нужна совместная коммерческая модель","интересен co-development или distribution"],"need":["что каждая сторона реально вносит","какой клиентский сценарий создаём вместе","как измеряется общий результат"],"gets":["карта ролей и вкладов","модель value / revenue sharing","план первого совместного кейса"],"topic":"partnership","prompt":"Опишите, что вы предлагаете как партнёр и какой совместный результат считаете ценным."},{"id":"investment","n":"04","tab":"Инвестиции","kicker":"Капитал и масштабирование","title":"Нужно обсудить инвестиции в конкретный продукт или портфель","body":"Разговор строится вокруг продукта, стадии готовности, модели монетизации, следующего de-risking milestone и того, на что именно нужен капитал.","when":["интересен один из действующих проектов","нужен понятный путь от капитала к milestone","важны экономика, риски и evidence"],"need":["интересующий продукт или направление","инвестиционный горизонт и формат участия","ключевые требования к риску и доходности"],"gets":["структурированный инвестиционный диалог","карта milestone → капитал → evidence","следующий шаг по diligence / пилоту / партнёрству"],"topic":"investors","prompt":"Укажите проект или направление, формат интереса и что вы хотите проверить перед следующим шагом."}],"en":[{"id":"consulting","n":"01","tab":"Advisory","kicker":"Economics & management","title":"Improve profit, inventory or management visibility","body":"We connect the economics of the decision with merchandise, channels, working capital and operating constraints. The output is an implementable decision, not a report that sits on a shelf.","when":["margin or cash conversion is under pressure","buying and inventory need to be redesigned","the decision must be grounded in data"],"need":["management data and constraints","decision context and timeline","a clear acceptance criterion"],"gets":["diagnosis and priorities","decision model and economics","implementation plan with control points"],"topic":"consulting","prompt":"Briefly describe the business problem, what is not working today and the outcome you need."},{"id":"pilot","n":"02","tab":"Product pilot","kicker":"Product & development","title":"Test a digital product on a real business workflow","body":"We select one measurable Golden Path, limit the pilot scope and define PASS / FAIL criteria upfront. The product is tested in operation, not only in a demo.","when":["a workflow can be digitised","a hypothesis should be tested before a large rollout","the pilot needs a measurable outcome"],"need":["current workflow description","a process owner and test environment","sample data for one Golden Path"],"gets":["pilot scope and acceptance criteria","working workflow / prototype","result evidence and a go / no-go decision"],"topic":"launch","prompt":"Describe the workflow you want to test and what should improve after the pilot."},{"id":"partnership","n":"03","tab":"Partnership","kicker":"Joint growth","title":"Combine assets, capabilities or market access","body":"We first define each side’s contribution, commercial mechanics and accountability. Then we structure a limited joint case where value can be proven with evidence.","when":["you bring clients, data or infrastructure","a joint commercial model is needed","co-development or distribution is relevant"],"need":["what each side contributes","the customer workflow we create together","how joint value will be measured"],"gets":["roles and contribution map","value / revenue-sharing model","plan for the first joint case"],"topic":"partnership","prompt":"Describe what you bring as a partner and the joint outcome you would consider valuable."},{"id":"investment","n":"04","tab":"Investment","kicker":"Capital & scale","title":"Discuss capital for a specific product or portfolio","body":"The discussion is structured around the product, maturity, monetisation, the next de-risking milestone and the exact use of capital.","when":["one of the active products is relevant","capital must map to a measurable milestone","economics, risk and evidence matter"],"need":["product or area of interest","investment horizon and participation format","key risk / return requirements"],"gets":["structured investment dialogue","milestone → capital → evidence map","next diligence / pilot / partnership step"],"topic":"investors","prompt":"Name the product or area, your preferred format and what you need to verify before the next step."}]};

/* V2 decision layer */
function installDecisionLayer(lang, $) {
  const en = lang === 'en';
  const paths = V2_PATHS[en ? 'en' : 'ru'];
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const routes = $('#v2-routes');
  if (!routes) return;

  $('#hero-lead').textContent = en
    ? 'I help fashion businesses connect buying, products, sales and cash — then turn the findings into operating decisions, pilots and digital tools.'
    : 'Помогаю фэшн-бизнесу связать закупку, продукт, продажи и деньги — и перевести выводы в управленческие решения, пилоты и цифровые инструменты.';
  $('#cta-contact').textContent = en ? 'Choose a way to work' : 'Выбрать формат работы';
  $('#cta-contact').setAttribute('href', '#v2-decision');

  let section = $('#v2-decision');
  if (!section) {
    section = document.createElement('section');
    section.id = 'v2-decision';
    section.className = 'section v2-decision';
    routes.after(section);
  }
  section.innerHTML = `
    <div class="section-head compact">
      <p class="eyebrow">${en ? 'Decision layer' : 'Маршрутизатор решения'}</p>
      <h2>${en ? 'See the format before you contact me' : 'Поймите формат до первого контакта'}</h2>
      <p class="sub">${en ? 'Choose the closest scenario. You will immediately see the minimum input, expected output and practical next step.' : 'Выберите ближайший сценарий. Сразу видны входные данные, ожидаемый результат и практический следующий шаг.'}</p>
    </div>
    <div class="v2-path-tabs" role="tablist" aria-label="${en ? 'Ways to work' : 'Форматы работы'}">
      ${paths.map((p,i)=>`<button type="button" role="tab" class="v2-path-tab${i===0?' active':''}" aria-selected="${i===0}" data-v2-path="${p.id}"><span>${p.n}</span>${esc(p.tab)}</button>`).join('')}
    </div>
    <article class="v2-path-panel" id="v2-path-panel" aria-live="polite"></article>`;

  const renderPath = (id, scroll = false) => {
    const path = paths.find((p) => p.id === id) || paths[0];
    section.querySelectorAll('.v2-path-tab').forEach((b) => {
      const active = b.dataset.v2Path === path.id;
      b.classList.toggle('active', active);
      b.setAttribute('aria-selected', String(active));
    });
    $('#v2-path-panel').innerHTML = `
      <div class="v2-path-copy">
        <span class="v2-route-meta">${path.n} / ${esc(path.kicker)}</span>
        <h3>${esc(path.title)}</h3>
        <p>${esc(path.body)}</p>
        <button class="btn btn-primary" type="button" data-v2-prepare="${path.id}">${en ? 'Prepare an enquiry' : 'Подготовить обращение'} →</button>
      </div>
      <div class="v2-path-columns">
        <section><h4>${en ? 'Best fit when' : 'Когда подходит'}</h4><ul>${path.when.map((x)=>`<li>${esc(x)}</li>`).join('')}</ul></section>
        <section><h4>${en ? 'Minimum input' : 'Что понадобится'}</h4><ul>${path.need.map((x)=>`<li>${esc(x)}</li>`).join('')}</ul></section>
        <section><h4>${en ? 'What you get' : 'Что получите'}</h4><ul>${path.gets.map((x)=>`<li>${esc(x)}</li>`).join('')}</ul></section>
      </div>`;
    try { sessionStorage.setItem('syntha_v2_path', path.id); } catch {}
    if (scroll) section.scrollIntoView({behavior:'smooth',block:'start'});
  };

  if (!section.dataset.bound) {
    section.dataset.bound = '1';
    section.addEventListener('click', (e) => {
      const tab = e.target.closest('.v2-path-tab');
      if (tab) renderPath(tab.dataset.v2Path);
      const prepare = e.target.closest('[data-v2-prepare]');
      if (!prepare) return;
      const path = paths.find((p) => p.id === prepare.dataset.v2Prepare) || paths[0];
      const topic = $('#topic');
      if (topic && [...topic.options].some((o) => o.value === path.topic)) {
        topic.value = path.topic;
        topic.dispatchEvent(new Event('change', {bubbles:true}));
      }
      const message = $('#form [name="message"]');
      if (message && !message.value.trim()) message.value = path.prompt;
      $('#form')?.dispatchEvent(new Event('input', {bubbles:true}));
      $('#contact')?.scrollIntoView({behavior:'smooth',block:'start'});
      setTimeout(() => $('#form [name="name"]')?.focus({preventScroll:true}), 450);
    });
  }

  if (!routes.dataset.decisionBound) {
    routes.dataset.decisionBound = '1';
    routes.addEventListener('click', (e) => {
      const card = e.target.closest('.v2-route');
      if (!card) return;
      const cards = [...routes.querySelectorAll('.v2-route')];
      const idx = cards.indexOf(card);
      const id = idx === 0 ? 'consulting' : idx === 1 ? 'pilot' : 'partnership';
      e.preventDefault();
      renderPath(id, true);
    });
  }

  let remembered = null;
  try { remembered = sessionStorage.getItem('syntha_v2_path'); } catch {}
  renderPath(paths.some((p)=>p.id===remembered) ? remembered : paths[0].id);

  if (!$('#v2-draft')) {
    const draft = document.createElement('button');
    draft.type = 'button';
    draft.className = 'btn v2-draft';
    draft.id = 'v2-draft';
    $('#submit')?.after(draft);
    draft.addEventListener('click', () => {
      const form = $('#form');
      if (!form) return;
      const data = new FormData(form);
      const selected = paths.find((p)=>p.topic===String(data.get('topic')||''));
      const method = $('#v2-contact-method')?.value || 'email';
      const value = method === 'email' ? data.get('email') : method === 'telegram' ? data.get('telegram') : data.get('phone');
      const lines = en ? [
        'SYNTHA.PRO · V2 ENQUIRY DRAFT',
        `Scenario: ${selected?.tab || data.get('topic') || '—'}`,
        `Name: ${data.get('name') || '—'}`,
        `Contact (${method}): ${value || '—'}`,
        `Message: ${data.get('message') || '—'}`,
        '',
        'Preview only: this file was generated in the browser and was not sent.'
      ] : [
        'SYNTHA.PRO · ЧЕРНОВИК ОБРАЩЕНИЯ V2',
        `Сценарий: ${selected?.tab || data.get('topic') || '—'}`,
        `Имя: ${data.get('name') || '—'}`,
        `Контакт (${method}): ${value || '—'}`,
        `Сообщение: ${data.get('message') || '—'}`,
        '',
        'Только режим просмотра: файл сформирован в браузере и никуда не отправлен.'
      ];
      const blob = new Blob([lines.join('\n')], {type:'text/plain;charset=utf-8'});
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = en ? 'syntha-v2-enquiry.txt' : 'syntha-v2-brief.txt';
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    });
  }
  $('#v2-draft').textContent = en ? 'Download text brief' : 'Скачать текстовый бриф';
}


/* V2.2 portfolio intelligence */
const V2_PORTFOLIO_META = {"syntha":{"cats":["fashion"],"maturity":"pilot","commercial":{"ru":"Пилот → коммерческая модель фиксируется по результатам валидации","en":"Pilot → commercial model fixed after validation"}},"chatx":{"cats":["enterprise"],"maturity":"mvp","commercial":{"ru":"Пилот в компании → условия внедрения после валидации","en":"Company pilot → rollout terms after validation"}},"renova":{"cats":["consumer"],"maturity":"mvp","commercial":{"ru":"Закрытый тест → модель выхода на рынок после валидации","en":"Closed test → market model after validation"}},"mfw":{"cats":["events","fashion"],"maturity":"mvp","commercial":{"ru":"Демо организаторам → пилот / партнёрская модель","en":"Organiser demo → pilot / partnership model"}},"promomed":{"cats":["events"],"maturity":"mvp","commercial":{"ru":"Демо заказчику → коммерческий формат после согласования пилота","en":"Client demo → commercial format after pilot agreement"}}};
const V2_PORTFOLIO_CATEGORIES = {"ru":[["all","Все"],["fashion","Fashion"],["enterprise","Enterprise"],["events","Events"],["consumer","Consumer"],["fintech","Fintech"],["art","Art"],["infrastructure","Infrastructure"]],"en":[["all","All"],["fashion","Fashion"],["enterprise","Enterprise"],["events","Events"],["consumer","Consumer"],["fintech","Fintech"],["art","Art"],["infrastructure","Infrastructure"]]};
const V2_MATURITY = {"ru":{"concept":"Concept","mvp":"MVP","pilot":"Pilot-ready","production":"Production"},"en":{"concept":"Concept","mvp":"MVP","pilot":"Pilot-ready","production":"Production"}};
function renderPortfolioIntelligence(lang, $, projects) {
  const en = lang === 'en';
  const items = Array.isArray(projects) ? projects.filter((p) => p?.id && p?.[lang]) : [];
  const meta = V2_PORTFOLIO_META;
  const categories = V2_PORTFOLIO_CATEGORIES[en ? 'en' : 'ru'];
  const maturityLabels = V2_MATURITY[en ? 'en' : 'ru'];
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (ch) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const short = (s, max = 185) => {
    const text = String(s ?? '').trim();
    if (text.length <= max) return text;
    const cut = text.slice(0, max);
    return cut.slice(0, Math.max(cut.lastIndexOf(' '), 120)).trim() + '…';
  };
  const getMeta = (p) => meta[p.id] || { cats: [], maturity: 'concept', commercial: { ru: 'Коммерческая модель не опубликована', en: 'Commercial model not published' } };
  const usedCategories = new Set(items.flatMap((p) => getMeta(p).cats));
  const counts = Object.fromEntries(categories.map(([id]) => [id, id === 'all' ? items.length : items.filter((p) => getMeta(p).cats.includes(id)).length]));
  const maturityCounts = ['concept','mvp','pilot','production'].map((id) => [id, items.filter((p) => getMeta(p).maturity === id).length]);

  let section = $('#v2-portfolio');
  const projectsSection = $('#projects');
  if (!section) {
    section = document.createElement('section');
    section.id = 'v2-portfolio';
    section.className = 'section v2-portfolio';
    projectsSection?.before(section);
  }
  if (!section) return;

  section.innerHTML = `
    <div class="section-head">
      <p class="eyebrow">${en ? 'Portfolio intelligence' : 'Portfolio Intelligence'}</p>
      <h2>${en ? 'The portfolio as a system, not a list' : 'Портфель как система, а не длинный список'}</h2>
      <p class="sub">${en
        ? 'Filter by market, see maturity at a glance and move directly from a product to a pilot, partnership or investment conversation.'
        : 'Фильтр по рынкам, зрелость с первого взгляда и прямой переход от проекта к пилоту, партнёрству или инвестиционному диалогу.'}</p>
    </div>
    <div class="v2-portfolio-summary" aria-label="${en ? 'Portfolio summary' : 'Сводка портфеля'}">
      <div><strong>${items.length}</strong><span>${en ? 'published products' : 'проектов опубликовано'}</span></div>
      <div><strong>${usedCategories.size}</strong><span>${en ? 'active sectors' : 'активных направления'}</span></div>
      <div class="v2-maturity-strip">
        ${maturityCounts.map(([id,count])=>`<span class="v2-maturity-point${count?' active':''}"><i>${count}</i>${maturityLabels[id]}</span>`).join('')}
      </div>
    </div>
    <div class="v2-portfolio-filters" role="group" aria-label="${en ? 'Portfolio sectors' : 'Направления портфеля'}">
      ${categories.map(([id,label],i)=>{
        const count=counts[id]||0, disabled=id!=='all' && count===0;
        return `<button type="button" class="v2-filter${i===0?' active':''}" data-v2-filter="${id}" aria-pressed="${i===0}" ${disabled?'disabled':''}>
          <span>${esc(label)}</span><b>${count}</b>${disabled?`<small>${en?'not published':'не опубликовано'}</small>`:''}
        </button>`;
      }).join('')}
    </div>
    <div class="v2-portfolio-grid" id="v2-portfolio-grid"></div>
    <p class="v2-portfolio-note">${en
      ? 'Fintech, Art and Infrastructure are intentionally not populated here until those products are formally published in this showcase.'
      : 'Fintech, Art и Infrastructure намеренно не заполнены: я не добавляю туда проекты, пока они формально не опубликованы в этой витрине.'}</p>`;

  const renderGrid = (filter = 'all') => {
    const visible = items.filter((p) => filter === 'all' || getMeta(p).cats.includes(filter));
    const grid = $('#v2-portfolio-grid');
    if (!grid) return;
    grid.innerHTML = visible.map((p) => {
      const d = p[lang], m = getMeta(p);
      const catLabels = m.cats.map((id) => categories.find((x) => x[0] === id)?.[1] || id);
      return `<article class="v2-product" data-v2-product="${esc(p.id)}">
        <div class="v2-product-top">
          <div>
            <div class="v2-product-cats">${catLabels.map((x)=>`<span>${esc(x)}</span>`).join('')}</div>
            <h3>${esc(p.name)}</h3>
          </div>
          <span class="v2-stage v2-stage-${esc(m.maturity)}">${esc(maturityLabels[m.maturity] || m.maturity)}</span>
        </div>
        <p class="v2-product-tag">${esc(d.tagline)}</p>
        <dl class="v2-product-data">
          <div><dt>${en ? 'Audience' : 'Аудитория'}</dt><dd>${esc(short(d.who, 210))}</dd></div>
          <div><dt>${en ? 'Current stage' : 'Текущая стадия'}</dt><dd>${esc(d.stage)}</dd></div>
          <div><dt>${en ? 'Monetisation' : 'Монетизация'}</dt><dd>${esc(m.commercial[en ? 'en' : 'ru'])}</dd></div>
        </dl>
        <div class="v2-product-actions">
          <button type="button" class="btn btn-sm btn-primary" data-v2-open="${esc(p.id)}">${en ? 'Open product' : 'Открыть проект'}</button>
          <button type="button" class="btn btn-sm" data-v2-talk="launch" data-v2-id="${esc(p.id)}">${en ? 'Discuss pilot' : 'Обсудить пилот'}</button>
          <button type="button" class="btn btn-sm" data-v2-talk="partnership" data-v2-id="${esc(p.id)}">${en ? 'Partnership' : 'Партнёрство'}</button>
          <button type="button" class="btn btn-sm" data-v2-talk="investors" data-v2-id="${esc(p.id)}">${en ? 'Investment' : 'Инвестиции'}</button>
        </div>
      </article>`;
    }).join('');
  };

  if (!section.dataset.boundPortfolio) {
    section.dataset.boundPortfolio = '1';
    section.addEventListener('click', (e) => {
      const filter = e.target.closest('[data-v2-filter]');
      if (filter && !filter.disabled) {
        section.querySelectorAll('[data-v2-filter]').forEach((b) => {
          const active = b === filter;
          b.classList.toggle('active', active);
          b.setAttribute('aria-pressed', String(active));
        });
        renderGrid(filter.dataset.v2Filter);
        try { sessionStorage.setItem('syntha_v2_portfolio_filter', filter.dataset.v2Filter); } catch {}
        return;
      }
      const open = e.target.closest('[data-v2-open]');
      if (open) {
        const target = document.querySelector(`#cards [data-open="${CSS.escape(open.dataset.v2Open)}"]`);
        if (target) target.click();
        else {
          const card = document.querySelector(`#cards [data-project="${CSS.escape(open.dataset.v2Open)}"]`);
          card?.scrollIntoView({behavior:'smooth',block:'center'});
        }
        return;
      }
      const talk = e.target.closest('[data-v2-talk]');
      if (!talk) return;
      const p = items.find((x) => x.id === talk.dataset.v2Id);
      const topic = $('#topic');
      if (topic && [...topic.options].some((o) => o.value === talk.dataset.v2Talk)) {
        topic.value = talk.dataset.v2Talk;
        topic.dispatchEvent(new Event('change', {bubbles:true}));
      }
      const message = $('#form [name="message"]');
      if (message && !message.value.trim() && p) {
        const action = talk.dataset.v2Talk;
        const text = en
          ? action === 'launch' ? `I would like to discuss a pilot for ${p.name}: scope, acceptance criteria and next milestone.`
          : action === 'partnership' ? `I would like to discuss a partnership around ${p.name}: contribution, commercial mechanics and first joint case.`
          : `I would like to discuss investment in ${p.name}: current maturity, next de-risking milestone and use of capital.`
          : action === 'launch' ? `Хочу обсудить пилот ${p.name}: границы, критерии приёмки и следующий milestone.`
          : action === 'partnership' ? `Хочу обсудить партнёрство вокруг ${p.name}: вклад сторон, коммерческую механику и первый совместный кейс.`
          : `Хочу обсудить инвестиции в ${p.name}: текущую зрелость, следующий de-risking milestone и использование капитала.`;
        message.value = text;
      }
      $('#form')?.dispatchEvent(new Event('input', {bubbles:true}));
      $('#contact')?.scrollIntoView({behavior:'smooth',block:'start'});
    });
  }

  let saved = 'all';
  try { saved = sessionStorage.getItem('syntha_v2_portfolio_filter') || 'all'; } catch {}
  const savedBtn = section.querySelector(`[data-v2-filter="${CSS.escape(saved)}"]`);
  if (!savedBtn || savedBtn.disabled) saved = 'all';
  section.querySelectorAll('[data-v2-filter]').forEach((b) => {
    const active = b.dataset.v2Filter === saved;
    b.classList.toggle('active', active);
    b.setAttribute('aria-pressed', String(active));
  });
  renderGrid(saved);

  if ($('#projects-title')) $('#projects-title').textContent = en ? 'Detailed project dossiers' : 'Подробные карточки проектов';
  if ($('#projects-sub')) $('#projects-sub').textContent = en
    ? 'The full project descriptions remain below: status, product logic, participation formats and detailed evidence.'
    : 'Ниже сохранены полные карточки: стадия, логика продукта, варианты участия и подробности по каждому проекту.';
}

export function renderV2(lang, projects = []) {
  const en = lang === 'en';
  document.documentElement.dataset.preview = 'v2';
  const $ = (s) => document.querySelector(s);
  if (!$('#v2-banner')) {
    const bar = document.createElement('aside'); bar.id = 'v2-banner';
    document.body.prepend(bar);
  }
  $('#v2-banner').innerHTML = `<span>V2 · ${en ? 'Preview for comparison' : 'Версия для сравнения'}</span><a href="https://syntha.pro/${en ? 'en/' : ''}" target="_blank" rel="noopener">${en ? 'Open current version ↗' : 'Открыть текущую версию ↗'}</a>`;
  if (!$('#v2-headline')) {
    const h = document.createElement('h2'); h.id = 'v2-headline';
    $('.hero-id').after(h);
  }
  $('#v2-headline').textContent = en ? 'Profit, inventory and growth. Decisions grounded in economics.' : 'Прибыль, запасы и рост. Решения на основе экономики.';
  $('#hero-lead').textContent = en ? 'I help fashion businesses connect buying, products, sales and cash — and turn the findings into working processes and digital tools.' : 'Помогаю фэшн-бизнесу связать закупку, продукт, продажи и деньги — и перевести выводы в рабочие процессы и цифровые инструменты.';
  $('#cta-contact').textContent = en ? 'Discuss your challenge' : 'Обсудить задачу';
  $('#cta-contact').classList.add('btn-primary'); $('#cta-consulting').classList.remove('btn-primary');
  if (!$('#v2-routes')) {
    const section = document.createElement('section'); section.id = 'v2-routes'; section.className = 'section v2-routes';
    $('.hero').after(section);
  }
  const routes = en ? [
    ['01','For your business','Advisory','Buying, profitability, working capital and management decisions.','Explore services','#consulting'],
    ['02','For your product','Products & development','Own products, working prototypes and formats for building together.','Explore the portfolio','#projects'],
    ['03','For a shared opportunity','Partnership','Pilots, strategic collaboration and investment discussions.','Explore ways to work together','#investors']
  ] : [
    ['01','Для вашего бизнеса','Консалтинг','Закупка, прибыльность, оборотный капитал и управленческие решения.','Выбрать формат работы','#consulting'],
    ['02','Для вашего продукта','Проекты и разработка','Собственные продукты, рабочие прототипы и форматы совместного запуска.','Посмотреть весь портфель','#projects'],
    ['03','Для совместного развития','Партнёрство','Пилоты, стратегическое сотрудничество и обсуждение инвестиций.','Посмотреть варианты участия','#investors']
  ];
  $('#v2-routes').innerHTML = `<p class="eyebrow">${en ? 'Where shall we start?' : 'С чего начнём?'}</p><div class="v2-route-grid">${routes.map(r=>`<a class="v2-route" href="${r[5]}"><span class="v2-route-meta">${r[0]} / ${r[1]}</span><h3>${r[2]}</h3><p>${r[3]}</p><span class="v2-route-action">${r[4]} →</span></a>`).join('')}</div>`;
  installDecisionLayer(lang, $);
  renderPortfolioIntelligence(lang, $, projects);
  if (!$('#v2-steps')) {
    const section = document.createElement('section'); section.id = 'v2-steps'; section.className = 'section v2-steps';
    $('#contact').before(section);
  }
  const steps = en ? [['Your challenge','Describe the situation and the outcome you need.'],['Scope of work','We clarify the data, constraints, deliverables and terms.'],['A clear next step','Agree the format and acceptance criteria before starting.']] : [['Ваша задача','Расскажите о ситуации и результате, который вам нужен.'],['Границы работы','Уточним данные, ограничения, состав результата и условия.'],['Понятный следующий шаг','Согласуем формат и критерии результата до начала работы.']];
  $('#v2-steps').innerHTML = `<div class="section-head"><h2>${en ? 'How we start' : 'Как начинается работа'}</h2></div><div class="v2-step-grid">${steps.map((s,i)=>`<article><span class="svc-n">0${i+1}</span><h3>${s[0]}</h3><p>${s[1]}</p></article>`).join('')}</div>`;
  $('#contact-sub').textContent = en ? 'Your name, one way to reach you and a few words about your challenge are enough to start.' : 'Для начала достаточно имени, одного способа связи и нескольких слов о задаче.';
  if (!$('#v2-contact-method')) {
    const label = document.createElement('label'); label.className = 'field'; label.id = 'v2-method-field';
    label.innerHTML = '<span></span><select id="v2-contact-method"><option value="email">Email</option><option value="telegram">Telegram</option><option value="phone"></option></select>';
    $('#email').closest('label').before(label);
    const setMethod = () => {
      const method = $('#v2-contact-method').value;
      $('#opt-telegram').checked = method === 'telegram';
      $('#opt-phone').checked = method === 'phone';
      $('#opt-telegram').dispatchEvent(new Event('change'));
      $('#email').closest('label').hidden = method !== 'email';
      if (method !== 'email') $('#email').value = '';
      $('#form').dispatchEvent(new Event('input'));
    };
    $('#v2-contact-method').addEventListener('change', setMethod);
    setMethod();
    $('#opt-telegram').closest('.opt-row').hidden = true;
  }
  $('#v2-method-field > span').textContent = en ? 'How can I reach you?' : 'Как с вами связаться?';
  $('#v2-contact-method option[value="phone"]').textContent = en ? 'Phone' : 'Телефон';
  if (!$('#v2-form-note')) {
    const note = document.createElement('p'); note.id = 'v2-form-note'; note.className = 'v2-preview-note'; $('#form').prepend(note);
  }
  $('#v2-form-note').textContent = en ? 'Preview mode: the form validates your input but does not send or save an enquiry. Direct contact links remain available.' : 'Режим просмотра: форма проверяет заполнение, но не отправляет и не сохраняет заявку. Для реального обращения доступны прямые контакты.';
  $('#submit').textContent = en ? 'Check enquiry · preview' : 'Проверить заявку · просмотр';
  document.querySelectorAll('#turnstile-widget').forEach(el => el.replaceChildren());
  const barLink = $('#cta-bar a');
  if (barLink) {barLink.textContent = en ? 'Discuss a challenge' : 'Обсудить задачу';}
}
