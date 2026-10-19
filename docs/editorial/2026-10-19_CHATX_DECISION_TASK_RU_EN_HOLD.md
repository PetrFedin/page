# ChatX — решение и задача / Decisions and tasks

**STATUS: HOLD. Prepared 2026-10-19. Not published or scheduled.** Proposed: V2 professional landing and @syntha_pro. Text only, no embedded media. This topic differs from the existing ChatX wiki (2026-09-30) and reply-suggestion (2026-09-28) posts.

## Landing — RU

### ChatX: решение на встрече должно оставаться связанным с исполнением

После встречи часто остаются два следа: принятое решение и задача в другом рабочем разделе. Без проверяемой связи сложнее установить, кто подтвердил действие, чем оно обосновано и где искать результат.

ChatX развивает общий рабочий контур сообщений, встреч, задач, календаря и подтверждений. В документации основной ветки прямо описано правило: предложенное AI действие не создаёт задачу без подтверждения человека. Это описание исходной системы, не подтверждение внешнего коммерческого внедрения. [1]

В отдельном **Draft PR #58** реализована связь уже принятого решения с существующей канонической задачей: явное действие пользователя, повторная проверка прав и аудит. Связь не меняет исполнителя, срок или статус задачи и не создаёт вторую задачу. Проверки данного коммита прошли успешно, но изменения ещё не объединены с основной веткой. [2][3]

Практический принцип — строить проверяемую цепочку «обсуждение → решение → задача → основание для приёмки», а не множить AI-заметки. Сокращение затрат времени и улучшение KPI не измерены и здесь не заявляются. До полноценного публичного кейса нужны сквозная интеграционная приёмка, проверка доступа разных ролей, приватности и установленного окружения.

## Landing — EN

### ChatX: a meeting decision should remain connected to execution

A meeting may produce two disconnected records: an agreed decision and a task elsewhere. Without a verifiable link, it is harder to determine who approved the action, what justified it and where to find the result.

ChatX documents a shared work graph spanning messages, meetings, tasks, calendars and evidence. Its main-branch documentation explicitly requires human confirmation before an AI-suggested action becomes a real task. This describes source capabilities, **not a verified customer deployment**. [1]

An isolated **Draft PR #58** links an accepted decision to an existing canonical task using explicit user action, permission rechecks and audit history. The link does not change the assignee, due date or task status, or create a duplicate task. CI passed for the stated commit, but the draft remains unmerged. [2][3]

The design goal is a reviewable path — discussion → decision → task → acceptance evidence — rather than more AI-generated notes. No productivity or time-saving result is claimed. Integrated role/security tests, privacy review and independent installed-environment acceptance are still required.

## Telegram — RU

**ChatX: решение не должно создавать дубликат задачи.** Связь между встречей, решением и уже существующей задачей должна быть явной, проверяемой и защищённой правами доступа. Такой механизм реализуется в отдельном Draft PR #58; тесты его версии прошли, но релиз и внешнее внедрение не подтверждены. Источники: [основной код](https://github.com/PetrFedin/chat/commit/030ad00bf69e3e9b6d5d39f561ca9bff60ffb611) · [PR #58](https://github.com/PetrFedin/chat/pull/58).

## Telegram — EN

**ChatX: a decision must not duplicate a task.** A link from meeting to decision to an existing task should be explicit, auditable and permission-aware. This is implemented in isolated Draft PR #58; its SHA-specific tests passed, but neither release nor external adoption is verified. Sources: [main source](https://github.com/PetrFedin/chat/commit/030ad00bf69e3e9b6d5d39f561ca9bff60ffb611) · [PR #58](https://github.com/PetrFedin/chat/pull/58).

## Evidence and rights

[1] [README at main SHA 030ad00, 2026-10-15](https://github.com/PetrFedin/chat/blob/030ad00bf69e3e9b6d5d39f561ca9bff60ffb611/README.md). [2] [OPEN/DRAFT PR #58, head 10c9c852bd1a5c05acf2d8880ac5f0aac1465a72, 2026-10-18](https://github.com/PetrFedin/chat/pull/58). [3] [CI 39129742549: domain and PostgreSQL jobs SUCCESS](https://github.com/PetrFedin/chat/actions/runs/39129742549). The [real-browser demo in PR #57](https://github.com/PetrFedin/chat/pull/57) remains **not cleared for embedding**; no footage, screenshots or user identities are included. Human editorial, product, privacy/IP and separate web/Telegram publication approval required.
