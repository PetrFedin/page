#!/usr/bin/env node
import assert from 'node:assert/strict';
import {readFileSync,existsSync,mkdirSync,cpSync,rmSync,readdirSync,writeFileSync} from 'node:fs';
import {join,dirname} from 'node:path';
const root=join(dirname(new URL(import.meta.url).pathname),'..');
const out=join(root,'dist-pages');
const files=['index.html','privacy.html','syntha.html','renova.html','chatx.html','mfw.html','promomed.html','marco-pescarolo.html','favicon.ico','robots.txt','sitemap.xml','feed.xml','feed.json','llms.txt','_headers','_routes.json','effa60696db2628d61a43e4d89f0186c.txt'];
const dirs=['assets','en'];
const source=readFileSync(join(root,'index.html'),'utf8');
for(const path of ['index.html','en/index.html']){
 const html=readFileSync(join(root,path),'utf8');
 assert.ok(html.includes('id="turnstile-widget"'),path+' missing widget');
 assert.ok(!html.includes('cf-chl-widget-'),path+' contains ephemeral captcha');
 assert.equal((html.match(/id="turnstile-widget"/g)||[]).length,1);
 assert.ok(html.includes('post-2026-10-13'),path+' Oct 13 post missing');
}
for(const p of [...files,...dirs])assert.ok(existsSync(join(root,p)),'missing public file '+p);
rmSync(out,{recursive:true,force:true});mkdirSync(out,{recursive:true});
for(const p of files){mkdirSync(dirname(join(out,p)),{recursive:true});cpSync(join(root,p),join(out,p));}
for(const p of dirs)cpSync(join(root,p),join(out,p),{recursive:true});
for(const bad of ['package.json','channel-queue.json','scripts/','docs/','functions/','private/','.git/']){
 assert.ok(!existsSync(join(out,bad)),'private file leaked '+bad);
}
const items=JSON.parse(readFileSync(join(out,'feed.json'),'utf8')).items;
const enItems=JSON.parse(readFileSync(join(out,'en/feed.json'),'utf8')).items;
assert.ok(items[0].id.endsWith('post-2026-10-13')&&enItems[0].id.endsWith('post-2026-10-13'),'feed not current');
writeFileSync(join(out,'release-health.json'),JSON.stringify({schema:1,article:'2026-10-13',languageVersions:['ru','en'],source:'git-verified-build'},null,2)+'\n');
console.log('PASS: safe Cloudflare Pages static release, bilingual articles, private files excluded');
