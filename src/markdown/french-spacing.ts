/*
 * Plugin Sätteri (hast) : espaces insécables de la typographie française, contenus FR seulement.
 * Devant : ; ! ? » et après «, l'espace devient insécable (U+00A0), pour que la ponctuation
 * ne parte jamais seule à la ligne. On écrit le Markdown normalement, avec des espaces simples.
 * Le code (blocs, `code` en ligne, kbd) n'est jamais modifié.
 */
import type { Element, Parents, Text } from 'hast';

type Ctx = {
  fileURL: URL | undefined;
  parent: (node: Readonly<Text | Parents>) => Readonly<Parents> | undefined;
};

const NBSP = ' ';
const SKIP = new Set(['code', 'pre', 'kbd', 'samp', 'script', 'style']);

/** Langue du fichier de contenu : …/content/<collection>/en/… → en, sinon fr. */
const isEnglish = (ctx: Ctx) => ctx.fileURL?.pathname.includes('/en/') ?? false;

function insideCode(node: Readonly<Text>, ctx: Ctx): boolean {
  for (let p = ctx.parent(node); p && p.type === 'element'; p = ctx.parent(p)) {
    if (SKIP.has((p as Element).tagName)) return true;
  }
  return false;
}

export function frenchSpacing() {
  return {
    name: 'site:french-spacing',
    text(node: Readonly<Text>, ctx: Ctx): Text | void {
      if (isEnglish(ctx) || !/[ \t][:;!?»]|«[ \t]/.test(node.value) || insideCode(node, ctx)) return;
      return {
        type: 'text',
        value: node.value.replace(/[ \t]+([:;!?»])/g, `${NBSP}$1`).replace(/«[ \t]+/g, `«${NBSP}`),
      };
    },
  };
}
