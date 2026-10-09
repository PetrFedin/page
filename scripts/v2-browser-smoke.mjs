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

async function clickInReadingPosition(locator) {
  await locator.evaluate((element) => element.scrollIntoView({ block: 'center', inline: 'nearest' }));
  await locator.page().waitForTimeout(80);
  await locator.click();
}

for (const viewport of viewports) {
  const page = await browser.newPage({ viewport: { width: viewport.width, height: viewport.height } });
  const pageErrors = [];
  const badResponses = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  page.on('response', (response) => {
    if (response.status() >= 400) badResponses.push(`${response.status()} ${response.url()}`);
  });

  await page.goto(`${baseUrl}&viewport=${viewport.name}`, { waitUntil: 'networkidle' });

  const portfolio = page.locator('#v2-portfolio');
  const projectsSection = page.locator('#projects');
  await portfolio.scrollIntoViewIfNeeded();

  assert(await portfolio.isVisible(), `${viewport.name}: portfolio is not visible`);
  assert(await projectsSection.isVisible(), `${viewport.name}: projects section is not visible`);
  assert(await projectsSection.evaluate((element) => element.classList.contains('v2-project-index')), `${viewport.name}: projects is not a deep-dive index`);

  const transition = page.locator('#v2-index-transition');
  assert(await transition.isVisible(), `${viewport.name}: transition label is not visible`);
  const transitionPlacement = await transition.evaluate((element) => element.previousElementSibling?.classList.contains('section-head') ?? false);
  assert(transitionPlacement, `${viewport.name}: transition label is not placed after section heading`);

  const sectionGap = await page.evaluate(() => {
    const portfolioElement = document.querySelector('#v2-portfolio');
    const projectsElement = document.querySelector('#projects');
    if (!portfolioElement || !projectsElement) return Number.POSITIVE_INFINITY;
    const portfolioRect = portfolioElement.getBoundingClientRect();
    const projectsRect = projectsElement.getBoundingClientRect();
    return Math.round(projectsRect.top - portfolioRect.bottom);
  });
  assert(sectionGap >= -2 && sectionGap <= 40, `${viewport.name}: portfolio/projects gap is ${sectionGap}px`);

  const showMore = page.locator('#v2-portfolio-more');
  if (await showMore.isVisible()) await clickInReadingPosition(showMore);
  const portfolioIds = await page.locator('#v2-portfolio-grid [data-v2-product]').evaluateAll((nodes) => nodes.map((node) => node.dataset.v2Product));
  assert(JSON.stringify(portfolioIds) === JSON.stringify(projects), `${viewport.name}: portfolio order mismatch: ${portfolioIds.join(',')}`);

  const projectsMore = page.locator('#projects-more');
  if (await projectsMore.isVisible() && (await projectsMore.getAttribute('aria-expanded')) !== 'true') await clickInReadingPosition(projectsMore);
  const indexCards = page.locator('#cards > .card');
  assert(await indexCards.count() === projects.length, `${viewport.name}: expected ${projects.length} deep-dive rows`);

  for (let index = 0; index < await indexCards.count(); index += 1) {
    const card = indexCards.nth(index);
    assert(await card.evaluate((element) => element.classList.contains('v2-index-card')), `${viewport.name}: row ${index + 1} missing v2-index-card`);
    assert(await card.locator('.v2-index-card-head').count() === 1, `${viewport.name}: row ${index + 1} missing index head`);
    assert(await card.locator('.v2-index-primary .btn').count() >= 1, `${viewport.name}: row ${index + 1} missing primary action`);
    const more = card.locator('.v2-index-more');
    if (await more.count()) {
      const summary = more.locator('summary');
      await clickInReadingPosition(summary);
      assert(await more.evaluate((element) => element.open), `${viewport.name}: row ${index + 1} more actions did not open`);
      assert(await more.locator('.v2-index-more-menu .btn').count() >= 1, `${viewport.name}: row ${index + 1} more actions menu is empty`);
      await clickInReadingPosition(summary);
    }
  }

  const firstOpen = indexCards.first().locator('[data-open]');
  await clickInReadingPosition(firstOpen);
  const modal = page.locator('#modal');
  assert(await modal.evaluate((element) => element.hasAttribute('open')), `${viewport.name}: project dossier did not open`);
  await page.locator('#modal-close').click();

  const overflow = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    viewportWidth: window.innerWidth
  }));
  assert(overflow.scrollWidth === overflow.viewportWidth, `${viewport.name}: horizontal overflow ${overflow.scrollWidth}/${overflow.viewportWidth}`);
  assert(pageErrors.length === 0, `${viewport.name}: page errors: ${pageErrors.join(' | ')}`);
  assert(badResponses.length === 0, `${viewport.name}: HTTP errors: ${badResponses.join(' | ')}`);

  await portfolio.screenshot({ path: `${outputDir}/portfolio-${viewport.name}.png` });
  await projectsSection.screenshot({ path: `${outputDir}/projects-${viewport.name}.png` });
  await page.close();
}

await browser.close();

if (failures.length) {
  console.error('V2 browser smoke failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('V2 browser smoke passed for desktop, tablet and phone.');
