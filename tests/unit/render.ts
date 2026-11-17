/*
 * Markdown → HTML rendering with Sätteri, as in the site build (GFM and smart punctuation
 * enabled), to test the site's hast plugins without running Astro.
 */
import { markdownToHtml } from 'satteri';

type Lang = 'fr' | 'en';

export function render(markdown: string, lang: Lang, hastPlugins: unknown[]): string {
  const { html } = markdownToHtml(markdown, {
    hastPlugins: hastPlugins as never,
    features: { gfm: true, smartPunctuation: true },
    // The language is inferred from the content file path (…/fr/… or …/en/…).
    fileURL: new URL(`file:///site/src/content/articles/${lang}/test.md`),
  });
  return html;
}

export const NBSP = ' ';
