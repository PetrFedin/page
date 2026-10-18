/**
 * Real-public-URL visual evidence. No simulated dashboards, credentials or user data.
 * Screenshots/video belong to the deployed site, not a local UI reconstruction.
 */
import { chromium } from 'playwright';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { mkdir, readFile, writeFile, readdir } from 'node:fs/promises';
import path from 'node:path';

const TARGET = process.env.MARCO_CAPTURE_URL || 'https://marco-pescarolo-showroom.netlify.app/';
const OUT = path.resolve(process.env.MARCO_CAPTURE_OUT || 'artifacts/marco-live');
const url = new URL(TARGET);
if (url.protocol !== 'https:' || url.hostname !== 'marco-pescarolo-showroom.netlify.app') {
  throw new Error('Unsafe capture target: only the public production showroom is allowed');
}
await mkdir(OUT, { recursive: true });
const sha = (v) => createHash('sha256').update(v).digest('hex');
const facts = { title: '', html_language: '', steps: [], screenshots: [], errors: [], warnings: [] };
const capturedAt = new Date().toISOString();
const fail = (m) => { facts.errors.push(m); console.error('[CAPTURE FAIL]', m); };
const record = (key, worked, detail) => facts.steps.push({ key, worked: !!worked, detail: String(detail || '').slice(0, 200) });

async function contentFingerprint() {
  const res = await fetch(TARGET, { redirect: 'follow', signal: AbortSignal.timeout(35000) });
  if (!res.ok) throw new Error('Live HTTP ' + res.status);
  if (new URL(res.url).hostname !== url.hostname) throw new Error('Untrusted redirect ' + res.url);
  const html = await res.text();
  const assets = [];
  const seen = new Set();
  for (const m of html.matchAll(/<(?:script|link)\b[^>]*\b(?:src|href)=["']([^"']+)["'][^>]*>/gi)) {
    const asset = new URL(m[1],TARGET);
    if (asset.origin !== url.origin || seen.has(asset.href) || !/\.(?:m?js|css)(?:\?|$)/i.test(asset.href)) continue;
    seen.add(asset.href);
    if (assets.length >= 20) break;
    const r = await fetch(asset.href, { signal: AbortSignal.timeout(25000) });
    if (!r.ok) throw new Error('Versioned JS/CSS asset HTTP ' + r.status + ' at ' + asset.pathname);
    assets.push({ path: asset.pathname, sha256: sha(Buffer.from(await r.arrayBuffer())) });
  }
  const htmlSha = sha(html);
  return { sha256: sha(JSON.stringify({ htmlSha, assets })), html_sha256: htmlSha, assets, response_status: res.status };
}
const fingerprint = await contentFingerprint();
const browser = await chromium.launch({ headless: true, args: ['--disable-dev-shm-usage'] });
let desktop;
let recordedVideo;
try {
  desktop = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1, locale: 'en-US',
    recordVideo: { dir: OUT, size: { width: 1440, height: 900 } },
    reducedMotion: 'reduce'
  });
  const page = await desktop.newPage();
  const consoleIssues = [];
  page.on('pageerror', e => consoleIssues.push('PAGE ERROR ' + String(e.message).slice(0, 200)));
  page.on('console', msg => { if (msg.type() === 'error') consoleIssues.push('CONSOLE ' + msg.text().slice(0, 200)); });
  const resp = await page.goto(TARGET, { waitUntil: 'domcontentloaded', timeout: 45000 });
  if (!resp?.ok()) throw new Error('Browser navigation failed: ' + (resp?.status() || 'no response'));
  await page.waitForTimeout(6500);
  facts.title = await page.title();
  facts.html_language = await page.locator('html').getAttribute('lang') || '';
  const bodyText = (await page.locator('body').innerText()).trim();
  if (bodyText.length < 55) fail('Public homepage lacks meaningful rendered text');
  record('public-home', bodyText.length >= 55, facts.title);

  async function snap(name, p=page) {
    const file = path.join(OUT, name);
    await p.screenshot({ path: file, animations: 'disabled', fullPage: false, timeout: 30000 });
    facts.screenshots.push({ file: name, url: p.url(), title: await p.title() });
  }
  async function selectVisible(selectors) {
    for (const selector of selectors) {
      const el = page.locator(selector).first();
      try {
        if (await el.count() && await el.isVisible({ timeout: 1500 })) return el;
      } catch {}
    }
    return null;
  }
  async function clickOne(selectors, key) {
    const control = await selectVisible(selectors);
    if (!control) { record(key, false, 'No visible matching control'); return false; }
    try {
      await control.click({ timeout: 10000 });
      await page.waitForTimeout(900);
      record(key, true, 'Visible control clicked');
      return true;
    } catch (e) {
      record(key, false, String(e.message).slice(0, 170));
      return false;
    }
  }

  await snap('01-home-desktop.png');
  await page.mouse.wheel(0, 690);
  await page.waitForTimeout(6500);
  await snap('02-editorial-desktop.png');
  await page.mouse.wheel(0, -900);
  await page.waitForTimeout(2800);

  const collection = await clickOne(
    ['#nav button[data-page="collection"]','nav a[href*="collection"]','button[data-t="explore"]',
      'button:has-text("Collection")','button:has-text("Коллекция")','a:has-text("Collection")'],
    'public-collection-navigation');
  await page.waitForTimeout(7500);
  await snap('03-collection-desktop.png');
  if (!collection) fail('Public collection navigation missing or not clickable');

  const product = await clickOne(
    ['.product button[onclick*="openProduct"]','.product [onclick*="openProduct"]',
      'article.product .product-img','[data-testid="product-card"]','a[href*="/product/"]',
      'button:has-text("Open product")','button:has-text("Открыть товар")','button:has-text("Apri prodotto")'],
    'public-product-details');
  await page.waitForTimeout(5900);
  if (product) await snap('04-product-desktop.png');
  else fail('Public catalogue has no clickable product-detail entry; cannot qualify product journey.');

  // The deployed product dossier uses a visible icon-only "×" control.
  // An unrelated hidden cart close button has aria-label="Close" and must NOT be selected.
  async function dismissDossier(key, required) {
    const candidates = [
      '[role="dialog"] button:has-text("×")',
      '[aria-modal="true"] button:has-text("×")',
      'button:has-text("×")',
      '.modal button:has-text("✕")',
      'button[aria-label="Close product"]',
      'button[aria-label="Close dossier"]'
    ];
    const button = await selectVisible(candidates);
    if (!button) {
      record(key, false, 'No visible product dossier dismiss control');
      if (required) fail('Product detail dossier has no reachable close action');
      return false;
    }
    try {
      await button.click({timeout: 7000});
      await page.waitForTimeout(900);
      const overlayCloseStillVisible = await page.getByRole('button', { name: '×', exact: true })
        .first().isVisible().catch(() => false);
      record(key, !overlayCloseStillVisible,
        overlayCloseStillVisible ? 'Close icon remained visible' : 'Dossier dismissed using visible control');
      if (overlayCloseStillVisible && required) fail('Product dossier close left the overlay open');
      return !overlayCloseStillVisible;
    } catch (error) {
      record(key, false, String(error.message).slice(0, 170));
      if (required) fail('Product detail could not be closed');
      return false;
    }
  }
  if (product) await dismissDossier('close-public-detail', true);
  const ru = await clickOne(['button[data-lang="ru"]','button:has-text("RU")'], 'language-ru');
  await page.waitForTimeout(4500);
  if (ru) {
    await snap('05-language-ru-desktop.png');
    if ((await page.locator('html').getAttribute('lang')) !== 'ru') fail('RU click did not set html lang to ru');
  }
  const it = await clickOne(['button[data-lang="it"]','button:has-text("IT")'], 'language-it');
  await page.waitForTimeout(4500);
  if (it) {
    await snap('06-language-it-desktop.png');
    if ((await page.locator('html').getAttribute('lang')) !== 'it') fail('IT click did not set html lang to it');
  }
  const en = await clickOne(['button[data-lang="en"]','button:has-text("EN")'], 'language-en');
  await page.waitForTimeout(3200);
  if (en && (await page.locator('html').getAttribute('lang')) !== 'en') fail('EN click did not set html lang to en');
  if (!ru || !it || !en) facts.warnings.push('At least one language control could not be verified in public UI.');

  const entry = await clickOne(
    ['#roleChip','.role-chip','button[onclick*="openRole"]','button:has-text("Sign in")',
      'button:has-text("Вход")','a[href*="login"]','button:has-text("Maison Vela")'],
    'public-demo-account-switcher');
  await page.waitForTimeout(5500);
  if (entry) await snap('07-role-entry-desktop.png');
  else facts.warnings.push('No verified demo-account switcher or real sign-in entry in live build.');

  // Record a final return to home without accessing internal demo/privileged dashboards.
  if (entry) await dismissDossier('close-entry', false);
  await clickOne(['#nav button[data-page="home"]','a.brand','a[href="/"]',
    'button:has-text("Overview")','button:has-text("Обзор")', 'button:has-text("Panoramica")',
    'button:has-text("Home")'],
    'return-to-public-home');
  await page.waitForTimeout(5500);
  await snap('08-end-public-desktop.png');
  const homeControl = facts.steps.find(x => x.key === 'return-to-public-home');
  if (!homeControl?.worked) fail('Cannot return from catalogue to public home via navigation');
  facts.warnings.push(...consoleIssues.slice(0, 20));

  const video = page.video();
  await desktop.close();
  desktop = null;
  const webm = await video.path();
  const mp4 = path.join(OUT, 'marco-showroom-live-tour.mp4');
  const ffmpeg = spawnSync('ffmpeg',
    ['-hide_banner','-loglevel','error','-y','-i',webm,'-an',
     '-vf','scale=1280:-2:flags=lanczos,fps=24','-c:v','libx264',
     '-preset','fast','-crf','25','-pix_fmt','yuv420p','-movflags','+faststart',mp4],
    { encoding: 'utf8', timeout: 180000 });
  if (ffmpeg.status !== 0) throw new Error('ffmpeg: ' + ffmpeg.stderr);
  const probe = spawnSync('ffprobe',
    ['-v','error','-show_entries','format=duration','-of','default=noprint_wrappers=1:nokey=1',mp4],
    { encoding: 'utf8', timeout: 20000 });
  const duration = Number(probe.stdout?.trim());
  if (!Number.isFinite(duration) || duration < 20 || duration > 230) {
    fail('Recorded duration outside requested 20-230 seconds: ' + duration);
  }
  facts.video = { file: path.basename(mp4), duration_seconds: Math.round(duration * 100) / 100, silent: true };

  const mobile = await browser.newContext({
    viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, isMobile: true,
    hasTouch: true, locale: 'en-US', reducedMotion: 'reduce'
  });
  try {
    const p = await mobile.newPage();
    const mobileResp = await p.goto(TARGET, { waitUntil: 'domcontentloaded', timeout: 45000 });
    if (!mobileResp?.ok()) fail('Mobile browser HTTP error');
    await p.waitForTimeout(3300);
    await snap('09-mobile-home.png',p);
    const sizes = await p.evaluate(() => ({ content: document.documentElement.scrollWidth, viewport: innerWidth }));
    record('mobile-width', sizes.content <= sizes.viewport + 4, JSON.stringify(sizes));
    if (sizes.content > sizes.viewport + 4) fail('Horizontal mobile overflow: ' + JSON.stringify(sizes));
    await p.mouse.wheel(0, 680);
    await p.waitForTimeout(2000);
    await snap('10-mobile-editorial.png',p);
  } finally { await mobile.close(); }
} finally {
  if (desktop) await desktop.close().catch(() => {});
  await browser.close();
}
for (const item of facts.screenshots) {
  const bytes = await readFile(path.join(OUT,item.file));
  item.sha256 = sha(bytes);
  item.bytes = bytes.length;
}
const videoFile = facts.video ? await readFile(path.join(OUT, facts.video.file)) : null;
const manifest = {
  schema: 'marco-live-capture-v1', project: 'Marco Pescarolo Showroom',
  provenance: 'real Chromium recording of public deployed URL; no simulated or authenticated back-office session',
  target_url: TARGET, captured_at: capturedAt, capture_git_sha: process.env.GITHUB_SHA || null,
  production_build_fingerprint: fingerprint, site: facts,
  video_sha256: videoFile ? sha(videoFile) : null,
  status: facts.errors.length ? 'FAILED' : 'PASS',
  disclaimers: ['Visible prototype surfaces are not evidence of production-authorized workflows.',
    'No credentials were used. Private/Wholesale/Admin cross-role E2E remains unqualified.']
};
await writeFile(path.join(OUT,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
await writeFile(path.join(OUT,'README.md'),
  '# Marco Pescarolo real public capture\n\nCaptured: '+capturedAt+
  '\nSource fingerprint: '+fingerprint.sha256+
  '\nPublic URL: '+TARGET+
  '\nVideo: '+(facts.video?.duration_seconds || 'not recorded')+' seconds (silent)\n' +
  '\nResult: '+manifest.status+
  '\n\nNo back-office authentication or private user data was captured.\n');
console.log('CAPTURE_RESULT='+manifest.status,'SOURCE_FINGERPRINT='+fingerprint.sha256,
  'SCREENSHOTS='+facts.screenshots.length,'VIDEO_SECONDS='+facts.video?.duration_seconds);
if (facts.errors.length) throw new Error('Public visual gate failed: ' + facts.errors.join('; '));
