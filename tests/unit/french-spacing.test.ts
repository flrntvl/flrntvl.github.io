import { describe, expect, it } from 'vitest';

import { frenchSpacing } from '../../src/markdown/french-spacing';
import { NBSP, render } from './render';

const fr = (md: string) => render(md, 'fr', [frenchSpacing()]);
const en = (md: string) => render(md, 'en', [frenchSpacing()]);

describe('non-breaking spaces (FR content)', () => {
  it.each([':', ';', '!', '?'])('makes the space before "%s" non-breaking', (sign) => {
    const html = fr(`Mot ${sign} suite`);
    expect(html).toContain(`Mot${NBSP}${sign}`);
    expect(html).not.toContain(`Mot ${sign}`);
  });

  it('makes the spaces inside « » quotes non-breaking', () => {
    const html = fr('Il dit « bonjour » à tous.');
    expect(html).toContain(`«${NBSP}bonjour${NBSP}»`);
  });

  it('replaces several spaces or a tab with a single non-breaking space', () => {
    const html = fr('Attention  : important');
    expect(html).toContain(`Attention${NBSP}:`);
  });

  it('leaves inline code untouched', () => {
    const html = fr('Lancer `git commit -m "fix : bug"` puis valider : ok');
    expect(html).toContain('<code>git commit -m "fix : bug"</code>');
    expect(html).toContain(`valider${NBSP}:`);
  });

  it('leaves code blocks untouched', () => {
    const html = fr('```bash\necho "a : b ? c !"\n```');
    expect(html).not.toContain(NBSP);
  });

  // Known limitation: a <kbd> tag written as raw HTML in Markdown is not an element for
  // Sätteri (raw text), so the plugin does not recognise it and inserts the non-breaking space.
  // No content uses it today. If the behaviour gets fixed, this test will fail:
  // then replace "it.fails" with "it".
  it.fails('leaves keyboard keys (<kbd>) written as raw HTML untouched', () => {
    const html = fr('Appuyer sur <kbd>Ctrl :</kbd> puis valider.');
    expect(html).toContain('<kbd>Ctrl :</kbd>');
  });

  it('also applies in links, headings and lists', () => {
    const html = fr('## Titre : sous-titre\n\n- [Lien ?](https://example.com)');
    expect(html).toContain(`Titre${NBSP}:`);
    expect(html).toContain(`Lien${NBSP}?`);
  });

  it('leaves already attached (English-style) punctuation and URLs untouched', () => {
    const html = fr('Voir https://example.com:8080 et ceci: fin');
    expect(html).toContain('https://example.com:8080');
    expect(html).toContain('ceci: fin');
  });
});

describe('EN content', () => {
  it('changes nothing', () => {
    const html = en('Note : this « quote » stays as is!');
    expect(html).not.toContain(NBSP);
    expect(html).toContain('Note : this « quote » stays as is!');
  });
});
