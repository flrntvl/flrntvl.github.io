/*
 * Language switching: every translated page leads to its counterpart (header, "read in …"
 * link), the round trip comes back to the starting page, and hreflang / canonical tags
 * match the sitemap.
 */
import { expect, sitemap, test, ui, type Lang } from './helpers';

const SITE = 'https://flrntvl.dev';
const other = (lang: Lang): Lang => (lang === 'fr' ? 'en' : 'fr');

const translated = sitemap().filter((e) => e.alternates.fr && e.alternates.en);

test.describe('header language switcher', () => {
  for (const { path, lang, alternates } of translated) {
    const target = alternates[other(lang)]!;

    test(`${path} ⇄ ${target}`, async ({ page }) => {
      await page.goto(path);
      const header = page.locator('header .langs');
      await expect(header.locator('[aria-current="page"]')).toHaveText(lang.toUpperCase());

      await header.locator(`a[hreflang="${other(lang)}"]`).click();
      await expect(page).toHaveURL(target);
      await expect(page.locator('html')).toHaveAttribute('lang', other(lang));
      // Translated interface: navigation and search in the new language
      await expect(page.locator('header nav').first()).toHaveAttribute('aria-label', ui[other(lang)]['nav.label']);
      await expect(page.locator('header .search-label')).toHaveText(ui[other(lang)]['search.open']);

      // Round trip
      await page.locator('header .langs').locator(`a[hreflang="${lang}"]`).click();
      await expect(page).toHaveURL(path);
      await expect(page.locator('html')).toHaveAttribute('lang', lang);
    });
  }
});

test.describe('hreflang and canonical tags', () => {
  for (const { path, alternates } of sitemap()) {
    test(`${path} declares the right canonical URL and translations`, async ({ page }) => {
      await page.goto(path);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', SITE + path);

      for (const lang of ['fr', 'en'] as const) {
        const link = page.locator(`link[rel="alternate"][hreflang="${lang}"]`);
        if (alternates[lang]) await expect(link).toHaveAttribute('href', SITE + alternates[lang]);
        else await expect(link).toHaveCount(0);
      }
      if (alternates.fr) {
        await expect(page.locator('link[rel="alternate"][hreflang="x-default"]')).toHaveAttribute('href', SITE + alternates.fr);
      }
    });
  }

  test('translations point to each other (A → B and B → A)', () => {
    const byPath = new Map(sitemap().map((e) => [e.path, e]));
    for (const entry of translated) {
      const target = byPath.get(entry.alternates[other(entry.lang)]!);
      expect(target, `${entry.path}: translation missing from the sitemap`).toBeDefined();
      expect(target!.alternates[entry.lang], `${target!.path} does not point back to ${entry.path}`).toBe(entry.path);
    }
  });
});

test.describe('"read in …" link on content pages', () => {
  const contents = translated.filter((e) => /\/(articles|projets|projects|cheatsheets)\/[^/]+\/$/.test(e.path));

  for (const { path, lang, alternates } of contents) {
    test(`${path} → ${alternates[other(lang)]}`, async ({ page }) => {
      await page.goto(path);
      await page.locator(`main a[hreflang="${other(lang)}"]`).first().click();
      await expect(page).toHaveURL(alternates[other(lang)]!);
      await expect(page.locator('html')).toHaveAttribute('lang', other(lang));
    });
  }
});
