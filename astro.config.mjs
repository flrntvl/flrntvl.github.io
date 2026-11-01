// @ts-check
import { defineConfig } from 'astro/config';

import mdx from '@astrojs/mdx';

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
  integrations: [mdx()],
});
