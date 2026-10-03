/* Авторский знак вместо запретов.
   Страницу можно читать, выделять и печатать. Чтобы текст и снимки не терялись
   без подписи, делаем две вещи:
   1) на странице едва заметный знак «@sheqel · Пётр Федин» — он попадает и в скриншот, и в печать;
   2) скопированный большой фрагмент текста получает подпись со ссылкой на сайт. */
(() => {
  'use strict';
  if (/^(localhost|127\.|\[::1\])/.test(location.hostname)) return;

  const mark = '@sheqel · Пётр Федин';
  const tile = `<svg xmlns='http://www.w3.org/2000/svg' width='320' height='220'><text x='20' y='140' transform='rotate(-24 160 110)' font-family='Georgia,serif' font-size='17' fill='#808080' fill-opacity='.2'>${mark}</text></svg>`;
  const css = document.createElement('style');
  css.textContent = `
    #author-mark{position:fixed; inset:0; z-index:2147483000; pointer-events:none;
      background:url("data:image/svg+xml;utf8,${encodeURIComponent(tile)}") 0 0/320px 220px repeat; opacity:.55}
    @media print{ #author-mark{position:fixed; opacity:.8} }
  `;
  document.head.append(css);

  const layer = document.createElement('div');
  layer.id = 'author-mark';
  layer.setAttribute('aria-hidden', 'true');
  document.body.append(layer);

  addEventListener('copy', (e) => {
    const sel = String(getSelection() ?? '');
    if (sel.length < 60 || !e.clipboardData) return;
    e.clipboardData.setData('text/plain', `${sel}\n\n— Пётр Федин, @sheqel · ${location.origin}${location.pathname}`);
    e.preventDefault();
  });
})();
