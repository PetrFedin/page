/* Полное содержание презентации фэшн-консалтинга — то же, что в PDF.
   Блок = заголовок + набор карточек. Карточка: eyebrow / title / body / decision / list. */

export const DECK = {
  ru: {
    kicker: 'Фэшн-консалтинг для брендов',
    title: 'Стратегия, экономика и трансформация фэшн-бизнеса',
    lead: 'Помогаю собственникам фэшн-брендов выбрать рынок, объём закупки и размер капитала, пока решение ещё можно изменить: до заказа поставщику, до непроданного запаса, до потраченных денег.',
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
      ['ERP', 'планирование ресурсов и учёт предприятия'],
      ['CRM', 'система работы с клиентами'],
      ['WMS', 'складской учёт'],
      ['BI', 'аналитическая отчётность и панели управления'],
      ['SKU', 'товарная позиция']
    ],
    footnote: 'Названия клиентов и конфиденциальные данные не раскрываю.',
    blocks: [
      {
        id: 'directions',
        title: 'Направления работы',
        note: 'Деньги теряются на стыках функций: рынок, клиент, продукт, операции и капитал нельзя оценивать по отдельности.',
        items: [
          { eyebrow: '01', title: 'Стратегический выбор', body: 'Выбор рынков России, СНГ и Азии и то, как под них перестроить категории, продукт и коммерческую модель.', decision: 'Выбор рынка, объёма масштабирования и размера капитала.' },
          { eyebrow: '02', title: 'Коммерческая модель', body: 'От клиента и цены до канала: розница, интернет-магазин, опт, маркетплейсы и маркетинг.', decision: 'Прибыль по каждому клиенту и каналу, а не по выручке в среднем.' },
          { eyebrow: '03', title: 'Продукт и товарное планирование', body: 'Весь путь товара: коллекция и SKU, прогноз спроса, закупка, распределение, пополнение, уценка.', decision: 'Решение по каждой категории: покупать, производить, переоценивать или развивать.' },
          { eyebrow: '04', title: 'Операции, управление и системы', body: 'Как устроены процессы, роли и показатели, какие системы нужны (PLM, ERP, CRM, WMS, BI) и как связаны производство, склад и логистика.', decision: 'Единый ритм управления и общие цифры во всех отделах.' },
          { eyebrow: '05', title: 'Капитал, инвестиции и устойчивость', body: 'Денежный поток и оборотный капитал, оценка бизнеса, расчёт потребности в финансировании, сделки и стабилизация.', decision: 'Размер капитала, его обоснование и готовность бизнеса к росту или сделке.' }
        ]
      },
      {
        id: 'requests',
        title: 'С чем приходят собственники',
        note: 'Запросы разные, но каждый заканчивается действием: куда расти, что остановить, что стабилизировать, что профинансировать.',
        items: [
          { eyebrow: 'Рост', title: 'Новый рынок', decision: 'Выбрать рынок, модель входа, ассортимент и цену.' },
          { eyebrow: 'Рост', title: 'Расширение категорий', decision: 'Понять, где бренд может расширяться.' },
          { eyebrow: 'Рост', title: 'Инвестиционный выбор', decision: 'Выбрать, что масштабировать первым.' },
          { eyebrow: 'Рост', title: 'Ограничения роста', decision: 'Снять узкие места до расширения.' },
          { eyebrow: 'Коммерция', title: 'Продажи растут, маржа не растёт', decision: 'Найти, где размывается маржа.' },
          { eyebrow: 'Коммерция', title: 'Каналы дают выручку', decision: 'Измерить вклад и пересобрать условия.' },
          { eyebrow: 'Коммерция', title: 'Стоимость привлечения клиента растёт', decision: 'Пересобрать цену, маркетинг и повторные покупки.' },
          { eyebrow: 'Коммерция', title: 'Уценки съедают маржу', decision: 'Пересобрать скидки, остатки и правила выхода.' },
          { eyebrow: 'Товар и операции', title: 'Ассортимент разрастается', decision: 'Выбрать, что развивать, сокращать или переоценивать.' },
          { eyebrow: 'Товар и операции', title: 'Запасы неуправляемы', decision: 'Настроить распределение, пополнение и перемещения.' },
          { eyebrow: 'Товар и операции', title: 'Производство тормозит рост', decision: 'Изменить мощность, сроки, качество и поставщиков.' },
          { eyebrow: 'Товар и операции', title: 'Разработка продукта и данные не связаны', decision: 'Спроектировать PLM, BI и автоматизацию.' },
          { eyebrow: 'Капитал и управление', title: 'Прибыль не превращается в деньги', decision: 'Связать прибыль, деньги и оборотный капитал.' },
          { eyebrow: 'Капитал и управление', title: 'Потребность в капитале или сделка', decision: 'Подготовить модель, потребность и материалы.' },
          { eyebrow: 'Капитал и управление', title: 'Решения принимаются слишком поздно', decision: 'Ввести сигналы, цикл управления и контроль.' },
          { eyebrow: 'Капитал и управление', title: 'Роли и полномочия размыты', decision: 'Закрепить ответственность и права решений.' }
        ],
        after: 'Критерий успеха — ошибка найдена в расчёте, а не в запасе, кассовом разрыве, потерянном сезоне или неверной инвестиции.'
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
        note: 'Шесть направлений работы с данными: от карточки изделия до сигнала для закупки.',
        items: [
          { title: 'PLM-контур продукта', body: 'Карточка изделия, материалы, образцы, спецификации, себестоимость, версии, согласования и календарь коллекции.' },
          { title: 'Аналитика и BI', body: 'Одна версия цифр: продажи, маржа, запасы, клиенты, каналы, закупки, производство, деньги.' },
          { title: 'Системная архитектура', body: 'Требования к ERP, CRM, WMS и интеграциям: что делает каждая система.' },
          { title: 'ИИ и автоматизация', body: 'Прогноз спроса, сигналы по остаткам, сценарии уценки, рекомендации закупки и распределения.' },
          { title: 'Товарное планирование', body: 'Прогноз, лимит закупки, размерность, распределение, пополнение, перемещения и доступность товара.' },
          { title: 'Контроль внедрения', body: 'Требования, тестирование процессов, обучение и переход от таблиц к регулярному управлению.' }
        ],
        after: 'Что остаётся у вас, описано в формате «Данные, аналитика и PLM». Принцип: сначала бизнес-логика, данные и ответственность, потом система и автоматизация.'
      },
      {
        id: 'outcome',
        title: 'Что остаётся внутри компании',
        note: 'В компании остаются модели, правила, показатели, роли и регулярный контроль.',
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
        after: 'При необходимости роль растёт от советника собственника до руководителя программы стабилизации — это форматы «Советник собственника» и «Руководство программой».'
      },
      {
        id: 'experience',
        title: 'Релевантный опыт',
        note: 'Тип задач, масштаб и глубина работы — без названий клиентов.',
        items: [
          { eyebrow: 'Управленческий опыт', title: 'Крупная мультибрендовая фэшн-розница', body: '500+ брендов, 30 000+ SKU: закупки, ассортимент, маржа, оборачиваемость, товарная аналитика и автоматизация решений.' },
          { eyebrow: 'Операционная диагностика', title: 'Премиальный сегмент: разработка и производство', body: 'Финансы → продукт → производство → запасы → управление. От экономики заказа и капитала до производства и модели управления.' },
          { eyebrow: 'Стратегия и финансы', title: 'Стратегия роста, рынки и капитал', body: 'Рынок → финансовая модель → капитал → переговоры. География, конкуренты, потребность в финансировании и материалы для решения собственника.' },
          { eyebrow: 'Стабилизация', title: 'Перестройка управления в нестабильной среде', body: 'Ликвидность → приоритеты → ответственность → контроль. Восстановить управляемость и вернуть бизнес к росту.' }
        ]
      }
    ]
  },

  en: {
    kicker: 'Fashion advisory for brands',
    title: 'Strategy, economics and transformation for fashion businesses',
    lead: 'I help fashion-brand owners choose a market, a buying volume and a capital figure while the decision can still be changed: before the supplier order, before unsold stock, before the money is spent.',
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
      ['ERP', 'enterprise resource planning'],
      ['CRM', 'customer relationship management'],
      ['WMS', 'warehouse management system'],
      ['BI', 'business intelligence: dashboards and reporting'],
      ['SKU', 'stock-keeping unit']
    ],
    footnote: 'I do not disclose client names or confidential data.',
    blocks: [
      {
        id: 'directions',
        title: 'Areas of work',
        note: 'Money is made or lost where functions meet. Market, customer, product, operations and capital have to be planned together.',
        items: [
          { eyebrow: '01', title: 'Strategic choice', body: 'Choosing markets in Russia, the CIS and Asia, and how to rebuild categories, product and commercial model for them.', decision: 'The choice of market, the scale of expansion and the size of the capital.' },
          { eyebrow: '02', title: 'Commercial model', body: 'From customer and price to channel: retail, e-commerce, wholesale, marketplaces and marketing.', decision: 'Profit by customer and channel, not revenue on average.' },
          { eyebrow: '03', title: 'Product & merchandise planning', body: 'The whole path of a product: collection and SKU, demand forecast, open-to-buy, allocation, replenishment, markdown.', decision: 'A call on each category: buy, produce, reprice or develop.' },
          { eyebrow: '04', title: 'Operations, management & systems', body: 'How processes, roles and KPIs are set up, which systems are needed (PLM, ERP, CRM, WMS, BI) and how production, warehouse and logistics connect.', decision: 'One management rhythm and one set of numbers across every department.' },
          { eyebrow: '05', title: 'Capital, investment & resilience', body: 'Cash flow and working capital, valuation, a calculated funding need, transactions and turnaround.', decision: 'The size of the capital, the case for it, and whether the business is ready to grow or to do a deal.' }
        ]
      },
      {
        id: 'requests',
        title: 'What owners come with',
        note: 'The requests vary, but each ends in an action: where to grow, what to stop, what to stabilise, what to fund.',
        items: [
          { eyebrow: 'Growth', title: 'New market', decision: 'Choose the priority market, entry model, assortment and pricing.' },
          { eyebrow: 'Growth', title: 'Category expansion', decision: 'Work out where the brand can credibly expand.' },
          { eyebrow: 'Growth', title: 'Investment choice', decision: 'Decide what to scale first.' },
          { eyebrow: 'Growth', title: 'Growth constraints', decision: 'Remove bottlenecks before expansion.' },
          { eyebrow: 'Commercial', title: 'Sales grow, margin does not', decision: 'Find where the margin leaks.' },
          { eyebrow: 'Commercial', title: 'Channels generate revenue', decision: 'Measure contribution and reset terms.' },
          { eyebrow: 'Commercial', title: 'Customer acquisition cost is rising', decision: 'Rework pricing, marketing and repeat sales.' },
          { eyebrow: 'Commercial', title: 'Markdowns erode margin', decision: 'Redesign discounts, inventory and exit rules.' },
          { eyebrow: 'Product & operations', title: 'The assortment keeps growing', decision: 'Decide what to develop, cut or reprice.' },
          { eyebrow: 'Product & operations', title: 'Inventory is unmanaged', decision: 'Set allocation, replenishment and transfers.' },
          { eyebrow: 'Product & operations', title: 'Production slows growth', decision: 'Adjust capacity, lead times, quality and suppliers.' },
          { eyebrow: 'Product & operations', title: 'Product development and data are disconnected', decision: 'Design the PLM, BI and automation set-up.' },
          { eyebrow: 'Capital & management', title: 'Profit does not convert into cash', decision: 'Connect profit, cash and working capital.' },
          { eyebrow: 'Capital & management', title: 'Capital need or transaction', decision: 'Prepare the model, the funding need and the materials.' },
          { eyebrow: 'Capital & management', title: 'Decisions are made too late', decision: 'Introduce early-warning indicators, a management cycle and controls.' },
          { eyebrow: 'Capital & management', title: 'Roles and decision rights are blurred', decision: 'Define accountability and decision rights.' }
        ],
        after: 'The test of success: the mistake is caught in the calculation, not in dead stock, a cash gap, a lost season or a bad investment.'
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
        note: 'Six areas of data work: from the style record to a buying signal.',
        items: [
          { title: 'PLM for product development', body: 'Style record, materials, samples, specifications, cost, versions, approvals and the collection calendar.' },
          { title: 'Analytics and BI', body: 'One version of sales, margin, inventory, customers, channels, buying, production and cash.' },
          { title: 'Systems architecture', body: 'Requirements for ERP, CRM, WMS and integrations: what each system does.' },
          { title: 'AI and automation', body: 'Demand forecast, stock signals, markdown scenarios, buying and allocation recommendations.' },
          { title: 'Merchandise planning', body: 'Forecast, open-to-buy, size curves, allocation, replenishment, transfers and product availability.' },
          { title: 'Implementation control', body: 'Requirements, process testing, training and the move from spreadsheets to routine management.' }
        ],
        after: 'What you are left with is set out in the “Data, analytics and PLM” format. Principle: business logic, data and accountability first; systems and automation second.'
      },
      {
        id: 'outcome',
        title: 'What stays inside the company',
        note: 'Models, rules, metrics, roles and regular control stay in the company.',
        items: [
          {
            title: 'Owner decisions',
            list: [
              'Where to invest and which new market to enter',
              'What to buy, produce, mark down and scale',
              'Which channel, customer and category make a real contribution',
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
        after: 'Where needed, my role grows from adviser to the owner to head of the turnaround programme: these are the “Owner’s advisor” and “Programme lead” formats.'
      },
      {
        id: 'experience',
        title: 'Relevant experience',
        note: 'Type of problem, scale and depth of work, with no client names.',
        items: [
          { eyebrow: 'Management experience', title: 'Large multi-brand fashion retail', body: '500+ brands, 30,000+ SKUs: buying, assortment, margin, stock turn, merchandise analytics and decision automation.' },
          { eyebrow: 'Operational diagnostics', title: 'Premium segment: development and production', body: 'Finance → product → production → inventory → management. From order economics and capital to production and the management model.' },
          { eyebrow: 'Strategy and finance', title: 'Growth strategy, markets and capital', body: 'Market → financial model → capital → negotiations. Geography, competitors, funding needs and materials for the owner’s decision.' },
          { eyebrow: 'Turnaround', title: 'Rebuilding management in volatile conditions', body: 'Liquidity → priorities → accountability → control. Restoring control and returning the business to growth.' }
        ]
      }
    ]
  }
};
