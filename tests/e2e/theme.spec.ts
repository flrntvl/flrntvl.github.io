/*
 * Light / dark theme: header menu, persistence, "Device" mode,
 * and theme applied before the first paint (no flash).
 */
import { expect, test } from './helpers';

const html = (page: import('@playwright/test').Page) => page.locator('html');

test.describe('theme', () => {
  test('follows the device theme by default (light)', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/');
    await expect(html(page)).toHaveAttribute('data-theme', 'light');
  });

  test('follows the device theme by default (dark)', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/');
    await expect(html(page)).toHaveAttribute('data-theme', 'dark');
  });

  test('the Theme menu applies the choice, saves it and keeps it after a reload', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/');

    const trigger = page.locator('[data-appearance-trigger]');
    const panel = page.locator('[data-appearance-panel]');
    await expect(panel).toBeHidden();
    await trigger.click();
    await expect(panel).toBeVisible();
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');

    await panel.locator('[data-theme-pref="dark"]').click();
    await expect(html(page)).toHaveAttribute('data-theme', 'dark');
    await expect(panel).toBeHidden(); // picking an option closes the menu
    expect(await page.evaluate(() => localStorage.getItem('theme'))).toBe('dark');

    await page.reload();
    await expect(html(page)).toHaveAttribute('data-theme', 'dark');
    await trigger.click();
    await expect(panel.locator('[data-theme-pref="dark"]')).toHaveAttribute('aria-pressed', 'true');
    await expect(panel.locator('[data-theme-pref="light"]')).toHaveAttribute('aria-pressed', 'false');

    // The choice applies to other pages too
    await page.goto('/en/');
    await expect(html(page)).toHaveAttribute('data-theme', 'dark');
  });

  test('Escape closes the Theme menu and returns focus to the button', async ({ page }) => {
    await page.goto('/');
    const trigger = page.locator('[data-appearance-trigger]');
    await trigger.click();
    await page.keyboard.press('Escape');
    await expect(page.locator('[data-appearance-panel]')).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test('in "Device" mode, follows device theme changes live', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/');
    await page.locator('[data-appearance-trigger]').click();
    await page.locator('[data-appearance-panel] [data-theme-pref="auto"]').click();
    await expect(html(page)).toHaveAttribute('data-theme', 'light');

    await page.emulateMedia({ colorScheme: 'dark' });
    await expect(html(page)).toHaveAttribute('data-theme', 'dark');
    await page.emulateMedia({ colorScheme: 'light' });
    await expect(html(page)).toHaveAttribute('data-theme', 'light');
  });

  test('a forced choice (light) ignores the device theme', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.addInitScript(() => localStorage.setItem('theme', 'light'));
    await page.goto('/');
    await expect(html(page)).toHaveAttribute('data-theme', 'light');
  });

  test('no flash: the saved theme is applied before the page is rendered', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    // Records data-theme as soon as <body> appears, before any content is rendered.
    await page.addInitScript(() => {
      localStorage.setItem('theme', 'dark');
      const observer = new MutationObserver(() => {
        if (document.body) {
          (window as unknown as { themeAtBody: string }).themeAtBody = document.documentElement.dataset.theme ?? '';
          observer.disconnect();
        }
      });
      observer.observe(document, { childList: true, subtree: true });
    });
    await page.goto('/');
    expect(await page.evaluate(() => (window as unknown as { themeAtBody: string }).themeAtBody)).toBe('dark');
  });
});
