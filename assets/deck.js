/* Полное содержание презентации фэшн-консалтинга — то же, что в PDF.
   Блок = заголовок + набор карточек. Карточка: eyebrow / title / body / decision / list. */

export const DECK = {
  ru: {
    kicker: 'Фэшн-консалтинг для брендов',
    title: 'Стратегия, экономика и трансформация фэшн-бизнеса',
    lead: 'Помогаю собственникам увидеть экономику решения до того, как оно превратится в закупку, залежавшийся запас, обязательство и потраченный капитал. Работаю со стратегией, коммерцией, продуктом, данными, финансами и исполнением.',
    tagline: 'Рост • трансформация • стабилизация',
    chainTitle: 'От рынка до денег',
    chain: ['Рынок', 'Клиент', 'Бренд', 'Коллекция', 'Продукт', 'Закупка и производство', 'Запас', 'Канал и продажа', 'Деньги'],
    chainTo: [0, 1, 0, 2, 2, 3, 3, 1, 4],
    chainHint: 'Выберите этап — откроется направление работы, которое его закрывает.',
    decisionLabel: 'Решение',
    download: 'Скачать презентацию (PDF)',
    glossaryTitle: 'Сокращения',
    glossary: [
      ['PLM', 'управление жизненным циклом продукта'],
      ['ERP', 'учёт и операции компании'],
      ['CRM', 'система работы с клиентами'],
      ['WMS', 'складской учёт'],
      ['BI', 'отчёты и панели для управления'],
      ['SKU', 'товарная позиция']
    ],
    footnote: 'Названия клиентов и чувствительные данные не раскрываю. Конфиденциальность — базовое правило работы.',
    blocks: [
      {
        id: 'directions',
        title: 'Направления работы',
        note: 'Деньги теряются на стыках: рынок, клиент, продукт, операции и капитал нельзя считать по отдельности.',
        items: [
          { eyebrow: '01', title: 'Стратегический выбор', body: 'Рынки России, СНГ и отдельных стран Азии; позиционирование; категории; адаптация продукта и коммерческой модели.', decision: 'Куда выходить, что масштабировать и какой капитал потребуется.' },
          { eyebrow: '02', title: 'Коммерческая модель', body: 'Клиенты, цены, маркетинг, розница, интернет-магазин, опт и маркетплейсы.', decision: 'Где бренд реально зарабатывает на клиенте и канале.' },
          { eyebrow: '03', title: 'Продукт и товарное планирование', body: 'Коллекция, SKU, прогноз спроса, закупка, распределение, пополнение и уценка.', decision: 'Что покупать, производить, переоценивать и развивать.' },
          { eyebrow: '04', title: 'Операции, управление и системы', body: 'Процессы, роли, показатели; PLM, ERP, CRM, WMS, BI; производство, склад и логистика.', decision: 'Как управлять по ритму и на одной версии данных.' },
          { eyebrow: '05', title: 'Капитал, инвестиции и устойчивость', body: 'Денежный поток, оборотный капитал, оценка бизнеса, потребность в финансировании, сделки и стабилизация.', decision: 'Сколько нужно капитала, чем его обосновать и готов ли бизнес к росту или сделке.' }
        ]
      },
      {
        id: 'requests',
        title: 'С чем приходят собственники',
        note: 'Собственники приходят за решением, а не за отчётом. Каждая задача сводится к действию: куда расти, что остановить, что стабилизировать, что профинансировать.',
        items: [
          { eyebrow: 'Рост', title: 'Новый рынок', decision: 'Выбрать рынок, модель входа, ассортимент и цену.' },
          { eyebrow: 'Рост', title: 'Расширение категорий', decision: 'Понять, где бренд может расширяться.' },
          { eyebrow: 'Рост', title: 'Инвестиционный выбор', decision: 'Выбрать, что масштабировать первым.' },
          { eyebrow: 'Рост', title: 'Ограничения роста', decision: 'Снять узкие места до расширения.' },
          { eyebrow: 'Коммерция', title: 'Продажи растут, маржа не растёт', decision: 'Найти, где размывается маржа.' },
          { eyebrow: 'Коммерция', title: 'Каналы дают выручку', decision: 'Измерить вклад и пересобрать условия.' },
          { eyebrow: 'Коммерция', title: 'Клиент дорожает', decision: 'Пересобрать цену, маркетинг и повторные покупки.' },
          { eyebrow: 'Коммерция', title: 'Уценки съедают маржу', decision: 'Пересобрать скидки, остатки и правила выхода.' },
          { eyebrow: 'Товар и операции', title: 'Ассортимент разрастается', decision: 'Выбрать, что развивать, сокращать или переоценивать.' },
          { eyebrow: 'Товар и операции', title: 'Запасы неуправляемы', decision: 'Настроить распределение, пополнение и перемещения.' },
          { eyebrow: 'Товар и операции', title: 'Производство тормозит рост', decision: 'Изменить мощность, сроки, качество и поставщиков.' },
          { eyebrow: 'Товар и операции', title: 'Разработка продукта и данные разорваны', decision: 'Спроектировать PLM, BI и автоматизацию.' },
          { eyebrow: 'Капитал и управление', title: 'Прибыль не превращается в деньги', decision: 'Связать прибыль, деньги и оборотный капитал.' },
          { eyebrow: 'Капитал и управление', title: 'Потребность в капитале или сделка', decision: 'Подготовить модель, потребность и материалы.' },
          { eyebrow: 'Капитал и управление', title: 'Решения принимаются слишком поздно', decision: 'Ввести сигналы, цикл управления и контроль.' },
          { eyebrow: 'Капитал и управление', title: 'Роли и полномочия размыты', decision: 'Закрепить ответственность и права решений.' }
        ],
        after: 'Цель — решить раньше, чем ошибка станет запасом, кассовым разрывом, потерянным сезоном или неверной инвестицией.'
      },
      {
        id: 'flow',
        title: 'Как данные становятся решением',
        note: 'Четыре шага от ручного сбора цифр к решению.',
        items: [
          { eyebrow: '01', title: 'Источники', body: 'Продажи, запасы, клиенты, закупки, производство, финансы, маркетинг.' },
          { eyebrow: '02', title: 'Единая модель данных', body: 'Справочники, правила расчёта, качество данных, ответственность.' },
          { eyebrow: '03', title: 'Панель решений', body: 'Маржа, деньги, товар, клиент, канал, мощность, отклонения.' },
          { eyebrow: '04', title: 'Действие', body: 'Закупить, остановить, переоценить, переместить, инвестировать, стабилизировать.' }
        ]
      },
      {
        id: 'digital',
        title: 'Данные, аналитика и PLM',
        note: 'Строю не «ещё одну систему», а цепочку: продукт → продажи → запасы → деньги → решение.',
        items: [
          { title: 'PLM-контур продукта', body: 'Карточка изделия, материалы, образцы, спецификации, себестоимость, версии, согласования и календарь коллекции.' },
          { title: 'Аналитика и BI', body: 'Одна версия цифр: продажи, маржа, запасы, клиенты, каналы, закупки, производство, деньги.' },
          { title: 'Системная архитектура', body: 'Требования к ERP, CRM, WMS и интеграциям: что делает каждая система.' },
          { title: 'ИИ и автоматизация', body: 'Прогноз спроса, сигналы по остаткам, сценарии уценки, рекомендации закупки и распределения.' },
          { title: 'Товарное планирование', body: 'Прогноз, лимит закупки, размерность, распределение, пополнение, перемещения и доступность товара.' },
          { title: 'Контроль внедрения', body: 'Требования, тестирование процессов, обучение и переход от таблиц к регулярному управлению.' }
        ],
        after: 'Результат: целевая архитектура, бизнес-требования, модель данных, прототип панели и план внедрения. Принцип: сначала бизнес-логика, данные и ответственность, потом система и автоматизация.'
      },
      {
        id: 'outcome',
        title: 'Что остаётся внутри компании',
        note: 'Клиент получает не презентацию, а решения и рабочий ритм: модели, правила, показатели, роли и регулярный контроль.',
        items: [
          {
            title: 'Решения собственника',
            list: [
              'Куда инвестировать и где выходить на новый рынок',
              'Что покупать, производить, уценять и масштабировать',
              'Какой канал, клиент и категория создают вклад',
              'Сколько капитала нужно для роста, сделки или стабилизации'
            ]
          },
          {
            title: 'Рабочие инструменты',
            list: [
              'Экономика прибыли и потребности в деньгах',
              'Карта рынка, конкурентов и географии роста',
              'Модель ассортимента, закупки и запасов',
              'Целевая цифровая архитектура и требования к PLM / BI'
            ]
          },
          {
            title: 'Режим стабилизации',
            list: [
              'Планирование: деньги, ограничения, приоритеты',
              'Организация: процессы, роли, ответственность',
              'Руководство: команда, решения, переговоры',
              'Контроль: короткий цикл план → факт → действие'
            ]
          }
        ],
        after: 'Роль может вырасти от советника собственника до руководителя программы стабилизации: приоритеты, координация функций, контроль исполнения, сложные переговоры.'
      },
      {
        id: 'experience',
        title: 'Релевантный опыт',
        note: 'Тип задач, масштаб и глубина работы — без названий клиентов.',
        items: [
          { eyebrow: 'Управленческий опыт', title: 'Крупная мультибрендовая фэшн-розница', body: '500+ брендов, 30 000+ SKU: закупки, ассортимент, маржа, оборачиваемость, товарная аналитика и автоматизация решений.' },
          { eyebrow: 'Операционная диагностика', title: 'Премиальный сегмент: разработка и производство', body: 'Финансы → продукт → производство → запасы → управление. От экономики заказа и капитала до производства и модели управления.' },
          { eyebrow: 'Стратегия и финансы', title: 'Стратегия роста, рынки и капитал', body: 'Рынок → финансовая модель → капитал → переговоры. География, конкуренты, потребность в финансировании и материалы для решения собственника.' },
          { eyebrow: 'Стабилизация', title: 'Пересборка управления в турбулентности', body: 'Ликвидность → приоритеты → ответственность → контроль. Вернуть управляемость и выйти обратно на рост.' }
        ]
      }
    ]
  },

  en: {
    kicker: 'Fashion advisory for brands',
    title: 'Strategy, economics and transformation for fashion businesses',
    lead: 'I help owners see what a decision will really cost before it becomes a purchase order, dead stock, a liability or spent capital. I work across strategy, commerce, product, data, finance and execution.',
    tagline: 'Growth • transformation • turnaround',
    chainTitle: 'From market to cash',
    chain: ['Market', 'Customer', 'Brand', 'Collection', 'Product', 'Buying & production', 'Inventory', 'Channel & sales', 'Cash'],
    chainTo: [0, 1, 0, 2, 2, 3, 3, 1, 4],
    chainHint: 'Choose a stage to open the area of work that covers it.',
    decisionLabel: 'Decision',
    download: 'Download the deck (PDF)',
    glossaryTitle: 'Abbreviations',
    glossary: [
      ['PLM', 'product lifecycle management'],
      ['ERP', 'accounting and operations'],
      ['CRM', 'customer management'],
      ['WMS', 'warehouse management'],
      ['BI', 'dashboards and reports'],
      ['SKU', 'stock-keeping unit']
    ],
    footnote: 'I never disclose client names or sensitive data. Confidentiality is a baseline rule.',
    blocks: [
      {
        id: 'directions',
        title: 'Areas of work',
        note: 'Money is made or lost where functions meet. Market, customer, product, operations and capital have to be planned together.',
        items: [
          { eyebrow: '01', title: 'Strategic choice', body: 'Russia, CIS and selected Asian markets; positioning; categories; product and commercial model fit.', decision: 'Which market to enter, what to scale and how much capital it takes.' },
          { eyebrow: '02', title: 'Commercial model', body: 'Customers, pricing, marketing, retail, e-commerce, wholesale and marketplaces.', decision: 'Where the brand actually makes money — by customer and by channel.' },
          { eyebrow: '03', title: 'Product & merchandise planning', body: 'Collection, SKU, demand forecast, open-to-buy, allocation, replenishment and markdown.', decision: 'What to buy, produce, reprice and grow.' },
          { eyebrow: '04', title: 'Operations, management & systems', body: 'Processes, roles and KPIs; PLM, ERP, CRM, WMS, BI; production, warehouse and logistics.', decision: 'How to run the business on a steady cadence and one set of numbers.' },
          { eyebrow: '05', title: 'Capital, investment & resilience', body: 'Cash flow, working capital, valuation, funding needs, transactions and turnaround.', decision: 'How much capital you need, how to justify it, and whether the business is ready to grow or do a deal.' }
        ]
      },
      {
        id: 'requests',
        title: 'What owners come with',
        note: 'Owners come for a decision, not a report. Each problem ends in an action: where to grow, what to stop, what to stabilise, what to fund.',
        items: [
          { eyebrow: 'Growth', title: 'New market', decision: 'Choose the priority market, entry model, assortment and pricing.' },
          { eyebrow: 'Growth', title: 'Category expansion', decision: 'Work out where the brand can credibly expand.' },
          { eyebrow: 'Growth', title: 'Investment choice', decision: 'Decide what to scale first.' },
          { eyebrow: 'Growth', title: 'Growth constraints', decision: 'Remove bottlenecks before expansion.' },
          { eyebrow: 'Commercial', title: 'Sales grow, margin does not', decision: 'Find where the margin leaks.' },
          { eyebrow: 'Commercial', title: 'Channels generate revenue', decision: 'Measure contribution and reset terms.' },
          { eyebrow: 'Commercial', title: 'Customer acquisition costs rise', decision: 'Rework pricing, marketing and repeat sales.' },
          { eyebrow: 'Commercial', title: 'Markdowns erode margin', decision: 'Redesign discounts, inventory and exit rules.' },
          { eyebrow: 'Product & operations', title: 'Assortment is expanding', decision: 'Decide what to develop, cut or reprice.' },
          { eyebrow: 'Product & operations', title: 'Inventory is unmanaged', decision: 'Set allocation, replenishment and transfers.' },
          { eyebrow: 'Product & operations', title: 'Production slows growth', decision: 'Adjust capacity, lead times, quality and suppliers.' },
          { eyebrow: 'Product & operations', title: 'Product development and data are disconnected', decision: 'Design the PLM, BI and automation set-up.' },
          { eyebrow: 'Capital & management', title: 'Profit does not convert into cash', decision: 'Connect profit, cash and working capital.' },
          { eyebrow: 'Capital & management', title: 'Capital need or transaction', decision: 'Prepare the model, the funding need and the materials.' },
          { eyebrow: 'Capital & management', title: 'Decisions are made too late', decision: 'Set up early-warning signals, a management cycle and controls.' },
          { eyebrow: 'Capital & management', title: 'Roles and decision rights are blurred', decision: 'Define accountability and decision rights.' }
        ],
        after: 'The aim is to decide before a mistake turns into dead stock, a cash gap, a lost season or a bad investment.'
      },
      {
        id: 'flow',
        title: 'How data becomes a decision',
        note: 'Four steps from hand-collected numbers to a decision.',
        items: [
          { eyebrow: '01', title: 'Sources', body: 'Sales, inventory, customers, buying, production, finance, marketing.' },
          { eyebrow: '02', title: 'One data model', body: 'Reference data, calculation rules, data quality, ownership.' },
          { eyebrow: '03', title: 'Decision dashboard', body: 'Margin, cash, product, customer, channel, capacity, deviations.' },
          { eyebrow: '04', title: 'Action', body: 'Buy, stop, reprice, transfer, invest, stabilise.' }
        ]
      },
      {
        id: 'digital',
        title: 'Data, analytics and PLM',
        note: 'I build a chain, not “one more system”: product → sales → inventory → cash → decision.',
        items: [
          { title: 'PLM for product development', body: 'Style record, materials, samples, specifications, cost, versions, approvals and the collection calendar.' },
          { title: 'Analytics and BI', body: 'One version of sales, margin, inventory, customers, channels, buying, production and cash.' },
          { title: 'Systems architecture', body: 'Requirements for ERP, CRM, WMS and integrations: what each system does.' },
          { title: 'AI and automation', body: 'Demand forecast, stock signals, markdown scenarios, buying and allocation recommendations.' },
          { title: 'Merchandise planning', body: 'Forecast, open-to-buy, size curves, allocation, replenishment, transfers and product availability.' },
          { title: 'Implementation control', body: 'Requirements, process testing, training and the move from spreadsheets to routine management.' }
        ],
        after: 'You get: target architecture, business requirements, a data model, a dashboard prototype and an implementation plan. Principle: business logic, data and accountability first; systems and automation second.'
      },
      {
        id: 'outcome',
        title: 'What stays inside the company',
        note: 'You get decisions and a working rhythm, not a deck: models, rules, metrics, roles and regular control.',
        items: [
          {
            title: 'Owner decisions',
            list: [
              'Where to invest and which new market to enter',
              'What to buy, produce, mark down and scale',
              'Which channel, customer and category create contribution',
              'How much capital growth, a deal or a turnaround requires'
            ]
          },
          {
            title: 'Working tools',
            list: [
              'Profit economics and cash requirements',
              'Market, competitor and growth geography map',
              'Assortment, buying and inventory model',
              'Target digital architecture and PLM / BI requirements'
            ]
          },
          {
            title: 'Turnaround mode',
            list: [
              'Planning: cash, constraints, priorities',
              'Organisation: processes, roles, accountability',
              'Leadership: team, decisions, negotiations',
              'Control: a short plan → actual → action cycle'
            ]
          }
        ],
        after: 'My role can grow from the owner’s adviser to head of the turnaround programme: priorities, coordinating functions, controlling delivery, hard negotiations.'
      },
      {
        id: 'experience',
        title: 'Relevant experience',
        note: 'Type of problem, scale and depth of work, with no client names.',
        items: [
          { eyebrow: 'Management experience', title: 'Large multi-brand fashion retail', body: '500+ brands, 30,000+ SKUs: buying, assortment, margin, stock turn, merchandise analytics and decision automation.' },
          { eyebrow: 'Operational diagnostics', title: 'Premium segment: development and production', body: 'Finance → product → production → inventory → management. From order economics and capital to production and the management model.' },
          { eyebrow: 'Strategy and finance', title: 'Growth strategy, markets and capital', body: 'Market → financial model → capital → negotiations. Geography, competitors, funding needs and materials for the owner’s decision.' },
          { eyebrow: 'Turnaround', title: 'Rebuilding management in turbulent conditions', body: 'Liquidity → priorities → accountability → control. Regaining control and getting the business back to growth.' }
        ]
      }
    ]
  }
};
