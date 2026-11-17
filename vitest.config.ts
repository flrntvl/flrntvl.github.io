import { defineConfig } from 'vitest/config';

// Unit tests only (tests/unit); browser tests (tests/e2e) run with Playwright.
export default defineConfig({
  test: {
    include: ['tests/unit/**/*.test.ts'],
  },
});
