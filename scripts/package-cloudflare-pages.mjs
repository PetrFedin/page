#!/usr/bin/env node
/* Build a public-only Pages static bundle. Never package Functions or private data. */
import assert from 'node:assert/strict';
import { readFileSync, existsSync, mkdirSync, cpSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'dist-pages');
const files = ['index.html','privacy.html','syntha.html','renova.html','chatx.html','mfw.html','promomed.html','marco-pescarolo.html','favicon.ico','robots.txt','sitemap.xml','feed.xml','feed.json','llms.txt','_headers','_routes.json','effa60696db2628d61a43e4d89f0186c.txt'];
const dirs = ['assets', 'en'];

const actualSha = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim().toLowerCase();
const sourceSha = (process.env.SOURCE_SHA || actualSha).toLowerCase();
assert.match(sourceSha, /^[a-f0-9]{40}$/, 'A full Git commit SHA is required');
assert.equal(sourceSha, actualSha, 'SOURCE_SHA differs from checked-out code; refusing untraceable bundle');

for (const path of ['index.html', 'en/index.html']) {
  const html = readFileSync(join(root, path), 'utf8');
  assert.equal((html.match(/id="turnstile-widget"/g) || []).length, 1, path + ': expected one captcha root');
  assert.ok(!html.includes('cf-chl-widget-'), path + ': ephemeral captcha markup was committed');
  assert.ok(!/name="cf-turnstile-response"/.test(html), path + ': stale captcha token field');
  assert.equal((html.match(/id="post-2026-10-13"/g) || []).length, 1, path + ': first editorial article missing');
  assert.ok(html.indexOf('id="post-2026-10-13"') < html.indexOf('id="post-2026-10-02"'), path + ': stale article order');
}
for (const path of [...files, ...dirs]) assert.ok(existsSync(join(root, path)), 'Missing public file: ' + path);

for (const lang of ['ru', 'en']) {
  const prefix = lang === 'ru' ? '' : 'en/';
  const feed = JSON.parse(readFileSync(join(root, prefix + 'feed.json'), 'utf8'));
  const xml = readFileSync(join(root, prefix + 'feed.xml'), 'utf8');
  assert.equal(feed.items.length, 19, lang + ': incomplete JSON feed');
  assert.ok(feed.items[0].id.endsWith('#post-2026-10-13'), lang + ': wrong JSON feed head');
  assert.equal((xml.match(/<item>/g) || []).length, 19, lang + ': incomplete RSS feed');
  assert.ok(xml.includes('#post-2026-10-13'), lang + ': wrong RSS feed');
}
rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
for (const path of files) {
  mkdirSync(dirname(join(out, path)), { recursive: true });
  cpSync(join(root, path), join(out, path));
}
for (const path of dirs) cpSync(join(root, path), join(out, path), { recursive: true });
for (const path of ['package.json','channel-queue.json','scripts','docs','functions','private','.git']) {
  assert.ok(!existsSync(join(out, path)), 'Private/server path leaked: ' + path);
}
const manifest = {
  schema: 2,
  article: '2026-10-13',
  languages: ['ru', 'en'],
  source_sha: sourceSha,
  bundle: 'public-static-only',
  functions_bundled: false
};
writeFileSync(join(out, 'release-health.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log('PASS: public-only Pages static release for Git SHA ' + sourceSha);
