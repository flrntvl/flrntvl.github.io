/*
 * Cheatsheets: "copy" button, commands with variables, table of contents that follows the reader.
 * Tested on the first published cheatsheet in each language.
 */
import type { Page } from '@playwright/test';

import { cheatsheets, expect, test } from './helpers';

const sheetFr = cheatsheets('fr')[0];
const sheetEn = cheatsheets('en')[0];

test.use({ permissions: ['clipboard-read', 'clipboard-write'] });

const clipboard = (page: Page) => page.evaluate(() => navigator.clipboard.readText());

test.describe('copy button', () => {
  test('copies the command without the "$" and confirms the copy', async ({ page }) => {
    await page.goto(sheetFr.path);
    // First shell command block without variables
    const block = page.locator('.cb:not([data-vars])').filter({ has: page.locator('.prompt') }).first();
    const button = block.locator('[data-copy]');
    await expect(button).toBeVisible();
    await expect(button).toHaveText('copier');

    const expected = (await block.locator('pre code').innerText()).replace(/^\$\s*/gm, '').trim();
    await button.click();
    await expect(button).toHaveText('copié ✓');
    expect((await clipboard(page)).trim()).toBe(expected);
    expect(await clipboard(page)).not.toMatch(/^\$/m);
    await expect(button).toHaveText('copier', { timeout: 3000 }); // returns to the initial label
  });

  test('English labels on an EN cheatsheet', async ({ page }) => {
    await page.goto(sheetEn.path);
    const button = page.locator('.cb [data-copy]').first();
    await expect(button).toHaveText('copy');
    await button.click();
    await expect(button).toHaveText('copied ✓');
  });
});

test.describe('commands with variables', () => {
  test('one field per variable; the command and the copied text follow the input', async ({ page }) => {
    await page.goto(sheetFr.path);
    const block = page.locator('.cb[data-vars]').first();
    const vars: { name: string }[] = JSON.parse((await block.getAttribute('data-vars'))!);
    const name = vars[0].name;

    const field = block.getByLabel(name);
    await expect(field).toBeVisible();
    const slot = block.locator(`.v[data-var="${name}"]`).first();
    await expect(slot).toHaveText(`<${name}>`);
    await expect(slot).toHaveClass(/empty/);

    await field.fill('42');
    await expect(slot).toHaveText('42');
    await expect(slot).not.toHaveClass(/empty/);

    await block.locator('[data-copy]').click();
    const copied = await clipboard(page);
    expect(copied).toContain('42');
    expect(copied).not.toContain(`<${name}>`);

    // Empty field: the variable placeholder comes back
    await field.fill('');
    await expect(slot).toHaveText(`<${name}>`);
  });
});

test.describe('"On this page" table of contents', () => {
  test('highlights the section being read', async ({ page }) => {
    await page.goto(sheetFr.path);
    const links = page.locator('.side .toc a[href^="#"]');
    const count = await links.count();
    expect(count).toBeGreaterThan(1);

    // Clicking an entry in the middle highlights it, and only it
    const middle = links.nth(Math.floor(count / 2));
    await middle.click();
    await expect(middle).toHaveAttribute('aria-current', 'location');
    await expect(page.locator('.side .toc a[aria-current="location"]')).toHaveCount(1);

    // At the bottom of the page, the last section is highlighted
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await expect(links.last()).toHaveAttribute('aria-current', 'location');

    // At the top of the page, before the first section, nothing is highlighted
    await page.evaluate(() => window.scrollTo(0, 0));
    await expect(page.locator('.side .toc a[aria-current="location"]')).toHaveCount(0);
  });
});
