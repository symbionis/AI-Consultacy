// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  // Used for canonical URLs and the generated sitemap.
  site: 'https://symbionis.ac',

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
    }),
  ],
});
