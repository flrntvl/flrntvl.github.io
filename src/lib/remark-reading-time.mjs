import { toString } from 'mdast-util-to-string';
import getReadingTime from 'reading-time';

export function remarkReadingTime() {
	return (tree, { data }) => {
		const textOnPage = toString(tree);
		const { minutes } = getReadingTime(textOnPage);
		// A raw number, not `readingTime.text` — that string comes pre-formatted in
		// English ("3 min read") with no way to localize it. Formatting happens
		// per-language in LABELS instead — see src/lib/site-content.ts.
		data.astro.frontmatter.readingMinutes = Math.max(1, Math.round(minutes));
	};
}
