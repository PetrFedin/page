#!/usr/bin/env node
/**
 * Read-only public-site browser admission for V2 preview.
 * Required: PREVIEW_URL=https://... EXPECTED_SHA=<40-hex>
 * This test never sends the contact form or writes user/backend data.
 * Third-party Turnstile is stubbed; therefore delivery is NOT verified.
 */
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const base = new URL(process.env.PREVIEW_URL || '');
const expectedSha = process.env.EXPECTED_SHA || '';
assert.equal(base.protocol, 'https:');
assert.equal(base.pathname, '/');
assert.match(expectedSha, /^[0-9a-f]{40}$/);
assert.ok(!['syntha.pro', 'www.syntha.pro'].includes(base.hostname));

const out = 'qa-artifacts';
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
const passed = [];
try {
  for (const lang of ['ru','en']) {
    for (const width of [390,1440]) {
      const page = await browser.newPage({
        viewport: { width, height: 880 },
        reducedMotion: 'reduce',
        locale: lang === 'ru' ? 'ru-RU' : 'en-US'
      });
      const errors = [];
      page.on('pageerror', error => errors.push(String(error)));
      page.on('response', response => {
        if (response.url().startsWith(base.origin + '/') && response.status() >= 400) {
          errors.push('HTTP ' + response.status() + ' ' + response.url());
        }
      });
      // Public Turnstile sitekey/contacts are Cloudflare Pages-specific and not
      // admissible on a static Netlify preview. Do not infer contact delivery.
      await page.route('https://challenges.cloudflare.com/**', route =>
        route.fulfill({ status: 200, contentType: 'text/javascript', body: '' }));
      const root = lang === 'en' ? '/en/' : '/';
      const home = await page.goto(new URL(root, base).href, { waitUntil: 'domcontentloaded' });
      assert.equal(home.status(), 200, lang + '/' + width + ' homepage status');
      assert.equal(await page.locator('meta[name="syntha-build-commit"]').getAttribute('content'),
        expectedSha, 'Live HTML source SHA');
      await page.locator('#cards>.card').first().waitFor();
      const featured = await page.locator('#cards>.card').evaluateAll(nodes =>
        nodes.map(node => node.dataset.project));
      assert.deepEqual(featured, ['syntha','chatx','renova'],
        'Only three flagship projects visible until expansion');
      assert.equal(await page.locator('#services li').count(), 5, 'Five advisory services');
      assert.equal(await page.locator('#facts-bar>.fact-card').count(), 5,
        'Five expertise cards, including business systems integration');
      assert.equal(await page.locator('#facts-bar [data-area="systems-integration"]').count(), 1,
        'Distinct systems integration expertise is present');
      if (width === 1440) {
        const cells = await page.locator('#services>li').evaluateAll(nodes =>
          nodes.map(x=>({x:x.getBoundingClientRect().x,y:x.getBoundingClientRect().y,w:x.getBoundingClientRect().width})));
        assert.ok(cells.every(x=>Math.abs(x.y-cells[0].y)<5),
          'Five advisory cards must share one desktop row');
        assert.ok(Math.max(...cells.map(x=>x.w))-Math.min(...cells.map(x=>x.w))<5,
          'Advisory cards must have equal widths');
      }
      await page.locator('#projects-more').click();
      assert.equal(await page.locator('#cards>.card').count(), 11,
        'Eleven projects available after expansion');
      const svedo = page.locator('#cards [data-open="fintech"]');
      await svedo.click();
      await page.locator('#modal[open]').waitFor();
      assert.match(await page.locator('#modal').innerText(), /SVEDO/,
        'SVEDO dossier visible');
      assert.ok(await page.locator('#project-capabilities:not([hidden]) .project-table tbody tr').count() >= 4,
        'SVEDO capability matrix populated');
      await page.screenshot({ path: out + '/published-svedo-' + lang + '-' + width + '.png' });
      await page.locator('#modal-close').click();
      await page.locator('#modal').waitFor({ state:'hidden' });
      const details = page.locator('#consulting-formats-extended');
      await details.locator('summary').click();
      assert.equal(await details.locator('.format').count(), 4, 'Consulting formats expand');
      const overflow = await page.evaluate(() =>
        document.documentElement.scrollWidth > document.documentElement.clientWidth + 2);
      assert.equal(overflow, false, 'No viewport overflow');
      assert.deepEqual(errors, [], 'No page exceptions or missing same-origin resources');
      passed.push(lang + ':' + width + ':home+projects+modal+consulting');
      await page.close();
    }
    const page = await browser.newPage({ viewport:{ width: 390, height:850 } });
    const prefix = lang === 'en' ? '/en/' : '/';
    page.on('pageerror', error => { throw error; });
    let r = await page.goto(new URL(prefix + 'analytics.html',base).href);
    assert.equal(r.status(), 200, 'Analytics route');
    assert.equal(await page.locator('.detail-process li').count(), 5);
    r = await page.goto(new URL(prefix + 'economics.html',base).href);
    assert.equal(r.status(), 200, 'Economics route');
    const studio = page.locator('#opportunities');
    await studio.locator('[data-op-mode]').first().waitFor();
    assert.equal(await studio.locator('[data-op-mode]').count(), 4);
    await studio.locator('[data-op-action="example"]').click();
    assert.equal(await studio.locator('[data-op-metrics]').isVisible(), true,
      'Economics example calculates metrics');
    passed.push(lang + ':analytics+economics-example');
    await page.close();
  }
  console.log(JSON.stringify({
    success: true,
    url: base.origin + '/',
    verified_sha: expectedSha,
    assertions: passed,
    exclusions:['live Turnstile', 'contact delivery', 'Cloudflare Pages Functions', 'Telegram']
  }, null, 2));
} finally {
  await browser.close();
}
