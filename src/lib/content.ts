/*
 * Accès au contenu : brouillons masqués en production, filtrage par langue, tri.
 */
import { getCollection, type CollectionEntry } from 'astro:content';
import { cheatsheetCategories } from '../content.config';
import type { Lang, RouteKey } from '../i18n/ui';
import { getPath } from '../i18n/utils';

export type Collection = 'articles' | 'projects' | 'cheatsheets';

const sectionOf: Record<Collection, RouteKey> = {
  articles: 'articles',
  projects: 'projects',
  cheatsheets: 'cheatsheets',
};

/**
 * Les brouillons sont visibles en dev, jamais publiés.
 * SHOW_DRAFTS=true les inclut dans un build local (npm run search:dev, pour tester la recherche).
 */
const showDrafts = import.meta.env.DEV || import.meta.env.SHOW_DRAFTS === 'true';

export const isPublished = (entry: { data: { draft: boolean } }) => showDrafts || !entry.data.draft;

/** Slug d'une entrée, sans le dossier de langue : « fr/last-reboot » → « last-reboot ». */
export function getSlug(entry: { id: string }): string {
  return entry.id.split('/').slice(1).join('/');
}

async function getEntries<C extends Collection>(collection: C, lang: Lang) {
  return getCollection(collection, (entry) => isPublished(entry) && entry.data.lang === lang);
}

/** Articles d'une langue, du plus récent au plus ancien. */
export async function getArticles(lang: Lang): Promise<CollectionEntry<'articles'>[]> {
  const entries = await getEntries('articles', lang);
  return entries.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

/** Projets d'une langue, par ordre puis par année décroissante. */
export async function getProjects(lang: Lang): Promise<CollectionEntry<'projects'>[]> {
  const entries = await getEntries('projects', lang);
  return entries.sort((a, b) => a.data.order - b.data.order || b.data.year - a.data.year);
}

/** Cheatsheets d'une langue, par catégorie (ordre du schéma) puis par commande. */
export async function getCheatsheets(lang: Lang): Promise<CollectionEntry<'cheatsheets'>[]> {
  const entries = await getEntries('cheatsheets', lang);
  const rank = (e: CollectionEntry<'cheatsheets'>) => cheatsheetCategories.indexOf(e.data.category);
  return entries.sort((a, b) => rank(a) - rank(b) || a.data.title.localeCompare(b.data.title, lang));
}

/** URL d'une entrée : /articles/mon-article/, /en/projects/this-site/… */
export function getEntryPath(collection: Collection, entry: { id: string; data: { lang: Lang } }): string {
  return `${getPath(sectionOf[collection], entry.data.lang)}${getSlug(entry)}/`;
}

/** Entrées précédente et suivante dans une liste déjà triée. */
export function getNeighbours<T extends { id: string }>(list: T[], entry: T): { prev?: T; next?: T } {
  const index = list.findIndex((e) => e.id === entry.id);
  return { prev: list[index - 1], next: list[index + 1] };
}

/** Langues dans lesquelles une entrée existe (elle-même comprise). */
export async function getAvailableLangs(collection: Collection, translationKey: string): Promise<Lang[]> {
  const entries = await getCollection(
    collection,
    (e) => isPublished(e) && e.data.translationKey === translationKey,
  );
  return [...new Set(entries.map((e) => e.data.lang as Lang))];
}

/** Traduction d'une entrée dans une autre langue (même translationKey), si elle existe. */
export async function getTranslation<C extends Collection>(
  collection: C,
  entry: CollectionEntry<C>,
  target: Lang,
): Promise<CollectionEntry<C> | undefined> {
  const entries = await getEntries(collection, target);
  return entries.find((e) => e.data.translationKey === entry.data.translationKey);
}
