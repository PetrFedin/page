#!/usr/bin/env node
/**
 * Read-only Cloudflare preview/production admission. No form submission or secrets.
 *   RELEASE_URL=https://preview.pages.dev EXPECTED_SHA=<40hex> node scripts/verify-live-release.mjs
 */
import assert from 'node:assert/strict';

const base=process.env.RELEASE_URL||'';
const expected=process.env.EXPECTED_SHA||'';
assert.match(expected,/^[a-f0-9]{40}$/,'EXPECTED_SHA is required');
const host=new URL(base);
assert.equal(host.protocol,'https:','only HTTPS release environments accepted');
assert.ok(!host.username&&!host.password,'URL must not contain credentials');
const root=host.origin;
const checked=[];
async function get(path,contentType) {
 const res=await fetch(root+path,{redirect:'manual',signal:AbortSignal.timeout(15000)});
 assert.equal(res.status,200,path+' HTTP 200');
 if(contentType)assert.ok((res.headers.get('content-type')||'').includes(contentType),
   path+' expected '+contentType);
 checked.push(path);
 return res.text();
}
for(const [path,language] of [['/','ru'],['/en/','en']]) {
 const html=await get(path,'text/html');
 assert.match(html,new RegExp('<html lang="'+language+'"'),'correct language');
 assert.ok(html.includes('<meta name="syntha-build-commit" content="'+expected+'">'),
   path+' does not match expected source commit');
 assert.ok(html.includes('id="turnstile-widget"'),path+' Turnstile widget unavailable');
 assert.ok(!html.includes('cf-chl-widget-'),path+' stale prerendered Turnstile tokens');
 assert.ok(html.includes('id="lead-routes-grid"'),path+' missing conversion routes');
 assert.ok(html.includes('id="lead-project-value"'),path+' missing project-qualified lead context');
 const canonical=language==='en'?root+'/en/':root+'/';
 assert.ok(html.includes('rel="canonical" href="https://syntha.pro/'+(language==='en'?'en/':'')+'"'),
   path+' canonical expected to point to primary domain');
}
for(const path of ['/assets/app.js?v=20261013-leads2',
                    '/assets/lead-paths.js?v=20261013-leads1',
                    '/assets/portfolio-extensions.js?v=20261012-invdossiers',
                    '/assets/investor-calculator.js?v=20261012-calc1',
                    '/assets/styles.css?v=20261013-leads2',
                    '/sitemap.xml','/feed.xml','/en/feed.xml','/robots.txt'])
 await get(path);
for(const path of ['/channel-queue.json','/docs/PAGE_V2_RELEASE_CONVERSION_EDITORIAL_2026-10-13.md',
                   '/functions/api/contact.js','/package.json']) {
 const response=await fetch(root+path,{redirect:'manual',signal:AbortSignal.timeout(15000)});
 assert.notEqual(response.status,200,'sensitive source publicly exposed: '+path);
}
console.log('PASS: served SHA '+expected+' at '+root+'; RU+EN, assets and private-source denials; '+checked.length+' GET routes verified');
console.log('UNVERIFIED: actual Turnstile challenge and Telegram delivery require an authorised live test.');
