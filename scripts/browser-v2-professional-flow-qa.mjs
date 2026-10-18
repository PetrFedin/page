#!/usr/bin/env node
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const origin='http://127.0.0.1:4321';
try{
 for(const lang of ['ru','en']){
  const prefix=lang==='en'?'/en/':'/';
  for(const width of [390,1440]){
   const page=await browser.newPage({viewport:{width,height:880},reducedMotion:'reduce'});
   const errors=[];page.on('pageerror',e=>errors.push(String(e)));
   await page.route('https://challenges.cloudflare.com/**',route=>
     route.fulfill({status:200,contentType:'text/javascript',body:''}));
   const resp=await page.goto(origin+prefix+'profile.html',{waitUntil:'domcontentloaded'});
   assert.equal(resp.status(),200,'Profile '+lang+' '+width);
   assert.equal(await page.locator('html').getAttribute('lang'),lang);
   const controls=page.locator('[data-profile-focus]');
   assert.equal(await controls.count(),4);
   assert.equal(await page.locator('#profile-focus-contact').getAttribute('href'),
     prefix+'?topic=consulting&focus=buying#contact');
   await controls.locator('[data-profile-focus="systems"]').click();
   assert.equal(await controls.locator('[data-profile-focus="systems"]').getAttribute('aria-pressed'),'true');
   assert.equal(await controls.locator('[data-profile-focus="buying"]').getAttribute('aria-pressed'),'false');
   await page.locator('#profile-focus-contact').click();
   await page.locator('#form [name="message"]').waitFor();
   assert.equal(await page.locator('#topic').inputValue(),'consulting');
   const message=await page.locator('#form [name="message"]').inputValue();
   assert.match(message,lang==='en'?/Data and digital systems/:/Данные и цифровые системы/);
   const horizontal=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
   assert.ok(horizontal<=3,'No horizontal overflow '+lang+'/'+width+': '+horizontal);
   assert.deepEqual(errors,[],lang+'/'+width+' no runtime JS errors');
   await page.close();
  }
 }
 console.log('PASS: RU/EN professional profile focus -> contact preserving intent on phone and desktop');
}finally{await browser.close()}
