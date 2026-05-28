import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { execFileSync } from 'node:child_process';
import { readFileSync, existsSync, rmSync } from 'node:fs';

// PostHog snippet injection — verified against the real build output.
// The prebuild that runs as part of `npm test` has no PUBLIC_POSTHOG_KEY, so
// the main `dist/` is used to assert the snippet is ABSENT. A second build
// into a throwaway directory with env vars set verifies the snippet is PRESENT
// and respects the configured key and host.

const TMP_DIST = 'dist-posthog-test';

describe('PostHog snippet — absent when no key is set (main dist)', () => {
  it('omits posthog.init from EN homepage', () => {
    const html = readFileSync('dist/index.html', 'utf-8');
    expect(html).not.toContain('posthog.init');
  });

  it('omits posthog.init from FR homepage', () => {
    const html = readFileSync('dist/fr/index.html', 'utf-8');
    expect(html).not.toContain('posthog.init');
  });
});

describe('PostHog snippet — injected when env vars are set', () => {
  beforeAll(() => {
    execFileSync('npx', ['astro', 'build', '--outDir', `./${TMP_DIST}`], {
      stdio: 'pipe',
      env: {
        ...process.env,
        PUBLIC_POSTHOG_KEY: 'phc_test_123',
        PUBLIC_POSTHOG_HOST: 'https://custom.example.com',
      },
    });
  });

  afterAll(() => {
    if (existsSync(TMP_DIST)) rmSync(TMP_DIST, { recursive: true, force: true });
  });

  it('EN homepage carries posthog.init with the configured key', () => {
    const html = readFileSync(`${TMP_DIST}/index.html`, 'utf-8');
    expect(html).toContain('posthog.init("phc_test_123"');
  });

  it('EN homepage carries the configured api_host', () => {
    const html = readFileSync(`${TMP_DIST}/index.html`, 'utf-8');
    expect(html).toContain('api_host:"https://custom.example.com"');
  });

  it('FR homepage also carries the snippet — proves layout-level injection covers all locales', () => {
    const html = readFileSync(`${TMP_DIST}/fr/index.html`, 'utf-8');
    expect(html).toContain('posthog.init("phc_test_123"');
  });

  it('inner pages (about, framework) also carry the snippet', () => {
    for (const path of ['about/index.html', 'framework/index.html', 'fr/about/index.html', 'fr/framework/index.html']) {
      const html = readFileSync(`${TMP_DIST}/${path}`, 'utf-8');
      expect(html).toContain('posthog.init("phc_test_123"');
    }
  });

  it('snippet pins config_defaults to the dated value', () => {
    const html = readFileSync(`${TMP_DIST}/index.html`, 'utf-8');
    expect(html).toContain("defaults:'2026-01-30'");
  });
});

describe('PostHog snippet — default host when only key is set', () => {
  const DEFAULT_TMP = 'dist-posthog-default-test';

  beforeAll(() => {
    execFileSync('npx', ['astro', 'build', '--outDir', `./${DEFAULT_TMP}`], {
      stdio: 'pipe',
      env: {
        ...process.env,
        PUBLIC_POSTHOG_KEY: 'phc_default_456',
        // PUBLIC_POSTHOG_HOST intentionally unset
        PUBLIC_POSTHOG_HOST: '',
      },
    });
  });

  afterAll(() => {
    if (existsSync(DEFAULT_TMP)) rmSync(DEFAULT_TMP, { recursive: true, force: true });
  });

  it('falls back to the EU PostHog cloud host', () => {
    const html = readFileSync(`${DEFAULT_TMP}/index.html`, 'utf-8');
    expect(html).toContain('api_host:"https://eu.i.posthog.com"');
  });
});
