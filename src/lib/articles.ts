import { getCollection, render, type CollectionEntry } from 'astro:content';
import { getRelativeLocaleUrl } from 'astro:i18n';
import { LABELS, type Lang } from '@/lib/site-content';

export type Article = CollectionEntry<'articles'>;

export function langOf(entry: Article): Lang {
	return entry.id.startsWith('fr/') ? 'fr' : 'en';
}

export function slugOf(entry: Article): string {
	return entry.id.slice(langOf(entry).length + 1);
}

export function articlesIn(lang: Lang) {
	return getCollection('articles', (entry) => langOf(entry) === lang);
}

export async function articlesSortedByDate(lang: Lang) {
	const entries = await articlesIn(lang);
	return entries.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export async function latestArticles(lang: Lang, count: number) {
	return (await articlesSortedByDate(lang)).slice(0, count);
}

export function formatDate(date: Date, lang: Lang) {
	return new Intl.DateTimeFormat(lang === 'fr' ? 'fr-FR' : 'en-US', {
		day: 'numeric',
		month: 'long',
		year: 'numeric',
	}).format(date);
}

export function formatDateCompact(date: Date, lang: Lang) {
	const day = String(date.getUTCDate()).padStart(2, '0');
	const month = String(date.getUTCMonth() + 1).padStart(2, '0');
	const year = date.getUTCFullYear();

	return lang === 'fr' ? `${day}.${month}.${year}` : `${month}.${day}.${year}`;
}

export async function readingTime(entry: Article, lang: Lang) {
	const { remarkPluginFrontmatter } = await render(entry);
	return LABELS[lang].readingTime(remarkPluginFrontmatter.readingMinutes as number);
}

function isSameDay(a: Date, b: Date) {
	return a.toISOString().slice(0, 10) === b.toISOString().slice(0, 10);
}

export async function lastModifiedDate(entry: Article): Promise<Date | null> {
	const { remarkPluginFrontmatter } = await render(entry);
	const raw = remarkPluginFrontmatter.lastModified as string | undefined;

	if (!raw) {
		return null;
	}

	const modified = new Date(raw);

	return isSameDay(modified, entry.data.date) ? null : modified;
}

export type PostSummary = {
	slug: string;
	href: string;
	title: string;
	date: string;
	tag: string;
	readingTime: string;
	modifiedTooltip: string | null;
};

export async function summarize(entry: Article): Promise<PostSummary> {
	const lang = langOf(entry);
	const slug = slugOf(entry);
	const modified = await lastModifiedDate(entry);

	return {
		slug,
		href: getRelativeLocaleUrl(lang, `blog/${slug}`),
		title: entry.data.title,
		date: formatDateCompact(entry.data.date, lang),
		tag: entry.data.tags[0] ?? '',
		readingTime: await readingTime(entry, lang),
		modifiedTooltip: modified ? LABELS[lang].modifiedLabel(formatDate(modified, lang)) : null,
	};
}

export async function translationHref(entry: Article, targetLang: Lang) {
	const all = await getCollection('articles');

	const translation = all.find(
		(candidate) =>
			langOf(candidate) === targetLang && candidate.data.translationKey === entry.data.translationKey,
	);

	return translation
		? getRelativeLocaleUrl(targetLang, `blog/${slugOf(translation)}`)
		: getRelativeLocaleUrl(targetLang);
}
