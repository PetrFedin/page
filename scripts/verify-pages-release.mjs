#!/usr/bin/env node
import assert from 'node:assert/strict';
import {readFileSync,readdirSync,existsSync} from 'node:fs';
import {join} from 'node:path';
const root=new URL('../',import.meta.url);
const read=path=>readFileSync(new URL('dist-pages/'+path,root),'utf8');
for(const lang of ['ru','en']){
 const file=lang==='ru'?'index.html':'en/index.html',html=read(file);
 assert.ok(html.includes('id="lead-routes-grid"'),lang+' lead routes missing');
 assert.ok(html.includes('id="turnstile-widget"'),lang+' captcha widget missing');
 assert.ok(/<div class="cf-turnstile" id="turnstile-widget"[^>]*><\/div>/.test(html),
   lang+' must render an empty challenge container');
 assert.ok(!html.includes('cf-chl-widget-'),lang+' contains prerendered challenge markup');
 assert.ok(!/<input[^>]*name="cf-turnstile-response"/.test(html),
   lang+' contains stale challenge tokens');
 assert.ok(html.includes('name="consent"'),lang+' consent field missing');
}
for(const blocked of ['functions','scripts','docs','private','.github','channel-queue.json','package.json']){
 assert.ok(!existsSync(new URL('dist-pages/'+blocked,root)),'private path leaked: '+blocked);
}
for(const required of ['index.html','en/index.html','privacy.html','en/privacy.html','assets/app.js','assets/lead-paths.js','assets/news.js','assets/investor-calculator.js','_headers','_routes.json']){
 assert.ok(existsSync(new URL('dist-pages/'+required,root)),'public asset missing: '+required);
}
const staticManifest=JSON.parse(readFileSync(new URL('../qa-artifacts/pages-release-manifest.json',import.meta.url),'utf8'));
assert.ok(staticManifest.files>=30,'unexpectedly small release payload');
assert.ok(!staticManifest.assets.some(x=>/\.env$|private\/|docs\/|scripts\/|functions\//.test(x)),'manifest leaked source');
console.log('PASS: RU/EN captcha widget is clean after prerender, consent available, release assets allowlisted, private source absent');
