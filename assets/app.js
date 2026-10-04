import { T, PROJECTS, CONTACTS, COMPARE } from './content.js?v=202610041910';
import { DECK } from './deck.js?v=202610041910';
import { LOGOS } from './logos.js?v=202610041910';
import { createViewer } from './viewer.js?v=202609301526';
import { syncSnaps } from './snap.js?v=202610041910';
import { NEWS } from './news.js?v=202610041910';

/* Сайт — витрина: показываем отобранные материалы. Канал получает весь поток.
   Лента идёт от свежего к старому по дате публикации — «Показать ещё» раскрывает
   более старые записи; порядок записей в news.js на отображение не влияет.
   Даты вперёд сегодняшней — это запланированные, ещё не наступившие публикации:
   на сайте они не должны быть видны раньше своего дня. */
const today = new Date().toISOString().slice(0, 10);
const SITE_NEWS = NEWS.filter((p) => p.site !== false && p.date <= today)
  .sort((a, b) => b.date.localeCompare(a.date));
/* Пост показывается на EN-версии только если у него есть перевод (en:).
   postText() берёт русский текст как запасной вариант для прямых ссылок
   на непереведённый пост, если он всё же откроется на EN-версии. */
const hasLang = (p) => Boolean(p[lang]);
const postText = (p) => p[lang] ?? p.ru;
/* Публикации конкретного проекта — тот же фильтр, что и в его окне
   «Новости» (openProjectNews), и там же используется порядок SITE_NEWS
   (от свежего к старому): листание постов в #post-modal должно идти
   ровно по этому же списку. */
const projectPostList = (tag) => SITE_NEWS.filter((n) => n.tag === tag && hasLang(n));

const $ = (s) => document.querySelector(s);
const store = {
  get(k, d) { try { return localStorage.getItem(k) ?? d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch { /* приватный режим */ } }
};

/* ---------- просмотрщик снимков ---------- */
const viewer = createViewer({ labels: () => T[lang].projects.viewer });
const openPhoto = (list, i = 0) => viewer.open(list, i);
/* портрет на английской версии — другой кадр */
const portraitSrc = () => (lang === 'en' ? '/assets/photo/petr-ny.webp' : '/assets/photo/petr-portrait.webp');
const openPortrait = () => openPhoto([{ src: portraitSrc(), alt: $('#hero-photo').alt }]);
$('#portrait-btn').addEventListener('click', openPortrait);
$('#avatar-btn').addEventListener('click', openPortrait);

/* ---------- кнопка «наверх» в прилипшем заголовке ----------
   Заголовки разделов заполняются через textContent, поэтому кнопку
   приходится возвращать после каждой отрисовки. */
function makeTopButton(label, toTop) {
  const up = document.createElement('button');
  up.type = 'button';
  up.className = 'to-top';
  up.setAttribute('aria-label', label);
  up.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">'
    + '<path d="M12 19V6M6 12l6-6 6 6" stroke="currentColor" stroke-width="1.8" fill="none"'
    + ' stroke-linecap="round" stroke-linejoin="round"/></svg>';
  up.addEventListener('click', toTop);
  return up;
}

/* Кнопка закрыть рядом со стрелкой «наверх» в липнущем заголовке раздела
   внутри окна (например у презентации) — чтобы закрыть окно можно было
   и не долистывая обратно к глобальному крестику вверху модалки. */
function makeCloseButton(label, onClose) {
  const x = document.createElement('button');
  x.type = 'button';
  x.className = 'to-top to-close';
  x.setAttribute('aria-label', label);
  x.title = label;
  x.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">'
    + '<path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="1.8" fill="none"/></svg>';
  x.addEventListener('click', onClose);
  return x;
}

function addTopButtons(label) {
  document.querySelectorAll('.section > .section-head > h2').forEach((h) => {
    if (h.querySelector('.to-top')) return;
    h.append(makeTopButton(label, () => window.scrollTo({ top: 0, behavior: 'smooth' })));
  });
}

addEventListener('resize', syncSnaps);

/* Высота шапки нужна прилипающим заголовкам разделов: они встают ровно под ней, без щели */
const topbarEl = document.querySelector('.topbar');
const syncTopbarHeight = () => document.documentElement.style.setProperty('--topbar-h', `${topbarEl.offsetHeight}px`);
syncTopbarHeight();
new ResizeObserver(syncTopbarHeight).observe(topbarEl);

/* ---------- индикатор прогресса скролла ---------- */
const scrollProgress = $('#scroll-progress');
let scrollTicking = false;
function updateScrollProgress() {
  const max = document.documentElement.scrollHeight - innerHeight;
  scrollProgress.style.width = `${max > 0 ? Math.min(100, (scrollY / max) * 100) : 0}%`;
  scrollTicking = false;
}
addEventListener('scroll', () => {
  if (scrollTicking) return;
  scrollTicking = true;
  requestAnimationFrame(updateScrollProgress);
}, { passive: true });
addEventListener('resize', updateScrollProgress);
updateScrollProgress();

/* ---------- лёгкий параллакс у портрета в hero ----------
   Только там, где есть настоящая мышь и человек не просил убрать анимации —
   на тач-экране и с prefers-reduced-motion эффект просто не подключается. */
const heroSection = document.querySelector('.hero');
if (heroSection && matchMedia('(hover:hover) and (pointer:fine)').matches
    && !matchMedia('(prefers-reduced-motion:reduce)').matches) {
  heroSection.addEventListener('mousemove', (e) => {
    const r = heroSection.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    $('#hero-photo').style.transform = `translate(${x * -10}px, ${y * -8}px) scale(1.015)`;
  });
  heroSection.addEventListener('mouseleave', () => { $('#hero-photo').style.transform = ''; });
}

/* ---------- меню на телефоне ---------- */
const nav = $('#nav');
const burger = $('#burger');

function closeNav() {
  nav.classList.remove('open');
  burger.setAttribute('aria-expanded', 'false');
  document.body.classList.remove('nav-open');
}
burger.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  burger.setAttribute('aria-expanded', String(open));
  document.body.classList.toggle('nav-open', open);
});
nav.addEventListener('click', (e) => { if (e.target.tagName === 'A') closeNav(); });
/* уводят курсор с меню — сворачиваем; на касании работает клик мимо */
$('.topbar').addEventListener('mouseleave', () => { if (nav.classList.contains('open')) closeNav(); });
document.addEventListener('click', (e) => {
  if (!nav.classList.contains('open')) return;
  if (!e.target.closest('#nav') && !e.target.closest('#burger')) closeNav();
});
addEventListener('keydown', (e) => { if (e.key === 'Escape') closeNav(); });

/* ---------- язык ---------- */
/* Язык задаёт адрес: /en/ — это отдельная страница для поиска, и она
   должна открываться по-английски независимо от прошлого выбора. */
const urlLang = location.pathname.startsWith('/en') ? 'en'
  : new URLSearchParams(location.search).get('lang');
/* Адрес «/» всегда русский, «/en/» всегда английский: так ссылка, которой делятся, и страница совпадают.
   Другой язык открывается переключателем или параметром ?lang=. */
let lang = (urlLang === 'ru' || urlLang === 'en') ? urlLang : 'ru';
if (!T[lang]) lang = 'ru';

let projectsExpanded = false;
const PROJECTS_FIRST = 3;

/* Раздел «Сотрудничество»: шесть мини-карточек форматов; полный текст формата — в окне с листанием. */
const needModal = $('#need-modal');
let needId = null, needAnswers = [];
const COOP_L = {
  ru: { read: 'Подробнее', contact: 'Связаться', prev: '← Предыдущий', next: 'Следующий →', of: 'из', close: 'Закрыть' },
  en: { read: 'Read more', contact: 'Contact', prev: '← Previous', next: 'Next →', of: 'of', close: 'Close' }
};
function renderInvestors() {
  const iv = T[lang].investors, lb = iv.labels, L = COOP_L[lang];
  const base = lang === 'en' ? '/en/' : '/';
  $('#investors-title').textContent = iv.title;
  $('#investors-sub').textContent = iv.sub;
  $('#investors-lead').textContent = iv.lead;
  $('#investors-list').className = 'inv-list snap snap-fit';
  $('#investors-list').innerHTML = iv.formats.map((f, i) => `
    <article class="inv-card mini" id="inv-${f.id}" data-idx="${i}" tabindex="0" role="button" aria-label="${f.title}">
      <span class="svc-n">${String(i + 1).padStart(2, '0')}</span>
      <h3>${f.title}</h3>
      <p class="inv-tag">${f.tagline}</p>
      <p class="inv-what">${f.what}</p>
      <div class="inv-foot">
        <button class="inv-read" type="button" data-coop-open="${i}">${L.read} →</button>
        <button class="btn btn-sm" type="button" data-inv-talk="${f.id}">${L.contact}</button>
      </div>
    </article>`).join('');
  $('#investors-projects').innerHTML = '';
  $('#investors-projects').hidden = true;
  const testBtn = `<button type="button" class="btn" id="coop-test-open">${iv.test.label}</button>`;
  $('#investors-lead').insertAdjacentHTML('afterend', '');
  $('#investors-testrow').innerHTML = testBtn;
  $('#investors-note').textContent = lb.nda ?? '';
  $('#investors-note').hidden = !lb.nda;
}
const coopModal = $('#coop-modal');
let coopIdx = 0;
function openCoop(i) {
  const iv = T[lang].investors, lb = iv.labels, L = COOP_L[lang], n = iv.formats.length;
  coopIdx = (i + n) % n;
  const f = iv.formats[coopIdx];
  $('#coop-count').textContent = `${coopIdx + 1} ${L.of} ${n}`;
  $('#coop-title').textContent = f.title;
  $('#coop-tag').textContent = f.tagline;
  $('#coop-what').textContent = f.what;
  $('#coop-gets').innerHTML = `<div><dt>${lb.partner}</dt><dd>${f.partner}</dd></div><div><dt>${lb.project}</dt><dd>${f.project}</dd></div>`;
  $('#coop-fit').innerHTML = `<b>${lb.fit}</b>${f.fit}`;
  $('#coop-start').innerHTML = `<b>${lb.start}</b>${f.start}`;
  $('#coop-prev').textContent = L.prev;
  $('#coop-next').textContent = L.next;
  $('#coop-talk').textContent = L.contact;
  $('#coop-close').setAttribute('aria-label', L.close);
  if (!coopModal.open) coopModal.showModal();
  coopModal.querySelector('.modal-body').scrollTop = 0;
}
$('#coop-close').addEventListener('click', () => coopModal.close());
coopModal.addEventListener('click', (e) => { if (e.target === coopModal) coopModal.close(); });
$('#coop-prev').addEventListener('click', () => openCoop(coopIdx - 1));
$('#coop-next').addEventListener('click', () => openCoop(coopIdx + 1));
$('#coop-talk').addEventListener('click', () => {
  const iv = T[lang].investors;
  const id = iv.formats[coopIdx].id;
  coopModal.close();
  startContact({ topic: 'investors', message: iv.contactMessages[id] ?? '' });
});
$('#investors-list').addEventListener('click', (e) => {
  const b = e.target.closest('[data-inv-talk]');
  if (b) {
    const iv = T[lang].investors;
    return startContact({ topic: 'investors', message: iv.contactMessages[b.dataset.invTalk] ?? '' });
  }
  /* карточка целиком открывает формат; кнопки внутри делают своё */
  const card = e.target.closest('.inv-card');
  if (card) openCoop(+card.dataset.idx);
});
$('#investors-list').addEventListener('keydown', (e) => {
  if (e.key !== 'Enter' && e.key !== ' ') return;
  const card = e.target.closest('.inv-card');
  if (card && e.target === card) { e.preventDefault(); openCoop(+card.dataset.idx); }
});

/* ---------- «Подобрать формат сотрудничества»: тест на шесть форматов ---------- */
let ctAnswers = [];
let ctActive = false;
function renderCoopTest() {
  const iv = T[lang].investors, ts = iv.test;
  ctActive = true;
  $('#need-logo').innerHTML = `<p class="eyebrow">${ts.label}</p>`;
  $('#need-title').textContent = ts.title;
  $('#need-subtitle').textContent = ts.subtitle;
  const body = $('#need-body');
  const step = ctAnswers.length;
  if (step < ts.questions.length) {
    const q = ts.questions[step];
    body.innerHTML = `
      <div class="diag-progress">
        <span>${ts.progress.replace('{i}', step + 1).replace('{n}', ts.questions.length)}</span>
        <div class="diag-bar"><span style="width:${Math.round((step / ts.questions.length) * 100)}%"></span></div>
      </div>
      <h3 class="diag-q">${q.q}</h3>
      <div class="diag-options">${q.options.map((o, i) => `<button type="button" class="diag-opt" data-ct-opt="${i}">${o.t}</button>`).join('')}</div>
      ${step > 0 ? `<button type="button" class="diag-back" data-ct-back>${ts.back}</button>` : ''}`;
    return;
  }
  const count = {};
  ctAnswers.forEach((f) => { count[f] = (count[f] || 0) + 1; });
  const order = iv.formats.map((f) => f.id);
  const best = Object.entries(count).sort((a, b) => b[1] - a[1] || order.indexOf(a[0]) - order.indexOf(b[0]))[0][0];
  const f = iv.formats.find((x) => x.id === best);
  body.dataset.best = best;
  body.innerHTML = `
    <div class="diag-result">
      <p class="diag-result-label">${ts.resultLabel}</p>
      <h3>${f.title}</h3>
      <p class="inv-tag">${f.tagline}</p>
      <p class="diag-result-body">${f.what}</p>
      <p class="inv-fit"><b>${iv.labels.fit}</b>${f.fit}</p>
      <p class="diag-note">${ts.resultNote}</p>
      <div class="diag-actions">
        <button type="button" class="btn btn-primary" data-ct-contact>${ts.contact}</button>
        <button type="button" class="btn" data-ct-read>${ts.read}</button>
      </div>
      <button type="button" class="diag-retake" data-ct-retake>${ts.retake}</button>
    </div>`;
  document.querySelectorAll('.inv-card.inv-match').forEach((c) => c.classList.remove('inv-match'));
  $(`#inv-${best}`)?.classList.add('inv-match');
}
function openCoopTest() {
  ctAnswers = [];
  needId = null;
  renderCoopTest();
  if (!needModal.open) needModal.showModal();
  needModal.querySelector('.modal-body').scrollTop = 0;
}
document.addEventListener('click', (e) => { if (e.target.closest('#coop-test-open')) openCoopTest(); });
needModal.addEventListener('close', () => {
  if (ctActive && $('#need-body').dataset.best) $('#inv-' + $('#need-body').dataset.best)?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  ctActive = false;
});
$('#need-body').addEventListener('click', (e) => {
  if (!ctActive) return;
  const iv = T[lang].investors, ts = iv.test;
  const opt = e.target.closest('[data-ct-opt]');
  if (opt) {
    const q = ts.questions[ctAnswers.length];
    window.track?.('quiz_step', `coop-${ctAnswers.length + 1}`, q.options[+opt.dataset.ctOpt].t);
    ctAnswers.push(q.options[+opt.dataset.ctOpt].f);
    if (ctAnswers.length === ts.questions.length) window.track?.('quiz_result', 'coop', 'format');
    return renderCoopTest();
  }
  if (e.target.closest('[data-ct-back]')) { ctAnswers.pop(); return renderCoopTest(); }
  if (e.target.closest('[data-ct-retake]')) { ctAnswers = []; document.querySelectorAll('.inv-card.inv-match').forEach((c) => c.classList.remove('inv-match')); return renderCoopTest(); }
  const best = $('#need-body').dataset.best;
  if (e.target.closest('[data-ct-read]')) {
    const i = iv.formats.findIndex((f) => f.id === best);
    ctActive = false; needModal.close(); return openCoop(i);
  }
  if (e.target.closest('[data-ct-contact]')) {
    ctActive = false; needModal.close();
    startContact({ topic: 'investors', message: iv.contactMessages[best] ?? '' });
  }
});

function renderCards() {
  const t = T[lang];
  $('#cards').className = "cards snap snap-fit";
  $('#cards').innerHTML = (projectsExpanded ? PROJECTS : PROJECTS.slice(0, PROJECTS_FIRST)).map((p) => {
    /* Кнопка «Новости» ведёт в тупик, если публикаций по проекту ещё нет —
       гасим её вместо того, чтобы открывать пустое окно. */
    const hasNews = SITE_NEWS.some((n) => n.tag === p.id && hasLang(n));
    return `
    <article class="card" data-project="${p.id}">
      <span class="card-logo">${LOGOS[p.id]}</span>
      <h3 class="card-tag">${p[lang].tagline}</h3>
      <p class="card-body">${p[lang].card}</p>
      <span class="stage">${p[lang].stage}</span>
      <div class="card-foot">
        <button class="btn btn-sm btn-primary" type="button" data-open="${p.id}">${t.projects.open}</button>
        <button class="btn btn-sm" type="button" data-status="${p.id}">${t.projects.statusBtn}</button>
        <button class="btn btn-sm" type="button" data-news="${p.id}"${hasNews ? '' : ` disabled title="${t.projects.newsEmpty}"`}>${t.projects.newsBtn}</button>
        ${COMPARE[p.id] && lang === 'ru' ? `<button class="btn btn-sm" type="button" data-compare="${p.id}">${t.projects.compareBtn}</button>` : ''}
        ${p.id === 'syntha' ? `<button class="btn btn-sm flow-toggle" type="button" data-flow-toggle aria-expanded="false">${t.flow.eyebrow}</button>` : ''}
        ${p.id === 'syntha' ? `<button class="btn btn-sm" type="button" data-leak-open>${t.leakQuiz.label}</button>` : ''}
        ${t.needCheck?.[p.id] ? `<button class="btn btn-sm" type="button" data-need-open="${p.id}">${t.needCheck[p.id].label}</button>` : ''}
      </div>
      ${p.id === 'syntha' ? '<div class="flow-embed" id="flow-embed" hidden></div>' : ''}
    </article>`;
  }).join('');
  if (flowOpen) renderSeasonFlow();
  const pm = $('#projects-more');
  pm.hidden = PROJECTS.length <= PROJECTS_FIRST;
  pm.textContent = projectsExpanded ? t.projects.collapse : t.projects.more;
  pm.setAttribute('aria-expanded', String(projectsExpanded));
}

function render() {
  const t = T[lang];
  document.documentElement.lang = lang;

  $('#lang-toggle').textContent = lang === 'ru' ? 'EN' : 'RU';
  $('#lang-toggle').setAttribute('aria-label', lang === 'ru' ? 'EN — switch to English' : 'RU — переключить на русский');
  applyTextSize(document.documentElement.dataset.textSize || 'normal');
  renderClock();
  document.querySelectorAll('[data-nav]').forEach((a) => { a.textContent = t.nav[a.dataset.nav]; });
  $('#skip-link').textContent = t.nav.skip;
  $('#cta-bar a').setAttribute('aria-label', t.nav.ctaBar); $('#cta-bar a').title = t.nav.ctaBar;

  $('#hero-eyebrow').textContent = t.hero.eyebrow;
  $('#hero-name').textContent = t.hero.name;
  $('#hero-lead').textContent = t.hero.lead;
  $('#hero-bio').textContent = t.hero.bio;
  document.querySelectorAll('.modal-close').forEach((b) => { b.setAttribute('aria-label', t.nav.close); b.title = t.nav.close; });
  const backLabel = lang === 'ru' ? 'Назад' : 'Back';
  $('#cv-back').setAttribute('aria-label', backLabel);
  $('#cv-back').title = backLabel;
  ['#hero-photo', '#photo-big', '#hero-avatar'].forEach((id) => { const src = portraitSrc(); if (!$(id).src.endsWith(src)) $(id).src = src; });
  $('#hero-photo').alt = t.hero.photoAlt;
  $('#photo-big').alt = t.hero.photoAlt;
  $('#hero-avatar').alt = t.hero.photoAlt;
  $('#avatar-btn').setAttribute('aria-label', t.hero.photoAlt);
  $('#portrait-btn').setAttribute('aria-label', t.hero.photoAlt);
  $('#experience-title').textContent = t.hero.factsTitle;
  $('#facts-bar').className = "facts-bar snap snap-fit";
  $('#facts-bar').innerHTML = t.hero.facts.map((f, i) => `
    <li class="fact-card">
      <span class="svc-n">0${i + 1}</span>
      <b><button class="fact-open" type="button" data-area="${f.id}">${f.n}</button></b>
      <span class="fact-l">${f.l}</span>
      <div class="format-foot">
        <span class="format-more">${t.formats.more}</span>
        <button type="button" class="btn btn-sm" data-area-contact="${f.id}">${t.formats.contactCta}</button>
      </div>
    </li>`).join('');
  $('#cv-row-link').textContent = t.hero.cvLabel;
  $('#roles-open').textContent = t.roles.introLabel;
  $('#cta-experience').textContent = t.hero.ctaExperience;
  $('#cta-consulting').textContent = t.hero.ctaConsulting;
  $('#cta-projects').textContent = t.hero.ctaProjects;
  $('#cta-feed').textContent = t.hero.ctaFeed;
  $('#cta-contact').textContent = t.hero.ctaContact;

  $('#consulting-title').textContent = t.consulting.title;
  $('#consulting-sub').textContent = t.consulting.noteLabel;
  $('#formats').innerHTML = `
    <div class="formats-head"><h3>${t.formats.title}</h3><p class="sub">${t.formats.subtitle}</p></div>
    <div class="formats-grid snap snap-fit">${t.formats.items.map((f) => `
      <article class="format" data-format="${f.n}">
        <span class="svc-n">${f.n}</span>
        <h4>${f.title}</h4>
        <span class="format-term">${f.term}</span>
        <p>${f.body}</p>
        <div class="format-foot">
          <span class="format-more">${t.formats.more}</span>
          <button type="button" class="btn btn-sm" data-format-card-contact="${f.n}">${t.formats.contactCta}</button>
        </div>
      </article>`).join('')}</div>
    <p class="launch-diag-row"><button type="button" class="btn" id="diag-open">${t.diagnostic.label}</button></p>`;

  /* Раздел «Публикации» имеет смысл только когда их больше одной —
     иначе множественное число в заголовке расходится с содержимым. */
  const hasMedia = t.media.items.length > 0;
  $('#media').hidden = !hasMedia;
  document.querySelector('[data-nav="media"]').hidden = !hasMedia;
  $('#media-title').textContent = t.media.title;
  $('#media-sub').textContent = t.media.subtitle;
  $('#media-list').innerHTML = t.media.items.map((m) => {
    const d = new Intl.DateTimeFormat(lang === 'ru' ? 'ru-RU' : 'en-GB',
      { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(m.date));
    return `<article class="media-item">
      <div class="media-meta"><span class="media-outlet">${m.outlet}</span><time datetime="${m.date}">${d}</time></div>
      <h3>${m.title}</h3>
      <blockquote>${m.quote}</blockquote>
      <p class="media-note">${m.note}</p>
      <a class="btn btn-sm" href="${m.href}" target="_blank" rel="noopener">${t.media.read}</a>
    </article>`;
  }).join('');

  $('#burger').setAttribute('aria-label', t.hero.navLabel ?? 'Menu');
  $('#press-title').textContent = t.press.title;
  $('#press-sub').textContent = t.press.subtitle;
  $('#press-body').innerHTML = `
    <div class="press-bio">
      <div class="press-item"><h3>${t.press.shortLabel}</h3><p id="bio-short">${t.press.short}</p>
        <button class="btn btn-sm" type="button" data-copy="bio-short">${t.press.copy}</button></div>
      <div class="press-item"><h3>${t.press.longLabel}</h3><p id="bio-long">${t.press.long}</p>
        <button class="btn btn-sm" type="button" data-copy="bio-long">${t.press.copy}</button></div>
      <div class="press-item"><h3>${t.press.photoLabel}</h3>
        <a class="btn btn-sm" href="/assets/photo/${lang === 'en' ? 'petr-ny' : 'petr-formal'}.jpg" download>${t.press.photoBtn}</a></div>
    </div>
    <div class="press-side">
      <h3>${t.press.topicsLabel}</h3>
      <ul>${t.press.topics.map((x) => `<li>${x}</li>`).join('')}</ul>
    </div>`;

  $('#consent-text').textContent = t.contact.consent;
  $('#consent-link').textContent = t.contact.consentLink;
  $('#consent-link').href = lang === 'en' ? '/en/privacy' : '/privacy';
  const fp = $('#footer-privacy');
  if (fp) { fp.textContent = t.contact.consentLink; fp.href = lang === 'en' ? '/en/privacy' : '/privacy'; }
  const ci = $('#cta-investors');
  if (ci) ci.textContent = lang === 'en' ? 'Partnership' : 'Партнёрство';
  $('#vcard').textContent = t.contact.vcard;
  $('#share-contact').textContent = t.contact.shareContact;
  syncSubmit?.();
  $('#deck-open').textContent = t.consulting.deckOpen;
  $('#deck-pdf').textContent = t.consulting.deckPdf;
  $('#deck-pdf').href = t.consulting.deckFile;
  $('#deck-pdf-2').href = t.consulting.deckFile;
  $('#services').className = "services snap snap-fit";
  $('#services').innerHTML = t.consulting.items.map((it, i) => `
    <li>
      <button class="svc" type="button" data-svc="${i}">
        <span class="svc-n">0${i + 1}</span>
        <span class="svc-t">${it.title}</span>
        <span class="svc-b">${it.body}</span>
        <span class="svc-d"><b>${t.consulting.decisionLabel}</b>${it.decision}</span>
        <span class="svc-more">${t.projects.open} →</span>
      </button>
    </li>`).join('');

  $('#projects-title').textContent = t.projects.title;
  $('#projects-sub').textContent = t.projects.subtitle;
  renderCards();
  renderInvestors();

  /* Продуктовые проекты выше — доказательство, а не витрина: тем, кто
     досмотрел до конца раздела, предлагаем тот же путь для своей задачи. */
  $('#project-launch').innerHTML = `
    <div class="formats-head">
      <h3>${t.projects.launch.title}</h3><p class="sub">${t.projects.launch.subtitle}</p>
    </div>
    <div class="formats-grid snap snap-fit">${t.projects.launch.items.map((f) => `
      <article class="format" data-launch-open="${f.id}" data-format-id="${f.id}">
        <span class="svc-n">${f.n}</span>
        <h4>${f.title}</h4>
        <span class="format-term">${f.term}</span>
        <p>${f.body}</p>
        <div class="format-foot">
          <span class="format-more">${t.projects.launch.more}</span>
          <button type="button" class="btn btn-sm" data-launch-contact="${f.id}">${t.projects.launch.contact}</button>
        </div>
      </article>`).join('')}</div>
    <p class="launch-diag-row"><button type="button" class="btn" data-launch-diag-open>${t.projects.launch.diag.label}</button></p>`;

  $('#contact-title').textContent = t.contact.title;
  $('#contact-sub').textContent = t.contact.subtitle;
  $('#persona-picker').innerHTML = `<span class="persona-label">${t.contact.personaLabel}</span>
    ${t.contact.personas.map((p) => `<button type="button" class="persona-chip" data-persona-topic="${p.topic}">${p.label}</button>`).join('')}`;

  document.querySelectorAll('[data-f]').forEach((s) => { s.textContent = t.contact[s.dataset.f]; });
  $('#submit').textContent = t.contact.send;
  $('#file-btn').textContent = t.contact.fileChoose;
  $('#file-hint').textContent = t.contact.fileHint;
  $('#file-clear').textContent = t.contact.fileClear;
  $('#direct-title').textContent = t.contact.directTitle;
  $('#privacy').textContent = t.contact.privacy;

  const topic = $('#topic');
  const keep = topic.value;
  topic.innerHTML = Object.entries(t.contact.topics)
    .map(([k, v]) => `<option value="${k}">${v}</option>`).join('');
  if (keep) topic.value = keep;
  syncTopicOther?.();

  $('#contacts').innerHTML = CONTACTS.map((c) => `
    <li><span class="lbl">${c.label[lang] ?? c.label}</span>
      ${c.qr ? `<button class="qr-trigger" type="button" data-qr="${c.qr}" aria-label="${t.contact.qrAlt}">
        <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
          <rect x="3" y="3" width="7" height="7" fill="none" stroke="currentColor" stroke-width="1.6"/>
          <rect x="14" y="3" width="7" height="7" fill="none" stroke="currentColor" stroke-width="1.6"/>
          <rect x="3" y="14" width="7" height="7" fill="none" stroke="currentColor" stroke-width="1.6"/>
          <rect x="14.5" y="14.5" width="2.3" height="2.3" fill="currentColor"/>
          <rect x="18.7" y="14.5" width="2.3" height="2.3" fill="currentColor"/>
          <rect x="14.5" y="18.7" width="2.3" height="2.3" fill="currentColor"/>
          <rect x="18.7" y="18.7" width="2.3" height="2.3" fill="currentColor"/>
        </svg>
      </button>` : ''}
      <a href="${c.href}" target="_blank" rel="noopener">${c.value}</a></li>`).join('');

  $('#year').textContent = new Date().getFullYear();
  renderNow();
  renderNews();
  addTopButtons(t.nav.toTop);
  syncSnaps();
  if (modal.open) openProject(modal.dataset.project);
  if (deckModal.open) renderDeck();
  if (diagModal.open) renderDiagnostic();
  if (launchDiagModal.open) renderLaunchDiag();
  if (leakModal.open) renderLeakQuiz();
  if (pnModal.open) openProjectNews(pnModal.dataset.project);
  if (infoModal.open) showInfo(infoModal.dataset.view ?? '');
  if (compareModal.open) openCompare(compareModal.dataset.project);
}

/* Язык — это адрес: русская страница «/», английская «/en/». Переключатель ведёт на двойника,
   чтобы ссылка, которой делятся, и заголовок страницы совпадали с тем, что видит человек. */
$('#lang-toggle').addEventListener('click', () => {
  const next = lang === 'ru' ? 'en' : 'ru';
  store.set('lang', next);
  location.href = (next === 'en' ? '/en/' : '/') + location.search + location.hash;
});

/* ---------- часы в шапке: день недели, дата и время идут в часовом поясе посетителя ---------- */
function renderClock() {
  const el = $('#clock');
  if (!el) return;
  const locale = lang === 'ru' ? 'ru-RU' : 'en-GB';
  const now = new Date();
  const date = new Intl.DateTimeFormat(locale, { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' }).format(now);
  const time = new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(now);
  el.textContent = `${date} · ${time}`;
}
setInterval(renderClock, 1000);

/* ---------- тема ---------- */
const savedTheme = store.get('theme');
if (savedTheme) document.documentElement.dataset.theme = savedTheme;
$('#theme-toggle').addEventListener('click', () => {
  const dark = matchMedia('(prefers-color-scheme:dark)').matches;
  const current = document.documentElement.dataset.theme || (dark ? 'dark' : 'light');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = next;
  store.set('theme', next);
});

/* ---------- размер текста ----------
   Один переключатель на все размеры экрана: цикл идёт от крупного к
   мелкому — самый крупный (+30%) → крупнее (+15%) → обычный → снова
   самый крупный. На ноутбуке и планшете самый крупный размер — исходный
   по умолчанию (кто читает с монитора, не щурится), на телефоне — обычный,
   там и без масштабирования текст уже занимает весь экран. Дополнительно
   на широком мониторе раздвигает колонку контента (см. правило в styles.css). */
const TEXT_SIZES = ['xl', 'lg', 'normal'];
function applyTextSize(size) {
  if (size === 'normal') delete document.documentElement.dataset.textSize;
  else document.documentElement.dataset.textSize = size;
  const label = T[lang].nav.textSize?.[size] ?? 'Text size';
  $('#text-size-toggle').setAttribute('aria-label', label);
  $('#text-size-toggle').title = label;
  /* zoom не поднимает событие resize — карусели (.snap) не пересчитают
     свою геометрию сами, пока их кто-то не попросит. Ждём кадр, чтобы
     браузер успел применить новый zoom перед замером ширины. */
  requestAnimationFrame(() => requestAnimationFrame(syncSnaps));
}
const defaultTextSize = innerWidth >= 768 ? 'xl' : 'normal';
const savedTextSize = store.get('textSize', defaultTextSize);
applyTextSize(TEXT_SIZES.includes(savedTextSize) ? savedTextSize : defaultTextSize);
$('#text-size-toggle').addEventListener('click', () => {
  const current = document.documentElement.dataset.textSize || 'normal';
  const next = TEXT_SIZES[(TEXT_SIZES.indexOf(current) + 1) % TEXT_SIZES.length];
  applyTextSize(next);
  store.set('textSize', next);
});

/* ---------- модалка проекта ---------- */
const modal = $('#modal');
const gallery = $('#gallery');

function openProject(id, anchor) {
  const p = PROJECTS.find((x) => x.id === id);
  if (!p) return;
  const t = T[lang];
  const c = p[lang];

  /* просмотрщик относится к прежнему проекту — закрываем его вместе со сменой */
  viewer.close();
  modal.dataset.project = id;
  $('#modal-logo').innerHTML = LOGOS[p.id];
  $('#modal-tagline').textContent = c.tagline;
  $('#modal-stage').textContent = c.stage;
  $('#modal-roadmap').innerHTML = !c.roadmap ? '' : c.roadmap.map((r) => `
    <li class="roadmap-step roadmap-${r.state}">${r.label}</li>`).join('');

  /* Первым кадром — видео прохода по разделам: оно доказывает, что продукт работает.
     poster держит первый экран, пока видео грузится, и остаётся вместо него,
     если браузер не умеет WebM. */
  const frames = [];
  if (p.video) {
    frames.push(`
      <div class="frame ${p.device} has-video">
        <video poster="${p.shots[0]}" muted loop playsinline preload="none"
               data-src="${p.video}" aria-label="${p.name}"></video>
        <button class="play" type="button" aria-label="${T[lang].projects.play}">
          <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M8 5v14l11-7z" fill="currentColor"/></svg>
        </button>
      </div>`);
  }
  frames.push(...p.shots.map((src, i) => `
    <div class="frame ${p.device}"><img src="${src}" alt="${p.name} — ${i + 1}" loading="lazy"></div>`));

  gallery.innerHTML = frames.join('');
  /* Общий список для просмотрщика — в том же порядке, что и кадры в ленте:
     видео (если есть) первым, дальше снимки. Так стрелками можно листать
     видео и фото вместе, одним списком. */
  const mediaList = [];
  if (p.video) mediaList.push({ src: p.video, poster: p.shots[0], alt: p.name, type: 'video' });
  [...gallery.querySelectorAll('img')].forEach((img) => mediaList.push({ src: img.src, alt: img.alt }));
  gallery.querySelectorAll('img').forEach((img, i) => {
    img.addEventListener('click', () => openPhoto(mediaList, i + (p.video ? 1 : 0)));
  });
  if (p.video) {
    const videoFrame = gallery.querySelector('.frame.has-video');
    videoFrame?.addEventListener('click', (e) => {
      if (e.target.closest('.play')) return; // маленькую inline-плашку не трогаем
      openPhoto(mediaList, 0);
    });
  }
  $('#dots').innerHTML = frames.map((_, i) =>
    `<button class="dot" type="button" data-i="${i}" aria-current="${i === 0}" aria-label="${i + 1}"></button>`).join('');

  $('#facts').innerHTML = ['what', 'who', 'why', 'how']
    .map((k) => `<div><dt>${t.projects.labels[k]}</dt><dd>${c[k]}</dd></div>`).join('');

  const st = c.status;
  const s = t.projects.status;
  if (!st) {
    $('#status').innerHTML = '';
  } else {
    const total = st.done.length + st.now.length + st.next.length;
    const pct = (n) => (total ? Math.round((n / total) * 100) : 0);
    $('#status').innerHTML = `
      <h3>${s.title}</h3>
      <div class="status-bar" role="img" aria-label="${s.title}: ${pct(st.done.length)}%">
        <span class="sb-done" style="width:${pct(st.done.length)}%"></span>
        <span class="sb-now" style="width:${pct(st.now.length)}%"></span>
      </div>
      <div class="status-grid">
        ${[['done', st.done], ['now', st.now], ['next', st.next]].map(([k, list]) => `
          <div class="status-col status-${k}">
            <h4>${s[k]}</h4>
            <ul>${list.map((i) => `<li>${i}</li>`).join('')}</ul>
          </div>`).join('')}
      </div>
      ${st.seeking ? `<p class="seeking"><b>${s.seeking}</b>${st.seeking}</p>` : ''}`;
  }

  /* Форматы участия: человеку должно быть понятно, чем он может быть полезен
     и что получит взамен, — без этого «обсудить участие» повисает в воздухе. */
  $('#collab').innerHTML = !c.collab ? '' : `
    <h3>${t.projects.collabTitle}</h3>
    <ul class="collab-list">
      ${c.collab.map((i) => `<li><b>${i.k}</b><span>${i.v}</span></li>`).join('')}
    </ul>
    <p class="collab-note">${t.projects.collabNote}</p>
    ${c.investor ? `<p class="investor-note"><b>${t.projects.investorLabel}</b>${c.investor.note}</p>` : ''}
    `;

  /* Подробный разбор проекта есть у Syntha, ChatX и Renova, и только по-русски. */
  const more = $('#modal-more');
  if (more) {
    const есть = ['syntha', 'chatx', 'renova', 'mfw', 'promomed'].includes(id);
    more.hidden = !есть;
    if (есть) more.href = lang === 'en' ? `/en/${id}` : `/${id}`;
    more.textContent = t.projects.more_about ?? more.textContent;
  }

  $('#modal-cta').textContent = t.projects.discuss;
  gallery.scrollLeft = 0;
  /* видео меняет ширину дорожки после загрузки метаданных — возвращаем в начало */
  requestAnimationFrame(() => { gallery.scrollLeft = 0; });
  if (!modal.open) modal.showModal();
  const body = modal.querySelector('.modal-body');
  body.scrollTop = 0;
  /* экраны грузятся лениво и меняют высоту — прокручиваем следующим кадром */
  if (anchor === 'status') requestAnimationFrame(() => $('#status').scrollIntoView({ block: 'start' }));
}

/* Закрыть раскрытую ленту (кнопкой ✕ внутри неё или повторным кликом по тумблеру):
   одна точка выхода, чтобы состояние тумблера и наблюдателя не расходились. */
function closeFlow() {
  const embed = $('#flow-embed');
  if (!embed || embed.hidden) return;
  embed.hidden = true;
  $('[data-flow-toggle]')?.setAttribute('aria-expanded', 'false');
  flowOpen = false;
  if (flowObserver) flowObserver.disconnect();
}

$('#cards').addEventListener('click', (e) => {
  /* визуализация сезона живёт внутри карточки Syntha — клики в ней не должны
     открывать модалку проекта, только свои переходы */
  if (e.target.closest('.flow-embed')) {
    const closeBtn = e.target.closest('[data-flow-close]');
    if (closeBtn) return closeFlow();
    const area = e.target.closest('[data-open-area]');
    if (area) return go(`area-${area.dataset.openArea}`);
    if (e.target.closest('[data-open-syntha]')) return go('syntha');
    return;
  }
  const flowToggle = e.target.closest('[data-flow-toggle]');
  if (flowToggle) {
    const embed = $('#flow-embed');
    if (!embed.hidden) return closeFlow();
    flowOpen = true;
    embed.hidden = false;
    flowToggle.setAttribute('aria-expanded', 'true');
    renderSeasonFlow();
    requestAnimationFrame(() => embed.scrollIntoView({ block: 'nearest', behavior: 'smooth' }));
    return;
  }
  const news = e.target.closest('[data-news]');
  if (news) return go(`${news.dataset.news}-news`);
  const status = e.target.closest('[data-status]');
  if (status) return go(`${status.dataset.status}-status`);
  const compareBtn = e.target.closest('[data-compare]');
  if (compareBtn) return go(`${compareBtn.dataset.compare}-compare`);
  if (e.target.closest('[data-leak-open]')) { leakAnswers = []; return go('leak-quiz'); }
  const needBtn = e.target.closest('[data-need-open]');
  if (needBtn) return go(`need-${needBtn.dataset.needOpen}`);
  const open = e.target.closest('[data-open]');
  if (open) return go(open.dataset.open);
  const card = e.target.closest('[data-project]');
  if (card) go(card.dataset.project);
});
$('#modal-close').addEventListener('click', () => leaveAll());
modal.addEventListener('click', (e) => { if (e.target === modal) leaveAll(); });

$('#dots').addEventListener('click', (e) => {
  const d = e.target.closest('.dot');
  if (!d) return;
  const frame = gallery.children[+d.dataset.i];
  if (frame) gallery.scrollTo({ left: frame.offsetLeft - gallery.offsetLeft, behavior: 'smooth' });
});
gallery.addEventListener('scroll', () => {
  const center = gallery.scrollLeft + gallery.clientWidth / 2;
  let active = 0;
  [...gallery.children].forEach((f, i) => {
    if (f.offsetLeft - gallery.offsetLeft < center) active = i;
  });
  [...$('#dots').children].forEach((d, i) => d.setAttribute('aria-current', String(i === active)));
});
gallery.addEventListener('keydown', (e) => {
  if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
  e.preventDefault();
  const step = gallery.children[0]?.offsetWidth + 16 || 240;
  gallery.scrollBy({ left: e.key === 'ArrowRight' ? step : -step, behavior: 'smooth' });
});

/* Видео не грузится и не играет, пока его не запустят: на мобильном интернете
   три ролика при открытии окна — заметный трафик. */
gallery.addEventListener('click', (e) => {
  const btn = e.target.closest('.play');
  if (!btn) return;
  const frame = btn.closest('.frame');
  const v = frame.querySelector('video');
  if (!v.currentSrc && !v.children.length) {
    /* Первым идёт MP4: iOS декодирует его аппаратно, WebM — программно.
       Браузер сам возьмёт из списка первый формат, который умеет. */
    const webm = v.dataset.src;
    const mp4 = webm.replace(/\.webm$/, '.mp4');
    for (const [src, type] of [[mp4, 'video/mp4'], [webm, 'video/webm']]) {
      const source = document.createElement('source');
      source.src = src;
      source.type = type;
      v.append(source);
    }
    v.load();
  }
  v.play().then(() => frame.classList.add('playing')).catch(() => {});
});

$('#projects-more').addEventListener('click', () => {
  projectsExpanded = !projectsExpanded;
  renderCards();
  syncSnaps();
  if (!projectsExpanded) $('#projects').scrollIntoView({ block: 'start' });
});

/* «Обсудить участие» — переносит проект в форму */
$('#modal-cta').addEventListener('click', () => {
  $('#topic').value = modal.dataset.project;
  leave();
  $('#contact').scrollIntoView({ behavior: 'smooth' });
  setTimeout(() => $('#form [name="name"]').focus(), 400);
});

/* ---------- новости в верхней панели: свежие публикации сменяют друг друга ---------- */
function renderNow() {
  const post = $('#top-news');
  clearInterval(nowTimer);
  const recent = SITE_NEWS.filter(hasLang).slice(0, 6);
  if (!recent.length) { post.hidden = true; return; }
  post.hidden = false;
  const fmt = new Intl.DateTimeFormat(lang === 'ru' ? 'ru-RU' : 'en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' });
  let idx = 0;
  const paint = () => {
    const p = recent[idx];
    post.dataset.date = p.date;
    post.title = postText(p).title;
    post.querySelector('.top-news-date').textContent = fmt.format(new Date(p.date)).replace('.', '');
    post.querySelector('.top-news-title').textContent = postText(p).title;
  };
  paint();
  if (recent.length > 1) {
    let paused = false;
    post.onmouseenter = post.onfocus = () => { paused = true; };
    post.onmouseleave = post.onblur = () => { paused = false; };
    nowTimer = setInterval(() => {
      if (paused || document.hidden) return;
      post.classList.add('swap');
      setTimeout(() => { idx = (idx + 1) % recent.length; paint(); post.classList.remove('swap'); }, 220);
    }, 12000);
  }
}
let nowTimer;
/* Переход по ссылке-якорю не вызывает applyHash — используем свой роутинг. */
$('#top-news').addEventListener('click', (e) => {
  e.preventDefault();
  const date = e.currentTarget.dataset.date;
  if (date) go(`post-${date}`);
});

/* ---------- «Где утекают деньги сезона»: раскрывается внутри карточки Syntha ----------
   Единственное место на сайте, где применяется вертикальный scroll-эффект: пять шагов
   подряд, IntersectionObserver подсвечивает текущий на рельсе слева (сверху на телефоне).
   Живёт свёрнутым внутри карточки проекта — раскрывается по клику на data-flow-toggle. */
let flowObserver = null;
let flowOpen = false;
function renderSeasonFlow() {
  const embed = $('#flow-embed');
  if (!embed) return;
  const t = T[lang].flow;
  const factsById = Object.fromEntries(T[lang].hero.facts.map((f) => [f.id, f.n]));

  embed.innerHTML = `
    <div class="flow-embed-head">
      <button type="button" class="flow-embed-close" data-flow-close="syntha" aria-label="${lang === 'ru' ? 'Свернуть' : 'Collapse'}">
        <svg viewBox="0 0 24 24" width="13" height="13" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="1.8" fill="none"/></svg>
      </button>
      <p class="flow-embed-eyebrow">${t.eyebrow}</p>
      <h4>${t.title}</h4>
      <p class="sub">${t.subtitle}</p>
    </div>
    <div class="season-track">
      <div class="season-rail" aria-hidden="true">
        <span class="season-rail-line"></span>
        ${t.steps.map((_, i) => `<span class="season-dot" data-dot="${i}"></span>`).join('')}
      </div>
      <ol class="season-steps">
        ${t.steps.map((st, i) => `
          <li class="season-step" data-step="${i}">
            <span class="season-n">${st.n}</span>
            <h3>${st.title}</h3>
            <p class="season-leak"><b>${t.leakLabel}</b>${st.leak}</p>
            <div class="season-links">
              <button type="button" class="season-chip" data-open-area="${st.area}">${t.consultingLabel} · ${factsById[st.area] ?? st.area}</button>
              <button type="button" class="season-chip season-chip-syntha" data-open-syntha>${t.synthaLabel} · ${st.contour}</button>
            </div>
          </li>`).join('')}
      </ol>
    </div>`;

  if (flowObserver) flowObserver.disconnect();
  if (embed.hidden) return;
  const steps = [...embed.querySelectorAll('.season-step')];
  const dots = [...embed.querySelectorAll('.season-dot')];
  const setActive = (i) => {
    steps.forEach((el, j) => el.classList.toggle('active', j === i));
    dots.forEach((el, j) => el.classList.toggle('active', j === i));
  };
  setActive(0);
  flowObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => { if (entry.isIntersecting) setActive(+entry.target.dataset.step); });
  }, { rootMargin: '-40% 0px -40% 0px', threshold: 0 });
  steps.forEach((el) => flowObserver.observe(el));
}

/* ---------- диагностика: пять вопросов → формат работы ---------- */
let diagAnswers = [];
function renderDiagnostic() {
  const t = T[lang].diagnostic;
  $('#diag-eyebrow').textContent = t.label;
  $('#diag-title').textContent = t.title;
  $('#diag-subtitle').textContent = t.subtitle;

  const step = diagAnswers.length;
  const body = $('#diag-body');

  if (step < t.questions.length) {
    const q = t.questions[step];
    body.innerHTML = `
      <div class="diag-progress">
        <span>${t.progress.replace('{i}', step + 1).replace('{n}', t.questions.length)}</span>
        <div class="diag-bar"><span style="width:${Math.round((step / t.questions.length) * 100)}%"></span></div>
      </div>
      <h3 class="diag-q">${q.q}</h3>
      <div class="diag-options">
        ${q.options.map((o) => `<button type="button" class="diag-opt" data-f="${o.f}">${o.t}</button>`).join('')}
      </div>
      ${step > 0 ? `<button type="button" class="diag-back">${t.back}</button>` : ''}`;
  } else {
    const counts = [0, 0, 0, 0];
    diagAnswers.forEach((f) => counts[f]++);
    const bestIdx = counts.indexOf(Math.max(...counts));
    const fmt = T[lang].formats.items[bestIdx];
    /* результат виден не только в модалке: у нужного формата в разделе
       «Форматы работы» на странице появляется рамка */
    document.querySelectorAll('.format').forEach((el) => el.classList.remove('diag-match'));
    document.querySelector(`.format[data-format="${fmt.n}"]`)?.classList.add('diag-match');
    body.innerHTML = `
      <div class="diag-result">
        <p class="diag-result-label">${t.resultLabel}</p>
        <h3>${fmt.title}</h3>
        <span class="diag-term">${fmt.term}</span>
        <p class="diag-result-body">${fmt.body}</p>
        <p class="diag-note">${t.resultNote}</p>
        <div class="diag-actions">
          <button type="button" class="btn btn-primary" data-diag-cta="${bestIdx}">${t.cta}</button>
          <button type="button" class="btn" data-diag-more="${bestIdx}">${t.ctaMore}</button>
        </div>
        <button type="button" class="diag-retake">${t.retake}</button>
      </div>`;
  }
}
$('#diag-body').addEventListener('click', (e) => {
  const opt = e.target.closest('.diag-opt');
  if (opt) {
    window.track?.('quiz_step', String(diagAnswers.length + 1), opt.textContent);
    diagAnswers.push(+opt.dataset.f);
    if (diagAnswers.length === T[lang].diagnostic.questions.length) {
      const c = [0, 0, 0, 0]; diagAnswers.forEach((f) => c[f]++);
      window.track?.('quiz_result', '', T[lang].formats.items[c.indexOf(Math.max(...c))].title);
    }
    return renderDiagnostic();
  }
  if (e.target.closest('.diag-back')) { diagAnswers.pop(); return renderDiagnostic(); }
  if (e.target.closest('.diag-retake')) { diagAnswers = []; return renderDiagnostic(); }
  const more = e.target.closest('[data-diag-more]');
  if (more) { diagModal.close(); return go(`format-${T[lang].formats.items[+more.dataset.diagMore].n}`); }
  const cta = e.target.closest('[data-diag-cta]');
  if (cta) {
    const t = T[lang].diagnostic;
    const fmt = T[lang].formats.items[+cta.dataset.diagCta];
    $('#topic').value = 'consulting';
    const msgEl = $('#form [name="message"]');
    if (msgEl && !msgEl.value.trim()) msgEl.value = t.messagePrefix + fmt.title + t.messageSuffix;
    syncSubmit?.();
    leave();
    requestAnimationFrame(() => $('#contact').scrollIntoView({ behavior: 'smooth' }));
    setTimeout(() => $('#form [name="name"]').focus(), 400);
  }
});

/* ---------- диагностика: модалка с тестом ----------
   openDiagnosticModal() ничего не сбрасывает: к ней возвращается и клик
   по кнопке входа, и «назад» из карточки формата, открытой изнутри
   результата, — во втором случае результат должен остаться на месте. */
const diagModal = $('#diag-modal');
function openDiagnosticModal() {
  renderDiagnostic();
  if (!diagModal.open) diagModal.showModal();
  diagModal.querySelector('.modal-body').scrollTop = 0;
}
document.addEventListener('click', (e) => { if (e.target.closest('#diag-open')) { diagAnswers = []; go('diagnostic'); } });
$('#diag-close').addEventListener('click', () => leaveAll());
diagModal.addEventListener('click', (e) => { if (e.target === diagModal) leaveAll(); });

/* ---------- диагностика: три вопроса → формат запуска собственного проекта ----------
   Тот же механизм, что у теста форматов консалтинга, только три категории
   вместо четырёх и результат ведёт в форму с темой «Другое», а не «Консалтинг». */
let launchDiagAnswers = [];
function renderLaunchDiag() {
  const t = T[lang].projects.launch.diag;
  $('#launch-diag-eyebrow').textContent = t.label;
  $('#launch-diag-title').textContent = t.title;
  $('#launch-diag-subtitle').textContent = t.subtitle;

  const step = launchDiagAnswers.length;
  const body = $('#launch-diag-body');

  if (step < t.questions.length) {
    const q = t.questions[step];
    body.innerHTML = `
      <div class="diag-progress">
        <span>${t.progress.replace('{i}', step + 1).replace('{n}', t.questions.length)}</span>
        <div class="diag-bar"><span style="width:${Math.round((step / t.questions.length) * 100)}%"></span></div>
      </div>
      <h3 class="diag-q">${q.q}</h3>
      <div class="diag-options">
        ${q.options.map((o) => `<button type="button" class="diag-opt" data-f="${o.f}">${o.t}</button>`).join('')}
      </div>
      ${step > 0 ? `<button type="button" class="diag-back">${t.back}</button>` : ''}`;
  } else {
    const counts = T[lang].projects.launch.items.map(() => 0);
    launchDiagAnswers.forEach((f) => counts[f]++);
    const bestIdx = counts.indexOf(Math.max(...counts));
    const fmt = T[lang].projects.launch.items[bestIdx];
    document.querySelectorAll('.project-launch .format').forEach((el) => el.classList.remove('diag-match'));
    document.querySelector(`.project-launch .format[data-format-id="${fmt.id}"]`)?.classList.add('diag-match');
    body.innerHTML = `
      <div class="diag-result">
        <p class="diag-result-label">${t.resultLabel}</p>
        <h3>${fmt.title}</h3>
        <p class="diag-result-body">${fmt.body}</p>
        <p class="diag-note">${t.resultNote}</p>
        <div class="diag-actions">
          <button type="button" class="btn btn-primary" data-launch-diag-cta="${bestIdx}">${t.cta}</button>
          <button type="button" class="btn" data-launch-diag-more="${fmt.id}">${t.ctaMore}</button>
        </div>
        <button type="button" class="diag-retake">${t.retake}</button>
      </div>`;
  }
}
$('#launch-diag-body').addEventListener('click', (e) => {
  const opt = e.target.closest('.diag-opt');
  if (opt) { launchDiagAnswers.push(+opt.dataset.f); return renderLaunchDiag(); }
  if (e.target.closest('.diag-back')) { launchDiagAnswers.pop(); return renderLaunchDiag(); }
  if (e.target.closest('.diag-retake')) { launchDiagAnswers = []; return renderLaunchDiag(); }
  const more = e.target.closest('[data-launch-diag-more]');
  if (more) { launchDiagModal.close(); return go(`launch-${more.dataset.launchDiagMore}`); }
  const cta = e.target.closest('[data-launch-diag-cta]');
  if (cta) {
    const t = T[lang].projects.launch.diag;
    const fmt = T[lang].projects.launch.items[+cta.dataset.launchDiagCta];
    $('#topic').value = 'other';
    $('#topic-other').value = fmt.title;
    syncTopicOther();
    const msgEl = $('#form [name="message"]');
    if (msgEl && !msgEl.value.trim()) msgEl.value = t.messagePrefix + fmt.title + t.messageSuffix;
    syncSubmit?.();
    leave();
    requestAnimationFrame(() => $('#contact').scrollIntoView({ behavior: 'smooth' }));
    setTimeout(() => $('#form [name="name"]').focus(), 400);
  }
});

const launchDiagModal = $('#launch-diag-modal');
function openLaunchDiagModal() {
  renderLaunchDiag();
  if (!launchDiagModal.open) launchDiagModal.showModal();
  launchDiagModal.querySelector('.modal-body').scrollTop = 0;
}
$('#launch-diag-close').addEventListener('click', () => leaveAll());
launchDiagModal.addEventListener('click', (e) => { if (e.target === launchDiagModal) leaveAll(); });

/* ---------- мини-диагностика: где утекает сезон ----------
   Тот же механизм, что у большого теста форматов, но с четырьмя категориями
   утечки вместо четырёх форматов работы, и своя карточка результата. */
const LEAK_KEYS = ['plan', 'buying', 'sale', 'stock'];
let leakAnswers = [];
function renderLeakQuiz() {
  const t = T[lang].leakQuiz;
  $('#leak-title').textContent = t.title;
  $('#leak-subtitle').textContent = t.subtitle;

  const step = leakAnswers.length;
  const body = $('#leak-body');

  if (step < t.questions.length) {
    const q = t.questions[step];
    body.innerHTML = `
      <div class="diag-progress">
        <span>${t.progress.replace('{i}', step + 1).replace('{n}', t.questions.length)}</span>
        <div class="diag-bar"><span style="width:${Math.round((step / t.questions.length) * 100)}%"></span></div>
      </div>
      <h3 class="diag-q">${q.q}</h3>
      <div class="diag-options">
        ${q.options.map((o) => `<button type="button" class="diag-opt" data-leak="${o.leak}">${o.t}</button>`).join('')}
      </div>
      ${step > 0 ? '<button type="button" class="diag-back leak-back"></button>' : ''}`;
    const back = body.querySelector('.leak-back');
    if (back) back.textContent = t.back;
  } else {
    const counts = { plan: 0, buying: 0, sale: 0, stock: 0 };
    leakAnswers.forEach((k) => counts[k]++);
    const bestKey = LEAK_KEYS.reduce((a, b) => (counts[b] > counts[a] ? b : a));
    const res = t.results[bestKey];
    body.innerHTML = `
      <div class="diag-result">
        <p class="diag-result-label">${t.resultLabel}</p>
        <h3>${res.title}</h3>
        <p class="diag-result-body">${res.body}</p>
        <p class="diag-note">${t.resultNote}</p>
        <div class="diag-actions">
          <button type="button" class="btn btn-primary" data-leak-cta>${t.cta}</button>
          <button type="button" class="btn" data-leak-more="${res.area}">${t.ctaMore}</button>
        </div>
        <button type="button" class="diag-retake leak-retake"></button>
      </div>`;
    body.querySelector('.leak-retake').textContent = t.retake;
  }
}
$('#leak-body').addEventListener('click', (e) => {
  const opt = e.target.closest('.diag-opt');
  if (opt) { leakAnswers.push(opt.dataset.leak); return renderLeakQuiz(); }
  if (e.target.closest('.leak-back')) { leakAnswers.pop(); return renderLeakQuiz(); }
  if (e.target.closest('.leak-retake')) { leakAnswers = []; return renderLeakQuiz(); }
  const more = e.target.closest('[data-leak-more]');
  if (more) { leakModal.close(); return go(`area-${more.dataset.leakMore}`); }
  const cta = e.target.closest('[data-leak-cta]');
  if (cta) {
    const t = T[lang].leakQuiz;
    const counts = { plan: 0, buying: 0, sale: 0, stock: 0 };
    leakAnswers.forEach((k) => counts[k]++);
    const bestKey = LEAK_KEYS.reduce((a, b) => (counts[b] > counts[a] ? b : a));
    const res = t.results[bestKey];
    $('#topic').value = 'consulting';
    const msgEl = $('#form [name="message"]');
    if (msgEl && !msgEl.value.trim()) msgEl.value = t.messagePrefix + res.title + t.messageSuffix;
    syncSubmit?.();
    leave();
    requestAnimationFrame(() => $('#contact').scrollIntoView({ behavior: 'smooth' }));
    setTimeout(() => $('#form [name="name"]').focus(), 400);
  }
});

const leakModal = $('#leak-modal');
function openLeakModal() {
  renderLeakQuiz();
  if (!leakModal.open) leakModal.showModal();
  leakModal.querySelector('.modal-body').scrollTop = 0;
}
$('#leak-close').addEventListener('click', () => leaveAll());
leakModal.addEventListener('click', (e) => { if (e.target === leakModal) leaveAll(); });

/* ---------- новости ---------- */
/* Лента: сначала три последних поста выбранной категории (на телефоне листаются
   свайпом, точек столько же), остальное — по кнопке «Показать ещё», затем «Свернуть». */
function newsFirst() { return 3; }
let newsShown = newsFirst();

/* Разборы статей и рабочие материалы заканчиваются ссылкой отдельной
   строкой — выносим её из-под line-clamp, иначе у длинных постов
   источник обрезается вместе с текстом. */
function splitBodyLink(body) {
  const lines = body.split('\n');
  const last = lines[lines.length - 1].trim();
  if (/^(https?:\/\/|\/)\S+$/.test(last)) {
    return { text: lines.slice(0, -1).join('\n').trim(), href: last };
  }
  return { text: body, href: null };
}

/* Фильтр ленты по категории — null значит «всё». Список категорий
   строится из фактически встречающихся тегов, а не задаётся руками:
   так кнопка сама не появится для категории без единого поста. */
let newsFilter = null;
const filteredNews = () => {
  const pool = SITE_NEWS.filter(hasLang);
  return newsFilter ? pool.filter((p) => p.tag === newsFilter) : pool;
};

function renderNewsFilters() {
  const t = T[lang].news;
  const present = [...new Set(SITE_NEWS.filter(hasLang).map((p) => p.tag))];
  const order = ['analysis', 'market', 'product', 'syntha', 'chatx', 'renova', 'mission', 'investors', 'pilots', 'press'];
  const cats = order.filter((k) => present.includes(k));
  $('#news-filters').innerHTML = `
    <button type="button" class="news-filter" data-filter="" aria-pressed="${!newsFilter}">${t.filterAll}</button>
    ${cats.map((k) => `<button type="button" class="news-filter" data-filter="${k}" aria-pressed="${newsFilter === k}">${t.tags[k] ?? k}</button>`).join('')}`;
}
$('#news-filters').addEventListener('click', (e) => {
  const btn = e.target.closest('[data-filter]');
  if (!btn) return;
  newsFilter = btn.dataset.filter || null;
  newsShown = newsFirst();
  renderNews();
});

function renderNews() {
  const t = T[lang].news;
  $('#news-title').textContent = t.title;
  $('#news-sub').textContent = t.subtitle;
  $('#news-channel').textContent = t.channel;
  renderNewsFilters();

  const fmt = new Intl.DateTimeFormat(lang === 'ru' ? 'ru-RU' : 'en-GB',
    { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

  const list = filteredNews();
  $('#feed').className = 'feed snap snap-fit';
  $('#feed').innerHTML = list.slice(0, newsShown).map((p) => {
    const { text } = splitBodyLink(postText(p).body);
    return `
    <li class="post" id="post-${p.date}" data-post="${p.date}">
      <div class="post-meta">
        <time datetime="${p.date}">${fmt.format(new Date(p.date))}</time>
        <button type="button" class="post-tag" data-filter-tag="${p.tag}">${t.tags[p.tag] ?? p.tag}</button>
        ${p.images?.length ? `<img class="post-cover" src="${p.images[0]}" alt="" loading="lazy">` : ''}
        <button class="post-share" type="button" data-share="${p.date}" aria-label="${t.share}">
          <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
            <path d="M12 3v12M12 3L8 7m4-4l4 4M5 13v6a1 1 0 001 1h12a1 1 0 001-1v-6"
                  stroke="currentColor" stroke-width="1.7" fill="none"
                  stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
      <h3>${postText(p).title}</h3>
      ${p.source?.outlet ? `<p class="post-outlet">${p.source.outlet}</p>` : ''}
      <p>${text}</p>
      ${postText(p).tags?.length ? `<div class="post-chips">${postText(p).tags.map((tg) => `<span class="post-chip">${tg}</span>`).join('')}</div>` : ''}
      <span class="post-read">${t.read}</span>
    </li>`;
  }).join('');

  $('#news-contact').textContent = T[lang].contact.cta ?? (lang === 'en' ? 'Contact' : 'Связаться');
  const more = $('#news-more');
  const expanded = newsShown >= list.length;
  more.hidden = list.length <= newsFirst();
  more.textContent = expanded ? t.collapse : t.more;
  more.dataset.expanded = String(expanded);
  /* точки под лентой должны соответствовать числу показанных постов, а не прежней выборке */
  syncSnaps();
}

$('#news-more').addEventListener('click', () => {
  const list = filteredNews();
  newsShown = newsShown >= list.length ? newsFirst() : list.length;
  renderNews();
  if (newsShown !== list.length) $('#news').scrollIntoView({ block: 'start' });
});

/* ---------- чтение поста целиком ----------
   Абзацы вида «Метка: текст» (О чём материал, Разбор, Мнение аналитика,
   Выводы) рисуются структурными блоками — так разбор читается по частям,
   а не одним сплошным полотном текста. */
/* Только эти метки рисуются структурным блоком — иначе обычное
   предложение с двоеточием («В магазине продажи видно каждый день:
   что уходит...») ошибочно превращалось в заголовок. */
const POST_LABELS = [
  'О чём материал', 'Разбор', 'Мнение аналитика', 'Выводы',
  'Что изменилось', 'Что это даёт',
  'What the piece covers', 'The breakdown', 'Analyst’s take', 'Analyst\'s take', 'Takeaways',
  'What changed', 'What it gives you'
];
/* Блок после метки: обычные строки — абзацы, строки с «• » — маркированный список
   (так выводы читаются как пункты, а не одной стеной текста). */
function renderPostBlock(content) {
  let html = '';
  let items = [];
  const flush = () => {
    if (items.length) { html += `<ul>${items.map((i) => `<li>${i}</li>`).join('')}</ul>`; items = []; }
  };
  content.split('\n').forEach((line) => {
    const m = line.match(/^•\s+(.*)/);
    if (m) items.push(m[1].trim());
    else if (line.trim()) { flush(); html += `<p>${line.trim()}</p>`; }
  });
  flush();
  return html;
}
function renderPostBody(text) {
  return text.split('\n\n').map((block) => {
    const label = POST_LABELS.find((l) => block.startsWith(`${l}:`));
    return label
      ? `<div class="post-section"><b>${label}</b>${renderPostBlock(block.slice(label.length + 1).trim())}</div>`
      : renderPostBlock(block);
  }).join('');
}

/* ---------- «Проверить потребность»: короткий тест по ChatX и Renova ---------- */
const NEED_L = {
  ru: { step: 'Вопрос {i} из {n}', back: 'Назад', result: 'Что продукт может закрыть у вас', closes: 'Что закрывает', how: 'Как закрывает внутри', stage: 'Что уже есть и что впереди', partner: 'Что это значит для партнёра и инвестора', more: 'О проекте целиком' },
  en: { step: 'Question {i} of {n}', back: 'Back', result: 'What the product can close for you', closes: 'What it closes', how: 'How it works inside', stage: 'What exists and what is ahead', partner: 'What this means for a partner or investor', more: 'The full project page' }
};
function renderNeed() {
  const nc = T[lang].needCheck[needId], L = NEED_L[lang];
  $('#need-logo').innerHTML = LOGOS[needId];
  $('#need-title').textContent = nc.title;
  $('#need-subtitle').textContent = nc.subtitle;
  const body = $('#need-body');
  const step = needAnswers.length;
  if (step < nc.questions.length) {
    const q = nc.questions[step];
    body.innerHTML = `
      <div class="diag-progress">
        <span>${L.step.replace('{i}', step + 1).replace('{n}', nc.questions.length)}</span>
        <div class="diag-bar"><span style="width:${Math.round((step / nc.questions.length) * 100)}%"></span></div>
      </div>
      <h3 class="diag-q">${q.q}</h3>
      <div class="diag-options">${q.options.map((o, i) => `<button type="button" class="diag-opt" data-need-opt="${i}">${o.t}</button>`).join('')}</div>
      ${step > 0 ? `<button type="button" class="diag-back" data-need-back>${L.back}</button>` : ''}`;
    return;
  }
  const count = {};
  needAnswers.forEach((id) => { count[id] = (count[id] || 0) + 1; });
  const ranked = Object.entries(count).sort((a, b) => b[1] - a[1]).slice(0, 2).map(([id]) => id);
  const base = lang === 'en' ? '/en/' : '/';
  body.innerHTML = `
    <div class="diag-result">
      <p class="diag-result-label">${nc.resultLabel}</p>
      ${ranked.map((id) => { const n = nc.needs[id]; return `
        <section class="need-res">
          <h3>${n.title}</h3>
          <dl class="inv-gets">
            <div><dt>${L.closes}</dt><dd>${n.closes}</dd></div>
            <div><dt>${L.how}</dt><dd>${n.how}</dd></div>
            <div><dt>${L.stage}</dt><dd>${n.stage}</dd></div>
            <div><dt>${L.partner}</dt><dd>${n.partner}</dd></div>
          </dl>
        </section>`; }).join('')}
      <p class="diag-note">${nc.resultNote}</p>
      <div class="diag-actions">
        <button type="button" class="btn btn-primary" data-need-contact>${nc.ctaContact}</button>
        <a class="btn" href="${base}${needId}">${L.more}</a>
      </div>
      <button type="button" class="diag-retake" data-need-retake>${nc.retake}</button>
    </div>`;
  body.dataset.top = ranked.join(',');
}
function openNeed(id) {
  ctActive = false;
  needId = id; needAnswers = [];
  renderNeed();
  if (!needModal.open) needModal.showModal();
  needModal.querySelector('.modal-body').scrollTop = 0;
}
$('#need-close').addEventListener('click', () => leaveAll());
needModal.addEventListener('close', () => { if (location.hash.startsWith('#need-')) history.replaceState(null, '', location.pathname + location.search); });
needModal.addEventListener('click', (e) => { if (e.target === needModal) leaveAll(); });
$('#need-body').addEventListener('click', (e) => {
  if (ctActive) return;
  const nc = T[lang].needCheck?.[needId];
  if (!nc) return;
  const opt = e.target.closest('[data-need-opt]');
  if (opt) {
    const q = nc.questions[needAnswers.length];
    window.track?.('quiz_step', `${needId}-${needAnswers.length + 1}`, q.options[+opt.dataset.needOpt].t);
    needAnswers.push(q.options[+opt.dataset.needOpt].need);
    if (needAnswers.length === nc.questions.length) {
      const c = {}; needAnswers.forEach((n) => { c[n] = (c[n] || 0) + 1; });
      window.track?.('quiz_result', needId, nc.needs[Object.entries(c).sort((a, b) => b[1] - a[1])[0][0]].title);
    }
    return renderNeed();
  }
  if (e.target.closest('[data-need-back]')) { needAnswers.pop(); return renderNeed(); }
  if (e.target.closest('[data-need-retake]')) { needAnswers = []; return renderNeed(); }
  if (e.target.closest('[data-need-contact]')) {
    const top = ($('#need-body').dataset.top || '').split(',').filter(Boolean).map((id) => nc.needs[id].title).join('; ');
    const name = PROJECTS.find((p) => p.id === needId)?.name ?? needId;
    leaveAll();
    startContact({ topic: needId, message: lang === 'en' ? `I took the “${name}” need check. Result: ${top}. ` : `Прошёл проверку потребности «${name}». Результат: ${top}. ` });
  }
});

const postModal = $('#post-modal');
function openPostModal(date) {
  const p = SITE_NEWS.find((x) => x.date === date);
  if (!p) return false;
  const t = T[lang].news;
  const { text, href } = splitBodyLink(postText(p).body);
  const fmt = new Intl.DateTimeFormat(lang === 'ru' ? 'ru-RU' : 'en-GB',
    { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
  const dateEl = $('#post-modal-date');
  dateEl.textContent = fmt.format(new Date(p.date));
  dateEl.dateTime = p.date;
  $('#post-modal-tag').textContent = t.tags[p.tag] ?? p.tag;
  $('#post-modal-tag').dataset.filterTag = p.tag;
  $('#post-modal-title').textContent = postText(p).title;

  /* Источник, автор и оригинальное название — под заголовком, у своих
     постов о проектах их нет. */
  const outletEl = $('#post-modal-outlet');
  if (p.source?.outlet) {
    const bits = [p.source.outlet];
    if (p.source.author) bits.push(p.source.author);
    outletEl.textContent = bits.join(' · ');
    if (p.source.original) {
      outletEl.textContent += ` — ${t.original}: «${p.source.original}»`;
    }
    outletEl.hidden = false;
  } else outletEl.hidden = true;

  const imagesEl = $('#post-modal-images');
  if (p.images?.length) {
    imagesEl.innerHTML = p.images.map((src) => `<img src="${src}" alt="" loading="lazy">`).join('');
    const shots = [...imagesEl.querySelectorAll('img')].map((img) => ({ src: img.src, alt: '' }));
    imagesEl.querySelectorAll('img').forEach((img, i) => {
      img.addEventListener('click', () => openPhoto(shots, i));
    });
    imagesEl.hidden = false;
  } else imagesEl.hidden = true;

  /* Справка: о каком бренде/компании материал — не подменяет «О чём материал». */
  const subjectEl = $('#post-modal-subject');
  if (postText(p).subject) {
    subjectEl.innerHTML = `<b>${t.subjectLabel}</b><p>${postText(p).subject}</p>`;
    subjectEl.hidden = false;
  } else subjectEl.hidden = true;

  $('#post-modal-tags').innerHTML = (postText(p).tags ?? [])
    .map((tg) => `<span class="post-chip">${tg}</span>`).join('');

  $('#post-modal-body').innerHTML = renderPostBody(text);

  /* Пост про один из проектов — обязательно даём ссылку на его карточку. */
  const projectEl = $('#post-modal-project');
  const project = PROJECTS.find((x) => x.id === p.tag);
  if (project) {
    projectEl.textContent = `${t.openProject} ${project.name} →`;
    projectEl.dataset.project = project.id;
    projectEl.hidden = false;
  } else projectEl.hidden = true;

  const src = $('#post-modal-source');
  if (href) { src.href = href; src.hidden = false; src.textContent = t.source; }
  else src.hidden = true;

  /* Листание по публикациям того же проекта — тот же приём, что и в
     просмотрщике снимков (photo-prev/photo-next): стрелки по бокам и
     счётчик снизу, видны только когда у проекта больше одного поста. */
  const projList = postNavList(date);
  const idx = projList.findIndex((x) => x.date === date);
  const many = projList.length > 1 && idx !== -1;
  postModal.dataset.navDate = date;
  $('#post-prev').hidden = !many;
  $('#post-next').hidden = !many;
  $('#post-prev').setAttribute('aria-label', t.postPrev);
  $('#post-next').setAttribute('aria-label', t.postNext);
  $('#post-count').textContent = many ? `${idx + 1} / ${projList.length}` : '';

  if (!postModal.open) postModal.showModal();
  { const pb = postModal.querySelector('.modal-body'); if (pb) { pb.tabIndex = -1; pb.focus({ preventScroll: true }); } }
  postModal.querySelector('.modal-body').scrollTop = 0;
  return true;
}
/* Листаем те посты, что сейчас в ленте (с учётом выбранной категории);
   если пост открыт по ссылке и в выборку не входит — всю ленту. */
function postNavList(date) {
  const filtered = filteredNews();
  return filtered.some((x) => x.date === date) ? filtered : SITE_NEWS.filter(hasLang);
}
function stepPost(dir) {
  if (!postModal.dataset.navDate) return;
  const list = postNavList(postModal.dataset.navDate);
  const idx = list.findIndex((x) => x.date === postModal.dataset.navDate);
  if (idx === -1) return;
  const next = list[(idx + dir + list.length) % list.length];
  openPostModal(next.date);
}
$('#post-prev').addEventListener('click', () => stepPost(-1));
$('#post-next').addEventListener('click', () => stepPost(1));
postModal.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft') { e.preventDefault(); stepPost(-1); }
  if (e.key === 'ArrowRight') { e.preventDefault(); stepPost(1); }
});
$('#post-close').addEventListener('click', () => leaveAll());
postModal.addEventListener('click', (e) => { if (e.target === postModal) leaveAll(); });
$('#post-modal-tag').addEventListener('click', () => {
  newsFilter = $('#post-modal-tag').dataset.filterTag;
  newsShown = newsFirst();
  leaveAll();
  renderNews();
  $('#news').scrollIntoView({ block: 'start' });
});
$('#post-modal-project').addEventListener('click', (e) => {
  const id = e.currentTarget.dataset.project;
  postModal.close(true);
  go(id);
});

/* ---------- поделиться постом ----------
   У каждого поста свой адрес вида /#post-2026-09-23: по нему страница
   откроется и подсветит именно его, а подпись в тексте ведёт к автору. */
const postLink = (date) => `${location.origin}/#post-${date}`;

function sharePost(date) {
  const post = SITE_NEWS.find((p) => p.date === date);
  if (!post) return;
  const t = T[lang].news;
  const url = postLink(date);
  const title = postText(post).title;
  const text = `${title}\n\n${t.shareSign}`;

  /* На телефоне отдаём системному меню: оттуда пост уходит в любой канал. */
  if (navigator.share) {
    navigator.share({ title, text, url }).catch(() => {});
    return;
  }
  openShareMenu(date, url, title);
}

function openShareMenu(date, url, title) {
  document.querySelector('.share-menu')?.remove();
  const t = T[lang].news;
  const box = document.createElement('div');
  box.className = 'share-menu';
  const quoted = encodeURIComponent(`${title}\n\n${t.shareSign}`);
  box.innerHTML = `
    <a href="https://t.me/share/url?url=${encodeURIComponent(url)}&text=${quoted}"
       target="_blank" rel="noopener">${t.shareIn.tg}</a>
    <a href="https://wa.me/?text=${encodeURIComponent(url + '\n\n')}${quoted}"
       target="_blank" rel="noopener">${t.shareIn.wa}</a>
    <button type="button" data-copy="${url}">${t.shareIn.copy}</button>`;
  const anchor = document.querySelector(`[data-share="${date}"]`);
  anchor.after(box);
  box.querySelector('[data-copy]').addEventListener('click', async () => {
    const ok = await copyText(url);
    box.remove();
    /* Сообщаем об успехе только если он был: на http и в приватном режиме
       буфер недоступен, и тогда честнее показать саму ссылку. */
    toast(ok ? T[lang].news.copied : url);
  });
  setTimeout(() => document.addEventListener('click', function away(e) {
    if (!box.contains(e.target)) { box.remove(); document.removeEventListener('click', away); }
  }), 0);
}

/* navigator.clipboard живёт только на https, поэтому есть запасной путь. */
async function copyText(text) {
  try {
    if (navigator.clipboard?.writeText) { await navigator.clipboard.writeText(text); return true; }
  } catch { /* заблокировано настройками — пробуем по-старому */ }
  try {
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.append(area);
    area.select();
    const ok = document.execCommand('copy');
    area.remove();
    return ok;
  } catch { return false; }
}

function toast(text) {
  document.querySelector('.toast')?.remove();
  const el = document.createElement('div');
  el.className = 'toast';
  el.setAttribute('role', 'status');
  el.textContent = text;
  document.body.append(el);
  setTimeout(() => el.remove(), 2600);
}

$('#feed').addEventListener('click', (e) => {
  const btn = e.target.closest('[data-share]');
  if (btn) return sharePost(btn.dataset.share);
  const tagBtn = e.target.closest('[data-filter-tag]');
  if (tagBtn) {
    newsFilter = tagBtn.dataset.filterTag;
    newsShown = newsFirst();
    renderNews();
    $('#news').scrollIntoView({ block: 'start' });
    return;
  }
  const post = e.target.closest('[data-post]');
  if (post) go(`post-${post.dataset.post}`);
});

/* ---------- новости проекта ---------- */
const pnModal = $('#project-news');

function openProjectNews(id) {
  const p = PROJECTS.find((x) => x.id === id);
  if (!p) return;
  const t = T[lang];
  const posts = SITE_NEWS.filter((n) => n.tag === id && hasLang(n));
  const fmt = new Intl.DateTimeFormat(lang === 'ru' ? 'ru-RU' : 'en-GB',
    { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

  pnModal.dataset.project = id;
  $('#pn-logo').innerHTML = LOGOS[id];
  $('#pn-title').textContent = t.news.title;
  $('#pn-channel').textContent = t.news.channel;
  $('#pn-feed').innerHTML = posts.length
    ? posts.map((post) => `
      <li class="post" data-post="${post.date}">
        <div class="post-meta"><time datetime="${post.date}">${fmt.format(new Date(post.date))}</time></div>
        <h3>${post[lang].title}</h3>
        <p>${splitBodyLink(post[lang].body).text}</p>
        <span class="post-read">${t.news.read}</span>
      </li>`).join('')
    : `<li class="post"><p>${t.projects.newsEmpty}</p></li>`;

  if (!pnModal.open) pnModal.showModal();
  pnModal.querySelector('.modal-body').scrollTop = 0;
}

$('#pn-feed').addEventListener('click', (e) => {
  const post = e.target.closest('[data-post]');
  if (post) { pnModal.close(); go(`post-${post.dataset.post}`); }
});
$('#pn-close').addEventListener('click', () => leaveAll());
pnModal.addEventListener('click', (e) => { if (e.target === pnModal) leaveAll(); });

/* ---------- окно направления и формата ---------- */
const infoModal = $('#cv-modal');

const list = (title, arr) => !arr?.length ? '' :
  `<section class="info-list"><h3>${title}</h3><ul>${arr.map((x) => `<li>${x}</li>`).join('')}</ul></section>`;

function renderArea(id) {
  const t = T[lang];
  const f = t.hero.facts.find((x) => x.id === id);
  if (!f) return false;
  infoModal.dataset.view = `area-${id}`;
  $('#cv-title').textContent = f.n;
  $('#cv-note').textContent = f.lead;
  const items = t.hero.facts;
  const idx = items.findIndex((x) => x.id === id);
  const prev = items[(idx - 1 + items.length) % items.length];
  const next = items[(idx + 1) % items.length];
  $('#cv-body').innerHTML =
    list(t.area.doesLabel, f.does) +
    list(t.area.givesLabel, f.gives) +
    (f.results.length
      ? `<section class="info-list"><h3>${t.area.resultsLabel}</h3>
         <ul class="cv-results">${f.results.map((r) => `<li>${r}</li>`).join('')}</ul></section>`
      : '') +
    `<div class="format-nav">
       <button type="button" class="btn btn-sm" data-area-nav="${prev.id}">← ${prev.n}</button>
       <button type="button" class="btn btn-sm" data-area-nav="${next.id}">${next.n} →</button>
     </div>
     <button type="button" class="btn btn-primary format-contact" data-area-contact="${f.id}">${t.area.contactCta}</button>`;
  return true;
}

function renderFormat(n) {
  const t = T[lang];
  const items = t.formats.items;
  const idx = items.findIndex((x) => x.n === n);
  const f = items[idx];
  if (!f) return false;
  infoModal.dataset.view = `format-${n}`;
  $('#cv-title').textContent = f.title;
  $('#cv-note').textContent = f.lead ?? f.body;
  const prev = items[(idx - 1 + items.length) % items.length];
  const next = items[(idx + 1) % items.length];
  $('#cv-body').innerHTML =
    `<p class="info-term">${f.term}</p>` +
    list(t.formats.stepsLabel, f.steps) +
    list(t.formats.includesLabel, f.includes) +
    list(t.formats.outLabel, Array.isArray(f.out) ? f.out : [f.out]) +
    list(t.formats.needsLabel, f.needs) +
    list(t.formats.rhythmLabel, f.rhythm) +
    (f.fit ? `<p class="info-fit"><b>${t.formats.fitLabel}</b>${f.fit}</p>` : '') +
    (f.notFit ? `<p class="info-fit info-notfit"><b>${t.formats.notFitLabel}</b>${f.notFit}</p>` : '') +
    `<div class="format-nav">
       <button type="button" class="btn btn-sm" data-format-nav="${prev.n}">← ${prev.title}</button>
       <button type="button" class="btn btn-sm" data-format-nav="${next.n}">${next.title} →</button>
     </div>
     <button type="button" class="btn btn-primary format-contact" data-format-contact="${f.n}">${t.formats.contactCta}</button>`;
  return true;
}

function renderLaunch(id) {
  const t = T[lang];
  const items = t.projects.launch.items;
  const idx = items.findIndex((x) => x.id === id);
  const f = items[idx];
  if (!f) return false;
  infoModal.dataset.view = `launch-${id}`;
  $('#cv-title').textContent = f.title;
  $('#cv-note').textContent = f.lead ?? f.body;
  const prev = items[(idx - 1 + items.length) % items.length];
  const next = items[(idx + 1) % items.length];
  $('#cv-body').innerHTML =
    `<p class="info-term">${f.term}</p>` +
    list(t.formats.stepsLabel, f.steps) +
    list(t.formats.includesLabel, f.includes) +
    list(t.formats.outLabel, f.out) +
    list(t.formats.needsLabel, f.needs) +
    list(t.formats.rhythmLabel, f.rhythm) +
    (f.fit ? `<p class="info-fit"><b>${t.formats.fitLabel}</b>${f.fit}</p>` : '') +
    (f.notFit ? `<p class="info-fit info-notfit"><b>${t.formats.notFitLabel}</b>${f.notFit}</p>` : '') +
    `<div class="format-nav">
       <button type="button" class="btn btn-sm" data-launch-nav="${prev.id}">← ${prev.title}</button>
       <button type="button" class="btn btn-sm" data-launch-nav="${next.id}">${next.title} →</button>
     </div>
     <button type="button" class="btn btn-primary format-contact" data-launch-contact="${f.id}">${t.formats.contactCta}</button>`;
  return true;
}

function renderRolesHub() {
  const t = T[lang];
  infoModal.dataset.view = 'roles';
  $('#cv-title').textContent = t.roles.hubTitle;
  $('#cv-note').textContent = t.roles.hubNote;
  $('#cv-body').innerHTML = `
    <ul class="role-pick">
      ${t.roles.items.map((r) => `
        <li><button type="button" data-role-open="${r.n}">
          <b>${r.title} (${r.abbr})</b><span>${r.term}</span>
        </button></li>`).join('')}
    </ul>`;
  return true;
}

function renderRole(n) {
  const t = T[lang];
  const items = t.roles.items;
  const idx = items.findIndex((x) => x.n === n);
  const r = items[idx];
  if (!r) return false;
  infoModal.dataset.view = `role-${n}`;
  $('#cv-title').textContent = `${r.title} (${r.abbr})`;
  $('#cv-note').textContent = r.body;
  const prev = items[(idx - 1 + items.length) % items.length];
  const next = items[(idx + 1) % items.length];
  $('#cv-body').innerHTML =
    `<p class="info-term">${r.term}</p>` +
    list(t.roles.competenciesLabel, r.competencies) +
    (r.whyFit ? `<p class="info-fit"><b>${t.roles.whyFitLabel}</b>${r.whyFit}</p>` : '') +
    `<div class="format-nav">
       <button type="button" class="btn btn-sm" data-role-nav="${prev.n}">← ${prev.title}</button>
       <button type="button" class="btn btn-sm" data-role-nav="${next.n}">${next.title} →</button>
     </div>
     <div class="format-nav">
       <button type="button" class="btn btn-primary" data-role-contact="${r.n}">${t.roles.contactCta}</button>
       <button type="button" class="btn" data-role-cv="${r.n}">${t.hero.cvLabel}</button>
     </div>`;
  return true;
}

function showInfo(hash) {
  const ok = hash === 'roles' ? renderRolesHub()
           : hash.startsWith('area-') ? renderArea(hash.slice(5))
           : hash.startsWith('format-') ? renderFormat(hash.slice(7))
           : hash.startsWith('launch-') ? renderLaunch(hash.slice(7))
           : hash.startsWith('role-') ? renderRole(hash.slice(5)) : false;
  if (!ok) return false;
  if (!infoModal.open) infoModal.showModal();
  infoModal.querySelector('.modal-body').scrollTop = 0;
  return true;
}

/* Общий ход «связаться»: подставляем тему и текст, закрываем окна и ведём к форме. */
function startContact({ topic, topicOther, message }) {
  $('#topic').value = topic;
  if (topic === 'other') $('#topic-other').value = topicOther ?? '';
  syncTopicOther();
  const msgEl = $('#form [name="message"]');
  if (msgEl && message && !msgEl.value.trim()) msgEl.value = message;
  syncSubmit?.();
  leaveAll();
  requestAnimationFrame(() => $('#contact').scrollIntoView({ behavior: 'smooth' }));
  setTimeout(() => $('#form [name="name"]').focus(), 400);
}

$('#facts-bar').addEventListener('click', (e) => {
  const c = e.target.closest('[data-area-contact]');
  if (c) return contactFromArea(c.dataset.areaContact);
  const b = e.target.closest('[data-area]');
  if (b) go(`area-${b.dataset.area}`);
});
function contactFromArea(id) {
  const t = T[lang];
  const f = t.hero.facts.find((x) => x.id === id);
  if (!f) return;
  startContact({ topic: 'consulting', message: t.area.contactMessage.replace('{title}', f.n) });
}
$('#formats').addEventListener('click', (e) => {
  const c = e.target.closest('[data-format-card-contact]');
  if (c) {
    const f = T[lang].formats.items.find((x) => x.n === c.dataset.formatCardContact);
    return startContact({ topic: 'consulting', message: T[lang].formats.contactMessage.replace('{title}', f.title) });
  }
  const b = e.target.closest('[data-format]');
  if (b) go(`format-${b.dataset.format}`);
});
/* Карточка формата открывает подробное окно (как у консалтинга), кнопка
   «Связаться» ведёт сразу к форме, «Подобрать формат» — короткий тест. */
$('#project-launch').addEventListener('click', (e) => {
  if (e.target.closest('[data-launch-diag-open]')) { launchDiagAnswers = []; return go('launch-diagnostic'); }
  const group = T[lang].projects.launch;
  const c = e.target.closest('[data-launch-contact]');
  if (c) {
    const f = group.items.find((x) => x.id === c.dataset.launchContact);
    return startContact({ topic: 'other', topicOther: f.title, message: group.contactMessage.replace('{title}', f.title) });
  }
  const o = e.target.closest('[data-launch-open]');
  if (o) go(`launch-${o.dataset.launchOpen}`);
});
$('#roles-open').addEventListener('click', () => go('roles'));
$('#cv-close').addEventListener('click', () => leaveAll());
$('#cv-back').addEventListener('click', () => leave());
infoModal.addEventListener('click', (e) => { if (e.target === infoModal) leaveAll(); });
$('#cv-body').addEventListener('click', (e) => {
  const roleOpen = e.target.closest('[data-role-open]');
  if (roleOpen) return go(`role-${roleOpen.dataset.roleOpen}`);
  const nav = e.target.closest('[data-format-nav]');
  if (nav) return go(`format-${nav.dataset.formatNav}`);
  const areaNav = e.target.closest('[data-area-nav]');
  if (areaNav) return go(`area-${areaNav.dataset.areaNav}`);
  const areaContact = e.target.closest('[data-area-contact]');
  if (areaContact) return contactFromArea(areaContact.dataset.areaContact);
  const launchNav = e.target.closest('[data-launch-nav]');
  if (launchNav) return go(`launch-${launchNav.dataset.launchNav}`);
  const launchContact = e.target.closest('[data-launch-contact]');
  if (launchContact) {
    const group = T[lang].projects.launch;
    const f = group.items.find((x) => x.id === launchContact.dataset.launchContact);
    return startContact({ topic: 'other', topicOther: f.title, message: group.contactMessage.replace('{title}', f.title) });
  }
  const roleNav = e.target.closest('[data-role-nav]');
  if (roleNav) return go(`role-${roleNav.dataset.roleNav}`);
  const contact = e.target.closest('[data-format-contact]');
  const roleContact = e.target.closest('[data-role-contact]');
  if (contact || roleContact) {
    const t = T[lang];
    const group = contact ? t.formats : t.roles;
    const key = contact ? contact.dataset.formatContact : roleContact.dataset.roleContact;
    const f = group.items.find((x) => x.n === key);
    if (roleContact) {
      $('#topic').value = 'other';
      $('#topic-other').value = t.roles.contactTopicOther;
      syncTopicOther();
    } else {
      $('#topic').value = 'consulting';
    }
    const msgEl = $('#form [name="message"]');
    if (msgEl && !msgEl.value.trim() && f) {
      msgEl.value = group.contactMessage.replace('{title}', f.title).replace('{abbr}', f.abbr ?? '');
    }
    syncSubmit?.();
    leaveAll();
    requestAnimationFrame(() => $('#contact').scrollIntoView({ behavior: 'smooth' }));
    setTimeout(() => $('#form [name="name"]').focus(), 400);
    return;
  }
  const roleCv = e.target.closest('[data-role-cv]');
  if (roleCv) {
    leaveAll();
    requestAnimationFrame(() => requestCv());
  }
});

/* ---------- QR-код канала: маленькая кнопка рядом с контактом разворачивает код ---------- */
const qrModal = $('#qr-modal');
$('#contacts').addEventListener('click', (e) => {
  const b = e.target.closest('.qr-trigger');
  if (!b) return;
  $('#qr-image').src = b.dataset.qr;
  $('#qr-image').alt = T[lang].contact.qrTitle;
  $('#qr-title').textContent = T[lang].contact.qrTitle;
  qrModal.showModal();
});
$('#qr-close').addEventListener('click', () => qrModal.close());
qrModal.addEventListener('click', (e) => { if (e.target === qrModal) qrModal.close(); });

/* ---------- публичное сравнение с альтернативами: та же «Схема 1», что на странице проекта ---------- */
const compareModal = $('#compare-modal');
function openCompare(id) {
  const data = COMPARE[id];
  if (!data) return;
  compareModal.dataset.project = id;
  const t = T[lang].projects;
  $('#compare-logo').innerHTML = LOGOS[id];
  $('#compare-title').textContent = t.compareTitle;
  $('#compare-body').innerHTML = `
    <div class="grid-table cols-5 coverage">
      <div class="gt-head" role="presentation">
        <span>Функциональная область</span>
        ${data.columns.map((c) => `<span>${c}</span>`).join('')}
      </div>
      ${data.rows.map((r) => `
        <div class="gt-row">
          <div class="gt-cell" data-label="Область"><b>${r.area}</b></div>
          ${r.marks.map((m, i) => `
            <div class="gt-cell ${i === r.marks.length - 1 ? 'own' : ''}" data-label="${data.columns[i]}">
              <i class="mark ${m}">${t.marks[m]}</i>
            </div>`).join('')}
        </div>`).join('')}
    </div>`;
  $('#compare-note').textContent = data.note;
  if (!compareModal.open) compareModal.showModal();
  compareModal.querySelector('.modal-body').scrollTop = 0;
}
$('#compare-close').addEventListener('click', () => leaveAll());
compareModal.addEventListener('click', (e) => { if (e.target === compareModal) leaveAll(); });

/* копирование био для прессы */
$('#press-body').addEventListener('click', async (e) => {
  const copyBtn = e.target.closest('[data-copy]');
  if (copyBtn) {
    try {
      await navigator.clipboard.writeText($(`#${copyBtn.dataset.copy}`).textContent.trim());
      const was = copyBtn.textContent;
      copyBtn.textContent = T[lang].press.copied;
      setTimeout(() => { copyBtn.textContent = was; }, 1600);
    } catch { /* буфер недоступен — текст можно выделить руками */ }
  }
});

/* запрос резюме — живёт в «Релевантном опыте», а не в разделе для прессы:
   просто ссылка на форму, без отдельных кнопок RU/EN. Тот же переход вызывается
   и из карточки роли (кнопка «Запросить резюме» рядом со «Связаться»). */
function requestCv() {
  const t = T[lang];
  $('#topic').value = 'other';
  $('#topic-other').value = t.hero.cvShort;
  syncTopicOther();
  const msgEl = $('#form [name="message"]');
  if (msgEl && !msgEl.value.trim()) msgEl.value = t.hero.cvMessage;
  syncSubmit?.();
  $('#contact').scrollIntoView({ behavior: 'smooth' });
  setTimeout(() => $('#form [name="name"]').focus(), 400);
}
$('#cv-row-link').addEventListener('click', requestCv);

/* ---------- адреса окон ----------
   #syntha, #syntha-status, #deck — открываются по ссылке, «назад» закрывает окно. */
function closeModals() {
  viewer.close();
  if (modal.open) modal.close(true);
  if (deckModal.open) deckModal.close(true);
  if (diagModal.open) diagModal.close(true);
  if (launchDiagModal.open) launchDiagModal.close(true);
  if (leakModal.open) leakModal.close(true);
  if (postModal.open) postModal.close(true);
  if (pnModal.open) pnModal.close(true);
  if (infoModal.open) infoModal.close(true);
  if (compareModal.open) compareModal.close(true);
  if (needModal.open) needModal.close(true);
  if (coopModal.open) coopModal.close(true);
  if (qrModal.open) qrModal.close(true);
}

function applyHash() {
  const h = decodeURIComponent(location.hash.slice(1));
  /* Закрываем всё, что уже открыто, прежде чем решать, что открыть дальше —
     иначе прямой переход между хэшами разных модалок оставляет два открытых
     <dialog> одновременно, и клики уходят не в то окно, которое видно. */
  closeModals();
  if (!h) return;
  if (h === 'deck') return openDeck();
  if (h === 'diagnostic') return openDiagnosticModal();
  if (h === 'launch-diagnostic') return openLaunchDiagModal();
  if (h === 'leak-quiz') return openLeakModal();
  if (h.startsWith('need-') && T[lang].needCheck?.[h.slice(5)]) return openNeed(h.slice(5));
  if (h.endsWith('-compare')) {
    const cid = h.slice(0, -'-compare'.length);
    if (COMPARE[cid]) return openCompare(cid);
  }
  /* Ссылка на отдельный пост открывает его целиком, подгружая ленту,
     если пост ещё не показан среди первых newsShown карточек. */
  if (h.startsWith('post-')) {
    const date = h.slice('post-'.length);
    if (SITE_NEWS.findIndex((p) => p.date === date) >= newsShown) {
      newsShown = SITE_NEWS.length;
      renderNews();
    }
    if (openPostModal(date)) return;
    return closeModals();
  }
  if (h === 'roles' || h.startsWith('area-') || h.startsWith('format-') || h.startsWith('launch-') || h.startsWith('role-')) { if (showInfo(h)) return; }
  if (h.endsWith('-news')) {
    const nid = h.slice(0, -'-news'.length);
    if (PROJECTS.some((p) => p.id === nid)) return openProjectNews(nid);
  }
  const status = h.endsWith('-status');
  const id = status ? h.slice(0, -'-status'.length) : h;
  if (PROJECTS.some((p) => p.id === id)) return openProject(id, status ? 'status' : null);
  // #consulting, #projects, #contact — обычные якоря: всё уже закрыто выше.
}

/* go() меняет адрес; открытие происходит из applyHash — одна точка входа. */
function go(hash) {
  if (location.hash === `#${hash}`) return applyHash();
  history.pushState({ modal: hash }, '', `#${hash}`);
  applyHash();
}

function leave() {
  if (history.state?.modal) history.back();
  else leaveAll();
}

/* Выход из всей цепочки окон разом — не на шаг назад (leave()), а полностью:
   нужен там, где клик ведёт не «в предыдущее окно», а на страницу целиком
   (например «Связаться»/«Запросить резюме» из карточки роли, открытой
   поверх хаба ролей) — иначе history.back() из leave() приземлится на
   родительский хэш и хаб откроется заново поверх формы. */
function leaveAll() {
  closeModals();
  history.replaceState(null, '', location.pathname + location.search);
}

addEventListener('popstate', applyHash);


/* ---------- вложение ---------- */
const MAX_FILE = 20 * 1024 * 1024;   // Telegram принимает до 50 МБ, берём запас

function showFile() {
  const f = $('#attach').files?.[0];
  $('#file-name').textContent = f ? `${f.name} · ${(f.size / 1048576).toFixed(1)} ${lang === 'en' ? 'MB' : 'МБ'}` : '';
  $('#file-clear').hidden = !f;
}

$('#attach').addEventListener('change', () => {
  const f = $('#attach').files?.[0];
  const note = $('#form-note');
  if (f && f.size > MAX_FILE) {
    $('#attach').value = '';
    note.className = 'form-note';
    note.textContent = T[lang].contact.fileTooBig;
  }
  showFile();
});

$('#file-clear').addEventListener('click', (e) => {
  e.preventDefault();
  $('#attach').value = '';
  showFile();
});

/* Кнопка отправки неактивна, пока нет обязательных полей и согласия:
   так человек видит, чего не хватает, до нажатия, а не после. */
const form = $('#form');
/* Черновик живёт в сессии вкладки: случайно закрытое окно или перезагрузка не стирают набранное. */
const DRAFT_KEYS = ['name', 'surname', 'patronymic', 'email', 'telegram', 'phone', 'message', 'topic'];
let draftReady = false;
function saveDraft() {
  if (!draftReady) return;
  try {
    const f = new FormData(form);
    const d = Object.fromEntries(DRAFT_KEYS.map((k) => [k, String(f.get(k) ?? '')]));
    sessionStorage.setItem('draft', JSON.stringify(d));
  } catch { /* приватный режим */ }
}
function restoreDraft() {
  try {
    const d = JSON.parse(sessionStorage.getItem('draft') || 'null');
    if (!d) return;
    DRAFT_KEYS.forEach((k) => {
      const el = form.elements[k];
      if (el && d[k] && !el.value && (k !== 'topic' || el.value !== d[k])) el.value = d[k];
    });
  } catch { /* пусто */ }
}
function clearDraft() { try { sessionStorage.removeItem('draft'); } catch { /* приватный режим */ } }
function syncSubmit() {
  const f = new FormData(form);
  const filled = String(f.get('name') ?? '').trim() && String(f.get('message') ?? '').trim();
  const reach = ['email', 'telegram', 'phone'].some((k) => String(f.get(k) ?? '').trim());
  $('#submit').disabled = !(filled && reach && $('#consent').checked);
  /* Пока человек уже начал заполнять, подсказываем, чего не хватает для отправки. */
  const hint = $('#form-missing');
  if (hint) {
    const mp = T[lang].contact.missingParts;
    const miss = [];
    if (!String(f.get('name') ?? '').trim()) miss.push(mp.name);
    if (!reach) miss.push(mp.reach);
    if (!String(f.get('message') ?? '').trim()) miss.push(mp.message);
    if (!$('#consent').checked) miss.push(mp.consent);
    const started = ['name', 'message', 'email', 'telegram', 'phone'].some((k) => String(f.get(k) ?? '').trim());
    hint.textContent = started && miss.length ? `${T[lang].contact.missing} ${miss.join(', ')}.` : '';
  }
  saveDraft?.();
}
form.addEventListener('input', syncSubmit);
form.addEventListener('change', syncSubmit);
syncSubmit();

/* При теме «Другое» появляется поле, куда можно написать, о чём речь. */
function syncTopicOther() {
  const field = $('#topic-other-field');
  const isOther = $('#topic').value === 'other';
  field.hidden = !isOther;
  if (!isOther) $('#topic-other').value = '';
}
$('#topic').addEventListener('change', syncTopicOther);
syncTopicOther();

/* «Пишу как юридическое лицо» — раскрывает необязательные поля названия и ИНН. */
function syncEntityFields() {
  const isEntity = $('#entity-toggle').checked;
  $('#entity-box').hidden = !isEntity;
  if (!isEntity) ['name', 'inn', 'address', 'site'].forEach((k) => { $(`#entity-${k}`).value = ''; });
}
$('#entity-toggle').addEventListener('change', syncEntityFields);
syncEntityFields();

/* Необязательные части имени и каналы связи включаются галочками;
   выключенное поле прячется и очищается, чтобы в заявку не ушло лишнее. */
function syncOptional() {
  const on = (k) => $(`#opt-${k}`).checked;
  [['surname', 'surname-field', 'surname'], ['patronymic', 'patronymic-field', 'patronymic'],
   ['telegram', 'telegram-field', 'telegram'], ['phone', 'phone-field', 'phone']].forEach(([k, box, input]) => {
    $(`#${box}`).hidden = !on(k);
    if (!on(k)) $(`#${input}`).value = '';
  });
  /* одно поле в паре занимает всю строку */
  document.querySelectorAll('#form .pair').forEach((pair) => {
    const visible = [...pair.children].filter((c) => !c.hidden).length;
    pair.dataset.n = String(visible);
  });
  syncSubmit?.();
}
['surname', 'patronymic', 'telegram', 'phone'].forEach((k) => $(`#opt-${k}`).addEventListener('change', syncOptional));
syncOptional();

/* Персона-чипы у формы: подставляют тему и переводят фокус на имя,
   чтобы заявка сразу приходила размеченной. */
$('#persona-picker').addEventListener('click', (e) => {
  const b = e.target.closest('[data-persona-topic]');
  if (!b) return;
  $('#topic').value = b.dataset.personaTopic;
  syncTopicOther();
  $('#form [name="name"]').focus();
  document.querySelectorAll('.persona-chip').forEach((el) => el.classList.toggle('active', el === b));
});

/* ---------- форма ---------- */
$('#form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const t = T[lang];
  const note = $('#form-note');
  const data = Object.fromEntries(new FormData(form));

  if (data.company) return;                       // honeypot: бот заполнил скрытое поле
  if (window.turnstile && !data['cf-turnstile-response']) {
    note.className = 'form-note';
    note.textContent = t.contact.captchaWait;
    return;
  }
  window.track?.('form_try');
  const reach = ['email', 'telegram', 'phone'].some((k) => data[k]?.trim());
  if (!data.name?.trim() || !reach || !data.message?.trim()) {
    window.track?.('form_error', '', !data.name?.trim() ? 'нет имени' : !reach ? 'нет способа связи' : 'нет сообщения');
    note.className = 'form-note';
    note.textContent = t.contact.required;
    return;
  }
  if (data.email?.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(data.email.trim())) {
    window.track?.('form_error', '', 'неверный email');
    note.className = 'form-note';
    note.textContent = t.contact.emailBad;
    return;
  }
  if (!$('#consent').checked) {
    window.track?.('form_error', '', 'нет согласия');
    note.className = 'form-note';
    note.textContent = t.contact.consentRequired;
    return;
  }

  const btn = $('#submit');
  btn.disabled = true;
  btn.textContent = t.contact.sending;
  note.textContent = '';

  try {
    /* С файлом уходит multipart, без файла — прежний JSON. */
    const file = $('#attach').files?.[0];
    let res;
    if (file) {
      const fd = new FormData();
      for (const [k, v] of Object.entries(data)) if (k !== 'file') fd.append(k, v);
      fd.append('lang', lang);
      fd.append('vid', window.__vid || '');
      fd.append('sid', window.__sid || '');
      fd.append('topicLabel', t.contact.topics[data.topic]);
      fd.append('file', file, file.name);
      res = await fetch('/api/contact', { method: 'POST', body: fd });
    } else {
      res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ...data, lang, vid: window.__vid || '', sid: window.__sid || '', topicLabel: t.contact.topics[data.topic] })
      });
    }
    if (!res.ok) throw new Error(String(res.status));
    note.className = 'form-note ok';
    note.textContent = t.contact.ok;
    window.dispatchEvent(new Event('track:form-sent'));
    form.reset();
    clearDraft();
    showFile();
    syncEntityFields();
    syncOptional();
    syncSubmit();
    /* токен Turnstile одноразовый — без сброса повторная отправка уйдёт с протухшим */
    window.turnstile?.reset();
  } catch (err) {
    window.track?.('form_error', '', 'сбой отправки');
    note.className = 'form-note';
    const blocked = String(err?.message) === '400';
    note.innerHTML = `${blocked ? t.contact.failCaptcha : t.contact.fail} <a href="https://t.me/sheqel" target="_blank" rel="noopener">Telegram</a> · <a href="https://wa.me/79775781685" target="_blank" rel="noopener">WhatsApp</a>`;
  } finally {
    btn.disabled = false;
    btn.textContent = t.contact.send;
  }
});

/* ---------- переслать контакт ----------
   Системное окно «Поделиться» (на телефоне — мессенджеры, почта, AirDrop) с карточкой .vcf;
   где его нет — копируем контакты текстом. */
$('#share-contact').addEventListener('click', async () => {
  const t = T[lang].contact;
  const btn = $('#share-contact');
  const lines = [t.shareText, 'https://syntha.pro/', ...CONTACTS.map((c) => `${c.label[lang]}: ${c.value}`)];
  const text = lines.join('\n');
  try {
    let files;
    try {
      const vcf = await (await fetch('/assets/petr-fedin.vcf')).blob();
      const file = new File([vcf], 'petr-fedin.vcf', { type: 'text/vcard' });
      if (navigator.canShare?.({ files: [file] })) files = [file];
    } catch { /* без файла тоже годится */ }
    if (navigator.share) {
      await navigator.share({ title: 'Пётр Федин', text, ...(files ? { files } : { url: 'https://syntha.pro/' }) });
      return;
    }
    await navigator.clipboard.writeText(text);
    const was = btn.textContent;
    btn.textContent = t.shareCopied;
    setTimeout(() => { btn.textContent = was; }, 2000);
  } catch (err) {
    if (err?.name === 'AbortError') return;
    try { await navigator.clipboard.writeText(text); btn.textContent = t.shareCopied; setTimeout(() => { btn.textContent = t.shareContact; }, 2000); } catch { /* ничего */ }
  }
});

/* ---------- презентация ---------- */
const deckModal = $('#deck-modal');

function renderDeck() {
  const d = DECK[lang];
  $('#deck-kicker').textContent = d.kicker;
  $('#deck-title').textContent = d.title;
  $('#deck-lead').textContent = d.lead;
  $('#deck-tagline').textContent = d.tagline;
  $('#chain-title').textContent = d.chainTitle;
  $('#chain-list').className = 'chain-list snap';
  $('#chain-hint').textContent = d.chainHint ?? '';
  $('#chain-list').innerHTML = d.chain.map((step, i) => {
    const to = d.chainTo?.[i];
    const target = to == null ? null : d.blocks[0].items[to];
    return target
      ? `<li><button type="button" class="chain-step" data-chain-to="deck-directions-${to}"><b>${step}</b><span>${target.title}</span></button></li>`
      : `<li>${step}</li>`;
  }).join('');
  $('#deck-glossary').innerHTML = !d.glossary ? '' :
    `<h3>${d.glossaryTitle}</h3><dl class="gloss">` +
    d.glossary.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('') + '</dl>';
  $('#deck-footnote').textContent = d.footnote;
  $('#deck-pdf-2').textContent = d.download;

  $('#deck-blocks').innerHTML = d.blocks.map((b) => `
    <section class="deck-block" id="deck-${b.id}">
      <h3>${b.title}</h3>
      ${b.note ? `<p class="sub">${b.note}</p>` : ''}
      <div class="deck-grid deck-grid-${b.id} snap">
        ${b.items.map((it, i) => `
          <article class="deck-item" id="deck-${b.id}-${i}">
            ${it.eyebrow ? `<span class="deck-eyebrow">${it.eyebrow}</span>` : ''}
            <h4>${it.title}</h4>
            ${it.body ? `<p>${it.body}</p>` : ''}
            ${it.list ? `<ul>${it.list.map((l) => `<li>${l}</li>`).join('')}</ul>` : ''}
            ${it.decision ? `<p class="deck-decision"><b>${d.decisionLabel}</b>${it.decision}</p>` : ''}
          </article>`).join('')}
      </div>
      ${b.after ? `<p class="deck-after">${b.after}</p>` : ''}
    </section>`).join('');

  /* заголовок блока липнет к верху окна — видно, какой раздел читаешь */
  const body = deckModal.querySelector('.modal-body');
  const label = T[lang].nav.toTop;
  const closeLabel = T[lang].nav.close ?? 'Close';
  $('#deck-blocks').querySelectorAll('.deck-block > h3').forEach((h) => {
    h.append(makeTopButton(label, () => body.scrollTo({ top: 0, behavior: 'smooth' })));
    h.append(makeCloseButton(closeLabel, () => leave()));
  });

  syncSnaps();
}

/* Шаг сквозной логики → карточка направления в этой же презентации: прокручиваем
   и горизонтально (на телефоне блоки листаются), и вертикально, и подсвечиваем. */
$('#chain-list').addEventListener('click', (e) => {
  const b = e.target.closest('[data-chain-to]');
  if (!b) return;
  const item = $(`#${b.dataset.chainTo}`);
  if (!item) return;
  const track = item.parentElement;
  if (track.scrollWidth > track.clientWidth + 4) track.scrollTo({ left: item.offsetLeft - track.offsetLeft, behavior: 'smooth' });
  item.scrollIntoView({ behavior: 'smooth', block: 'center' });
  item.classList.remove('deck-flash');
  void item.offsetWidth;
  item.classList.add('deck-flash');
  item.addEventListener('animationend', () => item.classList.remove('deck-flash'), { once: true });
});

function openDeck(anchorId) {
  renderDeck();
  if (!deckModal.open) deckModal.showModal();
  const body = deckModal.querySelector('.modal-body');
  const target = anchorId && $(`#${anchorId}`);
  body.scrollTop = target ? target.offsetTop - 16 : 0;
}

$('#deck-open').addEventListener('click', () => go('deck'));
$('#deck-close').addEventListener('click', () => leaveAll());
$('#deck-cv').addEventListener('click', () => { leaveAll(); requestCv(); });
deckModal.addEventListener('click', (e) => { if (e.target === deckModal) leaveAll(); });
$('#services').addEventListener('click', (e) => {
  const btn = e.target.closest('[data-svc]');
  if (btn) { go('deck'); openDeck(`deck-directions-${btn.dataset.svc}`); }
});

/* Esc закрывает окно — адрес возвращаем тем же путём, что и кнопка. */
[modal, deckModal, diagModal, launchDiagModal, leakModal, postModal, pnModal, infoModal, compareModal, needModal, coopModal].forEach((d) => d.addEventListener('cancel', (e) => { e.preventDefault(); leaveAll(); }));

/* Подсказка при наведении на иконки: там, где уже есть aria-label,
   зеркалим его в title — один источник подписи, без ручного дублирования
   по каждой иконочной кнопке (их десятки, часть рисуется в рантайме). */
function syncIconTitles(root = document.body) {
  root.querySelectorAll('[aria-label]:not([title])').forEach((el) => {
    el.title = el.getAttribute('aria-label');
  });
}
new MutationObserver((muts) => {
  for (const m of muts) {
    if (m.type === 'attributes' && m.target.hasAttribute?.('aria-label') && !m.target.hasAttribute('title')) {
      m.target.title = m.target.getAttribute('aria-label');
    }
    m.addedNodes?.forEach((n) => { if (n.nodeType === 1) syncIconTitles(n); });
  }
}).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['aria-label'] });
syncIconTitles();

render();
syncSnaps();
restoreDraft();
draftReady = true;
syncOptional();
syncSubmit();

/* Ссылки со страниц проектов приходят как /?topic=…&project=…#contact: подставляем тему и начало сообщения. */
function consumeContactParams() {
  const q = new URLSearchParams(location.search);
  const topic = q.get('topic');
  if (!topic || !T[lang].contact.topics[topic]) return;
  const proj = PROJECTS.find((p) => p.id === q.get('project') || p.id === topic);
  const message = proj ? (topic === 'investors' ? (T[lang].contact.prefillProject) : T[lang].contact.prefillProject).replace('{name}', proj.name) : '';
  history.replaceState(null, '', location.pathname + location.hash);
  $('#topic').value = topic;
  syncTopicOther();
  const msgEl = $('#form [name="message"]');
  if (msgEl && message && !msgEl.value.trim()) msgEl.value = message;
  syncSubmit?.();
}
consumeContactParams();

/* Страница собирается скриптом, поэтому браузер не знает высоты к моменту перехода по #раздел — докручиваем сами. */
if (location.hash) {
  const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
  if (target?.matches('section')) requestAnimationFrame(() => requestAnimationFrame(() => target.scrollIntoView()));
}

/* Посты из календаря кабинета: подмешиваем вышедшие в общую ленту, не дожидаясь пересборки сайта. */
fetch('/api/posts').then((r) => (r.ok ? r.json() : [])).then((list) => {
  if (!Array.isArray(list)) return;
  let added = false;
  for (const p of list) {
    if (!p?.date || SITE_NEWS.some((x) => x.date === p.date)) continue;
    SITE_NEWS.push(p);
    added = true;
  }
  if (!added) return;
  SITE_NEWS.sort((a, b) => b.date.localeCompare(a.date));
  renderNews();
  renderCards();
  if (location.hash.startsWith('#post-')) applyHash();
}).catch(() => { /* лента останется статической */ });

/* Нижняя кнопка «Написать» на телефоне: пока не открыта сама форма. */
(() => {
  const bar = $('#cta-bar');
  const form = $('#contact');
  if (!bar || !form || !('IntersectionObserver' in window)) return;
  new IntersectionObserver(([en]) => bar.classList.toggle('hide', en.isIntersecting), { threshold: 0.15 }).observe(form);
  bar.querySelector('a').addEventListener('click', (e) => { e.preventDefault(); $('#contact').scrollIntoView({ behavior: 'smooth' }); });
})();

applyHash();

$('#news-contact').addEventListener('click', () => { $('#contact').scrollIntoView({ behavior: 'smooth' }); });
