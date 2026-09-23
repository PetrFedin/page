/* Разбор проекта: syntha.html и chatx.html.
   Тексты лежат прямо в разметке — это документ, а не приложение, и такой
   странице полезно иметь содержимое в HTML, её читают поисковики. Отсюда
   берётся только то, что не должно расходиться с главной страницей:
   логотип, стадия проекта и год в подвале.

   Какой это проект, страница сообщает атрибутом data-project на своём
   теге script: иначе пришлось бы держать две почти одинаковые копии. */
import { PROJECTS, T } from './content.js';
import { LOGOS } from './logos.js';
import { createViewer } from './viewer.js';
import { syncSnaps } from './snap.js';

const $ = (sel) => document.querySelector(sel);
const id = document.currentScript?.dataset.project
  ?? document.querySelector('script[data-project]')?.dataset.project;

const проект = PROJECTS.find((p) => p.id === id);
if (проект) $('#doc-logo').innerHTML = LOGOS[проект.id];

/* Стадия читается из общих данных: иначе после правки в карточке проекта
   страница начнёт показывать устаревшее. */
const s = T.ru.projects.status;
const st = проект?.ru.status;
if (st) {
  $('#doc-status').innerHTML = [['done', st.done], ['now', st.now], ['next', st.next]]
    .map(([k, list]) => `
      <div class="status-col status-${k}">
        <h4>${s[k]}</h4>
        <ul>${list.map((i) => `<li>${i}</li>`).join('')}</ul>
      </div>`).join('')
    + (st.seeking ? `<p class="seeking"><b>${s.seeking}</b>${st.seeking}</p>` : '');
}

$('#year').textContent = new Date().getFullYear();

/* Дата документа: без неё разбор проекта у читателя теряет в доверии.
   Берём день последнего изменения файла, чтобы не править её руками. */
const изменён = new Date(document.lastModified);
$('#doc-date').dateTime = изменён.toISOString().slice(0, 10);
$('#doc-date').textContent = 'Обновлено '
  + изменён.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });

/* ---------- тема и бургер: то же поведение, что на главной ---------- */
const store = {
  get(k, d) { try { return localStorage.getItem(k) ?? d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch { /* приватный режим */ } }
};

const savedTheme = store.get('theme');
if (savedTheme) document.documentElement.dataset.theme = savedTheme;
$('#theme-toggle').addEventListener('click', () => {
  const dark = matchMedia('(prefers-color-scheme:dark)').matches;
  const current = document.documentElement.dataset.theme || (dark ? 'dark' : 'light');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = next;
  store.set('theme', next);
});

const burger = $('#burger');
const nav = $('#nav');
const setMenu = (open) => {
  nav.classList.toggle('open', open);
  burger.setAttribute('aria-expanded', String(open));
};
burger.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
nav.addEventListener('mouseleave', () => setMenu(false));
nav.addEventListener('click', () => setMenu(false));

/* ---------- снимки открываются во весь экран и листаются ---------- */
const viewer = createViewer({ labels: () => T.ru.projects.viewer });
const shots = [...document.querySelectorAll('.shot-row img')]
  .map((img) => ({ src: img.currentSrc || img.src, alt: img.alt }));
document.querySelectorAll('.shot-row img').forEach((img, i) => {
  img.addEventListener('click', () => viewer.open(shots, i));
});

/* ---------- заголовок раздела держится сверху, стрелка возвращает к началу ---------- */
const up = T.ru.nav.toTop;
document.querySelectorAll('.doc-block > h2').forEach((h) => {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'to-top';
  btn.setAttribute('aria-label', up);
  btn.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">'
    + '<path d="M12 19V6M6 12l6-6 6 6" stroke="currentColor" stroke-width="1.8" fill="none"'
    + ' stroke-linecap="round" stroke-linejoin="round"/></svg>';
  btn.addEventListener('click', () => scrollTo({ top: 0, behavior: 'smooth' }));
  h.append(btn);
});

/* ---------- на телефоне блоки листаются вбок ----------
   Разбор занимает полтора десятка экранов. Всё, что состоит из равноправных
   блоков — строки схем, перечни, экраны, вопросы, — на узком экране
   превращается в карусель: читается по одному, не растит прокрутку. */
for (const sel of ['.grid-table', '.findings', '.principles', '.audiences', '.shot-row', '.faq', '.flow']) {
  document.querySelectorAll(sel).forEach((el) => el.classList.add('snap'));
}
syncSnaps();
addEventListener('resize', syncSnaps);
