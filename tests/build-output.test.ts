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
