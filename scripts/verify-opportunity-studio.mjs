#!/usr/bin/env node
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  calculateSoftwareScenario, calculateTransformationScenario,
  calculateEarlyAccessScenario, calculateCapitalScenario
} from '../assets/opportunity-economics.js';
import { OPPORTUNITY_COPY, PROJECT_OPPORTUNITIES } from '../assets/opportunity-copy.js';
import { PROJECTS as CORE } from '../assets/content.js';
import { EXTRA_PROJECTS as EXTRA, INVESTOR_BLUEPRINTS } from '../assets/portfolio-extensions.js';

const near=(actual,expected,label)=>assert.ok(Math.abs(actual-expected)<1e-7,
  label+': expected '+expected+', got '+actual);
const rate=calculateSoftwareScenario({hours:'1200',hoursPerWeek:'160',reusePercent:'30'});
assert.equal(rate.ok,true);
near(rate.baselineWeeks,7.5,'Baseline elapsed working weeks');
near(rate.adaptedWeeks,5.25,'Reused-component illustrative elapsed weeks');
near(rate.costLow,30000,'1200 × 25');
near(rate.costHigh,58800,'1200 × 49');
near(rate.adaptedLow,21000,'840 × 25');
near(rate.adaptedHigh,41160,'840 × 49');
near(rate.differenceLow,9000,'Low-bound gap');
near(rate.differenceHigh,17640,'High-bound gap');
assert.equal(calculateSoftwareScenario({hours:'1',hoursPerWeek:'1',reusePercent:'0'}).ok,true);
for(const bad of [
  {hours:'',hoursPerWeek:'160',reusePercent:'30'},
  {hours:0,hoursPerWeek:1,reusePercent:0},
  {hours:100,hoursPerWeek:0,reusePercent:0},
  {hours:100,hoursPerWeek:80,reusePercent:100},
  {hours:100,hoursPerWeek:80,reusePercent:-1},
  {hours:Infinity,hoursPerWeek:80,reusePercent:5},
  {hours:1e8,hoursPerWeek:40,reusePercent:10}
])assert.equal(calculateSoftwareScenario(bad).ok,false,'invalid software '+JSON.stringify(bad));

const operational=calculateTransformationScenario({
  manualHours:6000,hourlyCost:15,efficiencyPercent:15,
  otherAnnualSavings:0,implementationBudget:18000,annualSupport:3000
});
assert.equal(operational.ok,true);
near(operational.baselineLabor,90000,'Annual labour baseline');
near(operational.laborSavings,13500,'Assumed reduced manual effort');
near(operational.grossAnnual,13500,'Gross savings');
near(operational.netAnnual,10500,'Net recurring savings');
near(operational.netFirstYear,-7500,'Year 1 effect net of implementation');
near(operational.breakEvenYears,18000/10500,'Simple payback in years');
const noSavings=calculateTransformationScenario({
  manualHours:0,hourlyCost:15,efficiencyPercent:0,
  otherAnnualSavings:0,implementationBudget:25000,annualSupport:1000
});
assert.equal(noSavings.ok,true);
assert.equal(noSavings.breakEvenYears,null,'No payback claim with negative annual result');
for(const bad of [-1,101,NaN])assert.equal(calculateTransformationScenario({
  manualHours:100,hourlyCost:10,efficiencyPercent:bad,
  otherAnnualSavings:0,implementationBudget:10,annualSupport:0
}).ok,false,'invalid transformation efficiency '+String(bad));

const founding=calculateEarlyAccessScenario({futureMonthlyPrice:49,discountPercent:25,months:12});
assert.equal(founding.ok,true);
near(founding.list,588,'Illustrative future annual list price');
near(founding.discounted,441,'Illustrative founder price');
near(founding.hypotheticalDifference,147,'Only hypothetical difference');
for(const [price,disc,months] of [[-1,20,12],[49,101,12],[49,30,0],[49,30,12.5],[49,30,121]]) {
  assert.equal(calculateEarlyAccessScenario({futureMonthlyPrice:price,discountPercent:disc,months}).ok,false);
}

const primary=calculateCapitalScenario({
  mode:'primary',assumedValuation:500000,ticket:100000,
  founderBefore:60,founderMinimum:40
});
assert.equal(primary.ok,true);
near(primary.postMoney,600000,'Primary post-money');
near(primary.investorPercent,100/6,'New-money investor ownership');
near(primary.founderAfter,50,'Founder dilution after new issue');
near(primary.companyProceeds,100000,'Primary funds enter company');
assert.equal(primary.founderFloorPass,true);
assert.equal(calculateCapitalScenario({
  mode:'primary',assumedValuation:500000,ticket:100000,
  founderBefore:60,founderMinimum:55
}).founderFloorPass,false,'Founder floor should indicate a rejected scenario');

const secondary=calculateCapitalScenario({
  mode:'secondary',assumedValuation:500000,ticket:100000,
  founderBefore:'',founderMinimum:''
});
assert.equal(secondary.ok,true);
assert.equal(secondary.companyProceeds,0,'Secondary consideration must not be represented as business funding');
assert.equal(secondary.sellerProceeds,100000,'Money goes to hypothetical seller');
assert.equal(secondary.founderAfter,null,'Do not invent seller identity or founder ownership');
near(secondary.investorPercent,20,'Hypothetical secondary stake');
for(const bad of [
  {mode:'primary',assumedValuation:0,ticket:10},
  {mode:'secondary',assumedValuation:50,ticket:100},
  {mode:'secondary',assumedValuation:100,ticket:0},
  {mode:'primary',assumedValuation:100,ticket:30,founderBefore:40,founderMinimum:50},
  {mode:'primary',assumedValuation:100,ticket:30,founderMinimum:40}
])assert.equal(calculateCapitalScenario(bad).ok,false,'invalid capital '+JSON.stringify(bad));

const projects=[...CORE,...EXTRA];
assert.equal(projects.length,11,'Portfolio must have 11 projects');
assert.deepEqual(Object.keys(PROJECT_OPPORTUNITIES).sort(),projects.map(p=>p.id).sort(),
  'No project missing commercial participation description');
for(const lang of ['ru','en']){
  const c=OPPORTUNITY_COPY[lang];
  assert.deepEqual(c.modes.map(x=>x.id),['build','transform','access','capital']);
  assert.equal(c.buildTypes.length,8,'Eight software solution families');
  assert.equal(c.accessTiers.length,4,'Four early-access paths');
  assert.equal(c.dealPaths.length,5,'Five financing/partnership structures');
  assert.equal(c.workflow.length,5,'Five delivery milestones');
  assert.equal(c.capitalSteps.length,4,'Four possible use-of-funds stages');
  assert.equal(c.samples.length,4,'Contextual official software references');
  assert.equal(c.decisionOptions.length,3,'Buy, adapt, build decision strategies');
  assert.ok(c.samples.every(item=>item[2].startsWith('https://')),'Source links must be HTTPS');
  for(const p of projects){
    assert.ok(PROJECT_OPPORTUNITIES[p.id][lang],'Missing project summary '+lang+' '+p.id);
    const blueprint=INVESTOR_BLUEPRINTS[p.id][lang];
    assert.equal(blueprint.tranches.length,3,'Project-specific investment gates '+p.id);
    assert.ok(blueprint.evidence.length>15,'Project-specific due diligence '+p.id);
  }
}
const read = name => readFileSync(new URL('../'+name,import.meta.url),'utf8');
const app=read('assets/app.js');
const browser=read('assets/opportunity-studio.js');
const css=read('assets/styles.css');
const economics=read('assets/economics-page.js');
assert.ok(economics.includes("mountOpportunityStudio(") && economics.includes("document.getElementById('opportunities')"),
  'Detailed economics page must mount the studio');
assert.ok(!app.includes("$('#opportunities'), lang, PROJECTS"), 'Home must not mount financial models');
assert.ok(economics.includes('selection.topic'), 'Must route selected qualitative topic to home contact');
assert.ok(economics.includes('INVESTOR_BLUEPRINTS'), 'Economic page must retain project-specific investment evidence');
assert.doesNotMatch(browser, /\b(?:fetch|sendBeacon|localStorage|sessionStorage|XMLHttpRequest|indexedDB)\s*(?:\(|\.|\[)/,
  'Commercial financial inputs must not be transmitted or persisted by calculator');
assert.ok(!browser.includes('JSON.stringify(currentValues())'),'Must not serialize all financial inputs to lead');
assert.ok(css.includes('.op-metrics[hidden]'),'Empty calculations should not display metrics');
for(const path of ['index.html','en/index.html']){
  const html=read(path);
  assert.ok(html.includes('id="opportunities"'),path+' missing gateway');
  assert.ok(html.includes('economics.html'),path+' missing detailed economics route');
  assert.ok(html.includes('id="nav-opportunities"'),path+' missing navigation');
  assert.ok(html.includes('/assets/app.js?v=20261014-opportunities1'),path+' wrong app revision');
  assert.ok(!html.includes('Вы покупаете продукт целиком или долю в нём'),path+' public ownership claim unsafe');
}
console.log('PASS: software, transformation, founder-access and primary/secondary capital arithmetic, RU/EN projects, privacy and V2 presentation.');
