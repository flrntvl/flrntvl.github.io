import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const articles = defineCollection({
	loader: glob({ base: './src/content/blog', pattern: '**/*.md' }),
	schema: z.object({
		title: z.string(),
		standfirst: z.string(),
		date: z.coerce.date(),
		translationKey: z.string(),
		tags: z.array(z.string()),
		// Drafts stay in the repo but are filtered out of every listing, feed,
		// lookup and page generation — see src/lib/articles.ts.
		draft: z.boolean().default(false),
	}),
});

export const collections = { articles };
