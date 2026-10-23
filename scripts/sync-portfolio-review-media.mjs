#!/usr/bin/env node
/**
 * Import actual browser-captured media for the isolated V2 branch, from
 * project-owned immutable GitHub Actions evidence exports. Reject absent or
 * mismatched SHA-256, incorrect source runtime revision, or invalid format.
 *
 * Original captures are demos or independent previews, NOT real customer
 * deployments. Never touch main, user submissions, or the V1 site.
 */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {mkdirSync,readFileSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
const S=[
 {id:'syntha',repo:'synth-v2',sha:'9a90247da7c50f144e63834ba1a7e9d8c3c9b12e',
  branch:'portfolio/verified-v2-media-20261020',date:'20261020',run:39132723945,
  files:['01-app-overview-ru.png','03-app-collections-ru.png','04-app-bom-ru.png','06-app-tech-packs-ru.png','syntha-plm-live-26sec.mp4']},
 {id:'chatx',repo:'chat',sha:'080cb53e1ff93f85bc44ceef1b20f699340b56a9',
  branch:'portfolio/media-captures-20261020',date:'20261018',run:39160687694,
  files:['01-home-desktop.png','02-chats-desktop.png','03-tasks-desktop.png','05-project-gantt-desktop.png','chatx-product-tour-27s.mp4']},
 {id:'renova',repo:'renova',sha:'a968fe71c6f287b072a275b2e72087a2a844e79c',
  branch:'portfolio/verified-v2-media-20261020',date:'20261020',run:39337917645,
  files:['customer-estimate.png','customer-budget.png','customer-execution.png','customer-product-tour-25s.mp4']},
 {id:'antiqua',repo:'antiqua',sha:'1439f3b510a068772cddfd189333412f028f4683',
  branch:'portfolio/verified-v2-media-20261020',date:'20261020',run:39314773212,
  files:['gallery-desktop.png','museum-paintings.png','artwork-details.png','owner-collection.png','visitor-gallery-28s.mp4']},
 {id:'sostoyanie',repo:'promomed',sha:'42ad14b9e356a10a39dea4c983783affc7d7a05c',
  branch:'portfolio/media-captures-20261020',date:'20261018',run:39161180777,
  files:['iphone-15-today.png','iphone-15-events.png','iphone-journey-25s.mp4']}
];
const root='assets/portfolio-reviewed';
const verified=[];
async function get(url){
 const response=await fetch(url,{signal:AbortSignal.timeout(30000),redirect:'follow'});
 if(!response.ok)throw Error('Source media missing: HTTP '+response.status+' '+url);
 return Buffer.from(await response.arrayBuffer());
}
function replaceOnce(src,before,after){
 if(src.includes(after))return src;
 assert.equal(src.split(before).length-1,1,'Noncanonical media target: '+before);
 return src.replace(before,after);
}
function url(id,file){return '/'+join(root,id,file).replaceAll('\\','/')}
function imgList(id){return 'shots: '+JSON.stringify(S.find(s=>s.id===id).files.filter(f=>f.endsWith('.png')).map(f=>url(id,f))).replaceAll('"',"'")+','}
for(const p of S){
 const base='https://raw.githubusercontent.com/PetrFedin/'+p.repo+'/'+p.branch+
 '/public/portfolio-v2/'+p.date+'/';
 const receipt=JSON.parse((await get(base+'capture-manifest.json')).toString('utf8'));
 assert.equal(receipt.project,p.id);
 assert.equal(receipt.source_sha,p.sha,'Capture source runtime SHA mismatch: '+p.id);
 assert.equal(receipt.production_admitted,false,'Only demo/public preview is admissible');
 assert.ok(['isolated-demonstration','independent-public-preview'].includes(receipt.source_kind));
 const manifest=new Map(receipt.files.map(x=>[x.name,x]));
 assert.equal(manifest.size,receipt.files.length);
 const files=[];
 for(const name of p.files){
  assert.match(name,/^[a-z0-9][a-z0-9_.-]+\.(png|mp4)$/i);
  const expected=manifest.get(name);
  assert.ok(expected?.sha256,'File not in original receipt: '+p.id+'/'+name);
  const raw=await get(base+name);
  assert.ok(raw.length>3000&&raw.length<5_000_000,'Invalid size '+name);
  if(expected.bytes)assert.equal(raw.length,expected.bytes,'Byte size mismatch');
  const digest=createHash('sha256').update(raw).digest('hex');
  assert.equal(digest,expected.sha256,'SHA-256 mismatch '+p.id+'/'+name);
  if(name.endsWith('.png')) assert.ok(raw.subarray(0,8).equals(Buffer.from('89504e470d0a1a0a','hex')),'Non-PNG content');
  else assert.equal(raw.subarray(4,8).toString('ascii'),'ftyp','Non-MP4 content');
  files.push({name,sha256:digest,bytes:raw.length,raw});
 }
 mkdirSync(join(root,p.id),{recursive:true});
 for(const f of files)writeFileSync(join(root,p.id,f.name),f.raw);
 verified.push({id:p.id,source_repository:'PetrFedin/'+p.repo,source_sha:p.sha,
  source_run_url:'https://github.com/PetrFedin/'+p.repo+'/actions/runs/'+p.run,
  provenance:receipt.source_kind,date:receipt.captured_on||receipt.captured_date,
  production_admitted:false,files:files.map(({raw,...metadata})=>metadata)});
}
const path='assets/content.js';
let copy=readFileSync(path,'utf8');
const old=[
 ["video: '/assets/video/syntha.webm',","video: '"+url('syntha','syntha-plm-live-26sec.mp4')+"',"],
 ["shots: ['/assets/shots/syntha-1.webp', '/assets/shots/syntha-2.webp', '/assets/shots/syntha-3.webp'],",imgList('syntha')],
 ["video: '/assets/video/chatx.webm',","video: '"+url('chatx','chatx-product-tour-27s.mp4')+"',"],
 ["shots: ['/assets/shots/chatx-1.webp', '/assets/shots/chatx-2.webp', '/assets/shots/chatx-3.webp'],",imgList('chatx')],
 ["video: '/assets/video/renova.webm',","video: '"+url('renova','customer-product-tour-25s.mp4')+"',"],
 ["shots: ['/assets/shots/renova-1.webp', '/assets/shots/renova-2.webp', '/assets/shots/renova-3.webp'],",imgList('renova')],
 ["shots: ['/assets/shots/promomed-home.jpg', '/assets/shots/promomed-events.jpg'],",
  "video: '"+url('sostoyanie','iphone-journey-25s.mp4')+"',\n    "+imgList('sostoyanie')]
];
for(const [before,after] of old)copy=replaceOnce(copy,before,after);
writeFileSync(path,copy);

const extra='assets/portfolio-extensions.js';
let ext=readFileSync(extra,'utf8');
const i=ext.indexOf('"id": "antiqua"');
assert.ok(i>=0,'Antiqua dossier absent');
const shotOld='"shots": []';
const shotNew='"shots": '+JSON.stringify(S.find(p=>p.id==='antiqua').files.filter(f=>f.endsWith('.png')).map(f=>url('antiqua',f)))+
 ',\n    "video": "'+url('antiqua','visitor-gallery-28s.mp4')+'"';
const part=ext.slice(i);
if(!part.includes(shotNew)){
 assert.ok(part.includes(shotOld),'Unexpected Antiqua media already present');
 ext=ext.slice(0,i)+part.replace(shotOld,shotNew);
}
writeFileSync(extra,ext);

const mediaPath='assets/portfolio-media-evidence.js';
let provenance=readFileSync(mediaPath,'utf8');
for(const [id,repo,sha,run,count,seconds,day] of [
 ['syntha','synth-v2',S[0].sha,39132723945,10,27,'2026-10-18'],
 ['renova','renova',S[2].sha,39337917645,12,25,'2026-10-19'],
 ['antiqua','antiqua',S[3].sha,39314773212,8,28,'2026-10-19']]){
 if(provenance.includes('\n '+id+':{'))continue;
 const entry=[
  ' '+id+':{',
  "  kind:'isolated-demonstration',asOf:'"+day+"',",
  "  repo:'PetrFedin/"+repo+"',sourceSha:'"+sha+"',",
  "  runUrl:'https://github.com/PetrFedin/"+repo+"/actions/runs/"+run+"',",
  "  artifact:'Original Github Actions artifact; SHA-256 proof in catalog',",
  "  screenshots:"+count+",videoSeconds:"+seconds+",approvedForEmbedding:true,",
  "  notice:'Isolated demo. Not evidence of customer production adoption.'",
  " },"
 ].join('\n')+'\n';
 const anchor='export const PORTFOLIO_MEDIA_EVIDENCE=Object.freeze({\n';
 assert.ok(provenance.includes(anchor));
 provenance=provenance.replace(anchor,anchor+entry);
}
for(const id of ['chatx','promomed']){
 const expr=new RegExp('('+id+':\\{[\\s\\S]*?approvedForEmbedding:)false');
 if(expr.test(provenance))provenance=provenance.replace(expr,'$1true');
 else assert.ok(new RegExp(id+':\\{[\\s\\S]*?approvedForEmbedding:true').test(provenance),
 'Approved media source missing for '+id);
}
writeFileSync(mediaPath,provenance);

writeFileSync(join(root,'catalog.json'),JSON.stringify({
 status:'preview-reviewed',no_external_client_adoption_claim:true,
 disclaimer:'Demo/browser captures of isolated systems, not evidence of outside customer deployments.',
 verified
},null,2)+'\n');
console.log('PASS five real project captures, SHA-256 '+verified.reduce((n,p)=>n+p.files.length,0)+' assets.');
