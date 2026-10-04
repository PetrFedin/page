#!/usr/bin/env node
/* Презентация в PDF из тех же текстов, что и окно презентации на сайте (assets/deck.js).
 * Печатается настоящим Chrome, поэтому после правки текста достаточно:  node scripts/make-deck-pdf.mjs */
import { createServer } from 'node:http';
import { readFileSync, writeFileSync, existsSync, statSync, mkdtempSync, rmSync } from 'node:fs';
import { join, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import { tmpdir } from 'node:os';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const CHROME = process.env.CHROME_BIN || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.png': 'image/png' };
const server = createServer((req, res) => {
  const path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  const file = join(root, path);
  if (!existsSync(file) || statSync(file).isDirectory() || !file.startsWith(root)) { res.writeHead(404); return res.end('nf'); }
  res.writeHead(200, { 'content-type': MIME[extname(file)] || 'application/octet-stream' });
  res.end(readFileSync(file));
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}`;
const port = 9300 + Math.floor(Math.random() * 200);
const profile = mkdtempSync(join(tmpdir(), 'deck-'));
const chrome = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, '--remote-allow-origins=*', 'about:blank'], { detached: true, stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let tabs; for (let i = 0; i < 240; i++) { try { tabs = await (await fetch(`http://127.0.0.1:${port}/json`)).json(); break; } catch { await sleep(250); } }
const ws = new WebSocket(tabs.find((t) => t.type === 'page').webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
let id = 0; const pend = new Map();
ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && pend.has(m.id)) { pend.get(m.id)(m); pend.delete(m.id); } };
const send = (method, params = {}) => new Promise((r) => { const i = ++id; pend.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
await send('Page.enable');
for (const [lang, out] of [['ru', 'fashion-advisory.pdf'], ['en', 'fashion-advisory-en.pdf']]) {
  await send('Page.navigate', { url: `${base}/scripts/deck-print.html?lang=${lang}` });
  for (let i = 0; i < 60; i++) {
    await sleep(500);
    const r = await send('Runtime.evaluate', { expression: 'document.documentElement.dataset.ready === "1"', returnByValue: true });
    if (r.result?.result?.value) break;
  }
  await sleep(600);
  const pdf = await send('Page.printToPDF', { printBackground: true, preferCSSPageSize: true, displayHeaderFooter: false });
  writeFileSync(join(root, 'assets', out), Buffer.from(pdf.result.data, 'base64'));
  console.log(`assets/${out}: ${Math.round(Buffer.from(pdf.result.data, 'base64').length / 1024)} КБ`);
}
try { process.kill(-chrome.pid); } catch { /* закрыт */ }
server.close();
try { rmSync(profile, { recursive: true, force: true }); } catch { /* временная папка */ }
process.exit(0);
