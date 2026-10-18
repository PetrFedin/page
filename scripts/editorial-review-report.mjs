#!/usr/bin/env node
/**
 * Repeatable, read-only editorial audit for V2. Does not publish a post,
 * send Telegram, mutate a queue or make network requests.
 * Intended for twice-weekly content preparation and a human release review.
 */
import assert from 'node:assert/strict';
import {mkdirSync,readFileSync,writeFileSync} from 'node:fs';
import {NEWS} from '../assets/news.js';

const raw=readFileSync(new URL('../channel-queue.json',import.meta.url),'utf8');
const queue=JSON.parse(raw);
const byDate=new Map(NEWS.map(x=>[x.date,x]));
assert.equal(byDate.size,NEWS.length,'Every post needs a unique editorial date');
const dates=new Set([...queue.order,...queue.paused]);
assert.equal(dates.size,queue.order.length+queue.paused.length,
 'A post cannot simultaneously be ready for release and on review hold');
const review=[];
for(const date of queue.paused){
 const post=byDate.get(date);
 assert.ok(post,'Missing draft source '+date);
 if(date>='2026-10-15'){
  assert.equal(post.site,false,'Draft must remain nonpublic '+date);
  assert.ok(post.ru?.title?.length>=10&&post.en?.title?.length>=10,'RU/EN draft titles '+date);
  assert.ok(post.ru.body.length>=180&&post.en.body.length>=180,'RU/EN editorial material '+date);
  if(date>='2026-10-20'){
   assert.ok(post.source?.original?.startsWith('https://github.com/PetrFedin/'),
    'New project commentary needs a public source URL '+date);
  }
  review.push({date,tag:post.tag,ru:post.ru.title,en:post.en.title,
   source:post.source?.original||null,approval:'HOLD',website:false,telegram:false});
 }
}
const dateFormat=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Moscow',year:'numeric',month:'2-digit',day:'2-digit'});
const generated=dateFormat.format(new Date());
const result={
 generatedMoscowDate:generated,
 project:'SYNTHA V2 / isolated branch only',
 automaticPublishing:false,
 sourceBuildAdmission:'CI only; not proof of a public deployment',
 publicProductionTarget:'unchanged: syntha.pro V1',
 channels:['staged RU','staged EN','Telegram channel only after approval and verified site URL'],
 cadence:'twice-weekly editorial preparation; publish only after source/rights review',
 pausedDrafts:review,
 verifiedExternalPublishing:'NOT VERIFIED',
 requirementsBeforePublish:[
  'verify project HEAD and source document versions',
  'obtain rights/owner approval for names and media',
  'review RU/EN factual wording, disclaimers and legal boundaries',
  'get current V2 preview SHA and prove publication/admission to the live site',
  'confirm previous Telegram messages to prevent duplicates',
  'verify authorized website and Telegram publish receipts'
 ]
};
mkdirSync('qa-artifacts',{recursive:true});
writeFileSync('qa-artifacts/v2-editorial-review.json',JSON.stringify(result,null,2)+'\n');
console.log('PASS: '+review.length+' bilingual V2 drafts retained for review; no site/Telegram side effects; source and approval gates active');
