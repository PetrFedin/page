#!/usr/bin/env node
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {EXTRA_PROJECTS, INVESTOR_BLUEPRINTS} from '../assets/portfolio-extensions.js';
import {PROJECTS as CORE_PROJECTS} from '../assets/content.js';
import {LOGOS} from '../assets/logos.js';

const root = new URL('../', import.meta.url);
const read = path => readFileSync(new URL(path, root), 'utf8');
const ids = [...CORE_PROJECTS, ...EXTRA_PROJECTS].map(x => x.id);
assert.equal(new Set(ids).size, ids.length, 'unique portfolio ids');
assert.equal(ids.length, 11, '11 complete portfolio dossiers');
assert.deepEqual(Object.keys(INVESTOR_BLUEPRINTS).sort(), [...ids].sort(), 'every project has financial milestones');
for(const p of [...CORE_PROJECTS, ...EXTRA_PROJECTS]){
  assert.ok(LOGOS[p.id], 'wordmark missing '+p.id);
  for(const lang of ['ru','en']){
    const t = p[lang], d = INVESTOR_BLUEPRINTS[p.id][lang];
    assert.ok(t && ['tagline','card','stage','what','who','why','how'].every(k => typeof t[k] === 'string' && t[k].length >= 15), 'missing copy '+p.id+':'+lang);
    assert.ok(d && ['revenue','base','conservative','optimistic','breakEven','formula','evidence'].every(k => typeof d[k] === 'string' && d[k].length >= 15), 'incomplete investor dossier '+p.id+':'+lang);
    assert.equal(d.tranches.length, 3, 'three gated tranches '+p.id+':'+lang);
  }
}
const verifiedMediaExists=existsSync(new URL('../assets/portfolio-reviewed/catalog.json',import.meta.url));
const catalog=verifiedMediaExists ? JSON.parse(read('assets/portfolio-reviewed/catalog.json')) : null;
for(const p of EXTRA_PROJECTS){
  if(p.id==='antiqua'&&verifiedMediaExists){
    assert.ok(catalog.verified.some(x=>x.id==='antiqua'&&x.production_admitted===false),
      'Antiqua screenshots require verified demo evidence');
    assert.equal(p.shots.length,4,'Four actual museum screenshots');
    assert.match(p.video,/visitor-gallery-28s\.mp4$/,'Verified visitor preview tour');
  } else {
    assert.equal(p.shots.length,0,'no placeholder screenshots '+p.id);
    assert.ok(!p.video,'no placeholder video '+p.id);
  }
  for(const lang of ['ru','en']) assert.ok(p[lang].capabilities.length>=4,'no functional map '+p.id+':'+lang);
}
for(const p of ['index.html','en/index.html']){
  const html=read(p);
  for(const id of ['project-capabilities','project-investor','gallery','cards','modal']) assert.ok(html.includes('id="'+id+'"'), 'missing '+id+' from '+p);
  assert.ok(html.includes('/assets/app.js?v=20261014-opportunities1'), 'stale JS cache tag '+p);
  assert.ok(html.includes('/assets/styles.css?v=20261014-opportunities1'), 'stale CSS cache tag '+p);
}
const app = read('assets/app.js');
assert.ok(app.includes('CORE_PROJECTS, ...EXTRA_PROJECTS'), 'new projects not included in cards');
assert.ok(app.includes("gallery.hidden = frames.length === 0"), 'no media hiding missing');
assert.ok(app.includes("INVESTOR_BLUEPRINTS[id]?.[lang]"), 'economic dossier not rendered');
const css=read('assets/styles.css');
assert.ok(css.includes('#consulting .services li:nth-last-child(2)'), '3+2 advisory layout missing');
assert.ok(css.includes('#project-investor[hidden]'), 'hidden sections not respected');
console.log('PASS: 11 bilingual projects, 11 investment models, stage gates, no placeholder media, DOM and cache keys');
