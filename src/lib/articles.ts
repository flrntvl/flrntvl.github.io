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

function tzFromOffset(iso: string): string | undefined {
	// git %cI keeps the author's offset (e.g. `2026-08-06T22:20:04+02:00`), but the
	// Date object drops it. Resolve it back to a fixed IANA zone so the article
	// shows the time at the moment of commit, not the build machine's zone.
	const match = iso.match(/([+-])(\d{2}):(\d{2})$/);
	if (!match) {
		return undefined;
	}
	const offsetHours = (match[1] === '+' ? 1 : -1) * (Number(match[2]) + Number(match[3]) / 60);
	if (!Number.isInteger(offsetHours)) {
		return undefined;
	}
	// IANA's Etc/GMT zone signs are inverted relative to an ISO offset:
	// +02:00 becomes Etc/GMT-2.
	return offsetHours === 0 ? 'UTC' : `Etc/GMT${offsetHours < 0 ? '+' : '-'}${Math.abs(offsetHours)}`;
}

export function formatCommitDateTime(iso: string | null | undefined, lang: Lang): string | null {
	if (!iso) {
		return null;
	}
	const options: Intl.DateTimeFormatOptions = {
		day: 'numeric',
		month: 'long',
		year: 'numeric',
		hour: 'numeric',
		minute: '2-digit',
	};
	const tz = tzFromOffset(iso);
	if (tz) {
		options.timeZone = tz;
		options.timeZoneName = 'short';
	}
	return new Intl.DateTimeFormat(lang === 'fr' ? 'fr-FR' : 'en-US', options).format(new Date(iso));
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

export async function publishedAt(entry: Article): Promise<string> {
	const { remarkPluginFrontmatter } = await render(entry);
	const published = remarkPluginFrontmatter.published as string | undefined;

	return published ?? entry.data.date.toISOString();
}

export async function lastModifiedDate(entry: Article): Promise<string | null> {
	const { remarkPluginFrontmatter } = await render(entry);
	const raw = remarkPluginFrontmatter.lastModified as string | undefined;

	if (!raw) {
		return null;
	}

	const published = await publishedAt(entry);

	// A single commit produces the same committer time for both, so only show a
	// modification when the file was touched again after it was first committed.
	return new Date(raw).getTime() === new Date(published).getTime() ? null : raw;
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
		modifiedTooltip: modified ? LABELS[lang].modifiedLabel(formatCommitDateTime(modified, lang) ?? '') : null,
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

// Returns null when no translation exists — translationHref's home-page fallback
// would advertise the wrong URL to crawlers (hreflang, og alternates).
export async function translationHrefExact(entry: Article, targetLang: Lang): Promise<string | null> {
	const all = await getCollection('articles');

	const translation = all.find(
		(candidate) =>
			langOf(candidate) === targetLang && candidate.data.translationKey === entry.data.translationKey,
	);

	return translation ? getRelativeLocaleUrl(targetLang, `blog/${slugOf(translation)}`) : null;
}
