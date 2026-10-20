/* Static-only staging safety: this file is linked only by the Netlify review package.
   The main production website and its contact mechanism remain unchanged. */
(()=> {
  const hostname=location.hostname.toLowerCase();
  const isReview=hostname==='syntha-v2-preview-petr.netlify.app' ||
    hostname.endsWith('--syntha-v2-preview-petr.netlify.app');
  if(!isReview)return;
  document.addEventListener('DOMContentLoaded',()=>{
    const en=document.documentElement.lang==='en';
    const note=en
      ? 'V2 review · Static preview only. Contact submission is disabled here.'
      : 'Предпросмотр V2 · Только статическая версия. Отправка обращений здесь отключена.';
    const banner=document.createElement('div');
    banner.id='v2-review-disclaimer';
    banner.setAttribute('role','status');
    banner.style.cssText='padding:9px 18px;text-align:center;font:12px/1.45 system-ui,sans-serif;color:#f6f3ef;background:#302c29;position:relative;z-index:9999;';
    banner.textContent=note;
    document.body.prepend(banner);
    const form=document.getElementById('form');
    if(!form)return;
    form.addEventListener('submit',event=>{
      event.preventDefault();
      event.stopImmediatePropagation();
    },true);
    const button=form.querySelector('[type="submit"],button[type="submit"]');
    if(button){
      button.disabled=true;
      button.setAttribute('aria-disabled','true');
      button.title=note;
    }
    const description=document.createElement('p');
    description.setAttribute('role','status');
    description.textContent=note;
    description.style.cssText='margin:10px 0;font-size:13px;line-height:1.5';
    form.prepend(description);
  });
})();
