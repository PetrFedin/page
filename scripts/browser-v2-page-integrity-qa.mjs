#!/usr/bin/env node
/*
 * V2 core page integrity across both canonical languages and device widths.
 * The test has no production provider/API calls.
 */
import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const base='http://127.0.0.1:4321';
const errors=[];
try{
  for(const lang of ['ru','en']){
    for(const width of [375,768,1440]){
      const page=await browser.newPage({
        viewport:{width,height:840},reducedMotion:'reduce'
      });
      page.on('pageerror',e=>errors.push(lang+'/'+width+': '+String(e)));
      await page.route('https://challenges.cloudflare.com/**',r=>
        r.fulfill({status:200,contentType:'text/javascript',body:''}));
      const response=await page.goto(base+(lang==='en'?'/en/':'/'),{
        waitUntil:'domcontentloaded'
      });
      assert.equal(response.status(),200,lang+' landing HTTP');
      await page.locator('#projects #cards .card').first().waitFor();
      await page.locator('#opportunities [data-op-mode="capital"]').waitFor();
      const check=await page.evaluate(()=>{
        const ids=[...document.querySelectorAll('[id]')].map(x=>x.id);
        const count=new Map();
        for(const id of ids)count.set(id,(count.get(id)||0)+1);
        const duplicates=[...count].filter(([,n])=>n>1).map(([id])=>id);
        const anchors=[...document.querySelectorAll('nav#nav a[href^="#"]')];
        const missingAnchors=anchors.map(a=>a.getAttribute('href')).filter(h=>{
          const id=h.slice(1);
          return id && !document.getElementById(id);
        });
        const activeNav=anchors.filter(a=>!a.hidden && a.offsetParent!==null);
        const missingName=activeNav.filter(a=>
          !(a.textContent||'').trim() && !(a.getAttribute('aria-label')||'').trim()
        ).map(a=>a.outerHTML.slice(0,200));
        const overflow=document.documentElement.scrollWidth-document.documentElement.clientWidth;
        const header=document.querySelector('.topbar');
        return {
          duplicates,missingAnchors,missingName,
          overflow,hasHeader:Boolean(header),
          sections:['consulting','projects','investors','opportunities','news','contact']
            .filter(id=>!document.getElementById(id)),
          article:document.getElementById('post-2026-10-13')?.textContent||''
        };
      });
      assert.deepEqual(check.duplicates,[],lang+'/'+width+' duplicate element IDs');
      assert.deepEqual(check.missingAnchors,[],lang+'/'+width+' broken primary navigation');
      assert.deepEqual(check.missingName,[],lang+'/'+width+' nav without accessible name');
      assert.deepEqual(check.sections,[],lang+'/'+width+' missing primary sections');
      assert.equal(check.hasHeader,true);
      assert.ok(check.overflow<=3,lang+'/'+width+' horizontal document overflow '+check.overflow+'px');
      assert.ok(check.article.length>250,lang+'/'+width+' approved October 13 article absent from prerender');

      // Navigation alone cannot be mistaken for a quote or shareholder offer.
      const section=page.locator('#opportunities');
      assert.equal(await section.locator('[data-op-action="contact"]').count(),1);
      assert.equal(await section.locator('[data-op-project] option').count(),12);
      assert.equal(await section.locator('[data-op-metrics]').isVisible(),false);

      // All four modes retain a human-readable description, not unlabeled icons.
      for(const id of ['build','transform','access','capital']){
        const button=section.locator('[data-op-mode="'+id+'"]');
        const title=(await button.locator('span').textContent()).trim();
        const explanation=(await button.locator('small').textContent()).trim();
        assert.ok(title.length>5 && explanation.length>12,lang+'/'+id+' descriptive label');
      }
      await page.close();
    }
  }
  assert.deepEqual(errors,[],'No unhandled JS errors in RU/EN core page');
  console.log('PASS: 2 languages × 3 viewports, identity, navigational anchors, duplicate IDs, 13 Oct SSR, accessibility labels and layout');
} finally {
  await browser.close();
}
