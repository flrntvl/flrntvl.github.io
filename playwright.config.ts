import { defineConfig, devices } from '@playwright/test';

/*
 * Browser tests: they run against the built site (dist/), served by "astro preview".
 * Run "npm run build" first, then "npm run test:e2e".
 *
 * PW_CHROMIUM_PATH: path to an already installed Chromium, when Playwright's own is not
 * installed (unusual local setup). In CI, Playwright installs its own Chromium.
 */
const PORT = 4322;

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI, // a forgotten test.only fails CI
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    locale: 'fr-FR',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // Above 1080 px: full header (the mobile menu takes over below that).
        viewport: { width: 1280, height: 800 },
        launchOptions: process.env.PW_CHROMIUM_PATH ? { executablePath: process.env.PW_CHROMIUM_PATH } : {},
      },
    },
  ],
  webServer: {
    // --ignore-lock: one-off foreground server, stopped by Playwright when the tests end.
    // Without it, Astro moves to the background when it detects an AI agent (Claude Code…),
    // and Playwright thinks the server has stopped.
    command: `npx astro preview --port ${PORT} --ignore-lock`,
    url: `http://localhost:${PORT}/`,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
