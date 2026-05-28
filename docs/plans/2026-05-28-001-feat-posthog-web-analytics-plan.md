---
title: "feat: Add PostHog web analytics"
status: active
created: 2026-05-28
type: feat
depth: lightweight
---

# feat: Add PostHog web analytics

## Summary

Add PostHog web analytics (pageviews + autocapture) to franksy.me. Snippet renders from `src/layouts/Layout.astro` so every page is covered. A new PostHog project is provisioned on the EU cloud; its public key and host are injected at build time via `PUBLIC_POSTHOG_KEY` / `PUBLIC_POSTHOG_HOST` env vars (Astro convention). No session replay, no custom events — just the standard JS snippet with the dated `config_defaults` so PostHog's recommended modern defaults apply.

## Problem Frame

Frank has no analytics on franksy.me today. He wants to know which pages get traffic, which CTAs get clicks (autocapture), and how EN vs FR splits — without writing custom event code or running a heavier tool. PostHog's autocapture snippet is the lightest way to get that signal, and Frank already uses PostHog for another project.

## Requirements

- **R1.** Pageviews are captured on every route (home, about, framework, fr/* variants).
- **R2.** Autocapture is on (clicks, form submits) — no per-element instrumentation needed for v1.
- **R3.** Key and host are config, not hardcoded — rotatable without a code change.
- **R4.** Builds succeed when env vars are unset (local `npm run build` without keys), but skip injecting the snippet so dev/preview don't pollute prod data.
- **R5.** Production deploys on Cloudflare Pages have the env vars set so live traffic reports.
- **R6.** No regression to existing head tags, JSON-LD, fonts, or scroll-reveal behavior.

## Key Technical Decisions

- **Snippet placement: `src/layouts/Layout.astro` `<head>`, before fonts.** Every page extends this layout, so a single edit covers the site. Placing before fonts means the analytics script begins fetching as early as possible without blocking render (the snippet is async).
- **Use the official JS snippet, not posthog-js npm package.** The site is static (`output: 'static'`) and pure-HTML. The snippet is ~1KB inline + async fetch of array.js; adding a JS dep means bundling, which this site does not currently do. Snippet keeps the zero-bundle posture.
- **`config_defaults: '2025-05-24'`.** Per PostHog docs (Jan 2026), pin the defaults date so future SDK upgrades don't silently change behavior. Picks up modern recommended config (exception autocapture off by default, web vitals on, etc.).
- **EU host (`https://eu.i.posthog.com`) via env var.** Frank is CH/EU-based; EU residency matters. Hardcoded host would require a code change to switch later.
- **Render snippet only when key is present.** Astro template `{import.meta.env.PUBLIC_POSTHOG_KEY && (...)}` — local dev without keys produces no snippet, so localhost noise never reaches prod. The `PUBLIC_` prefix is required for Astro to inline the value at build into client HTML.
- **No `is:inline` set:html injection of the snippet body.** Use a plain `<script>` tag with the snippet's contents inside an Astro template literal. The snippet has no Astro template syntax to escape, so this stays clean.

## Implementation Units

### U1. Provision PostHog project and capture credentials

**Goal:** A new PostHog project exists on EU cloud; project API key and host are recorded for use in U2/U3.

**Dependencies:** none

**Files:** none (external action)

**Approach:**
- In PostHog EU (`https://eu.posthog.com`), create a new project named "franksy.me".
- Copy the project API key (starts with `phc_`).
- Confirm host is `https://eu.i.posthog.com`.
- Stash both values for U3 (Cloudflare env vars).

**Verification:** Project visible in PostHog EU org; key copied; no events yet (expected — snippet not deployed).

---

### U2. Add PostHog snippet to Layout

**Goal:** The shared layout renders PostHog's official JS snippet in `<head>` when `PUBLIC_POSTHOG_KEY` is set, otherwise renders nothing. Covers R1, R2, R3, R4, R6.

**Dependencies:** U1 (need a real key to smoke-test, though the code works without)

**Files:**
- `src/layouts/Layout.astro` (modify)
- `.env.example` (create) — document required env vars
- `tests/posthog-snippet.test.ts` (create) — verifies snippet presence/absence in built HTML

**Approach:**
- Read `PUBLIC_POSTHOG_KEY` and `PUBLIC_POSTHOG_HOST` (default `https://eu.i.posthog.com`) from `import.meta.env` at the top of the frontmatter.
- In `<head>`, before the fonts `<link rel="preconnect">` lines, emit the snippet conditionally:
  ```
  {posthogKey && (
    <script is:inline define:vars={{ posthogKey, posthogHost }}>
      !function(t,e){ /* official PostHog snippet body */ }(document,window);
      posthog.init(posthogKey, {
        api_host: posthogHost,
        defaults: '2025-05-24',
      });
    </script>
  )}
  ```
- Source the snippet body verbatim from PostHog's current JS install snippet (https://posthog.com/docs/libraries/js — copy the minified loader, do not paraphrase).
- Use `define:vars` (Astro's safe interpolation) so the key/host are passed in without string concatenation into the script body.
- Add a brief frontmatter comment block above the new code: "Analytics snippet — see docs/plans/2026-05-28-001-..." — actually skip the comment per repo's no-comment-explaining-what default; the code is self-explanatory.
- Create `.env.example` at repo root with `PUBLIC_POSTHOG_KEY=` and `PUBLIC_POSTHOG_HOST=https://eu.i.posthog.com` placeholders. Existing `.gitignore` already excludes `.env*` while keeping `!.env.example`, so no gitignore change needed.

**Patterns to follow:**
- Other `<script>` tags in `Layout.astro` already use `is:inline` (lang script, JSON-LD, scroll-reveal) — match that style.
- `define:vars` is Astro's idiomatic way to pass server-side values into inline client scripts.

**Test scenarios:**
- Build with `PUBLIC_POSTHOG_KEY=phc_test_123 npm run build`; assert `dist/index.html` contains `posthog.init('phc_test_123'` and `eu.i.posthog.com`.
- Build with no env vars; assert `dist/index.html` does NOT contain `posthog.init`.
- Build with `PUBLIC_POSTHOG_KEY=phc_test_123 PUBLIC_POSTHOG_HOST=https://custom.example.com npm run build`; assert custom host is used.
- Assert the FR home (`dist/fr/index.html`) also contains the snippet when key is set — proves the layout-level injection covers all locales.

**Verification:** `npm run test` passes. Manually: `PUBLIC_POSTHOG_KEY=<real key> npm run build && npm run preview`, open localhost, confirm PostHog Live Events shows a pageview within ~30s.

---

### U3. Configure Cloudflare Pages production env vars

**Goal:** Production deploys inject the real key so live traffic reaches PostHog. Covers R5.

**Dependencies:** U1 (need key), U2 (need code that reads the vars)

**Files:** none in repo; configuration is in Cloudflare dashboard or `wrangler.jsonc` if we choose to commit non-secret vars.

**Approach:**
- Set `PUBLIC_POSTHOG_KEY` and `PUBLIC_POSTHOG_HOST` as **build-time** environment variables on the Cloudflare Pages project (Settings → Environment variables → Production scope). They must be available during `npm run build` because Astro inlines `import.meta.env.PUBLIC_*` at build, not at runtime.
- The PostHog project key is technically public (it ships in every HTML response), so committing it to `wrangler.jsonc` `vars` would also work. Prefer Cloudflare dashboard env vars for consistency and so rotation doesn't need a git commit.
- Do not set the vars in Preview scope unless we want preview deploys to also report — recommend leaving Preview unset so PR previews don't pollute analytics.
- Trigger a redeploy after setting vars.

**Test scenarios:** none (deploy verification only)

**Verification:** After redeploy, visit `https://franksy.me/`, then check PostHog → Activity → Live events; a `$pageview` event with `$current_url: https://franksy.me/` appears within ~30s.

---

## Scope Boundaries

**In scope (this plan):**
- Pageviews and autocapture via the official snippet.
- EN + FR coverage via shared layout.
- Build-time env var configuration.

### Deferred to Follow-Up Work

- Custom events (Cal.com booking click, language switch, framework page CTA).
- Session replay.
- Web vitals dashboards / funnels in PostHog UI.
- Cookie consent banner — EU residency does not by itself require a banner; PostHog's modern defaults (`config_defaults: '2025-05-24'`) reduce PII capture, but if Frank decides to add a consent flow later, that's a separate plan.
- Identifying logged-in users (no auth on franksy.me).

## Risks & Dependencies

- **Snippet drift.** If PostHog changes their official snippet loader, ours will go stale. Mitigation: low risk — the loader has been stable for years; revisit only if PostHog publishes a SDK migration notice.
- **Build fails if env var typo.** Astro silently treats undefined `import.meta.env.PUBLIC_*` as `undefined`, so the conditional gracefully no-ops. Low risk.
- **Cloudflare Pages env var not picked up.** Build-time vars must be set BEFORE the build runs. If set after, the snippet won't be in the deployed HTML. Verification step catches this.

## Sources & Research

- Existing layout pattern: `src/layouts/Layout.astro` — head structure, inline scripts, `is:inline` and `define:vars` usage.
- Astro static output with `output: 'static'` confirmed in `astro.config.mjs` — no SSR adapter needed.
- PostHog JS install snippet and `config_defaults` dated-pinning convention: https://posthog.com/docs/libraries/js (verify current snippet body at implementation time).
- `.gitignore` already handles `.env*` exclusion with `!.env.example` exception.
