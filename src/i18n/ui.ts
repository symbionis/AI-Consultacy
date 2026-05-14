// Shared i18n strings and URL helpers for the site chrome.
//
// Pages are identified by a locale-agnostic `pathKey`:
//   ''          → home          (/, /fr/)
//   'about'     → about page    (/about/, /fr/about/)
//   'framework' → framework page (/framework/, /fr/framework/)

export type Locale = 'en' | 'fr';

export const SITE = 'https://symbionis.ac';

export const ui = {
  en: {
    nav: { about: 'About', framework: 'Framework' },
    footerCopy: '© 2026 Frank Sykes',
    ogLocale: 'en_US',
  },
  fr: {
    nav: { about: 'À propos', framework: 'Framework' },
    footerCopy: '© 2026 Frank Sykes, Genève',
    ogLocale: 'fr_FR',
  },
} as const;

/** Root-relative path for a page in a given locale, e.g. ('fr', 'about') → '/fr/about/'. */
export function pagePath(locale: Locale, pathKey: string): string {
  const prefix = locale === 'fr' ? '/fr/' : '/';
  const suffix = pathKey ? `${pathKey}/` : '';
  return `${prefix}${suffix}`;
}

/** Absolute URL for a page in a given locale, used for canonical / hreflang / og:url. */
export function pageUrl(locale: Locale, pathKey: string): string {
  return `${SITE}${pagePath(locale, pathKey)}`;
}
