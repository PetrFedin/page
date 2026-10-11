/* Evidence-first portfolio additions. Planning scope, not a claim that modules are deployed. */
export const EXTRA_PROJECTS = [
  {
    "id": "fashion-os",
    "name": "Fashion Management OS",
    "device": "ipad",
    "shots": [],
    "ru": {
      "tagline": "Операционная платформа для участников fashion-рынка",
      "stage": "Проектирование и интеграционная подготовка",
      "card": "Единый рабочий контур для бренда, производителя, закупщика и ритейлера: товар, коллекции, закупка, остатки, заказы, себестоимость и аналитика. Показываем архитектуру и карту функций без непроверенных скриншотов.",
      "what": "Платформа управления товаром и коммерческим жизненным циклом: единый Product Master, сезонные планы, закупочная матрица, supply, маржа и ответственность по ролям.",
      "who": "Бренды, мультибрендовые магазины, байеры, производственные команды, аналитики и финансовые руководители.",
      "why": "Сократить разрывы между Excel, PLM, ERP и решениями по сезону; видеть эффект заказа до заморозки капитала.",
      "how": "Ролевые рабочие пространства, справочники, события жизненного цикла, versioned snapshots, согласования и интеграционный слой; внедрение по проверяемым вертикальным сценариям.",
      "roadmap": [
        {
          "label": "Концепция",
          "state": "done"
        },
        {
          "label": "Интеграционная проверка",
          "state": "current"
        },
        {
          "label": "Пилот",
          "state": "next"
        },
        {
          "label": "Продажи",
          "state": "next"
        }
      ],
      "capabilities": [
        {
          "area": "Product Master / SKU",
          "feature": "Карточка товара, варианты, коллекции, сезоны"
        },
        {
          "area": "Buying & allocation",
          "feature": "План закупки, матрица размеров, доступность, распределение"
        },
        {
          "area": "Supply & costing",
          "feature": "Поставки, затраты, себестоимость, валовая маржа"
        },
        {
          "area": "Decision analytics",
          "feature": "Sell-through, GMROI, WOS, сценарии заказов"
        }
      ],
      "status": {
        "done": [],
        "now": [
          "Функциональная архитектура и проверка требований"
        ],
        "next": [
          "Проверить сквозной сценарий с данными одного бренда"
        ],
        "seeking": "Ищу пилотных пользователей и профильного технологического партнёра; коммерческие метрики пока не подтверждены."
      },
      "collab": [
        {
          "k": "Пилот",
          "v": "Проверка реального пользовательского сценария с измеримыми результатами и согласиями."
        },
        {
          "k": "Экспертиза",
          "v": "Предметные требования, безопасные данные, юридическая и коммерческая экспертиза."
        },
        {
          "k": "Коммерция",
          "v": "Канал первых платящих заказчиков только после допуска продукта."
        }
      ],
      "investor": {
        "note": "Финансовая модель ниже — сценарная структура, не подтверждённые продажи или инвестиционные обязательства."
      }
    },
    "en": {
      "tagline": "An operating platform for fashion professionals",
      "stage": "Design and integration preparation",
      "card": "A shared operating workspace for brands, makers, buyers and retailers: products, collections, buying, inventory, orders, costs and analytics. Functional map only; no unverified screenshots.",
      "what": "Product and commercial life-cycle management: Product Master, seasonal plans, buy matrices, supply, margins and role-based responsibility.",
      "who": "Brands, multi-brand retailers, buyers, production teams, analysts and finance leaders.",
      "why": "Close the gaps between spreadsheets, PLM, ERP and seasonal decisions; see the impact of a buy before capital is committed.",
      "how": "Role-based workspaces, master data, life-cycle events, versioned snapshots, approvals and integration adapters; delivered as verified vertical slices.",
      "roadmap": [
        {
          "label": "Concept",
          "state": "done"
        },
        {
          "label": "Integration validation",
          "state": "current"
        },
        {
          "label": "Pilot",
          "state": "next"
        },
        {
          "label": "Sales",
          "state": "next"
        }
      ],
      "capabilities": [
        {
          "area": "Product Master / SKU",
          "feature": "Product master, variants, collections and seasons"
        },
        {
          "area": "Buying & allocation",
          "feature": "Buy planning, size grids, availability and allocation"
        },
        {
          "area": "Supply & costing",
          "feature": "Supply, landed cost and gross margin"
        },
        {
          "area": "Decision analytics",
          "feature": "Sell-through, GMROI, weeks of supply and buy scenarios"
        }
      ],
      "status": {
        "done": [],
        "now": [
          "Functional architecture and requirement review"
        ],
        "next": [
          "Integrate and validate one brand's complete workflow"
        ],
        "seeking": "Seeking pilot users and a technical partner; commercial metrics remain unvalidated."
      },
      "collab": [
        {
          "k": "Pilot",
          "v": "A real user workflow with measurable outcomes and consent."
        },
        {
          "k": "Domain partner",
          "v": "Subject-matter requirements, safe test data and legal review."
        },
        {
          "k": "Distribution",
          "v": "Route to paying customers only after product admission."
        }
      ],
      "investor": {
        "note": "The investor model below is a planning framework, not proven revenue or an investment offer."
      }
    }
  },
  {
    "id": "fur",
    "name": "FUR PRODUCTION",
    "device": "ipad",
    "shots": [],
    "ru": {
      "tagline": "Производство меховых изделий: от сырья до готовой партии",
      "stage": "Проектная модель и производственные регламенты",
      "card": "Система прозрачного учета шкур, выделки, раскроя, норм расхода, резервов, пошива, брака и себестоимости. От закупки сырья до подтвержденной готовой партии — с историей движения каждой позиции.",
      "what": "Производственная ОС с учётом мехового сырья, многоэтапной обработки, раскроя, расходных норм и калькуляции по изделию.",
      "who": "Фабрики, ателье, владельцы брендов, закупщики меха, подрядчики выделки и логистики.",
      "why": "Зафиксировать происхождение, потери, остатки и экономику заказа; отделить фактические затраты от комиссий посредников.",
      "how": "Lot-level ledger, нормативы после подтверждённого образца, операции передачи между подрядчиками, QC и правила расчёта полной себестоимости.",
      "roadmap": [
        {
          "label": "Концепция",
          "state": "done"
        },
        {
          "label": "Интеграционная проверка",
          "state": "current"
        },
        {
          "label": "Пилот",
          "state": "next"
        },
        {
          "label": "Продажи",
          "state": "next"
        }
      ],
      "capabilities": [
        {
          "area": "Сырьё и партии",
          "feature": "Аукцион, артикул, цвет, сортность, размер, резерв"
        },
        {
          "area": "Нормы / раскрой",
          "feature": "Техкарта изделия, расход и потери после образца"
        },
        {
          "area": "Подрядчики и качество",
          "feature": "Выделка, пошив, возвраты, брак, контроль сроков"
        },
        {
          "area": "Экономика партии",
          "feature": "Материалы + услуги + логистика + комиссия = себестоимость"
        }
      ],
      "status": {
        "done": [],
        "now": [
          "Функциональная архитектура и проверка требований"
        ],
        "next": [
          "Согласовать нормативы и провести тест на одной партии"
        ],
        "seeking": "Ищу пилотных пользователей и профильного технологического партнёра; коммерческие метрики пока не подтверждены."
      },
      "collab": [
        {
          "k": "Пилот",
          "v": "Проверка реального пользовательского сценария с измеримыми результатами и согласиями."
        },
        {
          "k": "Экспертиза",
          "v": "Предметные требования, безопасные данные, юридическая и коммерческая экспертиза."
        },
        {
          "k": "Коммерция",
          "v": "Канал первых платящих заказчиков только после допуска продукта."
        }
      ],
      "investor": {
        "note": "Финансовая модель ниже — сценарная структура, не подтверждённые продажи или инвестиционные обязательства."
      }
    },
    "en": {
      "tagline": "Fur manufacturing: from raw material to finished batches",
      "stage": "Workflow design and manufacturing rules",
      "card": "Traceable procurement, tanning, cutting, material norms, allocation, sewing, defects and cost. Follow each material lot through to a verified finished batch.",
      "what": "Manufacturing operations system for raw hides, processing stages, cutting norms and garment-level costing.",
      "who": "Factories, ateliers, brand owners, raw-material buyers, tanning and logistics partners.",
      "why": "Document origin, yield, waste, stock and order economics while separating direct cost from intermediary fees.",
      "how": "Lot-level ledger, norms set after sample approval, contractor hand-offs, quality checks and complete costing rules.",
      "roadmap": [
        {
          "label": "Concept",
          "state": "done"
        },
        {
          "label": "Integration validation",
          "state": "current"
        },
        {
          "label": "Pilot",
          "state": "next"
        },
        {
          "label": "Sales",
          "state": "next"
        }
      ],
      "capabilities": [
        {
          "area": "Сырьё и партии",
          "feature": "Lot provenance, shade, grade, size and reservation"
        },
        {
          "area": "Нормы / раскрой",
          "feature": "Patterns, material consumption and sample-based allowances"
        },
        {
          "area": "Подрядчики и качество",
          "feature": "Tanning, sewing, returns, rejects and lead times"
        },
        {
          "area": "Экономика партии",
          "feature": "Materials + services + freight + fees = landed unit cost"
        }
      ],
      "status": {
        "done": [],
        "now": [
          "Functional architecture and requirement review"
        ],
        "next": [
          "Approve material norms and test one batch"
        ],
        "seeking": "Seeking pilot users and a technical partner; commercial metrics remain unvalidated."
      },
      "collab": [
        {
          "k": "Pilot",
          "v": "A real user workflow with measurable outcomes and consent."
        },
        {
          "k": "Domain partner",
          "v": "Subject-matter requirements, safe test data and legal review."
        },
        {
          "k": "Distribution",
          "v": "Route to paying customers only after product admission."
        }
      ],
      "investor": {
        "note": "The investor model below is a planning framework, not proven revenue or an investment offer."
      }
    }
  },
  {
    "id": "antiqua",
    "name": "Antiqua",
    "device": "ipad",
    "shots": [],
    "ru": {
      "tagline": "Исследовательская цифровая галерея искусства",
      "stage": "Развитие каталога и проверка инфраструктуры",
      "card": "Галерея живописи, графики и гравюр с полноценным контекстом работы: автор, эпоха, атрибуция, происхождение, связи с другими произведениями. Продажа — возможность, исследование — основа.",
      "what": "Цифровая галерея и база знаний об объектах искусства с персональным открытием коллекции.",
      "who": "Коллекционеры, галереи, искусствоведы, исследователи, музеи и новые покупатели искусства.",
      "why": "Сделать изучение работы прозрачным и удобным, не подменяя происхождение маркетинговой легендой.",
      "how": "Artwork → Artist → Related Works → Save → Collections → Research; IIIF-изображения и данные об источниках по мере допуска.",
      "roadmap": [
        {
          "label": "Концепция",
          "state": "done"
        },
        {
          "label": "Интеграционная проверка",
          "state": "current"
        },
        {
          "label": "Пилот",
          "state": "next"
        },
        {
          "label": "Продажи",
          "state": "next"
        }
      ],
      "capabilities": [
        {
          "area": "Галерея / Artwork",
          "feature": "Произведение, материал, размеры, описание, документы"
        },
        {
          "area": "Research / provenance",
          "feature": "Атрибуция, литература, выставки, источники, сомнения"
        },
        {
          "area": "Discovery",
          "feature": "Художники, связанные работы, подборки, сохранения"
        },
        {
          "area": "Коммерция",
          "feature": "Запрос цены, консультация, аукцион — после проверки"
        }
      ],
      "status": {
        "done": [],
        "now": [
          "Функциональная архитектура и проверка требований"
        ],
        "next": [
          "Проверить публикацию галереи и сохранение в БД"
        ],
        "seeking": "Ищу пилотных пользователей и профильного технологического партнёра; коммерческие метрики пока не подтверждены."
      },
      "collab": [
        {
          "k": "Пилот",
          "v": "Проверка реального пользовательского сценария с измеримыми результатами и согласиями."
        },
        {
          "k": "Экспертиза",
          "v": "Предметные требования, безопасные данные, юридическая и коммерческая экспертиза."
        },
        {
          "k": "Коммерция",
          "v": "Канал первых платящих заказчиков только после допуска продукта."
        }
      ],
      "investor": {
        "note": "Финансовая модель ниже — сценарная структура, не подтверждённые продажи или инвестиционные обязательства."
      }
    },
    "en": {
      "tagline": "A research-first digital art gallery",
      "stage": "Catalogue development and infrastructure verification",
      "card": "A gallery for paintings, prints and drawings with artist, period, attribution, provenance and related works. Research-first, commerce optional.",
      "what": "A digital gallery and research archive with personalised discovery.",
      "who": "Collectors, galleries, historians, researchers, museums and first-time art buyers.",
      "why": "Support verifiable artwork research rather than replacing provenance with sales narratives.",
      "how": "Artwork → Artist → Related Works → Save → Collections → Research; IIIF images and evidence-backed provenance where available.",
      "roadmap": [
        {
          "label": "Concept",
          "state": "done"
        },
        {
          "label": "Integration validation",
          "state": "current"
        },
        {
          "label": "Pilot",
          "state": "next"
        },
        {
          "label": "Sales",
          "state": "next"
        }
      ],
      "capabilities": [
        {
          "area": "Галерея / Artwork",
          "feature": "Artwork, medium, dimensions, description, documents"
        },
        {
          "area": "Research / provenance",
          "feature": "Attribution, bibliography, exhibitions, sources and uncertainties"
        },
        {
          "area": "Discovery",
          "feature": "Artists, related works, collections and saves"
        },
        {
          "area": "Коммерция",
          "feature": "Price inquiries, consultations and optional auction"
        }
      ],
      "status": {
        "done": [],
        "now": [
          "Functional architecture and requirement review"
        ],
        "next": [
          "Verify gallery publication and persistent storage"
        ],
        "seeking": "Seeking pilot users and a technical partner; commercial metrics remain unvalidated."
      },
      "collab": [
        {
          "k": "Pilot",
          "v": "A real user workflow with measurable outcomes and consent."
        },
        {
          "k": "Domain partner",
          "v": "Subject-matter requirements, safe test data and legal review."
        },
        {
          "k": "Distribution",
          "v": "Route to paying customers only after product admission."
        }
      ],
      "investor": {
        "note": "The investor model below is a planning framework, not proven revenue or an investment offer."
      }
    }
  },
  {
    "id": "igra",
    "name": "IGRA",
    "device": "ipad",
    "shots": [],
    "ru": {
      "tagline": "Конструктор новых моделей из деталей своих наборов",
      "stage": "Игровой прототип; проверка восстановления прогресса",
      "card": "Каталог наборов и деталей, 3D-сборка по шагам, Rescue Station, новые инструкции из собственных деталей и публичная библиотека авторских моделей. Вознаграждение авторам внутренней валютой — запланированная механика, не объявленная выплатами.",
      "what": "Игровая платформа для LEGO-совместимых деталей: инвентарь → совместимые инструкции → сборка → публикация авторской модели.",
      "who": "Игроки, семьи, коллекционеры конструкторов, преподаватели и независимые авторы инструкций.",
      "why": "Дать деталям вторую жизнь; объяснить, какие модели действительно можно собрать без покупки новых наборов.",
      "how": "Нормализованный реестр деталей, проверка комплектности, состояние шагов, восстановление сессии, модерация и подтверждаемая статистика использования.",
      "roadmap": [
        {
          "label": "Концепция",
          "state": "done"
        },
        {
          "label": "Интеграционная проверка",
          "state": "current"
        },
        {
          "label": "Пилот",
          "state": "next"
        },
        {
          "label": "Продажи",
          "state": "next"
        }
      ],
      "capabilities": [
        {
          "area": "Инвентарь деталей",
          "feature": "Наборы → part ID / цвет / количество → доступный остаток"
        },
        {
          "area": "Инструкции и сборка",
          "feature": "Проверка 100% комплектности, шаги, сохранение, возобновление"
        },
        {
          "area": "Библиотека сообщества",
          "feature": "Авторские MOC, поиск, лицензирование, модерация"
        },
        {
          "area": "Внутренняя экономика",
          "feature": "Учёт подтверждённых использований и игровых начислений"
        }
      ],
      "status": {
        "done": [],
        "now": [
          "Функциональная архитектура и проверка требований"
        ],
        "next": [
          "Подтвердить E2E-сборку и восстановление, затем пилот библиотеки"
        ],
        "seeking": "Ищу пилотных пользователей и профильного технологического партнёра; коммерческие метрики пока не подтверждены."
      },
      "collab": [
        {
          "k": "Пилот",
          "v": "Проверка реального пользовательского сценария с измеримыми результатами и согласиями."
        },
        {
          "k": "Экспертиза",
          "v": "Предметные требования, безопасные данные, юридическая и коммерческая экспертиза."
        },
        {
          "k": "Коммерция",
          "v": "Канал первых платящих заказчиков только после допуска продукта."
        }
      ],
      "investor": {
        "note": "Финансовая модель ниже — сценарная структура, не подтверждённые продажи или инвестиционные обязательства."
      }
    },
    "en": {
      "tagline": "Build new models from the parts you own",
      "stage": "Game prototype; progress recovery under test",
      "card": "Set and parts catalogues, step-by-step 3D builds, rescue mode, user-created instructions and a shared model library. In-app creator rewards are a proposed mechanic, not cash payouts.",
      "what": "A build-play platform: owned parts → feasible instructions → guided build → published community creations.",
      "who": "Builders, families, brick collectors, educators and independent instruction creators.",
      "why": "Give existing bricks new uses and distinguish feasible builds from instructions requiring missing parts.",
      "how": "Canonical parts inventory, feasibility matching, step-level save/recover, moderation and verifiable usage accounting.",
      "roadmap": [
        {
          "label": "Concept",
          "state": "done"
        },
        {
          "label": "Integration validation",
          "state": "current"
        },
        {
          "label": "Pilot",
          "state": "next"
        },
        {
          "label": "Sales",
          "state": "next"
        }
      ],
      "capabilities": [
        {
          "area": "Инвентарь деталей",
          "feature": "Sets → part ID, colour, count and available quantity"
        },
        {
          "area": "Инструкции и сборка",
          "feature": "100% feasibility, steps, save and resume"
        },
        {
          "area": "Библиотека сообщества",
          "feature": "Community MOCs, search, licensing and moderation"
        },
        {
          "area": "Внутренняя экономика",
          "feature": "Verified uses and in-app virtual reward ledger"
        }
      ],
      "status": {
        "done": [],
        "now": [
          "Functional architecture and requirement review"
        ],
        "next": [
          "Prove E2E builds and recovery before the library pilot"
        ],
        "seeking": "Seeking pilot users and a technical partner; commercial metrics remain unvalidated."
      },
      "collab": [
        {
          "k": "Pilot",
          "v": "A real user workflow with measurable outcomes and consent."
        },
        {
          "k": "Domain partner",
          "v": "Subject-matter requirements, safe test data and legal review."
        },
        {
          "k": "Distribution",
          "v": "Route to paying customers only after product admission."
        }
      ],
      "investor": {
        "note": "The investor model below is a planning framework, not proven revenue or an investment offer."
      }
    }
  },
  {
    "id": "marco",
    "name": "Marco Pescarolo Commercial OS",
    "device": "ipad",
    "shots": [],
    "ru": {
      "tagline": "Мультиконтурный luxury showroom и B2B-ordering",
      "stage": "Локальная разработка; production admission закрыт",
      "card": "Единая система коллекций, персональных цен, размеров и доступности. Сценарии Buyer Paris, Dubai, HQ, Private и Brand Admin: от lookbook и матрицы заказа до подтверждения, поставки, аналитики sell-through и повторной закупки.",
      "what": "Цифровой showroom и коммерческая операционная система бренда с раздельными B2B/B2C ролями.",
      "who": "Люксовые бренды, байеры магазинов, торговые представители, частные клиенты и администрация бренда.",
      "why": "Превратить презентацию коллекции в контролируемый заказ и повторную продажу, не раскрывая чужие цены или себестоимость.",
      "how": "Каталог → прайс по аккаунту → заказная матрица → подтверждение → allocation → ETA → отчетность; контроль RLS и серверной проверки цены.",
      "roadmap": [
        {
          "label": "Концепция",
          "state": "done"
        },
        {
          "label": "Интеграционная проверка",
          "state": "current"
        },
        {
          "label": "Пилот",
          "state": "next"
        },
        {
          "label": "Продажи",
          "state": "next"
        }
      ],
      "capabilities": [
        {
          "area": "Catalog & looks",
          "feature": "Модели, фото, материалы, размеры, сезоны, комплекты"
        },
        {
          "area": "B2B order desk",
          "feature": "Личные прайсы, матрица, preorder, reorder"
        },
        {
          "area": "Fulfilment / CRM",
          "feature": "Статусы, ETA, клиент, уведомления, документы"
        },
        {
          "area": "Business intelligence",
          "feature": "Sell-through, WOS, риск stock-out и предложение reorder"
        }
      ],
      "status": {
        "done": [],
        "now": [
          "Функциональная архитектура и проверка требований"
        ],
        "next": [
          "Проверить изоляцию цен в PostgreSQL и реальный сценарий закупки"
        ],
        "seeking": "Ищу пилотных пользователей и профильного технологического партнёра; коммерческие метрики пока не подтверждены."
      },
      "collab": [
        {
          "k": "Пилот",
          "v": "Проверка реального пользовательского сценария с измеримыми результатами и согласиями."
        },
        {
          "k": "Экспертиза",
          "v": "Предметные требования, безопасные данные, юридическая и коммерческая экспертиза."
        },
        {
          "k": "Коммерция",
          "v": "Канал первых платящих заказчиков только после допуска продукта."
        }
      ],
      "investor": {
        "note": "Финансовая модель ниже — сценарная структура, не подтверждённые продажи или инвестиционные обязательства."
      }
    },
    "en": {
      "tagline": "Multi-channel luxury showroom and B2B ordering",
      "stage": "Local build; production admission pending",
      "card": "One catalogue for collections, negotiated pricing, sizes and live availability. Buyer Paris, Dubai, HQ, Private and Admin journeys from lookbook and order matrix to delivery, sell-through and replenishment.",
      "what": "A digital showroom and commercial OS with separate wholesale and private-client permissions.",
      "who": "Luxury brands, wholesale buyers, sales reps, private clients and brand administration.",
      "why": "Turn presentations into governed ordering and repeat sales without leaking restricted pricing or cost.",
      "how": "Catalogue → account price → order matrix → approval → allocation → ETA → reporting; RLS and server-authoritative pricing.",
      "roadmap": [
        {
          "label": "Concept",
          "state": "done"
        },
        {
          "label": "Integration validation",
          "state": "current"
        },
        {
          "label": "Pilot",
          "state": "next"
        },
        {
          "label": "Sales",
          "state": "next"
        }
      ],
      "capabilities": [
        {
          "area": "Catalog & looks",
          "feature": "Styles, media, fabrics, sizes, seasons and outfits"
        },
        {
          "area": "B2B order desk",
          "feature": "Account-specific prices, order matrix, preorder and reorder"
        },
        {
          "area": "Fulfilment / CRM",
          "feature": "Statuses, ETA, customers, alerts and documents"
        },
        {
          "area": "Business intelligence",
          "feature": "Sell-through, WOS, stockout risk and reorder suggestions"
        }
      ],
      "status": {
        "done": [],
        "now": [
          "Functional architecture and requirement review"
        ],
        "next": [
          "Prove PostgreSQL price isolation and complete buyer checkout"
        ],
        "seeking": "Seeking pilot users and a technical partner; commercial metrics remain unvalidated."
      },
      "collab": [
        {
          "k": "Pilot",
          "v": "A real user workflow with measurable outcomes and consent."
        },
        {
          "k": "Domain partner",
          "v": "Subject-matter requirements, safe test data and legal review."
        },
        {
          "k": "Distribution",
          "v": "Route to paying customers only after product admission."
        }
      ],
      "investor": {
        "note": "The investor model below is a planning framework, not proven revenue or an investment offer."
      }
    }
  },
  {
    "id": "fintech",
    "name": "Debt Stability OS",
    "device": "ipad",
    "shots": [],
    "ru": {
      "tagline": "Персональная финансовая устойчивость и управление обязательствами",
      "stage": "Спецификация и инфраструктурная подготовка; финансовые функции не заявлены запущенными",
      "card": "Финтех-помощник для управления кредитами, картами, рассрочками и регулярными платежами. Предупреждает кассовые разрывы, строит проверяемые планы погашения и помогает сравнивать реструктуризацию и рефинансирование без навязывания новых займов.",
      "what": "Операционная система долговой нагрузки человека: все обязательства, календарь платежей, доходы, резерв и сценарии решений в одном пространстве.",
      "who": "Люди с несколькими кредитами, кредитными картами, нерегулярным доходом, семьи, финансовые консультанты и банки-партнёры в разрешённых сценариях.",
      "why": "Предотвращать просрочки и непредвиденный дефицит денег, показывая стоимость каждого решения и его влияние на будущие платежи.",
      "how": "Today → Debt → Calendar → Budget → Plan → Compare → Help. Event-ledger, версионированные расчёты, сверка с выписками, согласие на интеграции, серверная синхронизация, шифрование и офлайн-очередь.",
      "roadmap": [
        {
          "label": "Концепция",
          "state": "done"
        },
        {
          "label": "Интеграционная проверка",
          "state": "current"
        },
        {
          "label": "Пилот",
          "state": "next"
        },
        {
          "label": "Продажи",
          "state": "next"
        }
      ],
      "capabilities": [
        {
          "area": "Today: приоритет дня",
          "feature": "Ближайший платёж, доступные деньги, риск просрочки, следующее действие"
        },
        {
          "area": "Debt & Calendar",
          "feature": "Кредит, карта, грейс, рассрочка, частичный платёж, календарь обязательств"
        },
        {
          "area": "Budget & Plan",
          "feature": "Переменный доход, резерв, график погашения, стресс-сценарии"
        },
        {
          "area": "Compare & Help",
          "feature": "Полная стоимость кредита, рефинансирование, реструктуризация, документированные рекомендации"
        },
        {
          "area": "Data integrity",
          "feature": "Журнал событий, версии расчётов, сверка, права доступа и offline outbox"
        },
        {
          "area": "Безопасность и согласия",
          "feature": "MFA / passkeys, шифрование, минимизация данных, отмена согласия"
        }
      ],
      "status": {
        "done": [],
        "now": [
          "Функциональная архитектура и проверка требований"
        ],
        "next": [
          "Доказать точность расчётов, хранение и безопасность до ограниченного пилота"
        ],
        "seeking": "Ищу пилотных пользователей и профильного технологического партнёра; коммерческие метрики пока не подтверждены."
      },
      "collab": [
        {
          "k": "Пилот",
          "v": "Проверка реального пользовательского сценария с измеримыми результатами и согласиями."
        },
        {
          "k": "Экспертиза",
          "v": "Предметные требования, безопасные данные, юридическая и коммерческая экспертиза."
        },
        {
          "k": "Коммерция",
          "v": "Канал первых платящих заказчиков только после допуска продукта."
        }
      ],
      "investor": {
        "note": "Финансовая модель ниже — сценарная структура, не подтверждённые продажи или инвестиционные обязательства."
      }
    },
    "en": {
      "tagline": "Personal debt stability and obligation management",
      "stage": "Specification and infrastructure preparation; financial features not claimed live",
      "card": "A household-debt copilot for loans, cards, instalments and scheduled bills: cash-gap warnings, auditable repayment plans, restructuring and refinancing comparisons without pushing new borrowing.",
      "what": "An individual's debt operations workspace combining liabilities, payment calendar, income, liquidity reserve and decision scenarios.",
      "who": "People with multiple debts or variable income, households, financial coaches and authorised bank partners.",
      "why": "Prevent arrears and cash shortfalls by showing each decision's cost and effect on future obligations.",
      "how": "Today → Debt → Calendar → Budget → Plan → Compare → Help. Event ledger, versioned calculations, statement reconciliation, consent-based integrations, server sync, encryption and offline queue.",
      "roadmap": [
        {
          "label": "Concept",
          "state": "done"
        },
        {
          "label": "Integration validation",
          "state": "current"
        },
        {
          "label": "Pilot",
          "state": "next"
        },
        {
          "label": "Sales",
          "state": "next"
        }
      ],
      "capabilities": [
        {
          "area": "Today: приоритет дня",
          "feature": "Next payment, cash available, arrears risk and next action"
        },
        {
          "area": "Debt & Calendar",
          "feature": "Loans, cards, grace periods, instalments, partial payments and obligation calendar"
        },
        {
          "area": "Budget & Plan",
          "feature": "Irregular income, cash buffer, repayment schedule and stress scenarios"
        },
        {
          "area": "Compare & Help",
          "feature": "Total borrowing cost, refinancing, restructuring and explainable guidance"
        },
        {
          "area": "Data integrity",
          "feature": "Event ledger, calculation snapshots, reconciliation, permissions and offline outbox"
        },
        {
          "area": "Безопасность и согласия",
          "feature": "MFA, passkeys, encryption, data minimisation and consent revocation"
        }
      ],
      "status": {
        "done": [],
        "now": [
          "Functional architecture and requirement review"
        ],
        "next": [
          "Prove financial calculations, persistence and security before limited pilot"
        ],
        "seeking": "Seeking pilot users and a technical partner; commercial metrics remain unvalidated."
      },
      "collab": [
        {
          "k": "Pilot",
          "v": "A real user workflow with measurable outcomes and consent."
        },
        {
          "k": "Domain partner",
          "v": "Subject-matter requirements, safe test data and legal review."
        },
        {
          "k": "Distribution",
          "v": "Route to paying customers only after product admission."
        }
      ],
      "investor": {
        "note": "The investor model below is a planning framework, not proven revenue or an investment offer."
      }
    }
  }
];

export const INVESTOR_BLUEPRINTS = {
  "syntha": {
    "ru": {
      "revenue": "Подписка и внедрение для брендов/ритейлеров + платные интеграции.",
      "base": "Один подтверждённый пилот → конверсия в платный контракт → повторяемое внедрение на втором бренде.",
      "conservative": "Интеграции затягиваются; пилоты остаются неоплаченными; продаётся узкий модуль.",
      "optimistic": "Два повторяемых платных B2B-сегмента, типовые коннекторы, расширение аккаунтов.",
      "tranches": [
        "Пилот по одной товарной цепочке и сбор затрат",
        "Подписанный договор с платящим пилотом и сверка маржи",
        "Повторные продажи с измеренными CAC, удержанием и стоимостью поддержки"
      ],
      "breakEven": "Операционная выручка от подписок и внедрения минус переменные затраты ≥ регулярные затраты на команду, инфраструктуру и поддержку три месяца подряд; без разовых грантов.",
      "formula": "Клиенты × средний ежемесячный контракт × валовая маржа − фиксированный OPEX.",
      "evidence": "Длительность внедрения, стоимость интеграций, платящие аккаунты, SLA и churn."
    },
    "en": {
      "revenue": "SaaS and implementation for brands/retailers plus integrations.",
      "base": "One validated pilot → paid account → replicable second-brand deployment.",
      "conservative": "Integrations run late; unpaid pilots; narrow module sale only.",
      "optimistic": "Repeatable paid B2B segments, standard connectors and account expansion.",
      "tranches": [
        "One-chain pilot and tracked delivery cost",
        "First paid pilot, reconciled unit margin",
        "Repeatable sales with measured CAC, retention and support cost"
      ],
      "breakEven": "Subscription plus implementation contribution covers recurring team, hosting and support costs for three consecutive months, excluding one-offs.",
      "formula": "Customers × monthly contract value × gross margin − fixed OPEX.",
      "evidence": "Implementation duration, integration cost, paid accounts, SLAs and churn."
    }
  },
  "chatx": {
    "ru": {
      "revenue": "Оплата за активного пользователя или команду; корпоративная поставка.",
      "base": "Пилот в одной команде → удержание → годовой контракт.",
      "conservative": "Высокая стоимость внедрения и слабая ежедневная активность.",
      "optimistic": "Рост мест внутри команд и подключение нескольких организаций.",
      "tranches": [
        "Безопасный редактор и сценарии Page ↔ Task",
        "Оплачиваемый пилот с журналом использования",
        "Несколько команд и проверенная экономика поддержки"
      ],
      "breakEven": "Валовая прибыль по оплачиваемым рабочим местам покрывает облако, поддержку и разработку в течение трёх месяцев.",
      "formula": "Платящие места × ARPA × маржа − OPEX.",
      "evidence": "DAU/WAU, paid seats, support ticket rate, storage cost, churn."
    },
    "en": {
      "revenue": "Per-seat/team SaaS and enterprise deployments.",
      "base": "Team pilot → retention → annual contract.",
      "conservative": "High deployment cost and low habitual activity.",
      "optimistic": "Seat expansion and cross-organisation rollout.",
      "tranches": [
        "Secure editor and Page ↔ Task workflow",
        "Paid usage-measured pilot",
        "Several teams with proven support economics"
      ],
      "breakEven": "Paid-seat contribution covers hosting, support and development for three consecutive months.",
      "formula": "Paid seats × ARPA × margin − OPEX.",
      "evidence": "DAU/WAU, paid seats, support cases, storage and churn."
    }
  },
  "renova": {
    "ru": {
      "revenue": "Плата за проект/подписка; дополнительные услуги только при подписанном договоре.",
      "base": "Ограниченный B2B-пилот с контролем актов и оплаты.",
      "conservative": "Сложная юридическая проверка замедляет конверсию.",
      "optimistic": "Партнёры дают повторяемый поток заказов с автоматизацией.",
      "tranches": [
        "Согласование документооборота и прав доступа",
        "Платные сделки и измеренный цикл исполнения",
        "Повторные заказы и доказанная валовая маржа"
      ],
      "breakEven": "Маржинальный доход по завершённым оплачиваемым кейсам ≥ постоянные расходы за три месяца.",
      "formula": "Оплаченные кейсы × вклад после комиссий и обработки − OPEX.",
      "evidence": "Платёжная конверсия, юридические расходы, среднее время сделки и возвраты."
    },
    "en": {
      "revenue": "Paid projects/subscriptions; add-ons only under contract.",
      "base": "Controlled B2B pilot with documents and payments.",
      "conservative": "Legal verification slows conversion.",
      "optimistic": "Partners yield repeatable orders and automation.",
      "tranches": [
        "Document and permission audit",
        "Paid cases with measured cycle",
        "Repeat orders and proven gross margin"
      ],
      "breakEven": "Completed paid-case contribution covers fixed costs over three consecutive months.",
      "formula": "Paid cases × contribution after fees and delivery − OPEX.",
      "evidence": "Payment conversion, legal fees, cycle time and refunds."
    }
  },
  "mfw": {
    "ru": {
      "revenue": "Контракт с организатором + спонсорские модули и платный B2B-инструментарий.",
      "base": "Одно событие с заказчиком и актом приёмки.",
      "conservative": "Пилот не переходит в повторные контракты между сезонами.",
      "optimistic": "Повторные организаторы и многособытийные лицензии.",
      "tranches": [
        "Проверенный билет/QR и расписание без дублей",
        "Первый оплаченный контракт с организатором",
        "Повторная продажа сезонного продукта"
      ],
      "breakEven": "За скользящие 12 месяцев вклад от оплаченных мероприятий покрывает разработку, поддержку и сезонное исполнение, резерв ликвидности неотрицателен.",
      "formula": "Мероприятия × вклад после затрат на событие − годовой OPEX.",
      "evidence": "Число событий, стоимость внедрения, спонсорская конверсия, поддержка в пике."
    },
    "en": {
      "revenue": "Organiser contracts, sponsor modules and paid B2B tools.",
      "base": "One delivered and accepted paid event.",
      "conservative": "No repeat contracts between event seasons.",
      "optimistic": "Multi-event organiser subscriptions and recurring sponsors.",
      "tranches": [
        "Pass/QR and agenda end-to-end verification",
        "First paid organiser contract",
        "Repeat seasonal contracts"
      ],
      "breakEven": "Trailing 12-month contracted-event contribution covers development, support and seasonal operations with non-negative cash buffer.",
      "formula": "Events × contribution net of event costs − annual OPEX.",
      "evidence": "Event count, implementation cost, sponsor conversion and peak support."
    }
  },
  "promomed": {
    "ru": {
      "revenue": "Организаторская лицензия, партнёрские пакеты, постсобытийные программы.",
      "base": "Пилот конференции и измерение посещения/лидов.",
      "conservative": "Отсутствие платного пилота и несформированный постсобытийный спрос.",
      "optimistic": "Ежегодные лицензии и повторная программа сообщества.",
      "tranches": [
        "Готовность регистрации, QR и базы без потери данных",
        "Оплаченная конференция с подтверждением посещаемости",
        "Повторный контракт и конверсия партнёров"
      ],
      "breakEven": "За 12 месяцев выручка минус прямые затраты на события и сообщество покрывает ежегодные постоянные расходы.",
      "formula": "Организаторы × контракт + партнёры × пакет − затраты событий − OPEX.",
      "evidence": "Подписанные пакеты, attendance, partner leads, renewals и затраты на проведение."
    },
    "en": {
      "revenue": "Organiser licence, partner packages and post-event programmes.",
      "base": "Conference pilot tracking attendance and partner leads.",
      "conservative": "No paid pilot or post-event demand.",
      "optimistic": "Annual licences and repeat community programmes.",
      "tranches": [
        "Registration/QR/persistence readiness",
        "Paid conference with attendance proof",
        "Renewal and partner conversion"
      ],
      "breakEven": "Twelve-month contribution from events and community covers annual fixed costs.",
      "formula": "Organiser contracts + sponsor packages − delivery costs − OPEX.",
      "evidence": "Signed partner packages, attendance, leads, renewals and delivery costs."
    }
  },
  "fashion-os": {
    "ru": {
      "revenue": "SaaS-подписка по организации/пользователям, внедрение и интеграции.",
      "base": "Один бренд завершает сезон в системе и оплачивает внедрение.",
      "conservative": "Разрозненные данные удлиняют ввод в эксплуатацию.",
      "optimistic": "Сеть референсных клиентов и типовой коннектор к учётным системам.",
      "tranches": [
        "Product Master и контракт на интеграцию",
        "Один закрытый сезон и платёж",
        "Вторая платящая организация с повторяемым внедрением"
      ],
      "breakEven": "Контрактная маржа по платящим организациям покрывает постоянный OPEX три месяца без доходов от разовых разработок.",
      "formula": "Платящие организации × recurring ARPA × маржа − OPEX.",
      "evidence": "Срок интеграции, data quality, лицензии, поддержка, churn."
    },
    "en": {
      "revenue": "Per-organisation/seat SaaS, implementation and integrations.",
      "base": "A brand closes a season in-product and pays.",
      "conservative": "Messy source data delays adoption.",
      "optimistic": "Reference customers and standard accounting connectors.",
      "tranches": [
        "Product Master and integration contract",
        "Paid completed seasonal workflow",
        "Second paying organisation and repeatable rollout"
      ],
      "breakEven": "Recurring contribution from paying organisations covers fixed OPEX for three months, excluding one-off custom work.",
      "formula": "Paying organisations × recurring ARPA × margin − OPEX.",
      "evidence": "Integration lead time, data quality, seats, support and churn."
    }
  },
  "fur": {
    "ru": {
      "revenue": "Лицензия для фабрики + внедрение и сопровождение партии.",
      "base": "Подтверждение нормы на одной партии и первый договор.",
      "conservative": "Недостаточно достоверных данных по сырью и операциям.",
      "optimistic": "Несколько фабрик и повторяемые шаблоны материалов.",
      "tranches": [
        "Верификация движений и норм расхода",
        "Оплаченный пилот на реальной партии",
        "Повторные производственные циклы и расширение"
      ],
      "breakEven": "Маржинальный доход от лицензий и сопровождения оплаченных фабрик ≥ OPEX три месяца подряд.",
      "formula": "Фабрики × подписка × маржа + сервисный вклад − OPEX.",
      "evidence": "Стоимость ввода партии, доля брака, число партий, экономия материалов."
    },
    "en": {
      "revenue": "Factory licence plus implementation and batch support.",
      "base": "Sample-based norm approved for one batch and first contract.",
      "conservative": "Incomplete raw material data blocks value proof.",
      "optimistic": "Several factories and repeatable material templates.",
      "tranches": [
        "Ledger and consumption rules verified",
        "Paid real-batch pilot",
        "Repeat production cycles and expansion"
      ],
      "breakEven": "Licence and support contribution from paying factories covers OPEX for three months.",
      "formula": "Factories × subscription contribution + services − OPEX.",
      "evidence": "Batch onboarding cost, rejects, batches processed and material savings."
    }
  },
  "antiqua": {
    "ru": {
      "revenue": "Платное галерейное обслуживание, комиссии по завершённым сделкам и экспертные сервисы.",
      "base": "Запущен проверенный каталог и первый оплачиваемый сервис.",
      "conservative": "Трафик без продаж и дорогая экспертная атрибуция.",
      "optimistic": "Повторные B2B-галереи и заказы экспертизы.",
      "tranches": [
        "Проверка источников, изображений, прав",
        "Первое оплаченное размещение или экспертиза",
        "Повторные обращения и контролируемый CAC"
      ],
      "breakEven": "Комиссионный доход только с завершённых сделок плюс сервисная валовая прибыль покрывают постоянные расходы три месяца; provenance costs учтены.",
      "formula": "Оплаченные услуги × вклад + закрытые сделки × комиссия − OPEX.",
      "evidence": "Стоимость экспертизы, цена привлечения, конверсия запроса, возвраты."
    },
    "en": {
      "revenue": "Paid gallery services, closed-sale commissions and research services.",
      "base": "Evidence-backed catalogue and first paid service.",
      "conservative": "Audience without paid demand; expensive expert provenance.",
      "optimistic": "Repeat gallery B2B accounts and research orders.",
      "tranches": [
        "Image rights and source audit",
        "First paid listing or research engagement",
        "Repeat buyers and controlled acquisition cost"
      ],
      "breakEven": "Realised commission plus paid-service contribution covers all recurring costs for three months, with provenance work costed.",
      "formula": "Paid services × contribution + completed sales × fee − OPEX.",
      "evidence": "Research cost, lead cost, conversion and refunds."
    }
  },
  "igra": {
    "ru": {
      "revenue": "Подписка/премиум-инструменты и лицензии для образовательных партнёров; игровая валюта не равна выручке.",
      "base": "Рабочая сборка → первая удерживаемая когорта → добровольная оплата.",
      "conservative": "Высокие расходы на 3D-контент, слабый retention, нет монетизации.",
      "optimistic": "Масштабируемая библиотека UGC, устойчивый платёжный спрос.",
      "tranches": [
        "300/300 деталей, сохранение и права на инструкции",
        "Пилот сообщества с подтверждённым использованием",
        "Платящие пользователи и авторская экономика"
      ],
      "breakEven": "Реально полученные платежи за вычетом возвратов, комиссии и переменной доставки контента покрывают OPEX три месяца; внутренняя валюта исключена из дохода.",
      "formula": "Платящие пользователи × net ARPPU × маржа − контент/OPEX.",
      "evidence": "Retention D7/D30, авторские лицензии, стоимость сервинга моделей, платежная конверсия."
    },
    "en": {
      "revenue": "Premium tools/subscriptions and educator licences; virtual coins are not revenue.",
      "base": "Verified builds → retained cohort → voluntary conversion.",
      "conservative": "3D content cost, weak retention and no paid conversion.",
      "optimistic": "Scalable community library with recurring real-money demand.",
      "tranches": [
        "300/300 parts, persistence and instruction rights",
        "Usage-verified community pilot",
        "Paid creators and subscriber economics"
      ],
      "breakEven": "Collected cash net of refunds, fees and variable content delivery covers OPEX for three months; virtual coins excluded.",
      "formula": "Paying users × net ARPPU × margin − content/OPEX.",
      "evidence": "D7/D30 retention, author rights, model serving cost and paid conversion."
    }
  },
  "marco": {
    "ru": {
      "revenue": "Брендовый SaaS/white-label + внедрение; лицензия по бренду, а не продажи одежды как доход платформы.",
      "base": "Один оплаченный контракт после закрытого заказа байера.",
      "conservative": "Дорогая настройка прайсов и политик доступа.",
      "optimistic": "Тиражирование на несколько брендов, повторный reorder.",
      "tranches": [
        "Безопасность RLS и проверка Buyer roles",
        "Оплаченный контракт + доказанный end-to-end заказ",
        "Второй бренд и повторные закупки"
      ],
      "breakEven": "Повторяемая лицензионная маржа по платящим брендам покрывает регулярные расходы три месяца.",
      "formula": "Бренды × recurring fee × маржа + внедрение − OPEX.",
      "evidence": "Время внедрения, ошибки цен, заказы, recurring revenue и поддержка."
    },
    "en": {
      "revenue": "Brand white-label SaaS and onboarding; platform revenue distinct from merchandise sales.",
      "base": "Paid brand contract after controlled buyer order.",
      "conservative": "Complex price and access policies increase onboarding cost.",
      "optimistic": "Multi-brand rollout and recurring orders.",
      "tranches": [
        "RLS and buyer-role isolation",
        "Paid contract and complete buyer checkout",
        "Second brand and repeat buyer orders"
      ],
      "breakEven": "Recurring brand-licence contribution covers fixed monthly costs for three consecutive months.",
      "formula": "Brands × monthly fee × margin + onboarding contribution − OPEX.",
      "evidence": "Onboarding time, price errors, orders, MRR and support costs."
    }
  },
  "fintech": {
    "ru": {
      "revenue": "Подписка на расширенный финансовый план и B2B/B2B2C лицензия при явном согласии; не продажа кредитов по умолчанию.",
      "base": "Точность графиков и безопасность подтверждены, затем ограниченный пилот и первая добровольная оплата.",
      "conservative": "Нет банковских API, высокая цена доверия/привлечения, бесплатные пользователи не конвертируются.",
      "optimistic": "Повторные подписки и платные партнёрские программы с контролем конфликтов интересов.",
      "tranches": [
        "Проверка расчётного движка, журналов, MFA, восстановления и юридической модели",
        "Пилот с согласиями, отчёт о точности, платящая когорта",
        "Повторяющиеся платежи, измеренный CAC/LTV и доказанная поддержка"
      ],
      "breakEven": "Чистая подписная и договорная выручка после возвратов, эквайринга, переменной поддержки и compliance ≥ ежемесячные фиксированные расходы три месяца; выплаты по кредитам пользователя не считаются выручкой.",
      "formula": "Платящие домохозяйства × net ARPA × валовая маржа + B2B contribution − OPEX.",
      "evidence": "Проверенные графики, доля предотвращённых просрочек с корректной причинной оценкой, согласия, churn, CAC, fraud loss, поддержка."
    },
    "en": {
      "revenue": "Premium personal plan and consent-based B2B/B2B2C licences; no default loan lead-selling.",
      "base": "Repayment precision and security accepted, then controlled pilot and voluntary paid conversion.",
      "conservative": "No bank APIs, expensive trust/acquisition and no free-to-paid conversion.",
      "optimistic": "Repeat subscription demand plus consented partner licences with conflict controls.",
      "tranches": [
        "Calculation engine, ledger, MFA, restore and legal assessment",
        "Consent-based accuracy pilot and paid cohort",
        "Renewals, measured CAC/LTV and proven support cost"
      ],
      "breakEven": "Net subscriptions and contracted B2B contribution after refunds, fees, support and compliance covers fixed monthly OPEX for three consecutive months; users' loan payments are not platform revenue.",
      "formula": "Paying households × net ARPA × gross margin + B2B contribution − OPEX.",
      "evidence": "Schedule accuracy, causally validated arrears outcomes, consents, churn, CAC, fraud exposure and support costs."
    }
  }
};
