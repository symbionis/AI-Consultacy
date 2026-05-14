import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { parse } from 'node-html-parser';

// Build-output assertions. `npm test` runs `astro build` first, so these read
// the real generated files in `dist/` rather than mocked component renders.
// Coverage grows as pages land: U2 added the layout head assertions; U3/U4 add
// per-page route and content assertions; U5 adds the sitemap assertions.

const dist = (path: string) => {
  const file = `dist/${path}`;
  if (!existsSync(file)) throw new Error(`Expected build output at ${file} — run \`npm run build\``);
  return parse(readFileSync(file, 'utf-8'));
};

describe('U2 — shared layout head generation (EN homepage)', () => {
  const doc = () => dist('index.html');

  it('sets <html lang> to the page locale', () => {
    expect(doc().querySelector('html')?.getAttribute('lang')).toBe('en');
  });

  it('emits a self-referential canonical', () => {
    const canonical = doc().querySelector('link[rel="canonical"]')?.getAttribute('href');
    expect(canonical).toBe('https://symbionis.ac/');
  });

  it('emits reciprocal hreflang alternates including x-default', () => {
    const alternates = doc()
      .querySelectorAll('link[rel="alternate"]')
      .map((el) => [el.getAttribute('hreflang'), el.getAttribute('href')]);
    expect(alternates).toEqual(
      expect.arrayContaining([
        ['en', 'https://symbionis.ac/'],
        ['fr', 'https://symbionis.ac/fr/'],
        ['x-default', 'https://symbionis.ac/'],
      ]),
    );
  });

  it('emits Open Graph locale tags for the page locale', () => {
    const og = (prop: string) =>
      doc().querySelector(`meta[property="${prop}"]`)?.getAttribute('content');
    expect(og('og:locale')).toBe('en_US');
    expect(og('og:locale:alternate')).toBe('fr_FR');
    expect(og('og:type')).toBe('website');
  });

  it('includes the Google Fonts stylesheet, favicon, JSON-LD, and lang.js', () => {
    const head = doc().querySelector('head')!;
    expect(head.querySelector('link[href*="fonts.googleapis.com/css2"]')).toBeTruthy();
    expect(head.querySelector('link[rel="icon"]')?.getAttribute('href')).toBe('/favicon.svg');
    expect(head.querySelector('script[type="application/ld+json"]')).toBeTruthy();
    expect(head.querySelector('script[src="/lang.js"]')).toBeTruthy();
  });

  it('renders the shared nav and footer chrome', () => {
    const d = doc();
    expect(d.querySelector('header.site-nav')).toBeTruthy();
    expect(d.querySelector('footer.site-footer')).toBeTruthy();
    // lang-switch appears in both nav and footer
    expect(d.querySelectorAll('.lang-switch').length).toBe(2);
  });
});

describe('U3 — homepages (EN + FR)', () => {
  it('emits / and /fr/ as directory-style routes', () => {
    expect(existsSync('dist/index.html')).toBe(true);
    expect(existsSync('dist/fr/index.html')).toBe(true);
  });

  it('the FR homepage sets lang=fr and a /fr/-prefixed canonical', () => {
    const fr = dist('fr/index.html');
    expect(fr.querySelector('html')?.getAttribute('lang')).toBe('fr');
    expect(fr.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(
      'https://symbionis.ac/fr/',
    );
  });

  it('EN and FR homepages carry reciprocal hreflang alternates', () => {
    for (const path of ['index.html', 'fr/index.html']) {
      const alternates = dist(path)
        .querySelectorAll('link[rel="alternate"]')
        .map((el) => [el.getAttribute('hreflang'), el.getAttribute('href')]);
      expect(alternates).toEqual(
        expect.arrayContaining([
          ['en', 'https://symbionis.ac/'],
          ['fr', 'https://symbionis.ac/fr/'],
          ['x-default', 'https://symbionis.ac/'],
        ]),
      );
    }
  });

  it('both homepages render the Cal.com inline embed (container + loader)', () => {
    for (const path of ['index.html', 'fr/index.html']) {
      const d = dist(path);
      expect(d.querySelector('#cal-inline')?.classNames).toContain('cal-inline-wrap');
      const html = d.toString();
      expect(html).toContain('app.cal.com/embed/embed.js');
      expect(html).toContain('franksy/connect');
    }
  });

  it('the about-teaser link is locale-correct on each homepage', () => {
    expect(
      dist('index.html')
        .querySelectorAll('a')
        .some((a) => a.getAttribute('href') === '/about/'),
    ).toBe(true);
    expect(
      dist('fr/index.html')
        .querySelectorAll('a')
        .some((a) => a.getAttribute('href') === '/fr/about/'),
    ).toBe(true);
  });
});

describe('U4 — about and framework pages (EN + FR)', () => {
  const routes: Array<[string, string]> = [
    ['about/index.html', 'https://symbionis.ac/about/'],
    ['fr/about/index.html', 'https://symbionis.ac/fr/about/'],
    ['framework/index.html', 'https://symbionis.ac/framework/'],
    ['fr/framework/index.html', 'https://symbionis.ac/fr/framework/'],
  ];

  it('emits all four pages as directory-style routes', () => {
    for (const [path] of routes) expect(existsSync(`dist/${path}`)).toBe(true);
  });

  it('each page carries a self-referential canonical', () => {
    for (const [path, canonical] of routes) {
      expect(dist(path).querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(
        canonical,
      );
    }
  });

  it('each page carries reciprocal hreflang for its locale pair', () => {
    const pairs: Array<[string, string, string]> = [
      ['about/index.html', 'https://symbionis.ac/about/', 'https://symbionis.ac/fr/about/'],
      ['fr/about/index.html', 'https://symbionis.ac/about/', 'https://symbionis.ac/fr/about/'],
      ['framework/index.html', 'https://symbionis.ac/framework/', 'https://symbionis.ac/fr/framework/'],
      ['fr/framework/index.html', 'https://symbionis.ac/framework/', 'https://symbionis.ac/fr/framework/'],
    ];
    for (const [path, enUrl, frUrl] of pairs) {
      const alternates = dist(path)
        .querySelectorAll('link[rel="alternate"]')
        .map((el) => [el.getAttribute('hreflang'), el.getAttribute('href')]);
      expect(alternates).toEqual(
        expect.arrayContaining([
          ['en', enUrl],
          ['fr', frUrl],
          ['x-default', enUrl],
        ]),
      );
    }
  });

  it('framework pages declare og:type article and an Article JSON-LD', () => {
    for (const path of ['framework/index.html', 'fr/framework/index.html']) {
      const d = dist(path);
      expect(d.querySelector('meta[property="og:type"]')?.getAttribute('content')).toBe('article');
      const ld = d.querySelector('script[type="application/ld+json"]')?.text ?? '';
      expect(JSON.parse(ld)['@type']).toBe('Article');
    }
  });

  it('framework pages render the Cal embed with the framework-specific id', () => {
    for (const path of ['framework/index.html', 'fr/framework/index.html']) {
      expect(dist(path).querySelector('#my-cal-inline-connect')).toBeTruthy();
    }
  });

  it('about pages mark the active nav link with aria-current', () => {
    for (const path of ['about/index.html', 'fr/about/index.html']) {
      const active = dist(path)
        .querySelectorAll('.site-nav a[aria-current="page"]')
        .map((a) => a.text.trim());
      expect(active.length).toBe(1);
    }
  });
});

describe('U5 — generated sitemap', () => {
  const allRoutes = [
    'https://symbionis.ac/',
    'https://symbionis.ac/about/',
    'https://symbionis.ac/framework/',
    'https://symbionis.ac/fr/',
    'https://symbionis.ac/fr/about/',
    'https://symbionis.ac/fr/framework/',
  ];

  it('sitemap-index.xml references the URL set', () => {
    expect(existsSync('dist/sitemap-index.xml')).toBe(true);
    const index = readFileSync('dist/sitemap-index.xml', 'utf-8');
    expect(index).toContain('sitemap-0.xml');
  });

  it('lists every page route', () => {
    const sitemap = readFileSync('dist/sitemap-0.xml', 'utf-8');
    for (const url of allRoutes) {
      expect(sitemap).toContain(`<loc>${url}</loc>`);
    }
  });

  it('emits en/fr hreflang alternates for each entry', () => {
    const sitemap = readFileSync('dist/sitemap-0.xml', 'utf-8');
    const entries = sitemap.match(/<url>.*?<\/url>/gs) ?? [];
    expect(entries.length).toBe(allRoutes.length);
    for (const entry of entries) {
      expect(entry).toContain('hreflang="en"');
      expect(entry).toContain('hreflang="fr"');
    }
  });

  it('robots.txt points at the generated sitemap index', () => {
    const robots = readFileSync('dist/robots.txt', 'utf-8');
    expect(robots).toContain('Sitemap: https://symbionis.ac/sitemap-index.xml');
  });

  it('carries the Cloudflare edge config into the build output', () => {
    expect(existsSync('dist/_headers')).toBe(true);
    expect(existsSync('dist/_redirects')).toBe(true);
    const redirects = readFileSync('dist/_redirects', 'utf-8');
    // both legacy framework redirect rules are preserved
    expect(redirects).toContain('/framework/fr/');
    expect(redirects).toContain('/framework/fr/*');
  });
});
