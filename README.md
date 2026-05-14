# Symbionis — AI Coaching Practice

Bilingual site (EN/FR) for Frank Sykes' AI coaching practice. Built with
[Astro](https://astro.build) (static output), deployed to Cloudflare Workers
static assets on `symbionis.ac`.

## Quick start

```sh
npm install
npm run dev       # local dev server
npm run build     # static build → dist/
npm run preview   # preview the built site
npm run check     # astro check (types + templates)
npm test          # build, then run build-output assertion tests
```

Requires Node 22 (see `.nvmrc`).

## Structure

```
.
├── astro.config.mjs        Astro config — i18n, sitemap, static output
├── wrangler.jsonc          Cloudflare Workers static-assets config
├── src/
│   ├── pages/              One .astro file per route
│   │   ├── index.astro         /            (EN home)
│   │   ├── about.astro         /about/      (EN about)
│   │   ├── framework.astro     /framework/  (EN five levels)
│   │   └── fr/                 /fr/* mirror (FR pages)
│   ├── layouts/Layout.astro   Shared <head>, nav, footer, scripts
│   ├── components/            Nav, Footer, LangSwitch, CalEmbed
│   ├── i18n/ui.ts             Shared UI strings + URL helpers
│   ├── styles/
│   │   ├── global.css         Home + about pages
│   │   └── framework.css      Framework pages (own dark-theme design)
│   └── content.config.ts      Reserved blog collection (see Blog, below)
├── public/                 Served as-is: _headers, _redirects, robots.txt,
│                           favicon.svg, lang.js, images
└── tests/                  Build-output assertion tests (Vitest)
```

## Internationalisation

Uses Astro's built-in i18n: `en` is the default locale served unprefixed at
`/`, `fr` is served under `/fr/`. Pages are authored per locale —
`src/pages/about.astro` and `src/pages/fr/about.astro` — both rendering through
the shared `Layout`, which generates the canonical link, reciprocal `hreflang`
alternates (including `x-default`), Open Graph, Twitter, and JSON-LD tags from
the page's `locale` and `pathKey` props.

## Editing content

- **Text changes:** edit the relevant `.astro` file in `src/pages/`. EN and FR
  are separate files.
- **Shared chrome** (nav labels, footer): `src/i18n/ui.ts`.
- **Styles:** `src/styles/global.css` (home + about) or
  `src/styles/framework.css` (framework pages).
- **FR pending copy:** search for `FR copy pending` in `src/pages/fr/` — these
  are source-only comments marking sections awaiting native French text.

## Cal.com integration

The `CalEmbed` component renders the Cal.com inline booking widget. The
homepages use element id `cal-inline`; the framework pages use
`my-cal-inline-connect`. To change the event, update `calLink` in
`src/components/CalEmbed.astro`.

## SEO

`sitemap.xml` is generated at build time by `@astrojs/sitemap` (output:
`sitemap-index.xml` + `sitemap-0.xml`) with `en`/`fr` `hreflang` alternates per
URL. `x-default` is emitted in each page's HTML `<head>` rather than the
sitemap. `robots.txt` (in `public/`) points at `sitemap-index.xml`.

## Deploy

Cloudflare Workers static assets — `wrangler.jsonc` serves the `dist/` build
output. A build step is now required before deploy:

```sh
npm run build
npx wrangler deploy
```

Or connect the repo to **Cloudflare Workers Builds** so `npm run build` runs on
every push to `main` → `symbionis.ac`.

`public/_headers` and `public/_redirects` are copied into `dist/` and applied at
the edge — security headers, cache rules (including an `immutable` rule for
hashed `/_astro/*` assets), and the legacy `/framework/fr/` → `/fr/framework/`
redirects.

## Blog (planned)

`src/content.config.ts` defines a reserved `blog` content collection for a
follow-up plan: an [Outrank](https://www.outrank.so) API Webhook integration
that publishes articles into `src/content/blog/`. Not yet wired up — the
collection is intentionally empty.

## URLs

| Path | Content |
|---|---|
| `/` · `/fr/` | Homepage |
| `/about/` · `/fr/about/` | About Frank |
| `/framework/` · `/fr/framework/` | The Five Levels of AI |
