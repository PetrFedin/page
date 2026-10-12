#!/usr/bin/env node
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { LEAD_COPY, routeForTopic, safeLeadRoute } from '../assets/lead-paths.js';
import { onRequestPost } from '../functions/api/contact.js';

const read = file => readFileSync(new URL('../' + file, import.meta.url), 'utf8');
for (const lang of ['ru','en']) {
  assert.deepEqual(LEAD_COPY[lang].options.map(x=>x.id), ['client','pilot','investor']);
  assert.equal(LEAD_COPY[lang].timing.length,5);
  for (const entry of LEAD_COPY[lang].options)
    for (const key of ['action','goal','description','title','topic'])
      assert.ok(entry[key].length>3,lang+' '+key);
}
for (const [topic,route] of [['consulting','client'],['investors','investor'],['partnership','pilot'],['launch','pilot'],['press','']])
  assert.equal(routeForTopic(topic),route);
assert.equal(safeLeadRoute('investor'),'investor');
assert.equal(safeLeadRoute('<script>'),'');
const app = read('assets/app.js');
assert.ok(app.includes("$('#lead-routes-grid').addEventListener"));
assert.ok(app.includes('modal-invest'));
assert.ok(app.includes('setLeadContext('));
for (const file of ['index.html','en/index.html']) {
  const html=read(file);
  for (const id of ['work-with-me','lead-routes-grid','lead-route-value','lead-project-value','lead-goal-value','lead-timing','modal-pilot','modal-invest','lead-context'])
    assert.ok(html.includes('id="'+id+'"'),file+':'+id);
}

const input = {
  name:'Test & Pilot', email:'pilot@example.org', message:'Private pilot discussion', topic:'investors',
  leadRoute:'investor',leadProject:'fintech',leadGoal:'Investment discussion',
  leadTiming:'1–3 months','cf-turnstile-response':'dummy-token'
};
const env={TELEGRAM_BOT_TOKEN:'test',TELEGRAM_CHAT_ID:'123456',TURNSTILE_SECRET_KEY:'test'};
const calls=[];
const origFetch=globalThis.fetch;
let routeOverride=()=>null;
globalThis.fetch=async(url,options)=>{
  const method=String(url).split('/').pop();
  const payload=options?.body instanceof FormData ? options.body : JSON.parse(options?.body || '{}');
  calls.push({method,payload});
  const answer=routeOverride(method,payload);
  if(answer instanceof Error)throw answer;
  if(answer)return answer;
  if(method==='siteverify')return Response.json({success:true});
  if(method==='getChat')return Response.json({ok:true,result:{id:123456,type:'private'}});
  return Response.json({ok:true,result:{message_id:100}});
};
async function submit(body=input, config=env, file=null) {
  calls.length=0;
  let request;
  if(file){
    const form=new FormData();
    for(const [k,v] of Object.entries(body))form.append(k,v);
    form.append('file',file,file.name);
    request=new Request('https://example.test/api/contact',{method:'POST',body:form});
  } else {
    request=new Request('https://example.test/api/contact',{
      method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)
    });
  }
  return onRequestPost({request,env:config});
}
try{
  const success=await submit();
  assert.equal(success.status,200);
  assert.deepEqual(calls.map(c=>c.method),['siteverify','getChat','sendMessage']);
  const text=calls[2].payload.text;
  for(const phrase of ['<b>Маршрут:</b> investor','<b>Проект:</b> fintech',
    '<b>Цель:</b> Investment discussion','<b>Срок:</b> 1–3 months','Test &amp; Pilot'])
    assert.ok(text.includes(phrase),phrase);
  assert.equal(calls[2].payload.chat_id,env.TELEGRAM_CHAT_ID);

  const missingSecret=await submit(input,{...env,TURNSTILE_SECRET_KEY:undefined});
  assert.equal(missingSecret.status,503,'Turnstile must fail closed');
  assert.equal(calls.length,0,'cannot contact Telegram without Turnstile');
  const missingToken=await submit({...input,'cf-turnstile-response':''});
  assert.equal(missingToken.status,400);
  assert.equal(calls.length,0);
  routeOverride=method=>method==='siteverify'?Response.json({success:false}):null;
  assert.equal((await submit()).status,400,'invalid token denied');
  assert.deepEqual(calls.map(x=>x.method),['siteverify']);
  routeOverride=method=>method==='siteverify'?new Error('network outage'):null;
  assert.equal((await submit()).status,503,'network error must fail closed');
  routeOverride=()=>null;

  assert.equal((await submit({...input,name:''})).status,400);
  assert.equal((await submit({...input,email:'not-an-email'})).status,400);
  assert.equal((await submit(null)).status,400,'null request payload rejected');
  assert.equal((await submit([])).status,400,'array request payload rejected');
  assert.equal((await submit({...input,company:'hidden-spam'})).status,200,'honeypot semantics retained');
  assert.equal(calls.length,0,'honeypot must not send');

  for(const type of ['channel','group','supergroup']){
    routeOverride=method=>method==='getChat'?Response.json({ok:true,result:{type}}):null;
    assert.equal((await submit()).status,503,'reject public/group recipient '+type);
    assert.deepEqual(calls.map(c=>c.method),['siteverify','getChat']);
  }
  routeOverride=method=>method==='getChat'?new Error('network outage'):null;
  assert.equal((await submit()).status,503,'recipient check unavailable must fail closed');
  routeOverride=()=>null;

  const longText='&<>😀'.repeat(800);
  const long=await submit({...input,message:longText});
  assert.equal(long.status,200);
  const sends=calls.filter(x=>x.method==='sendMessage');
  assert.ok(sends.length>=2,'split long escaped content into messages');
  assert.ok(sends.every(x=>x.payload.text.length<=4096),'Telegram text safe');
  assert.ok(sends.every(x=>!x.payload.text.includes('<>')&&!x.payload.text.includes('&<>')),'text HTML-escaped');
  assert.ok(sends.slice(1).every(x=>x.payload.text.startsWith('<b>Сообщение ')));
  assert.ok(sends.some(x=>x.payload.text.includes('&amp;&lt;&gt;')),'encoded input preserved');

  const file=new File(['test file'],'brief.txt',{type:'text/plain'});
  assert.equal((await submit(input,env,file)).status,200);
  assert.deepEqual(calls.map(x=>x.method),['siteverify','getChat','sendDocument','sendMessage']);
  assert.equal(calls[2].payload.get('document').name,'brief.txt');

  routeOverride=method=>method==='sendMessage'?Response.json({ok:false}):null;
  assert.equal((await submit()).status,502,'Telegram JSON-level rejection must fail');
  routeOverride=method=>method==='sendMessage'?new Response('unavailable',{status:502}):null;
  assert.equal((await submit()).status,502,'HTTP-level rejection must fail');
  routeOverride=method=>method==='sendMessage'?new Error('network failure'):null;
  assert.equal((await submit()).status,502,'network exception must fail');
  routeOverride=()=>null;

  let count=0;
  routeOverride=method=>{
    if(method==='sendMessage'&&++count===2)return new Response('outage',{status:502});
    return null;
  };
  assert.equal((await submit({...input,message:longText})).status,502,'partial multi-message failure must not be marked as completed');
  assert.equal(calls.filter(c=>c.method==='sendMessage').length,2,'stop after failing chunk');

  console.log('PASS: 3 bilingual routes, required Turnstile, private-only recipient, safe long text, file delivery, partial failures');
} finally{
  globalThis.fetch=origFetch;
}