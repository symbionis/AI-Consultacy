# Social preview cards

`card.html` draws the 1200x630 image shown when a page link is shared. The
rendered PNGs live in `public/og/`, one per page and language, and
`public/og-image.png` (the homepage card in English) is the fallback.

To redraw one:

1. Copy `card.html` into `public/` and serve that folder (`python3 -m http.server 4330 --directory public`).
2. Open `http://localhost:4330/card.html?t=<title>&s=<sub-line>` at 1200x630 and save a screenshot.
3. Save it as `public/og/<page>-<lang>.png`, then delete the copy from `public/`.

The titles and sub-lines used today match each page's hero.
