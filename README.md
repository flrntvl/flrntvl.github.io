# [flrntvl.dev](https://flrntvl.dev)

Personal blog of Florent Val — [https://flrntvl.dev](https://flrntvl.dev)

A static site built with Astro around a single metaphor: the site is a terminal.

## Prerequisites

- Docker
- Docker Compose
- make

Docker is the only supported development path. Every npm invocation goes through the container, so `node_modules` always holds linux-x64 builds of `sharp` — running `npm install` on the host would swap them for your platform's and break the container on the next start.

`node_modules` deliberately stays inside the bind mount rather than in a named volume: your IDE reads it directly, with no devcontainer. On macOS or native Windows the mount crosses a VM boundary and install times get painful, so those dependencies belong back in a named volume.

## Project structure

```
flrntvl.github.io/
├── .github/workflows/    # deploy.yml — builds and publishes to GitHub Pages
├── public/               # static assets served as-is (favicons, app icons)
├── scripts/              # install.sh, wrapped by `make install`
├── src/
│   ├── components/       # base/ header+footer, shared/ cross-page pieces, home/ and not-found/ per-route
│   ├── content/          # blog articles, one subfolder per language — see content.config.ts
│   ├── layouts/          # Base (site chrome) + per-route layouts (Home, Article content/list)
│   ├── lib/              # site copy and shared helpers
│   ├── pages/            # file-based routing: home, blog, 404 — each mirrored under en/
│   ├── styles/           # global.css — Tailwind 4 + the DESIGN.md tokens
│   ├── consts.ts         # site-wide constants
│   └── content.config.ts # blog collection schema
├── DESIGN.md             # design reference, read before adding any UI
├── Dockerfile            # dev image
├── compose.yaml          # dev service + the source bind mount
├── Makefile              # every command you need, wrapping docker compose
└── astro.config.mjs      # output: 'static', no adapter
```

## Getting started

```bash
make install
```

One command, run once: it builds the image, installs dependencies, and starts the dev server on [http://localhost:4321](http://localhost:4321) with hot reload.

After that, `make up` and `make down` are all you need day to day.

Nothing installs dependencies on its own afterwards. Run `make deps` whenever `package-lock.json` changes — after a pull, or after switching branch.

Because `node_modules` lives in the bind mount rather than in a Docker volume, your editor's TypeScript server resolves imports normally, with no devcontainer needed.

## Commands

Everything runs through `make`, which wraps `docker compose` so no command depends on where you are or what you have installed on the host.

### Lifecycle

| Command        | What it does                                                                        |
| -------------- | ----------------------------------------------------------------------------------- |
| `make install` | First run only: builds the image, installs dependencies, starts the dev server      |
| `make up`      | Starts the dev server in the background, on port 4321, with hot reload              |
| `make down`    | Stops it and removes the container                                                  |
| `make build`   | Rebuilds the **Docker image** — not the site. Needed after editing the `Dockerfile` |
| `make reup`    | Stops the container and starts it again — a clean restart                           |
| `make cc`      | Clears the Astro content/type cache (`.astro`, `node_modules/.astro`) then `reup`   |

### Dependencies

| Command            | What it does                                                              |
| ------------------ | ------------------------------------------------------------------------- |
| `make deps`        | Installs exactly what `package-lock.json` pins. Run this after every pull |
| `make deps-update` | Interactive picker over every available upgrade, majors included          |

`make deps-update` runs in two steps, because the picker only edits text. `npm-check-updates` rewrites the version ranges in `package.json` — `"^6.0.3"` becomes `"^7.0.2"` — and stops there: the lockfile still pins the old version, and nothing has been downloaded. The `npm install` that follows is what resolves the new ranges, rewrites `package-lock.json` and updates `node_modules`.

Both steps matter. Committing a `package.json` that its lockfile contradicts breaks the deployment, since the workflow installs with `npm ci`, which fails on that mismatch instead of resolving it.

### Quality

| Command         | What it does                                                                    |
| --------------- | ------------------------------------------------------------------------------- |
| `make check`    | The three below, in order, stopping at the first failure. Run it before pushing |
| `make types`    | `astro check` — TypeScript, `.astro` templates included                         |
| `make lint`     | ESLint: React hooks rules, unused variables, Astro conventions                  |
| `make lint-fix` | The same, applying every fix ESLint can make on its own                         |
| `make format`   | Prettier, rewriting files in place                                              |

`make check` chains `types`, `lint` and a Prettier check with `&&`, so it reports one class of problem at a time rather than three overlapping outputs. The quality targets run in a throwaway container, so they work whether or not the dev server is up.

### Anything else

| Command    | What it does                                   |
| ---------- | ---------------------------------------------- |
| `make web` | Opens a bash shell in the container, at `/app` |

This is the escape hatch for what does not deserve a target of its own. The dev server has to be running, since the shell attaches to its container:

```bash
npm run build      # production build into dist/
npm run preview    # serve dist/ locally
npm install <pkg>  # add a dependency
```

Note the asymmetry worth remembering: `make build` builds the Docker image, while `npm run build` above builds the site.

## Writing

Articles live in `src/content/blog/<lang>/<slug>.md`, one subfolder per language. The frontmatter drives everything:

```yaml
---
title: My post
standfirst: One-sentence summary, reused in listings and the RSS feed.
date: 2026-08-22
translationKey: my-post # links this post to its other-language counterpart
tags:
	- Astro
draft: true # optional — see below
---
```

While `draft: true`, the post stays in the repo but is excluded from every listing, the RSS feeds, page generation and the sitemap — you can write and commit it safely. Remove the flag (or set it to `false`) to publish.

## Design

[DESIGN.md](DESIGN.md) is the reference for every new page, section or component — colour tokens, type scale, spacing, signature components, and the rule that keeps the terminal credible: the prompt states the current directory, and the command is relative to it.

Read it before touching [src/styles/global.css](src/styles/global.css), which implements its tokens.
