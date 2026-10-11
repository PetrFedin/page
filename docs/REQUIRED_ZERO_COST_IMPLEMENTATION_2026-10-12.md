# page — обязательные доработки / zero-new-cost execution

Snapshot: 2026-10-12. State: REQUIRED, not proof of implementation.

Canon: `README.md`, PR #4 и публичный сайт syntha.pro.

| ID | P | Требуемое действие | Сквозная связь | Definition of Done |
|---|---|---|---|---|
| PAG-ZC-01 | P0 | Сделать 10 проектных карточек полноценными | Projects → rich description → functionality tables → product routes | все 10 карточек реальны, релевантны, без чужих клиентов/фальшивых кейсов; нет скриншотов незавершённых проектов |
| PAG-ZC-02 | P0 | Редакционная/визуальная корректура | «Что подготовить для старта» → typography → mobile responsive → RU/EN | внутри блока нет жирных выделений, единый ритм, нет Yanina/MVST в публичной продуктовой витрине |
| PAG-ZC-03 | P0 | Подтвердить публикацию и маршруты | PR #4 CI → merge approval → live exact SHA → syntha.pro | desktop/mobile screen evidence, no dead links and correct QR |
| PAG-ZC-04 | P1 | Вернуть редакционный календарь с 2 октября | draft content → fact-check → editorial approval → site/Telegram channels | проверяемый календарь, исключить автопубликацию и выдуманные новости/кейсы |

## Обязательный нулевой бюджет и безопасная передача
- Дополнительная стоимость внедрения/эксплуатации нового контура: **0 ₽**. Запрещено включать биллинг, pay-as-you-go, платные CI minutes/API/AI/БД/storage, платные публикации, платные провайдеры, приобретать серверы/домены или выполнять реальные платежи. Уже существующая инфраструктура не доказывает нулевой совокупной стоимости; фиксировать только **incremental cost**.
- Только локальные/open-source инструменты и **доказанные** свободные остатки бесплатных тарифов. Если бесплатные лимиты/учётная запись не проверены: `BLOCKED_NO_FREE_CAPACITY`.
- Не заменять production demo-приложением; не подключать чужие БД; не записывать секреты в GitHub; не обходить CI, review, migrations и RBAC.
- Сначала проверить latest main/PR/CI, затем взять первое доступное P0. Для каждой задачи: implementation files, exact SHA, passing unit+negative+browser/device tests, persistence/restore evidence где применимо, live deployed SHA где нужен, ledger стоимости, статус `PLANNED/IN_CODE/CI_PASS/LIVE_VERIFIED/BLOCKED`.
- Этот файл — **дополнение** к существующему authoritative technical specification / AGENTS.md, а не замена. Не утверждать внедрение на основании создания документа.

Следующий агент: продолжай с первого открытого P0, **делай код и тесты**, не создавай одни планы. В конце обнови issue/PR с evidence и источник истины проекта; merge — только по существующим политикам.
