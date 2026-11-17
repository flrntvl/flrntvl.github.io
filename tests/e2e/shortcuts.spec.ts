/*
 * Keyboard shortcuts: g then a letter (navigation), t (theme), ? (help).
 * They must never fire while the user is typing.
 */
import { cheatsheets, expect, test } from './helpers';

test.describe('keyboard shortcuts', () => {
  for (const [key, fr, en] of [
    ['a', '/articles/', '/en/articles/'],
    ['p', '/projets/', '/en/projects/'],
    ['c', '/cheatsheets/', '/en/cheatsheets/'],
    ['m', '/a-propos/', '/en/about/'],
  ] as const) {
    test(`g then ${key} leads to ${fr} (and ${en} in English)`, async ({ page }) => {
      await page.goto('/');
      await page.keyboard.press('g');
      await page.keyboard.press(key);
      await expect(page).toHaveURL(fr);

      await page.goto('/en/');
      await page.keyboard.press('g');
      await page.keyboard.press(key);
      await expect(page).toHaveURL(en);
    });
  }

  test('g then h goes back home', async ({ page }) => {
    await page.goto('/a-propos/');
    await page.keyboard.press('g');
    await page.keyboard.press('h');
    await expect(page).toHaveURL('/');
  });

  test('t toggles between light and dark', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/');
    const html = page.locator('html');
    await expect(html).toHaveAttribute('data-theme', 'light');
    await page.keyboard.press('t');
    await expect(html).toHaveAttribute('data-theme', 'dark');
    await page.keyboard.press('t');
    await expect(html).toHaveAttribute('data-theme', 'light');
  });

  test('? opens the shortcuts help, ? or Escape closes it', async ({ page }) => {
    await page.goto('/');
    const help = page.locator('[data-shortcuts-dialog]');
    await page.keyboard.press('?');
    await expect(help).toBeVisible();
    await page.keyboard.press('?');
    await expect(help).toBeHidden();
    await page.keyboard.press('?');
    await page.keyboard.press('Escape');
    await expect(help).toBeHidden();
  });

  test('the footer "Keyboard shortcuts" link opens the help', async ({ page }) => {
    await page.goto('/');
    await page.locator('[data-shortcuts-open]').first().click();
    await expect(page.locator('[data-shortcuts-dialog]')).toBeVisible();
    await page.locator('[data-shortcuts-close]').click();
    await expect(page.locator('[data-shortcuts-dialog]')).toBeHidden();
  });

  test('do not fire while typing in a field', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    // Cheatsheets with variables have input fields in the page.
    await page.goto(cheatsheets('fr')[0].path);
    const field = page.locator('.vars input').first();
    await field.click();
    await page.keyboard.type('gat?/');
    await expect(field).toHaveValue('gat?/');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    await expect(page).toHaveURL(cheatsheets('fr')[0].path);
    await expect(page.locator('[data-shortcuts-dialog]')).toBeHidden();
    await expect(page.locator('[data-search-dialog]')).toBeHidden();
  });

  test('do not fire while search is open', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('/');
    await page.keyboard.type('t');
    await expect(page.locator('[data-search-input]')).toHaveValue('t');
    await expect(page.locator('[data-shortcuts-dialog]')).toBeHidden();
  });
});
