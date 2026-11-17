/*
 * Search palette: opening / closing, Pagefind results, keyboard navigation,
 * filters, command mode, and results in the page's language.
 */
import type { Page } from '@playwright/test';

import { cheatsheets, expect, keyword, test, titleOf, ui } from './helpers';

const dialog = (page: Page) => page.locator('[data-search-dialog]');
const input = (page: Page) => page.locator('[data-search-input]');
const options = (page: Page) => page.locator('[data-search-results] [role="option"]');

const sheetFr = cheatsheets('fr')[0];
const sheetEn = cheatsheets('en')[0];

async function search(page: Page, query: string) {
  await page.locator('header [data-search-open]').first().click();
  await expect(dialog(page)).toHaveAttribute('open', '');
  await input(page).fill(query);
}

test.describe('opening and closing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('opens with the header button and focuses the input', async ({ page }) => {
    await page.locator('header [data-search-open]').first().click();
    await expect(dialog(page)).toBeVisible();
    await expect(input(page)).toBeFocused();
    await expect(page.locator('[data-search-results]')).toHaveText(ui.fr['search.start']);
  });

  test('opens with Ctrl K and closes with Ctrl K', async ({ page }) => {
    await page.keyboard.press('Control+k');
    await expect(dialog(page)).toBeVisible();
    await page.keyboard.press('Control+k');
    await expect(dialog(page)).toBeHidden();
  });

  test('opens with ⌘K (Mac)', async ({ page }) => {
    await page.keyboard.press('Meta+k');
    await expect(dialog(page)).toBeVisible();
  });

  test('opens with "/"', async ({ page }) => {
    await page.keyboard.press('/');
    await expect(dialog(page)).toBeVisible();
    await expect(input(page)).toHaveValue('');
  });

  test('closes with Escape, even with text typed in', async ({ page }) => {
    await page.keyboard.press('/');
    await input(page).fill('test');
    await page.keyboard.press('Escape');
    await expect(dialog(page)).toBeHidden();
  });

  test('closes with the Cancel button', async ({ page }) => {
    await page.keyboard.press('/');
    await page.locator('[data-search-close]').click();
    await expect(dialog(page)).toBeHidden();
  });

  test('closes when clicking the backdrop', async ({ page }) => {
    await page.keyboard.press('/');
    await page.mouse.click(10, 10);
    await expect(dialog(page)).toBeHidden();
  });

  test('returns focus to the button that opened it', async ({ page }) => {
    const button = page.locator('header [data-search-open]').first();
    await button.click();
    await page.keyboard.press('Escape');
    await expect(button).toBeFocused();
  });
});

test.describe('results', () => {
  test('finds a published cheatsheet from a word in its title', async ({ page }) => {
    const title = titleOf(sheetFr.path);
    await page.goto('/');
    await search(page, keyword(title));

    const result = options(page).filter({ hasText: title });
    await expect(result).toHaveCount(1);
    await expect(result).toHaveAttribute('href', sheetFr.path);
    await expect(page.locator('[data-search-count]')).toHaveText(/\d+ résultats?/);
  });

  test('shows a message when nothing matches', async ({ page }) => {
    await page.goto('/');
    await search(page, 'zzqxwvkj');
    await expect(page.locator('[data-search-results]')).toContainText('Aucun résultat');
    await expect(options(page)).toHaveCount(0);
  });

  test('↵ opens the selected result', async ({ page }) => {
    await page.goto('/');
    await search(page, keyword(titleOf(sheetFr.path)));
    await expect(options(page).first()).toHaveAttribute('aria-selected', 'true');
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(sheetFr.path);
  });

  test('↑ ↓ move the selection', async ({ page }) => {
    await page.goto('/');
    await search(page, '>go'); // command list: always several items
    const items = options(page);
    await expect(items.nth(0)).toHaveAttribute('aria-selected', 'true');
    await page.keyboard.press('ArrowDown');
    await expect(items.nth(1)).toHaveAttribute('aria-selected', 'true');
    await expect(items.nth(0)).toHaveAttribute('aria-selected', 'false');
    await page.keyboard.press('ArrowUp');
    await page.keyboard.press('ArrowUp'); // going up past the first one wraps around to the last
    await expect(items.last()).toHaveAttribute('aria-selected', 'true');
    await expect(input(page)).toHaveAttribute('aria-activedescendant', (await items.last().getAttribute('id'))!);
  });

  test('filters keep only the chosen type', async ({ page }) => {
    await page.goto('/');
    await search(page, keyword(titleOf(sheetFr.path)));
    await expect(options(page).first()).toBeVisible();

    const chips = page.locator('[data-search-toolbar] [data-type]');
    for (const [type, section] of [
      ['cheatsheet', '/cheatsheets/'],
      ['article', '/articles/'],
      ['project', '/projets/'],
    ] as const) {
      await chips.and(page.locator(`[data-type="${type}"]`)).click();
      await expect(chips.and(page.locator(`[data-type="${type}"]`))).toHaveAttribute('aria-pressed', 'true');
      await expect(chips.and(page.locator('[data-type=""]'))).toHaveAttribute('aria-pressed', 'false');
      await page.waitForTimeout(300); // search runs again (120 ms debounce)
      for (const href of await options(page).evaluateAll((els) => els.map((el) => el.getAttribute('href')))) {
        expect(href, `filter ${type}`).toContain(section);
      }
    }

    await chips.and(page.locator('[data-type="cheatsheet"]')).click();
    await expect(options(page).filter({ hasText: titleOf(sheetFr.path) })).toHaveCount(1);
    await expect(input(page)).toBeFocused();
  });

  test('only suggests content in the page language', async ({ page }) => {
    // On a FR page, searching for a word from the EN title: no EN result
    await page.goto('/');
    await search(page, keyword(titleOf(sheetEn.path)));
    await page.waitForTimeout(500);
    for (const href of await options(page).evaluateAll((els) => els.map((el) => el.getAttribute('href')))) {
      expect(href).not.toMatch(/^\/en\//);
    }

    // On an EN page, the EN cheatsheet is found, and nothing in FR
    await page.goto('/en/');
    await search(page, keyword(titleOf(sheetEn.path)));
    await expect(options(page).filter({ hasText: titleOf(sheetEn.path) })).toHaveAttribute('href', sheetEn.path);
    for (const href of await options(page).evaluateAll((els) => els.map((el) => el.getAttribute('href')))) {
      expect(href).toMatch(/^\/en\//);
    }
  });
});

test.describe('command mode (>)', () => {
  test('>theme dark switches to dark and closes search', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/');
    await search(page, '>theme dark');
    await expect(options(page)).toHaveCount(1);
    await page.keyboard.press('Enter');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await expect(dialog(page)).toBeHidden();
  });

  test('the active theme command is marked as active', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('theme', 'light'));
    await page.goto('/');
    await search(page, '>theme');
    await expect(options(page).filter({ hasText: 'theme light' })).toContainText(ui.fr['search.active']);
    await expect(options(page).filter({ hasText: 'theme dark' })).not.toContainText(ui.fr['search.active']);
  });

  test('>go articles leads to the article list', async ({ page }) => {
    await page.goto('/');
    await search(page, '>go articles');
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL('/articles/');
  });

  test('>go projets (FR) and >go projects (EN) lead to the projects', async ({ page }) => {
    await page.goto('/');
    await search(page, '>go projets');
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL('/projets/');

    await page.goto('/en/');
    await search(page, '>go projects');
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL('/en/projects/');
  });

  test('>lang en leads to the translation of the current page', async ({ page }) => {
    await page.goto(sheetFr.path);
    await search(page, '>lang en');
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(sheetFr.alternates.en!);
  });

  test('clicking a command runs it', async ({ page }) => {
    await page.goto('/');
    await search(page, '>go cheatsheets');
    await options(page).first().click();
    await expect(page).toHaveURL('/cheatsheets/');
  });

  test('an unknown command shows a help message', async ({ page }) => {
    await page.goto('/');
    await search(page, '>foobar');
    await expect(page.locator('[data-search-results]')).toHaveText(ui.fr['search.commandUnknown']);
    await expect(page.locator('[data-search-toolbar]')).toBeHidden();
  });
});
