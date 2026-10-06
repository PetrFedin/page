import fs from 'node:fs';

const read = (p) => fs.readFileSync(p, 'utf8');
const app = read('assets/app.js');
const v2 = read('assets/v2.js');
const index = read('index.html');
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
  ['project CTA paths', ['data-v2-open','data-v2-talk="launch"','data-v2-talk="partnership"','data-v2-talk="investors"'].every((x) => v2.includes(x))],
  ['contact form anchors', ['id="contact"','id="form"','id="topic"','id="submit"'].every((x) => index.includes(x))],
  ['RU/EN pages exist', index.includes('assets/app.js') && en.includes('../assets/app.js')],
  ['V2 renderer receives project registry', app.includes('renderV2(lang, PROJECTS);')],
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
