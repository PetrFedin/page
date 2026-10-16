/*
 * Fashion buying budget decision support.
 * Uses only the latest validated period and an illustrative replenishment need.
 * Never allocates or authorises orders. Assumes homogeneous currency/tax basis.
 */
import {buildFashionReport} from './fashion-analytics-core.js';
import {analyzeFashionAssortment} from './fashion-assortment.js';

export function evaluateFashionBudget(rows,{
  dimension='sku',leadWeeks=4,safetyWeeks=2,reservePct=0
}={}){
  if(!Number.isFinite(reservePct)||reservePct<0||reservePct>100)
    throw new RangeError('Reserve must be between 0 and 100 percent');
  const report=buildFashionReport(rows,{groupBy:dimension});
  if(!report.ok)return report;
  const assortment=analyzeFashionAssortment(rows,{dimension,leadWeeks,safetyWeeks});
  if(!assortment.ok)return assortment;
  const {purchaseBudget,receiptsCost,openPOCost,otb}=report.totals;
  const positiveOTB=Math.max(0,otb);
  const reserved=Number((positiveOTB*reservePct/100).toFixed(2));
  const usableOTB=Number((positiveOTB-reserved).toFixed(2));
  const priced=assortment.groups.filter(g=>g.suggestedUnits>0&&g.suggestedCost!==null);
  const withoutCost=assortment.groups.filter(g=>g.suggestedUnits>0&&g.suggestedCost===null);
  const noEstimate=assortment.groups.filter(g=>g.suggestedUnits===null);
  const estimatedNeed=Number(priced.reduce((a,g)=>a+g.suggestedCost,0).toFixed(2));
  const fundingGap=Number(Math.max(0,estimatedNeed-usableOTB).toFixed(2));
  const withinBudget=estimatedNeed<=usableOTB && noEstimate.length===0 &&
    withoutCost.length===0 && otb>=0;
  let status='manual_review';
  if(noEstimate.length||withoutCost.length)status='insufficient_evidence';
  else if(otb<0)status='budget_overcommitted';
  else if(fundingGap>0)status='budget_shortfall';
  else if(estimatedNeed===0)status='no_detected_shortfall';
  const confidence=assortment.groups.every(x=>x.reasons.length===0)
    ?'limited_model':'review_required';
  return {
    ok:true,latestMonth:report.latestMonth,dimension,leadWeeks,safetyWeeks,reservePct,
    purchaseBudget,receiptsCost,openPOCost,otb,reserved,usableOTB,
    estimatedNeed,fundingGap,withinBudget,status,confidence,
    candidateCount:priced.length,
    missingCostCount:withoutCost.length,
    missingEstimateCount:noEstimate.length,
    groupedRows:assortment.groups.map(g=>({
      name:g.name,abc:g.abc,xyz:g.xyz,
      suggestedUnits:g.suggestedUnits,suggestedCost:g.suggestedCost,
      flags:g.reasons
    })),
    methodology:{
      otb:'Latest month budget less receipt cost and open purchase-order commitments. Never sum budget snapshots across months.',
      reserve:'Scenario reserve percentage applies to positive OTB, not full purchase budget.',
      need:'Illustrative replenishment quantity multiplied by the latest available average unit cost; excludes any unpriceable rows.',
      gap:'Estimated priced replenishment cost less usable OTB, floored at zero.',
      limitations:'All monetary data must share currency and VAT basis. PO value is deducted financially, but in-transit/on-order units, MOQ, size curves, markdown, promotions, stockouts, seasonality and lead-time variability are not modelled.',
      authority:'No supplier commitment or purchasing approval is generated. A buyer must validate every recommendation.'
    }
  };
}
