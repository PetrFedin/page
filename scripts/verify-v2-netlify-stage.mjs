#!/usr/bin/env node
/**
 * V2 Netlify release acceptance: checks the actual transformed public package,
 * not just its Cloudflare-origin source files.
 */
import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
import {join} from 'node:path';
import {PROJECTS as CORE_PROJECTS} from '../assets/content.js';
import {EXTRA_PROJECTS} from '../assets/portfolio-extensions.js';
import {BUSINESS_SERVICES} from '../assets/business-services.js';

const dir='dist-pages';
const pages=['index.html','en/index.html','privacy.html','en/privacy.html',
 'analytics.html','en/analytics.html','economics.html','en/economics.html',
 'profile.html','en/profile.html',
 ...['syntha','chatx','renova','mfw','promomed'].flatMap(id=>[id+'.html','en/'+id+'.html']),
 'marco-pescarolo.html'];
assert.equal(pages.length,21);
let labelled=0;
for(const path of pages){
 const file=join(dir,path);
 assert.ok(existsSync(file),'Missing packaged page '+path);
 const html=readFileSync(file,'utf8');
 assert.ok(!/href=["']\/stats(?:["'?])/i.test(html),'Unimplemented admin route on '+path);
 assert.match(html,/<meta name="robots" content="noindex, nofollow, noarchive">/,'Noindex on '+path);
 for(const match of html.matchAll(/<button\b[^>]*\bid="(?:photo-prev|photo-next|post-prev|post-next|text-size-toggle|photo-zoom)"[^>]*>/g)){
   assert.match(match[0],/aria-label="/,'Icon-only navigation is unlabeled in '+path);
   labelled++;
 }
}
for(const path of ['index.html','en/index.html']){
 const html=readFileSync(join(dir,path),'utf8');
 assert.match(html,/netlify-review-guard\.js/,'Runtime readiness guard required');
 assert.match(html,/name="syntha-build-commit"/,'SHA marker required');
 assert.match(html,/id="projects-more"/,'Expand other projects');
 assert.match(html,/id="consulting"/,'Consulting content required');
 assert.match(html,/id="contact"/,'Contact section required');
}
const track=readFileSync(join(dir,'assets/track.js'),'utf8');
assert.ok(track.includes("netlify\\.app"),'Netlify preview must not send events to absent /api/t');
const app=readFileSync(join(dir,'assets/app.js'),'utf8');
assert.ok(app.includes('window.__contactBackendReady === true'),'Netlify contacts fail-closed');
assert.ok(app.includes('syncSubmit();\n  }\n});'),'Send button must be recomputed after server failure');
const ids=[...CORE_PROJECTS,...EXTRA_PROJECTS].map(p=>p.id);
assert.equal(ids.length,11);
assert.equal(new Set(ids).size,11,'Unique projects');
assert.equal(BUSINESS_SERVICES.ru.items.length,5);
assert.equal(BUSINESS_SERVICES.en.items.length,5);
for(const item of BUSINESS_SERVICES.en.items){
 for(const key of ['audience','pains','work','deliverables','stages','inputs']){
  assert.ok(Array.isArray(item[key])&&item[key].length>0,'EN missing '+item.id+'.'+key);
  assert.doesNotMatch(JSON.stringify(item[key]),/[А-Яа-яЁё]/,'RU leak in EN '+item.id+'.'+key);
 }
}
const release=JSON.parse(readFileSync(join(dir,'release-health.json'),'utf8'));
assert.match(release.source_sha,/^[a-f0-9]{40}$/);
assert.equal(release.functions_bundled,false);
assert.ok(labelled>=10,'Expected a set of labelled modal/carousel controls');
console.log('PASS: Netlify V2 static gate on '+pages.length+' pages, '+ids.length+' projects, 5 translated services and '+labelled+' labelled controls at '+release.source_sha);
