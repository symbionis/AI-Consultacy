---
title: "refactor: Migrate Symbionis site to Astro on Cloudflare Workers"
type: refactor
status: active
date: 2026-05-14
---

# refactor: Migrate Symbionis site to Astro on Cloudflare Workers

## Summary

Rebuild the hand-written static site as a greenfield Astro project — built-in i18n (EN at `/`, FR at `/fr/`), a shared layout and chrome components, generated sitemap and `hreflang`, the existing `styles.css` carried over as a global stylesheet. It builds to static output deployed on Cloudflare Workers static assets, and is scaffolded so an Outrank-powered blog can be added as a follow-up plan without rework.

---

## Problem Frame

The site is currently six hand-written HTML files (EN + FR for home, `about/`, `framework/`) that duplicate `<head>`, nav, and footer markup across every page, with a hand-maintained `sitemap.xml` and per-file `hreflang` blocks that drift easily. It was published roughly an hour before this plan, so there is no SEO or crawl history to preserve — this can be treated as a greenfield build, not a literal byte-for-byte port.

The motivating goal is a blog section powered by [Outrank.so](https://www.outrank.so/docs/webhook), whose API Webhook integration pushes published articles (markdown + HTML) to a receiver endpoint. That requires a build system and content tooling the current flat HTML files cannot support. This plan re-platforms the existing site onto Astro as a clean foundation; the blog itself is a separate follow-up plan.

---

## Requirements

- R1. All six existing pages render in Astro with output visually identical to the current live site (EN/FR home, about, framework).
- R2. URL structure preserved: EN at `/`, `/about/`, `/framework/`; FR at `/fr/`, `/fr/about/`, `/fr/framework/` — directory-style trailing slashes.
- R3. Astro's built-in i18n is configured: `en` as default locale served unprefixed, `fr` served under the `/fr/` prefix.
- R4. The shared `<head>` (meta, canonical, `hreflang` alternates, Open Graph, Twitter, JSON-LD structured data) is generated from a layout, not duplicated per page.
- R5. `sitemap.xml` is generated at build time with `hreflang` alternates, replacing the hand-maintained file.
- R6. Existing Cloudflare edge configuration is preserved: `_headers` (security headers, cache rules) and `_redirects` (the `/framework/fr/` → `/fr/framework/` rule).
- R7. The `lang.js` language-preference behaviour (cookie persistence + soft suggestion banner) is preserved.
- R8. The Cal.com booking integration is preserved — both the popover trigger and the inline embed.
- R9. The site builds to static output and deploys on Cloudflare Workers static assets.
- R10. The project is structured so a `/blog/` route tree and an article content collection can be added in a follow-up plan without restructuring.

---

## Scope Boundaries

- No visual redesign — output matches the current site.
- No copy changes — the `<!-- FR copy pending -->` placeholders in the French pages are carried over verbatim.
- No new pages, sections, or features.
- No SSR, no Cloudflare adapter, no webhook receiver, no content store in this plan — the site ships pure static.
- No conversion of `styles.css` into component-scoped styles — it is carried over whole as a global stylesheet.

### Deferred to Follow-Up Work

- **Outrank blog integration** — API Webhook receiver endpoint (Bearer-validated), content store (Cloudflare KV/D1/R2), `/blog/` rendering, and the `@astrojs/cloudflare` adapter for that dynamic route: separate plan #2. The webhook payload shape and storage choice will be researched there, not assumed here.

---

## Context & Research

### Relevant Code and Patterns

- `index.html`, `fr/index.html` — EN/FR homepages (~330 lines each); contain the Cal.com popover button (`data-cal-link`), the inline embed container (`#cal-inline`), JSON-LD `ProfessionalService` structured data, and the full `<head>` block to be templated.
- `about/index.html`, `fr/about/index.html` — about pages (~127 lines each).
- `framework/index.html`, `fr/framework/index.html` — the legacy five-levels pages (~905 lines each); largest pages, likely warrant section-component decomposition during the port.
- `styles.css` — single 795-line shared stylesheet with `:root` design tokens (`--navy: #1B3A57`, etc.); carried over whole.
- `lang.js` — vanilla IIFE: persists the EN/FR choice in a `siteLang` cookie and renders a dismissible language-suggestion banner. No build dependency; can ship as a static asset.
- `wrangler.jsonc` — already uses the Cloudflare **Workers static assets** model (`assets.directory`), currently pointed at `./`.
- `_headers`, `_redirects`, `robots.txt`, `sitemap.xml`, `favicon.svg`, `og-image.png`, `frank-sykes.jpg` — edge config and static assets at repo root.
- `README.md` — documents the current no-build Cloudflare Pages workflow; needs rewriting for the Astro build.

### Institutional Learnings

- None — no `docs/solutions/` directory exists in this repo.

### External References

- Astro i18n routing — `i18n` config in `astro.config.mjs`, `prefixDefaultLocale: false`, locale URL helpers (`getRelativeLocaleUrl`).
- `@astrojs/sitemap` — i18n-aware sitemap generation with `xhtml:link` alternates.
- Cloudflare Workers static assets — `_headers` / `_redirects` support, `assets.directory` binding, optional Git-connected Workers Builds.
- [Outrank API Webhook docs](https://www.outrank.so/docs/webhook) — push-only model; informs R10 and the deferred plan #2, not this plan's implementation.

---

## Key Technical Decisions

- **Astro over Next.js or a hosted CMS** — a bespoke, design-led marketing site plus a markdown-driven blog is Astro's sweet spot. Next.js is heavier and less clean on Cloudflare; a hosted CMS would mean abandoning the bespoke site. Outrank's webhook is markdown-native, which plays to Astro content collections in plan #2.
- **`output: 'static'`, no adapter** — the site is fully static. Outrank's webhook is push-only and needs a live receiver + store, but that is plan #2, which will add the `@astrojs/cloudflare` adapter for that single dynamic route. Keeping plan #1 pure static yields a clean, shippable milestone.
- **Cloudflare Workers static assets over Cloudflare Pages** — Workers is the natural home for the plan-#2 webhook receiver and storage bindings (KV/D1/R2), and the repo's `wrangler.jsonc` already uses this model. Both serve identical static output today.
- **Built-in i18n with `prefixDefaultLocale: false`** — puts EN at `/` and FR at `/fr/`, which both matches the current URLs and is the recommended structure (default locale unprefixed, secondary locale in a subdirectory).
- **Directory-per-locale page authoring** (`src/pages/` + `src/pages/fr/`) — the pages are bespoke landing pages, not uniform content entries, so they do not fit content collections. Shared chrome is factored into a layout + components + a UI-strings file; page bodies stay as `.astro` markup, one file per locale.
- **`styles.css` carried over as a single global stylesheet** — lowest-risk path to identical output; component-scoped styles are explicitly out of scope.
- **`@astrojs/sitemap` for sitemap generation** — moves `sitemap.xml` and `hreflang` from hand-maintained (drift-prone) to generated (correct by construction).
- **`trailingSlash` / `build.format` set explicitly** — to guarantee directory-style URLs (`/about/`, `/fr/framework/`) match the current site and avoid `/fr` vs `/fr/` mismatches.

---

## Open Questions

### Resolved During Planning

- Astro vs alternatives: **Astro** — best fit for a bespoke marketing site + markdown blog on Cloudflare.
- Cloudflare Pages vs Workers: **Workers static assets** — future-proof for the plan-#2 webhook receiver and storage bindings.
- i18n approach: **built-in Astro i18n**, `prefixDefaultLocale: false`, directory-per-locale authoring.
- Content modeling: **component composition** (shared layout + chrome components + UI-strings file), not content collections — collections are reserved for the plan-#2 blog.
- Static vs hybrid: **pure static** for plan #1; the Cloudflare adapter lands in plan #2.

### Deferred to Implementation

- Section-component decomposition of the 905-line framework pages — whether and how finely to break them into reusable `.astro` components is best decided while porting.
- Whether `lang.js` stays a verbatim static asset or is reworked as an Astro component with a client script — port as-is first; revisit only if it causes friction.
- Exact build-output assertion tooling (Vitest reading `dist/` vs. Playwright against `astro preview`) — pick during U1 test setup based on what is least friction.
- Outrank webhook payload handling and storage choice — entirely plan #2.

---

## Implementation Units

### U1. Scaffold Astro project and build tooling

**Goal:** An Astro project that builds to static output, configured for i18n and sitemap generation, with Cloudflare Workers static-assets deploy wired up and a test harness in place.

**Requirements:** R3, R5, R9

**Dependencies:** None

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `.nvmrc`
- Create: `vitest.config.ts` (or equivalent test config)
- Modify: `wrangler.jsonc` (point `assets.directory` at `./dist`)
- Modify: `.gitignore` (add `node_modules/`, `dist/`, `.astro/`)

**Approach:**
- Initialise Astro with `output: 'static'`; no adapter.
- `astro.config.mjs`: `site: 'https://symbionis.ac'`; `i18n` config with `defaultLocale: 'en'`, `locales: ['en', 'fr']`, `prefixDefaultLocale: false`; `@astrojs/sitemap` integration with i18n options; `trailingSlash` / `build.format` set to produce directory-style URLs.
- npm as package manager (no existing lockfile); pin a Node version via `.nvmrc`.
- Test harness chosen to allow build-output assertions in later units.

**Test scenarios:**
- Test expectation: none — scaffolding and configuration only. No behavioural change to assert.

**Verification:**
- `npm run build` completes cleanly and produces a `dist/` directory.
- `astro check` passes.
- `wrangler` serves `dist/` locally without error.

---

### U2. Shared layout, site chrome, and static assets

**Goal:** A base layout that generates the full `<head>` for any page, plus nav / footer / language-switch components driven by a UI-strings file, with `styles.css` and all static assets relocated into the Astro project.

**Requirements:** R4, R6, R7, R8

**Dependencies:** U1

**Files:**
- Create: `src/layouts/Layout.astro`
- Create: `src/components/Nav.astro`, `src/components/Footer.astro`, `src/components/LangSwitch.astro`
- Create: `src/i18n/ui.ts` (shared UI strings for nav, footer, language switch, per-locale meta)
- Create: `src/styles/global.css` (the existing `styles.css`, carried over whole)
- Create: `public/_headers`, `public/_redirects`, `public/robots.txt`, `public/favicon.svg`, `public/lang.js`, `public/og-image.png`, `public/frank-sykes.jpg`

**Approach:**
- `Layout.astro` takes props (title, description, locale, page path) and computes `<link rel="canonical">`, reciprocal `hreflang` alternates + `x-default`, `<html lang>`, the Google Fonts `<head>` block (preconnect + the Source Serif 4 / Inter stylesheet link), Open Graph, Twitter, and JSON-LD structured data from the i18n config and props — so no page hand-writes head tags.
- Nav / Footer / LangSwitch read localized strings from `src/i18n/ui.ts`.
- `lang.js` is referenced as a static `<script>` from the layout (ported verbatim — see Deferred to Implementation).
- The Cal.com embed script is referenced from the layout (or per-page where the inline embed lives); the `data-cal-link` popover trigger and `#cal-inline` container are provided by components/pages that need them.
- `global.css` imported once in `Layout.astro`.
- `public/robots.txt` is updated so its `Sitemap:` line points at the `@astrojs/sitemap` output (`https://symbionis.ac/sitemap-index.xml`), not the old hand-written `sitemap.xml` path.

**Patterns to follow:**
- The existing `<head>` blocks in `index.html` / `fr/index.html` (canonical, hreflang, OG, Twitter, JSON-LD) define exactly what the layout must emit.
- The `:root` token block and class structure in `styles.css` — carried over unchanged.

**Test scenarios:**
- Happy path: layout rendered for an EN page emits `<html lang="en">`, a self-referential `<link rel="canonical">`, and `hreflang` alternates for `en`, `fr`, and `x-default`.
- Happy path: layout rendered for a FR page emits `<html lang="fr">`, the correct `/fr/`-prefixed canonical, and reciprocal `hreflang` alternates pointing back to the EN URL.
- Edge case: a page with no FR counterpart (should none exist) still emits a valid `hreflang`/`x-default` set without a broken alternate — confirm the layout's alternate logic handles the locale map, not a hardcoded pair.
- Happy path: Nav, Footer, and LangSwitch render the correct localized strings for each locale from `src/i18n/ui.ts`.

**Verification:**
- A built EN page and FR page each contain the correct canonical, reciprocal `hreflang`, OG, Twitter, and JSON-LD tags, matching the current site's head output.
- `public/_headers` and `public/_redirects` are present in `dist/` after build.

---

### U3. Port the homepages (EN + FR)

**Goal:** The EN and FR homepages rendered as Astro pages through the shared layout, with content ported from the existing HTML.

**Requirements:** R1, R2, R8

**Dependencies:** U2

**Files:**
- Create: `src/pages/index.astro`, `src/pages/fr/index.astro`
- Create: section components under `src/components/` as the port reveals shared structure (optional, implementer's judgement)

**Approach:**
- Move the body content of `index.html` / `fr/index.html` into the Astro pages, wrapped in `Layout.astro` with the correct per-locale props.
- Preserve the Cal.com popover button (`data-cal-link`) and the inline embed container (`#cal-inline`) plus its init script.
- French copy — including any `<!-- FR copy pending -->` placeholders — carried over verbatim.

**Patterns to follow:**
- `index.html` / `fr/index.html` body structure and class names (which the carried-over `global.css` targets).

**Test scenarios:**
- Happy path: build emits `/` and `/fr/` as directory-style routes (`index.html` under each).
- Happy path: the built `/` page contains the Cal.com popover trigger and the `#cal-inline` container; same for `/fr/`.
- Integration: the built `/` and `/fr/` pages carry the layout-generated canonical and reciprocal `hreflang` tags pointing at each other.

**Verification:**
- `/` and `/fr/` render visually identical to the current live homepages (screenshot comparison).
- Cal.com popover opens and the inline embed loads on both locales.

---

### U4. Port the about and framework pages (EN + FR)

**Goal:** The about and framework pages for both locales rendered as Astro pages through the shared layout.

**Requirements:** R1, R2, R6

**Dependencies:** U2

**Files:**
- Create: `src/pages/about.astro`, `src/pages/fr/about.astro`
- Create: `src/pages/framework.astro`, `src/pages/fr/framework.astro`
- Create: section components under `src/components/` for the framework page if decomposition helps (see Deferred to Implementation)

**Approach:**
- Move body content from `about/index.html`, `fr/about/index.html`, `framework/index.html`, `fr/framework/index.html` into Astro pages wrapped in `Layout.astro`.
- The framework pages are large (~905 lines); break repeated structure into components where it reduces duplication, but do not redesign.
- The `_redirects` rule (`/framework/fr/` → `/fr/framework/`) is carried by U2's `public/_redirects`; this unit just confirms the canonical FR framework URL is `/fr/framework/`.

**Patterns to follow:**
- Existing body structure and class names in the four source HTML files.

**Test scenarios:**
- Happy path: build emits `/about/`, `/fr/about/`, `/framework/`, `/fr/framework/` as directory-style routes.
- Integration: each built page carries the layout-generated canonical and reciprocal `hreflang` tags for its locale pair.
- Edge case: the legacy `/framework/fr/` path resolves to `/fr/framework/` via the carried-over `_redirects` rule (verified against a Workers preview, since redirect handling is edge-level, not build-level).

**Verification:**
- All four pages render visually identical to the current live pages (screenshot comparison).
- The `/framework/fr/` redirect resolves correctly in a `wrangler` preview.

---

### U5. Generated sitemap, old-file cleanup, and deploy finalisation

**Goal:** Confirm the generated sitemap is correct, remove the superseded hand-written files, and finalise the deploy configuration and documentation.

**Requirements:** R5, R6, R9

**Dependencies:** U3, U4

**Files:**
- Delete: `index.html`, `fr/index.html`, `about/index.html`, `fr/about/index.html`, `framework/index.html`, `fr/framework/index.html`
- Delete: `styles.css`, `lang.js`, `sitemap.xml`, `robots.txt`, `favicon.svg`, `_headers`, `_redirects` (repo-root copies — now sourced from `src/` and `public/`)
- Modify: `README.md` (rewrite for the Astro build + Workers deploy workflow)

**Approach:**
- Verify the `@astrojs/sitemap` output includes all six routes with correct `hreflang` alternates, matching the coverage of the current hand-written `sitemap.xml`.
- Remove the old flat HTML files and their assets only after U3/U4 confirm the Astro pages render correctly — at this point `wrangler.jsonc` already serves `dist/`, so the root files are dead weight.
- Rewrite `README.md`: build command (`npm run build`), local preview, and the Workers deploy path (Git-connected Workers Builds or `wrangler deploy`).

**Test scenarios:**
- Happy path: the generated `dist/sitemap-*.xml` (or `sitemap-index.xml`) lists all six URLs, each with `hreflang` alternates for `en`, `fr`, and `x-default`.
- Edge case: no orphaned references to deleted root files remain — a build + grep confirms nothing links to `/styles.css` or `/lang.js` at the old paths.

**Verification:**
- `npm run build` is clean; a `wrangler` preview serves all six routes, the generated sitemap, `robots.txt`, security headers, and the `/framework/fr/` redirect.
- The repo root no longer contains the superseded HTML/CSS/JS files; `README.md` describes the new workflow.

---

## System-Wide Impact

- **Build & deploy pipeline:** the site goes from no-build to an Astro build step. `wrangler.jsonc` changes from serving `./` to serving `./dist`. Deploy changes from "push static files" to "build, then deploy" — via Git-connected Workers Builds or `wrangler deploy`.
- **SEO surfaces:** canonical, `hreflang`, JSON-LD, and `sitemap.xml` move from hand-maintained per-file to layout-generated / build-generated. The generated output must match the current head/sitemap content — this is the highest-fidelity-sensitive area of the migration.
- **Cloudflare edge config:** `_headers` and `_redirects` move from repo root to `public/` (→ `dist/`). Workers static assets honours both files, but the semantics should be confirmed against a preview rather than assumed.
- **Client-side behaviour:** `lang.js` (language banner) and the Cal.com embed are client-side and functionally unchanged — they just need to be carried over and referenced from the layout.
- **Unchanged invariants:** all six public URLs, the `/framework/fr/` redirect, the security headers, and the visual design are explicitly unchanged by this plan.

---

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| `_headers` / `_redirects` semantics differ subtly between Cloudflare Pages and Workers static assets | Verify headers and the `/framework/fr/` redirect against a `wrangler` preview in U4/U5 before considering the migration done |
| HTML→Astro port introduces visual drift, especially on the 905-line framework pages | Screenshot-compare each ported page against the current live site before deleting the old files in U5; `global.css` is carried over unchanged to minimise drift |
| Astro i18n route generation produces `/fr` vs `/fr/` trailing-slash mismatches | Set `trailingSlash` / `build.format` explicitly in U1 and assert directory-style routes in U3/U4 build-output tests |
| Generated sitemap / `hreflang` diverges from the current hand-written coverage | U2 and U5 test scenarios assert reciprocal `hreflang` and full sitemap URL coverage against the known six-route set |
| New build step not wired into the deploy path → site stops updating | U5 rewrites `README.md` with the build+deploy workflow; deploy via Workers Builds or `wrangler deploy` confirmed in U5 verification |

---

## Documentation / Operational Notes

- `README.md` is rewritten in U5: the no-build Cloudflare Pages workflow is replaced with the Astro build (`npm run build`), local preview, and the Workers deploy path.
- The deploy process changes operationally — whoever deploys must now run a build (or rely on Git-connected Workers Builds). This should be called out clearly in the README.
- Plan #2 (Outrank blog) will build directly on this foundation: it adds the `@astrojs/cloudflare` adapter, a Bearer-validated webhook receiver route, a content store binding, and a `/blog/` content collection.

---

## Sources & References

- Related code: `index.html`, `fr/index.html`, `about/index.html`, `fr/about/index.html`, `framework/index.html`, `fr/framework/index.html`, `styles.css`, `lang.js`, `wrangler.jsonc`, `_headers`, `_redirects`, `sitemap.xml`
- External docs: Astro i18n routing, `@astrojs/sitemap`, Cloudflare Workers static assets, [Outrank API Webhook](https://www.outrank.so/docs/webhook)
