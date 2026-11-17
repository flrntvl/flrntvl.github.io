/*
 * Phone screen: the header shrinks to a search icon and a full-screen ☰ menu
 * (navigation, theme, language).
 */
import { cheatsheets, expect, test, ui } from './helpers';

test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

const menu = (page: import('@playwright/test').Page) => page.locator('[data-mobile-menu]');

test.describe('mobile menu', () => {
  test('the header navigation is replaced by the menu button', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('header .nav')).toBeHidden();
    await expect(page.locator('[data-menu-open]')).toBeVisible();
    await expect(menu(page)).toBeHidden();
  });

  test('opens, contains the navigation and closes with ✕', async ({ page }) => {
    await page.goto('/');
    const open = page.locator('[data-menu-open]');
    await open.click();
    await expect(menu(page)).toBeVisible();
    await expect(open).toHaveAttribute('aria-expanded', 'true');

    const links = menu(page).locator('.mnav a');
    await expect(links).toHaveCount(4);
    for (const label of ['nav.articles', 'nav.projects', 'nav.cheatsheets', 'nav.about'] as const) {
      await expect(links.filter({ hasText: ui.fr[label] })).toBeVisible();
    }

    await menu(page).locator('[data-menu-close]').click();
    await expect(menu(page)).toBeHidden();
    await expect(open).toHaveAttribute('aria-expanded', 'false');
  });

  test('closes with Escape', async ({ page }) => {
    await page.goto('/');
    await page.locator('[data-menu-open]').click();
    await page.keyboard.press('Escape');
    await expect(menu(page)).toBeHidden();
  });

  test('a menu link leads to its section', async ({ page }) => {
    await page.goto('/');
    await page.locator('[data-menu-open]').click();
    await menu(page).locator('.mnav a').filter({ hasText: ui.fr['nav.cheatsheets'] }).click();
    await expect(page).toHaveURL('/cheatsheets/');
  });

  test('the menu theme setting applies and stays in sync', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/');
    await page.locator('[data-menu-open]').click();
    const dark = menu(page).locator('[data-theme-pref="dark"]');
    await dark.click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await expect(dark).toHaveAttribute('aria-pressed', 'true');
    // The matching button in the (desktop) header menu reflects the same state
    await expect(page.locator('[data-appearance-panel] [data-theme-pref="dark"]')).toHaveAttribute('aria-pressed', 'true');
  });

  test('the language switcher leads to the page translation', async ({ page }) => {
    const sheet = cheatsheets('fr')[0];
    await page.goto(sheet.path);
    await page.locator('[data-menu-open]').click();
    await menu(page).getByRole('link', { name: 'English' }).click();
    await expect(page).toHaveURL(sheet.alternates.en!);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  });

  test('the search icon opens search', async ({ page }) => {
    await page.goto('/');
    await page.locator('.mobile-tools [data-search-open]').click();
    await expect(page.locator('[data-search-dialog]')).toBeVisible();
  });
});
