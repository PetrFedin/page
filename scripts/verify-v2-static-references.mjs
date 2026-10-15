#!/usr/bin/env node
/* Offline existence audit for Cloudflare Pages' allowlisted static V2 build.
 * No requests to external providers, no private source material published. */
import assert from 'node:assert/strict';
import {
  readFileSync,readdirSync,statSync,existsSync,mkdirSync,writeFileSync
} from 'node:fs';
import {resolve,relative,join,extname,sep} from 'node:path';

const root=resolve(process.env.STATIC_ROOT||'dist-pages');
assert.ok(existsSync(join(root,'index.html')),'V2 packaged static root missing');
const files=[], failures=[],externalOrigins=new Set(),resolvedPaths=new Set();
const origin='https://syntha.pro';
let references=0;
function walk(dir){
  for(const item of readdirSync(dir,{withFileTypes:true})){
    assert.ok(!item.isSymbolicLink(),'Symlink in public output');
    const target=join(dir,item.name);
    if(item.isDirectory())walk(target);else if(item.isFile())files.push(target);
  }
}
walk(root);
function verify(value,source){
  if(!value||value.startsWith('#')||/^(?:data|blob|mailto|tel):/i.test(value))return;
  references++;
  let url;
  try{url=new URL(value.replace(/&amp;/g,'&'),origin+'/'+source);}
  catch{failures.push({source,target:value,reason:'invalid URL'});return;}
  if(url.origin!==origin){externalOrigins.add(url.origin);return;}
  if(url.pathname.startsWith('/api/')||url.pathname==='/stats')return;
  let decoded;
  try{decoded=decodeURIComponent(url.pathname);}
  catch{failures.push({source,target:value,reason:'invalid encoding'});return;}
  const path=resolve(root,'.'+decoded),inside=relative(root,path);
  if(inside==='..'||inside.startsWith('..'+sep)){
    failures.push({source,target:value,reason:'outside public package'});return;
  }
  const candidates=[path,join(path,'index.html'),path+'.html'];
  if(!candidates.some(x=>existsSync(x)&&statSync(x).isFile()))
    failures.push({source,target:value,reason:'missing local asset or page'});
  else resolvedPaths.add(url.pathname);
}
for(const file of files){
  const source=relative(root,file).split(sep).join('/'),ext=extname(file);
  if(!['.html','.js','.css'].includes(ext))continue;
  const body=readFileSync(file,'utf8');
  if(ext==='.html'){
    for(const tag of body.matchAll(/<(?:a|link|script|img|source|video|iframe|input)\b[^>]*>/gi))
      for(const hit of tag[0].matchAll(/\b(?:href|src|poster|data-src)\s*=\s*["']([^"']+)["']/gi))
        verify(hit[1],source);
  }else if(ext==='.js'){
    for(const match of body.matchAll(/\b(?:from\s*|import\s*)["'](\.{1,2}\/[^"']+\.js(?:\?[^"']*)?)["']/g))
      verify(match[1],source);
  }else{
    for(const match of body.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/g))
      verify(match[1].trim(),source);
  }
}
assert.ok(references>100,'Unexpectedly few references inspected');
mkdirSync('qa-artifacts',{recursive:true});
writeFileSync('qa-artifacts/v2-static-references.json',JSON.stringify({
  scope:'offline static existence; fragment navigation is checked in browser QA',
  htmlFiles:files.filter(x=>extname(x)==='.html').length,
  inspectedReferences:references,uniqueLocalPaths:resolvedPaths.size,
  externalOrigins:[...externalOrigins].sort(),failures
},null,2)+'\n');
assert.deepEqual(failures,[],'Broken links: '+JSON.stringify(failures.slice(0,12)));
console.log('PASS: '+references+' static references, '+resolvedPaths.size+' resolved local paths; no external network.');
