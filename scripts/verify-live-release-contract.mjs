#!/usr/bin/env node
import assert from 'node:assert/strict';
import {
  extractEntrypoints, extractModuleImports, verifyLiveRelease
} from './verify-live-release.mjs';

const sha='a'.repeat(40),date='2026-10-13';
const domain='https://preview-syntha.pages.dev';
const moduleNames=[
  'opportunity-studio.js','opportunity-economics.js','opportunity-copy.js',
  'advisory-economics.js','lead-paths.js','investor-calculator.js'
];
function html(lang) {
  return '<!doctype html><html lang="'+lang+'"><head>'+
    '<meta name="syntha-build-commit" content="'+sha+'">'+
    '<link rel="canonical" href="https://syntha.pro/'+(lang==='en'?'en/':'')+'">'+
    '<link rel="stylesheet" href="/assets/styles.css?v=20261015-new-version">'+
    '</head><body><div id="turnstile-widget"></div>'+
    '<div id="lead-routes-grid"></div><div id="lead-project-value"></div>'+
    '<div id="opportunities"></div><div id="nav-opportunities"></div>'+
    '<article id="post-'+date+'"></article>'+
    '<script type="module" src="/assets/app.js?v=20261015-new-version"></script>'+
    '</body></html>';
}
function response(text, mime='text/html', status=200) {
  return new Response(text,{status,headers:{'content-type':mime}});
}
function responder(path) {
  if(path==='/')return response(html('ru'));
  if(path==='/en/')return response(html('en'));
  if(path.startsWith('/assets/app.js'))return response(
    moduleNames.map(x=>"import './"+x+"?v=new';").join('\n'),'text/javascript');
  if(path.startsWith('/assets/styles.css'))return response('.opportunity-studio{}','text/css');
  if(moduleNames.some(x=>path.startsWith('/assets/'+x)))return response('export const ready = true;','text/javascript');
  if(path==='/release-health.json')return response(JSON.stringify({
    source_sha:sha,bundle:'public-static-only',functions_bundled:false,
    languages:['ru','en'],asset_count:50
  }),'application/json');
  if(path==='/sitemap.xml')return response('<?xml version="1.0"?><urlset/>','application/xml');
  if(path==='/robots.txt')return response('User-agent: *\nAllow: /','text/plain');
  if(path.endsWith('feed.xml'))return response('<rss><channel><item><guid>#post-'+date+'</guid></item></channel></rss>','application/rss+xml');
  if(path.endsWith('feed.json'))return response(JSON.stringify({items:[{id:domain+'/#post-'+date}]}),'application/feed+json');
  return response('not found','text/plain',404);
}
let requests=[];
const fetcher = async(url,options)=>{
  assert.equal(options.redirect,'manual');
  const x=new URL(url);assert.equal(x.origin,domain);
  requests.push(x.pathname+x.search);
  return responder(x.pathname+x.search);
};
assert.deepEqual([...extractEntrypoints(html('ru'),domain).keys()].sort(),[
  '/assets/app.js?v=20261015-new-version','/assets/styles.css?v=20261015-new-version'
]);
assert.deepEqual(extractModuleImports("import { x } from './opportunity-studio.js?v=2'",'/assets/app.js',domain),
  ['/assets/opportunity-studio.js?v=2']);
const passed=await verifyLiveRelease({
  releaseUrl:domain,expectedSha:sha,expectedEditorialDate:date,fetcher
});
assert.equal(passed.ok,true);
assert.equal(passed.assets,7);
assert.ok(requests.includes('/assets/app.js?v=20261015-new-version'),
  'Must follow actual HTML version, never hardcode old cache tags');
assert.ok(requests.some(x=>x.startsWith('/assets/opportunity-copy.js')));
assert.ok(!requests.some(x=>x.includes('20261013-leads2')),
  'Previous cached JS/CSS revisions cannot enter current admission');

await assert.rejects(verifyLiveRelease({
  releaseUrl:domain,expectedSha:'b'.repeat(40),expectedEditorialDate:date,fetcher
}),/SHA|commit/);
await assert.rejects(verifyLiveRelease({
  releaseUrl:'http://preview-syntha.pages.dev',expectedSha:sha,fetcher
}),/HTTPS/);
await assert.rejects(verifyLiveRelease({
  releaseUrl:'https://example.com',expectedSha:sha,fetcher
}),/Only SYNTHA/);
await assert.rejects(verifyLiveRelease({
  releaseUrl:domain,expectedSha:sha,expectedEditorialDate:'2026-10-32',fetcher
}),/date/i);
await assert.rejects(verifyLiveRelease({
  releaseUrl:domain,expectedSha:sha,expectedEditorialDate:date,
  fetcher:async(url,opts)=>{
    const key=new URL(url).pathname;
    return key==='/assets/opportunity-economics.js'
      ?response('<html>SPA fallback</html>','text/html'):fetcher(url,opts);
  }
}),/expected JS MIME/);
await assert.rejects(verifyLiveRelease({
  releaseUrl:domain,expectedSha:sha,expectedEditorialDate:date,
  fetcher:async(url,opts)=>{
    const path=new URL(url).pathname;
    return path==='/release-health.json'
      ? response('<!doctype html><html>fallback</html>','text/html')
      : fetcher(url,opts);
  }
}),/expected JSON MIME/);
await assert.rejects(verifyLiveRelease({
  releaseUrl:domain,expectedSha:sha,expectedEditorialDate:date,
  fetcher:async(url,opts)=>{
    const path=new URL(url).pathname;
    return path==='/channel-queue.json'?response('private queue','application/json'):fetcher(url,opts);
  }
}),/leaked private/);
await assert.rejects(verifyLiveRelease({
  releaseUrl:domain,expectedSha:sha,expectedEditorialDate:'2026-10-14',fetcher
}),/approved article|prerendered/);
console.log('PASS: dynamic imports, exact SHA, editorial freshness, HTML fallback and private-source leakage rejected');
