import { T, PROJECTS, CONTACTS } from './content.js';
import { DECK } from './deck.js';
import { LOGOS } from './logos.js';
import { NEWS } from './news.js';

/* Сайт — витрина: показываем отобранные материалы. Канал получает весь поток. */
const SITE_NEWS = NEWS.filter((p) => p.site !== false);

const $ = (s) => document.querySelector(s);
const store = {
  get(k, d) { try { return localStorage.getItem(k) ?? d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch { /* приватный режим */ } }
};

/* ---------- картинка крупнее по нажатию ----------
   Один просмотрщик на портрет и на экраны проектов: вложенный <dialog>
   кладётся поверх открытого окна проекта, а закрытие возвращает к нему. */
const photoModal = $('#photo-modal');
/* Снимки открытого проекта: по ним листают, не закрывая просмотрщик. */
let photoList = [];
let photoAt = 0;

function showPhoto(i) {
  if (!photoList.length) return;
  photoAt = (i + photoList.length) % photoList.length;
  const cur = photoList[photoAt];
  const big = $('#photo-big');
  big.src = cur.src;
  big.alt = cur.alt ?? '';
  /* увеличение относится к конкретному снимку — на соседнем начинаем сначала */
  photoModal.classList.remove('zoomed');
  photoModal.scrollTo({ top: 0, left: 0 });

  const many = photoList.length > 1;
  $('#photo-prev').hidden = !many;
  $('#photo-next').hidden = !many;
  $('#photo-count').textContent = many ? `${photoAt + 1} / ${photoList.length}` : '';
  syncZoomLabel();
  if (big.complete) syncZoom(); else big.addEventListener('load', syncZoom, { once: true });
}

/* Кнопка увеличения нужна только там, где уложенный снимок не занимает
   всю высоту: у вертикальных экранов она бы ничего не меняла. */
function syncZoom() {
  const big = $('#photo-big');
  if (!big.naturalWidth || photoModal.classList.contains('zoomed')) return;
  const cs = getComputedStyle(photoModal);
  const w = photoModal.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
  const h = photoModal.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
  $('#photo-zoom').hidden = big.naturalWidth / big.naturalHeight <= w / h;
}

function syncZoomLabel() {
  const v = T[lang].projects.viewer;
  const zoomed = photoModal.classList.contains('zoomed');
  $('#photo-zoom').textContent = zoomed ? v.zoomOut : v.zoomIn;
  $('#photo-prev').setAttribute('aria-label', v.prev);
  $('#photo-next').setAttribute('aria-label', v.next);
}

const openPhoto = (list, i = 0) => {
  photoList = list;
  $('#photo-bar').hidden = false;
  showPhoto(i);
  if (!photoModal.open) photoModal.showModal();
};
const openPortrait = () => openPhoto([{ src: '/assets/photo/petr-portrait.jpg', alt: $('#hero-photo').alt }]);
$('#portrait-btn').addEventListener('click', openPortrait);
$('#avatar-btn').addEventListener('click', openPortrait);
$('#photo-close').addEventListener('click', () => photoModal.close());
$('#photo-prev').addEventListener('click', () => showPhoto(photoAt - 1));
$('#photo-next').addEventListener('click', () => showPhoto(photoAt + 1));
$('#photo-zoom').addEventListener('click', () => {
  photoModal.classList.toggle('zoomed');
  photoModal.scrollTo({ top: 0, left: 0 });
  syncZoomLabel();
});
photoModal.addEventListener('click', (e) => { if (e.target === photoModal) photoModal.close(); });
addEventListener('resize', () => { if (photoModal.open) syncZoom(); });
photoModal.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft') { e.preventDefault(); showPhoto(photoAt - 1); }
  if (e.key === 'ArrowRight') { e.preventDefault(); showPhoto(photoAt + 1); }
});

/* Свайп работает, только когда снимок уместился: у увеличенного
   горизонтальное движение — это прокрутка самой картинки. */
let swipeFrom = null;
$('#photo-big').addEventListener('pointerdown', (e) => {
  swipeFrom = photoModal.classList.contains('zoomed') ? null : e.clientX;
});
$('#photo-big').addEventListener('pointerup', (e) => {
  if (swipeFrom === null) return;
  const dx = e.clientX - swipeFrom;
  swipeFrom = null;
  if (Math.abs(dx) > 40) showPhoto(photoAt + (dx < 0 ? 1 : -1));
});

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

/* ---------- листание блоков на телефоне ---------- */
const isPhone = () => matchMedia('(max-width: 759px)').matches;

function buildDots(track) {
  let dots = track.nextElementSibling;
  if (!dots?.classList.contains('snap-dots')) {
    dots = document.createElement('div');
    dots.className = 'snap-dots';
    track.after(dots);
  }
  if (!isPhone()) { dots.hidden = true; return; }
  dots.hidden = false;
  const n = track.children.length;
  dots.innerHTML = Array.from({ length: n }, (_, i) =>
    `<button type="button" data-i="${i}" aria-label="${i + 1}"${i ? '' : ' aria-current="true"'}></button>`).join('');

  const active = () => {
    const c = track.scrollLeft + track.clientWidth / 2;
    let a = 0;
    [...track.children].forEach((el, i) => { if (el.offsetLeft < c) a = i; });
    [...dots.children].forEach((d, i) => d.setAttribute('aria-current', String(i === a)));
  };
  track.addEventListener('scroll', active, { passive: true });
  dots.addEventListener('click', (e) => {
    const b = e.target.closest('[data-i]');
    if (b) track.scrollTo({ left: track.children[+b.dataset.i].offsetLeft, behavior: 'smooth' });
  });
  active();
}

function syncSnaps() {
  document.querySelectorAll('.snap').forEach(buildDots);
}
addEventListener('resize', syncSnaps);

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
    </div>`;

  $('#consent-text').textContent = t.contact.consent;
  $('#consent-link').textContent = t.contact.consentLink;
  $('#vcard').textContent = t.contact.vcard;
  syncSubmit?.();
  $('#deck-open').textContent = t.consulting.deckOpen;
  $('#deck-pdf').textContent = t.consulting.deckPdf;
  $('#deck-pdf').href = t.consulting.deckFile;
  $('#deck-pdf-2').href = t.consulting.deckFile;
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
  $('#projects-sub').textContent = t.projects.subtitle;
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
      </div>
    </article>`).join('');

  $('#contact-title').textContent = t.contact.title;
  $('#contact-sub').textContent = t.contact.subtitle;
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

  $('#contacts').innerHTML = CONTACTS.map((c) => `
    <li><span class="lbl">${c.label[lang] ?? c.label}</span>
      <a href="${c.href}" target="_blank" rel="noopener">${c.value}</a></li>`).join('');

  $('#year').textContent = new Date().getFullYear();
  renderNews();
  addTopButtons(t.nav.toTop);
  syncSnaps();
  if (modal.open) openProject(modal.dataset.project);
  if (deckModal.open) renderDeck();
  if (pnModal.open) openProjectNews(pnModal.dataset.project);
  if (infoModal.open) showInfo(infoModal.dataset.view ?? '');
}

$('#lang-toggle').addEventListener('click', () => {
  lang = lang === 'ru' ? 'en' : 'ru';
  store.set('lang', lang);
  render();
});

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
  if (photoModal.open) photoModal.close();
  modal.dataset.project = id;
  $('#modal-logo').innerHTML = LOGOS[p.id];
  $('#modal-tagline').textContent = c.tagline;
  $('#modal-stage').textContent = c.stage;

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
  $('#status').innerHTML = !st ? '' : `
    <h3>${s.title}</h3>
    <div class="status-grid">
      ${[['done', st.done], ['now', st.now], ['next', st.next]].map(([k, list]) => `
        <div class="status-col status-${k}">
          <h4>${s[k]}</h4>
          <ul>${list.map((i) => `<li>${i}</li>`).join('')}</ul>
        </div>`).join('')}
    </div>
    ${st.seeking ? `<p class="seeking"><b>${s.seeking}</b>${st.seeking}</p>` : ''}`;

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
  const news = e.target.closest('[data-news]');
  if (news) return go(`${news.dataset.news}-news`);
  const status = e.target.closest('[data-status]');
  if (status) return go(`${status.dataset.status}-status`);
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

/* «Обсудить участие» — переносит проект в форму */
$('#modal-cta').addEventListener('click', () => {
  $('#topic').value = modal.dataset.project;
  leave();
  $('#contact').scrollIntoView({ behavior: 'smooth' });
  setTimeout(() => $('#form [name="name"]').focus(), 400);
});

/* ---------- новости ---------- */
let newsShown = 4;

function renderNews() {
  const t = T[lang].news;
  $('#news-title').textContent = t.title;
  $('#news-sub').textContent = t.subtitle;
  $('#news-channel').textContent = t.channel;

  const fmt = new Intl.DateTimeFormat(lang === 'ru' ? 'ru-RU' : 'en-GB',
    { day: 'numeric', month: 'long', year: 'numeric' });

  $('#feed').className = 'feed snap';
  $('#feed').innerHTML = SITE_NEWS.slice(0, newsShown).map((p) => `
    <li class="post">
      <div class="post-meta">
        <time datetime="${p.date}">${fmt.format(new Date(p.date))}</time>
        <span class="post-tag">${t.tags[p.tag] ?? p.tag}</span>
      </div>
      <h3>${p[lang].title}</h3>
      <p>${p[lang].body}</p>
    </li>`).join('');

  const more = $('#news-more');
  more.hidden = newsShown >= SITE_NEWS.length;
  more.textContent = t.more;
}

$('#news-more').addEventListener('click', () => {
  newsShown = SITE_NEWS.length;
  renderNews();
});

/* ---------- новости проекта ---------- */
const pnModal = $('#project-news');

function openProjectNews(id) {
  const p = PROJECTS.find((x) => x.id === id);
  if (!p) return;
  const t = T[lang];
  const posts = SITE_NEWS.filter((n) => n.tag === id);
  const fmt = new Intl.DateTimeFormat(lang === 'ru' ? 'ru-RU' : 'en-GB',
    { day: 'numeric', month: 'long', year: 'numeric' });

  pnModal.dataset.project = id;
  $('#pn-logo').innerHTML = LOGOS[id];
  $('#pn-title').textContent = t.news.title;
  $('#pn-channel').textContent = t.news.channel;
  $('#pn-feed').innerHTML = posts.length
    ? posts.map((post) => `
      <li class="post">
        <div class="post-meta"><time datetime="${post.date}">${fmt.format(new Date(post.date))}</time></div>
        <h3>${post[lang].title}</h3>
        <p>${post[lang].body}</p>
      </li>`).join('')
    : `<li class="post"><p>${t.projects.newsEmpty}</p></li>`;

  if (!pnModal.open) pnModal.showModal();
  pnModal.querySelector('.modal-body').scrollTop = 0;
}

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

/* копирование био для прессы */
$('#press-body').addEventListener('click', async (e) => {
  const b = e.target.closest('[data-copy]');
  if (!b) return;
  try {
    await navigator.clipboard.writeText($(`#${b.dataset.copy}`).textContent.trim());
    const was = b.textContent;
    b.textContent = T[lang].press.copied;
    setTimeout(() => { b.textContent = was; }, 1600);
  } catch { /* буфер недоступен — текст можно выделить руками */ }
});

/* ---------- адреса окон ----------
   #syntha, #syntha-status, #deck — открываются по ссылке, «назад» закрывает окно. */
function closeModals() {
  if (modal.open) modal.close(true);
  if (deckModal.open) deckModal.close(true);
  if (pnModal.open) pnModal.close(true);
  if (infoModal.open) infoModal.close(true);
}

function applyHash() {
  const h = decodeURIComponent(location.hash.slice(1));
  if (!h) return closeModals();
  if (h === 'deck') return openDeck();
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
[modal, deckModal, pnModal, infoModal].forEach((d) => d.addEventListener('cancel', (e) => { e.preventDefault(); leave(); }));

render();
syncSnaps();
applyHash();
