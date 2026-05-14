# Symbionis — AI Coaching Practice

Bilingual site (EN/FR) for Frank Sykes' AI coaching practice. Static HTML + CSS, no build step. Deployed to Cloudflare Pages on `symbionis.ac`.

## Structure

```
.
├── index.html              EN homepage (root)
├── fr/
│   └── index.html          FR homepage
├── styles.css              Shared stylesheet
├── favicon.svg             Gold "S" on navy
├── og-image.png            Open Graph image (to be created)
├── framework/              Legacy five-levels page
│   ├── index.html          EN five-levels
│   └── fr/
│       └── index.html      FR five-levels
├── _headers                Cloudflare Pages headers
├── robots.txt
├── sitemap.xml
└── README.md
```

## Editing content

- **Text changes:** edit `index.html` (EN) or `fr/index.html` (FR) directly. No rebuild needed.
- **Styles:** edit `styles.css` — shared by both language pages.
- **FR pending copy:** search for `<!-- FR copy pending -->` in `fr/index.html` to find sections awaiting native French text.

## Cal.com integration

Two embed types, both powered by `embed.js` (loaded once via `<script defer>`):

- **Popover:** any `<button>` with `data-cal-link="franksy/connect"` opens the booking modal on click.
- **Inline:** the `#cal-inline` container in Section 6 renders the booking widget directly on the page.

To change the event slug, update `data-cal-link` attributes and the `calLink` value in the inline init script.

## Fonts

Source Serif 4 (serif headlines) and Inter (body) loaded from Google Fonts with `display=swap`. Non-render-blocking.

## Deploy

Cloudflare Pages, connected to this Git repo:
- **Build command:** *(none)*
- **Build output directory:** `/`
- **Production branch:** `main` → `symbionis.ac`
- **Preview branches:** auto-deploy to `*.pages.dev`

## Adding Frank's portrait

1. Place the image at `frank-portrait.jpg` in the repo root (or `/public/` if the structure changes).
2. In both `index.html` and `fr/index.html`, replace the `.portrait-placeholder` div with:
   ```html
   <img src="/frank-portrait.jpg" alt="Frank Sykes" class="portrait-img" width="560" height="700" loading="lazy">
   ```

## URLs

| Path | Content |
|---|---|
| `/` | EN homepage |
| `/fr/` | FR homepage |
| `/framework/` | Legacy five-levels page (EN) |
| `/framework/fr/` | Legacy five-levels page (FR) |
