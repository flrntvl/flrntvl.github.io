// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig, fontProviders } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
	site: 'https://flrntvl.dev',
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
