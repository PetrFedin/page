#!/usr/bin/env node
import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const base='http://127.0.0.1:4321';
try {
  const page=await browser.newPage({viewport:{width:375,height:850},reducedMotion:'reduce'});
  await page.route('https://challenges.cloudflare.com/**',r=>
    r.fulfill({status:200,contentType:'text/javascript',body:''}));
  await page.goto(base+'/en/',{waitUntil:'domcontentloaded'});
  const studio=page.locator('#opportunities');
  await studio.locator('[data-op-mode="build"]').waitFor();
  assert.equal(await studio.getAttribute('data-opportunity-has-unsaved-inputs'),'false');
  await studio.locator('[data-op-action="example"]').click();
  assert.equal(await studio.getAttribute('data-opportunity-has-unsaved-inputs'),'true');
  assert.equal(await studio.locator('[data-op-input="hours"]').inputValue(),'1200');

  // Warning must persist even after switching to an empty calculator tab.
  await studio.locator('[data-op-mode="capital"]').click();
  assert.equal(await studio.getAttribute('data-opportunity-has-unsaved-inputs'),'true');
  let dialogs=0;
  page.once('dialog',async d=>{
    dialogs++;
    assert.equal(d.type(),'confirm');
    assert.match(d.message(),/clears your private calculator inputs/);
    await d.dismiss();
  });
  await page.locator('#lang-toggle').click();
  assert.equal(dialogs,1,'Warning must appear for any unsaved scenario');
  assert.equal(new URL(page.url()).pathname,'/en/','Dismiss must leave on same page');
  await studio.locator('[data-op-mode="build"]').click();
  assert.equal(await studio.locator('[data-op-input="hours"]').inputValue(),'1200',
    'Draft must remain while navigating between calculator tabs');

  const storage=await page.evaluate(()=>Object.fromEntries(Object.entries(localStorage)));
  assert.ok(!JSON.stringify(storage).includes('1200'),
    'Financial values must not be persisted to localStorage');
  page.once('dialog',async d=>{ dialogs++;await d.accept(); });
  await page.locator('#lang-toggle').click();
  await page.waitForURL(base+'/');
  assert.equal(dialogs,2);
  assert.equal(new URL(page.url()).search,'','No model input in language navigation URL');
  assert.equal(await page.locator('#opportunities').getAttribute('data-opportunity-has-unsaved-inputs'),
    'false','Fresh language page starts with blank private input state');

  await page.locator('#lang-toggle').click();
  await page.waitForURL(base+'/en/');
  assert.equal(dialogs,2,'No warning when no financial inputs exist');
  console.log('PASS: RU/EN navigation guards private unsaved finances, keeps tab drafts, never persists numbers');
} finally {
  await browser.close();
}
