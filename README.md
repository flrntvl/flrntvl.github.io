# flrntvl.dev

Personal site and dev blog of Florent Val: technical articles, projects and command
cheatsheets, in French and English.

**→ [flrntvl.dev](https://flrntvl.dev)**

## Stack

- [Astro](https://astro.build), fully static, with Markdown and MDX content
- [Pagefind](https://pagefind.app) for search, built with the site
- Bilingual:
  - French at the root, English under `/en/`
  - URLs translated where needed:
    - `/projets/` ↔ `/en/projects/`
    - `/a-propos/` ↔ `/en/about/`
- Light and dark themes: follow the device by default, can be switched from the theme menu
- JavaScript enhancements: search, theme menu, keyboard shortcuts, copy buttons
- Content still readable with JavaScript disabled (the theme then follows the device)
- Hosted on GitHub Pages

## Getting started

Requires Node.js 22.23.4 or later.

```bash
npm ci
npm run dev
```

The dev server runs on http://localhost:4321 and reloads on every change. Drafts are visible
there, not in the built site. Search needs an index: run `npm run search:dev` once to use it
in the dev server.

| Command | Does |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` | Build the site and its search index into `dist/` |
| `npm run preview` | Serve `dist/` locally, as in production |
| `npm run verify` | Everything the CI checks: types, unit tests, build, links, Cloudflare config, browser tests |

## Project structure

```text
src/
├── content/       Articles, projects and cheatsheets, one folder per language (fr/, en/)
├── pages/         Routes (French at the root, English under en/)
├── views/         Page components shared by both languages
├── layouts/       Base HTML layout
├── components/    UI components
├── lib/           Content queries, RSS, sitemap
├── i18n/          UI strings and routes, in both languages
├── markdown/      Markdown plugins (code blocks, footnotes, French spacing)
├── scripts/       Client-side scripts (search, theme, shortcuts…)
└── styles/        CSS, with design tokens in tokens.css
tests/
├── unit/          Vitest
└── e2e/           Playwright
```

## Adding content

Create a Markdown file in `src/content/<collection>/<lang>/`, where the collection is
`articles`, `projects` or `cheatsheets`. The front matter fields are defined in
`src/content.config.ts`.

- The two language versions of a content share the same `translationKey`; their file names
  (and URLs) can differ.
- `draft: true` keeps a content out of the built site.
- In French, write normal spaces before `: ; ! ?`: they become non-breaking automatically.

## Workflow

`main` is protected: every change goes through a pull request.

- **Checks:** each pull request runs **Verify site** (same steps as `npm run verify`), which
  must pass before merging.
- **Previews:** each pushed branch is deployed as a private preview on Cloudflare Workers
  (sign-in required, not indexed). Its link is posted on the pull request, and the preview
  is deleted with the branch.
- **Production:** merging into `main` deploys the site to GitHub Pages.
- **Dependencies:** Dependabot opens update pull requests (weekly for npm, monthly for
  GitHub Actions), checked the same way.

## Licence

- **Source code:** [MIT](LICENSE)
- **Content** (`src/content/`): text and images under
  [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/), code examples under
  [MIT-0](https://opensource.org/license/mit-0). The About page photo is not covered.
  Details in [LICENSE-CONTENT.md](LICENSE-CONTENT.md).
