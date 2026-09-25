import { PROJECTS, CONTACTS, COMPARE } from './content.js';
import { SYNTHA_DECK as D } from './syntha-deck.js';
import { LOGOS } from './logos.js';

const $ = (s) => document.querySelector(s);
const proj = PROJECTS.find((p) => p.id === 'syntha');
const cmp = COMPARE.syntha;
const st = proj.ru.status;

const slideHead = (n, kicker, title) => `
  <p class="slide-n">${n ? `${n} · ` : ''}${kicker}</p>
  <h2>${title}</h2>`;

const pointList = (items) => `<ul class="slide-points">${items.map((i) => `<li>${i}</li>`).join('')}</ul>`;

const slides = [];

/* 00 — обложка */
slides.push(`
  <section class="slide slide-cover">
    <span class="slide-logo">${LOGOS.syntha}</span>
    <p class="slide-kicker">${D.cover.kicker}</p>
    <h1>${D.cover.title}</h1>
    <p class="slide-lead">${D.cover.lead}</p>
    <span class="slide-stage">${D.cover.stage}</span>
    <p class="slide-author">${D.cover.author}</p>
  </section>`);

/* 01 — проблема */
slides.push(`
  <section class="slide">
    ${slideHead(D.problem.n, D.problem.kicker, D.problem.title)}
    <p class="slide-body">${D.problem.body}</p>
    ${pointList(D.problem.points)}
  </section>`);

/* 02 — решение */
slides.push(`
  <section class="slide">
    ${slideHead(D.solution.n, D.solution.kicker, D.solution.title)}
    <p class="slide-body">${D.solution.body}</p>
    ${pointList(D.solution.points)}
  </section>`);

/* 03 — для кого */
slides.push(`
  <section class="slide">
    ${slideHead(D.who.n, D.who.kicker, D.who.title)}
    <p class="slide-body">${D.who.body}</p>
    ${pointList(D.who.points)}
  </section>`);

/* 04 — сравнение */
slides.push(`
  <section class="slide slide-wide">
    ${slideHead('04', 'Место на рынке', 'Покрытие функциональных областей по классам систем')}
    <table class="slide-table">
      <thead><tr><th>Функциональная область</th>${cmp.columns.map((c) => `<th>${c}</th>`).join('')}</tr></thead>
      <tbody>
        ${cmp.rows.map((r) => `<tr><td>${r.area}</td>${r.marks.map((m, i) => `<td class="mark-${m}${i === r.marks.length - 1 ? ' mark-own' : ''}">${m === 'yes' ? 'есть' : m === 'no' ? 'нет' : 'частично'}</td>`).join('')}</tr>`).join('')}
      </tbody>
    </table>
    <p class="slide-note">${D.compareNote}</p>
  </section>`);

/* 05 — дорожная карта */
slides.push(`
  <section class="slide">
    ${slideHead(D.roadmap.n, D.roadmap.kicker, D.roadmap.title)}
    <ol class="slide-roadmap">
      ${D.roadmap.steps.map((s) => `<li class="rm-${s.state}">${s.label}</li>`).join('')}
    </ol>
    <div class="slide-cols">
      <div><p class="slide-col-title">${D.roadmap.doneTitle}</p>${pointList(st.done)}</div>
      <div><p class="slide-col-title">${D.roadmap.nowTitle}</p>${pointList(st.now)}</div>
    </div>
  </section>`);

/* 06 — участие */
slides.push(`
  <section class="slide">
    ${slideHead(D.collab.n, D.collab.kicker, D.collab.title)}
    <ul class="slide-collab">
      ${proj.ru.collab.map((c) => `<li><b>${c.k}</b><span>${c.v}</span></li>`).join('')}
    </ul>
    <p class="slide-investor"><b>Инвесторам и партнёрам</b>${D.collab.investorNote}</p>
  </section>`);

/* 07 — контакты */
const tg = CONTACTS.find((c) => c.value === '@syntha_pro');
slides.push(`
  <section class="slide slide-contact">
    <p class="slide-n">${D.contact.n}</p>
    <h2>${D.contact.title}</h2>
    <p class="slide-body">${D.contact.body}</p>
    <ul class="slide-contacts">
      ${CONTACTS.map((c) => `<li><span>${c.label.ru}</span><b>${c.value}</b></li>`).join('')}
    </ul>
    <p class="slide-site">${D.contact.site}${tg ? ` · ${tg.value}` : ''}</p>
  </section>`);

$('#deck').innerHTML = slides.join('\n');
$('#doc-title').textContent = D.meta.title;

const upd = new Date(document.lastModified);
$('#doc-updated').textContent = `${D.meta.updated} ${upd.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}`;

$('#print-btn').textContent = D.meta.printLabel;
$('#print-btn').addEventListener('click', () => window.print());
$('#back-link').textContent = D.meta.backLabel;
