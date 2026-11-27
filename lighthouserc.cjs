// Lighthouse CI: scores every page in the sitemap for accessibility, SEO,
// best practices and performance, against the built site served locally.
// Runs in CI after `npm run build`, or locally with `npm run lighthouse`.
// Reports are saved to .lighthouseci/ and uploaded by the workflow; nothing
// is published.

const { readFileSync } = require('node:fs');

const PORT = 4174;
const urls = [...readFileSync('public/sitemap.xml', 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map(
  ([, url]) => `http://localhost:${PORT}${new URL(url).pathname}`,
);

module.exports = {
  ci: {
    collect: {
      startServerCommand: `node scripts/serve.mjs ${PORT}`,
      startServerReadyPattern: 'Serving public',
      url: urls,
      // Three runs per page smooth out timing noise in the performance score.
      numberOfRuns: 3,
      settings: {
        // The canonical URLs point at the live site, not localhost.
        skipAudits: ['canonical'],
        // CI machines don't allow Chrome's sandbox.
        chromeFlags: '--no-sandbox',
      },
    },
    assert: {
      assertions: {
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:seo': ['error', { minScore: 0.95 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        // Performance varies on shared CI machines, so it only warns.
        'categories:performance': ['warn', { minScore: 0.9 }],
      },
    },
    upload: {
      target: 'filesystem',
      outputDir: '.lighthouseci',
    },
  },
};
