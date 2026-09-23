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
  let list = [];
  let at = 0;

  /* Кнопка увеличения нужна там, где уложенный снимок не занимает всю высоту:
     у вертикальных экранов она бы ничего не меняла. */
  function syncZoom() {
    if (!big.naturalWidth || modal.classList.contains('zoomed')) return;
    const cs = getComputedStyle(modal);
    const w = modal.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    const h = modal.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
    $('#photo-zoom').hidden = big.naturalWidth / big.naturalHeight <= w / h;
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
    at = (i + list.length) % list.length;
    big.src = list[at].src;
    big.alt = list[at].alt ?? '';
    /* Увеличение относится к конкретному снимку — на соседнем начинаем сначала. */
    modal.classList.remove('zoomed');
    modal.scrollTo({ top: 0, left: 0 });

    const many = list.length > 1;
    $('#photo-prev').hidden = !many;
    $('#photo-next').hidden = !many;
    $('#photo-count').textContent = many ? `${at + 1} / ${list.length}` : '';
    syncLabels();
    if (big.complete) syncZoom(); else big.addEventListener('load', syncZoom, { once: true });
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
    get isOpen() { return modal.open; },
  };
}
