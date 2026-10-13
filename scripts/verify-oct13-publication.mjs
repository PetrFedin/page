#!/usr/bin/env node
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { NEWS } from '../assets/news.js';

const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const date = '2026-10-13';
const selected = NEWS.filter(p=>p.date===date);
assert.equal(selected.length,1,'Exactly one Oct 13 editorial item');
const article=selected[0];
assert.equal(article.site,true,'site publication enabled');
assert.equal(article.tag,'investors');
for(const lang of ['ru','en']){
 const p=article[lang];
 assert.ok(p?.title?.length>15 && p?.body?.length>400,'Complete, bilingual authored post '+lang);
 assert.ok(article.tg?.[lang]?.title && article.tg?.[lang]?.body,'Telegram wording exists '+lang);
 const html=read(lang==='ru'?'index.html':'en/index.html');
 assert.equal((html.match(/id="post-2026-10-13"/g)||[]).length,1,'Static first-page SSR contains new post exactly once '+lang);
 assert.ok(html.includes(p.title),'Static page title matches article '+lang);
 assert.ok(html.includes('src="/assets/app.js?v=20261013-editorial1"'),'App cache key updated '+lang);
 assert.ok(html.indexOf('id="post-2026-10-13"')<html.indexOf('id="post-2026-10-02"'),'New post sorted first '+lang);
 const feed=JSON.parse(read(lang==='ru'?'feed.json':'en/feed.json'));
 const xml=read(lang==='ru'?'feed.xml':'en/feed.xml');
 assert.equal(feed.items.length,19,'Complete feed: 19 entries '+lang);
 assert.equal(feed.items[0].title,p.title);
 assert.ok(feed.items[0].id.endsWith('#post-2026-10-13'));
 assert.equal(feed.items.filter(x=>x.id.endsWith('#post-2026-10-13')).length,1);
 assert.ok(xml.includes('<title>'+p.title+'</title>'),'RSS title '+lang);
 assert.ok(xml.includes('#post-2026-10-13'),'RSS contains published item '+lang);
 assert.equal((xml.match(/<item>/g)||[]).length,19,'RSS 19 entries '+lang);
}
const app=read('assets/app.js');
assert.ok(app.includes("import { NEWS } from './news.js?v=20261013-editorial1'"));
assert.ok(!app.includes('import { EXTRA_PROJECTS'),'Only editorial changes in hotfix');
const queue=JSON.parse(read('channel-queue.json'));
assert.equal(queue.order.includes(date),false,'Do not inject a new post into an unverified unattended queue');
assert.ok(!queue.paused.includes(date),'One-off editorial release should not be assumed queued');
const tg=article.tg.ru;
assert.ok(tg.body.includes('https://syntha.pro/#post-2026-10-13'),'Telegram copy links to same news');
assert.ok(tg.body.length<3500,'Single message fits Telegram text budget');
console.log('PASS: Oct 13 RU/EN editorial, preregistered SSR, RSS/JSON Feed and safe Telegram draft.');
