/* Страница статистики: только для владельца, по логину и паролю. */
import { authorized, gate } from './api/stats.js';

export async function onRequestGet({ request, env }) {
  const ok = await authorized(request, env);
  if (ok !== true) return gate(ok);
  return new Response(PAGE, {
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'no-store',
      'x-robots-tag': 'noindex, nofollow'
    }
  });
}

const PAGE = String.raw`<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>Статистика</title>
<style>
:root{--bg:#faf9f7;--panel:#fff;--ink:#17171a;--muted:#6c6a66;--line:#e5e2dc;--accent:#a8432a;--soft:#f3e4de;--ok:#2d7a4f;--bad:#b3261e}
@media (prefers-color-scheme:dark){:root{--bg:#0e0e10;--panel:#161618;--ink:#f0eee9;--muted:#9b9791;--line:#2a2a2d;--accent:#e08a6f;--soft:#2b1f1b;--ok:#6cc08b;--bad:#ef8a83}}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--ink);font:15px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif}
header{position:sticky;top:0;z-index:5;background:var(--bg);border-bottom:1px solid var(--line);padding:12px 16px;display:flex;flex-wrap:wrap;gap:10px 16px;align-items:center}
header h1{font-size:18px;margin:0;font-weight:600}
.tabs,.range{display:flex;gap:6px;flex-wrap:wrap}
button,select{font:inherit;color:var(--ink);background:var(--panel);border:1px solid var(--line);border-radius:999px;padding:6px 13px;cursor:pointer}
button.on{background:var(--ink);color:var(--bg);border-color:var(--ink)}
main{max-width:1100px;margin:0 auto;padding:18px 16px 60px}
.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;margin-bottom:18px}
.card,.box{background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:14px 16px}
.card b{display:block;font-size:26px;line-height:1.1}
.card span{color:var(--muted);font-size:13px}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:12px;margin-bottom:12px}
h2{font-size:16px;margin:0 0 10px}
h3{font-size:13px;margin:16px 0 6px;color:var(--muted);font-weight:600;text-transform:uppercase;letter-spacing:.06em}
.row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:8px;padding:4px 0;font-size:14px;position:relative}
.row i{position:absolute;left:0;bottom:0;height:3px;border-radius:2px;background:var(--accent);opacity:.35}
.row span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.row em{font-style:normal;color:var(--muted)}
.muted{color:var(--muted)}
svg.chart{width:100%;height:150px;display:block}
.table{width:100%;border-collapse:collapse;font-size:14px}
.table th{text-align:left;color:var(--muted);font-weight:500;font-size:12px;padding:6px 8px;border-bottom:1px solid var(--line)}
.table td{padding:8px;border-bottom:1px solid var(--line);vertical-align:top}
.table tr.click{cursor:pointer}
.table tr.click:hover{background:var(--soft)}
.sub{background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:14px 16px;margin-bottom:10px}
.sub .head{display:flex;flex-wrap:wrap;gap:4px 14px;font-size:13px;color:var(--muted);margin-bottom:6px}
.sub .msg{white-space:pre-wrap;margin:8px 0}
.tag{display:inline-block;font-size:12px;padding:1px 8px;border-radius:999px;background:var(--soft);color:var(--accent)}
.tag.bad{background:transparent;border:1px solid var(--bad);color:var(--bad)}
.tl{margin:8px 0 0;padding:0;list-style:none;font-size:13px}
.tl li{display:grid;grid-template-columns:78px 120px minmax(0,1fr);gap:8px;padding:3px 0;border-bottom:1px dashed var(--line)}
.tl li b{font-weight:500}
.tl li span:last-child{overflow-wrap:anywhere}
.hint{font-size:13px;color:var(--muted);margin:10px 0 0}
.empty{color:var(--muted);padding:20px 0}
a{color:var(--accent)}
@media(max-width:600px){.tl li{grid-template-columns:62px 1fr}.tl li span:nth-child(2){display:none}}
</style>
</head>
<body>
<header>
  <h1>Статистика syntha.pro</h1>
  <div class="tabs" id="tabs"></div>
  <div class="range" id="range"></div>
</header>
<main id="app"><p class="empty">Загрузка…</p></main>
<script>
(() => {
const $ = (s) => document.querySelector(s);
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const nf = new Intl.NumberFormat('ru-RU');
const SEC = { hero:'Первый экран', consulting:'Консалтинг', experience:'Опыт', projects:'Проекты', news:'Лента', media:'Публикации', contact:'Форма связи', about:'Обо мне', now:'Сейчас' };
const TABS = [['overview','Обзор'],['sections','Разделы и клики'],['people','Люди'],['leads','Заявки'],['forms','Форма и квиз']];
let tab = 'overview', days = 30, data = null, open = null;

$('#tabs').innerHTML = TABS.map(([k,l]) => '<button data-t="'+k+'">'+l+'</button>').join('');
$('#range').innerHTML = [7,30,90,365].map((d) => '<button data-d="'+d+'">'+(d===365?'год':d+' дн.')+'</button>').join('')
  + '<button id="mute" title="Ваши визиты не будут считаться в этом браузере"></button>';
const muted = () => { try { return localStorage.getItem('notrack') === '1'; } catch { return false; } };
const syncMute = () => { $('#mute').textContent = muted() ? 'Мои визиты не считаются ✓' : 'Не считать мои визиты'; };
syncMute();
$('#mute').onclick = () => { try { muted() ? localStorage.removeItem('notrack') : localStorage.setItem('notrack','1'); } catch {} syncMute(); };
document.addEventListener('click', (e) => {
  const t = e.target.closest('[data-t]'); if (t) { tab = t.dataset.t; open = null; draw(); }
  const d = e.target.closest('[data-d]'); if (d) { days = +d.dataset.d; load(); }
  const v = e.target.closest('[data-vid]'); if (v) toggleVisitor(v.dataset.vid, v.dataset.into);
});

async function api(qs) {
  const r = await fetch('/api/stats?' + qs, { credentials: 'same-origin', cache: 'no-store' });
  if (!r.ok) throw new Error(r.status);
  return r.json();
}
async function load() {
  $('#app').innerHTML = '<p class="empty">Загрузка…</p>';
  try { data = await api('days=' + days); draw(); }
  catch (e) { $('#app').innerHTML = '<p class="empty">Не удалось загрузить данные ('+esc(e.message)+'). Если база ещё не подключена — см. инструкцию.</p>'; }
}

const bars = (rows, label, value, fmt) => {
  if (!rows?.length) return '<p class="muted">Пока нет данных.</p>';
  const max = Math.max(...rows.map(value), 1);
  return rows.map((r) => '<div class="row"><span>'+label(r)+'</span><em>'+(fmt ? fmt(r) : nf.format(value(r)))+'</em><i style="width:'+Math.round(value(r)/max*100)+'%"></i></div>').join('');
};
const when = (ts) => new Date(ts).toLocaleString('ru-RU', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' });
const dur = (s) => s == null ? '—' : s >= 60 ? Math.floor(s/60) + ' мин ' + Math.round(s%60) + ' с' : Math.round(s) + ' с';
const secName = (id) => SEC[id] || id;
const nameOf = (vid) => (data.names.find((n) => n.vid === vid) || {}).name || '';
const refName = (r) => { if (!r) return 'Напрямую'; try { return new URL(r).hostname.replace(/^www\./,''); } catch { return r; } };
const place = (r) => [r.city, r.country].filter(Boolean).join(', ') || '—';

function chart(daily) {
  if (!daily.length) return '<p class="muted">Пока нет данных.</p>';
  const W = 600, H = 150, p = 22, max = Math.max(...daily.map((d) => d.views), 1);
  const bw = (W - p*2) / daily.length;
  const bars = daily.map((d, i) => {
    const h = Math.round((H - p*2) * d.views / max), hv = Math.round((H - p*2) * d.visitors / max);
    const x = p + i*bw;
    return '<g><title>'+d.d+': '+d.visitors+' чел., '+d.views+' просм.</title>'
      + '<rect x="'+(x+1)+'" y="'+(H-p-h)+'" width="'+Math.max(bw-2,1)+'" height="'+h+'" rx="2" fill="var(--accent)" opacity=".28"/>'
      + '<rect x="'+(x+1)+'" y="'+(H-p-hv)+'" width="'+Math.max(bw-2,1)+'" height="'+hv+'" rx="2" fill="var(--accent)"/></g>';
  }).join('');
  return '<svg class="chart" viewBox="0 0 '+W+' '+H+'" preserveAspectRatio="none">'+bars
    + '<text x="'+p+'" y="'+(H-5)+'" font-size="10" fill="var(--muted)">'+daily[0].d+'</text>'
    + '<text x="'+(W-p)+'" y="'+(H-5)+'" font-size="10" text-anchor="end" fill="var(--muted)">'+daily[daily.length-1].d+'</text></svg>'
    + '<p class="hint">Тёмный столбец — люди, светлый — просмотры страниц. Пик: '+max+' просмотров за день.</p>';
}

function overview() {
  const t = data.totals || {}, f = data.funnel || {};
  const pct = (a, b) => b ? Math.round(a / b * 100) + '%' : '—';
  return '<div class="cards">'
    + [[t.visitors,'человек'],[t.sessions,'визитов'],[t.views,'просмотров страниц'],[dur(data.avgSec),'на сайте в среднем'],[f.sent||0,'заявок отправлено'],[pct(f.sent||0, f.visit||0),'визит → заявка']]
      .map(([a,b]) => '<div class="card"><b>'+(typeof a==='number'?nf.format(a):a??0)+'</b><span>'+b+'</span></div>').join('')
    + '</div><div class="box" style="margin-bottom:12px"><h2>По дням</h2>'+chart(data.daily)+'</div>'
    + '<div class="grid">'
    + '<div class="box"><h2>Откуда пришли</h2>'+bars(data.refs, (r) => esc(refName(r.ref)), (r) => r.n)+'</div>'
    + '<div class="box"><h2>Где живут</h2>'+bars(data.geo, (r) => esc(place(r)), (r) => r.n)+'</div>'
    + '<div class="box"><h2>Страницы</h2>'+bars(data.pages, (r) => esc(r.p || '/'), (r) => r.n, (r) => r.n+' · '+r.u+' чел.')+'</div>'
    + '<div class="box"><h2>Устройства</h2>'+['device','browser','os','lang'].map((k) => '<h3>'+({device:'Тип',browser:'Браузер',os:'Система',lang:'Язык'})[k]+'</h3>'+bars(data.tech[k], (r) => esc(r.k), (r) => r.n)).join('')+'</div>'
    + '</div>';
}

function sections() {
  const kind = { messenger:'Мессенджер', outbound:'Внешняя ссылка', phone:'Телефон', email:'Почта', link:'Ссылка на сайте' };
  return '<div class="grid">'
    + '<div class="box"><h2>Какие разделы доходили до экрана</h2>'+bars(data.sections, (r) => esc(secName(r.target)), (r) => r.n, (r) => r.n+' виз.')
    + '<h3>Глубина прокрутки</h3>'+bars(data.depth, (r) => r.target+'%', (r) => r.n, (r) => r.n+' виз.')+'</div>'
    + '<div class="box"><h2>Какие окна открывали</h2>'+bars(data.modals, (r) => esc(r.label || r.target), (r) => r.n, (r) => r.n+' · '+r.u+' чел.')
    + '<h3>Переходы по якорям (посты, форматы)</h3>'+bars(data.views, (r) => esc(r.target), (r) => r.n, (r) => r.n+' · '+r.u+' чел.')+'</div>'
    + '</div><div class="box"><h2>Нажатия и скачивания</h2>'
    + (data.clicks.length ? '<table class="table"><tr><th>Что</th><th>Куда / название</th><th>Раз</th><th>Людей</th></tr>'
      + data.clicks.map((r) => '<tr><td>'+(r.type==='download'?'<span class="tag">Скачивание</span>':esc(kind[r.target]||'Кнопка'))+'</td><td>'+esc(r.type==='download'?r.target:(r.label||r.target))+(r.type==='click'&&kind[r.target]?' <span class="muted">'+esc(r.target==='link'?'':r.label)+'</span>':'')+'</td><td>'+r.n+'</td><td>'+r.u+'</td></tr>').join('')+'</table>'
      : '<p class="muted">Пока нет данных.</p>')
    + '</div>';
}

function people() {
  if (!data.visitors.length) return '<p class="empty">Пока нет данных.</p>';
  return '<div class="box"><p class="hint" style="margin:0 0 8px">Нажмите на строку — откроется весь путь человека по сайту. Имя видно, только если человек отправил заявку. IP и город — сеть, а не личность.</p>'
    + '<table class="table"><tr><th>Кто</th><th>Откуда</th><th>Устройство</th><th>Визитов</th><th>Последний</th></tr>'
    + data.visitors.map((v) => '<tr class="click" data-vid="'+esc(v.vid)+'" data-into="v-'+esc(v.vid)+'"><td>'+(nameOf(v.vid)?'<b>'+esc(nameOf(v.vid))+'</b><br>':'')+'<span class="muted">'+esc(v.vid.slice(0,8))+'</span></td>'
      + '<td>'+esc(place(v))+'<br><span class="muted">'+esc(v.org||'')+(v.ip?' · '+esc(v.ip):'')+'</span></td>'
      + '<td>'+esc(v.device)+', '+esc(v.browser)+', '+esc(v.os)+'<br><span class="muted">'+esc(refName(v.ref))+'</span></td>'
      + '<td>'+v.sessions+' <span class="muted">('+v.n+' действий)</span></td><td>'+when(v.last)+'</td></tr>'
      + '<tr id="v-'+esc(v.vid)+'" hidden><td colspan="5"></td></tr>').join('')
    + '</table></div>';
}

function evText(e) {
  const m = { pageview:'Открыл страницу', section:'Дошёл до раздела', click:'Нажал', download:'Скачал', modal:'Открыл окно', view:'Перешёл к', scroll:'Прокрутил до', leave:'Ушёл', form_start:'Начал заполнять форму', form_field:'Заполняет поле', form_abandon:'Бросил форму', form_error:'Ошибка в форме', form_sent:'Отправил заявку', form_failed:'Заявка не ушла', quiz_step:'Квиз: ответ', quiz_result:'Квиз: результат', form_try:'Нажал «Отправить»' };
  let d = {}; try { d = e.data ? JSON.parse(e.data) : {}; } catch {}
  let extra = e.type==='leave' ? dur(d.sec)+', глубина '+(d.depth||0)+'%' : e.type==='scroll' ? e.target+'%' : e.type==='section' ? secName(e.target) : e.label || e.target;
  if (e.type==='pageview') extra = (e.path||'/')+(d.vp?' · '+d.vp:'');
  if (e.type==='click' && e.target && !['link'].includes(e.target) && e.label) extra = e.label + ' → ' + e.target;
  return (m[e.type] || e.type) + (extra ? ': ' + esc(extra) : '');
}
const tl = (events) => '<ul class="tl">'+events.map((e) => '<li><b>'+when(e.ts).replace(/^.*?,? /,'')+'</b><span class="muted">'+esc(e.path||'')+'</span><span>'+evText(e)+'</span></li>').join('')+'</ul>';

async function toggleVisitor(vid, into) {
  const row = document.getElementById(into);
  if (!row) return;
  if (!row.hidden) { row.hidden = true; return; }
  row.hidden = false;
  const cell = row.firstElementChild;
  cell.innerHTML = '<span class="muted">Загрузка…</span>';
  try {
    const r = await api('vid=' + encodeURIComponent(vid));
    cell.innerHTML = (r.subs.length ? '<p>'+r.subs.map((s) => '<span class="tag">Заявка</span> '+esc(s.name)+' · '+esc([s.email,s.telegram,s.phone].filter(Boolean).join(', '))).join('<br>')+'</p>' : '') + tl(r.events);
  } catch { cell.textContent = 'Не удалось загрузить путь.'; }
}

function leads() {
  if (!data.submissions.length) return '<p class="empty">Заявок за период нет.</p>';
  return data.submissions.map((s) => {
    let ent = null; try { ent = s.entity ? JSON.parse(s.entity) : null; } catch {}
    return '<div class="sub"><div class="head"><b style="color:var(--ink)">'+esc(s.name)+'</b><span>'+when(s.ts)+'</span>'
      + '<span class="tag">'+esc(s.topic)+'</span>'+(s.ok?'':'<span class="tag bad">в Telegram не ушла</span>')
      + (s.country?'<span>'+esc([s.city,s.country].filter(Boolean).join(', '))+'</span>':'')+'<span>'+esc(s.lang||'')+'</span></div>'
      + '<div class="head">'+[s.email&&'Email: '+esc(s.email), s.telegram&&'Telegram: '+esc(s.telegram), s.phone&&'Телефон: '+esc(s.phone)].filter(Boolean).join(' · ')+'</div>'
      + (ent?'<div class="head">Юрлицо: '+esc([ent.name, ent.inn&&'ИНН '+ent.inn, ent.address, ent.site].filter(Boolean).join(' · '))+'</div>':'')
      + '<div class="msg">'+esc(s.message)+'</div>'
      + (s.file_name?'<div class="head">Файл: '+esc(s.file_name)+'</div>':'')
      + '<button data-vid="'+esc(s.vid)+'" data-into="l-'+s.id+'">Путь по сайту</button><div id="l-'+s.id+'" hidden><div></div></div></div>';
  }).join('');
}

function forms() {
  const f = data.funnel || {};
  const steps = [['Зашли на сайт', f.visit],['Дошли до формы', f.saw_form],['Начали заполнять', f.started],['Отправили', f.sent]];
  return '<div class="grid">'
    + '<div class="box"><h2>Путь к заявке</h2>'+bars(steps, (r) => r[0], (r) => r[1]||0, (r) => (r[1]||0)+' виз.')
    + '<p class="hint">Не ушло в Telegram: '+(f.failed||0)+'. Ошибок заполнения: '+(f.errors||0)+'.</p>'
    + '<h3>Какие поля трогали</h3>'+bars(data.fields, (r) => esc(r.target), (r) => r.n, (r) => r.n+' виз.')
    + '<h3>На чём спотыкались</h3>'+bars(data.errors, (r) => esc(r.label), (r) => r.n)+'</div>'
    + '<div class="box"><h2>Квиз «Подобрать формат»</h2>'
    + (data.quiz.length ? '<table class="table"><tr><th>Этап</th><th>Ответ</th><th>Раз</th></tr>'+data.quiz.map((r) => '<tr><td>'+(r.type==='quiz_result'?'Результат':'Вопрос '+esc(r.target))+'</td><td>'+esc(r.label)+'</td><td>'+r.n+'</td></tr>').join('')+'</table>' : '<p class="muted">Пока нет данных.</p>')
    + '</div></div>'
    + '<div class="box"><h2>Бросили форму</h2>'
    + (data.abandons.length ? '<table class="table"><tr><th>Когда</th><th>Откуда</th><th>Что успели заполнить</th></tr>'+data.abandons.map((a) => '<tr><td>'+when(a.ts)+'</td><td>'+esc(place(a))+'</td><td>'+esc(a.label)+'</td></tr>').join('')+'</table>' : '<p class="muted">Таких нет.</p>')
    + '<p class="hint">Тексты из неотправленной формы не сохраняются — только названия полей.</p></div>';
}

function draw() {
  document.querySelectorAll('#tabs button').forEach((b) => b.classList.toggle('on', b.dataset.t === tab));
  document.querySelectorAll('#range button[data-d]').forEach((b) => b.classList.toggle('on', +b.dataset.d === days));
  if (!data) return;
  $('#app').innerHTML = ({ overview, sections, people, leads, forms })[tab]();
}
load();
})();
</script>
</body>
</html>`;
