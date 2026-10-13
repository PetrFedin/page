#!/usr/bin/env node
/**
 * Read-only admission of a real Cloudflare Pages release.
 *
 *   RELEASE_URL=https://syntha.pro VERIFY_DATE=2026-10-13 \
 *     node scripts/verify-live-publication.mjs
 *
 * Optionally EXPECTED_SHA=<full 40-hex Git source commit> to require
 * /release-health.json and compare its source_sha. A PR CI pass or Git merge
 * does not prove this public URL was deployed. This script sends NO lead data
 * and NO Telegram messages.
 */
import assert from 'node:assert/strict';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

function requireArticleDate(value) {
  assert.match(value, /^\d{4}-\d{2}-\d{2}$/, 'VERIFY_DATE requires YYYY-MM-DD');
  const day = new Date(value + 'T00:00:00Z');
  assert.equal(day.toISOString().slice(0, 10), value, 'VERIFY_DATE must be a real date');
  return value;
}

export function assertFeedXml(xml, date, language) {
  const items = String(xml).match(/<item\b[^>]*>[\s\S]*?<\/item>/g) || [];
  assert.ok(items.length > 0, language + ': RSS has no items');
  assert.ok(items[0].includes('#post-' + date), language + ': latest RSS item is not ' + date);
  assert.equal(items.filter(item=>item.includes('#post-' + date)).length, 1,
    language + ': duplicate/missing target RSS item');
}

export function assertFeedJson(source, date, language) {
  let parsed;
  try { parsed = JSON.parse(source); } catch { throw new Error(language + ': invalid JSON feed'); }
  assert.ok(Array.isArray(parsed.items) && parsed.items.length > 0, language + ': no JSON feed items');
  assert.ok(String(parsed.items[0].id || '').endsWith('#post-' + date), language + ': latest JSON item mismatches');
  assert.equal(parsed.items.filter(item=>String(item.id || '').endsWith('#post-' + date)).length, 1,
    language + ': duplicate/missing target JSON item');
}

export function assertHtml(html, date, lang, requireSanitizedTurnstile = false) {
  assert.ok(new RegExp('<html[^>]*lang=["\\x27]' + lang + '["\\x27]', 'i').test(html), lang + ': wrong HTML language');
  assert.equal((html.match(new RegExp('id=["\\x27]post-' + date + '["\\x27]', 'g')) || []).length, 1,
    lang + ': exactly one prerendered target article required');
  if (requireSanitizedTurnstile) {
    assert.ok(html.includes('id="turnstile-widget"'), lang + ': missing Turnstile root');
    assert.ok(!html.includes('cf-chl-widget-'), lang + ': transient captcha response leaked into static HTML');
  }
}

export function assertReleaseManifest(source, expectedSha) {
  let manifest;
  try { manifest = JSON.parse(source); } catch { throw new Error('release-health.json is not JSON (possible homepage fallback)'); }
  assert.equal(manifest.source_sha, expectedSha, 'public source_sha does not match expected reviewed deployment');
  assert.equal(manifest.bundle, 'public-static-only', 'unexpected packaging contract');
  assert.equal(manifest.functions_bundled, false, 'manifest must never assert bundled Functions');
}

export async function verifyLivePublication({
  releaseUrl = 'https://syntha.pro',
  date = '2026-10-13',
  expectedSha = '',
  fetcher = fetch
} = {}) {
  requireArticleDate(date);
  const host = new URL(releaseUrl);
  assert.equal(host.protocol, 'https:', 'Only HTTPS origins may be admitted');
  assert.ok(host.hostname === 'syntha.pro' || host.hostname === 'www.syntha.pro' || host.hostname.endsWith('.pages.dev'),
    'Only syntha.pro or approved Cloudflare Pages preview origins are supported');
  assert.ok(!host.username && !host.password, 'Credentials must not appear in URL');
  assert.equal(host.pathname, '/', 'Use the deployment origin, not a subpath');
  assert.ok(!host.search && !host.hash, 'Release URL must be a clean origin');
  if (expectedSha) assert.match(expectedSha, /^[a-f0-9]{40}$/, 'EXPECTED_SHA must be a full lowercase Git SHA');
  const root = host.origin;
  const checked = [];
  const nonce = Date.now().toString(36);
  async function get(path, contentType) {
    const response = await fetcher(root + path + '?admission=' + nonce, {
      redirect: 'manual', cache: 'no-store', signal: AbortSignal.timeout(15000)
    });
    assert.equal(response.status, 200, path + ': expected HTTP 200 from deployed site');
    const mime = response.headers?.get?.('content-type') || '';
    if (contentType) assert.ok(mime.includes(contentType), path + ': unexpected response MIME ' + mime);
    const body = await response.text();
    checked.push(path);
    return body;
  }

  for (const [prefix, language] of [['','ru'],['/en','en']]) {
    const html = await get(prefix + '/', 'text/html');
    assertHtml(html, date, language, Boolean(expectedSha));
    const xml = await get(prefix + '/feed.xml');
    assertFeedXml(xml, date, language);
    const json = await get(prefix + '/feed.json');
    assertFeedJson(json, date, language);
  }
  const news = await get('/assets/news.js');
  assert.ok(news.includes(date), 'Public news.js missing latest expected article');
  if (expectedSha) {
    const body = await get('/release-health.json', 'application/json');
    assertReleaseManifest(body, expectedSha);
  }
  return {
    ok: true, root, date, shaVerified: Boolean(expectedSha), checked,
    remainingGates: ['Real Turnstile', 'Private Telegram delivery', 'Cloudflare deployment ID and rollback']
  };
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  verifyLivePublication({
    releaseUrl: process.env.RELEASE_URL || 'https://syntha.pro',
    date: process.env.VERIFY_DATE || '2026-10-13',
    expectedSha: process.env.EXPECTED_SHA || ''
  }).then(result => {
    console.log('PASS: live RU+EN article ' + result.date + ' at ' + result.root);
    console.log('Checked public routes: ' + result.checked.join(', '));
    console.log(result.shaVerified ? 'Source SHA matched' : 'Source SHA not requested; deployment identity unverified');
    console.log('Still not tested: ' + result.remainingGates.join(', '));
  }).catch(error => {
    console.error('FAIL: live release admission: ' + error.message);
    process.exitCode = 1;
  });
}
