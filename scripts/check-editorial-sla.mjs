import fs from 'node:fs';

const news = fs.readFileSync('assets/news.js','utf8');
const projectTags = new Set(['syntha','chatx','renova','mfw','promomed']);
const analysisTags = new Set(['analysis','market','press']);

const entries = [...news.matchAll(/\{\s*date:\s*'([^']+)'\s*,\s*tag:\s*'([^']+)'([\s\S]*?)(?=\n\s*\},\n\s*\{|\n\s*\}\n\];)/g)]
  .map((m) => ({ date:m[1], tag:m[2], body:m[3] }));

const byDay = new Map();
for (const p of entries) {
  const d = byDay.get(p.date) || { project:0, analysis:0, items:[] };
  if (projectTags.has(p.tag)) d.project++;
  if (analysisTags.has(p.tag) && /source:\s*\{[\s\S]*?outlet:/.test(p.body) && /https?:\/\//.test(p.body)) d.analysis++;
  d.items.push(p.tag);
  byDay.set(p.date,d);
}

const dates=[...byDay.keys()].sort().slice(-14);
for(const date of dates){
  const d=byDay.get(date);
  const ok=d.project>=1&&d.analysis>=1;
  console.log(`${ok?'PASS':'INFO'} ${date} project=${d.project} analysis=${d.analysis} [${d.items.join(', ')}]`);
}

console.log('\nPolicy for new scheduled content:');
console.log('1. >=1 project article/day: tag syntha|chatx|renova|mfw|promomed.');
console.log('2. >=1 external analysis/day: tag analysis|market|press with outlet + original URL.');
console.log('3. Both destinations required: site + Telegram (enforced by /api/posts when scheduling).');
console.log('4. Analysis format: source facts -> breakdown -> analyst view with uncertainty -> actionable takeaways.');
console.log('5. Project format: business problem -> change/product thesis -> user/business effect -> current evidence/next step; no unsupported traction claims.');
