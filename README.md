# arpit.codes

Personal portfolio. Eleventy 3 static site, Lightning CSS for bundling.

## Commands

- `npm start` — dev server with watch
- `npm run build` — production build to `_site/`
- `npm run preview` — serve the built `_site/` on :8080
- `npm run clean` — remove `_site/`
- `npm run format` — run Prettier on all files
- `npm run format:check` — check formatting without writing

## Layout

- `src/index.njk` — the only page; sections are inline (hero, about, projects, contact)
- `src/_includes/base.njk` — page shell, fonts, meta
- `src/_includes/components/` — reusable Nunjucks partials
- `src/_data/` — content (`projects.js`, `socials.js`); edit here to update the site.
  `css.js` is not content — it's the stylesheet build, see Cache-busting below
- `src/assets/styles/` — see CSS section below
- `src/assets/img/projects/` — project thumbnails (referenced by `projects.js`)

## CSS

**Entrypoints** are the files at the top level of `src/assets/styles/` without a leading underscore — currently `index.css` and `print.css`. Everything else, including every file nested in the subfolders below, is a **partial**: prefixed with `_`, pulled into an entrypoint via `@import`, and never emitted as a file of its own.

Only entrypoints are written to `_site/`, under a content-hashed name — see Cache-busting below.

Cascade layer order, defined in `_layers.css`:

```
reset → theme → compositions → components → utilities → exceptions
```

- **theme/** — design tokens (type scale, space scale, colors, semantic vars)
- **compositions/** — layout primitives à la Every Layout (`.sidebar`, `.cluster`, `.flow`, etc.)
- **components/** — page-specific styles (`.site-header`, `.project-list`, etc.)
- **utilities/** — single-purpose helpers (`.region`, `.text-balance`, font features)
- **exceptions/** — page- or context-scoped overrides (currently homepage-only)

## Cache-busting

Stylesheets ship as `/assets/styles/index.<hash>.css`, where the hash is derived
from the bundled CSS itself. Change any partial and the filename changes, which
is what lets `netlify.toml` cache them for a year (see Caching below) — a changed
stylesheet is always a new URL, so a stale one can never be served.

**The awkward bit:** the filename contains a hash _of the file's own contents_,
so the content has to exist before the name can be chosen. Eleventy normally
works the other way round — it picks the output path (`permalink`) first, then
renders the content (`compile`). So the bundling can't live in `compile`; by then
the path is already fixed. It moved to `src/_data/css.js`, because Eleventy loads
everything in `_data/` before it processes any template.

That file bundles each entrypoint once per build and returns a lookup table which
the three consumers below all read from:

```
                      src/assets/styles/
                   index.css + its partials
                              │
                              ▼
                  ┌────────────────────────┐
                  │    src/_data/css.js    │   bundle → hash → url
                  └────────────────────────┘
                              │
                     css.index = { code, url }
                     css.print = { code, url }
                              │
             ┌────────────────┼─────────────────┐
             ▼                ▼                 ▼
     styles.11tydata.js  eleventy.config.js  base.njk
         permalink            compile        {{ css.index.url }}
             │                │                 │
      where it's written  what's inside   what the HTML links to
             └────────────────┴─────────────────┘
                              │
                              ▼
             _site/assets/styles/index.9b610a55.css
```

- **`src/_data/css.js`** — reads the entrypoints, bundles each one with Lightning
  CSS (following `@import`s, minifying, applying browserslist targets), takes a
  SHA-256 of the result, and returns `{ code, url }` per entrypoint. Because it
  sits in `_data/`, Eleventy hands that table to every template as `css`.
- **`src/assets/styles/styles.11tydata.js`** — a _directory data file_: the
  `<foldername>.11tydata.js` convention applies its data to every template in
  that folder **and all its subfolders**. Its `permalink` looks the current file
  up in the table and returns the hashed path. Partials aren't in the table, so
  it returns `false` — Eleventy's way of saying "write no file for this."
- **`eleventy.config.js`** — the `css` extension no longer bundles anything. It
  returns `data.css[name].code`, the exact string that was hashed.

Because the hash and the bytes both come from that one bundle call, the URL and
the file contents cannot drift apart.

### Gotchas

- **Don't use `page.fileSlug` to look up an entrypoint.** For any `index.*` file
  it resolves to the _parent directory_ name (`styles`), not `index`, so the
  lookup silently misses and no CSS is emitted. `styles.11tydata.js` derives the
  key from `page.inputPath` instead.
- **A non-underscore `.css` file anywhere below the top level fails the build**,
  with an error naming the file and restating the rule. It's deliberate: such a
  file is almost always a partial missing its underscore.
- **`_site/` accumulates superseded stylesheets** across repeated `npm run build`
  runs, since the name changes with the content. `npm run clean` clears them.
  Deploys are unaffected — Netlify builds a fresh publish directory each time.

### Dev vs production

Hashing only happens when `ELEVENTY_RUN_MODE` is `build`, which Eleventy sets
itself. Under `npm start` the names stay stable (`index.css`), because otherwise
every keystroke would leave another orphaned stylesheet in `_site/`.
`npm run preview` serves the output of a real build, so the hashed paths are
still exercised locally.

### Adding an entrypoint

Drop a non-underscore `.css` file at the top level of `src/assets/styles/` and
link it as `{{ css.<filename>.url }}`. Everything else is automatic — the file is
picked up, bundled, hashed and emitted with no config change.

## Caching

`netlify.toml` sets `Cache-Control` per path. Netlify's default is
`public, max-age=0, must-revalidate` with an ETag, and its CDN cache is purged on
each deploy, so only paths that can safely outlive a deploy are overridden:

- `/img/*` (eleventy-img output) — one year, `immutable`; filenames are content-hashed
- `/assets/fonts/*` — one year, `immutable`; **rename the file** when a font changes
- `/assets/styles/*` — one year, `immutable`; filenames are content-hashed (above)
- `/assets/img/*`, favicons — one day, then serve stale while revalidating

Rules must not overlap: Netlify combines the headers of every matching rule, so a
path matched twice gets two `Cache-Control` values.

## Formatting

Prettier is the only formatter. `.prettierrc.json` configures it; `.editorconfig` keeps non-Prettier-aware tools aligned. `.njk` is handled via `prettier-plugin-jinja-template`.

Zed format-on-save is configured in `.zed/settings.json` for CSS, JS, and JSON. `.njk` is **not** formatted on save — Zed's HTML handling fights template syntax. Run `npm run format` before committing changes to `.njk` files.

## Conventions

- Add a project: append to `src/_data/projects.js` and drop a thumbnail in `src/assets/img/projects/`
- Add a social link: append to `src/_data/socials.js` with an `icon` slug matching a file in `src/_includes/icons/`
- Add an icon: drop an SVG in `src/_includes/icons/<slug>.svg`; reference by slug from data, or `{% include 'icons/<slug>.svg' %}` directly from a template
- New layout pattern → `compositions/`. New page-specific styling → `components/`. One-off → `exceptions/`
- Workarounds get a dated comment naming the bug and the version that fixed it (see `_exceptions.css` for the pattern)
