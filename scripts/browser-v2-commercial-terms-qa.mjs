#!/usr/bin/env node
/* Full page contracts: provider responses are mocked; not a deployment test. */
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
import { OPPORTUNITY_COPY } from '../assets/opportunity-copy.js';

const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const results=[],errors=[];
mkdirSync('qa-artifacts',{recursive:true});
try{
  for(const lang of ['ru','en'])for(const width of [375,768,1440]){
    const context=await browser.newContext({viewport:{width,height:850},reducedMotion:'reduce'});
    const page=await context.newPage(),copy=OPPORTUNITY_COPY[lang];
    page.on('pageerror',e=>errors.push(lang+'/'+width+': '+String(e)));
    await page.route('https://challenges.cloudflare.com/**',r=>
      r.fulfill({status:200,contentType:'text/javascript',body:''}));
    let payload=null;
    await page.route('**/api/contact',async r=>{
      payload=r.request().postDataJSON();
      await r.fulfill({status:200,contentType:'text/plain',body:'ok'});
    });
    const response=await page.goto('http://127.0.0.1:4321'+(lang==='en'?'/en/':'/'),
      {waitUntil:'domcontentloaded'});
    assert.equal(response.status(),200);
    const studio=page.locator('#opportunities');
    await studio.locator('[data-op-mode="build"]').waitFor();
    // No scope is silently preselected: an untouched enquiry remains generic.
    assert.equal(await studio.locator('[data-op-input="type"]').inputValue(),'');
    const sections={
      transform:['transformStages'],access:['accessTiers'],
      capital:['dealPaths','capitalSteps','projectRoles']
    };
    for(const [mode,names] of Object.entries(sections)){
      await studio.locator('[data-op-mode="'+mode+'"]').click();
      if(mode==='access')assert.equal(await studio.locator('[data-op-input="accessTier"]').inputValue(),'');
      if(mode==='capital')assert.equal(await studio.locator('[data-op-input="mode"]').inputValue(),'');
      const text=await studio.innerText();
      assert.ok(!/\b(?:undefined|null)\b/.test(text),'No JS placeholder in '+mode);
      for(const name of names)for(const row of copy[name])for(const value of row)
        if(typeof value==='string'&&value.trim())assert.ok(text.includes(value),mode+' lost: '+value);
      assert.equal(await studio.locator('.op-choice p:empty').count(),0);
    }
    await studio.locator('[data-op-mode="build"]').click();
    await studio.locator('[data-op-action="example"]').click();
    await studio.locator('[data-op-input="type"]').selectOption('marketplace');
    await studio.locator('[data-op-input="hours"]').fill('998877.31');
    await studio.locator('[data-op-project]').selectOption('syntha');
    const market=copy.buildTypes.find(x=>x[0]==='marketplace')[1];
    await studio.locator('[data-op-action="contact"]').focus();
    await studio.locator('[data-op-action="contact"]').press('Enter');
    assert.equal(await page.locator('#lead-route-value').inputValue(),'client');
    assert.ok((await page.locator('#lead-goal-value').inputValue()).includes(market));
    assert.ok((await page.locator('#form [name="message"]').inputValue()).includes(market));
    const handwritten='This is an explicitly handwritten brief.';
    await page.locator('#form [name="message"]').fill(handwritten);
    await studio.locator('[data-op-mode="access"]').click();
    assert.equal(await studio.locator('[data-op-input="accessTier"] option').count(),5); // placeholder + four real options
    await studio.locator('[data-op-input="accessTier"]').selectOption('founding-customer');
    await studio.locator('[data-op-action="contact"]').click();
    assert.equal(await page.locator('#lead-route-value').inputValue(),'pilot');
    assert.ok((await page.locator('#lead-goal-value').inputValue()).includes(copy.accessTiers[2][0]));
    assert.equal(await page.locator('#form [name="message"]').inputValue(),handwritten);
    await page.locator('#form [name="message"]').fill('');
    await studio.locator('[data-op-mode="capital"]').click();
    await studio.locator('[data-op-input="mode"]').selectOption('secondary');
    await studio.locator('[data-op-action="contact"]').click();
    assert.equal(await page.locator('#lead-route-value').inputValue(),'investor');
    assert.ok((await page.locator('#lead-goal-value').inputValue()).includes(copy.secondary));
    await page.evaluate(()=>{
      const token=document.createElement('input');
      token.name='cf-turnstile-response';token.type='hidden';token.value='ci-mock-token';
      document.querySelector('#turnstile-widget').append(token);
    });
    await page.locator('#form [name="name"]').fill('QA Commercial Terms');
    await page.locator('#email').fill('qa-terms@example.org');
    await page.locator('#consent').check();
    await page.locator('#submit').click();
    await page.waitForFunction(()=>document.querySelector('#form-note')?.classList.contains('ok'));
    assert.ok(payload,'Mock API did not receive the enquiry');
    assert.equal(payload.leadRoute,'investor');assert.equal(payload.leadProject,'syntha');
    assert.ok(payload.leadGoal.includes(copy.secondary));
    assert.ok(!JSON.stringify(payload).includes('998877.31'),'Financial value leaked');
    for(const field of ['hours','hoursPerWeek','ticket','assumedValuation','founderBefore'])
      assert.ok(!Object.hasOwn(payload,field),field+' was sent unexpectedly');
    const stored=await page.evaluate(()=>JSON.stringify({...localStorage,...sessionStorage}));
    assert.ok(!stored.includes('998877.31'),'Financial data in storage');
    results.push({language:lang,width,conditions:'complete',scope:'retained',financialInputs:'private'});
    await context.close();
  }
  assert.deepEqual(errors,[],'No client JS errors');
  writeFileSync('qa-artifacts/v2-commercial-terms-qa.json',
    JSON.stringify({providerMode:'mocked',results},null,2)+'\n');
  console.log('PASS: six RU/EN page modes; all deal terms, requested scope, handwritten text, no financial leakage.');
}finally{await browser.close();}
