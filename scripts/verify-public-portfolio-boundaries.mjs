#!/usr/bin/env node
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PROJECTS as CORE } from '../assets/content.js';
import { EXTRA_PROJECTS as EXTRA } from '../assets/portfolio-extensions.js';

const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const paths=[
  'assets/app.js','assets/content.js','assets/portfolio-extensions.js',
  'assets/deck.js','assets/logos.js','index.html','en/index.html'
];
const prohibited=/\b(?:yanina|mvst)\b/i;
for(const path of paths){
  const source=read(path);
  assert.doesNotMatch(source,prohibited,'Prohibited customer/brand name leaked into public V2: '+path);
}
const all=[...CORE,...EXTRA];
assert.equal(all.length,11,'Full bilingual V2 must present exactly 11 curated products');
assert.equal(new Set(all.map(p=>p.id)).size,11,'No duplicated project IDs');
const noUnverifiedMedia=['fashion-os','fur','antiqua','igra','marco','fintech'];
for(const id of noUnverifiedMedia){
 const p=all.find(x=>x.id===id);
 assert.ok(p,'Missing product '+id);
 assert.deepEqual(p.shots,[],'No unverified screenshot should appear in '+id);
 for(const lang of ['ru','en']){
   const c=p[lang];
   assert.ok(c?.card && c?.stage && c?.roadmap?.length>0 && c?.capabilities?.length>0,
     id+' '+lang+': need a functional map and explicit maturity');
   assert.ok(c?.status?.next?.length>0,id+' '+lang+': unresolved gate must be visible');
 }
}
const art=all.find(p=>p.id==='antiqua');
assert.ok(art?.ru?.card.includes('живописи'),'Antiqua must describe paintings and works on paper');
assert.doesNotMatch(JSON.stringify(art.ru)+JSON.stringify(art.en),/антиквариат|антикварных|antiques\b/i,
  'Antiqua public scope must not revert to antiques/collectibles');
const healthcare=all.find(p=>p.id==='promomed');
assert.ok(healthcare,'Missing independent health event concept');
assert.match(healthcare.ru.stage,/Независимый прототип/, 'Independent concept must be clearly visible in RU stage');
assert.match(healthcare.en.stage,/Independent concept/, 'Independent concept must be clearly visible in EN stage');
assert.doesNotMatch(healthcare.ru.who,/«Промомед» получает/, 'Do not assert measured Promomed client benefit');
assert.doesNotMatch(healthcare.en.who,/Promomed gains/, 'Do not assert corporate approval or observed outcome');
const fur=all.find(p=>p.id==='fur');
assert.equal(fur.name,'THE FUR','FUR must remain a neutral platform dossier');
const svedo=all.find(p=>p.id==='fintech');
assert.equal(svedo.name,'SVEDO');
assert.match(svedo.ru.stage,/production|прототип/i);
assert.match(svedo.en.status.next.join(' '),/PostgreSQL/);
assert.doesNotMatch(svedo.ru.card,/запущенный банковский сервис/i);
assert.match(svedo.ru.stage,/v64.*HOLD/i,'SVEDO dossier must name the verified local-candidate version and hold');
assert.match(svedo.en.stage,/v64.*HOLD/i,'EN must have matching local-candidate maturity');
assert.match(svedo.ru.status.done.join(' '),/188\\/188/, 'No fabricated or stale UX evidence');
assert.match(svedo.en.status.done.join(' '),/84\\/84/, 'Bilingual financial-test evidence must match v64 report');
assert.match(svedo.ru.investor.note,/не опубликованный/, 'No launch claim');
assert.match(svedo.en.investor.note,/not a launched/, 'No launch claim in EN');
const client=all.find(p=>p.id==='marco');
assert.ok(client?.ru?.stage && !/production готов|production ready/i.test(client.ru.stage),
  'Showroom must not silently assert PostgreSQL production admission');
const html=read('index.html')+read('en/index.html');
assert.ok(!html.includes('id="order-now"')&&!html.includes('data-buy-equity'),
  'Capital scenario does not authorize a public checkout or securities transaction');
console.log('PASS: 11 honest dossier scopes with SVEDO v64, no customer brands, six screenless functional cards and unverified-maturity guards');
