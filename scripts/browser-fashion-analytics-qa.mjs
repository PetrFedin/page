#!/usr/bin/env node
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
try{
 for(const lang of ['ru','en'])for(const width of [375,768,1440]){
   const page=await browser.newPage({viewport:{width,height:850},reducedMotion:'reduce'});
   const errors=[];page.on('pageerror',e=>errors.push(String(e)));
   await page.route('https://challenges.cloudflare.com/**',route=>route.fulfill({status:200,contentType:'text/javascript',body:''}));
   const response=await page.goto('http://127.0.0.1:4321'+(lang==='en'?'/en/':'/'),{waitUntil:'domcontentloaded'});
   assert.equal(response.status(),200);
   const studio=page.locator('#fashion-analytics');
   await studio.locator('[data-fa-report] .fa-metric').first().waitFor();
   assert.equal(await studio.locator('[data-fa="role"] option').count(),5);
   assert.equal(await studio.locator('[data-fa="view"] option').count(),5);
   assert.equal(await studio.locator('.fa-metric').count(),5);
   assert.equal(await studio.locator('tbody tr').first().isVisible(),true);
   await studio.locator('[data-fa="role"]').selectOption('department');
   assert.equal(await studio.locator('[data-fa="dimension"] option').count(),4);
   await studio.locator('[data-fa="view"]').selectOption('forecast');
   assert.equal(await studio.locator('.fa-metric').count(),5);
   await studio.locator('[data-fa="growth"]').fill('15');
   await studio.locator('[data-fa="growth"]').dispatchEvent('change');
   assert.equal(await studio.locator('[data-fa-errors]').isVisible(),false);
   const horizontal=await studio.evaluate(el=>el.scrollWidth>el.clientWidth+3);
   assert.equal(horizontal,false,lang+'/'+width+' fashion studio viewport overflow');
   assert.deepEqual(errors,[],lang+'/'+width+' browser JS errors');
   await page.close();
 }
 console.log('PASS: RU/EN Fashion Analytics desktop/tablet/mobile business-model switch, forecast view, KPI and table');
} finally{await browser.close();}
