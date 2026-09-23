/* Весь текст страницы живёт здесь. RU и EN пишутся параллельно, а не переводом. */

export const T = {
  ru: {
    langName: 'RU',
    nav: { consulting: 'Консалтинг', projects: 'Проекты', news: 'Лента', media: 'Публикации', contact: 'Связаться', toTop: 'Наверх' },
    hero: {
      eyebrow: 'Фэшн-консалтинг и продуктовые проекты',
      name: 'Пётр Федин',
      lead: 'Стратегия, экономика и трансформация фэшн-бизнеса. Помогаю собственникам видеть экономику решения до того, как оно станет закупкой, запасом и потраченным капиталом.',
      ctaConsulting: 'Консалтинг',
      ctaProjects: 'Проекты',
      ctaFeed: 'Лента',
      ctaContact: 'Связаться',
      bio: 'Работаю на стыке стратегии, коммерции, продукта, данных и капитала — от рынка и коллекции до запаса и денег.',
      role: 'С 2017 года руковожу аналитикой закупок в крупнейшем luxury-ритейлере России. До этого — прикладная аналитика и закупочная логистика в федеральной кооперативной системе.',
      creds: [
        { n: '500+', l: 'брендов в портфеле' },
        { n: '30 000+', l: 'SKU за сезон' },
        { n: '12', l: 'аналитиков в команде' }
      ],
      factsTitle: 'Релевантный опыт',
      facts: [
        {
          id: 'buying', n: 'Закупка и ассортимент',
          l: 'Мультибрендовая розница: бюджет закупки, матрица, прогноз спроса, распределение, уценка',
          lead: 'Закупка как система возврата капитала, а не как заявка поставщику.',
          does: [
            'Бюджет закупки и лимиты по брендам, категориям и каналам',
            'Ассортиментная матрица, размерная сетка, глубина и ширина',
            'Прогноз спроса и пересчёт по факту продаж и остаткам',
            'Распределение, пополнение и перемещения между площадками',
            'Правила уценки и вывода позиций из ассортимента',
            'Обязательное обоснование заказа до оплаты',
            'Управленческая отчётность и инструменты для аналитиков'
          ],
          gives: [
            'Понятные правила: что покупаем, сколько, когда и почему',
            'Заказ, защищённый цифрами до того, как стал деньгами',
            'Регулярный цикл пересчёта вместо разовых героических отчётов'
          ],
          results: [
            '90% отчётности автоматизировано',
            'Согласование заказов втрое быстрее',
            'Доля прибыльных позиций +20%',
            'Продаваемость сезонных групп +8 п.п.',
            'Избыточные остатки −10%',
            'Валовая рентабельность запаса +23%',
            'Оборачиваемость позиции в днях −34%',
            'Закупочная маржа +3 п.п.',
            'Из сезона исключается 1000–1200 неэффективных позиций',
            'Повторяемость ошибок −66%',
            'Ошибки в управленческой отчётности −90%',
            'Точность данных для отчётности +70%',
            'Управленческий отчёт — с 2–3 дней до 10 минут',
            '−150 часов ручного труда в месяц',
            'Оперативных задач на аналитика ×3'
          ]
        },
        {
          id: 'product', n: 'Продукт и производство',
          l: 'Премиальный сегмент: себестоимость, спецификации, размещение заказа, сроки поставщиков',
          lead: 'Путь от эскиза до отгрузки, собранный в одну управляемую цепочку.',
          does: [
            'Экономика заказа и реальная себестоимость изделия',
            'Спецификации, образцы, технические пакеты, версии и согласования',
            'Размещение заказа, мощности и сроки поставщиков',
            'Контроль качества и приёмка партий',
            'Связка продуктовых данных с продажами и запасом',
            'Связь продуктовых данных с продажами и запасом'
          ],
          gives: [
            'Себестоимость, которую видно до запуска, а не после',
            'Ранние сигналы о срыве сроков и качества',
            'Одна версия продуктовых данных вместо писем и таблиц'
          ],
          results: [
            'Себестоимость изделия видна до запуска производства',
            'Спецификации, образцы и версии собраны в одном месте',
            'Сроки поставщиков под контролем, срывы видны заранее',
            'Продуктовые данные связаны с продажами и запасом',
            'Приёмка партий по единым правилам',
            'Переход от таблиц к регулярному управлению'
          ]
        },
        {
          id: 'capital', n: 'Рынки и финансы',
          l: 'Оценка рынка и конкурентов, финансовая модель, потребность в деньгах, материалы для инвестора',
          lead: 'Решение о росте, посчитанное до того, как оно стало обязательством.',
          does: [
            'Оценка рынка, конкурентной среды и географии роста',
            'Модель входа: ассортимент, цена, канал, партнёр',
            'Финансовая модель: прибыль, денежный поток, оборотный капитал',
            'Расчёт потребности в финансировании и сценарии',
            'Материалы для переговоров с инвестором, банком или покупателем',
            'Оценка готовности бизнеса к сделке'
          ],
          gives: [
            'Обоснованный ответ «идти или не идти» с ценой вопроса',
            'Понятная потребность в деньгах и сроки их возврата',
            'Пакет документов, с которым можно выходить на переговоры'
          ],
          results: [
            'Решение о новом рынке принято по расчёту',
            'Потребность в финансировании защищена',
            'Отказ от направления, не прошедшего расчёт',
            'Экономика сделки посчитана до переговоров',
            'Одна финансовая модель на всю компанию',
            'Оценка бизнеса готова к переговорам'
          ]
        },
        {
          id: 'turnaround', n: 'Стабилизация',
          l: 'Ликвидность, приоритеты, процессы и роли, контроль плана и факта, возврат к росту',
          lead: 'Возвращение управляемости, когда решения запаздывают, а деньги кончаются.',
          does: [
            'Кассовый календарь и управление ликвидностью',
            'Приоритеты: что останавливаем, что финансируем, что ускоряем',
            'Процессы, роли и права решений',
            'Короткий цикл план → факт → действие',
            'Координация функций и сложные переговоры с партнёрами',
            'Контроль исполнения до выхода на устойчивый режим'
          ],
          gives: [
            'Ответ на вопрос «кто и что решает» в письменном виде',
            'Решения принимаются вовремя, а не после факта',
            'Понятный критерий, когда режим стабилизации закончился'
          ],
          results: [
            'Платежи выстроены в кассовый календарь',
            'Список остановок согласован и исполнен',
            'Права решений закреплены письменно',
            'Цикл план — факт — действие: одна неделя',
            'Решения принимаются на встрече, не в чате',
            'Задан критерий выхода из стабилизации'
          ]
        }
      ],
      photoAlt: 'Пётр Федин'
    },
    consulting: {
      title: 'Консалтинг',
      subtitle: 'Работаю до управленческого решения и рабочего инструмента, а не до отчёта.',
      decisionLabel: 'Решение',
      deckOpen: 'Смотреть презентацию',
      deckPdf: 'Скачать PDF',
      deckFile: '/assets/fashion-advisory.pdf',
      items: [
        {
          title: 'Стратегический выбор',
          body: 'Рынки России, СНГ и отдельных стран Азии, позиционирование, категории, адаптация продукта и коммерческой модели.',
          decision: 'Куда выходить, что масштабировать и какой капитал потребуется.'
        },
        {
          title: 'Коммерческая модель',
          body: 'Клиенты, цены, маркетинг, розница, интернет-магазин, опт и маркетплейсы.',
          decision: 'Где бренд реально зарабатывает на клиенте и канале.'
        },
        {
          title: 'Продукт и товарное планирование',
          body: 'Коллекция, SKU, прогноз спроса, закупка, распределение, пополнение и уценка.',
          decision: 'Что покупать, производить, переоценивать и развивать.'
        },
        {
          title: 'Данные, PLM и цифровой контур',
          body: 'Процессы, роли и показатели; PLM, ERP, CRM, WMS и BI; производство, склад и логистика.',
          decision: 'Как управлять регулярно, быстрее и на одной версии данных.'
        },
        {
          title: 'Капитал и устойчивость',
          body: 'Денежный поток, оборотный капитал, оценка бизнеса, потребность в финансировании, сделки и стабилизация.',
          decision: 'Сколько капитала нужно и насколько бизнес готов к росту или сделке.'
        }
      ]
    },
    projects: {
      title: 'Наши проекты',
      subtitle: 'Syntha — основной: операционная система фэшн-бренда. ChatX вырос из работы над ней как рабочий контур команды и стал самостоятельным продуктом, который мы готовим к рынку. Renova — экспериментальный: проверяем подход там, где решения принимают вообще без цифр. Общее у всех одно — человек решает о деньгах, не видя полной картины. В каждый можно войти пользователем, партнёром или инвестором.',
      open: 'Подробнее',
      statusBtn: 'Стадия',
      newsBtn: 'Новости',
      play: 'Запустить видео',
      newsEmpty: 'По этому проекту публикаций пока нет.',
      discuss: 'Обсудить участие',
      labels: { what: 'Что это', who: 'Для кого', why: 'Зачем', how: 'Как устроено' },
      viewer: { zoomIn: 'Увеличить', zoomOut: 'Уместить', prev: 'Предыдущий экран', next: 'Следующий экран' },
      status: { title: 'Текущая стадия проекта', done: 'Сделано', now: 'В работе', next: 'Дальше', seeking: 'Что ищем' },
      collabTitle: 'Как можно участвовать',
      collabNote: 'Детали архитектуры и дорожную карту показываем предметно — при знакомстве и под соглашение о неразглашении.'
    },
    area: {
      doesLabel: 'Что входит в работу',
      givesLabel: 'Что остаётся у вас',
      resultsLabel: 'Достижения и результаты',
      note: 'Результаты моей управленческой практики. Названия компаний и клиентов не раскрываются.',
      blocks: [
        {
          title: 'Аналитический контур закупки',
          body: 'Построил BI-контур от бюджета и лимита закупки до анализа отдельной позиции: продаваемость, валовая рентабельность запаса, маржа, оборачиваемость, остатки.',
          results: ['90% отчётности автоматизировано', 'Согласование заказов втрое быстрее', 'Доля прибыльных позиций +20%']
        },
        {
          title: 'Адаптивное планирование закупки',
          body: 'Перевёл бюджет закупки и прогноз спроса на пересчёт по фактическим продажам, остаткам и динамике каналов — в разрезе брендов и категорий.',
          results: ['Продаваемость сезонных групп +8 п.п.', 'Избыточные остатки −10%', 'Валовая рентабельность запаса +5%']
        },
        {
          title: 'Структура закупки и стандарт обоснования',
          body: 'Перераспределил лимит закупки в пользу оборачиваемых и маржинальных категорий, ввёл обязательное обоснование каждой позиции и единый цикл до, во время и после закупки.',
          results: ['Валовая рентабельность запаса +23%', 'Оборачиваемость позиции в днях −34%', 'Из сезона исключается 1000–1200 неэффективных позиций', 'Закупочная маржа +3 п.п.', 'Повторяемость ошибок −66%']
        },
        {
          title: 'Логистика и единые данные',
          body: 'Спроектировал архитектуру логистических данных и единое хранилище по всей внешней логистике: статусы поставок, объёмы, сроки.',
          results: ['Ошибки в логистических данных −70%', 'Срок получения отчёта — с 2–3 дней до 10 минут']
        },
        {
          title: 'Инструменты и автоматизация',
          body: 'Разработал инструмент гибкой отчётности, охватывающий бюджет, динамику продаж, прогноз спроса и оценку позиций.',
          results: ['−150 часов ручного труда в месяц', 'Ошибки в отчётности −90%', 'Объём оперативных задач на аналитика ×3']
        },
        {
          title: 'Команда',
          body: 'Собрал и вёл аналитическую команду: карьерные треки, наставничество, адаптация новых сотрудников.',
          results: ['12+ аналитиков', 'Удержание 80%+', '4 аналитика выросли до уровня Senior', 'Первичная адаптация — с 3 месяцев до 1']
        }
      ]
    },
    formats: {
      title: 'Форматы работы',
      subtitle: 'Четыре формата: заранее понятно, сколько длится и что остаётся у вас.',
      more: 'Что входит →',
      stepsLabel: 'Как идёт работа',
      includesLabel: 'Что входит',
      outLabel: 'Что остаётся у вас',
      fitLabel: 'Когда подходит',
      items: [
        { n: '01', title: 'Диагностика', term: 'проектно, 4–6 недель',
          body: 'Разбираем экономику решения: где связан капитал, что тормозит рост, какие цифры расходятся.',
          out: 'На выходе: карта проблем с приоритетами, расчёты и план действий на ближайший сезон.',
          lead: 'Короткий заход, чтобы понять, где именно теряются деньги, и получить план на ближайший сезон.',
          steps: [
            'Неделя 1 — данные и периметр: продажи, запасы, закупка, каналы, деньги. Смотрю, что есть и чему можно верить.',
            'Недели 2–3 — расчёты: где связан капитал, какие категории и каналы создают вклад, а какие его съедают.',
            'Неделя 4 — гипотезы и проверка: считаем сценарии, отсекаем то, что не выдерживает цифр.',
            'Недели 5–6 — решения: карта проблем с приоритетами, расчёты и план действий.'
          ],
          includes: [
            'Разбор экономики закупки, запаса и каналов',
            'Оценка оборачиваемости, маржи и вклада по категориям',
            'Проверка данных: где расходятся цифры и почему',
            'Встречи с ключевыми людьми: закупка, финансы, коммерция',
            'Финальная сессия с собственником'
          ],
          out: [
            'Карта проблем с приоритетами и ценой вопроса',
            'Расчёты в виде файла, который остаётся у вас',
            'План действий на ближайший сезон с ответственными'
          ],
          fit: 'Подходит, когда есть ощущение, что деньги теряются, но непонятно где.'
        },
        { n: '02', title: 'Советник собственника', term: 'проектно, от 2 месяцев',
          body: 'Сопровождаю решения по закупке, ассортименту, каналам и капиталу в рабочем цикле компании.',
          out: 'На выходе: правила решений, показатели и регулярный контроль план–факт внутри команды.',
          lead: 'Регулярное сопровождение решений внутри вашего рабочего цикла — без вхождения в штат.',
          steps: [
            'Первый месяц — вхождение: разбираю текущие правила и показатели, фиксирую, что считаем успехом.',
            'Дальше — ритм: регулярные встречи под цикл закупки и планирования, разбор отклонений между ними.',
            'Ежеквартально — пересборка: что из правил сработало, что меняем на следующий цикл.'
          ],
          includes: [
            'Участие в решениях по закупке, ассортименту и каналам',
            'Правила решений и показатели, закреплённые письменно',
            'Разбор отклонений плана и факта в коротком цикле',
            'Подготовка материалов к совету директоров или инвестору',
            'Связь с командой между встречами по текущим вопросам'
          ],
          out: [
            'Правила решений, которые работают без меня',
            'Показатели и регулярный контроль внутри команды',
            'Обученная команда, а не зависимость от внешнего эксперта'
          ],
          fit: 'Подходит, когда решения принимаются, но каждый раз заново и на ощупь.'
        },
        { n: '03', title: 'Руководство программой', term: 'проектно',
          body: 'Беру на себя приоритеты, координацию функций и сложные переговоры, когда бизнес теряет управляемость.',
          out: 'На выходе: восстановленная управляемость, закреплённая ответственность и возврат к росту.',
          lead: 'Принимаю на себя управление программой, когда бизнес теряет управляемость и решения запаздывают.',
          steps: [
            'Первые недели — стабилизация: ликвидность, кассовый календарь, остановка того, что не работает.',
            'Дальше — сборка управления: приоритеты, роли, права решений, короткий цикл контроля.',
            'Затем — возврат к росту: снимаю ограничения и передаю управление команде.'
          ],
          includes: [
            'Управление ликвидностью и приоритетами расходов',
            'Пересборка процессов, ролей и прав решений',
            'Координация функций: закупка, финансы, производство, розница',
            'Сложные переговоры с поставщиками, банками и партнёрами',
            'Контроль исполнения до выхода на устойчивый режим'
          ],
          out: [
            'Восстановленная управляемость и закреплённая ответственность',
            'Понятный критерий, когда режим стабилизации закончен',
            'Передача управления команде с рабочими правилами'
          ],
          fit: 'Подходит, когда нужен не совет, а человек, который возьмёт на себя исполнение.'
        },
        { n: '04', title: 'Данные, аналитика и PLM', term: 'проектно, 2–4 месяца',
          body: 'Проектирую сквозной контур: от источников данных до панели, по которой принимают решения.',
          lead: 'Не «ещё одна система», а связка: продукт → продажи → запасы → деньги → решение.',
          steps: [
            'Аудит — какие данные есть, где они живут и чему из них можно верить.',
            'Модель данных — справочники, правила расчёта, качество и ответственность за цифры.',
            'Панель решений — показатели, отклонения и сигналы, по которым действуют, а не смотрят.',
            'Внедрение — бизнес-требования к системам, тестирование процессов, обучение команды.'
          ],
          includes: [
            'Карта источников и разрывов между системами',
            'Единая модель данных и справочники',
            'Прототип управленческой панели',
            'Требования к PLM, ERP, CRM, WMS и BI и роль каждой системы',
            'Сценарии автоматизации: прогноз спроса, сигналы по остаткам, уценка',
            'План внедрения и переход от таблиц к регулярному управлению'
          ],
          out: [
            'Целевая архитектура и бизнес-требования',
            'Модель данных, которая остаётся внутри компании',
            'Прототип панели решений и план внедрения'
          ],
          fit: 'Подходит, когда цифры не сходятся между отделами, а решения ждут отчёта.'
        }
      ]
    },
    media: {
      title: 'Публикации и выступления',
      subtitle: 'Где меня цитируют и о чём спрашивают.',
      items: [
        {
          outlet: 'Grazia', date: '2025-10-09',
          title: 'Как будет выглядеть фэшн-индустрия через 5 лет: блиц с экспертами моды',
          note: 'Комментарий по итогам BRICS+ Fashion Summit — первым среди приглашённых экспертов.',
          quote: 'Индустрия моды всё ещё опирается на интуицию и визуальное чутьё, но будущее — за данными. Побеждать будут бренды, которые соединяют креатив с точным расчётом.',
          href: 'https://www.grazia.ru/fashion/kak-budet-vyglyadet-feshn-industriya-cherez-5-let-blic-s-ekspertami-mody/'
        }
      ],
      read: 'Читать материал →'
    },
    press: {
      title: 'Для прессы и организаторов',
      subtitle: 'Всё, что нужно для программы мероприятия или комментария, — без переписки.',
      shortLabel: 'Коротко',
      short: 'Пётр Федин — эксперт по экономике и трансформации фэшн-бизнеса и основатель отраслевых IT-продуктов. Фокус: закупка, ассортимент, запас и капитал.',
      longLabel: 'Развёрнуто',
      long: 'Пётр Федин работает на стыке стратегии, коммерции, продукта, данных и капитала в фэшн-бизнесе. Многолетний управленческий опыт в крупной мультибрендовой рознице: бюджет закупки, ассортиментная матрица, прогноз спроса, маржа и оборачиваемость. Ведёт проекты операционной диагностики, стратегии роста и стабилизации управления, а также развивает собственные продукты для отрасли.',
      topicsLabel: 'Темы для выступления и комментария',
      topics: [
        'Экономика закупки и возврат капитала',
        'Бюджетирование и лимит закупки',
        'Построение аналитики: от данных к решениям',
        'Показатели, на которых держится фэшн-розница',
        'Товарное планирование и управление запасом',
        'Розничный цикл и работа с покупателем',
        'Маркетплейсы и мультиканальные продажи',
        'Фэшн-рынок России: что в нём меняется',
        'PLM и цифровой контур бренда',
        'Управление в кризисе и восстановление роста'
      ],
      photoLabel: 'Портрет для публикации',
      photoBtn: 'Скачать фото',
      copy: 'Скопировать',
      copied: 'Скопировано'
    },
    news: {
      title: 'Лента',
      subtitle: 'Коротко о том, зачем мы это делаем, кому это нужно и что меняется в проектах.',
      more: 'Показать ещё',
      channel: 'Все посты в Telegram →',
      share: 'Поделиться',
      shareIn: { tg: 'В Telegram', wa: 'В WhatsApp', copy: 'Скопировать ссылку' },
      copied: 'Ссылка скопирована',
      /* Подпись уходит вместе со ссылкой: репост должен вести к автору. */
      shareSign: 'Пётр Федин · syntha.pro',
      tags: { analysis: 'Разбор', market: 'Рынок', product: 'Продукт', syntha: 'Syntha', renova: 'Renova', chatx: 'ChatX', mission: 'Позиция', investors: 'Инвесторам', pilots: 'Пилоты' }
    },
    contact: {
      title: 'Связаться',
      subtitle: 'Напишите, какой проект интересен и в каком формате — работа в системе, партнёрство, инвестиции или консалтинг.',
      name: 'Имя',
      contact: 'Email или Telegram',
      topic: 'Тема',
      topics: { consulting: 'Консалтинг', syntha: 'Syntha', renova: 'Renova', chatx: 'ChatX', press: 'Пресса и комментарий', event: 'Выступление или участие в мероприятии', other: 'Другое' },
      message: 'Сообщение',
      file: 'Файл',
      fileHint: 'Можно приложить бриф, презентацию или таблицу — до 20 МБ',
      fileChoose: 'Выбрать файл',
      fileClear: 'Убрать',
      fileTooBig: 'Файл больше 20 МБ — пришлите ссылку или напишите в Telegram.',
      consent: 'Согласен на обработку персональных данных',
      consentLink: 'Политика',
      consentRequired: 'Без согласия на обработку данных отправить не получится.',
      send: 'Отправить',
      sending: 'Отправляю…',
      ok: 'Спасибо. Отвечу в течение рабочего дня.',
      fail: 'Не отправилось. Напишите в Telegram или WhatsApp — отвечу быстрее.',
      required: 'Заполните имя, контакт и сообщение.',
      directTitle: 'Контакты',
      vcard: 'Сохранить контакт',
      privacy: 'Конфиденциальность клиентских данных — базовый стандарт работы.'
    }
  },

  en: {
    langName: 'EN',
    nav: { consulting: 'Advisory', projects: 'Ventures', news: 'Feed', media: 'Press', contact: 'Contact', toTop: 'Back to top' },
    hero: {
      eyebrow: 'Fashion advisory & product ventures',
      name: 'Petr Fedin',
      lead: 'Strategy, economics and transformation for fashion businesses. I help owners see the economics of a decision before it turns into a purchase order, dead stock and spent capital.',
      ctaConsulting: 'Advisory',
      ctaProjects: 'Ventures',
      ctaFeed: 'Feed',
      ctaContact: 'Contact',
      bio: 'I work where strategy, commerce, product, data and capital meet — from market and collection through to inventory and cash.',
      role: 'Head of buying analytics at the largest luxury retailer in Russia since 2017. Before that — applied analytics and procurement logistics in the federal cooperative system.',
      creds: [
        { n: '500+', l: 'brands in the portfolio' },
        { n: '30,000+', l: 'SKUs per season' },
        { n: '12', l: 'analysts in the team' }
      ],
      factsTitle: 'Relevant experience',
      facts: [
        { id: 'buying', n: 'Buying and assortment',
          l: 'Multi-brand retail: open-to-buy, assortment matrix, demand forecast, allocation, markdown',
          lead: 'Buying as a system for returning capital, not as an order sent to a supplier.',
          does: ['Open-to-buy and limits by brand, category and channel', 'Assortment matrix, size curves, depth and width', 'Demand forecast recalculated from actual sales and stock', 'Allocation, replenishment and transfers between locations', 'Markdown rules and exit rules for items', 'Mandatory justification of an order before it is paid', 'Management reporting and tools for the analytics team'],
          gives: ['Clear rules: what to buy, how much, when and why', 'An order defended with numbers before it becomes money', 'A regular recalculation cycle instead of heroic one-off reports'],
          results: ['90% of reporting automated', 'Order approval three times faster', 'Share of profitable items +20%', 'Seasonal sell-through +8pp', 'Excess stock −10%', 'GMROI +23%', 'Item stock-turn days −34%', 'Buying margin +3pp', '1,000–1,200 underperforming items excluded per season', 'Recurring errors −66%', 'Management reporting errors −90%', 'Data accuracy for reporting +70%', 'Management report from 2–3 days to 10 minutes', '−150 hours of manual work a month', 'Ad-hoc task output per analyst ×3'] },
        { id: 'product', n: 'Product and production',
          l: 'Premium segment: cost, specifications, order placement, supplier lead times',
          lead: 'The path from sketch to shipment assembled into one manageable chain.',
          does: ['Order economics and true item cost', 'Specifications, samples, tech packs, versions and approvals', 'Order placement, supplier capacity and lead times', 'Quality control and batch acceptance', 'Product data linked to sales and inventory', 'Product data linked to sales and inventory'],
          gives: ['Cost visible before launch, not after', 'Early signals on slipping deadlines and quality', 'One version of product data instead of emails and spreadsheets'],
          results: ['Item cost visible before production starts', 'Specifications, samples and versions kept in one place', 'Supplier lead times under control, slippage visible early', 'Product data linked to sales and inventory', 'Batch acceptance on one set of rules', 'From spreadsheets to regular management'] },
        { id: 'capital', n: 'Markets and finance',
          l: 'Market and competitor assessment, financial model, funding requirement, investor materials',
          lead: 'A growth decision calculated before it becomes an obligation.',
          does: ['Market, competitive landscape and growth geography assessment', 'Entry model: assortment, pricing, channel, partner', 'Financial model: profit, cash flow, working capital', 'Funding requirement and scenarios', 'Materials for talks with an investor, a bank or a buyer', 'Readiness assessment for a transaction'],
          gives: ['A substantiated go or no-go with the price of the question', 'A clear funding need and a payback horizon', 'A document pack you can take into negotiations'],
          results: ['A new-market decision made on calculation rather than instinct', 'Funding need and payback defended before an outside party', 'A promising-looking direction dropped because the numbers did not hold', 'Deal economics calculated before the negotiation, not after', 'One financial model instead of several versions across departments', 'A valuation prepared in the form the other side accepts'] },
        { id: 'turnaround', n: 'Turnaround',
          l: 'Liquidity, priorities, processes and roles, plan-versus-actual control, return to growth',
          lead: 'Restoring control when decisions are late and cash is running out.',
          does: ['Cash calendar and liquidity management', 'Priorities: what to stop, fund or accelerate', 'Processes, roles and decision rights', 'A short plan → actual → action cycle', 'Cross-function coordination and difficult negotiations', 'Execution control until the business is stable'],
          gives: ['Who decides what, written down', 'Decisions made on time rather than after the fact', 'A clear criterion for when the turnaround is over'],
          results: ['Payments organised into a cash calendar weeks ahead', 'An agreed and executed list of what gets stopped', 'Decision rights written down — arguments about authority ended', 'The plan — actual — action cycle shortened to a week', 'Decisions taken in the meeting rather than in chat', 'A defined criterion for leaving turnaround mode'] }
      ],
      photoAlt: 'Petr Fedin'
    },
    consulting: {
      title: 'Advisory',
      subtitle: 'The engagement ends with a decision and a working tool, not with a report.',
      decisionLabel: 'Decision',
      deckOpen: 'View the deck',
      deckPdf: 'Download PDF',
      deckFile: '/assets/fashion-advisory-en.pdf',
      items: [
        {
          title: 'Strategic choice',
          body: 'Russia, CIS and selected Asian markets, positioning, categories, product and commercial model fit.',
          decision: 'Which market to enter, what to scale and how much capital it takes.'
        },
        {
          title: 'Commercial model',
          body: 'Customers, pricing, marketing, retail, e-commerce, wholesale and marketplaces.',
          decision: 'Where the brand actually makes money — by customer and by channel.'
        },
        {
          title: 'Product & merchandise planning',
          body: 'Collection, SKU, demand forecast, open-to-buy, allocation, replenishment and markdown.',
          decision: 'What to buy, produce, reprice and grow.'
        },
        {
          title: 'Data, PLM & systems',
          body: 'Processes, roles and KPIs; PLM, ERP, CRM, WMS and BI; production, warehouse and logistics.',
          decision: 'How to run the business on a regular cadence and a single version of the data.'
        },
        {
          title: 'Capital & resilience',
          body: 'Cash flow, working capital, valuation, funding needs, transactions and turnaround.',
          decision: 'How much capital is needed and whether the business is ready to grow or to transact.'
        }
      ]
    },
    projects: {
      title: 'Our projects',
      subtitle: 'Syntha is the main one: the operating platform for a fashion brand. ChatX grew out of building it, as the team\u2019s own working loop, and became a product we are preparing for market. Renova is the experiment: testing the approach where decisions are made with no numbers at all. One thing is common to all three — someone decides about money without seeing the whole picture. Each one is open to users, partners and investors.',
      open: 'Details',
      statusBtn: 'Stage',
      newsBtn: 'News',
      play: 'Play video',
      newsEmpty: 'No posts about this project yet.',
      discuss: 'Discuss involvement',
      labels: { what: 'What it is', who: 'Who it is for', why: 'Why', how: 'How it works' },
      viewer: { zoomIn: 'Zoom in', zoomOut: 'Fit to screen', prev: 'Previous screen', next: 'Next screen' },
      status: { title: 'Current stage', done: 'Done', now: 'In progress', next: 'Next', seeking: 'What we are looking for' },
      collabTitle: 'Ways to take part',
      collabNote: 'Architecture details and the roadmap we show in person and under an NDA.'
    },
    area: {
      doesLabel: 'What the work includes',
      givesLabel: 'What stays with you',
      resultsLabel: 'Achievements and results',
      note: 'Results from my own management practice. Company and client names are not disclosed.',
      blocks: [
        { title: 'Buying analytics', body: 'Built a BI loop from open-to-buy down to single-item analysis: sell-through, GMROI, margin, stock turn, inventory.',
          results: ['90% of reporting automated', 'Order approval three times faster', 'Share of profitable items +20%'] },
        { title: 'Adaptive buying planning', body: 'Moved open-to-buy and demand forecasting onto continuous recalculation from actual sales, stock and channel dynamics.',
          results: ['Seasonal sell-through +8pp', 'Excess stock −10%', 'GMROI +5%'] },
        { title: 'Buy structure and justification standard', body: 'Shifted open-to-buy toward high-turnover and high-margin categories, introduced mandatory justification and one pre-buy, buy and post-buy cycle.',
          results: ['GMROI +23%', 'Item stock-turn days −34%', '1,000–1,200 underperforming items excluded per season', 'Buying margin +3pp', 'Recurring errors −66%', 'Management reporting errors −90%', 'Data accuracy for reporting +70%', 'Management report from 2–3 days to 10 minutes', '−150 hours of manual work a month', 'Ad-hoc task output per analyst ×3'] },
        { title: 'Logistics and single data', body: 'Designed the logistics data architecture and a single warehouse covering all external supply flows.',
          results: ['Logistics data errors −70%', 'Report delivery from 2–3 days to 10 minutes'] },
        { title: 'Tools and automation', body: 'Built a flexible reporting tool covering budget, sales dynamics, demand forecast and item evaluation.',
          results: ['−150 hours of manual work a month', 'Reporting errors −90%', 'Ad-hoc task output per analyst ×3'] },
        { title: 'Team', body: 'Built and led an analytics team: career tracks, mentoring, onboarding.',
          results: ['12+ analysts', 'Retention 80%+', '4 analysts grew to senior level', 'Onboarding from 3 months to 1'] }
      ]
    },
    formats: {
      title: 'Ways to work together',
      subtitle: 'Four formats: you know upfront how long it takes and what stays with you.',
      more: 'What it includes →',
      stepsLabel: 'How the work goes',
      includesLabel: 'What it includes',
      outLabel: 'What stays with you',
      fitLabel: 'When it fits',
      items: [
        { n: '01', title: 'Diagnostics', term: 'project-based, 4–6 weeks',
          body: 'We take apart the economics of the decision: where capital is locked, what caps growth, which numbers disagree.',
          out: 'Output: a prioritised map of problems, the calculations and a plan for the coming season.',
          lead: 'A short engagement to find where the money leaks and to leave with a plan for the coming season.',
          steps: ['Week 1 — data and scope: sales, inventory, buying, channels, cash.', 'Weeks 2–3 — calculations: where capital is locked and which categories create contribution.', 'Week 4 — hypotheses tested against the numbers.', 'Weeks 5–6 — decisions: a prioritised map, the calculations and a plan.'],
          includes: ['Buying, inventory and channel economics', 'Stock turn, margin and contribution by category', 'Data check: where numbers disagree and why', 'Sessions with buying, finance and commerce', 'A closing session with the owner'],
          out: ['A prioritised map of problems with the price of each', 'The calculations as a file that stays with you', 'An action plan for the coming season with owners'],
          fit: 'For when it feels like money is leaking but it is unclear where.'
        },
        { n: '02', title: 'Owner advisor', term: 'project-based, from 2 months',
          body: 'I support decisions on buying, assortment, channels and capital inside your working cycle.',
          out: 'Output: decision rules, metrics and a regular plan-versus-actual review inside the team.',
          lead: 'Regular support for decisions inside your own working cycle — without joining the payroll.',
          steps: ['Month one — onboarding: current rules and metrics, agreeing what counts as success.', 'Then — cadence: regular sessions tied to the buying and planning cycle.', 'Quarterly — a reset of what worked and what changes next cycle.'],
          includes: ['Participation in buying, assortment and channel decisions', 'Decision rules and metrics written down', 'Plan-versus-actual review in a short cycle', 'Materials for the board or an investor', 'Contact with the team between sessions'],
          out: ['Decision rules that work without me', 'Metrics and regular control inside the team', 'A trained team rather than dependence on an outside expert'],
          fit: 'For when decisions get made, but from scratch and by feel every time.'
        },
        { n: '03', title: 'Programme lead', term: 'project-based',
          body: 'I take on priorities, cross-function coordination and difficult negotiations when the business loses control.',
          out: 'Output: restored manageability, assigned accountability and a return to growth.',
          lead: 'I take over the programme when the business loses control and decisions come too late.',
          steps: ['First weeks — stabilisation: liquidity, cash calendar, stopping what does not work.', 'Then — rebuilding management: priorities, roles, decision rights, a short control cycle.', 'Then — return to growth and handover to the team.'],
          includes: ['Liquidity and spending priorities', 'Rebuilt processes, roles and decision rights', 'Coordination across buying, finance, production and retail', 'Difficult negotiations with suppliers, banks and partners', 'Execution control until the business is stable'],
          out: ['Restored manageability and assigned accountability', 'A clear criterion for when the turnaround ends', 'Handover to the team with working rules'],
          fit: 'For when you need not advice but someone who takes execution on.'
        },
        { n: '04', title: 'Data, analytics and PLM', term: 'project-based, 2–4 months',
          body: 'I design the end-to-end loop: from data sources to the dashboard decisions are actually made on.',
          lead: 'Not one more system, but a chain: product → sales → inventory → cash → decision.',
          steps: ['Audit — what data exists, where it lives and which of it can be trusted.', 'Data model — reference data, calculation rules, quality and ownership.', 'Decision dashboard — metrics, deviations and signals people act on.', 'Rollout — business requirements for the systems, process testing, training.'],
          includes: ['A map of sources and the gaps between systems', 'One data model and reference data', 'A management dashboard prototype', 'Requirements for PLM, ERP, CRM, WMS and BI and the role of each', 'Automation scenarios: demand forecast, stock signals, markdown', 'A rollout plan and the move from spreadsheets to regular management'],
          out: ['Target architecture and business requirements', 'A data model that stays inside the company', 'A dashboard prototype and a rollout plan'],
          fit: 'For when numbers disagree between departments and decisions wait for a report.'
        }
      ]
    },
    media: {
      title: 'Press and speaking',
      subtitle: 'Where I am quoted and what I am asked about.',
      items: [
        {
          outlet: 'Grazia', date: '2025-10-09',
          title: 'What the fashion industry will look like in five years: a blitz with fashion experts',
          note: 'Commentary after the BRICS+ Fashion Summit — quoted first among the invited experts.',
          quote: 'Fashion still leans on intuition and visual instinct, but the future belongs to data. The winners will be brands that combine creativity with precise calculation.',
          href: 'https://www.grazia.ru/fashion/kak-budet-vyglyadet-feshn-industriya-cherez-5-let-blic-s-ekspertami-mody/'
        }
      ],
      read: 'Read the piece →'
    },
    press: {
      title: 'For press and event organisers',
      subtitle: 'Everything needed for a programme or a comment — without an email exchange.',
      shortLabel: 'Short', short: 'Petr Fedin is an expert in fashion business economics and transformation and the founder of industry IT products. Focus: buying, assortment, inventory and capital.',
      longLabel: 'Full', long: 'Petr Fedin works where strategy, commerce, product, data and capital meet in fashion. Years of management experience in large multi-brand retail: open-to-buy, assortment matrix, demand forecasting, margin and stock turn. He runs operational diagnostics, growth strategy and management turnaround projects, and builds his own products for the industry.',
      topicsLabel: 'Speaking and comment topics',
      topics: ['Buying economics and the return of capital', 'Budgeting and open-to-buy', 'Building analytics: from data to decisions', 'The metrics fashion retail actually runs on', 'Merchandise planning and inventory control', 'The retail cycle and working with the customer', 'Marketplaces and omnichannel selling', 'The Russian fashion market: what is changing', 'PLM and a brand\u2019s digital architecture', 'Managing through a crisis and returning to growth'],
      photoLabel: 'Portrait for publication', photoBtn: 'Download photo', copy: 'Copy', copied: 'Copied'
    },
    news: {
      title: 'Feed',
      subtitle: 'Short notes on why we build this, who it is for, and what changes in the projects.',
      more: 'Show more',
      channel: 'All posts on Telegram →',
      share: 'Share',
      shareIn: { tg: 'To Telegram', wa: 'To WhatsApp', copy: 'Copy link' },
      copied: 'Link copied',
      shareSign: 'Petr Fedin · syntha.pro',
      tags: { analysis: 'Analysis', market: 'Market', product: 'Product', syntha: 'Syntha', renova: 'Renova', chatx: 'ChatX', mission: 'Position', investors: 'For investors', pilots: 'Pilots' }
    },
    contact: {
      title: 'Get in touch',
      subtitle: 'Tell me which project interests you and in what format — using the system, partnership, investment or advisory.',
      name: 'Name',
      contact: 'Email or Telegram',
      topic: 'Topic',
      topics: { consulting: 'Advisory', syntha: 'Syntha', renova: 'Renova', chatx: 'ChatX', press: 'Press and comment', event: 'Speaking or event participation', other: 'Other' },
      message: 'Message',
      file: 'File',
      fileHint: 'Attach a brief, a deck or a spreadsheet — up to 20 MB',
      fileChoose: 'Choose file',
      fileClear: 'Remove',
      fileTooBig: 'The file is over 20 MB — send a link or write on Telegram.',
      consent: 'I consent to the processing of my personal data',
      consentLink: 'Policy',
      consentRequired: 'The form cannot be sent without consent to data processing.',
      send: 'Send',
      sending: 'Sending…',
      ok: 'Thank you. I will reply within one business day.',
      fail: 'Could not send. Message me on Telegram or WhatsApp — that is faster.',
      required: 'Please fill in name, contact and message.',
      directTitle: 'Contacts',
      vcard: 'Save contact',
      privacy: 'Client confidentiality is a baseline standard of the work.'
    }
  }
};

/* Проекты. device: 'ipad' | 'iphone' — определяет рамку в галерее. */
export const PROJECTS = [
  {
    id: 'syntha',
    name: 'Syntha',
    device: 'ipad',
    video: '/assets/video/syntha.webm',
    shots: ['/assets/shots/syntha-1.webp', '/assets/shots/syntha-2.webp', '/assets/shots/syntha-3.webp'],
    ru: {
      collab: [{ k: 'Пилот', v: 'Бренд или магазин работает в системе на реальном сезоне и влияет на порядок разработки.' }, { k: 'Выход на рынок', v: 'Партнёр, который знает канал и берёт на себя продажи и внедрение.' }, { k: 'Инвестиции', v: 'Обсуждаем участие в проекте — на стадии, когда продуктовый контур уже работает.' }, { k: 'Интеграция', v: 'Подключение к учётной системе бренда как отдельная проектная работа.' }, { k: 'По запросу', v: 'Демонстрация на ваших данных и сравнение по функционалу с мировыми платформами.' }],
      status: {
        done: ['Роли организации, партнёрский доступ и права', 'Цифровые шоурумы и серверные цены каталога', 'Атомарные резервы склада, контроль MOQ и доступности', 'Двустороннее подтверждение заказа и пространство сделки'],
        now: ['Производственный контур: планирование, спецификации, образцы, техпаки', 'Единый дизайн-контур для всех рабочих пространств'],
        next: ['Пилот с первым брендом', 'Интеграция с учётной системой бренда'],
        seeking: 'Бренды и магазины, готовые проработать систему и работать в ней, и партнёра по выходу на рынок.'
      },
      tagline: 'Операционная система фэшн-бренда',
      stage: 'В разработке',
      card: 'Бренды, магазины, байеры и дистрибьюторы работают в одной системе: продукт, шоурум, заказы, производство.',
      what: 'Единый контур, где сегодня работают несколько разрозненных систем. Продуктовая часть — от планирования коллекции и спецификаций до образцов, техпаков, производства и контроля качества. Коммерческая — цифровой шоурум, подборки байера, заказы, подтверждение и сделка. Обе половины живут на одних данных.',
      who: 'Брендам, розничным сетям, байерам мультибренда, дистрибьюторам и производственным партнёрам — каждому в своей роли и со своими правами.',
      why: 'Коммерческий цикл разорван: продуктовые данные в одном месте, продажи в другом, доступность в третьем. Бренд не видит, что подтверждено, магазин не уверен, что получит, а сверка идёт вручную и задним числом.',
      how: 'Мы взяли лучшее из того, чем отрасль пользуется сегодня, и достроили то, чего в этих системах нет: продуктовый контур и коммерцию в одной модели данных, цену и доступность считает сервер, подтверждение заказа двустороннее. Детали реализации — предмет разговора при знакомстве.'
    },
    en: {
      collab: [{ k: 'Pilot', v: 'A brand or retailer runs a real season in the system and shapes what we build next.' }, { k: 'Go to market', v: 'A partner who knows the channel and takes on sales and rollout.' }, { k: 'Investment', v: 'We discuss participation now that the product loop is working.' }, { k: 'Integration', v: 'Connecting the system to a brand ERP as a separate project.' }, { k: 'On request', v: 'A demo on your own data and a functional comparison with global platforms.' }],
      status: {
        done: ['Organisation roles, partner access and permissions', 'Digital showrooms and server-authoritative catalog pricing', 'Atomic inventory reservations, MOQ and availability controls', 'Bilateral order confirmation and DealSpace'],
        now: ['Production loop: planning, BOM, samples, tech packs', 'One design contract across every workspace'],
        next: ['Pilot with a first brand', 'Integration with the brand\u2019s ERP'],
        seeking: 'Brands and retailers ready to shape the system and work in it, and a go-to-market partner.'
      },
      tagline: 'The operating platform for a fashion brand',
      stage: 'In development',
      card: 'Collections, a digital showroom, buyer orders and the production loop in one system.',
      what: 'A B2B platform for brands, retailers, distributors and production partners: campaign → collection → showroom → buyer selection → order → confirmation → deal. Alongside it, the production loop: planning, BOM, measurements, samples, sourcing, tech packs, production and final quality.',
      who: 'Brands, retailers, their buying teams and production partners.',
      why: 'The commercial cycle still runs on PDF line sheets, spreadsheets and email: availability, reservations and order confirmation drift apart, and product data is kept separately from sales.',
      how: 'Price and availability are computed by the server, not a file: MOQ and available-to-sell controls, atomic inventory reservations, bilateral order confirmation, and cancellation that releases stock.'
    }
  },
  {
    id: 'chatx',
    name: 'ChatX',
    device: 'iphone',
    video: '/assets/video/chatx.webm',
    shots: ['/assets/shots/chatx-1.webp', '/assets/shots/chatx-2.webp', '/assets/shots/chatx-3.webp'],
    ru: {
      collab: [{ k: 'Ранний доступ', v: 'Компания переводит в мессенджер часть работы и получает влияние на функции.' }, { k: 'Внедрение', v: 'Партнёр, который ставит продукт в компаниях и сопровождает переход.' }, { k: 'Инвестиции', v: 'Проект готовим к выходу на рынок — обсуждаем участие на этой стадии.' }, { k: 'По запросу', v: 'Демонстрация и разбор устройства системы под соглашение о неразглашении.' }],
      status: {
        done: ['Каналы, личные сообщения, задачи, календарь и файлы', 'Аудио- и видеозвонки, запись встречи по согласию', 'Расшифровка, итоги и решения с привязкой к таймкодам'],
        now: ['Оргструктура и делегирование управления', 'Исходящие вебхуки и интеграции'],
        next: ['Пилот внутри компании-заказчика', 'Мобильное приложение поверх PWA'],
        seeking: 'Компании, готовые перевести в него свою работу, и партнёра по внедрению.'
      },
      tagline: 'Мессенджер, который закрывает работу целиком',
      stage: 'Рабочий прототип',
      card: 'Переписка, звонки, задачи, календарь, файлы, встречи и оргструктура — весь рабочий контур компании.',
      what: 'Полноценный корпоративный мессенджер, который закрывает весь спектр рабочих вопросов: каналы, группы и личная переписка, голосовые, файлы и поиск по ним, задачи и обязательства, календарь и планирование, аудио- и видеозвонки с записью, оргструктура с ролями и правами, уведомления и интеграции с внешними системами.',
      who: 'Компаниям, которым нужен собственный управляемый контур работы, а не переписка в публичном мессенджере: от небольшой команды до структуры с департаментами и отделами.',
      why: 'Работа рассыпана по нескольким сервисам: обсудили в чате, задачу завели в трекере, согласовали почтой. Через месяц никто не покажет, где решение было принято и чем закончилось.',
      how: 'Один сквозной граф: разговор → встреча → решение → задача → результат. Права проверяются на сервере, а не в интерфейсе. Встреча пишется только с согласия участников, итоги ведут к конкретной секунде записи, и ни одна задача не создаётся без подтверждения человеком.'
    },
    en: {
      collab: [{ k: 'Early access', v: 'A company moves part of its work into the messenger and shapes the feature set.' }, { k: 'Rollout', v: 'A partner who deploys the product in companies and supports the switch.' }, { k: 'Investment', v: 'We are preparing the launch and discuss participation at this stage.' }, { k: 'On request', v: 'A demo and an architecture walkthrough under an NDA.' }],
      status: {
        done: ['Channels, direct messages, tasks, calendar and files', 'Audio and video calls, consent-based recording', 'Transcript, summary and decisions anchored to timecodes'],
        now: ['Org structure and delegated management', 'Outbound webhooks and integrations'],
        next: ['Pilot inside a client company', 'A mobile app on top of the PWA'],
        seeking: 'Companies ready to move their work into it, and an implementation partner.'
      },
      tagline: 'Corporate workspace',
      stage: 'Working prototype',
      card: 'Channels, tasks, calendar, files and calls in one loop — from conversation to outcome.',
      what: 'A company workspace: channels and direct messages, tasks, calendar, files, voice messages and audio-video calls with meeting intelligence built in.',
      who: 'Companies that need their own governed communication and execution loop rather than threads in a public messenger.',
      why: 'Decisions get lost between chat, the task tracker and email. Nobody can show where a decision was made or how it ended.',
      how: 'A meeting is recorded only with every participant’s consent, the transcript and summary are anchored to timecodes, and an AI-proposed action becomes a real task only after a human confirms it.'
    }
  },
  {
    id: 'renova',
    name: 'Renova',
    device: 'iphone',
    video: '/assets/video/renova.webm',
    shots: ['/assets/shots/renova-1.webp', '/assets/shots/renova-2.webp', '/assets/shots/renova-3.webp'],
    ru: {
      collab: [{ k: 'Заказчик', v: 'Ведёте в приложении свой ремонт и говорите, чего в нём не хватает.' }, { k: 'Мастер или бригада', v: 'Работаете на реальном объекте: сметы, сроки, приёмка.' }, { k: 'Ремонтная компания', v: 'Проверяем подход на потоке объектов, а не на одном.' }, { k: 'По запросу', v: 'Демонстрация и выводы, которые мы получили на этом проекте.' }],
      status: {
        done: ['Смета по нормам, версии и сравнение плана с фактом', 'Этапы работ, приёмка и фотофиксация', 'Платежи по этапам, проверка чеков и статуса самозанятого через ФНС'],
        now: ['Участники проекта и передача лида в работу', 'Устойчивость операций при потере связи'],
        next: ['Сборка в TestFlight и закрытый тест', 'OAuth «Мой налог»'],
        seeking: 'Мастеров и бригады, а также заказчиков — готовых проработать приложение и вести на нём реальный объект.'
      },
      tagline: 'Ремонт под контролем заказчика',
      stage: 'MVP, подготовка к запуску',
      card: 'Заказчик ведёт весь ход работ, видит деньги и сроки и решает все вопросы с мастерами в одном месте.',
      what: 'Приложение, в котором заказчик ведёт объект целиком: смета и её изменения, этапы работ с приёмкой, деньги и платежи, расходники и документы. Вся переписка с исполнителями идёт здесь же и привязана к конкретному этапу, а не теряется в мессенджере.',
      who: 'Собственникам, которые делают ремонт, и мастерам и бригадам, которые его ведут: у каждого свой экран и своя ответственность.',
      why: 'Ремонт живёт в переписке и чеках в кармане: смета расходится с фактом, перерасход всплывает в конце, спросить не у кого, а легальность исполнителя ничем не подтверждена.',
      how: 'Каждое действие пересчитывает цифры, оплата привязана к принятому этапу, чеки и статус исполнителя проверяются в официальных источниках. Заказчик в любой момент видит, сколько потрачено, что идёт сейчас и что будет дальше.'
    },
    en: {
      collab: [{ k: 'Client', v: 'Run your own renovation in the app and tell us what is missing.' }, { k: 'Contractor or crew', v: 'Work a real site: estimates, schedule, handover.' }, { k: 'Renovation company', v: 'We test the approach across a flow of sites rather than one.' }, { k: 'On request', v: 'A demo and the conclusions this project has produced.' }],
      status: {
        done: ['Norm-based estimates, versions and plan vs actual', 'Work stages, acceptance and photo evidence', 'Stage payments, receipt and self-employed status checks via the tax service'],
        now: ['Project participants and lead-to-work conversion', 'Operation resilience on connection loss'],
        next: ['TestFlight build and a closed test', 'Tax-service OAuth'],
        seeking: 'Contractors and crews, and clients too — ready to shape the app and run a real project on it.'
      },
      tagline: 'Renovation that runs on numbers',
      stage: 'MVP, preparing for launch',
      card: 'An app that answers, at any point: how much has been spent, what is happening now, and what comes next.',
      what: 'A mobile renovation-management platform: norm-based estimates, work stages with acceptance, stage-by-stage payments, materials tracking, and receipt and self-employed status verification through the tax service.',
      who: 'Owners running a renovation, and the self-employed contractors and crews doing the work.',
      why: 'Renovation lives in chat threads and receipts in a pocket: the estimate drifts from actuals, overspend surfaces at the end, and the contractor\u2019s legal status is backed by nothing.',
      how: 'Every action recalculates the numbers: plan against actual, an alert on overspend, payment tied to an accepted stage, receipts verified by QR, and a contractor rating built from deadlines, budget, quality and receipts.'
    }
  }

];

export const CONTACTS = [
  { label: { ru: 'WhatsApp', en: 'WhatsApp' }, value: '+7 977 578 16 85', href: 'https://wa.me/79775781685' },
  { label: { ru: 'Telegram', en: 'Telegram' }, value: '@sheqel', href: 'https://t.me/sheqel' },
  { label: { ru: 'Канал проектов', en: 'Project channel' }, value: '@syntha_pro', href: 'https://t.me/syntha_pro' }
];
