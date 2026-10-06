import assert from 'node:assert/strict';
import { languageRedirect, RUSSIAN_REGION } from '../functions/_language.js';
function run(country, path = '/', headers = {}, method = 'GET') {
  const req = new Request('https://preview.example' + path, { headers, method });
  if (country) Object.defineProperty(req, 'cf', { value: { country } });
  return languageRedirect(req);
}
for (const country of RUSSIAN_REGION) assert.equal(run(country), null);
for (const country of ['US', 'DE', 'GB', 'FR', 'CN', 'GE', 'UA']) {
  assert.equal(run(country).headers.get('location'), 'https://preview.example/en/');
}
assert.equal(run('US', '/', { cookie: 'other=1; syntha_lang=ru' }), null);
assert.equal(run('RU', '/', { cookie: 'syntha_lang=en' }).status, 302);
assert.equal(run('US', '/?lang=ru'), null);
assert.equal(run('RU', '/?lang=en').status, 302);
assert.equal(run('US', '/en/'), null);
assert.equal(run('US', '/syntha'), null);
assert.equal(run('US', '/', { 'user-agent': 'Googlebot' }), null);
assert.equal(run(undefined, '/', { 'accept-language': 'ru-RU, en;q=0.9' }), null);
assert.equal(run(undefined).status, 302);
assert.equal(run('US', '/', {}, 'POST'), null);
assert.equal(run('US').headers.get('cache-control'), 'private, no-store');
console.log('Language routing: all cases passed.');
