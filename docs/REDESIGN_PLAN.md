# Redesign Plan — Architektka Astro Site

Reference: `design.html` in project root (1.7MB, contains base64 images inline)

## Goal
Apply the design and structure from `design.html` to the existing Astro site while keeping all 28 existing project content files and their images untouched.

---

## Design System (from design.html)

### Fonts
- **Body**: `DM Sans` weights 300, 400, 500 — Google Fonts
- **Display/Headings**: `DM Serif Display` (with italic variant) — Google Fonts
- Replace existing: Atkinson Hyperlegible (local woff)

### Colors
```css
--black: #1a1a1a
--white: #fff
--gray: #f5f5f3
--muted: #888
--gap: 20px
```
- No accent color (removes current `#2337ff` blue)
- White background (removes current gray gradient)

### Nav
- Fixed, top, full-width, white background
- Padding: `20px 40px 16px`
- Left: logo image `52×52px` linking to `/`
- Right: 3 links — `projects` → `/`, `price` → `/price`, `contact` → `/contact`
- Link style: 13px, `letter-spacing: .04em`, no underline, hover → `opacity: 0.4`
- Mobile (<600px): hide links, show hamburger → fullscreen overlay menu with DM Serif Display 28px links

### No footer (design has none)

---

## Pages / Routes

| Route | Description |
|---|---|
| `/` | Projects grid (home) |
| `/projects/[slug]` | Project detail viewer |
| `/price` | Price table |
| `/contact` | Contact page |
| `/blog` | Keep but not in nav |

---

## Page Designs

### `/` — Projects Grid
- `padding-top: 100px` (nav height)
- `padding: 0 20px`
- CSS grid: `grid-template-columns: repeat(4, 1fr)`, `gap: 20px`
- Each cell: `aspect-ratio: 1/1.05`, `overflow: hidden`, `cursor: pointer`
- Cover image: first image from project's `images[]` array → `/projects/{id}/{url}.jpg`
- Hover effect: image `scale(1.04)` + `opacity: 0.88`, overlay fades in
- Overlay: gradient from bottom, project title in 12px uppercase `letter-spacing: .06em` white
- Sorted by `order` field ascending
- Responsive: 3 cols at 900px, 2 cols at 600px with `gap: 8px`

### `/projects/[slug]` — Project Viewer
- Full viewport height, no extra padding
- Layout: `display: flex`, `padding-top: 90px`
- **Left (image area)**: `flex: 1.4`, `background: #f0f0ee`, image `object-fit: cover`
  - Click left half → prev image
  - Click right half → next image
  - Keyboard: `←` / `→` arrow keys
  - Touch swipe support
  - Fade transition on image change (`opacity: 0` → load → `opacity: 1`)
  - Flash overlay when changing to new project (shows project name in DM Serif Display)
- **Right (meta panel)**: `flex: 1`, `padding: 40px 48px 40px 56px`, `border-left: .5px solid #e8e8e8`
  - `PROJECTS` label: 13px uppercase muted
  - Project title: DM Serif Display, 26px
  - Year + location: 13px muted
  - Description: 13.5px, line-height 1.85
  - Credits: 12.5px muted
  - Bottom nav: `← all projects` | `1 / N` counter | `next →`
- Responsive (<900px): stacks vertically, image `height: 55vw`
- Responsive (<600px): image `height: 70vw`

### `/price` — Price Page
- `padding: 100px 40px 80px`
- `PRICE` label: 13px uppercase muted
- Intro note: 13.5px muted, `line-height: 1.8`, max-width 580px centered (`margin: 32px auto 0`)
- Table: `border-collapse: collapse`, full width, rows separated by `.5px solid #e5e5e5`
- Each row: service name (14px 500 weight) + description (12px muted) on left | price on right (muted, no-wrap)

Services (from design.html):
| Service | Description | Price |
|---|---|---|
| Consultation | 1–2 hour session, on location or remote | from €150 |
| Interior Design | Concept, drawings, material board | from €2,500 |
| Renovation Guidance | Full follow-up from design to execution | on request |
| Custom Furniture | Design + production coordination | on request |

### `/contact` — Contact Page
- `padding: 100px 40px 80px`
- `CONTACT` label: 13px uppercase muted
- Bio paragraphs: 13.5px, `line-height: 1.9`, max-width 620px centered (`margin: 32px auto 0`)
- Contact block: name heading (14.5px 500), email link, location, availability note

Contact content (from design.html):
- **Name**: Zuzi Knaze
- **Email**: zuzana.knazeova@gmail.com
- **Location**: The Hague, Netherlands
- **Note**: Available for projects in the Netherlands and beyond.

Bio text (4 paragraphs from design.html — confirm/replace with real content when ready).

---

## Implementation Checklist

### Phase 1 — Foundation
- [ ] `src/consts.ts` — update `SITE_TITLE` to `"Zuzi Knaze"`
- [ ] `src/styles/global.css` — new color vars, DM Sans body, white bg, reset main width
- [ ] `src/components/BaseHead.astro` — swap Atkinson preloads → Google Fonts link
- [ ] `public/logo.jpg` — extract base64 logo from design.html

### Phase 2 — Layout & Nav
- [ ] `src/components/Header.astro` — logo + 3 links + hamburger + mobile overlay
- [ ] `src/components/Footer.astro` — empty (no footer in design)
- [ ] `src/layouts/BaseLayout.astro` — create shared layout (head + header, no footer)

### Phase 3 — Pages
- [ ] `src/pages/index.astro` — projects grid (4 cols, covers, hover overlay)
- [ ] `src/pages/projects/index.astro` — redirect to `/`
- [ ] `src/layouts/Project.astro` — split-view image viewer + meta sidebar + JS nav
- [ ] `src/pages/price.astro` — price table
- [ ] `src/pages/contact.astro` — contact page

### Phase 4 — Schema
- [ ] `src/content/config.ts` — add optional fields: `year`, `location`, `credits`

---

## What stays unchanged
- All 28 YAML project files in `src/content/projects/`
- All images in `public/projects/`
- Image path convention: `/projects/{id}/{url}.jpg`
- Blog pages (at `/blog`, just not in nav)
- RSS, sitemap Astro integrations
- `tailwind.config.mjs` (Tailwind stays but global CSS drives most styling)

---

## Notes
- Project viewer JS: images array passed server-side via inline JSON into a `<script>` tag; vanilla JS handles prev/next/keyboard/touch
- Project cover: first image from `images[]` array
- Logo: extract from base64 in `design.html` (line ~80, `<img src="data:image/jpeg;base64,...">`)
- The design is a SPA (JS show/hide); we use real multi-page navigation in Astro — no SPA transitions needed
