Personal blog, Astro 7 + React 19 islands, deployed as a static site on GitHub Pages.

## Design

Read [DESIGN.md](DESIGN.md) before creating or modifying any page, section or component. It is binding: colour tokens, type scale, spacing, signature components, and the command-consistency rule (§7) — the prompt states the current directory, and the command is relative to it.

Tokens are implemented in `src/styles/global.css`. Never introduce a colour outside the six tokens.

## Development

Development happens inside Docker only. Never run `npm install` or `npm run dev` on the host: `sharp` resolves its prebuilt binaries against the machine running npm, and the host's Node and npm are not the ones the image pins.

```bash
make install      # first time only: build the image, install dependencies, start
make up           # start the dev server on http://localhost:4321, with hot reload
make down         # stop it
make deps         # install what package-lock.json pins
make deps-update  # interactive picker over every available upgrade, majors included
```

`make install` wraps [scripts/install.sh](scripts/install.sh). Nothing installs dependencies automatically afterwards, so run `make deps` whenever `package-lock.json` changes — after a pull, or after switching branch.

`make web` opens a shell in the container, for every command without a target of its own:

```bash
npm run build      # production build into dist/
npm run preview    # serve dist/ locally
npm install <pkg>  # add a dependency
```

Quality gates: `make check` runs the three below and stops at the first failure — `make types` (`astro check`), `make lint` (ESLint), then a Prettier check. `make lint-fix` and `make format` apply what can be fixed automatically.

`node_modules` sits in the bind mount, on the host, so an editor's TypeScript server resolves imports without a devcontainer. It is still written from inside the container: the host is WSL2, so both sides are linux-x64 and share the same `sharp` prebuilds. That equivalence is the whole reason this works — it would not hold on a macOS or native Windows host, which would need the named volume back.

## Constraints

- `output: 'static'`, no adapter. GitHub Pages serves files, so no SSR, no API route, no middleware that needs a server.
- No third-party request at runtime. Fonts are downloaded at build time and self-hosted, logos are inlined; no analytics, no share widget, no CDN.
- The home page is a single React island, mounted with `client:load` in `src/pages/index.astro`. `three.js` is imported dynamically inside `HeroCanvas`, so it lands in its own chunk rather than in the initial bundle.

## Conventions

- Code comments in English, always — including in config files.
- TypeScript strict. Import from `src/` with the `@/*` alias.
- Tailwind 4 is CSS-first: there is no `tailwind.config`, everything lives in `src/styles/global.css`.
- shadcn/ui on Base UI, `base-nova` style, `lucide` icons — see [components.json](components.json). Add components with the shadcn CLI rather than by hand, then restyle them to the DESIGN.md tokens.

## Documentation

Full documentation: https://docs.astro.build

- [Adding pages or dynamic routes](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [React islands and client directives](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Styling and Tailwind](https://docs.astro.build/en/guides/styling/)
- [Internationalization](https://docs.astro.build/en/guides/internationalization/)
