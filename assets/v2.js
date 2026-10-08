import './v2-product-refresh.js';
/* Isolated V2 presentation; original content and project registry are preserved. */
const V2_PATHS = {"ru":[{"id":"consulting","n":"01","tab":"Консалтинг","kicker":"Экономика и управление","title":"Нужно улучшить прибыль, запасы или управляемость бизнеса","body":"Разбираем экономику решения, товарный цикл, каналы, оборотный капитал и управленческие ограничения. Результат — решение, которое можно внедрять, а не отчёт на полке.","when":["маржа или денежный поток не сходятся","остатки и закупка требуют пересборки","решение нужно принять на данных"],"need":["управленческие данные и ограничения","контекст решения и сроки","критерий, по которому задача считается решённой"],"gets":["диагностика и приоритеты","модель решения и экономика","план внедрения с контрольными точками"],"topic":"consulting","prompt":"Коротко опишите бизнес-задачу, что сейчас не устраивает и какой результат нужен."},{"id":"pilot","n":"02","tab":"Пилот продукта","kicker":"Продукт и разработка","title":"Нужно проверить цифровой продукт на реальном бизнес-сценарии","body":"Выбираем один измеримый ключевой сценарий, ограничиваем объём пилота и заранее фиксируем критерии успеха и остановки. Так продукт проверяется в реальной работе, а не только на демонстрации.","when":["есть процесс, который можно оцифровать","гипотезу нужно проверить до большого внедрения","важен измеримый результат пилота"],"need":["описание текущего процесса","владелец процесса и тестовый контур","данные или примеры для одного ключевого сценария"],"gets":["границы пилота и критерии приёмки","рабочий сценарий / прототип","подтверждение результата и решение о следующем этапе"],"topic":"launch","prompt":"Опишите процесс или задачу, которую хотите проверить в пилоте, и что должно измениться после него."},{"id":"partnership","n":"03","tab":"Партнёрство","kicker":"Совместный рост","title":"Есть актив, компетенция или рынок, которые можно соединить","body":"Сначала определяем взаимный вклад, коммерческую механику и ответственность сторон. Затем — ограниченный совместный кейс, где ценность можно подтвердить цифрами.","when":["есть доступ к клиентам, данным или инфраструктуре","нужна совместная коммерческая модель","интересен co-development или distribution"],"need":["что каждая сторона реально вносит","какой клиентский сценарий создаём вместе","как измеряется общий результат"],"gets":["карта ролей и вкладов","модель value / revenue sharing","план первого совместного кейса"],"topic":"partnership","prompt":"Опишите, что вы предлагаете как партнёр и какой совместный результат считаете ценным."},{"id":"investment","n":"04","tab":"Инвестиции","kicker":"Капитал и масштабирование","title":"Нужно обсудить инвестиции в конкретный продукт или портфель","body":"Разговор строится вокруг продукта, текущей стадии, модели монетизации, следующего этапа снижения риска и конкретного назначения капитала.","when":["интересен один из действующих проектов","нужен понятный путь от капитала к измеримому этапу","важны экономика, риски и подтверждения"],"need":["интересующий продукт или направление","инвестиционный горизонт и формат участия","ключевые требования к риску и доходности"],"gets":["структурированный инвестиционный диалог","карта этап → капитал → подтверждение","следующий шаг по проверке / пилоту / партнёрству"],"topic":"investors","prompt":"Укажите проект или направление, формат интереса и что вы хотите проверить перед следующим шагом."}],"en":[{"id":"consulting","n":"01","tab":"Advisory","kicker":"Economics & management","title":"Improve profit, inventory or management visibility","body":"We connect the economics of the decision with merchandise, channels, working capital and operating constraints. The output is an implementable decision, not a report that sits on a shelf.","when":["margin or cash conversion is under pressure","buying and inventory need to be redesigned","the decision must be grounded in data"],"need":["management data and constraints","decision context and timeline","a clear acceptance criterion"],"gets":["diagnosis and priorities","decision model and economics","implementation plan with control points"],"topic":"consulting","prompt":"Briefly describe the business problem, what is not working today and the outcome you need."},{"id":"pilot","n":"02","tab":"Product pilot","kicker":"Product & development","title":"Test a digital product on a real business workflow","body":"We select one measurable Golden Path, limit the pilot scope and define PASS / FAIL criteria upfront. The product is tested in operation, not only in a demo.","when":["a workflow can be digitised","a hypothesis should be tested before a large rollout","the pilot needs a measurable outcome"],"need":["current workflow description","a process owner and test environment","sample data for one Golden Path"],"gets":["pilot scope and acceptance criteria","working workflow / prototype","result evidence and a go / no-go decision"],"topic":"launch","prompt":"Describe the workflow you want to test and what should improve after the pilot."},{"id":"partnership","n":"03","tab":"Partnership","kicker":"Joint growth","title":"Combine assets, capabilities or market access","body":"We first define each side’s contribution, commercial mechanics and accountability. Then we structure a limited joint case where value can be proven with evidence.","when":["you bring clients, data or infrastructure","a joint commercial model is needed","co-development or distribution is relevant"],"need":["what each side contributes","the customer workflow we create together","how joint value will be measured"],"gets":["roles and contribution map","value / revenue-sharing model","plan for the first joint case"],"topic":"partnership","prompt":"Describe what you bring as a partner and the joint outcome you would consider valuable."},{"id":"investment","n":"04","tab":"Investment","kicker":"Capital & scale","title":"Discuss capital for a specific product or portfolio","body":"The discussion is structured around the product, maturity, monetisation, the next de-risking milestone and the exact use of capital.","when":["one of the active products is relevant","capital must map to a measurable milestone","economics, risk and evidence matter"],"need":["product or area of interest","investment horizon and participation format","key risk / return requirements"],"gets":["structured investment dialogue","milestone → capital → evidence map","next diligence / pilot / partnership step"],"topic":"investors","prompt":"Name the product or area, your preferred format and what you need to verify before the next step."}]};

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

  if (!section.__v2DecisionBound) {
    section.__v2DecisionBound = '1';
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

  if (!routes.__v2DecisionRouteBound) {
    routes.__v2DecisionRouteBound = '1';
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
  $('#v2-draft').textContent = en ? 'Download text brief' : 'Скачать описание обращения';
}


/* V2.2 portfolio intelligence */
const V2_PORTFOLIO_META = {"syntha":{"cats":["fashion"],"maturity":"pilot","commercial":{"ru":"Пилот → коммерческая модель фиксируется по результатам проверки","en":"Pilot → commercial model fixed after validation"}},"chatx":{"cats":["enterprise"],"maturity":"mvp","commercial":{"ru":"Пилот в компании → условия внедрения после проверки","en":"Company pilot → rollout terms after validation"}},"renova":{"cats":["consumer"],"maturity":"mvp","commercial":{"ru":"Закрытый тест → модель выхода на рынок после проверки","en":"Closed test → market model after validation"}},"mfw":{"cats":["events","fashion"],"maturity":"pilot","commercial":{"ru":"Pilot-ready preview → реальное событие → партнёрская / лицензионная модель","en":"Pilot-ready preview → real event → partnership / licensing model"}},"promomed":{"cats":["events"],"maturity":"pilot","commercial":{"ru":"Live v1.4 → controlled pilot → коммерческий формат после evidence","en":"Live v1.4 → controlled pilot → commercial format after evidence"}},"antiqua":{"cats":["art"],"maturity":"pilot","commercial":{"ru":"Gallery / institution pilot → professional / research model after evidence","en":"Gallery / institution pilot → professional / research model after evidence"}},"fashionmgmt":{"cats":["fashion","enterprise"],"maturity":"pilot","commercial":{"ru":"Controlled enterprise rollout → acceptance metrics → licence / implementation terms","en":"Controlled enterprise rollout → acceptance metrics → licence / implementation terms"},"confidential":true},"furproduction":{"cats":["fashion","enterprise"],"maturity":"pilot","commercial":{"ru":"Controlled production use → inventory/cost acceptance → vertical ERP rollout terms","en":"Controlled production use → inventory/cost acceptance → vertical ERP rollout terms"},"confidential":true}};
const V2_PORTFOLIO_CATEGORIES = {"ru":[["all","Все"],["fashion","Мода"],["enterprise","Корпоративные"],["events","События"],["consumer","Потребительские"],["fintech","Финтех"],["art","Искусство"],["infrastructure","Инфраструктура"]],"en":[["all","All"],["fashion","Fashion"],["enterprise","Enterprise"],["events","Events"],["consumer","Consumer"],["fintech","Fintech"],["art","Art"],["infrastructure","Infrastructure"]]};
const V2_MATURITY = {"ru":{"concept":"Концепция","mvp":"MVP","pilot":"Готов к пилоту","production":"В эксплуатации"},"en":{"concept":"Concept","mvp":"MVP","pilot":"Pilot-ready","production":"Production"}};

/* V2.12 investor first-screen priority */
const V2_INVESTOR_PRIORITY = {"syntha":{"ru":{"matters":"Fashion-бизнес теряет скорость и маржу, когда продукт, заказ, поставка и экономика живут в разных системах и таблицах.","now":"Product/commercial core уже собран; EntityThread и Decision Ledger доказаны на PostgreSQL — следующий шаг уже не разработка, а реальный сезон.","economic":"Проверяемый рычаг: меньше ручной сверки, быстрее подтверждение заказа, меньше расхождений по цене, себестоимости и марже.","next":"Один бренд должен провести реальный сезонный контур без критичного возврата к параллельным таблицам и показать измеримый выигрыш."},"en":{"matters":"Fashion businesses lose speed and margin when product, order, supply and economics live across disconnected systems and spreadsheets.","now":"The product/commercial core is built; EntityThread and Decision Ledger are PostgreSQL-proven, so the next step is a real season rather than more feature work.","economic":"Testable lever: less manual reconciliation, faster order confirmation and fewer price, cost and margin discrepancies.","next":"One brand must run a real seasonal workflow without critical fallback to parallel spreadsheets and show measurable advantage."}},"chatx":{"ru":{"matters":"Компания теряет время и ответственность, когда разговор, решение, задача, встреча и результат распадаются между разными сервисами.","now":"RBAC, Requests/Approvals, commitment lifecycle и human-confirmed Meeting Intelligence уже сведены в единый управляемый контур.","economic":"Проверяемый рычаг: меньше ручного переноса между сервисами, быстрее переход от решения к исполнению и меньше потерянного контекста.","next":"Ограниченная команда должна использовать ChatX как основной рабочий цикл и подтвердить ежедневное использование, traceability и security/admin acceptance."},"en":{"matters":"Companies lose time and accountability when conversation, decision, task, meeting and outcome are split across tools.","now":"RBAC, Requests/Approvals, commitment lifecycle and human-confirmed Meeting Intelligence are now connected in one governed workflow.","economic":"Testable lever: less manual transfer between tools, faster decision-to-execution flow and less lost context.","next":"A bounded team must use ChatX as its primary work loop and evidence daily use, traceability and security/admin acceptance."}},"renova":{"ru":{"matters":"В ремонте деньги и сроки теряются там, где смета, изменения, этапы, документы и приёмка ведутся разрозненно и спор восстанавливается по переписке.","now":"Estimate, stages, change orders, acceptance, документы и payment states уже сведены в один audit/closure contour — пора проверять на реальном объекте.","economic":"Проверяемый рычаг: раньше видеть отклонение бюджета, быстрее закрывать этапы, снижать ручную сверку и стоимость спорных состояний.","next":"Заказчик и исполнитель должны провести один реальный объект через estimate → work → evidence → acceptance/payment без критичного параллельного учёта."},"en":{"matters":"Renovation loses money and time when estimates, changes, stages, documents and acceptance are fragmented and disputes must be reconstructed from chat.","now":"Estimate, stages, change orders, acceptance, documents and payment states now share one audit/closure contour and are ready for a real-project test.","economic":"Testable lever: earlier budget-variance visibility, faster stage closure, less manual reconciliation and lower dispute-handling cost.","next":"Client and contractor must run one real project through estimate → work → evidence → acceptance/payment without critical parallel tracking."}},"mfw":{"ru":{"matters":"Событие создаёт дорогую аудиторию и B2B-контакты, но без единого цифрового слоя их ценность часто обрывается вместе с последним днём мероприятия.","now":"MFW/BFS/Made собраны в единой платформе; monitor/tablet/phone hardened, Capital Authority fail-closed. Остался конкретный production gate — PostgreSQL `/ready`.","economic":"Проверяемый рычаг: больше активации и фактических посещений, больше подтверждённых B2B-лидов и повторного brand engagement между сезонами.","next":"Сначала должен стать green production admission, затем одно реальное событие обязано показать устойчивость под нагрузкой и измеримый organiser/brand/partner outcome."},"en":{"matters":"Events create expensive audiences and B2B relationships, yet their value often disappears when the event ends without one digital continuity layer.","now":"MFW/BFS/Made are assembled in one platform; monitor/tablet/phone are hardened and Capital Authority fails closed. The remaining production gate is PostgreSQL `/ready`.","economic":"Testable lever: higher activation and attendance, more verified B2B leads and repeat brand engagement between seasons.","next":"Production admission must turn green first; then one real event must prove load stability and measurable organiser/brand/partner outcomes."}},"promomed":{"ru":{"matters":"Отраслевая конференция быстро теряет ценность, если контакт с участником, партнёром и экспертным контентом не превращается в проверяемый долгосрочный контур.","now":"External Verification Interoperability v1 уже даёт issuer lifecycle, Ed25519 verification, status lists и immutable signed checkpoints — controlled pilot теперь можно проверять, а не просто показывать.","economic":"Проверяемый рычаг: выше conversion registration→attendance, качественнее партнёрские лиды, больше post-event возврата к материалам и взаимодействию.","next":"Controlled pilot должен породить валидируемые evidence artifacts и одновременно показать реальную ценность для участника, партнёра и организатора."},"en":{"matters":"An industry conference loses value quickly if participant, partner and expert-content relationships do not become a verifiable long-term operating layer.","now":"External Verification Interoperability v1 now provides issuer lifecycle, Ed25519 verification, status lists and immutable signed checkpoints, making a controlled pilot auditable rather than merely presentable.","economic":"Testable lever: higher registration→attendance conversion, better partner-lead quality and more post-event return to content and engagement.","next":"The controlled pilot must produce verifiable evidence artifacts while also proving real value for participants, partners and the organiser."}},"antiqua":{"ru":{"matters":"Ценность искусства теряется, когда произведение сведено к картинке и цене, а автор, provenance, related works, коллекции и исследовательский контекст живут отдельно.","now":"Gallery-first core, Artwork→Artist→Related Works, Collections→Taste и research-trust boundaries уже собраны; следующий шаг — реальные произведения и институциональный workflow.","economic":"Проверяемый рычаг: глубже discovery, выше повторный возврат к коллекциям, быстрее подготовка research/institutional materials и потенциально платные professional services.","next":"Production admission и real-art pilot должны доказать record quality, provenance/research coverage, retention и профессиональную ценность без смешения expertise с promotion."},"en":{"matters":"Art loses value when a work is reduced to image and price while artist, provenance, related works, collections and research context remain fragmented.","now":"The gallery-first core, Artwork→Artist→Related Works, Collections→Taste and research-trust boundaries are built; the next step is real artworks and institutional workflow.","economic":"Testable lever: deeper discovery, more repeat collection engagement, faster research/institutional preparation and potential paid professional services.","next":"Production admission plus a real-art pilot must prove record quality, provenance/research coverage, retention and professional value without conflating expertise with promotion."}},"fashionmgmt":{"ru":{"matters":"В fashion-производстве маржа и срок становятся видны слишком поздно, если заказ, операции, материалы, ставки, платежи и ДДС живут в разных таблицах.","now":"Working enterprise core уже связывает product/order/production, Plan/Fact/CTC/Forecast, WIP/capacity, 13-недельную ликвидность, month close и audit.","economic":"Проверяемый рычаг: меньше ручной сверки, раньше bottleneck/late-risk, быстрее cost/CTC signal и короче управленческий цикл закрытия месяца.","next":"Controlled rollout должен доказать, что реальный order→production→cost→cash/close проходит в системе без критичной параллельной таблицы."},"en":{"matters":"In fashion production, margin and deadline become visible too late when orders, operations, materials, rates, payments and cash flow live in separate spreadsheets.","now":"The working enterprise core already connects product/order/production, Plan/Actual/CTC/Forecast, WIP/capacity, 13-week liquidity, month close and audit.","economic":"Testable lever: less manual reconciliation, earlier bottleneck/late-risk visibility, faster cost/CTC signals and a shorter month-close decision cycle.","next":"A controlled rollout must prove the real order→production→cost→cash/close flow can run in-system without a critical parallel spreadsheet."}},"furproduction":{"ru":{"matters":"При дорогом неоднородном сырье одна неверная связь между закупкой, лотом, списанием и изделием искажает и остаток, и фактическую себестоимость.","now":"Procurement→specific lot→stock→production→finished goods уже связан; specific-identification costing, transactional corrections, audit и recovery работают как единый data-integrity contour.","economic":"Проверяемый рычаг: точнее остаток и lot cost, меньше ручной reconciliation, воспроизводимая себестоимость заказа и меньше стоимости ошибок в дорогом сырье.","next":"Controlled production use должен закрыть quantity/identity/cost discrepancies и доказать inventory accuracy, order cost и recovery на реальных операционных циклах."},"en":{"matters":"With expensive heterogeneous raw material, one wrong link between purchase, lot, consumption and finished product distorts both inventory and actual cost.","now":"Procurement→specific lot→stock→production→finished goods is connected; specific-identification costing, transactional corrections, audit and recovery form one data-integrity contour.","economic":"Testable lever: more accurate inventory and lot cost, less manual reconciliation, reproducible order cost and lower error cost on high-value material.","next":"Controlled production use must close quantity/identity/cost discrepancies and prove inventory accuracy, order cost and recovery across real operating cycles."}}};

function renderPortfolioIntelligence(lang, $, projects) {
  const en = lang === 'en';
  const priorityOrder = ['syntha','fashionmgmt','furproduction','mfw','promomed','chatx','antiqua','renova'];
  const rank = new Map(priorityOrder.map((id,i)=>[id,i]));
  const items = Array.isArray(projects) ? projects.filter((p) => p?.id && p?.[lang]).sort((a,b)=>(rank.get(a.id)??99)-(rank.get(b.id)??99)) : [];
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
  const PORTFOLIO_FIRST = 2;
  let portfolioExpanded = false;

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
      <p class="eyebrow">${en ? 'Portfolio intelligence' : 'Портфель проектов'}</p>
      <h2>${en ? 'The portfolio as a system' : 'Портфель как система'}</h2>
      <p class="sub">${en
        ? 'See the portfolio by sector, maturity, next verifiable milestone and participation path — then move into the detailed product evidence only where it matters.'
        : `${items.length} опубликованных продуктов собраны в одной карте: направление, текущая стадия, следующий проверяемый этап и формат участия. Так можно быстро понять, где находится каждый продукт сегодня и что должно произойти дальше.`}</p>
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
    <button type="button" class="btn v2-portfolio-more" id="v2-portfolio-more" aria-expanded="false"></button>
    <p class="v2-portfolio-note">${en
      ? 'Fintech and Infrastructure remain empty until products are formally published there; Art is represented by Antiqua, while two additional fashion cases are published without client identification.'
      : 'Финтех и инфраструктура остаются пустыми до отдельной официальной публикации; искусство представлено Antiqua, а два новых fashion-кейса опубликованы без идентификации клиентов.'}</p>`;

  const renderCardVisual = (p) => {
    const shot = Array.isArray(p.shots) && p.shots[0] ? p.shots[0] : null;
    if (shot) return `<div class="v2-card-visual v2-card-visual-shot"><img src="${esc(shot)}" alt="${esc(p.name)} interface preview" loading="lazy"></div>`;
    const maps = {
      antiqua: ['ARTWORK','ARTIST','COLLECTION'],
      fashionmgmt: ['ORDER','PRODUCTION','COST'],
      furproduction: ['LOT','STOCK','PRODUCT']
    };
    const nodes = maps[p.id];
    if (!nodes) return '';
    return `<div class="v2-card-visual v2-card-visual-map v2-map-${esc(p.id)}" aria-label="${en ? 'Product system map' : 'Схема продукта'}">
      <div class="v2-map-frame">${nodes.map((x,i)=>`<span class="v2-map-node v2-map-node-${i+1}">${x}</span>`).join('<i>→</i>')}</div>
    </div>`;
  };

  const renderGrid = (filter = 'all') => {
    const matching = items.filter((p) => filter === 'all' || getMeta(p).cats.includes(filter));
    const visible = portfolioExpanded ? matching : matching.slice(0, PORTFOLIO_FIRST);
    const grid = $('#v2-portfolio-grid');
    if (!grid) return;
    grid.innerHTML = visible.map((p) => {
      const d = p[lang], m = getMeta(p);
      const priority = V2_INVESTOR_PRIORITY[p.id]?.[en ? 'en' : 'ru'];
      const catLabels = m.cats.map((id) => categories.find((x) => x[0] === id)?.[1] || id);
      return `<article class="v2-product" data-v2-product="${esc(p.id)}">
        <div class="v2-product-top">
          <div>
            <div class="v2-product-cats">${catLabels.map((x)=>`<span>${esc(x)}</span>`).join('')}${m.confidential?`<span>${en?'Confidential case':'Конфиденциальный кейс'}</span>`:''}</div>
            <h3>${esc(p.name)}</h3>
          </div>
          <span class="v2-stage v2-stage-${esc(m.maturity)}">${esc(maturityLabels[m.maturity] || m.maturity)}</span>
        </div>
        ${renderCardVisual(p)}
        <p class="v2-product-tag">${esc(d.tagline)}</p>
        <details class="v2-product-meta">
          <summary>${en ? 'Audience · stage · commercial path' : 'Для кого · стадия · коммерческий путь'}</summary>
          <dl class="v2-product-data">
            <div><dt>${en ? 'Audience' : 'Аудитория'}</dt><dd>${esc(short(d.who, 210))}</dd></div>
            <div><dt>${en ? 'Current stage' : 'Текущая стадия'}</dt><dd>${esc(d.stage)}</dd></div>
            <div><dt>${en ? 'Monetisation' : 'Монетизация'}</dt><dd>${esc(m.commercial[en ? 'en' : 'ru'])}</dd></div>
          </dl>
        </details>
        ${priority ? `<div class="v2-investor-priority" aria-label="${en ? 'Investor priority' : 'Инвесторский приоритет'}">
          <div><span>01 · ${en ? 'Why this matters' : 'Почему это важно'}</span><p>${esc(short(priority.matters, 150))}</p></div>
          <div><span>02 · ${en ? 'Why now' : 'Почему сейчас'}</span><p>${esc(short(priority.now, 150))}</p></div>
          <div><span>03 · ${en ? 'Economic change' : 'Что меняется экономически'}</span><p>${esc(short(priority.economic, 150))}</p></div>
          <div class="v2-priority-next"><span>04 · ${en ? 'What must be true next' : 'Что должно быть доказано дальше'}</span><p>${esc(short(priority.next, 150))}</p></div>
        </div>` : ''}
        <div class="v2-product-actions">
          <button type="button" class="btn btn-sm btn-primary" data-v2-open="${esc(p.id)}">${en ? 'Open dossier' : 'Открыть досье'}</button>
          <button type="button" class="btn btn-sm" data-v2-talk="launch" data-v2-id="${esc(p.id)}">${en ? 'Discuss pilot' : 'Обсудить пилот'}</button>
          <button type="button" class="btn btn-sm" data-v2-talk="partnership" data-v2-id="${esc(p.id)}">${en ? 'Partnership' : 'Партнёрство'}</button>
          <button type="button" class="btn btn-sm" data-v2-talk="investors" data-v2-id="${esc(p.id)}">${en ? 'Investment' : 'Инвестиции'}</button>
        </div>
      </article>`;
    }).join('');
    const more = $('#v2-portfolio-more');
    if (more) {
      more.hidden = matching.length <= PORTFOLIO_FIRST;
      more.textContent = portfolioExpanded ? (en ? 'Collapse' : 'Свернуть') : (en ? 'Show more' : 'Показать ещё');
      more.setAttribute('aria-expanded', String(portfolioExpanded));
    }
  };

  if (!section.__v2PortfolioBound) {
    section.__v2PortfolioBound = '1';
    section.addEventListener('click', (e) => {
      const filter = e.target.closest('[data-v2-filter]');
      if (filter && !filter.disabled) {
        section.querySelectorAll('[data-v2-filter]').forEach((b) => {
          const active = b === filter;
          b.classList.toggle('active', active);
          b.setAttribute('aria-pressed', String(active));
        });
        portfolioExpanded = false;
        renderGrid(filter.dataset.v2Filter);
        try { sessionStorage.setItem('syntha_v2_portfolio_filter', filter.dataset.v2Filter); } catch {}
        return;
      }
      const moreToggle=e.target.closest('#v2-portfolio-more');
      if (moreToggle) {
        portfolioExpanded = !portfolioExpanded;
        const activeFilter = section.querySelector('[data-v2-filter].active')?.dataset.v2Filter || 'all';
        renderGrid(activeFilter);
        if (!portfolioExpanded) section.scrollIntoView({behavior:'smooth',block:'start'});
        return;
      }
      const open = e.target.closest('[data-v2-open]');
      if (open) {
        const id = open.dataset.v2Open;
        let target = document.querySelector(`#cards [data-open="${CSS.escape(id)}"]`);
        if (!target) {
          const legacyMore = document.querySelector('#projects-more');
          if (legacyMore && !legacyMore.hidden) legacyMore.click();
          target = document.querySelector(`#cards [data-open="${CSS.escape(id)}"]`);
        }
        if (target) target.click();
        else {
          const card = document.querySelector(`#cards [data-project="${CSS.escape(id)}"]`);
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
          : action === 'launch' ? `Хочу обсудить пилот ${p.name}: границы, критерии приёмки и следующий этап.`
          : action === 'partnership' ? `Хочу обсудить партнёрство вокруг ${p.name}: вклад сторон, коммерческую механику и первый совместный кейс.`
          : `Хочу обсудить инвестиции в ${p.name}: текущую зрелость, следующий этап снижения риска и использование капитала.`;
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


/* V2.3 stakeholder lens */
const V2_STAKEHOLDERS = {"ru":[{"id":"client","label":"Клиент","kicker":"Бизнес-задача","title":"Нужно улучшить экономику или управляемость бизнеса","body":"Смотрите опыт, формат консалтинга и критерии результата. Первый разговор должен закончиться не «идеями вообще», а понятной рамкой задачи и следующим решением.","questions":["Что сейчас стоит денег или тормозит решение?","Какие данные доступны для проверки?","По какому показателю поймём, что стало лучше?"],"route":"consulting","primary":"К формату работы","secondary":"Посмотреть опыт"},{"id":"ceo","label":"CEO / собственник","kicker":"Приоритет и запуск","title":"Нужно быстро понять, что реально можно запускать","body":"Смотрите не на количество функций, а на зрелость, следующий этап, владельца результата и критерии приёмки. Карта портфеля показывает это до погружения в детали.","questions":["Какой бизнес-результат должен измениться?","Что уже собрано, а что ещё требует проверки?","Как выглядит ограниченный пилот вместо большого внедрения?"],"route":"portfolio","primary":"Открыть карту портфеля","secondary":"Как начинается работа"},{"id":"investor","label":"Инвестор","kicker":"Зрелость и снижение риска","title":"Нужно отделить рабочую стадию от красивой презентации","body":"Портфель показывает опубликованную зрелость и следующий путь коммерческой проверки. Там, где подтверждённой монетизации ещё нет, V2 прямо это обозначает и не подменяет гипотезу фактом.","questions":["Какая стадия подтверждена сейчас?","Какой следующий этап должен снизить основной риск?","Какие подтверждения должны появиться после пилота или вложения капитала?"],"route":"investment","primary":"Смотреть инвестиционный маршрут","secondary":"Открыть портфель"},{"id":"partner","label":"Стратегический партнёр","kicker":"Совместная ценность","title":"Нужно понять, что каждая сторона реально привносит","body":"Партнёрский маршрут начинается с вклада, клиентского сценария и коммерческой механики. Затем — один ограниченный совместный кейс с измеримым результатом.","questions":["Какой актив или канал есть у каждой стороны?","Какой клиентский сценарий строим вместе?","Что станет основанием масштабировать партнёрство?"],"route":"partnership","primary":"К партнёрскому маршруту","secondary":"Смотреть проекты"}],"en":[{"id":"client","label":"Client","kicker":"Business problem","title":"Improve the economics or manageability of the business","body":"Start with experience, advisory format and acceptance criteria. The first conversation should end with a defined problem frame and a next decision, not a cloud of generic ideas.","questions":["What is currently costing money or slowing decisions?","What data can be used to test the problem?","Which metric tells us the result improved?"],"route":"consulting","primary":"See the working format","secondary":"Review experience"},{"id":"ceo","label":"CEO / owner","kicker":"Priority & launch","title":"See quickly what can actually be launched","body":"Look past the feature count: maturity, next milestone, accountable owner and acceptance criteria matter more. Portfolio Intelligence surfaces those before the detailed dossiers.","questions":["Which business outcome must change?","What is already built versus still unverified?","What would a bounded pilot look like instead of a large rollout?"],"route":"portfolio","primary":"Open Portfolio Intelligence","secondary":"How the work starts"},{"id":"investor","label":"Investor","kicker":"Maturity & de-risking","title":"Separate working maturity from presentation quality","body":"The portfolio shows published maturity and the next commercial validation path. Where monetisation is not yet validated, V2 says so explicitly rather than presenting a hypothesis as fact.","questions":["What maturity is evidenced today?","What is the next de-risking milestone?","What evidence should exist after capital or a pilot?"],"route":"investment","primary":"Open investment route","secondary":"Review portfolio"},{"id":"partner","label":"Strategic partner","kicker":"Shared value","title":"Make each side’s contribution explicit","body":"The partnership route starts with contribution, customer workflow and commercial mechanics, then narrows to one joint case with a measurable result.","questions":["What asset or channel does each side bring?","Which customer workflow are we building together?","What evidence would justify scaling the partnership?"],"route":"partnership","primary":"Open partnership route","secondary":"Review products"}]};
function renderStakeholderLens(lang, $, projects) {
  const en = lang === 'en';
  const data = V2_STAKEHOLDERS[en ? 'en' : 'ru'];
  const items = Array.isArray(projects) ? projects.filter((p) => p?.id && p?.[lang]) : [];
  const metas = items.map((p) => V2_PORTFOLIO_META[p.id]).filter(Boolean);
  const sectorCount = new Set(metas.flatMap((m) => m.cats)).size;
  const maturityCount = metas.reduce((acc,m)=>{acc[m.maturity]=(acc[m.maturity]||0)+1;return acc;},{});
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (ch) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));

  $('#v2-headline').textContent = en
    ? 'Decision economics. Working products. A verifiable next step.'
    : 'Экономика решений. Рабочие продукты. Проверяемый следующий шаг.';
  $('#hero-lead').textContent = en
    ? 'I work at the intersection of commercial analytics, operating models and product development: from margin, inventory and working capital to a digital product, pilot and rollout.'
    : 'Работаю на стыке коммерческой аналитики, операционной модели и разработки: от маржи, запасов и оборотного капитала до цифрового продукта, пилота и внедрения.';

  let proof = $('#v2-proofbar');
  if (!proof) {
    proof = document.createElement('div');
    proof.id = 'v2-proofbar';
    proof.className = 'v2-proofbar';
    $('.hero-cta')?.after(proof);
  }
  const chips = [
    [String(items.length), en ? 'published products' : 'опубликованных проектов'],
    [String(sectorCount), en ? 'active sectors' : 'активных направлений'],
    [String(maturityCount.mvp || 0), 'MVP'],
    [String(maturityCount.pilot || 0), en ? 'Pilot-ready' : 'Готов к пилоту']
  ];
  proof.innerHTML = chips.map(([n,l])=>`<span><strong>${esc(n)}</strong>${esc(l)}</span>`).join('');

  let section = $('#v2-stakeholders');
  const routes = $('#v2-routes');
  if (!section) {
    section = document.createElement('section');
    section.id = 'v2-stakeholders';
    section.className = 'section v2-stakeholders';
    routes?.before(section);
  }
  if (!section) return;

  section.innerHTML = `
    <div class="v2-stakeholder-head">
      <div>
        <p class="eyebrow">${en ? 'Choose your lens' : 'Выберите свою роль'}</p>
        <h2>${en ? 'The same portfolio answers different questions' : 'Один портфель — разные вопросы'}</h2>
      </div>
      <p>${en
        ? 'Switch perspective first. The page then points you to the evidence and action that matter for that role.'
        : 'Сначала выберите свою роль. Дальше страница покажет подтверждения и действия, которые важны именно для неё.'}</p>
    </div>
    <div class="v2-stakeholder-tabs" role="tablist" aria-label="${en ? 'Visitor role' : 'Роль посетителя'}">
      ${data.map((r,i)=>`<button type="button" role="tab" class="v2-stakeholder-tab${i===0?' active':''}" aria-selected="${i===0}" data-v2-stakeholder="${r.id}">${esc(r.label)}</button>`).join('')}
    </div>
    <article class="v2-stakeholder-panel" id="v2-stakeholder-panel"></article>`;

  const renderRole = (id) => {
    const role = data.find((x)=>x.id===id) || data[0];
    section.querySelectorAll('.v2-stakeholder-tab').forEach((b)=>{
      const active=b.dataset.v2Stakeholder===role.id;
      b.classList.toggle('active',active);
      b.setAttribute('aria-selected',String(active));
    });
    $('#v2-stakeholder-panel').innerHTML = `
      <div class="v2-stakeholder-main">
        <span class="v2-route-meta">${esc(role.kicker)}</span>
        <h3>${esc(role.title)}</h3>
        <p>${esc(role.body)}</p>
      </div>
      <div class="v2-stakeholder-questions">
        <h4>${en ? 'Questions to resolve' : 'Какие вопросы надо закрыть'}</h4>
        <ol>${role.questions.map((q)=>`<li>${esc(q)}</li>`).join('')}</ol>
      </div>
      <div class="v2-stakeholder-actions">
        <button type="button" class="btn btn-primary" data-v2-role-primary="${role.route}">${esc(role.primary)} →</button>
        <button type="button" class="btn" data-v2-role-secondary="${role.id}">${esc(role.secondary)}</button>
      </div>`;
    try { sessionStorage.setItem('syntha_v2_stakeholder',role.id); } catch {}
  };

  if (!section.__v2StakeholderBound) {
    section.__v2StakeholderBound='1';
    section.addEventListener('click',(e)=>{
      const tab=e.target.closest('[data-v2-stakeholder]');
      if(tab){ renderRole(tab.dataset.v2Stakeholder); return; }
      const primary=e.target.closest('[data-v2-role-primary]');
      if(primary){
        const route=primary.dataset.v2RolePrimary;
        if(route==='portfolio'){ $('#v2-portfolio')?.scrollIntoView({behavior:'smooth',block:'start'}); return; }
        const decisionTab=document.querySelector(`#v2-decision [data-v2-path="${CSS.escape(route)}"]`);
        if(decisionTab){ decisionTab.click(); $('#v2-decision')?.scrollIntoView({behavior:'smooth',block:'start'}); }
        return;
      }
      const secondary=e.target.closest('[data-v2-role-secondary]');
      if(!secondary) return;
      const role=secondary.dataset.v2RoleSecondary;
      const target=role==='client' ? $('#experience') : role==='ceo' ? $('#v2-steps') : $('#v2-portfolio');
      target?.scrollIntoView({behavior:'smooth',block:'start'});
    });
  }

  let saved='client';
  try { saved=sessionStorage.getItem('syntha_v2_stakeholder')||'client'; } catch {}
  renderRole(data.some((x)=>x.id===saved)?saved:'client');
}


/* V2.4 executive evidence layer */
const V2_EVIDENCE = {"syntha":{"ru":{"problem":"Разрозненные данные о продукте, заказах и исполнении требуют ручной сверки и замедляют решения.","product":"Операционная система для fashion-бизнеса, которая связывает продуктовый и коммерческий цикл в одном рабочем пространстве.","evidence":"Product/commercial core собран; на PostgreSQL доказаны entity-linked operational threads, immutable messages и Decision Ledger. Внешний сезонный пилот ещё не проведён.","next":"Провести пилот с первым брендом на реальном сезоне.","path":"Пилот → зафиксированные метрики → условия внедрения / выхода на рынок.","ask":"Бренд или магазин для пилота; партнёр по выходу на рынок."},"en":{"problem":"Fragmented product, order and execution data requires manual reconciliation and slows decisions.","product":"An operating system for fashion businesses that connects product and commercial workflows in one workspace.","evidence":"The product/commercial core is built; entity-linked operational threads, immutable messages and the Decision Ledger are PostgreSQL-proven. An external real-season pilot is still pending.","next":"Run a first real-season pilot with a brand.","path":"Pilot → agreed metrics → rollout / go-to-market terms.","ask":"A brand or retailer for the pilot; a go-to-market partner."}},"chatx":{"ru":{"problem":"Решения, задачи, встречи и знания распределены по разным сервисам и теряют контекст.","product":"Корпоративная рабочая среда, где коммуникация, решения, задачи, документы и согласования связаны между собой.","evidence":"Основные рабочие сценарии, включая встречи, запросы и согласования, собраны. Внешний корпоративный пилот ещё не проведён.","next":"Провести ограниченный пилот внутри компании-заказчика.","path":"Пилот компании → подтверждение сценариев → условия внедрения.","ask":"Компания для пилота; партнёр по внедрению."},"en":{"problem":"Decisions, tasks, meetings and knowledge are split across services and lose context.","product":"A company work environment where communication, decisions, tasks, documents and approvals stay connected.","evidence":"Core work scenarios, including meetings, requests and approvals, are built. An external company pilot has not yet been completed.","next":"Run a bounded pilot inside a client company.","path":"Company pilot → validated workflows → rollout terms.","ask":"A company for the pilot; an implementation partner."}},"renova":{"ru":{"problem":"Ремонт часто ведут через переписку, таблицы и чеки, поэтому смета, этапы и ответственность расходятся.","product":"Мобильная система управления ремонтом для заказчика и исполнителя: бюджет, этапы, приёмка, документы и история объекта.","evidence":"MVP собран и существенно подготовлен к пилоту. Широкий запуск ещё не заявляется: внешние сервисы и реальный объект требуют отдельной проверки.","next":"Провести закрытый тест на реальном объекте.","path":"Закрытый тест → доказательство сценария → модель выхода на рынок.","ask":"Заказчики, мастера и бригады для теста; партнёры для развития."},"en":{"problem":"Renovations often run through chats, spreadsheets and receipts, causing estimates, stages and accountability to drift apart.","product":"A mobile renovation system for clients and contractors covering budget, stages, acceptance, documents and project history.","evidence":"The MVP is built and materially prepared for a pilot. Broad launch is not yet claimed: external services and real-project use still need validation.","next":"Run a closed test on a real renovation project.","path":"Closed test → validated workflow → market model.","ask":"Clients, contractors and crews for testing; partners for growth."}},"mfw":{"ru":{"problem":"Событие заканчивается, а аудитория, контакты брендов и накопленная ценность распадаются между сезонами.","product":"Единая цифровая платформа для MFW, BFS и «Сделано в Москве» с общей идентичностью, персональным маршрутом, B2B и продолжением отношений после события.","evidence":"Три направления собраны в общей платформе; отдельно проверены responsive monitor/tablet/phone и fail-closed Capital Authority admission contract. Production admission всё ещё заблокирован безопасной привязкой PostgreSQL.","next":"Закрыть Render PostgreSQL binding и /ready, затем проводить пилот на реальном событии.","path":"Организаторский пилот → метрики вовлечения / лидов → партнёрская модель.","ask":"Организаторы, бренды и партнёры для пилота."},"en":{"problem":"Events end, while audience, brand relationships and accumulated value disperse between seasons.","product":"One digital platform for MFW, BFS and Made in Moscow with shared identity, personal journey, B2B and post-event continuity.","evidence":"The three directions are assembled in one platform; monitor/tablet/phone responsiveness and a fail-closed Capital Authority admission contract are verified. Production admission is still blocked on secure PostgreSQL binding.","next":"Close the Render PostgreSQL binding and /ready gate, then run a real-event pilot.","path":"Organiser pilot → engagement / lead metrics → partnership model.","ask":"Organisers, brands and partners for a pilot."}},"promomed":{"ru":{"problem":"Конференция даёт короткий всплеск контакта, но ценность для участников, партнёров и организатора плохо накапливается после события.","product":"«СОСТОЯНИЕ»: круглогодичный контент, персональный маршрут участника, цифровой слой конференции, партнёрские сценарии и работа после события.","evidence":"Рабочая версия дополнена External Verification Interoperability v1: issuer lifecycle, Ed25519 public-key verification, status lists и retrievable immutable signed evidence checkpoints. Реальный controlled pilot ещё впереди.","next":"Провести контролируемый пилот с реальными пользователями и процессами.","path":"Пилот → проверяемые результаты → согласованный коммерческий формат.","ask":"Заказчик / стратегический партнёр для пилота и дальнейшего запуска."},"en":{"problem":"A conference creates a short contact spike, but value for attendees, partners and organisers is poorly accumulated after the event.","product":"SOSTOYANIE: year-round content, a personalised participant journey, a digital conference layer, partner workflows and post-event continuity.","evidence":"The working version now includes External Verification Interoperability v1: issuer lifecycle, Ed25519 public-key verification, status lists and retrievable immutable signed evidence checkpoints. A real controlled pilot is still ahead.","next":"Run a controlled pilot with real users and operating processes.","path":"Pilot → verifiable outcomes → agreed commercial format.","ask":"Client / strategic partner for a pilot and launch."}},"antiqua":{"ru":{"problem":"У произведения искусства часто нет единой связки Artwork → Artist → Related Works → Collection → research context, а commercial-first каталоги смешивают продажу и знание.","product":"Gallery-first цифровая экосистема только для живописи — oil, acrylic, tempera, watercolor, gouache и pastel — с Collections/Taste и исследовательским контуром.","evidence":"Gallery-first journey, Artwork → Artist → Related Works, Collections → Taste loop и machine-verifiable production admission реализованы на main. В репозитории ещё есть legacy antique/object wording, которое не должно попадать в публичную концепцию.","next":"Закрыть production PostgreSQL integrity/admission proof и провести внешний пилот на реальных произведениях с галереей/коллекцией.","path":"Real-art pilot → verified research/gallery workflow → professional / institutional model.","ask":"Галерея, коллекционер или институция с реальными произведениями и provenance materials."},"en":{"problem":"Artwork, artist history, related works, collections and research context are often fragmented, while commerce-first catalogues conflate sales and knowledge.","product":"A gallery-first ecosystem focused only on painting — oil, acrylic, tempera, watercolor, gouache and pastel — with Collections/Taste and a research layer.","evidence":"The Gallery-first journey, Artwork → Artist → Related Works, Collections → Taste loop and machine-verifiable production admission are on main. Legacy antique/object wording still exists in the repository and should not define the public concept.","next":"Close production PostgreSQL integrity/admission proof and run an external pilot on real artworks with a gallery or collection.","path":"Real-art pilot → verified research/gallery workflow → professional / institutional model.","ask":"A gallery, collector or institution with real artworks and provenance material."}},"fashionmgmt":{"ru":{"problem":"Модель, заказ, цеха, материалы, ставки, платежи, себестоимость и ДДС часто живут в разных таблицах; срок и экономика становятся видны слишком поздно.","product":"Конфиденциальная Fashion Management OS для сквозного управления разработкой модели, заказом, производством, себестоимостью, мощностью и ликвидностью.","evidence":"Рабочий enterprise core уже включает role-based access, product/order/production flow, cost engine Plan/Fact/CTC/Forecast, WIP/capacity, 13-недельную ликвидность, month close, audit/evidence и безопасный deploy/rollback.","next":"Завершить role × device QA и провести controlled rollout на реальном операционном контуре без раскрытия клиентских данных.","path":"Controlled rollout → acceptance metrics → agreed implementation/licence/support scope.","ask":"Доступ к операционному pilot contour и назначенные business/process owners; публичная демонстрация остаётся обезличенной."},"en":{"problem":"Model, order, workshops, materials, rates, payments, cost and cash flow often live in separate spreadsheets, making deadline and economics visible too late.","product":"A confidential Fashion Management OS for end-to-end control of model development, orders, production, cost, capacity and liquidity.","evidence":"The working enterprise core includes role-based access, product/order/production flow, Plan/Actual/CTC/Forecast cost engine, WIP/capacity, 13-week liquidity, month close, audit/evidence and safe deploy/rollback.","next":"Finish role × device QA and run a controlled rollout in a real operating contour without exposing client data.","path":"Controlled rollout → acceptance metrics → agreed implementation/licence/support scope.","ask":"Access to an operating pilot contour and named business/process owners; the public case remains anonymised."}},"furproduction":{"ru":{"problem":"При дорогом неоднородном сырье средневзвешенный учёт теряет связь между закупкой, конкретным лотом, фактическим списанием и себестоимостью готового изделия.","product":"Конфиденциальная vertical ERP для procurement, landed cost, specific lots, склада, норм/BOM, производства, примерок, платежей, документов и audit trail.","evidence":"Рабочий core ведёт procurement → lot → warehouse → production → finished goods с specific-identification costing, transactional corrections, audit before/after, backup/restore и защитой concurrent writes.","next":"Продолжить operational QA и провести controlled production use с acceptance по точности остатка, lot cost и себестоимости заказа.","path":"Controlled production use → inventory/cost acceptance → vertical ERP rollout / support scope.","ask":"Операционный pilot без публикации клиента, поставщиков, реальных лотов, договоров, цен и исходных реестров."},"en":{"problem":"With expensive heterogeneous raw material, average-cost accounting loses the link between purchase, specific lot, actual consumption and finished-product cost.","product":"A confidential vertical ERP for procurement, landed cost, specific lots, stock, norms/BOM, production, fittings, payments, documents and audit trail.","evidence":"The working core governs procurement → lot → warehouse → production → finished goods with specific-identification costing, transactional corrections, before/after audit, backup/restore and concurrent-write protection.","next":"Continue operational QA and run controlled production use with acceptance on inventory accuracy, lot cost and order cost.","path":"Controlled production use → inventory/cost acceptance → vertical ERP rollout / support scope.","ask":"An operating pilot without publishing the client, suppliers, real lots, contracts, prices or source registers."}}};
function installExecutiveEvidence(lang, $, projects) {
  const en = lang === 'en';
  const data = V2_EVIDENCE;
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (ch) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const portfolio = $('#v2-portfolio');
  if (!portfolio || portfolio.__v2EvidenceInstalled) return;
  portfolio.__v2EvidenceInstalled = true;

  const attach = () => {
    portfolio.querySelectorAll('.v2-product').forEach((card) => {
      const id = card.dataset.v2Product;
      if (!id || card.querySelector('[data-v2-evidence]')) return;
      const p = (projects || []).find((x)=>x.id===id);
      const d = data[id]?.[en ? 'en' : 'ru'];
      if (!p || !d) return;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn btn-sm v2-evidence-toggle';
      btn.dataset.v2Evidence = id;
      btn.setAttribute('aria-expanded','false');
      btn.textContent = en ? 'Executive brief' : 'Кратко для руководителя';
      const actions = card.querySelector('.v2-product-actions');
      actions?.append(btn);

      const panel = document.createElement('div');
      panel.className = 'v2-evidence-panel';
      panel.hidden = true;
      panel.innerHTML = `
        <div><span>${en?'Problem':'Проблема'}</span><p>${esc(d.problem)}</p></div>
        <div><span>${en?'Product':'Продукт'}</span><p>${esc(d.product)}</p></div>
        <div><span>${en?'Evidence':'Подтверждение'}</span><p>${esc(d.evidence)}</p></div>
        <div><span>${en?'Current maturity':'Текущая стадия'}</span><p>${esc(p[lang].stage)}</p></div>
        <div><span>${en?'Next milestone':'Следующий этап'}</span><p>${esc(d.next)}</p></div>
        <div><span>${en?'Commercial path':'Коммерческий путь'}</span><p>${esc(d.path)}</p></div>
        <div><span>${en?'Capital / partner ask':'Что требуется от партнёра / инвестора'}</span><p>${esc(d.ask)}</p></div>`;
      card.append(panel);
    });
  };

  const observer = new MutationObserver(attach);
  observer.observe(portfolio,{childList:true,subtree:true});
  attach();

  portfolio.addEventListener('click',(e)=>{
    const btn=e.target.closest('[data-v2-evidence]');
    if(!btn) return;
    const card=btn.closest('.v2-product');
    const panel=card?.querySelector('.v2-evidence-panel');
    if(!panel) return;
    const open=panel.hidden;
    panel.hidden=!open;
    btn.setAttribute('aria-expanded',String(open));
    btn.textContent=open ? (en?'Hide brief':'Свернуть') : (en?'Executive brief':'Кратко для руководителя');
  });
}


/* V2.6 project decision dossier */

/* V2.6a authority-backed decision layer */
const V2_AUTHORITY = {"syntha":{"ru":{"proof":"PostgreSQL-proven EntityThread, immutable messages и Decision Ledger; продуктовые/коммерческие acceptance gates уже существуют.","owner":"Внешний пилот: owner бренда + product/operations owner; внутренний authority — серверные product/commerce contracts.","gate":"Реальный сезон должен пройти без возврата к ручной сверке критичных данных и решений.","contract":"После acceptance пилота фиксируются integration scope, роли, SLA/поддержка и регулярная модель доступа.","evidence":"Thread/decision persistence, acceptance events, order/economics consistency, pilot usage evidence."},"en":{"proof":"PostgreSQL-proven EntityThread, immutable messages and Decision Ledger; product/commercial acceptance gates already exist.","owner":"External pilot: brand owner + product/operations owner; internal authority remains server-side product/commerce contracts.","gate":"A real season must run without falling back to manual reconciliation for critical data and decisions.","contract":"After pilot acceptance, integration scope, roles, SLA/support and recurring access terms can be fixed.","evidence":"Thread/decision persistence, acceptance events, order/economics consistency and pilot usage evidence."}},"chatx":{"ru":{"proof":"Server-side RBAC, Requests/Approvals, commitment state machine, human-confirmed Meeting Intelligence и evidence-before-acceptance уже реализованы.","owner":"Owner/admin управляют tenant policy; designated acceptor закрывает commitment; AI не может сам создать authoritative work.","gate":"Ограниченная команда должна вести conversation → decision → task → evidence → acceptance как основной рабочий контур.","contract":"После подтверждённого ежедневного использования и security/admin acceptance можно фиксировать rollout, migration и enterprise support scope.","evidence":"RBAC/audit events, approval chain, commitment evidence, acceptor action, usage and durability checks."},"en":{"proof":"Server-side RBAC, Requests/Approvals, a commitment state machine, human-confirmed Meeting Intelligence and evidence-before-acceptance are implemented.","owner":"Owner/admin governs tenant policy; the designated acceptor closes a commitment; AI cannot create authoritative work by itself.","gate":"A bounded team must run conversation → decision → task → evidence → acceptance as its primary work loop.","contract":"Once daily use plus security/admin acceptance is evidenced, rollout, migration and enterprise support scope can be contracted.","evidence":"RBAC/audit events, approval chain, commitment evidence, acceptor action, usage and durability checks."}},"renova":{"ru":{"proof":"Смета, этапы, change orders, formal acceptance, документы и payment states сведены в один audit/closure contour; критичные defects отслеживаются в closure matrix.","owner":"Заказчик принимает этап/результат; исполнитель сдаёт evidence; отдельные admin/evidence roles применяются там, где требуется review.","gate":"Реальный объект должен пройти estimate → work → evidence → handover → acceptance/payment без критичных договорённостей вне системы.","contract":"После двустороннего acceptance можно фиксировать B2B/consumer scope, payment boundary, поддержку и модель управления портфелем объектов.","evidence":"Estimate locks, stage handover/acceptance, change-order history, receipts/payment confirmation and audit records."},"en":{"proof":"Estimate, stages, change orders, formal acceptance, documents and payment states share one audit/closure contour; critical defects are tracked in a closure matrix.","owner":"The client accepts stage/result; the contractor submits evidence; dedicated admin/evidence roles are used where review is required.","gate":"A real project must pass estimate → work → evidence → handover → acceptance/payment without critical agreements living outside the system.","contract":"After two-sided acceptance, B2B/consumer scope, payment boundary, support and portfolio-management terms can be fixed.","evidence":"Estimate locks, stage handover/acceptance, change-order history, receipts/payment confirmation and audit records."}},"mfw":{"ru":{"proof":"Responsive release gate и Capital Authority admission contract fail-closed; `/ready` требует PostgreSQL, schema reconciliation, strict guard и exact release evidence.","owner":"Platform/operator owner отвечает за production admission; programme/investment decisions требуют authorised operator evidence, а не UI-state.","gate":"Сначала secure DATABASE_URL binding и green `/ready`; только затем real-event load и programme/business evidence.","contract":"Коммерческий event/season rollout допустим только после production admission и измеримого organiser/brand/partner результата на реальном событии.","evidence":"`/ready`, schema reconciliation, migration floor, Capital ledger verification, release SHA, event metrics and accepted programme evidence."},"en":{"proof":"Responsive release gates and the Capital Authority admission contract fail closed; `/ready` requires PostgreSQL, schema reconciliation, strict guard and exact-release evidence.","owner":"The platform/operator owner owns production admission; programme/investment decisions require authorised operator evidence rather than UI state.","gate":"Secure DATABASE_URL binding and a green `/ready` come first; real-event load and programme/business evidence follow.","contract":"Commercial event/season rollout is justified only after production admission and measurable organiser/brand/partner outcomes at a real event.","evidence":"`/ready`, schema reconciliation, migration floor, Capital ledger verification, release SHA, event metrics and accepted programme evidence."}},"promomed":{"ru":{"proof":"External Verification Interoperability v1 даёт issuer lifecycle, Ed25519 verification, status lists и retrievable immutable signed checkpoints поверх evidence graph.","owner":"Issuer/key lifecycle управляется отдельным authority; medical/editorial judgement остаётся у человека и не подменяется cryptographic validity.","gate":"Controlled pilot должен породить валидируемые evidence artifacts и показать, что verification/status lifecycle работает в реальном процессе.","contract":"После pilot acceptance можно согласовывать event/community deployment; цена и scale economics остаются гипотезой до measured evidence.","evidence":"Signed checkpoint, issuer document, active/retired/revoked key state, status list, evidence seal, participant/partner pilot metrics."},"en":{"proof":"External Verification Interoperability v1 provides issuer lifecycle, Ed25519 verification, status lists and retrievable immutable signed checkpoints over the evidence graph.","owner":"Issuer/key lifecycle has its own authority; human medical/editorial judgement is not replaced by cryptographic validity.","gate":"The controlled pilot must generate verifiable evidence artifacts and prove the verification/status lifecycle in a real operating process.","contract":"Event/community deployment can be negotiated after pilot acceptance; pricing and scale economics remain hypotheses until measured evidence exists.","evidence":"Signed checkpoint, issuer document, active/retired/revoked key state, status list, evidence seal and participant/partner pilot metrics."}},"antiqua":{"ru":{"proof":"Gallery-first Artwork/Artist authority, Collections→Taste, machine-verifiable production admission и research-trust boundaries уже существуют на main.","owner":"Artwork/Artist/collection authority отделена от promotion; expertise/provenance claims требуют scoped evidence/review, а не popularity score.","gate":"Production PostgreSQL admission + real-art pilot должны подтвердить integrity, record quality, discovery continuation и research workflow.","contract":"Professional/institutional monetisation допустима только без смешения paid placement с editorial, expertise или provenance authority.","evidence":"Production readiness/integrity report, Artwork/Artist records, provenance/research evidence, collection/taste events and external pilot acceptance."},"en":{"proof":"Gallery-first Artwork/Artist authority, Collections→Taste, machine-verifiable production admission and research-trust boundaries exist on main.","owner":"Artwork/Artist/collection authority is separate from promotion; expertise/provenance claims require scoped evidence/review rather than a popularity score.","gate":"Production PostgreSQL admission plus a real-art pilot must prove integrity, record quality, discovery continuation and research workflow.","contract":"Professional/institutional monetisation is acceptable only while paid placement stays separate from editorial, expertise and provenance authority.","evidence":"Production readiness/integrity report, Artwork/Artist records, provenance/research evidence, collection/taste events and external pilot acceptance."}},"fashionmgmt":{"ru":{"proof":"Role-scoped enterprise workflow, immutable audit events, snapshot rates/prices, frozen final-cost close, WIP/capacity and evidence-bound month close уже реализованы.","owner":"Business owner / operations / production owners разделены по реальной role map; technical admin не получает бизнес-полномочия автоматически.","gate":"Controlled rollout должен доказать, что order → production → cost → cash/close проходит в системе без критической параллельной таблицы.","contract":"После acceptance фиксируются production scope, roles, migration/integration boundary, support/SLA и licence/implementation terms.","evidence":"Role access logs, order/operation history, cost snapshots, WIP/capacity signals, month-close evidence, user/device QA and rollout metrics."},"en":{"proof":"Role-scoped enterprise workflow, immutable audit events, snapshot rates/prices, frozen final-cost close, WIP/capacity and evidence-bound month close are implemented.","owner":"Business owner, operations and production owners are separated by the real role map; technical admin does not automatically gain business authority.","gate":"The controlled rollout must prove order → production → cost → cash/close can run in-system without a critical parallel spreadsheet.","contract":"After acceptance, production scope, roles, migration/integration boundary, support/SLA and licence/implementation terms can be fixed.","evidence":"Role-access logs, order/operation history, cost snapshots, WIP/capacity signals, month-close evidence, user/device QA and rollout metrics."}},"furproduction":{"ru":{"proof":"Specific-lot authority связывает procurement, lot cost, stock movement, production consumption и finished goods; critical edits защищены после использования, audit хранит before/after.","owner":"Procurement, warehouse, technology, accounting and management roles имеют scoped permissions; data corrections проходят через transactional domain actions, а не прямое переписывание истории.","gate":"Controlled production use должен закрыть расхождения по quantity, lot identity, landed cost и order cost и доказать восстановимость данных.","contract":"После acceptance можно фиксировать vertical ERP rollout, data migration, support и интеграционный scope; клиентские коммерческие данные не входят в публичный proof.","evidence":"Purchase/lot chain, stock movements, BOM/norm usage, order cost, payment/document state, audit history, backup/restore proof and reconciliation reports."},"en":{"proof":"Specific-lot authority connects procurement, lot cost, stock movement, production consumption and finished goods; critical edits are protected after use and audit retains before/after state.","owner":"Procurement, warehouse, technology, accounting and management roles have scoped permissions; corrections use transactional domain actions rather than rewriting history.","gate":"Controlled production use must close discrepancies in quantity, lot identity, landed cost and order cost and prove recoverability.","contract":"After acceptance, vertical ERP rollout, data migration, support and integration scope can be fixed; client commercial data is not part of public proof.","evidence":"Purchase/lot chain, stock movements, BOM/norm usage, order cost, payment/document state, audit history, backup/restore proof and reconciliation reports."}}};

function installProjectDecisionDossier(lang, $, projects) {
  const en = lang === 'en';
  const modal = $('#modal');
  const status = $('#status');
  if (!modal || !status) return;
  const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (ch) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));

  let section = $('#v2-project-dossier');
  if (!section) {
    section = document.createElement('section');
    section.id = 'v2-project-dossier';
    section.className = 'v2-project-dossier';
    status.before(section);
  }

  const paint = () => {
    const id = modal.dataset.project;
    const p = (projects || []).find((x) => x.id === id);
    const d = V2_EVIDENCE[id]?.[en ? 'en' : 'ru'];
    const a = V2_AUTHORITY[id]?.[en ? 'en' : 'ru'];
    const c = V2_COMMERCIAL[id]?.[en ? 'en' : 'ru'];
    const r = V2_PROOF[id]?.[en ? 'en' : 'ru'];
    if (!p || !d || !a || !c || !r || !modal.open) {
      section.hidden = true;
      return;
    }
    section.hidden = false;
    section.innerHTML = `
      <div class="v2-dossier-head">
        <div>
          <p class="eyebrow">${en ? 'CEO decision brief' : 'CEO · досье для решения'}</p>
          <h3>${en ? 'Seven signals before the next commitment' : '7 сигналов до следующего обязательства'}</h3>
        </div>
        <span class="v2-dossier-state">${en ? 'Current gate' : 'Текущий gate'} · ${esc(d.next)}</span>
      </div>
      <div class="v2-dossier-grid v2-dossier-grid-ceo">
        <div class="v2-dossier-problem"><span>01 · ${en ? 'Problem' : 'Проблема'}</span><p>${esc(d.problem)}</p></div>
        <div class="v2-dossier-product"><span>02 · ${en ? 'Product' : 'Продукт'}</span><p>${esc(d.product)}</p></div>
        <div class="v2-dossier-proof"><span>03 · Proof</span><p>${esc(a.proof)}</p></div>
        <div class="v2-dossier-governance"><span>04 · Governance</span><p>${esc(a.owner)}</p></div>
        <div class="v2-dossier-commercial"><span>05 · ${en ? 'Commercial model' : 'Коммерческая модель'}</span><p>${esc(c.pays)}</p><small>${esc(a.contract)}</small></div>
        <div class="v2-dossier-risk"><span>06 · ${en ? 'Primary risk' : 'Главный риск'}</span><p>${esc(r.risk)}</p></div>
        <div class="v2-dossier-next"><span>07 · ${en ? 'Next gate' : 'Следующий gate'}</span><p>${esc(a.gate)}</p></div>
      </div>
      <div class="v2-dossier-askbar">
        <span>${en ? 'Decision ask now' : 'Что требуется сейчас'}</span>
        <p>${esc(d.ask)}</p>
      </div>`;
    const primary = $('#modal-cta');
    if (primary) primary.textContent = en ? 'Discuss next gate' : 'Обсудить следующий gate';
    const more = $('#modal-more');
    if (more && !more.hidden) more.textContent = en ? 'Open full dossier' : 'Открыть полное досье';
  };

  if (!modal.__v2DossierBound) {
    modal.__v2DossierBound = '1';
    new MutationObserver(paint).observe(modal, {attributes:true,attributeFilter:['open','data-project']});
  }
  paint();
}

/* V2.7 commercial clarity layer */
const V2_COMMERCIAL = {"syntha":{"ru":{"buyer":"Фэшн-бренд, производитель или розничная компания, которым нужен единый контур продукта, заказа и экономики.","pays":"За доступ к системе и управляемый рабочий контур; отдельно — за внедрение, интеграцию с учётной системой и настройку под процессы.","pilot":"Один бренд, один реальный сезон, ограниченный набор пользователей и сквозной сценарий от продукта и шоурума до подтверждённого заказа и маржи.","measure":["доля сценария, прошедшая без ручной сверки между системами","время подготовки и подтверждения заказа","расхождения по цене, доступности, себестоимости и марже","готовность интеграции и пользователей к ежедневной работе"],"contract":"Пилот проходит согласованные критерии приёмки, определён интеграционный контур, подтверждены роли и объём регулярного использования.","models":["регулярный доступ / лицензия","внедрение и интеграция","корпоративная поддержка","партнёрство по выходу на рынок"],"note":"Рабочая коммерческая гипотеза. Цена, единица тарификации и экономика масштабирования должны быть зафиксированы после пилота."},"en":{"buyer":"A fashion brand, manufacturer or retailer that needs one operating layer across product, order and economics.","pays":"For software access and a governed operating workflow; implementation, ERP integration and process configuration are separate scopes.","pilot":"One brand, one real season, a bounded user group and an end-to-end flow from product and showroom to confirmed order and margin.","measure":["share of the workflow completed without manual cross-system reconciliation","time to prepare and confirm an order","price, availability, cost and margin discrepancies","integration and user readiness for daily operation"],"contract":"The pilot meets agreed acceptance criteria, the integration scope is defined, roles are confirmed and recurring use is justified.","models":["recurring access / licence","implementation and integration","enterprise support","go-to-market partnership"],"note":"Working commercial hypothesis. Pricing, billing unit and scale economics should be fixed after the pilot."}},"chatx":{"ru":{"buyer":"Компания или отдельный бизнес-контур, которому нужна управляемая корпоративная среда вместо набора разрозненных сервисов.","pays":"За доступ сотрудников к рабочей среде; отдельно — за внедрение, миграцию, интеграции и корпоративную поддержку.","pilot":"Один департамент или кросс-функциональная команда переносит в ChatX ограниченный рабочий контур: коммуникацию, встречи, решения и задачи.","measure":["активное использование сотрудниками пилотной группы","доля решений, которые можно проследить до задачи и результата","надёжность календаря, звонков, расшифровки и интеграций","объём ручного переноса информации между сервисами"],"contract":"Пилот подтверждает устойчивое ежедневное использование, требования безопасности и администрирования, а критичные интеграции проходят приёмку.","models":["лицензия / подписка по пользователям или организации","внедрение и миграция","интеграции","корпоративная поддержка"],"note":"Коммерческая модель пока является гипотезой и должна быть проверена на первом корпоративном пилоте."},"en":{"buyer":"A company or business unit that needs a governed company workspace instead of a fragmented set of services.","pays":"For employee access to the workspace; rollout, migration, integrations and enterprise support are separate scopes.","pilot":"One department or cross-functional team moves a bounded workflow into ChatX: communication, meetings, decisions and tasks.","measure":["active use across the pilot group","share of decisions traceable to a task and outcome","reliability of calendar, calls, transcription and integrations","amount of manual information transfer between services"],"contract":"The pilot proves sustained daily use, security and administration requirements, and acceptance of critical integrations.","models":["per-user or organisation licence / subscription","rollout and migration","integrations","enterprise support"],"note":"The commercial model is still a hypothesis and should be validated in the first company pilot."}},"renova":{"ru":{"buyer":"На первом этапе — собственник ремонта или ремонтная компания, готовые вести реальный объект в системе.","pays":"Гипотеза: за управляемый контур ремонта, прозрачность сметы и этапов, документы и сервисные функции; для B2B — за управление потоком объектов.","pilot":"Один реальный объект от версии сметы до нескольких принятых и оплаченных этапов с фото, документами и историей изменений.","measure":["отклонение плановой сметы от факта и момент его обнаружения","доля этапов, закрытых через формальную сдачу и приёмку","полнота истории изменений, документов и оплат","удобство работы заказчика и исполнителя без параллельного ручного учёта"],"contract":"Закрытый тест подтверждает, что обе стороны ведут объект в системе, спорные состояния восстанавливаются из истории, а платежный сценарий можно безопасно подключать.","models":["платный доступ для частного клиента — гипотеза","B2B-лицензия для ремонтной компании — гипотеза","сервисные / транзакционные функции — после проверки платежного контура","партнёрские сервисы вокруг ремонта — после проверки спроса"],"note":"Монетизация Renova не подтверждена. До закрытого теста корректно рассматривать эти варианты только как коммерческие гипотезы."},"en":{"buyer":"Initially, a homeowner or renovation company willing to run a real project in the system.","pays":"Hypothesis: for a governed renovation workflow, estimate and stage transparency, documents and service functions; B2B buyers may pay for managing a portfolio of projects.","pilot":"One real renovation from an estimate version through several accepted and paid stages with photos, documents and change history.","measure":["budget variance and how early it becomes visible","share of stages closed through formal handover and acceptance","completeness of change, document and payment history","ability of client and contractor to work without parallel manual tracking"],"contract":"The closed test proves both sides can run the project in the system, disputes can be reconstructed from history and the payment flow is ready for safe activation.","models":["consumer paid access — hypothesis","B2B licence for renovation companies — hypothesis","service / transaction functions — after payment-flow validation","partner services around renovation — after demand validation"],"note":"Renova monetisation is not validated. These options should be treated as commercial hypotheses until the closed test."}},"mfw":{"ru":{"buyer":"Организатор события, городской оператор или владелец событийной платформы; отдельные платные контуры могут быть полезны брендам и партнёрам.","pays":"За развёртывание и эксплуатацию цифрового слоя события: регистрация, программа, пропуска, B2B, брендовый контур, аналитика и работа с аудиторией между сезонами.","pilot":"Одно реальное событие с ограниченным набором модулей и заранее зафиксированным контуром участников, брендов и партнёров.","measure":["активация зарегистрированных участников и использование цифрового пропуска","добавления в личную программу и фактическое посещение","назначенные B2B-встречи и подтверждённые лиды","подписки на бренды и повторное взаимодействие после события","стабильность операционного контура в дни пиковой нагрузки"],"contract":"Платформа проходит реальное событие без критических сбоев, организатор получает полезные данные, а бренды и партнёры видят измеримый результат своих активностей.","models":["лицензия на событие / сезон","внедрение и операционное сопровождение","годовой доступ к платформе между событиями","платные брендовые / партнёрские модули — гипотеза","white-label для других событий — гипотеза"],"note":"Публично подтверждён MVP, но коммерческая эксплуатация на реальном событии ещё не подтверждена. Коммерческие форматы требуют пилота."},"en":{"buyer":"An event organiser, city operator or event-platform owner; separate paid modules may also be relevant to brands and partners.","pays":"For deployment and operation of the event digital layer: registration, programme, passes, B2B, brand workflows, analytics and between-season audience continuity.","pilot":"One real event with a bounded module set and a predefined participant, brand and partner scope.","measure":["registered-user activation and digital-pass usage","personal-programme saves versus actual attendance","scheduled B2B meetings and verified leads","brand follows and post-event re-engagement","operational stability during peak event load"],"contract":"The platform operates through a real event without critical failure, organisers gain useful data, and brands and partners see measurable outcomes.","models":["event / season licence","implementation and operational support","annual between-event platform access","paid brand / partner modules — hypothesis","white-label for other events — hypothesis"],"note":"The MVP is public, but commercial production use at a real event is not yet evidenced. Commercial formats require a pilot."}},"promomed":{"ru":{"buyer":"Promomed или другой организатор отраслевой конференции, для которого событие — часть долгосрочной работы с клиентами, экспертами и партнёрами.","pays":"За цифровой контур конференции и сообщества: регистрация, персональная программа, работа площадки, бронирования, партнёрский кабинет, аналитика и продолжение взаимодействия после события.","pilot":"Одна конференция или ограниченный пилотный контур: программа, персональный маршрут, статус площадки, партнёрский кабинет и последующая коммуникация.","measure":["регистрация → фактическое посещение","использование персонального маршрута и бронирований","контакты и лиды партнёров, полученные с согласием участника","переход участников к материалам и следующему взаимодействию после события","надёжность операционного контура площадки"],"contract":"Пилот подтверждает стабильную работу в день события, понятную ценность для участника и партнёра и полезную аналитику для организатора.","models":["лицензия на событие","внедрение и сопровождение","годовой контур сообщества — гипотеза","расширенные партнёрские модули — гипотеза","white-label для других отраслевых конференций — гипотеза"],"note":"Коммерческий формат не подтверждён. До пилота корректно фиксировать только состав ценности и возможные модели, но не цену или прогноз выручки."},"en":{"buyer":"Promomed or another industry-conference organiser for whom the event is part of a long-term relationship with clients, experts and partners.","pays":"For the conference and community digital layer: registration, personal programme, venue operations, booking, partner workspace, analytics and post-event continuity.","pilot":"One conference or a bounded pilot scope: programme, personal route, venue status, partner workspace and follow-up communication.","measure":["registration to actual attendance","use of personal routes and bookings","partner contacts and leads captured with attendee consent","movement from the event into materials and subsequent engagement","reliability of the venue operating layer"],"contract":"The pilot proves stable operation on event day, clear participant and partner value, and useful organiser analytics.","models":["event licence","implementation and support","year-round community layer — hypothesis","extended partner modules — hypothesis","white-label for other industry conferences — hypothesis"],"note":"The commercial format is not validated. Before a pilot, it is appropriate to define value and possible models, not pricing or revenue forecasts."}},"antiqua":{"ru":{"buyer":"Галерея, коллекционер, культурная институция или профессиональный art/research участник.","pays":"Гипотеза: за профессиональный workspace, research tooling, institutional publishing и premium collection/gallery services; commerce не является единственным ядром продукта.","pilot":"Одна реальная коллекция или галерея с набором произведений, Artist/Artwork records, related works и provenance/research material.","measure":["полнота Artwork/Artist records","доля объектов с проверяемым provenance/research context","Artwork → Artist → Related Works continuation","Save → Collection → return discovery","время подготовки институциональной публикации / research dossier"],"contract":"Пилот подтверждает, что gallery-first и research workflow создаёт измеримую ценность без смешения editorial, expertise и promotion authority.","models":["professional subscription — hypothesis","institutional publishing / research services — hypothesis","premium expert/research requests — hypothesis","auction/sales commission only for explicitly admitted commerce flows"],"note":"Коммерческая модель не подтверждена. Public page должна отделять art/research authority от любых будущих платных размещений."},"en":{"buyer":"A gallery, collector, cultural institution or professional art/research participant.","pays":"Hypothesis: for a professional workspace, research tooling, institutional publishing and premium collection/gallery services; commerce is not the sole product core.","pilot":"One real collection or gallery with artworks, Artist/Artwork records, related works and provenance/research material.","measure":["Artwork/Artist record completeness","share of works with verifiable provenance/research context","Artwork → Artist → Related Works continuation","Save → Collection → return discovery","time to prepare institutional publication / research dossier"],"contract":"The pilot proves gallery-first and research workflows create measurable value without conflating editorial, expertise and promotion authority.","models":["professional subscription — hypothesis","institutional publishing / research services — hypothesis","premium expert/research requests — hypothesis","auction/sales commission only for explicitly admitted commerce flows"],"note":"The commercial model is not validated. The public page must keep art/research authority separate from any future paid placement."}},"fashionmgmt":{"ru":{"buyer":"Fashion house, atelier или производственная компания со сложным заказным производством и несколькими управленческими ролями.","pays":"За custom enterprise operating system, внедрение, data/process migration и поддержку; внешние интеграции — отдельный scope.","pilot":"Ограниченный реальный контур: каталог/модели, несколько заказов, production operations, materials, payments, cost/WIP/capacity и month close.","measure":["доля процесса без параллельных таблиц","время от изменения заказа до обновлённого cost/CTC signal","раннее выявление bottleneck/late risk","точность Plan/Fact/CTC/Forecast","срок закрытия месяца и полнота evidence"],"contract":"Роли принимают рабочий контур, ключевые расчёты воспроизводимы, critical workflows не требуют обхода системы и определён integration/support scope.","models":["enterprise licence / recurring access — hypothesis","implementation and process migration","integration work","support / SLA"],"note":"Публичный кейс обезличен. Цена, клиент, сотрудники, реальные заказы, cash-flow и договорные условия не публикуются."},"en":{"buyer":"A fashion house, atelier or production company with complex made-to-order production and multiple management roles.","pays":"For a custom enterprise operating system, implementation, data/process migration and support; external integrations are a separate scope.","pilot":"A bounded real contour: catalogue/models, several orders, production operations, materials, payments, cost/WIP/capacity and month close.","measure":["share of process without parallel spreadsheets","time from order change to updated cost/CTC signal","early detection of bottleneck/late risk","Plan/Actual/CTC/Forecast accuracy","month-close duration and evidence completeness"],"contract":"Roles accept the operating contour, key calculations are reproducible, critical workflows do not require bypassing the system and integration/support scope is defined.","models":["enterprise licence / recurring access — hypothesis","implementation and process migration","integration work","support / SLA"],"note":"The public case is anonymised. Pricing, client identity, employees, real orders, cash flow and contract terms are not published."}},"furproduction":{"ru":{"buyer":"Производственная компания с дорогим неоднородным сырьём и требованием traceability до конкретной партии/лота.","pays":"За vertical ERP, migration/reconciliation исходных данных, внедрение операционного контура и поддержку.","pilot":"Ограниченный production contour: procurement → lots → stock → norms/BOM → production orders → material usage → finished goods → payments/documents.","measure":["расхождение исходного реестра и system stock","точность quantityRemaining по лотам","совпадение landed/unit cost с источником","полнота lot → order → finished-goods traceability","восстановимость из audit/backup"],"contract":"Acceptance подтверждает точность остатков и lot-cost, корректность order cost, role controls и воспроизводимое восстановление; затем фиксируется rollout/support scope.","models":["vertical ERP licence / recurring access — hypothesis","data migration and reconciliation","implementation","support / integrations"],"note":"Публично не раскрываются client/brand, suppliers, buyers, реальные lot/order numbers, цены, платежи, документы или source registers."},"en":{"buyer":"A production company using expensive heterogeneous raw material where traceability to the exact batch/lot matters.","pays":"For a vertical ERP, source-data migration/reconciliation, operating rollout and support.","pilot":"A bounded production contour: procurement → lots → stock → norms/BOM → production orders → material usage → finished goods → payments/documents.","measure":["source register versus system-stock variance","lot quantityRemaining accuracy","landed/unit cost match to source","lot → order → finished-goods traceability completeness","recoverability from audit/backup"],"contract":"Acceptance proves inventory and lot-cost accuracy, correct order cost, role controls and reproducible recovery; rollout/support scope can then be fixed.","models":["vertical ERP licence / recurring access — hypothesis","data migration and reconciliation","implementation","support / integrations"],"note":"The public case does not disclose the client/brand, suppliers, buyers, real lot/order numbers, prices, payments, documents or source registers."}}};
function installCommercialClarity(lang, $, projects) {
  const en = lang === 'en';
  const data = V2_COMMERCIAL;
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (ch) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const portfolio = $('#v2-portfolio');
  const modal = $('#modal');

  const renderPanel = (id) => {
    const d = data[id]?.[en ? 'en' : 'ru'];
    if (!d) return '';
    return `
      <div class="v2-commercial-grid">
        <div><span>${en ? 'Buyer' : 'Кто покупатель'}</span><p>${esc(d.buyer)}</p></div>
        <div><span>${en ? 'What they pay for' : 'За что платит'}</span><p>${esc(d.pays)}</p></div>
        <div><span>${en ? 'First sellable pilot' : 'Первый продаваемый пилот'}</span><p>${esc(d.pilot)}</p></div>
        <div><span>${en ? 'What we measure' : 'Что измеряем'}</span><ul>${d.measure.map((x)=>`<li>${esc(x)}</li>`).join('')}</ul></div>
        <div><span>${en ? 'Pilot → contract gate' : 'Что превращает пилот в контракт'}</span><p>${esc(d.contract)}</p></div>
        <div><span>${en ? 'Possible revenue mechanics' : 'Возможные модели выручки'}</span><ul>${d.models.map((x)=>`<li>${esc(x)}</li>`).join('')}</ul></div>
      </div>
      <p class="v2-commercial-note">${esc(d.note)}</p>`;
  };

  const attachPortfolio = () => {
    if (!portfolio) return;
    portfolio.querySelectorAll('.v2-product').forEach((card) => {
      const id = card.dataset.v2Product;
      if (!id || !data[id] || card.querySelector('[data-v2-commercial]')) return;
      const actions = card.querySelector('.v2-product-actions');
      if (!actions) return;
      const btn = document.createElement('button');
      btn.type='button';
      btn.className='btn btn-sm v2-commercial-toggle';
      btn.dataset.v2Commercial=id;
      btn.setAttribute('aria-expanded','false');
      btn.textContent=en ? 'Commercial model' : 'Коммерческая модель';
      actions.append(btn);
      const panel=document.createElement('section');
      panel.className='v2-commercial-panel';
      panel.hidden=true;
      panel.innerHTML=renderPanel(id);
      card.append(panel);
    });
  };

  if (portfolio && !portfolio.__v2CommercialBound) {
    portfolio.__v2CommercialBound='1';
    new MutationObserver(attachPortfolio).observe(portfolio,{childList:true,subtree:true});
    portfolio.addEventListener('click',(e)=>{
      const btn=e.target.closest('[data-v2-commercial]');
      if(!btn) return;
      const panel=btn.closest('.v2-product')?.querySelector('.v2-commercial-panel');
      if(!panel) return;
      const open=panel.hidden;
      panel.hidden=!open;
      btn.setAttribute('aria-expanded',String(open));
      btn.textContent=open ? (en?'Hide commercial model':'Свернуть коммерческую модель') : (en?'Commercial model':'Коммерческая модель');
    });
    attachPortfolio();
  }

  if (modal) {
    let section=$('#v2-commercial-dossier');
    if(!section){
      section=document.createElement('section');
      section.id='v2-commercial-dossier';
      section.className='v2-commercial-dossier';
      $('#status')?.before(section);
    }
    const paint=()=>{
      const id=modal.dataset.project;
      const d=data[id]?.[en?'en':'ru'];
      if(!d || !modal.open){section.hidden=true;return;}
      section.hidden=false;
      section.innerHTML=`
        <div class="v2-commercial-head">
          <p class="eyebrow">${en?'Commercial clarity':'Коммерческая модель'}</p>
          <h3>${en?'How the product can become a contract':'Как продукт может превратиться в контракт'}</h3>
          <span>${en?'Working hypothesis · validate in pilot':'Рабочая гипотеза · подтверждается пилотом'}</span>
        </div>
        ${renderPanel(id)}`;
    };
    if(!modal.__v2CommercialBound){
      modal.__v2CommercialBound='1';
      new MutationObserver(paint).observe(modal,{attributes:true,attributeFilter:['open','data-project']});
    }
    paint();
  }
}


/* V2.8 commercial proof and investor readiness */
const V2_PROOF = {"syntha":{"ru":{"proven":["единый продуктово-коммерческий контур уже собран","заказы, изменения и экономика продукта ведутся в одной рабочей логике","ключевые пользовательские сценарии готовы к проверке на реальном сезоне"],"unproven":["устойчивое ежедневное использование внешним брендом","реальная стоимость внедрения в конкретной компании","готовность клиента платить по регулярной модели"],"risk":"Главный риск — не наличие функций, а реальное внедрение: сможет ли команда бренда вести сезонный цикл в системе без возврата к ручной сверке.","derisk":"Пилот с одним брендом должен показать, насколько система снижает ручную работу и помогает быстрее принимать коммерческие решения.","data":["доля сценариев, которые проходят без внешних таблиц","время на подготовку и подтверждение заказа","число расхождений по цене, доступности и экономике","регулярность использования ключевыми ролями"],"scale":"масштабировать, если основной сезонный сценарий работает стабильно и даёт измеримое сокращение ручной работы","revise":"пересобрать объём внедрения, если ценность подтверждается, но использование остаётся слишком сложным","stop":"не масштабировать текущий коммерческий сценарий, если пилот не даёт измеримого преимущества перед существующим процессом"},"en":{"proven":["the core product-to-commerce workflow is built","orders, changes and product economics are managed in one operating logic","key user journeys are ready for real-season validation"],"unproven":["sustained daily use by an external brand","real implementation cost in a client organisation","willingness to pay under a recurring model"],"risk":"The primary risk is adoption rather than feature count: whether a brand team can run a real seasonal workflow without falling back to manual reconciliation.","derisk":"A one-brand pilot should show whether the product reduces manual work and improves decision speed.","data":["share of workflows completed without external spreadsheets","time to prepare and confirm an order","number of price, availability and economics discrepancies","regular use by key roles"],"scale":"scale if the core seasonal workflow is stable and measurably reduces manual work","revise":"revise rollout scope if value is visible but adoption remains too complex","stop":"do not scale the current commercial path if the pilot shows no measurable advantage over the existing process"}},"chatx":{"ru":{"proven":["коммуникации, встречи, задачи, документы и согласования связаны в одном рабочем контуре","решения сохраняют связь с исходным контекстом","ключевые корпоративные сценарии готовы к пилотной проверке"],"unproven":["устойчивое ежедневное использование внутри внешней компании","готовность команды сократить параллельную работу в других сервисах","ценность для разных ролей при реальном внедрении"],"risk":"Главный риск — организационное внедрение: продукт должен стать местом реальной работы, а не ещё одним параллельным сервисом.","derisk":"Пилот в одном подразделении должен проверить ежедневное использование и связь разговор → решение → задача → результат.","data":["активность пользователей","доля решений и задач, которые можно проследить до исходного контекста","доля работы, которая остаётся вне системы","объём ручного дублирования между сервисами"],"scale":"масштабировать, если команда использует ChatX как основной рабочий контур","revise":"пересобрать набор сценариев или внедрение, если использование есть, но значимая часть работы остаётся снаружи","stop":"не масштабировать, если продукт не становится частью ежедневной работы"},"en":{"proven":["communication, meetings, tasks, documents and approvals are connected in one work environment","decisions retain source context","key company workflows are ready for pilot validation"],"unproven":["sustained daily use inside an external company","whether teams reduce parallel work in other tools","value across different roles in a real rollout"],"risk":"The primary risk is organisational adoption: the product must become the place where work happens, not another parallel service.","derisk":"A pilot in one department should test daily use and conversation → decision → task → outcome continuity.","data":["user activity","share of decisions and tasks traceable to source context","share of work still happening outside the system","manual duplication across tools"],"scale":"scale if the team uses ChatX as its primary work environment","revise":"revise scope or rollout if usage exists but material work remains outside","stop":"do not scale if the product does not become part of daily work"}},"renova":{"ru":{"proven":["смета, этапы, приёмка, документы и финансовые состояния объединены в одном мобильном продукте","история изменений и подтверждений сохраняется по объекту","основной сценарий подготовлен к проверке на реальном ремонте"],"unproven":["совместное использование заказчиком и исполнителем на реальном объекте","работа реальных платежных сценариев","платёжеспособный спрос и наиболее жизнеспособная модель монетизации"],"risk":"Главный риск — двустороннее принятие процесса: если одна из сторон продолжает вести ключевые договорённости вне системы, ценность общей истории снижается.","derisk":"Закрытый тест должен показать, способны ли заказчик и исполнитель вести один объект в общей системе от сметы до приёмки этапов.","data":["полнота истории изменений","доля этапов, закрытых через формальную приёмку","момент обнаружения отклонения бюджета","доля критичных договорённостей, оставшихся вне продукта"],"scale":"масштабировать после подтверждения устойчивого двустороннего использования","revise":"пересобрать роли или пользовательский сценарий, если продукт удерживает только одну сторону","stop":"не переходить к масштабированию, если реальный объект всё ещё требует параллельного ручного учёта"},"en":{"proven":["estimate, stages, acceptance, documents and payment states are connected in one mobile product","change and acceptance history is retained for the project","the core workflow is ready for a real renovation test"],"unproven":["two-sided use by client and contractor on a real project","live payment scenarios","willingness to pay and the most viable monetisation model"],"risk":"The primary risk is two-sided adoption: if either side keeps critical agreements outside the system, the value of a shared history falls.","derisk":"A closed test should prove whether client and contractor can run one project in a shared workflow from estimate to stage acceptance.","data":["completeness of change history","share of stages closed through formal acceptance","how early budget variance becomes visible","share of critical agreements still outside the product"],"scale":"scale after sustained two-sided use is evidenced","revise":"revise roles or user journey if the product retains only one side","stop":"do not scale if a real project still requires parallel manual tracking"}},"mfw":{"ru":{"proven":["общий цифровой контур объединяет три направления платформы","личный маршрут, брендовые и B2B-сценарии собраны в единую пользовательскую логику","платформа готова к следующему этапу проверки на реальном событии"],"unproven":["работа под реальной нагрузкой события","фактическая ценность для организатора, брендов и партнёров","повторное взаимодействие аудитории между событиями"],"risk":"Главный риск — доказать, что цифровой слой полезен не только во время мероприятия, но и сохраняет ценность между сезонами.","derisk":"Пилот на одном реальном событии должен проверить пользовательскую активность, B2B-взаимодействия и продолжение отношений после события.","data":["активация участников","использование личной программы","назначенные B2B-встречи и подтверждённые лиды","повторные действия после события"],"scale":"масштабировать, если организатор и партнёры получают измеримые результаты во время и после события","revise":"пересобрать модульный состав, если основной событийный сценарий работает, а послесобытийная ценность остаётся слабой","stop":"не масштабировать формат, если пилот не создаёт измеримого результата для организатора и партнёров"},"en":{"proven":["one digital layer connects the three platform directions","personal journeys, brand and B2B scenarios are assembled into one user logic","the platform is ready for its next real-event validation step"],"unproven":["operation under real event load","actual value to organisers, brands and partners","repeat engagement between events"],"risk":"The primary risk is proving that the digital layer matters beyond event day and preserves value between seasons.","derisk":"A real-event pilot should test participant activity, B2B interaction and post-event continuity.","data":["participant activation","personal programme usage","scheduled B2B meetings and verified leads","repeat actions after the event"],"scale":"scale if organisers and partners receive measurable outcomes during and after the event","revise":"revise module scope if event-day utility works but post-event value remains weak","stop":"do not scale if the pilot creates no measurable value for organisers and partners"}},"promomed":{"ru":{"proven":["круглогодичный контент и цифровой слой конференции собраны в одной рабочей версии","персональный маршрут, партнёрские сценарии и аналитика объединены в общий пользовательский путь","ключевые сценарии готовы к controlled pilot"],"unproven":["использование на реальной конференции","фактическая ценность для участников и партнёров","ценность круглогодичной модели и коммерческий формат"],"risk":"Главный риск — доказать, что цифровой слой полезен не только в день конференции, но и усиливает отношения с участниками и партнёрами после неё.","derisk":"Контролируемый пилот должен проверить пользовательский маршрут, партнёрский сценарий и продолжение взаимодействия после события.","data":["регистрация → посещение","использование персонального маршрута","контакты партнёров с согласия участника","возврат к материалам и взаимодействию после события"],"scale":"масштабировать, если событие проходит устойчиво и после него остаётся измеримое взаимодействие","revise":"пересобрать годовой контур или партнёрские функции, если день события работает, а последующая активность остаётся слабой","stop":"не масштабировать круглогодичную модель, если после события не возникает подтверждаемой дополнительной ценности"},"en":{"proven":["year-round content and the conference digital layer are assembled in one working version","personal journeys, partner workflows and analytics are connected in one user path","key scenarios are ready for a controlled pilot"],"unproven":["use at a real conference","actual value to participants and partners","value of the year-round model and commercial format"],"risk":"The primary risk is proving that the digital layer matters beyond conference day and strengthens participant and partner relationships afterwards.","derisk":"A controlled pilot should test the participant journey, partner workflow and post-event continuity.","data":["registration → attendance","personal journey usage","partner contacts captured with consent","return to materials and engagement after the event"],"scale":"scale if the event is stable and measurable engagement continues afterwards","revise":"revise the year-round or partner layer if event-day utility works but follow-up activity remains weak","stop":"do not scale the year-round model if no verifiable additional value exists after the event"}},"antiqua":{"ru":{"proven":["gallery-first journey уже работает как основной consumer flow","Artwork → Artist → Related Works и Collections → Taste связаны","production admission / research trust имеют machine-verifiable contracts"],"unproven":["external collection/gallery usage","production PostgreSQL admission in target environment","commercial willingness to pay"],"risk":"Главный риск — снова скатиться в generic marketplace или legacy antiques вместо глубокого art/research продукта.","derisk":"Пилот на реальных произведениях должен проверить record quality, discovery/retention и professional research workflow.","data":["Artwork/Artist completeness","provenance evidence coverage","Artwork → Artist continuation","Save → Collection conversion","D7/D30 return to personalized Gallery"],"scale":"масштабировать, если art/research workflow сохраняет качество и даёт повторное использование","revise":"пересобрать community/commerce layers, если они размывают Artwork/Artist authority","stop":"не расширять generic marketplace механику, если она не усиливает gallery-first journey"},"en":{"proven":["the gallery-first journey is the primary consumer flow","Artwork → Artist → Related Works and Collections → Taste are connected","production admission / research trust have machine-verifiable contracts"],"unproven":["external collection/gallery use","production PostgreSQL admission in the target environment","commercial willingness to pay"],"risk":"The main risk is drifting back into a generic marketplace or legacy antiques instead of a deep art/research product.","derisk":"A real-art pilot should validate record quality, discovery/retention and the professional research workflow.","data":["Artwork/Artist completeness","provenance evidence coverage","Artwork → Artist continuation","Save → Collection conversion","D7/D30 return to personalised Gallery"],"scale":"scale if the art/research workflow preserves quality and drives repeat use","revise":"revise community/commerce layers if they dilute Artwork/Artist authority","stop":"do not expand generic marketplace mechanics if they do not strengthen the gallery-first journey"}},"fashionmgmt":{"ru":{"proven":["сквозной product/order/production/cost core работает","роль и доступ отделены от фамилий и business/technical authority","cost snapshots, WIP/capacity, liquidity/month-close и audit уже реализованы"],"unproven":["долгосрочная adoption всех ролей в реальном режиме","полный live role × device QA","экономический эффект против прежнего spreadsheet process"],"risk":"Главный риск — не функциональность, а реальное замещение параллельного Excel и дисциплина ролей.","derisk":"Controlled rollout должен измерить отказ от ручной сверки, скорость решения и качество cost/capacity signals.","data":["parallel spreadsheet escape rate","decision lead time","Plan/Fact/CTC variance","late/bottleneck lead time","month-close duration"],"scale":"масштабировать внутри клиента после устойчивого использования и воспроизводимых расчётов","revise":"пересобрать UX/role scope, если system-of-record есть, но пользователи продолжают обходить его","stop":"не расширять интеграции до acceptance базового operating loop"},"en":{"proven":["end-to-end product/order/production/cost core is working","role access is separated from personal identity and business/technical authority","cost snapshots, WIP/capacity, liquidity/month close and audit are implemented"],"unproven":["long-term adoption across all roles in live operation","complete live role × device QA","economic impact versus the prior spreadsheet process"],"risk":"The main risk is not feature count but replacing parallel spreadsheets and sustaining role discipline.","derisk":"The controlled rollout should measure manual-reconciliation reduction, decision speed and cost/capacity signal quality.","data":["parallel spreadsheet escape rate","decision lead time","Plan/Actual/CTC variance","late/bottleneck lead time","month-close duration"],"scale":"scale within the client after sustained use and reproducible calculations","revise":"revise UX/role scope if a system of record exists but users still bypass it","stop":"do not broaden integrations before the base operating loop is accepted"}},"furproduction":{"ru":{"proven":["procurement → specific lot → stock → production → finished goods traceability работает","specific-identification costing исключает скрытое усреднение партий","audit, transactional corrections, backup/restore и concurrency protection реализованы"],"unproven":["долгосрочное использование как единственного production source of truth","полная автоматизация внешних источников","коммерческий эффект и willingness to pay вне текущего контекста"],"risk":"Главный риск — data integrity: любая неверная связь lot/usage/cost разрушает доверие к остатку и себестоимости.","derisk":"Controlled use и повторная reconciliation должны доказать quantity, identity, cost и recovery на реальных операционных циклах.","data":["source/system inventory variance","lot-cost variance","orphan/ambiguous lot count","order-cost variance","recovery RPO/RTO evidence"],"scale":"масштабировать только при стабильном zero/controlled discrepancy contour","revise":"пересобрать import/reconciliation, если source identity остаётся неоднозначной","stop":"не считать систему authoritative при необъяснимых расхождениях lot/stock/cost"},"en":{"proven":["procurement → specific lot → stock → production → finished-goods traceability works","specific-identification costing avoids hidden lot averaging","audit, transactional corrections, backup/restore and concurrency protection are implemented"],"unproven":["long-term use as the sole production source of truth","full automation of external sources","commercial impact and willingness to pay outside the current context"],"risk":"The primary risk is data integrity: any wrong lot/usage/cost link destroys trust in inventory and product cost.","derisk":"Controlled use and repeat reconciliation should prove quantity, identity, cost and recovery across real operating cycles.","data":["source/system inventory variance","lot-cost variance","orphan/ambiguous lot count","order-cost variance","recovery RPO/RTO evidence"],"scale":"scale only with a stable zero/controlled discrepancy contour","revise":"revise import/reconciliation if source identity remains ambiguous","stop":"do not treat the system as authoritative while unexplained lot/stock/cost discrepancies remain"}}};
function installCommercialProof(lang, $, projects) {
  const en = lang === 'en';
  const data = V2_PROOF;
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (ch) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const list = (arr) => `<ul>${(arr||[]).map((x)=>`<li>${esc(x)}</li>`).join('')}</ul>`;
  const panel = (id) => {
    const d=data[id]?.[en?'en':'ru'];
    if(!d) return '';
    return `
      <div class="v2-proof-grid">
        <div class="v2-proof-good"><span>${en?'Evidenced now':'Что уже доказано'}</span>${list(d.proven)}</div>
        <div><span>${en?'Not evidenced yet':'Что ещё не доказано'}</span>${list(d.unproven)}</div>
        <div><span>${en?'Primary risk':'Главный риск'}</span><p>${esc(d.risk)}</p></div>
        <div><span>${en?'How the next pilot de-risks it':'Как следующий пилот снимает риск'}</span><p>${esc(d.derisk)}</p></div>
        <div class="v2-proof-data"><span>${en?'Evidence expected from pilot':'Какие данные должны появиться'}</span>${list(d.data)}</div>
      </div>
      <div class="v2-proof-decisions">
        <div><b>${en?'SCALE':'МАСШТАБИРОВАТЬ'}</b><p>${esc(d.scale)}</p></div>
        <div><b>${en?'REVISE':'ПЕРЕСОБРАТЬ'}</b><p>${esc(d.revise)}</p></div>
        <div><b>${en?'STOP':'ОСТАНОВИТЬ'}</b><p>${esc(d.stop)}</p></div>
      </div>`;
  };

  const portfolio=$('#v2-portfolio');
  const attach=()=>{
    portfolio?.querySelectorAll('.v2-product').forEach((card)=>{
      const id=card.dataset.v2Product;
      if(!id || !data[id] || card.querySelector('[data-v2-proof]')) return;
      const actions=card.querySelector('.v2-product-actions');
      if(!actions) return;
      const btn=document.createElement('button');
      btn.type='button'; btn.className='btn btn-sm v2-proof-toggle'; btn.dataset.v2Proof=id;
      btn.setAttribute('aria-expanded','false');
      btn.textContent=en?'Investor readiness':'Доказательства и риски';
      actions.append(btn);
      const sec=document.createElement('section');
      sec.className='v2-proof-panel'; sec.hidden=true; sec.innerHTML=panel(id); card.append(sec);
    });
  };
  if(portfolio && !portfolio.__v2ProofBound){
    portfolio.__v2ProofBound='1';
    new MutationObserver(attach).observe(portfolio,{childList:true,subtree:true});
    portfolio.addEventListener('click',(e)=>{
      const btn=e.target.closest('[data-v2-proof]');
      if(!btn) return;
      const sec=btn.closest('.v2-product')?.querySelector('.v2-proof-panel');
      if(!sec) return;
      const open=sec.hidden; sec.hidden=!open; btn.setAttribute('aria-expanded',String(open));
      btn.textContent=open ? (en?'Hide investor readiness':'Свернуть доказательства') : (en?'Investor readiness':'Доказательства и риски');
    });
    attach();
  }

  const modal=$('#modal');
  if(modal){
    let sec=$('#v2-proof-dossier');
    if(!sec){
      sec=document.createElement('section');
      sec.id='v2-proof-dossier'; sec.className='v2-proof-dossier';
      $('#status')?.before(sec);
    }
    const paint=()=>{
      const id=modal.dataset.project;
      if(!modal.open || !data[id]){sec.hidden=true;return;}
      sec.hidden=false;
      sec.innerHTML=`<div class="v2-proof-head"><p class="eyebrow">${en?'Investor readiness':'Инвестиционная готовность'}</p><h3>${en?'What is proven, what is still at risk, and what the pilot must decide':'Что доказано, что остаётся риском и какое решение должен дать пилот'}</h3></div>${panel(id)}`;
    };
    if(!modal.__v2ProofBound){
      modal.__v2ProofBound='1';
      new MutationObserver(paint).observe(modal,{attributes:true,attributeFilter:['open','data-project']});
    }
    paint();
  }
}


/* V2.10 strategic horizon */
const V2_HORIZONS = {"syntha":{"ru":{"title":"Расширение экосистемы","body":"Стратегический горизонт — развивать платформу вокруг более тесного взаимодействия брендов, производственных и коммерческих партнёров.","items":["больше межкомпанейских сценариев","более сильный контур работы с поставщиками и партнёрами"],"boundary":"Это направление развития, а не описание уже реализованной функции."},"en":{"title":"Ecosystem expansion","body":"Strategic horizon: deepen collaboration between brands, production partners and commercial partners.","items":["more cross-company workflows","stronger supplier and partner collaboration"],"boundary":"This is a development direction, not a claim of current implementation."}},"chatx":{"ru":{"title":"Межкорпоративная работа","body":"Стратегический горизонт — безопасно расширять рабочие процессы за пределы одной компании.","items":["совместная работа с внешними организациями","проверяемое подтверждение завершённых действий"],"boundary":"Это направление развития, а не описание уже реализованной функции."},"en":{"title":"Cross-company work","body":"Strategic horizon: safely extend governed workflows beyond one organisation.","items":["collaboration with external organisations","verifiable confirmation of completed work"],"boundary":"This is a development direction, not a claim of current implementation."}},"renova":{"ru":{"title":"Экосистема вокруг объекта","body":"Стратегический горизонт — накапливать полезную историю ремонта и обслуживания объекта для собственника и профессиональных участников.","items":["долгосрочная история объекта","более прозрачная работа с подрядчиками и сервисными партнёрами"],"boundary":"Это направление развития, а не описание уже реализованной функции."},"en":{"title":"Property ecosystem","body":"Strategic horizon: build useful long-term renovation and service history around the property.","items":["long-term property history","more transparent contractor and service-partner collaboration"],"boundary":"This is a development direction, not a claim of current implementation."}},"mfw":{"ru":{"title":"Платформа между событиями","body":"Стратегический горизонт — сделать профессиональные связи и взаимодействие брендов полезными не только в дни мероприятия.","items":["непрерывность отношений между сезонами","более сильный B2B и партнёрский контур"],"boundary":"Это направление развития, а не описание уже реализованной функции."},"en":{"title":"Between-event platform","body":"Strategic horizon: keep professional relationships and brand collaboration useful beyond event days.","items":["continuity between seasons","stronger B2B and partner workflows"],"boundary":"This is a development direction, not a claim of current implementation."}},"promomed":{"ru":{"title":"Круглогодичная экспертная среда","body":"Стратегический горизонт — развивать проверяемый контент, профессиональное обучение и партнёрские форматы вокруг сообщества.","items":["более сильная система работы с экспертным контентом","новые образовательные и партнёрские форматы"],"boundary":"Это направление развития, а не описание уже реализованной функции."},"en":{"title":"Year-round expert environment","body":"Strategic horizon: expand governed expert content, professional education and partner formats around the community.","items":["stronger expert-content workflows","new education and partner formats"],"boundary":"This is a development direction, not a claim of current implementation."}},"antiqua":{"ru":{"title":"Art knowledge network","body":"Стратегический горизонт — соединить коллекции, галереи, исследователей, события и learning вокруг authoritative Artwork/Artist records.","items":["IIIF/media/provenance tooling","cultural network and institutional research services"],"boundary":"Это направление развития; public network, expert status и commerce не считаются реализованными только потому, что описаны в плане."},"en":{"title":"Art knowledge network","body":"Strategic horizon: connect collections, galleries, researchers, events and learning around authoritative Artwork/Artist records.","items":["IIIF/media/provenance tooling","cultural network and institutional research services"],"boundary":"This is a development direction; public network, expert status and commerce are not considered implemented merely because they are planned."}},"fashionmgmt":{"ru":{"title":"Fashion operations control plane","body":"Горизонт — превратить custom management system в повторяемую enterprise architecture для made-to-order fashion production без раскрытия конкретного клиента.","items":["role/process templates","production economics and capacity intelligence","controlled ERP/finance integrations"],"boundary":"Это продуктовый горизонт; публичный кейс не заявляет универсальный SaaS или конкретные клиентские метрики до их доказательства."},"en":{"title":"Fashion operations control plane","body":"Horizon: turn the custom management system into a repeatable enterprise architecture for made-to-order fashion production without exposing the client.","items":["role/process templates","production economics and capacity intelligence","controlled ERP/finance integrations"],"boundary":"This is a product horizon; the public case does not claim universal SaaS readiness or client metrics before evidence."}},"furproduction":{"ru":{"title":"Traceable material-to-product network","body":"Горизонт — стандартизировать traceability и lot economics для сложного fashion raw material от закупки до изделия.","items":["supplier/auction evidence adapters","portable lot identity and cost provenance","multi-organisation vertical ERP boundary"],"boundary":"Это roadmap после доказанной operational accuracy; supplier/client identities и исходные коммерческие данные не становятся публичными."},"en":{"title":"Traceable material-to-product network","body":"Horizon: standardise traceability and lot economics for complex fashion raw material from procurement to finished product.","items":["supplier/auction evidence adapters","portable lot identity and cost provenance","multi-organisation vertical ERP boundary"],"boundary":"This is roadmap after proven operating accuracy; supplier/client identities and source commercial data remain private."}}};
function installStrategicHorizon(lang, $, projects) {
  const en = lang === 'en';
  const modal = $('#modal');
  if (!modal) return;
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (ch) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  let sec = $('#v2-strategic-horizon');
  if (!sec) {
    sec = document.createElement('section');
    sec.id = 'v2-strategic-horizon';
    sec.className = 'v2-strategic-horizon';
    $('#status')?.after(sec);
  }
  const paint = () => {
    const id = modal.dataset.project;
    const d = V2_HORIZONS[id]?.[en ? 'en' : 'ru'];
    if (!modal.open || !d) { sec.hidden = true; return; }
    sec.hidden = false;
    sec.innerHTML = `
      <div class="v2-horizon-head">
        <p class="eyebrow">${en ? 'Strategic horizon · roadmap' : 'Стратегический горизонт · план развития'}</p>
        <h3>${esc(d.title)}</h3>
        <p>${esc(d.body)}</p>
      </div>
      <ul>${d.items.map((x)=>`<li>${esc(x)}</li>`).join('')}</ul>
      <p class="v2-horizon-boundary">${esc(d.boundary)}</p>`;
  };
  if (!modal.__v2HorizonBound) {
    modal.__v2HorizonBound = '1';
    new MutationObserver(paint).observe(modal,{attributes:true,attributeFilter:['open','data-project']});
  }
  paint();
}


/* V2.11 public-safe project status stamp */
const V2_PUBLIC_STATUS = {"syntha":{"ru":{"checked":"Проверено 7 октября 2026","gate":"Следующий внешний этап: пилот на реальном сезоне"},"en":{"checked":"Checked 7 October 2026","gate":"Next external gate: real-season pilot"}},"chatx":{"ru":{"checked":"Проверено 6 октября 2026","gate":"Следующий этап: корпоративный пилот"},"en":{"checked":"Checked 6 October 2026","gate":"Next: company pilot"}},"renova":{"ru":{"checked":"Проверено 6 октября 2026","gate":"Следующий этап: закрытый тест на реальном объекте"},"en":{"checked":"Checked 6 October 2026","gate":"Next: closed real-project test"}},"mfw":{"ru":{"checked":"Проверено 7 октября 2026","gate":"Сначала PostgreSQL /ready, затем real-event pilot"},"en":{"checked":"Checked 7 October 2026","gate":"PostgreSQL /ready first, then real-event pilot"}},"promomed":{"ru":{"checked":"Проверено 7 октября 2026","gate":"Следующий внешний этап: controlled pilot"},"en":{"checked":"Checked 7 October 2026","gate":"Next external gate: controlled pilot"}},"antiqua":{"ru":{"checked":"Проверено 7 октября 2026","gate":"Следующий этап: PostgreSQL admission → real-art pilot"},"en":{"checked":"Checked 7 October 2026","gate":"Next: PostgreSQL admission → real-art pilot"}},"fashionmgmt":{"ru":{"checked":"Проверено 7 октября 2026","gate":"Следующий этап: role/device QA → controlled rollout"},"en":{"checked":"Checked 7 October 2026","gate":"Next: role/device QA → controlled rollout"}},"furproduction":{"ru":{"checked":"Проверено 7 октября 2026","gate":"Следующий этап: operational QA → inventory/cost acceptance"},"en":{"checked":"Checked 7 October 2026","gate":"Next: operational QA → inventory/cost acceptance"}}};
function installPublicStatusStamp(lang, $, projects) {
  const en = lang === 'en';
  const modal = $('#modal');
  if (!modal) return;
  let box = $('#v2-public-status');
  if (!box) {
    box = document.createElement('div');
    box.id = 'v2-public-status';
    box.className = 'v2-public-status';
    $('#status')?.before(box);
  }
  const paint = () => {
    const id = modal.dataset.project;
    const d = V2_PUBLIC_STATUS[id]?.[en ? 'en' : 'ru'];
    const p = (projects || []).find((x) => x.id === id);
    if (!modal.open || !d || !p) { box.hidden = true; return; }
    box.hidden = false;
    box.innerHTML = '<span>' + (en ? 'Project status' : 'Статус проекта') + '</span><b>' + d.checked + '</b><em>' + p[lang].stage + '</em><small>' + d.gate + '</small>';
  };
  if (!modal.__v2PublicStatusBound) {
    modal.__v2PublicStatusBound = '1';
    new MutationObserver(paint).observe(modal,{attributes:true,attributeFilter:['open','data-project']});
  }
  paint();
}


/* V2.12 confidentiality access layer */
function installConfidentialityLayer(lang, $, projects) {
  const en = lang === 'en';
  const modal = $('#modal');
  if (!modal) return;
  let box = $('#v2-confidentiality');
  if (!box) {
    box = document.createElement('section');
    box.id = 'v2-confidentiality';
    box.className = 'v2-confidentiality';
    $('#v2-public-status')?.after(box);
  }
  const paint = () => {
    if (!modal.open || !modal.dataset.project) { box.hidden = true; return; }
    box.hidden = false;
    box.innerHTML = `
      <div>
        <p class="eyebrow">${en ? 'Public view / confidential depth' : 'Публично / конфиденциально'}</p>
        <h3>${en ? 'The site shows the value. The implementation stays protected.' : 'На сайте — ценность. Внутренняя реализация — закрыта.'}</h3>
        <p>${en
          ? 'Public materials cover the business problem, product value, maturity and next milestone. Architecture, implementation mechanics, internal controls and proprietary know-how are discussed only in a qualified conversation.'
          : 'Публично показываются бизнес-проблема, ценность продукта, стадия и следующий этап. Архитектура, внутренняя механика, контрольные процессы и собственное know-how обсуждаются только в квалифицированном диалоге.'}</p>
      </div>
      <div class="v2-confidentiality-actions">
        <button type="button" class="btn btn-primary" data-v2-confidential-demo>${en ? 'Request a confidential demo' : 'Запросить закрытое демо'}</button>
        <span>${en ? 'NDA / controlled access where appropriate' : 'NDA / ограниченный доступ — при необходимости'}</span>
      </div>`;
  };
  if (!modal.__v2ConfidentialityBound) {
    modal.__v2ConfidentialityBound = '1';
    modal.addEventListener('click', (e) => {
      if (!e.target.closest('[data-v2-confidential-demo]')) return;
      const id = modal.dataset.project;
      const p = (projects || []).find((x)=>x.id===id);
      const topic = $('#topic');
      if (topic) topic.value = 'product';
      const details = $('#details');
      if (details) details.value = en
        ? `I would like a confidential demo of ${p?.name || id}: product scope, current stage and relevant implementation details under controlled access.`
        : `Хочу закрытое демо ${p?.name || id}: продукт, текущая стадия и релевантные детали реализации в ограниченном формате.`;
      modal.close();
      $('#contact')?.scrollIntoView({behavior:'smooth',block:'start'});
      $('#form')?.dispatchEvent(new Event('input'));
    });
    new MutationObserver(paint).observe(modal,{attributes:true,attributeFilter:['open','data-project']});
  }
  paint();
}


/* V2.13 controlled disclosure ladder */
function installDisclosureLadder(lang, $, projects) {
  const en = lang === 'en';
  const modal = $('#modal');
  if (!modal) return;
  let sec = $('#v2-disclosure-ladder');
  if (!sec) {
    sec = document.createElement('section');
    sec.id = 'v2-disclosure-ladder';
    sec.className = 'v2-disclosure-ladder';
    $('#v2-confidentiality')?.after(sec);
  }
  const paint = () => {
    const id = modal.dataset.project;
    const p = (projects || []).find((x)=>x.id===id);
    if(!modal.open || !p){sec.hidden=true;return;}
    sec.hidden=false;
    const steps = en ? [
      ['01','Public view','Problem, value, maturity, commercial path and the next verifiable milestone.'],
      ['02','Qualified demo','Deeper product walkthrough, user flows, pilot scope and questions relevant to your role.'],
      ['03','NDA / diligence','Selected implementation detail, evidence, integration discussion and diligence materials when justified.']
    ] : [
      ['01','Публично','Проблема, ценность, зрелость, коммерческий путь и следующий проверяемый этап.'],
      ['02','Закрытое демо','Более глубокий разбор продукта, пользовательских сценариев, границ пилота и вопросов под вашу роль.'],
      ['03','NDA / diligence','Выборочные детали реализации, доказательства, интеграционный диалог и материалы для проверки — когда это обосновано.']
    ];
    sec.innerHTML = `
      <div class="v2-disclosure-head">
        <p class="eyebrow">${en?'Controlled disclosure':'Уровни доступа'}</p>
        <h3>${en?'More detail only when the conversation earns it':'Больше деталей — только когда это действительно нужно'}</h3>
      </div>
      <div class="v2-disclosure-grid">
        ${steps.map((s)=>`<article><span>${s[0]}</span><h4>${s[1]}</h4><p>${s[2]}</p></article>`).join('')}
      </div>
      <div class="v2-disclosure-cta">
        <button type="button" class="btn btn-primary" data-v2-disclosure-demo>${en?'Request a qualified demo':'Запросить закрытое демо'}</button>
        <button type="button" class="btn" data-v2-disclosure-diligence>${en?'Discuss NDA / diligence':'Обсудить NDA / проверку'}</button>
      </div>`;
  };
  if(!modal.__v2DisclosureBound){
    modal.__v2DisclosureBound='1';
    modal.addEventListener('click',(e)=>{
      const p=(projects||[]).find((x)=>x.id===modal.dataset.project);
      const demo=e.target.closest('[data-v2-disclosure-demo]');
      const diligence=e.target.closest('[data-v2-disclosure-diligence]');
      if(!demo && !diligence) return;
      const topic=$('#topic');
      if(topic) topic.value=diligence?'investors':'product';
      const details=$('#details');
      if(details){
        details.value = diligence
          ? (en
            ? `I would like to discuss NDA / diligence for ${p?.name || modal.dataset.project}: current maturity, pilot evidence and the appropriate level of controlled disclosure.`
            : `Хочу обсудить NDA / проверку по ${p?.name || modal.dataset.project}: текущую зрелость, подтверждения по пилоту и допустимую глубину закрытого раскрытия.`)
          : (en
            ? `I would like a qualified demo of ${p?.name || modal.dataset.project}: product value, user journey and pilot scope.`
            : `Хочу закрытое демо ${p?.name || modal.dataset.project}: ценность продукта, пользовательский путь и границы пилота.`);
      }
      modal.close();
      $('#contact')?.scrollIntoView({behavior:'smooth',block:'start'});
      $('#form')?.dispatchEvent(new Event('input'));
    });
    new MutationObserver(paint).observe(modal,{attributes:true,attributeFilter:['open','data-project']});
  }
  paint();
}


/* V2.15 deep public project dossiers for selected projects */
const V2_DEEP_PROJECTS = {"antiqua":{"ru":{"summary":"Gallery-first art platform только для живописи: oil, acrylic, tempera, watercolor, gouache и pastel. Система соединяет Artwork, Artist, Related Works, Collections, provenance, research и personalised discovery — без сведения искусства к карточке товара.","users":["Коллекционер / ценитель: discovery, save, personal collection, Taste","Галерея / художник: качественная цифровая репрезентация и contextual publishing","Куратор / историк искусства: attribution, research context, related works","Институция / архив: governed publication, source links, provenance / rights boundaries"],"workflow":["Gallery discovery → Artwork","Artwork → Artist → Related Works","Save → Collection → Taste profile","Taste → personalised discovery / return journey","Learn → books / courses / events / research","Optional commerce layer только поверх authoritative art records"],"data":["Artwork: title, attribution, period, technique, materials, dimensions, media","Artist: biography, chronology, schools / movements, related works","Provenance / exhibition / bibliography / source references","Collections, saves, Taste signals, editorial curation","Rights / media source / publication authority separated from promotion"],"economics":["Потенциальный professional subscription для research / collection workflow","Institutional publishing and research services","Premium expert / research request formats","Commerce / auction commission только в явно admitted flows","Главный KPI до monetisation: repeat discovery, record quality, research utility"],"governance":["Artwork / Artist остаются authority objects","Editorial, expertise, provenance и paid promotion — разные сигналы","Экспертный статус не выводится из popularity score","Публичная сеть — projection поверх governed entities, а не generic social feed","Legacy antique/object wording не должно возвращаться в product framing"],"proof":["Gallery → Artwork → Artist → Related Works уже является основной consumer chain","Collections → Taste retention loop реализован","Machine-verifiable production admission и research trust stack присутствуют на main","Public concept очищен до paintings-only scope и поддерживаемых painterly media"],"next":["Закрыть production PostgreSQL integrity / admission proof","Провести real-art pilot на реальной коллекции / галерее","Измерить completeness records, provenance coverage, Artwork→Artist continuation, Save→Collection, D7/D30 return","После evidence — развивать IIIF/media authority, institutional research and cultural graph"]},"en":{"summary":"A gallery-first art platform focused only on painting: oil, acrylic, tempera, watercolor, gouache and pastel. It connects Artwork, Artist, Related Works, Collections, provenance, research and personalised discovery without reducing art to a product card.","users":["Collector / enthusiast: discovery, save, personal collection and Taste","Gallery / artist: high-quality digital representation and contextual publishing","Curator / art historian: attribution, research context and related works","Institution / archive: governed publication, source links and provenance / rights boundaries"],"workflow":["Gallery discovery → Artwork","Artwork → Artist → Related Works","Save → Collection → Taste profile","Taste → personalised discovery / return journey","Learn → books / courses / events / research","Optional commerce layer only over authoritative art records"],"data":["Artwork: title, attribution, period, technique, materials, dimensions and media","Artist: biography, chronology, schools / movements and related works","Provenance / exhibition / bibliography / source references","Collections, saves, Taste signals and editorial curation","Rights / media source / publication authority kept separate from promotion"],"economics":["Potential professional subscription for research / collection workflow","Institutional publishing and research services","Premium expert / research request formats","Commerce / auction commission only in explicitly admitted flows","Primary pre-monetisation KPI: repeat discovery, record quality and research utility"],"governance":["Artwork / Artist remain authority objects","Editorial, expertise, provenance and paid promotion are separate signals","Expert status is not inferred from popularity","Public network is a projection over governed entities, not a generic social feed","Legacy antique/object framing must not return"],"proof":["Gallery → Artwork → Artist → Related Works is the main consumer chain","Collections → Taste retention loop is implemented","Machine-verifiable production admission and research trust stack exist on main","Public concept is now limited to paintings-only scope and supported painterly media"],"next":["Close production PostgreSQL integrity / admission proof","Run a real-art pilot with a real collection / gallery","Measure record completeness, provenance coverage, Artwork→Artist continuation, Save→Collection and D7/D30 return","After evidence, expand IIIF/media authority, institutional research and cultural graph"]}},"fashionmgmt":{"ru":{"summary":"Confidential Fashion Management OS — единая операционная система для fashion house / atelier: от разработки модели и заказа до производства, себестоимости, мощностей, платежей, 13-недельной ликвидности и закрытия месяца.","users":["Собственник / CEO: экономика, cash, risk, capacity, month close","Операционный руководитель: заказ, сроки, bottlenecks, cross-function execution","Производство / цеха: назначенные операции, нормы, факт, статус","Закупка / материалы: потребность, availability, cost input","Финансы / бухгалтерия: платежи, cash plan, Plan/Fact/CTC/Forecast","Admin / technical role: система без автоматического бизнес-authority"],"workflow":["Model / catalogue master → commercial order","Order → operation template / production route","Materials / rates / operations → cost snapshot","WIP ageing → capacity / bottleneck / due-date signal","Payments → 13-week liquidity","Completion → frozen final-cost snapshot","Month close → evidence / benefits register / management review"],"data":["Product / model / variant / order / customer","Operation templates, workshop stages, standards and actuals","Materials, purchase inputs, rates and price snapshots","Plan / Fact / CTC / Forecast cost layers","WIP, capacity, allocation queue, due dates and blockers","Payments, liquidity, month-close evidence and audit events"],"economics":["Раньше видеть cost overrun и late-risk до финала заказа","Снижать manual reconciliation между производством, закупкой и финансами","Сокращать decision lead time по capacity / cost / payment","Закрывать месяц на frozen evidence вместо ручной реконструкции","Потенциальная модель: enterprise licence + implementation + integrations + support/SLA"],"governance":["Role-based permissions по реальной operating map","Snapshot ставок / цен в момент события, чтобы история не переписывалась","Frozen final-cost после закрытия заказа","Month close и benefits требуют owner / evidence","Audit trail для значимых действий","Safe update / rollback и controlled integrations"],"proof":["Working product/order/production core собран","Plan / Fact / CTC / Forecast и frozen final cost существуют","WIP / capacity / bottleneck / allocation logic реализованы","13-week liquidity, month close и benefits register присутствуют","Responsive monitor / tablet / phone QA ведётся на реальных ролях"],"next":["Закрыть live role × device QA","Довести operation templates, standards, due-date / capacity и cost calculator","Провести controlled rollout на реальном operating contour","Измерить spreadsheet escape rate, decision lead time, Plan/Fact/CTC variance, late-risk lead time и month-close duration"]},"en":{"summary":"A confidential Fashion Management OS — one operating system for a fashion house / atelier, from model development and orders to production, cost, capacity, payments, 13-week liquidity and month close.","users":["Owner / CEO: economics, cash, risk, capacity and month close","Operations lead: order, deadlines, bottlenecks and cross-function execution","Production / workshops: assigned operations, standards, actuals and status","Procurement / materials: demand, availability and cost input","Finance / accounting: payments, cash plan and Plan/Actual/CTC/Forecast","Admin / technical role: system access without automatic business authority"],"workflow":["Model / catalogue master → commercial order","Order → operation template / production route","Materials / rates / operations → cost snapshot","WIP ageing → capacity / bottleneck / due-date signal","Payments → 13-week liquidity","Completion → frozen final-cost snapshot","Month close → evidence / benefits register / management review"],"data":["Product / model / variant / order / customer","Operation templates, workshop stages, standards and actuals","Materials, purchase inputs, rates and price snapshots","Plan / Actual / CTC / Forecast cost layers","WIP, capacity, allocation queue, due dates and blockers","Payments, liquidity, month-close evidence and audit events"],"economics":["Expose cost overrun and late risk before order completion","Reduce manual reconciliation across production, procurement and finance","Shorten decision lead time on capacity / cost / payment","Close the month on frozen evidence instead of manual reconstruction","Potential model: enterprise licence + implementation + integrations + support/SLA"],"governance":["Role-based permissions mapped to real operating roles","Snapshot rates / prices at event time so history is not silently rewritten","Frozen final cost after order close","Month close and benefits require owner / evidence","Audit trail for significant actions","Safe update / rollback and controlled integrations"],"proof":["Working product/order/production core exists","Plan / Actual / CTC / Forecast and frozen final cost exist","WIP / capacity / bottleneck / allocation logic is implemented","13-week liquidity, month close and benefits register are present","Responsive monitor / tablet / phone QA is being run by real roles"],"next":["Close live role × device QA","Complete operation templates, standards, due-date / capacity logic and cost calculator","Run a controlled rollout on a real operating contour","Measure spreadsheet escape rate, decision lead time, Plan/Actual/CTC variance, late-risk lead time and month-close duration"]}},"furproduction":{"ru":{"summary":"Confidential FUR PRODUCTION OS — vertical ERP для дорогого неоднородного сырья, где критична traceability конкретной партии: закупка → landed cost → lot → склад → нормы → производство → списание → готовое изделие → платежи / документы → audit.","users":["Закупка: supplier / auction / purchase inputs / landed cost","Склад: конкретные lot identities, quantity remaining, movements","Технолог / производство: norms, BOM, lot-specific usage, production order","Руководитель: order cost, raw-material exposure, discrepancies","Финансы / accounting: payments, cost components, reconciliation","Контроль / audit: before-after history, corrections, backup / recovery"],"workflow":["Supplier / procurement → purchase cost components","Purchase → specific raw-material lot","Lot → warehouse movements / reserve / quantity remaining","Model / BOM / norm → production order","Production order → consume exact lot quantity","Correction → transactional return old quantity / consume new quantity","Finished goods → fitting / status / documents / payments","Reconciliation → audit / backup / recovery"],"data":["Supplier / purchase / currency / landed-cost components","Lot identity, origin, quantity, unit cost, remaining quantity","Warehouse movements, reservations and consumption","Model / BOM / norm / production order","Production expenses and finished-goods cost","Payments, documents, fittings and audit events"],"economics":["Specific-identification costing вместо скрытого average cost","Точнее inventory value и фактическая себестоимость конкретного изделия","Меньше потерь на ошибочном списании дорогого сырья","Быстрее reconciliation между реестром, складом и производством","Потенциальная модель: vertical ERP licence + migration/reconciliation + implementation + support"],"governance":["После использования партии critical purchase / lot fields не должны тихо переписываться","Корректировки проходят transactionally и сохраняют причинную историю","AuditLog хранит before / after","Role scope разделяет procurement, warehouse, technology, finance and management","Backup / restore и concurrent-write protection — часть authority, а не опция"],"proof":["Procurement → lot → warehouse → production → finished goods traceability работает","Specific-identification costing реализован","Norms/BOM, material usage и production expenses связаны","Payments, documents, fittings and audit history присутствуют","Backup / restore, transactional safety and concurrent overwrite protection реализованы"],"next":["Продолжить source reconciliation и operational QA","Закрыть discrepancy contour по quantity, identity, landed cost и order cost","Провести controlled production use как единый source of truth","Acceptance: inventory accuracy, lot-cost accuracy, order-cost reproducibility и recovery proof"]},"en":{"summary":"A confidential FUR PRODUCTION OS — a vertical ERP for expensive heterogeneous raw material where exact-lot traceability is critical: procurement → landed cost → lot → stock → norms → production → consumption → finished product → payments / documents → audit.","users":["Procurement: supplier / auction / purchase inputs / landed cost","Warehouse: exact lot identities, quantity remaining and movements","Technology / production: norms, BOM, lot-specific usage and production order","Management: order cost, raw-material exposure and discrepancies","Finance / accounting: payments, cost components and reconciliation","Control / audit: before-after history, corrections, backup / recovery"],"workflow":["Supplier / procurement → purchase cost components","Purchase → specific raw-material lot","Lot → warehouse movements / reserve / quantity remaining","Model / BOM / norm → production order","Production order → consume exact lot quantity","Correction → transactionally return old quantity / consume new quantity","Finished goods → fitting / status / documents / payments","Reconciliation → audit / backup / recovery"],"data":["Supplier / purchase / currency / landed-cost components","Lot identity, origin, quantity, unit cost and remaining quantity","Warehouse movements, reservations and consumption","Model / BOM / norm / production order","Production expenses and finished-goods cost","Payments, documents, fittings and audit events"],"economics":["Specific-identification costing instead of hidden average cost","More accurate inventory value and actual cost per finished product","Lower loss from wrong consumption of expensive material","Faster reconciliation across source register, warehouse and production","Potential model: vertical ERP licence + migration/reconciliation + implementation + support"],"governance":["Critical purchase / lot fields must not be silently rewritten after consumption","Corrections are transactional and preserve causal history","AuditLog retains before / after","Role scope separates procurement, warehouse, technology, finance and management","Backup / restore and concurrent-write protection are part of authority"],"proof":["Procurement → lot → warehouse → production → finished-goods traceability works","Specific-identification costing is implemented","Norms/BOM, material usage and production expenses are connected","Payments, documents, fittings and audit history exist","Backup / restore, transactional safety and concurrent overwrite protection are implemented"],"next":["Continue source reconciliation and operational QA","Close the discrepancy contour across quantity, identity, landed cost and order cost","Run controlled production use as the single source of truth","Acceptance: inventory accuracy, lot-cost accuracy, order-cost reproducibility and recovery proof"]}}};

function installDeepProjectDossier(lang, $, projects) {
  const en = lang === 'en';
  const modal = $('#modal');
  if (!modal) return;
  let sec = $('#v2-deep-project');
  if (!sec) { sec=document.createElement('section'); sec.id='v2-deep-project'; sec.className='v2-deep-project'; $('#v2-project-dossier')?.after(sec); }
  const labels = en ? {title:'Product anatomy',summary:'What the system is',users:'Users & roles',workflow:'End-to-end workflow',data:'Data & authority',economics:'Economics & value',governance:'Governance / security',proof:'What is already real',next:'What is next'} : {title:'Анатомия проекта',summary:'Что это за система',users:'Пользователи и роли',workflow:'Сквозной процесс',data:'Данные и authority',economics:'Экономика и ценность',governance:'Governance / безопасность',proof:'Что уже реально работает',next:'Что развивается дальше'};
  const list=(xs)=>`<ul>${xs.map(x=>`<li>${x}</li>`).join('')}</ul>`;
  const paint=()=>{
    const id=modal.dataset.project; const d=V2_DEEP_PROJECTS[id]?.[en?'en':'ru']; const p=(projects||[]).find(x=>x.id===id);
    if(!modal.open||!d){sec.hidden=true;return;} sec.hidden=false;
    sec.innerHTML=`<div class="v2-deep-head"><div><p class="eyebrow">${labels.title}</p><h3>${p?.name||id}</h3></div><p>${d.summary}</p></div><details class="v2-deep-details" open><summary>${labels.users}</summary>${list(d.users)}</details><details class="v2-deep-details" open><summary>${labels.workflow}</summary>${list(d.workflow)}</details><details class="v2-deep-details"><summary>${labels.data}</summary>${list(d.data)}</details><details class="v2-deep-details"><summary>${labels.economics}</summary>${list(d.economics)}</details><details class="v2-deep-details"><summary>${labels.governance}</summary>${list(d.governance)}</details><details class="v2-deep-details"><summary>${labels.proof}</summary>${list(d.proof)}</details><details class="v2-deep-details"><summary>${labels.next}</summary>${list(d.next)}</details>`;
  };
  if(!modal.__v2DeepProjectBound){modal.__v2DeepProjectBound=true; new MutationObserver(paint).observe(modal,{attributes:true,attributeFilter:['open','data-project']});}
  paint();
}


/* V2.17 full public case studies */
const V2_CASE_STUDIES = {"antiqua":{"ru":{"architecture":["Consumer Gallery как primary surface","Artwork Authority как каноническая сущность произведения","Artist / Creator Graph как authority автора и связей","Collection Graph + Taste Graph для retention и personalization","Research / provenance / source layer с progressive disclosure","Auction Authority как отдельный optional commerce state","Professional / pilot / evidence surfaces вынесены backstage","Dedicated PostgreSQL + production admission; media authority развивается отдельными gated phases"],"modules":["Gallery: image-first discovery только по живописи","Artwork: media, attribution, technique/materials, period, provenance, research, related works","Artists: biography, periods, works, exhibitions, editorial context","Collections: saved works, private/public/curated collections","Taste: персональный профиль discovery на основе действий пользователя","Learn: books, courses, editorial themes / movements","Events: exhibitions, lectures, courses, viewings linked to art entities","Auction: watch / bid / result только для auction-eligible artworks","For professionals: controlled evidence / research / pilot tools"],"journeys":["Home → Gallery → Artwork → Artist → Related Works","Artwork → Save → Collection → Taste → personalised Gallery","Artwork / Artist / Theme → Books / Courses / Events → deeper discovery","Artwork → provenance / bibliography / exhibition context → source drill-down","Auction-eligible Artwork → Lot → Watch → Bid → Result → Collection record","Institutional publishing → review → governed publication → public discovery"],"kpi":["Artwork opens per session","Save / favorite rate","Artwork → Artist continuation","Related Works continuation","Collection creation / add rate","D7 / D30 authenticated return","Personalized discovery engagement","Artwork/Artist → Book/Course/Event continuation","Auction watch → bid conversion только для auction-eligible works","Record completeness / provenance evidence coverage для professional pilot"],"integrations":["PostgreSQL как durable product authority","Object/media authority → planned IIIF manifest delivery","Mirador для zoom / comparison / research viewing после media gate","Cantaloupe как conditional IIIF image server","OpenRefine для controlled authority reconciliation","Qdrant для visual similarity как rebuildable index, не attribution authority","Tesseract OCR только как candidate observations","ExifTool / LibRaw / OpenColorIO / libvips для governed media pipeline","C2PA как media provenance signal, не доказательство artwork authenticity","RDF/CIDOC-CRM-oriented export и external authority links — derived interoperability layer"],"pilot":["Одна реальная коллекция / галерея с ограниченным числом paintings","Загрузка Artwork / Artist records и media только в paintings-only taxonomy","Фиксация baseline по completeness / provenance / related works / discovery","Тест consumer journey и отдельный professional research workflow","Проверка publication authority, rights и source links","Измерение retention и continuation без обязательного commerce layer"],"acceptance":["Production runtime подтверждает PostgreSQL persistence и restart durability","Ни один public Artwork не выходит за paintings-only taxonomy","Artwork / Artist / provenance / promotion authorities не смешиваются","Missing provenance остаётся missing, не генерируется","Public Gallery не подразумевает, что каждое произведение продаётся","Pilot даёт измеримые record-quality и engagement evidence","Professional evidence не появляется в consumer Gallery без явного publication decision"],"roadmap":["P0: durable production runtime + first real-art pilot","P1: Object Media Authority","P2: IIIF / Mirador","P3: OCR candidate observations","P4: authority reconciliation","P5: provenance knowledge graph","P6: visual similarity","P7: C2PA/media provenance","P8+: preservation / semantic export / institutional publishing","Photogrammetry / transferable credentials — только после доказанных предыдущих gates"]},"en":{"architecture":["Consumer Gallery as the primary surface","Artwork Authority as the canonical work entity","Artist / Creator Graph as creator and relationship authority","Collection Graph + Taste Graph for retention and personalisation","Research / provenance / source layer through progressive disclosure","Auction Authority as a separate optional commerce state","Professional / pilot / evidence surfaces kept backstage","Dedicated PostgreSQL + production admission; media authority evolves through gated phases"],"modules":["Gallery: image-first discovery for paintings only","Artwork: media, attribution, technique/materials, period, provenance, research and related works","Artists: biography, periods, works, exhibitions and editorial context","Collections: saved works, private/public/curated collections","Taste: personalised discovery profile derived from user actions","Learn: books, courses and editorial themes / movements","Events: exhibitions, lectures, courses and viewings linked to art entities","Auction: watch / bid / result only for auction-eligible artworks","For professionals: controlled evidence / research / pilot tools"],"journeys":["Home → Gallery → Artwork → Artist → Related Works","Artwork → Save → Collection → Taste → personalised Gallery","Artwork / Artist / Theme → Books / Courses / Events → deeper discovery","Artwork → provenance / bibliography / exhibition context → source drill-down","Auction-eligible Artwork → Lot → Watch → Bid → Result → Collection record","Institutional publishing → review → governed publication → public discovery"],"kpi":["Artwork opens per session","Save / favorite rate","Artwork → Artist continuation","Related Works continuation","Collection creation / add rate","D7 / D30 authenticated return","Personalised discovery engagement","Artwork/Artist → Book/Course/Event continuation","Auction watch → bid conversion only for auction-eligible works","Record completeness / provenance evidence coverage for the professional pilot"],"integrations":["PostgreSQL as durable product authority","Object/media authority → planned IIIF manifest delivery","Mirador for zoom / comparison / research after the media gate","Cantaloupe as a conditional IIIF image server","OpenRefine for controlled authority reconciliation","Qdrant for visual similarity as a rebuildable index, not attribution authority","Tesseract OCR only for candidate observations","ExifTool / LibRaw / OpenColorIO / libvips for the governed media pipeline","C2PA as a media-provenance signal, not proof of artwork authenticity","RDF/CIDOC-CRM-oriented export and external authority links as a derived interoperability layer"],"pilot":["One real collection / gallery with a bounded set of paintings","Load Artwork / Artist records and media only under the paintings-only taxonomy","Freeze a baseline for completeness / provenance / related works / discovery","Test the consumer journey and a separate professional research workflow","Verify publication authority, rights and source links","Measure retention and continuation without requiring commerce"],"acceptance":["Production runtime proves PostgreSQL persistence and restart durability","No public Artwork falls outside the paintings-only taxonomy","Artwork / Artist / provenance / promotion authorities remain separate","Missing provenance remains missing rather than generated","Public Gallery never implies every artwork is for sale","Pilot produces measurable record-quality and engagement evidence","Professional evidence does not surface in consumer Gallery without an explicit publication decision"],"roadmap":["P0: durable production runtime + first real-art pilot","P1: Object Media Authority","P2: IIIF / Mirador","P3: OCR candidate observations","P4: authority reconciliation","P5: provenance knowledge graph","P6: visual similarity","P7: C2PA/media provenance","P8+: preservation / semantic export / institutional publishing","Photogrammetry / transferable credentials only after preceding gates are evidenced"]}},"fashionmgmt":{"ru":{"architecture":["Single-company couture/fashion operating authority, не generic task tracker","Core graph: Collection → ProductModel → Order → OrderStep / ProductionOperation → MaterialLine → Fitting → Change / Rework → Payment → FinalCostSnapshot","Model / Order Digital Thread как центральная сквозная ось","Role-scoped application boundary для 9 фактических login roles","Plan / Fact / CTC / Forecast economics поверх operational facts","Capacity / WIP / work-session layer для promise-date и bottleneck analysis","Liquidity / month-close / benefits / management actions как executive control layer","Audit log, feedback/release, privacy boundaries и safe update/rollback"],"modules":["Collections / catalogue / ProductModel passport","Orders / order board / order detail / print","Production operations и workshop-scoped views","Capacity cockpit и resource availability","Fittings / changes / rework","Materials / shortages / purchasing","WIP / queue age / bottleneck control","Payments / liquidity / financial close / month close","Benefits / management decisions / analytics / KPI","Users / configurable roles / settings / audit"],"journeys":["Collection → Model → approved revision → Order","Order → production route → workshop operations → quality checks","Material readiness + payment gate → production start","Operation → fitting → change request / rework → accepted correction","WIP / capacity → at-risk order → management decision","Order → completed operations → handover → financial close → frozen final cost","Month close → owner evidence → benefit / management action review"],"kpi":["Order status accuracy","Lead-time predictability","WIP visibility and ageing","Queue / blocked time","Due-date adherence","Rework visibility / first-pass completion","Cost forecast error: Plan / Fact / CTC / Forecast","Contribution / WIP exposure / cash outstanding","Month-close completeness and duration","Management action completion","Spreadsheet escape rate in controlled rollout"],"integrations":["Explicit API contracts only; no shared database with other products","Potential accounting / finance connectors through controlled scope","Potential YNN evidence export for approved transformation proof","Potential synth-v2 exchange for published model/readiness/production status","External atelier / supplier handoff package with scoped client information","Report/document export and role-safe evidence packages"],"pilot":["One bounded real production contour with a small set of models/orders","Include production, material, fitting, payment and closing events","Run representative roles across monitor/tablet/phone","Freeze baseline for manual reconciliation, lead time, forecast accuracy and close time","Require real owner/operations/production/finance acceptance by role","Keep client identity and commercial details outside public evidence"],"acceptance":["Closed-order final cost remains immutable","Historical model/order revisions are never silently rewritten","Client privacy boundaries hold for every role and export","Operations and status transitions obey role / workshop scope","Order cannot close without required operational and payment conditions","Month-close tasks have owner + evidence","Pilot demonstrates order→production→cost→cash/close without critical parallel spreadsheet","AI / scheduling recommendations remain advisory until approved"],"roadmap":["L1 Model Passport v1","L2 Order Digital Thread","L3 Change / Rework Causality","L5 Owner Economics Cockpit","L6 Executive Demo Route","L4 Capacity / Promise-date Cockpit","L7 Replicable Product Boundary","L8 Pilot Acceptance Metrics","Then partner handoff/API → couture operating standard → white-label / enterprise package"]},"en":{"architecture":["Single-company couture/fashion operating authority, not a generic task tracker","Core graph: Collection → ProductModel → Order → OrderStep / ProductionOperation → MaterialLine → Fitting → Change / Rework → Payment → FinalCostSnapshot","Model / Order Digital Thread as the central end-to-end axis","Role-scoped application boundary for 9 factual login roles","Plan / Actual / CTC / Forecast economics over operational facts","Capacity / WIP / work-session layer for promise-date and bottleneck analysis","Liquidity / month-close / benefits / management actions as the executive control layer","Audit log, feedback/release, privacy boundaries and safe update/rollback"],"modules":["Collections / catalogue / ProductModel passport","Orders / order board / order detail / print","Production operations and workshop-scoped views","Capacity cockpit and resource availability","Fittings / changes / rework","Materials / shortages / purchasing","WIP / queue age / bottleneck control","Payments / liquidity / financial close / month close","Benefits / management decisions / analytics / KPI","Users / configurable roles / settings / audit"],"journeys":["Collection → Model → approved revision → Order","Order → production route → workshop operations → quality checks","Material readiness + payment gate → production start","Operation → fitting → change request / rework → accepted correction","WIP / capacity → at-risk order → management decision","Order → completed operations → handover → financial close → frozen final cost","Month close → owner evidence → benefit / management action review"],"kpi":["Order status accuracy","Lead-time predictability","WIP visibility and ageing","Queue / blocked time","Due-date adherence","Rework visibility / first-pass completion","Cost forecast error: Plan / Actual / CTC / Forecast","Contribution / WIP exposure / cash outstanding","Month-close completeness and duration","Management action completion","Spreadsheet escape rate in the controlled rollout"],"integrations":["Explicit API contracts only; no shared database with other products","Potential accounting / finance connectors under controlled scope","Potential YNN evidence export for approved transformation proof","Potential synth-v2 exchange for published model/readiness/production status","External atelier / supplier handoff package with scoped client information","Report/document export and role-safe evidence packages"],"pilot":["One bounded real production contour with a small set of models/orders","Include production, material, fitting, payment and closing events","Run representative roles across monitor/tablet/phone","Freeze a baseline for manual reconciliation, lead time, forecast accuracy and close time","Require real owner/operations/production/finance acceptance by role","Keep client identity and commercial details outside public evidence"],"acceptance":["Closed-order final cost remains immutable","Historical model/order revisions are never silently rewritten","Client privacy boundaries hold across every role and export","Operations and status transitions obey role / workshop scope","An order cannot close without required operational and payment conditions","Month-close tasks have an owner + evidence","Pilot demonstrates order→production→cost→cash/close without a critical parallel spreadsheet","AI / scheduling recommendations remain advisory until approved"],"roadmap":["L1 Model Passport v1","L2 Order Digital Thread","L3 Change / Rework Causality","L5 Owner Economics Cockpit","L6 Executive Demo Route","L4 Capacity / Promise-date Cockpit","L7 Replicable Product Boundary","L8 Pilot Acceptance Metrics","Then partner handoff/API → couture operating standard → white-label / enterprise package"]}},"furproduction":{"ru":{"architecture":["Multi-tenant organization boundary с role lookup на каждый request","Core graph: Organization → Supplier → Purchase → PurchaseItem → RawMaterialLot → StockMovement → ProductionOrder → ProductionMaterialUsage → ProductionExpense → FinishedGoodsStock → Shipment","Specific-identification costing как immutable economic boundary","DriveDocument + reconciliation как evidence / verification layer","AuditLog и transactional corrections как history authority","Production admission через /api/health + /api/ready и blocker taxonomy","Backup / restore / migrations / persistent uploads как operational resilience","Future Lot Passport / genealogy / traceability manifest строятся как projections над ERP facts"],"modules":["Сырьё / аукционы / закупки","Лоты сырья и складские движения","Оплаты поставщикам и производству","ТЗ / производственные заказы / партии","Norms / BOM / material usage / production expenses","Изделия / цены / finished-goods stock","Примерки / фото / документы","Drive documents / reconciliation register / verification queue","Audit history / self-check / control center","Plan / calendar / analytics / pricing / raw-material table"],"journeys":["Supplier / auction → Purchase → PurchaseItem → Lot","Lot → warehouse → reserve / movement → production issue","Model / norm / BOM → ProductionOrder → exact-lot consumption","Correction → return old quantity → consume new lot/quantity transactionally","Production → FinishedGoodsStock → shipment / handoff","Payment / document evidence → reconciliation queue → human confirmation","Health → deep readiness → production admission → smoke chain"],"kpi":["Inventory variance between source register and system","quantityRemaining accuracy by lot","Landed / unit cost match to source","Lot → production → finished-goods traceability completeness","Document coverage / verified viewUrl coverage","Reconciliation queue by ok/docs/unpaid/review/conflict/empty","Order-cost reproducibility","Yield / waste once unit-compatible evidence is available","Page/runtime performance targets after Wave 5","Backup / restore evidence and recovery readiness"],"integrations":["PostgreSQL / Prisma as production data authority","DriveDocument links today; OAuth/service-account sync explicitly not claimed yet","Planned 1C/accounting export-import","Auction / supplier file adapters","Logistics / trade-document connectors","Document storage and hash/evidence layer","Potential fashion PLM / production APIs through explicit contracts","Partner API for lot/passport/read, stock, production issue/return, document status and shipment"],"pilot":["Controlled production contour using real but confidential operational data","Smoke chain: purchase → lot → production order → exact-lot usage → documents → payments → reconciliation","Freeze source extracts and reconciliation baseline","Resolve infrastructure blockers separately from business review queues","Run repeated inventory / lot-cost / order-cost reconciliation","Demonstrate recovery from backup and safe correction history","Public case exposes architecture and metrics, never client/supplier/price identities"],"acceptance":["/api/health returns service liveness","/api/ready returns production_ready=true with blockers=[]","Required PostgreSQL tables and migrations are present","Core organization/users/purchases/lots/production data are loaded","DriveDocument authority meets configured coverage gate","Reconciliation dataset is current and non-empty","Specific-lot quantity and cost are reproducible from source rows","No silent rewrite of consumed historical lot economics","Backup / restore and controlled smoke chain pass"],"roadmap":["Wave 0: safety, source-of-truth cleanup, direct calculation defects","Wave 1: production publication and customer testing","Wave 2: calculation integrity / invariants / unit tests / CI","Wave 3: Drive manifest/diff synchronization","Wave 4: unified filters / control center / remove duplication","Wave 5: performance","J1 Canonical Lot Genealogy","J2 Traceability Passport","J3 Yield Ledger","J5 Traceability Manifest","J6 Executive / Investor Route","Then provider passports / APIs / benchmark network only after core evidence is stable"]},"en":{"architecture":["Multi-tenant organization boundary with role lookup on every request","Core graph: Organization → Supplier → Purchase → PurchaseItem → RawMaterialLot → StockMovement → ProductionOrder → ProductionMaterialUsage → ProductionExpense → FinishedGoodsStock → Shipment","Specific-identification costing as an immutable economic boundary","DriveDocument + reconciliation as the evidence / verification layer","AuditLog and transactional corrections as history authority","Production admission through /api/health + /api/ready and blocker taxonomy","Backup / restore / migrations / persistent uploads as operational resilience","Future Lot Passport / genealogy / traceability manifest are projections over ERP facts"],"modules":["Raw material / auctions / purchases","Lots and warehouse movements","Supplier and production payments","Technical specifications / production orders / batches","Norms / BOM / material usage / production expenses","Finished goods / prices / stock","Fittings / photos / documents","Drive documents / reconciliation register / verification queue","Audit history / self-check / control center","Plan / calendar / analytics / pricing / raw-material table"],"journeys":["Supplier / auction → Purchase → PurchaseItem → Lot","Lot → warehouse → reserve / movement → production issue","Model / norm / BOM → ProductionOrder → exact-lot consumption","Correction → return old quantity → consume new lot/quantity transactionally","Production → FinishedGoodsStock → shipment / handoff","Payment / document evidence → reconciliation queue → human confirmation","Health → deep readiness → production admission → smoke chain"],"kpi":["Inventory variance between source register and system","quantityRemaining accuracy by lot","Landed / unit cost match to source","Lot → production → finished-goods traceability completeness","Document coverage / verified viewUrl coverage","Reconciliation queue by ok/docs/unpaid/review/conflict/empty","Order-cost reproducibility","Yield / waste once unit-compatible evidence exists","Page/runtime performance targets after Wave 5","Backup / restore evidence and recovery readiness"],"integrations":["PostgreSQL / Prisma as production data authority","DriveDocument links today; OAuth/service-account sync is explicitly not claimed yet","Planned 1C/accounting export-import","Auction / supplier file adapters","Logistics / trade-document connectors","Document storage and hash/evidence layer","Potential fashion PLM / production APIs through explicit contracts","Partner API for lot/passport/read, stock, production issue/return, document status and shipment"],"pilot":["Controlled production contour using real but confidential operational data","Smoke chain: purchase → lot → production order → exact-lot usage → documents → payments → reconciliation","Freeze source extracts and reconciliation baseline","Resolve infrastructure blockers separately from business review queues","Run repeated inventory / lot-cost / order-cost reconciliation","Demonstrate recovery from backup and safe correction history","Public case exposes architecture and metrics, never client/supplier/price identities"],"acceptance":["/api/health proves service liveness","/api/ready returns production_ready=true with blockers=[]","Required PostgreSQL tables and migrations are present","Core organization/users/purchases/lots/production data are loaded","DriveDocument authority meets the configured coverage gate","Reconciliation dataset is current and non-empty","Specific-lot quantity and cost are reproducible from source rows","No silent rewrite of consumed historical lot economics","Backup / restore and controlled smoke chain pass"],"roadmap":["Wave 0: safety, source-of-truth cleanup and direct calculation defects","Wave 1: production publication and customer testing","Wave 2: calculation integrity / invariants / unit tests / CI","Wave 3: Drive manifest/diff synchronisation","Wave 4: unified filters / control center / remove duplication","Wave 5: performance","J1 Canonical Lot Genealogy","J2 Traceability Passport","J3 Yield Ledger","J5 Traceability Manifest","J6 Executive / Investor Route","Then provider passports / APIs / benchmark network only after core evidence is stable"]}}};


/* V2.18 visual product stories */
const V2_CASE_VISUALS = {"antiqua":{"ru":{"architecture":[{"label":"EXPERIENCE","items":["Gallery","Artwork","Artist"]},{"label":"KNOWLEDGE","items":["Collections","Taste","Research / Provenance"]},{"label":"AUTHORITY","items":["PostgreSQL","Media / IIIF","Publication / Auction"]}],"workflow":["Discover","Artwork","Artist","Related Works","Save","Collection","Taste","Return"],"kpi":[{"label":"Discovery","metrics":["Artwork opens","Artwork → Artist","Related Works"]},{"label":"Retention","metrics":["Save rate","Collection adds","D7 / D30 return"]},{"label":"Trust","metrics":["Record completeness","Provenance coverage","Publication correctness"]}],"matrix":[{"pilot":"Paintings-only dataset","pass":"100% public works fit approved painterly media + required records"},{"pilot":"Consumer journey","pass":"Artwork continuation, saves and return behaviour are measurable"},{"pilot":"Research / provenance","pass":"Missing evidence stays missing; every published claim remains source-linked"},{"pilot":"Rights / publication","pass":"Professional evidence never leaks into Gallery without explicit publication"}],"roadmap":[{"phase":"P0","label":"Runtime + real-art pilot","state":"now"},{"phase":"P1","label":"Object Media Authority","state":"next"},{"phase":"P2","label":"IIIF / Mirador","state":"next"},{"phase":"P3–4","label":"OCR + reconciliation","state":"later"},{"phase":"P5–7","label":"Provenance + similarity + C2PA","state":"later"},{"phase":"P8+","label":"Institutional publishing","state":"later"}]},"en":{"architecture":[{"label":"EXPERIENCE","items":["Gallery","Artwork","Artist"]},{"label":"KNOWLEDGE","items":["Collections","Taste","Research / Provenance"]},{"label":"AUTHORITY","items":["PostgreSQL","Media / IIIF","Publication / Auction"]}],"workflow":["Discover","Artwork","Artist","Related Works","Save","Collection","Taste","Return"],"kpi":[{"label":"Discovery","metrics":["Artwork opens","Artwork → Artist","Related Works"]},{"label":"Retention","metrics":["Save rate","Collection adds","D7 / D30 return"]},{"label":"Trust","metrics":["Record completeness","Provenance coverage","Publication correctness"]}],"matrix":[{"pilot":"Paintings-only dataset","pass":"100% of public works fit approved painterly media + required records"},{"pilot":"Consumer journey","pass":"Artwork continuation, saves and return behaviour are measurable"},{"pilot":"Research / provenance","pass":"Missing evidence stays missing; every published claim remains source-linked"},{"pilot":"Rights / publication","pass":"Professional evidence never reaches Gallery without explicit publication"}],"roadmap":[{"phase":"P0","label":"Runtime + real-art pilot","state":"now"},{"phase":"P1","label":"Object Media Authority","state":"next"},{"phase":"P2","label":"IIIF / Mirador","state":"next"},{"phase":"P3–4","label":"OCR + reconciliation","state":"later"},{"phase":"P5–7","label":"Provenance + similarity + C2PA","state":"later"},{"phase":"P8+","label":"Institutional publishing","state":"later"}]}},"fashionmgmt":{"ru":{"architecture":[{"label":"PRODUCT","items":["Collection","ProductModel","Order"]},{"label":"OPERATIONS","items":["Production","Materials","Fitting / Rework"]},{"label":"CONTROL","items":["Cost / WIP / Capacity","Liquidity / Close","Roles / Audit"]}],"workflow":["Model","Approved revision","Order","Production route","Material ready","Fitting / Rework","Handover","Close"],"kpi":[{"label":"Delivery","metrics":["Status accuracy","Lead-time","Due-date adherence"]},{"label":"Operations","metrics":["WIP ageing","Blocked time","First-pass completion"]},{"label":"Economics","metrics":["Plan / Fact / CTC","Cash outstanding","Month-close duration"]}],"matrix":[{"pilot":"Models + orders","pass":"Approved revision → order → close remains one traceable Digital Thread"},{"pilot":"Roles + devices","pass":"Each role sees only its scope on monitor, tablet and phone"},{"pilot":"Economics","pass":"Closed cost is immutable; Plan / Fact / CTC / Forecast remain reproducible"},{"pilot":"Operating loop","pass":"Order → production → cost → cash / close runs without critical parallel spreadsheet"}],"roadmap":[{"phase":"L1","label":"Model Passport","state":"now"},{"phase":"L2","label":"Order Digital Thread","state":"now"},{"phase":"L3","label":"Change / Rework causality","state":"next"},{"phase":"L4–6","label":"Capacity + Economics + Executive route","state":"next"},{"phase":"L7–8","label":"Product boundary + Pilot metrics","state":"later"},{"phase":"Scale","label":"API / operating standard / white-label","state":"later"}]},"en":{"architecture":[{"label":"PRODUCT","items":["Collection","ProductModel","Order"]},{"label":"OPERATIONS","items":["Production","Materials","Fitting / Rework"]},{"label":"CONTROL","items":["Cost / WIP / Capacity","Liquidity / Close","Roles / Audit"]}],"workflow":["Model","Approved revision","Order","Production route","Material ready","Fitting / Rework","Handover","Close"],"kpi":[{"label":"Delivery","metrics":["Status accuracy","Lead-time","Due-date adherence"]},{"label":"Operations","metrics":["WIP ageing","Blocked time","First-pass completion"]},{"label":"Economics","metrics":["Plan / Actual / CTC","Cash outstanding","Month-close duration"]}],"matrix":[{"pilot":"Models + orders","pass":"Approved revision → order → close remains one traceable Digital Thread"},{"pilot":"Roles + devices","pass":"Each role sees only its scope on monitor, tablet and phone"},{"pilot":"Economics","pass":"Closed cost is immutable; Plan / Actual / CTC / Forecast remain reproducible"},{"pilot":"Operating loop","pass":"Order → production → cost → cash / close runs without a critical parallel spreadsheet"}],"roadmap":[{"phase":"L1","label":"Model Passport","state":"now"},{"phase":"L2","label":"Order Digital Thread","state":"now"},{"phase":"L3","label":"Change / Rework causality","state":"next"},{"phase":"L4–6","label":"Capacity + Economics + Executive route","state":"next"},{"phase":"L7–8","label":"Product boundary + Pilot metrics","state":"later"},{"phase":"Scale","label":"API / operating standard / white-label","state":"later"}]}},"furproduction":{"ru":{"architecture":[{"label":"SOURCE","items":["Supplier","Purchase","Raw-material Lot"]},{"label":"OPERATIONS","items":["Stock","Production","Finished Goods"]},{"label":"AUTHORITY","items":["Specific Lot Cost","Documents / Reconciliation","Readiness / Recovery"]}],"workflow":["Source","Purchase","Lot","Stock","Production order","Exact-lot usage","Finished goods","Reconcile"],"kpi":[{"label":"Integrity","metrics":["Inventory variance","quantityRemaining","Landed / unit cost"]},{"label":"Traceability","metrics":["Lot → production → goods","Document coverage","Reconciliation state"]},{"label":"Control","metrics":["Order-cost reproducibility","Yield / waste evidence","Recovery readiness"]}],"matrix":[{"pilot":"Source + import","pass":"Source totals and system totals reconcile to an explained variance"},{"pilot":"Exact lot","pass":"Quantity, lot identity and landed cost are reproducible from source rows"},{"pilot":"Production chain","pass":"Lot → usage → finished-goods genealogy is complete and auditable"},{"pilot":"Authority","pass":"/ready green, document gate satisfied, backup / restore proven, no silent rewrite"}],"roadmap":[{"phase":"W0","label":"Safety + source of truth","state":"now"},{"phase":"W1–2","label":"Production + integrity / CI","state":"next"},{"phase":"W3–4","label":"Documents sync + Control center","state":"next"},{"phase":"W5","label":"Performance","state":"later"},{"phase":"J1–3","label":"Genealogy + Passport + Yield","state":"later"},{"phase":"J5–6","label":"Traceability Manifest + Executive route","state":"later"}]},"en":{"architecture":[{"label":"SOURCE","items":["Supplier","Purchase","Raw-material Lot"]},{"label":"OPERATIONS","items":["Stock","Production","Finished Goods"]},{"label":"AUTHORITY","items":["Specific Lot Cost","Documents / Reconciliation","Readiness / Recovery"]}],"workflow":["Source","Purchase","Lot","Stock","Production order","Exact-lot usage","Finished goods","Reconcile"],"kpi":[{"label":"Integrity","metrics":["Inventory variance","quantityRemaining","Landed / unit cost"]},{"label":"Traceability","metrics":["Lot → production → goods","Document coverage","Reconciliation state"]},{"label":"Control","metrics":["Order-cost reproducibility","Yield / waste evidence","Recovery readiness"]}],"matrix":[{"pilot":"Source + import","pass":"Source totals and system totals reconcile to an explained variance"},{"pilot":"Exact lot","pass":"Quantity, lot identity and landed cost are reproducible from source rows"},{"pilot":"Production chain","pass":"Lot → usage → finished-goods genealogy is complete and auditable"},{"pilot":"Authority","pass":"/ready green, document gate satisfied, backup / restore proven, no silent rewrite"}],"roadmap":[{"phase":"W0","label":"Safety + source of truth","state":"now"},{"phase":"W1–2","label":"Production + integrity / CI","state":"next"},{"phase":"W3–4","label":"Documents sync + Control center","state":"next"},{"phase":"W5","label":"Performance","state":"later"},{"phase":"J1–3","label":"Genealogy + Passport + Yield","state":"later"},{"phase":"J5–6","label":"Traceability Manifest + Executive route","state":"later"}]}}};

function installPublicCaseStudy(lang, $, projects) {
  const en=lang==='en'; const modal=$('#modal'); if(!modal)return;
  let sec=$('#v2-case-study');
  if(!sec){sec=document.createElement('section');sec.id='v2-case-study';sec.className='v2-case-study';$('#v2-deep-project')?.after(sec);}
  const labels=en?{eyebrow:'Public product case study',architecture:'Architecture',modules:'Modules',journeys:'User journeys',kpi:'KPI / measurement',integrations:'Integrations',pilot:'Pilot scope',acceptance:'Acceptance criteria',roadmap:'Roadmap'}:{eyebrow:'Публичный product case study',architecture:'Architecture',modules:'Modules',journeys:'User journeys',kpi:'KPI / измерение',integrations:'Integrations',pilot:'Pilot scope',acceptance:'Acceptance criteria',roadmap:'Roadmap'};
  const renderList=(xs)=>`<ul>${xs.map(x=>`<li>${x}</li>`).join('')}</ul>`;
  const renderVisual=(id)=>{
    const v=V2_CASE_VISUALS[id]?.[en?'en':'ru'];
    if(!v)return '';
    const arch=`<div class="v2-story-card v2-story-arch"><div class="v2-story-title"><span>01</span><strong>${en?'Architecture map':'Architecture map'}</strong></div><div class="v2-arch-map">${v.architecture.map((layer,i)=>`<div class="v2-arch-layer"><small>${layer.label}</small><div>${layer.items.map(x=>`<span>${x}</span>`).join('')}</div></div>${i<v.architecture.length-1?'<i>↓</i>':''}`).join('')}</div></div>`;
    const flow=`<div class="v2-story-card v2-story-flow"><div class="v2-story-title"><span>02</span><strong>${en?'Workflow rail':'Workflow rail'}</strong></div><div class="v2-flow-rail">${v.workflow.map((x,i)=>`<div class="v2-flow-step"><b>${String(i+1).padStart(2,'0')}</b><span>${x}</span></div>${i<v.workflow.length-1?'<i>→</i>':''}`).join('')}</div></div>`;
    const kpi=`<div class="v2-story-card v2-story-kpi"><div class="v2-story-title"><span>03</span><strong>${en?'KPI panel':'KPI panel'}</strong></div><div class="v2-kpi-grid">${v.kpi.map(g=>`<div><small>${g.label}</small>${g.metrics.map(x=>`<span>${x}</span>`).join('')}</div>`).join('')}</div></div>`;
    const matrix=`<div class="v2-story-card v2-story-matrix"><div class="v2-story-title"><span>04</span><strong>${en?'Pilot / acceptance matrix':'Pilot / acceptance matrix'}</strong></div><div class="v2-accept-grid"><div class="v2-accept-head"><span>${en?'PILOT CHECK':'ЧТО ПРОВЕРЯЕМ'}</span><span>PASS</span></div>${v.matrix.map(r=>`<div class="v2-accept-row"><span>${r.pilot}</span><strong>${r.pass}</strong></div>`).join('')}</div></div>`;
    const roadmap=`<div class="v2-story-card v2-story-roadmap"><div class="v2-story-title"><span>05</span><strong>${en?'Phased roadmap':'Phased roadmap'}</strong></div><div class="v2-roadmap-rail">${v.roadmap.map((r,i)=>`<div class="v2-roadmap-phase ${r.state}"><small>${r.phase}</small><span>${r.label}</span></div>${i<v.roadmap.length-1?'<i>→</i>':''}`).join('')}</div></div>`;
    return `<section class="v2-visual-story" aria-label="${en?'Visual product story':'Визуальная история продукта'}">${arch}${flow}${kpi}${matrix}${roadmap}</section>`;
  };
  const paint=()=>{const id=modal.dataset.project,d=V2_CASE_STUDIES[id]?.[en?'en':'ru'],p=(projects||[]).find(x=>x.id===id);if(!modal.open||!d){sec.hidden=true;return;}sec.hidden=false;const sections=[['architecture',labels.architecture],['modules',labels.modules],['journeys',labels.journeys],['kpi',labels.kpi],['integrations',labels.integrations],['pilot',labels.pilot],['acceptance',labels.acceptance],['roadmap',labels.roadmap]];sec.innerHTML=`<div class="v2-case-head"><div><p class="eyebrow">${labels.eyebrow}</p><h3>${p?.name||id}</h3></div><span>${en?'8 layers of the product':'8 уровней продукта'}</span></div>${renderVisual(id)}<div class="v2-case-grid">${sections.map(([key,label],i)=>`<details class="v2-case-block" ${i<2?'open':''}><summary><b>${String(i+1).padStart(2,'0')}</b><span>${label}</span></summary>${renderList(d[key])}</details>`).join('')}</div>`;};
  if(!modal.__v2CaseStudyBound){modal.__v2CaseStudyBound=true;new MutationObserver(paint).observe(modal,{attributes:true,attributeFilter:['open','data-project']});}
  paint();
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
    ['01','Для бизнеса','Консалтинг','Маржа, закупка, запасы, оборотный капитал и решения, которые можно проверить на данных.','Выбрать формат работы','#consulting'],
    ['02','Для продукта','Продукты и разработка','Собственные цифровые продукты: от рабочего прототипа до пилота, внедрения и партнёрской модели.','Посмотреть портфель','#v2-portfolio'],
    ['03','Для совместного развития','Партнёрство','Пилоты, совместный выход на рынок, стратегическое сотрудничество и инвестиционный диалог.','Посмотреть варианты участия','#investors']
  ];
  $('#v2-routes').innerHTML = `<p class="eyebrow">${en ? 'Where shall we start?' : 'С чего начнём?'}</p><div class="v2-route-grid">${routes.map(r=>`<a class="v2-route" href="${r[5]}"><span class="v2-route-meta">${r[0]} / ${r[1]}</span><h3>${r[2]}</h3><p>${r[3]}</p><span class="v2-route-action">${r[4]} →</span></a>`).join('')}</div>`;
  installDecisionLayer(lang, $);
  renderPortfolioIntelligence(lang, $, projects);
  renderStakeholderLens(lang, $, projects);
  installExecutiveEvidence(lang, $, projects);
  installProjectDecisionDossier(lang, $, projects);
  installDeepProjectDossier(lang, $, projects);
  installPublicCaseStudy(lang, $, projects);
  installCommercialClarity(lang, $, projects);
  installCommercialProof(lang, $, projects);
  installStrategicHorizon(lang, $, projects);
  installPublicStatusStamp(lang, $, projects);
  installConfidentialityLayer(lang, $, projects);
  installDisclosureLadder(lang, $, projects);
  if (!$('#v2-steps')) {
    const section = document.createElement('section'); section.id = 'v2-steps'; section.className = 'section v2-steps';
    $('#contact').before(section);
  }
  const startModes = en ? [
    {
      id:'consulting', label:'Business problem', title:'Improve economics or management quality',
      copy:'Buying, margin, inventory, working capital, reporting or a management problem that needs to be tested on data.',
      need:['Describe what is currently costing money or slowing a decision','Say what data or reports are available','Name the result or metric that should improve'],
      outcome:'You leave the first step with a problem frame, a data/request list and a concrete next decision.',
      topic:'consulting', route:'#consulting',
      message:'I want to discuss a business problem. Current issue: …\nAvailable data: …\nResult I want to improve: …'
    },
    {
      id:'product', label:'Digital product', title:'Build, rebuild or launch a working product',
      copy:'A new system, internal tool, customer product, workflow automation or an existing product that needs stronger architecture and execution.',
      need:['Describe the user and the workflow that should change','Show what already exists: files, product, process or prototype','Name the first bounded result that would make the project useful'],
      outcome:'The next step is scoped around the smallest working release, evidence and acceptance criteria rather than a long feature list.',
      topic:'launch', route:'#v2-portfolio',
      message:'I want to discuss a digital product. User/workflow: …\nWhat already exists: …\nFirst useful result: …'
    },
    {
      id:'partnership', label:'Pilot / partnership', title:'Test a project together before scaling',
      copy:'A bounded pilot, strategic partnership, channel, data or operating contribution where both sides need a measurable reason to continue.',
      need:['State what your side can contribute','Choose the customer/user scenario to test','Define what evidence would justify scaling'],
      outcome:'We define a small joint case, responsibilities and the evidence required before a larger commitment.',
      topic:'partnership', route:'#investors',
      message:'I want to discuss a pilot/partnership. What we can contribute: …\nScenario to test: …\nEvidence required to scale: …'
    },
    {
      id:'investment', label:'Investment', title:'Review maturity, risk and the next capital gate',
      copy:'A discussion around one of the products, its current proof, remaining risks, pilot economics and what the next capital commitment must unlock.',
      need:['Choose the product or thesis you want to discuss','State which risk or assumption matters most','Say what evidence you need before the next commitment'],
      outcome:'The conversation starts from current proof and the next de-risking gate, not from a generic pitch.',
      topic:'investors', route:'#investors',
      message:'I want to discuss investment. Product/thesis: …\nMain risk or assumption: …\nEvidence I need before the next commitment: …'
    }
  ] : [
    {
      id:'consulting', label:'Бизнес-задача', title:'Улучшить экономику или управляемость бизнеса',
      copy:'Закупка, маржа, запасы, оборотный капитал, отчётность или управленческая проблема, которую нужно проверить на данных.',
      need:['Опишите, что сейчас стоит денег или тормозит решение','Укажите, какие данные или отчёты уже есть','Назовите результат или показатель, который должен измениться'],
      outcome:'На первом шаге фиксируем рамку проблемы, список нужных данных и конкретное следующее решение.',
      topic:'consulting', route:'#consulting',
      message:'Хочу обсудить бизнес-задачу.\nЧто сейчас происходит: …\nКакие данные есть: …\nКакой результат хочу улучшить: …'
    },
    {
      id:'product', label:'Цифровой продукт', title:'Создать, пересобрать или запустить рабочий продукт',
      copy:'Новая система, внутренний инструмент, клиентский продукт, автоматизация процесса или существующий продукт, которому нужна более сильная архитектура и реализация.',
      need:['Опишите пользователя и процесс, который должен измениться','Покажите, что уже есть: файлы, система, процесс или прототип','Назовите первый ограниченный результат, после которого продукт уже полезен'],
      outcome:'Следующий шаг строится вокруг минимального рабочего релиза, evidence и критериев приёмки, а не вокруг бесконечного списка функций.',
      topic:'launch', route:'#v2-portfolio',
      message:'Хочу обсудить цифровой продукт.\nПользователь / процесс: …\nЧто уже есть: …\nПервый полезный результат: …'
    },
    {
      id:'partnership', label:'Пилот / партнёрство', title:'Проверить совместный кейс до масштабирования',
      copy:'Ограниченный пилот, стратегическое партнёрство, канал, данные или операционный вклад, где обеим сторонам нужен измеримый повод продолжать.',
      need:['Опишите, что ваша сторона может привнести','Выберите клиентский или пользовательский сценарий для проверки','Определите, какое evidence станет основанием масштабировать'],
      outcome:'Фиксируем небольшой совместный кейс, ответственность сторон и доказательства, которые нужны до более крупного обязательства.',
      topic:'partnership', route:'#investors',
      message:'Хочу обсудить пилот / партнёрство.\nЧто мы можем привнести: …\nКакой сценарий проверяем: …\nЧто должно быть доказано для масштабирования: …'
    },
    {
      id:'investment', label:'Инвестиции', title:'Разобрать зрелость, риски и следующий capital gate',
      copy:'Обсуждение конкретного продукта: что уже доказано, какие риски остаются, что должен показать пилот и что обязан разблокировать следующий капитал.',
      need:['Выберите проект или инвестиционную гипотезу','Назовите главный риск или допущение','Укажите, какие подтверждения нужны до следующего обязательства'],
      outcome:'Разговор начинается с текущего proof и следующего de-risking gate, а не с общего pitch.',
      topic:'investors', route:'#investors',
      message:'Хочу обсудить инвестиции.\nПроект / гипотеза: …\nГлавный риск или допущение: …\nКакие подтверждения нужны до следующего шага: …'
    }
  ];
  $('#v2-steps').innerHTML = `
    <div class="v2-start-head">
      <div>
        <p class="eyebrow">${en ? 'Start here' : 'Начните здесь'}</p>
        <h2>${en ? 'How the work actually starts' : 'Как начинается работа'}</h2>
      </div>
      <p>${en ? 'Choose the closest situation. The block will show what to prepare and one clear action to continue.' : 'Выберите ближайшую ситуацию. Блок сразу покажет, что подготовить и куда нажать дальше.'}</p>
    </div>
    <div class="v2-start-choice" role="group" aria-label="${en ? 'Choose how to start' : 'Выберите, с чего начать'}">
      ${startModes.map((m)=>`<button type="button" class="v2-start-mode" data-v2-start-mode="${m.id}" aria-pressed="false"><span>${m.label}</span><strong>${m.title}</strong><small>${m.copy}</small></button>`).join('')}
    </div>
    <div class="v2-start-panel" id="v2-start-panel">
      <div class="v2-start-empty">
        <span>01</span>
        <div><strong>${en ? 'Choose one option above' : 'Выберите один вариант выше'}</strong><p>${en ? 'Then you will see exactly what is needed and a button to continue.' : 'После выбора здесь появится точный список того, что нужно, и кнопка для продолжения.'}</p></div>
      </div>
    </div>`;
  const startSection = $('#v2-steps');
  const paintStartMode = (id) => {
    const mode = startModes.find((x)=>x.id===id);
    if (!mode) return;
    startSection.querySelectorAll('[data-v2-start-mode]').forEach((b)=>{
      const active=b.dataset.v2StartMode===id;
      b.classList.toggle('active',active);
      b.setAttribute('aria-pressed',String(active));
    });
    $('#v2-start-panel').innerHTML = `
      <div class="v2-start-selected">
        <div class="v2-start-number">02</div>
        <div class="v2-start-need">
          <span class="eyebrow">${en ? 'What to prepare now' : 'Что подготовить сейчас'}</span>
          <h3>${mode.title}</h3>
          <ol>${mode.need.map((x)=>`<li>${x}</li>`).join('')}</ol>
        </div>
        <div class="v2-start-result">
          <span class="eyebrow">${en ? 'What happens next' : 'Что будет дальше'}</span>
          <p>${mode.outcome}</p>
          <div class="v2-start-actions">
            <button type="button" class="btn btn-primary" data-v2-start-continue="${mode.id}">${en ? 'Continue to the short form' : 'Перейти к короткой форме'} →</button>
            <a class="btn" href="https://t.me/sheqel" target="_blank" rel="noopener">${en ? 'Message on Telegram' : 'Написать в Telegram'}</a>
          </div>
          <button type="button" class="v2-start-context" data-v2-start-context="${mode.id}">${en ? 'First review the relevant section' : 'Сначала посмотреть соответствующий раздел'} →</button>
        </div>
      </div>`;
  };
  if (!startSection.__v2StartBound) {
    startSection.__v2StartBound = true;
    startSection.addEventListener('click',(e)=>{
      const modeBtn=e.target.closest('[data-v2-start-mode]');
      if(modeBtn){ paintStartMode(modeBtn.dataset.v2StartMode); return; }
      const continueBtn=e.target.closest('[data-v2-start-continue]');
      if(continueBtn){
        const mode=startModes.find((x)=>x.id===continueBtn.dataset.v2StartContinue);
        if(!mode)return;
        const topic=$('#topic');
        if(topic){ topic.value=mode.topic; topic.dispatchEvent(new Event('change',{bubbles:true})); }
        const message=$('#form [name="message"]');
        if(message && !message.value.trim()) message.value=mode.message;
        $('#contact')?.scrollIntoView({behavior:'smooth',block:'start'});
        setTimeout(()=>$('#form [name="name"]')?.focus(),350);
        return;
      }
      const contextBtn=e.target.closest('[data-v2-start-context]');
      if(contextBtn){
        const mode=startModes.find((x)=>x.id===contextBtn.dataset.v2StartContext);
        document.querySelector(mode?.route)?.scrollIntoView({behavior:'smooth',block:'start'});
      }
    });
  }
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
  $('#v2-form-note').textContent = en ? 'Preview mode: the form validates your input but does not send or save an enquiry. Direct contact links remain available.' : 'Режим просмотра: форма проверяет заполнение, но не отправляет и не сохраняет обращение. Для реальной связи доступны прямые контакты.';
  $('#submit').textContent = en ? 'Check enquiry · preview' : 'Проверить заявку · просмотр';
  document.querySelectorAll('#turnstile-widget').forEach(el => el.replaceChildren());
  const barLink = $('#cta-bar a');
  if (barLink) {barLink.textContent = en ? 'Discuss a challenge' : 'Обсудить задачу';}
}
