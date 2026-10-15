#!/usr/bin/env node
/* Offline, money-free contract assertions for SYNTHA V2 offers; no provider calls. */
import assert from 'node:assert/strict';
import { OPPORTUNITY_COPY } from '../assets/opportunity-copy.js';
import { renderOpportunityCards, buildOpportunityRequest, EARLY_ACCESS_IDS } from '../assets/opportunity-studio.js';
import { PROJECTS } from '../assets/content.js';
import { EXTRA_PROJECTS } from '../assets/portfolio-extensions.js';

const projects=[...PROJECTS,...EXTRA_PROJECTS];
const escapeText=text=>text.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let checks=0;
for(const language of ['ru','en']){
  const copy=OPPORTUNITY_COPY[language];
  for(const name of ['transformStages','accessTiers','dealPaths','capitalSteps','projectRoles']){
    const html=renderOpportunityCards(copy[name]);
    assert.doesNotMatch(html, />\s*(?:undefined|null)\s*</,name+' leaked JS literal');
    assert.equal((html.match(/class="op-choice"/g)||[]).length,copy[name].length);
    for(const row of copy[name]){
      for(const value of row)if(typeof value==='string'&&value.trim())
        assert.ok(html.includes(escapeText(value)),name+' dropped published commercial condition');
    }
    checks++;
  }
  for(const [softwareType,label] of copy.buildTypes){
    const request=buildOpportunityRequest({mode:'build',language,projects,softwareType});
    assert.equal(request.route,'client'); assert.equal(request.topic,'consulting');
    assert.ok(request.goal.includes(label));
    assert.ok(request.message.includes(label)); assert.ok(request.goal.length<=150);
    checks++;
  }
  for(const [index,accessTier] of EARLY_ACCESS_IDS.entries()){
    const request=buildOpportunityRequest({mode:'access',language,projects,accessTier});
    assert.equal(request.route,'pilot');
    assert.ok(request.goal.includes(copy.accessTiers[index][0]));
    checks++;
  }
  for(const capitalMode of ['primary','secondary']){
    const request=buildOpportunityRequest({mode:'capital',language,projects,capitalMode});
    assert.equal(request.route,'investor');
    assert.ok(request.goal.includes(copy[capitalMode]));
    checks++;
  }
  for(const project of projects){
    const request=buildOpportunityRequest({
      mode:'build',language,projects,projectId:project.id,softwareType:'marketplace',
      hours:99887766,ticket:99887766,founderBefore:99887766,
      currentValues:{secret:99887766}
    });
    assert.equal(request.project,project.id);
    assert.ok(request.message.includes(project.name));
    assert.deepEqual(Object.keys(request).sort(),['goal','message','project','route','topic']);
    assert.ok(!JSON.stringify(request).includes('99887766'),'Financial input leaked to lead');
    checks++;
  }
  const unknown=buildOpportunityRequest({
    mode:'build',language,projects,projectId:'not-a-project',softwareType:'<script>evil</script>'
  });
  assert.equal(unknown.project,'');
  assert.equal(unknown.goal,copy.modes.find(x=>x.id==='build').title);
  assert.ok(!unknown.message.includes('<script>'));
  checks++;
}
assert.equal(buildOpportunityRequest({mode:'__proto__'}),null);
assert.equal(buildOpportunityRequest({mode:'checkout'}),null);
assert.equal(buildOpportunityRequest(),null);
assert.throws(()=>renderOpportunityCards(null),TypeError);
assert.throws(()=>renderOpportunityCards([[null,'Body']]),TypeError);
const optional=renderOpportunityCards([['Title','Description',undefined,null,'']]);
assert.equal((optional.match(/<p/g)||[]).length,1);
assert.doesNotMatch(optional,/\bundefined\b|\bnull\b/);
const hostile=renderOpportunityCards([['<img src=x>','A&B','<script>alert(1)</script>','Contractual terms']]);
assert.ok(!hostile.includes('<script>')&&!hostile.includes('<img'));
assert.ok(hostile.includes('&lt;script&gt;'));
assert.ok(hostile.includes('Contractual terms'));
console.log('PASS: '+checks+' RU/EN commercial scope cases, all terms visible, price-free leads and sanitized copy.');
