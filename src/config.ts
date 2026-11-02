/*
 * Réglages du site : dépôt, liens sociaux.
 * Les valeurs entre crochets sont à fournir.
 */

/** Nom complet : titre de la page d'accueil et nom du site pour les moteurs de recherche. */
export const fullName = 'Florent Val';

export const repo = 'https://github.com/flrntvl/flrntvl.github.io';
export const repoBranch = 'main';

export const social = {
  github: { label: 'GitHub', handle: 'flrntvl', href: 'https://github.com/flrntvl' },
  linkedin: { label: 'LinkedIn', handle: 'florent-val', href: 'https://www.linkedin.com/in/florent-val' },
  x: { label: 'X (Twitter)', handle: '@flrntvl', href: 'https://x.com/flrntvl' },
};

/**
 * Photo de la page À propos : l'avatar GitHub, téléchargé et optimisé au build.
 * Adresse par identifiant numérique : reste valable si le pseudo change.
 */
export const avatarUrl = 'https://avatars.githubusercontent.com/u/351062461?v=4';

export const rssPath = { fr: '/rss.xml', en: '/en/rss.xml' } as const;
