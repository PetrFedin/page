#!/usr/bin/env node
/**
 * Netlify-only staging protections, applied after the normal isolated V2 static
 * release passes its source checks. Never change the main site or the source
 * pages for this environment-specific behavior.
 */
import assert from 'node:assert/strict';
import {existsSync,readFileSync,writeFileSync} from 'node:fs';
const directory=new URL('../dist-pages/',import.meta.url);
const guard=new URL('assets/netlify-review-guard.js',directory);
assert.ok(existsSync(guard),'netlify guard must be packaged with the static assets');
const ref=/^[a-f0-9]{40}$/;
for (const path of ['index.html','en/index.html']){
 const file=new URL(path,directory);
 let html=readFileSync(file,'utf8');
 assert.ok(html.includes('name="syntha-build-commit"'),'Missing source SHA in '+path);
 assert.ok(!html.includes('netlify-review-guard.js'),'Guard must not be duplicated in '+path);
 html=html.replace(/<meta\s+name=["']robots["'][^>]*>\s*/gi,'');
 assert.ok(html.includes('</head>'),'Missing head in '+path);
 html=html.replace('</head>',
  '<meta name="robots" content="noindex, nofollow, noarchive">\n'+
  '<script defer src="/assets/netlify-review-guard.js"></script>\n</head>');
 writeFileSync(file,html);
 assert.ok(html.includes('name="robots" content="noindex, nofollow, noarchive"'),'Noindex missing');
}
const headersFile=new URL('_headers',directory);
const headers=readFileSync(headersFile,'utf8').trimEnd();
const lastRule=headers.lastIndexOf('\n/*\n');
assert.ok(lastRule>=0,'Netlify _headers must have a catch-all rule');
const finalSection=headers.slice(lastRule);
assert.ok(!finalSection.includes('\n/'),'Expected catch-all rule to be last');
assert.ok(!finalSection.includes('X-Robots-Tag:'),'No duplicate robots header');
writeFileSync(headersFile,headers+'\n  X-Robots-Tag: noindex, nofollow, noarchive\n');
const health=JSON.parse(readFileSync(new URL('release-health.json',directory),'utf8'));
assert.match(health.source_sha,ref,'Source SHA must remain the reviewed source');
assert.equal(health.functions_bundled,false,'Netlify static review cannot claim a contact backend');
console.log('PASS: Netlify review-only noindex, non-submitting contact UI and exact source marker');
