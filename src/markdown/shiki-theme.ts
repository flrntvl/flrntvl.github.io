/*
 * Thème Shiki dont les couleurs sont les variables CSS du site :
 * le code suit automatiquement les 4 combinaisons thème × style.
 */
import type { ThemeRegistration } from 'shiki';

export const siteTheme: ThemeRegistration = {
  name: 'site',
  type: 'light',
  colors: {
    'editor.foreground': 'var(--fg)',
    'editor.background': 'transparent',
  },
  tokenColors: [
    {
      scope: ['comment', 'punctuation.definition.comment'],
      settings: { foreground: 'var(--muted)', fontStyle: 'italic' },
    },
    {
      scope: ['string', 'string.quoted', 'string.unquoted.heredoc', 'markup.inline.raw'],
      settings: { foreground: 'var(--c-str)' },
    },
    {
      scope: [
        'constant.numeric',
        'constant.language',
        'constant.character',
        'variable.other.constant',
        'entity.other.attribute-name',
        'support.constant',
      ],
      settings: { foreground: 'var(--c-num)' },
    },
    {
      scope: [
        'keyword',
        'storage',
        'storage.type',
        'storage.modifier',
        'entity.name.tag',
        'support.type.property-name',
        'meta.attribute',
        'punctuation.definition.attribute',
        'entity.name.function.attribute',
        'support.type.primitive',
        'keyword.type',
      ],
      settings: { foreground: 'var(--accent)' },
    },
    {
      // Shell : commandes et arguments en couleur de texte (pas en « chaîne »).
      scope: ['string.unquoted.argument.shell', 'entity.name.command.shell', 'support.function.builtin.shell'],
      settings: { foreground: 'var(--fg)' },
    },
  ],
};
