#!/usr/bin/env node
/* Real Chrome regression for simplified brand hierarchy and qualified consultation paths.
   This is CI-only. It never sends a form or claims production delivery. */
import assert from 'node:assert/strict';
import {chromium} from 'playwright';

const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const base='http://127.0.0.1:4321';
try {
 for(const lang of ['ru','en']){
  const root=lang==='en'?'/en/':'/';
  for(const width of [375,768,1440]){
   const page=await browser.newPage({viewport:{width,height:880},reducedMotion:'reduce'});
   const errors=[];page.on('pageerror',e=>errors.push(String(e)));
   await page.route('https://challenges.cloudflare.com/**',
     route=>route.fulfill({status:200,contentType:'text/javascript',body:''}));
   const reply=await page.goto(base+root,{waitUntil:'domcontentloaded'});
   assert.equal(reply.status(),200,'home HTTP');
   const hero=page.locator('.hero-cta');
   await hero.locator('#hero-secondary-links').waitFor();
   assert.equal(await hero.locator('#cta-consulting').isVisible(),true);
   assert.equal(await hero.locator('#cta-projects').isVisible(),true);
   assert.equal(await hero.locator('#hero-secondary-links').evaluate(e=>e.open),false);
   assert.equal(await hero.locator('#hero-secondary-links .btn').count(),5,'all older routes retained');
   assert.equal(await hero.locator('#hero-secondary-links .btn:visible').count(),0,'secondary actions initially hidden');
   await hero.locator('#hero-secondary-links summary').click();
   assert.equal(await hero.locator('#hero-secondary-links .btn:visible').count(),5,'secondary actions expandable');
   assert.equal(await hero.locator('#hero-profile-link').getAttribute('href'),
     lang==='en'?'/en/profile.html':'/profile.html');
   const proof=page.locator('#brand-evidence-standard');
   await proof.scrollIntoViewIfNeeded();
   await proof.locator('summary').click();
   assert.equal(await proof.locator('.brand-proof-item').count(),3);
   assert.equal(await proof.locator('.brand-proof-item:visible').count(),3);
   assert.equal(await page.locator('#lead-next-steps li').count(),3);
   await page.locator('#lead-routes-grid [data-lead-start="client"]').click();
   assert.equal(await page.locator('#topic').inputValue(),'consulting');
   const overs=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
   assert.ok(overs<=3,lang+'/'+width+' overflow '+overs);
   assert.deepEqual(errors,[],lang+'/'+width+' JS exceptions');
   await page.close();
  }
 }
 console.log('PASS brand platform: RU+EN, 3 widths, two-CTA hero, accessible disclosure, evidence levels, three commercial steps, lead route');
} finally {await browser.close()}
