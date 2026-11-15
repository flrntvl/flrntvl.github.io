/*
 * Sommaire « Sur cette page » (articles, cheatsheets) : marque la section en cours de lecture
 * avec aria-current="location". Sans JavaScript, le sommaire reste une simple liste de liens.
 *
 * Section en cours : la dernière dont le titre est passé tout en haut de l'écran (seuil de 96 px,
 * pour qu'un clic dans le sommaire, qui place le titre à 24 px, allume bien la section visée
 * même si elle est courte et que la suivante apparaît juste en dessous).
 * En bas de page, la dernière section, pour qu'une section courte (« Notes ») puisse s'allumer.
 */

function setupTocSpy(): void {
  const links = [...document.querySelectorAll<HTMLAnchorElement>('.side .toc a[href^="#"]')];
  const items = links
    .map((link) => ({ link, target: document.getElementById(decodeURIComponent(link.hash.slice(1))) }))
    .filter((item): item is { link: HTMLAnchorElement; target: HTMLElement } => item.target !== null);
  if (items.length === 0) return;

  let current: HTMLAnchorElement | undefined;
  let scheduled = false;

  const update = () => {
    scheduled = false;
    const threshold = 96;
    const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;

    let active: HTMLAnchorElement | undefined;
    if (atBottom) {
      active = items[items.length - 1].link;
    } else {
      for (const { link, target } of items) {
        if (target.getBoundingClientRect().top <= threshold) active = link;
        else break;
      }
    }

    if (active === current) return;
    current?.removeAttribute('aria-current');
    active?.setAttribute('aria-current', 'location');
    current = active;
  };

  const schedule = () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(update);
  };

  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  // Les schémas Mermaid et les champs des commandes à variables changent la hauteur de la page.
  new ResizeObserver(schedule).observe(document.body);
  update();
}

setupTocSpy();
