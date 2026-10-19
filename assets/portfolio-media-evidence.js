/* Read-only provenance for product media. The source run is a research/evidence
   reference only: it must not silently promote any media file to a public asset.
   A GitHub artifact is expiring review material, not a durable CDN URL.
   No source can assert production readiness or commercial use by itself. */
export const PORTFOLIO_MEDIA_EVIDENCE=Object.freeze({
 chatx:{
  kind:'isolated-demonstration',asOf:'2026-10-18',
  repo:'PetrFedin/chat',sourceSha:'080cb53e1ff93f85bc44ceef1b20f699340b56a9',
  runUrl:'https://github.com/PetrFedin/chat/actions/runs/39160687694',
  artifact:'chatx-portfolio-080cb53e1ff93f85bc44ceef1b20f699340b56a9-39160687694',
  screenshots:10,videoSeconds:27,approvedForEmbedding:false
 },
 'fashion-os':{
  kind:'isolated-demonstration',asOf:'2026-10-10',
  repo:'PetrFedin/yanina-management',sourceSha:'32808de3bf215ec1f3b3bbc0abc4f30d286632ca',
  runUrl:'https://github.com/PetrFedin/yanina-management/actions/runs/38096596430',
  artifact:'fashion-management-real-tablet-32808de3bf215ec1f3b3bbc0abc4f30d286632ca',
  screenshots:2,videoSeconds:0,approvedForEmbedding:false,
  notice:'Older capture: recheck against current main before promotion.'
 },
 promomed:{
  kind:'public-preview',asOf:'2026-10-18',
  repo:'PetrFedin/promomed',sourceSha:'42ad14b9e356a10a39dea4c983783affc7d7a05c',
  runUrl:'https://github.com/PetrFedin/promomed/actions/runs/39161180777',
  artifact:'sostoyanie-portfolio-live-42ad14b9e356a10a39dea4c983783affc7d7a05c',
  screenshots:13,videoSeconds:25,approvedForEmbedding:false,
  notice:'Independent concept. Public-preview capture does not imply an endorsement by any third-party company.'
 }
});
export function showPortfolioMediaEvidence({id,lang,host}){
 const evidence=PORTFOLIO_MEDIA_EVIDENCE[id];
 let area=host.querySelector('#portfolio-media-evidence');
 if(!evidence){if(area)area.remove();return}
 if(!area){area=document.createElement('aside');area.id='portfolio-media-evidence';area.className='portfolio-media-evidence';(host.querySelector('#dots')?.insertAdjacentElement('afterend',area) || host.append(area))}
 area.replaceChildren();
 const title=document.createElement('h3');
 title.textContent=lang==='en'?'Media evidence — review status':'Медиа проекта — статус проверки';
 const subtitle=document.createElement('p');
 const isDemo=evidence.kind==='isolated-demonstration';
 subtitle.textContent=lang==='en'
  ? (isDemo?'Browser capture of an isolated running demo':'Browser capture of a publicly accessible preview')
    +' · '+evidence.asOf+' · '+evidence.screenshots+' screenshots · '+(evidence.videoSeconds?evidence.videoSeconds+'s video':'no validated video')
  : (isDemo?'Снимки работающей изолированной демоверсии':'Снимки публичного предпросмотра')
    +' · '+evidence.asOf+' · '+evidence.screenshots+' кадров · '+(evidence.videoSeconds?'видео '+evidence.videoSeconds+' с':'проверенного видео нет');
 const qualification=document.createElement('p');
 qualification.textContent=lang==='en'
 ? 'Recorded files have not yet passed final editorial clearance or been installed as durable media assets. This record does not prove a commercial rollout.'
 : 'Материалы ещё не прошли финальное редакционное согласование и не размещены как постоянные медиафайлы. Съёмка не подтверждает коммерческий запуск.';
 const link=document.createElement('a');link.className='portfolio-media-source';link.href=evidence.runUrl;
 link.rel='noopener noreferrer';link.target='_blank';
 link.textContent=lang==='en'?'View recording run and artifact →':'Протокол съёмки и артефакт GitHub →';
 area.append(title,subtitle,qualification,link);
}
