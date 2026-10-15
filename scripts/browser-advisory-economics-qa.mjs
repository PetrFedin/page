#!/usr/bin/env node
import assert from 'node:assert/strict';
import { mkdirSync } from 'node:fs';
import { chromium } from 'playwright';

const screenshots = 'qa-artifacts';
const base = 'http://127.0.0.1:4321';
mkdirSync(screenshots, { recursive: true });
const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
const uncaught = [];

try {
  for (const lang of ['ru','en']) {
    for (const width of [375, 768, 1440]) {
      const page = await browser.newPage({ viewport: { width, height: 850 }, reducedMotion: 'reduce' });
      // localhost cannot solve a production Cloudflare challenge. This does NOT test Turnstile.
      await page.route('https://challenges.cloudflare.com/**', route =>
        route.fulfill({ status: 200, contentType: 'text/javascript', body: '' }));
      page.on('pageerror', error => uncaught.push(lang + '/' + width + ': ' + String(error)));
      const response = await page.goto(base + (lang === 'en' ? '/en/' : '/'), { waitUntil: 'domcontentloaded' });
      assert.equal(response.status(), 200);
      // Simulate a stale investor intent before navigating to the advisory.
      // Calculator contact must override it with a consulting/client intent.
      await page.locator('[data-lead-start="investor"]').click();
      assert.equal(await page.locator('#lead-route-value').inputValue(), 'investor');
      await page.locator('#deck-open').click();
      const deck = page.locator('#deck-modal[open]');
      await deck.waitFor();
      const economics = deck.locator('#deck-economics');
      await economics.waitFor();
      for (const id of ['diagnostic','cases','engagement','evidence']) {
        assert.equal(await deck.locator('#deck-'+id+' .deck-item').count(), id==='evidence'?3:3, lang+' '+id);
      }
      const metrics = economics.locator('[data-economics-results]');
      assert.equal(await metrics.isVisible(), false, lang+' initially hidden');
      await economics.locator('[data-economics-action="sample"]').click();
      assert.equal(await metrics.isVisible(), true, lang+' metrics shown');
      assert.ok((await economics.locator('[data-economics-result="days"]').textContent()).includes('91'), '91.25-day baseline');
      const fictional = await economics.locator('[data-economics-status]').textContent();
      assert.ok(lang==='ru' ? fictional.includes('вымышлены') : fictional.includes('fictional'));
      await economics.locator('[data-economics="days"]').fill('140');
      const interpretation = await economics.locator('[data-economics-interpretation]').textContent();
      assert.ok(lang==='ru' ? interpretation.includes('большего среднего запаса') : interpretation.includes('higher average inventory'));
      const edited = await economics.locator('[data-economics-status]').textContent();
      assert.ok(lang==='ru' ? edited.includes('не проверены') : edited.includes('unverified'));
      await economics.locator('[data-economics="cogs"]').fill('0');
      assert.equal(await metrics.isVisible(), false, 'invalid data must hide metrics');
      await economics.locator('[data-economics="cogs"]').fill('120000000');
      assert.equal(await metrics.isVisible(), true, 'metrics recover');
      await economics.scrollIntoViewIfNeeded();
      await page.screenshot({ path: screenshots+'/advisory-'+lang+'-'+width+'.png', animations: 'disabled' });
      const overflow = await deck.locator('.modal-body').evaluate(el=>el.scrollWidth > el.clientWidth + 3);
      assert.equal(overflow, false, lang+'/'+width+' deck overflows horizontally');
      await economics.locator('[data-economics-action="contact"]').click();
      await deck.waitFor({ state: 'hidden' });
      assert.equal(await page.locator('#topic').inputValue(), 'consulting');
      assert.equal(await page.locator('#lead-route-value').inputValue(), 'client');
      assert.equal(await page.locator('#lead-project-value').inputValue(), '');
      assert.equal(await page.locator('#topic-other').inputValue(), '');
      const leadGoal = await page.locator('#lead-goal-value').inputValue();
      assert.ok(lang === 'ru' ? leadGoal.includes('оборотного капитала') : leadGoal.includes('working capital'));
      const msg = await page.locator('#form [name="message"]').inputValue();
      assert.ok(!msg.includes('120000000'), 'No financial inputs copied into lead message');
      // Assert the actual outbound contact envelope, not only visible form values.
      // Contact endpoint and Turnstile are mocked on localhost, not live acceptance.
      let delivered = null;
      await page.route('**/api/contact', async route => {
        delivered = route.request().postDataJSON();
        await route.fulfill({status:200,contentType:'text/plain',body:'ok'});
      });
      await page.evaluate(() => {
        const root = document.querySelector('#turnstile-widget');
        const token = document.createElement('input');
        token.type = 'hidden';
        token.name = 'cf-turnstile-response';
        token.value = 'ci-only-token';
        root.append(token);
      });
      await page.locator('#form [name="name"]').fill('QA Advisory Contact');
      await page.locator('#email').fill('qa-advisory@example.org');
      await page.locator('#consent').check();
      assert.equal(await page.locator('#submit').isEnabled(), true, 'valid consented lead can submit');
      await page.locator('#submit').click();
      await page.waitForFunction(() => document.querySelector('#form-note')?.classList.contains('ok'));
      assert.ok(delivered, 'Client advisory lead was not submitted');
      assert.equal(delivered.leadRoute, 'client');
      assert.equal(delivered.topic, 'consulting');
      assert.equal(delivered.leadProject || '', '');
      assert.ok(delivered.leadGoal, 'No advisory lead goal');
      const envelope = JSON.stringify(delivered);
      for (const sensitive of ['120000000','30000000','averageInventory','annualCogs','targetDays']) {
        assert.ok(!envelope.includes(sensitive), 'Financial model input leaked to enquiry: ' + sensitive);
      }
      await page.close();
    }
  }
  assert.deepEqual(uncaught, [], 'No uncaught client exceptions');
  console.log('PASS: RU/EN, 375/768/1440 advisory deck, scenario calculator and privacy-safe lead route.');
} finally {
  await browser.close();
}
