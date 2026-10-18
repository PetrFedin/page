#!/usr/bin/env node
/* Public media admission stays fail-closed: source runs != approved assets. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {PORTFOLIO_MEDIA_EVIDENCE as records} from '../assets/portfolio-media-evidence.js';

const keys=Object.keys(records).sort();
assert.deepEqual(keys,['chatx','fashion-os','promomed'],'Only source-verified capture sets allowed');
for(const id of keys){
 const row=records[id];
 assert.match(row.sourceSha,/^[0-9a-f]{40}$/);
 assert.match(row.asOf,/^\d{4}-\d\d-\d\d$/);
 assert.ok(row.runUrl.startsWith('https://github.com/PetrFedin/'));
 assert.match(row.runUrl,/\/actions\/runs\/[0-9]+$/);
 assert.ok(row.screenshots>0);
 assert.ok(row.videoSeconds===0 || row.videoSeconds>=20&&row.videoSeconds<=30);
 assert.equal(row.approvedForEmbedding,false,'Never auto-publish unreviewed capture: '+id);
}
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const app=readFileSync(new URL('../assets/app.js',import.meta.url),'utf8');
assert.match(app,/showPortfolioMediaEvidence\(\{id:p.id,lang/);
assert.match(app,/from '\.\/portfolio-media-evidence\.js/);
assert.match(html,/brand-platform\.css/);
assert.doesNotMatch(JSON.stringify(records),/syntha-live-26sec/i,
 'Old landing capture is not product media');
console.log('PASS: provenance under 3 source runs, two 25-27s videos, explicit editorial HOLD and no public asset substitution');
