/* Листание блоков на телефоне.
   Общий модуль: на главной так листаются услуги, факты, карточки проектов
   и лента, на разборе проекта — схемы и перечни. Смысл один — не растить
   вертикальную прокрутку там, где блоки равноправны и читаются по одному. */

const isPhone = () => matchMedia('(max-width: 759px)').matches;

/* Дорожка с .snap-fit подгоняет высоту под карточки, которые сейчас видны, —
   иначе все слайды тянутся до самого высокого и под короткими остаётся пустота. */
const fitObserver = new ResizeObserver((entries) => {
  new Set(entries.map((e) => e.target.parentElement)).forEach(fitHeight);
});
function fitHeight(track) {
  if (!track?.classList.contains('snap-fit')) return;
  if (!isPhone()) { track.style.height = ''; return; }
  const tr = track.getBoundingClientRect();
  let h = 0;
  for (const el of track.children) {
    if (!el.getClientRects().length) continue;
    const r = el.getBoundingClientRect();
    if (r.right > tr.left + 2 && r.left < tr.right - 2) h = Math.max(h, el.offsetHeight);
  }
  if (h) track.style.height = `${h + 12}px`;
}

function buildDots(track) {
  let dots = track.nextElementSibling;
  if (!dots?.classList.contains('snap-dots')) {
    dots = document.createElement('div');
    dots.className = 'snap-dots';
    track.after(dots);
  }
  /* Точки показываем не по ширине экрана, а по факту: если дорожку
     есть куда листать. Лента цепочки не помещается и на десктопе. */
  const листается = track.scrollWidth > track.clientWidth + 4;
  if (!isPhone()) fitHeight(track);
  if (!isPhone() && !листается) { dots.hidden = true; return; }
  dots.hidden = false;
  /* Невидимые дети — например, шапка таблицы, скрытая на телефоне, —
     слайдами не считаются: иначе появляется лишняя пустая точка. */
  const слайды = [...track.children].filter((el) => el.getClientRects().length);
  if (track.classList.contains('snap-fit')) {
    if (!track.dataset.fit) {
      track.dataset.fit = '1';
      track.addEventListener('scroll', () => fitHeight(track), { passive: true });
    }
    [...track.children].forEach((el) => fitObserver.observe(el));
    fitHeight(track);
  }
  const n = слайды.length;
  dots.innerHTML = Array.from({ length: n }, (_, i) =>
    `<button type="button" data-i="${i}" aria-label="${i + 1}"${i ? '' : ' aria-current="true"'}></button>`).join('');

  const active = () => {
    const c = track.scrollLeft + track.clientWidth / 2;
    let a = 0;
    слайды.forEach((el, i) => { if (el.offsetLeft < c) a = i; });
    [...dots.children].forEach((d, i) => d.setAttribute('aria-current', String(i === a)));
  };
  track.addEventListener('scroll', active, { passive: true });
  dots.addEventListener('click', (e) => {
    const b = e.target.closest('[data-i]');
    if (b) track.scrollTo({ left: слайды[+b.dataset.i].offsetLeft, behavior: 'smooth' });
  });
  active();
}

export function syncSnaps() {
  document.querySelectorAll('.snap').forEach(buildDots);
}
