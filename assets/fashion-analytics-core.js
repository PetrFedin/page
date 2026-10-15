/*
 * Fashion Analytics — local, inspectable management-reporting calculations.
 * No API calls, storage, imported data collection or inferred commercial evidence.
 * Values are as supplied by the visitor; sample fixture is explicitly synthetic.
 */
export const FASHION_COLUMNS = Object.freeze([
  'period','sku','size','brand','category','supplier','store','channel','season',
  'opening_units','receipts_units','sold_units','returned_units','closing_units',
  'opening_stock_cost','receipt_cost','net_sales','cogs','closing_stock_cost',
  'purchase_budget','open_po_cost','sales_plan','markdown_value','aged_90_cost'
]);
export const FASHION_DIMENSIONS = Object.freeze([
  'category','brand','store','channel','season','supplier','size','sku'
]);
export const FASHION_ROLES = Object.freeze({
  brand:['category','channel','season','sku'],
  department:['brand','category','store','supplier'],
  store:['category','brand','size','sku'],
  distributor:['brand','channel','supplier','sku'],
  marketplace:['channel','brand','category','sku']
});
export const FASHION_VIEWS = Object.freeze(['sales','buying','stock','budget','forecast']);
const NUMERIC_COLUMNS = FASHION_COLUMNS.filter(x=>![
  'period','sku','size','brand','category','supplier','store','channel','season'
].includes(x));
const OPTIONAL_COLUMNS = new Set(['markdown_value','aged_90_cost']);
const REQUIRED = FASHION_COLUMNS.filter(x=>!OPTIONAL_COLUMNS.has(x));
const IDENTITY = ['sku','size','store','channel','period'];

export function csvRows(raw) {
  if(typeof raw!=='string') throw new TypeError('CSV must be a string');
  const value=raw.replace(/^\uFEFF/,'');
  if(value.length>2_000_000) throw new RangeError('CSV limit is 2 MB');
  const first=value.split(/\r?\n/,1)[0]||'';
  function countDelimiter(char) {
    let q=false,n=0;
    for(let i=0;i<first.length;i++){
      if(first[i]==='"') {if(q && first[i+1]==='"')i++;else q=!q;}
      else if(first[i]===char && !q)n++;
    }
    return n;
  }
  const delimiter=[';',',','\t'].sort((a,b)=>countDelimiter(b)-countDelimiter(a))[0];
  const rows=[];let row=[],field='',quoted=false;
  for(let i=0;i<value.length;i++){
    const ch=value[i];
    if(ch==='"') {
      if(quoted && value[i+1]==='"'){field+='"';i++;}
      else if(!field || quoted)quoted=!quoted;
      else field+=ch;
    } else if(!quoted && ch===delimiter) {row.push(field);field='';}
    else if(!quoted && (ch==='\r'||ch==='\n')){
      if(ch==='\r'&&value[i+1]==='\n')i++;
      row.push(field);field='';
      if(row.some(x=>x.trim()!==''))rows.push(row);
      row=[];
      if(rows.length>2502)throw new RangeError('CSV limit is 2,500 data rows');
    }else field+=ch;
  }
  if(quoted)throw new Error('Unterminated quoted CSV cell');
  row.push(field);
  if(row.some(x=>x.trim()!==''))rows.push(row);
  return rows;
}
function validMonth(v) {
  if(!/^\d{4}-(0[1-9]|1[0-2])$/.test(v))return false;
  const year=Number(v.slice(0,4));
  return year>=2000&&year<=2100;
}
function positiveOrZero(v) {return typeof v==='number' && Number.isFinite(v) && v>=0;}
function parseNumeric(input,optional) {
  if(optional && String(input??'').trim()==='')return null;
  const s=String(input??'').trim();
  if(!s || !/^(?:\d+(?:\.\d+)?|\.\d+)$/.test(s))return NaN;
  const n=Number(s);
  return Number.isFinite(n)?n:NaN;
}
function isInteger(n) {return Number.isSafeInteger(n);}
export function validateFashionRows(input) {
  if(!Array.isArray(input)||!input.length)return {ok:false,rows:[],errors:['No records were provided']};
  if(input.length>2500)return {ok:false,rows:[],errors:['Limit: 2,500 data rows']};
  const errors=[],rows=[],keys=new Set();
  for(let i=0;i<input.length;i++){
    const item=input[i]||{},row={};
    for(const k of FASHION_COLUMNS){
      if(NUMERIC_COLUMNS.includes(k)) {
        const n=parseNumeric(item[k],OPTIONAL_COLUMNS.has(k));
        row[k]=n;
        if(n===null)continue;
        if(!positiveOrZero(n))errors.push('Row '+(i+2)+': invalid nonnegative number '+k);
        if(/_units$/.test(k) && !isInteger(n))errors.push('Row '+(i+2)+': units must be integers '+k);
      }else {
        row[k]=String(item[k]??'').trim();
        if(!row[k]||row[k].length>120)errors.push('Row '+(i+2)+': missing or overlong '+k);
      }
    }
    if(!validMonth(row.period))errors.push('Row '+(i+2)+': expected period YYYY-MM');
    if(positiveOrZero(row.returned_units)&&positiveOrZero(row.sold_units)&&row.returned_units>row.sold_units)
      errors.push('Row '+(i+2)+': returns exceed gross sales');
    if(['opening_units','receipts_units','sold_units','returned_units','closing_units'].every(k=>positiveOrZero(row[k]))){
      const expected=row.opening_units+row.receipts_units-row.sold_units+row.returned_units;
      if(expected!==row.closing_units)errors.push('Row '+(i+2)+': closing units do not reconcile');
    }
    if(row.aged_90_cost!==null && positiveOrZero(row.aged_90_cost) &&
      positiveOrZero(row.closing_stock_cost) && row.aged_90_cost>row.closing_stock_cost+.001)
      errors.push('Row '+(i+2)+': stock aged 90+ exceeds closing stock cost');
    const key=IDENTITY.map(k=>row[k]).join('\x1f');
    if(keys.has(key))errors.push('Row '+(i+2)+': duplicated SKU/size/store/channel/period');
    keys.add(key);
    rows.push(row);
    if(errors.length>=30)break;
  }
  if(errors.length)return {ok:false,rows:[],errors};
  const byKey=new Map();
  for(const r of rows){
    const key=IDENTITY.slice(0,-1).map(k=>r[k]).join('\x1f');
    if(!byKey.has(key))byKey.set(key,[]);
    byKey.get(key).push(r);
  }
  for(const records of byKey.values()){
    records.sort((a,b)=>a.period.localeCompare(b.period));
    for(let j=1;j<records.length;j++){
      const previous=records[j-1],current=records[j];
      const prevMonth=Number(previous.period.slice(0,4))*12+Number(previous.period.slice(5));
      const curMonth=Number(current.period.slice(0,4))*12+Number(current.period.slice(5));
      if(curMonth-prevMonth===1 && previous.closing_units!==current.opening_units)
        errors.push('SKU '+current.sku+' / '+current.size+' / '+current.store+
          ': opening units differ from prior month closing units ('+current.period+')');
      if(errors.length>=30)break;
    }
    if(errors.length>=30)break;
  }
  return errors.length?{ok:false,rows:[],errors}:{ok:true,rows,errors:[]};
}
export function parseFashionCsv(text) {
  let grid;
  try{grid=csvRows(text);}catch(e){return {ok:false,rows:[],errors:[String(e.message||e)]};}
  if(!grid.length)return {ok:false,rows:[],errors:['CSV is empty']};
  const headers=grid[0].map(v=>v.trim().toLowerCase());
  const absent=REQUIRED.filter(x=>!headers.includes(x));
  if(absent.length)return {ok:false,rows:[],errors:['Missing required columns: '+absent.join(', ')]};
  const duplicates=headers.filter((h,i)=>headers.indexOf(h)!==i);
  if(duplicates.length)return {ok:false,rows:[],errors:['Duplicate headers: '+duplicates.join(', ')]};
  const records=grid.slice(1).map(values=>{
    const o={};for(const column of FASHION_COLUMNS){const n=headers.indexOf(column);o[column]=n<0?'':values[n]??'';}
    return o;
  });
  return validateFashionRows(records);
}
function csvCell(v) {
  if(v===null||v===undefined)return '';
  let s=String(v);
  // Protect spreadsheet consumers from arbitrary CSV formula execution.
  if(typeof v==='string' && /^[=+\-@\t\r]/.test(s))s="'"+s;
  return /[",;\r\n]/.test(s)?'"'+s.replace(/"/g,'""')+'"':s;
}
export function fashionCsv(rows) {
  return [FASHION_COLUMNS.join(';'),...rows.map(row=>FASHION_COLUMNS.map(k=>csvCell(row[k])).join(';'))].join('\r\n')+'\r\n';
}
export function fashionTemplate() {
  return fashionCsv([{
    period:'2026-09',sku:'STYLE-001',size:'M',brand:'Example Brand',
    category:'Ready-to-wear',supplier:'Example Supplier',store:'Store 01',channel:'Retail',season:'AW26',
    opening_units:10,receipts_units:5,sold_units:7,returned_units:1,closing_units:9,
    opening_stock_cost:1000,receipt_cost:500,net_sales:1200,cogs:600,
    closing_stock_cost:900,purchase_budget:1000,open_po_cost:200,sales_plan:1100,
    markdown_value:0,aged_90_cost:100
  }]);
}
export function demoFashionRows() {
  const seeds=[
    {sku:'DR-101',size:'M',brand:'Atelier A',category:'Dresses',supplier:'Supplier North',store:'Central',channel:'Retail',season:'AW26',opening:36,cost:84,price:210},
    {sku:'KT-201',size:'L',brand:'Atelier A',category:'Knitwear',supplier:'Supplier North',store:'Central',channel:'Retail',season:'AW26',opening:45,cost:63,price:155},
    {sku:'CT-301',size:'M',brand:'Studio B',category:'Outerwear',supplier:'Supplier West',store:'East',channel:'Retail',season:'AW26',opening:30,cost:140,price:350},
    {sku:'SH-401',size:'S',brand:'Studio B',category:'Footwear',supplier:'Supplier West',store:'East',channel:'Online',season:'AW26',opening:50,cost:72,price:180},
    {sku:'BG-501',size:'ONE',brand:'Line C',category:'Accessories',supplier:'Supplier East',store:'Central',channel:'Online',season:'CORE',opening:42,cost:48,price:129},
    {sku:'TR-601',size:'M',brand:'Line C',category:'Trousers',supplier:'Supplier East',store:'West',channel:'Wholesale',season:'AW26',opening:40,cost:54,price:140}
  ];
  const periods=['2026-06','2026-07','2026-08','2026-09'];
  const rows=[];
  for(let j=0;j<seeds.length;j++){
    const s=seeds[j];let opening=s.opening;
    for(let m=0;m<periods.length;m++){
      const receipts=12+((j*5+m*3)%18);
      const sold=9+((j*3+m*7)%19);
      const returned=(j+m)%5===0?1:0;
      const closing=opening+receipts-sold+returned;
      const netUnits=sold-returned;
      const discount=(m===3&&j%3===0)?.18:.06;
      const netSales=Math.round(netUnits*s.price*(1-discount)*100)/100;
      const markdownValue=Math.round(netUnits*s.price*discount*100)/100;
      rows.push({
        period:periods[m],sku:s.sku,size:s.size,brand:s.brand,category:s.category,
        supplier:s.supplier,store:s.store,channel:s.channel,season:s.season,
        opening_units:opening,receipts_units:receipts,sold_units:sold,returned_units:returned,
        closing_units:closing,opening_stock_cost:opening*s.cost,receipt_cost:receipts*s.cost,
        net_sales:netSales,cogs:netUnits*s.cost,closing_stock_cost:closing*s.cost,
        purchase_budget:2400+(j*280),open_po_cost:((j+m)%3)*s.cost*4,
        sales_plan:Math.round(netUnits*s.price*1.05*100)/100,
        markdown_value:markdownValue,aged_90_cost:j%2===0?Math.min(closing,6+j)*s.cost:0
      });
      opening=closing;
    }
  }
  return rows;
}
const sum=(rows,key)=>rows.reduce((a,r)=>a+(r[key]??0),0);
const ratio=(a,b)=>b>0?a/b:null;
const days=(month)=>{const [y,m]=month.split('-').map(Number);return new Date(Date.UTC(y,m,0)).getUTCDate();};
function metrics(rows,latestMonth) {
  const latest=rows.filter(r=>r.period===latestMonth);
  const netUnits=sum(latest,'sold_units')-sum(latest,'returned_units');
  const netSales=sum(latest,'net_sales'),cogs=sum(latest,'cogs');
  const closingUnits=sum(latest,'closing_units');
  const averageStock=(sum(latest,'opening_stock_cost')+sum(latest,'closing_stock_cost'))/2;
  const receipts=sum(latest,'receipt_cost'),po=sum(latest,'open_po_cost'),budget=sum(latest,'purchase_budget');
  const ageProvided=latest.length>0 && latest.every(x=>x.aged_90_cost!==null);
  const markdownProvided=latest.length>0 && latest.every(x=>x.markdown_value!==null);
  return {
    netUnits,netSales,cogs,grossProfit:netSales-cogs,
    grossMargin:ratio(netSales-cogs,netSales),
    openingUnits:sum(latest,'opening_units'),receiptsUnits:sum(latest,'receipts_units'),
    soldUnits:sum(latest,'sold_units'),returnedUnits:sum(latest,'returned_units'),
    closingUnits,closingCost:sum(latest,'closing_stock_cost'),
    receiptsCost:receipts,openPOCost:po,purchaseBudget:budget,otb:budget-receipts-po,
    budgetUsed:ratio(receipts+po,budget),
    salesPlan:sum(latest,'sales_plan'),
    salesPlanDelta:ratio(netSales-sum(latest,'sales_plan'),sum(latest,'sales_plan')),
    gmroi:ratio(netSales-cogs,averageStock),
    sellThrough:ratio(netUnits,sum(latest,'opening_units')+sum(latest,'receipts_units')),
    returnsRate:ratio(sum(latest,'returned_units'),sum(latest,'sold_units')),
    wos:ratio(closingUnits,netUnits/days(latestMonth)*7),
    agedCost:ageProvided?sum(latest,'aged_90_cost'):null,
    markdownValue:markdownProvided?sum(latest,'markdown_value'):null
  };
}
function nextForecast(records,latestMonth,growthPct) {
  const months=[...new Set(records.map(r=>r.period))].filter(x=>x<=latestMonth).sort().slice(-3);
  if(months.length<2)return {units:null,gap:null,months:months.length};
  const net=months.map(month=>records.filter(r=>r.period===month).reduce(
    (total,r)=>total+r.sold_units-r.returned_units,0));
  if(net.length<2 || net.every(x=>x===0))return {units:0,gap:0,months:months.length};
  const predicted=Math.max(0,Math.round(net.reduce((a,b)=>a+b,0)/net.length*(1+growthPct/100)));
  const latest=records.filter(r=>r.period===latestMonth);
  if(!latest.length)return {units:predicted,gap:null,months:months.length};
  const closing=sum(latest,'closing_units');
  return {units:predicted,gap:Math.max(0,predicted-closing),months:months.length};
}
export function buildFashionReport(rows,{
  role='brand',view='sales',groupBy, growthPct=0
}={}) {
  if(!Object.hasOwn(FASHION_ROLES,role))throw new RangeError('Unknown business role');
  if(!FASHION_VIEWS.includes(view))throw new RangeError('Unknown reporting view');
  const dimension=groupBy||FASHION_ROLES[role][0];
  if(!FASHION_DIMENSIONS.includes(dimension))throw new RangeError('Unknown reporting dimension');
  if(!Number.isFinite(growthPct)||growthPct < -50||growthPct > 100)throw new RangeError('Growth scenario -50..100%');
  const check=validateFashionRows(rows);
  if(!check.ok)return {ok:false,errors:check.errors};
  const records=check.rows;
  const months=[...new Set(records.map(r=>r.period))].sort();
  const latestMonth=months[months.length-1];
  const latestRows=records.filter(r=>r.period===latestMonth);
  const previousMonth=months.length>=2?months[months.length-2]:null;
  const previous=previousMonth?metrics(records,previousMonth):null;
  const totals=metrics(records,latestMonth);
  const overallForecast=nextForecast(records,latestMonth,growthPct);
  const groups=new Map();
  for(const r of records){
    const key=r[dimension];
    if(!groups.has(key))groups.set(key,[]);
    groups.get(key).push(r);
  }
  let groupRows=[...groups].filter(([,rr])=>rr.some(x=>x.period===latestMonth))
    .map(([name,rr])=>{
      const m=metrics(rr,latestMonth);
      const forecast=nextForecast(rr,latestMonth,growthPct);
      const warnings=[];
      if(m.otb<0)warnings.push('otb');
      if(m.grossProfit<0)warnings.push('loss');
      if(m.wos!==null&&m.wos>16)warnings.push('overstock');
      if(forecast.gap!==null&&forecast.gap>0)warnings.push('shortage');
      return {name,...m,forecast:forecast.units,forecastGap:forecast.gap,
        historyMonths:forecast.months,warnings};
    });
  const SORT={sales:'netSales',buying:'receiptsCost',stock:'closingCost',budget:'purchaseBudget',forecast:'forecast'};
  groupRows.sort((a,b)=>(b[SORT[view]]??-1)-(a[SORT[view]]??-1)||a.name.localeCompare(b.name));
  const trend=months.map(month=>{
    const s=metrics(records,month);
    return {period:month,netSales:s.netSales,receiptsCost:s.receiptsCost,
      closingCost:s.closingCost,netUnits:s.netUnits,otb:s.otb};
  });
  return {ok:true,role,view,dimension,latestMonth,previousMonth,months,trend,
    totals:{...totals,forecast:overallForecast.units,forecastGap:overallForecast.gap,
      historyMonths:overallForecast.months},
    previousSales:previous?.netSales??null,rows:groupRows,
    sampleRows:records.length,periodCount:months.length,
    methodology:{
      stock:'Closing inventory is taken from the latest selected month, never summed across months.',
      gmroi:'Monthly gross profit divided by mean opening/closing inventory at cost; not annualised.',
      wos:'Closing units divided by latest-month net units per week (calendar days / 7).',
      otb:'Purchase budget − received purchase cost − outstanding purchase-order commitments.',
      forecast:'Arithmetic mean of up to three available months of net units × scenario growth. No seasonal adjustment or lead-time promise.',
      currencies:'Amounts use the currency and VAT/net definitions supplied by the visitor; mixed currencies are not converted.'
    }};
}
