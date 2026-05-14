import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { parse, type HTMLElement } from 'node-html-parser';

// Build-output assertions. `npm test` runs `astro build` first, so these read
// the real generated files in `dist/` rather than mocked component renders.

// The site's six routes — the single source of truth for every suite below.
const ROUTES = [
  { path: 'index.html', url: 'https://symbionis.ac/', locale: 'en' },
  { path: 'fr/index.html', url: 'https://symbionis.ac/fr/', locale: 'fr' },
  { path: 'about/index.html', url: 'https://symbionis.ac/about/', locale: 'en' },
  { path: 'fr/about/index.html', url: 'https://symbionis.ac/fr/about/', locale: 'fr' },
  { path: 'framework/index.html', url: 'https://symbionis.ac/framework/', locale: 'en' },
  { path: 'fr/framework/index.html', url: 'https://symbionis.ac/fr/framework/', locale: 'fr' },
] as const;

/** Reciprocal hreflang pair for a route — its EN and FR counterparts. */
const alternatesFor = (path: string) => {
  const enUrl = `https://symbionis.ac/${path.replace(/^fr\//, '').replace('index.html', '')}`;
  const frUrl = `https://symbionis.ac/fr/${path.replace(/^fr\//, '').replace('index.html', '')}`;
  return { enUrl, frUrl };
};

const distCache = new Map<string, HTMLElement>();
const dist = (path: string): HTMLElement => {
  const file = `dist/${path}`;
  if (!distCache.has(file)) {
    if (!existsSync(file)) throw new Error(`Expected build output at ${file} — run \`npm run build\``);
    distCache.set(file, parse(readFileSync(file, 'utf-8')));
  }
  return distCache.get(file)!;
};

/** Asserts a page carries reciprocal en/fr/x-default hreflang alternates. */
function expectReciprocalHreflang(doc: HTMLElement, enUrl: string, frUrl: string) {
  const alternates = doc
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

describe('U2 — shared layout head generation (EN homepage)', () => {
  it('sets <html lang> to the page locale', () => {
    expect(dist('index.html').querySelector('html')?.getAttribute('lang')).toBe('en');
  });

  it('emits a self-referential canonical', () => {
    expect(dist('index.html').querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(
      'https://symbionis.ac/',
    );
  });

  it('emits reciprocal hreflang alternates including x-default', () => {
    expectReciprocalHreflang(dist('index.html'), 'https://symbionis.ac/', 'https://symbionis.ac/fr/');
  });

  it('emits Open Graph locale tags for the page locale', () => {
    const og = (prop: string) =>
      dist('index.html').querySelector(`meta[property="${prop}"]`)?.getAttribute('content');
    expect(og('og:locale')).toBe('en_US');
    expect(og('og:locale:alternate')).toBe('fr_FR');
    expect(og('og:type')).toBe('website');
  });

  it('includes the Google Fonts stylesheet, favicon, JSON-LD, and lang.js', () => {
    const head = dist('index.html').querySelector('head')!;
    expect(head.querySelector('link[href*="fonts.googleapis.com/css2"]')).toBeTruthy();
    expect(head.querySelector('link[rel="icon"]')?.getAttribute('href')).toBe('/favicon.svg');
    expect(head.querySelector('script[type="application/ld+json"]')).toBeTruthy();
    expect(head.querySelector('script[src="/lang.js"]')).toBeTruthy();
  });

  it('renders the shared nav and footer chrome', () => {
    const d = dist('index.html');
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

  it('the FR homepage emits Open Graph locale tags for the FR locale', () => {
    const og = (prop: string) =>
      dist('fr/index.html').querySelector(`meta[property="${prop}"]`)?.getAttribute('content');
    expect(og('og:locale')).toBe('fr_FR');
    expect(og('og:locale:alternate')).toBe('en_US');
  });

  it('EN and FR homepages carry reciprocal hreflang alternates', () => {
    for (const path of ['index.html', 'fr/index.html']) {
      expectReciprocalHreflang(dist(path), 'https://symbionis.ac/', 'https://symbionis.ac/fr/');
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

  it('the lang-switch links to the other-locale homepage on each homepage', () => {
    const checkSwitches = (path: string, href: string, hreflang: string) => {
      const links = dist(path)
        .querySelectorAll('.lang-switch a')
        .map((a) => [a.getAttribute('href'), a.getAttribute('hreflang')]);
      expect(links.length).toBeGreaterThan(0);
      for (const [linkHref, linkHreflang] of links) {
        expect(linkHref).toBe(href);
        expect(linkHreflang).toBe(hreflang);
      }
    };
    checkSwitches('index.html', '/fr/', 'fr');
    checkSwitches('fr/index.html', '/', 'en');
  });

  it('the about-teaser link is locale-correct on each homepage', () => {
    const hasLink = (path: string, href: string) =>
      dist(path)
        .querySelectorAll('a')
        .some((a) => a.getAttribute('href') === href);
    expect(hasLink('index.html', '/about/')).toBe(true);
    expect(hasLink('fr/index.html', '/fr/about/')).toBe(true);
  });
});

describe('U4 — about and framework pages (EN + FR)', () => {
  const innerPages = ROUTES.filter((r) => r.path !== 'index.html' && r.path !== 'fr/index.html');

  it('emits all four inner pages as directory-style routes', () => {
    for (const { path } of innerPages) expect(existsSync(`dist/${path}`)).toBe(true);
  });

  it('each page carries a self-referential canonical', () => {
    for (const { path, url } of innerPages) {
      expect(dist(path).querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(url);
    }
  });

  it('each page carries reciprocal hreflang for its locale pair', () => {
    for (const { path } of innerPages) {
      const { enUrl, frUrl } = alternatesFor(path);
      expectReciprocalHreflang(dist(path), enUrl, frUrl);
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

  it('about and framework pages mark exactly one active nav link with aria-current', () => {
    for (const path of [
      'about/index.html',
      'fr/about/index.html',
      'framework/index.html',
      'fr/framework/index.html',
    ]) {
      expect(dist(path).querySelectorAll('.site-nav a[aria-current="page"]').length).toBe(1);
    }
  });

  it('homepages mark no nav link with aria-current', () => {
    for (const path of ['index.html', 'fr/index.html']) {
      expect(dist(path).querySelectorAll('.site-nav a[aria-current="page"]').length).toBe(0);
    }
  });
});

describe('U5 — generated sitemap', () => {
  const sitemap = () => readFileSync('dist/sitemap-0.xml', 'utf-8');

  it('sitemap-index.xml references the URL set', () => {
    expect(existsSync('dist/sitemap-index.xml')).toBe(true);
    expect(readFileSync('dist/sitemap-index.xml', 'utf-8')).toContain('sitemap-0.xml');
  });

  it('lists every page route', () => {
    const xml = sitemap();
    for (const { url } of ROUTES) expect(xml).toContain(`<loc>${url}</loc>`);
  });

  it('emits en/fr hreflang alternates for each entry', () => {
    const entries = sitemap().match(/<url>.*?<\/url>/gs) ?? [];
    expect(entries.length).toBe(ROUTES.length);
    for (const entry of entries) {
      expect(entry).toContain('hreflang="en"');
      expect(entry).toContain('hreflang="fr"');
    }

    // For a known route pair, assert the alternates carry the correct
    // reciprocal href — not just that the hreflang attribute is present.
    const aboutEntry = entries.find((e) => e.includes('<loc>https://symbionis.ac/about/</loc>'));
    expect(aboutEntry).toBeDefined();
    expect(aboutEntry).toContain(
      '<xhtml:link rel="alternate" hreflang="en" href="https://symbionis.ac/about/"/>',
    );
    expect(aboutEntry).toContain(
      '<xhtml:link rel="alternate" hreflang="fr" href="https://symbionis.ac/fr/about/"/>',
    );
  });

  it('robots.txt points at the generated sitemap index', () => {
    expect(readFileSync('dist/robots.txt', 'utf-8')).toContain(
      'Sitemap: https://symbionis.ac/sitemap-index.xml',
    );
  });

  it('carries the Cloudflare edge config into the build output', () => {
    expect(existsSync('dist/_headers')).toBe(true);
    expect(existsSync('dist/_redirects')).toBe(true);
    const redirects = readFileSync('dist/_redirects', 'utf-8');
    // both legacy framework redirect rules are preserved — matched as whole
    // rule lines so neither can be dropped without failing the test (the bare
    // rule is a substring of the wildcard rule).
    expect(redirects).toMatch(/^\/framework\/fr\/\s+\/fr\/framework\/\s+301/m);
    expect(redirects).toMatch(/^\/framework\/fr\/\*\s+\/fr\/framework\/\s+301/m);
  });
});
