import { describe, expect, it } from 'vitest';

import { footnotes } from '../../src/markdown/footnotes';
import { render } from './render';

const markdown = 'Texte[^a] et autre[^b].\n\n[^a]: Première note.\n[^b]: Seconde note.';

describe('footnotes', () => {
  it('makes the "Notes" heading visible (FR)', () => {
    const html = render(markdown, 'fr', [footnotes()]);
    expect(html).toMatch(/<h2[^>]*id="footnote-label"[^>]*>Notes<\/h2>/);
    expect(html).not.toContain('sr-only');
    expect(html).toContain('footnotes-title');
  });

  it('translates the back links into French', () => {
    const html = render(markdown, 'fr', [footnotes()]);
    expect(html).toContain('aria-label="Retour au texte, note 1"');
    expect(html).toContain('aria-label="Retour au texte, note 2"');
    expect(html).not.toContain('Back to reference');
  });

  it('translates the back links into English', () => {
    const html = render(markdown, 'en', [footnotes()]);
    expect(html).toMatch(/<h2[^>]*id="footnote-label"[^>]*>Notes<\/h2>/);
    expect(html).toContain('aria-label="Back to the text, note 1"');
    expect(html).toContain('aria-label="Back to the text, note 2"');
  });

  it('keeps the links between the reference and the note, both ways', () => {
    const html = render(markdown, 'fr', [footnotes()]);
    expect(html).toContain('href="#user-content-fn-a"');
    expect(html).toContain('href="#user-content-fnref-a"');
  });

  it('changes nothing on a page without notes', () => {
    const html = render('Un paragraphe simple.', 'fr', [footnotes()]);
    expect(html).toBe('<p>Un paragraphe simple.</p>\n');
  });
});
