// Turns the Lighthouse CI results in .lighthouseci/ into badge files for
// shields.io, one per category. Each badge shows the lowest score across the
// site's pages, from each page's representative (median) run. CI publishes
// the files to the `badges` branch after every push to main, and the README
// shows them.
//
//   node scripts/lighthouse-badges.mjs <output directory>

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

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
const runs = manifest.filter((run) => run.isRepresentativeRun);
if (!runs.length) {
  throw new Error('No Lighthouse results found in .lighthouseci/manifest.json');
}

// Lighthouse's own bands: 90 and up is good, 50 to 89 needs work.
const color = (score) => (score >= 90 ? 'brightgreen' : score >= 50 ? 'orange' : 'red');

await mkdir(output, { recursive: true });

for (const [key, label] of Object.entries(CATEGORIES)) {
  const score = Math.round(Math.min(...runs.map((run) => run.summary[key])) * 100);
  const badge = { schemaVersion: 1, label, message: String(score), color: color(score) };
  await writeFile(join(output, `${key}.json`), `${JSON.stringify(badge)}\n`);
  console.log(`${label}: ${score}`);
}
