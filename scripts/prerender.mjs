#!/usr/bin/env node
/* Предварительная отрисовка главных страниц.
 *
 * Сайт наполняется скриптом, а поисковики (особенно Яндекс) и ИИ-краулеры
 * часто скрипты не выполняют и видят пустую страницу. Этот скрипт открывает
 * страницу в настоящем Chrome, ждёт, пока она наполнится, и вписывает готовую
 * разметку между метками <!--PR:START--> и <!--PR:END-->. Скрипты на странице
 * потом просто перерисовывают то же самое, поэтому пользователь разницы не видит.
 *
 *   node scripts/build-en.mjs && node scripts/prerender.mjs
 *
 * Порядок важен: build-en копирует index.html в en/, а prerender потом
 * заменяет содержимое каждой копии на её собственный язык. */
import { createServer } from 'node:http';
import { readFileSync, writeFileSync, existsSync, statSync, mkdtempSync, rmSync } from 'node:fs';
import { join, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import { tmpdir } from 'node:os';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const CHROME = process.env.CHROME_BIN || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.png': 'image/png', '.mp4': 'video/mp4', '.webm': 'video/webm', '.pdf': 'application/pdf', '.vcf': 'text/vcard', '.xml': 'application/xml', '.txt': 'text/plain' };
const V2_INDEX_STYLE = '<link rel="stylesheet" href="/assets/v2-index-layout.css">';

const server = createServer((req, res) => {
  let path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  let file = join(root, path);
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html');
  else if (!existsSync(file) && existsSync(file + '.html')) file += '.html';
  if (!existsSync(file) || !file.startsWith(root)) { res.writeHead(404); return res.end('not found'); }
  res.writeHead(200, { 'content-type': MIME[extname(file)] || 'application/octet-stream' });
  res.end(readFileSync(file));
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}`;

const port = 9400 + Math.floor(Math.random() * 400);
const profile = mkdtempSync(join(tmpdir(), 'prerender-'));
const chromeArgs = [
  '--headless=new',
  `--remote-debugging-port=${port}`,
  `--user-data-dir=${profile}`,
  '--remote-allow-origins=*',
  '--hide-scrollbars',
  '--no-first-run',
  '--disable-background-networking',
  ...(process.env.CI ? ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'] : []),
  'about:blank'
];
let chromeStderr = '';
const chrome = spawn(CHROME, chromeArgs, { detached: true, stdio: ['ignore', 'ignore', 'pipe'] });
chrome.stderr?.on('data', (chunk) => {
  if (chromeStderr.length < 12000) chromeStderr += chunk.toString();
});
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const cleanup = () => { try { process.kill(-chrome.pid); } catch { /* уже закрыт */ } server.close(); try { rmSync(profile, { recursive: true, force: true }); } catch { /* не страшно */ } };

let tabs;
for (let i = 0; i < 60; i++) { try { tabs = await (await fetch(`http://127.0.0.1:${port}/json`)).json(); break; } catch { await sleep(250); } }
if (!tabs) {
  const details = chromeStderr.trim() || `exit=${chrome.exitCode ?? 'unknown'}, signal=${chrome.signalCode ?? 'none'}`;
  cleanup();
  throw new Error(`Chrome не запустился: ${CHROME}; ${details}`);
}
const ws = new WebSocket(tabs.find((t) => t.type === 'page').webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
let id = 0; const pend = new Map();
ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && pend.has(m.id)) { pend.get(m.id)(m); pend.delete(m.id); } };
const send = (method, params = {}) => new Promise((r) => { const i = ++id; pend.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
const evaluate = async (expression) => (await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })).result?.result?.value;

await send('Page.enable');
await send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });

/* Что вынимаем из отрисованной страницы: всё между шапкой и подвалом без того,
   что скрипт добавляет сам и потом добавит снова, и без того, что зависит от времени. */
const EXTRACT = `(() => {
  const head = document.querySelector('header.topbar');
  const foot = document.querySelector('footer.footer');
  const nodes = [];
  for (let n = head; n; n = n.nextElementSibling) { nodes.push(n); if (n === foot) break; }
  const box = document.createElement('div');
  nodes.forEach((n) => box.append(n.cloneNode(true)));
  box.querySelectorAll('.to-top, .share-menu, .scroll-progress').forEach((n) => n.remove());
  box.querySelectorAll('.snap-fit').forEach((n) => n.removeAttribute('style'));
  box.querySelectorAll('.snap-dots').forEach((n) => { n.innerHTML = ''; n.removeAttribute('data-first'); });
  box.querySelectorAll('[tabindex="0"]').forEach((n) => n.removeAttribute('tabindex'));
  box.querySelectorAll('#clock').forEach((n) => { n.textContent = ''; });
  box.querySelectorAll('.cta-bar').forEach((n) => n.classList.remove('hide'));
  box.querySelectorAll('.playing').forEach((n) => n.classList.remove('playing'));
  return box.innerHTML;
})()`;

const targets = [['index.html', '/'], ['en/index.html', '/en/']];
let failed = false;
for (const [file, url] of targets) {
  const path = join(root, file);
  if (!existsSync(path)) continue;
  const source = readFileSync(path, 'utf8');
  const src = source.includes('/assets/v2-index-layout.css')
    ? source
    : source.replace('</head>', `  ${V2_INDEX_STYLE}\n</head>`);
  if (!src.includes('<!--PR:START-->') || !src.includes('<!--PR:END-->')) { console.error(`${file}: нет меток PR`); failed = true; continue; }
  await send('Page.navigate', { url: `${base}${url}?prerender=1` });
  await sleep(4500);
  const ready = await evaluate(`document.querySelectorAll('#cards .card').length > 0 && document.querySelectorAll('#investors-list .inv-card').length > 0`);
  if (!ready) { console.error(`${file}: страница не наполнилась`); failed = true; continue; }
  const html = await evaluate(EXTRACT);
  const next = src.replace(/<!--PR:START-->[\s\S]*?<!--PR:END-->/, () => `<!--PR:START-->\n${html}\n<!--PR:END-->`);
  writeFileSync(path, next);
  console.log(`${file}: вписано ${Math.round(html.length / 1024)} КБ разметки`);
}
cleanup();
process.exit(failed ? 1 : 0);
