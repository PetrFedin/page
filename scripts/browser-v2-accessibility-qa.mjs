#!/usr/bin/env node
/**
 * WCAG 2.2 A/AA automated audit for public V2, intentionally independent of
 * live Cloudflare / Telegram and without storing visitor personal data.
 * Axe findings do not replace keyboard, screen-reader or human review.
 */
import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';

const base='http://127.0.0.1:4321';
const report=[];
const violations=[];
mkdirSync('qa-artifacts',{recursive:true});
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const wcag=['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa'];
async function audit(page,label,selector) {
  let checker=new AxeBuilder({page}).withTags(wcag);
  if(selector)checker=checker.include(selector);
  const result=await checker.analyze();
  const findings=result.violations.map(v=>({
    id:v.id,impact:v.impact,help:v.help,
    affected:v.nodes.slice(0,4).map(n=>({target:n.target,summary:n.failureSummary?.slice(0,220)})),
    totalAffected:v.nodes.length
  }));
  report.push({label,passes:result.passes.length,incomplete:result.incomplete.length,violations:findings});
  const errors=findings.filter(v=>v.impact==='critical'||v.impact==='serious');
  violations.push(...errors.map(x=>({label,...x})));
  console.log('AUDIT '+label+': '+findings.length+' WCAG findings, serious/critical '+errors.length);
}
try {
  for(const lang of ['ru','en']){
    for(const width of [390,1440]){
      const page=await browser.newPage({
        viewport:{width,height:900},reducedMotion:'reduce'
      });
      page.on('dialog',d=>d.dismiss());
      // Do not request live Cloudflare CAPTCHA or third-party private data.
      await page.route('https://challenges.cloudflare.com/**',r=>
        r.fulfill({status:200,contentType:'text/javascript',body:''}));
      const response=await page.goto(base+(lang==='en'?'/en/':'/'),{
        waitUntil:'domcontentloaded'
      });
      assert.equal(response.status(),200);
      await page.locator('#opportunities [data-op-mode="build"]').waitFor();
      await audit(page,lang+'/'+width+'/full-page');
      const op=page.locator('#opportunities');
      for(const mode of ['transform','access','capital']){
        await op.locator('[data-op-mode="'+mode+'"]').click();
        await op.locator('[data-op-action="example"]').click();
        await audit(page,lang+'/'+width+'/opportunity-'+mode,'#opportunities');
      }
      // Existing project modal is part of a real customer/investor flow.
      await page.locator('#cards [data-open="syntha"]').click();
      await page.locator('#modal[open]').waitFor();
      await audit(page,lang+'/'+width+'/project-modal','#modal');
      await page.locator('#modal-close').click();
      await page.locator('#modal').waitFor({state:'hidden'});
      await page.close();
    }
  }
  writeFileSync('qa-artifacts/v2-accessibility-audit.json',JSON.stringify({
    standard:'WCAG 2.0/2.1/2.2 A and AA (automated axe checks only)',
    source:'@axe-core/playwright@4.13.0',results:report
  },null,2)+'\n');
  if(violations.length){
    console.error('FAIL: serious/critical automated accessibility findings:\n'+
      JSON.stringify(violations,null,2).slice(0,16000));
  }
  assert.equal(violations.length,0,'Serious/critical automated WCAG findings must be fixed');
  console.log('PASS: V2 RU/EN two widths, all commercial modes, project modal: zero serious/critical automated WCAG issues');
} finally {
  await browser.close();
}
