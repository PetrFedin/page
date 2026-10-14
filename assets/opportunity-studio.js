import { OPPORTUNITY_COPY, PROJECT_OPPORTUNITIES } from './opportunity-copy.js';
import {
  calculateSoftwareScenario, calculateTransformationScenario,
  calculateEarlyAccessScenario, calculateCapitalScenario
} from './opportunity-economics.js';

/* Purely client-side explanations with in-memory inputs. Financial inputs are
   never copied into leads, tracking, browser storage or network requests. */
const escapeHtml = (s) => String(s).replace(/[&<>"']/g, x =>
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
const cardsHtml = rows => '<div class="op-choices">' + rows.map((r, i) =>
  '<article class="op-choice"><span class="op-index">0' + (i + 1) +
  '</span><h4>' + escapeHtml(r[0]) + '</h4><p>' + escapeHtml(r[1]) +
  '</p><p class="op-caveat">' + escapeHtml(r[2]) + '</p></article>').join('') + '</div>';

export function mountOpportunityStudio(host, language, projects, startContact, blueprints = {}) {
  if (!host || !Array.isArray(projects)) throw new TypeError('Opportunity studio needs a mount element and projects');
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
      stages + '</ol><p>' + escapeHtml(proofLabel+': '+blueprint.evidence) + '</p></aside>';
  }
  function panelHtml(mode) {
    if (mode === 'build') {
      return '<h3>' + escapeHtml(t.buildTitle) + '</h3><p class="sub">' + escapeHtml(t.buildLead) + '</p>' +
        '<div class="op-fields"><label class="op-field"><span>' + escapeHtml(t.typeLabel) +
        '</span><select data-op-input="type">' + t.buildTypes.map(([id,title])=>
          '<option value="'+escapeHtml(id)+'">'+escapeHtml(title)+'</option>').join('') +
        '</select></label>' +
        inputHtml('hours',t.hoursLabel,{min:1,max:1e7}) +
        inputHtml('hoursPerWeek',t.weeklyLabel,{min:1,max:2000}) +
        inputHtml('reusePercent',t.reuseLabel,{min:0,max:90}) + '</div>' +
        resultBlock([
          ['baselineCost',t.baseCost],['adaptedCost',t.adaptedCost],
          ['difference',t.diff],['baselineWeeks',t.baselineTime],
          ['adaptedWeeks',t.reuseTime]
        ]) + foot() +
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
        cardsHtml(t.transformStages.map((r,i)=>['0'+(i+1)+' · '+r[0],r[1],r[2]]));
    }
    if (mode === 'access') {
      return '<h3>'+escapeHtml(t.accessTitle)+'</h3><p class="sub">'+escapeHtml(t.accessLead)+'</p>' +
        cardsHtml(t.accessTiers) +
        '<h4 class="op-subhead">'+escapeHtml(lang==='ru'?'Сравнить условную льготу':'Illustrative early-access benefit')+'</h4>'+
        '<div class="op-fields">' +
        inputHtml('futureMonthlyPrice',t.accessFuture,{min:0})+
        inputHtml('discountPercent',t.accessDiscount,{min:0,max:100})+
        inputHtml('months',t.accessMonths,{min:1,max:120,step:1})+'</div>'+
        resultBlock([
          ['list',t.standardValue],['discounted',t.founderValue],['difference',t.conditionalDifference]
        ])+foot()+'<p class="op-caveat">'+escapeHtml(t.accessCaveat)+'</p>';
    }
    return '<h3>'+escapeHtml(t.capitalTitle)+'</h3><p class="sub">'+escapeHtml(t.capitalLead)+'</p>'+
      cardsHtml(t.dealPaths)+
      '<p class="op-caveat">'+escapeHtml(t.noCapTable)+'</p>'+
      '<h4 class="op-subhead">'+escapeHtml(lang==='ru'?'Модель переговорной структуры':'Illustrative equity mechanics')+'</h4>'+
      '<div class="op-fields"><label class="op-field"><span>'+escapeHtml(t.modeLabel)+
      '</span><select data-op-input="mode"><option value="primary">'+escapeHtml(t.primary)+
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
      cardsHtml(t.projectRoles.map((r,i)=>[r[0],r[1],'']))+projectPlanHtml();
  }
  const currentValues = () => {
    const vals = {};
    panel.querySelectorAll('[data-op-input]').forEach(el=>vals[el.dataset.opInput]=el.value);
    return vals;
  };
  function recalc() {
    const values = currentValues();
    drafts.set(active,values);
    let res;
    if(active==='build') res=calculateSoftwareScenario(values);
    else if(active==='transform') res=calculateTransformationScenario(values);
    else if(active==='access') res=calculateEarlyAccessScenario(values);
    else res=calculateCapitalScenario({
      mode:values.mode,assumedValuation:values.assumedValuation,
      ticket:values.ticket,founderBefore:values.founderBefore,founderMinimum:values.founderMinimum
    });
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
      build:{type:'crm',hours:'1200',hoursPerWeek:'160',reusePercent:'30'},
      transform:{manualHours:'6000',hourlyCost:'15',efficiencyPercent:'15',
        otherAnnualSavings:'0',implementationBudget:'18000',annualSupport:'3000'},
      access:{futureMonthlyPrice:'49',discountPercent:'25',months:'12'},
      capital:{mode:'primary',assumedValuation:'500000',ticket:'100000',
        founderBefore:'60',founderMinimum:'40'}
    };
    for(const [key,value] of Object.entries(examples[active]))if(get(key))get(key).value=value;
    recalc();
  }
  function contact(){
    const path = {build:['consulting','client'],transform:['consulting','client'],
      access:['partnership','pilot'],capital:['investors','investor']}[active];
    const label=t.modes.find(x=>x.id===active).title;
    const chosen = projects.find(x=>x.id===selectedProject);
    const name = chosen?.name || t.ownProject;
    // A project ID and generic subject are the ONLY things transmitted to
    // the contact form. Never pass calculated values, draft inputs or metrics.
    startContact({
      topic:path[0],route:path[1],project:chosen?.id||'',
      goal:label,
      message:(lang==='ru'?'Хочу обсудить персональный расчёт и условия: ':'I would like a tailored scope and terms for: ')+name+
        ' — '+label+'.'
    });
  }

  host.addEventListener('click',event=>{
    const tab=event.target.closest('[data-op-mode]');
    if(tab){active=tab.dataset.opMode;renderPanel();return;}
    const button=event.target.closest('[data-op-action]');
    if(!button)return;
    if(button.dataset.opAction==='example')applyExample();
    if(button.dataset.opAction==='contact')contact();
  });
  host.addEventListener('change',event=>{
    if(event.target.matches('[data-op-project]')){
      selectedProject=event.target.value;
      projectContext();
      if(active==='capital')renderPanel();
    } else if(event.target.matches('[data-op-input]'))recalc();
  });
  host.addEventListener('input',event=>{
    if(event.target.matches('[data-op-input]'))recalc();
  });
  projectContext();
  renderPanel();
}
