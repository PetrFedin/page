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
  // Cloudflare rejects its production Turnstile sitekey on local CI host (110200).
  // Stub only the third-party widget in automated localhost QA; form integration remains out of scope.
  await page.route('https://challenges.cloudflare.com/**',route=>route.fulfill({status:200,contentType:'text/javascript',body:''}));
  page.on('pageerror',e=>errors.push(lang+'/'+width+': '+String(e)));
  const response=await page.goto(base+(lang==='en'?'/en/':'/'),{waitUntil:'domcontentloaded'});
  assert.equal(response.status(),200,lang+' index HTTP 200');
  await page.locator('#cards .card').first().waitFor();
  await page.locator('#consulting').scrollIntoViewIfNeeded();
  await page.screenshot({path:out+'/consulting-'+lang+'-'+width+'.png'});
  const grid=await page.locator('#services li').evaluateAll(nodes=>nodes.map(n=>({x:Math.round(n.getBoundingClientRect().left),y:Math.round(n.getBoundingClientRect().top),w:Math.round(n.getBoundingClientRect().width)})));
  assert.equal(grid.length,5,'five consulting options');
  if(width===1440){
    assert.ok(Math.max(...grid.slice(0,4).map(n=>n.y))-Math.min(...grid.slice(0,4).map(n=>n.y))<7,'desktop first line has 4 cards');
    assert.ok(grid[4].y>grid[3].y+15,'featured fifth advisory card has separate row');
    assert.ok(grid[4].w>grid[0].w,'featured fifth card spans the row');
  }
  if(width===375){
    // Existing phone UX intentionally uses horizontal snap cards, not a vertical stack.
    const track=page.locator('#services');
    const dimensions=await track.evaluate(el=>({scrollWidth:el.scrollWidth,clientWidth:el.clientWidth}));
    assert.ok(dimensions.scrollWidth>dimensions.clientWidth+4,'mobile consulting carousel scrollable');
    const dots=page.locator('#services + .snap-dots button');
    await dots.first().waitFor();
    assert.equal(await dots.count(),5,'five consultation slides have navigation dots');
    assert.equal(new Set(grid.map(n=>n.y)).size,1,'cards share one horizontal rail');
    await track.evaluate(el=>{el.scrollLeft=el.scrollWidth;});
    await page.waitForFunction(()=>{const el=document.querySelector('#services');return el.scrollLeft>el.clientWidth;});
    const activeAfterScroll=await page.locator('#services + .snap-dots [aria-current="true"]').count();
    assert.equal(activeAfterScroll,1,'one active consultation slide after swipe');
    await track.evaluate(el=>{el.scrollLeft=0;});
  }
  const featured=await page.locator('#cards>.card').evaluateAll(nodes=>nodes.map(n=>n.dataset.project));
  assert.deepEqual(featured,['syntha','chatx','renova'],lang+'/'+width+' featured project sequence');
  const bridge=page.locator('#project-development');
  assert.ok(await bridge.locator('a[href="#project-launch"]').isVisible(),'product delivery link visible');
  assert.ok(await bridge.locator('a[href="#investment-formats"]').isVisible(),'investment format link visible');
  assert.equal(await page.locator('#investment-formats').count(),1,'investment anchor exists');
  if(width===1440){
    const widths=grid.slice(0,3).map(n=>n.w);
    assert.ok(Math.max(...widths)-Math.min(...widths)<3,'desktop consultation cards evenly sized');
  }
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
    await page.locator('#modal').waitFor({state:'hidden'});
  }
  const diagnostic=await page.evaluate(()=>{
    const vw=document.documentElement.clientWidth;
    return [...document.querySelectorAll('body *')].map(el=>{
      const r=el.getBoundingClientRect();
      return {tag:el.tagName,className:typeof el.className==='string'?el.className.slice(0,75):'',id:el.id||'',right:Math.round(r.right),left:Math.round(r.left),width:Math.round(r.width)};
    }).filter(r=>r.right>vw+2&&r.width>0).sort((a,b)=>b.right-a.right).slice(0,16);
  });
  if(diagnostic.length)console.log('OVERFLOW_DIAGNOSTIC '+lang+'/'+width+' '+JSON.stringify(diagnostic));
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth+2);
  assert.equal(overflow,false,lang+'/'+width+' no horizontal viewport overflow');
  await page.close();
 }
}
assert.deepEqual(errors,[],'no uncaught browser errors');
console.log('PASS: browser QA RU+EN x 375/768/1440, 11 modals per viewport, calculator, blank-media gating');
} finally {await browser.close();}
