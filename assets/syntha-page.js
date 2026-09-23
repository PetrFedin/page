/* Страница проекта Syntha.
   Тексты лежат прямо в syntha.html: это документ, а не приложение, и такой
   странице полезно иметь содержимое в разметке — её читают поисковики.
   Отсюда берётся только то, что не должно расходиться с главной страницей:
   логотип, стадия проекта и год в подвале. */
import { PROJECTS, T } from './content.js';
import { LOGOS } from './logos.js';

const $ = (sel) => document.querySelector(sel);

$('#doc-logo').innerHTML = LOGOS.syntha;

/* Стадия читается из общих данных: иначе после правки в карточке проекта
   страница начнёт показывать устаревшее. */
const syntha = PROJECTS.find((p) => p.id === 'syntha');
const s = T.ru.projects.status;
const st = syntha?.ru.status;
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
