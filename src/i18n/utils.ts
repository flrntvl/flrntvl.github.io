import { defaultLang, languages, routes, ui, type Lang, type RouteKey, type UiKey } from './ui';

/** Langue d'une page, d'après son URL (/en/… → en, sinon fr). */
export function getLangFromUrl(url: URL): Lang {
  const [, first] = url.pathname.split('/');
  return first in languages ? (first as Lang) : defaultLang;
}

/** Fonction de traduction pour une langue : t('nav.articles'). */
export function useTranslations(lang: Lang) {
  return (key: UiKey): string => ui[lang][key] ?? ui[defaultLang][key];
}

/** Chemin d'une section dans une langue : getPath('projects', 'en') → /en/projects/ */
export function getPath(key: RouteKey, lang: Lang): string {
  return routes[key][lang];
}

/** Section à laquelle appartient un chemin (la plus spécifique), ou undefined. */
export function getRouteKey(pathname: string): RouteKey | undefined {
  const path = pathname.endsWith('/') ? pathname : `${pathname}/`;
  let match: RouteKey | undefined;
  let matchLength = 0;
  for (const key of Object.keys(routes) as RouteKey[]) {
    for (const prefix of Object.values(routes[key])) {
      if (path.startsWith(prefix) && prefix.length > matchLength) {
        match = key;
        matchLength = prefix.length;
      }
    }
  }
  return match;
}

/**
 * Même page dans une autre langue.
 * Pour une section, renvoie la section équivalente ; pour une page de contenu (slug),
 * garde le slug. Les traductions réelles (translationKey) seront branchées à l'étape i18n.
 */
export function getAlternatePath(pathname: string, target: Lang): string {
  const key = getRouteKey(pathname);
  if (!key) return routes.home[target];

  const path = pathname.endsWith('/') ? pathname : `${pathname}/`;
  const current = Object.values(routes[key]).find((prefix) => path.startsWith(prefix)) ?? '';
  const rest = key === 'home' ? '' : path.slice(current.length);
  return routes[key][target] + rest;
}
