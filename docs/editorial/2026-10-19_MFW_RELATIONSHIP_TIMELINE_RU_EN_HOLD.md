# MFW / BFS — after the event / После события

**HOLD — draft only, 2026-10-19.** Proposed for isolated V2 landing and @syntha_pro; no date assigned. Text-only: no event imagery, logos or identifiable people. No official organiser endorsement claimed.

## Landing — RU

### MFW / BFS: цифровая платформа должна помнить не только программу события

Афиша и регистрация решают задачу одного дня. Для долгосрочной работы с брендами важнее проследить путь от первого контакта до следующего подтверждённого действия, не выдавая интерес за продажу.

В исходном проекте MFW описаны два разных опыта: показы, коллекции и аудитория MFW; сессии, делегаты и деловые контакты BFS. Общая инфраструктура не означает одинаковый дизайн или готовое внешнее внедрение. [1]

В основной ветке есть read-only Brand Relationship Timeline. Для события учитываются источник, время и класс доказательств; интерес, встреча и лид не равны выручке. Подтверждённому коммерческому результату требуются ссылка на заказ и отдельное доказательство. [2]

Дальнейшая интеграция находится в **Draft PR #35**, не в main. Production PostgreSQL Phase 0 остаётся заблокированным. Один responsive-сценарий проверки Made не прошёл на семи размерах экранов: ожидаемый badge не появился. Причину ещё нужно установить; полная релизная готовность не подтверждена. [3][4]

Главный принцип — сохранять проверяемую последовательность «интерес → встреча → follow-up», а не рисовать конверсию без фактов. Никаких заявлений о реальной выручке, внедрении у организатора или измеренном эффекте здесь нет.

## Landing — EN

### MFW / BFS: a platform should remember more than the event agenda

An agenda and a registration flow serve a particular event day. Long-term brand relationships require a traceable path from first contact to the next evidenced action, without calling interest a sale.

The MFW source describes two distinct experiences: shows, collections and audiences for MFW; sessions, delegates and business contacts for BFS. Shared infrastructure does not imply identical design or a verified external deployment. [1]

The default branch includes a read-only Brand Relationship Timeline. Its events carry sources, timestamps and evidence classes; an interest, a meeting or a lead is not treated as revenue. A verified commercial result needs an order reference and separate supporting evidence. [2]

Broader integration remains in **Draft PR #35**, outside main. Production PostgreSQL Phase 0 admission is blocked. A responsive test failed on seven device sizes when an expected Made roster-verification badge did not appear; the root cause is still undetermined. Full release readiness cannot be claimed. [3][4]

The design principle is to preserve an inspectable path — interest → meeting → follow-up — instead of presenting unsupported conversion claims. No actual sales, organiser adoption or measured commercial outcome is asserted.

## Telegram — RU

**MFW / BFS: работа с аудиторией не заканчивается событием.** История контакта должна связывать интерес, встречу и следующее действие с источником доказательств. В коде есть read-only Brand Relationship Timeline, но серверный PostgreSQL-допуск пока заблокирован, а Draft PR #35 не прошёл весь responsive QA. Это направление разработки, не доказанный коммерческий релиз. [MFW](https://github.com/PetrFedin/MFW) · [PR #35](https://github.com/PetrFedin/MFW/pull/35).

## Telegram — EN

**MFW / BFS: audience relationships continue beyond event day.** Interest, meetings and follow-up should be traceable to evidence. The source contains a read-only Brand Relationship Timeline, but PostgreSQL admission is blocked and Draft PR #35 did not pass all responsive QA. This is a development case, not proof of commercial production. [MFW](https://github.com/PetrFedin/MFW) · [PR #35](https://github.com/PetrFedin/MFW/pull/35).

## Source and media gate

[1] [README at main SHA 7a2e7b98f9192862cbafe638cc3732c2db4f0f01 (2026-10-11)](https://github.com/PetrFedin/MFW/blob/7a2e7b98f9192862cbafe638cc3732c2db4f0f01/README.md). [2] [Merged PR #15: Timeline, 2026-10-08](https://github.com/PetrFedin/MFW/pull/15). [3] [CURRENT_STATE: migrations 001–025, Phase 0 blocked](https://github.com/PetrFedin/MFW/blob/7a2e7b98f9192862cbafe638cc3732c2db4f0f01/CURRENT_STATE.md); [Draft PR #35 head b0b2e412e1fe083f95c38d4a76c16202238cf6a2, 2026-10-18](https://github.com/PetrFedin/MFW/pull/35). [4] [Failing responsive workflow 39161614246](https://github.com/PetrFedin/MFW/actions/runs/39161614246). The repo lists external media sources but **does not grant republication licences**. No third-party media embedded. Requires human factual, brand/affiliation, IP/privacy, translation and separate publishing clearance.
