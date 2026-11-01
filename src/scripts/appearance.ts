/*
 * Préférences d'apparence (thème + style), mémorisées dans localStorage.
 * L'application initiale est faite par le script inline de <head> (AppearanceScript.astro),
 * avant le premier affichage ; ce module sert aux contrôles côté client (menu Apparence, raccourcis…).
 * Les clés et la logique de résolution doivent rester identiques à celles du script inline.
 */

export type ThemePref = 'auto' | 'light' | 'dark';
export type StylePref = 'editorial' | 'mono';

const THEME_KEY = 'theme';
const STYLE_KEY = 'style';

const root = document.documentElement;
const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');

function read(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Stockage indisponible (navigation privée…) : le réglage vaut pour la page en cours.
  }
}

export function getThemePref(): ThemePref {
  const value = read(THEME_KEY);
  return value === 'light' || value === 'dark' ? value : 'auto';
}

export function getStylePref(): StylePref {
  return read(STYLE_KEY) === 'mono' ? 'mono' : 'editorial';
}

/** Thème réellement affiché, une fois « auto » résolu. */
export function getResolvedTheme(): 'light' | 'dark' {
  return root.dataset.theme === 'dark' ? 'dark' : 'light';
}

export function setThemePref(pref: ThemePref): void {
  write(THEME_KEY, pref);
  root.dataset.theme = pref === 'auto' ? (darkQuery.matches ? 'dark' : 'light') : pref;
  notify();
}

export function setStylePref(pref: StylePref): void {
  write(STYLE_KEY, pref);
  root.dataset.style = pref;
  notify();
}

export function toggleTheme(): void {
  setThemePref(getResolvedTheme() === 'dark' ? 'light' : 'dark');
}

export function toggleStyle(): void {
  setStylePref(getStylePref() === 'mono' ? 'editorial' : 'mono');
}

/** Événement émis à chaque changement, pour que les contrôles se mettent à jour. */
export const APPEARANCE_EVENT = 'appearance-change';

function notify(): void {
  document.dispatchEvent(new CustomEvent(APPEARANCE_EVENT));
}

// En mode « auto », le script inline met déjà data-theme à jour ; on prévient les contrôles.
darkQuery.addEventListener('change', () => {
  if (getThemePref() === 'auto') notify();
});
