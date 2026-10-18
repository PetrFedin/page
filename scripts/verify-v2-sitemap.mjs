#!/usr/bin/env node
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const xml=readFileSync(new URL('../dist-pages/sitemap.xml',import.meta.url),'utf8');
const targets=['profile.html','analytics.html','economics.html','privacy.html'];
for(const page of targets){
 for(const prefix of ['/','/en/']){
  const url='https://syntha.pro'+prefix+page;
  assert.ok(xml.includes('<loc>'+url+'</loc>'),'Missing sitemap URL '+url);
 }
 assert.ok(xml.includes('hreflang="ru" href="https://syntha.pro/'+page+'"'));
 assert.ok(xml.includes('hreflang="en" href="https://syntha.pro/en/'+page+'"'));
}
const all=[...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);
assert.equal(all.length,new Set(all).size,'Duplicate canonical URLs in sitemap');
assert.equal(all.length,20,'Expected 12 core + 8 bilingual profile/analytics/economics/privacy URLs');
console.log('PASS: complete 20-URL V2 sitemap with RU/EN profile, analytics, economics and privacy hreflang');
