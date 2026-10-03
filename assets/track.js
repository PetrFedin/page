/* Собственная статистика посещений: что смотрят, куда нажимают, что отправляют.
   Данные уходят на /api/t и видны только владельцу на странице /stats.
   Свои визиты не считаются: откройте любую страницу сайта с ?notrack
   (вернуть подсчёт — с ?track). */
(() => {
  'use strict';
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch { /* приватный режим */ } },
    del(k) { try { localStorage.removeItem(k); } catch { /* приватный режим */ } }
  };
  const qs = new URLSearchParams(location.search);
  if (qs.has('notrack')) store.set('notrack', '1');
  if (qs.has('track')) store.del('notrack');
  const off = store.get('notrack') === '1' || /^(localhost|127\.|\[::1\])/.test(location.hostname) || navigator.webdriver;
  const noop = () => {};
  if (off) { window.track = noop; window.__vid = ''; return; }

  const rnd = () => (crypto.randomUUID ? crypto.randomUUID().replace(/-/g, '').slice(0, 20) : String(Math.random()).slice(2, 12) + Date.now().toString(36));
  let vid = store.get('vid');
  if (!vid) { vid = rnd(); store.set('vid', vid); }
  let sid;
  try { sid = sessionStorage.getItem('sid'); if (!sid) { sid = rnd(); sessionStorage.setItem('sid', sid); } } catch { sid = rnd(); }
  window.__vid = vid; window.__sid = sid;

  const cut = (v, n) => String(v ?? '').replace(/\s+/g, ' ').trim().slice(0, n);
  let queue = [];
  const started = Date.now();
  const track = (type, target = '', label = '', data = null) => {
    queue.push({ t: Date.now(), type, path: location.pathname + location.hash, target: cut(target, 120), label: cut(label, 200), data });
    if (queue.length >= 15) flush();
  };
  function flush() {
    if (!queue.length) return;
    const body = JSON.stringify({ vid, sid, lang: document.documentElement.lang || '', events: queue.splice(0, 40) });
    try {
      if (!(navigator.sendBeacon && navigator.sendBeacon('/api/t', new Blob([body], { type: 'text/plain' })))) {
        fetch('/api/t', { method: 'POST', body, keepalive: true, headers: { 'content-type': 'text/plain' } }).catch(noop);
      }
    } catch { /* статистика не должна ломать сайт */ }
  }
  window.track = track;
  setInterval(flush, 6000);

  /* ---- вход на страницу ---- */
  const utm = ['utm_source', 'utm_medium', 'utm_campaign'].map((k) => qs.get(k)).filter(Boolean).join('/');
  track('pageview', '', document.referrer, {
    screen: `${screen.width}x${screen.height}`, vp: `${innerWidth}x${innerHeight}`,
    theme: document.documentElement.dataset.theme || (matchMedia('(prefers-color-scheme:dark)').matches ? 'dark' : 'light'),
    utm: utm || undefined
  });

  /* ---- какие разделы доходили до экрана ---- */
  const seen = new Set();
  const io = 'IntersectionObserver' in window ? new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting && !seen.has(en.target.id)) { seen.add(en.target.id); track('section', en.target.id); }
    });
  }, { threshold: 0.35 }) : null;
  const watchSections = () => document.querySelectorAll('section[id], .doc-block[id]').forEach((el) => io?.observe(el));
  watchSections();
  addEventListener('load', watchSections);

  /* ---- глубина прокрутки ---- */
  let maxDepth = 0;
  const marks = new Set();
  addEventListener('scroll', () => {
    const h = document.documentElement.scrollHeight - innerHeight;
    if (h <= 0) return;
    const d = Math.round((scrollY / h) * 100);
    maxDepth = Math.max(maxDepth, d);
    [25, 50, 75, 100].forEach((m) => { if (d >= m && !marks.has(m)) { marks.add(m); track('scroll', String(m)); } });
  }, { passive: true });

  /* ---- нажатия ---- */
  const DOWNLOAD = /\.(pdf|vcf|docx?|xlsx?|pptx?|zip|csv)(\?|#|$)/i;
  addEventListener('click', (e) => {
    const el = e.target.closest('a[href], button, [role="button"], [data-go]');
    if (!el || el.closest('#form input, #form textarea')) return;
    const text = cut(el.getAttribute('aria-label') || el.textContent, 80);
    if (el.tagName === 'A' && el.getAttribute('href')) {
      const href = el.getAttribute('href');
      let url; try { url = new URL(href, location.href); } catch { return; }
      if (el.hasAttribute('download') || DOWNLOAD.test(url.pathname)) return track('download', url.pathname.split('/').pop(), text);
      if (url.protocol === 'tel:') return track('click', 'phone', href);
      if (url.protocol === 'mailto:') return track('click', 'email', href);
      if (/(^|\.)(t\.me|wa\.me|telegram\.me)$/.test(url.hostname)) return track('click', 'messenger', url.href);
      if (url.origin !== location.origin) return track('click', 'outbound', url.href);
      return track('click', 'link', url.pathname + url.hash, { text });
    }
    track('click', el.id || el.className?.toString().split(' ')[0] || el.tagName.toLowerCase(), text);
  }, true);

  addEventListener('hashchange', () => track('view', location.hash));

  /* ---- окна: какое открыли ---- */
  document.querySelectorAll('dialog').forEach((d) => {
    new MutationObserver(() => {
      if (d.open) track('modal', d.id, d.querySelector('h2, h3')?.textContent || '');
    }).observe(d, { attributes: true, attributeFilter: ['open'] });
  });

  /* ---- форма: как человек по ней проходит (без текста — текст приходит только с отправкой) ---- */
  const touched = new Set();
  let formStarted = false, formSent = false;
  document.addEventListener('focusin', (e) => {
    const f = e.target.closest?.('#form');
    const name = e.target.name;
    if (!f || !name || name === 'company') return;
    if (!formStarted) { formStarted = true; track('form_start'); }
    if (!touched.has(name)) { touched.add(name); track('form_field', name); }
  });
  window.addEventListener('track:form-sent', () => { formSent = true; });

  /* ---- скорость у настоящих посетителей (LCP, INP, CLS): три числа, без профилей ---- */
  const vit = { lcp: null, cls: 0, inp: null };
  try {
    new PerformanceObserver((l) => { const e = l.getEntries().pop(); if (e) vit.lcp = Math.round(e.startTime); })
      .observe({ type: 'largest-contentful-paint', buffered: true });
    new PerformanceObserver((l) => { l.getEntries().forEach((e) => { if (!e.hadRecentInput) vit.cls += e.value; }); })
      .observe({ type: 'layout-shift', buffered: true });
    new PerformanceObserver((l) => { l.getEntries().forEach((e) => { vit.inp = Math.max(vit.inp || 0, Math.round(e.duration)); }); })
      .observe({ type: 'event', durationThreshold: 40, buffered: true });
  } catch { /* браузер не умеет — просто без замеров */ }

  /* ---- уход со страницы ---- */
  let left = false;
  const leave = () => {
    if (left) return; left = true;
    if (formStarted && !formSent) track('form_abandon', '', [...touched].join(','));
    if (vit.lcp != null) track('vitals', '', '', { lcp: vit.lcp, cls: Math.round(vit.cls * 1000) / 1000, inp: vit.inp });
    track('leave', '', '', { sec: Math.round((Date.now() - started) / 1000), depth: maxDepth });
    flush();
  };
  addEventListener('pagehide', leave);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') { leave(); } else { left = false; }
  });
})();
