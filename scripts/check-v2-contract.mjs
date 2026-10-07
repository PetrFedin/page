import fs from 'node:fs';

const read = (p) => fs.readFileSync(p, 'utf8');
const app = read('assets/app.js');
const v2 = read('assets/v2.js');
const css = read('assets/v2.css');
const statsApi = read('functions/api/stats.js');
const statsUi = read('functions/stats.js');
const contact = read('functions/api/contact.js');
const leadsApi = read('functions/api/leads.js');
const index = read('index.html');
const content = read('assets/content.js');
const en = read('en/index.html');

const checks = [
  ['portfolio heading', v2.includes("'Портфель как система'") && !v2.includes("'Портфель как система, а не длинный список'")],
  ['portfolio starts with two cards', v2.includes('const PORTFOLIO_FIRST = 2;')],
  ['portfolio show more control', v2.includes("id=\"v2-portfolio-more\"") && v2.includes("'Показать ещё'") && v2.includes("'Свернуть'")],
  ['detailed projects progressive reveal', app.includes('let projectsExpanded = false;') && app.includes('const PROJECTS_FIRST = 3;')],
  ['news progressive reveal', app.includes('function newsFirst() { return 3; }') && app.includes("$('#news-more').addEventListener('click'")],
  ['RU portfolio terminology', ['Мода','Корпоративные','События','Потребительские','Финтех','Искусство','Инфраструктура','Готов к пилоту'].every((x) => v2.includes(x))],
  ['stakeholder routes', ['client','ceo','investor','partner'].every((x) => v2.includes(`id:"${x}"`) || v2.includes(`"id":"${x}"`))],
  ['executive evidence', ['Проблема','Продукт','Подтверждение','Текущая стадия','Следующий этап','Коммерческий путь','Что требуется от партнёра / инвестора'].every((x) => v2.includes(x))],
  ['project CTA paths', v2.includes('data-v2-open') && v2.includes('data-v2-project-start') && v2.includes("'Начать с этого проекта'")],
  ['contact form anchors', ['id="contact"','id="form"','id="topic"','id="submit"'].every((x) => index.includes(x))],
  ['RU/EN pages exist', index.includes('assets/app.js') && en.includes('/assets/app.js')],
  ['V2 renderer receives project registry', app.includes('renderV2(lang, PROJECTS);')],
  ['project decision dossier', v2.includes('Досье для решения') && v2.includes('Следующий проверяемый этап') && v2.includes('Обсудить следующий шаг')],
  ['dossier CTA consistency', v2.includes("'Открыть досье'") && content.includes("open: 'Открыть досье'")],
  ['commercial clarity layer', ['Кто покупатель','За что платит','Первый продаваемый пилот','Что измеряем','Что превращает пилот в контракт','Возможные модели выручки'].every((x) => v2.includes(x))],
  ['commercial hypothesis labeling', v2.includes('Рабочая гипотеза · подтверждается пилотом') && v2.includes('Коммерческая модель')],
  ['commercial proof and investor readiness', ['Что уже доказано','Что ещё не доказано','Главный риск','Как следующий пилот снимает риск','Какие данные должны появиться','МАСШТАБИРОВАТЬ','ПЕРЕСОБРАТЬ','ОСТАНОВИТЬ'].every((x) => v2.includes(x))],
  ['public confidentiality guard', v2.includes('Публично / конфиденциально') && v2.includes('Запросить закрытое демо')],
  ['controlled disclosure ladder', v2.includes('Уровни доступа') && v2.includes('NDA / diligence')],
  ['qualified lead routing', ['pilot','partnership','investment','diligence'].every((x) => v2.includes(x)) && v2.includes('Квалифицированное обращение') && v2.includes('leadTiming')],
  ['lead qualification model', statsApi.includes('function qualifyLead(') && statsUi.includes('Прозрачная квалификация') && statsUi.includes('Готовность')],
  ['interactive start flow', v2.includes('data-v2-start-route') && v2.includes('data-v2-start-project') && v2.includes('data-v2-start-timing')],
  ['single primary journey', v2.includes("$('#v2-routes').hidden = true") && v2.includes("($('#v2-decision') || $('#v2-routes')).after(section)") && v2.includes("$('#v2-steps').after($('#v2-portfolio'))")],
  ['role lens is secondary', v2.includes('v2-stakeholders-secondary') && v2.includes('data-v2-stakeholder-toggle') && v2.includes('Дополнительный ракурс')],
  ['mini brief builder', v2.includes('Mini Brief Builder') && v2.includes('data-v2-brief-answer') && v2.includes('leadBrief') && v2.includes('Brief первого разговора')],
  ['start flow visibility', v2.includes("$('#v2-decision') || $('#v2-routes')") && v2.includes("'Начать работу'") && v2.includes("'#v2-steps'")],
  ['recommendation layer', v2.includes('Recommended first step') && v2.includes('Рекомендуемый первый шаг') && v2.includes('Next gate') && v2.includes('Следующий gate')],
  ['consulting qualified route', v2.includes("title: 'Консалтинг'") && statsApi.includes("consulting: ['goal','scope','timing']")],
  ['start nav visibility', v2.includes('data.v2NavStart') || v2.includes('dataset.v2NavStart')],
  ['meeting room', v2.includes('Комната первой встречи · только эта сессия') && v2.includes('data-v2-meeting-copy') && v2.includes('data-v2-meeting-print')],
  ['meeting room print', css.includes('data-v2-print-meeting') && css.includes('.v2-meeting-room')],
  ['clear primary next step', v2.includes("id = 'v2-primary-next'") && v2.includes('Перейти к обращению') && v2.includes('Изменить Mini Brief')],
  ['breakpoint QA', css.includes('V2.22 breakpoint QA') && css.includes('max-height:calc(100dvh - 108px)') && css.includes('max-width:1099px')],
  ['executive dossier hierarchy', v2.includes('installExecutiveProjectDossierV2') && v2.includes('Досье для решения · 60 секунд') && v2.includes('Коммерция и подтверждения') && v2.includes('Доступ и проверка')],
  ['legacy stacked dossier disabled', !v2.includes('  installProjectDecisionDossier(lang, $, projects);') && !v2.includes('  installCommercialClarity(lang, $, projects);') && !v2.includes('  installCommercialProof(lang, $, projects);')],
  ['executive dossier progressive disclosure', v2.includes('v2-exec-level') && css.includes('.v2-exec-level>summary') && css.includes('.v2-exec-level[open]>summary i::before')],
  ['executive dossier mobile', css.includes('@media(max-width:759px)') && css.includes('.v2-exec-snapshot{grid-template-columns:1fr}') && css.includes('.v2-exec-disclosure{grid-template-columns:1fr}')],
  ['mobile modal safety', css.includes('max-height:calc(100dvh - 16px)') && css.includes('grid-template-columns:1fr')],
  ['meeting room scroll safety', css.includes('.v2-meeting-room-inner') && css.includes('overflow-y:auto') && css.includes('overscroll-behavior:contain')],
  ['hero two choices', css.includes('#cta-contact') && css.includes('#cta-consulting') && css.includes('#cta-projects') && css.includes('display:none!important')],
  ['mini brief route questions', ['leadGoal','leadScope','leadContribution','leadFormat','leadInvestorFocus','leadNextStep','leadDiligencePurpose','leadAccessLevel'].every((x)=>v2.includes(x))],
  ['mini brief persisted', contact.includes('brief: clean(body.leadBrief') && statsUi.includes('Brief первого разговора') && statsUi.includes('leadBriefBox')],
  ['lead operating API', leadsApi.includes("type, path, target, label, data") && leadsApi.includes("'lead_op'") && leadsApi.includes("demo_scheduled")],
  ['lead operating queue', statsUi.includes('Lead Operating Queue') && statsUi.includes('Требует действия сегодня') && statsUi.includes('data-lead-save') && statsUi.includes("post('/api/leads'" )],
  ['lead history append-only', statsApi.includes("type='lead_op'") && statsApi.includes('s.operations') && statsApi.includes('s.operating')],
  ['simplified portfolio CTA grid', css.includes('.v2-product-actions{display:grid;grid-template-columns:1fr 1fr') && !css.includes('grid-template-columns:repeat(6,minmax(0,1fr))')],

];

let failed = 0;
for (const [name, ok] of checks) {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`);
  if (!ok) failed += 1;
}

if (failed) {
  console.error(`\nV2 contract failed: ${failed} check(s)`);
  process.exit(1);
}

console.log(`\nV2 contract passed: ${checks.length} checks`);
