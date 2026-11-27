// Turns the Lighthouse CI results in .lighthouseci/ into badge files for
// shields.io, one per category. Each badge shows where the site stands on
// this deploy: the latest run of each page, and the lowest score among the
// pages. CI publishes the files to the `badges` branch after every push to
// main, and the README shows them.
//
//   node scripts/lighthouse-badges.mjs <output directory>

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';

const CATEGORIES = {
  performance: 'performance',
  accessibility: 'accessibility',
  'best-practices': 'best practices',
  seo: 'SEO',
};

const output = process.argv[2];
if (!output) {
  throw new Error('Give an output directory: node scripts/lighthouse-badges.mjs <directory>');
}

const manifest = JSON.parse(await readFile('.lighthouseci/manifest.json', 'utf8'));
if (!manifest.length) {
  throw new Error('No Lighthouse results found in .lighthouseci/manifest.json');
}

// The manifest isn't in time order, so each run's own fetch time decides
// which is the latest for its page.
const latest = new Map();
for (const run of manifest) {
  // Paths in the manifest are from the machine that ran Lighthouse.
  const report = join('.lighthouseci', basename(run.jsonPath));
  const { fetchTime } = JSON.parse(await readFile(report, 'utf8'));
  if (!latest.has(run.url) || fetchTime > latest.get(run.url).fetchTime) {
    latest.set(run.url, { fetchTime, summary: run.summary });
  }
}
const runs = [...latest.values()];

// Lighthouse's own bands: 90 and up is good, 50 to 89 needs work.
const color = (score) => (score >= 90 ? 'brightgreen' : score >= 50 ? 'orange' : 'red');

await mkdir(output, { recursive: true });

for (const [key, label] of Object.entries(CATEGORIES)) {
  const score = Math.round(Math.min(...runs.map((run) => run.summary[key])) * 100);
  const badge = { schemaVersion: 1, label, message: String(score), color: color(score) };
  await writeFile(join(output, `${key}.json`), `${JSON.stringify(badge)}\n`);
  console.log(`${label}: ${score}`);
}
