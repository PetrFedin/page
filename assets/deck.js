/* Полное содержание презентации фэшн-консалтинга — то же, что в PDF.
   Блок = заголовок + набор карточек. Карточка: eyebrow / title / body / decision / list. */

export const DECK = {
  ru: {
    kicker: 'Фэшн-консалтинг для брендов',
    title: 'Стратегия, экономика и трансформация фэшн-бизнеса',
    lead: 'Помогаю собственникам видеть экономику решения до того, как оно становится закупкой, запасом, обязательством и потраченным капиталом. Работа идёт на стыке стратегии, коммерции, продукта, данных, цифрового контура, финансов и управленческого исполнения.',
    tagline: 'Рост • трансформация • стабилизация',
    chainTitle: 'Сквозная логика работы',
    chain: ['Рынок', 'Клиент', 'Бренд', 'Коллекция', 'Продукт', 'Закупка и производство', 'Запас', 'Канал и продажа', 'Деньги'],
    decisionLabel: 'Решение',
    download: 'Скачать презентацию (PDF)',
    glossaryTitle: 'Сокращения',
    glossary: [
      ['PLM', 'управление жизненным циклом продукта'],
      ['ERP', 'операционный контур'],
      ['CRM', 'клиентская база'],
      ['WMS', 'склад'],
      ['BI', 'управленческая аналитика'],
      ['SKU', 'товарная позиция']
    ],
    footnote: 'Названия клиентов и чувствительные данные не раскрываются. Конфиденциальность клиентских данных — базовый стандарт работы.',
    blocks: [
      {
        id: 'directions',
        title: 'Направления работы',
        note: 'Экономический результат создаётся на стыке функций: рынок, клиент, продукт, операции, капитал и цифровой контур связываются в единую систему решений.',
        items: [
          { eyebrow: '01', title: 'Стратегический выбор', body: 'Рынки России, СНГ и отдельных стран Азии; позиционирование; категории; адаптация продукта и коммерческой модели.', decision: 'Куда выходить, что масштабировать и какой капитал потребуется.' },
          { eyebrow: '02', title: 'Коммерческая модель', body: 'Клиенты, цены, маркетинг, розница, интернет-магазин, опт и маркетплейсы.', decision: 'Где бренд реально зарабатывает на клиенте и канале.' },
          { eyebrow: '03', title: 'Продукт и товарное планирование', body: 'Коллекция, SKU, прогноз спроса, закупка, распределение, пополнение и уценка.', decision: 'Что покупать, производить, переоценивать и развивать.' },
          { eyebrow: '04', title: 'Операции, управление и цифровой контур', body: 'Процессы, роли, показатели; PLM, ERP, CRM, WMS, BI; производство, склад и логистика.', decision: 'Как управлять регулярно, быстрее и на одной версии данных.' },
          { eyebrow: '05', title: 'Капитал, инвестиции и устойчивость', body: 'Денежный поток, оборотный капитал, оценка бизнеса, потребность в финансировании, сделки и стабилизация.', decision: 'Сколько капитала требуется, как его обосновать и насколько бизнес готов к росту или сделке.' }
        ]
      },
      {
        id: 'requests',
        title: 'С чем приходят собственники',
        note: 'Собственники приходят за решением, а не за отчётом. Каждая задача переводится в управленческое действие: куда расти, что остановить, что стабилизировать и что профинансировать.',
        items: [
          { eyebrow: 'Рост', title: 'Новый рынок', decision: 'Выбрать рынок, модель входа, ассортимент и цену.' },
          { eyebrow: 'Рост', title: 'Расширение категорий', decision: 'Определить, где бренд имеет право расширяться.' },
          { eyebrow: 'Рост', title: 'Инвестиционный выбор', decision: 'Выбрать, что масштабировать первым.' },
          { eyebrow: 'Рост', title: 'Ограничения роста', decision: 'Снять узкие места до расширения.' },
          { eyebrow: 'Коммерция', title: 'Продажи растут, маржа не растёт', decision: 'Найти, где размывается маржа.' },
          { eyebrow: 'Коммерция', title: 'Каналы дают выручку', decision: 'Измерить вклад и пересобрать условия.' },
          { eyebrow: 'Коммерция', title: 'Клиент дорожает', decision: 'Пересобрать цену, маркетинг и повторные покупки.' },
          { eyebrow: 'Коммерция', title: 'Уценки съедают маржу', decision: 'Пересобрать скидки, остатки и правила выхода.' },
          { eyebrow: 'Товар и операции', title: 'Ассортимент разрастается', decision: 'Выбрать, что развивать, сокращать или переоценивать.' },
          { eyebrow: 'Товар и операции', title: 'Запасы неуправляемы', decision: 'Настроить распределение, пополнение, перемещения.' },
          { eyebrow: 'Товар и операции', title: 'Производство тормозит рост', decision: 'Изменить мощность, сроки, качество и поставщиков.' },
          { eyebrow: 'Товар и операции', title: 'Разработка продукта и данные разорваны', decision: 'Спроектировать PLM/BI-контур и автоматизацию.' },
          { eyebrow: 'Капитал и управление', title: 'Прибыль не превращается в деньги', decision: 'Связать прибыль, деньги и оборотный капитал.' },
          { eyebrow: 'Капитал и управление', title: 'Потребность в капитале или сделка', decision: 'Подготовить модель, потребность и материалы.' },
          { eyebrow: 'Капитал и управление', title: 'Решения принимаются слишком поздно', decision: 'Ввести сигналы, цикл управления и контроль.' },
          { eyebrow: 'Капитал и управление', title: 'Роли и полномочия размыты', decision: 'Закрепить ответственность и права решений.' }
        ],
        after: 'Фокус — принять решение раньше, чем ошибка становится запасом, кассовым разрывом, потерей сезона или неверной инвестицией.'
      },
      {
        id: 'flow',
        title: 'Как данные становятся решением',
        note: 'Четыре шага, которые превращают ручной сбор цифр в систему решений.',
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
        note: 'Проектируем не «ещё одну систему», а сквозной контур: продукт → продажи → запасы → деньги → решение. Источники → единая модель данных → панель решений → действие.',
        items: [
          { title: 'PLM-контур продукта', body: 'Карточка изделия, материалы, образцы, спецификации, себестоимость, версии, согласования и календарь коллекции.' },
          { title: 'Аналитика и BI', body: 'Единая версия продаж, маржи, запасов, клиентов, каналов, закупок, производства и денег.' },
          { title: 'Системная архитектура', body: 'Требования к ERP, CRM, WMS и интеграциям, роль каждой системы в контуре.' },
          { title: 'ИИ и автоматизация', body: 'Прогноз спроса, сигналы по остаткам, сценарии уценки, рекомендации закупки и распределения.' },
          { title: 'Товарное планирование', body: 'Прогноз, лимит закупки, размерность, распределение, пополнение, перемещения и доступность товара.' },
          { title: 'Контроль внедрения', body: 'Бизнес-требования, тестирование процессов, обучение и переход от Excel к регулярному управлению.' }
        ],
        after: 'На выходе: целевая архитектура, бизнес-требования, модель данных, прототип управленческой панели и план внедрения. Позиция: сначала бизнес-логика, данные и ответственность — только затем система и автоматизация.'
      },
      {
        id: 'outcome',
        title: 'Что остаётся внутри компании',
        note: 'Клиент получает не презентацию, а набор решений и рабочий ритм: модели, правила решений, показатели, роли и регулярный контроль исполнения.',
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
        after: 'Роль может расширяться от советника собственника до руководителя программы стабилизации: приоритеты, координация функций, контроль исполнения и сложные переговоры.'
      },
      {
        id: 'experience',
        title: 'Релевантный опыт',
        note: 'Показываю тип задачи, масштаб и глубину работы — без названий клиентов.',
        items: [
          { eyebrow: 'Управленческий опыт', title: 'Крупная мультибрендовая фэшн-розница', body: '500+ брендов, 30 000+ SKU: закупки, ассортимент, маржа, оборачиваемость, товарная аналитика и автоматизация решений.' },
          { eyebrow: 'Операционная диагностика', title: 'Премиальный сегмент: разработка и производство', body: 'Периметр: финансы → продукт → производство → запасы → управление. Сквозная работа от экономики заказа и капитала до производства и управленческой модели.' },
          { eyebrow: 'Стратегия и финансы', title: 'Стратегия роста, рынки и капитал', body: 'Периметр: рынок → финансовая модель → капитал → переговоры. География, конкурентная среда, потребность в финансировании и материалы для решения собственника.' },
          { eyebrow: 'Стабилизация', title: 'Пересборка управления в турбулентности', body: 'Периметр: ликвидность → приоритеты → ответственность → контроль. Стабилизация управляемости и возвращение бизнеса в режим роста.' }
        ]
      }
    ]
  },

  en: {
    kicker: 'Fashion advisory for brands',
    title: 'Strategy, economics and transformation for fashion businesses',
    lead: 'I help owners see the economics of a decision before it turns into a purchase order, dead stock, a liability and spent capital. The work sits where strategy, commerce, product, data, systems, finance and management execution meet.',
    tagline: 'Growth • transformation • turnaround',
    chainTitle: 'The end-to-end logic',
    chain: ['Market', 'Customer', 'Brand', 'Collection', 'Product', 'Buying & production', 'Inventory', 'Channel & sales', 'Cash'],
    decisionLabel: 'Decision',
    download: 'Download the deck (PDF)',
    glossaryTitle: 'Abbreviations',
    glossary: [
      ['PLM', 'product lifecycle management'],
      ['ERP', 'the operational backbone'],
      ['CRM', 'the customer base'],
      ['WMS', 'the warehouse'],
      ['BI', 'management analytics'],
      ['SKU', 'a stock-keeping unit']
    ],
    footnote: 'Client names and sensitive data are never disclosed. Client confidentiality is a baseline standard of the work.',
    blocks: [
      {
        id: 'directions',
        title: 'Areas of work',
        note: 'Economic results are created where functions meet: market, customer, product, operations, capital and systems are tied into one decision system.',
        items: [
          { eyebrow: '01', title: 'Strategic choice', body: 'Russia, CIS and selected Asian markets; positioning; categories; product and commercial model fit.', decision: 'Which market to enter, what to scale and how much capital it takes.' },
          { eyebrow: '02', title: 'Commercial model', body: 'Customers, pricing, marketing, retail, e-commerce, wholesale and marketplaces.', decision: 'Where the brand actually makes money — by customer and by channel.' },
          { eyebrow: '03', title: 'Product & merchandise planning', body: 'Collection, SKU, demand forecast, open-to-buy, allocation, replenishment and markdown.', decision: 'What to buy, produce, reprice and grow.' },
          { eyebrow: '04', title: 'Operations, management & systems', body: 'Processes, roles and KPIs; PLM, ERP, CRM, WMS, BI; production, warehouse and logistics.', decision: 'How to run the business on a regular cadence and a single version of the data.' },
          { eyebrow: '05', title: 'Capital, investment & resilience', body: 'Cash flow, working capital, valuation, funding needs, transactions and turnaround.', decision: 'How much capital is needed, how to justify it and whether the business is ready to grow or transact.' }
        ]
      },
      {
        id: 'requests',
        title: 'What owners come with',
        note: 'Owners come for a decision, not a report. Every question is translated into a management action: where to grow, what to stop, what to stabilise and what to fund.',
        items: [
          { eyebrow: 'Growth', title: 'New market', decision: 'Choose the priority market, entry model, assortment and pricing.' },
          { eyebrow: 'Growth', title: 'Category expansion', decision: 'Define where the brand has the right to expand.' },
          { eyebrow: 'Growth', title: 'Investment choice', decision: 'Decide what to scale first.' },
          { eyebrow: 'Growth', title: 'Growth constraints', decision: 'Remove bottlenecks before expansion.' },
          { eyebrow: 'Commercial', title: 'Sales grow, margin does not', decision: 'Identify where sales economics is diluted.' },
          { eyebrow: 'Commercial', title: 'Channels generate revenue', decision: 'Measure contribution and reset terms.' },
          { eyebrow: 'Commercial', title: 'Customer acquisition costs rise', decision: 'Adjust pricing, marketing and repeat purchase.' },
          { eyebrow: 'Commercial', title: 'Markdowns erode margin', decision: 'Redesign discounts, inventory and exit rules.' },
          { eyebrow: 'Product & operations', title: 'Assortment is expanding', decision: 'Decide what to develop, cut or reprice.' },
          { eyebrow: 'Product & operations', title: 'Inventory is unmanaged', decision: 'Set allocation, replenishment and transfers.' },
          { eyebrow: 'Product & operations', title: 'Production slows growth', decision: 'Adjust capacity, lead times, quality and suppliers.' },
          { eyebrow: 'Product & operations', title: 'Product development and data are disconnected', decision: 'Design the PLM/BI architecture and automation.' },
          { eyebrow: 'Capital & management', title: 'Profit does not convert into cash', decision: 'Connect profit, cash and working capital.' },
          { eyebrow: 'Capital & management', title: 'Capital need or transaction', decision: 'Prepare the model, the funding need and the materials.' },
          { eyebrow: 'Capital & management', title: 'Decisions are made too late', decision: 'Install signals, a management cycle and execution control.' },
          { eyebrow: 'Capital & management', title: 'Roles and authorities are blurred', decision: 'Define accountability and decision rights.' }
        ],
        after: 'The point is to decide before the mistake becomes dead stock, a cash gap, a lost season or a wrong investment.'
      },
      {
        id: 'flow',
        title: 'How data becomes a decision',
        note: 'Four steps that turn manual number-gathering into a decision system.',
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
        note: 'The goal is not one more system but an end-to-end loop: product → sales → inventory → cash → decision. Sources → one data model → a decision dashboard → action.',
        items: [
          { title: 'Product PLM loop', body: 'Style record, materials, samples, specifications, cost, versions, approvals and the collection calendar.' },
          { title: 'Analytics and BI', body: 'One version of sales, margin, inventory, customers, channels, buying, production and cash.' },
          { title: 'Systems architecture', body: 'Requirements for ERP, CRM, WMS and integrations, and the role of each system in the loop.' },
          { title: 'AI and automation', body: 'Demand forecast, stock signals, markdown scenarios, buying and allocation recommendations.' },
          { title: 'Merchandise planning', body: 'Forecast, open-to-buy, size curves, allocation, replenishment, transfers and product availability.' },
          { title: 'Implementation control', body: 'Business requirements, process testing, training and the move from spreadsheets to a regular management cadence.' }
        ],
        after: 'Deliverables: target architecture, business requirements, data model, a management dashboard prototype and an implementation plan. The principle: business logic, data and accountability first — the system and automation second.'
      },
      {
        id: 'outcome',
        title: 'What stays inside the company',
        note: 'The client gets a set of decisions and a working cadence rather than a deck: models, decision rules, metrics, roles and regular execution control.',
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
        after: 'The role can extend from advising the owner to running the turnaround programme: priorities, cross-function coordination, execution control and difficult negotiations.'
      },
      {
        id: 'experience',
        title: 'Relevant experience',
        note: 'Showing the type of work, its scale and depth — without client names.',
        items: [
          { eyebrow: 'Management experience', title: 'Large multi-brand fashion retail', body: '500+ brands, 30,000+ SKUs: buying, assortment, margin, stock turn, merchandise analytics and decision automation.' },
          { eyebrow: 'Operational diagnostics', title: 'Premium segment: development and production', body: 'Scope: finance → product → production → inventory → management. End-to-end work from order economics and capital to production and the management model.' },
          { eyebrow: 'Strategy and finance', title: 'Growth strategy, markets and capital', body: 'Scope: market → financial model → capital → negotiations. Geography, competitive landscape, funding needs and materials for the owner’s decision.' },
          { eyebrow: 'Turnaround', title: 'Rebuilding management under turbulence', body: 'Scope: liquidity → priorities → accountability → control. Restoring control of the business and returning it to growth.' }
        ]
      }
    ]
  }
};
