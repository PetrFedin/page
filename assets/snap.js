/* Листание блоков на телефоне.
   Общий модуль: на главной так листаются услуги, факты, карточки проектов
   и лента, на разборе проекта — схемы и перечни. Смысл один — не растить
   вертикальную прокрутку там, где блоки равноправны и читаются по одному. */

export const isPhone = () => matchMedia('(max-width: 759px)').matches;

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
  if (!isPhone() && !листается) { dots.hidden = true; return; }
  dots.hidden = false;
  /* Невидимые дети — например, шапка таблицы, скрытая на телефоне, —
     слайдами не считаются: иначе появляется лишняя пустая точка. */
  const слайды = [...track.children].filter((el) => el.getClientRects().length);
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
