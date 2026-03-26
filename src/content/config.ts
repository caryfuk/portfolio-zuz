import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
	type: 'content',
	// Type-check frontmatter using a schema
	schema: z.object({
		title: z.string(),
		description: z.string(),
		// Transform string to Date object
		pubDate: z.coerce.date(),
		updatedDate: z.coerce.date().optional(),
		heroImage: z.string().optional(),
	}),
});

const projects = defineCollection({
	type: 'data',
	// Type-check frontmatter using a schema
	schema: z.object({
		title: z.string(),
		category: z.array(z.string()),
		description: z.string(),
		order: z.number(),
		featured: z.boolean(),
		images: z.array(z.object({
			title: z.string(),
			description: z.string(),
			url: z.string(),
		})),
	}),
});

export const collections = { blog, projects };
