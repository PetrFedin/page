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
.leadq{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px 16px;align-items:start;margin:12px 0;padding:12px 14px;border:1px solid var(--line);border-radius:12px;background:var(--soft)}
.leadq-main{display:grid;gap:3px}.leadq-main>b{font-size:14px}.leadq-main>span{font-size:12px;color:var(--muted)}
.leadq-score{text-align:right;white-space:nowrap}.leadq-score strong{display:block;font-size:24px;line-height:1}.leadq-score small{font-size:10px;color:var(--muted)}
.leadq-break{grid-column:1/-1;display:flex;gap:6px;flex-wrap:wrap}.leadq-break span{font-size:11px;padding:3px 7px;border:1px solid var(--line);border-radius:999px;background:var(--panel)}
.leadq details{grid-column:1/-1}.leadq summary{cursor:pointer;font-size:12px;color:var(--muted)}.leadq ul{margin:8px 0 0;padding-left:18px}.leadq li{font-size:12px;color:var(--muted);margin:3px 0}
.leadq>p{grid-column:1/-1;margin:0;font-size:12px;color:var(--muted)}
@media(max-width:620px){.leadq{grid-template-columns:1fr}.leadq-score{text-align:left}.leadq-break,.leadq details,.leadq>p{grid-column:auto}}
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

a.btn{text-decoration:none;color:inherit;display:inline-block}
.cal-head{display:flex;flex-wrap:wrap;gap:8px 12px;align-items:center;margin-bottom:12px}
.cal-head h2{margin:0;font-size:18px;min-width:150px;}
.cal{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:1px;background:var(--line);border:1px solid var(--line);border-radius:14px;overflow:hidden}
.cal .dow{background:var(--bg);padding:6px 8px;font-size:12px;color:var(--muted);text-align:center}
.cal .day{background:var(--panel);min-height:96px;padding:6px 6px 8px;cursor:pointer;display:flex;flex-direction:column;gap:3px;min-width:0}
.cal .day:hover{background:color-mix(in srgb,var(--soft) 55%,var(--panel))}
.cal .day.out{background:color-mix(in srgb,var(--bg) 60%,var(--panel));color:var(--muted)}
.cal .day.today .num{background:var(--accent);color:#fff;border-radius:999px;padding:0 7px}
.cal .num{font-size:12.5px;align-self:flex-start}
.pc{font-size:11.5px;line-height:1.3;border-radius:6px;padding:2px 6px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;cursor:pointer;border:1px solid transparent}
.pc.draft{background:var(--line);color:var(--muted)}
.pc.scheduled{background:#dbe9f7;color:#1f5d99}
.pc.published{background:#dcefe3;color:#1f6b42}
.pc.failed{background:#f9dedb;color:#a3261e}
.pc.publishing{background:#fff3cf;color:#8a6100}
.pc.static{background:transparent;border-color:var(--line);color:var(--muted)}
@media (prefers-color-scheme:dark){.pc.scheduled{background:#1b2b3d;color:#8cbcf0}.pc.published{background:#18301f;color:#7fd29d}.pc.failed{background:#3a1b19;color:#f2a49e}.pc.publishing{background:#3a2f10;color:#e6c46a}}
.lgd{display:flex;flex-wrap:wrap;gap:6px 14px;font-size:12.5px;color:var(--muted);margin:10px 0 14px}
.lgd .pc{cursor:default}
.mbg{position:fixed;inset:0;background:rgba(10,10,12,.55);z-index:50;display:flex;align-items:flex-start;justify-content:center;overflow:auto;padding:24px 14px}
.sheet{background:var(--panel);border-radius:18px;max-width:760px;width:100%;padding:20px 22px;box-shadow:0 20px 60px rgba(0,0,0,.35)}
.sheet h2{margin:0 0 12px;font-size:18px}
.fld{display:grid;gap:5px;margin-bottom:12px}
.fld>span{font-size:13px;color:var(--muted)}
.chk input{width:auto;margin:0}
.fld input,.fld select,.fld textarea{border:1px solid var(--line);background:var(--bg);border-radius:10px;padding:8px 11px;width:100%;outline:none;font:inherit;color:inherit}
.fld textarea{min-height:150px;resize:vertical;line-height:1.5}
.fld .chk input{width:auto}
.fld input:focus,.fld select:focus,.fld textarea:focus{border-color:var(--accent)}
.frow{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px}
.chk{display:inline-flex;gap:7px;align-items:center;margin-right:16px;font-size:14px}
.acts{display:flex;flex-wrap:wrap;gap:8px;margin-top:14px;align-items:center}
.btn.pri{background:var(--ink);color:var(--bg);border-color:var(--ink)}
.btn.bad{color:var(--bad);border-color:var(--bad)}
.tools{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:6px}
.tools button{font-size:12px;padding:3px 9px;border-radius:8px;border:1px solid var(--line);background:var(--bg);cursor:pointer}
.note{padding:11px 14px;border-radius:12px;background:var(--soft);font-size:14px;margin-bottom:12px}
.note.warn{background:#fff3cf;color:#6e4d00}
@media (prefers-color-scheme:dark){.note.warn{background:#3a2f10;color:#e6c46a}}
.ok{color:var(--ok)}.no{color:var(--bad)}
.score{display:inline-block;min-width:44px;text-align:center;border-radius:999px;padding:1px 9px;font-weight:600;font-size:13px}
.score.g{background:#dcefe3;color:#1f6b42}.score.y{background:#fff3cf;color:#8a6100}.score.r{background:#f9dedb;color:#a3261e}
.stp{border:1px solid var(--line);border-radius:14px;margin-bottom:10px;background:var(--panel)}
.stp summary{list-style:none;cursor:pointer;display:flex;gap:10px;align-items:center;padding:12px 14px}
.stp summary::-webkit-details-marker{display:none}
.stp .body{padding:0 16px 14px 44px;font-size:14.5px}
.stp .body ol{margin:6px 0;padding-left:18px}.stp .body li{margin:4px 0}
.stp input[type=checkbox]{width:18px;height:18px;accent-color:var(--accent)}
@media(max-width:640px){.cal .day{min-height:64px;padding:4px}.pc{font-size:10.5px;padding:1px 4px}.cal-head h2{min-width:0}}
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
  const TABS = [['overview', 'Обзор'], ['sections', 'Что смотрят'], ['people', 'Люди'], ['leads', 'Заявки'], ['forms', 'Форма и квиз'], ['calendar', 'Календарь'], ['editorial', 'Редакция'], ['seo', 'Поиск и ИИ'], ['tech', 'Техника']];
  const RANGES = [[1, 'Сегодня'], [7, '7 дней'], [30, '30 дней'], [90, '90 дней'], [365, 'Год']];
  const KIND = { messenger: 'Мессенджер', outbound: 'Внешняя ссылка', phone: 'Телефон', email: 'Почта', link: 'Переход по сайту' };
  const DEV = { phone: 'Телефон', desktop: 'Компьютер', tablet: 'Планшет' };
  let regionNames = null;
  try { regionNames = new Intl.DisplayNames(['ru'], { type: 'region' }); } catch { /* старый браузер */ }

  let tab = 'overview', days = 30, data = null;
  const ui = { people: { q: '', f: 'all' }, leads: { f: 'all', p: 'all' }, open: {}, cache: {} };

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
    ['ИИ-ассистенты', (h) => /(chatgpt|openai|perplexity|claude\.ai|anthropic|gemini\.google|copilot\.microsoft|you\.com|phind|kagi|brave)/.test(h), '#7a5bd0'],
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
  async function api(qs, path = '/api/stats', init) {
    const r = await fetch(path + (qs ? '?' + qs : ''), { credentials: 'same-origin', cache: 'no-store', ...init });
    if (!r.ok) throw new Error(String(r.status));
    return r.json();
  }
  const post = (path, body) => api('', path, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
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
    const f = ui.leads.f, p = ui.leads.p;
    const list = all
      .filter((s) => f === 'all' || s.topic === f)
      .filter((s) => p === 'all' || s.qualification?.priority === p)
      .sort((a,b) => (b.qualification?.score || 0) - (a.qualification?.score || 0) || b.ts - a.ts);
    const chip = (k, l) => '<button class="chip' + (f === k ? ' on' : '') + '" data-lf="' + esc(k) + '">' + esc(l) + '</button>';
    const pchip = (k, l) => '<button class="chip' + (p === k ? ' on' : '') + '" data-lp="' + esc(k) + '">' + esc(l) + '</button>';
    const tg = (v) => 'https://t.me/' + encodeURIComponent(String(v).replace(/^@/, '').replace(/^https?:\/\/t\.me\//, ''));
    const counts = Object.fromEntries(['A','B','C','D'].map((k) => [k, all.filter((s) => s.qualification?.priority === k).length]));
    return '<div class="box"><h2>Прозрачная квалификация</h2><p class="sub">Это оценка готовности запроса к следующему действию, а не оценка человека. Формула видна в каждой заявке: тип запроса + конкретный проект + полнота ответов + заявленный срок + конкретность следующего шага.</p>'
      + '<div class="legend"><span><b>A</b> — ответить первым / назначить действие</span><span><b>B</b> — квалифицировано, уточнить детали</span><span><b>C</b> — нужно уточнение</span><span><b>D</b> — ранний интерес / материалы</span></div></div>'
      + '<div class="toolbar">' + chip('all', 'Все темы (' + all.length + ')') + topics.map((t) => chip(t, t)).join('')
      + '<span style="width:100%"></span>' + pchip('all','Все приоритеты') + pchip('A','A · ' + counts.A) + pchip('B','B · ' + counts.B) + pchip('C','C · ' + counts.C) + pchip('D','D · ' + counts.D)
      + '<div class="grow"></div><button class="btn" id="csv">Скачать таблицу (CSV)</button></div>'
      + (list.length ? list.map((s) => {
        let ent = null; try { ent = s.entity ? JSON.parse(s.entity) : null; } catch {}
        const q = s.qualification || {};
        const stageLabel = { ready:'Готов к действию', qualified:'Квалифицирован', clarify:'Нужно уточнение', early:'Ранний интерес', unclassified:'Не классифицировано' }[q.stage] || 'Не классифицировано';
        const priorityClass = q.priority === 'A' ? 'ok' : q.priority === 'D' ? 'bad' : '';
        const scoreLabel = q.score == null ? '—' : q.score + '/100';
        const routeLabel = { pilot:'Пилот', partnership:'Партнёрство', investment:'Инвестиции', diligence:'NDA / проверка' }[q.route] || '—';
        const breakdown = q.breakdown || {};
        return '<div class="card"><div class="head"><h3>' + esc(s.name) + '</h3><span class="when">' + esc(when(s.ts)) + '</span><span class="tag">' + esc(s.topic) + '</span>'
          + '<span class="tag ' + priorityClass + '">Приоритет ' + esc(q.priority || '—') + '</span><span class="when">Готовность ' + esc(scoreLabel) + '</span>'
          + (s.ok ? '' : '<span class="tag bad">в Telegram не ушла</span>') + (s.country ? '<span class="when">' + esc(place(s)) + '</span>' : '') + '</div>'
          + '<div class="contacts">' + (s.email ? '<a href="mailto:' + esc(s.email) + '">' + esc(s.email) + '</a>' : '') + (s.telegram ? '<a href="' + tg(s.telegram) + '" target="_blank" rel="noopener">Telegram: ' + esc(s.telegram) + '</a>' : '') + (s.phone ? '<a href="tel:' + esc(s.phone.replace(/[^\d+]/g, '')) + '">' + esc(s.phone) + '</a>' : '') + '</div>'
          + (ent ? '<div class="when">Юрлицо: ' + esc([ent.name, ent.inn && 'ИНН ' + ent.inn, ent.address, ent.site].filter(Boolean).join(' · ')) + '</div>' : '')
          + '<div class="leadq"><div class="leadq-main"><b>' + esc(q.action || 'Уточнить тип запроса') + '</b><span>' + esc(stageLabel) + ' · ' + esc(routeLabel) + (q.project ? ' · ' + esc(q.project) : '') + (q.timing ? ' · ' + esc(q.timing) : '') + '</span></div>'
          + (q.score == null ? '<p>Новая квалификационная форма для этой заявки не применялась.</p>' : '<div class="leadq-score"><strong>' + esc(scoreLabel) + '</strong><small>готовность запроса</small></div>')
          + (q.score == null ? '' : '<div class="leadq-break"><span>Тип +' + num(breakdown.intent) + '</span><span>Проект +' + num(breakdown.project) + '</span><span>Ответы +' + num(breakdown.completeness) + '</span><span>Срок +' + num(breakdown.timing) + '</span><span>Следующий шаг +' + num(breakdown.nextStep) + '</span></div>')
          + (q.reasons?.length ? '<details><summary>Почему такой приоритет</summary><ul>' + q.reasons.map((r) => '<li>' + esc(r) + '</li>').join('') + '</ul></details>' : '') + '</div>'
          + '<div class="msg">' + esc(s.message) + '</div>' + (s.file_name ? '<div class="when">Файл: ' + esc(s.file_name) + '</div>' : '')
          + '<div class="act"><button class="btn" data-copy="' + esc([s.name, s.email, s.telegram, s.phone].filter(Boolean).join(', ')) + '">Скопировать контакты</button><button class="btn" data-lead-vid="' + esc(s.vid) + '">Путь по сайту</button></div><div class="detail" id="ld-' + esc(s.vid) + '" hidden style="margin-top:8px;border-radius:12px;border:1px solid var(--line)"></div></div>';
      }).join('') : '<div class="empty"><b>Заявок пока нет</b>Когда кто-то заполнит форму, она появится здесь с текстом и путём по сайту.</div>');
  }

  function exportCsv() {
    const head = ['Дата', 'Имя', 'Email', 'Telegram', 'Телефон', 'Тема', 'Маршрут', 'Проект', 'Срок', 'Приоритет', 'Готовность', 'Стадия', 'Следующее действие', 'Юрлицо', 'Сообщение', 'Страна', 'Город'];
    const q = (v) => '"' + String(v ?? '').replace(/"/g, '""') + '"';
    const rows = data.submissions.map((s) => {
      let ent = ''; try { const e = s.entity ? JSON.parse(s.entity) : null; ent = e ? [e.name, e.inn, e.address, e.site].filter(Boolean).join('; ') : ''; } catch { /* не json */ }
      const l = s.lead || {}, z = s.qualification || {};
      return [new Date(s.ts).toLocaleString('ru-RU'), s.name, s.email, s.telegram, s.phone, s.topic, l.route, l.project, l.timing, z.priority, z.score, z.stage, z.action, ent, s.message, s.country, s.city].map(q).join(';');
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


  /* ---------- «Календарь» публикаций ---------- */
  const STATUS = { draft: 'Черновик', scheduled: 'Запланирован', publishing: 'Публикуется', published: 'Опубликован', failed: 'Не вышел' };
  const TAGS = [['analysis', 'Разбор'], ['market', 'Рынок'], ['product', 'Продукт'], ['syntha', 'Syntha'], ['chatx', 'ChatX'], ['renova', 'Renova'], ['mfw', 'MFW+BFS'], ['promomed', 'Promomed'], ['mission', 'Позиция'], ['investors', 'Инвесторам'], ['press', 'Пресса']];
  const cal = { y: new Date().getFullYear(), m: new Date().getMonth(), posts: null, statics: [], coverage: [], policy: null, plan: null, channelReady: true, cronKey: false, edit: null, busy: false };
  const pad = (n) => String(n).padStart(2, '0');
  const ymd = (d) => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  const localInput = (ms) => { const d = new Date(ms); return ymd(d) + 'T' + pad(d.getHours()) + ':' + pad(d.getMinutes()); };

  async function loadCal() {
    try {
      const r = await api('all=1', '/api/posts');
      cal.posts = r.posts || []; cal.coverage = r.editorialCoverage || []; cal.policy = r.editorialPolicy || null; cal.plan = r.editorialPlan || null; cal.channelReady = r.channelReady; cal.cronKey = r.cronKey;
    } catch (e) { cal.posts = []; cal.error = e.message; }
    if (!cal.statics.length) {
      try { const m = await import('/assets/news.js'); cal.statics = m.NEWS.map((p) => ({ date: p.date, title: p.ru.title, tag: p.tag })); } catch { /* не критично */ }
    }
    if (tab === 'calendar') draw();
  }

  function calendar() {
    if (!cal.posts) { loadCal(); return '<p class="empty">Загрузка календаря…</p>'; }
    const first = new Date(cal.y, cal.m, 1);
    const lead = (first.getDay() + 6) % 7;
    const start = new Date(cal.y, cal.m, 1 - lead);
    const todayKey = ymd(new Date());
    const byDay = {};
    cal.posts.forEach((p) => { const k = ymd(new Date(p.publish_at)); (byDay[k] = byDay[k] || []).push({ kind: 'dyn', p }); });
    cal.statics.forEach((p) => { (byDay[p.date] = byDay[p.date] || []).push({ kind: 'static', p }); });
    let cells = '';
    for (let i = 0; i < 42; i++) {
      const d = new Date(start); d.setDate(start.getDate() + i);
      const k = ymd(d);
      const items = (byDay[k] || []).map((x) => x.kind === 'dyn'
        ? '<div class="pc ' + x.p.status + '" data-edit="' + x.p.id + '" title="' + esc(x.p.ru_title) + '">' + fmtTime(x.p.publish_at) + ' ' + esc(x.p.ru_title || 'Без названия') + '</div>'
        : '<div class="pc static" title="Уже на сайте: ' + esc(x.p.title) + '">' + esc(x.p.title) + '</div>').join('');
      cells += '<div class="day' + (d.getMonth() !== cal.m ? ' out' : '') + (k === todayKey ? ' today' : '') + '" data-newday="' + k + '"><span class="num">' + d.getDate() + '</span>' + items + '</div>';
    }
    const mn = first.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' }).replace(' г.', '');
    const monthName = mn.charAt(0).toUpperCase() + mn.slice(1);
    const upcoming = cal.posts.filter((p) => p.status === 'scheduled').sort((a, b) => a.publish_at - b.publish_at);
    const coverageByDay = Object.fromEntries((cal.coverage || []).map((x) => [x.date, x]));
    const todayCoverage = coverageByDay[todayKey] || { project: 0, analysis: 0, synced: 0, total: 0, complete: false, missing: ['project','analysis','site+telegram'] };
    const sla = '<div class="box"><h2>Редакционный минимум на день</h2><p class="sub">Не меньше двух материалов: один о проекте и один подробный разбор статьи из российской или мировой прессы. Оба должны выйти на сайте и в @syntha_pro.</p>'
      + '<div class="lgd"><span class="pc ' + (todayCoverage.project ? 'published' : 'failed') + '">Проект ' + (todayCoverage.project ? '✓' : '—') + '</span>'
      + '<span class="pc ' + (todayCoverage.analysis ? 'published' : 'failed') + '">Аналитика ' + (todayCoverage.analysis ? '✓' : '—') + '</span>'
      + '<span class="pc ' + (todayCoverage.synced >= 2 ? 'published' : 'failed') + '">Сайт + Telegram ' + (todayCoverage.synced >= 2 ? '✓' : '—') + '</span></div>'
      + '<p class="hint">' + (todayCoverage.complete ? 'Минимум на сегодня закрыт.' : 'Сегодня минимум ещё не закрыт. Отсутствует: ' + esc((todayCoverage.missing || []).map((x) => ({project:'публикация о проекте',analysis:'разбор внешней статьи','site+telegram':'две синхронные публикации сайт + Telegram'}[x] || x)).join(', ')) + '.') + '</p></div>';
    const plan = cal.plan;
    const planning = !plan ? '' : '<div class="box"><h2>Редакционный планировщик</h2>'
      + '<p class="sub">Следующий проект по ротации: <b>' + esc(plan.suggestedProject || '—') + '</b>. Основание — только история публикаций: когда проект выходил последний раз и сколько материалов уже было.</p>'
      + ((plan.projectRotation || []).length ? '<div class="lgd">' + plan.projectRotation.map((x) => '<span class="pc static">' + esc(x.tag) + ' · ' + x.count + (x.last ? ' · ' + esc(x.last) : ' · ещё не публиковался') + '</span>').join('') + '</div>' : '')
      + ((plan.sourceFrequency || []).length ? '<p class="hint">Частота источников: ' + plan.sourceFrequency.slice(0, 6).map((x) => esc(x.outlet) + ' (' + x.count + ')').join(', ') + '. Частота нужна для диверсификации, а не для оценки качества издания.</p>' : '')
      + '</div>';
    const warn = [];
    if (!cal.channelReady) warn.push('Telegram-канал ещё не подключён: посты с галочкой «Telegram» не уйдут, пока не заданы секреты CHANNEL_BOT_TOKEN и TELEGRAM_CHANNEL.');
    if (!cal.cronKey) warn.push('Автоматический таймер ещё не включён: запланированные посты выйдут при ближайшем визите на сайт или когда вы откроете этот календарь. Чтобы они выходили точно по времени, подключите таймер.');
    return (warn.length ? '<div class="note warn">' + warn.map(esc).join('<br>') + '</div>' : '')
      + sla
      + planning
      + '<div class="cal-head"><button class="btn" data-calnav="-1">←</button><h2>' + esc(monthName) + '</h2><button class="btn" data-calnav="1">→</button><button class="btn" data-calnav="0">Сегодня</button><div class="grow"></div><button class="btn pri" data-newday="' + todayKey + '">+ Новая публикация</button></div>'
      + '<div class="cal">' + ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((d) => '<div class="dow">' + d + '</div>').join('') + cells + '</div>'
      + '<div class="lgd"><span class="pc draft">Черновик</span><span class="pc scheduled">Запланирован</span><span class="pc published">Опубликован</span><span class="pc failed">Не вышел</span><span class="pc static">Уже на сайте</span></div>'
      + '<div class="box"><h2>Ближайшие публикации</h2><p class="sub">Выходят автоматически в назначенное время: в ленту сайта и/или в Telegram-канал</p>'
      + (upcoming.length ? upcoming.map((p) => '<div class="row" style="cursor:pointer" data-edit="' + p.id + '"><span class="n"><b>' + esc(p.ru_title) + '</b> · ' + (p.site ? 'сайт ' : '') + (p.tg ? 'Telegram' : '') + '</span><span class="c">' + esc(when(p.publish_at)) + '</span></div>').join('') : '<p class="hint">Ничего не запланировано. Нажмите на день в календаре, чтобы добавить пост.</p>') + '</div>'
      + (cal.edit ? editorHtml() : '');
  }

  function editorHtml() {
    const p = cal.edit, pub = p.status === 'published';
    const v = (k) => esc(p[k] ?? '');
    const tags = (k) => { try { return esc(JSON.parse(p[k] || '[]').join(', ')); } catch { return ''; } };
    const src = (() => { try { return p.source ? JSON.parse(p.source) : {}; } catch { return {}; } })();
    const labels = ['О чём материал:', 'Разбор:', 'Мнение аналитика:', 'Выводы:', 'Что изменилось:', 'Что это даёт:'];
    return '<div class="mbg" id="mbg"><form class="sheet" id="edform"><h2>' + (p.id ? 'Публикация' : 'Новая публикация') + (p.id ? ' <span class="pc ' + p.status + '" style="display:inline-block;vertical-align:2px">' + STATUS[p.status] + '</span>' : '') + '</h2>'
      + (p.error ? '<div class="note warn">Не вышло: ' + esc(p.error) + '. Исправьте и нажмите «Опубликовать сейчас».</div>' : '')
      + (pub ? '<div class="note">Пост уже опубликован' + (p.post_date ? ': <a href="/#post-' + esc(p.post_date) + '" target="_blank">открыть на сайте</a>' : '') + '. Изменить его нельзя, можно только удалить с сайта (в Telegram он останется).</div>' : '')
      + '<div class="frow"><label class="fld"><span>Дата и время выхода (ваше время)</span><input type="datetime-local" name="when" value="' + localInput(p.publish_at) + '"' + (pub ? ' disabled' : '') + '></label>'
      + '<label class="fld"><span>Рубрика</span><select name="tag"' + (pub ? ' disabled' : '') + '>' + TAGS.map(([k, l]) => '<option value="' + k + '"' + (p.tag === k ? ' selected' : '') + '>' + l + '</option>').join('') + '</select></label></div>'
      + '<div class="fld"><span>Куда публикуем</span><div><label class="chk"><input type="checkbox" name="site"' + (p.site ? ' checked' : '') + '> Лента на сайте syntha.pro</label><label class="chk"><input type="checkbox" name="tg"' + (p.tg ? ' checked' : '') + '> Telegram-канал @syntha_pro</label></div></div>'
      + '<label class="fld"><span>Заголовок (русский)</span><input name="ru_title" value="' + v('ru_title') + '" maxlength="300"' + (pub ? ' disabled' : '') + '></label>'
      + '<div class="fld"><span>Текст (русский)</span><div class="tools">' + labels.map((l) => '<button type="button" data-ins="' + esc(l) + '">' + esc(l.replace(':', '')) + '</button>').join('') + '<button type="button" data-ins="• ">• пункт</button></div><textarea name="ru_body"' + (pub ? ' disabled' : '') + '>' + v('ru_body') + '</textarea></div>'
      + '<label class="fld"><span>Теги через запятую (без #)</span><input name="ru_tags" value="' + tags('ru_tags') + '"' + (pub ? ' disabled' : '') + '></label>'
      + '<details' + (p.en_title ? ' open' : '') + '><summary style="cursor:pointer;margin-bottom:10px">Английская версия (без неё пост не покажется в английской ленте)</summary>'
      + '<label class="fld"><span>Title (English)</span><input name="en_title" value="' + v('en_title') + '"' + (pub ? ' disabled' : '') + '></label>'
      + '<label class="fld"><span>Text (English)</span><textarea name="en_body"' + (pub ? ' disabled' : '') + '>' + v('en_body') + '</textarea></label>'
      + '<label class="fld"><span>Tags</span><input name="en_tags" value="' + tags('en_tags') + '"' + (pub ? ' disabled' : '') + '></label></details>'
      + '<details' + (src.outlet ? ' open' : '') + '><summary style="cursor:pointer;margin-bottom:10px">Источник (для разборов чужих материалов)</summary><div class="frow">'
      + '<label class="fld"><span>Издание</span><input name="s_outlet" value="' + esc(src.outlet || '') + '"></label><label class="fld"><span>Оригинальное название</span><input name="s_original" value="' + esc(src.original || '') + '"></label></div>'
      + '<label class="fld"><span>Ссылка на исходный материал</span><input type="url" name="s_url" value="' + esc(src.url || '') + '" placeholder="https://…"></label></details>'
      + '<div class="acts">' + (pub ? '' : '<button class="btn" type="button" data-save="draft">Сохранить черновик</button><button class="btn pri" type="button" data-save="schedule">Запланировать</button><button class="btn" type="button" data-save="now">Опубликовать сейчас</button>')
      + (p.id ? '<button class="btn bad" type="button" data-save="delete">Удалить</button>' : '') + '<div class="grow"></div><button class="btn" type="button" data-save="close">Закрыть</button></div></form></div>';
  }

  function newPost(dateKey) {
    const [y, m, d] = dateKey.split('-').map(Number);
    const at = new Date(y, m - 1, d, 10, 0).getTime();
    cal.edit = { id: 0, publish_at: Math.max(at, Date.now() + 60000), status: 'draft', site: 1, tg: cal.channelReady ? 1 : 0, tag: 'analysis', ru_title: '', ru_body: '', ru_tags: '[]', en_title: '', en_body: '', en_tags: '[]', source: '' };
    draw();
  }

  async function savePost(action) {
    const f = document.getElementById('edform');
    if (!f || cal.busy) return;
    if (action === 'close') { cal.edit = null; draw(); return; }
    if (action === 'delete') {
      if (!confirm('Удалить публикацию? Из Telegram она не пропадёт.')) return;
      cal.busy = true; await post('/api/posts', { action: 'delete', id: cal.edit.id }); cal.busy = false; cal.edit = null; cal.posts = null; draw(); return;
    }
    const fd = new FormData(f);
    const body = {
      action, id: cal.edit.id, publish_at: new Date(fd.get('when')).getTime() || Date.now(), tag: fd.get('tag'),
      site: fd.get('site') === 'on', tg: fd.get('tg') === 'on',
      ru_title: fd.get('ru_title'), ru_body: fd.get('ru_body'), ru_tags: fd.get('ru_tags'),
      en_title: fd.get('en_title'), en_body: fd.get('en_body'), en_tags: fd.get('en_tags'),
      source: { outlet: fd.get('s_outlet'), original: fd.get('s_original'), url: fd.get('s_url') }
    };
    if ((action === 'schedule' || action === 'now') && (!String(body.ru_title).trim() || !String(body.ru_body).trim())) { alert('Заполните русский заголовок и текст.'); return; }
    if (!body.site && !body.tg && action !== 'draft') { alert('Выберите, куда публиковать: сайт, Telegram или оба.'); return; }
    if (action === 'now' && !confirm('Опубликовать прямо сейчас?')) return;
    cal.busy = true;
    try { await post('/api/posts', body); cal.edit = null; cal.posts = null; } catch (e) { alert('Не удалось сохранить: ' + e.message); }
    cal.busy = false; draw();
  }

  /* ---------- «Поиск и ИИ» ---------- */
  const seoState = { data: null, loading: false };
  async function loadSeo() {
    if (seoState.loading) return; seoState.loading = true;
    try { seoState.data = await api('', '/api/seo'); } catch (e) { seoState.error = e.message; }
    seoState.loading = false; if (tab === 'seo') draw();
  }
  const scoreCls = (n) => n >= 85 ? 'g' : n >= 60 ? 'y' : 'r';

  function seo() {
    const d = seoState.data;
    if (!d) { if (!seoState.loading) loadSeo(); return seoState.error ? '<div class="err">Не удалось проверить сайт (' + esc(seoState.error) + ')</div>' : '<p class="empty">Проверяю страницы сайта, это занимает несколько секунд…</p>'; }
    const avg = Math.round(d.pages.reduce((a, p) => a + p.score, 0) / Math.max(d.pages.length, 1));
    const siteOk = d.site.filter((c) => c.ok).length;
    const q = 'site%3Asyntha.pro';
    const bad = [];
    d.site.filter((c) => !c.ok).forEach((c) => bad.push('Сайт: ' + c.name));
    d.pages.forEach((p) => p.checks.filter((c) => !c.ok).forEach((c) => bad.push(p.path + ' — ' + c.name + (c.note ? ' (' + c.note + ')' : ''))));
    const groups = {}; d.steps.forEach((s) => { (groups[s.group] = groups[s.group] || []).push(s); });
    const doneN = d.steps.filter((s) => s.auto || d.done[s.id]).length;
    const crawlRows = d.crawls.length ? '<table class="t"><tr><th>Робот</th><th>Тип</th><th>Заходов за 90 дней</th><th>Последний раз</th></tr>' + d.crawls.map((c) => '<tr><td>' + esc(c.bot) + '</td><td>' + ({ search: 'Поисковик', ai: 'ИИ', social: 'Превью ссылок' }[c.kind] || c.kind) + '</td><td>' + c.n + '</td><td>' + esc(when(c.last)) + '</td></tr>').join('') + '</table>' : '<p class="hint">Роботы пока не заходили. Это нормально для нового сайта: после подтверждения в Search Console и Яндекс Вебмастере они начнут появляться здесь.</p>';
    return '<div class="kpis">'
      + '<div class="kpi"><div class="l">Готовность страниц</div><div class="v">' + avg + '%</div><span class="d">среднее по ' + d.pages.length + ' страницам</span></div>'
      + '<div class="kpi"><div class="l">Проверки сайта</div><div class="v">' + siteOk + ' из ' + d.site.length + '</div><span class="d">robots, sitemap, ИИ-файлы</span></div>'
      + '<div class="kpi"><div class="l">Шаги из списка</div><div class="v">' + doneN + ' из ' + d.steps.length + '</div><span class="d">что вы уже сделали</span></div>'
      + '<div class="kpi"><div class="l">Заходы роботов</div><div class="v">' + num(d.crawls.reduce((a, c) => a + c.n, 0)) + '</div><span class="d">за 90 дней</span></div></div>'
      + '<div class="box"><h2>Есть ли сайт в поиске</h2><p class="sub">Нажмите — откроется выдача по запросу site:syntha.pro. Если результатов нет, сайт ещё не проиндексирован.</p><div class="acts" style="margin:0">'
      + '<a class="btn" target="_blank" rel="noopener" href="https://www.google.com/search?q=' + q + '">Google</a><a class="btn" target="_blank" rel="noopener" href="https://yandex.ru/search/?text=' + q + '">Яндекс</a><a class="btn" target="_blank" rel="noopener" href="https://www.bing.com/search?q=' + q + '">Bing</a><a class="btn" target="_blank" rel="noopener" href="https://search.brave.com/search?q=' + q + '">Brave</a>'
      + '<a class="btn" target="_blank" rel="noopener" href="https://www.google.com/search?q=%22%D0%9F%D0%B5%D1%82%D1%80+%D0%A4%D0%B5%D0%B4%D0%B8%D0%BD%22+%D1%84%D1%8D%D1%88%D0%BD">Google: «Пётр Федин фэшн»</a></div></div>'
      + '<div class="box" style="margin-top:14px"><h2>Что нужно исправить</h2><p class="sub">Собрано автоматически из проверок ниже</p>'
      + (bad.length ? '<ul class="insights">' + bad.slice(0, 12).map((x) => '<li>' + esc(x) + '</li>').join('') + '</ul>' + (bad.length > 12 ? '<p class="hint">…и ещё ' + (bad.length - 12) + '</p>' : '') : '<p class="ok">Замечаний нет: всё, что можно проверить автоматически, в порядке.</p>') + '</div>'
      + '<div class="box"><h2>Что делать, чтобы вас находили</h2><p class="sub">Пошагово. Отмечайте сделанное — галочки сохраняются.</p>'
      + Object.entries(groups).map(([g, list]) => '<p class="h3s">' + esc(g) + '</p>' + list.map((s) => '<details class="stp"><summary><input type="checkbox" data-step="' + s.id + '"' + (s.auto || d.done[s.id] ? ' checked' : '') + (s.auto ? ' disabled' : '') + '><b>' + esc(s.title) + '</b></summary><div class="body"><ol>' + s.how.map((h) => '<li>' + esc(h) + '</li>').join('') + '</ol>' + (s.url ? '<a class="btn" target="_blank" rel="noopener" href="' + esc(s.url) + '">Открыть</a>' : '') + '</div></details>').join('')).join('') + '</div>'
      + '<div class="grid"><div class="box"><h2>Проверки сайта</h2>' + d.site.map((c) => '<div class="row"><span class="n">' + (c.ok ? '<span class="ok">✓</span>' : '<span class="no">✗</span>') + ' ' + esc(c.name) + '</span><span class="c">' + esc(c.note || '') + '</span></div>').join('') + '</div>'
      + '<div class="box"><h2>Кто читал сайт: роботы</h2><p class="sub">Поисковики, ИИ-ассистенты и мессенджеры, которые открывали страницы</p>' + crawlRows + '</div></div>'
      + '<div class="box" style="margin-top:14px"><h2>Страницы</h2><p class="sub">Проверка так, как страницу видит робот — без выполнения скриптов</p><table class="t"><tr><th>Страница</th><th>Язык</th><th>Слов</th><th>Готовность</th><th>Не хватает</th></tr>'
      + d.pages.map((p) => '<tr><td>' + esc(p.path) + '</td><td>' + p.lang.toUpperCase() + '</td><td>' + p.words + '</td><td><span class="score ' + scoreCls(p.score) + '">' + p.score + '%</span></td><td>' + (p.checks.filter((c) => !c.ok).map((c) => esc(c.name)).join('; ') || '—') + '</td></tr>').join('') + '</table>'
      + '<p class="hint">Проверено ' + esc(when(d.generated)) + '. <button class="btn" id="seo-again">Проверить заново</button></p></div>';
  }

  /* ---------- «Техника» ---------- */
  function tech() {
    const names = { device: 'Устройство', browser: 'Браузер', os: 'Система', lang: 'Язык сайта' };
    const val = (k, x) => k === 'device' ? (DEV[x] || x) : k === 'lang' ? ({ ru: 'Русский', en: 'English' }[x] || x) : x;
    return '<div class="grid">' + ['device', 'browser', 'os', 'lang'].map((k) => '<div class="box"><h2>' + names[k] + '</h2>' + bars(data.tech[k], (r) => esc(val(k, r.k)), (r) => r.n) + '</div>').join('') + '</div>'
      + '<div style="height:14px"></div>' + vitalsBox()
      + '<div class="box"><h2>Страницы</h2><p class="sub">Сколько раз открывали каждую страницу сайта</p>' + bars(data.pages, (r) => esc(r.p || '/'), (r) => r.n, (r) => r.n + ' · ' + r.u + ' чел.') + '</div>';
  }

  /* ---------- Editorial Intelligence ---------- */
  function editorial() {
    const rows = data.editorial || [];
    const topics = data.editorialTopics || [];
    const sources = data.editorialSources || [];
    const pct = (a,b) => b ? Math.round(a / b * 100) + '%' : '—';

    const materials = rows.length
      ? '<table class="t"><tr><th>Материал</th><th>Читатели</th><th>В проект</th><th>Форма</th><th>Обращения</th><th>Переход</th></tr>'
        + rows.map((r) => '<tr><td><b>' + esc(r.title || r.post_date || 'Публикация') + '</b><br><span class="sub">' + esc([r.post_date,r.tag,r.source].filter(Boolean).join(' · ')) + '</span></td><td>' + num(r.readers) + '</td><td>' + num(r.to_project) + '</td><td>' + num(r.form_starts) + '</td><td>' + num(r.leads) + '</td><td>' + pct(r.to_project,r.readers) + '</td></tr>').join('')
        + '</table>'
      : '<p class="hint">Данные появятся после открытия публикаций посетителями.</p>';

    const topicRows = topics.length
      ? '<table class="t"><tr><th>Рубрика</th><th>Читатели</th><th>В проект</th><th>Обращения</th></tr>'
        + topics.map((r) => '<tr><td>' + esc(r.tag || '—') + '</td><td>' + num(r.readers) + '</td><td>' + num(r.to_project) + '</td><td>' + num(r.leads) + '</td></tr>').join('')
        + '</table>'
      : '<p class="hint">Пока нет данных по рубрикам.</p>';

    const sourceRows = sources.length
      ? '<table class="t"><tr><th>Источник</th><th>Читатели</th><th>В проект</th><th>Обращения</th></tr>'
        + sources.map((r) => '<tr><td>' + esc(r.source || '—') + '</td><td>' + num(r.readers) + '</td><td>' + num(r.to_project) + '</td><td>' + num(r.leads) + '</td></tr>').join('')
        + '</table>'
      : '<p class="hint">Пока нет данных по внешним источникам.</p>';

    return '<div class="note">Показывается наблюдаемая последовательность действий в одной сессии: открытие материала, затем переход в проект, начало формы или обращение. Это атрибуция, а не доказательство причинного эффекта.</div>'
      + '<div class="box"><h2>Материалы</h2><p class="sub">Что читают и какие действия происходят после чтения</p>' + materials + '</div>'
      + '<div class="grid"><div class="box"><h2>Темы</h2><p class="sub">Фактическое вовлечение по рубрикам</p>' + topicRows + '</div>'
      + '<div class="box"><h2>Источники</h2><p class="sub">Сравнение по наблюдаемому интересу аудитории</p>' + sourceRows + '</div></div>';
  }

  /* ---------- отрисовка ---------- */
  function draw() {
    $('#range').innerHTML = RANGES.map(([d, l]) => '<button data-d="' + d + '" class="' + (d === days ? 'on' : '') + '">' + l + '</button>').join('');
    $('#tabs').innerHTML = TABS.map(([k, l]) => '<button class="tab' + (k === tab ? ' on' : '') + '" data-t="' + k + '">' + l + (k === 'leads' && data && data.leadsCount ? '<span class="badge">' + data.leadsCount + '</span>' : '') + '</button>').join('');
    if (!data) return;
    $('#app').innerHTML = ({ overview, sections, people, leads, forms, calendar, editorial, seo, tech })[tab]();
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
    const ed = e.target.closest('[data-edit]');
    if (ed && cal.posts) { cal.edit = { ...cal.posts.find((p) => p.id === +ed.dataset.edit) }; draw(); return; }
    const nd = e.target.closest('[data-newday]'); if (nd && tab === 'calendar') { newPost(nd.dataset.newday); return; }
    const cn = e.target.closest('[data-calnav]');
    if (cn) { const k = +cn.dataset.calnav; if (k === 0) { cal.y = new Date().getFullYear(); cal.m = new Date().getMonth(); } else { cal.m += k; if (cal.m < 0) { cal.m = 11; cal.y--; } if (cal.m > 11) { cal.m = 0; cal.y++; } } draw(); return; }
    const sv = e.target.closest('[data-save]'); if (sv) { savePost(sv.dataset.save); return; }
    if (e.target.id === 'mbg') { cal.edit = null; draw(); return; }
    const ins = e.target.closest('[data-ins]');
    if (ins) { const ta = document.querySelector('textarea[name=ru_body]'); if (ta) { const t = ins.dataset.ins, pos = ta.selectionStart; const pre = ta.value.slice(0, pos), post2 = ta.value.slice(pos); const sep = t.startsWith('•') ? (pre.endsWith('\n') || !pre ? '' : '\n') : (pre.trim() ? (pre.endsWith('\n\n') ? '' : '\n\n') : ''); ta.value = pre + sep + t + (t.startsWith('•') ? '' : ' ') + post2; ta.focus(); } return; }
    const stp = e.target.closest('[data-step]');
    if (stp && stp.tagName === 'INPUT') { post('/api/seo', { id: stp.dataset.step, done: stp.checked }).then((r) => { if (seoState.data) seoState.data.done = r.done; }).catch(() => {}); return; }
    if (e.target.id === 'seo-again') { seoState.data = null; draw(); return; }
    const pf = e.target.closest('[data-pf]'); if (pf) { ui.people.f = pf.dataset.pf; draw(); return; }
    const lf = e.target.closest('[data-lf]'); if (lf) { ui.leads.f = lf.dataset.lf; draw(); return; }
    const lp = e.target.closest('[data-lp]'); if (lp) { ui.leads.p = lp.dataset.lp; draw(); return; }
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
