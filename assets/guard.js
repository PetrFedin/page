/* Авторский знак — только там, где страницу копируют, а не читают.
   Обычное чтение, выделение и печать ничем не мешают. Знак «@sheqel · Пётр Федин»
   появляется:
   - на печати и при сохранении в PDF;
   - на несколько секунд, когда на компьютере нажимают клавиши снимка экрана;
   - при долгом нажатии на картинку (так её сохраняют на телефоне).
   Снимок экрана на телефоне браузер заметить не может — это решает сама система,
   поэтому там знака нет. Кроме того, у скопированного большого фрагмента текста
   в конце появляется подпись со ссылкой на сайт. */
(() => {
  'use strict';
  if (/^(localhost|127\.|\[::1\])/.test(location.hostname)) return;

  const mark = '@sheqel · Пётр Федин';
  const tile = `<svg xmlns='http://www.w3.org/2000/svg' width='320' height='220'><text x='20' y='140' transform='rotate(-24 160 110)' font-family='Georgia,serif' font-size='17' fill='#808080' fill-opacity='.22'>${mark}</text></svg>`;
  const css = document.createElement('style');
  css.textContent = `
    #author-mark{position:fixed; inset:0; z-index:2147483000; pointer-events:none; display:none;
      background:url("data:image/svg+xml;utf8,${encodeURIComponent(tile)}") 0 0/320px 220px repeat}
    html[data-mark] #author-mark{display:block}
    @media print{ #author-mark{display:block; position:fixed} }
  `;
  document.head.append(css);

  const layer = document.createElement('div');
  layer.id = 'author-mark';
  layer.setAttribute('aria-hidden', 'true');
  document.body.append(layer);

  let timer;
  const show = (ms = 4000) => {
    document.documentElement.setAttribute('data-mark', '');
    clearTimeout(timer);
    timer = setTimeout(() => document.documentElement.removeAttribute('data-mark'), ms);
  };

  addEventListener('keydown', (e) => {
    const k = e.key;
    const shot = k === 'PrintScreen' || k === 'Snapshot'
      || (e.metaKey && e.shiftKey && ['3', '4', '5'].includes(k))
      || (e.ctrlKey && e.shiftKey && ['s', 'S'].includes(k));
    if (shot) show();
  }, true);
  addEventListener('keyup', (e) => { if (e.key === 'PrintScreen') show(); }, true);
  addEventListener('beforeprint', () => show(8000));
  addEventListener('contextmenu', (e) => { if (e.target.closest?.('img, video')) show(5000); });

  addEventListener('copy', (e) => {
    const sel = String(getSelection() ?? '');
    if (sel.length < 60 || !e.clipboardData) return;
    e.clipboardData.setData('text/plain', `${sel}\n\n— Пётр Федин, @sheqel · ${location.origin}${location.pathname}`);
    e.preventDefault();
  });
})();
