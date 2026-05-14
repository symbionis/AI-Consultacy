import { defineConfig } from 'vitest/config';

// Build-output assertion tests: each suite runs `astro build` (or assumes a
// prior build) and asserts against the generated files in `dist/`. This keeps
// verification of i18n routing, canonical/hreflang generation, and the sitemap
// honest against real output rather than mocked component renders.
export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    testTimeout: 60_000,
  },
});
