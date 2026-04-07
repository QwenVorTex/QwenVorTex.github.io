import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const posts = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    heroColor: z.enum(['yellow', 'red', 'blue', 'black']).default('yellow'),
    tags: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
    keywords: z.array(z.string()).default([]),
    ogImage: z.string().optional(),
    canonical: z.string().url().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { posts };
