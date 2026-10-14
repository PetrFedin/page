/* In-browser investor what-if engine. No API, storage or asserted market inputs. */
const memory = new Map();
const keys = ["leads","conversion","churn","starting","price","variable","fixed","launch","opening","reserve"];
const required = ["leads","conversion","price","variable","fixed"];
const locale = {
  ru: {
    title:"Рассчитать экономику проекта",note:"Локальный расчёт по вашим предпосылкам. Данные не отправляются на сервер и не сохраняются. Это модель, а не обещание выручки или доходности.",
    inputTitle:"Исходные данные",currency:"Валюта расчёта",currencyInfo:"Смена обозначения валюты не пересчитывает суммы по курсу.",
    fields:["Квалифицированные лиды в месяц","Конверсия лида в нового платящего клиента, %","Ежемесячный отток платящих клиентов, %","Платящие клиенты на старте","Средняя месячная выручка на клиента","Переменные затраты на клиента в месяц","Постоянные расходы в месяц","Разовые затраты до запуска","Собственные доступные деньги на старте","Минимальный целевой денежный резерв"],
    horizon:"Горизонт, месяцев",spread:"Условный стресс, %",spreadNote:"Это выбранное вами отклонение, не рыночный прогноз. Консервативный сценарий: меньше новых клиентов, выше отток и расходы; оптимистичный — наоборот.",
    required:"Заполните лиды, конверсию, тариф, переменные и постоянные расходы — после этого появятся расчёты.",
    invalid:"Укажите неотрицательные числа; процентные показатели — от 0 до 100. Переменные и фиксированные расходы не могут быть отрицательными.",
    conservative:"Консервативный",base:"Базовый",optimistic:"Оптимистичный",funding:"Пиковая потребность во внешнем капитале",stable:"Операционная безубыточность",threshold:"Клиентов для нулевой операционной прибыли",closing:"Денежный остаток к концу периода",notReached:"не достигнута",impossible:"невозможна при такой марже",month:"мес.",customer:"клиентов",
    chartTitle:"Денежный остаток по месяцам до внешнего финансирования",tableTitle:"Помесячный расчёт",tableNote:"Ожидаемые клиенты — математическое ожидание, а не целое число подтверждённых договоров.",
    monthHead:"Месяц",customersHead:"Платящих клиентов, база",revenueHead:"Выручка, база",operatingHead:"Операционный поток, база",downHead:"Остаток, конс.",baseHead:"Остаток, база",upHead:"Остаток, опт.",
    sensTitle:"Чувствительность потребности в капитале",sensNote:"Изменяется только один фактор; остальные остаются базовыми. Значения — модельные, на том же горизонте.",
    driver:"Фактор",minus:"Снижение",plus:"Увеличение",drivers:["Конверсия","Тариф","Постоянные расходы","Отток"],
    trancheTitle:"Распределение капитала по траншам",trancheNote:"Укажите распределение в процентах. Сумма должна быть ровно 100%. До ввода процентов суммы траншей не назначаются.",percent:"Доля, %",amount:"Расчётная сумма",sumWarn:"Сумма долей должна составлять 100%.",terms:"Условие допуска к траншу",none:"Нет потребности",notice:"В модели нет налогов, инфляции, сезонности, отсрочек поступлений, финансирования долга и фактических платежей. Для инвестиционного решения требуются отдельные проверки.",
    noBreakEven:"Нет положительного вклада на клиента (тариф не превышает переменные затраты). Увеличение объёма само по себе не приведёт к операционной безубыточности."
  },
  en: {
    title:"Calculate project economics",note:"Local what-if model based on your inputs. Figures are neither sent to a server nor stored. This is not a revenue forecast or promised return.",
    inputTitle:"Model inputs",currency:"Reporting currency",currencyInfo:"Changing the displayed currency does not convert the entered values.",
    fields:["Qualified leads per month","Lead-to-paying-customer conversion, %","Monthly paying-customer churn, %","Paying customers at start","Monthly revenue per paying customer","Variable cost per customer per month","Monthly fixed operating cost","One-time prelaunch cash cost","Available own cash at start","Minimum desired cash reserve"],
    horizon:"Forecast horizon, months",spread:"Hypothetical stress, %",spreadNote:"This is your chosen deviation, not a market forecast. Downside: fewer new customers, higher churn and costs; upside reverses these effects.",
    required:"Enter leads, conversion, price, variable and fixed costs to generate the model.",
    invalid:"Use non-negative numbers. Percentage inputs must be between 0 and 100; costs cannot be negative.",
    conservative:"Conservative",base:"Base",optimistic:"Optimistic",funding:"Peak external financing requirement",stable:"Operating break-even",threshold:"Customers for zero operating profit",closing:"Closing cash balance",notReached:"not reached",impossible:"not possible at this contribution margin",month:"month",customer:"customers",
    chartTitle:"Cash balance before external financing, by month",tableTitle:"Monthly model",tableNote:"Customer counts are expected values, not verified whole-number contracts.",
    monthHead:"Month",customersHead:"Paid customers, base",revenueHead:"Revenue, base",operatingHead:"Operating cash, base",downHead:"Cash, downside",baseHead:"Cash, base",upHead:"Cash, upside",
    sensTitle:"External capital sensitivity",sensNote:"Only the specified driver changes; all other base inputs stay constant. Results use the selected horizon.",
    driver:"Driver",minus:"Decrease",plus:"Increase",drivers:["Conversion","Price","Fixed costs","Churn"],
    trancheTitle:"Capital allocation by stage",trancheNote:"Enter stage weights as percentages totalling exactly 100%. No capital amounts are allocated until you choose the weights.",percent:"Share, %",amount:"Model amount",sumWarn:"Stage weights must total 100%.",terms:"Evidence gate",none:"No external capital needed",notice:"Taxes, inflation, seasonality, cash collection delays, debt financing and actual payments are not modelled. Investment decisions require further due diligence.",
    noBreakEven:"Contribution per customer is not positive (the price does not exceed variable cost). More customers alone cannot yield operating break-even."
  }
};
function nonNegative(value){return Number.isFinite(value)&&value>=0&&value<=1e12;}
export function validateAssumptions(a){
  if(!a || !keys.every(k=>nonNegative(a[k]))) return false;
  if(a.conversion>100 || a.churn>100) return false;
  if(![12,24,36].includes(a.months)) return false;
  if(!Number.isFinite(a.spread)||a.spread<0||a.spread>50) return false;
  return true;
}
export function calculateForecast(a, scenario="base"){
  if(!validateAssumptions(a)) throw new RangeError("Invalid inputs");
  if(!["conservative","base","optimistic"].includes(scenario)) throw new RangeError("Invalid scenario");
  const direction=scenario==="conservative"?-1:scenario==="optimistic"?1:0;
  const shock=a.spread/100;
  const acquisitionFactor=1+direction*shock;
  const fixedFactor=1-direction*shock;
  const churn=Math.max(0,Math.min(1,(a.churn/100)*(1-direction*shock)));
  const fixed=a.fixed*fixedFactor;
  const contribution=a.price-a.variable;
  const requiredCustomers=contribution>0?Math.ceil(fixed/contribution):fixed===0?0:null;
  let customers=a.starting, cash=a.opening-a.launch, minCash=cash, streak=0, stableMonth=null;
  const rows=[{month:0,customers,revenue:0,operating:0,cash}];
  for(let month=1;month<=a.months;month++){
    customers=Math.max(0,customers*(1-churn)+a.leads*a.conversion/100*acquisitionFactor);
    const revenue=customers*a.price,variable=customers*a.variable;
    const operating=revenue-variable-fixed;
    cash+=operating;
    minCash=Math.min(minCash,cash);
    streak=operating>=-1e-9?streak+1:0;
    if(stableMonth===null&&streak>=3) stableMonth=month-2;
    rows.push({month,customers,revenue,operating,cash});
  }
  const funding=Math.max(0,a.reserve-minCash);
  return {scenario,rows,capitalRequired:funding,closingCash:cash,requiredCustomers,stableMonth,contribution};
}
export function runScenarios(a){
  return {
    conservative:calculateForecast(a,"conservative"),
    base:calculateForecast(a,"base"),
    optimistic:calculateForecast(a,"optimistic")
  };
}
export function capitalSensitivity(a){
  const drivers=["conversion","price","fixed","churn"];
  const rate=a.spread/100;
  return drivers.map(key=>{
    const lo={...a,[key]:Math.max(0,a[key]*(1-rate))};
    const hi={...a,[key]:Math.max(0,a[key]*(1+rate))};
    if(key==="conversion"||key==="churn") hi[key]=Math.min(100,hi[key]);
    return {driver:key,down:calculateForecast(lo).capitalRequired,up:calculateForecast(hi).capitalRequired};
  });
}
const formatNumber=(n,lang,digits=0)=>new Intl.NumberFormat(lang==="ru"?"ru-RU":"en-GB",{maximumFractionDigits:digits}).format(n);
function makeElement(tag,className,text){
 const el=document.createElement(tag);
 if(className)el.className=className;
 if(text!==undefined)el.textContent=text;
 return el;
}
function formatMoney(v,lang,currency){
 if(!Number.isFinite(v))return "—";
 const sym={RUB:"₽",USD:"$",EUR:"€"}[currency]||currency;
 return formatNumber(v,lang)+ " "+sym;
}
function makeChart(outcomes,lang){
 const svg=document.createElementNS("http://www.w3.org/2000/svg","svg");
 svg.setAttribute("viewBox","0 0 720 210");
 svg.setAttribute("role","img");
 svg.setAttribute("aria-label",locale[lang].chartTitle);
 svg.classList.add("investor-cash-chart");
 const paths=[
  ["conservative","var(--muted)","6 4"],
  ["base","var(--accent)",""],
  ["optimistic","var(--ink)",""]
 ];
 const all=paths.flatMap(([key])=>outcomes[key].rows.map(r=>r.cash));
 const min=Math.min(0,...all),max=Math.max(0,...all);
 const span=Math.max(1,max-min);
 const x=m=>40+660*m/outcomes.base.rows.length;
 const y=v=>180-155*(v-min)/span;
 const baseline=document.createElementNS("http://www.w3.org/2000/svg","line");
 baseline.setAttribute("x1",40);baseline.setAttribute("x2",700);
 baseline.setAttribute("y1",y(0));baseline.setAttribute("y2",y(0));
 baseline.setAttribute("stroke","var(--line)");baseline.setAttribute("stroke-width","1");
 svg.append(baseline);
 paths.forEach(([key,color,dash])=>{
  const el=document.createElementNS("http://www.w3.org/2000/svg","path");
  const rows=outcomes[key].rows;
  el.setAttribute("d",rows.map((r,i)=>(i?"L":"M")+(40+660*i/(rows.length-1)).toFixed(1)+" "+y(r.cash).toFixed(1)).join(" "));
  el.setAttribute("fill","none");el.setAttribute("stroke",color);el.setAttribute("stroke-width",key==="base"?"3":"2");
  if(dash)el.setAttribute("stroke-dasharray",dash);
  svg.append(el);
 });
 for(const t of [0,outcomes.base.rows.length-1]){
  const tx=document.createElementNS("http://www.w3.org/2000/svg","text");
  tx.setAttribute("x",40+660*t/(outcomes.base.rows.length-1));
  tx.setAttribute("y",202);tx.setAttribute("text-anchor",t?"end":"start");tx.setAttribute("font-size","12");tx.setAttribute("fill","var(--muted)");
  tx.textContent=String(t);svg.append(tx);
 }
 return svg;
}
function defaults(){return {leads:"",conversion:"",churn:0,starting:0,price:"",variable:"",fixed:"",launch:0,opening:0,reserve:0,months:12,spread:20,currency:"RUB",shares:["","",""]};}
export function mountInvestorCalculator(target,{lang,projectId,gateLabels=[]}){
 if(!target)throw new Error("Calculator target missing");
 const L=locale[lang]||locale.ru;
 const state=memory.get(projectId)||defaults();
 const root=makeElement("section","investor-calculator");
 const heading=makeElement("h3","",L.title);
 const intro=makeElement("p","calc-disclaimer",L.note);
 const form=makeElement("div","calc-form");
 const grid=makeElement("div","calc-input-grid");
 const items=[];
 function numberField(key,index){
  const label=makeElement("label","calc-field");
  label.append(makeElement("span","",L.fields[index]));
  const inp=document.createElement("input");
  inp.type="number";inp.step="any";inp.inputMode="decimal";inp.min="0";
  if(["conversion","churn"].includes(key))inp.max="100";
  inp.dataset.key=key;
  inp.value=state[key];
  inp.setAttribute("aria-label",L.fields[index]);
  label.append(inp);grid.append(label);items.push(inp);
 }
 keys.forEach(numberField);
 form.append(makeElement("h4","",L.inputTitle),grid);
 const row=makeElement("div","calc-controls");
 function selectField(text,options,value,name){
  const label=makeElement("label","calc-field calc-compact");
  label.append(makeElement("span","",text));
  const select=document.createElement("select");
  select.dataset.key=name;
  options.forEach(v=>{const opt=document.createElement("option");opt.value=String(v);opt.textContent=String(v);select.append(opt);});
  select.value=String(value);label.append(select);row.append(label);return select;
 }
 selectField(L.currency,["RUB","USD","EUR"],state.currency,"currency");
 selectField(L.horizon,[12,24,36],state.months,"months");
 const stress=makeElement("label","calc-field calc-compact");
 stress.append(makeElement("span","",L.spread));
 const stressInput=document.createElement("input");
 stressInput.type="number";stressInput.min="0";stressInput.max="50";stressInput.step="1";stressInput.value=state.spread;stressInput.dataset.key="spread";
 stress.append(stressInput);row.append(stress);
 form.append(row,makeElement("p","calc-hint",L.spreadNote),makeElement("p","calc-hint",L.currencyInfo));
 const results=makeElement("div","calc-results");
 const tranches=makeElement("section","calc-tranches");
 tranches.append(makeElement("h4","",L.trancheTitle),makeElement("p","calc-hint",L.trancheNote));
 const trancheRows=makeElement("div","calc-tranche-rows");
 const shareInputs=[],amountNodes=[];
 for(let i=0;i<3;i++){
  const line=makeElement("div","calc-tranche-line");
  const name=makeElement("p","",String(i+1)+". "+(gateLabels[i]||L.terms));
  const box=makeElement("label","calc-field");
  box.append(makeElement("span","",L.percent));
  const input=document.createElement("input");input.type="number";input.step="any";input.min="0";input.max="100";input.value=state.shares[i];input.setAttribute("aria-label",L.percent+" "+String(i+1));
  shareInputs.push(input);box.append(input);
  const amount=makeElement("strong","calc-tranche-amount","—");amountNodes.push(amount);
  line.append(name,box,amount);trancheRows.append(line);
 }
 const trMsg=makeElement("p","calc-hint");
 tranches.append(trancheRows,trMsg);
 root.append(heading,intro,form,results,tranches,makeElement("p","calc-disclaimer",L.notice));
 target.replaceChildren(root);
 function current(){
  const a={};
  for(const key of keys){
   const v=state[key];
   if(required.includes(key)&&(v===""||v===null||v===undefined))return null;
   a[key]=v===""?0:Number(v);
  }
  a.months=Number(state.months);a.spread=Number(state.spread);
  return a;
 }
 function redraw(){
  const a=current();
  results.replaceChildren();
  let forecasts=null;
  if(!a){results.append(makeElement("p","calc-empty",L.required));}
  else if(!validateAssumptions(a)){
   results.append(makeElement("p","calc-error",L.invalid));
  }else{
   forecasts=runScenarios(a);
   const cases=makeElement("div","calc-scenario-grid");
   for(const [key,title] of [["conservative",L.conservative],["base",L.base],["optimistic",L.optimistic]]){
    const c=forecasts[key],card=makeElement("article","calc-scenario-card");
    card.append(makeElement("h4","",title));
    for(const [label,value] of [
      [L.funding,formatMoney(c.capitalRequired,lang,state.currency)],
      [L.stable,c.stableMonth===null?L.notReached:String(c.stableMonth)+" "+L.month],
      [L.threshold,c.requiredCustomers===null?L.impossible:formatNumber(c.requiredCustomers,lang)+" "+L.customer],
      [L.closing,formatMoney(c.closingCash,lang,state.currency)]
    ]){
      const entry=makeElement("p","calc-metric");entry.append(makeElement("span","",label),makeElement("strong","",value));card.append(entry);
    }
    cases.append(card);
   }
   results.append(cases);
   if(forecasts.base.contribution<=0&&a.fixed>0)results.append(makeElement("p","calc-error",L.noBreakEven));
   const figure=makeElement("figure","calc-figure");
   figure.append(makeElement("figcaption","",L.chartTitle),makeChart(forecasts,lang));
   const legend=makeElement("p","calc-legend",L.conservative+" — "+L.base+" — "+L.optimistic);
   figure.append(legend);results.append(figure);
   const details=makeElement("details","calc-details");
   details.append(makeElement("summary","",L.tableTitle));
   details.append(makeElement("p","calc-hint",L.tableNote));
   const table=makeElement("table","project-table calc-monthly-table");
   const head=document.createElement("thead"),hr=document.createElement("tr");
   for(const name of [L.monthHead,L.customersHead,L.revenueHead,L.operatingHead,L.downHead,L.baseHead,L.upHead])hr.append(makeElement("th","",name));
   head.append(hr);table.append(head);
   const body=document.createElement("tbody");
   for(let i=0;i<=a.months;i++){
     const r=forecasts.base.rows[i],tr=document.createElement("tr");
     for(const value of [String(i),formatNumber(r.customers,lang,1),formatMoney(r.revenue,lang,state.currency),formatMoney(r.operating,lang,state.currency),formatMoney(forecasts.conservative.rows[i].cash,lang,state.currency),formatMoney(r.cash,lang,state.currency),formatMoney(forecasts.optimistic.rows[i].cash,lang,state.currency)])tr.append(makeElement("td","",value));
     body.append(tr);
   }
   table.append(body);
   const scroll=makeElement("div","calc-scroll");scroll.append(table);details.append(scroll);results.append(details);
   const sensitivity=makeElement("section","calc-sensitivity");
   sensitivity.append(makeElement("h4","",L.sensTitle),makeElement("p","calc-hint",L.sensNote));
   const stab=makeElement("table","project-table");
   const sh=document.createElement("thead"),shr=document.createElement("tr");
   [L.driver,L.minus+" "+a.spread+"%",L.plus+" "+a.spread+"%"].forEach(n=>shr.append(makeElement("th","",n)));
   sh.append(shr);stab.append(sh);
   const sb=document.createElement("tbody");
   capitalSensitivity(a).forEach((r,i)=>{
     const tr=document.createElement("tr");
     [L.drivers[i],formatMoney(r.down,lang,state.currency),formatMoney(r.up,lang,state.currency)].forEach(v=>tr.append(makeElement("td","",v)));
     sb.append(tr);
   });
   stab.append(sb);sensitivity.append(stab);results.append(sensitivity);
  }
  const present=state.shares.map(x=>x===""?NaN:Number(x));
  const total=present.reduce((s,x)=>s+x,0);
  const valid=present.every(x=>Number.isFinite(x)&&x>=0&&x<=100)&&Math.abs(total-100)<0.000001;
  for(let i=0;i<3;i++)amountNodes[i].textContent=valid&&forecasts?formatMoney(forecasts.base.capitalRequired*present[i]/100,lang,state.currency):"—";
  trMsg.textContent=state.shares.some(x=>x!=="")&&!valid?L.sumWarn:"";
 }
 function update(key,value){
  state[key]=value;
  memory.set(projectId,state);
  redraw();
 }
 grid.addEventListener("input",e=>{
  const key=e.target?.dataset?.key;
  if(key&&keys.includes(key))update(key,e.target.value);
 });
 row.addEventListener("input",e=>{
  const key=e.target?.dataset?.key;
  if(key&&["spread","currency","months"].includes(key))update(key,e.target.value);
 });
 row.addEventListener("change",e=>{
  const key=e.target?.dataset?.key;
  if(key&&["spread","currency","months"].includes(key))update(key,e.target.value);
 });
 shareInputs.forEach((inp,i)=>inp.addEventListener("input",()=>{state.shares[i]=inp.value;memory.set(projectId,state);redraw();}));
 redraw();
 return root;
}
