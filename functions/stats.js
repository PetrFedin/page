/* Кабинет статистики: только для владельца, по логину и паролю.
   Клиентский код написан обычной функцией и вставляется в страницу целиком,
   чтобы его можно было проверять и править как обычный JS. */
import { authorized, gate } from './api/stats.js';

export async function onRequestGet({ request, env }) {
  const ok = await authorized(request, env);
  if (ok !== true) return gate(ok);
  const html = PAGE.replace('/*CLIENT*/', `var __name=function(f){return f};(${client.toString()})();`);
  return new Response(html, {
    headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store', 'x-robots-tag': 'noindex, nofollow' }
  });
}

const PAGE = String.raw`<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<meta name="color-scheme" content="light dark">
<title>Статистика · syntha.pro</title>
<style>
:root{--bg:#f6f4f0;--panel:#ffffff;--ink:#17171a;--muted:#6c6a66;--line:#e7e3dc;--accent:#a8432a;--accent2:#d98a70;--soft:#f6e9e3;--ok:#2d7a4f;--bad:#b3261e;--shadow:0 1px 2px rgba(20,18,16,.05),0 6px 20px rgba(20,18,16,.04)}
@media (prefers-color-scheme:dark){:root{--bg:#0d0d0f;--panel:#161618;--ink:#f0eee9;--muted:#9b9791;--line:#2a2a2d;--accent:#e08a6f;--accent2:#8f4a38;--soft:#2b1f1b;--ok:#6cc08b;--bad:#ef8a83;--shadow:none}}
*{box-sizing:border-box}
html{-webkit-text-size-adjust:100%}
body{margin:0;background:var(--bg);color:var(--ink);font:15px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;font-variant-numeric:tabular-nums}
button,input,select{font:inherit;color:inherit}
header{position:sticky;top:0;z-index:20;background:color-mix(in srgb,var(--bg) 88%,transparent);backdrop-filter:blur(10px);border-bottom:1px solid var(--line)}
.bar{max-width:1180px;margin:0 auto;padding:12px 18px;display:flex;flex-wrap:wrap;align-items:center;gap:10px 18px}
.brand{display:flex;align-items:baseline;gap:10px}
.brand h1{font-size:18px;margin:0;font-weight:650;letter-spacing:-.01em}
.brand span{font-size:13px;color:var(--muted)}
.grow{flex:1}
.seg{display:inline-flex;background:var(--panel);border:1px solid var(--line);border-radius:999px;padding:3px;gap:2px;box-shadow:var(--shadow);flex-wrap:wrap}
.seg button{border:0;background:transparent;border-radius:999px;padding:6px 13px;cursor:pointer;color:var(--muted);white-space:nowrap}
.seg button.on{background:var(--ink);color:var(--bg)}
.tabs{max-width:1180px;margin:0 auto;padding:0 18px 10px;display:flex;gap:6px;overflow-x:auto;scrollbar-width:none}
.tabs::-webkit-scrollbar{display:none}
.tab{border:1px solid transparent;background:transparent;border-radius:10px;padding:7px 13px;cursor:pointer;color:var(--muted);white-space:nowrap;display:inline-flex;gap:7px;align-items:center}
.tab:hover{color:var(--ink)}
.tab.on{background:var(--panel);border-color:var(--line);color:var(--ink);box-shadow:var(--shadow)}
.badge{font-size:12px;background:var(--accent);color:#fff;border-radius:999px;padding:0 7px;line-height:18px;min-width:18px;text-align:center}
main{max-width:1180px;margin:0 auto;padding:20px 18px 80px}
.live{display:flex;flex-wrap:wrap;align-items:center;gap:6px 14px;margin-bottom:16px;color:var(--muted);font-size:14px}
.dot{width:9px;height:9px;border-radius:50%;background:var(--ok);display:inline-block;margin-right:6px;box-shadow:0 0 0 0 rgba(45,122,79,.5);animation:pulse 2s infinite}
.dot.off{background:var(--muted);animation:none}
@keyframes pulse{70%{box-shadow:0 0 0 8px rgba(45,122,79,0)}100%{box-shadow:0 0 0 0 rgba(45,122,79,0)}}
.kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(146px,1fr));gap:10px;margin-bottom:16px}
.kpi,.box{background:var(--panel);border:1px solid var(--line);border-radius:16px;box-shadow:var(--shadow)}
.kpi{padding:15px 16px}
.kpi .l{font-size:13px;color:var(--muted)}
.kpi .v{white-space:nowrap;font-size:30px;font-weight:650;letter-spacing:-.02em;line-height:1.15;margin:3px 0 2px}
.kpi .d{font-size:12.5px;color:var(--muted)}
.up{color:var(--ok)}.down{color:var(--bad)}
.box{padding:16px 18px;margin-bottom:14px}
.box h2{font-size:15px;margin:0 0 3px;font-weight:650}
.box .sub{font-size:13px;color:var(--muted);margin:0 0 12px}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(340px,1fr));gap:14px}
.grid>.box{margin:0}
.insights{display:grid;gap:8px;margin:0;padding:0;list-style:none}
.insights li{padding:10px 13px;border-radius:12px;background:var(--soft);font-size:14.5px}
.row{position:relative;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px;padding:7px 0;font-size:14px;align-items:center}
.row .n{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;position:relative;z-index:1}
.row .c{color:var(--muted);position:relative;z-index:1}
.row .fill{position:absolute;left:0;top:3px;bottom:3px;border-radius:7px;background:linear-gradient(90deg,var(--accent2),transparent);opacity:.28}
.stack{display:flex;height:12px;border-radius:99px;overflow:hidden;background:var(--line);margin:8px 0 10px}
.stack i{display:block}
.legend{display:flex;flex-wrap:wrap;gap:6px 16px;font-size:13px;color:var(--muted)}
.legend b{color:var(--ink);font-weight:600}
.sw{display:inline-block;width:9px;height:9px;border-radius:3px;margin-right:6px}
.funnel{display:grid;gap:9px}
.step{display:grid;grid-template-columns:150px minmax(0,1fr) 92px;gap:10px;align-items:center;font-size:14px}
.step .bar{height:26px;border-radius:8px;background:var(--line);overflow:hidden;padding:0;display:block;max-width:none;margin:0}
.step .bar i{display:block;height:100%;background:linear-gradient(90deg,var(--accent),var(--accent2));border-radius:8px}
.step .p{text-align:right;color:var(--muted)}
.cols{display:flex;align-items:flex-end;gap:3px;height:96px}
.cols div{flex:1;background:var(--accent2);border-radius:4px 4px 0 0;min-height:2px;position:relative}
.cols div:hover{background:var(--accent)}
.axis{display:flex;justify-content:space-between;font-size:11.5px;color:var(--muted);margin-top:5px}
.chartwrap{position:relative}
svg.chart{width:100%;height:210px;display:block}
.tip{position:absolute;pointer-events:none;background:var(--ink);color:var(--bg);font-size:12.5px;padding:6px 9px;border-radius:8px;white-space:nowrap;transform:translate(-50%,-110%);display:none;z-index:3}
.toolbar{display:flex;flex-wrap:wrap;gap:8px 10px;align-items:center;margin-bottom:12px}
.chip{border:1px solid var(--line);background:var(--panel);border-radius:999px;padding:5px 12px;cursor:pointer;font-size:13.5px;color:var(--muted)}
.chip.on{background:var(--ink);color:var(--bg);border-color:var(--ink)}
input.search{border:1px solid var(--line);background:var(--panel);border-radius:999px;padding:7px 14px;min-width:220px;flex:1;max-width:340px;outline:none}
input.search:focus{border-color:var(--accent)}
.btn{border:1px solid var(--line);background:var(--panel);border-radius:10px;padding:7px 13px;cursor:pointer;font-size:13.5px}
.btn:hover{border-color:var(--ink)}
.person{background:var(--panel);border:1px solid var(--line);border-radius:16px;margin-bottom:10px;box-shadow:var(--shadow);overflow:hidden}
.person .top{display:flex;gap:13px;align-items:center;padding:13px 16px;cursor:pointer}
.person .top:hover{background:color-mix(in srgb,var(--soft) 50%,transparent)}
.ava{width:40px;height:40px;border-radius:50%;background:var(--soft);color:var(--accent);display:grid;place-items:center;font-weight:650;flex:none}
.ava.lead{background:var(--accent);color:#fff}
.who{min-width:0;flex:1}
.who b{display:block;font-weight:600}
.who > span{display:block;font-size:13px;color:var(--muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.who b .tag{margin-left:6px}
.meta{text-align:right;font-size:13px;color:var(--muted);white-space:nowrap}
.tag{display:inline-block;font-size:12px;padding:1px 9px;border-radius:999px;background:var(--soft);color:var(--accent);vertical-align:1px}
.tag.bad{background:transparent;border:1px solid var(--bad);color:var(--bad)}
.tag.ok{background:transparent;border:1px solid var(--ok);color:var(--ok)}
.detail{border-top:1px solid var(--line);padding:6px 16px 14px;background:color-mix(in srgb,var(--bg) 50%,var(--panel))}
.detail[hidden]{display:none}
.sess{margin-top:10px;font-size:12.5px;color:var(--muted);text-transform:uppercase;letter-spacing:.06em}
.tl{list-style:none;margin:6px 0 0;padding:0 0 0 16px;border-left:2px solid var(--line);font-size:14px}
.tl li{position:relative;padding:3px 0 3px 12px;display:grid;grid-template-columns:54px minmax(0,1fr);gap:8px}
.tl li::before{content:"";position:absolute;left:-22px;top:11px;width:8px;height:8px;border-radius:50%;background:var(--accent2)}
.tl li.key::before{background:var(--accent);box-shadow:0 0 0 3px var(--soft)}
.tl time{color:var(--muted);font-size:12.5px}
.card{background:var(--panel);border:1px solid var(--line);border-radius:16px;padding:16px 18px;margin-bottom:12px;box-shadow:var(--shadow)}
.card .head{display:flex;flex-wrap:wrap;gap:6px 12px;align-items:baseline;margin-bottom:6px}
.card .head h3{margin:0;font-size:16px}
.card .when{color:var(--muted);font-size:13px}
.card .contacts{display:flex;flex-wrap:wrap;gap:6px 14px;font-size:14px;margin:6px 0}
.card .contacts a{color:var(--accent);text-decoration:none}
.card .msg{white-space:pre-wrap;background:var(--bg);border-radius:12px;padding:11px 13px;margin:8px 0;font-size:14.5px}
.card .act{display:flex;gap:8px;flex-wrap:wrap;margin-top:6px}
.empty{text-align:center;color:var(--muted);padding:34px 10px}
.empty b{display:block;color:var(--ink);font-size:16px;margin-bottom:4px}
table.t{width:100%;border-collapse:collapse;font-size:14px}
table.t th{text-align:left;color:var(--muted);font-weight:500;font-size:12.5px;padding:6px 8px;border-bottom:1px solid var(--line)}
table.t td{padding:8px;border-bottom:1px solid var(--line);vertical-align:top}
.hint{font-size:13px;color:var(--muted);margin:10px 0 0}
.feed{list-style:none;margin:0;padding:0;font-size:14px}
.feed li{display:grid;grid-template-columns:52px minmax(0,1fr);gap:10px;padding:7px 0;border-bottom:1px solid var(--line)}
.feed li:last-child{border:0}
.feed time{color:var(--muted);font-size:12.5px}
.feed small{color:var(--muted);display:block}
.h3s{margin:14px 0 0;font-size:13px;color:var(--muted);font-weight:600}
.err{padding:20px;border:1px dashed var(--bad);border-radius:14px;color:var(--bad)}
@media(max-width:640px){.seg button{padding:6px 10px}.bar{padding:10px 14px}main{padding:16px 14px 70px}.step{grid-template-columns:104px minmax(0,1fr) 70px}.meta{display:none}.kpi .v{font-size:26px}.grid{grid-template-columns:minmax(0,1fr)}}
</style>
</head>
<body>
<header>
  <div class="bar">
    <div class="brand"><h1>Статистика</h1><span>syntha.pro</span></div>
    <div class="grow"></div>
    <div class="seg" id="range" role="group" aria-label="Период"></div>
    <button class="btn" id="refresh" title="Обновить данные">Обновить</button>
    <button class="btn" id="mute"></button>
  </div>
  <nav class="tabs" id="tabs" aria-label="Разделы"></nav>
</header>
<main id="app"><p class="empty">Загрузка…</p></main>
<script>/*CLIENT*/</script>
</body>
</html>`;

/* ---------- клиентская часть ---------- */
function client() {
  const $ = (s) => document.querySelector(s);
  const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const nf = new Intl.NumberFormat('ru-RU');
  const num = (v) => nf.format(v || 0);
  const plural = (n, a, b, c) => { const m = n % 100, d = n % 10; return m > 10 && m < 20 ? c : d === 1 ? a : d > 1 && d < 5 ? b : c; };

  const SEC = { hero: 'Первый экран', about: 'Обо мне', consulting: 'Консалтинг', experience: 'Опыт', projects: 'Проекты', news: 'Лента', media: 'Публикации', contact: 'Форма связи', now: 'Сейчас' };
  const secName = (id) => SEC[id] || (/^s\d+/.test(id) ? 'Раздел ' + id.toUpperCase() : id);
  const TABS = [['overview', 'Обзор'], ['sections', 'Что смотрят'], ['people', 'Люди'], ['leads', 'Заявки'], ['forms', 'Форма и квиз'], ['tech', 'Техника']];
  const RANGES = [[1, 'Сегодня'], [7, '7 дней'], [30, '30 дней'], [90, '90 дней'], [365, 'Год']];
  const KIND = { messenger: 'Мессенджер', outbound: 'Внешняя ссылка', phone: 'Телефон', email: 'Почта', link: 'Переход по сайту' };
  const DEV = { phone: 'Телефон', desktop: 'Компьютер', tablet: 'Планшет' };
  let regionNames = null;
  try { regionNames = new Intl.DisplayNames(['ru'], { type: 'region' }); } catch { /* старый браузер */ }

  let tab = 'overview', days = 30, data = null;
  const ui = { people: { q: '', f: 'all' }, leads: { f: 'all' }, open: {}, cache: {} };

  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch { /* приватный режим */ } },
    del(k) { try { localStorage.removeItem(k); } catch { /* приватный режим */ } }
  };
  const savedDays = Number(store.get('statsDays'));
  if (RANGES.some(([d]) => d === savedDays)) days = savedDays;
  const savedTab = store.get('statsTab');
  if (TABS.some(([k]) => k === savedTab)) tab = savedTab;

  /* ---------- вспомогательное ---------- */
  const country = (c) => { try { return regionNames ? regionNames.of(c) : c; } catch { return c; } };
  const place = (r) => [r.city, r.country && country(r.country)].filter(Boolean).join(', ') || 'Не определено';
  const fmtTime = (ts) => new Date(ts).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  const fmtDate = (ts) => new Date(ts).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
  const when = (ts) => {
    const d = new Date(ts), t = new Date(), diff = (t - d) / 6e4;
    if (diff < 1) return 'только что';
    if (diff < 60) return Math.round(diff) + ' мин назад';
    if (d.toDateString() === t.toDateString()) return 'сегодня, ' + fmtTime(ts);
    const y = new Date(t); y.setDate(t.getDate() - 1);
    if (d.toDateString() === y.toDateString()) return 'вчера, ' + fmtTime(ts);
    return fmtDate(ts) + ', ' + fmtTime(ts);
  };
  const dur = (s) => s == null ? '—' : s >= 60 ? Math.floor(s / 60) + ' м ' + String(Math.round(s % 60)).padStart(2, '0') + ' с' : Math.round(s) + ' с';
  const refHost = (r) => { if (!r) return ''; try { return new URL(r).hostname.replace(/^www\./, ''); } catch { return r; } };
  const SOURCE = [
    ['Прямые заходы', (h) => !h, '#7d8a99'],
    ['Telegram и мессенджеры', (h) => /(^|\.)(t\.me|telegram\.(org|me)|wa\.me|whatsapp\.com)$/.test(h), '#3a8fd0'],
    ['Поиск', (h) => /(google|yandex|bing|duckduckgo|ya\.ru|mail\.ru|baidu)/.test(h), '#2d7a4f'],
    ['Соцсети', (h) => /(facebook|instagram|vk\.com|linkedin|twitter|x\.com|youtube|dzen|ok\.ru)/.test(h), '#a8432a'],
    ['Другие сайты', () => true, '#c89b3c']
  ];
  const srcOf = (h) => SOURCE.find(([, test]) => test(h));
  const initials = (n) => String(n || '?').trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
  const nameOf = (vid) => ((data && data.names.find((n) => n.vid === vid)) || {}).name || '';

  function delta(cur, prev) {
    cur = cur || 0; prev = prev || 0;
    if (!prev && !cur) return '<span class="d">в прошлом периоде тоже пусто</span>';
    if (!prev) return '<span class="d up">новое: раньше было 0</span>';
    const p = Math.round((cur - prev) / prev * 100);
    if (p === 0) return '<span class="d">как в прошлом периоде</span>';
    return '<span class="d ' + (p > 0 ? 'up' : 'down') + '">' + (p > 0 ? '▲ +' : '▼ ') + p + '% к прошлому периоду</span>';
  }

  const bars = (rows, label, value, fmt) => {
    if (!rows || !rows.length) return '<p class="hint">Пока нет данных.</p>';
    const max = Math.max(...rows.map(value), 1);
    return rows.map((r) => '<div class="row"><div class="fill" style="width:' + Math.round(value(r) / max * 100) + '%"></div><span class="n">' + label(r) + '</span><span class="c">' + (fmt ? fmt(r) : num(value(r))) + '</span></div>').join('');
  };

  /* ---------- загрузка ---------- */
  async function api(qs) {
    const r = await fetch('/api/stats?' + qs, { credentials: 'same-origin', cache: 'no-store' });
    if (!r.ok) throw new Error(String(r.status));
    return r.json();
  }
  async function load(silent) {
    if (!silent) $('#app').innerHTML = '<p class="empty">Загрузка…</p>';
    try { data = await api('days=' + days); draw(); }
    catch (e) {
      if (!silent) $('#app').innerHTML = '<div class="err"><b>Не удалось загрузить данные (' + esc(e.message) + ').</b><br>Если ошибка 500 — проверьте привязку базы <code>DB</code> в настройках проекта Cloudflare Pages.</div>';
    }
  }

  /* ---------- «Обзор» ---------- */
  function insights() {
    const t = data.totals || {}, f = data.funnel || {}, out = [];
    if (!t.visitors) return ['За выбранный период посетителей ещё не было.'];
    const phone = (data.tech.device.find((x) => x.k === 'phone') || {}).n || 0;
    const devTotal = data.tech.device.reduce((a, x) => a + x.n, 0) || 1;
    const srcCount = {};
    data.refs.forEach((r) => { const s = srcOf(refHost(r.ref))[0]; srcCount[s] = (srcCount[s] || 0) + r.n; });
    const srcTotal = Object.values(srcCount).reduce((a, b) => a + b, 0) || 1;
    const topSrc = Object.entries(srcCount).sort((a, b) => b[1] - a[1])[0];
    if (topSrc) out.push('Чаще всего приходят: <b>' + esc(topSrc[0].toLowerCase()) + '</b> — ' + Math.round(topSrc[1] / srcTotal * 100) + '% визитов.');
    out.push('С телефона заходят <b>' + Math.round(phone / devTotal * 100) + '%</b> посетителей — ' + (phone / devTotal > 0.5 ? 'мобильная версия главная.' : 'преобладает компьютер.'));
    if (data.sections.length > 1) out.push('Лучше всего «читается» раздел <b>' + esc(secName(data.sections[0].target)) + '</b>, реже всего до раздела «' + esc(secName(data.sections[data.sections.length - 1].target)) + '» доходят.');
    if (f.visit) out.push('До формы доходят <b>' + Math.round((f.saw_form || 0) / f.visit * 100) + '%</b> визитов, начинают заполнять <b>' + Math.round((f.started || 0) / f.visit * 100) + '%</b>, отправляют <b>' + (f.sent || 0) + '</b>.');
    if (data.returning) out.push('Вернулись на сайт повторно: <b>' + data.returning + '</b> чел. — они уже знакомы с вами.');
    return out;
  }

  function chart() {
    const d = data.daily;
    if (!d.length) return '<p class="hint">Пока нет данных.</p>';
    const W = 640, H = 210, pl = 34, pr = 8, pt = 10, pb = 26;
    const max = Math.max(...d.map((x) => x.views), 1);
    const nice = max <= 5 ? 5 : Math.ceil(max / 5) * 5;
    const bw = (W - pl - pr) / d.length;
    let g = '';
    for (let i = 0; i <= 4; i++) {
      const y = pt + (H - pt - pb) * (1 - i / 4);
      g += '<line x1="' + pl + '" x2="' + (W - pr) + '" y1="' + y + '" y2="' + y + '" stroke="var(--line)"/><text x="' + (pl - 6) + '" y="' + (y + 4) + '" font-size="11" text-anchor="end" fill="var(--muted)">' + Math.round(nice * i / 4) + '</text>';
    }
    const cols = d.map((x, i) => {
      const hv = (H - pt - pb) * x.views / nice, hp = (H - pt - pb) * x.visitors / nice, xx = pl + i * bw;
      return '<g class="col" data-i="' + i + '"><rect x="' + xx + '" y="' + pt + '" width="' + bw + '" height="' + (H - pt - pb) + '" fill="transparent"/>'
        + '<rect x="' + (xx + bw * .12) + '" y="' + (H - pb - hv) + '" width="' + (bw * .76) + '" height="' + hv + '" rx="3" fill="var(--accent2)" opacity=".55"/>'
        + '<rect x="' + (xx + bw * .12) + '" y="' + (H - pb - hp) + '" width="' + (bw * .76) + '" height="' + hp + '" rx="3" fill="var(--accent)"/></g>';
    }).join('');
    const step = Math.max(1, Math.ceil(d.length / 7));
    const labels = d.map((x, i) => i % step === 0 ? '<text x="' + (pl + i * bw + bw / 2) + '" y="' + (H - 7) + '" font-size="11" text-anchor="middle" fill="var(--muted)">' + fmtDate(x.d) + '</text>' : '').join('');
    return '<div class="chartwrap"><svg class="chart" viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none">' + g + cols + labels + '</svg><div class="tip" id="tip"></div></div>'
      + '<div class="legend" style="margin-top:6px"><span><i class="sw" style="background:var(--accent)"></i>Люди</span><span><i class="sw" style="background:var(--accent2);opacity:.6"></i>Просмотры страниц</span></div>';
  }

  function sourcesBox() {
    const by = {};
    data.refs.forEach((r) => { const s = srcOf(refHost(r.ref)); by[s[0]] = by[s[0]] || { n: 0, c: s[2] }; by[s[0]].n += r.n; });
    const total = Object.values(by).reduce((a, x) => a + x.n, 0);
    const list = Object.entries(by).sort((a, b) => b[1].n - a[1].n);
    const named = data.refs.filter((r) => r.ref).slice(0, 6);
    return '<div class="box"><h2>Откуда приходят</h2><p class="sub">Где человек был перед тем, как открыть сайт</p>'
      + (total ? '<div class="stack">' + list.map(([k, v]) => '<i style="width:' + (v.n / total * 100) + '%;background:' + v.c + '" title="' + esc(k) + '"></i>').join('') + '</div>'
        + '<div class="legend">' + list.map(([k, v]) => '<span><i class="sw" style="background:' + v.c + '"></i><b>' + Math.round(v.n / total * 100) + '%</b> ' + esc(k) + '</span>').join('') + '</div>'
        + (named.length ? '<p class="h3s">Конкретные сайты</p>' + bars(named, (r) => esc(refHost(r.ref)), (r) => r.n) : '') : '<p class="hint">Пока нет данных.</p>') + '</div>';
  }

  function geoBox() {
    const byC = {};
    data.geo.forEach((g) => { byC[g.country] = (byC[g.country] || 0) + g.n; });
    const countries = Object.entries(byC).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([c, n]) => ({ country: c, n }));
    return '<div class="box"><h2>Где живут посетители</h2><p class="sub">Страна и город определяются по сети, это примерно</p>'
      + bars(countries, (r) => esc(place({ country: r.country })), (r) => r.n)
      + '<p class="h3s">Города</p>' + bars(data.geo.filter((g) => g.city).slice(0, 8), (r) => esc(place(r)), (r) => r.n) + '</div>';
  }

  function timeBox() {
    const h = Array.from({ length: 24 }, (_, i) => (data.hours.find((x) => x.h === i) || {}).n || 0);
    const max = Math.max(...h, 1);
    const wd = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
    const w = [1, 2, 3, 4, 5, 6, 0].map((i) => ({ k: wd[i], n: (data.weekdays.find((x) => x.d === i) || {}).n || 0 }));
    const peak = h.indexOf(Math.max(...h));
    return '<div class="box"><h2>Когда заходят</h2><p class="sub">' + (Math.max(...h) ? 'Пик — около ' + peak + ':00 по Москве' : 'Время по Москве') + '</p>'
      + '<div class="cols">' + h.map((n, i) => '<div style="height:' + Math.max(2, n / max * 100) + '%" title="' + i + ':00 — ' + n + '"></div>').join('') + '</div>'
      + '<div class="axis"><span>0</span><span>6</span><span>12</span><span>18</span><span>23</span></div>'
      + '<p class="h3s">По дням недели</p>' + bars(w, (r) => r.k, (r) => r.n) + '</div>';
  }

  function funnelBox() {
    const f = data.funnel || {};
    const steps = [['Зашли на сайт', f.visit || 0], ['Дошли до формы', f.saw_form || 0], ['Начали заполнять', f.started || 0], ['Отправили заявку', f.sent || 0]];
    const base = Math.max(steps[0][1], 1);
    return '<div class="box"><h2>Путь к заявке</h2><p class="sub">Сколько визитов доходит до каждого шага</p><div class="funnel">'
      + steps.map(([l, n], i) => '<div class="step"><span>' + l + '</span><div class="bar"><i style="width:' + Math.max(n ? 3 : 0, n / base * 100) + '%"></i></div><span class="p">' + num(n) + (i ? ' · ' + Math.round(n / base * 100) + '%' : '') + '</span></div>').join('')
      + '</div></div>';
  }

  function liveBox() {
    const list = data.live || [];
    return '<div class="box"><h2>Последние действия</h2><p class="sub">Что происходит на сайте прямо сейчас</p>'
      + (list.length ? '<ul class="feed">' + list.map((e) => '<li><time>' + fmtTime(e.ts) + '</time><div>' + evText(e) + '<small>' + esc(nameOf(e.vid) || place(e)) + ' · ' + esc(DEV[e.device] || '') + '</small></div></li>').join('') + '</ul>' : '<p class="hint">Пока нет данных.</p>') + '</div>';
  }

  function vitalsBox() {
    const v = data.vitals || {};
    if (!v.n) return '';
    const rate = (x, good, poor) => x == null ? '—' : x <= good ? '<span class="up">хорошо</span>' : x <= poor ? 'допустимо' : '<span class="down">медленно</span>';
    return '<div class="box"><h2>Скорость сайта у посетителей</h2><p class="sub">У трёх из четырёх людей быстрее этих значений · ' + v.n + ' замеров</p><div class="kpis" style="margin:0">'
      + '<div class="kpi"><div class="l">Загрузка главного блока</div><div class="v">' + (v.lcp != null ? (v.lcp / 1000).toFixed(1) + ' с' : '—') + '</div><div class="d">' + rate(v.lcp, 2500, 4000) + ' (норма до 2,5 с)</div></div>'
      + '<div class="kpi"><div class="l">Отклик на нажатие</div><div class="v">' + (v.inp != null ? v.inp + ' мс' : '—') + '</div><div class="d">' + rate(v.inp, 200, 500) + ' (норма до 200 мс)</div></div>'
      + '<div class="kpi"><div class="l">Прыжки макета</div><div class="v">' + (v.cls != null ? v.cls : '—') + '</div><div class="d">' + rate(v.cls, 0.1, 0.25) + ' (норма до 0,1)</div></div></div></div>';
  }

  function overview() {
    const t = data.totals || {}, p = data.prev || {}, f = data.funnel || {};
    const conv = f.visit ? Math.round((f.sent || 0) / f.visit * 1000) / 10 : 0;
    const k = (l, v, d) => '<div class="kpi"><div class="l">' + l + '</div><div class="v">' + v + '</div>' + d + '</div>';
    return '<div class="live"><span><i class="dot' + (data.online.m5 ? '' : ' off') + '"></i>Сейчас на сайте: <b style="color:var(--ink)">' + data.online.m5 + '</b></span><span>за 30 минут: ' + data.online.m30 + '</span><span>обновлено ' + fmtTime(data.generated) + '</span></div>'
      + '<div class="kpis">'
      + k('Людей', num(t.visitors), delta(t.visitors, p.visitors))
      + k('Визитов', num(t.sessions), delta(t.sessions, p.sessions))
      + k('Просмотров страниц', num(t.views), delta(t.views, p.views))
      + k('Время на сайте', dur(data.avgSec), '<span class="d">в среднем за визит</span>')
      + k('Заявок', num(f.sent || 0), delta(f.sent, p.sent))
      + k('Визит → заявка', conv + '%', '<span class="d">' + num(f.sent || 0) + ' из ' + num(f.visit || 0) + '</span>')
      + '</div>'
      + '<div class="box"><h2>Главное за период</h2><p class="sub">Коротко, простыми словами</p><ul class="insights">' + insights().map((x) => '<li>' + x + '</li>').join('') + '</ul></div>'
      + '<div class="box"><h2>Посещаемость по дням</h2><p class="sub">Наведите на столбец, чтобы увидеть цифры</p>' + chart() + '</div>'
      + '<div class="grid">' + sourcesBox() + funnelBox() + geoBox() + timeBox() + '</div>'
      + '<div style="height:14px"></div><div class="grid">' + liveBox() + vitalsBox() + '</div>';
  }

  /* ---------- «Что смотрят» ---------- */
  function sections() {
    const sess = Math.max((data.totals || {}).sessions || 1, 1);
    const secRows = data.sections.map((r) => ({ name: secName(r.target), n: r.n }));
    const click = data.clicks.map((r) => ({
      kind: r.type === 'download' ? 'Скачивание' : (KIND[r.target] || 'Кнопка'),
      what: r.type === 'download' ? r.target : (r.label || r.target), n: r.n, u: r.u, to: r.type === 'click' && KIND[r.target] && r.target !== 'link' ? r.label : ''
    }));
    const sum = (kinds) => click.filter((c) => kinds.includes(c.kind)).reduce((a, c) => a + c.n, 0);
    return '<div class="kpis">'
      + [['Написали или позвонили', sum(['Мессенджер', 'Телефон', 'Почта']), 'нажатий на контакты'],
         ['Скачали', sum(['Скачивание']), 'презентация и карточка контакта'],
         ['Открыли окон', data.modals.reduce((a, c) => a + c.n, 0), 'проекты, посты, форматы работы'],
         ['Перешли по ссылкам', sum(['Внешняя ссылка']), 'на внешние сайты']]
        .map(([l, v, d]) => '<div class="kpi"><div class="l">' + l + '</div><div class="v">' + num(v) + '</div><span class="d">' + d + '</span></div>').join('') + '</div>'
      + '<div class="grid"><div class="box"><h2>Какие разделы доходили до экрана</h2><p class="sub">Доля визитов, в которых раздел увидели</p>'
      + bars(secRows, (r) => esc(r.name), (r) => r.n, (r) => Math.round(r.n / sess * 100) + '% · ' + r.n)
      + '<p class="h3s">Как далеко листают</p>' + bars(data.depth, (r) => 'до ' + r.target + '% страницы', (r) => r.n, (r) => Math.round(r.n / sess * 100) + '%') + '</div>'
      + '<div class="box"><h2>Какие окна открывали</h2><p class="sub">Проекты, форматы работы, посты ленты</p>' + bars(data.modals, (r) => esc(r.label || r.target), (r) => r.n, (r) => r.n + ' · ' + r.u + ' чел.')
      + '<p class="h3s">Переходы к постам и форматам</p>' + bars(data.views, (r) => esc(String(r.target).replace(/^#/, '')), (r) => r.n, (r) => r.n + ' · ' + r.u + ' чел.') + '</div></div>'
      + '<div class="box" style="margin-top:14px"><h2>Нажатия и скачивания</h2><p class="sub">Куда нажимали чаще всего</p>'
      + (click.length ? '<table class="t"><tr><th>Тип</th><th>Что нажимали</th><th>Раз</th><th>Людей</th></tr>' + click.map((c) => '<tr><td>' + (c.kind === 'Скачивание' ? '<span class="tag">Скачивание</span>' : esc(c.kind)) + '</td><td>' + esc(c.what) + (c.to ? ' <span class="hint">' + esc(c.to) + '</span>' : '') + '</td><td>' + c.n + '</td><td>' + c.u + '</td></tr>').join('') + '</table>' : '<p class="hint">Пока нет данных.</p>') + '</div>';
  }

  /* ---------- «Люди» ---------- */
  function evText(e) {
    let d = {}; try { d = e.data ? JSON.parse(e.data) : {}; } catch { /* не json */ }
    const L = e.label || e.target || '';
    switch (e.type) {
      case 'pageview': return 'Открыл страницу <b>' + esc(e.path || '/') + '</b>';
      case 'section': return 'Дошёл до раздела «' + esc(secName(e.target)) + '»';
      case 'click': return KIND[e.target] ? 'Нажал: ' + esc(KIND[e.target].toLowerCase()) + ' <b>' + esc(e.label || '') + '</b>' : 'Нажал «<b>' + esc(L) + '</b>»';
      case 'download': return 'Скачал <b>' + esc(e.target) + '</b>';
      case 'modal': return 'Открыл окно «' + esc(L) + '»';
      case 'view': return 'Перешёл к <b>' + esc(e.target) + '</b>';
      case 'scroll': return 'Прокрутил до ' + esc(e.target) + '%';
      case 'leave': return 'Ушёл, пробыл ' + dur(d.sec) + ', прокрутил до ' + (d.depth || 0) + '%';
      case 'form_start': return 'Начал заполнять форму';
      case 'form_field': return 'Заполняет поле «' + esc(e.target) + '»';
      case 'form_try': return 'Нажал «Отправить»';
      case 'form_error': return 'Ошибка в форме: ' + esc(L);
      case 'form_abandon': return 'Бросил форму (поля: ' + esc(L) + ')';
      case 'form_sent': return '<b>Отправил заявку</b>' + (L ? ' · ' + esc(L) : '');
      case 'form_failed': return '<b>Заявка не дошла в Telegram</b>';
      case 'quiz_step': return 'Квиз, вопрос ' + esc(e.target) + ': ' + esc(L);
      case 'quiz_result': return 'Квиз завершён, рекомендован формат «' + esc(L) + '»';
      case 'vitals': return 'Замер скорости';
      default: return esc(e.type);
    }
  }
  const KEY = ['form_sent', 'form_failed', 'download', 'quiz_result', 'form_start'];

  function people() {
    const st = ui.people, q = st.q.trim().toLowerCase();
    const subSet = new Set(data.names.map((n) => n.vid));
    const list = data.visitors.filter((v) => {
      if (st.f === 'lead' && !subSet.has(v.vid)) return false;
      if (st.f === 'back' && v.sessions < 2) return false;
      if (st.f === 'phone' && v.device !== 'phone') return false;
      if (!q) return true;
      return [nameOf(v.vid), v.city, v.country, v.org, v.ip, v.browser, v.os].join(' ').toLowerCase().includes(q);
    });
    const chip = (k, l) => '<button class="chip' + (st.f === k ? ' on' : '') + '" data-pf="' + k + '">' + l + '</button>';
    return '<div class="toolbar"><input class="search" id="psearch" placeholder="Поиск: имя, город, провайдер…" value="' + esc(st.q) + '">'
      + chip('all', 'Все') + chip('lead', 'Оставили заявку') + chip('back', 'Вернулись') + chip('phone', 'С телефона') + '</div>'
      + (list.length ? list.map((v) => {
        const nm = nameOf(v.vid), isOpen = ui.open[v.vid];
        return '<div class="person"><div class="top" data-vid="' + esc(v.vid) + '"><div class="ava' + (nm ? ' lead' : '') + '">' + esc(nm ? initials(nm) : '•') + '</div>'
          + '<div class="who"><b>' + (nm ? esc(nm) + '<span class="tag">заявка</span>' : 'Посетитель ' + esc(v.vid.slice(0, 6)) + (v.sessions > 1 ? '<span class="tag ok">вернулся</span>' : '')) + '</b>'
          + '<span>' + esc(place(v)) + ' · ' + esc(DEV[v.device] || v.device) + ', ' + esc(v.browser) + ' · ' + esc(refHost(v.ref) || 'напрямую') + '</span></div>'
          + '<div class="meta">' + v.sessions + ' ' + plural(v.sessions, 'визит', 'визита', 'визитов') + '<br>' + esc(when(v.last)) + '</div></div>'
          + '<div class="detail" id="d-' + esc(v.vid) + '"' + (isOpen ? '' : ' hidden') + '>' + (isOpen ? (ui.cache[v.vid] || 'Загрузка…') : '') + '</div></div>';
      }).join('') : '<div class="empty"><b>Никого не нашли</b>Измените поиск или фильтр.</div>')
      + '<p class="hint">Имя известно только у тех, кто оставил заявку. Город и провайдер определяются по сети — это не личность. Нажмите на карточку, чтобы увидеть весь путь человека по сайту.</p>';
  }

  function timeline(r) {
    const sessions = {};
    r.events.forEach((e) => { (sessions[e.sid] = sessions[e.sid] || []).push(e); });
    const subs = r.subs.map((s) => '<div class="card" style="margin:10px 0 0"><div class="head"><h3>' + esc(s.name) + '</h3><span class="when">' + esc(when(s.ts)) + '</span></div><div class="contacts">' + [s.email, s.telegram, s.phone].filter(Boolean).map(esc).join(' · ') + '</div><div class="msg">' + esc(s.message) + '</div></div>').join('');
    return subs + Object.values(sessions).map((evs, i) => '<div class="sess">Визит ' + (i + 1) + ' · ' + esc(fmtDate(evs[0].ts)) + '</div><ul class="tl">'
      + evs.filter((e) => e.type !== 'vitals').map((e) => '<li class="' + (KEY.includes(e.type) ? 'key' : '') + '"><time>' + fmtTime(e.ts) + '</time><span>' + evText(e) + '</span></li>').join('') + '</ul>').join('');
  }

  async function togglePerson(vid) {
    const box = document.getElementById('d-' + vid);
    if (!box) return;
    if (!box.hidden) { box.hidden = true; delete ui.open[vid]; return; }
    ui.open[vid] = true; box.hidden = false; box.innerHTML = '<p class="hint">Загрузка…</p>';
    try {
      const r = await api('vid=' + encodeURIComponent(vid));
      ui.cache[vid] = timeline(r); box.innerHTML = ui.cache[vid];
    } catch { box.innerHTML = '<p class="hint">Не удалось загрузить путь.</p>'; }
  }

  /* ---------- «Заявки» ---------- */
  function leads() {
    const all = data.submissions, topics = [...new Set(all.map((s) => s.topic))];
    const f = ui.leads.f;
    const list = all.filter((s) => f === 'all' || s.topic === f);
    const chip = (k, l) => '<button class="chip' + (f === k ? ' on' : '') + '" data-lf="' + esc(k) + '">' + esc(l) + '</button>';
    const tg = (v) => 'https://t.me/' + encodeURIComponent(String(v).replace(/^@/, '').replace(/^https?:\/\/t\.me\//, ''));
    return '<div class="toolbar">' + chip('all', 'Все (' + all.length + ')') + topics.map((t) => chip(t, t)).join('') + '<div class="grow"></div><button class="btn" id="csv">Скачать таблицу (CSV)</button></div>'
      + (list.length ? list.map((s) => {
        let ent = null; try { ent = s.entity ? JSON.parse(s.entity) : null; } catch { /* не json */ }
        return '<div class="card"><div class="head"><h3>' + esc(s.name) + '</h3><span class="when">' + esc(when(s.ts)) + '</span><span class="tag">' + esc(s.topic) + '</span>'
          + (s.ok ? '' : '<span class="tag bad">в Telegram не ушла</span>') + (s.country ? '<span class="when">' + esc(place(s)) + '</span>' : '') + '</div>'
          + '<div class="contacts">' + (s.email ? '<a href="mailto:' + esc(s.email) + '">' + esc(s.email) + '</a>' : '') + (s.telegram ? '<a href="' + tg(s.telegram) + '" target="_blank" rel="noopener">Telegram: ' + esc(s.telegram) + '</a>' : '') + (s.phone ? '<a href="tel:' + esc(s.phone.replace(/[^\d+]/g, '')) + '">' + esc(s.phone) + '</a>' : '') + '</div>'
          + (ent ? '<div class="when">Юрлицо: ' + esc([ent.name, ent.inn && 'ИНН ' + ent.inn, ent.address, ent.site].filter(Boolean).join(' · ')) + '</div>' : '')
          + '<div class="msg">' + esc(s.message) + '</div>' + (s.file_name ? '<div class="when">Файл: ' + esc(s.file_name) + '</div>' : '')
          + '<div class="act"><button class="btn" data-copy="' + esc([s.name, s.email, s.telegram, s.phone].filter(Boolean).join(', ')) + '">Скопировать контакты</button><button class="btn" data-lead-vid="' + esc(s.vid) + '">Путь по сайту</button></div><div class="detail" id="ld-' + esc(s.vid) + '" hidden style="margin-top:8px;border-radius:12px;border:1px solid var(--line)"></div></div>';
      }).join('') : '<div class="empty"><b>Заявок пока нет</b>Когда кто-то заполнит форму, она появится здесь с текстом и путём по сайту.</div>');
  }

  function exportCsv() {
    const head = ['Дата', 'Имя', 'Email', 'Telegram', 'Телефон', 'Тема', 'Юрлицо', 'Сообщение', 'Страна', 'Город'];
    const q = (v) => '"' + String(v ?? '').replace(/"/g, '""') + '"';
    const rows = data.submissions.map((s) => {
      let ent = ''; try { const e = s.entity ? JSON.parse(s.entity) : null; ent = e ? [e.name, e.inn, e.address, e.site].filter(Boolean).join('; ') : ''; } catch { /* не json */ }
      return [new Date(s.ts).toLocaleString('ru-RU'), s.name, s.email, s.telegram, s.phone, s.topic, ent, s.message, s.country, s.city].map(q).join(';');
    });
    const blob = new Blob(['﻿' + [head.map(q).join(';'), ...rows].join('\r\n')], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'zayavki-' + new Date().toISOString().slice(0, 10) + '.csv'; a.click();
  }

  /* ---------- «Форма и квиз» ---------- */
  function forms() {
    const f = data.funnel || {};
    const quizSteps = data.quiz.filter((r) => r.type === 'quiz_step'), quizRes = data.quiz.filter((r) => r.type === 'quiz_result');
    const byQ = {}; quizSteps.forEach((r) => { (byQ[r.target] = byQ[r.target] || []).push(r); });
    return '<div class="kpis">'
      + [['Дошли до формы', f.saw_form || 0], ['Начали заполнять', f.started || 0], ['Отправили', f.sent || 0], ['Не дошло в Telegram', f.failed || 0], ['Ошибок заполнения', f.errors || 0]]
        .map(([l, v]) => '<div class="kpi"><div class="l">' + l + '</div><div class="v">' + num(v) + '</div></div>').join('') + '</div>'
      + '<div class="grid"><div class="box"><h2>Какие поля трогали</h2><p class="sub">Сколько визитов дошли до каждого поля</p>' + bars(data.fields, (r) => esc(r.target), (r) => r.n, (r) => r.n + ' виз.')
      + '<p class="h3s">На чём спотыкались</p>' + bars(data.errors, (r) => esc(r.label), (r) => r.n) + '</div>'
      + '<div class="box"><h2>Квиз «Подобрать формат»</h2><p class="sub">Что отвечали и какой формат получали</p>'
      + (quizRes.length ? '<p class="h3s" style="margin-top:0">Рекомендованные форматы</p>' + bars(quizRes, (r) => esc(r.label), (r) => r.n) : '')
      + Object.keys(byQ).sort().map((k) => '<p class="h3s">Вопрос ' + esc(k) + '</p>' + bars(byQ[k], (r) => esc(r.label), (r) => r.n)).join('')
      + (!data.quiz.length ? '<p class="hint">Пока нет данных.</p>' : '') + '</div></div>'
      + '<div class="box" style="margin-top:14px"><h2>Бросили форму</h2><p class="sub">Тексты неотправленных форм не сохраняются — только названия полей, которые человек успел тронуть.</p>'
      + (data.abandons.length ? '<table class="t"><tr><th>Когда</th><th>Откуда</th><th>Что успели заполнить</th></tr>' + data.abandons.map((a) => '<tr><td>' + esc(when(a.ts)) + '</td><td>' + esc(place(a)) + '</td><td>' + esc(a.label || '—') + '</td></tr>').join('') + '</table>' : '<p class="hint">Таких нет.</p>') + '</div>';
  }

  /* ---------- «Техника» ---------- */
  function tech() {
    const names = { device: 'Устройство', browser: 'Браузер', os: 'Система', lang: 'Язык сайта' };
    const val = (k, x) => k === 'device' ? (DEV[x] || x) : k === 'lang' ? ({ ru: 'Русский', en: 'English' }[x] || x) : x;
    return '<div class="grid">' + ['device', 'browser', 'os', 'lang'].map((k) => '<div class="box"><h2>' + names[k] + '</h2>' + bars(data.tech[k], (r) => esc(val(k, r.k)), (r) => r.n) + '</div>').join('') + '</div>'
      + '<div style="height:14px"></div>' + vitalsBox()
      + '<div class="box"><h2>Страницы</h2><p class="sub">Сколько раз открывали каждую страницу сайта</p>' + bars(data.pages, (r) => esc(r.p || '/'), (r) => r.n, (r) => r.n + ' · ' + r.u + ' чел.') + '</div>';
  }

  /* ---------- отрисовка ---------- */
  function draw() {
    $('#range').innerHTML = RANGES.map(([d, l]) => '<button data-d="' + d + '" class="' + (d === days ? 'on' : '') + '">' + l + '</button>').join('');
    $('#tabs').innerHTML = TABS.map(([k, l]) => '<button class="tab' + (k === tab ? ' on' : '') + '" data-t="' + k + '">' + l + (k === 'leads' && data && data.leadsCount ? '<span class="badge">' + data.leadsCount + '</span>' : '') + '</button>').join('');
    if (!data) return;
    $('#app').innerHTML = ({ overview, sections, people, leads, forms, tech })[tab]();
    wireChart();
    const s = document.getElementById('psearch');
    if (s) s.addEventListener('input', () => { ui.people.q = s.value; const pos = s.selectionStart; draw(); const n = document.getElementById('psearch'); n.focus(); n.setSelectionRange(pos, pos); });
  }

  function wireChart() {
    const wrap = document.querySelector('.chartwrap'), tip = document.getElementById('tip');
    if (!wrap || !tip) return;
    wrap.querySelectorAll('.col').forEach((g) => {
      g.addEventListener('mousemove', (e) => {
        const x = data.daily[+g.dataset.i], r = wrap.getBoundingClientRect();
        tip.style.display = 'block'; tip.style.left = (e.clientX - r.left) + 'px'; tip.style.top = (e.clientY - r.top) + 'px';
        tip.innerHTML = '<b>' + fmtDate(x.d) + '</b><br>' + x.visitors + ' чел. · ' + x.views + ' просм.';
      });
      g.addEventListener('mouseleave', () => { tip.style.display = 'none'; });
    });
  }

  /* ---------- события ---------- */
  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-t]'); if (t) { tab = t.dataset.t; store.set('statsTab', tab); draw(); window.scrollTo(0, 0); return; }
    const d = e.target.closest('[data-d]'); if (d) { days = +d.dataset.d; store.set('statsDays', String(days)); load(); return; }
    const pf = e.target.closest('[data-pf]'); if (pf) { ui.people.f = pf.dataset.pf; draw(); return; }
    const lf = e.target.closest('[data-lf]'); if (lf) { ui.leads.f = lf.dataset.lf; draw(); return; }
    const top = e.target.closest('.person .top'); if (top) { togglePerson(top.dataset.vid); return; }
    if (e.target.closest('#csv')) { exportCsv(); return; }
    const cp = e.target.closest('[data-copy]');
    if (cp) { navigator.clipboard?.writeText(cp.dataset.copy); const o = cp.textContent; cp.textContent = 'Скопировано'; setTimeout(() => { cp.textContent = o; }, 1500); return; }
    const lv = e.target.closest('[data-lead-vid]');
    if (lv) {
      const box = document.getElementById('ld-' + lv.dataset.leadVid); if (!box) return;
      if (!box.hidden) { box.hidden = true; return; }
      box.hidden = false; box.innerHTML = '<p class="hint">Загрузка…</p>';
      api('vid=' + encodeURIComponent(lv.dataset.leadVid)).then((r) => { box.innerHTML = timeline({ events: r.events, subs: [] }); }).catch(() => { box.innerHTML = '<p class="hint">Не удалось загрузить путь.</p>'; });
    }
  });
  $('#refresh').addEventListener('click', () => load(true));
  const muted = () => store.get('notrack') === '1';
  const syncMute = () => { $('#mute').textContent = muted() ? 'Мои визиты не считаются ✓' : 'Не считать мои визиты'; };
  $('#mute').addEventListener('click', () => { if (muted()) store.del('notrack'); else store.set('notrack', '1'); syncMute(); });
  syncMute();
  draw();
  load();
  /* Свежие данные каждые 60 секунд, пока вкладка открыта. */
  setInterval(() => { if (document.visibilityState === 'visible') load(true); }, 60000);
}
