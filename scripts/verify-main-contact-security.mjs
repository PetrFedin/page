#!/usr/bin/env node
/* No external network: all Turnstile/Telegram calls are mocked here. */
import assert from 'node:assert/strict';
import { onRequestPost } from '../functions/api/contact.js';

const secret={TELEGRAM_BOT_TOKEN:'test-token-not-real',TELEGRAM_CHAT_ID:'12345',TURNSTILE_SECRET_KEY:'test-secret-not-real'};
const payload={
  name:'Example & Name',
  email:'example@example.org',
  message:'Please discuss fashion consulting',
  topic:'consulting',
  consent:'on',
  'cf-turnstile-response':'ci-token'
};
let external=[];
let override=()=>null;
const originalFetch=globalThis.fetch;
globalThis.fetch=async(url,init)=>{
  const method=String(url).split('/').pop();
  const body=init?.body instanceof FormData ? init.body : JSON.parse(init?.body || '{}');
  external.push({method,body});
  const mock=override(method,body);
  if(mock instanceof Error)throw mock;
  if(mock)return mock;
  if(method==='siteverify')return Response.json({success:true});
  if(method==='getChat')return Response.json({ok:true,result:{id:12345,type:'private'}});
  return Response.json({ok:true,result:{message_id:25}});
};
async function send(body=payload,env=secret,file=null){
  external=[];
  let request;
  if(file){
    const form=new FormData();
    for(const [k,v] of Object.entries(body))form.append(k,v);
    form.append('file',file,file.name);
    request=new Request('https://syntha.pro/api/contact',{method:'POST',body:form});
  }else{
    request=new Request('https://syntha.pro/api/contact',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)});
  }
  return onRequestPost({request,env});
}
try{
  const good=await send();
  assert.equal(good.status,200,'consented + verified lead should be accepted');
  assert.deepEqual(external.map(x=>x.method),['siteverify','getChat','sendMessage']);
  assert.ok(external[2].body.text.includes('Example &amp; Name'),'HTML escaping required');

  assert.equal((await send(payload,{...secret,TURNSTILE_SECRET_KEY:undefined})).status,503,'captcha must fail closed');
  assert.deepEqual(external,[],'missing secret may not send externally');
  assert.equal((await send({...payload,consent:''})).status,400,'consent required server-side');
  assert.deepEqual(external,[],'missing consent may not send externally');
  assert.equal((await send({...payload,'cf-turnstile-response':''})).status,400);
  assert.deepEqual(external,[],'missing CAPTCHA token may not send externally');
  assert.equal((await send({...payload,name:''})).status,400);
  assert.equal((await send({...payload,email:'invalid'})).status,400);
  assert.equal((await send({...payload,company:'spam'})).status,200,'honeypot drops silently');
  assert.deepEqual(external,[],'honeypot must not call external APIs');

  override=m=>m==='siteverify'?Response.json({success:false}):null;
  assert.equal((await send()).status,400,'rejected captcha');
  assert.deepEqual(external.map(x=>x.method),['siteverify']);
  override=m=>m==='siteverify'?new Response('outage',{status:502}):null;
  assert.equal((await send()).status,503,'challenge outage must not bypass validation');
  override=m=>m==='siteverify'?new Error('timeout'):null;
  assert.equal((await send()).status,503,'challenge exception must not bypass validation');
  override=()=>null;

  for(const chatType of ['group','supergroup','channel']){
    override=m=>m==='getChat'?Response.json({ok:true,result:{id:12345,type:chatType}}):null;
    assert.equal((await send()).status,503,'recipient must be private: '+chatType);
    assert.deepEqual(external.map(x=>x.method),['siteverify','getChat'],'must not send to '+chatType);
  }
  override=m=>m==='getChat'?new Error('offline'):null;
  assert.equal((await send()).status,503,'getChat outage must stop send');
  override=()=>null;

  const longMessage='&<>😀'.repeat(800);
  assert.equal((await send({...payload,message:longMessage})).status,200);
  const chunks=external.filter(x=>x.method==='sendMessage');
  assert.ok(chunks.length>=2,'escaped long text must be split safely');
  assert.ok(chunks.every(x=>x.body.text.length<=4096),'Telegram max 4096 chars');
  assert.ok(chunks.some(x=>x.body.text.includes('&amp;&lt;&gt;')),'escaped Unicode content retained');

  const file=new File(['test document'],'brief.txt',{type:'text/plain'});
  assert.equal((await send(payload,secret,file)).status,200);
  assert.deepEqual(external.map(x=>x.method),['siteverify','getChat','sendDocument','sendMessage']);
  assert.equal(external[2].body.get('document').name,'brief.txt');
  override=m=>m==='sendDocument'?Response.json({ok:false}):null;
  assert.equal((await send(payload,secret,file)).status,502,'failed attachment cannot be success');
  assert.deepEqual(external.map(x=>x.method),['siteverify','getChat','sendDocument']);
  override=m=>m==='sendMessage'?Response.json({ok:false}):null;
  assert.equal((await send()).status,502,'Telegram HTTP 200 with ok:false must fail');
  override=m=>m==='sendMessage'?new Error('network outage'):null;
  assert.equal((await send()).status,502,'delivery network failure must fail');
  override=()=>null;

  let count=0;
  override=m=>m==='sendMessage' && ++count===2?new Response('unavailable',{status:502}):null;
  assert.equal((await send({...payload,message:longMessage})).status,502,'partial delivery not success');
  assert.equal(external.filter(x=>x.method==='sendMessage').length,2,'stop on first failed chunk');
  console.log('PASS: Cloudflare contact security fail-closed, consent, private-only Telegram, file & chunk failure contracts');
}finally{
  globalThis.fetch=originalFetch;
}
