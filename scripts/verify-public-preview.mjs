#!/usr/bin/env node
/**
 * Fail-closed smoke check for a publicly hosted, static V2 preview.
 * Usage:
 *   PREVIEW_URL=https://preview.example.com EXPECTED_SHA=<40-hex-SHA> npm run verify:preview
 *
 * A hosting provider reporting READY is insufficient: the served bytes must
 * belong to the exact reviewed GitHub commit. This does NOT test Cloudflare
 * Pages Functions, contact delivery, Turnstile or editorial publishing.
 */
import assert from 'node:assert/strict';

function flag(name) {
  const index = process.argv.indexOf(name);
  return index < 0 ? undefined : process.argv[index + 1];
}

const baseInput = flag('--url') || process.env.PREVIEW_URL;
const expectedSha = flag('--sha') || process.env.EXPECTED_SHA;
assert.ok(baseInput, 'Missing PREVIEW_URL or --url');
assert.match(expectedSha || '', /^[0-9a-f]{40}$/, 'EXPECTED_SHA must be an exact 40-character commit SHA');

const base = new URL(baseInput);
assert.equal(base.protocol, 'https:', 'Preview must use HTTPS');
assert.ok(!base.username && !base.password && !base.search && !base.hash,
  'Preview URL cannot contain credentials, query parameters or fragments');
assert.equal(base.pathname, '/', 'Preview URL must point at its site root');
assert.ok(!['syntha.pro', 'www.syntha.pro'].includes(base.hostname.toLowerCase()),
  'Never run a V2 preview admission against production V1');

const checks = [];
async function get(path, type, maxBytes = 3_000_000) {
  const requested = new URL(path, base);
  const response = await fetch(requested, {
    redirect: 'follow',
    signal: AbortSignal.timeout(15000),
    headers: { 'Cache-Control': 'no-cache' }
  });
  assert.equal(response.ok, true, path + ' returned HTTP ' + response.status);
  assert.equal(new URL(response.url).origin, base.origin,
    path + ' redirected to a different origin');
  const contentType = response.headers.get('content-type') || '';
  if (type === 'html') assert.match(contentType, /text\/html/i, path + ' must serve HTML');
  if (type === 'json') assert.match(contentType, /json/i, path + ' must serve JSON');
  if (type === 'javascript') assert.match(contentType, /javascript|text\/plain/i,
    path + ' must serve a JavaScript asset');
  const body = await response.text();
  assert.ok(Buffer.byteLength(body, 'utf8') <= maxBytes,
    path + ' unexpectedly exceeds the maximum response size');
  checks.push(path);
  return body;
}

try {
  const health = JSON.parse(await get('/release-health.json', 'json', 30000));
  assert.equal(health.source_sha, expectedSha, 'Hosted SHA does not match reviewed PR head');
  assert.equal(health.bundle, 'public-static-only', 'Unexpected release bundle');
  assert.equal(health.functions_bundled, false,
    'Static preview must not claim live Cloudflare Pages Functions');

  const [ru, en, projects, logos] = await Promise.all([
    get('/', 'html'),
    get('/en/', 'html'),
    get('/assets/portfolio-extensions.js', 'javascript'),
    get('/assets/logos.js', 'javascript')
  ]);
  const marker = '<meta name="syntha-build-commit" content="' + expectedSha + '">';
  assert.ok(ru.includes(marker), 'RU homepage does not carry exact SHA marker');
  assert.ok(en.includes(marker), 'EN homepage does not carry exact SHA marker');
  assert.match(ru, /<html lang="ru"/, 'RU language marker missing');
  assert.match(en, /<html lang="en"/, 'EN language marker missing');
  assert.match(projects, /"name"\s*:\s*"SVEDO"/,
    'SVEDO dossier is missing from hosted JavaScript');
  assert.match(projects, /"name"\s*:\s*"THE FUR"/,
    'THE FUR dossier is missing from hosted JavaScript');
  assert.match(logos, /SVEDO/, 'SVEDO wordmark is missing');

  await Promise.all([
    get('/assets/app.js', 'javascript'),
    get('/assets/styles.css', 'text'),
    get('/analytics.html', 'html'),
    get('/en/analytics.html', 'html'),
    get('/economics.html', 'html'),
    get('/en/economics.html', 'html')
  ]);

  console.log(JSON.stringify({
    ok: true,
    preview: base.origin + '/',
    source_sha: expectedSha,
    inspected: [...checks].sort(),
    scope: 'Static-only, RU/EN, project branding and published commit identity',
    not_verified: ['Contact/Turnstile', 'Cloudflare Pages Functions', 'Telegram', 'production release']
  }, null, 2));
} catch (error) {
  console.error('PREVIEW REJECTED: ' + (error?.message || String(error)));
  process.exitCode = 1;
}
