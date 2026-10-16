import assert from 'node:assert/strict';
import { chromium } from 'playwright';
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
try{
for(const lang of ['ru','en'])for(const width of [390,1440]){
const page=await browser.newPage({viewport:{width,height:850},reducedMotion:'reduce'});
const prefix=lang==='en'?'/en/':'/';
const base='http://127.0.0.1:4321';
const errors=[];page.on('pageerror',e=>errors.push(String(e)));
await page.route('https://challenges.cloudflare.com/**',r=>r.fulfill({status:200,body:''}));
assert.equal((await page.goto(base+prefix)).status(),200);
const format=page.locator('#consulting-formats-extended');
await format.locator('summary').click();
assert.equal(await format.locator('.format').count(),4);
if(width===1440){const tops=await format.locator('.format').evaluateAll(ns=>ns.map(n=>n.getBoundingClientRect().top));assert.ok(Math.max(...tops)-Math.min(...tops)<8);}
assert.equal(await page.locator('#fashion-analytics .fa-metric').count(),0);
assert.equal(await page.locator('#opportunities [data-op-mode]').count(),0);
assert.equal((await page.goto(base+prefix+'analytics.html')).status(),200);
assert.equal(await page.locator('.detail-process li').count(),5);
assert.equal((await page.goto(base+prefix+'economics.html')).status(),200);
const s=page.locator('#opportunities');
await s.locator('[data-op-mode]').first().waitFor();
assert.equal(await s.locator('[data-op-mode]').count(),4);
await s.locator('[data-op-action="example"]').click();
assert.equal(await s.locator('[data-op-metrics]').isVisible(),true);
assert.deepEqual(errors,[]);
await page.close();
}
console.log('PASS V2 client paths');
}finally{await browser.close();}
