#!/usr/bin/env node
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
const base = 'http://127.0.0.1:4321';
const out = 'qa-artifacts';
mkdirSync(out, {recursive:true});
const browser = await chromium.launch({headless:true,args:['--no-sandbox']});
const projects=['syntha','chatx','renova','mfw','promomed','fashion-os','fur','antiqua','igra','marco','fintech'];
const screenless=new Set(['fashion-os','fur','antiqua','igra','marco','fintech']);
const errors=[];
try {
for(const lang of ['ru','en']){
 for(const width of [375,768,1440]){
  const page=await browser.newPage({viewport:{width,height:850},reducedMotion:'reduce'});
  page.on('pageerror',e=>errors.push(lang+'/'+width+': '+String(e)));
  const response=await page.goto(base+(lang==='en'?'/en/':'/'),{waitUntil:'domcontentloaded'});
  assert.equal(response.status(),200,lang+' index HTTP 200');
  await page.locator('#cards .card').first().waitFor();
  await page.locator('#consulting').scrollIntoViewIfNeeded();
  await page.screenshot({path:out+'/consulting-'+lang+'-'+width+'.png'});
  const grid=await page.locator('#services li').evaluateAll(nodes=>nodes.map(n=>({x:Math.round(n.getBoundingClientRect().left),y:Math.round(n.getBoundingClientRect().top),w:Math.round(n.getBoundingClientRect().width)})));
  assert.equal(grid.length,5,'five consulting options');
  if(width===1440){
    assert.equal(new Set(grid.slice(0,3).map(n=>n.y)).size,1,'desktop first line has 3 cards');
    assert.equal(grid[3].y,grid[4].y,'desktop second line has 2 cards');
    assert.ok(grid[3].w>grid[0].w,'two last items fill row');
  }
  if(width===375)assert.equal(new Set(grid.map(n=>n.x)).size,1,'mobile stack');
  await page.locator('#projects-more').click();
  assert.equal(await page.locator('#cards>.card').count(),11,'all eleven cards rendered');
  for(const id of projects){
    await page.locator('#cards [data-open="'+id+'"]').click();
    await page.locator('#modal[open]').waitFor();
    assert.equal(await page.locator('#modal #project-investor:not([hidden])').count(),1,id+' investor dossier shown');
    if(screenless.has(id)){
      assert.equal(await page.locator('#gallery:visible').count(),0,id+' has no placeholder images');
      assert.equal(await page.locator('#project-capabilities:not([hidden]) .project-table tbody tr').count()>=4,true,id+' functional matrix');
    }
    const modal=page.locator('#modal');
    await modal.locator('[data-key="leads"]').fill('100');
    await modal.locator('[data-key="conversion"]').fill('10');
    await modal.locator('[data-key="price"]').fill('1000');
    await modal.locator('[data-key="variable"]').fill('200');
    await modal.locator('[data-key="fixed"]').fill('4000');
    assert.equal(await modal.locator('.calc-scenario-card').count(),3,id+' scenario calculator');
    const texts=await modal.locator('.calc-scenario-card').allTextContents();
    assert.ok(texts.every(x=>x.length>45),'financial values visible');
    if(id==='fintech')await page.screenshot({path:out+'/fintech-'+lang+'-'+width+'.png'});
    await modal.locator('#modal-close').click();
    await page.locator('#modal:not([open])').waitFor();
  }
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth+2);
  assert.equal(overflow,false,lang+'/'+width+' no horizontal viewport overflow');
  await page.close();
 }
}
assert.deepEqual(errors,[],'no uncaught browser errors');
console.log('PASS: browser QA RU+EN x 375/768/1440, 11 modals per viewport, calculator, blank-media gating');
} finally {await browser.close();}
