/*
 * Langues, routes et textes de l'interface.
 * FR est la langue par défaut (sans préfixe), EN est sous /en/.
 */

export const languages = {
  fr: 'Français',
  en: 'English',
} as const;

export type Lang = keyof typeof languages;

export const defaultLang: Lang = 'fr';

/** Chemins des sections, dans chaque langue. */
export const routes = {
  home: { fr: '/', en: '/en/' },
  articles: { fr: '/articles/', en: '/en/articles/' },
  projects: { fr: '/projets/', en: '/en/projects/' },
  cheatsheets: { fr: '/cheatsheets/', en: '/en/cheatsheets/' },
  about: { fr: '/a-propos/', en: '/en/about/' },
} as const satisfies Record<string, Record<Lang, string>>;

export type RouteKey = keyof typeof routes;

export const ui = {
  fr: {
    'site.name': 'Florent',
    'site.description':
      'Ingénieur développeur web · PHP, Symfony, Laravel, React. Articles, projets et cheatsheets.',
    'a11y.skip': 'Aller au contenu',
    'nav.label': 'Navigation principale',
    'nav.articles': 'Articles',
    'nav.projects': 'Projets',
    'nav.cheatsheets': 'Cheatsheets',
    'nav.about': 'À propos',
    'nav.about.mono': 'à-propos',
    'search.open': 'Rechercher',
    'lang.label': 'Langue',
    'appearance.open': 'Apparence',
    'appearance.theme': 'Thème',
    'appearance.theme.auto': 'Appareil',
    'appearance.theme.light': 'Clair',
    'appearance.theme.dark': 'Sombre',
    'appearance.style': 'Style',
    'appearance.style.editorial': 'Éditorial',
    'appearance.style.mono': 'Dev',
    'appearance.saved': 'Mémorisé sur cet appareil.',
    'footer.shortcuts': 'Raccourcis clavier',
    'footer.built': 'Construit avec Astro · hébergé sur GitHub Pages',
    'home.kicker': 'Ingénieur développeur web · PHP, Symfony, Laravel, React',
    'home.title': 'Je construis des applications web,',
    'home.title.accent': "et j'écris ce que j'apprends.",
    'home.title.mono': 'Ingénieur développeur web. PHP, Symfony, Laravel et React.',
    'home.intro':
      "Vous trouverez ici des articles techniques, les projets que je construis, et des fiches courtes pour les commandes qu'on finit toujours par rechercher.",
  },
  en: {
    'site.name': 'Florent',
    'site.description':
      'Web developer · PHP, Symfony, Laravel, React. Articles, projects and cheatsheets.',
    'a11y.skip': 'Skip to content',
    'nav.label': 'Main navigation',
    'nav.articles': 'Articles',
    'nav.projects': 'Projects',
    'nav.cheatsheets': 'Cheatsheets',
    'nav.about': 'About',
    'nav.about.mono': 'about',
    'search.open': 'Search',
    'lang.label': 'Language',
    'appearance.open': 'Appearance',
    'appearance.theme': 'Theme',
    'appearance.theme.auto': 'Device',
    'appearance.theme.light': 'Light',
    'appearance.theme.dark': 'Dark',
    'appearance.style': 'Style',
    'appearance.style.editorial': 'Editorial',
    'appearance.style.mono': 'Dev',
    'appearance.saved': 'Saved on this device.',
    'footer.shortcuts': 'Keyboard shortcuts',
    'footer.built': 'Built with Astro · hosted on GitHub Pages',
    'home.kicker': 'Web developer · PHP, Symfony, Laravel, React',
    'home.title': 'I build web applications,',
    'home.title.accent': 'and write about what I learn.',
    'home.title.mono': 'Web developer. PHP, Symfony, Laravel and React.',
    'home.intro':
      "Here you'll find technical articles, the projects I build, and short sheets for the commands we always end up looking up.",
  },
} as const;

export type UiKey = keyof (typeof ui)[typeof defaultLang];
