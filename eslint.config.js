// @ts-check

import js from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import prettier from 'eslint-config-prettier';
import astro from 'eslint-plugin-astro';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig(
	globalIgnores(['dist/', '.astro/']),
	js.configs.recommended,
	tseslint.configs.recommended,
	astro.configs['flat/recommended'],
	{
		// Static site, no adapter: every source file — including the inline scripts
		// that `eslint-plugin-astro` extracts from `.astro` templates — runs in the browser.
		languageOptions: { globals: globals.browser },
	},
	{
		// Config files are the exception: they run in Node at build time.
		files: ['*.{js,mjs,cjs}'],
		languageOptions: { globals: globals.node },
	},
	{
		files: ['**/*.{ts,tsx}'],
		// `configs.flat`, not `configs`: the top-level ones are still the eslintrc shape,
		// which flat config rejects because their `plugins` is an array of strings.
		...reactHooks.configs.flat['recommended-latest'],
	},
	{
		rules: {
			// `_camera` in the hero builders: an argument the effect ignores but must
			// declare to reach the one after it.
			'@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
		},
	},
	// Must stay last: switches off every rule Prettier already decides.
	prettier,
);
