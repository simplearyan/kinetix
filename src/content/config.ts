import { defineCollection, z } from 'astro:content';

const blogCollection = defineCollection({
    type: 'content',
    schema: z.object({
        title: z.string(),
        description: z.string(),
        pubDate: z.date(),
        author: z.string().default('Kinetix Team'),
        image: z.string().optional(),
        tags: z.array(z.string()).optional()
    })
});

export const collections = {
    'blog': blogCollection,
};
