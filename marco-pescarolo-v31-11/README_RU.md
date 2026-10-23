# Marco Pescarolo | Commercial OS v31.11 (STAGED)

**23 октября 2026 · Production HOLD · Бесплатная инфраструктура · Git branch `marco-pescarolo-v31-11-commercial-os`**

## Реально реализовано

- **Отдельный коммерческий воркспейс** `index.html` / `commercial-os.html` с дизайн-системой quiet Italian luxury: теплый костяной фон, графит, бордовые акценты, редакционная шрифтовая иерархия, тонкие разделители, точные отступы, поддержка клавиатуры и reduced motion.
- **RU / EN / IT** на клиенте. Адаптивные 375 / 768 / 1440, таблицы с горизонтальной прокруткой, сценарный калькулятор.
- **Реальная аутентификация** по Supabase Auth password token API (при условии настройки публичного ключа и существующих пользователей). Нет локального демо-входа, ролей из переключателя и сервисного ключа. Сессия в оперативной памяти: перезагрузка требует повторного входа.
- **Роли только с сервера** `mp_my_access` -> Admin, Wholesale (конкретный store_id), Private. Неоднозначные или пустые buyer-привязки скрыты. Несовпадение client/store/order/delivery в ответах блокирует рендер.
- **Readonly RPC allowlist**: `mp_my_access`, `mp_client_snapshot`, `mp_client_delivery_ledger`, `mp_client_issued_proformas`, `mp_admin_snapshot`, `mp_admin_money_evidence`, `mp_admin_fulfillment_queue`. Никакие финансовые/складские мутации не разрешены из v31.11. Запросы с bearer token; никакого service_role, client-side secret, localStorage, sessionStorage.
- **Детерминированная математика** `core/commerce-engine.mjs`: BigInt minor currency units без floating-point для денежных сумм, line snapshot audit, подсчет исполнения по подтвержденным POD, раздельно verified/submitted evidence, валютные финансы, проверка недостающей COGS, sell-through / GMROI и 4-недельный WMA reorder (MOQ, multiples, lead и safety weeks).
- **Сценарное планирование** не производит реальные изменения в БД и не называется статистическим прогнозом. Booked GMV / подтверждения оплаты / доставка / признанная выручка разделены, признание выручки не заявляется.
- **Экспорт CSV только видимых строк** с защитой от CSV formula injection.

## Принципиальные ограничения

1. **Конфигурация по умолчанию заблокирована**: `client/runtime-config.js` содержит `window.MP_COMMERCE_CONFIG = null;`. В нём допускаются только URL Supabase и `sb_publishable_...`. Никаких секретных ключей. До отдельного допуска backend v9 **запрещено** подключать frontend к production Supabase.
2. **Нет реальных аккаунтов**: Supabase на предыдущем live-аудите имела `auth.users=0`, активных участников и администраторов `0`. Поэтому полноценный вход и сквозной цикл с настоящими JWT пока не верифицированы.
3. **Полный backend v9 не применялся**: изоляция Paris/Dubai в RPC `mp_client_snapshot` и `mp_client_delivery_ledger` всё еще должна пройти PostgreSQL 17 isolated clone / RLS / signed JWT admission. Эта read-only UI-витрина проверяет ответы повторно, но не может сама исправить потенциальную утечку через server RPC.
4. **Права на SKU и медиа** не готовы к коммерческому показу: brand_verified, цены Private и лицензионный статус media остаются отдельными допускными рубежами.
5. **Нет mutation flow**: интерактивное оформление, ревизии, proforma issue, verified payment, shipment split, carrier POD и reorder approvals внедряются только после backend P0 и server-side audit. Сейчас это честный read-only dashboard и независимый сценарный калькулятор.
6. **Старый public showroom неизменен**, остается отдельным демо/концептом. Новый интерфейс — автономный компонент ветки, ещё не production build. Не выдавать screenshots of synthetic QA fixtures за реальных пользователей.

## Воспроизводимая приёмка

```bash
cd marco-pescarolo-v31-11
node --test tests/*.test.mjs
python3 -m pip install playwright==1.56.0
python3 -m playwright install --with-deps chromium
python3 qa/browser_qa.py
```

Локально: 74/74 новых Node.js контрактных тестов прошли. Наследуемые v10: 266/268 локальных pytest (2 пропуска при отсутствии независимого PostgreSQL). **Эти наборы не заменяют живую PostgreSQL/JWT/browser admission.**

GitHub Actions: `.github/workflows/marco-pescarolo-v31-11-qa.yml`; статический безопасный предпросмотр публикуется как CI-артефакт, не как рабочий Netlify сайт. Браузерные снимки должны иметь явную подпись **SYNTHETIC FIXTURES — NOT LIVE BUSINESS DATA**.

## Архитектура и следующий рубеж

```
Supabase Auth / signed JWT
     |
mp_my_access (role / tenant / client / store from PostgreSQL)
     |
CommercialGateway (read-only RPC allowlist, memory-only session)
     |
Strict store/client verification for received payloads
     |
Business math (exact money, POD evidence, grouped currencies, reorder scenario)
     |
Private / Wholesale / Admin luxury UI (RU/EN/IT)
```

**P0**: точный клонированный PostgreSQL 17 + восемь миграций v9 + RLS/SECURITY DEFINER/PARIS-DUBAI/Auth JWT. **P1**: настоящие пользователи, связанный catalog data, права на SKU/media, реальные mutation RPC, browser E2E. **P2**: конкурентность оплат и отгрузок, reorder, sell-through, sizing feedback, журнал решений, аудиторские доказательства.

Никаких изменений Netlify production и действующей Supabase; новых платных ресурсов не создавалось.
