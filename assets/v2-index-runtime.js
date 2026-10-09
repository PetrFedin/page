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

  cards.classList.remove('snap', 'snap-fit');
  cards.style.removeProperty('height');
  cards.removeAttribute('tabindex');
  removeLegacyDots(cards);

  section.dataset.v2IndexRuntime = 'ready';
  return true;
}

function installProjectIndexRuntime() {
  stabiliseProjectIndex();

  const root = document.querySelector('#projects') || document.body;
  const observer = new MutationObserver(() => stabiliseProjectIndex());
  observer.observe(root, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['class', 'style']
  });

  window.addEventListener('resize', stabiliseProjectIndex, { passive: true });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', installProjectIndexRuntime, { once: true });
} else {
  installProjectIndexRuntime();
}
