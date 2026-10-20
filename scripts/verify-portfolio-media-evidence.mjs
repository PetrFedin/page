#!/usr/bin/env node
/* Public media must be source-pinned and cannot be promoted without verified bytes.
   Before the media sync, no new captures are embedded. After sync, every file
   referenced by the portfolio must have a SHA-256 in the reviewed media catalog. */
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {join} from 'node:path';
import {PORTFOLIO_MEDIA_EVIDENCE as records} from '../assets/portfolio-media-evidence.js';
import {PROJECTS} from '../assets/content.js';

assert.deepEqual(Object.keys(records).sort(),['chatx','fashion-os','promomed']);
for(const [id,row] of Object.entries(records)){
 assert.match(row.sourceSha,/^[0-9a-f]{40}$/);
 assert.match(row.asOf,/^\d{4}-\d\d-\d\d$/);
 assert.ok(row.runUrl.startsWith('https://github.com/PetrFedin/'));
 assert.match(row.runUrl,/\/actions\/runs\/[0-9]+$/);
 assert.ok(row.screenshots>0 && (row.videoSeconds===0 || row.videoSeconds>=20&&row.videoSeconds<=30));
}
const ready=existsSync('assets/portfolio-reviewed/catalog.json');
assert.equal(records['fashion-os'].approvedForEmbedding,false,'Older fashion OS media is still on HOLD');
if(ready){
 const catalog=JSON.parse(readFileSync('assets/portfolio-reviewed/catalog.json','utf8'));
 assert.equal(catalog.status,'preview-reviewed');
 assert.equal(catalog.no_external_client_adoption_claim,true);
 assert.deepEqual(catalog.verified.map(x=>x.id).sort(),['chatx','sostoyanie']);
 for(const entry of catalog.verified){
  const id=entry.id==='sostoyanie'?'promomed':entry.id;
  assert.equal(records[id].approvedForEmbedding,true,id+' must explicitly admit verified capture');
  assert.equal(entry.source_sha,records[id].sourceSha,'Source SHA drift in '+id);
  const product=PROJECTS.find(x=>x.id===id);
  assert.ok(product, 'Missing project '+id);
  const referenced=[...product.shots,product.video];
  for(const x of entry.files){
   const path=join('assets/portfolio-reviewed',entry.id,x.name);
   assert.ok(existsSync(path),'Missing media file '+path);
   const raw=readFileSync(path);
   assert.equal(raw.length,x.bytes,'Media size mismatch '+x.name);
   assert.equal(createHash('sha256').update(raw).digest('hex'),x.sha256,
    'Tampered media file '+x.name);
   assert.ok(referenced.includes('/'+path.replaceAll('\\', '/')),
    'Verified media not referenced by project '+x.name);
  }
  assert.equal(new Set(referenced).size,referenced.length,'Duplicate project frames '+id);
 }
} else {
 assert.equal(records.chatx.approvedForEmbedding,false,'Do not embed without manifest');
 assert.equal(records.promomed.approvedForEmbedding,false,'Do not embed without manifest');
}
const html=readFileSync('index.html','utf8');
const app=readFileSync('assets/app.js','utf8');
assert.match(app,/showPortfolioMediaEvidence\(\{id:p.id,lang/);
assert.match(app,/from '\.\/portfolio-media-evidence\.js/);
assert.match(html,/brand-platform\.css/);
assert.doesNotMatch(JSON.stringify(records),/syntha-live-26sec/i,
 'The old landing capture is NOT a Syntha product video');
console.log('PASS: media evidence controls, 3 run records, '+(ready?'byte-verified current captures':'all new captures on HOLD'));
