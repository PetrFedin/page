#!/usr/bin/env node
import assert from 'node:assert/strict';
import {T} from '../assets/content.js';
import {chromium} from 'playwright';
const b=await chromium.launch({headless:true,args:['--no-sandbox']});
try{
 for(const lang of ['ru','en'])for(const width of [375,390,768,1024,1440]){
  const page=await b.newPage({viewport:{width,height:900},reducedMotion:'reduce'});
  const errors=[];page.on('pageerror',e=>errors.push(String(e)));
  await page.route('https://challenges.cloudflare.com/**',r=>r.fulfill({status:200,contentType:'text/javascript',body:''}));
  await page.goto('http://127.0.0.1:4321/'+(lang==='en'?'en/':''),{waitUntil:'domcontentloaded'});
  assert.equal(T[lang].roles.items.length,4,'four career/engagement roles');
  assert.equal(T[lang].formats.items.length,4,'four advisory formats');
  assert.equal(T[lang].hero.facts.length,5,'five experience profiles');
  assert.equal(await page.locator('#facts-bar .fact-card').count(),5);
  assert.equal(await page.locator('#services>li').count(),5);
  const indexes=await page.locator('#services .svc-n').allTextContents();
  assert.deepEqual(indexes.map(x=>x.trim().split(' / ')[0]),['01','02','03','04','05'],'all service indices must be defined');
  assert.ok(indexes.every(x=>!x.includes('undefined')),'no undefined text in visible service cards');
  if(width<=390){
   for(const selector of ['#services>li','#facts-bar>.fact-card']){
    const boxes=await page.locator(selector).evaluateAll(ns=>ns.map(n=>n.getBoundingClientRect().toJSON()));
    assert.equal(boxes.length,5,'five independently laid out cards '+selector);
    for(let i=1;i<boxes.length;i++)assert.ok(boxes[i].top>=boxes[i-1].bottom+5,
     'mobile card overlap in '+selector+' at '+width+': '+JSON.stringify(boxes));
   }
   assert.equal(await page.locator('#services + .snap-dots').count(),0,'no obsolete carousel dots after vertical service grid');
   assert.equal(await page.locator('#facts-bar + .snap-dots').count(),0,'no obsolete carousel dots after vertical experience grid');
  }
  if(width===1440){
   const rects=await page.locator('#services>li').evaluateAll(e=>e.map(x=>x.getBoundingClientRect().toJSON()));
   assert.ok(rects.every(x=>Math.abs(x.y-rects[0].y)<3),'all five consulting cards in one row');
   const widths=rects.map(x=>x.width);
   assert.ok(Math.max(...widths)-Math.min(...widths)<4,'equal consulting card widths');
  }
  const over=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
  assert.ok(over<4,'no horizontal overflow at '+lang+'/'+width+': '+over);
  await page.locator('#facts-bar [data-area="systems-integration"]').click();
  assert.equal(await page.locator('dialog:visible').count()>0,true,'fifth experience opens details');
  assert.deepEqual(errors,[],'no browser exceptions');
  await page.close();
 }
 console.log('PASS five bilingual experience areas, five equal consulting cards, 3 widths and modal accessibility');
}finally{await b.close()}
