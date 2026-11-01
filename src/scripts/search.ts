/*
 * Palette de recherche :
 * - ouverture : bouton de l'en-tête, ⌘K / Ctrl K, ou « / » (hors champ de saisie) ;
 * - recherche plein texte Pagefind (index généré au build), chargée à la première ouverture ;
 * - résultats groupés par type, filtres, ↑ ↓ pour naviguer, ↵ pour ouvrir, Échap pour fermer ;
 * - mode commandes si la saisie commence par « > » : theme, style, lang, go.
 */
import { getStylePref, getThemePref, setStylePref, setThemePref } from './appearance';

type Type = 'article' | 'project' | 'cheatsheet';

interface Config {
  lang: 'fr' | 'en';
  strings: Record<string, string>;
  paths: Record<'home' | 'articles' | 'projects' | 'cheatsheets' | 'about', string>;
  current: string | null;
  langPaths: Record<string, string>;
}

interface Item {
  title: string;
  sub: string;
  meta: string;
  type?: Type;
  url?: string;
  state?: string;
  run: () => void;
}

interface PagefindResult {
  data: () => Promise<{ url: string; meta: Record<string, string> }>;
}

interface Pagefind {
  options: (opts: Record<string, unknown>) => Promise<void>;
  debouncedSearch: (query: string, opts?: object, ms?: number) => Promise<{ results: PagefindResult[] } | null>;
}

const dialog = document.querySelector<HTMLDialogElement>('[data-search-dialog]');

if (dialog) {
  const config: Config = JSON.parse(dialog.dataset.config ?? '{}');
  const s = (key: string, values: Record<string, string | number> = {}) =>
    (config.strings[key] ?? key).replace(/\{(\w+)\}/g, (_, k) => String(values[k] ?? ''));

  const input = dialog.querySelector<HTMLInputElement>('[data-search-input]')!;
  const list = dialog.querySelector<HTMLElement>('[data-search-results]')!;
  const toolbar = dialog.querySelector<HTMLElement>('[data-search-toolbar]')!;
  const count = dialog.querySelector<HTMLElement>('[data-search-count]')!;
  const chips = dialog.querySelectorAll<HTMLButtonElement>('[data-type]');

  const ICONS: Record<Type | 'command', string> = {
    article:
      '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"></path><path d="M14 3v5h5M9 13h6M9 17h6"></path>',
    project:
      '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>',
    cheatsheet: '<path d="m5 8 4 4-4 4M12 16h7"></path>',
    command: '<path d="m9 6 6 6-6 6"></path>',
  };
  const GROUPS: Type[] = ['article', 'project', 'cheatsheet'];

  let pagefind: Pagefind | null | undefined; // undefined : pas encore chargé ; null : indisponible
  let filter: Type | '' = '';
  let items: Item[] = [];
  let active = 0;
  let lastFocus: HTMLElement | null = null;

  /* ---------- Chargement de Pagefind ---------- */

  async function loadPagefind(): Promise<Pagefind | null> {
    if (pagefind !== undefined) return pagefind;
    try {
      const url = new URL('/pagefind/pagefind.js', location.origin).href;
      pagefind = (await import(/* @vite-ignore */ url)) as Pagefind;
      await pagefind.options({ excerptLength: 20 });
    } catch {
      pagefind = null;
    }
    return pagefind;
  }

  /* ---------- Commandes ---------- */

  function commands(): Item[] {
    const theme = getThemePref();
    const style = getStylePref();
    const go = (path: string) => () => location.assign(path);
    const close = (fn: () => void) => () => {
      fn();
      closeDialog();
    };
    const active = s('search.active');
    const list: (Omit<Item, 'meta' | 'sub'> & { desc: string; on: boolean })[] = [
      { title: 'theme auto', desc: s('cmd.theme.auto'), on: theme === 'auto', run: close(() => setThemePref('auto')) },
      { title: 'theme light', desc: s('cmd.theme.light'), on: theme === 'light', run: close(() => setThemePref('light')) },
      { title: 'theme dark', desc: s('cmd.theme.dark'), on: theme === 'dark', run: close(() => setThemePref('dark')) },
      { title: 'style editorial', desc: s('cmd.style.editorial'), on: style === 'editorial', run: close(() => setStylePref('editorial')) },
      { title: 'style dev', desc: s('cmd.style.dev'), on: style === 'mono', run: close(() => setStylePref('mono')) },
      { title: 'lang fr', desc: s('cmd.lang.fr'), on: config.lang === 'fr', run: go(config.langPaths.fr) },
      { title: 'lang en', desc: s('cmd.lang.en'), on: config.lang === 'en', run: go(config.langPaths.en) },
      { title: 'go home', desc: s('cmd.go.home'), on: config.current === 'home', run: go(config.paths.home) },
      { title: 'go articles', desc: s('cmd.go.articles'), on: config.current === 'articles', run: go(config.paths.articles) },
      {
        title: config.lang === 'fr' ? 'go projets' : 'go projects',
        desc: s('cmd.go.projects'),
        on: config.current === 'projects',
        run: go(config.paths.projects),
      },
      { title: 'go cheatsheets', desc: s('cmd.go.cheatsheets'), on: config.current === 'cheatsheets', run: go(config.paths.cheatsheets) },
      {
        title: config.lang === 'fr' ? 'go a-propos' : 'go about',
        desc: s('cmd.go.about'),
        on: config.current === 'about',
        run: go(config.paths.about),
      },
    ];
    return list.map((c) => ({ title: c.title, sub: c.desc, meta: '', state: c.on ? active : '', run: c.run }));
  }

  /* ---------- Rendu ---------- */

  const escape = (text: string) =>
    text.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

  function optionHtml(item: Item, index: number, icon: Type | 'command'): string {
    const isCode = icon === 'cheatsheet' || icon === 'command';
    const tag = item.url ? `a href="${escape(item.url)}"` : 'div';
    return `<${tag} class="res" role="option" id="search-opt-${index}" data-index="${index}" aria-selected="false">
      <span class="m-only res-caret" aria-hidden="true">&gt;</span>
      <span class="e-only res-icon" aria-hidden="true"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">${ICONS[icon]}</svg></span>
      <span class="res-text">
        <span class="res-title${isCode ? ' is-code' : ''}">${escape(item.title)}</span>
        ${item.sub ? `<span class="res-sub">${escape(item.sub)}</span>` : ''}
      </span>
      ${item.meta || item.state ? `<span class="res-meta${item.state ? ' code' : ''}">${escape(item.state || item.meta)}</span>` : ''}
      <span class="e-only res-enter" aria-hidden="true">↵</span>
    </${item.url ? 'a' : 'div'}>`;
  }

  function showMessage(text: string): void {
    items = [];
    list.innerHTML = `<p class="empty-state">${escape(text)}</p>`;
    input.removeAttribute('aria-activedescendant');
  }

  function renderGroups(groups: { label: string; icon: Type | 'command'; items: Item[] }[]): void {
    items = groups.flatMap((g) => g.items);
    let index = 0;
    list.innerHTML = groups
      .filter((g) => g.items.length > 0)
      .map(
        (g, gi) =>
          `<div role="group" aria-labelledby="search-group-${gi}">
            <div class="glabel" id="search-group-${gi}">${escape(g.label)}</div>
            ${g.items.map((item) => optionHtml(item, index++, g.icon)).join('')}
          </div>`,
      )
      .join('');
    setActive(0);
  }

  function setActive(index: number): void {
    if (items.length === 0) return;
    active = (index + items.length) % items.length;
    list.querySelectorAll<HTMLElement>('[role="option"]').forEach((el) => {
      const selected = Number(el.dataset.index) === active;
      el.setAttribute('aria-selected', String(selected));
      if (selected) el.scrollIntoView({ block: 'nearest' });
    });
    input.setAttribute('aria-activedescendant', `search-opt-${active}`);
  }

  /* ---------- Recherche ---------- */

  let searchId = 0;

  async function update(): Promise<void> {
    const raw = input.value;
    const query = raw.trim();
    const id = ++searchId;

    // Mode commandes
    if (query.startsWith('>')) {
      toolbar.hidden = true;
      const needle = normalize(query.slice(1).trim());
      const hits = commands().filter((c) => !needle || normalize(`${c.title} ${c.sub}`).includes(needle));
      if (hits.length === 0) return showMessage(s('search.commandUnknown'));
      return renderGroups([{ label: s('search.commands'), icon: 'command', items: hits }]);
    }

    toolbar.hidden = false;
    if (!query) {
      count.textContent = '';
      return showMessage(s('search.start'));
    }

    const engine = await loadPagefind();
    if (id !== searchId) return;
    if (!engine) {
      count.textContent = '';
      return showMessage(s('search.unavailable'));
    }

    const search = await engine.debouncedSearch(query, {}, 120);
    if (!search || id !== searchId) return; // recherche remplacée par une plus récente

    const data = await Promise.all(search.results.slice(0, 30).map((r) => r.data()));
    if (id !== searchId) return;

    // Sans aucune page marquée data-pagefind-body (aucun contenu publié), Pagefind indexe
    // tout le site : on ne garde que les articles, projets et fiches.
    const found: Item[] = data.filter((d) => GROUPS.includes(d.meta.type as Type)).map((d) => ({
      title: d.meta.title ?? d.url,
      sub: d.meta.sub ?? '',
      meta: d.meta.meta ?? '',
      type: d.meta.type as Type,
      url: d.url,
      run: () => location.assign(d.url),
    }));
    const shown = found.filter((item) => !filter || item.type === filter);

    count.textContent = s(shown.length === 1 ? 'search.count.one' : 'search.count.other', { n: shown.length });
    if (shown.length === 0) return showMessage(s('search.none', { q: query }));

    renderGroups(
      GROUPS.map((type) => ({
        label: s(`search.type.${type}`),
        icon: type,
        items: shown.filter((item) => item.type === type),
      })),
    );
  }

  function normalize(text: string): string {
    return text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  }

  /* ---------- Ouverture / fermeture ---------- */

  function openDialog(initial = ''): void {
    if (dialog!.open) return;
    lastFocus = document.activeElement as HTMLElement | null;
    dialog!.showModal();
    input.value = initial;
    input.focus();
    update();
    loadPagefind(); // préchargement pendant la saisie
  }

  function closeDialog(): void {
    if (dialog!.open) dialog!.close();
  }

  dialog.addEventListener('close', () => lastFocus?.focus());

  // Clic sur le fond (hors du panneau) : fermeture.
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) closeDialog();
  });

  dialog.querySelector('[data-search-close]')?.addEventListener('click', closeDialog);

  document.querySelectorAll('[data-search-open]').forEach((button) =>
    button.addEventListener('click', () => openDialog()),
  );

  /* ---------- Clavier ---------- */

  const isTyping = (el: Element | null) =>
    el instanceof HTMLElement &&
    (el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName));

  document.addEventListener('keydown', (event) => {
    const mod = event.metaKey || event.ctrlKey;
    if (mod && event.key.toLowerCase() === 'k') {
      event.preventDefault(); // pas la barre d'adresse du navigateur
      dialog.open ? closeDialog() : openDialog();
    } else if (event.key === '/' && !mod && !dialog.open && !isTyping(document.activeElement)) {
      event.preventDefault();
      openDialog();
    }
  });

  input.addEventListener('input', update);

  input.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActive(active + 1);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActive(active - 1);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      items[active]?.run();
    } else if (event.key === 'Escape') {
      // Sinon un champ « search » non vide consomme Échap pour s'effacer.
      event.preventDefault();
      closeDialog();
    }
  });

  list.addEventListener('mousemove', (event) => {
    const option = (event.target as HTMLElement).closest<HTMLElement>('[role="option"]');
    if (option && Number(option.dataset.index) !== active) setActive(Number(option.dataset.index));
  });

  list.addEventListener('click', (event) => {
    const option = (event.target as HTMLElement).closest<HTMLElement>('[role="option"]');
    if (!option) return;
    const item = items[Number(option.dataset.index)];
    if (!item?.url) {
      event.preventDefault();
      item?.run();
    }
  });

  chips.forEach((chip) =>
    chip.addEventListener('click', () => {
      filter = (chip.dataset.type ?? '') as Type | '';
      chips.forEach((c) => c.setAttribute('aria-pressed', String(c === chip)));
      update();
      input.focus();
    }),
  );
}
