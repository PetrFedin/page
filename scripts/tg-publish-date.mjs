#!/usr/bin/env node
/**
 * Safe one-off release to @syntha_pro:
 *   node scripts/tg-publish-date.mjs --date 2026-10-13
 *   node scripts/tg-publish-date.mjs --date 2026-10-13 --check
 *   node scripts/tg-publish-date.mjs --date 2026-10-13 --send
 *
 * The live website must expose the article before a Telegram send.
 * Secrets remain in ~/.config/syntha-pro/telegram.env.
 */
import {readFile,writeFile,rename,mkdir,open,unlink} from 'node:fs/promises';
import {homedir} from 'node:os';
import {join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {NEWS} from '../assets/news.js';

const DIR=join(homedir(),'.config','syntha-pro');
const STATE=join(DIR,'published.json');
const ENV=join(DIR,'telegram.env');
const LOCK=join(DIR,'editorial-publish.lock');
const CHANNEL='@syntha_pro';
const ORIGIN='https://syntha.pro';

export const escapeHtml=s=>String(s??'').replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
export function telegramArticle(post,language='ru'){
 if(!post||!['ru','en'].includes(language))throw Error('Invalid post or language');
 const copy=post.tg?.[language]??post[language];
 if(!copy?.title||!copy?.body)throw Error('Incomplete editorial text');
 const tags=(copy.tags??post[language]?.tags??[]).map(t=>'#'+String(t).replace(/[^\p{L}\p{N}_]/gu,'')).filter(t=>t.length>1);
 const body=['<b>'+escapeHtml(copy.title)+'</b>',escapeHtml(copy.body)];
 if(tags.length)body.push(tags.join(' '));
 const text=body.join('\n\n');
 if(text.length>3900)throw Error('Telegram message too long');
 return text;
}
export function candidate(date,language='ru'){
 if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!['ru','en'].includes(language))
  throw Error('Supply --date YYYY-MM-DD and optional --lang ru|en');
 const items=NEWS.filter(p=>p.date===date&&p.site===true);
 if(items.length!==1)throw Error('No unique site-approved article for '+date);
 if(!items[0][language]?.title)throw Error('Translation missing');
 return items[0];
}
const getFlag=(args,key)=>{const i=args.indexOf(key);return i<0?null:args[i+1]};
async function readState(){
 try{
  const d=JSON.parse(await readFile(STATE,'utf8'));
  return {...d,published:Array.isArray(d.published)?d.published:[],
   editorialDelivery:d.editorialDelivery??{},editorialPending:d.editorialPending??{}};
 }catch(e){
  if(e.code==='ENOENT')return {published:[],editorialDelivery:{},editorialPending:{}};
  throw Error('Cannot read publishing state; refusing to publish');
 }
}
async function saveState(state){
 const temp=STATE+'.next';
 await writeFile(temp,JSON.stringify(state,null,2)+'\n',{mode:0o600});
 await rename(temp,STATE);
}
async function credentials(){
 const text=await readFile(ENV,'utf8').catch(()=>{throw Error('telegram.env unavailable on this machine')});
 const env={};
 for(const line of text.split(/\r?\n/)){
  const m=line.match(/^\s*([A-Z_]+)\s*=\s*(.*?)\s*$/);
  if(m)env[m[1]]=m[2].replace(/^['"]|['"]$/g,'');
 }
 if(!/^\d{6,12}:[A-Za-z0-9_-]{35}$/.test(env.TELEGRAM_BOT_TOKEN??''))
  throw Error('Invalid Telegram bot credentials');
 if(env.TELEGRAM_CHANNEL!==CHANNEL)throw Error('Only @syntha_pro is allowed');
 return env;
}
async function api(env,method,payload={}){
 let response;
 try {
  response=await fetch('https://api.telegram.org/bot'+env.TELEGRAM_BOT_TOKEN+'/'+method,{
   method:'POST',headers:{'content-type':'application/json'},
   body:JSON.stringify(payload),signal:AbortSignal.timeout(15000)
  });
 }catch{throw Error('Telegram API unavailable ('+method+')')}
 const data=await response.json().catch(()=>null);
 if(!response.ok||data?.ok!==true)throw Error('Telegram rejected '+method+' HTTP '+response.status);
 return data.result;
}
async function verifyBot(env){
 const me=await api(env,'getMe');
 const chat=await api(env,'getChat',{chat_id:CHANNEL});
 if(chat?.type!=='channel'||String(chat.username??'').toLowerCase()!=='syntha_pro')
  throw Error('Unexpected channel identity');
 const member=await api(env,'getChatMember',{chat_id:CHANNEL,user_id:me.id});
 if(member?.status!=='administrator'||member.can_post_messages!==true)
  throw Error('Bot must have channel publishing permission');
}
async function verifyLive(date,language){
 const address=ORIGIN+(language==='en'?'/en':'')+'/feed.xml?release-check='+encodeURIComponent(date);
 const response=await fetch(address,{signal:AbortSignal.timeout(15000),headers:{'cache-control':'no-cache'}});
 if(!response.ok)throw Error('Live RSS not accessible');
 const text=await response.text();
 const link=ORIGIN+(language==='en'?'/en/':'/')+'#post-'+date;
 if(!text.includes(link))throw Error('Site has not deployed this article; Telegram blocked');
}
export async function cli(args=process.argv.slice(2)){
 const date=getFlag(args,'--date'),lang=getFlag(args,'--lang')??'ru';
 const send=args.includes('--send'),check=args.includes('--check');
 if(check&&send)throw Error('Use --check or --send, not both');
 const post=candidate(date,lang);
 const body=telegramArticle(post,lang);
 if(!send&&!check){
  console.log('PREVIEW, nothing sent:\n'+body+'\n\nRun --send after verifying the live feed');
  return {status:'preview',date};
 }
 const env=await credentials();
 await verifyBot(env);
 if(check){
  console.log('Bot has publishing rights for @syntha_pro; nothing sent');
  return {status:'verified'};
 }
 await verifyLive(date,lang);
 await mkdir(DIR,{recursive:true,mode:0o700});
 let lock;
 try{lock=await open(LOCK,'wx',0o600)}
 catch{throw Error('Another publish attempt or unresolved lock; reconcile manually')}
 try{
  const state=await readState(),key=date+':'+lang;
  if(state.published.includes(date)||state.editorialDelivery[key])
   throw Error('This date was already published; duplicate blocked');
  if(state.editorialPending[key])
   throw Error('Possible previous send with uncertain outcome; reconcile channel manually');
  state.editorialPending[key]={status:'sending',started_at:new Date().toISOString(),channel:CHANNEL};
  await saveState(state);
  // Timeouts can occur after Telegram accepts a message; leave pending for manual reconciliation.
  const sent=await api(env,'sendMessage',{chat_id:CHANNEL,text:body,parse_mode:'HTML',disable_web_page_preview:true});
  if(!Number.isInteger(sent?.message_id))throw Error('Missing Telegram message_id');
  state.editorialDelivery[key]={message_id:sent.message_id,posted_at:new Date().toISOString(),
   url:'https://t.me/syntha_pro/'+sent.message_id};
  state.published.push(date);
  delete state.editorialPending[key];
  await saveState(state);
  console.log('PUBLISHED '+state.editorialDelivery[key].url);
  return {status:'published',...state.editorialDelivery[key]};
 }finally{
  await lock.close();
  await unlink(LOCK).catch(()=>{});
 }
}
if(process.argv[1]&&fileURLToPath(import.meta.url)===resolve(process.argv[1])){
 cli().catch(err=>{console.error('NOT PUBLISHED: '+err.message);process.exitCode=1;});
}
