/*
 * Every published page (read from the sitemap) loads without errors and in the right language,
 * and the 404 page is served for an unknown address.
 */
import { expect, sitemap, test, ui } from './helpers';

test.describe('published pages', () => {
  for (const { path, lang } of sitemap()) {
    test(`${path} loads without errors`, async ({ page }) => {
      const response = await page.goto(path);
      expect(response?.status()).toBe(200);
      await page.waitForLoadState('networkidle');

      await expect(page.locator('html')).toHaveAttribute('lang', lang);
      await expect(page.locator('h1').first()).toBeVisible();
      await expect(page).toHaveTitle(new RegExp(ui[lang]['site.name']));
      // Interface in the page's language
      await expect(page.locator('header nav').first()).toHaveAttribute('aria-label', ui[lang]['nav.label']);
    });
  }
});

test.describe('404 page', () => {
  test.use({ allowedStatuses: [404] });

  test('an unknown address shows the "not found" page', async ({ page }) => {
    const response = await page.goto('/cette-page-n-existe-pas/');
    expect(response?.status()).toBe(404);
    await expect(page.locator('h1')).toHaveText(ui.fr['notFound.title']);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');

    await page.getByRole('link', { name: ui.fr['notFound.back'] }).click();
    await expect(page).toHaveURL('/');
  });
});

test('RSS feeds, sitemap and robots.txt are served', async ({ request }) => {
  for (const path of ['/rss.xml', '/en/rss.xml', '/sitemap.xml', '/robots.txt']) {
    const response = await request.get(path);
    expect(response.status(), path).toBe(200);
  }
});
