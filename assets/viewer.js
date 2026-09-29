/* Просмотрщик снимков.
   Живёт отдельным модулем, потому что нужен и главной странице, и разбору
   проекта: вложенный <dialog> кладётся поверх уже открытого окна и при
   закрытии возвращает к нему. Разметку просмотрщика страница объявляет сама —
   модуль только связывает её с набором снимков. */

export function createViewer({ labels }) {
  const $ = (sel) => document.querySelector(sel);
  const modal = $('#photo-modal');
  if (!modal) return { open() {} };

  const big = $('#photo-big');
  const vid = $('#photo-video');
  let list = [];
  let at = 0;

  /* Кнопка увеличения нужна там, где уложенный кадр не занимает всю высоту:
     у вертикальных экранов она бы ничего не меняла. Работает и для видео,
     и для фото — берём натуральные размеры того, что сейчас показано. */
  function syncZoom() {
    const isVideo = list[at]?.type === 'video';
    const el = isVideo ? vid : big;
    const nw = isVideo ? el.videoWidth : el.naturalWidth;
    const nh = isVideo ? el.videoHeight : el.naturalHeight;
    if (!nw || modal.classList.contains('zoomed')) return;
    const cs = getComputedStyle(modal);
    const w = modal.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    const h = modal.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
    $('#photo-zoom').hidden = nw / nh <= w / h;
  }

  function syncLabels() {
    const v = labels();
    const zoomed = modal.classList.contains('zoomed');
    $('#photo-zoom').textContent = zoomed ? v.zoomOut : v.zoomIn;
    $('#photo-prev').setAttribute('aria-label', v.prev);
    $('#photo-next').setAttribute('aria-label', v.next);
  }

  function show(i) {
    if (!list.length) return;
    /* Видео на паузу и не играет фоном, когда листаем дальше. */
    if (!vid.paused) vid.pause();
    at = (i + list.length) % list.length;
    const item = list[at];
    const isVideo = item.type === 'video';

    big.hidden = isVideo;
    vid.hidden = !isVideo;
    if (isVideo) {
      if (vid.dataset.loadedSrc !== item.src) {
        vid.innerHTML = '';
        const mp4 = item.src.replace(/\.webm$/, '.mp4');
        for (const [src, mime] of [[mp4, 'video/mp4'], [item.src, 'video/webm']]) {
          const source = document.createElement('source');
          source.src = src;
          source.type = mime;
          vid.append(source);
        }
        if (item.poster) vid.poster = item.poster;
        vid.load();
        vid.dataset.loadedSrc = item.src;
      }
    } else {
      big.src = item.src;
      big.alt = item.alt ?? '';
    }
    /* Увеличение — по явному выбору пользователя, а не привязано к кадру:
       переключаясь дальше по галерее, состояние сохраняется, пока сам
       кадр это позволяет (см. syncZoom). */
    modal.scrollTo({ top: 0, left: 0 });

    const many = list.length > 1;
    $('#photo-prev').hidden = !many;
    $('#photo-next').hidden = !many;
    $('#photo-count').textContent = many ? `${at + 1} / ${list.length}` : '';
    syncLabels();
    if (isVideo) {
      if (vid.readyState >= 1) syncZoom(); else vid.addEventListener('loadedmetadata', syncZoom, { once: true });
    } else if (big.complete) syncZoom(); else big.addEventListener('load', syncZoom, { once: true });
  }

  $('#photo-close').addEventListener('click', () => modal.close());
  $('#photo-prev').addEventListener('click', () => show(at - 1));
  $('#photo-next').addEventListener('click', () => show(at + 1));
  $('#photo-zoom').addEventListener('click', () => {
    modal.classList.toggle('zoomed');
    modal.scrollTo({ top: 0, left: 0 });
    syncLabels();
  });
  modal.addEventListener('click', (e) => { if (e.target === modal) modal.close(); });
  modal.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); show(at - 1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); show(at + 1); }
  });
  addEventListener('resize', () => { if (modal.open) syncZoom(); });

  /* Свайп работает, только когда снимок уместился: у увеличенного
     горизонтальное движение — это прокрутка самой картинки. */
  let swipeFrom = null;
  big.addEventListener('pointerdown', (e) => {
    swipeFrom = modal.classList.contains('zoomed') ? null : e.clientX;
  });
  big.addEventListener('pointerup', (e) => {
    if (swipeFrom === null) return;
    const dx = e.clientX - swipeFrom;
    swipeFrom = null;
    if (Math.abs(dx) > 40) show(at + (dx < 0 ? 1 : -1));
  });

  return {
    open(shots, i = 0) {
      list = shots;
      $('#photo-bar').hidden = false;
      show(i);
      if (!modal.open) modal.showModal();
    },
    close() { if (modal.open) modal.close(); },
  };
}
