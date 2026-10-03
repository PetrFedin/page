#!/usr/bin/env node
/* Карточки для превью ссылок (Telegram, WhatsApp, LinkedIn): по одной на проект и язык.
 * Рисуются в настоящем Chrome из данных проектов — после правки тагайна или стадии
 * достаточно запустить скрипт заново:  node scripts/make-og.mjs */
import { writeFileSync, mkdtempSync, rmSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawn } from 'node:child_process';
import { tmpdir } from 'node:os';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const CHROME = process.env.CHROME_BIN || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const { PROJECTS } = await import(pathToFileURL(join(root, 'assets/content.js')).href);
const { LOGOS } = await import(pathToFileURL(join(root, 'assets/logos.js')).href);
mkdirSync(join(root, 'assets/og'), { recursive: true });

const esc = (s) => String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
const card = (p, lang) => `<!doctype html><meta charset="utf-8"><style>
*{box-sizing:border-box;margin:0}
body{width:1200px;height:630px;background:#faf9f7;color:#17171a;font-family:Georgia,'Iowan Old Style',serif;display:flex;flex-direction:column;justify-content:space-between;padding:64px 72px;position:relative;overflow:hidden}
body::before{content:"";position:absolute;right:-160px;top:-160px;width:560px;height:560px;border-radius:50%;background:radial-gradient(circle,#f1ddd5 0,#faf9f7 70%)}
.logo svg{height:64px;width:auto;color:#17171a}
h1{font-weight:400;font-size:62px;line-height:1.12;letter-spacing:-.01em;max-width:960px;position:relative}
.stage{display:inline-block;font:600 22px/1 -apple-system,Helvetica,Arial,sans-serif;letter-spacing:.12em;text-transform:uppercase;color:#a8432a;border:2px solid #a8432a;border-radius:999px;padding:12px 24px;position:relative}
.foot{display:flex;justify-content:space-between;align-items:center;font:500 26px/1 -apple-system,Helvetica,Arial,sans-serif;color:#6c6a66;position:relative}
.foot b{color:#17171a;font-weight:600}
</style>
<div class="logo">${LOGOS[p.id]}</div>
<div><h1>${esc(p[lang].tagline)}</h1><div style="height:28px"></div><span class="stage">${esc(p[lang].stage)}</span></div>
<div class="foot"><span><b>${lang === 'ru' ? 'Пётр Федин' : 'Petr Fedin'}</b> · ${lang === 'ru' ? 'проект' : 'project'}</span><span>syntha.pro</span></div>`;

const port = 9800 + Math.floor(Math.random() * 100);
const profile = mkdtempSync(join(tmpdir(), 'og-'));
const chrome = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, '--remote-allow-origins=*', 'about:blank'], { detached: true, stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let tabs; for (let i = 0; i < 60; i++) { try { tabs = await (await fetch(`http://127.0.0.1:${port}/json`)).json(); break; } catch { await sleep(250); } }
const ws = new WebSocket(tabs.find((t) => t.type === 'page').webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
let id = 0; const pend = new Map();
ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && pend.has(m.id)) { pend.get(m.id)(m); pend.delete(m.id); } };
const send = (method, params = {}) => new Promise((r) => { const i = ++id; pend.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
await send('Page.enable');
await send('Emulation.setDeviceMetricsOverride', { width: 1200, height: 630, deviceScaleFactor: 1, mobile: false });
for (const p of PROJECTS) for (const lang of ['ru', 'en']) {
  const { frameTree } = (await send('Page.getFrameTree')).result;
  await send('Page.setDocumentContent', { frameId: frameTree.frame.id, html: card(p, lang) });
  await sleep(300);
  const r = await send('Page.captureScreenshot', { format: 'jpeg', quality: 86 });
  const name = lang === 'ru' ? `${p.id}.jpg` : `${p.id}-en.jpg`;
  writeFileSync(join(root, 'assets/og', name), Buffer.from(r.result.data, 'base64'));
  console.log('assets/og/' + name);
}
try { process.kill(-chrome.pid); } catch { /* закрыт */ }
try { rmSync(profile, { recursive: true, force: true }); } catch { /* временная папка, не страшно */ }
process.exit(0);
