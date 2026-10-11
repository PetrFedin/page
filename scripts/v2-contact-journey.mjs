import assert from 'node:assert/strict';
import { readFile, mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';

// A client can start from either language on any supported viewport.
// This is deliberately an end-to-end test of the existing V2 preview,
// NOT an attempt to send contact details to the production API.
const origin = (process.env.V2_SITE_ORIGIN || 'http://127.0.0.1:4321').replace(/\/$/, '');
const output = process.env.V2_QA_OUTPUT || 'artifacts/v2-browser';
const viewports = [
  { name: 'desktop', width: 1440, height: 1000 },
  { name: 'tablet', width: 834, height: 1112 },
  { name: 'phone', width: 390, height: 844 },
  { name: 'narrow-phone', width: 320, height: 700 }
];
const errors = [];
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });

async function scenario(viewport, lang) {
  const label = `${viewport.name}/${lang}`;
  const page = await browser.newPage({
    viewport: { width: viewport.width, height: viewport.height },
    acceptDownloads: true
  });
  // Fail quickly per scenario rather than spending 8 × 30 s on a missing
  // interactive control. This makes broken contact journeys actionable in CI.
  page.setDefaultTimeout(8000);
  page.setDefaultNavigationTimeout(15000);
  const apiRequests = [];
  const runtimeErrors = [];
  page.on('request', (request) => {
    if (new URL(request.url()).pathname === '/api/contact') apiRequests.push(request.url());
  });
  page.on('pageerror', (error) => runtimeErrors.push(error.message));

  try {
    const path = lang === 'en' ? '/en/' : '/';
    const response = await page.goto(`${origin}${path}?v=2&qa=contact-journey`, { waitUntil: 'networkidle' });
    assert.equal(response?.status(), 200, `${label}: direct entry must be available`);
    assert.equal(await page.locator('html').getAttribute('lang'), lang);
    assert.equal(await page.locator('html').getAttribute('data-preview'), 'v2');

    // First commercial decision: choose a real service and follow through.
    await page.locator('[data-v2-start-mode="product"]').click();
    assert.equal(await page.locator('[data-v2-start-mode="product"]').getAttribute('aria-pressed'), 'true');
    assert.equal(await page.locator('[data-v2-start-continue="product"]').count(), 1);
    await page.locator('[data-v2-start-continue="product"]').click();
    assert.equal(await page.locator('#topic').inputValue(), 'launch', `${label}: project brief topic`);
    const brief = await page.locator('#form [name="message"]').inputValue();
    assert.ok(brief.length > 30, `${label}: selected route must prepare a meaningful brief`);
    assert.ok(brief.includes(lang === 'en' ? 'digital product' : 'цифровой продукт'), `${label}: correct language brief`);

    // Preview must not collect data remotely. Client can instead take a local copy.
    assert.match(await page.locator('#v2-form-note').innerText(), lang === 'en' ? /does not send or save/ : /не отправляет и не сохраняет/);
    await page.locator('#form [name="name"]').fill('Preview QA');
    await page.locator('#email').fill('qa@example.org');
    await page.locator('#consent').check();
    assert.equal(await page.locator('#submit').isEnabled(), true, `${label}: validated form should enable the button`);
    await page.locator('#submit').click();
    const success = await page.locator('#form-note').innerText();
    assert.match(success, lang === 'en' ? /nothing was sent/ : /не отправлена/, `${label}: no deceptive success acknowledgement`);
    assert.equal(apiRequests.length, 0, `${label}: preview must not submit personal data`);

    // Changing contact method must never retain a stale, invisible contact value.
    await page.locator('#v2-contact-method').selectOption('telegram');
    assert.equal(await page.locator('#email').inputValue(), 'qa@example.org', `${label}: switching method preserves email draft`);
    assert.equal(await page.locator('#email').isDisabled(), true, `${label}: hidden email is excluded from FormData`);
    assert.equal(await page.locator('#email').isVisible(), false, `${label}: irrelevant email field hidden`);
    assert.equal(await page.locator('#telegram').isVisible(), true, `${label}: Telegram entry visible`);
    assert.equal(await page.locator('#submit').isDisabled(), true, `${label}: missing new contact blocked`);
    await page.locator('#telegram').fill('@preview_qa');
    assert.equal(await page.locator('#submit').isEnabled(), true, `${label}: Telegram contact accepted`);

    await page.locator('#v2-contact-method').selectOption('phone');
    assert.equal(await page.locator('#telegram').inputValue(), '@preview_qa', `${label}: switching method preserves Telegram draft`);
    assert.equal(await page.locator('#telegram').isDisabled(), true, `${label}: hidden Telegram is excluded from FormData`);
    assert.equal(await page.locator('#telegram').isVisible(), false, `${label}: irrelevant Telegram field hidden`);
    assert.equal(await page.locator('#phone').isVisible(), true, `${label}: phone entry visible`);
    assert.equal(await page.locator('#submit').isDisabled(), true, `${label}: missing phone blocked`);
    await page.locator('#phone').fill('+31 20 123 4567');
    assert.equal(await page.locator('#submit').isEnabled(), true, `${label}: phone contact accepted`);
    assert.deepEqual(await page.locator('#form').evaluate((form) => Array.from(new FormData(form).keys()).filter((key) => ['email','telegram','phone'].includes(key))), ['phone'], `${label}: only selected contact reaches the form payload`);
    await page.locator('#submit').click();
    assert.match(await page.locator('#form-note').innerText(), lang === 'en' ? /nothing was sent/ : /не отправлена/);

    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.locator('#v2-draft').click()
    ]);
    const draft = await readFile(await download.path(), 'utf8');
    assert.match(draft, /Preview QA/, `${label}: downloaded brief contains chosen name`);
    assert.match(draft, /\+31 20 123 4567/, `${label}: downloaded brief contains selected method`);
    assert.ok(draft.includes(brief), `${label}: prepared brief survives download`);
    assert.match(draft, lang === 'en' ? /not sent/ : /никуда не отправлен/, `${label}: draft clearly marked as local`);
    assert.equal(apiRequests.length, 0, `${label}: draft must not trigger API request`);

    // Both languages use one complete flow, with a readable contact panel.
    await page.locator('#contact').screenshot({ style: 'header.topbar, #cta-bar { visibility: hidden !important; }', path: `${output}/contact-${lang}-${viewport.name}.png` });
    assert.deepEqual(runtimeErrors, [], `${label}: uncaught browser errors`);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    assert.equal(overflow, false, `${label}: horizontal scrolling`);
  } finally {
    await page.close();
  }
}

for (const viewport of viewports) {
  for (const lang of ['ru', 'en']) {
    try {
      await scenario(viewport, lang);
      console.log(`PASS ${viewport.name}/${lang}: selection → prefilled brief → validation → method changes → local draft`);
    } catch (error) {
      errors.push(`${viewport.name}/${lang}: ${error.stack || error.message}`);
    }
  }
}
await browser.close();
if (errors.length) {
  errors.forEach((error) => console.error(`FAIL ${error}`));
  process.exit(1);
}
console.log('V2 contact journey: 8/8 RU/EN viewport routes passed; no contact API calls.');
