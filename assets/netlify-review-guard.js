/* Isolated Netlify V2 verification. Never changes the primary syntha.pro site. */
(()=> {
  const hostname=location.hostname.toLowerCase();
  const isReview=hostname.endsWith('.netlify.app');
  if(!isReview)return;
  window.__contactBackendReady=false;
  document.addEventListener('DOMContentLoaded',async()=>{
    const en=document.documentElement.lang==='en';
    const banner=document.createElement('div');
    banner.id='v2-review-disclaimer';
    banner.setAttribute('role','status');
    banner.style.cssText='padding:9px 18px;text-align:center;font:12px/1.45 system-ui,sans-serif;color:#f6f3ef;background:#302c29;position:relative;z-index:9999;';
    document.body.prepend(banner);
    const form=document.getElementById('form');
    const description=document.createElement('p');
    description.setAttribute('role','status');
    description.style.cssText='margin:10px 0;font-size:13px;line-height:1.5';
    if(form){
      form.prepend(description);
      form.addEventListener('submit',event=>{
        if(window.__contactBackendReady===true)return;
        event.preventDefault();
        event.stopImmediatePropagation();
      },true);
    }
    const disabledText=en
      ? 'V2 preview · The contact form is unavailable until private delivery is verified. Use direct Telegram or WhatsApp.'
      : 'Предпросмотр V2 · Форма обращений закрыта до проверки приватной доставки. Доступны прямые контакты Telegram и WhatsApp.';
    const enabledText=en
      ? 'V2 preview · The contact form is connected to a protected verification workflow.'
      : 'Предпросмотр V2 · Форма подключена к защищённой проверке и приватной доставке.';
    let isReady=false;
    try {
      const response=await fetch('/api/contact',{cache:'no-store',headers:{'accept':'application/json'}});
      const data=await response.json();
      isReady=response.ok && data?.ready===true;
    } catch { isReady=false; }
    window.__contactBackendReady=isReady;
    banner.textContent=isReady?enabledText:disabledText;
    description.textContent=isReady?'':disabledText;
    const hint=document.getElementById('file-hint');
    if(hint)hint.textContent=en
      ? 'Preview limit: 3 MB per attachment. Do not submit confidential datasets.'
      : 'Лимит предпросмотра: 3 МБ на файл. Не прикладывайте конфиденциальные данные.';
    if(form)form.dispatchEvent(new Event('change',{bubbles:true}));
  });
})();