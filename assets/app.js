import { T, PROJECTS, CONTACTS, COMPARE } from './content.js';
import { DECK } from './deck.js';
import { LOGOS } from './logos.js';
import { createViewer } from './viewer.js';
import { syncSnaps } from './snap.js';
import { NEWS } from './news.js';

/* Сайт — витрина: показываем отобранные материалы. Канал получает весь поток.
   Лента идёт от свежего к старому по дате публикации — «Показать ещё» раскрывает
   более старые записи; порядок записей в news.js на отображение не влияет. */
const SITE_NEWS = NEWS.filter((p) => p.site !== false).sort((a, b) => b.date.localeCompare(a.date));
/* Разборы статей пишутся только по-русски (редполитика канала).
   На английской версии их не показываем в ленте — вместо смешения
   языков внутри карточки; postText() всё равно берёт русский текст
   как запасной вариант для прямых ссылок на такой пост на EN-версии. */
const hasLang = (p) => Boolean(p[lang]);
const postText = (p) => p[lang] ?? p.ru;

const $ = (s) => document.querySelector(s);
const store = {
  get(k, d) { try { return localStorage.getItem(k) ?? d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch { /* приватный режим */ } }
};

/* ---------- просмотрщик снимков ---------- */
const viewer = createViewer({ labels: () => T[lang].projects.viewer });
const openPhoto = (list, i = 0) => viewer.open(list, i);
const openPortrait = () => openPhoto([{ src: '/assets/photo/petr-portrait.webp', alt: $('#hero-photo').alt }]);
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

function addTopButtons(label) {
  document.querySelectorAll('.section > .section-head > h2').forEach((h) => {
    if (h.querySelector('.to-top')) return;
    h.append(makeTopButton(label, () => window.scrollTo({ top: 0, behavior: 'smooth' })));
  });
}

addEventListener('resize', syncSnaps);

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
}
burger.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  burger.setAttribute('aria-expanded', String(open));
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
const browserRu = (navigator.language || '').toLowerCase().startsWith('ru');
/* Язык задаёт адрес: /en/ — это отдельная страница для поиска, и она
   должна открываться по-английски независимо от прошлого выбора. */
const urlLang = location.pathname.startsWith('/en') ? 'en'
  : new URLSearchParams(location.search).get('lang');
let lang = (urlLang === 'ru' || urlLang === 'en') ? urlLang
  : store.get('lang') || (browserRu ? 'ru' : 'en');
if (!T[lang]) lang = 'ru';

function render() {
  const t = T[lang];
  document.documentElement.lang = lang;

  $('#lang-toggle').textContent = lang === 'ru' ? 'EN' : 'RU';
  renderClock();
  document.querySelectorAll('[data-nav]').forEach((a) => { a.textContent = t.nav[a.dataset.nav]; });

  $('#hero-eyebrow').textContent = t.hero.eyebrow;
  $('#hero-name').textContent = t.hero.name;
  $('#hero-lead').textContent = t.hero.lead;
  $('#hero-bio').textContent = t.hero.bio;
  $('#hero-photo').alt = t.hero.photoAlt;
  $('#photo-big').alt = t.hero.photoAlt;
  $('#hero-avatar').alt = t.hero.photoAlt;
  $('#avatar-btn').setAttribute('aria-label', t.hero.photoAlt);
  $('#portrait-btn').setAttribute('aria-label', t.hero.photoAlt);
  $('#facts-title').textContent = t.hero.factsTitle;
  $('#facts-bar').className = "facts-bar snap";
  $('#facts-bar').innerHTML = t.hero.facts.map((f) => `
    <li><button class="fact" type="button" data-area="${f.id}">
      <b>${f.n}</b><span>${f.l}</span><span class="fact-more">${t.formats.more}</span>
    </button></li>`).join('');
  $('#cta-consulting').textContent = t.hero.ctaConsulting;
  $('#cta-projects').textContent = t.hero.ctaProjects;
  $('#cta-feed').textContent = t.hero.ctaFeed;
  $('#cta-contact').textContent = t.hero.ctaContact;

  $('#consulting-title').textContent = t.consulting.title;
  $('#consulting-sub').textContent = t.consulting.subtitle;
  $('#formats').innerHTML = `
    <div class="formats-head"><h3>${t.formats.title}</h3><p class="sub">${t.formats.subtitle}</p></div>
    <div class="formats-grid snap">${t.formats.items.map((f) => `
      <article class="format" data-format="${f.n}">
        <span class="svc-n">${f.n}</span>
        <h4>${f.title}</h4>
        <span class="format-term">${f.term}</span>
        <p>${f.body}</p>
        <span class="format-more">${t.formats.more}</span>
      </article>`).join('')}</div>`;

  /* Раздел «Публикации» имеет смысл только когда их больше одной —
     иначе множественное число в заголовке расходится с содержимым. */
  const hasMedia = t.media.items.length > 0;
  $('#media').hidden = !hasMedia;
  document.querySelector('[data-nav="media"]').hidden = !hasMedia;
  $('#media-title').textContent = t.media.title;
  $('#media-sub').textContent = t.media.subtitle;
  $('#media-list').innerHTML = t.media.items.map((m) => {
    const d = new Intl.DateTimeFormat(lang === 'ru' ? 'ru-RU' : 'en-GB',
      { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(m.date));
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
      <div class="press-item"><h4>${t.press.shortLabel}</h4><p id="bio-short">${t.press.short}</p>
        <button class="btn btn-sm" type="button" data-copy="bio-short">${t.press.copy}</button></div>
      <div class="press-item"><h4>${t.press.longLabel}</h4><p id="bio-long">${t.press.long}</p>
        <button class="btn btn-sm" type="button" data-copy="bio-long">${t.press.copy}</button></div>
    </div>
    <div class="press-side">
      <h4>${t.press.topicsLabel}</h4>
      <ul>${t.press.topics.map((x) => `<li>${x}</li>`).join('')}</ul>
      <h4>${t.press.photoLabel}</h4>
      <a class="btn btn-sm" href="/assets/photo/petr-formal.jpg" download>${t.press.photoBtn}</a>
      <h4>${t.press.cvLabel}</h4>
      <p class="cv-note">${t.press.cvNote}</p>
      <div class="cv-actions">
        <button class="btn btn-sm" type="button" data-cv="${lang === 'ru' ? 'русском' : 'Russian'}">${t.press.cvRu}</button>
        <button class="btn btn-sm" type="button" data-cv="${lang === 'ru' ? 'английском' : 'English'}">${t.press.cvEn}</button>
      </div>
    </div>`;

  $('#consent-text').textContent = t.contact.consent;
  $('#consent-link').textContent = t.contact.consentLink;
  $('#vcard').textContent = t.contact.vcard;
  syncSubmit?.();
  $('#deck-open').textContent = t.consulting.deckOpen;
  $('#deck-pdf').textContent = t.consulting.deckPdf;
  $('#deck-pdf').href = t.consulting.deckFile;
  $('#deck-pdf-2').href = t.consulting.deckFile;
  $('#diag-open').textContent = t.diagnostic.label;
  $('#services').className = "services snap";
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
  $('#cards').className = "cards snap";
  $('#cards').innerHTML = PROJECTS.map((p) => `
    <article class="card" data-project="${p.id}">
      <span class="card-logo">${LOGOS[p.id]}</span>
      <h3 class="card-tag">${p[lang].tagline}</h3>
      <p class="card-body">${p[lang].card}</p>
      <span class="stage">${p[lang].stage}</span>
      <div class="card-foot">
        <button class="btn btn-sm btn-primary" type="button" data-open="${p.id}">${t.projects.open}</button>
        <button class="btn btn-sm" type="button" data-status="${p.id}">${t.projects.statusBtn}</button>
        <button class="btn btn-sm" type="button" data-news="${p.id}">${t.projects.newsBtn}</button>
        ${COMPARE[p.id] && lang === 'ru' ? `<button class="btn btn-sm" type="button" data-compare="${p.id}">${t.projects.compareBtn}</button>` : ''}
        ${p.id === 'syntha' ? `<button class="btn btn-sm flow-toggle" type="button" data-flow-toggle aria-expanded="false">${t.flow.eyebrow}</button>` : ''}
        ${p.id === 'syntha' ? `<button class="btn btn-sm" type="button" data-leak-open>${t.leakQuiz.label}</button>` : ''}
        ${SIMPLE_FLOWS[p.id] ? `<button class="btn btn-sm flow-toggle" type="button" data-simple-flow-toggle="${p.id}" aria-expanded="false">${t[SIMPLE_FLOWS[p.id]].eyebrow}</button>` : ''}
      </div>
      ${p.id === 'syntha' ? '<div class="flow-embed" id="flow-embed" hidden></div>' : ''}
      ${SIMPLE_FLOWS[p.id] ? `<div class="flow-embed" id="flow-embed-${p.id}" hidden></div>` : ''}
    </article>`).join('');
  if (flowOpen) renderSeasonFlow();
  Object.keys(SIMPLE_FLOWS).forEach((id) => { if (simpleFlowOpen[id]) renderSimpleFlow(id); });

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
      <a href="${c.href}" target="_blank" rel="noopener">${c.value}</a>
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
      </button>` : ''}</li>`).join('');

  $('#year').textContent = new Date().getFullYear();
  renderNow();
  renderNews();
  addTopButtons(t.nav.toTop);
  syncSnaps();
  if (modal.open) openProject(modal.dataset.project);
  if (deckModal.open) renderDeck();
  if (diagModal.open) renderDiagnostic();
  if (leakModal.open) renderLeakQuiz();
  if (pnModal.open) openProjectNews(pnModal.dataset.project);
  if (infoModal.open) showInfo(infoModal.dataset.view ?? '');
}

$('#lang-toggle').addEventListener('click', () => {
  lang = lang === 'ru' ? 'en' : 'ru';
  store.set('lang', lang);
  render();
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
  const shots = [...gallery.querySelectorAll('img')].map((img) => ({ src: img.src, alt: img.alt }));
  gallery.querySelectorAll('img').forEach((img, i) => {
    img.addEventListener('click', () => openPhoto(shots, i));
  });
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
    const есть = ['syntha', 'chatx', 'renova'].includes(id) && lang === 'ru';
    more.hidden = !есть;
    if (есть) more.href = `/${id}.html`;
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

$('#cards').addEventListener('click', (e) => {
  /* визуализация сезона живёт внутри карточки Syntha — клики в ней не должны
     открывать модалку проекта, только свои переходы */
  if (e.target.closest('.flow-embed')) {
    const area = e.target.closest('[data-open-area]');
    if (area) return go(`area-${area.dataset.openArea}`);
    if (e.target.closest('[data-open-syntha]')) return go('syntha');
    const cmp = e.target.closest('[data-flow-compare]');
    if (cmp) return openCompare(cmp.dataset.flowCompare);
    const openProjectBtn = e.target.closest('[data-flow-open]');
    if (openProjectBtn) return go(openProjectBtn.dataset.flowOpen);
    return;
  }
  const flowToggle = e.target.closest('[data-flow-toggle]');
  if (flowToggle) {
    const embed = $('#flow-embed');
    flowOpen = embed.hidden;
    embed.hidden = !flowOpen;
    flowToggle.setAttribute('aria-expanded', String(flowOpen));
    if (flowOpen) { renderSeasonFlow(); requestAnimationFrame(() => embed.scrollIntoView({ block: 'nearest', behavior: 'smooth' })); }
    else if (flowObserver) flowObserver.disconnect();
    return;
  }
  const simpleToggle = e.target.closest('[data-simple-flow-toggle]');
  if (simpleToggle) {
    const id = simpleToggle.dataset.simpleFlowToggle;
    const embed = $(`#flow-embed-${id}`);
    const open = embed.hidden;
    simpleFlowOpen[id] = open;
    embed.hidden = !open;
    simpleToggle.setAttribute('aria-expanded', String(open));
    if (open) { renderSimpleFlow(id); requestAnimationFrame(() => embed.scrollIntoView({ block: 'nearest', behavior: 'smooth' })); }
    else if (simpleFlowObservers[id]) simpleFlowObservers[id].disconnect();
    return;
  }
  const news = e.target.closest('[data-news]');
  if (news) return go(`${news.dataset.news}-news`);
  const status = e.target.closest('[data-status]');
  if (status) return go(`${status.dataset.status}-status`);
  const compareBtn = e.target.closest('[data-compare]');
  if (compareBtn) return openCompare(compareBtn.dataset.compare);
  if (e.target.closest('[data-leak-open]')) { leakAnswers = []; return go('leak-quiz'); }
  const open = e.target.closest('[data-open]');
  if (open) return go(open.dataset.open);
  const card = e.target.closest('[data-project]');
  if (card) go(card.dataset.project);
});
$('#modal-close').addEventListener('click', () => leave());
modal.addEventListener('click', (e) => { if (e.target === modal) leave(); });

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

/* «Сейчас»: клик по проекту в статус-строке ведёт к его карточке и подсвечивает её */
$('#now-projects').addEventListener('click', (e) => {
  const b = e.target.closest('[data-goto-project]');
  if (!b) return;
  const card = document.querySelector(`.card[data-project="${b.dataset.gotoProject}"]`);
  if (!card) return;
  card.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
  card.classList.remove('card-highlight');
  void card.offsetWidth;
  card.classList.add('card-highlight');
  card.addEventListener('animationend', () => card.classList.remove('card-highlight'), { once: true });
});

/* «Обсудить участие» — переносит проект в форму */
$('#modal-cta').addEventListener('click', () => {
  $('#topic').value = modal.dataset.project;
  leave();
  $('#contact').scrollIntoView({ behavior: 'smooth' });
  setTimeout(() => $('#form [name="name"]').focus(), 400);
});

/* ---------- «Сейчас»: статусы проектов и последний пост ---------- */
function renderNow() {
  const t = T[lang];
  $('#now-label').textContent = t.now.label;
  $('#now-projects').innerHTML = PROJECTS.map((p) => `
    <li><button type="button" class="now-project" data-goto-project="${p.id}">
      <span class="now-dot" aria-hidden="true"></span><b>${p.name}</b><span>${p[lang].stage}</span>
    </button></li>`).join('');

  const latest = SITE_NEWS.filter(hasLang)[0];
  const post = $('#now-post');
  if (!latest) { post.hidden = true; }
  else {
    post.hidden = false;
    post.dataset.date = latest.date;
    const fmt = new Intl.DateTimeFormat(lang === 'ru' ? 'ru-RU' : 'en-GB', { day: 'numeric', month: 'long' });
    post.innerHTML = `<span class="now-post-label">${t.now.latest}</span>
      <span class="now-post-title">${postText(latest).title}</span>
      <span class="now-post-date">${fmt.format(new Date(latest.date))} · ${t.now.readMore}</span>`;
  }
}
/* Переход по ссылке-якорю не вызывает applyHash — используем свой роутинг. */
$('#now-post').addEventListener('click', (e) => {
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

/* ---------- те же раскрывающиеся ленты для ChatX и Renova ----------
   Короче, чем у Syntha (три шага вместо пяти), и без привязки к «Релевантному
   опыту»: левый чип открывает «Сравнение», правый — карточку самого проекта. */
const SIMPLE_FLOWS = { chatx: 'flowChatx', renova: 'flowRenova' };
const simpleFlowOpen = { chatx: false, renova: false };
const simpleFlowObservers = {};
function renderSimpleFlow(id) {
  const embed = $(`#flow-embed-${id}`);
  if (!embed) return;
  const t = T[lang][SIMPLE_FLOWS[id]];

  embed.innerHTML = `
    <div class="flow-embed-head">
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
              <button type="button" class="season-chip" data-flow-compare="${id}">${t.leftHead} · ${st.leftLabel}</button>
              <button type="button" class="season-chip season-chip-syntha" data-flow-open="${id}">${t.rightHead} · ${st.contour}</button>
            </div>
          </li>`).join('')}
      </ol>
    </div>`;

  if (simpleFlowObservers[id]) simpleFlowObservers[id].disconnect();
  if (embed.hidden) return;
  const steps = [...embed.querySelectorAll('.season-step')];
  const dots = [...embed.querySelectorAll('.season-dot')];
  const setActive = (i) => {
    steps.forEach((el, j) => el.classList.toggle('active', j === i));
    dots.forEach((el, j) => el.classList.toggle('active', j === i));
  };
  setActive(0);
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((entry) => { if (entry.isIntersecting) setActive(+entry.target.dataset.step); });
  }, { rootMargin: '-40% 0px -40% 0px', threshold: 0 });
  steps.forEach((el) => obs.observe(el));
  simpleFlowObservers[id] = obs;
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
  if (opt) { diagAnswers.push(+opt.dataset.f); return renderDiagnostic(); }
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
$('#diag-open').addEventListener('click', () => { diagAnswers = []; go('diagnostic'); });
$('#diag-close').addEventListener('click', () => leave());
diagModal.addEventListener('click', (e) => { if (e.target === diagModal) leave(); });

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
$('#leak-close').addEventListener('click', () => leave());
leakModal.addEventListener('click', (e) => { if (e.target === leakModal) leave(); });

/* ---------- новости ---------- */
let newsShown = 2;

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
  newsShown = 2;
  renderNews();
});

function renderNews() {
  const t = T[lang].news;
  $('#news-title').textContent = t.title;
  $('#news-sub').textContent = t.subtitle;
  $('#news-channel').textContent = t.channel;
  renderNewsFilters();

  const fmt = new Intl.DateTimeFormat(lang === 'ru' ? 'ru-RU' : 'en-GB',
    { day: 'numeric', month: 'long', year: 'numeric' });

  const list = filteredNews();
  $('#feed').className = 'feed snap';
  $('#feed').innerHTML = list.slice(0, newsShown).map((p) => {
    const { text } = splitBodyLink(postText(p).body);
    return `
    <li class="post" id="post-${p.date}" data-post="${p.date}">
      <div class="post-meta">
        <time datetime="${p.date}">${fmt.format(new Date(p.date))}</time>
        <span class="post-tag">${t.tags[p.tag] ?? p.tag}</span>
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
      ${p.tags?.length ? `<div class="post-chips">${p.tags.map((tg) => `<span class="post-chip">${tg}</span>`).join('')}</div>` : ''}
      <span class="post-read">${t.read}</span>
    </li>`;
  }).join('');

  const more = $('#news-more');
  const expanded = newsShown >= list.length;
  more.hidden = list.length <= 2;
  more.textContent = expanded ? t.collapse : t.more;
  more.dataset.expanded = String(expanded);
}

$('#news-more').addEventListener('click', () => {
  const list = filteredNews();
  newsShown = newsShown >= list.length ? 2 : list.length;
  renderNews();
  if (newsShown === 2) $('#news').scrollIntoView({ block: 'start' });
});

/* ---------- чтение поста целиком ----------
   Абзацы вида «Метка: текст» (О чём материал, Разбор, Мнение аналитика,
   Выводы) рисуются структурными блоками — так разбор читается по частям,
   а не одним сплошным полотном текста. */
/* Только эти метки рисуются структурным блоком — иначе обычное
   предложение с двоеточием («В магазине продажи видно каждый день:
   что уходит...») ошибочно превращалось в заголовок. */
const POST_LABELS = ['О чём материал', 'Разбор', 'Мнение аналитика', 'Выводы'];
function renderPostBody(text) {
  return text.split('\n\n').map((block) => {
    const label = POST_LABELS.find((l) => block.startsWith(`${l}:`));
    return label
      ? `<div class="post-section"><b>${label}</b><p>${block.slice(label.length + 1).trim()}</p></div>`
      : `<p>${block.trim()}</p>`;
  }).join('');
}

const postModal = $('#post-modal');
function openPostModal(date) {
  const p = SITE_NEWS.find((x) => x.date === date);
  if (!p) return false;
  const t = T[lang].news;
  const { text, href } = splitBodyLink(postText(p).body);
  const fmt = new Intl.DateTimeFormat(lang === 'ru' ? 'ru-RU' : 'en-GB',
    { day: 'numeric', month: 'long', year: 'numeric' });
  const dateEl = $('#post-modal-date');
  dateEl.textContent = fmt.format(new Date(p.date));
  dateEl.dateTime = p.date;
  $('#post-modal-tag').textContent = t.tags[p.tag] ?? p.tag;
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

  /* Справка: о каком бренде/компании материал — не подменяет «О чём материал». */
  const subjectEl = $('#post-modal-subject');
  if (p.subject) {
    subjectEl.innerHTML = `<b>${t.subjectLabel}</b><p>${p.subject}</p>`;
    subjectEl.hidden = false;
  } else subjectEl.hidden = true;

  $('#post-modal-tags').innerHTML = (p.tags ?? [])
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
  if (!postModal.open) postModal.showModal();
  postModal.querySelector('.modal-body').scrollTop = 0;
  return true;
}
$('#post-close').addEventListener('click', () => leave());
postModal.addEventListener('click', (e) => { if (e.target === postModal) leave(); });
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
    { day: 'numeric', month: 'long', year: 'numeric' });

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
$('#pn-close').addEventListener('click', () => leave());
pnModal.addEventListener('click', (e) => { if (e.target === pnModal) leave(); });

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
  $('#cv-body').innerHTML =
    list(t.area.doesLabel, f.does) +
    list(t.area.givesLabel, f.gives) +
    (f.results.length
      ? `<section class="info-list"><h3>${t.area.resultsLabel}</h3>
         <ul class="cv-results">${f.results.map((r) => `<li>${r}</li>`).join('')}</ul></section>`
      : '');
  return true;
}

function renderFormat(n) {
  const t = T[lang];
  const f = t.formats.items.find((x) => x.n === n);
  if (!f) return false;
  infoModal.dataset.view = `format-${n}`;
  $('#cv-title').textContent = f.title;
  $('#cv-note').textContent = f.lead ?? f.body;
  $('#cv-body').innerHTML =
    `<p class="info-term">${f.term}</p>` +
    list(t.formats.stepsLabel, f.steps) +
    list(t.formats.includesLabel, f.includes) +
    list(t.formats.outLabel, Array.isArray(f.out) ? f.out : [f.out]) +
    (f.fit ? `<p class="info-fit"><b>${t.formats.fitLabel}</b>${f.fit}</p>` : '');
  return true;
}

function showInfo(hash) {
  const ok = hash.startsWith('area-') ? renderArea(hash.slice(5))
           : hash.startsWith('format-') ? renderFormat(hash.slice(7)) : false;
  if (!ok) return false;
  if (!infoModal.open) infoModal.showModal();
  infoModal.querySelector('.modal-body').scrollTop = 0;
  return true;
}

$('#facts-bar').addEventListener('click', (e) => {
  const b = e.target.closest('[data-area]');
  if (b) go(`area-${b.dataset.area}`);
});
$('#formats').addEventListener('click', (e) => {
  const b = e.target.closest('[data-format]');
  if (b) go(`format-${b.dataset.format}`);
});
$('#cv-close').addEventListener('click', () => leave());
infoModal.addEventListener('click', (e) => { if (e.target === infoModal) leave(); });

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
$('#compare-close').addEventListener('click', () => compareModal.close());
compareModal.addEventListener('click', (e) => { if (e.target === compareModal) compareModal.close(); });

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
    return;
  }
  const cvBtn = e.target.closest('[data-cv]');
  if (cvBtn) {
    const t = T[lang];
    $('#topic').value = 'other';
    $('#topic-other').value = t.press.cvLabel;
    syncTopicOther();
    const msgEl = $('#form [name="message"]');
    if (msgEl && !msgEl.value.trim()) msgEl.value = t.press.cvMessage.replace('{lang}', cvBtn.dataset.cv);
    syncSubmit?.();
    $('#contact').scrollIntoView({ behavior: 'smooth' });
    setTimeout(() => $('#form [name="name"]').focus(), 400);
  }
});

/* ---------- адреса окон ----------
   #syntha, #syntha-status, #deck — открываются по ссылке, «назад» закрывает окно. */
function closeModals() {
  if (modal.open) modal.close(true);
  if (deckModal.open) deckModal.close(true);
  if (diagModal.open) diagModal.close(true);
  if (leakModal.open) leakModal.close(true);
  if (postModal.open) postModal.close(true);
  if (pnModal.open) pnModal.close(true);
  if (infoModal.open) infoModal.close(true);
}

function applyHash() {
  const h = decodeURIComponent(location.hash.slice(1));
  if (!h) return closeModals();
  if (h === 'deck') return openDeck();
  if (h === 'diagnostic') return openDiagnosticModal();
  if (h === 'leak-quiz') return openLeakModal();
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
  if (h.startsWith('area-') || h.startsWith('format-')) { if (showInfo(h)) return; }
  if (h.endsWith('-news')) {
    const nid = h.slice(0, -'-news'.length);
    if (PROJECTS.some((p) => p.id === nid)) return openProjectNews(nid);
  }
  const status = h.endsWith('-status');
  const id = status ? h.slice(0, -'-status'.length) : h;
  if (PROJECTS.some((p) => p.id === id)) return openProject(id, status ? 'status' : null);
  closeModals();                              // #consulting, #projects, #contact — обычные якоря
}

/* go() меняет адрес; открытие происходит из applyHash — одна точка входа. */
function go(hash) {
  if (location.hash === `#${hash}`) return applyHash();
  history.pushState({ modal: hash }, '', `#${hash}`);
  applyHash();
}

function leave() {
  if (history.state?.modal) history.back();
  else history.replaceState(null, '', location.pathname + location.search);
}

addEventListener('popstate', applyHash);


/* ---------- вложение ---------- */
const MAX_FILE = 20 * 1024 * 1024;   // Telegram принимает до 50 МБ, берём запас

function showFile() {
  const f = $('#attach').files?.[0];
  $('#file-name').textContent = f ? `${f.name} · ${(f.size / 1048576).toFixed(1)} МБ` : '';
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
function syncSubmit() {
  const f = new FormData(form);
  const filled = ['name', 'contact', 'message'].every((k) => String(f.get(k) ?? '').trim());
  $('#submit').disabled = !(filled && $('#consent').checked);
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
  if (!data.name?.trim() || !data.contact?.trim() || !data.message?.trim()) {
    note.className = 'form-note';
    note.textContent = t.contact.required;
    return;
  }
  if (!$('#consent').checked) {
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
      fd.append('topicLabel', t.contact.topics[data.topic]);
      fd.append('file', file, file.name);
      res = await fetch('/api/contact', { method: 'POST', body: fd });
    } else {
      res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ...data, lang, topicLabel: t.contact.topics[data.topic] })
      });
    }
    if (!res.ok) throw new Error(String(res.status));
    note.className = 'form-note ok';
    note.textContent = t.contact.ok;
    form.reset();
    showFile();
    syncSubmit();
  } catch {
    note.className = 'form-note';
    note.textContent = t.contact.fail;
  } finally {
    btn.disabled = false;
    btn.textContent = t.contact.send;
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
  $('#chain-list').innerHTML = d.chain.map((step) => `<li>${step}</li>`).join('');
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
  $('#deck-blocks').querySelectorAll('.deck-block > h3').forEach((h) => {
    h.append(makeTopButton(label, () => body.scrollTo({ top: 0, behavior: 'smooth' })));
  });

  syncSnaps();
}

function openDeck(anchorId) {
  renderDeck();
  if (!deckModal.open) deckModal.showModal();
  const body = deckModal.querySelector('.modal-body');
  const target = anchorId && $(`#${anchorId}`);
  body.scrollTop = target ? target.offsetTop - 16 : 0;
}

$('#deck-open').addEventListener('click', () => go('deck'));
$('#deck-close').addEventListener('click', () => leave());
deckModal.addEventListener('click', (e) => { if (e.target === deckModal) leave(); });
$('#services').addEventListener('click', (e) => {
  const btn = e.target.closest('[data-svc]');
  if (btn) { go('deck'); openDeck(`deck-directions-${btn.dataset.svc}`); }
});

/* Esc закрывает окно — адрес возвращаем тем же путём, что и кнопка. */
[modal, deckModal, diagModal, leakModal, postModal, pnModal, infoModal].forEach((d) => d.addEventListener('cancel', (e) => { e.preventDefault(); leave(); }));

render();
syncSnaps();
applyHash();
