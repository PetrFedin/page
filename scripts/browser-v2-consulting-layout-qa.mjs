#!/usr/bin/env node
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
try{
 for(const [lang,path] of [['ru','/'],['en','/en/']]){
  for(const width of [390,820,1180,1440]){
   const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce'});
   const errors=[];page.on('pageerror',e=>errors.push(String(e)));
   await page.route('https://challenges.cloudflare.com/**',route=>route.fulfill({status:200,contentType:'text/javascript',body:''}));
   const response=await page.goto('http://127.0.0.1:4321'+path,{waitUntil:'domcontentloaded'});
   assert.equal(response.status(),200);
   await page.locator('#services .svc').first().waitFor();
   assert.equal(await page.locator('#services .svc').count(),5);
   assert.equal(await page.locator('#facts-bar .fact-card').count(),5);
   assert.equal(await page.locator('#formats .format').count(),4);
   assert.equal(await page.locator('#lead-routes-grid .lead-route-card').count(),3);
   const ids=await page.locator('#facts-bar .fact-card .fact-open').evaluateAll(nodes=>nodes.map(n=>n.dataset.area));
   assert.ok(ids.includes('systems-integration'),lang+' missing independent integration expertise');
   const layout=await page.locator('#services').evaluate(el=>{
    const cards=[...el.querySelectorAll(':scope >li')];
    const outer=el.getBoundingClientRect();
    return {display:getComputedStyle(el).display,columns:getComputedStyle(el).gridTemplateColumns,
      cards:cards.map(c=>({left:c.getBoundingClientRect().left,width:c.getBoundingClientRect().width,top:c.getBoundingClientRect().top})),
      outerWidth:outer.width};
   });
   if(width>=1040){
    assert.equal(layout.display,'grid',lang+' consulting must be grid on desktop');
    const first=layout.cards[0];
    for(const card of layout.cards){
     assert.ok(Math.abs(card.width-first.width)<3,lang+' unequal consulting width: '+JSON.stringify(layout));
     assert.ok(Math.abs(card.top-first.top)<3,lang+' consulting must be one row');
    }
    assert.ok(layout.cards.at(-1).left>layout.cards.at(-2).left,'fifth card cannot leave empty right field');
   } else if(width>=760){
    assert.equal(layout.display,'grid',lang+' tablet grid');
   }
   const spill=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
   assert.ok(spill<=3,'horizontal overflow at '+lang+'/'+width+': '+spill);
   assert.deepEqual(errors,[],lang+' JS errors');
   await page.close();
  }
 }
 console.log('PASS: 5 equal advisory cards, five expertise blocks, 3 client paths, 4 formats on RU/EN 390/820/1180/1440');
}finally{await browser.close()}
