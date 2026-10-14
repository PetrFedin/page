#!/usr/bin/env node
import assert from 'node:assert/strict';
import { mkdirSync } from 'node:fs';
import { chromium } from 'playwright';

mkdirSync('qa-artifacts',{recursive:true});
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const root='http://127.0.0.1:4321';
const errors=[];
const cases=['ru','en'];
try{
for(const lang of cases){
  for(const width of [375,768,1440]){
    const page=await browser.newPage({viewport:{width,height:860},reducedMotion:'reduce'});
    let envelope=null;
    page.on('pageerror',e=>errors.push(lang+'/'+width+': '+String(e)));
    await page.route('https://challenges.cloudflare.com/**',route=>
      route.fulfill({status:200,contentType:'text/javascript',body:''}));
    // Local mock only. Turnstile and Telegram are NOT qualified by this test.
    await page.route('**/api/contact',async route=>{
      envelope=route.request().postDataJSON();
      await route.fulfill({status:200,contentType:'text/plain',body:'ok'});
    });
    const response=await page.goto(root+(lang==='en'?'/en/':'/'),{waitUntil:'domcontentloaded'});
    assert.equal(response.status(),200);
    const section=page.locator('#opportunities');
    await section.locator('[data-op-mode]').first().waitFor();
    assert.equal(await section.locator('[data-op-mode]').count(),4,'Exactly four modes');
    assert.equal(await section.locator('[data-op-project] option').count(),12,'Own project and 11 portfolios');
    assert.equal(await section.locator('.op-sources a').count(),4,'Four official product pricing sources');
    assert.equal(await section.locator('[data-op-metrics]').isVisible(),false,'No assumed prices shown before input');
    await section.locator('[data-op-action="example"]').click();
    assert.equal(await section.locator('[data-op-metrics]').isVisible(),true,'Build scenario shown');
    const buildValue=await section.locator('[data-op-result="baselineCost"]').textContent();
    assert.ok(buildValue.includes('30')&&buildValue.includes('58'),'Labour-only Clutch bounds present');
    await section.locator('[data-op-input="reusePercent"]').fill('100');
    assert.equal(await section.locator('[data-op-metrics]').isVisible(),false,'Invalid reuse should hide results');
    await section.locator('[data-op-input="reusePercent"]').fill('30');

    await section.locator('[data-op-mode="transform"]').click();
    assert.equal(await section.locator('[data-op-metrics]').isVisible(),false);
    await section.locator('[data-op-action="example"]').click();
    assert.equal(await section.locator('[data-op-metrics]').isVisible(),true);
    const net=await section.locator('[data-op-result="annualNet"]').textContent();
    assert.ok(net.includes('10')&&net.includes('500'),'Illustrative annual operating effect');
    await section.locator('[data-op-input="annualSupport"]').fill('20000');
    assert.equal(await section.locator('[data-op-result="payback"]').textContent(),
      lang==='ru'?'Не рассчитывается при неположительном эффекте':
      'Not meaningful when net savings are not positive');

    await section.locator('[data-op-mode="access"]').click();
    await section.locator('[data-op-action="example"]').click();
    const saving=await section.locator('[data-op-result="difference"]').textContent();
    assert.ok(saving.includes('147'),'Hypothetical access benefit should be 147 USD');

    await section.locator('[data-op-project]').selectOption('syntha');
    await section.locator('[data-op-mode="capital"]').click();
    assert.equal(await section.locator('.op-project-plan li').count(),3,
      'Three sourced project financing milestones');
    assert.equal(await section.locator('[data-op-metrics]').isVisible(),false);
    await section.locator('[data-op-action="example"]').click();
    assert.equal(await section.locator('[data-op-metrics]').isVisible(),true);
    const equity=await section.locator('[data-op-result="investor"]').textContent();
    assert.ok(equity.includes('16'),'Primary equity illustration');
    await section.locator('[data-op-input="founderMinimum"]').fill('55');
    const floor=await section.locator('[data-op-result="retention"]').textContent();
    assert.ok(lang==='ru'?floor.includes('Нарушается'):floor.includes('Below'));
    await section.locator('[data-op-input="mode"]').selectOption('secondary');
    assert.ok((await section.locator('[data-op-result="company"]').textContent()).includes('0'),
      'Secondary must not show an injection into company');
    assert.equal(await section.locator('[data-op-result="founder"]').textContent(),'—',
      'Secondary seller ownership is not known');
    await section.locator('[data-op-input="mode"]').selectOption('primary');
    await section.scrollIntoViewIfNeeded();
    await page.screenshot({path:'qa-artifacts/opportunity-'+lang+'-'+width+'.png',animations:'disabled'});

    // Previously selected investor + project must be overridable by the
    // software-build CTA, which leads to client consulting without numbers.
    await section.locator('[data-op-action="contact"]').click();
    assert.equal(await page.locator('#lead-route-value').inputValue(),'investor');
    assert.equal(await page.locator('#lead-project-value').inputValue(),'syntha');
    assert.equal(await page.locator('#topic').inputValue(),'investors');
    await section.locator('[data-op-mode="build"]').click();
    await section.locator('[data-op-action="contact"]').click();
    assert.equal(await page.locator('#lead-route-value').inputValue(),'client');
    assert.equal(await page.locator('#lead-project-value').inputValue(),'syntha');
    assert.equal(await page.locator('#topic').inputValue(),'consulting');
    const requestCopy=await page.locator('#form [name="message"]').inputValue();
    assert.ok(lang==='ru'?requestCopy.includes('Разработка и интеграция'):
      requestCopy.includes('Software and integration'),
      'Switching from investment to development should replace only previous autogenerated message');

    // Explicit consented test payload. All financial inputs remain on the
    // calculator only; no storing or passing values to /api/contact.
    await page.evaluate(()=>{
      const widget=document.querySelector('#turnstile-widget');
      const token=document.createElement('input');
      token.type='hidden';token.name='cf-turnstile-response';token.value='ci-only-token';
      widget.append(token);
    });
    await page.locator('#form [name="name"]').fill('QA Opportunity');
    await page.locator('#email').fill('qa@example.org');
    await page.locator('#consent').check();
    assert.equal(await page.locator('#submit').isEnabled(),true);
    await page.locator('#submit').click();
    await page.waitForFunction(()=>document.querySelector('#form-note')?.classList.contains('ok'));
    assert.ok(envelope,'Contact was not submitted');
    assert.equal(envelope.leadRoute,'client');
    assert.equal(envelope.leadProject,'syntha');
    assert.equal(envelope.topic,'consulting');
    for(const key of ['hours','hoursPerWeek','reusePercent','assumedValuation','ticket',
      'founderBefore','manualHours','futureMonthlyPrice','discountPercent']){
      assert.equal(Object.hasOwn(envelope,key),false,'Calculator input leaked as key: '+key);
    }
    const str=JSON.stringify(envelope);
    for(const sensitive of ['500000','100000','18000','6000']){
      assert.ok(!str.includes(sensitive),'Test financial value copied into contact: '+sensitive);
    }
    const overflowing=await section.evaluate(el=>el.scrollWidth>el.clientWidth+3);
    assert.equal(overflowing,false,lang+'/'+width+' opportunity section overflow');
    await page.close();
  }
}
assert.deepEqual(errors,[],'Uncaught client JavaScript errors');
console.log('PASS: RU/EN x three widths, four calculators, project-specific milestones, equity caveats, qualified lead route, no financial input sent');
}finally{await browser.close();}
