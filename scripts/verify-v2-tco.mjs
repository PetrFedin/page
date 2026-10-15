#!/usr/bin/env node
import assert from 'node:assert/strict';
import {calculateSoftwareTCO,findTCOMonthCrossing,calculateTCOTimeline} from '../assets/opportunity-economics.js';
import {OPPORTUNITY_COPY} from '../assets/opportunity-copy.js';
const x={
  hours:1200,hoursPerWeek:160,reusePercent:30,horizonMonths:36,
  customOneTime:4000,customMonthly:550,
  reuseOneTime:6500,reuseMonthly:250,reuseLicenseMonthly:200,
  saasOneTime:7000,saasMonthlyPlatform:120,saasUsers:20,
  saasMonthlySeat:25,saasMonthlyOperations:250
};
const a=calculateSoftwareTCO(x);
assert.equal(a.ok,true);
assert.equal(a.custom.totalLow,30000+4000+550*36);
assert.equal(a.custom.totalHigh,58800+4000+550*36);
assert.equal(a.reuse.totalLow,21000+6500+(250+200)*36);
assert.equal(a.reuse.totalHigh,41160+6500+(250+200)*36);
assert.equal(a.saas.total,7000+(120+20*25+250)*36);
assert.equal(a.assumption,'undiscounted_usd_cost_only_no_feature_parity');
const timeline=calculateTCOTimeline(a);
assert.equal(timeline.ok,true);
assert.deepEqual(timeline.months,[0,12,24,36]);
assert.equal(timeline.rows[0].customLow,a.custom.upfrontLow);
assert.equal(timeline.rows[0].saas,a.saas.upfront);
assert.equal(timeline.rows.at(-1).customHigh,a.custom.totalHigh);
assert.equal(timeline.rows.at(-1).reuseLow,a.reuse.totalLow);
assert.equal(timeline.rows.at(-1).saas,a.saas.total);
assert.deepEqual(calculateTCOTimeline({...a,horizonMonths:13}).months,[0,12,13]);
assert.deepEqual(calculateTCOTimeline({...a,horizonMonths:1}).months,[0,1]);
assert.equal(calculateTCOTimeline({...a,saas:{...a.saas,monthly:NaN}}).ok,false);
assert.equal(calculateTCOTimeline(a,0).ok,false);
assert.equal(a.crossings.customLow.status,'beyond_horizon');
assert.equal(a.crossings.customHigh.status,'beyond_horizon');
assert.equal(a.crossings.reuseLow.status,'beyond_horizon');
assert.equal(a.crossings.reuseLow.month,null);
assert.equal(a.crossings.reuseHigh.status,'beyond_horizon');
for(const [input,status,month,direction] of [
  [{alternativeUpfront:1000,alternativeMonthly:10,saasUpfront:0,saasMonthly:110,horizonMonths:12},'crossed',10,'alternative_lower'],
  [{alternativeUpfront:0,alternativeMonthly:120,saasUpfront:1000,saasMonthly:20,horizonMonths:12},'crossed',10,'saas_lower'],
  [{alternativeUpfront:500,alternativeMonthly:100,saasUpfront:0,saasMonthly:50,horizonMonths:24},'no_crossing',null,'saas_lower'],
  [{alternativeUpfront:0,alternativeMonthly:20,saasUpfront:500,saasMonthly:100,horizonMonths:24},'no_crossing',null,'alternative_lower'],
  [{alternativeUpfront:1000,alternativeMonthly:10,saasUpfront:0,saasMonthly:110,horizonMonths:9},'beyond_horizon',null,'saas_lower'],
  [{alternativeUpfront:0,alternativeMonthly:20,saasUpfront:0,saasMonthly:20,horizonMonths:12},'same_cost',0,'equal'],
  [{alternativeUpfront:0,alternativeMonthly:10,saasUpfront:0,saasMonthly:20,horizonMonths:12},'equal_initial',0,'alternative_lower']
]){
 const result=findTCOMonthCrossing(input);
 assert.equal(result.ok,true);
 assert.equal(result.status,status);
 assert.equal(result.month,month);
 assert.equal(result.direction,direction);
}
assert.equal(findTCOMonthCrossing({alternativeUpfront:0,alternativeMonthly:0,saasUpfront:0,saasMonthly:0,horizonMonths:121}).ok,false);
assert.equal(calculateSoftwareTCO({...x,horizonMonths:1}).ok,true);
assert.equal(calculateSoftwareTCO({...x,horizonMonths:120}).ok,true);
for(const update of [
 {horizonMonths:0},{horizonMonths:121},{horizonMonths:12.5},
 {saasUsers:-1},{saasUsers:1.5},{saasMonthlySeat:-0.1},
 {customMonthly:'oops'},{reuseLicenseMonthly:Infinity},{customOneTime:''},
 {saasOneTime:1e10},{hours:0},{reusePercent:100}
]){
 assert.equal(calculateSoftwareTCO({...x,...update}).ok,false,JSON.stringify(update));
}
assert.equal(calculateSoftwareTCO({hours:1200,hoursPerWeek:160,reusePercent:30}).ok,false,
 'Never turn missing fees into implicit zero');
for(const lang of ['ru','en']){
 const t=OPPORTUNITY_COPY[lang];
 for(const key of ['tcoTitle','tcoLead','tcoHorizon','tcoCustomOnce','tcoCustomMonthly',
 'tcoReuseOnce','tcoReuseMonthly','tcoReuseLicense','tcoSaasOnce','tcoSaasPlatform',
 'tcoSaasUsers','tcoSaasSeat','tcoSaasOps','tcoCustom','tcoReuse','tcoSaas','tcoWarning']){
   assert.ok(t[key]?.trim(),lang+' missing '+key);
 }
}
console.log('PASS: three TCO routes, 36-month arithmetic, 1–120 month bounds, negative and missing-cost rejection, RU/EN.');
