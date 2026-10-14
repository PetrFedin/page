#!/usr/bin/env node
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { NEWS } from '../assets/news.js';

const date='2026-10-13';
const read=(path)=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const queue=JSON.parse(read('channel-queue.json'));
const article=NEWS.filter(p=>p.date===date);
assert.equal(article.length,1,'Oct 13 approved publication must remain unique');
assert.equal(article[0].site,true,'V2 may not revoke approved Oct 13 editorial');
for(const lang of ['ru','en']){
  assert.ok(article[0][lang]?.title && article[0][lang]?.body?.length>400,'Missing approved '+lang+' body');
}
assert.ok(!queue.order.includes(date),'Oct 13 must not enter unattended Telegram queue');
assert.ok(!queue.paused.includes(date),'Oct 13 is already approved for website, not an editorial draft');
for(const future of ['2026-10-15','2026-10-17']){
  const draft=NEWS.find(p=>p.date===future);
  assert.equal(draft?.site,false,'Future editorial still needs review: '+future);
  assert.ok(queue.paused.includes(future),'Future Telegram post must remain paused');
  assert.ok(!queue.order.includes(future),'Future Telegram post cannot auto-send');
}
for(const [lang,prefix] of [['ru',''],['en','en/']]){
  const entries=JSON.parse(read(prefix+'feed.json')).items;
  assert.equal(entries.length,19,lang+' expected nineteen editorial records');
  assert.ok(entries[0].id.endsWith('#post-'+date),lang+' Oct 13 should be the latest approved item');
  assert.equal(entries.filter(x=>x.id.endsWith('#post-'+date)).length,1,lang+' must include Oct 13 once');
  assert.equal(entries[0].title,article[0][lang].title,lang+' title must match approved news copy');
  const rss=read(prefix+'feed.xml');
  const items=rss.match(/<item>/g)||[];
  assert.equal(items.length,19,lang+' RSS item count');
  assert.ok(rss.indexOf('#post-'+date)<rss.indexOf('#post-2026-10-02'),lang+' RSS publication order');
}
if(process.argv.includes('--rendered')){
  for(const [lang,path] of [['ru','index.html'],['en','en/index.html']]){
    const html=read(path);
    assert.equal((html.match(/id="post-2026-10-13"/g)||[]).length,1,lang+' prerendered article should be present exactly once');
    assert.ok(html.indexOf('id="post-2026-10-13"')<html.indexOf('id="post-2026-10-02"'),lang+' prerender order');
    assert.ok(html.includes(article[0][lang].title),lang+' prerender article must match publication');
  }
}
console.log('PASS: Oct 13 approved RU/EN editorial retained in V2, feeds in sync, future posts paused, one-off Telegram only');
