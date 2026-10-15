import { OPPORTUNITY_COPY, PROJECT_OPPORTUNITIES } from './opportunity-copy.js';
import {
  calculateSoftwareScenario, calculateSoftwareTCO, calculateTransformationScenario,
  calculateEarlyAccessScenario, calculateCapitalScenario
} from './opportunity-economics.js';

/* Purely client-side explanations with in-memory inputs. Financial inputs are
   never copied into leads, tracking, browser storage or network requests. */
const escapeHtml = (s) => String(s ?? '').replace(/[&<>"']/g, x =>
  ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
const inputHtml = (key, label, opts = {}) =>
  '<label class="op-field"><span>' + escapeHtml(label) + '</span><input data-op-input="' +
  key + '" type="number" inputmode="decimal" autocomplete="off" min="' + (opts.min ?? 0) +
  '" max="' + (opts.max ?? 1e12) + '" step="' + (opts.step ?? 'any') +
  '" placeholder="' + escapeHtml(opts.placeholder ?? '—') + '"></label>';
const metricHtml = (key, label) =>
  '<div class="op-metric"><dt>' + escapeHtml(label) +
  '</dt><dd data-op-result="' + key + '">—</dd></div>';
const rowsHtml = rows => '<ol class="op-steps">' + rows.map(row =>
  '<li><span class="op-step-index">' + escapeHtml(row[0]) +
  '</span><div><h4>' + escapeHtml(row[1]) + '</h4><p>' +
  escapeHtml(row[2] || '') + '</p></div></li>').join('') + '</ol>';
/** Preserve all substantive terms of each offer, including optional fourth-column
 * restrictions. Never render missing values as literal "undefined". */
export function renderOpportunityCards(rows) {
  if (!Array.isArray(rows)) throw new TypeError('Card rows must be an array');
  return '<div class="op-choices">' + rows.map((row, index) => {
    if (!Array.isArray(row) || typeof row[0] !== 'string' || !row[0].trim())
      throw new TypeError('Each card needs a non-empty title');
    const paragraphs = row.slice(1).filter(v=>typeof v==='string' && v.trim()!=='');
    return '<article class="op-choice"><span class="op-index">' +
      String(index + 1).padStart(2,'0') + '</span><h4>' +
      escapeHtml(row[0]) + '</h4>' + paragraphs.map((item,i)=>
        '<p' + (i?' class="op-caveat"':'') + '>' +
        escapeHtml(item) + '</p>').join('') + '</article>';
  }).join('') + '</div>';
}
const cardsHtml = renderOpportunityCards;
export const EARLY_ACCESS_IDS = Object.freeze([
  'explore', 'design-partner', 'founding-customer', 'post-launch'
]);

/** Allowlisted qualitative request: never reads or serializes any finance inputs. */
export function buildOpportunityRequest({
  mode, language='ru', projectId='own', projects=[],
  softwareType='', capitalMode='', accessTier=''
}={}) {
  const lang=language==='en'?'en':'ru';
  const copy=OPPORTUNITY_COPY[lang];
  const selectedMode=copy.modes.find(item=>item.id===mode);
  if(!selectedMode || !Array.isArray(projects))return null;
  const selectedProject=projects.find(item=>item.id===projectId);
  const routes={
    build:['consulting','client'],transform:['consulting','client'],
    access:['partnership','pilot'],capital:['investors','investor']
  };
  if(!Object.hasOwn(routes,mode))return null;
  let detail='';
  if(mode==='build')detail=copy.buildTypes.find(x=>x[0]===softwareType)?.[1]||'';
  if(mode==='capital' && ['primary','secondary'].includes(capitalMode))detail=copy[capitalMode];
  const tierIndex=EARLY_ACCESS_IDS.indexOf(accessTier);
  if(mode==='access' && tierIndex>=0)detail=copy.accessTiers[tierIndex][0];
  const subject=[selectedMode.title,detail].filter(Boolean).join(' · ');
  const prefix=lang==='ru'?'Хочу обсудить персональный расчёт и условия: ':
    'I would like a tailored scope and terms for: ';
  return {
    topic:routes[mode][0],route:routes[mode][1],
    project:selectedProject?.id||'',goal:subject.slice(0,150),
    message:prefix+(selectedProject?.name||copy.ownProject)+' — '+subject+'.'
  };
}

export function mountOpportunityStudio(host, language, projects, startContact, blueprints = {}, openProjectEconomics = () => {}) {
  if (!host || !Array.isArray(projects)) throw new TypeError('Opportunity studio needs a mount element and projects');
  // The parent V2 render runs again on RU/EN toggle. Aborting old delegated
  // listeners prevents duplicate form navigations or stale-language handlers.
  host.__opportunityController?.abort();
  const controller = new AbortController();
  host.__opportunityController = controller;
  const lang = language === 'en' ? 'en' : 'ru';
  const t = OPPORTUNITY_COPY[lang];
  const money = new Intl.NumberFormat(lang==='ru'?'ru-RU':'en-US', {
    style:'currency', currency:'USD', maximumFractionDigits:0
  });
  const number = new Intl.NumberFormat(lang==='ru'?'ru-RU':'en-US', { maximumFractionDigits:1 });
  const percent = new Intl.NumberFormat(lang==='ru'?'ru-RU':'en-US', { maximumFractionDigits:2 });
  const get = (key) => host.querySelector('[data-op-input="' + key + '"]');
  const output = (key) => host.querySelector('[data-op-result="' + key + '"]');
  const quote = n => money.format(n);
  const count = n => number.format(n);
  const buttons = t.modes.map(m =>
    '<button type="button" class="op-mode" data-op-mode="' + escapeHtml(m.id) +
    '" aria-pressed="false"><span>' + escapeHtml(m.title) +
    '</span><small>' + escapeHtml(m.desc) + '</small></button>').join('');
  const projectOptions = '<option value="own">' + escapeHtml(t.ownProject) + '</option>' +
    projects.map(p => '<option value="' + escapeHtml(p.id) + '">' +
    escapeHtml(p.name) + '</option>').join('');
  host.innerHTML = [
    '<header class="section-head op-heading">',
      '<p class="eyebrow">' + escapeHtml(t.eyebrow) + '</p>',
      '<h2 id="opportunities-title">' + escapeHtml(t.title) + '</h2>',
      '<p class="sub">' + escapeHtml(t.lead) + '</p>',
    '</header>',
    '<div class="op-modes" role="group" aria-label="' + escapeHtml(t.title) + '">' + buttons + '</div>',
    '<div class="op-project-select"><label class="op-field"><span>' + escapeHtml(t.projectLabel) +
      '</span><select data-op-project>' + projectOptions + '</select></label>',
      '<div class="op-project-context" data-op-project-context role="status"></div></div>',
    '<div data-op-panel class="op-panel"></div>',
    '<p class="op-disclaimer">' + escapeHtml(t.disclaimer) + '</p>'
  ].join('');

  const panel = host.querySelector('[data-op-panel]');
  let active = 'build';
  let selectedProject = 'own';
  // In-memory only: switching tabs preserves the provisional calculation
  // without persisting any user data to storage.
  const drafts = new Map();
  const financialFields = new Set([
    'hours','hoursPerWeek','reusePercent','manualHours','hourlyCost',
    'efficiencyPercent','otherAnnualSavings','implementationBudget',
    'annualSupport','futureMonthlyPrice','discountPercent','months',
    'assumedValuation','ticket','founderBefore','founderMinimum',
    'horizonMonths','customOneTime','customMonthly','reuseOneTime',
    'reuseMonthly','reuseLicenseMonthly','saasOneTime','saasMonthlyPlatform',
    'saasUsers','saasMonthlySeat','saasMonthlyOperations'
  ]);
  const updateUnsavedFlag = () => {
    const hasNumbers = [...drafts.values()].some(values =>
      Object.entries(values).some(([key, val]) =>
        financialFields.has(key) && String(val).trim() !== ''));
    // Only a Boolean is exposed to the outer page; no amount leaves the module.
    host.dataset.opportunityHasUnsavedInputs = String(hasNumbers);
  };

  function projectContext() {
    const el = host.querySelector('[data-op-project-context]');
    const p = projects.find(x => x.id === selectedProject);
    if (!p) { el.textContent = t.projectStatus; return; }
    const desc = PROJECT_OPPORTUNITIES[p.id]?.[lang] || '';
    const stage = p[lang]?.stage || '';
    el.textContent = [desc, stage, t.projectStatus].filter(Boolean).join(' · ');
  }
  function foot() {
    return '<div class="op-actions"><button class="btn" type="button" data-op-action="example">' +
      escapeHtml(lang==='ru'?'Учебный пример':'Hypothetical example') +
      '</button><button class="btn btn-primary" type="button" data-op-action="contact">' +
      escapeHtml(t.ctaDetailed) + '</button></div>';
  }
  function resultBlock(metrics) {
    return '<p class="op-input-hint">' + escapeHtml(t.inputHint) + '</p>' +
      '<p data-op-status class="op-status" role="status" aria-live="polite">' + escapeHtml(t.empty) + '</p>' +
      '<dl class="op-metrics" data-op-metrics hidden>' +
      metrics.map(m=>metricHtml(...m)).join('')+'</dl>';
  }
  function projectPlanHtml() {
    const blueprint = blueprints[selectedProject]?.[lang];
    if (!blueprint) return '';
    const header = lang === 'ru'
      ? 'План финансируемых этапов выбранного проекта'
      : 'Project-specific, milestone-funded roadmap';
    const stages = (blueprint.tranches || []).map((item,i)=>
      '<li>' + escapeHtml(String(i+1)+'. '+item) + '</li>').join('');
    const modelLabel = lang === 'ru' ? 'Возможная модель выручки' : 'Possible revenue model';
    const proofLabel = lang === 'ru' ? 'Что понадобится подтвердить' : 'Evidence required';
    return '<aside class="op-project-plan"><h4>' + escapeHtml(header) + '</h4>' +
      '<p>' + escapeHtml(modelLabel+': '+blueprint.revenue) + '</p><ol>' +
      stages + '</ol><p>' + escapeHtml(proofLabel+': '+blueprint.evidence) + '</p>' +
      '<button type="button" class="btn" data-op-action="project-economics">' +
        escapeHtml(lang==='ru'?'Открыть расширенную финансовую модель проекта':
          'Open the detailed project finance model')+'</button></aside>';
  }
  function tcoHtml(){
    const entries=[
      ['horizonMonths',t.tcoHorizon,1,120],
      ['customOneTime',t.tcoCustomOnce,0,1e9],['customMonthly',t.tcoCustomMonthly,0,1e9],
      ['reuseOneTime',t.tcoReuseOnce,0,1e9],['reuseMonthly',t.tcoReuseMonthly,0,1e9],
      ['reuseLicenseMonthly',t.tcoReuseLicense,0,1e9],['saasOneTime',t.tcoSaasOnce,0,1e9],
      ['saasMonthlyPlatform',t.tcoSaasPlatform,0,1e9],['saasUsers',t.tcoSaasUsers,0,100000],
      ['saasMonthlySeat',t.tcoSaasSeat,0,1e9],['saasMonthlyOperations',t.tcoSaasOps,0,1e9]
    ];
    return '<section class="op-tco" aria-label="'+escapeHtml(t.tcoTitle)+'">' +
      '<h4 class="op-subhead">'+escapeHtml(t.tcoTitle)+'</h4>' +
      '<p class="op-caveat">'+escapeHtml(t.tcoLead)+'</p><div class="op-fields">' +
      entries.map(([key,label,min,max])=>inputHtml(key,label,{min,max,step:key==='horizonMonths'||key==='saasUsers'?1:'any'})).join('') +
      '</div><dl class="op-metrics" data-op-tco-results hidden>' +
      metricHtml('tcoCustom',t.tcoCustom)+metricHtml('tcoReuse',t.tcoReuse)+
      metricHtml('tcoSaas',t.tcoSaas)+'</dl>' +
      '<p class="op-caveat" data-op-tco-crossings hidden role="status"></p>' +
      '<p class="op-caveat">'+escapeHtml(t.tcoWarning)+'</p></section>';
  }
  function panelHtml(mode) {
    if (mode === 'build') {
      return '<h3>' + escapeHtml(t.buildTitle) + '</h3><p class="sub">' + escapeHtml(t.buildLead) + '</p>' +
        '<div class="op-fields"><label class="op-field"><span>' + escapeHtml(t.typeLabel) +
        '</span><select data-op-input="type"><option value="">'+
          escapeHtml(lang==='ru'?'Выберите направление':'Choose a solution type')+'</option>' +
          t.buildTypes.map(([id,title])=>
          '<option value="'+escapeHtml(id)+'">'+escapeHtml(title)+'</option>').join('') +
        '</select></label>' +
        inputHtml('hours',t.hoursLabel,{min:1,max:1e7}) +
        inputHtml('hoursPerWeek',t.weeklyLabel,{min:1,max:2000}) +
        inputHtml('reusePercent',t.reuseLabel,{min:0,max:90}) + '</div>' +
        resultBlock([
          ['baselineCost',t.baseCost],['adaptedCost',t.adaptedCost],
          ['difference',t.diff],['baselineWeeks',t.baselineTime],
          ['adaptedWeeks',t.reuseTime]
        ]) + tcoHtml() + foot() +
        '<p class="op-caveat">'+escapeHtml(t.buildCaveat)+'</p>' +
        '<h4 class="op-subhead">'+escapeHtml(t.workflowTitle)+'</h4>' +
        rowsHtml(t.workflow) +
        '<h4 class="op-subhead">'+escapeHtml(t.samplesTitle)+'</h4>' +
        '<p class="op-caveat">'+escapeHtml(t.sampleNote)+'</p>' +
        '<ul class="op-sources">'+t.samples.map(([brand,amount,url])=>
          '<li><a href="'+escapeHtml(url)+'" rel="noopener noreferrer" target="_blank">'+
          escapeHtml(brand)+'</a><span>'+escapeHtml(amount)+'</span></li>').join('')+'</ul>' +
        '<p class="op-caveat"><a href="https://clutch.co/developers/pricing" rel="noopener noreferrer" target="_blank">Clutch — Software Development Pricing Guide (2026)</a>. '+escapeHtml(t.benchmark)+'</p>' +
        '<p class="op-caveat">'+escapeHtml(t.notQuoted)+'</p>';
    }
    if (mode === 'transform') {
      return '<h3>'+escapeHtml(t.transformTitle)+'</h3><p class="sub">'+escapeHtml(t.transformLead)+'</p>' +
        '<div class="op-fields">' +
        inputHtml('manualHours',t.annualHours,{min:0,max:1e7}) +
        inputHtml('hourlyCost',t.costHour,{min:0}) +
        inputHtml('efficiencyPercent',t.reduction,{min:0,max:100}) +
        inputHtml('otherAnnualSavings',t.nonLabor,{min:0}) +
        inputHtml('implementationBudget',t.implementation,{min:0}) +
        inputHtml('annualSupport',t.support,{min:0}) +
        '</div>' + resultBlock([
          ['currentLabor',t.currentLabor],['gross',t.annualGross],
          ['annualNet',t.annualNet],['payback',t.payback]
        ]) + foot() + '<p class="op-caveat">'+escapeHtml(t.transformCaveat)+'</p>' +
        '<h4 class="op-subhead">'+escapeHtml(t.workflowTitle)+'</h4>' +
        cardsHtml(t.transformStages);
    }
    if (mode === 'access') {
      return '<h3>'+escapeHtml(t.accessTitle)+'</h3><p class="sub">'+escapeHtml(t.accessLead)+'</p>' +
        cardsHtml(t.accessTiers) +
        '<div class="op-fields"><label class="op-field"><span>' +
        escapeHtml(lang==='ru'?'Формат раннего участия':'Early participation format') +
        '</span><select data-op-input="accessTier"><option value="">' +
        escapeHtml(lang==='ru'?'Выберите формат':'Choose participation format') +
        '</option>' + EARLY_ACCESS_IDS.map((id,i)=>'<option value="'+id+'">'+
          escapeHtml(t.accessTiers[i][0])+'</option>').join('') +
        '</select></label></div>' +
        '<p class="op-caveat">'+escapeHtml(lang==='ru'?'Расчёт возможной льготы показан только для Founding Customer; это не утверждённая цена и не предложение оплаты.':'A hypothetical discount is modelled only for Founding Customer; no price or payment offer is approved.')+'</p>' +
        '<div data-op-access-estimator hidden>' +
        '<h4 class="op-subhead">'+escapeHtml(lang==='ru'?'Сравнить условную льготу':'Illustrative early-access benefit')+'</h4>'+
        '<div class="op-fields">' +
        inputHtml('futureMonthlyPrice',t.accessFuture,{min:0})+
        inputHtml('discountPercent',t.accessDiscount,{min:0,max:100})+
        inputHtml('months',t.accessMonths,{min:1,max:120,step:1})+'</div>'+
        resultBlock([
          ['list',t.standardValue],['discounted',t.founderValue],['difference',t.conditionalDifference]
        ])+'</div>'+foot()+'<p class="op-caveat">'+escapeHtml(t.accessCaveat)+'</p>';
    }
    return '<h3>'+escapeHtml(t.capitalTitle)+'</h3><p class="sub">'+escapeHtml(t.capitalLead)+'</p>'+
      cardsHtml(t.dealPaths)+
      '<p class="op-caveat">'+escapeHtml(t.noCapTable)+'</p>'+
      '<h4 class="op-subhead">'+escapeHtml(lang==='ru'?'Модель переговорной структуры':'Illustrative equity mechanics')+'</h4>'+
      '<div class="op-fields"><label class="op-field"><span>'+escapeHtml(t.modeLabel)+
      '</span><select data-op-input="mode"><option value="">'+
      escapeHtml(lang==='ru'?'Выберите тип сделки':'Choose transaction type')+
      '</option><option value="primary">'+escapeHtml(t.primary)+
      '</option><option value="secondary">'+escapeHtml(t.secondary)+'</option></select></label>'+
      inputHtml('assumedValuation',t.preMoney,{min:1})+
      inputHtml('ticket',t.investAmount,{min:1})+
      inputHtml('founderBefore',t.founderPercent,{min:0,max:100})+
      inputHtml('founderMinimum',lang==='ru'?'Минимум основателя после сделки, % (необязательно)':'Founder retention floor after the round, % (optional)',{min:0,max:100})+
      '</div>'+resultBlock([
        ['post',t.postMoney],['investor',t.investorShare],
        ['founder',t.founderPost],['company',t.companyInflow],
        ['retention',lang==='ru'?'Сохранение минимальной доли':'Founder ownership floor']
      ])+foot()+
      '<p class="op-caveat">'+escapeHtml(t.secondaryNote)+'</p>'+
      '<p class="op-caveat">'+escapeHtml(t.financingNote)+'</p>'+
      '<h4 class="op-subhead">'+escapeHtml(t.useFunds)+'</h4>'+cardsHtml(t.capitalSteps)+
      '<h4 class="op-subhead">'+escapeHtml(t.needsTitle)+'</h4>'+
      cardsHtml(t.projectRoles)+projectPlanHtml();
  }
  const currentValues = () => {
    const vals = {};
    panel.querySelectorAll('[data-op-input]').forEach(el=>vals[el.dataset.opInput]=el.value);
    return vals;
  };
  function recalc() {
    const values = currentValues();
    drafts.set(active,values);
    updateUnsavedFlag();
    if(active==='access'){
      const estimator=panel.querySelector('[data-op-access-estimator]');
      if(estimator) estimator.hidden=values.accessTier!=='founding-customer';
    }
    let res;
    if(active==='build') res=calculateSoftwareScenario(values);
    else if(active==='transform') res=calculateTransformationScenario(values);
    else if(active==='access') res=calculateEarlyAccessScenario(values);
    else res=calculateCapitalScenario({
      mode:values.mode,assumedValuation:values.assumedValuation,
      ticket:values.ticket,founderBefore:values.founderBefore,founderMinimum:values.founderMinimum
    });
    if(active==='build'){
      const tcoNode=panel.querySelector('[data-op-tco-results]');
      const tco=calculateSoftwareTCO(values);
      const crossingNote=panel.querySelector('[data-op-tco-crossings]');
      if(crossingNote)crossingNote.hidden=!tco.ok;
      if(tco.ok && crossingNote){
        const format=(x)=>{
          if(x.status==='crossed')return String(x.month)+(lang==='ru'?' мес.':' months');
          if(x.status==='same_cost')return lang==='ru'?'одинаковая стоимость':'same costs';
          if(x.status==='equal_initial')return lang==='ru'?'равны в начале':'equal initially';
          return lang==='ru'?'нет пересечения за период':'no crossing in selected horizon';
        };
        crossingNote.textContent=(lang==='ru'?'Первое пересечение накопленных затрат с SaaS (нижняя/верхняя граница): разработка — ':'First cumulative cost crossing vs SaaS (lower/upper estimate): custom — ')+
          format(tco.crossings.customLow)+' / '+format(tco.crossings.customHigh)+
          (lang==='ru'?'; адаптация — ':'; adaptation — ')+
          format(tco.crossings.reuseLow)+' / '+format(tco.crossings.reuseHigh)+
          (lang==='ru'?'. Пересечение может означать и потерю преимущества; сравнивайте итоговые суммы.':'. Crossing may also mean costs become higher; compare total amounts.');
      }
      if(tcoNode){
        tcoNode.hidden=!tco.ok;
        if(tco.ok){
          const formatRange=(x)=>quote(x.totalLow)+' — '+quote(x.totalHigh);
          const amounts={
            tcoCustom:formatRange(tco.custom),
            tcoReuse:formatRange(tco.reuse),
            tcoSaas:quote(tco.saas.total)
          };
          for(const [key,value] of Object.entries(amounts)){
            const cell=tcoNode.querySelector('[data-op-result="'+key+'"]');
            if(cell)cell.textContent=value;
          }
        }
      }
    }
    const metrics=panel.querySelector('[data-op-metrics]');
    const status=panel.querySelector('[data-op-status]');
    if(!res.ok) {
      metrics.hidden=true;
      status.textContent=t.empty;
      return;
    }
    metrics.hidden=false;
    status.textContent=t.report;
    const set = (key,val)=>{if(output(key))output(key).textContent=val;};
    if(active==='build'){
      set('baselineCost',quote(res.costLow)+' — '+quote(res.costHigh));
      set('adaptedCost',quote(res.adaptedLow)+' — '+quote(res.adaptedHigh));
      set('difference',quote(res.differenceLow)+' — '+quote(res.differenceHigh));
      set('baselineWeeks',count(res.baselineWeeks)+' '+t.weeks);
      set('adaptedWeeks',count(res.adaptedWeeks)+' '+t.weeks);
    } else if(active==='transform'){
      set('currentLabor',quote(res.baselineLabor));
      set('gross',quote(res.grossAnnual));
      set('annualNet',quote(res.netAnnual));
      set('payback',res.breakEvenYears===null?t.paybackNone:count(res.breakEvenYears)+(lang==='ru'?' лет':' years'));
    } else if(active==='access'){
      set('list',quote(res.list));
      set('discounted',quote(res.discounted));
      set('difference',quote(res.hypotheticalDifference));
    } else {
      set('post',res.postMoney===null?'—':quote(res.postMoney));
      set('investor',percent.format(res.investorPercent)+'%');
      set('founder',res.founderAfter===null?'—':percent.format(res.founderAfter)+'%');
      set('company',quote(res.companyProceeds));
      set('retention',res.founderFloorPass===null?'—':res.founderFloorPass
        ?(lang==='ru'?'Соблюдается в модели':'Meets assumed floor')
        :(lang==='ru'?'Нарушается в модели':'Below assumed floor'));
    }
  }
  function renderPanel() {
    panel.innerHTML=panelHtml(active);
    for(const button of host.querySelectorAll('[data-op-mode]')){
      const isCurrent=button.dataset.opMode===active;
      button.setAttribute('aria-pressed',String(isCurrent));
    }
    const draft=drafts.get(active);
    if(draft)for(const input of panel.querySelectorAll('[data-op-input]')){
      if(Object.hasOwn(draft,input.dataset.opInput))input.value=draft[input.dataset.opInput];
    }
    recalc();
  }
  function applyExample(){
    const examples = {
      build:{type:'crm',hours:'1200',hoursPerWeek:'160',reusePercent:'30',
        horizonMonths:'36',customOneTime:'4000',customMonthly:'550',
        reuseOneTime:'6500',reuseMonthly:'250',reuseLicenseMonthly:'200',
        saasOneTime:'7000',saasMonthlyPlatform:'120',saasUsers:'20',
        saasMonthlySeat:'25',saasMonthlyOperations:'250'},
      transform:{manualHours:'6000',hourlyCost:'15',efficiencyPercent:'15',
        otherAnnualSavings:'0',implementationBudget:'18000',annualSupport:'3000'},
      access:{accessTier:'founding-customer',futureMonthlyPrice:'49',discountPercent:'25',months:'12'},
      capital:{mode:'primary',assumedValuation:'500000',ticket:'100000',
        founderBefore:'60',founderMinimum:'40'}
    };
    for(const [key,value] of Object.entries(examples[active]))if(get(key))get(key).value=value;
    recalc();
  }
  function contact(){
    // The contact process receives route, project and qualitative scope only.
    const request=buildOpportunityRequest({
      mode:active,language:lang,projectId:selectedProject,projects,
      softwareType:get('type')?.value||'',capitalMode:get('mode')?.value||'',
      accessTier:get('accessTier')?.value||''
    });
    if(request)startContact(request);
  }

  host.addEventListener('click',event=>{
    const tab=event.target.closest('[data-op-mode]');
    if(tab){active=tab.dataset.opMode;renderPanel();return;}
    const button=event.target.closest('[data-op-action]');
    if(!button)return;
    if(button.dataset.opAction==='example')applyExample();
    if(button.dataset.opAction==='contact')contact();
    if(button.dataset.opAction==='project-economics' &&
      blueprints[selectedProject]?.[lang]) openProjectEconomics(selectedProject);
  },{signal:controller.signal});
  host.addEventListener('change',event=>{
    if(event.target.matches('[data-op-project]')){
      selectedProject=event.target.value;
      projectContext();
      if(active==='capital')renderPanel();
    } else if(event.target.matches('[data-op-input]'))recalc();
  },{signal:controller.signal});
  host.addEventListener('input',event=>{
    if(event.target.matches('[data-op-input]'))recalc();
  },{signal:controller.signal});
  projectContext();
  renderPanel();
}
