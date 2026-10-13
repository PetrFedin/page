#!/usr/bin/env node
import assert from 'node:assert/strict';
import {NEWS} from '../assets/news.js';
import {candidate,telegramArticle,escapeHtml} from './tg-publish-date.mjs';

const post=candidate('2026-10-13');
assert.equal(post.site,true);
assert.equal(NEWS.filter(p=>p.date===post.date).length,1);
assert.ok(post.ru?.body.length>400 && post.en?.body.length>400);
assert.equal(candidate('2026-10-13','en'),post);
for(const lang of ['ru','en']){
 const formatted=telegramArticle(post,lang);
 assert.ok(formatted.startsWith('<b>')&&formatted.length<3900);
 assert.ok(formatted.includes('https://syntha.pro/'));
 assert.ok(formatted.includes('#post-2026-10-13'));
 assert.ok(formatted.includes('#'));
}
assert.equal(escapeHtml('<hello&world>'),'&lt;hello&amp;world&gt;');
assert.throws(()=>candidate('2026-10-13','unknown'));
assert.throws(()=>candidate('2026-10-30'),'future not approved for publication');
assert.throws(()=>telegramArticle({ru:{title:'x'}},'ru'));
console.log('PASS: one-shot editorial is date-keyed, bilingual, Telegram-safe and previewable offline');
