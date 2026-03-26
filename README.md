# architektka

Portfolio website for Zuzi Knaze — interior creator based in The Hague. Built with [Astro](https://astro.build), [Tailwind CSS](https://tailwindcss.com), and MDX.

## Commands

All commands are run from the project root:

| Command | Action |
| :--- | :--- |
| `npm install` | Install dependencies |
| `npm run dev` | Start local dev server at `localhost:4321` |
| `npm run build` | Type-check and build to `./dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run thumbnails` | Regenerate project grid thumbnails only (without a full build) |

`npm run build` automatically runs two pre-build scripts before the Astro build:
- **generate-icons** — rasterises `src/assets/zk.svg` into PWA icons at `public/icons/`
- **generate-thumbnails** — creates 600×600 JPEG thumbnails at `public/thumbnails/` from the first image of each project; skips files that are already up to date

## Project structure

```
src/
  assets/          # Source SVG logo (zk.svg)
  components/      # Shared Astro components (Header, BaseHead, …)
  content/
    projects/      # One .md file per project (see below)
    blog/          # Blog posts in Markdown / MDX
  layouts/         # Page layouts (Project, BlogPost)
  pages/           # Route pages (index, about, contact, price, blog/…)
  styles/
    global.css     # Global resets and CSS custom properties
public/
  projects/        # Full-resolution project images, grouped by project slug
  thumbnails/      # Auto-generated grid thumbnails (do not edit by hand)
  icons/           # Auto-generated PWA icons (do not edit by hand)
  favicon.svg      # Favicon derived from the ZK logo
scripts/
  generate-thumbnails.mjs
  generate-icons.mjs
```

## Adding a project

1. **Create the content file** at `src/content/projects/<slug>.md`:

```markdown
---
title: Project Name
order: 5          # Controls sort order on the grid (lower = first)
category:
  - interior-design   # or: exterior-design, furniture, object
featured: false       # Set true to highlight on the home page
year: "2024"          # Optional
location: "City, Country"  # Optional
credits: "Design by Zuzi Knaze"  # Optional
isViz: true           # Optional — marks the project as a visualisation only
images:
  - title: ""
    description: ""
    url: cover          # filename without extension
  - title: ""
    description: ""
    url: detail-1
---

Optional body text shown on the project page.
```

2. **Add the images** to `public/projects/<slug>/` as JPEG files. The filenames must match the `url` values in the frontmatter (without the `.jpg` extension). The first image in the list is used as the grid thumbnail.

3. **Run the build** (`npm run build`) or just `npm run thumbnails` to regenerate the thumbnail for the new project. Thumbnails are cropped to 600×600 from the centre of the image.

## Adding a blog post

Create a Markdown or MDX file in `src/content/blog/`:

```markdown
---
title: Post title
description: One-sentence summary used in meta tags and the post list.
pubDate: 2024-06-01
updatedDate: 2024-06-15   # Optional
heroImage: /path/to/image.jpg  # Optional
---

Post content here.
```

## Notes

- `public/thumbnails/` and `public/icons/` are generated assets — do not commit hand-edited versions of these files.
- The thumbnail script only regenerates a file if the source image is newer than the existing thumbnail, so it is safe to run frequently.
- Dark mode support is planned but not yet implemented. See `DARK_MODE_PLAN.md` for the design.
