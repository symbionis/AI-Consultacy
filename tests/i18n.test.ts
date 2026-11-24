import { describe, it, expect } from 'vitest';
import { pagePath, pageUrl, otherLocale, SITE } from '../src/i18n/ui';

// Direct unit tests for the i18n URL helpers — no build needed, the module is
// imported directly. Complements the build-output suites, which only exercise
// these helpers transitively through rendered pages.

describe('i18n URL helpers', () => {
  it('pagePath builds root-relative, directory-style paths per locale', () => {
    expect(pagePath('en', '')).toBe('/');
    expect(pagePath('en', 'about')).toBe('/about/');
    expect(pagePath('fr', '')).toBe('/fr/');
    expect(pagePath('fr', 'coaching')).toBe('/fr/coaching/');
    expect(pagePath('en', 'organisations')).toBe('/organisations/');
  });

  it('pageUrl prefixes the site origin onto the page path', () => {
    expect(pageUrl('en', '')).toBe(`${SITE}/`);
    expect(pageUrl('en', 'about')).toBe(`${SITE}/about/`);
    expect(pageUrl('fr', '')).toBe(`${SITE}/fr/`);
    expect(pageUrl('fr', 'coaching')).toBe(`${SITE}/fr/coaching/`);
  });

  it('otherLocale flips EN ⇄ FR', () => {
    expect(otherLocale('en')).toBe('fr');
    expect(otherLocale('fr')).toBe('en');
  });
});
