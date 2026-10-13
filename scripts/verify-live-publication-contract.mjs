#!/usr/bin/env node
import assert from 'node:assert/strict';
import {
  assertFeedXml, assertFeedJson, assertHtml, assertReleaseManifest,
  verifyLivePublication
} from './verify-live-publication.mjs';

const date = '2026-10-13';
const sha = 'a'.repeat(40);
const makeRss = (d) => '<rss><channel><item><guid>https://syntha.pro/#post-' + d +
  '</guid></item><item><guid>https://syntha.pro/#post-2026-10-02</guid></item></channel></rss>';
const makeJson = (d) => JSON.stringify({items:[
  {id:'https://syntha.pro/#post-'+d},{id:'https://syntha.pro/#post-2026-10-02'}
]});
const makeHtml = (lang,d) => '<!doctype html><html lang="' + lang +
  '"><body><div id="post-' + d + '"></div><div id="turnstile-widget"></div></body></html>';

assertFeedXml(makeRss(date),date,'ru');
assertFeedJson(makeJson(date),date,'ru');
assertHtml(makeHtml('en',date),date,'en');
assertHtml(makeHtml('en',date),date,'en',true);
assert.throws(()=>assertHtml(makeHtml('en',date)+'cf-chl-widget-bad',date,'en',true),/transient captcha/);
assertReleaseManifest(JSON.stringify({source_sha:sha,bundle:'public-static-only',functions_bundled:false}),sha);
assert.throws(()=>assertFeedXml(makeRss('2026-10-02'),date,'ru'));
assert.throws(()=>assertFeedJson(makeJson('2026-10-02'),date,'en'));
assert.throws(()=>assertHtml(makeHtml('ru','2026-10-02'),date,'ru'));
assert.throws(()=>assertReleaseManifest('<!doctype html>',sha),/not JSON/);
assert.throws(()=>assertReleaseManifest(JSON.stringify({source_sha:'b'.repeat(40)}),sha));

const outputs = new Map([
 ['/','text/html'],
 ['/en/','text/html'],
 ['/feed.xml','application/rss+xml'],
 ['/en/feed.xml','application/rss+xml'],
 ['/feed.json','application/feed+json'],
 ['/en/feed.json','application/feed+json'],
 ['/assets/news.js','text/javascript'],
 ['/release-health.json','application/json']
]);
const payload = (path) => {
  if (path==='/') return makeHtml('ru',date);
  if (path==='/en/') return makeHtml('en',date);
  if (path.endsWith('.xml')) return makeRss(date);
  if (path.endsWith('feed.json')) return makeJson(date);
  if (path==='/assets/news.js') return "date:'2026-10-13'";
  if (path==='/release-health.json') return JSON.stringify({source_sha:sha,bundle:'public-static-only',functions_bundled:false});
  throw new Error('unexpected route '+path);
};
const fetcher = async (url) => {
  const path = new URL(url).pathname;
  assert.ok(outputs.has(path),'No unapproved network routes');
  return {status:200,headers:{get:()=>outputs.get(path)},text:async()=>payload(path)};
};
const result = await verifyLivePublication({releaseUrl:'https://preview-demo.pages.dev',date,expectedSha:sha,fetcher});
assert.equal(result.ok,true);
assert.equal(result.checked.length,8);
assert.equal(result.shaVerified,true);
const without = await verifyLivePublication({releaseUrl:'https://preview-demo.pages.dev',date,fetcher});
assert.equal(without.checked.length,7);
assert.equal(without.shaVerified,false);
await assert.rejects(verifyLivePublication({releaseUrl:'http://preview-demo.pages.dev',date,fetcher}),/HTTPS/);
await assert.rejects(verifyLivePublication({releaseUrl:'https://example.test',date,fetcher}),/Only syntha.pro/);
await assert.rejects(verifyLivePublication({releaseUrl:'https://user:password@preview-demo.pages.dev',date,fetcher}),/Credentials/);
await assert.rejects(verifyLivePublication({releaseUrl:'https://preview-demo.pages.dev/subdir',date,fetcher}),/origin/);
await assert.rejects(verifyLivePublication({releaseUrl:'https://preview-demo.pages.dev',date:'2026-10-32',fetcher}));
await assert.rejects(verifyLivePublication({
  releaseUrl:'https://preview-demo.pages.dev',date,fetcher:async url=>{
    const response=await fetcher(url);
    if(new URL(url).pathname==='/feed.xml')return {...response,text:async()=>makeRss('2026-10-02')};
    return response;
  }
}),/latest RSS/);
console.log('PASS: read-only live release contract, bilingual feeds and pages, strict optional SHA, stale-site rejection.');
