/*
 * Content Collections : articles, projets et cheatsheets.
 * Un dossier par langue (fr/, en/) ; les traductions d'un même contenu
 * partagent la même translationKey.
 */
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const lang = z.enum(['fr', 'en']);

const articles = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/articles' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    lang,
    translationKey: z.string(),
    tags: z.array(z.string()).default([]),
    level: z.enum(['debutant', 'intermediaire', 'avance']),
    prerequisites: z.string().optional(),
    history: z
      .array(z.object({ date: z.coerce.date(), note: z.string() }))
      .default([]),
    draft: z.boolean().default(false),
  }),
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/projects' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      lang,
      translationKey: z.string(),
      stack: z.array(z.string()),
      status: z.string(),
      year: z.number().int(),
      role: z.string().optional(),
      hosting: z.string().optional(),
      repo: z.url().optional(),
      url: z.url().optional(),
      cover: image().optional(),
      coverAlt: z.string().optional(),
      order: z.number().default(100),
      draft: z.boolean().default(false),
    }),
});

export const cheatsheetCategories = ['Linux', 'Git', 'Symfony', 'Laravel', 'Docker'] as const;

const cheatsheets = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/cheatsheets' }),
  schema: z.object({
    title: z.string(), // la commande, ex. « last reboot »
    description: z.string(),
    lang,
    translationKey: z.string(),
    category: z.enum(cheatsheetCategories),
    os: z.object({
      linux: z.boolean(),
      macos: z.boolean(),
      windows: z.boolean(),
    }),
    testedOn: z.array(z.string()).default([]),
    verifiedAt: z.coerce.date().optional(),
    destructive: z.boolean().default(false),
    tags: z.array(z.string()).default([]),
    seeAlso: z.array(z.string()).default([]), // translationKey d'autres fiches
    draft: z.boolean().default(false),
  }),
});

export const collections = { articles, projects, cheatsheets };
