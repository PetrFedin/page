/* V2-only runtime isolation for the legacy Projects registry.
 *
 * The base landing renders #cards as a mobile snap carousel. In V2 the same
 * registry is deliberately reused as a vertical deep-dive index. Removing the
 * carousel classes here prevents the base snap module from forcing every row
 * into the same horizontal track and fixed track height.
 */

function removeLegacyDots(cards) {
  let sibling = cards.nextElementSibling;
  while (sibling?.classList.contains('snap-dots')) {
    const next = sibling.nextElementSibling;
    sibling.remove();
    sibling = next;
  }
}

function stabiliseProjectIndex() {
  const section = document.querySelector('#projects.v2-project-index');
  const cards = section?.querySelector('#cards');
  if (!cards) return false;

  if (cards.classList.contains('snap')) cards.classList.remove('snap');
  if (cards.classList.contains('snap-fit')) cards.classList.remove('snap-fit');
  if (cards.style.height) cards.style.removeProperty('height');
  if (cards.hasAttribute('tabindex')) cards.removeAttribute('tabindex');
  removeLegacyDots(cards);

  if (section.dataset.v2IndexRuntime !== 'ready') {
    section.dataset.v2IndexRuntime = 'ready';
  }
  return true;
}

function installProjectIndexRuntime() {
  stabiliseProjectIndex();

  const root = document.querySelector('#projects') || document.body;
  let scheduled = false;
  const schedule = () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      stabiliseProjectIndex();
    });
  };

  const observer = new MutationObserver(schedule);
  observer.observe(root, {
    childList: true,
    subtree: true
  });

  window.addEventListener('resize', schedule, { passive: true });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', installProjectIndexRuntime, { once: true });
} else {
  installProjectIndexRuntime();
}
