/*
 * V2 clarity layer. Presentation copy is intentionally distinct from the
 * evidence-rich project dossiers, which remain the authoritative detail.
 * No status, commercial term, or technical capability is inferred here.
 */
const COPY = {
  ru: {
    hero: 'Помогаю бизнесу принимать коммерческие решения, управлять товаром и запускать цифровые продукты — от расчёта до внедрения.',
    bio: 'Опыт мультибрендовой розницы, закупочной аналитики и продуктовой разработки. Соединяю экономику, процессы и технологии; показываю, что работает, а что ещё требует проверки.',
    routesTitle: 'С какой задачей вы пришли?',
    routesSub: 'Выберите свой маршрут. Для первого разговора достаточно описать задачу — не нужно заранее разбираться во всех инструментах.',
    routes: [
      ['Бизнесу', 'Закупки, ассортимент, маржа, стратегия и процессы. Начинаем с вашей ситуации и измеримого результата.'],
      ['Партнёрам', 'Пилот на реальном сценарии, внедрение, интеграция или совместная разработка.'],
      ['Инвесторам', 'Конкретный продукт, его стадия, риски, права и условия следующего этапа.']
    ],
    experienceTitle: 'Опыт, на который можно опереться',
    consultingTitle: 'Консалтинг и аналитика',
    consultingSub: 'Пять направлений. В каждом — конкретное решение и следующий шаг; состав работ обсуждаем под вашу задачу.',
    services: [
      'Выбор рынка, категории и модели роста с расчётом рисков.',
      'Каналы продаж, цена, экономика клиента и прибыльность.',
      'Коллекция, спрос, закупка, остатки и уценка.',
      'Данные, процессы и внедрение PLM, ERP, CRM и аналитики.',
      'Оборотный капитал, финансовые сценарии и устойчивость.'
    ],
    formatsSummary: 'Как устроена работа: диагностика, проект или сопровождение',
    formatsHint: 'Подробные форматы, состав работ и условия — по запросу или в карточках ниже.',
    projectsTitle: 'Продукты и платформы',
    projectsSub: 'Три основных проекта. Остальные — по кнопке «Показать другие проекты». Сначала — какую задачу решает продукт и кому он нужен; стадия и доказательства — в подробном досье.',
    dossier: 'Открыть досье',
    materials: 'Статус и материалы',
    developmentTitle: 'Создание и развитие цифровых продуктов',
    developmentDescription: 'Проектирую и развиваю системы под конкретный бизнес-процесс: от модели и MVP до интеграций, пилота и улучшений.',
    developmentSteps: ['Проверяем задачу и экономику', 'Собираем ключевой сценарий', 'Проверяем в пилоте и развиваем'],
    buildAction: 'Обсудить разработку →',
    investAction: 'Форматы участия →',
    launchSummary: 'Нужен свой продукт? Варианты запуска и развития',
    launchHint: 'Покажу, с чего начать: с диагностики, MVP, интеграции или доработки работающей системы.',
    investorsTitle: 'Партнёрство и инвестиции',
    investorsSub: 'Пилот, совместная разработка или инвестиции — под конкретный продукт.',
    investorsLead: 'Выберите формат — детали обсудим лично.',
    investorsFormatsTitle: 'Как можно участвовать',
    investorsFormatsSub: 'Разберём подходящий вариант и следующий шаг.',
    investorNotes: [
      'Финансирование следующего этапа после проверки прав, бюджета и условий.',
      'Компания проверяет решение на своих задачах и влияет на приоритеты развития.',
      'Соединяем продукты, команды и данные в согласованный сценарий.',
      'Партнёр помогает вывести продукт к клиентам и внедрить его.',
      'Партнёрство вокруг платформы для мероприятия или сообщества.',
      'Предметный разговор о доле, продукте или IP после проверки прав.'
    ],
    cooperation: 'Разобрать формат →',
    studioTitle: 'Сценарная экономика проекта',
    studioSub: 'Интерактивная модель для предварительного обсуждения. Не прогноз доходности и не предложение инвестировать.',
    newsTitle: 'Обновления и практика',
    newsSub: 'Короткие материалы о решениях, проектах и том, что изменилось. Без обещаний неподтверждённых результатов.',
    contactTitle: 'Обсудить задачу',
    contactSub: 'Опишите цель и контекст. В ответном разговоре определим следующий шаг и подходящий формат работы.',
    sectors: {
      syntha: 'Fashion / B2B', chatx: 'Команды', renova: 'Недвижимость',
      mfw: 'События / бренды', promomed: 'События / сообщество',
      'fashion-os': 'Fashion / операции', fur: 'Производство', antiqua: 'Искусство',
      igra: 'Игры / 3D', marco: 'Fashion / коммерция', fintech: 'Финансы'
    },
    cards: {
      syntha: ['Продукт и коммерция в одной системе', 'PLM, шоурум, заказ и экономика SKU. Продуктовая цепочка проверяется в PostgreSQL; внешний пилот — отдельный этап.'],
      chatx: ['Работа команды — от сообщения до результата', 'Сообщения, задачи, встречи, календарь и корпоративные знания. Работающий демоконтур снят в Chromium; production-провайдеры проверяются отдельно.'],
      renova: ['Ремонт с проверяемыми этапами', 'Смета, изменения, документы и приёмка с историей действий. Общий production-запуск пока заблокирован внешними приёмочными условиями.'],
      mfw: ['Платформа для событий и брендов', 'Мероприятия, программы, сделки брендов и аудитория. Постоянное хранение и промышленная идентификация требуют отдельной приёмки.'],
      promomed: ['Конференция и сообщество круглый год', 'Рабочий публичный предпросмотр Today, Media, Events, Community; независимая концепция, не официальный продукт сторонней компании.'],
      'fashion-os': ['Операционный контур fashion-бизнеса', 'Заказы, операции, материалы, версия себестоимости, план/факт и 13-недельная ликвидность. Демоданные, не результат клиента.'],
      fur: ['THE FUR — производство под контролем', 'Сырьё, операции, партии и калькуляции. Проверка интеграций и CI продолжается — промышленная готовность не заявлена.'],
      antiqua: ['Паспорт и исследование произведения', 'Живопись и графика: исследование, атрибуция, происхождение. Доказательства и коммерческий контур ещё проходят отдельную проверку.'],
      igra: ['AR-конструктор и библиотека моделей', 'Детали, сценарии сборки и взаимодействие с моделью. Web/iOS-проверки ещё не проходят все инженерные критерии.'],
      marco: ['Цифровой коммерческий шоурум', 'Коллекции, размерная сетка, B2B/Private и жизненный цикл заказа. Реальный production и доступы требуют независимой приёмки.'],
      fintech: ['SVEDO — финансовая устойчивость', 'Обязательства, денежный поток и сценарии платежей. Локальный прототип, не банковский сервис.']
    }
  },
  en: {
    hero: 'I help businesses make commercial decisions, manage products and build digital platforms — from analysis through implementation.',
    bio: 'A background in multibrand retail, buying analytics and software products. I bring together economics, processes and technology, distinguishing what works from what still needs validation.',
    routesTitle: 'What brings you here?',
    routesSub: 'Pick a route. A short description of your challenge is enough to start; you do not need to explore every tool first.',
    routes: [
      ['Businesses', 'Buying, assortment, margin, strategy and processes. Start with the problem and a measurable outcome.'],
      ['Partners', 'Pilot on a real workflow, implementation, integration or joint product development.'],
      ['Investors', 'A specific product, its stage, risks, ownership and the next milestone.']
    ],
    experienceTitle: 'Relevant experience',
    consultingTitle: 'Consulting & analytics',
    consultingSub: 'Five areas of work. Each leads to a decision and a next step; the scope depends on your situation.',
    services: [
      'Market, category and growth-model choices with explicit risks.',
      'Sales channels, pricing, customer economics and profitability.',
      'Collections, demand, buying, inventory and markdowns.',
      'Data, operating processes and PLM, ERP, CRM or BI adoption.',
      'Working capital, financial scenarios and resilience.'
    ],
    formatsSummary: 'How we work: diagnostic, project or ongoing advisory',
    formatsHint: 'Detailed engagement models and deliverables remain available below.',
    projectsTitle: 'Products and platforms',
    projectsSub: 'Three featured products; expand to see the rest. Understand the use case first; open each dossier for stage, evidence and remaining validation work.',
    dossier: 'View dossier',
    materials: 'Status and materials',
    developmentTitle: 'Building and growing digital products',
    developmentDescription: 'I design and extend systems for a real business process: from concept and MVP to integration, pilot and iteration.',
    developmentSteps: ['Validate the need and economics', 'Build the core workflow', 'Pilot, measure and iterate'],
    buildAction: 'Discuss a build →',
    investAction: 'Participation options →',
    launchSummary: 'Need your own product? Delivery and growth options',
    launchHint: 'Start with discovery, MVP, integration or improvement of an existing system.',
    investorsTitle: 'Partnership & investment',
    investorsSub: 'Pilot, co-development or investment in a specific product.',
    investorsLead: 'Choose a format; let us discuss the details directly.',
    investorsFormatsTitle: 'Ways to collaborate',
    investorsFormatsSub: 'Review a practical option and next step.',
    investorNotes: [
      'Fund the next stage after ownership, budget and terms have been verified.',
      'Test the solution on your real workflows and shape priorities.',
      'Connect products, teams and data within an agreed scope.',
      'Bring the product to clients and help deliver adoption.',
      'Support a platform for events or a year-round community.',
      'Explore a stake, product or IP purchase subject to diligence.'
    ],
    cooperation: 'Explore format →',
    studioTitle: 'Project scenario economics',
    studioSub: 'An interactive model for an initial discussion, not a return forecast or a securities offer.',
    newsTitle: 'Updates and insight',
    newsSub: 'Short notes about product decisions, work in progress and verified changes.',
    contactTitle: 'Discuss your challenge',
    contactSub: 'Tell me your objective and context. We can then agree on a useful next step and way of working.',
    sectors: {
      syntha: 'Fashion / B2B', chatx: 'Teams', renova: 'Property',
      mfw: 'Events / brands', promomed: 'Events / community',
      'fashion-os': 'Fashion / operations', fur: 'Manufacturing', antiqua: 'Art',
      igra: 'Play / 3D', marco: 'Fashion / commerce', fintech: 'Finance'
    },
    cards: {
      syntha: ['Product and commerce on one platform', 'PLM, showrooms, orders and SKU economics. PostgreSQL-backed flows are being tested; external adoption remains a separate milestone.'],
      chatx: ['Work from conversation to outcome', 'Messaging, tasks, meetings, calendar and company knowledge. An isolated demo was captured in Chromium; production provider integrations remain separate.'],
      renova: ['Renovations with verifiable stages', 'Estimates, change history, documents and acceptance. Broad production remains gated by external release requirements.'],
      mfw: ['An operating platform for events', 'Events, agendas, brand deals and ongoing communities. Persistent authority and production identity are still under acceptance.'],
      promomed: ['A conference and year-round community', 'Public preview of Today, Media, Events and Community. Independent concept; not an official product or endorsement by a third party.'],
      'fashion-os': ['Operating layer for fashion teams', 'Orders, operations, material costs, versioned costing, plan/actual and 13-week liquidity. Demo data, not observed customer results.'],
      fur: ['THE FUR — production operations', 'Materials, operations, lots and costing. CI and end-to-end integrations need repair before production maturity can be claimed.'],
      antiqua: ['Artwork research and provenance', 'Painting and works on paper with attribution and provenance research. Authentication and commercial operation need independent proof.'],
      igra: ['AR building and model library', 'Parts, assembly workflows and digital models. Web/iOS quality gates still have unresolved failures.'],
      marco: ['A commercial digital showroom', 'Collections, size matrices, B2B/Private ordering and lifecycle design. Live production and identity remain unverified.'],
      fintech: ['SVEDO — financial resilience', 'Obligations, cash-flow plans and repayment scenarios. A local candidate, not a live banking service.']
    }
  }
};

const byId = id => document.getElementById(id);
const setText = (id, text) => {
  const target = byId(id);
  if (target && text) target.textContent = text;
};
const setChildText = (selector, text) => {
  const target = document.querySelector(selector);
  if (target && text) target.textContent = text;
};

export function polishProjectCards(lang) {
  const t = COPY[lang] || COPY.ru;
  document.querySelectorAll('#cards > .card').forEach(card => {
    const id = card.dataset.project;
    const meta = t.cards[id];
    if (meta) {
      setChildText('#cards .card[data-project="' + id + '"] .card-tag', meta[0]);
      setChildText('#cards .card[data-project="' + id + '"] .card-body', meta[1]);
    }
    const logo = card.querySelector('.card-logo');
    if (logo && !card.querySelector('.card-sector')) {
      const sector = document.createElement('span');
      sector.className = 'card-sector';
      sector.textContent = t.sectors[id] || '';
      logo.insertAdjacentElement('afterend', sector);
    }
    const foot = card.querySelector('.card-foot');
    if (!foot || foot.querySelector('.card-tools')) return;
    const first = foot.querySelector('[data-open]');
    if (first) first.textContent = t.dossier;
    const secondary = [...foot.querySelectorAll('button')].filter(x => x !== first);
    const enabled = secondary.filter(x => !x.disabled);
    for (const disabled of secondary.filter(x => x.disabled)) disabled.remove();
    if (!enabled.length) return;
    const details = document.createElement('details');
    details.className = 'card-tools';
    const summary = document.createElement('summary');
    summary.textContent = t.materials;
    const actions = document.createElement('div');
    actions.className = 'card-tools-actions';
    enabled.forEach(button => actions.appendChild(button));
    details.append(summary, actions);
    foot.appendChild(details);
  });
}

function addDisclosure(elementId, wrapperId, title, hint) {
  const node = byId(elementId);
  if (!node) return;
  let details = byId(wrapperId);
  if (!details) {
    details = document.createElement('details');
    details.id = wrapperId;
    details.className = 'v2-disclosure';
    const summary = document.createElement('summary');
    const heading = document.createElement('span');
    heading.className = 'v2-disclosure-title';
    heading.dataset.disclosureTitle = '';
    const icon = document.createElement('span');
    icon.className = 'v2-disclosure-arrow';
    icon.setAttribute('aria-hidden', 'true');
    icon.textContent = '+';
    summary.append(heading, icon);
    const lead = document.createElement('p');
    lead.className = 'v2-disclosure-hint';
    lead.dataset.disclosureHint = '';
    details.append(summary, lead);
    node.parentNode.insertBefore(details, node);
    details.appendChild(node);
  }
  details.querySelector('[data-disclosure-title]').textContent = title;
  details.querySelector('[data-disclosure-hint]').textContent = hint;
}

function openDisclosureForAnchor(anchor) {
  if (!anchor || !anchor.startsWith('#') || anchor.length < 2) return;
  let id;
  try { id = decodeURIComponent(anchor.slice(1)); } catch { return; }
  const target = byId(id);
  let parent = target?.closest('details.v2-disclosure');
  while (parent) {
    parent.open = true;
    parent = parent.parentElement?.closest('details.v2-disclosure');
  }
}

let anchorListenerReady = false;
export function polishPublicPage(lang) {
  const t = COPY[lang] || COPY.ru;
  setText('hero-lead', t.hero);
  setText('hero-bio', t.bio);
  setText('lead-paths-title', t.routesTitle);
  setText('lead-paths-sub', t.routesSub);
  document.querySelectorAll('#lead-routes-grid .lead-route-card').forEach((card,i) => {
    setChildText('#lead-routes-grid [data-route-card="' + card.dataset.routeCard + '"] h3', t.routes[i]?.[0]);
    setChildText('#lead-routes-grid [data-route-card="' + card.dataset.routeCard + '"] > p', t.routes[i]?.[1]);
  });
  setText('experience-title', t.experienceTitle);
  setText('consulting-title', t.consultingTitle);
  setText('consulting-sub', t.consultingSub);
  document.querySelectorAll('#services .svc').forEach((button,i)=>{
    const para=button.querySelector('.svc-b');
    if(para && t.services[i]) para.textContent=t.services[i];
    const link=button.querySelector('.svc-more');
    if(link) link.textContent=(lang==='ru'?'Состав работ':'Scope and outcomes')+' →';
  });
  setText('projects-title', t.projectsTitle);
  setText('projects-sub', t.projectsSub);
  setText('project-development-title', t.developmentTitle);
  setChildText('#project-development .project-development-copy > p:not(.eyebrow)', t.developmentDescription);
  document.querySelectorAll('#project-development .project-development-steps li').forEach((li,i)=>{
    const text=li.querySelector('span:last-child');
    if(text && t.developmentSteps[i]) text.textContent=t.developmentSteps[i];
  });
  setChildText('#project-development a[href="#project-launch"]',t.buildAction);
  setChildText('#project-development a[href="#investment-formats"]',t.investAction);
  setText('investors-title', t.investorsTitle);
  setText('investors-sub', t.investorsSub);
  setText('investors-lead', t.investorsLead);
  setText('investment-formats-title', t.investorsFormatsTitle);
  setText('investment-formats-description', t.investorsFormatsSub);
  document.querySelectorAll('#investors-list .inv-card').forEach((card,i)=>{
    const text=card.querySelector('.inv-what');
    if(text && t.investorNotes[i]) text.textContent=t.investorNotes[i];
    const read=card.querySelector('[data-coop-open]');
    if(read) read.textContent=t.cooperation;
  });
  setText('opportunities-title', t.studioTitle);
  setChildText('#opportunities .op-heading .sub', t.studioSub);
  setText('news-title', t.newsTitle);
  setText('news-sub', t.newsSub);
  setText('contact-title', t.contactTitle);
  setText('contact-sub', t.contactSub);
  polishProjectCards(lang);
  addDisclosure('formats','consulting-formats-extended',t.formatsSummary,t.formatsHint);
  addDisclosure('project-launch','project-launch-extended',t.launchSummary,t.launchHint);
  if (!anchorListenerReady) {
    document.addEventListener('click',event=>{
      const a=event.target.closest('a[href^="#"]');
      if(a) openDisclosureForAnchor(a.getAttribute('href'));
    },true);
    window.addEventListener('hashchange',()=>openDisclosureForAnchor(location.hash));
    anchorListenerReady=true;
  }
  openDisclosureForAnchor(location.hash);
}
