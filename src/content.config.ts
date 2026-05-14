import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

// Reserved scaffold for the Outrank-powered blog (follow-up plan #2).
//
// Outrank's API Webhook pushes published articles (markdown + HTML) to a
// receiver endpoint. Plan #2 lands that receiver and writes the markdown into
// `src/content/blog/`; this collection is already configured to consume it, so
// the blog can be added without restructuring the project (requirement R10).
//
// The schema mirrors the fields Outrank sends per article. Plan #2 will add
// `src/pages/blog/[...slug].astro` to render the collection.
const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    slug: z.string().optional(),
    metaDescription: z.string().optional(),
    createdAt: z.coerce.date().optional(),
    imageUrl: z.url().optional(),
    tags: z.array(z.string()).default([]),
  }),
});

export const collections = { blog };
