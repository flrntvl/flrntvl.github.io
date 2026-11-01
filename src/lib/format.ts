import type { Lang } from '../i18n/ui';

const locales: Record<Lang, string> = { fr: 'fr-FR', en: 'en-GB' };

/** Date lisible : « 14 oct. 2026 » / « 14 Oct 2026 » (style éditorial). */
export function formatDate(date: Date, lang: Lang): string {
  return new Intl.DateTimeFormat(locales[lang], {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

/** Date ISO : « 2026-10-14 » (style dev, attribut datetime). */
export function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** « Ubuntu 24.04, Debian 12 et macOS 15 ». */
export function formatList(items: string[], lang: Lang): string {
  return new Intl.ListFormat(locales[lang], { style: 'long', type: 'conjunction' }).format(items);
}

/** Morceaux d'une liste (éléments et séparateurs), pour mettre les éléments en forme. */
export function listParts(items: string[], lang: Lang) {
  return new Intl.ListFormat(locales[lang], { style: 'long', type: 'conjunction' }).formatToParts(items);
}

/** Temps de lecture en minutes (≈ 220 mots par minute, blocs de code comptés à part). */
export function readingTime(markdown = ''): number {
  const withoutCode = markdown.replace(/```[\s\S]*?```/g, ' ');
  const codeLines = (markdown.match(/```[\s\S]*?```/g) ?? []).join('\n').split('\n').length;
  const words = withoutCode.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220 + codeLines / 40));
}

/** Remplace {cle} dans un texte traduit. */
export function fill(text: string, values: Record<string, string | number>): string {
  return text.replace(/\{(\w+)\}/g, (_, key) => String(values[key] ?? ''));
}
