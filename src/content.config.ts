import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    author: z.string().default('Barista Flow Team'),
    image: z.string().optional(),
    tags: z.array(z.string()).default([]),
  }),
});

// Long-form caffeine guides at /[lang]/guides/[slug]/ (see src/pages/[lang]/guides/[slug].astro).
const guides = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: "./src/content/guides" }),
  schema: z.object({
    title: z.string(),
    /** Shorter <title> for search results (falls back to `title`). */
    seoTitle: z.string().optional(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    author: z.string().default('Barista Flow editorial team'),
    /** Sort order in "related guides" lists. */
    order: z.number().default(0),
  }),
});

export const collections = { blog, guides };
