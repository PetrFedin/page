#!/usr/bin/env node
import assert from 'node:assert/strict';
import {LEAD_COPY,routeForTopic,safeLeadRoute} from '../assets/lead-paths.js';
import {onRequestPost} from '../functions/api/contact.js';
import {readFileSync} from 'node:fs';
const read=f=>readFileSync(new URL('../'+f,import.meta.url),'utf8');
for(const lang of ['ru','en']){
  assert.deepEqual(LEAD_COPY[lang].options.map(x=>x.id),['client','pilot','investor']);
  assert.equal(LEAD_COPY[lang].timing.length,5);
  for(const entry of LEAD_COPY[lang].options){
    for(const key of ['action','goal','description','title','topic'])assert.ok(entry[key].length>3,lang+' '+key);
  }
}
assert.equal(routeForTopic('consulting'),'client');
assert.equal(routeForTopic('investors'),'investor');
assert.equal(routeForTopic('partnership'),'pilot');
assert.equal(routeForTopic('launch'),'pilot');
assert.equal(routeForTopic('press'),'');
assert.equal(safeLeadRoute('investor'),'investor');
assert.equal(safeLeadRoute('<script>'),'');
const app=read('assets/app.js');
assert.ok(app.includes("$('#lead-routes-grid').addEventListener"),'route entry missing');
assert.ok(app.includes("modal-invest"),'investor CTA missing');
assert.ok(app.includes("setLeadContext("),'lead context missing');
for(const file of ['index.html','en/index.html']){
  const html=read(file);
  for(const id of ['work-with-me','lead-routes-grid','lead-route-value','lead-project-value','lead-goal-value','lead-timing','modal-pilot','modal-invest','lead-context'])assert.ok(html.includes('id="'+id+'"'),file+':'+id);
}
const origFetch=globalThis.fetch;
const calls=[];
globalThis.fetch=async(url,options)=>{
  calls.push({url:String(url),body:options?.body});
  if(String(url).includes('siteverify'))return new Response(JSON.stringify({success:true}),{status:200});
  return new Response(JSON.stringify({ok:true}),{status:200});
};
try{
 const body={
  name:'Pilot',email:'pilot@example.org',message:'Private pilot discussion',topic:'investors',
  leadRoute:'investor',leadProject:'fintech',leadGoal:'Investment discussion',
  leadTiming:'1–3 months','cf-turnstile-response':'dummy-token'
 };
 const request=new Request('https://example.test/api/contact',{
  method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)
 });
 const env={TELEGRAM_BOT_TOKEN:'test',TELEGRAM_CHAT_ID:'123',TURNSTILE_SECRET_KEY:'test'};
 const res=await onRequestPost({request,env});
 assert.equal(res.status,200);
 assert.equal(calls.length,2);
 const message=JSON.parse(calls[1].body).text;
 for(const word of ['<b>Маршрут:</b> investor','<b>Проект:</b> fintech','<b>Цель:</b> Investment discussion','<b>Срок:</b> 1–3 months'])assert.ok(message.includes(word),word);
 const invalid=await onRequestPost({request:new Request('https://example.test/api/contact',{
  method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({...body,'cf-turnstile-response':''})
 }),env});
 assert.equal(invalid.status,400,'server checks missing Turnstile token');
 const bad=await onRequestPost({request:new Request('https://example.test/api/contact',{
  method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({...body,name:''})
 }),env:{...env,TURNSTILE_SECRET_KEY:undefined}});
 assert.equal(bad.status,400,'name validation');
 console.log('PASS: bilingual routes, per-project contact fields, server Telegram handoff and captcha checks');
}finally{globalThis.fetch=origFetch}
