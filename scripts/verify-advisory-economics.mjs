#!/usr/bin/env node
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { calculateInventoryScenario } from '../assets/advisory-economics.js';
import { DECK } from '../assets/deck.js';

const approx = (actual, expected, label, tolerance = 1e-7) =>
  assert.ok(Math.abs(actual - expected) < tolerance, label + ': expected ' + expected + ', got ' + actual);

const c1 = calculateInventoryScenario({
  annualCogs: 120000000,
  averageInventory: 30000000,
  targetDays: 75
});
assert.equal(c1.ok, true);
approx(c1.currentDays, 91.25, 'Days = average stock / annual COGS × 365');
approx(c1.targetInventory, 120000000 * 75 / 365, 'Target inventory at cost');
approx(c1.releasedCapital, 30000000 - 120000000 * 75 / 365, 'Potential reduction');
assert.equal(c1.additionalCapital, 0);
approx(c1.releasedCapital + c1.targetInventory, 30000000, 'Reconciliation');

const c2 = calculateInventoryScenario({
  annualCogs: '120000000',
  averageInventory: '30000000',
  targetDays: '140'
});
assert.equal(c2.ok, true);
assert.equal(c2.releasedCapital, 0, 'Higher target inventory cannot release capital');
assert.ok(c2.additionalCapital > 0);
approx(c2.targetInventory - 30000000, c2.additionalCapital, 'Funding requirement');

const c3 = calculateInventoryScenario({
  annualCogs: 365000, averageInventory: 1000, targetDays: 1
});
assert.equal(c3.ok, true);
assert.equal(c3.releasedCapital, 0);
assert.equal(c3.additionalCapital, 0);
const c4 = calculateInventoryScenario({
  annualCogs: 365000, averageInventory: 0, targetDays: 1
});
assert.equal(c4.ok, true);
assert.equal(c4.currentDays, 0);
assert.ok(c4.additionalCapital > 0);
for (const value of [
  { annualCogs: '', averageInventory: 10, targetDays: 5 },
  { annualCogs: 0, averageInventory: 10, targetDays: 5 },
  { annualCogs: -100, averageInventory: 10, targetDays: 5 },
  { annualCogs: 100, averageInventory: -1, targetDays: 5 },
  { annualCogs: 100, averageInventory: 10, targetDays: 0 },
  { annualCogs: 100, averageInventory: 10, targetDays: Infinity },
  { annualCogs: 'not a number', averageInventory: 10, targetDays: 5 },
  { annualCogs: 1e16, averageInventory: 10, targetDays: 5 },
  { annualCogs: 100, averageInventory: 10, targetDays: 4000 }
]) assert.equal(calculateInventoryScenario(value).ok, false, JSON.stringify(value));

for (const lang of ['ru', 'en']) {
  const d = DECK[lang];
  const ids = d.blocks.map(b => b.id);
  assert.equal(new Set(ids).size, ids.length, lang + ' duplicate block ids');
  for (const id of ['directions','experience','diagnostic','cases','engagement','evidence']) {
    assert.ok(ids.includes(id), lang + ' missing ' + id);
    assert.ok(d.blocks.find(b=>b.id===id).items.length >= 3, lang + ' incomplete ' + id);
  }
  const illustrative = d.blocks.find(b => b.id === 'cases');
  assert.match(illustrative.note, lang==='en' ? /Illustrative scenarios/ : /учебные ситуации/);
  assert.equal(d.chain.length, d.chainTo.length, lang + ' chain links');
  assert.ok(d.chainTo.every(x=>Number.isInteger(x) && x>=0 && x<d.blocks[0].items.length));
}
const app = readFileSync(new URL('../assets/app.js', import.meta.url), 'utf8');
const styles = readFileSync(new URL('../assets/styles.css', import.meta.url), 'utf8');
const calcSource = readFileSync(new URL('../assets/advisory-economics.js', import.meta.url), 'utf8');
assert.doesNotMatch(calcSource, /\b(?:fetch|sendBeacon|localStorage|sessionStorage|XMLHttpRequest|indexedDB)\s*(?:\(|\.|\[)/,
  'Financial inputs must never be transmitted or persisted directly from calculator code');
assert.ok(app.includes("mountAdvisoryEconomics(economics, lang"), 'Deck integration must mount');
assert.ok(app.includes("startContact({"), 'Advisory CTA must call the unified qualified contact route');
assert.match(app,/mountAdvisoryEconomics\(economics, lang, \(\) => \{[\s\S]*?topic:'consulting',[\s\S]*?route:'client'/, 'Advisory CTA must explicitly select client/consulting');
assert.ok(!app.includes("$('#topic-other').value = lang === 'en'"), 'Advisory CTA must not bypass V2 lead context');
assert.ok(!app.includes('releasedCapital') && !app.includes('additionalCapital'), 'No automatic financial inputs in leads');
assert.ok(styles.includes('.advisory-economics-results[hidden]'), 'Hidden results must stay hidden');
console.log('PASS: inventory working capital arithmetic, input validation, zero and negative scenarios, RU/EN deck and privacy wiring.');
