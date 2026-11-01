/*
 * Améliorations du contenu Markdown, côté client :
 * - boutons « copier » des blocs de code ;
 * - schémas Mermaid, chargés seulement si la page en contient,
 *   aux couleurs du site et redessinés quand le thème ou le style change.
 */

const labels = {
  fr: { copy: 'copier', done: 'copié ✓', aria: 'Copier le code' },
  en: { copy: 'copy', done: 'copied ✓', aria: 'Copy code' },
};
const lang = document.documentElement.lang === 'en' ? 'en' : 'fr';

/* ---------- Copier ---------- */

function setupCopyButtons(): void {
  document.querySelectorAll<HTMLButtonElement>('.cb [data-copy]').forEach((button) => {
    const code = button.closest('.cb')?.querySelector('pre code');
    if (!code || !navigator.clipboard) return;

    button.textContent = labels[lang].copy;
    button.setAttribute('aria-label', labels[lang].aria);
    button.setAttribute('aria-live', 'polite');
    button.hidden = false;

    let timer: number | undefined;
    button.addEventListener('click', async () => {
      // Le « $ » des commandes n'est pas copié.
      const clone = code.cloneNode(true) as HTMLElement;
      clone.querySelectorAll('.prompt').forEach((el) => el.remove());
      try {
        await navigator.clipboard.writeText(clone.textContent ?? '');
      } catch {
        return;
      }
      button.textContent = labels[lang].done;
      button.classList.add('is-done');
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        button.textContent = labels[lang].copy;
        button.classList.remove('is-done');
      }, 1500);
    });
  });
}

/* ---------- Mermaid ---------- */

async function setupDiagrams(): Promise<void> {
  const blocks = document.querySelectorAll<HTMLElement>('pre > code.language-mermaid');
  if (blocks.length === 0) return;

  // Remplace chaque bloc de code par un conteneur (cadre + zone défilante) qui garde la source.
  const diagrams = [...blocks].map((code) => {
    const frame = document.createElement('div');
    frame.className = 'diagram';
    const figure = document.createElement('div');
    figure.className = 'diagram-scroll';
    figure.dataset.source = code.textContent ?? '';
    frame.append(figure);
    code.parentElement!.replaceWith(frame);

    // Ombre à gauche / à droite quand une partie du schéma est cachée de ce côté.
    const updateEdges = () => {
      const max = figure.scrollWidth - figure.clientWidth;
      frame.classList.toggle('more-left', figure.scrollLeft > 1);
      frame.classList.toggle('more-right', figure.scrollLeft < max - 1);
    };
    figure.addEventListener('scroll', updateEdges, { passive: true });
    new ResizeObserver(updateEdges).observe(figure);
    return figure;
  });

  const { default: mermaid } = await import('mermaid');
  let renderCount = 0;

  const render = async () => {
    const css = getComputedStyle(document.documentElement);
    const v = (name: string) => css.getPropertyValue(name).trim();
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: 'strict',
      theme: 'base',
      fontFamily: v('--code'),
      // Taille réelle (lisible) plutôt que réduite à la largeur : le conteneur défile si besoin.
      flowchart: { useMaxWidth: false, nodeSpacing: 28, rankSpacing: 32, diagramPadding: 4 },
      themeVariables: {
        fontFamily: v('--code'),
        fontSize: '13px',
        background: v('--surface'),
        primaryColor: v('--bg'),
        primaryTextColor: v('--fg'),
        primaryBorderColor: v('--line'),
        secondaryColor: v('--bg'),
        tertiaryColor: v('--surface'),
        lineColor: v('--muted'),
        textColor: v('--fg'),
        edgeLabelBackground: v('--surface'),
        clusterBkg: v('--surface'),
        clusterBorder: v('--line'),
      },
    });
    for (const figure of diagrams) {
      try {
        const { svg } = await mermaid.render(`mermaid-${++renderCount}`, figure.dataset.source ?? '');
        figure.innerHTML = svg;
      } catch {
        figure.textContent = figure.dataset.source ?? '';
      }
      figure.dispatchEvent(new Event('scroll'));
    }
  };

  await render();

  // Thème ou style modifié (menu, raccourci, appareil en mode « auto ») : on redessine.
  new MutationObserver(render).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme', 'data-style'],
  });
}

setupCopyButtons();
setupDiagrams();
