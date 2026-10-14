/*
 * Public product-offer concepts. NOT a term sheet, published price list or proof
 * of cap-table ownership, financing availability, client traction or delivery.
 * RU/EN copy is an editorial proposal awaiting owner + legal approval.
 */
export const OPPORTUNITY_COPY = {
  ru: {
    eyebrow: 'Коммерческие сценарии · предварительная оценка',
    title: 'От конкретной задачи — к проверяемой экономике',
    lead: 'Выберите направление: собственное ПО, интеграция наших платформ, пересборка бизнеса, ранний доступ или обсуждение финансирования проекта. Суммы здесь — модель, а не утверждённый прайс или инвестиционное предложение.',
    disclaimer: 'Все условия обсуждаются индивидуально. Наши тарифы, доступные доли, договоры, сроки запуска и финансовые показатели пока не опубликованы как подтверждённые. Расчёт ничего не бронирует, не оплачивает и не отправляет автоматически.',
    modes: [
      {id:'build',title:'Разработка и интеграция',desc:'Построить своё решение или адаптировать существующую платформу'},
      {id:'transform',title:'Трансформация бизнеса',desc:'Процессы, расходы, аналитика, управленческий контур'},
      {id:'access',title:'Ранний доступ',desc:'Бесплатное знакомство, пилот, расширенные права, запуск'},
      {id:'capital',title:'Участие в проектах',desc:'Долевой капитал, партнёрство, финансирование этапов'}
    ],
    projectLabel:'Продукт или направление',
    ownProject:'Свой новый продукт / задача компании',
    projectStatus:'Стадия и доступность продукта подтверждаются отдельно; это не публичный реестр свободных долей.',
    buildTitle:'Сравнение сценариев создания программного продукта',
    buildLead:'Сопоставьте индивидуальную разработку и вариант с повторным использованием готовых компонентов. Базовый ориентир — ставки команд Clutch, а не прайс SYNTHA. Время зависит от состава команды и приёмки.',
    buildTypes:[
      ['crm','CRM, продажи и клиентский путь'],
      ['marketplace','Маркетплейс и платформа сделок'],
      ['erp','ERP / PLM / закупка / товар / поставки'],
      ['finance','Управленческие финансы и контроль капитала'],
      ['bi','BI / аналитика / управленческая отчётность'],
      ['mobile','Клиентское веб- или мобильное приложение'],
      ['integration','Интеграция нашей платформы с вашими системами'],
      ['custom','Иное корпоративное ПО']
    ],
    typeLabel:'Класс решения',hoursLabel:'Оценка совокупных трудозатрат, часов',weeklyLabel:'Ресурс команды, часов в неделю',reuseLabel:'Доля повторно используемой работы, % (гипотеза)',
    rateTitle:'Рыночный ориентир трудозатрат',
    baseCost:'Индивидуальная разработка · только труд',
    adaptedCost:'Сценарий с повторным использованием · только труд',
    diff:'Разница по выбранной гипотезе',
    baselineTime:'Индивидуальная разработка',reuseTime:'Вариант с повторным использованием',weeks:'нед.',
    buildCaveat:'Модель: часы × ставка; вариант интеграции = часы × (1 − повторное использование). Оба сценария используют ОДИНАКОВУЮ ставку для сопоставимости. Реальная доработка может требовать дополнительных часов, лицензий, миграции, тестов, облака, поддержки и юридической экспертизы. Нет доказанного «дешевле рынка» и нет утверждённой цены SYNTHA.',
    benchmark:'Ставки Clutch 2026: $25–49/ч для распространённого диапазона поставщиков. Страновые ставки существенно различаются; это не сопоставимые коммерческие оферты.',
    workflowTitle:'Полный цикл работы',
    workflow:[
      ['01','Диагностика','Цели, карта процессов, текущая экономика, источники данных, ограничения'],
      ['02','Архитектура и смета','Требования, роли, безопасность, интеграции, бюджет и план по этапам'],
      ['03','Пилотный вертикальный сценарий','Рабочий процесс с реальными ответственными и критериями приёмки'],
      ['04','Внедрение','Перенос данных, обучение, тестирование прав и устойчивости, журнал решений'],
      ['05','Подтверждённый результат','Данные до/после, эффект с учётом сезонности и затрат, план сопровождения']
    ],
    samplesTitle:'Для сравнения: готовые продукты',
    sampleNote:'Не аналогичные по функционалу коммерческие предложения. Цены сторонних сервисов — ориентир лицензии, без внедрения и по состоянию на 14.10.2026.',
    samples:[
      ['Odoo','Custom: от $49/пользователь/мес. при годовой оплате (актуальные условия уточнять)','https://www.odoo.com/pricing'],
      ['HubSpot','Smart CRM Professional: от $50/место/мес. (условия и скидки меняются)','https://www.hubspot.com/products/crm'],
      ['Sharetribe','Build $39/мес.; Live $259/мес. или $199/мес. при годовой оплате','https://www.sharetribe.com/help/en/articles/17105170-sharetribe-pricing-plans-and-usage-based-fees'],
      ['Bubble','Starter Web + Mobile: $59/мес. при годовой оплате','https://bubble.io/pricing/compare']
    ],
    transformTitle:'Экономика пересборки и оптимизации бизнеса',
    transformLead:'Оцениваем процессы до покупки технологий. Можно начать с аудита, новой управленческой модели или автоматизации уже согласованного процесса.',
    annualHours:'Ручные трудозатраты в год, часов',costHour:'Полная стоимость часа, USD',reduction:'Потенциальное сокращение часов, %',
    nonLabor:'Прочие ежегодные экономимые расходы, USD (без зарплат)',
    implementation:'Разовый бюджет изменений, USD',support:'Дополнительные ежегодные расходы после внедрения, USD',
    currentLabor:'Сейчас на измеряемый труд в год',annualGross:'Предполагаемая годовая экономия до поддержки',
    annualNet:'Годовой эффект после новой поддержки',payback:'Простая окупаемость',paybackNone:'Не рассчитывается при неположительном эффекте',
    transformCaveat:'Не складывайте расходы дважды: поле «прочие расходы» не должно включать оплату тех же часов. Модель не учитывает стоимость капитала, налоги, рост штата, качество обслуживания, миграционные риски и сезонность. Экономия появится только после подтверждённого внедрения.',
    transformStages:[
      ['Аудит','Карта «как есть», P&L и отчётность, узкие места, потери, ответственность'],
      ['Целевая модель','«Как должно быть»: процессы, KPI, бюджет, владельцы, данные'],
      ['Исполнение','Регламенты, автоматизация, интеграции, миграция, контроль'],
      ['Контроль','Измерение результата и корректирующий цикл с прозрачной атрибуцией']
    ],
    accessTitle:'Программа ранних пользователей и соразработки',
    accessLead:'Разные уровни участия — не обещание бесплатного полнофункционального продукта сейчас. Доступ включается только после готовности соответствующей версии и согласования условий.',
    accessTiers:[
      ['Ознакомление','Материалы и обсуждение сценария без оплаты','Публичные описания, демонстрация при наличии рабочей версии','Не включает доступ к закрытому коду или производственной системе'],
      ['Дизайн-партнёр','Обсуждаемый пилот с ограниченным составом участников','Влияние на приоритеты, расширенное тестирование, совместная приёмка','Права и объём бесплатного теста фиксируются договором'],
      ['Founding Customer','Предзаказ функций или участие в запуске без получения доли','Возможный приоритет при запуске, льготные условия в рамках договора','Отдельные условия доставки, отмены, возврата и поддержки'],
      ['После запуска','Возможная бесплатная базовая версия и платные расширения','Базовые функции для начала; расширенная аналитика, интеграции, SLA — отдельно','Лимиты, цена и срок бесплатного доступа ещё не утверждены']
    ],
    accessFuture:'Будущая предполагаемая цена в месяц, USD',accessDiscount:'Гипотетическая скидка раннему участнику, %',accessMonths:'Срок льготы, месяцев',
    standardValue:'Эквивалент по будущей базовой цене',founderValue:'Сценарий оплаты с льготой',conditionalDifference:'Гипотетическая разница',
    accessCaveat:'Скидки и сроки — только ваши вводные для обсуждения, не утверждённые предложения. Предоплата не является инвестицией, не даёт долю или право на прибыль. До приёма средств нужны договор, точные функции, сроки, возвраты и доступность продукта.',
    capitalTitle:'Форматы стратегического участия и финансирования',
    capitalLead:'Покупают не «идею» и не обещанную доходность: обсуждаются права, ограничения, использование средств, контрольные вехи и подтверждение результата. Публичного предложения ценных бумаг здесь нет.',
    dealPaths:[
      ['Новая доля (primary)','Средства поступают компании на утверждённые этапы; участники размываются по согласованной структуре','При наличии корпоративных решений и согласованных документов'],
      ['Покупка существующей доли (secondary)','Договор с конкретным продающим участником; деньги получает продавец, не компания','Только при доступности пакета, согласии владельцев и ограничениях устава'],
      ['Финансирование этапов','Средства по траншам против подтверждённых результатов; возможна комбинация лицензии, займа или капитала','Юридическая форма и права определяются отдельно'],
      ['Стратегическая сделка / полный выкуп','Обсуждение продажи бизнеса, интеллектуальных прав либо 100% капитала','Не объявляется доступным пакетом; только отдельные переговоры с каждым владельцем'],
      ['Founding Customer / предзаказ','Договор на будущий функционал, ранний доступ и бонусы, не инвестиционная доля','Не смешивать с куплей-продажей акций или обещанием дохода']
    ],
    noCapTable:'Доли действующих участников, права на IP и доступные к сделке пакеты подтверждаются только документами. Сохранение участия основателя рассматривается как целевое условие переговоров, но не как утверждённый cap table.',
    primary:'Новые доли · выпуск',secondary:'Существующая доля · покупка',
    modeLabel:'Механика расчёта',preMoney:'Стоимость компании до инвестирования (предположение), USD',
    investAmount:'Объём средств / цена сделки, USD',founderPercent:'Доля основателя до сделки, % (необязательно)',
    postMoney:'Оценка после привлечения',investorShare:'Модельная доля нового инвестора',
    founderPost:'Доля основателя после нового выпуска',companyInflow:'Денежные поступления в компанию',
    secondaryNote:'При продаже существующей доли капитал компании не увеличивается. Расчёт не подтверждает, что пакет существует или предлагается к продаже.',
    financingNote:'Расчёт предполагает одну категорию акций, отсутствие долгов и иных инструментов, отсутствие опционного пула, комиссий и дополнительных раундов. Это не оценка бизнеса или договор.',
    useFunds:'Куда направляются деньги — предложенная последовательность',
    capitalSteps:[
      ['Продукт и безопасность','Доработка ключевых пользовательских процессов, права, хранение, стабильность'],
      ['Пилот и доказательства','Реальный пилот, приёмка, согласованный контур данных, фактические затраты'],
      ['Коммерческий запуск','Продажи, поддержка, интеграции, compliance, первые оплаченные договоры'],
      ['Масштабирование','Только после повторяемой экономики: новые отрасли, каналы, команды']
    ],
    projectInfo:'Фокус проекта и подтверждённая стадия',
    needsTitle:'Потенциальный предмет партнёрства',
    projectRoles:[
      ['Продуктовый партнёр','Рабочий сценарий, предметная экспертиза, тестирование и обратная связь'],
      ['Первый клиент','Договорённость о пилоте и критериях приёмки, без гарантии готового продукта'],
      ['Технологический партнёр','Интеграции, архитектура, инфраструктура, безопасность и коммерческий канал'],
      ['Инвестор / стратег','Проверка собственников, IP, бюджета, этапов, рисков и структуры сделки']
    ],
    ctaDetailed:'Запросить предметную оценку',
    ctaOwn:'Обсудить свой проект',
    sourceTitle:'Проверяемые рыночные источники',
    sourceWarning:'Сравниваем только трудозатраты и публичные лицензии. Данные разных поставщиков, стран и наборов функций напрямую несопоставимы.',
    inputHint:'Поля с числами — ваши предположения, не данные SYNTHA.',
    empty:'Введите положительные вводные, чтобы рассчитать сценарий.',
    invalid:'Проверьте вводимые значения (границы указаны в полях).',
    rangePrefix:'Ориентир диапазона',
    notQuoted:'Индивидуальная стоимость SYNTHA рассчитывается после обследования задачи и согласования этапов.',
    consentNote:'Кнопка открывает обычную форму. Введённые в калькуляторы финансовые значения не передаются, не записываются и не добавляются в сообщение автоматически.',
    report:'Предварительный сценарий, не КП и не предложение приобрести ценные бумаги'
  },
  en: {
    eyebrow:'Commercial scenarios · preliminary assessment',
    title:'From a concrete challenge to testable economics',
    lead:'Explore custom software, integrating existing platforms, business transformation, early access or potential project financing. Every figure is an illustration, not an approved SYNTHA quote or investment offer.',
    disclaimer:'All terms require separate agreement. Pricing, available equity, contracts, launch dates and traction are not verified for public offering. This tool never reserves, charges or automatically sends anything.',
    modes:[
      {id:'build',title:'Software and integration',desc:'Build your system or adapt an existing platform'},
      {id:'transform',title:'Business transformation',desc:'Workflows, cost base, analytics and controls'},
      {id:'access',title:'Early access',desc:'Explore for free, co-design, pilot and post-launch'},
      {id:'capital',title:'Project participation',desc:'Equity, strategic partnerships and milestone funding'}
    ],
    projectLabel:'Product or opportunity',ownProject:'A new product / your own business case',
    projectStatus:'Product maturity and availability require verification; this is not a public register of available equity.',
    buildTitle:'Compare custom software delivery with platform reuse',
    buildLead:'Estimate the labour-only build cost against an adapted-platform scenario. The published benchmark comes from Clutch, not SYNTHA pricing. Scheduling depends on actual resources and acceptance.',
    buildTypes:[
      ['crm','CRM and customer operations'],
      ['marketplace','Marketplace and transaction platform'],
      ['erp','ERP / PLM / procurement / inventory / supply'],
      ['finance','Management finance and capital control'],
      ['bi','Business intelligence and reporting'],
      ['mobile','Customer web or mobile application'],
      ['integration','Integrate one of our platforms with your stack'],
      ['custom','Other internal or commercial software']
    ],
    typeLabel:'Solution type',hoursLabel:'Total labour effort, hours',weeklyLabel:'Team capacity, hours/week',reuseLabel:'Assumed reusable effort, %',
    rateTitle:'Published labour-rate benchmark',baseCost:'Fully custom build · labour only',
    adaptedCost:'Reusable-components scenario · labour only',diff:'Modelled difference',
    baselineTime:'Fully custom build',reuseTime:'Reuse scenario',weeks:'weeks',
    buildCaveat:'Math: effort × hourly rate; reusable option = effort × (1 − reusability assumption). Both use the SAME rate for a like-for-like comparison. Actual adaptation may require extra work, licences, data migration, testing, hosting, support and regulatory reviews. No verified discount to market and no approved SYNTHA fee.',
    benchmark:'Clutch 2026: $25–49/hour is a commonly reported supplier range; location-specific prices vary greatly and are not comparable binding quotes.',
    workflowTitle:'Full delivery workflow',
    workflow:[
      ['01','Discovery','Business objective, process map, baseline economics, data quality, constraints'],
      ['02','Architecture and scope','Requirements, roles, security, integrations, phased budget and milestones'],
      ['03','Working vertical pilot','One real process with accountable owners and measurable acceptance'],
      ['04','Implementation','Data migration, enablement, access controls, reliability and decision audit'],
      ['05','Verified outcome','Baseline vs actual with adjustments, support plan and next decisions']
    ],
    samplesTitle:'Reference subscription examples',
    sampleNote:'Different software packages and feature sets, not comparable bids. Provider prices checked 14 Oct 2026; exclude implementation.',
    samples:[
      ['Odoo','Custom: from $49/user/month on annual plan; confirm current terms','https://www.odoo.com/pricing'],
      ['HubSpot','Smart CRM Professional: from $50/seat/month; pricing/promotions vary','https://www.hubspot.com/products/crm'],
      ['Sharetribe','Build $39/month; Live $259/month or $199/month annual','https://www.sharetribe.com/help/en/articles/17105170-sharetribe-pricing-plans-and-usage-based-fees'],
      ['Bubble','Starter Web + Mobile: $59/month with annual billing','https://bubble.io/pricing/compare']
    ],
    transformTitle:'Economics of operational redesign',
    transformLead:'Fix workflows before purchasing software. Start with an audit, management reporting or automation of an agreed process.',
    annualHours:'Manual effort per year, hours',costHour:'Fully loaded cost per hour, USD',
    reduction:'Assumed reduction in manual effort, %',nonLabor:'Other annual costs potentially saved, USD (no double-counting salaries)',
    implementation:'One-time programme cost, USD',support:'New recurring annual cost, USD',
    currentLabor:'Baseline annual measured labour cost',annualGross:'Hypothetical gross annual savings',annualNet:'Annual impact net of new support',payback:'Simple payback',paybackNone:'Not meaningful when net savings are not positive',
    transformCaveat:'Do not double-count labour and other operating costs. The model excludes financing costs, taxes, staff growth, customer service trade-offs, migration risks and seasonality. Savings are only real after execution evidence.',
    transformStages:[
      ['Audit','As-is maps, P&L and reporting, bottlenecks, leakages, ownership'],
      ['Target model','To-be workflows, KPIs, budgets, responsibility and data'],
      ['Execution','Procedures, automation, integrations, migration and controls'],
      ['Verification','Post-implementation measurement and attribution']
    ],
    accessTitle:'Founding customer and early access concepts',
    accessLead:'Different participation levels do not mean the full product is available for free today. Access is conditional on product readiness and agreed terms.',
    accessTiers:[
      ['Explore','Free product information and discussions','Published materials and a real demo if available','No private source code or live-system access'],
      ['Design partner','Limited pilot subject to written scope','Priority feedback, extended testing, joint acceptance','Any free access and scope are separately agreed'],
      ['Founding customer','Possible functional pre-order, no equity','Potential launch priority and negotiated founder benefits','Delivery, cancellations, refunds and support must be contracted'],
      ['After launch','Potential free core and paid higher tiers','Entry-level workflows, with integrations and SLA sold separately','Feature limits, pricing and launch dates remain unapproved']
    ],
    accessFuture:'Assumed future monthly list price, USD',accessDiscount:'Hypothetical early-adopter discount, %',accessMonths:'Discount duration, months',
    standardValue:'At assumed future list price',founderValue:'Scenario with discount',conditionalDifference:'Hypothetical difference',
    accessCaveat:'Discounts and durations are user assumptions, not commercial commitments. Paying in advance is not an investment, equity or profit share. Prior to payment, exact deliverables, delivery dates, cancellation/refunds and support must be contracted.',
    capitalTitle:'Structured project participation and financing',
    capitalLead:'The proposition is grounded in rights, restrictions, use of proceeds, milestone acceptance and actual outcomes, not promises of investor returns. This is not a public securities offering.',
    dealPaths:[
      ['Primary equity','New money goes into a company for documented milestones; interests dilute per negotiated cap table','Subject to owner decisions and definitive documents'],
      ['Secondary share purchase','A named existing owner may sell agreed shares; proceeds go to seller, not company','Only if legally transferable and holders consent'],
      ['Milestone funding','Tranches tied to verified delivery; could use licensing, debt or equity instruments','Legal structure and investor rights require advice'],
      ['Strategic transaction / full buyout','Negotiate business, IP asset or even full equity acquisition','Not advertised as an available package; requires all relevant shareholder approvals'],
      ['Founding customer / functional pre-order','Contract for future features/priority access rather than equity ownership','Must not be conflated with share purchases or investment returns']
    ],
    noCapTable:'Current cap table, IP ownership and shares potentially for sale require documentary verification. Retained founder participation is a negotiating objective, not a publicly verified ownership schedule.',
    primary:'Primary issuance',secondary:'Secondary stake purchase',
    modeLabel:'Transaction illustration',preMoney:'Assumed pre-money equity value, USD',
    investAmount:'Assumed investment / consideration, USD',founderPercent:'Assumed founder ownership before round, % (optional)',
    postMoney:'Illustrative post-money value',investorShare:'Illustrative new investor share',
    founderPost:'Founder ownership after primary issuance',companyInflow:'Company cash proceeds',
    secondaryNote:'Secondary sale does not fund the company. Computed stakes do NOT demonstrate that any shares are for sale.',
    financingNote:'Illustration assumes one share class, no debt or other securities, no option pool, fees, further dilution or exit. It is not a valuation conclusion or term sheet.',
    useFunds:'Proposed use-of-proceeds stages',
    capitalSteps:[
      ['Product and security','User workflows, authorisation, resilient storage and quality'],
      ['Verified pilot','Live use case, acceptance, data rights and attributable costs'],
      ['Commercial launch','Sales, service, integrations, compliance and paid contracts'],
      ['Scale responsibly','Only after verified unit economics and repeatability']
    ],
    projectInfo:'Project focus and current published stage',needsTitle:'Possible participation scope',
    projectRoles:[
      ['Product partner','Domain expertise, a test workflow, validation and feedback'],
      ['Early customer','A scoped pilot with acceptance criteria, not a guaranteed live product'],
      ['Technology partner','Integration, architecture, security, operations and go-to-market'],
      ['Strategic investor','Diligence on owners, IP, budget, milestones, risks and deal structure']
    ],
    ctaDetailed:'Request a tailored proposal',ctaOwn:'Discuss your own system',
    sourceTitle:'Public market reference sources',sourceWarning:'Hourly effort and public licence examples are not feature-equivalent competitive bids.',
    inputHint:'All amounts are user hypotheses, not SYNTHA contract terms.',empty:'Enter valid inputs to see an illustration.',
    invalid:'Check the inputs and displayed limits.',
    rangePrefix:'Estimated range',notQuoted:'SYNTHA pricing is tailored following discovery and written phase acceptance.',
    consentNote:'Buttons open the ordinary enquiry form. Financial calculator inputs are not transmitted, stored or added to the lead message.',
    report:'Preliminary scenario; neither a quote nor an offer of securities'
  }
};

export const PROJECT_OPPORTUNITIES = {
  syntha:   {ru:'Product Master, B2B-выбор, заказы и исполнение',en:'Product Master, B2B selection, ordering and fulfilment'},
  chatx:    {ru:'Коммуникация → задача → решение → подтверждение',en:'Communication → task → decision → execution'},
  renova:   {ru:'Заявка → проект → исполнение → подтверждение',en:'Enquiry → project → execution → verification'},
  mfw:      {ru:'Регистрация, события, B2B-связи и измеримые результаты',en:'Accreditation, events, B2B engagement and evidence'},
  promomed: {ru:'Маршрут участника, посещение и аналитика мероприятий',en:'Attendee journeys, event attendance and measurement'},
  'fashion-os':{ru:'Ассортимент, закупки, планирование, supply и маржа',en:'Assortment, buying, planning, supply and margin'},
  fur:      {ru:'Учёт сырья, операции, калькуляция и приёмка',en:'Raw materials, production workflow, cost and acceptance'},
  antiqua:  {ru:'Каталог живописи, provenance и экспертная проверка',en:'Fine-art catalogue, provenance and independent evidence'},
  igra:     {ru:'Детали → модель → инструкция → сборка → игра',en:'Parts → model → instructions → build → play'},
  marco:    {ru:'Private / Wholesale / Admin, размеры и дозаказы',en:'Private / Wholesale / Admin, size grids and reorders'},
  fintech:  {ru:'Планирование денежного потока и долговой нагрузки',en:'Cash-flow and debt management'}
};
