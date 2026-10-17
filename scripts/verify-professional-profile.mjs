#!/usr/bin/env node
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
const read=(file)=>readFileSync(new URL('../'+file,import.meta.url),'utf8');
const ru=read('profile.html'),en=read('en/profile.html'),js=read('assets/profile.js'),app=read('assets/app.js'),bundle=read('scripts/prepare-pages-release.mjs');
for(const [lang,html] of [['ru',ru],['en',en]]){
 assert.match(html,new RegExp('<html lang="'+lang+'">'));
 for(const id of ['profile-content','competences','method','scenarios','evidence','choose','profile-focus-copy','profile-focus-result','profile-focus-contact'])
  assert.ok(html.includes('id="'+id+'"'),lang+' missing '+id);
 const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(x=>x[1]);
 assert.equal(new Set(ids).size,ids.length,lang+' duplicate ids');
 for(const area of ['buying','economics','production','systems']){
  assert.ok(html.includes('data-profile-focus="'+area+'"'),lang+' missing choice '+area);
  assert.ok(html.includes('focus='+area+'#contact'),lang+' missing safe contact link '+area);
 }
 assert.match(html,/assets\/profile\.js/);
 assert.match(html,/assets\/profile\.css/);
 assert.match(html,/schema\.org/);
 assert.match(html,/<link rel="canonical"/);
 assert.ok(html.includes('role="status"'),'Accessible live summary is required');
}
assert.match(js,/aria-pressed/);
assert.match(js,/encodeURIComponent\(focus\)/);
assert.match(app,/Object\.hasOwn\(focusCopy\[lang\], focus\)/);
assert.match(app,/professional-profile-link/);
for(const file of ['profile.html','en/profile.html','assets/profile.js','assets/profile.css'])
 assert.ok(bundle.includes("'"+file+"'"),'public bundle missing '+file);
console.log('PASS professional profile RU/EN, four controlled focus routes, navigation, accessibility and public packaging');
