/* Read-only provenance for product media. The source run is a research/evidence
   reference only: it must not silently promote any media file to a public asset.
   A GitHub artifact is expiring review material, not a durable CDN URL.
   No source can assert production readiness or commercial use by itself. */
export const PORTFOLIO_MEDIA_EVIDENCE=Object.freeze({
 antiqua:{
  kind:'isolated-demonstration',asOf:'2026-10-19',
  repo:'PetrFedin/antiqua',sourceSha:'1439f3b510a068772cddfd189333412f028f4683',
  runUrl:'https://github.com/PetrFedin/antiqua/actions/runs/39314773212',
  artifact:'Original Github Actions artifact; SHA-256 proof in catalog',
  screenshots:8,videoSeconds:28,approvedForEmbedding:true,
  notice:'Isolated demo. Not evidence of customer production adoption.'
 },
 renova:{
  kind:'isolated-demonstration',asOf:'2026-10-19',
  repo:'PetrFedin/renova',sourceSha:'a968fe71c6f287b072a275b2e72087a2a844e79c',
  runUrl:'https://github.com/PetrFedin/renova/actions/runs/39337917645',
  artifact:'Original Github Actions artifact; SHA-256 proof in catalog',
  screenshots:12,videoSeconds:25,approvedForEmbedding:true,
  notice:'Isolated demo. Not evidence of customer production adoption.'
 },
 syntha:{
  kind:'isolated-demonstration',asOf:'2026-10-18',
  repo:'PetrFedin/synth-v2',sourceSha:'9a90247da7c50f144e63834ba1a7e9d8c3c9b12e',
  runUrl:'https://github.com/PetrFedin/synth-v2/actions/runs/39132723945',
  artifact:'Original Github Actions artifact; SHA-256 proof in catalog',
  screenshots:10,videoSeconds:27,approvedForEmbedding:true,
  notice:'Isolated demo. Not evidence of customer production adoption.'
 },
 chatx:{
  kind:'isolated-demonstration',asOf:'2026-10-18',
  repo:'PetrFedin/chat',sourceSha:'080cb53e1ff93f85bc44ceef1b20f699340b56a9',
  runUrl:'https://github.com/PetrFedin/chat/actions/runs/39160687694',
  artifact:'chatx-portfolio-080cb53e1ff93f85bc44ceef1b20f699340b56a9-39160687694',
  screenshots:10,videoSeconds:27,approvedForEmbedding:true
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
  screenshots:13,videoSeconds:25,approvedForEmbedding:true,
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
 qualification.textContent=evidence.approvedForEmbedding
 ? (lang==='en'
    ? 'Source-verified screenshot/video of a '+(isDemo?'running isolated demo':'public independent preview')+'. This is not evidence of adoption, endorsement or production use by an external customer.'
    : 'Подтверждённые снимки и видео '+(isDemo?'работающей изолированной демоверсии':'публичного независимого предпросмотра')+'. Они не подтверждают внедрение у стороннего заказчика, поддержку брендом или промышленную эксплуатацию.')
 : (lang==='en'
    ? 'The capture is still on editorial review hold and has not been installed as a durable site asset.'
    : 'Медиа пока проходят редакционную проверку и ещё не размещены в составе сайта.');
 const link=document.createElement('a');link.className='portfolio-media-source';link.href=evidence.runUrl;
 link.rel='noopener noreferrer';link.target='_blank';
 link.textContent=lang==='en'?'View recording run and artifact →':'Протокол съёмки и артефакт GitHub →';
 area.append(title,subtitle,qualification,link);
}
