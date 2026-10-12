#!/usr/bin/env node
import assert from 'node:assert/strict';
import {mkdirSync} from 'node:fs';
mkdirSync('qa-artifacts',{recursive:true});
import {chromium} from 'playwright';
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const base='http://127.0.0.1:4321';
const errors=[];
try{
for(const lang of ['ru','en']){
 for(const width of [375,768,1440]){
   const page=await browser.newPage({viewport:{width,height:850},reducedMotion:'reduce'});
   page.on('pageerror',e=>errors.push(lang+'/'+width+': '+String(e)));
   await page.route('https://challenges.cloudflare.com/**',route=>route.fulfill({status:200,contentType:'text/javascript',body:''}));
   let delivered=null;
   await page.route('**/api/contact',async route=>{
     delivered=route.request().postDataJSON();
     await route.fulfill({status:200,contentType:'text/plain',body:'ok'});
   });
   const response=await page.goto(base+(lang==='ru'?'/':'/en/'),{waitUntil:'domcontentloaded'});
   assert.equal(response.status(),200);
   await page.locator('#lead-routes-grid [data-lead-start]').first().waitFor();
   assert.equal(await page.locator('#lead-routes-grid [data-lead-start]').count(),3,lang+' routes');
   await page.locator('#work-with-me').scrollIntoViewIfNeeded();
   await page.screenshot({path:'qa-artifacts/lead-routes-'+lang+'-'+width+'.png'});
   for(const [id,topic] of [['client','consulting'],['pilot','partnership'],['investor','investors']]){
     await page.locator('[data-lead-start="'+id+'"]').click();
     assert.equal(await page.locator('#lead-route-value').inputValue(),id,lang+'/'+width+' route');
     assert.equal(await page.locator('#topic').inputValue(),topic,lang+'/'+width+' topic');
     assert.equal(await page.locator('#lead-context').isVisible(),true,'lead summary visible');
   }
   await page.locator('#projects-more').click();
   await page.locator('#cards [data-open="fintech"]').click();
   await page.locator('#modal[open]').waitFor();
   assert.equal(await page.locator('#modal-invest').isVisible(),true);
   await page.locator('#modal-invest').click();
   assert.equal(await page.locator('#lead-route-value').inputValue(),'investor');
   assert.equal(await page.locator('#lead-project-value').inputValue(),'fintech');
   assert.equal(await page.locator('#topic').inputValue(),'investors');
   await page.locator('#lead-timing').selectOption('1–3 months');
   // Cloudflare is intentionally stubbed on localhost: supply an explicit test token.
   await page.evaluate(()=>{
     const widget=document.querySelector('#turnstile-widget');
     const dummy=document.createElement('input');
     dummy.type='hidden';dummy.name='cf-turnstile-response';dummy.value='ci-only-token';
     widget.append(dummy);
   });
   await page.locator('#lead-context').scrollIntoViewIfNeeded();
   await page.screenshot({path:'qa-artifacts/lead-contact-'+lang+'-'+width+'.png'});
   await page.locator('#form [name="name"]').fill('Test Contact');
   await page.locator('#email').fill('qa@example.org');
   await page.locator('#consent').check();
   assert.equal(await page.locator('#submit').isEnabled(),true);
   await page.locator('#submit').click();
   await page.waitForFunction(()=>document.querySelector('#form-note')?.classList.contains('ok'));
   assert.ok(delivered,'no form payload');
   for(const [key,value] of Object.entries({leadRoute:'investor',leadProject:'fintech',leadTiming:'1–3 months',topic:'investors'}))
     assert.equal(delivered[key],value,key);
   assert.ok(delivered.leadGoal?.length,'lead goal missing');
   assert.equal(await page.locator('#lead-route-value').inputValue(),'','route cleared post-send');
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth+2);
   assert.equal(overflow,false,lang+'/'+width+' viewport overflow');
   await page.close();
 }
}
assert.deepEqual(errors,[],'uncaught client errors');
console.log('PASS: 3 conversion routes, fintech investor journey, payload and confirmation, RU/EN x 3 widths');
}finally{await browser.close()}
