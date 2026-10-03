/* Защита от копирования страницы. Честно: полностью запретить скриншот в браузере
   нельзя — это решает устройство. Здесь всё, что сайт может сделать сам:
   печать и сохранение дают пустой лист, при нажатии клавиш скриншота экран на
   мгновение закрывается, картинки не перетаскиваются и не открываются из меню,
   текст не выделяется (кроме контактов и полей формы). */
(() => {
  'use strict';
  if (/^(localhost|127\.|\[::1\])/.test(location.hostname)) return;

  const css = document.createElement('style');
  css.textContent = `
    html:not([data-allow-copy]) body{-webkit-user-select:none; user-select:none; -webkit-touch-callout:none}
    input,textarea,select,[contenteditable],.direct,.direct *,.contacts-copy{-webkit-user-select:text; user-select:text; -webkit-touch-callout:default}
    img,video,svg{-webkit-user-drag:none; user-drag:none}
    #guard-veil{position:fixed; inset:0; z-index:2147483647; background:#000; display:none}
    html[data-veil] #guard-veil{display:block}
    @media print{ html{background:#fff!important} body>*{display:none!important} body::before{content:"Печать отключена. Контакты: syntha.pro"; display:block; padding:40px; font:18px sans-serif; color:#000} }
  `;
  document.head.append(css);

  const veil = document.createElement('div');
  veil.id = 'guard-veil';
  document.body.append(veil);

  let t;
  const cover = (ms = 1800) => {
    document.documentElement.setAttribute('data-veil', '');
    try { navigator.clipboard?.writeText(' '); } catch { /* нет доступа к буферу */ }
    clearTimeout(t);
    t = setTimeout(() => document.documentElement.removeAttribute('data-veil'), ms);
  };

  const field = (el) => !!el?.closest?.('input, textarea, select, [contenteditable]');

  addEventListener('keydown', (e) => {
    const k = e.key;
    const mod = e.ctrlKey || e.metaKey;
    const shot = k === 'PrintScreen' || k === 'Snapshot'
      || (e.metaKey && e.shiftKey && ['3', '4', '5', 's', 'S'].includes(k))
      || (e.ctrlKey && e.shiftKey && ['s', 'S'].includes(k));
    if (shot) { cover(); e.preventDefault(); return; }
    if (mod && ['p', 'P', 's', 'S', 'u', 'U'].includes(k) && !field(e.target)) { e.preventDefault(); cover(900); }
  }, true);
  addEventListener('keyup', (e) => { if (e.key === 'PrintScreen') cover(); }, true);

  addEventListener('contextmenu', (e) => { if (!field(e.target)) e.preventDefault(); });
  addEventListener('dragstart', (e) => { if (!field(e.target)) e.preventDefault(); });
  addEventListener('copy', (e) => {
    if (field(e.target) || e.target.closest?.('.direct')) return;
    const sel = String(getSelection());
    if (!sel) return;
    e.clipboardData?.setData('text/plain', 'Пётр Федин · syntha.pro');
    e.preventDefault();
  });
  addEventListener('beforeprint', () => cover(3000));
})();
