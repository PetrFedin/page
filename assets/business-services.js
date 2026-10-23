/* V2 evidence-scoped independent business consultation tracks. */
const RU=[
{ id:"strategy",title:"Стратегия роста и капитал",tag:"СТРАТЕГИЯ",body:"Выбор рынков, модели роста, инвестиционных приоритетов и сценариев распределения капитала.",decision:"Какой путь роста оправдан и что проверять до инвестиций.",lead:"Для собственников и руководителей, выбирающих направление развития компании.",audience:["Собственники и CEO","Бренды, розничные сети, производители и дистрибьюторы"],pains:["Выручка растёт, но денежный поток и прибыль не улучшаются.","Неясно, в какие рынки, категории и проекты направить ограниченный капитал.","Несколько альтернатив роста требуют объективного сопоставления."],work:["Разбираем финансовую и коммерческую модель бизнеса.","Проверяем альтернативы рынка, партнёров, категории и формата развития.","Считаем сценарии P&L, денежных потоков и рисков.","Фиксируем решения, приоритеты, контрольные точки."],deliverables:["Стратегическая карта решений и альтернатив.","Сценарная финансовая модель и карта рисков.","План развития с критериями проверки."],scope:[{title:"Стратегия",points:["Рынки, клиенты, категории, позиционирование.","Модель масштабирования и конкурентные преимущества."]},{title:"Финансовая устойчивость",points:["Оборотный капитал и финансирование.","Подготовка решений о развитии и сделках."]}],stages:["Согласование управленческого вопроса и конфиденциальности.","Анализ модели, данных и ограничений.","Сценарии и выбор приоритетов.","План действий и контрольные решения."],inputs:["Цели, финансовые и управленческие данные.","Обязательства, ограничения и планы собственников."],boundaries:"Стратегическая работа не является внедрением BI или операционным управлением закупкой."},
{id:"commercial",title:"Коммерческая модель и продажи",tag:"ПРОДАЖИ И КАНАЛЫ",body:"Цены, клиентские сегменты, каналы реализации, условия партнёров и доходность продаж.",decision:"Через какие каналы и на каких условиях бизнес зарабатывает.",lead:"Для компаний, где оборот не отражает реальной доходности магазинов, e-commerce, опта и маркетплейсов.",audience:["Бренды и DTC","Универмаги и розничные сети","Дистрибьюторы и B2B-операторы"],pains:["Скидки, комиссии и логистика поглощают маржу.","Нет понятной доходности по сегменту и каналу.","Ценовая политика и условия партнёров конфликтуют."],work:["Разбираем экономику канала с учётом всех коммерческих расходов.","Формируем ценовую и скидочную политику.","Сегментируем клиентов и предложения.","Определяем KPI и коммерческий план."],deliverables:["Экономика продаж по каналам.","Правила ценообразования и клиентские приоритеты.","План коммерческих действий и проверки эффекта."],scope:[{title:"Цены и условия",points:["Маркап, скидки, возвраты, комиссия и cost-to-serve.","Промо- и договорная политика."]},{title:"Каналы и клиенты",points:["Розница, e-commerce, маркетплейсы и wholesale.","Клиентская сегментация, retention и B2B."]}],stages:["Постановка коммерческой задачи.","Проверка продаж, условий, затрат и клиентов.","Сценарии коммерческих решений.","Тест и контроль результатов."],inputs:["Данные о ценах, продажах и возвратах.","Договоры и состав затрат каналов."],boundaries:"Развитие коммерческой модели не подменяет медиабаинг или разработку управленческой BI-системы."},
{id:"merchandise",title:"Ассортимент, продукт и закупки",tag:"MERCHANDISE / BUYING",body:"Коллекции, категории, размеры, объёмы заказов, распределение, пополнение и уценка.",decision:"Что покупать и производить, сколько и для какого сезона.",lead:"Фокус на реальных закупочных и ассортиментных решениях, а не на разработке отчётной платформы.",audience:["Бренды и производители","Байеры универмагов","Мультибрендовые магазины и дистрибьюторы"],pains:["Сезонный бюджет потрачен не на те модели и размеры.","Избыточные остатки сосуществуют с дефицитом ходовых товаров.","Коллекции и уценка не учитывают сезонный цикл."],work:["Выстраиваем ассортиментную архитектуру и роли категорий.","Пересматриваем матрицу SKU и размерный баланс.","Настраиваем закупку, распределение, пополнение и markdown.","Сопровождаем сезонные решения команды."],deliverables:["Ассортиментная матрица и сезонный buy plan.","Правила аллокации, перемещений и пополнения.","Календарь товарных решений и уценки."],scope:[{title:"Коллекция и матрица",points:["Ширина, глубина, базовые и трендовые SKU.","Размерные ряды и роль товарных категорий."]},{title:"Оперативные решения",points:["Заказ, распределение и re-order.","Уценка, transfer и выход из сезона."]}],stages:["Фиксируем сезон и ограничения.","Анализируем историю и проблемы матрицы.","Формируем план закупки и правила решений.","Проверяем результат в цикле продаж."],inputs:["История ассортимента, продаж и запасов.","Поставщики, размеры, сроки и цены."],boundaries:"Автоматизация отчётов и построение прогнозной BI-платформы — самостоятельная услуга Analytics."},
{id:"operations",title:"Процессы и цифровые системы",tag:"OPERATIONS / PLM · ERP",body:"Операционные цепочки, мастер-данные, роли, согласования и интеграция действующих систем.",decision:"Как сделать исполнение процессов связным и проверяемым.",lead:"Для компаний, где работа теряется между таблицами, подрядчиками, функциями и разными IT-системами.",audience:["Fashion-производство и закупка","Розничные группы","Компании с PLM, ERP, CRM и WMS"],pains:["Несовместимые справочники и версии документов.","Неразрывной цепочки заказ–производство–поставка нет.","Ручные согласования порождают задержки и ошибки."],work:["Картируем процессы и ответственность.","Проектируем master-data и интеграции.","Описываем права, статусы, исключения и контроль.","Проводим пилот и приёмку выбранной системы."],deliverables:["Карта процессов и RACI.","Архитектура и техническое задание.","План внедрения и критерии приёмки."],scope:[{title:"Процесс и ответственность",points:["Product Master → коллекция → заказ → поставка.","Права, согласования, история решений."]},{title:"Системы",points:["PLM, ERP, WMS, CRM, EDI.","API, восстановление сбоев, тестирование."]}],stages:["Описание боли и процессов.","Аудит систем и интеграций.","Проектирование и план внедрения.","Пилот, тестирование, передача."],inputs:["Список систем и владельцы процессов.","Технические интерфейсы и сценарии."],boundaries:"Операционная автоматизация отличается от проектирования отдельного слоя BI-отчётности и прогнозов."},
{id:"analytics",title:"Analytics — товар, капитал и прогноз",tag:"ANALYTICS / BUSINESS INTELLIGENCE",featured:true,body:"Создаём на ваших данных единую систему отчётности по закупкам, продажам, остаткам, бюджетам и прогнозам — от NDA до веб-платформы под ключ.",decision:"Видеть узкие места, контролировать товарный капитал и обоснованно планировать следующий сезон.",lead:"От самостоятельного аналитического аудита до автоматизированной системы управленческой отчётности для бренда, универмага, магазина, сети, дистрибьютора и производства.",audience:["Fashion-бренды и производители","Универмаги, розничные сети, магазины","Дистрибьюторы, оптовики и онлайн-каналы"],pains:["В 1С, POS, ERP, WMS и Excel различаются цифры.","Закупочные бюджеты и план-факт собираются вручную.","Деньги зависают в остатках, а причины неизвестны.","Нет общей картины реальной маржи и прибыльности.","Недостаточно аналитики SKU, брендов, магазинов и размеров.","Прогноз спроса и поступлений не проверен на исторической точности.","Руководители тратят время на подготовку разрозненных отчётов."],work:["Под NDA фиксируем права, задачи и источники.","Сверяем справочники, транзакции, остатки, закупки, возвраты и себестоимость.","Согласуем KPI: продажи, прибыль, маржа, GMROI, WOS, OTB, sell-through.","Создаём отчёты с детализацией от компании до SKU и размера.","Настраиваем бюджет, план-факт, сценарии закупок и прогноз с оценкой ошибки.","Организуем загрузку, качество, доступы, регламент обновления.","При согласованном объёме разрабатываем веб-приложение и передаём заказчику."],deliverables:["Паспорт данных, карта расхождений и словарь KPI.","Управленческие отчёты по закупкам, продажам и запасам.","Бюджетирование, OTB, прогнозные сценарии и контроль точности.","Рекомендации по потерям, неликвидам и прибыльности.","По отдельному заказу — рабочая веб-система, интеграции, обучение и поддержка."],scope:[{title:"Продажи и прибыль",points:["План-факт, возвраты, уценки, маржа и вклад каналов.","Магазин → бренд → категория → SKU → размер."]},{title:"Закупки и поставки",points:["Открытые заказы, приходы, сроки, поставщики.","Бюджет закупки, OTB и обязательства."]},{title:"Остатки и оборотный капитал",points:["Запасы по себестоимости, возраст, WOS, GMROI, sell-through.","Залежалые товары, дефицит, размеры, перемещения и markdown."]},{title:"Бюджет и прогноз",points:["Сезонное бюджетирование по брендам и магазинам.","Модели спроса и поступлений, backtesting и сценарии."]},{title:"Системы и контроль",points:["1С/ERP/POS/WMS/Excel, сверка и единые мастер-данные.","Роли, доступы, обновление и мониторинг качества."]}],stages:["01 · NDA и согласование задач, пользователей и доступа к данным.","02 · Аудит качества истории, справочников и источников.","03 · Словарь KPI, прототип отчётности и проверка формул.","04 · Выбор формата: диагностика, проект отчётности, регулярный контур или собственная платформа.","05 · Пилот на согласованных данных, приёмка, документация и обучение.","06 · При необходимости — сопровождение и развитие прогноза."],inputs:["Ответственный за данные и управленческую задачу.","Разрешённые выгрузки из 1С/ERP, продажи, остатки, цены и бюджеты.","Справочники брендов, SKU, размеров, магазинов, сезонов и контрагентов.","Методика НДС, себестоимости, возвратов и валют."],boundaries:"Сроки, эффект, стоимость и объём после аудита. Прогнозы требуют измерения ошибки; экономию не гарантируем. Конфиденциальные данные не передаются через публичную форму.",engagement:["Диагностика и карта узких мест.","Разовый аналитический отчёт.","Регулярная управленческая отчётность и модели бюджетов.","Интегрированная веб-платформа с передачей и поддержкой."]}
];
const EN_DETAILS=[
  {
    "audience": [
      "Owners and executive teams",
      "Fashion brands, retailers, manufacturers and distributors"
    ],
    "pains": [
      "Revenue grows, but operating profit and cash flow do not improve.",
      "Limited capital is being spread across competing markets, categories and projects.",
      "Strategic alternatives are not evaluated on comparable assumptions."
    ],
    "work": [
      "Reconstruct the operating and financial model.",
      "Compare market, channel, category and partnership strategies.",
      "Stress-test profit, cash flow, investment requirements and risks.",
      "Translate decisions into priorities, owners and review milestones."
    ],
    "deliverables": [
      "Decision map with alternative growth paths.",
      "Scenario financial model and risk register.",
      "Implementation roadmap with measurable decision gates."
    ],
    "scope": [
      {
        "title": "Strategy",
        "points": [
          "Markets, customers, categories, positioning and differentiation.",
          "Scalability, competitive advantage and route to market."
        ]
      },
      {
        "title": "Capital resilience",
        "points": [
          "Working capital, funding needs and financial constraints.",
          "Investment, transformation and transaction preparation."
        ]
      }
    ],
    "stages": [
      "Agree the management question, scope and confidentiality.",
      "Examine financial performance, data and business constraints.",
      "Model alternatives and select priorities.",
      "Set delivery milestones and decision controls."
    ],
    "inputs": [
      "Business objectives, management accounts and financial statements.",
      "Funding constraints, obligations and shareholder priorities."
    ],
    "boundaries": "Strategic advisory is not the same as BI implementation or day-to-day buying management."
  },
  {
    "audience": [
      "Fashion brands and direct-to-consumer teams",
      "Department stores and retail networks",
      "Distributors and wholesale operators"
    ],
    "pains": [
      "Discounts, commissions and logistics erode contribution margin.",
      "The profitability of each sales channel and customer segment is unclear.",
      "Pricing, promotions and partner terms conflict with each other."
    ],
    "work": [
      "Rebuild channel economics including all attributable costs.",
      "Set pricing, discount and promotion principles.",
      "Segment customers and commercial propositions.",
      "Agree commercial KPIs, experiments and an execution plan."
    ],
    "deliverables": [
      "Profitability model across channels and customer groups.",
      "Pricing and discount rules, customer priorities.",
      "Commercial action plan with measurable follow-up."
    ],
    "scope": [
      {
        "title": "Pricing and terms",
        "points": [
          "Mark-up, discounts, returns, commissions and cost-to-serve.",
          "Promotional policy and contractual conditions."
        ]
      },
      {
        "title": "Channels and customers",
        "points": [
          "Retail, e-commerce, marketplaces and wholesale.",
          "Customer segmentation, retention and B2B relationships."
        ]
      }
    ],
    "stages": [
      "Frame the commercial decision.",
      "Reconcile transactions, terms, costs and customer data.",
      "Compare commercial scenarios and trade-offs.",
      "Run a controlled test and review outcomes."
    ],
    "inputs": [
      "Sales, returns, prices, discounts and customer records.",
      "Partner agreements, channel costs and fulfilment data."
    ],
    "boundaries": "Channel strategy does not automatically include media buying or building a separate BI application."
  },
  {
    "audience": [
      "Fashion brands and manufacturers",
      "Department store buying teams",
      "Multi-brand retailers and distributors"
    ],
    "pains": [
      "The seasonal buy budget is concentrated in the wrong styles and sizes.",
      "Excess stock coexists with out-of-stocks in high-demand items.",
      "Assortment and markdown decisions arrive too late in the season."
    ],
    "work": [
      "Design assortment architecture and category roles.",
      "Review SKU depth, size curves and collection balance.",
      "Define purchase, allocation, replenishment and markdown rules.",
      "Support seasonal trade-off decisions with the buying team."
    ],
    "deliverables": [
      "Assortment architecture and seasonal buy plan.",
      "Allocation, transfer and replenishment decision rules.",
      "Merchandising calendar with review and exit triggers."
    ],
    "scope": [
      {
        "title": "Collection and assortment",
        "points": [
          "Category breadth, SKU depth, basics and seasonal styles.",
          "Size runs and category roles in the range."
        ]
      },
      {
        "title": "Trading decisions",
        "points": [
          "Orders, allocations, replenishment and reorder windows.",
          "Markdown, inter-store transfers and end-of-season exit."
        ]
      }
    ],
    "stages": [
      "Agree season goals, timelines and constraints.",
      "Evaluate historical stock and assortment performance.",
      "Produce the buy plan and action thresholds.",
      "Test the rules against real trading results."
    ],
    "inputs": [
      "SKU, stock, sales, returns and size-level history.",
      "Suppliers, lead times, prices and buying limits."
    ],
    "boundaries": "Merchandising decisions are separate from implementing reporting infrastructure and predictive BI."
  },
  {
    "audience": [
      "Fashion manufacturing and sourcing teams",
      "Retail groups",
      "Organizations using PLM, ERP, CRM or WMS"
    ],
    "pains": [
      "Master data, specifications and document versions conflict.",
      "Orders, production, delivery and financial evidence are disconnected.",
      "Manual approval chains create delays and repeated corrections."
    ],
    "work": [
      "Map processes, exceptions, owners and hand-offs.",
      "Define master data, system boundaries and integration contracts.",
      "Specify roles, workflow states, approvals and audit trails.",
      "Run a pilot and independently accept the selected solution."
    ],
    "deliverables": [
      "Process map, ownership model and RACI.",
      "System architecture and implementation specification.",
      "Release plan with test cases and acceptance criteria."
    ],
    "scope": [
      {
        "title": "Processes and accountability",
        "points": [
          "Product master, collection, order and delivery lifecycle.",
          "Permissions, approvals and decision provenance."
        ]
      },
      {
        "title": "Platforms and integrations",
        "points": [
          "PLM, ERP, WMS, CRM and EDI.",
          "APIs, error recovery, reconciliation and test coverage."
        ]
      }
    ],
    "stages": [
      "Identify failure points and business owners.",
      "Audit existing systems and process hand-offs.",
      "Design the target operating model and delivery roadmap.",
      "Pilot, test, document and transfer ownership."
    ],
    "inputs": [
      "Current systems, integrations, interfaces and owners.",
      "Example user scenarios, permissions and exceptions."
    ],
    "boundaries": "Operations integration is distinct from an independent analytics, budgeting and forecasting layer."
  },
  {
    "audience": [
      "Fashion brands and manufacturers",
      "Department stores, shops and retail networks",
      "Wholesalers, distributors and digital channels"
    ],
    "pains": [
      "ERP, POS, WMS and spreadsheets disagree on sales and stock.",
      "Buying budgets and plan-versus-actual reporting are prepared manually.",
      "Capital is locked in stock without a reliable diagnostic.",
      "Reported margins do not reconcile to returns and actual costs.",
      "Teams cannot analyse profitability at SKU, size and store level.",
      "Demand forecasts are not validated on historical out-of-sample periods.",
      "Management spends more time preparing reports than making decisions."
    ],
    "work": [
      "Agree confidentiality terms, scope, data permissions and ownership.",
      "Audit source transactions, master data, costs, returns and stock snapshots.",
      "Define and reconcile sales, profit, GMROI, WOS, OTB and sell-through KPIs.",
      "Build drill-down reporting from company and channel to SKU and size.",
      "Introduce buying budgets, plan/actual scenarios and backtested forecasts.",
      "Establish data quality controls, access rules and update schedules.",
      "Where contracted, deliver an integrated web application with training and handover."
    ],
    "deliverables": [
      "Data inventory, reconciliation report and controlled KPI dictionary.",
      "Management reporting for sales, buying, inventory and profitability.",
      "OTB and budgeting models, forecast scenarios and measured accuracy.",
      "Action list for excess stock, loss-making SKUs and preventable shortages.",
      "Optional web platform, integrations, training and support as separately agreed."
    ],
    "scope": [
      {
        "title": "Sales and profitability",
        "points": [
          "Plan versus actual, returns, markdown, margin and channel contribution.",
          "Company → store → brand → category → SKU → size."
        ]
      },
      {
        "title": "Purchasing and supply",
        "points": [
          "Open orders, inbound receipts, lead times and supplier exposure.",
          "OTB limits, commitments and buying budgets."
        ]
      },
      {
        "title": "Inventory and working capital",
        "points": [
          "Stock at cost, ageing, WOS, GMROI and sell-through.",
          "Excess stock, size gaps, stock transfers and markdown opportunities."
        ]
      },
      {
        "title": "Budgets and forecasting",
        "points": [
          "Seasonal budgets by brand, store and assortment group.",
          "Demand and arrival forecasts with backtesting and scenarios."
        ]
      },
      {
        "title": "Systems and data quality",
        "points": [
          "1C, ERP, POS, WMS and spreadsheet reconciliation.",
          "Access management, monitoring and governed update cycles."
        ]
      }
    ],
    "stages": [
      "01 · NDA, management objectives and data-access permissions.",
      "02 · Audit source history, master data and transaction quality.",
      "03 · Agree KPI formulas and reconcile a reporting prototype.",
      "04 · Select the engagement: diagnostic, reporting, recurring operating cycle or full web platform.",
      "05 · Pilot on approved data, test acceptance, document and train.",
      "06 · Optional forecasting refinement, support and transfer."
    ],
    "inputs": [
      "A named management owner and a data owner.",
      "Authorized ERP/1C exports for sales, inventory, costs and budgets.",
      "Style, SKU, size, store, season and counterparty reference tables.",
      "Policies for VAT, currency, cost allocation and returns."
    ],
    "boundaries": "Timing, fees and scope are agreed after discovery. Forecast error must be measured; results and savings are not guaranteed. Do not send confidential customer datasets through the public contact form.",
    "engagement": [
      "Diagnostic and issue map.",
      "One-off management analytics review.",
      "Recurring reports, buying budgets and planning models.",
      "Integrated web platform with handover and support."
    ]
  }
];
const EN=RU.map((r,i)=>({...r,title:["Growth strategy and capital","Sales and channel economics","Assortment, product and buying","Operations and digital systems","Analytics — reporting, capital and forecasts"][i],tag:["STRATEGY","COMMERCIAL","MERCHANDISING","OPERATIONS","ANALYTICS"][i],body:["Market choices, capital priorities and growth scenarios.","Pricing, channel margins, customer segments and route-to-market economics.","Collections, SKU and size ranges, buying, allocation and markdown decisions.","Workflows, master data, roles and PLM/ERP integrations.","A governed sales, buying, stock, budget and forecasting system, from NDA to a web platform."][i],decision:["Prioritise growth investments.","Identify profitable sales channels.","Decide what to buy and distribute.","Make workflow execution traceable.","Control inventory capital and forecast demand."][i],lead:["Executive decisions backed by scenarios.","Commercial profitability across channels.","Hands-on merchandise and seasonal buying policy.","Operational platforms and role-based process change.","For fashion brands, retailers, department stores and distributors: a complete management analytics engagement."][i],...EN_DETAILS[i]}));
const RU_L={forWhom:"Для кого",pains:"Какие проблемы решаем",scope:"Возможности и состав работ",work:"Что делаем",deliverables:"Что получает заказчик",stages:"Как проходит работа",inputs:"Что потребуется",boundaries:"Ограничения и условия",analyticsMore:"Подробнее об Analytics и внедрении",previous:"Предыдущее",next:"Следующее",discuss:"Обсудить задачу"};
const EN_L={forWhom:"Who benefits",pains:"Problems addressed",scope:"Scope and capabilities",work:"Work delivered",deliverables:"Deliverables",stages:"Engagement stages",inputs:"What we need",boundaries:"Scope and limits",analyticsMore:"Analytics scope and implementation",previous:"Previous",next:"Next",discuss:"Discuss this service"};
export const BUSINESS_SERVICES={ru:{items:RU,labels:RU_L},en:{items:EN,labels:EN_L}};
export function getBusinessServices(lang='ru'){return BUSINESS_SERVICES[lang==='en'?'en':'ru'];}
