import { defineCollection, z } from "astro:content";

const blog = defineCollection({
  type: "content",
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
  type: "content",
  schema: z.object({
    title: z.string(),
    category: z.array(z.string()),
    featured: z.boolean(),
    year: z.string().optional(),
    location: z.string().optional(),
    credits: z.string().optional(),
    images: z
      .array(
        z.object({
          title: z.string(),
          description: z.string(),
          url: z.string(),
        })
      )
      .default([]),
  }),
});

export const collections = { blog, projects };
