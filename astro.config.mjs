// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  // Used for canonical URLs and the generated sitemap.
  site: 'https://franksy.me',

  // Pure static output — no SSR adapter. The Outrank-powered blog (plan #2)
  // will add the Cloudflare adapter for its single dynamic webhook route.
  output: 'static',

  // Directory-style URLs (`/about/`, `/fr/framework/`) matching the current site.
  trailingSlash: 'always',
  build: { format: 'directory' },

  // EN served unprefixed at `/`, FR served under `/fr/`.
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'fr'],
    routing: {
      prefixDefaultLocale: false,
    },
  },

  integrations: [
    sitemap({
      // Emits <xhtml:link rel="alternate" hreflang="..."> alternates per URL.
      // Locale keys map to the hreflang codes used on the current site (`en`, `fr`).
      i18n: {
        defaultLocale: 'en',
        locales: {
          en: 'en',
          fr: 'fr',
        },
      },
      // The i18n option emits en/fr alternates but no x-default and no lastmod.
      // Add both so the generated sitemap matches the alternate coverage of the
      // old hand-maintained sitemap.xml: x-default points at the EN URL, and
      // lastmod is stamped at build time.
      serialize(item) {
        const enLink = item.links?.find((l) => l.lang === 'en');
        if (item.links && enLink && !item.links.some((l) => l.lang === 'x-default')) {
          item.links.push({ lang: 'x-default', url: enLink.url });
        }
        item.lastmod = new Date().toISOString();
        return item;
      },
    }),
  ],
});
