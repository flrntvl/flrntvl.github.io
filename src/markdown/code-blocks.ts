/*
 * Transformer Shiki pour les blocs de code :
 *   ```yaml title="config/packages/messenger.yaml" {7-11}
 * - barre supérieure avec le nom du fichier (ou le langage) et un bouton « copier » ;
 * - surlignage des lignes listées entre accolades ;
 * - « $ » en début de commande isolé, pour ne pas être copié.
 */
import type { Element, ElementContent, Text } from 'hast';
import type { ShikiTransformer } from 'shiki';

const SHELL_LANGS = new Set(['bash', 'sh', 'shell', 'shellscript', 'zsh', 'console']);
const NO_COPY_LANGS = new Set(['text', 'txt', 'plaintext', 'output']);

/** Lit la chaîne « meta » passée par Astro (chaîne brute ou { __raw }). */
function rawMeta(meta: unknown): string {
  if (typeof meta === 'string') return meta;
  if (meta && typeof meta === 'object' && '__raw' in meta) return String((meta as { __raw?: string }).__raw ?? '');
  return '';
}

/** « {7-11,14} » → { 7, 8, 9, 10, 11, 14 } */
function parseRanges(meta: string): Set<number> {
  const lines = new Set<number>();
  const match = meta.match(/\{([\d,\s-]+)\}/);
  if (!match) return lines;
  for (const part of match[1].split(',')) {
    const [start, end = start] = part.trim().split('-').map(Number);
    for (let n = start; n <= end; n++) if (n > 0) lines.add(n);
  }
  return lines;
}

function parseTitle(meta: string): string | undefined {
  return meta.match(/title=(["'])(.*?)\1/)?.[2];
}

/** Retire le préfixe « $ » d'une ligne de commande et le remplace par un span non copiable. */
function extractPrompt(line: Element): void {
  const spans = line.children.filter((c): c is Element => c.type === 'element');
  const text = spans.map((s) => (s.children[0] as Text | undefined)?.value ?? '').join('');
  if (!text.startsWith('$ ')) return;

  let toRemove = 2;
  for (const span of spans) {
    const node = span.children[0] as Text | undefined;
    if (!node || toRemove === 0) break;
    const cut = Math.min(toRemove, node.value.length);
    node.value = node.value.slice(cut);
    toRemove -= cut;
  }
  line.children = line.children.filter(
    (c) => !(c.type === 'element' && (c.children[0] as Text | undefined)?.value === ''),
  );
  line.children.unshift({
    type: 'element',
    tagName: 'span',
    properties: { className: ['prompt'], ariaHidden: 'true' },
    children: [{ type: 'text', value: '$ ' }],
  });
}

/*
 * Commandes avec variables (cheatsheets) :
 *   ```bash vars="utilisateur=deploy; serveur=mon-serveur.fr; lignes=5"
 *   $ ssh <utilisateur>@<serveur> "last -n <lignes> reboot"
 * Chaque <nom> devient un span.v[data-var] ; src/scripts/prose.ts ajoute les champs.
 * La valeur après « = » sert d'exemple (placeholder du champ).
 */
interface CommandVar {
  name: string;
  placeholder: string;
}

function parseVars(meta: string): CommandVar[] {
  const raw = meta.match(/vars=(["'])(.*?)\1/)?.[2];
  if (!raw) return [];
  return raw
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const [name, ...rest] = part.split('=');
      return { name: name.trim(), placeholder: rest.join('=').trim() };
    });
}

// Marqueur neutre pour la coloration (un <nom> serait lu comme une redirection en bash).
const marker = (index: number) => `__var${index}__`;
const MARKER_RE = /__var(\d+)__/g;

/** Remplace les marqueurs restés dans le texte par des span.v[data-var]. */
function wrapVars(node: Element, vars: CommandVar[]): void {
  node.children = node.children.flatMap((child): ElementContent[] => {
    if (child.type === 'element') {
      wrapVars(child, vars);
      return [child];
    }
    if (child.type !== 'text' || !MARKER_RE.test(child.value)) return [child];
    MARKER_RE.lastIndex = 0;
    const parts: ElementContent[] = [];
    let last = 0;
    for (const match of child.value.matchAll(MARKER_RE)) {
      const v = vars[Number(match[1])];
      if (match.index > last) parts.push({ type: 'text', value: child.value.slice(last, match.index) });
      parts.push({
        type: 'element',
        tagName: 'span',
        properties: { className: ['v', 'empty'], dataVar: v.name },
        children: [{ type: 'text', value: `<${v.name}>` }],
      });
      last = match.index + match[0].length;
    }
    if (last < child.value.length) parts.push({ type: 'text', value: child.value.slice(last) });
    return parts;
  });
}

export function codeBlocks(): ShikiTransformer {
  return {
    name: 'site:code-blocks',
    preprocess(code) {
      const vars = parseVars(rawMeta(this.options.meta));
      if (vars.length === 0) return code;
      return code.replace(/<([\p{L}\d_-]+)>/gu, (whole, name: string) => {
        const index = vars.findIndex((v) => v.name === name);
        return index === -1 ? whole : marker(index);
      });
    },
    line(node, line) {
      const meta = rawMeta(this.options.meta);
      if (parseRanges(meta).has(line)) this.addClassToHast(node, 'hl');
      if (SHELL_LANGS.has(this.options.lang)) extractPrompt(node);
    },
    pre(node) {
      // Les couleurs viennent du CSS (variables) : on retire le style en ligne de Shiki.
      delete node.properties.style;
    },
    root(root) {
      const pre = root.children.find((c): c is Element => c.type === 'element' && c.tagName === 'pre');
      if (!pre) return;
      const meta = rawMeta(this.options.meta);
      const lang = this.options.lang;
      const title = parseTitle(meta) ?? lang;
      const vars = parseVars(meta);
      if (vars.length > 0) wrapVars(pre, vars);

      const bar: ElementContent[] = [
        {
          type: 'element',
          tagName: 'span',
          properties: { className: ['cb-title'] },
          children: [{ type: 'text', value: title }],
        },
      ];
      if (!NO_COPY_LANGS.has(lang) && title !== 'output') {
        // Libellé posé côté client (FR/EN) ; caché sans JavaScript.
        bar.push({
          type: 'element',
          tagName: 'button',
          properties: { type: 'button', className: ['copy', 'no-print'], dataCopy: '', hidden: true },
          children: [],
        });
      }

      root.children = [
        {
          type: 'element',
          tagName: 'div',
          properties: {
            className: ['cb'],
            dataLang: lang,
            ...(vars.length > 0 && { dataVars: JSON.stringify(vars) }),
          },
          children: [
            { type: 'element', tagName: 'div', properties: { className: ['cb-bar'] }, children: bar },
            pre,
          ],
        },
      ];
    },
  };
}
