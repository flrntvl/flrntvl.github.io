/*
 * Sitemap XML du site, généré sans dépendance.
 * Endpoint : src/pages/sitemap.xml.ts (annoncé dans robots.txt).
 *
 * Contient les sections et les contenus publiés des deux langues, avec leurs
 * équivalents hreflang. Les pages « disponible seulement en … » et la 404 n'y
 * figurent pas : elles sont en noindex.
 */
import type { CollectionEntry } from 'astro:content';
import { defaultLang, languages, routes, type Lang } from '../i18n/ui';
import { getArticles, getCheatsheets, getEntryPath, getProjects, type Collection } from './content';

/** Une page et ses versions par langue (chemins relatifs à la racine du site). */
interface Page {
  versions: Partial<Record<Lang, string>>;
  lastmod?: Partial<Record<Lang, Date>>;
}

const langs = Object.keys(languages) as Lang[];

const escapeXml = (text: string) =>
  text.replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[c]!);

/** Date de dernière modification d'une entrée, si le contenu en fournit une. */
function lastmodOf(collection: Collection, entry: CollectionEntry<Collection>): Date | undefined {
  if (collection === 'articles') {
    const { date, updated } = (entry as CollectionEntry<'articles'>).data;
    return updated ?? date;
  }
  if (collection === 'cheatsheets') return (entry as CollectionEntry<'cheatsheets'>).data.verifiedAt;
  return undefined;
}

/** Contenus d'une collection, regroupés par traduction (même translationKey). */
async function contentPages(
  collection: Collection,
  list: (lang: Lang) => Promise<CollectionEntry<Collection>[]>,
): Promise<Page[]> {
  const pages = new Map<string, Page>();
  for (const lang of langs) {
    for (const entry of await list(lang)) {
      const page = pages.get(entry.data.translationKey) ?? { versions: {}, lastmod: {} };
      page.versions[lang] = getEntryPath(collection, entry);
      page.lastmod![lang] = lastmodOf(collection, entry);
      pages.set(entry.data.translationKey, page);
    }
  }
  return [...pages.values()];
}

export async function sitemapResponse(site: URL | undefined): Promise<Response> {
  if (!site) throw new Error('`site` doit être défini dans astro.config.mjs pour générer le sitemap.');
  const url = (path: string) => escapeXml(new URL(path, site).href);

  const pages: Page[] = [
    // Sections : traduites dans toutes les langues.
    ...Object.values(routes).map((paths) => ({ versions: { ...paths } })),
    ...(await contentPages('articles', getArticles)),
    ...(await contentPages('projects', getProjects)),
    ...(await contentPages('cheatsheets', getCheatsheets)),
  ];

  const entries = pages.flatMap(({ versions, lastmod }) => {
    const available = langs.filter((lang) => versions[lang]);
    // hreflang seulement quand la page existe dans plusieurs langues.
    const alternates =
      available.length > 1
        ? [
            ...available.map(
              (lang) => `    <xhtml:link rel="alternate" hreflang="${lang}" href="${url(versions[lang]!)}" />`,
            ),
            `    <xhtml:link rel="alternate" hreflang="x-default" href="${url(versions[defaultLang] ?? versions[available[0]]!)}" />`,
          ]
        : [];

    return available.map((lang) => {
      const date = lastmod?.[lang];
      return [
        '  <url>',
        `    <loc>${url(versions[lang]!)}</loc>`,
        ...(date ? [`    <lastmod>${date.toISOString().slice(0, 10)}</lastmod>`] : []),
        ...alternates,
        '  </url>',
      ].join('\n');
    });
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries.join('\n')}
</urlset>
`;

  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}
