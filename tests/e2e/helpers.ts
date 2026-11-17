/*
 * Shared helpers for the browser tests.
 *
 * Tests rely on the content actually published, read from dist/ (sitemap, titles):
 * they keep up with new content without being rewritten.
 */
import { readFileSync } from 'node:fs';
import { test as base, expect } from '@playwright/test';

import { ui, type Lang } from '../../src/i18n/ui';

export { expect, ui, type Lang };

const SITE = 'https://flrntvl.dev';

export interface SitemapEntry {
  /** Page path: /cheatsheets/effacer-historique-terminal/ */
  path: string;
  lang: Lang;
  /** Declared counterpart pages (hreflang), by language: { fr: '/…', en: '/en/…' } */
  alternates: Partial<Record<Lang, string>>;
}

const toPath = (url: string) => (url.startsWith(SITE) ? url.slice(SITE.length) || '/' : url);

/** Language of a path: /en/… → en, otherwise fr. */
export const langOf = (path: string): Lang => (path === '/en/' || path.startsWith('/en/') ? 'en' : 'fr');

/** All published pages, from dist/sitemap.xml. */
export function sitemap(): SitemapEntry[] {
  const xml = readFileSync('dist/sitemap.xml', 'utf8');
  return [...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)].map(([, block]) => {
    const path = toPath(block.match(/<loc>([^<]*)<\/loc>/)![1]);
    const alternates: Partial<Record<Lang, string>> = {};
    for (const [, hreflang, href] of block.matchAll(/hreflang="(fr|en)" href="([^"]*)"/g)) {
      alternates[hreflang as Lang] = toPath(href);
    }
    return { path, lang: langOf(path), alternates };
  });
}

/** Cheatsheet pages published in a given language. */
export function cheatsheets(lang: Lang): SitemapEntry[] {
  const prefix = lang === 'en' ? '/en/cheatsheets/' : '/cheatsheets/';
  return sitemap().filter((e) => e.path.startsWith(prefix) && e.path !== prefix);
}

/** Title (h1) of a built page, read from dist/. */
export function titleOf(path: string): string {
  const html = readFileSync(`dist${path}index.html`, 'utf8');
  const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)![1];
  return h1.replace(/<[^>]+>/g, '').trim();
}

/** A distinctive word from a title (the longest one), for a search that must find it. */
export function keyword(title: string): string {
  return title
    .split(/[^\p{L}\p{N}]+/u)
    .sort((a, b) => b.length - a.length)[0];
}

/**
 * Base test: fails if the page throws a JavaScript error, logs an error to the console,
 * or requests a site resource that does not exist (CSS, script, font, image…).
 * Tests that deliberately visit a missing page declare it with
 * test.use({ allowedStatuses: [404] }).
 */
export const test = base.extend<{ allowedStatuses: number[]; pageErrors: string[] }>({
  allowedStatuses: [[], { option: true }],
  pageErrors: [
    async ({ page, baseURL, allowedStatuses }, use) => {
      const errors: string[] = [];
      page.on('pageerror', (error) => errors.push(`JavaScript error: ${error.message}`));
      page.on('console', (message) => {
        if (message.type() !== 'error') return;
        // The browser also logs expected 404 responses to the console: already filtered below.
        if (/status of 404/.test(message.text()) && allowedStatuses.includes(404)) return;
        errors.push(`Console: ${message.text()}`);
      });
      page.on('response', (response) => {
        const url = response.url();
        if (!baseURL || !url.startsWith(baseURL)) return;
        const status = response.status();
        if (status >= 400 && !allowedStatuses.includes(status)) errors.push(`HTTP ${status}: ${url}`);
      });
      page.on('requestfailed', (request) => {
        const url = request.url();
        // Navigation interrupted by another one (link click): not a site error.
        if (request.failure()?.errorText.includes('ERR_ABORTED')) return;
        if (baseURL && url.startsWith(baseURL)) errors.push(`Request failed: ${url}`);
      });
      await use(errors);
      expect(errors, 'errors caught during the test').toEqual([]);
    },
    { auto: true },
  ],
});
