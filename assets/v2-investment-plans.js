/* Investor-facing hypotheses, not proven market dominance or revenue forecasts.
 * Edited 2026-10-12. Source URLs are competitor-owned product pages,
 * which can establish advertised functionality, NOT feature absence or superiority.
 * No internal client names, private architecture or live financial claims. */
export const V2_INVESTMENT_PLANS = {
  "syntha": {
    "name": "Syntha",
    "segment": "B2B · Fashion PLM / Commerce OS",
    "model": "b2b",
    "ru": {
      "now": "Бренды одновременно управляют разработкой модели, оптовым заказом, поставкой и маржой; ошибки на стыке систем задерживают решения и замораживают оборотный капитал. Проверяем спрос через реальный сезон, а не размер условного рынка.",
      "buyer": "Бренд, производитель, wholesale-команда, мультибрендовый ритейлер; экономический покупатель — коммерческий директор или собственник.",
      "value": "Единая версия продукта и заказа, расчёт маржи с учётом себестоимости, видимость подтверждений, поставки и изменений. Эффект проверяется временем цикла, числом ручных сверок и отклонением маржи.",
      "investor": "B2B-повторяемость: лицензия на рабочий контур + внедрение и интеграции. Инвестируем не в абстрактные функции, а в доказательство годового повторения заказов.",
      "revenue": "Подписка/лицензия бренда или команды; единоразовая настройка; платные коннекторы и поддержка. Без подтверждённых продаж все тарифы — гипотезы.",
      "cost": "Разработка и QA, поддержка PostgreSQL, хостинг, импорт каталога, интеграции и customer success.",
      "edge": "Проверяемый кандидат на дифференциацию: непрерывная цепочка Product Master → выбор байера → заказ → поставка → фактическая маржа с сохранением решений. Не доказано, что аналога нет.",
      "competitor": "JOOR уже поддерживает шоурум, заказы, платежи и аналитику. Ключевой тест — глубина разработки продукта, себестоимости и производственного следа без экспорта в таблицы.",
      "proof": "Готовы продуктово-коммерческие контуры; пока нет доказанного полного сезона у платящего клиента.",
      "risk": "Затяжное внедрение, качество исходных данных и конкурентные экосистемы; снимаются ограниченным пилотом одного бренда.",
      "metric": "Доля заказов без таблиц; скорость подтверждения; расхождение плановой и фактической маржи; месячная валовая прибыль на бренд.",
      "stages": [
        [
          "0–90 дней",
          "Закрыть Golden Path и целостность данных, провести импорт реального каталога",
          "Один пилотный бренд, базовые метрики до/после и критерий приёмки"
        ],
        [
          "3–6 мес.",
          "Подключить ERP/1С и мастер-данные, сверить маржу и поставку",
          "Платный пилот, договор о качестве данных и стоимости внедрения"
        ],
        [
          "6–18 мес.",
          "Повторяемые коннекторы, роли, отчёты и шаблоны сезонов",
          "Тиражирование в ограниченной вертикали, подписка и проверка удержания"
        ]
      ]
    },
    "en": {
      "now": "Fashion brands coordinate design, buying, orders, fulfilment and margin across disconnected systems. Timing matters when reconciliation and working capital need discipline; a real seasonal pilot, not a TAM estimate, must prove demand.",
      "buyer": "Brands, manufacturers, wholesale teams and multi-brand retailers; economic buyer: owner or commercial lead.",
      "value": "One governed product-to-order-to-margin chain; evaluate approval latency, manual reconciliation and margin variance.",
      "investor": "Potential recurring B2B revenue from licences, implementation and integration after a repeatable season is demonstrated.",
      "revenue": "Per-brand/team subscription, implementation, integrations and support. Pricing remains an unvalidated hypothesis.",
      "cost": "Engineering and QA, database operations, catalog import, connectors and customer success.",
      "edge": "Candidate differentiator: Product Master → buyer selection → order → fulfilment → actual margin with decision history. No exclusive capability claim.",
      "competitor": "JOOR already offers digital showrooms, wholesale orders, payments and analytics. Compare product-development and margin depth, not showroom existence.",
      "proof": "Working product/commercial modules; no verified completed season with a paying customer.",
      "risk": "Implementation complexity, source data quality and incumbent platforms; de-risk through one controlled brand.",
      "metric": "Orders without parallel spreadsheets; confirmation time; plan-vs-actual margin; monthly gross profit per brand.",
      "stages": [
        [
          "0–90 days",
          "Close core data and a real-catalog golden path",
          "One pilot brand, before/after baselines and acceptance evidence"
        ],
        [
          "3–6 months",
          "Connect ERP master data and reconcile margin and deliveries",
          "Paid pilot with implementation scope and data-quality SLA"
        ],
        [
          "6–18 months",
          "Repeatable connectors, role controls and seasonal templates",
          "Limited vertical rollout, recurring revenue and retention proof"
        ]
      ]
    },
    "benchmark": "https://www.joor.com/wholesale-management"
  },
  "chatx": {
    "name": "ChatX",
    "segment": "B2B · Work Communication OS",
    "model": "b2b",
    "ru": {
      "now": "Команды теряют решения между чатом, встречами, задачами и документами. Спрос доказывается переходом конкретной команды на ежедневное использование.",
      "buyer": "Компании и проектные команды с распределёнными согласованиями; покупатель — операционный или IT-директор.",
      "value": "Один цикл разговор → встреча → решение → ответственный → задача → подтверждение. Результат измеряется долей выполненных договорённостей и временем до исполнения.",
      "investor": "Подписка на рабочее место/организацию; платное внедрение, хранение и корпоративные интеграции — после доказанного удержания.",
      "revenue": "Per-seat или per-workspace SaaS с минимальным контрактом; enterprise onboarding и расширенная поддержка.",
      "cost": "Хранение сообщений/файлов, поиск, видео/аудио и ИИ-потребление, безопасность, поддержка.",
      "edge": "Кандидат: неизменяемый реестр решений с обязательствами и контролем права доступа сквозь сообщение, встречу и задачу. Не утверждаем, что Slack не умеет задачи.",
      "competitor": "Slack предлагает каналы, Canvas, Lists, workflow, AI и поиск; проверяем сквозной аудит решений и полноту выполнения, а не наличие чата.",
      "proof": "Есть рабочие контуры сообщений, задач, встреч и согласований; независимое многокомандное использование пока не доказано.",
      "risk": "Сетевой эффект incumbents, миграция истории, приватность и эксплуатационные затраты на realtime.",
      "metric": "DAU/WAU команд, доля решений с владельцем и сроком, time-to-close, валовая маржа на workspace.",
      "stages": [
        [
          "0–90 дней",
          "Настоящий редактор Pages, версии и интеграционные E2E",
          "Одна команда и измеримый workflow до/после"
        ],
        [
          "3–6 мес.",
          "Page ↔ Task/Meeting/Channel, поиск и права",
          "Платный департаментный пилот и оценка 30/90-day retention"
        ],
        [
          "6–18 мес.",
          "Администрирование, аудит, интеграции и экспорт данных",
          "Контракты на организацию и партнёры внедрения"
        ]
      ]
    },
    "en": {
      "now": "Teams lose accountable decisions across chat, meetings, documents and task trackers. Timing must be validated by daily team adoption.",
      "buyer": "Cross-functional organisations and project teams; operations and IT leaders.",
      "value": "Conversation → meeting → decision → owner → task → evidence, tested via closure rate and time.",
      "investor": "Seat/workspace recurring revenue is feasible only after retention and deployment economics are proven.",
      "revenue": "Per-seat/per-workspace subscriptions, enterprise onboarding and support.",
      "cost": "Realtime, file storage, search, calls, AI inference, security and support.",
      "edge": "Candidate: governed decision and commitment ledger spanning communication and execution. Not a claim that Slack lacks tasks.",
      "competitor": "Slack publicly offers channels, Canvas, Lists, automation, AI and search. Compare decision traceability and verifiable closure.",
      "proof": "Messaging, tasks, meetings and approvals exist; independently verified multi-team adoption is missing.",
      "risk": "Incumbent network effects, migration and realtime infrastructure costs.",
      "metric": "Team DAU/WAU, owned decisions, closure time and gross margin per workspace.",
      "stages": [
        [
          "0–90 days",
          "Ship versioned Pages editor and E2E reliability",
          "One team pilot with workflow baseline"
        ],
        [
          "3–6 months",
          "Page ↔ Task/Meeting/Channel, unified access-aware search",
          "Paid departmental pilot and D30/D90 retention"
        ],
        [
          "6–18 months",
          "Administration, audit, integrations and export",
          "Organisation contracts and implementation partners"
        ]
      ]
    },
    "benchmark": "https://slack.com/features"
  },
  "renova": {
    "name": "Renova",
    "segment": "B2C / B2B · Renovation OS",
    "model": "b2b",
    "ru": {
      "now": "При ремонте смета, согласования, платежи и акты часто рассредоточены. Точка входа — доказать снижение конфликтов и прозрачность одного реального объекта.",
      "buyer": "Собственник жилья, бригада, подрядчик и небольшая ремонтная компания; возможен B2B2C через подрядчиков.",
      "value": "Контроль бюджета и этапов, обоснование изменений, прозрачные подтверждения, история приёмки. Измеряем не обещанную экономию, а расхождения и длительность закрытия этапов.",
      "investor": "Сначала сервис для исполнителей с повторяющимися объектами, затем партнёрства с подрядчиками; маркетплейс и финансовые сервисы только после подтверждения спроса.",
      "revenue": "Подписка за активную бригаду/компанию или оплата за объект; платные корпоративные рабочие пространства.",
      "cost": "Мобильная разработка, хранение фото/актов, поддержка клиентов, onboarding подрядчиков и обработка споров.",
      "edge": "Кандидат: единая двухсторонняя доказательная история смета → изменение → оплата → приёмка с прозрачной связью документов.",
      "competitor": "Таблицы, мессенджеры и строительные PM-системы уже выполняют части процесса. Сравнение требует реального объекта и стоимости внедрения.",
      "proof": "Функциональные контуры смет, этапов, документов и оплаты собраны; реальный коммерческий ремонт не пройден полностью.",
      "risk": "Низкая готовность бригад платить, юридические споры, достоверность фото и подтверждений.",
      "metric": "Завершённые объекты; согласование изменений; среднее число спорных этапов; contribution margin по подрядчику.",
      "stages": [
        [
          "0–90 дней",
          "Acceptance Receipt, восстановление и мобильная приемка",
          "Один реальный объект с заказчиком и исполнителем"
        ],
        [
          "3–6 мес.",
          "Фото-доказательства с правами хранения и уведомления",
          "3–5 повторных объектов у одного подрядчика, оценка willingness-to-pay"
        ],
        [
          "6–18 мес.",
          "Шаблоны подрядчиков, автоматизация актов и портфель объектов",
          "B2B-подписка, партнёрская дистрибуция"
        ]
      ]
    },
    "en": {
      "now": "Renovation estimates, changes, payments and acceptance are fragmented. A real project must show whether a shared evidence trail reduces friction.",
      "buyer": "Homeowner, crew, contractor and renovation company; potential B2B2C channel.",
      "value": "Cost/stage visibility, governed change orders and acceptance receipts; measure disputes and stage-close time.",
      "investor": "Start with recurring contractor accounts; expand through contractor channels only after repeat usage.",
      "revenue": "Per-active-contractor subscription, per-project charge or professional workspace.",
      "cost": "Mobile development, photo/document storage, contractor onboarding, support and dispute handling.",
      "edge": "Candidate: two-sided evidence chain from estimate and change to payment and acceptance.",
      "competitor": "Spreadsheets, chat and construction PM tools already cover parts of this; differentiation requires site-level outcomes.",
      "proof": "Estimate, workflow, documents and payment states exist; full commercial real-project proof missing.",
      "risk": "Contractor willingness to pay, evidence authenticity and operational disputes.",
      "metric": "Completed projects, change approvals, contested stages and contribution margin per contractor.",
      "stages": [
        [
          "0–90 days",
          "Acceptance receipts, persistence and mobile checks",
          "One real homeowner-contractor journey"
        ],
        [
          "3–6 months",
          "Governed photo proofs and notifications",
          "Repeat projects and willingness-to-pay test"
        ],
        [
          "6–18 months",
          "Portfolio templates and standardised acceptance",
          "Contractor subscriptions and channel partnerships"
        ]
      ]
    },
    "benchmark": "https://www.procore.com/"
  },
  "mfw": {
    "name": "MFW / BFS / Made in Moscow",
    "segment": "B2B2C · Event + Brand365",
    "model": "event",
    "ru": {
      "now": "Организаторы уже умеют продавать участие в событиях, но ценность контактов и взаимодействий между сезонами требует отдельной модели. Первый рынок — конкретное событие с измеримыми участниками.",
      "buyer": "Организатор мероприятия, бренд, участник/байер, партнёр; платящий покупатель — организатор или спонсор.",
      "value": "Регистрация → программа → QR-посещение → B2B-контакт → проверяемое взаимодействие после события. Для партнёра важны qualified leads, а не только просмотры баннера.",
      "investor": "Лицензия на событие и годовой контур отношений с брендами; вторая линия — кабинеты партнёров и подтверждённый CRM/loyalty эффект.",
      "revenue": "Плата за событие/сезон, premium sponsor placements и verified B2B tools по согласованным тарифам.",
      "cost": "Пиковая инфраструктура трансляций и QR, поддержка на площадке, безопасность данных и внедрение организатора.",
      "edge": "Кандидат: единая межсобытийная идентичность и Brand365 с прослеживаемым переходом к контактам и повторным действиям; не уникальна сама регистрация.",
      "competitor": "Cvent уже предлагает регистрацию, мобильные event apps, бейджинг, аналитику и спонсоров. Сравниваем межсезонный брендовый граф и подтверждение пост-ивент конверсии.",
      "proof": "Три интерфейса связаны; production PostgreSQL и реальное событие не допущены.",
      "risk": "Зависимость от владельца события, сезонность, пиковые нагрузки и персональные данные.",
      "metric": "Регистрация→явка, подтверждённые B2B-встречи, sponsor qualified leads, повторные действия D30.",
      "stages": [
        [
          "0–90 дней",
          "Проверить PostgreSQL, /ready, QR и offline-сверку",
          "Один организатор, контракт на ограниченный пилот"
        ],
        [
          "3–6 мес.",
          "Событие целиком: регистрация→посещение→лиды→отчёт",
          "Платный event pack и расчёт CAC организатора"
        ],
        [
          "6–18 мес.",
          "Brand365, multi-event граф, CRM/retention",
          "Годовой контракт на серию событий + партнёрские пакеты"
        ]
      ]
    },
    "en": {
      "now": "Event platforms manage the event day; an opportunity remains to test measurable cross-season brand and buyer relationships.",
      "buyer": "Event organisers, brands, buyers/delegates and sponsors; economic buyer is an organiser or sponsor.",
      "value": "Registration → agenda → verified QR attendance → B2B meetings → post-event relationship; measure qualified outcomes.",
      "investor": "Per-event licensing plus annual relationship layer and sponsor/brand service upsells.",
      "revenue": "Event/season licences, sponsor placements and verified B2B services.",
      "cost": "Peak streaming/check-in load, on-site support, privacy and organiser deployment.",
      "edge": "Candidate: multi-event identity and Brand365 verified continuity. Registration alone is not novel.",
      "competitor": "Cvent already provides registration, mobile apps, badges, sponsor workflows and analytics. Compare cross-event graph and post-event conversion.",
      "proof": "Three event interfaces assembled; production database and live-event acceptance outstanding.",
      "risk": "Organiser dependency, event seasonality, peak resilience and data protection.",
      "metric": "Registration-to-attendance, verified B2B meetings, qualified sponsor leads and D30 activity.",
      "stages": [
        [
          "0–90 days",
          "Admit PostgreSQL, /ready and offline QR verification",
          "Organiser-approved bounded pilot"
        ],
        [
          "3–6 months",
          "Full attendance and sponsor reporting journey",
          "Paid event licence with unit economics"
        ],
        [
          "6–18 months",
          "Brand365 and cross-event CRM",
          "Annual multi-event and partner packages"
        ]
      ]
    },
    "benchmark": "https://www.cvent.com/en/event-marketing-management"
  },
  "promomed": {
    "name": "СОСТОЯНИЕ / Promomed",
    "segment": "B2B2C · Health Conference & Community",
    "model": "event",
    "ru": {
      "now": "Конференции о здоровье конкурируют за внимание и доверие. Продукту важно продлить связь с участником после события, не подменяя медицинскую экспертизу рекламой.",
      "buyer": "Организатор, медицинский/научный партнёр, участник и спонсор; платящий покупатель — организатор и корпоративный партнёр.",
      "value": "Программа, QR Wallet, запись, контент после конференции, верифицируемые партнёрские лиды и повторные обращения с согласия участника.",
      "investor": "Сначала event licence + партнёрский кабинет, затем годовое сообщество с независимой редакционной политикой.",
      "revenue": "Лицензия мероприятия; пакеты партнёра и спонсора с согласованными и измеряемыми услугами; B2B white-label после доказательства.",
      "cost": "Контент и проверка экспертами, поддержка регистраций, согласия/безопасность, видео и on-site сопровождение.",
      "edge": "Кандидат: непрерывный путь регистрация → присутствие → экспертный контент → согласованный партнёрский follow-up, при строгом разграничении медицинских утверждений.",
      "competitor": "Общие event-платформы покрывают расписание, регистрацию и аналитику. Различие нужно подтвердить качеством доверенного контента и повторным участием.",
      "proof": "Демо v1.4 и слой партнёров существуют; выделенная база, readiness и реальный институциональный пилот не допущены.",
      "risk": "Регуляторная ответственность контента, согласия на обработку данных, зависимость от одного события.",
      "metric": "Регистрация→визит, доля проверенных согласий на связь, возврат к материалам D30, оплаченные партнёрские продления.",
      "stages": [
        [
          "0–90 дней",
          "Изолированная PostgreSQL, health-check, роли и согласия",
          "Редакционный комитет и ограниченный пилот"
        ],
        [
          "3–6 мес.",
          "Проверяемые партнёрские отчёты, записи, retention",
          "Первый платный event/sponsor package"
        ],
        [
          "6–18 мес.",
          "Круглогодичные тематические хабы и white-label",
          "Многолетние контракты организаторов и партнёров"
        ]
      ]
    },
    "en": {
      "now": "Health conferences compete on attention and trust. A post-event relationship can matter when expert integrity and participant consent remain central.",
      "buyer": "Conference organiser, expert partner, attendee and sponsor; paying customer is organiser or enterprise partner.",
      "value": "Agenda, QR passes, replay, governed content and consent-based partner follow-up.",
      "investor": "Initial event and sponsor contracts; possible recurring expert community and white-label expansion.",
      "revenue": "Event licences and measurable sponsor packages; white-label only after pilot evidence.",
      "cost": "Editorial verification, registration support, consent/security, media and on-site operations.",
      "edge": "Candidate: registration → verified attendance → expert content → permitted follow-up, with human content review.",
      "competitor": "Generic event platforms already do registration and analytics. Validate trustworthy content and genuine post-event return.",
      "proof": "Demo and partner concepts exist; isolated database and real institutional pilot remain outstanding.",
      "risk": "Health-claim governance, consent, single-event concentration.",
      "metric": "Attendance conversion, consented qualified leads, D30 content return and paid sponsor renewals.",
      "stages": [
        [
          "0–90 days",
          "Database, health checks, permission and consent hardening",
          "Editorial board and a bounded live pilot"
        ],
        [
          "3–6 months",
          "Partner receipts, replay and retention",
          "First paid organiser or sponsor package"
        ],
        [
          "6–18 months",
          "Year-round knowledge hubs and white-label",
          "Repeat institutional contracts"
        ]
      ]
    },
    "benchmark": "https://www.bizzabo.com/solutions/hybrid-event-software"
  },
  "fashionmgmt": {
    "name": "Fashion Management OS",
    "segment": "B2B · Production & Finance",
    "model": "b2b",
    "ru": {
      "now": "В индивидуальном fashion-производстве ошибка норм, примерок и загрузки приводит к перерасходу уже после обещанного срока. Проверяем эффект на одном производственном контуре.",
      "buyer": "Fashion house, ателье, производственное предприятие; платит владелец или операционный директор.",
      "value": "Модель → заказ → цеха → WIP → примерка → себестоимость → денежный прогноз → закрытие. Управленец раньше видит превышения и ограничения.",
      "investor": "Вертикальная enterprise licence + настройка процессов + поддержка; продажи через внедрение и отраслевые каналы.",
      "revenue": "Годовая лицензия организации, внедрение, миграция и сопровождение; успех не подтверждён количеством разработанных модулей.",
      "cost": "Сложное внедрение, обучение цехов, интеграция учёта, поддержка отраслевых нормативов и безопасность.",
      "edge": "Кандидат: объединение CTC/Forecast, WIP/capacity и 13-недельного cash-plan вокруг конкретного заказа с историей решений; не доказана глобальная исключительность.",
      "competitor": "Универсальные ERP/PLM часто закрывают части цепочки, но сравнительную матрицу функций нужно тестировать на одинаковом сценарии.",
      "proof": "Рабочий производственно-финансовый контур существует; устойчивость production и принятие ролями требуют независимой проверки.",
      "risk": "Высокая стоимость кастомизации, сложность переноса учёта и конфиденциальность клиента.",
      "metric": "Отклонения по CTC, доля заказов в срок, время закрытия месяца, маржа вклада по организации.",
      "stages": [
        [
          "0–90 дней",
          "Сверка версий сервера, роли и неизменяемая финальная себестоимость",
          "Контролируемый прогон одного заказа"
        ],
        [
          "3–6 мес.",
          "Критичные интеграции, регламенты цехов, cash forecast",
          "Подтверждение экономии времени и контракт на внедрение"
        ],
        [
          "6–18 мес.",
          "Типовые шаблоны предприятий и анонимизированная отраслeвая методика",
          "Лицензии без раскрытия конкретного заказчика"
        ]
      ]
    },
    "en": {
      "now": "Atelier and made-to-order production can discover overruns too late. The right test is a real enterprise order, not broad TAM claims.",
      "buyer": "Fashion house, atelier and production operator; owner or operations director pays.",
      "value": "Model → order → workshop → WIP → fittings → costing → cash outlook → close, measuring delays and cost variance.",
      "investor": "Vertical enterprise licences plus implementation and support.",
      "revenue": "Annual enterprise licences, implementation, migration and support.",
      "cost": "Onboarding, factory training, accounting links, domain maintenance and security.",
      "edge": "Candidate: one order-level Plan/Actual/CTC, WIP/capacity and 13-week cash chain with decision history. Not claimed as globally exclusive.",
      "competitor": "Generic PLM/ERP products cover parts; compare on the same operational scenario with verified feature evidence.",
      "proof": "Production and finance modules exist; deployment parity and role-level use still need verification.",
      "risk": "Customisation and migration cost, confidentiality and production change management.",
      "metric": "CTC variance, on-time delivery, time to month close and enterprise contribution margin.",
      "stages": [
        [
          "0–90 days",
          "Version parity, role proofs and immutable final cost",
          "One controlled end-to-end order"
        ],
        [
          "3–6 months",
          "Critical integrations and cash planning",
          "Measured pilot with implementation contract"
        ],
        [
          "6–18 months",
          "Repeatable vertical templates and privacy-safe case studies",
          "Industry licences without exposing customer data"
        ]
      ]
    },
    "benchmark": null
  },
  "furproduction": {
    "name": "FUR PRODUCTION OS",
    "segment": "B2B · Lot-Traceable Production ERP",
    "model": "b2b",
    "ru": {
      "now": "Дорогое неоднородное сырьё требует поштучной связи партии, расхода, изделия и стоимости. Ошибка измеряется не количеством полей ERP, а несошедшимися остатками.",
      "buyer": "Меховое/кожевенное производство, закупка и цеха; покупатель — собственник и производственный директор.",
      "value": "Конкретная партия → резерв → раскрой → расход → выпуск → себестоимость → документ. Сверка количества и стоимости без потери происхождения.",
      "investor": "Вертикальная лицензия с внедрением под нормы и операции; повторяемость только после 2–3 независимых циклов.",
      "revenue": "Лицензия на производственную площадку, первичная настройка, интеграции и поддержка.",
      "cost": "Миграция партий, сверка складов, ввод исходных документов, клиентские интеграции и проверка учёта.",
      "edge": "Кандидат: конкретная идентификация дорогих партий с прослеживаемым дробным расходом, списанием и себестоимостью изделия.",
      "competitor": "Универсальные ERP и складской учёт могут учитывать партии. Преимущество измеряется точностью именно раскроя, дробного резерва и возврата материала.",
      "proof": "Реестры сырья и расчёты реализованы; независимая сверка и аварийное восстановление остаются gate.",
      "risk": "Ошибки исторических партий, исключения в производстве, санкционные и логистические ограничения.",
      "metric": "Абсолютное расхождение партии; точность себестоимости; время инвентаризации; валовая прибыль на площадку.",
      "stages": [
        [
          "0–90 дней",
          "Сверить партии и фактические списания с первичными документами",
          "Один полный цикл от закупки до изделия"
        ],
        [
          "3–6 мес.",
          "Восстановление, маркировка, дефекты и контролируемые возвраты",
          "Сверка нескольких производственных партий"
        ],
        [
          "6–18 мес.",
          "Шаблоны сырья, интеграции и отчётность себестоимости",
          "Лицензия на производственную площадку"
        ]
      ]
    },
    "en": {
      "now": "Expensive heterogeneous material needs exact lot, consumption and finished-goods traceability. Value is inventory and costing accuracy, not a longer ERP checklist.",
      "buyer": "Fur/leather manufacturers, buyers and workshops; owner or plant lead.",
      "value": "Specific lot → reservation → cutting → consumption → output → actual cost → document.",
      "investor": "Vertical site licences with onboarding after independent reconciliation pilots.",
      "revenue": "Per-factory licence, initial data conversion, integration and support.",
      "cost": "Lot migration, stock reconciliation, paperwork validation and deployment.",
      "edge": "Candidate: specific-identification costing with partial lots, reallocation and product-level yield evidence.",
      "competitor": "Generic ERP already includes lot tracking. Compare fractional lot flows and product costing on identical samples.",
      "proof": "Lot and costing modules exist; reconciliation and restore evidence remain acceptance gates.",
      "risk": "Bad historical inventory, manufacturing exceptions and supply restrictions.",
      "metric": "Lot quantity variance, actual costing error, cycle-count time and contribution per site.",
      "stages": [
        [
          "0–90 days",
          "Reconcile lots and consumption with source documents",
          "One purchase-to-product cycle"
        ],
        [
          "3–6 months",
          "Restore, marking and defect controls",
          "Independent multi-batch reconciliation"
        ],
        [
          "6–18 months",
          "Vertical templates, connectors and cost reporting",
          "Per-site licence rollout"
        ]
      ]
    },
    "benchmark": null
  },
  "antiqua": {
    "name": "Antiqua",
    "segment": "B2B / B2C · Art Discovery & Research",
    "model": "consumer",
    "ru": {
      "now": "Цифровое представление искусства требует проверяемого контекста — авторство, источники, выставки, права — и причин возвращаться к исследованию, а не только покупать.",
      "buyer": "Галерея, коллекционер, музей, исследователь; начальный платящий сегмент — институциональные и профессиональные клиенты.",
      "value": "Галерея → произведение → художник → связанные работы → коллекция → исследование. Система отделяет утверждения и источники от коммерческого продвижения.",
      "investor": "Профессиональная подписка/лицензия институции, услуги оцифровки и исследовательские пакеты; B2C-аукцион не требуется для старта.",
      "revenue": "Институциональный каталог, импорт/обогащение данных, профессиональная подписка, исследовательские запросы.",
      "cost": "Права на изображения, редакционная проверка, хранение качественного медиа, ввод первичных данных и поддержка.",
      "edge": "Кандидат: граф Painting→Artist→Provenance→Sources→Taste с редакционными разграничениями; уникальность относительно отрасли не доказана.",
      "competitor": "Artlogic уже управляет provenance, инвентарём и документами, включая связь с Artsy. Сравниваем глубину исследовательского пути и возврат, не заявляем отсутствие provenance у рынка.",
      "proof": "Галерея и граф связанных объектов собраны; выделенная production-база и реальная коллекция не подтверждены.",
      "risk": "Изображения и права, стоимость экспертной проверки, холодный старт коллекций.",
      "metric": "Полнота источников, возврат D30, оплаченные институциональные договоры и contribution margin на каталог.",
      "stages": [
        [
          "0–90 дней",
          "Проверить PostgreSQL и лицензии на изображения, импорт реальной коллекции",
          "Одна галерея и критерии качества карточек"
        ],
        [
          "3–6 мес.",
          "IIIF/просмотр, история атрибуции, экспертная редакция",
          "Платный каталог/исследовательский пилот"
        ],
        [
          "6–18 мес.",
          "Профиль коллекционера, рекомендации, экспорт для институций",
          "Подписка и исследовательские услуги при доказанном retention"
        ]
      ]
    },
    "en": {
      "now": "Digital art discovery benefits from cited provenance, rights and editorial context beyond a sales listing.",
      "buyer": "Galleries, collectors, curators and institutions; initial paying segment: professional organisations.",
      "value": "Gallery → artwork → artist → related works → collection → research, separating sourced facts from promotion.",
      "investor": "Institutional licences and professional research before any speculative marketplace commission.",
      "revenue": "Institutional catalogue, import/enrichment service, professional access and expert queries.",
      "cost": "Image rights, expert review, media storage, ingestion and support.",
      "edge": "Candidate: painting-centred art/artist/provenance/source/taste graph. No exclusivity assertion.",
      "competitor": "Artlogic already handles artwork inventories and provenance; compare depth of research discovery and retention.",
      "proof": "Core discovery exists; production database and a real source-cleared collection remain unproven.",
      "risk": "Rights, expert curation cost, collection liquidity and cold start.",
      "metric": "Source coverage, D30 return, paying institutional agreements and catalogue contribution margin.",
      "stages": [
        [
          "0–90 days",
          "Database integrity, image rights, real collection import",
          "One gallery and record-quality acceptance"
        ],
        [
          "3–6 months",
          "IIIF, attribution history and editorial review",
          "Paid research or catalogue pilot"
        ],
        [
          "6–18 months",
          "Taste profiles, discovery and institutional export",
          "Subscriptions and research services tied to retention"
        ]
      ]
    },
    "benchmark": "https://artlogic.net/products/collector/management"
  },
  "igra": {
    "name": "IGRA",
    "segment": "B2C / B2B2C · Interactive Building Game",
    "model": "consumer",
    "ru": {
      "now": "Конструктор с пошаговой сборкой выигрывает только если виртуальные детали совпадают с реальными и прогресс не теряется. Сейчас это технический gate, а не коммерческий успех.",
      "buyer": "Родители и дети, образовательные площадки, производители конструкторов; первоначальный канал — партнёрский набор с лицензией.",
      "value": "Каталог набора → коробка → инструкция → точная сборка → сохранение → коллекция → игровая миссия.",
      "investor": "Лицензирование цифровых инструкций производителям и платные коллекции/миссии после проверки вовлечения; для детских платежей и данных — отдельные ограничения.",
      "revenue": "B2B-лицензия на цифровое сопровождение физического набора; B2C-пакеты/миссии только после прав и безопасного детского UX.",
      "cost": "Создание точных моделей и контента, QA каждой детали, устройства/AR, поддержка родителей, compliance.",
      "edge": "Кандидат: верифицированная складская модель деталей с доказуемым сохранением 300/300 и игровыми миссиями; LEGO уже имеет 3D/сохранение/миссии.",
      "competitor": "LEGO Builder содержит 3D-инструкции, сохранение, совместную сборку и Missions. Отличие IGRA нужно искать в независимых наборах, собственной логике и производительском white-label, если будет доказано.",
      "proof": "iOS/AR и веб-демо существуют; полный набор из 300 деталей и восстановление на шагах 1/30/59 ещё не допущены.",
      "risk": "Права на игровые модели, детские данные, дорогой 3D-контент, повторяемость интереса.",
      "metric": "Сборки 300/300, возобновление после сбоя, D7/D30 return, стоимость контента на набор, маржа на B2B-лицензию.",
      "stages": [
        [
          "0–90 дней",
          "Доказать 300/300 деталей и сохранение после перезагрузки",
          "Контролируемый usability-тест без коммерческих обещаний"
        ],
        [
          "3–6 мес.",
          "Rescue Mission, семейный режим, подтверждение возрастной политики",
          "Пилот цифровой инструкции с одним производителем"
        ],
        [
          "6–18 мес.",
          "SDK/white-label набора, каталог и редактор контента",
          "Лицензии для производителей; платные дополнения после evidence"
        ]
      ]
    },
    "en": {
      "now": "Digital building play succeeds only when exact parts and resume behaviour are reliable. This is currently an acceptance problem, not a monetisation claim.",
      "buyer": "Families, educators and construction-set manufacturers; initial paying candidate: manufacturer licence.",
      "value": "Set → box → guided exact build → save/resume → collection → missions.",
      "investor": "B2B digital-guide licensing and optionally premium missions after retention, rights and child-safety proof.",
      "revenue": "Per-set manufacturer licence; optional consumer content only after safety and ownership admission.",
      "cost": "Exact 3D content, piece-by-piece QA, devices, parent support and child-data compliance.",
      "edge": "Candidate: exact 300/300 part accounting and recoverable play coupled to a maker white-label kit; LEGO already offers 3D, resume and Missions.",
      "competitor": "LEGO Builder already has 3D guides, save, shared building and Missions. The pitch must rest on third-party kits or measurable adaptation value.",
      "proof": "iOS/AR and web code exist; 300-part acceptance and reload recovery remain incomplete.",
      "risk": "IP, child privacy, content creation cost and retention.",
      "metric": "Correctly completed builds, recovery success, D7/D30, per-set content cost and manufacturer contribution.",
      "stages": [
        [
          "0–90 days",
          "Prove exact pieces and reload checkpoints",
          "Supervised usability pilot"
        ],
        [
          "3–6 months",
          "Rescue Mission, parent settings and policy",
          "First maker pilot"
        ],
        [
          "6–18 months",
          "White-label SDK and content tooling",
          "Manufacturer licensing after demonstrated results"
        ]
      ]
    },
    "benchmark": "https://www.lego.com/en-gb/builder-app"
  },
  "marcopescarolo": {
    "name": "Marco Pescarolo Commercial OS",
    "segment": "B2B · Luxury Wholesale Showroom",
    "model": "b2b",
    "ru": {
      "now": "Цифровая витрина уже не является преимуществом; коммерческая задача — корректно перевести персональный показ коллекции в подтверждённый оптовый заказ и повторную поставку.",
      "buyer": "Fashion-бренд, торговый агент, showroom и байер; прямой коммерческий заказчик — бренд или дистрибьютор.",
      "value": "Коллекция → индивидуальный ассортимент/цена → размерная матрица → заказ → подтверждение → поставка → sell-through → reorder.",
      "investor": "White-label лицензия и внедрение с опциональным модулем аналитики sell-through; сначала один подтверждённый брендовый цикл.",
      "revenue": "Годовая B2B-лицензия бренда, подключение каталога и интеграции; анализ replenishment как расширение.",
      "cost": "Ввод product master/медиа, price books, безопасность B2B-прав, интеграции заказов и поддержка.",
      "edge": "Кандидат: fashion-specific покупательский цикл с размерной матрицей, индивидуальными условиями и замкнутой аналитикой дозаказа. JOOR уже сильный конкурент.",
      "competitor": "JOOR публично предлагает showroom, персональные цены, order management и reorders. Сравниваем гибкость white-label, контроль исходных данных и стоимость владения для конкретного бренда.",
      "proof": "Опубликованная витрина существует; production-цены, права покупателей, reserve/order confirmation не доказаны.",
      "risk": "Санкционирование брендовых данных и логотипов, source parity, интеграция складов и платёжных статусов.",
      "metric": "Ошибки размерных сеток, order completion, время подтверждения, повторные заказы, gross margin per brand.",
      "stages": [
        [
          "0–90 дней",
          "Проверить исходник, размеры, каталог, роли и B2B цены",
          "Один байер и один заказ с контролируемым подтверждением"
        ],
        [
          "3–6 мес.",
          "Проформа, склад, остатки и invoice reconciliation",
          "Платный B2B-пилот при одобрении бренда"
        ],
        [
          "6–18 мес.",
          "Sell-through ingestion, WOS и reorder suggestions",
          "Лицензирование white-label и расширенная аналитика"
        ]
      ]
    },
    "en": {
      "now": "A digital showroom alone is not differentiated. The practical task is to convert buyer-specific collection discovery into a verified order and subsequent replenishment.",
      "buyer": "Fashion brand, agent, showroom and wholesale buyer; brand or distributor pays.",
      "value": "Collection → buyer price/assortment → size matrix → PO → confirmation → delivery → sell-through → reorder.",
      "investor": "White-label B2B licence and integration, with sell-through intelligence as an expansion module.",
      "revenue": "Annual branded licence, catalogue onboarding, order integrations and analytics upgrade.",
      "cost": "Product master/media, private pricing, B2B permissions, order links and support.",
      "edge": "Candidate: size-grid-to-verified-order-to-replenishment in one branded experience. JOOR already offers broad overlapping functions.",
      "competitor": "JOOR supports showrooms, buyer-specific pricing, orders and reorders. Compare white-label control, data custody and client-specific TCO.",
      "proof": "Public storefront exists; buyer prices, access controls and actual orders are not production-proven.",
      "risk": "Brand approvals, source parity, stock and payment integrations.",
      "metric": "Size-grid error rate, completed POs, confirmation time, reorder rate and brand gross margin.",
      "stages": [
        [
          "0–90 days",
          "Source parity, size grid, buyer permissions and price book",
          "One approved buyer order with evidence"
        ],
        [
          "3–6 months",
          "Proforma, stock, invoicing and reconciliation",
          "Paid brand-authorised pilot"
        ],
        [
          "6–18 months",
          "Sell-through, WOS and replenishment suggestions",
          "White-label licences with analytical upgrades"
        ]
      ]
    },
    "benchmark": "https://www.joor.com/wholesale-management"
  }
};
export const V2_INVESTMENT_ORDER = ["syntha","chatx","renova","mfw","promomed","fashionmgmt","furproduction","antiqua","igra","marcopescarolo"];
export const V2_INVESTMENT_ECONOMICS = {
 ru: {
  intro:"Расчёт без выдуманных прогнозов: для каждого продукта сначала нужен подтверждённый платящий сегмент, фактическая цена и полная стоимость обслуживания.",
  formula:"Выручка = оплачиваемые контракты/покупки × средний чек; валовая прибыль = выручка − прямые расходы; вклад = валовая прибыль − CAC/внедрение; операционная прибыль = вклад − постоянные затраты; окупаемость = стартовые вложения ÷ положительный чистый денежный поток.",
  gate:"Открывать масштабирование только после проверенных данных: платящий пилот, воспроизводимое внедрение, положительная маржа вклада, удержание/повторная покупка, обоснованный CAC и прогноз cash runway.",
  caution:"Цены, бюджет разработки, CAC, LTV, объёмы продаж, EBITDA, IRR, NPV и срок окупаемости не утверждены: исходных финансовых данных и контрактов недостаточно. Капитал выдаётся траншами под проверяемые результаты; пилотная разработка допускает нулевые дополнительные расходы на инфраструктуру, но не означает нулевую стоимость труда."
 },
 en: {
  intro:"No invented projections: each project needs a verified paying segment, observed pricing and the fully loaded delivery cost.",
  formula:"Revenue = paid contracts/transactions × average price; gross profit = revenue − direct cost; contribution = gross profit − CAC/onboarding; operating profit = contribution − fixed cost; cash payback = initial investment ÷ positive recurring net cash flow.",
  gate:"Scale only when a paid pilot, reproducible delivery, positive contribution margin, retention/repeat purchase, CAC evidence and credible cash runway are observed.",
  caution:"Pricing, development budgets, CAC, LTV, revenue, EBITDA, IRR, NPV and payback timing are NOT validated. Fund milestones in tranches; zero extra hosting spend does not imply zero staff time or product cost."
 }
};
