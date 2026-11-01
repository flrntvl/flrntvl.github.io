/*
 * Plugin Sätteri (hast) : notes de bas de page [^nom] dans la langue de la page.
 * Le Markdown génère déjà les liens aller (appel → note) et retour (note → appel) ;
 * ce plugin rend le titre « Notes » visible et traduit les libellés, générés en anglais.
 */
import type { Element } from 'hast';

const labels = {
  fr: { title: 'Notes', back: (n: string) => `Retour au texte, note ${n}` },
  en: { title: 'Notes', back: (n: string) => `Back to the text, note ${n}` },
};

type Ctx = {
  fileURL: URL | undefined;
  replaceNode: (node: Element, newNode: Element) => void;
  setProperty: (node: Element, key: string, value: unknown) => void;
};

const prop = (node: Element, name: string) =>
  node.properties?.[name] ?? node.properties?.[name.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)];

/** Langue du fichier de contenu : …/content/<collection>/en/… → en, sinon fr. */
const langOf = (ctx: Ctx) => (ctx.fileURL?.pathname.includes('/en/') ? 'en' : 'fr');

export function footnotes() {
  return {
    name: 'site:footnotes',
    element: [
      {
        filter: ['h2'],
        visit(node: Element, ctx: Ctx) {
          if (prop(node, 'id') !== 'footnote-label') return;
          ctx.replaceNode(node, {
            type: 'element',
            tagName: 'h2',
            properties: { id: 'footnote-label', className: ['sh', 'footnotes-title'] },
            children: [{ type: 'text', value: labels[langOf(ctx)].title }],
          });
        },
      },
      {
        filter: ['a'],
        visit(node: Element, ctx: Ctx) {
          if (prop(node, 'dataFootnoteBackref') === undefined) return;
          const number = String(prop(node, 'href') ?? '').match(/(\d+)$/)?.[1] ?? '';
          const label = String(prop(node, 'ariaLabel') ?? '').match(/(\d+)/)?.[1] ?? number;
          ctx.setProperty(node, 'ariaLabel', labels[langOf(ctx)].back(label));
        },
      },
    ],
  };
}
