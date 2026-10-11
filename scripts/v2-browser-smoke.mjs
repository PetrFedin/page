import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';

const baseUrl = process.env.V2_BASE_URL || 'http://127.0.0.1:4321/?v=2&qa=ci';
const outputDir = process.env.V2_QA_OUTPUT || 'artifacts/v2-browser';
const projects = ['syntha', 'fashionmgmt', 'furproduction', 'marcopescarolo', 'mfw', 'promomed', 'chatx', 'antiqua', 'renova', 'igra'];
const viewports = [
  { name: 'desktop', width: 1440, height: 1000 },
  { name: 'tablet', width: 834, height: 1112 },
  { name: 'phone', width: 390, height: 844 },
  { name: 'narrow-phone', width: 320, height: 700 }
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

  await page.screenshot({ path: `${outputDir}/hero-ru-${viewport.name}.png` });

  // Each top-news teaser must link to the unique feed post key, not a shared date.
  const topNewsKey = await page.locator('#top-news').getAttribute('data-date');
  assert(Boolean(topNewsKey), `${viewport.name}: top-news has no stable post id`);
  assert(await page.locator(`#feed .post[data-post="${topNewsKey}"]`).count() === 1,
    `${viewport.name}: top-news item does not resolve to the visible feed post ${topNewsKey}`);

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

  // Start choices should follow the editorial serif treatment, not heavy bold CTA typography.
  const startModeTitles = page.locator('#v2-steps .v2-start-mode > strong');
  assert(await startModeTitles.count() === 4, `${viewport.name}: expected four start modes`);
  const startTypography = await startModeTitles.evaluateAll((elements) =>
    elements.map((element) => ({
      weight: Number(getComputedStyle(element).fontWeight),
      family: getComputedStyle(element).fontFamily
    }))
  );
  assert(startTypography.every(({ weight, family }) => weight <= 500 && family.includes('Georgia')),
    `${viewport.name}: start cards should have normal/medium serif headings: ${JSON.stringify(startTypography)}`);
  const emptyWeight = await page.locator('#v2-start-panel .v2-start-empty strong')
    .evaluate((element) => Number(getComputedStyle(element).fontWeight));
  assert(emptyWeight <= 500, `${viewport.name}: empty state has heavy bold typography: ${emptyWeight}`);

  const firstStartMode = page.locator('#v2-steps .v2-start-mode').first();
  if (await clickInReadingPosition(page, firstStartMode, `${viewport.name}: start mode`)) {
    assert((await firstStartMode.getAttribute('aria-pressed')) === 'true',
      `${viewport.name}: start mode was not selected`);
    assert(await page.locator('#v2-start-panel .v2-start-selected').count() === 1,
      `${viewport.name}: start checklist did not open`);
  }
  await page.locator('#v2-steps').screenshot({ style: 'header.topbar, #cta-bar { visibility: hidden !important; }', path: `${outputDir}/start-ru-${viewport.name}.png` });

  // The floating legacy contact CTA cannot obscure readable text in V2.
  assert(!(await page.locator('#cta-bar').isVisible()),
    `${viewport.name}: legacy floating contact action overlays V2 content`);

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
    const kinds = await card.locator('.v2-index-signals > div').evaluateAll((cells) =>
      cells.map((cell) => cell.getAttribute('data-signal')));
    assert(kinds.join(',') === 'challenge,value,built,next',
      `${viewport.name}: row ${index + 1} is missing the challenge / value / built / next sequence: ${kinds}`);
    const valueLabel = await card.locator('[data-signal="value"] span').textContent();
    assert(valueLabel?.includes('гипотеза'), `${viewport.name}: row ${index + 1} must label potential value as an unproven hypothesis`);
    const lengths = await card.locator('.v2-index-signals p').evaluateAll((elements) => elements.map((e) => e.textContent.trim().length));
    assert(lengths.length === 4 && lengths.every((len) => len > 25 && len < 180),
      `${viewport.name}: row ${index + 1} text is missing, excessive or truncated at source: ${lengths}`);
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

  const withoutScreens = ['fashionmgmt','furproduction','antiqua','igra','marcopescarolo'];
  for (const projectId of withoutScreens) {
    const logo = page.locator(`#cards > .card[data-project="${projectId}"] .card-logo svg[data-brand="${projectId}"]`);
    assert(await logo.count() === 1, `${viewport.name}: missing SVG identity for ${projectId}`);
    if (await logo.count()) {
      const bounds = await logo.boundingBox();
      assert(Boolean(bounds && bounds.width > 85 && bounds.height > 15),
        `${viewport.name}: ${projectId} wordmark too small or clipped: ${JSON.stringify(bounds)}`);
    }
  }

  const firstOpen = indexCards.first().locator('[data-open]');
  const dossierClick = await clickInReadingPosition(page, firstOpen, `${viewport.name}: first dossier`);
  const modal = page.locator('#modal');
  if (dossierClick) {
    assert(await modal.evaluate((element) => element.hasAttribute('open')), `${viewport.name}: project dossier did not open`);
    await page.locator('#modal-close').click();
  }

  for (const projectId of withoutScreens) {
    const projectCard = page.locator(`#cards > .card[data-project="${projectId}"]`);
    assert(await projectCard.count() === 1, `${viewport.name}: missing project row ${projectId}`);
    const opened = await clickInReadingPosition(page, projectCard.locator('[data-open]'), `${viewport.name}: open ${projectId} dossier without screenshots`);
    if (opened) {
      assert(await modal.getAttribute('data-project') === projectId, `${viewport.name}: wrong dossier for ${projectId}`);
      assert(await modal.locator(`#modal-logo svg[data-brand="${projectId}"]`).count() === 1, `${viewport.name}: missing logo in ${projectId} dossier`);
      assert(await modal.locator('#gallery img, #gallery video, #gallery .frame').count() === 0,
        `${viewport.name}: unpublished screenshots inserted for ${projectId}`);
      assert(!(await modal.locator('#gallery').isVisible()) && !(await modal.locator('#dots').isVisible()),
        `${viewport.name}: empty gallery controls visible for ${projectId}`);
      assert(await modal.locator('#facts').isVisible(), `${viewport.name}: ${projectId} dossier content vanished`);
      await page.locator('#modal-close').click();
    }
  }

  const marcoDemo = page.locator('#cards > .card[data-project="marcopescarolo"] [data-demo-link="marcopescarolo"]');
  assert(await marcoDemo.count() === 1, `${viewport.name}: Marco published showroom link missing`);
  if (await marcoDemo.count()) {
    assert(await marcoDemo.getAttribute('href') === 'https://marco-pescarolo-showroom.netlify.app/',
      `${viewport.name}: Marco showroom link points to unverified destination`);
    assert((await marcoDemo.getAttribute('rel') || '').includes('noopener'),
      `${viewport.name}: Marco outbound link lacks noopener`);
    // Secondary links live in the progressive 'More actions' disclosure.
    const marcoMore = page.locator('#cards > .card[data-project="marcopescarolo"] .v2-index-more');
    if (await marcoMore.count() && !(await marcoMore.evaluate((el) => el.open))) {
      await clickInReadingPosition(page, marcoMore.locator('summary'),
        `${viewport.name}: expand Marco more actions`);
    }
    const [demoTab] = await Promise.all([
      page.context().waitForEvent('page', { timeout: 12000 }),
      clickInReadingPosition(page, marcoDemo, `${viewport.name}: open Marco live showroom`)
    ]);
    assert(demoTab.url().startsWith('https://marco-pescarolo-showroom.netlify.app/'),
      `${viewport.name}: Marco live showroom did not open in new tab: ${demoTab.url()}`);
    assert(!(await page.locator('#modal').evaluate((el) => el.hasAttribute('open'))),
      `${viewport.name}: external demo click also opened the project dossier`);
    await demoTab.close();
  }

  // Requested projects must open in the real existing dossier with correct labels.
  for (const projectId of ['igra','marcopescarolo']) {
    const card = page.locator(`#cards > .card[data-project="${projectId}"]`);
    assert(await card.locator('[data-signal="challenge"],[data-signal="next"]').count() === 2,
      `${viewport.name}: ${projectId} lacks executive stage and next step`);
    if (await clickInReadingPosition(page, card.locator('[data-open]'), `${viewport.name}: ${projectId} dossier`)) {
      assert(await modal.getAttribute('data-project') === projectId, `${viewport.name}: incorrect ${projectId} dossier`);
      assert(await modal.locator('#facts').isVisible(), `${viewport.name}: ${projectId} detail vanished`);
      await page.locator('#modal-cta').click();
      const chosenTopic = await page.locator('#topic').inputValue();
      assert(chosenTopic === (projectId === 'igra' ? 'launch' : 'partnership'),
        `${viewport.name}: ${projectId} CTA opened invalid topic: ${chosenTopic}`);
      const message = await page.locator('#form [name="message"]').inputValue();
      assert(message.includes(projectId === 'igra' ? 'IGRA' : 'Marco Pescarolo'),
        `${viewport.name}: ${projectId} CTA lost project context`);
      await page.locator('#form [name="message"]').fill('');
    }
  }

  // Capture the Russian project index before the in-place language switch.
  await projectsSection.screenshot({ style: 'header.topbar, #cta-bar { visibility: hidden !important; }', path: `${outputDir}/projects-ru-${viewport.name}.png` });

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
  for (const projectId of ['fashionmgmt','furproduction','antiqua']) {
    const card = page.locator(`#cards > .card[data-project="${projectId}"]`);
    if (await clickInReadingPosition(page, card.locator('[data-open]'), `${viewport.name}: EN ${projectId} dossier`)) {
      assert(!(await page.locator('#gallery').isVisible()), `${viewport.name}: EN ${projectId} gallery reappeared`);
      assert(await page.locator('#gallery img, #gallery video').count() === 0,
        `${viewport.name}: EN ${projectId} screenshot was rendered`);
      await page.locator('#modal-close').click();
    }
  }
  const englishCards = page.locator('#cards > .card');
  assert(await englishCards.count() === projects.length,
    `${viewport.name}: English language switch lost project cards`);
  for (let i = 0; i < await englishCards.count(); i += 1) {
    const card = englishCards.nth(i);
    const kinds = await card.locator('.v2-index-signals > div').evaluateAll((cells) =>
      cells.map((cell) => cell.getAttribute('data-signal')));
    assert(kinds.join(',') === 'challenge,value,built,next',
      `${viewport.name}: EN row ${i + 1} missing or duplicated editorial blocks: ${kinds}`);
    const valueLabel = await card.locator('[data-signal="value"] span').textContent();
    assert(valueLabel?.includes('hypothesis'), `${viewport.name}: EN row ${i + 1} potential value is not labeled a hypothesis`);
    const builtCopy = await card.locator('[data-signal="built"] p').textContent();
    assert(builtCopy?.length > 40, `${viewport.name}: EN row ${i + 1} missing implementation and limitations`);
  }

  const englishStartWeights = await page.locator('#v2-steps .v2-start-mode > strong')
    .evaluateAll((elements) => elements.map((element) => Number(getComputedStyle(element).fontWeight)));
  assert(englishStartWeights.length === 4 && englishStartWeights.every((weight) => weight <= 500),
    `${viewport.name}: EN start-card headings became too bold: ${englishStartWeights.join(', ')}`);

  const screenshotAssets = [
    '/assets/shots/antiqua-tablet.png',
    '/assets/shots/antiqua-gallery-tablet.png',
    '/assets/shots/fashion-management-dashboard-tablet.png',
    '/assets/shots/fur-production-dashboard-tablet.png'
  ];
  const screenshotProof = await page.evaluate(async (paths) => Promise.all(paths.map((src) => new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ src, ok: img.naturalWidth > 0 && img.naturalHeight > 0, width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => resolve({ src, ok: false, width: 0, height: 0 });
    img.src = src + '?qa=' + Date.now();
  }))), screenshotAssets);
  assert(screenshotProof.every((item) => item.ok), `${viewport.name}: real screenshot asset failed: ${JSON.stringify(screenshotProof)}`);

  const overflow = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    viewportWidth: window.innerWidth
  }));
  assert(overflow.scrollWidth <= overflow.viewportWidth, `${viewport.name}: horizontal overflow ${overflow.scrollWidth}/${overflow.viewportWidth}`);
  assert(pageErrors.length === 0, `${viewport.name}: page errors: ${pageErrors.join(' | ')}`);
  assert(badResponses.length === 0, `${viewport.name}: HTTP errors: ${badResponses.join(' | ')}`);

  await projectsSection.screenshot({ style: 'header.topbar, #cta-bar { visibility: hidden !important; }', path: `${outputDir}/projects-${viewport.name}.png` });
  await page.locator('#v2-steps').screenshot({ style: 'header.topbar, #cta-bar { visibility: hidden !important; }', path: `${outputDir}/start-${viewport.name}.png` });
  await page.evaluate(() => window.scrollTo({ top: 0, left: 0, behavior: 'instant' }));
  await page.screenshot({ path: `${outputDir}/hero-en-${viewport.name}.png` });
  await page.close();
}

await browser.close();

if (failures.length) {
  console.error('V2 browser smoke failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('V2 browser smoke passed for desktop, tablet, phone and 320px narrow phone.');
