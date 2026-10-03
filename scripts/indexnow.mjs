#!/usr/bin/env node
/* Сообщает поисковикам (Bing, Яндекс, Seznam, Naver и другие, поддерживающие IndexNow),
 * что страницы изменились, — бесплатно и сразу после выкладки.
 *   node scripts/indexnow.mjs            все страницы из sitemap.xml
 *   node scripts/indexnow.mjs /syntha    только перечисленные пути */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const HOST = 'syntha.pro';
const KEY = 'effa60696db2628d61a43e4d89f0186c';
const paths = process.argv.slice(2);
const urls = paths.length
  ? paths.map((p) => `https://${HOST}${p}`)
  : [...readFileSync(join(root, 'sitemap.xml'), 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);

const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'content-type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `https://${HOST}/${KEY}.txt`, urlList: urls })
});
console.log(`IndexNow: ${res.status} ${res.statusText} (${urls.length} адресов)`);
