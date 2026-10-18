/**
 * Professional-brand IA. Reduces the home hero to two primary decisions while
 * preserving all existing anchor IDs and event handlers inside an accessible
 * disclosure. No lead is submitted, tracked or stored by this module.
 */
const COPY={
 ru:{
  talk:'Обсудить бизнес-задачу',see:'Посмотреть цифровые продукты',
  more:'Опыт, публикации и партнёрство',profile:'Профессиональный профиль',
  evidenceTitle:'Как проверять опыт и результаты',
  evidenceIntro:'Описание специализации и масштаба работы — информация автора. Финансовый результат можно считать подтверждённым только при раскрытых периоде, базе, формуле и источнике данных.',
  evidenceLevels:[['Методика','Формулы, границы расчёта и ожидаемый результат. Не подтверждает достигнутого эффекта.'],['Прототип','Доказательство отдельных технических сценариев, а не промышленной эксплуатации.'],['Результат клиента','Публикуется только с подтверждёнными KPI и разрешением на раскрытие.']],
  profileRead:'Посмотреть методы и рабочие сценарии →',
  pathEyebrow:'ЧТО ПРОИСХОДИТ ПОСЛЕ ЗАПРОСА',
  steps:[['01','Уточнение','Формулируем задачу и критерии результата.'],['02','Оценка','Согласуем объём данных, ограничения и формат работы.'],['03','Предложение','Определяем этапы, исполнителей и проверяемые результаты.']],
  noSla:'Срок и стоимость не обещаются заранее: они зависят от объёма задачи и доступа к данным.'
 },
 en:{
  talk:'Discuss a business challenge',see:'Explore digital products',
  more:'Experience, writing & partnerships',profile:'Professional profile',
  evidenceTitle:'How to assess experience and results',
  evidenceIntro:'Expertise and scale of work are self-reported. A financial outcome needs an identified period, baseline, calculation method and corroborating evidence before being described as verified.',
  evidenceLevels:[['Methodology','Formula, assumptions and intended outcome. Not evidence of realized impact.'],['Prototype','Evidence of tested technical scenarios, not proof of live external operation.'],['Client result','Requires verified KPIs and explicit permission to publish.']],
  profileRead:'Explore methods and practical scenarios →',
  pathEyebrow:'AFTER YOUR ENQUIRY',
  steps:[['01','Clarify','Define the decision problem and observable outcome.'],['02','Scope','Agree on available data, constraints and engagement model.'],['03','Propose','Define phases, responsibilities and measurable deliverables.']],
  noSla:'Time and pricing depend on the work scope and data access; no unqualified delivery promise.'
 }
};
function el(tag,cls,text){
 const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e;
}
export function enhanceBrandPlatform(lang){
 const t=COPY[lang]||COPY.ru;
 const hero=document.querySelector('.hero-cta');
 if(hero){
  const consult=document.getElementById('cta-consulting');
  const projects=document.getElementById('cta-projects');
  if(consult){consult.textContent=t.talk;consult.href='#contact';}
  if(projects)projects.textContent=t.see;
  let extra=document.getElementById('hero-secondary-links');
  if(!extra){
   extra=el('details','hero-secondary-links');extra.id='hero-secondary-links';
   const summary=el('summary','',t.more);
   const links=el('div','hero-secondary-contents');
   for(const id of ['cta-experience','cta-investors','cta-feed','cta-contact']){
    const a=document.getElementById(id);if(a)links.append(a);
   }
   const profile=el('a','btn','');
   profile.id='hero-profile-link';profile.href=lang==='en'?'/en/profile.html':'/profile.html';
   links.append(profile);extra.append(summary,links);hero.append(extra);
  }
  extra.querySelector('summary').textContent=t.more;
  const profile=extra.querySelector('#hero-profile-link');
  if(profile){profile.href=lang==='en'?'/en/profile.html':'/profile.html';profile.textContent=t.profile+' →'}
 }
 const experience=document.getElementById('experience');
 if(experience){
  let proof=document.getElementById('brand-evidence-standard');
  if(!proof){
   proof=el('details','brand-evidence-standard');
   proof.id='brand-evidence-standard';
   const summary=el('summary');
   const lead=el('p','brand-proof-intro');
   const cards=el('div','brand-proof-levels');
   const link=el('a','brand-proof-link');
   link.id='brand-proof-link';
   proof.append(summary,lead,cards,link);
   experience.append(proof);
  }
  proof.querySelector('summary').textContent=t.evidenceTitle;
  proof.querySelector('.brand-proof-intro').textContent=t.evidenceIntro;
  const levels=proof.querySelector('.brand-proof-levels');
  levels.replaceChildren(...t.evidenceLevels.map(([title,body])=>{
   const wrap=el('div','brand-proof-item');wrap.append(el('b','',title),el('p','',body));return wrap;
  }));
  const link=proof.querySelector('#brand-proof-link');
  link.href=lang==='en'?'/en/profile.html#evidence':'/profile.html#evidence';
  link.textContent=t.profileRead;
 }
 const paths=document.querySelector('#work-with-me');
 if(paths){
  let below=document.getElementById('lead-next-steps');
  if(!below){
   below=el('div','lead-next-steps');below.id='lead-next-steps';
   below.append(el('p','eyebrow'),el('ol','lead-next-list'),el('p','lead-next-note'));
   paths.append(below);
  }
  below.querySelector('.eyebrow').textContent=t.pathEyebrow;
  below.querySelector('.lead-next-list').replaceChildren(...t.steps.map(([n,title,body])=>{
   const item=el('li');item.append(el('span','svc-n',n));
   const text=el('div');text.append(el('b','',title),el('p','',body));item.append(text);return item;
  }));
  below.querySelector('.lead-next-note').textContent=t.noSla;
 }
}
