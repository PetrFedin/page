// Five screenshot-free product blueprints for Syntha PAGE V2.
// Functional states distinguish code implementation from release evidence.
// Do not add source-private client identities or imply proven commercial use.
export const PLATFORM_ATLAS = {
  "fashionmgmt": {
    "ru": {
      "system": [
        "Коллекция и модель",
        "Заказ и цеха",
        "Себестоимость и управление"
      ],
      "functions": [
        {
          "area": "Коллекция и заказ",
          "does": "Модели, клиентские заказы, версии и спецификации изделия",
          "state": "built"
        },
        {
          "area": "Производство",
          "does": "Операции цехов, примерки, переделки, незавершённые работы (WIP)",
          "state": "built"
        },
        {
          "area": "Планирование мощностей",
          "does": "Загрузка, очереди заказов, ограничения и сроки исполнения",
          "state": "built"
        },
        {
          "area": "Себестоимость",
          "does": "Plan / Actual / CTC / Forecast; итоговый снимок закрытого заказа",
          "state": "built"
        },
        {
          "area": "Финансы",
          "does": "Оплаты, 13-недельная ликвидность и управленческое закрытие месяца",
          "state": "built"
        },
        {
          "area": "Права и аудит",
          "does": "Разделение ролей, история решений и безопасное обновление",
          "state": "verify"
        },
        {
          "area": "Работа в цехе",
          "does": "Ежедневный сквозной сценарий на актуально опубликованной версии",
          "state": "next"
        }
      ],
      "note": "Платформа для производства и управления fashion-компанией, а не представление конкретного клиента."
    },
    "en": {
      "system": [
        "Collection & model",
        "Orders & workshops",
        "Cost & management"
      ],
      "functions": [
        {
          "area": "Collection and order",
          "does": "Style versions, customer orders and product specifications",
          "state": "built"
        },
        {
          "area": "Production",
          "does": "Workshop operations, fittings, rework and work in progress (WIP)",
          "state": "built"
        },
        {
          "area": "Capacity",
          "does": "Workload, bottlenecks, work queues and delivery dates",
          "state": "built"
        },
        {
          "area": "Costing",
          "does": "Plan / Actual / CTC / Forecast and immutable final-cost close",
          "state": "built"
        },
        {
          "area": "Finance",
          "does": "Payments, 13-week cash outlook and month-end control",
          "state": "built"
        },
        {
          "area": "Roles and audit",
          "does": "Role-scoped permissions, decisions and rollback behaviour",
          "state": "verify"
        },
        {
          "area": "Daily use",
          "does": "End-to-end staff journey on the actually deployed version",
          "state": "next"
        }
      ],
      "note": "An industry platform case, not a presentation of a named client's business."
    }
  },
  "furproduction": {
    "ru": {
      "system": [
        "Закупка конкретной партии",
        "Склад и производство",
        "Изделие и фактическая стоимость"
      ],
      "functions": [
        {
          "area": "Поступление партии",
          "does": "Источник, идентификатор партии, документы и входящая стоимость",
          "state": "built"
        },
        {
          "area": "Склад",
          "does": "Движения и резервы сырья по конкретной партии, не усреднённо",
          "state": "built"
        },
        {
          "area": "Раскрой и выпуск",
          "does": "Нормы, фактический расход, списание и готовое изделие",
          "state": "built"
        },
        {
          "area": "Себестоимость",
          "does": "Закупка, выделка, логистика, производство и фактические затраты",
          "state": "built"
        },
        {
          "area": "Контроль операций",
          "does": "Исправления без потери истории, платежи и audit trail",
          "state": "built"
        },
        {
          "area": "Целостность данных",
          "does": "Сверка остатков, списаний и восстановления после сбоев",
          "state": "verify"
        },
        {
          "area": "Производственный пилот",
          "does": "Один реальный заказ от партии сырья до закрытого изделия",
          "state": "next"
        }
      ],
      "note": "Отраслевая ERP для тех, кто закупает, учитывает и перерабатывает дорогое сырьё; коммерческие данные клиентов скрыты."
    },
    "en": {
      "system": [
        "Identified incoming lot",
        "Stock & manufacturing",
        "Finished item & actual cost"
      ],
      "functions": [
        {
          "area": "Lot receipt",
          "does": "Source, lot identity, intake documents and landed cost",
          "state": "built"
        },
        {
          "area": "Inventory",
          "does": "Stock movements and reservations by specific lot, not averaged",
          "state": "built"
        },
        {
          "area": "Consumption",
          "does": "Norms, actual usage, write-offs and finished goods",
          "state": "built"
        },
        {
          "area": "Cost accounting",
          "does": "Buying, processing, logistics, production and actual expenses",
          "state": "built"
        },
        {
          "area": "Operation history",
          "does": "Corrections, payments and an audit trail",
          "state": "built"
        },
        {
          "area": "Data integrity",
          "does": "Inventory reconciliation and recovery after interruption",
          "state": "verify"
        },
        {
          "area": "Production pilot",
          "does": "One real order from raw-material lot to closed finished item",
          "state": "next"
        }
      ],
      "note": "Vertical ERP for teams working with traceable high-value material; customer records remain private."
    }
  },
  "antiqua": {
    "ru": {
      "system": [
        "Галерея живописи",
        "Произведение и художник",
        "Коллекции и исследование"
      ],
      "functions": [
        {
          "area": "Поиск и просмотр",
          "does": "Галерея исключительно произведений живописи и карточки работ",
          "state": "built"
        },
        {
          "area": "Связи произведений",
          "does": "Произведение → художник → связанные работы и контекст",
          "state": "built"
        },
        {
          "area": "Личные коллекции",
          "does": "Сохранения, подборки и цикл персональных рекомендаций",
          "state": "built"
        },
        {
          "area": "Исследование",
          "does": "Источники, атрибуция, провенанс и права без подмены догадкой",
          "state": "verify"
        },
        {
          "area": "Надёжность данных",
          "does": "Подтверждение отдельного PostgreSQL и сохранности после перезапуска",
          "state": "verify"
        },
        {
          "area": "Медиа-инфраструктура",
          "does": "IIIF, масштабирование изображения и исследовательские инструменты",
          "state": "next"
        },
        {
          "area": "Реальная коллекция",
          "does": "Пилот с галереей, подтверждёнными данными и правами",
          "state": "next"
        }
      ],
      "note": "Сначала произведение и знания о нём; продажи и аукционы — отдельный необязательный слой."
    },
    "en": {
      "system": [
        "Paintings gallery",
        "Artwork & artist",
        "Collections & research"
      ],
      "functions": [
        {
          "area": "Gallery discovery",
          "does": "Paintings-only browsing and structured artwork records",
          "state": "built"
        },
        {
          "area": "Artwork links",
          "does": "Artwork → artist → related works and historical context",
          "state": "built"
        },
        {
          "area": "Personal collections",
          "does": "Saved works, curated sets and taste-based discovery",
          "state": "built"
        },
        {
          "area": "Research",
          "does": "Source-linked attribution, provenance and media rights",
          "state": "verify"
        },
        {
          "area": "Durable authority",
          "does": "Dedicated PostgreSQL identity and restart persistence proof",
          "state": "verify"
        },
        {
          "area": "Image infrastructure",
          "does": "IIIF media zoom and professional research tooling",
          "state": "next"
        },
        {
          "area": "Real artworks",
          "does": "Gallery pilot with documented rights and real collection data",
          "state": "next"
        }
      ],
      "note": "Artwork and evidence come first; auctions and commerce are separate optional layers."
    }
  },
  "igra": {
    "ru": {
      "system": [
        "Набор и коробка",
        "Инструкция и сборка",
        "Прогресс и коллекция"
      ],
      "functions": [
        {
          "area": "Каталог",
          "does": "Наборы, карточка набора и выбор модели для сборки",
          "state": "built"
        },
        {
          "area": "Коробка и детали",
          "does": "Комплект деталей с идентификаторами и количеством",
          "state": "verify"
        },
        {
          "area": "Инструкция",
          "does": "Пошаговая последовательность действий и игровые подсказки",
          "state": "built"
        },
        {
          "area": "Сборка",
          "does": "Проверка размещения и учёт каждой из 300 исходных деталей без замен",
          "state": "verify"
        },
        {
          "area": "Сохранение",
          "does": "Возврат в нужный шаг после обновления страницы или выхода",
          "state": "verify"
        },
        {
          "area": "AR и устройства",
          "does": "iOS / ARKit / RealityKit и веб-демо на разных экранах",
          "state": "verify"
        },
        {
          "area": "Игровой мир",
          "does": "Коллекция фигурок и Rescue Mission после стабильной сборки",
          "state": "next"
        }
      ],
      "note": "Пользовательский продукт: важнее закончить набор и продолжить игру, чем показать красивую, но непроходимую демоверсию.",
      "deep": {
        "summary": "IGRA — интерактивный конструктор и игровая коллекция. Ребёнок или взрослый выбирает набор, открывает коробку, собирает модель по шагам и продолжает с сохранённого места. Главная проверка — точность каждой детали и устойчивость игрового процесса.",
        "users": [
          "Игрок выбирает набор, собирает его и возвращается к незаконченной модели.",
          "Родители видят понятный самостоятельный игровой маршрут без чтения технической инструкции.",
          "Будущий образовательный или развлекательный партнёр оценивает качество комплекта и прохождения."
        ],
        "workflow": [
          "Главная → каталог → карточка набора → открыть коробку.",
          "Показать комплект → выбрать шаг → поставить деталь → подтвердить размещение.",
          "Закончить модель → сохранить результат → вернуться к набору или коллекции.",
          "Прервать игру → перезагрузить страницу или выйти → восстановить точное состояние."
        ],
        "data": [
          "Каталог наборов, состав комплекта и однозначные идентификаторы деталей.",
          "Последовательность сборки и условия, по которым шаг действительно завершён.",
          "Локальное состояние прогресса с версией схемы набора.",
          "Изображения / 3D-модели и устройство рендеринга отдельно от правил сборки."
        ],
        "economics": [
          "Сначала проверяется завершение сборки и возвращаемость — это не измеренная выручка.",
          "Далее можно тестировать распространение наборов и партнёрские коллекции.",
          "AR и игровые задания имеют смысл после надёжного базового маршрута."
        ],
        "governance": [
          "Не засчитывать запасные детали вместо обязательных.",
          "Не завершать шаг без соответствия набора и числа деталей.",
          "Сохранение должно пережить перезагрузку и повторный вход.",
          "Не заявлять об успешном App Store-релизе или массовом пилоте без доказательств."
        ],
        "proof": [
          "Есть код iOS / ARKit / RealityKit и веб-демонстрация.",
          "Собраны каталог, интерактивные инструкции и структура игрового процесса.",
          "Тестирование полного комплекта и восстановления состояния ещё продолжается."
        ],
        "next": [
          "Закрыть учёт последних деталей комплекта из 300.",
          "Подтвердить сохранение, восстановление и выход без потери прогресса.",
          "Пройти на телефоне, планшете и компьютере весь маршрут до готового набора.",
          "После GREEN добавить Rescue Mission и коллекцию фигурок."
        ]
      },
      "visual": {
        "architecture": [
          {
            "label": "ВЫБОР",
            "items": [
              "Каталог наборов",
              "Карточка модели",
              "Коробка"
            ]
          },
          {
            "label": "ИГРА",
            "items": [
              "Пошаговая инструкция",
              "Точная деталь",
              "Проверка шага"
            ]
          },
          {
            "label": "ПРОДОЛЖЕНИЕ",
            "items": [
              "Сохранение",
              "Коллекция",
              "Новый набор"
            ]
          }
        ],
        "workflow": [
          "Выбрать набор",
          "Открыть коробку",
          "Проверить детали",
          "Собрать шаги",
          "Сохранить",
          "Продолжить"
        ],
        "kpi": [
          {
            "label": "Сборка",
            "metrics": [
              "Проход всех шагов",
              "0 замен основных деталей",
              "Учёт последней детали"
            ]
          },
          {
            "label": "Продолжение",
            "metrics": [
              "Успешное восстановление",
              "Потерянный прогресс",
              "Повторное открытие"
            ]
          },
          {
            "label": "Удобство",
            "metrics": [
              "Ошибки касаний",
              "Время до первого шага",
              "Завершение на телефоне"
            ]
          }
        ],
        "matrix": [
          {
            "pilot": "300 исходных деталей",
            "pass": "Все обязательные детали учтены без подмены запасными"
          },
          {
            "pilot": "Сохранить и закрыть",
            "pass": "Состояние восстановлено на том же шаге без потерь"
          },
          {
            "pilot": "Пользовательский маршрут",
            "pass": "Главная → каталог → набор → коробка → инструкция → сборка → продолжение"
          },
          {
            "pilot": "Стабильность",
            "pass": "Нет блокирующих ошибок, недоступных действий и потерянного прогресса"
          }
        ],
        "roadmap": [
          {
            "phase": "P0",
            "label": "300 деталей · точный комплект",
            "state": "now"
          },
          {
            "phase": "P1",
            "label": "Сохранение и продолжение",
            "state": "next"
          },
          {
            "phase": "P2",
            "label": "Сквозной QA на устройствах",
            "state": "next"
          },
          {
            "phase": "P3",
            "label": "Коллекция и миссии",
            "state": "later"
          }
        ]
      },
      "integrations": [
        "Локальное сохранение игрового состояния",
        "3D-рендеринг iOS / ARKit / RealityKit",
        "Веб-демо в браузере; остальные внешние сервисы пока не подтверждены"
      ]
    },
    "en": {
      "system": [
        "Set & box",
        "Instructions & assembly",
        "Progress & collection"
      ],
      "functions": [
        {
          "area": "Catalogue",
          "does": "Browse sets, choose a model and enter the box",
          "state": "built"
        },
        {
          "area": "Box and pieces",
          "does": "Check all pieces and unique identifiers against the real set",
          "state": "verify"
        },
        {
          "area": "Instructions",
          "does": "Guided sequence, steps and in-game hints",
          "state": "built"
        },
        {
          "area": "Assembly",
          "does": "Verify placement of all 300 original parts without substitutes",
          "state": "verify"
        },
        {
          "area": "Save / resume",
          "does": "Recover exactly the same step after refresh or leaving",
          "state": "verify"
        },
        {
          "area": "AR and devices",
          "does": "iOS / ARKit / RealityKit foundation plus web demonstration",
          "state": "verify"
        },
        {
          "area": "Game world",
          "does": "Collectible figures and Rescue Mission after core acceptance",
          "state": "next"
        }
      ],
      "note": "A product for real players: finishing a complete set is more important than showing a non-playable demo.",
      "deep": {
        "summary": "IGRA combines a digital construction set with guided play and collecting. Choose a set, open the box, build the model step by step, save and return. Every original piece and recovery step must be proven before wider release.",
        "users": [
          "Players discover, build and resume sets.",
          "Parents need a clear, independent play flow.",
          "Education and entertainment partners can evaluate a limited validated experience."
        ],
        "workflow": [
          "Home → catalogue → set → box.",
          "Inventory check → instructions → piece placement → verified step.",
          "Finish the model → save → collect or start another set.",
          "Exit or refresh → resume the same stage without data loss."
        ],
        "data": [
          "Unique part identifiers and an exact 300-piece set manifest.",
          "Step order and real completion conditions.",
          "Versioned local progress and model state.",
          "3D assets kept separate from authoritative build rules."
        ],
        "economics": [
          "Completion, successful recovery and return rate are hypotheses to validate first.",
          "Set licensing and collaborations can be evaluated after core play acceptance.",
          "AR and missions should extend a reliable build, not hide broken steps."
        ],
        "governance": [
          "Do not count spare pieces as replacements for required parts.",
          "Do not mark a step complete without verified placement.",
          "State must survive refresh and reopening.",
          "No claims of App Store availability or proven revenue without evidence."
        ],
        "proof": [
          "iOS/AR and browser demonstration code exists.",
          "Catalogue, guided instructions and the game structure are implemented.",
          "Complete part integrity and recovery remain in verification."
        ],
        "next": [
          "Pass the original 300-piece count and final-part invariant.",
          "Prove save / restore after exit and page reload.",
          "Validate the full journey on phone, tablet and desktop.",
          "Then add collection and Rescue Mission."
        ]
      },
      "visual": {
        "architecture": [
          {
            "label": "DISCOVERY",
            "items": [
              "Set catalogue",
              "Model",
              "Box"
            ]
          },
          {
            "label": "BUILD",
            "items": [
              "Guided steps",
              "Exact part",
              "Placement proof"
            ]
          },
          {
            "label": "CONTINUITY",
            "items": [
              "Save state",
              "Collection",
              "Next set"
            ]
          }
        ],
        "workflow": [
          "Choose a set",
          "Open the box",
          "Verify pieces",
          "Build all steps",
          "Save",
          "Resume"
        ],
        "kpi": [
          {
            "label": "Assembly",
            "metrics": [
              "All steps passed",
              "No substituted parts",
              "Final piece counted"
            ]
          },
          {
            "label": "Recovery",
            "metrics": [
              "Resume success",
              "Progress loss",
              "Repeat visits"
            ]
          },
          {
            "label": "Usability",
            "metrics": [
              "Blocked taps",
              "Time to first step",
              "Mobile completion"
            ]
          }
        ],
        "matrix": [
          {
            "pilot": "300 original parts",
            "pass": "All required pieces counted without spare substitutions"
          },
          {
            "pilot": "Save, close and return",
            "pass": "Exact progress restored after refresh and exit"
          },
          {
            "pilot": "Golden Path",
            "pass": "Home → catalogue → set → box → instruction → build → resume"
          },
          {
            "pilot": "Stability",
            "pass": "No blocking errors, dead actions or lost progress"
          }
        ],
        "roadmap": [
          {
            "phase": "P0",
            "label": "Exact 300-piece manifest",
            "state": "now"
          },
          {
            "phase": "P1",
            "label": "Save and resume",
            "state": "next"
          },
          {
            "phase": "P2",
            "label": "Cross-device QA",
            "state": "next"
          },
          {
            "phase": "P3",
            "label": "Collectibles and missions",
            "state": "later"
          }
        ]
      },
      "integrations": [
        "Local game-state storage",
        "iOS / ARKit / RealityKit rendering",
        "Browser demonstration; external providers not yet accepted"
      ]
    }
  },
  "marcopescarolo": {
    "ru": {
      "system": [
        "Коллекция и ассортимент",
        "Матрица заказа байера",
        "Подтверждение и поставка"
      ],
      "functions": [
        {
          "area": "Цифровая витрина",
          "does": "Презентация коллекций и карточек товаров в опубликованном Netlify-сайте",
          "state": "built"
        },
        {
          "area": "Товарный мастер",
          "does": "Размеры, цвета, состав, сезоны, фото и версии карточек",
          "state": "verify"
        },
        {
          "area": "Кабинет байера",
          "does": "Ролевой доступ и индивидуальные условия клиента",
          "state": "verify"
        },
        {
          "area": "Матрица B2B-заказа",
          "does": "SKU × размер × количество с проверкой ассортимента",
          "state": "verify"
        },
        {
          "area": "Коммерческие условия",
          "does": "Персональные цены, скидки, остатки и даты поставки",
          "state": "verify"
        },
        {
          "area": "Подтверждение и расчёты",
          "does": "Подтверждённый заказ, счёт и история изменений",
          "state": "next"
        },
        {
          "area": "Повторный заказ",
          "does": "Sell-through, WOS, предложение reorder и контроль отгрузки",
          "state": "next"
        }
      ],
      "note": "Commercial OS — целевая модель B2B-продаж. Публичная витрина существует; работа настоящих транзакций пока не подтверждена.",
      "deep": {
        "summary": "Marco Pescarolo Commercial OS — цифровой шоурум и будущий B2B-коммерческий контур для премиального fashion-бренда. Покупатель должен пройти путь от коллекции и размерной матрицы до подтверждённого заказа, поставки и повторного пополнения.",
        "users": [
          "Владелец / команда бренда публикует коллекцию, управляет товарами и сроками.",
          "Байер выбирает ассортимент, заполняет матрицу размеров и отправляет заказ.",
          "Менеджер бренда подтверждает наличие, условия и поставку.",
          "Частный клиент обращается отдельно без доступа к оптовым ценам."
        ],
        "workflow": [
          "Коллекция → карточка изделия → размеры, цвет, состав и сезон.",
          "Кабинет байера → персональный ассортимент → количественная матрица.",
          "Проверка цен, остатков и сроков → заказ → подтверждение сторонами.",
          "Отгрузка → история заказа → анализ продаж → возможный reorder."
        ],
        "data": [
          "Единый мастер моделей, SKU, цветов, размеров, фото и сезонности.",
          "Профиль клиента и разграничение частных и оптовых условий.",
          "Версии персональных прайсов, резервы наличия и даты доступности.",
          "Состояния заказа, подтверждения, счета, поставки и истории изменений."
        ],
        "economics": [
          "Гипотеза: сократить время заказа и ручную переписку между байером и менеджером.",
          "Уменьшать ошибки размерных матриц и расхождения по коммерческим условиям.",
          "Повторное пополнение планировать на реальном sell-through и доступности.",
          "Экономический эффект, доходы и активность покупателей пока не доказаны."
        ],
        "governance": [
          "Один товарный мастер должен питать витрину и заказ.",
          "Байер видит только согласованные цены и доступный ассортимент.",
          "Не показывать неподтверждённые цены или склад как live.",
          "Заказ не считается сделкой без проверяемого подтверждения."
        ],
        "proof": [
          "Публичная витрина на Netlify доступна.",
          "Модель end-to-end luxury showroom и white-label commerce описана.",
          "Реальный товарный каталог, матрица, права и заказная транзакция требуют отдельной приёмки."
        ],
        "next": [
          "Сверить полные исходники с текущим развёрнутым сайтом.",
          "Заполнить достоверный каталог и протестировать размерную матрицу.",
          "Проверить персональные цены и права оптового покупателя.",
          "Пройти одну настоящую заявку до подтверждения и отгрузки, затем reorder."
        ]
      },
      "visual": {
        "architecture": [
          {
            "label": "КОЛЛЕКЦИЯ",
            "items": [
              "Каталог",
              "Карточка изделия",
              "SKU и размеры"
            ]
          },
          {
            "label": "КОММЕРЦИЯ",
            "items": [
              "Байер и прайс",
              "Матрица заказа",
              "Подтверждение"
            ]
          },
          {
            "label": "ИСПОЛНЕНИЕ",
            "items": [
              "Поставка",
              "Sell-through",
              "Повторный заказ"
            ]
          }
        ],
        "workflow": [
          "Открыть коллекцию",
          "Выбрать модель",
          "Заполнить размеры",
          "Проверить условия",
          "Подтвердить заказ",
          "Контролировать поставку",
          "Повторить"
        ],
        "kpi": [
          {
            "label": "Выбор",
            "metrics": [
              "Просмотры коллекций",
              "Глубина ассортимента",
              "Добавления в матрицу"
            ]
          },
          {
            "label": "Заказ",
            "metrics": [
              "Завершение матрицы",
              "Время подтверждения",
              "Ошибки SKU и цены"
            ]
          },
          {
            "label": "Повторные продажи",
            "metrics": [
              "Sell-through",
              "WOS",
              "Доля reorder"
            ]
          }
        ],
        "matrix": [
          {
            "pilot": "Каталог",
            "pass": "Карточка SKU содержит проверенные размеры, состав, сезон и изображения"
          },
          {
            "pilot": "Доступ байера",
            "pass": "Каждый клиент видит только свой согласованный ассортимент и цену"
          },
          {
            "pilot": "Матрица заказа",
            "pass": "Количество × размер сохранены и подтверждены обеими сторонами"
          },
          {
            "pilot": "Повторный заказ",
            "pass": "Основание reorder восстанавливается из реальных продаж и остатков"
          }
        ],
        "roadmap": [
          {
            "phase": "P0",
            "label": "Проверить опубликованный showroom",
            "state": "now"
          },
          {
            "phase": "P1",
            "label": "Авторитетный каталог и прайсы",
            "state": "next"
          },
          {
            "phase": "P2",
            "label": "Матрица → заказ → поставка",
            "state": "next"
          },
          {
            "phase": "P3",
            "label": "Sell-through и reorder",
            "state": "later"
          }
        ]
      },
      "integrations": [
        "Netlify: существующая публичная витрина",
        "Источник товарного мастера и клиентов пока не подтверждён",
        "Инвентарные и бухгалтерские интеграции требуют отдельной проверки"
      ]
    },
    "en": {
      "system": [
        "Collection & assortment",
        "Buyer order grid",
        "Confirmation & delivery"
      ],
      "functions": [
        {
          "area": "Digital storefront",
          "does": "Published collection presentation and product cards on Netlify",
          "state": "built"
        },
        {
          "area": "Product master",
          "does": "Sizes, colours, composition, seasons, media and versions",
          "state": "verify"
        },
        {
          "area": "Buyer workspace",
          "does": "Account access and buyer-specific terms",
          "state": "verify"
        },
        {
          "area": "Wholesale order grid",
          "does": "SKU × size × quantity with assortment checks",
          "state": "verify"
        },
        {
          "area": "Commercial terms",
          "does": "Personal pricing, discounts, inventory and delivery windows",
          "state": "verify"
        },
        {
          "area": "Order execution",
          "does": "Bilateral confirmation, invoices and immutable change history",
          "state": "next"
        },
        {
          "area": "Replenishment",
          "does": "Sell-through, WOS, reorder proposal and shipment follow-up",
          "state": "next"
        }
      ],
      "note": "Commercial OS is the intended B2B transaction system. The public storefront exists; live commerce is not yet verified.",
      "deep": {
        "summary": "Marco Pescarolo Commercial OS is a digital luxury showroom with a planned wholesale commerce engine. The buyer journey should connect a collection, an accurate size grid, customer-specific pricing, confirmed purchase orders, delivery and later replenishment.",
        "users": [
          "Brand owners and operators publish products, collections and delivery windows.",
          "Wholesale buyers select assortment and submit quantities by size.",
          "Sales managers confirm stock, commercial terms and shipment.",
          "Invited private clients have a separate enquiry surface, not wholesale prices."
        ],
        "workflow": [
          "Collection → product details → colour, size, material and season.",
          "Authenticated buyer → approved assortment → size-grid order.",
          "Price, available stock and delivery checks → bilateral confirmation.",
          "Fulfilment → order history → sell-through feedback → possible reorder."
        ],
        "data": [
          "Versioned canonical product master with SKU, sizes, colours and media.",
          "Customer role and buyer-specific price-list authority.",
          "Inventory / delivery-date evidence, reservations and order states.",
          "Confirmation, invoice, shipment and reorder history."
        ],
        "economics": [
          "Hypothesis: fewer manual buyer-manager exchanges and faster order confirmation.",
          "Reduce order-grid errors and mismatched commercial terms.",
          "Trigger replenishment using verified sell-through and availability.",
          "No claimed realised sales, adoption or ROI before a pilot."
        ],
        "governance": [
          "One product master must power both presentation and ordering.",
          "Buyer-specific prices and assortments are access-controlled.",
          "Unverified prices and inventory cannot be represented as live.",
          "An order is not a deal before explicit, auditable confirmation."
        ],
        "proof": [
          "A public Netlify showroom is accessible.",
          "The white-label wholesale workflow is defined.",
          "Actual product, customer permissions and order transaction are not yet independently verified."
        ],
        "next": [
          "Reconcile deployed site with the source code.",
          "Load a reliable product catalogue and validate size-grid interaction.",
          "Test per-buyer pricing and protected customer access.",
          "Verify a real buyer request through confirmation, delivery and reorder."
        ]
      },
      "visual": {
        "architecture": [
          {
            "label": "COLLECTION",
            "items": [
              "Catalogue",
              "Product master",
              "SKUs and sizes"
            ]
          },
          {
            "label": "COMMERCE",
            "items": [
              "Buyer and prices",
              "Order grid",
              "Confirmation"
            ]
          },
          {
            "label": "EXECUTION",
            "items": [
              "Delivery",
              "Sell-through",
              "Reorder"
            ]
          }
        ],
        "workflow": [
          "Browse collection",
          "Select styles",
          "Fill size grid",
          "Verify terms",
          "Confirm order",
          "Track delivery",
          "Reorder"
        ],
        "kpi": [
          {
            "label": "Selection",
            "metrics": [
              "Product discovery",
              "Assortment depth",
              "Grid adds"
            ]
          },
          {
            "label": "Order",
            "metrics": [
              "Grid completion",
              "Confirmation time",
              "SKU/price errors"
            ]
          },
          {
            "label": "Replenishment",
            "metrics": [
              "Sell-through",
              "Weeks of supply",
              "Reorder share"
            ]
          }
        ],
        "matrix": [
          {
            "pilot": "Catalogue",
            "pass": "Each SKU has verified sizes, composition, season and media"
          },
          {
            "pilot": "Buyer access",
            "pass": "Each buyer sees only their approved prices and assortment"
          },
          {
            "pilot": "Order grid",
            "pass": "Quantities by SKU and size persist and reach bilateral confirmation"
          },
          {
            "pilot": "Reorder",
            "pass": "Proposal reconciles to actual sell-through and available stock"
          }
        ],
        "roadmap": [
          {
            "phase": "P0",
            "label": "Verify public showroom",
            "state": "now"
          },
          {
            "phase": "P1",
            "label": "Authoritative catalogue and prices",
            "state": "next"
          },
          {
            "phase": "P2",
            "label": "Grid → confirmed order → delivery",
            "state": "next"
          },
          {
            "phase": "P3",
            "label": "Sell-through and reorder",
            "state": "later"
          }
        ]
      },
      "integrations": [
        "Existing public Netlify storefront",
        "Authoritative product and customer data source not yet verified",
        "Live inventory and accounting connectors need independent acceptance"
      ]
    }
  }
};
