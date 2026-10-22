import assert from 'node:assert/strict';
import contact from '../netlify/functions/contact.mjs';

const url='https://syntha-v2-preview-petr.netlify.app/api/contact';
const saved=Object.fromEntries(['TURNSTILE_SECRET_KEY','TELEGRAM_BOT_TOKEN','TELEGRAM_CHAT_ID'].map(k=>[k,process.env[k]]));
for(const k of Object.keys(saved))delete process.env[k];
async function call(request){return contact(request,{});}
try{
 let response=await call(new Request(url));
 assert.equal(response.status,503,'No secrets: no active lead form');
 assert.equal((await response.json()).ready,false);
 response=await call(new Request(url,{method:'POST',headers:{'content-type':'application/json'},body:'{}'}));
 assert.equal(response.status,503,'No secrets: never accept POST');
 process.env.TURNSTILE_SECRET_KEY='test-only-turnstile';
 process.env.TELEGRAM_BOT_TOKEN='test-only-telegram';
 process.env.TELEGRAM_CHAT_ID='-123456';
 response=await call(new Request(url));
 assert.equal(response.status,503,'Public group Telegram must never be configured');
 process.env.TELEGRAM_CHAT_ID='123456789';
 response=await call(new Request(url));
 assert.equal(response.status,200,'Configured preview must indicate ready');
 assert.equal((await response.json()).maxFileBytes,3*1024*1024);
 response=await call(new Request(url,{method:'POST',headers:{'origin':'https://bad.example','content-type':'application/json'},body:'{}'}));
 assert.equal(response.status,403,'CSRF must be rejected');
 response=await call(new Request(url,{method:'POST',headers:{'content-type':'application/json','content-length':'5000000'},body:'{}'}));
 assert.equal(response.status,413,'Large requests must be rejected');
 response=await call(new Request(url,{method:'POST',headers:{'content-type':'application/json'},body:'{}'}));
 assert.equal(response.status,400,'Consent must be enforced');
 response=await call(new Request(url,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({consent:'on',name:'Test',email:'verified@example.org',message:'Test request'})}));
 assert.equal(response.status,400,'Turnstile must be mandatory');
 console.log('PASS: Netlify contact fail-closed, private-only Telegram ID, origin, request bounds, consent and Turnstile');
} finally {
 for(const [k,v] of Object.entries(saved)){if(v===undefined)delete process.env[k];else process.env[k]=v;}
}