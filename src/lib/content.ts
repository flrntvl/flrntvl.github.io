/*
 * Accès au contenu : brouillons masqués en production, filtrage par langue, tri.
 */
import { getCollection, type CollectionEntry } from 'astro:content';
import type { Lang } from '../i18n/ui';

type Collection = 'articles' | 'projects' | 'cheatsheets';

/** Les brouillons sont visibles en dev, jamais publiés. */
const isPublished = (entry: { data: { draft: boolean } }) => import.meta.env.DEV || !entry.data.draft;

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

/** Cheatsheets d'une langue, par commande. */
export async function getCheatsheets(lang: Lang): Promise<CollectionEntry<'cheatsheets'>[]> {
  const entries = await getEntries('cheatsheets', lang);
  return entries.sort((a, b) => a.data.title.localeCompare(b.data.title, lang));
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
