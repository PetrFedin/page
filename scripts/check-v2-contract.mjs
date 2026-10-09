import fs from 'node:fs';

const read = (p) => fs.readFileSync(p, 'utf8');
const app = read('assets/app.js');
const v2 = read('assets/v2.js');
const index = read('index.html');
const content = read('assets/content.js');
const en = read('en/index.html');
const css = read('assets/v2.css');

const checks = [
  ['portfolio heading', v2.includes("'Что уже построено'") && v2.includes("'Продукты'")],
  ['portfolio starts with two cards', v2.includes('const PORTFOLIO_FIRST = 2;')],
  ['portfolio show more control', v2.includes("id=\"v2-portfolio-more\"") && v2.includes("'Показать ещё'") && v2.includes("'Свернуть'")],
  ['detailed projects progressive reveal', app.includes('let projectsExpanded = false;') && app.includes('const PROJECTS_FIRST = 3;')],
  ['news progressive reveal', app.includes('function newsFirst() { return 3; }') && app.includes("$('#news-more').addEventListener('click'")],
  ['RU portfolio terminology', ['Мода','Корпоративные','События','Потребительские','Финтех','Искусство','Инфраструктура','Готов к пилоту'].every((x) => v2.includes(x))],
  ['stakeholder routes', ['client','ceo','investor','partner'].every((x) => v2.includes(`id:"${x}"`) || v2.includes(`"id":"${x}"`))],
  ['executive evidence', ['Проблема','Продукт','Подтверждение','Текущая стадия','Следующий этап','Коммерческий путь','Что требуется от партнёра / инвестора'].every((x) => v2.includes(x))],
  ['project CTA paths', ['data-v2-open','data-v2-talk="launch"','data-v2-talk="partnership"','data-v2-talk="investors"'].every((x) => v2.includes(x))],
  ['contact form anchors', ['id="contact"','id="form"','id="topic"','id="submit"'].every((x) => index.includes(x))],
  ['RU/EN pages exist', index.includes('assets/app.js') && en.includes('/assets/app.js')],
  ['V2 renderer receives project registry', app.includes('renderV2(lang, PROJECTS);')],
  ['project decision dossier', v2.includes('Проект без технического шума') && v2.includes('Что решает проект, как он работает и что дальше') && v2.includes('Обсудить следующий шаг')],
  ['dossier CTA consistency', v2.includes('Посмотреть проект') && v2.includes('Ещё о проекте') && content.includes("open: 'Открыть досье'")],
  ['commercial clarity layer', ['Кто покупатель','За что платит','Первый продаваемый пилот','Что измеряем','Что превращает пилот в контракт','Возможные модели выручки'].every((x) => v2.includes(x))],
  ['commercial hypothesis labeling', v2.includes('Рабочая гипотеза · подтверждается пилотом') && v2.includes('Коммерческая модель')],
  ['commercial proof and investor readiness', ['Что уже доказано','Что ещё не доказано','Главный риск','Как следующий пилот снимает риск','Какие данные должны появиться','МАСШТАБИРОВАТЬ','ПЕРЕСОБРАТЬ','ОСТАНОВИТЬ'].every((x) => v2.includes(x))],
  ['portfolio truth sync', ['fashionmgmt','furproduction','antiqua'].every((x) => content.includes(`id: '${x}'`)) && !content.includes("id: 'moscow'") && index.includes('8 опубликованных продуктов') && !index.includes('${items.length} опубликованных продуктов')],
  ['authority-backed dossiers', ['syntha','chatx','renova','mfw','promomed','fashionmgmt','furproduction','antiqua'].every((x) => v2.includes(`\"${x}\"`)) && !v2.includes('\"moscow\"') && ['v2-dossier-proof','v2-dossier-governance','v2-dossier-commercial','v2-dossier-risk','v2-dossier-next'].every((x) => v2.includes(x))],
  ['confidential fashion cases stay anonymised', ![content,v2,index,en].some((x) => /Yanina|MVST/i.test(x))],
  ['investor first-screen priority', ['V2_INVESTOR_PRIORITY','v2-investor-priority','Why this matters','Why now','Economic change','What must be true next'].every((x) => v2.includes(x))],
  ['runtime bindings survive prerender', !/data-(?:decision-bound|bound(?:-portfolio|-stakeholder)?|commercial-bound|proof-bound|evidence-installed)=/.test(index + en) && !/dataset\.[A-Za-z0-9_]*(?:Bound|bound|Installed)/.test(v2)],
  ['actionable start flow', ['data-v2-start-mode','data-v2-start-continue','Перейти к короткой форме','Написать в Telegram'].every((x) => v2.includes(x))],
  ['deep new-project dossiers', ['V2_DEEP_PROJECTS','antiqua','fashionmgmt','furproduction','v2-deep-project'].every((x) => v2.includes(x))],
  ['executive portfolio ordering', v2.includes("['syntha','fashionmgmt','furproduction','mfw','promomed','chatx','antiqua','renova']") && v2.includes('v2-product-meta')],
  ['full public case studies', ['V2_CASE_STUDIES','Как устроено','Что внутри','Как этим пользуются','Что измеряем','С чем соединяется','Что проверяем на пилоте','Когда считаем, что получилось','Что развиваем дальше','v2-case-study'].every((x) => v2.includes(x))],
  ['visual product stories', ['V2_CASE_VISUALS','v2-visual-story','v2-arch-map','v2-flow-rail','v2-kpi-grid','v2-accept-grid','v2-roadmap-rail'].every((x) => v2.includes(x) || css.includes(x))],
  ['stable portfolio action hierarchy', ['v2-product-primary-actions','v2-product-more','v2-product-more-menu','Посмотреть проект','Ещё о проекте'].every((x) => v2.includes(x) || css.includes(x))],
  ['variable-height project cards', css.includes('.v2-portfolio-grid{align-items:start}') && css.includes('.v2-product{align-self:start;height:auto}')],
  ['premium project index', ['installProjectIndexPolish','v2-project-index','v2-index-transition','v2-index-card','v2-index-more'].every((x) => v2.includes(x) || css.includes(x))],
  ['portfolio density polish', css.includes('V2.22 portfolio → projects premium transition') && css.includes('aspect-ratio:16/6')],
  ['concise start choices', !v2.includes('<small>${m.copy}</small>') && v2.includes('Что подготовить для старта')],
  ['restored landing order', v2.includes("$('#cta-contact').setAttribute('href', '#v2-decision')") && v2.includes('restore and pin the established section order from c32fd76') && v2.includes("'#v2-stakeholders', '#v2-routes', '#v2-decision', '#experience', '#consulting'")],
  ['Antiqua paintings-only public scope', content.includes('только для живописи') && v2.includes('paintings-only') && !/drawing|printmaking|engraving|рисунк|гравюр/i.test(content + v2)],
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
