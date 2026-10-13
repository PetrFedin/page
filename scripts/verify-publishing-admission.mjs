#!/usr/bin/env node
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {editorialPublishingEnabled,publishDue} from '../functions/api/_lib.js';
import {onRequest as cron} from '../functions/api/cron.js';
import {normalizeLeadRoute,qualifyLead} from '../functions/api/stats.js';

const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
let dbCalls=0;
const DB={prepare(){dbCalls++;throw Error('DB must not be used without editorial approval')}};
assert.equal(editorialPublishingEnabled({}),false);
assert.equal(editorialPublishingEnabled({EDITORIAL_PUBLISH_ENABLED:'false'}),false);
assert.equal(editorialPublishingEnabled({EDITORIAL_PUBLISH_ENABLED:true}),false);
assert.equal(editorialPublishingEnabled({EDITORIAL_PUBLISH_ENABLED:'true'}),true);
assert.equal(await publishDue({DB}),0);
assert.equal(await publishDue({DB,EDITORIAL_PUBLISH_ENABLED:'false'}),0);
assert.equal(await publishDue({DB},{onlyId:123}),0);
assert.equal(dbCalls,0,'no database queries or publication with gate disabled');

const req=(key)=>new Request('https://example.test/api/cron',{headers:{'x-cron-key':key}});
assert.equal((await cron({request:req('wrong'),env:{CRON_KEY:'correct',EDITORIAL_PUBLISH_ENABLED:'true'}})).status,403);
const disabled=await cron({request:req('correct'),env:{CRON_KEY:'correct',EDITORIAL_PUBLISH_ENABLED:'false',DB}});
assert.equal(disabled.status,503);
assert.deepEqual(await disabled.json(),{published:0,enabled:false});
assert.equal(dbCalls,0);

const posts=read('functions/api/posts.js');
assert.ok(posts.includes("action === 'now' && !editorialPublishingEnabled(env)"),'admin must not force publish with gate off');
const getBlock=posts.slice(posts.indexOf('export async function onRequestGet'),posts.indexOf('export async function onRequestPost'));
assert.ok(!getBlock.includes('publishDue('),'admin GET must be side effect free');
const t=read('functions/api/t.js');
assert.ok(!t.includes('publishDue('),'page-visit analytics must never trigger publishing');
assert.ok(!t.includes("import { publishDue"),'analytics should not load editorial publisher');
const queueScript=read('scripts/tg-queue.mjs');
assert.ok(queueScript.includes("env.EDITORIAL_PUBLISH_ENABLED !== 'true'"),'unattended legacy Telegram queue requires explicit approval');


assert.equal(normalizeLeadRoute('client'),'consulting');
assert.equal(normalizeLeadRoute('investor'),'investment');
assert.equal(normalizeLeadRoute('pilot'),'pilot');
assert.equal(normalizeLeadRoute('consulting'),'consulting');
for(const route of ['client','pilot','investor']){
 const scored=qualifyLead({}, {route,project:'fintech',goal:'Intro',timing:'0–1 month'});
 assert.equal(scored.route,route);
 assert.equal(scored.stage,'needs_review','self-selected route cannot mean verified lead');
 assert.equal(scored.requiresHumanReview,true);
 assert.ok(scored.score>=0&&scored.score<=100);
 assert.ok(scored.reasons.some(r=>r.includes('Предварительный сигнал')));
}
const unknown=qualifyLead({},{});
assert.equal(unknown.score,null);
assert.equal(unknown.requiresHumanReview,true);
console.log('PASS: editorial fail-closed + read-only analytics + human-qualified V2 lead stages');