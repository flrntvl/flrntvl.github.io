import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getRelativeLocaleUrl } from 'astro:i18n';
import { articlesSortedByDate, slugOf } from '@/lib/articles';
import { LABELS, type Lang } from '@/lib/site-content';

export async function feedFor(context: APIContext, lang: Lang) {
	const labels = LABELS[lang];
	const articles = await articlesSortedByDate(lang);

	return rss({
		title: labels.meta.title,
		description: labels.meta.description,
		site: context.site ?? new URL(context.url.origin),
		items: articles.map((article) => ({
			title: article.data.title,
			description: article.data.standfirst,
			pubDate: article.data.date,
			link: getRelativeLocaleUrl(lang, `blog/${slugOf(article)}`),
		})),
		customData: `<language>${lang}</language>`,
	});
}
