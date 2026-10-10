import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';

const baseUrl = process.env.V2_BASE_URL || 'http://127.0.0.1:4321/?v=2&qa=ci';
const outputDir = process.env.V2_QA_OUTPUT || 'artifacts/v2-browser';
const projects = ['syntha', 'fashionmgmt', 'furproduction', 'mfw', 'promomed', 'chatx', 'antiqua', 'renova'];
const viewports = [
  { name: 'desktop', width: 1440, height: 1000 },
  { name: 'tablet', width: 834, height: 1112 },
  { name: 'phone', width: 390, height: 844 }
];

await mkdir(outputDir, { recursive: true });
const browser = await chromium.launch({ headless: true });
const failures = [];

function assert(condition, message) {
  if (!condition) failures.push(message);
}

async function clickInReadingPosition(page, locator, label) {
  await locator.evaluate((element) => {
    element.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'instant' });
  });
  await page.waitForTimeout(40);

  const hit = await locator.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    const x = Math.max(0, Math.min(window.innerWidth - 1, rect.left + rect.width / 2));
    const y = Math.max(0, Math.min(window.innerHeight - 1, rect.top + rect.height / 2));
    const target = document.elementFromPoint(x, y);
    return {
      ok: target === element || element.contains(target),
      x,
      y,
      rect: { left: rect.left, top: rect.top, width: rect.width, height: rect.height },
      target: target ? `${target.tagName.toLowerCase()}${target.id ? `#${target.id}` : ''}${target.className ? `.${String(target.className).trim().replace(/\s+/g, '.')}` : ''}` : 'none'
    };
  });

  assert(hit.ok, `${label}: center hit ${hit.target} at ${Math.round(hit.x)},${Math.round(hit.y)} for ${JSON.stringify(hit.rect)}`);
  if (!hit.ok) return false;

  await page.mouse.click(hit.x, hit.y);
  await page.waitForTimeout(40);
  return true;
}

for (const viewport of viewports) {
  const page = await browser.newPage({ viewport: { width: viewport.width, height: viewport.height } });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const pageErrors = [];
  const badResponses = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  page.on('response', (response) => {
    if (response.status() >= 400) badResponses.push(`${response.status()} ${response.url()}`);
  });

  await page.goto(`${baseUrl}&viewport=${viewport.name}`, { waitUntil: 'networkidle' });
  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = 'auto';
    document.body.style.scrollBehavior = 'auto';
  });

  const portfolio = page.locator('#v2-portfolio');
  const projectsSection = page.locator('#projects');
  const mediaSection = page.locator('#media');

  assert(!(await portfolio.isVisible()), `${viewport.name}: duplicate portfolio overview must stay hidden`);
  assert(!(await mediaSection.isVisible()), `${viewport.name}: separate publications section must stay hidden`);
  assert(await projectsSection.isVisible(), `${viewport.name}: projects section is not visible`);
  assert(await projectsSection.evaluate((element) => element.classList.contains('v2-project-index')), `${viewport.name}: projects is not the unified deep-dive surface`);
  assert(await page.locator('#v2-index-transition').count() === 0, `${viewport.name}: obsolete overview/deep-dive bridge is still present`);

  const startHead = page.locator('#v2-steps > .section-head.v2-start-head');
  assert(await startHead.count() === 1, `${viewport.name}: start section does not use standard section-head styling`);

  const projectsMore = page.locator('#projects-more');
  if (await projectsMore.isVisible() && (await projectsMore.getAttribute('aria-expanded')) !== 'true') {
    await clickInReadingPosition(page, projectsMore, `${viewport.name}: projects show more`);
  }
  const indexCards = page.locator('#cards > .card');
  assert(await indexCards.count() === projects.length, `${viewport.name}: expected ${projects.length} deep-dive rows`);

  for (let index = 0; index < await indexCards.count(); index += 1) {
    const card = indexCards.nth(index);
    assert(await card.evaluate((element) => element.classList.contains('v2-index-card')), `${viewport.name}: row ${index + 1} missing v2-index-card`);
    assert(await card.locator('.v2-index-card-head').count() === 1, `${viewport.name}: row ${index + 1} missing index head`);
    assert(await card.locator('.v2-index-signals > div').count() === 4, `${viewport.name}: row ${index + 1} must contain four executive signals`);
    assert(await card.locator('.v2-index-primary .btn').count() >= 1, `${viewport.name}: row ${index + 1} missing primary action`);
    const more = card.locator('.v2-index-more');
    if (await more.count()) {
      const summary = more.locator('summary');
      const opened = await clickInReadingPosition(page, summary, `${viewport.name}: row ${index + 1} more actions`);
      if (opened) {
        assert(await more.evaluate((element) => element.open), `${viewport.name}: row ${index + 1} more actions did not open`);
        assert(await more.locator('.v2-index-more-menu .btn').count() >= 1, `${viewport.name}: row ${index + 1} more actions menu is empty`);
        await clickInReadingPosition(page, summary, `${viewport.name}: row ${index + 1} close more actions`);
      }
    }
  }

  const firstOpen = indexCards.first().locator('[data-open]');
  const dossierClick = await clickInReadingPosition(page, firstOpen, `${viewport.name}: first dossier`);
  const modal = page.locator('#modal');
  if (dossierClick) {
    assert(await modal.evaluate((element) => element.hasAttribute('open')), `${viewport.name}: project dossier did not open`);
    await page.locator('#modal-close').click();
  }

  // Language switch must stay in-page: no reload, no transient viewport/body shrink.
  await page.evaluate(() => { window.__v2LanguageSentinel = 'alive'; });
  const langToggle = page.locator('#lang-toggle');
  const beforeSwitch = await page.evaluate(() => ({
    width: document.documentElement.getBoundingClientRect().width,
    viewport: window.innerWidth,
    scrollY: window.scrollY
  }));
  await clickInReadingPosition(page, langToggle, `${viewport.name}: language toggle`);
  await page.waitForTimeout(260);
  const afterSwitch = await page.evaluate(() => ({
    sentinel: window.__v2LanguageSentinel,
    lang: document.documentElement.lang,
    path: location.pathname,
    width: document.documentElement.getBoundingClientRect().width,
    viewport: window.innerWidth
  }));
  assert(afterSwitch.sentinel === 'alive', `${viewport.name}: language switch caused a full reload`);
  assert(afterSwitch.lang === 'en' && afterSwitch.path.startsWith('/en'), `${viewport.name}: language switch did not update language/path`);
  assert(Math.abs(afterSwitch.width - beforeSwitch.width) <= 1, `${viewport.name}: page width changed during language switch ${beforeSwitch.width} -> ${afterSwitch.width}`);
  assert(afterSwitch.viewport === beforeSwitch.viewport, `${viewport.name}: viewport width changed during language switch`);
  assert(!(await portfolio.isVisible()), `${viewport.name}: portfolio duplicate became visible after language switch`);
  assert(!(await mediaSection.isVisible()), `${viewport.name}: media duplicate became visible after language switch`);

  const overflow = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    viewportWidth: window.innerWidth
  }));
  assert(overflow.scrollWidth === overflow.viewportWidth, `${viewport.name}: horizontal overflow ${overflow.scrollWidth}/${overflow.viewportWidth}`);
  assert(pageErrors.length === 0, `${viewport.name}: page errors: ${pageErrors.join(' | ')}`);
  assert(badResponses.length === 0, `${viewport.name}: HTTP errors: ${badResponses.join(' | ')}`);

  await projectsSection.screenshot({ path: `${outputDir}/projects-${viewport.name}.png` });
  await page.locator('#v2-steps').screenshot({ path: `${outputDir}/start-${viewport.name}.png` });
  await page.close();
}

await browser.close();

if (failures.length) {
  console.error('V2 browser smoke failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('V2 browser smoke passed for desktop, tablet and phone.');
