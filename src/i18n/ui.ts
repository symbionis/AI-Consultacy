// Shared i18n strings and URL helpers for the site chrome.
//
// Pages are identified by a locale-agnostic `pathKey`:
//   ''          → home          (/, /fr/)
//   'about'     → about page    (/about/, /fr/about/)
//   'framework' → framework page (/framework/, /fr/framework/)

export type Locale = 'en' | 'fr';

/** Locale-agnostic page identifier — the closed set of routes the site chrome knows about. */
export type PathKey = '' | 'about' | 'framework';

export const SITE = 'https://franksy.me';

export const ui = {
  en: {
    nav: { about: 'About', framework: 'Framework', portfolio: 'Portfolio' },
    footerCopy: '© 2026 Frank Sykes',
    ogLocale: 'en_US',
  },
  fr: {
    nav: { about: 'À propos', framework: 'Framework', portfolio: 'Portfolio' },
    footerCopy: '© 2026 Frank Sykes, Genève',
    ogLocale: 'fr_FR',
  },
} as const;

/** The opposite locale — EN ⇄ FR. */
export function otherLocale(locale: Locale): Locale {
  return locale === 'en' ? 'fr' : 'en';
}

/** Root-relative path for a page in a given locale, e.g. ('fr', 'about') → '/fr/about/'. */
export function pagePath(locale: Locale, pathKey: PathKey): string {
  const prefix = locale === 'fr' ? '/fr/' : '/';
  const suffix = pathKey ? `${pathKey}/` : '';
  return `${prefix}${suffix}`;
}

/** Absolute URL for a page in a given locale, used for canonical / hreflang / og:url. */
export function pageUrl(locale: Locale, pathKey: PathKey): string {
  return `${SITE}${pagePath(locale, pathKey)}`;
}

/** schema.org reference to Frank — appears as `founder` (homepages) and `author`
 *  (framework pages) across the page JSON-LD blocks. */
export const FRANK_REF = {
  '@type': 'Person',
  '@id': `${SITE}/about/#frank`,
  name: 'Frank Sykes',
} as const;
