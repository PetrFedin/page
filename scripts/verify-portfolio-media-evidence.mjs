#!/usr/bin/env node
/* Validate the entire real-media evidence chain. Fail closed before sync. */
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {join} from 'node:path';
import {PORTFOLIO_MEDIA_EVIDENCE as records} from '../assets/portfolio-media-evidence.js';
import {PROJECTS as CORE} from '../assets/content.js';
import {EXTRA_PROJECTS as EXTRA} from '../assets/portfolio-extensions.js';

const ready=existsSync('assets/portfolio-reviewed/catalog.json');
assert.deepEqual(Object.keys(records).sort(),ready
 ? ['antiqua','chatx','fashion-os','promomed','renova','syntha']
 : ['chatx','fashion-os','promomed']);
for(const [id,row] of Object.entries(records)){
 assert.match(row.sourceSha,/^[0-9a-f]{40}$/);
 assert.match(row.asOf,/^\d{4}-\d\d-\d\d$/);
 assert.ok(row.runUrl.startsWith('https://github.com/PetrFedin/'));
 assert.match(row.runUrl,/\/actions\/runs\/[0-9]+$/);
 assert.ok(row.screenshots>0);
 assert.ok(row.videoSeconds===0||(row.videoSeconds>=20&&row.videoSeconds<=30));
}
assert.equal(records['fashion-os'].approvedForEmbedding,false,'Older Fashion OS capture stays unapproved');
if(ready){
 const catalog=JSON.parse(readFileSync('assets/portfolio-reviewed/catalog.json','utf8'));
 assert.equal(catalog.status,'preview-reviewed');
 assert.equal(catalog.no_external_client_adoption_claim,true);
 assert.deepEqual(catalog.verified.map(x=>x.id).sort(),
  ['antiqua','chatx','renova','sostoyanie','syntha']);
 let count=0;
 for(const entry of catalog.verified){
  assert.equal(entry.production_admitted,false,'Must never label browser demo as client production');
  const id=entry.id==='sostoyanie'?'promomed':entry.id;
  assert.equal(records[id].approvedForEmbedding,true,'Unapproved evidence in project '+id);
  assert.equal(entry.source_sha,records[id].sourceSha,'Source SHA drift in '+id);
  const product=[...CORE,...EXTRA].find(p=>p.id===id);
  assert.ok(product,'Missing project '+id);
  const referenced=[...(product.shots||[]),product.video].filter(Boolean);
  assert.equal(new Set(referenced).size,referenced.length,'Duplicate gallery assets '+id);
  const sourceFiles=entry.files.map(x=>x.name);
  assert.equal(new Set(sourceFiles).size,sourceFiles.length,'Repeated source filename '+id);
  for(const x of entry.files){
   const path=join('assets/portfolio-reviewed',entry.id,x.name);
   assert.ok(existsSync(path),'Missing actual media '+path);
   const raw=readFileSync(path);
   assert.equal(raw.length,x.bytes,'Media byte size drift '+path);
   assert.equal(createHash('sha256').update(raw).digest('hex'),x.sha256,'Media tampering '+path);
   assert.ok(referenced.includes('/'+path.replaceAll('\\','/')),'Orphaned product frame '+path);
   count++;
  }
  for(const x of referenced){
   assert.ok(x.includes('/portfolio-reviewed/'+entry.id+'/'),'Stale video/screenshot path in '+id+': '+x);
  }
 }
 assert.equal(count,22,'Expected exactly 22 original, byte-verified media files');
} else {
 assert.equal(records.chatx.approvedForEmbedding,false);
 assert.equal(records.promomed.approvedForEmbedding,false);
}
const html=readFileSync('index.html','utf8');
const app=readFileSync('assets/app.js','utf8');
assert.match(app,/showPortfolioMediaEvidence\(\{id:p.id,lang/);
assert.match(app,/from '\.\/portfolio-media-evidence\.js/);
assert.match(html,/brand-platform\.css/);
assert.doesNotMatch(JSON.stringify(records),/syntha-live-26sec/i,
 'Old landing screen recording must not be relabeled as the Syntha product');
console.log('PASS: '+(ready?'22 SHA-256-verified assets for five projects':'media import withheld until source verification'));
