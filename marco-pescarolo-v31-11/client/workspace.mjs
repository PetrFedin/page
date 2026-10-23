import { CommercialGateway } from './data-api.mjs';
import { CommerceError, analyzeClientOrder, array, formatAmount, minor, planReorder } from '../core/commerce-engine.mjs';

const i18n = {
  en: { edition:'PRIVATE COMMERCE INFRASTRUCTURE', entry:'A considered way to manage commerce.',
    intro:'Authenticated ordering, financial evidence, delivery and product intelligence — with one source of truth.',
    signIn:'Secure sign in', email:'Email address', password:'Password', connect:'Connect to workspace', configured:'Identity service connected', notConfigured:'Secure workspace is not yet configured. No demo login is provided.',
    confidentiality:'Every account, store and financial figure is verified by the server.',
    access:'Your authorised workspaces', refresh:'Refresh from server', signOut:'Sign out',
    overview:'Overview', orders:'Orders', fulfillment:'Delivery', finance:'Finance', planning:'Planning',
    approvals:'Approvals', alerts:'Exceptions', issued:'Issued proformas', incomplete:'Incomplete',
    loadError:'Unable to verify this workspace. No account data was displayed.', empty:'No eligible records returned by the server.',
    book:'Booked order value', settlement:'Verified settlement', evidence:'Unverified payment evidence',
    openBalance:'Open proforma balance', contribution:'Delivered contribution estimate',
    revenue:'Revenue recognition not assessed', unavailable:'Unavailable', order:'Order', client:'Client / location', stage:'Stage',
    value:'Value', revision:'Revision', delivery:'Proof of delivery', delivered:'Delivered', awaiting:'Awaiting delivery',
    verification:'Payment evidence', units:'Units', condition:'Status', documents:'Documents', dataTime:'Server statement',
    notRevenue:'Payment submissions are not received cash. Delivered goods value is not recognized revenue.',
    whatif:'Replenishment scenario', whatifIntro:'Local scenario only. Does not place an order or change inventory.',
    sales:'Net units sold, last four weeks (oldest first)', hand:'Available units', inbound:'Confirmed inbound', lead:'Lead weeks', safety:'Safety weeks', moq:'MOQ', multiple:'Order multiple', calculate:'Calculate scenario', suggestion:'Suggested units', target:'Target units', forecast:'Weighted weekly demand',
    workspace:'Commercial workspace', noAccess:'No active role is assigned to this account.',
    export:'Export visible orders', source:'PostgreSQL authority', scope:'Authorised scope', attention:'Attention',
    itemPrice:'Price readiness', inProcess:'In progress', proof:'Confirmed by carrier POD', missingProof:'Not documented',
    roleAdmin:'Brand administration', roleBuyer:'Wholesale', rolePrivate:'Private client',
    unknown:'Awaiting server evidence', view:'View', noProforma:'No issued proforma in the visible order window.',
    session:'Session held in memory; closing or refreshing this page requires a new login.',
    subset:'Only the latest 100 orders are shown by the current server endpoint.',
    passwordHint:'Use your existing authorised Supabase Auth account. No account is created here.' },
  ru: { edition:'ЗАЩИЩЁННАЯ КОММЕРЧЕСКАЯ ПЛАТФОРМА', entry:'Управление коммерцией в единой системе.',
    intro:'Заказы, подтверждённые платежи, доставка и аналитика — на основе проверенных серверных данных.',
    signIn:'Защищённый вход', email:'Электронная почта', password:'Пароль', connect:'Войти в кабинет', configured:'Сервис авторизации подключён', notConfigured:'Подключение к защищённому кабинету ещё не настроено. Демо-вход отсутствует.',
    confidentiality:'Доступ к клиенту, магазину и финансам проверяется сервером.', access:'Разрешённые кабинеты', refresh:'Обновить данные', signOut:'Выйти',
    overview:'Обзор', orders:'Заказы', fulfillment:'Доставка', finance:'Финансы', planning:'Планирование',
    approvals:'Согласования', alerts:'Исключения', issued:'Выставленные проформы', incomplete:'Не завершено',
    loadError:'Подтверждение прав не удалось. Данные кабинета не показаны.', empty:'Сервер не вернул доступных записей.',
    book:'Сумма заказов', settlement:'Подтверждённые расчёты', evidence:'Платежи на проверке',
    openBalance:'Остаток по проформам', contribution:'Оценка вклада от доставки',
    revenue:'Признание выручки не оценивалось', unavailable:'Недоступно', order:'Заказ', client:'Клиент / магазин', stage:'Этап',
    value:'Сумма', revision:'Ревизия', delivery:'Подтверждение доставки', delivered:'Доставлено', awaiting:'Ожидается',
    verification:'Статус оплаты', units:'Единицы', condition:'Статус', documents:'Документы', dataTime:'Данные сервера',
    notRevenue:'Заявленный платёж не равен поступившим деньгам; доставка не равна признанной выручке.',
    whatif:'Сценарий подсортировки', whatifIntro:'Локальный расчёт: не создаёт заказ и не меняет остатки.',
    sales:'Продажи за 4 недели, сначала ранняя', hand:'Доступный остаток', inbound:'Подтверждено в пути', lead:'Поставка, нед.', safety:'Запас, нед.', moq:'Минимум', multiple:'Кратность', calculate:'Рассчитать', suggestion:'Рекомендуемое кол-во', target:'Целевой запас', forecast:'Средняя взвешенная продажа',
    workspace:'Коммерческий кабинет', noAccess:'У учётной записи нет активных полномочий.',
    export:'Выгрузить видимые заказы', source:'Данные PostgreSQL', scope:'Область доступа', attention:'Требует внимания',
    itemPrice:'Готовность цен', inProcess:'В работе', proof:'Подтверждено перевозчиком', missingProof:'Нет подтверждения',
    roleAdmin:'Администратор бренда', roleBuyer:'Оптовый клиент', rolePrivate:'Частный клиент',
    unknown:'Нет серверного подтверждения', view:'Просмотр', noProforma:'Нет проформ по доступным заказам.',
    session:'Сессия хранится только в памяти. После перезагрузки потребуется повторный вход.',
    subset:'Сервер показывает только последние 100 заказов.',
    passwordHint:'Войдите в существующую учётную запись Supabase Auth. Регистрация здесь не выполняется.' },
  it: { edition:'INFRASTRUTTURA COMMERCIALE RISERVATA', entry:'Un modo più attento di gestire il commercio.',
    intro:'Ordini, pagamenti verificati, consegne e analisi collegati a un’unica fonte autorevole.',
    signIn:'Accesso protetto', email:'Indirizzo email', password:'Password', connect:'Accedi allo spazio', configured:'Autenticazione collegata', notConfigured:'Lo spazio protetto non è ancora configurato. Nessun accesso dimostrativo.',
    confidentiality:'Ogni cliente, negozio e dato finanziario è verificato dal server.', access:'Spazi autorizzati', refresh:'Aggiorna dal server', signOut:'Esci',
    overview:'Panoramica', orders:'Ordini', fulfillment:'Consegne', finance:'Finanza', planning:'Pianificazione',
    approvals:'Approvazioni', alerts:'Eccezioni', issued:'Proforma emesse', incomplete:'Incompleto',
    loadError:'Verifica dell’accesso non riuscita. Nessun dato mostrato.', empty:'Nessun record restituito dal server.',
    book:'Valore ordini', settlement:'Incassi verificati', evidence:'Pagamenti da verificare',
    openBalance:'Saldo proforma', contribution:'Contributo stimato consegne',
    revenue:'Ricavi non ancora riconosciuti', unavailable:'Non disponibile', order:'Ordine', client:'Cliente / negozio', stage:'Fase',
    value:'Valore', revision:'Revisione', delivery:'Prova di consegna', delivered:'Consegnato', awaiting:'In attesa',
    verification:'Verifica pagamenti', units:'Unità', condition:'Stato', documents:'Documenti', dataTime:'Dati server',
    notRevenue:'Una prova di pagamento non equivale a liquidità; le consegne non sono ricavi riconosciuti.',
    whatif:'Scenario riassortimento', whatifIntro:'Solo scenario locale. Non crea ordini né modifica lo stock.',
    sales:'Vendite nette nelle ultime 4 settimane', hand:'Disponibilità', inbound:'In arrivo confermato', lead:'Lead time, sett.', safety:'Scorta sicurezza, sett.', moq:'MOQ', multiple:'Multiplo', calculate:'Calcola', suggestion:'Unità suggerite', target:'Obiettivo scorte', forecast:'Media settimanale pesata',
    workspace:'Area commerciale', noAccess:'Nessun ruolo attivo per questo account.',
    export:'Esporta ordini visibili', source:'Autorità PostgreSQL', scope:'Ambito autorizzato', attention:'Attenzione',
    itemPrice:'Prezzi da completare', inProcess:'In corso', proof:'POD corriere confermato', missingProof:'Non documentato',
    roleAdmin:'Amministrazione', roleBuyer:'Wholesale', rolePrivate:'Cliente privato',
    unknown:'In attesa di evidenze', view:'Apri', noProforma:'Nessuna proforma per gli ordini visibili.',
    session:'La sessione è solo in memoria. Il ricaricamento richiede un nuovo accesso.',
    subset:'Il server mostra solo gli ultimi 100 ordini.',
    passwordHint:'Usa un account Supabase Auth già autorizzato. Nessun account demo.' }
};
export const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let lang = 'en', gateway = null, view = null, selected = null, panel = 'overview', current = 0;
let bootError = null;
const el = id => document.getElementById(id);
const t = name => i18n[lang][name] || i18n.en[name] || name;
const money = (amount, iso) => amount === null || amount === undefined ? t('unavailable') : formatAmount(amount, iso, lang);
const count = v => new Intl.NumberFormat(lang === 'ru' ? 'ru-RU' : lang === 'it' ? 'it-IT' : 'en-GB').format(v);
const l = (key, content) => `<span class="label">${esc(t(key))}</span><strong>${content}</strong>`;
const block = (key, content, detail = '') => `<div class="datum">${l(key, content)}${detail ? `<small>${esc(detail)}</small>` : ''}</div>`;
const nullMessage = () => `<div class="blank"><div class="blank-mark">—</div><p>${esc(t('empty'))}</p></div>`;
const badge = (s = '') => `<span class="stage stage-${esc(String(s).replace(/[^a-z_-]/ig,''))}">${esc(String(s || t('unknown')).replace(/_/g,' '))}</span>`;
const safeVal = text => esc(text).slice(0, 1500);

function updateStatic() {
  document.documentElement.lang = lang;
  for (const node of document.querySelectorAll('[data-i18n]')) node.textContent = t(node.dataset.i18n);
  for (const node of document.querySelectorAll('[data-lang]')) node.setAttribute('aria-pressed',String(node.dataset.lang === lang));
}
function alert(message = '', negative = false) {
  const note = el('notice'); note.textContent = message; note.hidden = !message;
  note.classList.toggle('danger',negative);
}
function setBusy(working) { el('loading').hidden = !working; el('refresh').disabled = working; }
function setSignedOut(error = '') {
  view = null; selected = null; el('gate').hidden = false; el('content').hidden = true;
  el('role-options').replaceChildren(); el('results').replaceChildren();
  if (error) alert(error,true);
}
function drawRoles() {
  const contexts = gateway?.getContexts() || [];
  el('role-options').innerHTML = contexts.map(c => `<button class="role-button ${c.role === selected ? 'on' : ''}" data-role="${esc(c.role)}" aria-pressed="${c.role === selected}">${safeVal(c.label)}</button>`).join('');
  el('scope').textContent = selected === 'admin' ? t('roleAdmin') : `${view?.membership?.client_name || ''}${view?.membership?.store_name ? ' / '+view.membership.store_name : ''}`;
}
function renderCurrencies(groups) {
  if (groups.size === 0) return nullMessage();
  return `<div class="currency-grid">${[...groups.entries()].map(([iso,m])=>`<article class="currency-panel">
    <div class="currency-name">${esc(iso)} <span>${esc(t('source'))}</span></div>
    <div class="value-hero">${money(m.booked_gmv,iso)}</div><div class="fine">${esc(t('book'))}</div>
    <div class="mini-grid">${block('settlement',money(m.verified_settlement,iso))}${block('evidence',money(m.unverified_payment_evidence,iso))}
    ${block('openBalance',money(m.issued_proforma_open_balance,iso))}${block('contribution',money(m.contribution,iso),m.missingCogsUnits?`${m.missingCogsUnits} units without COGS`:'')}</div>
  </article>`).join('')}</div>`;
}
function clientSummary(v) {
  const orders = v.analysis.orders;
  const proofed = v.analysis.delivery.filter(x => x.delivered_units > 0).length;
  const proformas = v.analysis.proformas.length;
  const pending = orders.filter(x => ['draft','negotiation','selection','approval_pending'].includes(x.stage)).length;
  return `<div class="kpi-line">
    ${block('orders',count(orders.length),orders.length>=100?t('subset'):'')}
    ${block('issued',count(proformas))}
    ${block('delivery',count(proofed),t('proof'))}
    ${block('inProcess',count(pending))}
  </div>`;
}
function showClientOrders(v) {
  const ledgers = new Map(v.analysis.delivery.map(x=>[x.id,x]));
  if (!v.analysis.orders.length) return nullMessage();
  let rows = v.analysis.orders.map(order=>{
    const m = analyzeClientOrder(order,ledgers.get(order.id));
    return `<tr><td><strong class="order-id">${safeVal(m.code)}</strong><small class="muted">${safeVal(order.id)}</small></td>
    <td>${badge(m.stage)}</td><td class="numeric">${money(m.authoritativeTotal,m.currency)}</td>
    <td class="numeric">${esc(count(m.orderedUnits))}</td><td class="numeric">${m.deliveredUnits===null ? `<span class="unknown">${t('unknown')}</span>` : `${count(m.deliveredUnits)} / ${count(m.orderedUnits)}`}</td>
    <td class="numeric">${money(m.pendingEvidence,m.currency)}</td>
    <td class="numeric">${esc(order.current_revision??'—')}</td></tr>`;
  }).join('');
  return `<div class="table-scroll"><table><thead><tr><th>${t('order')}</th><th>${t('stage')}</th><th>${t('value')}</th><th>${t('units')}</th><th>${t('delivered')}</th><th>${t('evidence')}</th><th>${t('revision')}</th></tr></thead><tbody>${rows}</tbody></table></div>`;
}
function showDelivery(v) {
  if (!v.analysis.delivery.length) return nullMessage();
  return `<div class="ledger-grid">${v.analysis.delivery.map(o => `<article class="ledger-item">
    <div class="ledger-top"><strong>${safeVal(o.code)}</strong>${badge(o.stage)}</div>
    <div class="ledger-progress"><div style="width:${Math.min(100,100*(Number(o.delivered_units||0)/Math.max(1,Number(o.ordered_units||0))))}%"></div></div>
    <div class="ledger-stats">${block('delivered',`${count(o.delivered_units||0)} / ${count(o.ordered_units||0)}`)}
    ${block('awaiting',count(o.undelivered_units||0))}${block('missingProof',count(o.undocumented_units||0))}</div>
    <div class="ledger-foot">${esc(t('proof'))}: ${array(o.shipments).filter(s=>s.receipt).length} / ${array(o.shipments).length}</div>
  </article>`).join('')}</div>`;
}
function showProformas(v) {
  const entries=v.analysis.proformas;
  if(!entries.length) return `<div class="blank">${esc(t('noProforma'))}</div>`;
  return `<div class="table-scroll"><table><thead><tr><th>Proforma</th><th>${t('order')}</th><th>${t('value')}</th><th>${t('condition')}</th></tr></thead><tbody>${entries.map(p=>`<tr><td class="order-id">${safeVal(p.number)}</td><td>${safeVal(p.deal_id)}</td><td class="numeric">${money(p.amount,p.currency)}</td><td>${badge(p.status)}</td></tr>`).join('')}</tbody></table></div>`;
}
function showAdminOrders(v) {
  const orders=v.analysis.orders;
  if(!orders.length) return nullMessage();
  return `<div class="table-scroll"><table><thead><tr><th>${t('order')}</th><th>${t('client')}</th><th>${t('stage')}</th><th>${t('value')}</th><th>${t('revision')}</th><th>${t('delivery')}</th></tr></thead><tbody>
    ${orders.map(o=>`<tr><td class="order-id">${safeVal(o.code)}</td><td>${safeVal(o.client_name)}<small class="muted">${safeVal(o.store_name||o.client_type)}</small></td>
    <td>${badge(o.stage)}</td><td class="numeric">${money(o.total_amount,o.currency)}</td><td>${esc(o.current_revision??'—')}</td>
    <td>${array(o.shipments).map(s=>badge(s.status)).join(' ')||'—'}</td></tr>`).join('')}</tbody></table></div>`;
}
function showAdminFulfillment(v) {
  const queue=v.analysis.shipments;
  if(!queue.length) return nullMessage();
  return `<div class="table-scroll"><table><thead><tr><th>${t('delivery')}</th><th>${t('order')}</th><th>${t('stage')}</th><th>Carrier</th><th>Tracking</th></tr></thead><tbody>
    ${queue.map(s=>`<tr><td class="order-id">${safeVal(s.code)}</td><td>${safeVal(s.deal_code)}</td><td>${badge(s.status)}</td><td>${safeVal(s.carrier)}</td><td>${safeVal(s.tracking)}</td></tr>`).join('')}</tbody></table></div>`;
}
function showRisks(v) {
  const r=v.analysis;
  const warnings=r.warnings;
  const captions={ PUBLISHED_WITHOUT_RETAIL_PRICE:t('itemPrice'),UNVERIFIED_PAYMENT_EVIDENCE:t('evidence'),PENDING_APPROVALS:t('approvals') };
  if (!warnings.length) return `<div class="blank">No exceptions in the returned records.</div>`;
  return `<div class="risk-list">${warnings.map(w=>`<div class="risk"><span class="risk-dot"></span><div><strong>${safeVal(captions[w]||w)}</strong><small>${safeVal(w==='PUBLISHED_WITHOUT_RETAIL_PRICE' ? `${r.productsMissingRetailPrice} published products` : w==='UNVERIFIED_PAYMENT_EVIDENCE' ? `${r.unverified.length} submitted payment records` : w==='PENDING_APPROVALS'?`${r.pendingApprovals.length} pending approvals` : w)}</small></div></div>`).join('')}</div>`;
}
function showScenario() {
  return `<section class="planner"><div class="section-caption">SIMULATION · NOT A SERVER FORECAST</div><h3>${esc(t('whatif'))}</h3><p class="muted">${esc(t('whatifIntro'))}</p>
    <form id="scenario" class="scenario-grid">
      <label class="wide">${t('sales')}<input name="sales" value="3,4,5,6" required aria-label="Four weeks of sales" /></label>
      <label>${t('hand')}<input name="onHand" type="number" value="8" min="0" required /></label>
      <label>${t('inbound')}<input name="inbound" type="number" value="2" min="0" required /></label>
      <label>${t('lead')}<input name="leadWeeks" type="number" value="3" step="0.1" min="0.1" required /></label>
      <label>${t('safety')}<input name="safetyWeeks" type="number" value="1" step="0.1" min="0" required /></label>
      <label>${t('moq')}<input name="moq" type="number" value="6" min="0" required /></label>
      <label>${t('multiple')}<input name="multiple" type="number" value="3" min="1" required /></label>
      <button type="submit" class="action primary wide">${t('calculate')}</button>
    </form><div id="scenario-output" aria-live="polite" class="scenario-output"></div>
  </section>`;
}
function draw() {
  if (!view) return;
  const admin=view.role==='admin';
  drawRoles();
  const menu=['overview','orders','fulfillment','finance','planning'];
  el('nav-tabs').innerHTML=menu.filter(x=>x!=='planning'||view.role==='wholesale').map(x=>`<button class="tab ${panel===x?'current':''}" data-panel="${x}" aria-pressed="${panel===x}">${esc(t(x))}</button>`).join('');
  let title=t(panel), sub='', body='';
  if(admin) {
    if(panel==='overview'){title=t('overview');sub=t('source');body=renderCurrencies(view.analysis.currencies)+`<div class="under-grid"><section class="panel"><header class="panel-head"><h3>${t('alerts')}</h3></header>${showRisks(view)}</section><section class="panel"><header class="panel-head"><h3>${t('approvals')}</h3></header><div class="headline-number">${count(view.analysis.pendingApprovals.length)}</div><p class="muted">${t('approvals')}</p></section></div>`;}
    if(panel==='orders') body=showAdminOrders(view);
    if(panel==='fulfillment') body=showAdminFulfillment(view);
    if(panel==='finance') body=renderCurrencies(view.analysis.currencies)+`<p class="disclaimer">${esc(t('notRevenue'))}</p>`;
    if(panel==='planning') panel='overview';
  } else {
    if(panel==='overview') body=clientSummary(view)+`<section class="panel"><header class="panel-head"><h3>${t('orders')}</h3></header>${showClientOrders(view)}</section>`;
    if(panel==='orders') body=showClientOrders(view);
    if(panel==='fulfillment') body=showDelivery(view);
    if(panel==='finance') body=showProformas(view)+`<p class="disclaimer">${esc(t('notRevenue'))}</p>`;
    if(panel==='planning') body=view.role==='wholesale'?showScenario():nullMessage();
  }
  el('results').innerHTML=`<div class="workspace-head"><div><p class="section-caption">${esc(t('workspace'))} / ${esc(view.role.toUpperCase())}</p><h2>${esc(title)}</h2><p class="muted">${esc(sub)}</p></div><div class="workspace-actions"><span class="server-pill"><span class="live-indicator"></span>${esc(t('source'))}</span><button class="action ghost" data-action="export">${esc(t('export'))}</button></div></div>${body}`;
  el('refreshed-at').textContent=new Intl.DateTimeFormat(lang==='ru'?'ru-RU':lang==='it'?'it-IT':'en-GB',{dateStyle:'medium',timeStyle:'short'}).format(new Date());
}
async function load(role) {
  if (!gateway) return;
  selected = role;
  const generation=++current;
  setBusy(true);alert('');
  try {
    const next=await gateway.load(role);
    if(generation!==current) return;
    view=next;panel='overview';el('gate').hidden=true;el('content').hidden=false;draw();
  } catch(e) { if(generation===current){view=null; el('results').replaceChildren(); el('content').hidden=true; el('gate').hidden=false; alert(`${t('loadError')} ${e instanceof CommerceError ? e.code : ''}`,true);}} finally{if(generation===current)setBusy(false);}
}
function downloadVisible() {
  if (!view) return;
  const orders=view.role==='admin'?view.analysis.orders:view.analysis.orders;
  const rows=[['order_code','stage','currency','amount','revision']];
  for(const o of orders) rows.push([o.code,o.stage,o.currency,o.total_amount,o.current_revision]);
  const csv=rows.map(r=>r.map(x=>`"${String(x??'').replace(/^[=+@-]/,'\'$&').replace(/"/g,'""')}"`).join(',')).join('\r\n');
  const href=URL.createObjectURL(new Blob(['\ufeff',csv],{type:'text/csv;charset=utf-8;'}));
  const a=document.createElement('a');a.href=href;a.download=`marco-${view.role}-orders-${new Date().toISOString().slice(0,10)}.csv`;a.click();URL.revokeObjectURL(href);
}
function calculate(form) {
  try {const d=new FormData(form);const values={sales:String(d.get('sales')).split(',').map(x=>x.trim()),onHand:d.get('onHand'),inbound:d.get('inbound'),leadWeeks:d.get('leadWeeks'),safetyWeeks:d.get('safetyWeeks'),moq:d.get('moq'),multiple:d.get('multiple')};
    const r=planReorder(values);
    el('scenario-output').innerHTML=`<div class="scenario-results">${block('suggestion',count(r.suggestedUnits))}${block('target',count(r.targetStockUnits))}${block('forecast',r.weightedWeeklyUnits.toFixed(1))}</div><p class="muted">${t('whatifIntro')}</p>`;
  }catch(e){el('scenario-output').textContent=e.message;}
}

function boot() {
  try { gateway=new CommercialGateway(globalThis.MP_COMMERCE_CONFIG); }
  catch(e){bootError=e; el('login-submit').disabled=true;el('config-status').textContent=t('notConfigured');}
  if(gateway)el('config-status').textContent=t('configured');
  updateStatic(); setSignedOut();
  el('login-form').addEventListener('submit',async e=>{
    e.preventDefault(); if(!gateway)return;const button=el('login-submit');button.disabled=true;alert('');
    const email=el('email').value,pass=el('password').value;el('password').value='';
    try {const access=await gateway.signIn(email,pass);const roles=gateway.getContexts();if(!roles.length)throw new CommerceError('NO_GRANTED_ROLE');await load(roles[0].role);}
    catch(err){await gateway.signOut();setSignedOut(`${t('loadError')} ${err instanceof CommerceError?err.code:''}`);}
    finally {button.disabled=false;}
  });
  document.addEventListener('click',async e=>{
    const button=e.target.closest('button');if(!button) return;
    if(button.dataset.lang){lang=button.dataset.lang;updateStatic();if(view)draw();else if(bootError)el('config-status').textContent=t('notConfigured');return;}
    if(button.dataset.role){await load(button.dataset.role);return;}
    if(button.dataset.panel){panel=button.dataset.panel;draw();return;}
    if(button.dataset.action==='refresh'&&selected){await load(selected);return;}
    if(button.dataset.action==='export'){downloadVisible();return;}
    if(button.dataset.action==='logout'){++current;await gateway?.signOut();setSignedOut();return;}
  });
  document.addEventListener('submit',e=>{if(e.target.id==='scenario'){e.preventDefault();calculate(e.target);}});
}
if (typeof document !== 'undefined') {
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
}
