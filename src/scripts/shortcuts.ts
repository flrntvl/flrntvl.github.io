/*
 * Raccourcis clavier du site :
 *   g puis h / a / p / c / m → Accueil / Articles / Projets / Cheatsheets / À propos
 *   t → basculer clair / sombre      s → basculer éditorial / dev
 *   ? → aide des raccourcis          Échap → fermer la fenêtre ouverte (natif des <dialog>)
 * La recherche (⌘K, Ctrl K, /) est gérée par search.ts.
 * Jamais déclenchés quand le focus est dans un champ de saisie.
 */
import { toggleStyle, toggleTheme } from './appearance';

const dialog = document.querySelector<HTMLDialogElement>('[data-shortcuts-dialog]');
const paths: Record<string, string> = JSON.parse(dialog?.dataset.paths ?? '{}');

const GO: Record<string, string> = { h: 'home', a: 'articles', p: 'projects', c: 'cheatsheets', m: 'about' };
const PENDING_MS = 1200;

let pendingGo = 0; // horodatage du dernier « g », 0 si aucun

const isTyping = (el: Element | null) =>
  el instanceof HTMLElement &&
  (el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName));

function openHelp(): void {
  if (dialog && !dialog.open) dialog.showModal();
}

document.querySelectorAll('[data-shortcuts-open]').forEach((button) =>
  button.addEventListener('click', openHelp),
);
dialog?.querySelector('[data-shortcuts-close]')?.addEventListener('click', () => dialog.close());
dialog?.addEventListener('click', (event) => {
  if (event.target === dialog) dialog.close(); // clic sur le fond
});

document.addEventListener('keydown', (event) => {
  if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) return;
  if (isTyping(document.activeElement)) return;

  // Une autre fenêtre est ouverte (recherche…) : seul Échap compte, géré nativement.
  const openDialog = document.querySelector('dialog[open]');
  if (openDialog && openDialog !== dialog) return;

  const key = event.key;

  if (pendingGo && Date.now() - pendingGo < PENDING_MS) {
    pendingGo = 0;
    const section = GO[key.toLowerCase()];
    if (section && paths[section]) {
      event.preventDefault();
      location.assign(paths[section]);
    }
    return;
  }
  pendingGo = 0;

  if (key === '?') {
    event.preventDefault();
    dialog?.open ? dialog.close() : openHelp();
    return;
  }
  if (openDialog) return; // dans l'aide, seuls « ? » et Échap agissent

  switch (key.toLowerCase()) {
    case 'g':
      pendingGo = Date.now();
      break;
    case 't':
      event.preventDefault();
      toggleTheme();
      break;
    case 's':
      event.preventDefault();
      toggleStyle();
      break;
  }
});
