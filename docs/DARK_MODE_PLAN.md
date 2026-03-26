# Dark / Light Theme Implementation Plan

## Approach

**Tailwind `darkMode: 'class'` + CSS custom properties**

The site is already Tailwind-first. Enabling `darkMode: 'class'` and centralising the scattered hardcoded hex values into CSS variables is the minimal, correct approach. As a side effect, the broken CSS variable references (`--gray-dark`, `--gray`, `--accent`, etc.) in `BlogPost.astro` and `blog/index.astro` get fixed for free.

No icon library, no third-party package, no new dependencies.

---

## Color Palette

| CSS variable | Light | Dark | Used for |
|---|---|---|---|
| `--color-bg` | `#ffffff` | `#111111` | Page background |
| `--color-surface` | `#ffffff` | `#181818` | Header, mobile menu, panels |
| `--color-text` | `#1a1a1a` | `#e8e8e8` | Primary text |
| `--color-text-body` | `#333333` | `#c8c8c8` | Prose / paragraph text |
| `--color-muted` | `#888888` | `#777777` | Secondary labels |
| `--color-subtle` | `#bbbbbb` | `#555555` | Tertiary hint text |
| `--color-border` | `#e8e8e8` | `#2a2a2a` | Dividers, panel borders |
| `--color-border-alt` | `#e5e5e5` | `#2a2a2a` | Table row borders |
| `--gray-dark` *(legacy)* | `15 18 25` | `204 204 204` | BlogPost prose (RGB triplet) |
| `--gray` *(legacy)* | `229 233 240` | `100 100 100` | BlogPost date (RGB triplet) |
| `--black` *(legacy)* | `26 26 26` | `232 232 232` | Blog hover |
| `--accent` *(legacy)* | `26 26 26` | `232 232 232` | Blog hover |
| `--box-shadow` *(legacy)* | `0 2px 6px rgba(0,0,0,.1)` | `0 2px 6px rgba(0,0,0,.4)` | Hero image shadow |

> The logo SVG uses `fill="currentColor"` throughout — it themes automatically at zero cost.

---

## Step-by-step Changes

### Step 1 — `tailwind.config.mjs`

- Add `darkMode: 'class'`
- Add semantic Tailwind color aliases backed by CSS variables so templates can write `bg-surface` instead of `bg-[var(--color-surface)]`:

```js
darkMode: 'class',
theme: {
  extend: {
    colors: {
      // existing
      black: '#1a1a1a',
      muted: '#888',
      gray: '#f5f5f3',
      // new semantic aliases
      surface: 'var(--color-surface)',
      'text-body': 'var(--color-text-body)',
      subtle: 'var(--color-subtle)',
      'border-default': 'var(--color-border)',
      'border-alt': 'var(--color-border-alt)',
    },
  },
},
```

---

### Step 2 — `src/styles/global.css`

**A. Define CSS variables:**

```css
:root {
  --color-bg: #ffffff;
  --color-surface: #ffffff;
  --color-text: #1a1a1a;
  --color-text-body: #333333;
  --color-muted: #888888;
  --color-subtle: #bbbbbb;
  --color-border: #e8e8e8;
  --color-border-alt: #e5e5e5;
  /* Legacy variables referenced in BlogPost/Blog scoped styles */
  --gray-dark: 15 18 25;
  --gray: 229 233 240;
  --black: 26 26 26;
  --accent: 26 26 26;
  --box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

html.dark {
  --color-bg: #111111;
  --color-surface: #181818;
  --color-text: #e8e8e8;
  --color-text-body: #c8c8c8;
  --color-muted: #777777;
  --color-subtle: #555555;
  --color-border: #2a2a2a;
  --color-border-alt: #2a2a2a;
  --gray-dark: 204 204 204;
  --gray: 100 100 100;
  --black: 232 232 232;
  --accent: 232 232 232;
  --box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
}
```

**B. Update body rule:**

```css
body {
  background: var(--color-bg);
  color: var(--color-text);
  /* other properties unchanged */
}
```

**C. Add smooth theme transition, suppressed during Astro view transitions:**

```css
*, *::before, *::after {
  transition: background-color 200ms ease, color 200ms ease, border-color 200ms ease;
}

/* Prevent color transition from fighting the page morph animation */
html[data-astro-transition] *,
html[data-astro-transition] *::before,
html[data-astro-transition] *::after {
  transition: none !important;
}
```

---

### Step 3 — `src/components/BaseHead.astro` *(most critical)*

**A. Anti-FOUC inline script — must be the very first thing in `<head>`:**

```html
<script is:inline>
  (function () {
    const stored = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (stored === 'dark' || (!stored && prefersDark)) {
      document.documentElement.classList.add('dark');
    }
  })();
</script>
```

`is:inline` is critical — it prevents Astro from deferring/bundling the script, which would reintroduce FOUC.

**B. Replace hardcoded `theme-color` meta with media-conditional pair:**

```html
<!-- remove: <meta name="theme-color" content="#ffffff" /> -->
<meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />
<meta name="theme-color" content="#111111" media="(prefers-color-scheme: dark)" />
```

**C. Re-apply dark class after each Astro SPA navigation** (Astro swaps the full DOM on navigation, wiping `html.dark`):

```html
<script>
  document.addEventListener('astro:after-swap', () => {
    const stored = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = stored === 'dark' || (!stored && prefersDark);
    document.documentElement.classList.toggle('dark', isDark);
  });
</script>
```

---

### Step 4 — `src/components/Header.astro`

**A. Replace hardcoded color classes:**

| Current | Replace with |
|---|---|
| `bg-white` (nav, mobile menu) | `bg-surface` |
| `text-black` (links, mobile menu) | `text-[var(--color-text)]` |
| `bg-black` (hamburger bars) | `bg-[var(--color-text)]` |

**B. Add theme toggle button** in the nav alongside existing links:

```html
<button
  id="theme-toggle"
  aria-label="Toggle dark mode"
  class="w-8 h-8 flex items-center justify-center text-[var(--color-text)] bg-transparent border-0 cursor-pointer"
>
  <span id="theme-icon-light">☀</span>
  <span id="theme-icon-dark" class="hidden">☾</span>
</button>
```

**C. Add toggle script** (inside the existing `<script>` block):

```js
const toggleBtn = document.getElementById('theme-toggle');

function applyTheme(isDark: boolean) {
  document.documentElement.classList.toggle('dark', isDark);
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
  syncIcon(isDark);
}

function syncIcon(isDark: boolean) {
  document.getElementById('theme-icon-light')?.classList.toggle('hidden', isDark);
  document.getElementById('theme-icon-dark')?.classList.toggle('hidden', !isDark);
}

toggleBtn?.addEventListener('click', () => {
  applyTheme(!document.documentElement.classList.contains('dark'));
});

// Sync icon on load and after each view transition
function initToggle() {
  syncIcon(document.documentElement.classList.contains('dark'));
}
document.addEventListener('astro:page-load', initToggle);
```

> **Note:** The `<nav>` uses `transition:persist`, so the toggle button survives page swaps. However the `<script>` block may re-run on navigation — the `astro:page-load` listener registration is safe to repeat, but guard against duplicate `click` listeners if needed.

---

### Step 5 — `src/layouts/Project.astro`

| Current class | Replace with |
|---|---|
| `bg-white` | `bg-surface` |
| `border-[#e8e8e8]` | `border-[var(--color-border)]` |
| `text-[#333]` | `text-text-body` |
| `text-[#bbb]` | `text-subtle` |
| `hover:text-black` | `hover:text-[var(--color-text)]` |

---

### Step 6 — `src/layouts/BlogPost.astro`

**No changes needed.** The scoped `<style>` block references `--gray-dark`, `--gray`, and `--box-shadow`. These will resolve correctly once Step 2 defines them in global scope — CSS custom properties cascade into scoped styles.

---

### Step 7 — `src/pages/blog/index.astro`

**No changes needed.** Same as BlogPost — `--black`, `--gray`, `--accent` are fixed by Step 2.

---

### Step 8 — `src/pages/contact.astro`

| Current class | Replace with |
|---|---|
| `text-[#333]` | `text-text-body` |
| `text-[#bbb]` | `text-subtle` |
| `hover:text-black` | `hover:text-[var(--color-text)]` |

---

### Step 9 — `src/pages/price.astro`

| Current class | Replace with |
|---|---|
| `border-[#e5e5e5]` | `border-[var(--color-border-alt)]` |

---

## Implementation Order

Dependencies matter for the first three steps:

1. **Step 2** (global.css variables) — CSS variables must exist before anything references them
2. **Step 1** (tailwind.config.mjs) — semantic aliases must be in Tailwind output before templates use them; do a build check after
3. **Step 3** (BaseHead anti-FOUC script) — must be in place before visual testing, otherwise every page load starts in light mode
4. **Steps 4–9** — any order, verify incrementally with `astro dev`

---

## Known Challenges

**1. Astro DOM swap wipes `html.dark`**
The `astro:after-swap` listener in Step 3C is mandatory. Without it, SPA navigation in dark mode will flash light mode on every page load.

**2. Double event listener on persisted header**
The `<nav>` element uses `transition:persist`, meaning it is not re-rendered on navigation. The `<script>` block inside `Header.astro` may still re-execute. Using `astro:page-load` for icon sync (rather than attaching the click listener again) avoids the duplication.

**3. Color transition vs view transitions**
The 200ms global color fade must be suppressed during Astro's morphing animation. The `html[data-astro-transition]` rule in Step 2C handles this.

**4. Photography on dark backgrounds**
Project images are photographs — they look fine on either background. The `bg-surface` on the image panel is only visible before the image loads.
