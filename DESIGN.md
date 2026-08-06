# flrntvl.dev — Design guidelines

> The site is a terminal. Everything follows from that.

## 1. Principles

- **The terminal as a metaphor, not as a costume.** Every content block is preceded by a plausible command (`cat`, `ls`, `grep`). The command states what the block contains — it is a section heading in disguise, never decoration.
- **Sober and minimal.** Two background shades at most, a single accent, no drop shadow inside the pages, plenty of whitespace.
- **Technical credibility over effect.** Commands must be valid in their context (see §7). A developer reading the site should be able to replay the commands mentally.
- **Zero third-party request.** Embedded fonts, logos inlined at build time, no analytics, no share widget.
- **Accessible everywhere.** Web, tablet, mobile. Background effects are decorative and never carry information.

## 2. Colours

### Tokens

| Token    | Light                  | Dark                   | Usage                                     |
| -------- | ---------------------- | ---------------------- | ----------------------------------------- |
| `--bg`   | `#fbfbfa`              | `#0e0e0f`              | Page background                           |
| `--fg`   | `#151514`              | `#f2f1ed`              | Body text, filled buttons                 |
| `--mut`  | `#71716c`              | `#8d8d88`              | Secondary text, metadata, labels          |
| `--line` | `#e5e4df`              | `#232326`              | Borders, separators, fields               |
| `--card` | `#ffffff`              | `#141416`              | Cards, code blocks, row hover             |
| `--acc`  | `oklch(0.52 0.11 250)` | `oklch(0.76 0.11 250)` | Sober indigo — paths, links, status chips |

The theme is driven by `data-t="light|dark"` on the root container (in Astro: a `.dark` class on `<html>`, see [src/styles/global.css](src/styles/global.css)).

### Usage rules

- **Indigo (`--acc`)** = path segments (`~/`, `~/articles/`), active links, status chips and tree bullets, and nothing else. Never a solid background, never a button.
- **Primary button** = `--fg` background, `--bg` text. There is only one filled button per screen.
- **Active chip** (filters, selectors) = `data-active="true"` → `--fg` background, `--bg` text.
- The three macOS buttons appear in **two places only**: the terminal window on the home page and the header of code blocks (`#ff5f57`, `#febc2e`, `#28c840`).
- No other shade. One documented exception: the `#5B4FCF` indigo chip of the Iter block on `~/projets/`, a deliberate borrow from the product's own identity.

## 3. Typography

A single family: **JetBrains Mono**, falling back to the system monospace.

```css
font-family:
  'JetBrains Mono', ui-monospace, 'SF Mono', SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace;
```

In Astro, `--font-sans` **and** `--font-mono` point at the same family, otherwise the shadcn components break the effect.

### Scale

| Role                             | Size                                                 | Weight |
| -------------------------------- | ---------------------------------------------------- | ------ |
| Article title                    | 38px, `letter-spacing: -0.03em`, `line-height: 1.15` | 500    |
| Page title (hero H1, Iter)       | 34px, `-0.03em`                                      | 500    |
| Section prompt (`~/ $ cat …`)    | 15–16px                                              | 400    |
| Article body                     | 15px, `line-height: 1.8`                             | 400    |
| Standfirst                       | 16px, `line-height: 1.7`, colour `--mut`             | 400    |
| Nav, list rows                   | 13px                                                 | 400    |
| Terminal output, metadata, chips | 11.5–12.5px                                          | 400    |
| Column headers                   | 11px, colour `--mut`                                 | 400    |

Article subheadings: `## Title` at 15px, `uppercase`, `letter-spacing: 0.06em`, colour `--mut` — the Markdown syntax stays visible, and that is intentional.

## 4. Shape & space

- **Radii**: cards and blocks 10–12px · chips 999px · fields and buttons 7–8px.
- **Borders**: `1px solid var(--line)` everywhere. A `dashed` border for note callouts.
- **Shadows**: none inside the pages. Only the home page terminal window carries one.
- **Widths**: 1180px for listing and contact pages, 880px for legal pages, 760px for an article body.
- **Vertical rhythm**: header 16px/40px · page section 56–64px at the top, 88–96px at the bottom · gap between blocks 26–56px.
- **Layout**: flex or grid with `gap` exclusively, never ad-hoc margins.

## 5. Signature components

### Header

`flrntvl@flrntvl.dev:<current path>$` on the left (clickable → home), nav on the right: `articles/`, `projets/`, `stack.md`, `contact.md`, then the language selector (globe + `FR`/`EN`) and the theme selector (moon/sun). The path follows the page: `~` on home and on `stack.md`, `~/articles/` on the list and on an article, `~/projets/`, `~/legal/`.

### Section prompt

```
~/ $ cat about.md
```

Path segment in `--acc`, `$` in `--mut`, command in `--fg`. This is the only "heading" used on the site. A command that runs too long is broken at the pipes, with `\` continuations aligned under the prompt.

### Home page terminal

A window with three macOS buttons. Five commands played in sequence (`whoami`, `cat about.txt`, `cat now.md`, `ls ~/stack`, `ls articles/*.md | wc -l`), each prefixed by its own `~/ $`, with the output fading and rising into place. At the end, a final bare `~/ $` with a blinking `▌` cursor, then the loop restarts after a few seconds.

**Typing**: ~68–120 ms per character, +45 ms on spaces. The uneven rhythm is what makes the typing feel human — do not linearise it.

### Hero background

A three.js render behind the terminal, with three effects to choose from (`matrix`, `dots`, `grid`) exposed as chips. They react to the mouse and recolour with the theme. Rules: decorative, low opacity, never readable text competing with the terminal. `three` is imported dynamically, so it lands in its own chunk instead of weighing on the initial bundle.

### List row

A column grid (type/date/duration/title/tags) separated by `1px solid var(--line)`, hover = `--card` background and `--fg` text. No card, no shadow: this is the output of `ls -lh`.

### Filters

Chips for discrete values, a text field for free search, a month picker for dates. The filter block is collapsed by default; the equivalent command is shown above the results and updates live.

### Code block (article)

Header with three macOS buttons + file name on the left, language on the right; `<pre>` on a `--card` background, 13px, `line-height: 1.65`.

### Tree

Short lists rendered with `├─` / `└─`, bullet in `--acc`. Used for the footer, the social links, and a project's feature list.

### Footer

Identical on every page, preceded by `~/ $ cat footer.md` (always `~/`, never the current path). Three columns: `Made by flrntvl with ❤️` + copyright + stack; social links with logos; legal information.

## 6. Motion

- **Terminal typing**: see §5, looping.
- **Command output**: fade + `translateY(6px)` → 0, ~0.35s, triggered after the command.
- **Cursor**: `▌`, `blink 1.1s steps(1) infinite`.
- **Hovers**: a colour or background change, with no transform and no long transition.
- **Reading progress bar**: 2px in `--acc` under an article's header.
- Honour `prefers-reduced-motion: reduce` → instant typing, frozen background effects.

## 7. Command consistency

One simple rule: **the prompt states the current directory, and the command is relative to that directory.**

| Page         | Prompt          | Commands                                                                                                         |
| ------------ | --------------- | ---------------------------------------------------------------------------------------------------------------- |
| Home         | `~/ $`          | `whoami`, `cat about.txt`, `cat now.md`, `ls ~/stack`, `ls articles/*.md \| wc -l`, `ls -t articles/ \| head -5` |
| Article list | `~/articles/ $` | `ls -lh --all`, `grep -iR "…" .`                                                                                 |
| Article      | `~/articles/ $` | `cat <slug>.md`                                                                                                  |
| Projects     | `~/projets/ $`  | `cat iter/README.md`, `ls -lh --all`                                                                             |
| Stack        | `~/ $`          | `cat stack.md`                                                                                                   |
| Contact      | `~/ $`          | `cat contact.md`, `mail --compose`, `cat contacts.json`                                                          |
| Legal        | `~/legal/ $`    | `cat mentions-legales.md`, `cat confidentialite.md`                                                              |
| Footer       | `~/ $`          | `cat footer.md`                                                                                                  |

Never `ls articles/` when we are already inside `~/articles/`. Never a decorative command that matches nothing of what is displayed.

## 8. Editorial tone

- Formal address (_vouvoiement_ in French), direct, technical but without gratuitous jargon. Short sentences.
- First person for experience reports: "I rebuilt", "the three traps I fell into".
- Measured numbers rather than adjectives: "18 KB of JS against 164 KB", not "blazing fast".
- No marketing superlative, no "passionate about", no emoji — except the ❤️ in the footer.
- Bilingual FR/EN: every string exists in both languages, no machine translation. Paths and commands are not translated, except `~/projets/` ↔ `~/projects/`.

## 9. Pages

| Page         | Content                                                                                |
| ------------ | -------------------------------------------------------------------------------------- |
| Home         | Terminal + selectable three.js background — **the canonical reference for the tokens** |
| Article list | Paginated list + filters (search, tags, dates, duration)                               |
| Article      | Sticky table of contents, code blocks, reading progress                                |
| Projects     | Personal/professional projects + featured Iter teaser block                            |
| Stack        | Technical stack, logos by category                                                     |
| Contact      | `mail --compose` form + `contacts.json`                                                |
| Legal        | Legal notice and privacy policy (GDPR, GitHub Pages hosting)                           |
