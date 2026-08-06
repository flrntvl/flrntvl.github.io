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
	}),
});

export const collections = { articles };
