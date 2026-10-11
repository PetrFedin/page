#!/usr/bin/env node
/* Node 24 + Chrome CDP smoke. Capture RU/EN desktop/phone screenshots. */
import { createServer } from "node:http";
import { existsSync, readFileSync, writeFileSync, mkdirSync, mkdtempSync, rmSync, statSync } from "node:fs";
import { resolve, dirname, extname, sep, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";
import { tmpdir } from "node:os";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "artifacts", "advisory-smoke");
mkdirSync(outDir, { recursive: true });
const mime = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8", ".svg": "image/svg+xml", ".png": "image/png",
  ".jpg": "image/jpeg", ".webp": "image/webp" };
const server = createServer((req, res) => {
  const pathname = new URL(req.url, "http://localhost").pathname.replace(/^\/+/, "") || "index.html";
  const file = resolve(root, pathname);
  if ((!file.startsWith(root + sep) && file !== root) || !existsSync(file) || !statSync(file).isFile()) {
    res.writeHead(404); res.end("Not found"); return;
  }
  res.writeHead(200, { "content-type": mime[extname(file)] || "application/octet-stream" });
  res.end(readFileSync(file));
});
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
const base = "http://127.0.0.1:" + server.address().port;
const chromeBin = process.env.CHROME_BIN || "/usr/bin/google-chrome";
const profile = mkdtempSync(join(tmpdir(), "advisory-deck-"));
const port = 9600 + Math.floor(Math.random() * 150);
const args = ["--headless=new", "--no-sandbox", "--disable-dev-shm-usage", "--remote-allow-origins=*",
  "--remote-debugging-port=" + port, "--user-data-dir=" + profile, "about:blank"];
if (!existsSync(chromeBin)) throw new Error("Chrome missing: " + chromeBin);
const chrome = spawn(chromeBin, args, { detached: true, stdio: "ignore" });
let socket;
try {
  let tabs;
  for (let n = 0; n < 90; n++) {
    try { tabs = await (await fetch("http://127.0.0.1:" + port + "/json")).json(); break; }
    catch { await sleep(200); }
  }
  if (!tabs) throw new Error("Chrome debugging endpoint unavailable");
  socket = new WebSocket(tabs.find(tab => tab.type === "page").webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
  const pending = new Map();
  let messageId = 0;
  socket.onmessage = event => {
    const packet = JSON.parse(event.data);
    if (!packet.id || !pending.has(packet.id)) return;
    const handlers = pending.get(packet.id);
    pending.delete(packet.id);
    if (packet.error) handlers.reject(new Error(JSON.stringify(packet.error)));
    else handlers.resolve(packet.result);
  };
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const id = ++messageId; pending.set(id, { resolve, reject });
    socket.send(JSON.stringify({ id, method, params }));
  });
  const evaluate = async expression => {
    const result = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
    if (result.exceptionDetails) throw new Error("Runtime evaluation failed");
    return result.result?.value;
  };
  await send("Page.enable");
  await send("Runtime.enable");

  function inspectPage() {
    const modal = document.getElementById("deck-modal");
    const sites = [...document.querySelectorAll("#deck-modal .deck-site")];
    const body = modal?.querySelector(".modal-body");
    const qrs = [...modal.querySelectorAll('img[src$="qr-syntha-site.svg"]')];
    const links = [...modal.querySelectorAll('a[href="https://syntha.pro"]')];
    return {
      ready: document.readyState, open: !!modal?.open, blocks: sites.length,
      images: qrs.length, imagesLoaded: qrs.every(q => q.complete && q.naturalWidth > 0),
      links: links.length, bodyOverflow: body ? body.scrollWidth - body.clientWidth : 999,
      title: document.getElementById("deck-site-title")?.textContent,
      footerTitle: document.getElementById("deck-site-final-title")?.textContent,
      actualLang: document.documentElement.lang
    };
  }
  const inspect = "(" + inspectPage.toString() + ")()";
  for (const [lang, page] of [["ru", "/index.html"], ["en", "/en/index.html"]]) {
    for (const [label, width, height, mobile] of [["desktop", 1365, 880, false], ["phone", 390, 844, true]]) {
      await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile });
      await send("Page.navigate", { url: base + page + "#deck" });
      let state;
      for (let tick = 0; tick < 60; tick++) {
        await sleep(250);
        state = await evaluate(inspect);
        if (state?.open && state.imagesLoaded && state.ready === "complete") break;
      }
      if (!state?.open || state.blocks !== 2 || state.images !== 2 || !state.imagesLoaded || state.links < 4) {
        throw new Error(lang + "/" + label + " deck failed: " + JSON.stringify(state));
      }
      if (state.bodyOverflow > 3) throw new Error(lang + "/" + label + " horizontal overflow: " + state.bodyOverflow);
      const screenshot = await send("Page.captureScreenshot", { format: "png", fromSurface: true, captureBeyondViewport: false });
      const output = join(outDir, "deck-" + lang + "-" + label + ".png");
      writeFileSync(output, Buffer.from(screenshot.data, "base64"));
      console.log("PASS " + lang + "/" + label + " " + JSON.stringify(state) + " screenshot=" + output);
    }
  }
} finally {
  try { socket?.close(); } catch {}
  try { process.kill(-chrome.pid); } catch {}
  try { server.close(); } catch {}
  try { rmSync(profile, { recursive: true, force: true }); } catch {}
}
