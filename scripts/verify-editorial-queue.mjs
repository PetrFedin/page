#!/usr/bin/env node
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {NEWS} from '../assets/news.js';
const root=new URL('../',import.meta.url);
const read=f=>readFileSync(new URL(f,root),'utf8');
const queue=JSON.parse(read('channel-queue.json'));
const byDate=new Map(NEWS.map(post=>[post.date,post]));
assert.equal(byDate.size,NEWS.length,'unique news dates');
assert.equal(new Set(queue.order).size,queue.order.length,'unique active queue dates');
assert.equal(new Set(queue.paused).size,queue.paused.length,'unique paused dates');
for(const item of queue.unresolvedLegacyDates||[]){
  assert.ok(!byDate.has(item.date),'quarantined date unexpectedly has content '+item.date);
  assert.ok(!queue.order.includes(item.date),'quarantined date must never be in active queue');
  assert.ok(!queue.paused.includes(item.date),'quarantined date must not masquerade as an approved draft');
}
for(const date of [...queue.order,...queue.paused]){
  assert.ok(byDate.has(date),'unknown editorial item '+date);
  assert.ok(!queue.order.includes(date)||!queue.paused.includes(date),'same item active and paused '+date);
}
for(const post of NEWS){
  assert.match(post.date,/^\d{4}-\d\d-\d\d$/);
  for(const lang of ['ru','en']){
    if(post.site!==false)assert.ok(post[lang]?.title&&post[lang]?.body,'site news missing translation '+post.date+':'+lang);
  }
}
const article=byDate.get('2026-10-13');
assert.equal(article?.tag,'investors');
assert.equal(article.site,true,'Oct 13 article is approved and present in main');
assert.ok(!queue.paused.includes('2026-10-13'),'approved Oct 13 article is not an unpublished draft');
assert.ok(!queue.order.includes('2026-10-13'),'publication is one-off and must never enter unattended queue');
for(const date of ['2026-10-15','2026-10-17','2026-10-20','2026-10-22']){
  const draft=byDate.get(date);
  assert.ok(draft && draft.ru?.title && draft.ru?.body && draft.en?.title && draft.en?.body,'bilingual draft missing: '+date);
  assert.equal(draft.site,false,'future editorial is intentionally not public: '+date);
  assert.ok(queue.paused.includes(date),'draft must remain paused in Telegram: '+date);
  assert.ok(!queue.order.includes(date),'draft must not be auto-published: '+date);
}
const taxonomy=read('functions/api/posts.js');
for(const tag of ['fashion-os','fur','antiqua','igra','marco','fintech']){
  assert.ok(taxonomy.includes("'"+tag+"'"),'editorial project tag missing: '+tag);
}
const app=read('assets/app.js');
assert.ok(app.includes("timeZone:'Europe/Moscow'"),'local editorial date must not use UTC');
const build=read('scripts/make-feed.mjs');
assert.ok(build.includes("timeZone:'Europe/Moscow'"),'RSS feed uses same editorial clock');
assert.ok(read('scripts/tg-queue.mjs').includes("timeZone: 'Europe/Moscow'"),
  'Telegram send window must use Moscow time, not the server machine timezone');
console.log('PASS: bilingual dated content, non-overlapping queues, review-required Telegram, editorial timezone');
