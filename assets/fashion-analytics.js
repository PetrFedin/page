import {FASHION_COLUMNS,FASHION_ROLES,FASHION_VIEWS,parseFashionCsv,fashionTemplate,demoFashionRows,buildFashionReport,fashionCsv} from './fashion-analytics-core.js';
const LANG={
ru:{title:'Fashion Analytics — управление товаром и капиталом',intro:'Единая логика отчётности для бренда, универмага, магазина, дистрибьютора и онлайн-канала. Выберите бизнес-модель, отчёт и разрез — система пересчитает показатели по исходным данным.',demo:'Демонстрационные данные · не результаты реального клиента',private:'Данные CSV обрабатываются только в браузере. Файл не отправляется на сервер и не сохраняется.',role:'Тип бизнеса',view:'Отчёт',group:'Разрез',growth:'Сценарий изменения спроса, %',import:'Загрузить CSV',template:'Шаблон CSV',export:'Экспорт отчёта CSV',reset:'Вернуть демо',error:'Ошибка данных',period:'Последний период',metrics:'Ключевые показатели',by:'Детализация',trend:'Динамика по месяцам',rules:'Методика и ограничения',more:'Открыть',less:'Закрыть',units:'шт.',na:'н/д',empty:'Недостаточно данных',examples:'Какие решения поддерживает аналитика',foot:'Интерактивный пример возможностей. Настоящие интеграции, бюджеты, прогнозы и KPI согласуются отдельно после проверки данных.',kpis:{netSales:'Продажи, нетто',grossProfit:'Валовая прибыль',grossMargin:'Валовая маржа',closingCost:'Остаток по себестоимости',receiptsCost:'Приход по себестоимости',openPOCost:'Открытые заказы',purchaseBudget:'Бюджет закупки',otb:'Свободный бюджет (OTB)',budgetUsed:'Бюджет использован',salesPlanDelta:'Отклонение от плана продаж',gmroi:'GMROI за месяц',sellThrough:'Sell-through, нетто',wos:'Запас, недель (WOS)',returnsRate:'Возвраты / проданные ед.',agedCost:'Остаток 90+ дней',markdownValue:'Уценка, сумма',forecast:'Прогноз спроса, ед.',forecastGap:'Возможный дефицит, ед.'},roles:{brand:'Бренд',department:'Универмаг / department store',store:'Магазин',distributor:'Дистрибьютор',marketplace:'Онлайн / маркетплейс'},views:{sales:'Продажи и маржа',buying:'Закупки и поставки',stock:'Остатки и оборачиваемость',budget:'Бюджет и OTB',forecast:'Прогноз и пополнение'},dimensions:{category:'Категория',brand:'Бренд',store:'Магазин',channel:'Канал',season:'Сезон',supplier:'Поставщик',size:'Размер',sku:'SKU'},examplesCopy:['Отчёт план / факт по продажам, возвратам и валовой прибыли','Матрица закупки, приход, обязательства по заказам и OTB','Запасы, недели покрытия, оборачиваемость, возраст и уценка','План-факт бюджета, прогноз по спросу и риск дефицита']},
en:{title:'Fashion Analytics — merchandise and capital control',intro:'One reporting model for brands, department stores, shops, distributors and online channels. Select your business type, report and dimension to recalculate the view.',demo:'Synthetic demonstration data · not an actual customer result',private:'CSV is processed in your browser only. No upload, server transfer or storage.',role:'Business model',view:'Report',group:'Group by',growth:'Demand scenario adjustment, %',import:'Import CSV',template:'CSV template',export:'Export report CSV',reset:'Restore demo',error:'Data validation error',period:'Latest month',metrics:'Key measures',by:'Breakdown',trend:'Monthly trend',rules:'Methodology and limitations',more:'Open',less:'Close',units:'units',na:'n/a',empty:'Insufficient data',examples:'Decisions supported by this model',foot:'Illustrative capabilities only. Production integrations, budgets, forecasting methods and KPI definitions require data validation and agreement.',kpis:{netSales:'Net sales',grossProfit:'Gross profit',grossMargin:'Gross margin',closingCost:'Closing stock at cost',receiptsCost:'Receipts at cost',openPOCost:'Open purchase orders',purchaseBudget:'Buying budget',otb:'Open-to-buy (OTB)',budgetUsed:'Budget committed',salesPlanDelta:'Sales plan variance',gmroi:'Monthly GMROI',sellThrough:'Net sell-through',wos:'Weeks of supply',returnsRate:'Returns / gross sold units',agedCost:'Stock 90+ days',markdownValue:'Markdown amount',forecast:'Demand forecast, units',forecastGap:'Potential shortfall, units'},roles:{brand:'Brand',department:'Department store',store:'Shop',distributor:'Distributor',marketplace:'Online / marketplace'},views:{sales:'Sales & margin',buying:'Buying & supply',stock:'Inventory & turnover',budget:'Budget & OTB',forecast:'Forecast & replenishment'},dimensions:{category:'Category',brand:'Brand',store:'Store',channel:'Channel',season:'Season',supplier:'Supplier',size:'Size',sku:'SKU'},examplesCopy:['Sales plan vs actual, returns and gross profit','Buying matrix, receipts, open orders and open-to-buy','Inventory, coverage, aged stock and markdown exposure','Buying budget and basic demand/shortfall scenarios']}
};
const sets={sales:['netSales','grossProfit','grossMargin','salesPlanDelta','returnsRate'],buying:['receiptsCost','openPOCost','purchaseBudget','otb','sellThrough'],stock:['closingCost','wos','gmroi','agedCost','markdownValue'],budget:['purchaseBudget','receiptsCost','openPOCost','otb','budgetUsed'],forecast:['forecast','forecastGap','sellThrough','wos','closingCost']};
const ratios=new Set(['grossMargin','salesPlanDelta','sellThrough','returnsRate','budgetUsed']);
const unitMetrics=new Set(['forecast','forecastGap']);
const escape=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function mountFashionAnalytics(node,language='ru'){
  if(!node)return;
  const t=LANG[language==='en'?'en':'ru'],locale=language==='en'?'en-US':'ru-RU',formatter=new Intl.NumberFormat(locale,{maximumFractionDigits:1});
  const format=(key,v)=>v===null||v===undefined||!Number.isFinite(v)?t.na:ratios.has(key)?formatter.format(v*100)+'%':unitMetrics.has(key)?formatter.format(v)+' '+t.units:formatter.format(v);
  let rows=demoFashionRows(),role='brand',view='sales',dimension='category',growth=0,source='demo';
  const opt=(items,labels,selected)=>items.map(x=>'<option value="'+x+'"'+(x===selected?' selected':'')+'>'+escape(labels[x]||x)+'</option>').join('');
  const dl=(body,name,type)=>{const blob=new Blob([body],{type});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;node.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),1000);};
  node.innerHTML='<div class="fa-head"><div><p class="eyebrow">FASHION ANALYTICS</p><h2 id="fashion-analytics-title">'+escape(t.title)+'</h2><p class="sub">'+escape(t.intro)+'</p></div><span class="fa-demolabel" data-fa-label>'+escape(t.demo)+'</span></div>'+
    '<div class="fa-tools"><label>'+escape(t.role)+'<select data-fa="role">'+opt(Object.keys(FASHION_ROLES),t.roles,role)+'</select></label>'+
    '<label>'+escape(t.view)+'<select data-fa="view">'+opt(FASHION_VIEWS,t.views,view)+'</select></label>'+
    '<label>'+escape(t.group)+'<select data-fa="dimension"></select></label>'+
    '<label>'+escape(t.growth)+'<input data-fa="growth" type="number" min="-50" max="100" step="1" value="0"></label></div>'+
    '<div class="fa-actions"><label class="btn fa-file">'+escape(t.import)+'<input data-fa="file" type="file" accept=".csv,text/csv" hidden></label><button type="button" class="btn" data-fa-action="template">'+escape(t.template)+'</button><button type="button" class="btn" data-fa-action="export">'+escape(t.export)+'</button><button type="button" class="btn" data-fa-action="reset">'+escape(t.reset)+'</button></div>'+
    '<p class="fa-private">'+escape(t.private)+'</p><p class="fa-errors" role="alert" data-fa-errors hidden></p>'+
    '<div data-fa-report aria-live="polite"></div><details class="fa-method"><summary>'+escape(t.rules)+'</summary><p data-fa-method></p></details>'+
    '<p class="fa-foot">'+escape(t.foot)+'</p>';
  const field=k=>node.querySelector('[data-fa="'+k+'"]');
  const render=()=>{
    field('dimension').innerHTML=opt(FASHION_ROLES[role],t.dimensions,dimension);
    const rep=buildFashionReport(rows,{role,view,groupBy:dimension,growthPct:growth});
    const out=node.querySelector('[data-fa-report]');
    if(!rep.ok){node.querySelector('[data-fa-errors]').hidden=false;node.querySelector('[data-fa-errors]').textContent=rep.errors.join(' · ');out.replaceChildren();return;}
    node.querySelector('[data-fa-errors]').hidden=true;
    const keys=sets[view],metric=k=>'<div class="fa-metric"><dt>'+escape(t.kpis[k])+'</dt><dd>'+escape(format(k,rep.totals[k]))+'</dd></div>';
    const columns=keys.slice(0,4);
    out.innerHTML='<p class="fa-period">'+escape(t.period)+': <strong>'+escape(rep.latestMonth)+'</strong> · '+rep.sampleRows+' '+escape(language==='en'?'records':'записей')+'</p>'+
      '<h3>'+escape(t.metrics)+'</h3><dl class="fa-metrics">'+keys.map(metric).join('')+'</dl>'+
      '<h3>'+escape(t.by)+' · '+escape(t.dimensions[rep.dimension])+'</h3><div class="fa-table-scroll"><table class="fa-table"><thead><tr><th scope="col">'+escape(t.dimensions[rep.dimension])+'</th>'+columns.map(k=>'<th scope="col">'+escape(t.kpis[k])+'</th>').join('')+'</tr></thead><tbody>'+
      rep.rows.map(r=>'<tr><th scope="row">'+escape(r.name)+'</th>'+columns.map(k=>'<td>'+escape(format(k,r[k]))+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>'+
      '<details class="fa-trend"><summary>'+escape(t.trend)+'</summary><div class="fa-table-scroll"><table class="fa-table"><thead><tr><th scope="col">'+escape(t.period)+'</th><th>'+escape(t.kpis.netSales)+'</th><th>'+escape(t.kpis.receiptsCost)+'</th><th>'+escape(t.kpis.closingCost)+'</th></tr></thead><tbody>'+rep.trend.map(r=>'<tr><th>'+escape(r.period)+'</th><td>'+escape(format('netSales',r.netSales))+'</td><td>'+escape(format('receiptsCost',r.receiptsCost))+'</td><td>'+escape(format('closingCost',r.closingCost))+'</td></tr>').join('')+'</tbody></table></div></details>';
    node.querySelector('[data-fa-method]').textContent=Object.values(rep.methodology).join(' ');
  };
  node.addEventListener('change',async e=>{
    const target=e.target,key=target.dataset.fa;
    if(key==='role'){role=target.value;dimension=FASHION_ROLES[role][0];render();}
    if(key==='view'){view=target.value;render();}
    if(key==='dimension'){dimension=target.value;render();}
    if(key==='growth'){const n=Number(target.value);if(target.value!==''&&Number.isFinite(n)&&n>=-50&&n<=100){growth=n;render();}}
    if(key==='file'){
      const f=target.files?.[0];if(!f)return;
      if(f.size>2000000){node.querySelector('[data-fa-errors]').hidden=false;node.querySelector('[data-fa-errors]').textContent=t.error+': 2 MB maximum';return;}
      const data=parseFashionCsv(await f.text());
      if(!data.ok){node.querySelector('[data-fa-errors]').hidden=false;node.querySelector('[data-fa-errors]').textContent=data.errors.slice(0,5).join(' · ');return;}
      rows=data.rows;source='import';node.querySelector('[data-fa-label]').textContent=language==='en'?'Local imported dataset · not uploaded':'Импортированные данные · только в браузере';render();target.value='';
    }
  });
  node.addEventListener('click',e=>{
    const btn=e.target.closest('[data-fa-action]');if(!btn)return;
    if(btn.dataset.faAction==='reset'){rows=demoFashionRows();source='demo';node.querySelector('[data-fa-label]').textContent=t.demo;render();}
    if(btn.dataset.faAction==='template')dl(fashionTemplate(),'fashion-analytics-template.csv','text/csv;charset=utf-8');
    if(btn.dataset.faAction==='export'){
      const rep=buildFashionReport(rows,{role,view,groupBy:dimension,growthPct:growth});
      if(!rep.ok)return;
      const columns=['name',...sets[view]],cells=v=>{const s=String(v??'');return '"'+s.replace(/"/g,'""')+'"';};
      const lines=[columns.join(';'),...rep.rows.map(r=>columns.map(k=>cells(r[k])).join(';'))];
      dl('\uFEFF'+lines.join('\r\n'),'fashion-report-'+rep.latestMonth+'-'+view+'.csv','text/csv;charset=utf-8');
    }
  });
  render();
}
