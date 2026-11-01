/*
 * Flux RSS 2.0 des articles d'une langue, généré sans dépendance.
 * Endpoints : src/pages/rss.xml.ts (FR) et src/pages/en/rss.xml.ts (EN).
 */
import { rssPath } from '../config';
import type { Lang } from '../i18n/ui';
import { getPath, useTranslations } from '../i18n/utils';
import { getArticles, getEntryPath } from './content';

const escapeXml = (text: string) =>
  text.replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[c]!);

export async function rssResponse(lang: Lang, site: URL | undefined): Promise<Response> {
  if (!site) throw new Error('`site` doit être défini dans astro.config.mjs pour générer le flux RSS.');
  const t = useTranslations(lang);
  const articles = await getArticles(lang);
  const url = (path: string) => new URL(path, site).href;

  const items = articles
    .map((entry) => {
      const link = url(getEntryPath('articles', entry));
      return `    <item>
      <title>${escapeXml(entry.data.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${entry.data.date.toUTCString()}</pubDate>
      <description>${escapeXml(entry.data.description)}</description>
${entry.data.tags.map((tag) => `      <category>${escapeXml(tag)}</category>`).join('\n')}
    </item>`;
    })
    .join('\n');

  const lastBuild = articles[0]?.data.updated ?? articles[0]?.data.date ?? new Date();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(t('rss.title'))}</title>
    <link>${url(getPath('articles', lang))}</link>
    <description>${escapeXml(t('rss.description'))}</description>
    <language>${lang === 'fr' ? 'fr-FR' : 'en'}</language>
    <lastBuildDate>${lastBuild.toUTCString()}</lastBuildDate>
    <atom:link href="${url(rssPath[lang])}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;

  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
}
