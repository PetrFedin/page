#!/usr/bin/env node
/**
 * Read-only admission of a reviewed SYNTHA V2 Cloudflare Pages deployment.
 * Does not send form data, post to Telegram, modify a provider or use secrets.
 *
 * RELEASE_URL=https://syntha.pro EXPECTED_SHA=<40 hex> \
 *   EXPECTED_EDITORIAL_DATE=2026-10-13 node scripts/verify-live-release.mjs
 */
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

export function extractEntrypoints(html, root) {
  const out = new Map();
  const tags = html.match(/<(?:script|link)\b[^>]*>/gi) || [];
  for (const tag of tags) {
    const rel = /\brel=["']stylesheet["']/i.test(tag);
    const script = /^<script\b/i.test(tag) && /\btype=["']module["']/i.test(tag);
    if (!rel && !script) continue;
    const match = tag.match(script ? /\bsrc=["']([^"']+)["']/i : /\bhref=["']([^"']+)["']/i);
    assert.ok(match, 'CSS/module entrypoint is missing a URL');
    const url = new URL(match[1], root);
    assert.equal(url.origin, root, 'Entrypoint must stay on verified origin');
    assert.match(url.pathname, /^\/assets\/[a-z0-9/_-]+\.(?:js|css)$/i, 'Expected a local versioned asset path');
    out.set(url.pathname + url.search, url.pathname.endsWith('.css') ? 'text/css' : 'javascript');
  }
  assert.ok([...out.keys()].some(x => x.startsWith('/assets/app.js')), 'Missing V2 app entrypoint');
  assert.ok([...out.keys()].some(x => x.startsWith('/assets/styles.css')), 'Missing V2 CSS entrypoint');
  return out;
}

export function extractModuleImports(source, parent, root) {
  const paths = [];
  const pattern = /\b(?:from\s*|import\s*)["'](\.{1,2}\/[^"']+\.js(?:\?[^"']*)?)["']/g;
  for (const match of source.matchAll(pattern)) {
    const url = new URL(match[1], new URL(parent, root));
    assert.equal(url.origin, root, 'JS module must remain on verified origin');
    assert.match(url.pathname, /^\/assets\/[a-z0-9/_-]+\.js$/i, 'Unexpected module import path');
    paths.push(url.pathname + url.search);
  }
  return paths;
}

export async function verifyLiveRelease({
  releaseUrl, expectedSha, expectedEditorialDate = '', fetcher = fetch
}) {
  assert.match(expectedSha || '', /^[a-f0-9]{40}$/, 'EXPECTED_SHA: full lowercase Git SHA is mandatory');
  assert.ok(releaseUrl, 'RELEASE_URL is mandatory');
  const url = new URL(releaseUrl);
  assert.equal(url.protocol, 'https:', 'Only HTTPS hosts are supported');
  assert.ok(!url.username && !url.password && !url.search && !url.hash && url.pathname === '/',
    'Release URL must be a clean origin without credentials');
  assert.ok(['syntha.pro','www.syntha.pro'].includes(url.hostname) ||
    url.hostname.endsWith('.pages.dev'), 'Only SYNTHA or Cloudflare Pages previews are permitted');
  if (expectedEditorialDate) {
    assert.match(expectedEditorialDate, /^\d{4}-\d\d-\d\d$/, 'Editorial date must be YYYY-MM-DD');
    const parsedDate = new Date(expectedEditorialDate + 'T00:00:00Z');
    assert.ok(Number.isFinite(parsedDate.getTime()), 'Editorial date must be real');
    assert.equal(parsedDate.toISOString().slice(0,10),
      expectedEditorialDate, 'Editorial date must be real');
  }
  const root = url.origin;
  const visited = new Set();
  const scriptQueue = [];
  async function get(path, type = '') {
    const response = await fetcher(root + path, {
      redirect: 'manual', cache: 'no-store', signal: AbortSignal.timeout(15000)
    });
    assert.equal(response.status, 200, path + ': HTTP 200 expected');
    const mime = response.headers.get('content-type') || '';
    if (type === 'javascript') assert.match(mime, /(?:javascript|ecmascript)/i, path + ': expected JS MIME, received ' + mime);
    if (type === 'text/css') assert.ok(mime.includes('text/css'), path + ': expected CSS MIME');
    if (type === 'html') assert.ok(mime.includes('text/html'), path + ': expected HTML MIME');
    if (type === 'json') assert.ok(mime.includes('json'), path + ': expected JSON MIME');
    if (type === 'xml') assert.ok(mime.includes('xml'), path + ': expected XML MIME');
    visited.add(path);
    return response.text();
  }

  let pages = 0;
  for (const [path, lang] of [['/','ru'],['/en/','en']]) {
    const html = await get(path, 'html'); pages++;
    assert.match(html, new RegExp('<html[^>]*lang=["\\x27]' + lang + '["\\x27]'), path + ': wrong language');
    assert.ok(html.includes('name="syntha-build-commit" content="' + expectedSha + '"'),
      path + ': exact deployed SHA does not match reviewed commit');
    assert.ok(html.includes('id="turnstile-widget"') && !html.includes('cf-chl-widget-') &&
      !/<input[^>]*name=["']cf-turnstile-response["']/.test(html),
      path + ': invalid frozen Turnstile response in prerendered HTML');
    for (const el of ['lead-routes-grid','lead-project-value','opportunities','nav-opportunities']) {
      assert.ok(html.includes('id="' + el + '"'), path + ': missing '+el);
    }
    assert.ok(html.includes('rel="canonical" href="https://syntha.pro/' + (lang==='en'?'en/':'') + '"'),
      path + ': canonical URL must point to SYNTHA primary domain');
    if (expectedEditorialDate) {
      assert.equal((html.match(new RegExp('id=["\\x27]post-' + expectedEditorialDate + '["\\x27]', 'g')) || []).length,
        1, path + ': approved article must be prerendered exactly once');
    }
    for (const [entry, kind] of extractEntrypoints(html, root)) {
      if (kind === 'javascript') scriptQueue.push(entry);
      else if (!visited.has(entry)) await get(entry, kind);
    }
  }
  assert.equal(pages, 2, 'Both languages required');
  const jsVisited = new Set();
  while (scriptQueue.length) {
    const path = scriptQueue.shift();
    if (jsVisited.has(path)) continue;
    assert.ok(jsVisited.size < 40, 'Unexpectedly large module graph');
    jsVisited.add(path);
    const body = await get(path, 'javascript');
    scriptQueue.push(...extractModuleImports(body, path, root));
  }
  for (const module of ['opportunity-studio.js','opportunity-economics.js',
    'opportunity-copy.js','advisory-economics.js','lead-paths.js','investor-calculator.js']) {
    assert.ok([...jsVisited].some(p=>p.startsWith('/assets/'+module)), 'Release is missing '+module);
  }
  const health = JSON.parse(await get('/release-health.json', 'json'));
  assert.equal(health.source_sha, expectedSha, 'Public health marker differs from reviewed Git SHA');
  assert.equal(health.bundle, 'public-static-only', 'Unexpected public bundle type');
  assert.equal(health.functions_bundled, false, 'Static health marker cannot assert deployed server functions');
  assert.deepEqual(health.languages, ['ru','en'], 'Expected two-language release');
  await get('/sitemap.xml', 'xml');
  await get('/robots.txt');
  for (const prefix of ['/','/en/']) {
    const xml = await get(prefix + 'feed.xml', 'xml');
    const json = JSON.parse(await get(prefix + 'feed.json', 'json'));
    assert.ok(Array.isArray(json.items) && json.items.length>0, prefix + ' JSON feed empty');
    if (expectedEditorialDate) {
      assert.ok(String(json.items[0].id || '').endsWith('#post-' + expectedEditorialDate),
        prefix + ' JSON feed is not the approved latest article');
      const blocks = xml.match(/<item\b[^>]*>[\s\S]*?<\/item>/g) || [];
      assert.ok(blocks.length && blocks[0].includes('#post-' + expectedEditorialDate),
        prefix + ' RSS feed is stale');
    }
  }
  for (const path of [
    '/channel-queue.json','/package.json','/functions/api/contact.js',
    '/docs/PAGE_V2_RELEASE_CONVERSION_EDITORIAL_2026-10-13.md',
    '/scripts/verify-live-release.mjs'
  ]) {
    const resp = await fetcher(root + path, {
      redirect: 'manual', cache: 'no-store', signal: AbortSignal.timeout(15000)
    });
    assert.notEqual(resp.status, 200, path + ' leaked private source or deployment fallback');
  }
  return {ok:true,sha:expectedSha,root,pages,assets:jsVisited.size,
    checkedRoutes:visited.size,
    notCovered:['Real Turnstile','Private Telegram receipt','Cloudflare account identity','Rollback']};
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  verifyLiveRelease({
    releaseUrl:process.env.RELEASE_URL,
    expectedSha:process.env.EXPECTED_SHA,
    expectedEditorialDate:process.env.EXPECTED_EDITORIAL_DATE || ''
  }).then(r=>{
    console.log('PASS: verified reviewed SYNTHA V2 at '+r.root+'; SHA '+r.sha+
      '; JS modules '+r.assets+'; routes '+r.checkedRoutes);
    console.log('STILL NOT VERIFIED: '+r.notCovered.join(', '));
  }).catch(e=>{console.error('FAIL: V2 release admission: '+e.message);process.exitCode=1;});
}
