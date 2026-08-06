// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig, fontProviders } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import { unified } from '@astrojs/markdown-remark';
import { remarkReadingTime } from './src/lib/remark-reading-time.mjs';
import { remarkModifiedTime } from './src/lib/remark-modified-time.mjs';

// https://astro.build/config
export default defineConfig({
	site: 'https://flrntvl.dev',
	i18n: {
		defaultLocale: 'fr',
		locales: ['fr', 'en'],
	},
	markdown: {
		// Swaps Astro's default `satteri()` processor for the remark/rehype pipeline,
		// needed to run these two remark plugins (see the Astro recipes for both).
		processor: unified({
			remarkPlugins: [remarkReadingTime, remarkModifiedTime],
		}),
	},
	integrations: [mdx(), sitemap(), react()],
	fonts: [
		{
			provider: fontProviders.google(),
			name: 'JetBrains Mono',
			cssVariable: '--font-jetbrains-mono',
			weights: [400, 500],
			styles: ['normal'],
			subsets: ['latin', 'latin-ext'],
			display: 'swap',
			fallbacks: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
		},
	],
	vite: {
		plugins: [tailwindcss()],
	},
});
