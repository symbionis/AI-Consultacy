# The 5 Levels of AI Fluency — Static Site

Bilingual framework page (EN/FR) for Frank Sykes' AI coaching practice. Two self-contained HTML files, no build step.

## Structure

```
.
├── index.html         English (default, root)
├── fr/
│   └── index.html     French
├── _headers           Cloudflare Pages: cache + security headers
├── robots.txt
├── sitemap.xml        Update YOUR-DOMAIN.com before deploying
└── README.md          this file
```

Each HTML file is fully self-contained (inline CSS + JS, no external deps). No npm, no build, no framework.

## Deploy to Cloudflare Pages

### Option A — Direct upload (fastest)

1. Go to https://dash.cloudflare.com → **Workers & Pages** → **Create application** → **Pages** → **Upload assets**
2. Name the project (e.g. `franxclaw` or `ai-fluency`)
3. Drag this entire folder (or upload the zip) into the upload area
4. Click **Deploy**
5. You'll get a `*.pages.dev` URL within ~30 seconds

### Option B — Connect a Git repo (for ongoing edits)

1. Push this folder to GitHub/GitLab
2. Cloudflare Pages → **Connect to Git** → select the repo
3. Build settings: leave **Build command** empty, set **Build output directory** to `/`
4. Deploy

### Custom domain

1. In your Pages project → **Custom domains** → **Set up a custom domain**
2. Enter the domain you want (e.g. `ai.franksykes.com` or `fluency.syks.ch`)
3. Cloudflare handles SSL automatically

## Before going live

- **Update `sitemap.xml`** — replace `YOUR-DOMAIN.com` with the real domain
- **Test the language switcher** — the EN/FR link in the footer should round-trip cleanly
- **Test dark/light mode** — page respects `prefers-color-scheme` automatically

## Routing notes

- `/` → English (index.html at root)
- `/fr/` → French (index.html inside /fr/)
- Cloudflare Pages auto-resolves `/fr/` to `/fr/index.html` — no rewrite rules needed
- The `_headers` file adds basic security headers and 1-hour cache on HTML

## Editing content

Each file is one HTML document with inline `<style>` and `<script>` blocks. To edit text, search for the section you want and modify directly. No rebuild needed — just re-upload to Cloudflare.

If you change the EN version, mirror the same change in `fr/index.html` (and translate). The structure of both files is identical.

## Footer language switcher

The EN page footer links to `/fr/`. The FR page footer links to `/`. If you change the URL structure, update the `href` in both files.
