# flrntvl.dev

Personal site and dev blog (articles, projects, command cheatsheets). Static Astro site,
bilingual: French at the root, English under `/en/`, with translated URLs where needed
(`/projets/` ↔ `/en/projects/`; all routes in `src/i18n/ui.ts`).

- **Production:** GitHub Pages, deployed by `.github/workflows/deploy.yml` on every push to `main`.
- **Previews:** every pushed branch other than `main` gets a Cloudflare Worker Preview
  (`wrangler.jsonc`), protected by Cloudflare Access and not indexed.

## Commands

| Command | Does |
| --- | --- |
| `npm run dev` | Dev server (drafts visible) |
| `npm run search:dev` | Search index for the dev server (search is unavailable there without it) |
| `npm run build` | Astro build + Pagefind search index into `dist/` |
| `npm run preview` | Serve `dist/` locally (the built site, as in production) |
| `npm run check` | Type check (`astro check`) |
| `npm test` | Unit tests (Vitest, `tests/unit/`) |
| `npm run check:links` | Internal link check on `dist/` |
| `npm run check:worker` | Dry run of the Cloudflare config (`wrangler deploy --dry-run`) |
| `npm run test:e2e` | Browser tests (Playwright, `tests/e2e/`) against the built site |
| `npm run verify` | `check`, `test`, `build`, `check:links`, `check:worker`, `test:e2e`, in CI order |

- Work with `npm run dev`: it reloads on every change and never reads `dist/`.
- `npm run build` only writes `dist/` (git-ignored, never deployed from a local machine).
  `check:links`, `check:worker` and `test:e2e` test `dist/`, so rebuild after a change.
- Before pushing, run `npm run verify` (same steps as the **Verify site** check).

## Git workflow

- Never commit or push without the user's explicit go-ahead. Show the diff and the proposed
  commit message first.
- Do not open pull requests: the user opens them. Provide a title and a description ready
  to paste, without hard line wraps (GitHub's text field wraps lines itself).
- No `Claude-Session` line or session link in commit messages or pull request descriptions.
  A `Co-Authored-By` trailer is fine.
- Never push to `main`: a ruleset requires a pull request and the **Verify site** check
  (`.github/workflows/ci.yml`) to pass.
- Commit messages: Conventional Commits with a scope (`feat(ui): …`, `fix(previews): …`,
  `ci: …`), in English, with a body explaining why.
- Branch names: `<type>/<short-name>` (e.g. `feat/reading-progress`, `ci/previews`).
- After pushing a branch, give the user its preview URL (Cloudflare only comments it on pull
  requests). Read it from the Cloudflare API when available; otherwise derive it from the
  branch name: lowercase, every character other than `a-z`, `0-9` and `-` becomes `-`,
  repeated dashes collapsed, leading/trailing dashes removed, then
  `https://<slug>-flrntvl.flrntvl.workers.dev` (e.g. `feat/new-post` →
  `https://feat-new-post-flrntvl.flrntvl.workers.dev`). Very long branch names are
  shortened by Cloudflare: check the API or the dashboard. The preview is ready about two
  minutes after the push, behind Cloudflare Access (sign in with the Cloudflare account).
- Deleting a branch deletes its preview: Cloudflare does it itself a few seconds later (the
  Preview's `auto_delete` setting, on by default; see the Workers Builds API reference).
  No workflow or token is needed.

## Languages

- Code, new comments, test names, workflow names and commit messages: **English**.
  Existing comments under `src/` are in French: leave them unless asked.
- Site content and UI exist in **French and English**. UI strings live in `src/i18n/ui.ts`
  (both languages, same keys); routes in `routes` there (`/projets/` ↔ `/en/projects/`).

## Content

- Collections in `src/content/{articles,projects,cheatsheets}/{fr,en}/`, schemas in
  `src/content.config.ts`.
- Translations of the same content share a `translationKey`; slugs may differ per language.
  A content without translation gets a "missing translation" page in the other language.
- `draft: true` hides a content from lists, search, sitemap and RSS (visible in `npm run dev`).
- French content gets non-breaking spaces before `: ; ! ? »` and after `«` automatically
  (`src/markdown/french-spacing.ts`): write normal spaces.
- Code blocks (`src/markdown/code-blocks.ts`): ```` ```bash title="file.sh" {2-4} ````
  for a title and highlighted lines; a leading `$ ` is shown but not copied;
  `vars="name=placeholder"` turns `<name>` into an input field; ```` ```mermaid ```` draws a diagram.

## Design

- Use the CSS variables of `src/styles/tokens.css` (colors, fonts, radius); no hard-coded
  colors. Every change must work in both light and dark themes.
- Content must stay readable without JavaScript; scripts in `src/scripts/` only enhance it.
- Keep it accessible: keyboard navigation, visible focus, ARIA on interactive widgets,
  sufficient contrast.

## Tests

- Browser tests read the published pages from `dist/sitemap.xml`: new pages are covered
  automatically. Shared helpers and the error-catching base test are in `tests/e2e/helpers.ts`
  (any JS error, console error or missing resource fails a test).
- Locally, if Playwright's Chromium is not installed, set `PW_CHROMIUM_PATH` to a Chromium binary.

## Pitfalls

- `astro preview` moves to the background when it detects an AI agent: Playwright starts it
  with `--ignore-lock` (`playwright.config.ts`).
- `wrangler preview` requires the `previews` block in `wrangler.jsonc`, even empty;
  `wrangler deploy --dry-run` does not check it.
- `preview_urls` in `wrangler.jsonc` is only applied by `wrangler deploy` (production
  branch), not by `wrangler preview`.
- Fonts are downloaded from Fontsource (`api.fontsource.org`) at build time. If it cannot be
  reached, the build still succeeds without them (`Copying fonts (0 files)`): do not mistake
  that for a working build in a restricted network.
