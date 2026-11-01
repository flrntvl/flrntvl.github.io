// @ts-check
import { defineConfig, fontProviders } from 'astro/config';

import { satteri } from '@astrojs/markdown-satteri';
import mdx from '@astrojs/mdx';

import { codeBlocks } from './src/markdown/code-blocks.ts';
import { siteTheme } from './src/markdown/shiki-theme.ts';
import { footnotes } from './src/markdown/footnotes.ts';

// https://astro.build/config
export default defineConfig({
  site: 'https://flrntvl.dev',
  output: 'static',
  i18n: {
    defaultLocale: 'fr',
    locales: ['fr', 'en'],
    routing: {
      // FR à la racine (/articles/), EN sous /en/ (/en/articles/)
      prefixDefaultLocale: false,
    },
  },
  // Polices auto-hébergées : téléchargées depuis Fontsource au build, servies depuis le site.
  // Seul le sous-ensemble latin et les graisses utilisées par le design sont gardés.
  fonts: [
    // Style éditorial
    {
      provider: fontProviders.fontsource(),
      name: 'Geist',
      cssVariable: '--font-geist',
      weights: [400, 500, 600],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['sans-serif'],
    },
    {
      provider: fontProviders.fontsource(),
      name: 'Geist Mono',
      cssVariable: '--font-geist-mono',
      weights: [400, 500],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['monospace'],
    },
    {
      provider: fontProviders.fontsource(),
      name: 'Instrument Serif',
      cssVariable: '--font-instrument-serif',
      weights: [400],
      styles: ['italic'],
      subsets: ['latin'],
      fallbacks: ['serif'],
    },
    // Style dev
    {
      provider: fontProviders.fontsource(),
      name: 'JetBrains Mono',
      cssVariable: '--font-jetbrains-mono',
      weights: [400, 500, 700],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['monospace'],
    },
    {
      provider: fontProviders.fontsource(),
      name: 'IBM Plex Sans',
      cssVariable: '--font-ibm-plex-sans',
      weights: [400, 500],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['sans-serif'],
    },
  ],
  markdown: {
    // Notes [^…] : libellés traduits, titre « Notes » visible
    processor: satteri({ hastPlugins: [footnotes()] }),
    // Les blocs ```mermaid sont dessinés côté client, pas colorés.
    syntaxHighlight: { type: 'shiki', excludeLangs: ['mermaid'] },
    shikiConfig: {
      theme: siteTheme,
      transformers: [codeBlocks()],
    },
  },
  integrations: [mdx()],
});
