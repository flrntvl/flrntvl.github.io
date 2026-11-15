/*
 * Boutons Thème ([data-theme-pref]) de toute la page : appliquent la préférence et restent
 * synchronisés (menu Thème de l'en-tête, menu mobile, raccourci t, commandes de la recherche).
 */
import { APPEARANCE_EVENT, getThemePref, setThemePref, type ThemePref } from './appearance';

const themeButtons = document.querySelectorAll<HTMLButtonElement>('[data-appearance-controls] [data-theme-pref]');

function sync(): void {
  const theme = getThemePref();
  themeButtons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.themePref === theme)));
}

themeButtons.forEach((b) => b.addEventListener('click', () => setThemePref(b.dataset.themePref as ThemePref)));

document.addEventListener(APPEARANCE_EVENT, sync);
sync();
