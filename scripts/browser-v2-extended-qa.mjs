#!/usr/bin/env node
/** Browser QA of the actual Netlify-stage static bundle on a local test port. */
import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
import {chromium} from 'playwright';
import AxeBuilder from '@axe-core/playwright';

const base=process.env.V2_AUDIT_BASE||'http://127.0.0.1:4321';
const widths=[375,768,1440];
const paths=['index.html','privacy.html','analytics.html','economics.html','profile.html',
 'syntha.html','chatx.html','renova.html','mfw.html','promomed.html',
 'marco-pescarolo.html',
 'en/index.html','en/privacy.html','en/analytics.html','en/economics.html','en/profile.html',
 'en/syntha.html','en/chatx.html','en/renova.html','en/mfw.html','en/promomed.html'];
const root='qa-artifacts';
mkdirSync(root,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const rows=[],problems=[],axeReports=[];
const screenshotPages=new Set(['index.html','en/index.html','marco-pescarolo.html']);
try{
 for(const path of paths){
  for(const width of widths){
   const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce'});
   const exceptions=[];
   page.on('pageerror',e=>exceptions.push(String(e)));
   let response;
   try{response=await page.goto(base+'/'+path,{waitUntil:'domcontentloaded',timeout:20000});await page.waitForTimeout(250)}
   catch(e){problems.push({path,width,type:'navigation_exception',message:String(e)});await page.close();continue}
   const state=await page.evaluate(()=>{
     const doc=document.documentElement;
     const heading=[...document.querySelectorAll('h1')].filter(x=>getComputedStyle(x).display!=='none'&&x.getBoundingClientRect().height>0);
     return {
       lang:doc.lang,title:document.title,
       overflow:Math.max(0,doc.scrollWidth-doc.clientWidth),
       ownerLinks:document.querySelectorAll('a[href="/stats"]').length,
       visibleH1:heading.length,
       missingSvgButtonNames:[...document.querySelectorAll('button:has(svg)')].filter(b=>{
         const st=getComputedStyle(b);
         return st.display!=='none'&&b.getBoundingClientRect().height>0&&
          !b.textContent.trim()&&!b.getAttribute('aria-label')&&!b.getAttribute('title');
       }).slice(0,8).map(b=>b.id||b.className),
       brokenLoadedImages:[...document.images].filter(i=>i.complete&&!i.naturalWidth&&getComputedStyle(i).display!=='none'&&i.loading!=='lazy').map(i=>i.src).slice(0,6)
     };
   });
   const row={path,width,httpStatus:response?.status(),...state,exceptions};
   rows.push(row);
   if(row.httpStatus!==200)problems.push({path,width,type:'http_status',value:row.httpStatus});
   if(row.ownerLinks)problems.push({path,width,type:'dead_owner_link',value:row.ownerLinks});
   if(row.overflow>4)problems.push({path,width,type:'horizontal_overflow',px:row.overflow});
   if(row.missingSvgButtonNames.length)problems.push({path,width,type:'unlabelled_icon_buttons',ids:row.missingSvgButtonNames});
   if(row.brokenLoadedImages.length)problems.push({path,width,type:'broken_images',urls:row.brokenLoadedImages});
   if(exceptions.length)problems.push({path,width,type:'browser_exceptions',exceptions});
   if(path.endsWith('index.html')){
      const cards=page.locator('#cards>.card');
      try {
       await cards.first().waitFor({timeout:4000});
       if(await cards.count()!==3)problems.push({path,width,type:'featured_project_count',value:await cards.count()});
       await page.locator('#projects-more').click({timeout:5000});
       if(await cards.count()!==11)problems.push({path,width,type:'expanded_project_count',value:await cards.count()});
       if(await page.locator('#services>li').count()!==5)problems.push({path,width,type:'consulting_count'});
       if(await page.locator('#facts-bar>.fact-card').count()!==5)problems.push({path,width,type:'experience_count'});
      } catch(e){problems.push({path,width,type:'homepage_interaction',message:String(e).slice(0,350)})}
   }
   if(screenshotPages.has(path)){
      const name=path.replace(/\//g,'_').replace(/\.html$/,'')+'-'+width+'.png';
      await page.screenshot({path:root+'/'+name,fullPage:false,animations:'disabled'}).catch(()=>{});
   }
   if(width===1440 && ['index.html','en/index.html','profile.html','en/profile.html','privacy.html','en/privacy.html'].includes(path)){
    try{
     const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();
     axeReports.push({path,violations:axe.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.length,help:v.help}))});
    }catch(e){axeReports.push({path,error:String(e)})}
   }
   await page.close();
  }
 }
}finally{await browser.close()}
const output={source:'Netlify static bundle staged for preview',pages:paths.length,viewports:widths,
 checks:rows.length,rows,problems,accessibility:axeReports};
writeFileSync(root+'/v2-extended-browser-qa.json',JSON.stringify(output,null,2));
const critical=problems.filter(p=>['navigation_exception','http_status','browser_exceptions','homepage_interaction','featured_project_count','expanded_project_count','consulting_count','experience_count','dead_owner_link'].includes(p.type));
console.log('V2 extended browser QA:',rows.length,'page/viewport cases,',problems.length,'observations,',critical.length,'blocking defects');
console.log('Axe accessibility summaries:',JSON.stringify(axeReports.map(x=>({path:x.path,issues:x.violations?.length,error:x.error}))));
assert.deepEqual(critical,[],'Blocking browser QA defects: '+JSON.stringify(critical.slice(0,8)));
