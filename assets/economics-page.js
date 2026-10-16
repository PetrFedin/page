import {PROJECTS as CORE} from './content.js';
import {EXTRA_PROJECTS, INVESTOR_BLUEPRINTS} from './portfolio-extensions.js';
import {mountOpportunityStudio} from './opportunity-studio.js';
const language=document.documentElement.lang==='en'?'en':'ru';
const projects=[...CORE,...EXTRA_PROJECTS];
const root=language==='en'?'/en/':'/';
mountOpportunityStudio(document.getElementById('opportunities'),language,projects,(selection)=>{
  const path=root+'?topic='+encodeURIComponent(selection.topic||'consulting')+'#contact';
  location.href=path;
},INVESTOR_BLUEPRINTS,(id)=>{
  // Do not pretend that the investment dossier exists on this detached page.
  location.href=root+'#'+encodeURIComponent(id);
});
