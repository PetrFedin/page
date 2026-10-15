/*
 * Decision support over validated monthly fashion records.
 * Classification is descriptive; never an automated purchase authorization.
 */
import {validateFashionRows} from './fashion-analytics-core.js';
const sum=(rows,key)=>rows.reduce((n,r)=>n+r[key],0);
export function analyzeFashionAssortment(input,{dimension='sku',leadWeeks=4,safetyWeeks=2,budgetLimit=null}={}){
  const valid=validateFashionRows(input);
  if(!valid.ok)return {ok:false,errors:valid.errors};
  if(!['sku','brand','category','supplier','size','channel','store','season'].includes(dimension))
    throw new RangeError('Unsupported dimension');
  if(!Number.isFinite(leadWeeks)||leadWeeks<0||leadWeeks>104||
     !Number.isFinite(safetyWeeks)||safetyWeeks<0||safetyWeeks>52)
    throw new RangeError('Invalid replenishment assumptions');
  if(budgetLimit!==null&&(!Number.isFinite(budgetLimit)||budgetLimit<0))
    throw new RangeError('Budget must be nonnegative');
  const rows=valid.rows,months=[...new Set(rows.map(r=>r.period))].sort(),latest=months.at(-1);
  const groups=new Map();
  for(const r of rows){if(!groups.has(r[dimension]))groups.set(r[dimension],[]);groups.get(r[dimension]).push(r);}
  const all=[...groups].map(([name,rr])=>{
    const monthly=months.map(p=>sum(rr.filter(r=>r.period===p),'sold_units')-
      sum(rr.filter(r=>r.period===p),'returned_units'));
    const monetary=sum(rr,'net_sales');
    const activeMonths=months.filter(p=>rr.some(r=>r.period===p));
    const latestRows=rr.filter(r=>r.period===latest);
    const soldLast=sum(latestRows,'sold_units')-sum(latestRows,'returned_units');
    const closingUnits=sum(latestRows,'closing_units');
    const closingValue=sum(latestRows,'closing_stock_cost');
    const receipts=sum(latestRows,'receipt_cost');
    const receiptedUnits=sum(latestRows,'receipts_units');
    const unitCost=receiptedUnits>0?receipts/receiptedUnits:
      closingUnits>0?closingValue/closingUnits:null;
    const avg=monthly.reduce((a,b)=>a+b,0)/monthly.length;
    const variance=monthly.reduce((a,b)=>a+(b-avg)**2,0)/monthly.length;
    const cv=avg>0?Math.sqrt(variance)/avg:null;
    // Require three consecutive full calendar months of data for XYZ.
    const recent=activeMonths.slice(-3);
    const consecutive=recent.length===3 && recent.every((p,i)=>{
      if(!i)return true;
      const [y,m]=p.split('-').map(Number),[py,pm]=recent[i-1].split('-').map(Number);
      return y*12+m===py*12+pm+1;
    });
    const xyz=consecutive&&activeMonths.length>=3&&cv!==null
      ?cv<=.5?'X':cv<=1?'Y':'Z':'N/A';
    const recentDays=latestRows.length?new Date(Date.UTC(Number(latest.slice(0,4)),Number(latest.slice(5)),0)).getUTCDate():null;
    const weekly=recentDays&&soldLast>0?soldLast/recentDays*7:null;
    const target=weekly===null?null:Math.ceil(weekly*(leadWeeks+safetyWeeks));
    const shortage=target===null?null:Math.max(0,target-closingUnits);
    const suggestedCost=shortage===null||unitCost===null?null:Math.round(shortage*unitCost*100)/100;
    const reasons=[];
    if(!consecutive)reasons.push('insufficient_history');
    if(!latestRows.length)reasons.push('no_latest_snapshot');
    if(weekly===null)reasons.push('no_recent_demand');
    if(unitCost===null)reasons.push('missing_unit_cost');
    if(xyz==='Z')reasons.push('unstable_demand');
    return {name,revenue:monetary,abc:null,xyz,cv,months:activeMonths.length,
      closingUnits,closingCost:closingValue,weekly,leadWeeks,safetyWeeks,
      suggestedUnits:shortage,suggestedCost,reasons};
  });
  // Sales-value ABC: descending contribution, including ties deterministically.
  all.sort((a,b)=>b.revenue-a.revenue||a.name.localeCompare(b.name));
  const revenue=all.reduce((n,g)=>n+g.revenue,0);
  let accum=0;
  for(const g of all){
    const before=revenue>0?accum/revenue:0;
    g.abc=revenue===0?'N/A':before<.8?'A':before<.95?'B':'C';
    g.revenueShare=revenue>0?g.revenue/revenue:null;
    accum+=g.revenue;
  }
  const candidates=all.filter(x=>x.suggestedCost!==null&&x.suggestedUnits>0);
  const candidateCost=candidates.reduce((a,b)=>a+b.suggestedCost,0);
  // Do not treat grouping of suppliers/brands/stores as an executable purchase order.
  // Budget is an informational threshold only; ranking isn't a PO allocation.
  const budgetWarning=budgetLimit===null?null:candidateCost>budgetLimit;
  return {ok:true,dimension,latestMonth:latest,revenue,groups:all,
    needsBudget:candidateCost,budgetLimit,budgetWarning,leadWeeks,safetyWeeks,
    methodology:{
      abc:'Cumulative share of all observed net sales value: A 0–80%, B 80–95%, C remainder; boundary assigned by share before group.',
      xyz:'Population CV of monthly net sold units over entire selected history; X <=0.5, Y <=1, Z >1, N/A for fewer than 3 consecutive months.',
      replenishment:'Latest month net sold units / calendar days * 7 * (lead + safety weeks), rounded up, less latest closing units.',
      caveat:'Recommendations ignore on-order units, minimum order quantities, deliveries in transit, size curves, lead-time uncertainty, seasonality, promotions and stockouts. Never place an order automatically.'
    }};
}
