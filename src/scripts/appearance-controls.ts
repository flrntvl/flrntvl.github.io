/*
 * Boutons Thème / Style ([data-theme-pref], [data-style-pref]) de toute la page :
 * appliquent la préférence et restent synchronisés (menu Apparence, menu mobile,
 * raccourcis t / s, commandes de la recherche).
 */
import {
  APPEARANCE_EVENT,
  getStylePref,
  getThemePref,
  setStylePref,
  setThemePref,
  type StylePref,
  type ThemePref,
} from './appearance';

const themeButtons = document.querySelectorAll<HTMLButtonElement>('[data-appearance-controls] [data-theme-pref]');
const styleButtons = document.querySelectorAll<HTMLButtonElement>('[data-appearance-controls] [data-style-pref]');

function sync(): void {
  const theme = getThemePref();
  const style = getStylePref();
  themeButtons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.themePref === theme)));
  styleButtons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.stylePref === style)));
}

themeButtons.forEach((b) => b.addEventListener('click', () => setThemePref(b.dataset.themePref as ThemePref)));
styleButtons.forEach((b) => b.addEventListener('click', () => setStylePref(b.dataset.stylePref as StylePref)));

document.addEventListener(APPEARANCE_EVENT, sync);
sync();
