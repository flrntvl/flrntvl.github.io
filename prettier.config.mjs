/**
 * Matches the style already in the tree: tabs, single quotes, semicolons.
 * A `.mjs` config rather than `.prettierrc.json` so these choices can be commented.
 *
 * @type {import('prettier').Config}
 */
export default {
	useTabs: true,
	tabWidth: 2,
	semi: true,
	singleQuote: true,
	trailingComma: 'all',
	// Wide enough that the existing `three.js` and Tailwind lines do not all reflow.
	printWidth: 110,

	// `prettier-plugin-tailwindcss` must come last: it reorders classes after every
	// other plugin has parsed the file.
	plugins: ['prettier-plugin-astro', 'prettier-plugin-tailwindcss'],
	// Tailwind 4 is CSS-first, so the class order is read from the stylesheet,
	// not from a `tailwind.config`.
	tailwindStylesheet: './src/styles/global.css',

	overrides: [
		{
			files: '*.astro',
			options: { parser: 'astro' },
		},
		{
			// npm rewrites `package.json` with two spaces on every install; matching it
			// avoids a diff on each dependency change.
			files: ['*.json', '*.md', '*.yml'],
			options: { useTabs: false, tabWidth: 2 },
		},
	],
};
