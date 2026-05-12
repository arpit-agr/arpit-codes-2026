# arpit.codes

Personal portfolio. Eleventy 3 static site, Lightning CSS for bundling.

## Commands

- `npm start` — dev server with watch
- `npm run build` — production build to `_site/`
- `npm run preview` — serve the built `_site/` on :8080
- `npm run clean` — remove `_site/`

## Layout

- `src/index.njk` — the only page; sections are inline (hero, about, projects, contact)
- `src/_includes/base.njk` — page shell, fonts, meta
- `src/_includes/components/` — reusable Nunjucks partials
- `src/_data/` — content (`projects.js`, `socials.js`); edit here to update the site
- `src/assets/styles/` — see CSS section below
- `src/assets/img/projects/` — project thumbnails (referenced by `projects.js`)

## CSS

Files prefixed with `_` are partials and are skipped by the build (see `eleventy.config.js`). Only `index.css` and `print.css` are emitted.

Cascade layer order, defined in `_layers.css`:

```
reset → theme → compositions → components → utilities → exceptions
```

- **theme/** — design tokens (type scale, space scale, colors, semantic vars)
- **compositions/** — layout primitives à la Every Layout (`.sidebar`, `.cluster`, `.flow`, etc.)
- **components/** — page-specific styles (`.site-header`, `.project-list`, etc.)
- **utilities/** — single-purpose helpers (`.region`, `.text-balance`, font features)
- **exceptions/** — page- or context-scoped overrides (currently homepage-only)

## Conventions

- Add a project: append to `src/_data/projects.js` and drop a thumbnail in `src/assets/img/projects/`
- Add a social link: append to `src/_data/socials.js` (SVG inline)
- New layout pattern → `compositions/`. New page-specific styling → `components/`. One-off → `exceptions/`
- Workarounds get a dated comment naming the bug and the version that fixed it (see `_exceptions.css` for the pattern)
