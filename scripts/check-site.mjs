// Checks the built site for accessibility and search metadata. Runs in CI on
// every pull request, after `npm run build`:
//
//   npm run check
//
// Every page in sitemap.xml is loaded in a browser and checked for:
//   - accessibility violations, found by axe
//   - console errors, including Content-Security-Policy violations
//   - images that fail to load, after scrolling so lazy images load
//   - search and sharing metadata: a title, description and canonical URL
//     matching the sitemap; Open Graph and Twitter card tags with absolute
//     URLs and a preview image that exists; and JSON-LD that parses, with
//     the right type and the fields search engines need
// The feed and robots.txt are checked against the sitemap too.

import { spawn } from 'node:child_process';
import { access, readFile } from 'node:fs/promises';
import { join } from 'node:path';

import AxeBuilder from '@axe-core/playwright';
import { chromium } from 'playwright';

const root = new URL('..', import.meta.url).pathname;
const SITE = 'https://www.brianmcallister.com';
const PORT = 4173;
const LOCAL = `http://localhost:${PORT}`;

const failures = [];
const warnings = [];
const fail = (page, message) => failures.push(`${page}: ${message}`);
const warn = (page, message) => warnings.push(`${page}: ${message}`);

const exists = (path) =>
  access(path).then(
    () => true,
    () => false,
  );

// Site-wide files

const sitemap = await readFile(join(root, 'public', 'sitemap.xml'), 'utf8');
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
const posts = urls.filter((url) => url.includes('/writing/'));

const feed = await readFile(join(root, 'public', 'feed.xml'), 'utf8');
const feedLinks = [...feed.matchAll(/<link>([^<]+)<\/link>/g)].map((match) => match[1]).slice(1);
if (feedLinks.join() !== posts.join()) {
  fail('feed.xml', `lists ${feedLinks.length} posts, but the sitemap has ${posts.length}, or in a different order`);
}

const robots = await readFile(join(root, 'public', 'robots.txt'), 'utf8');
if (!robots.includes(`Sitemap: ${SITE}/sitemap.xml`)) {
  fail('robots.txt', 'does not point to the sitemap');
}

// Pages

const server = spawn(process.execPath, [join(root, 'scripts', 'serve.mjs'), String(PORT)], { stdio: 'ignore' });
for (let tries = 0; ; tries++) {
  try {
    await fetch(LOCAL);
    break;
  } catch (error) {
    if (tries > 50) {
      throw new Error(`The local server didn't start: ${error.message}`);
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
}

const browser = await chromium.launch();

const checkMetadata = async (page, url, name) => {
  const meta = await page.evaluate(() => {
    const content = (selector) => document.querySelector(selector)?.getAttribute('content') ?? null;
    return {
      title: document.title,
      description: content('meta[name="description"]'),
      canonical: document.querySelector('link[rel="canonical"]')?.getAttribute('href') ?? null,
      feed: Boolean(document.querySelector('link[rel="alternate"][type="application/rss+xml"]')),
      og: Object.fromEntries(
        [...document.querySelectorAll('meta[property^="og:"]')].map((tag) => [tag.getAttribute('property'), tag.getAttribute('content')]),
      ),
      twitterCard: content('meta[name="twitter:card"]'),
      twitterImage: content('meta[name="twitter:image"]'),
      jsonLd: [...document.querySelectorAll('script[type="application/ld+json"]')].map((script) => script.textContent),
    };
  });

  if (!meta.title.trim()) {
    fail(name, 'has no title');
  }
  if (!meta.description) {
    fail(name, 'has no meta description');
  } else if (meta.description.length < 50 || meta.description.length > 160) {
    warn(name, `meta description is ${meta.description.length} characters; 50 to 160 reads best in search results`);
  }
  if (meta.canonical !== url) {
    fail(name, `canonical URL is ${meta.canonical}, not ${url}`);
  }
  if (!meta.feed) {
    fail(name, 'does not link the RSS feed');
  }

  for (const property of ['og:type', 'og:title', 'og:description', 'og:url', 'og:image']) {
    if (!meta.og[property]) {
      fail(name, `is missing ${property}`);
    }
  }
  if (meta.og['og:url'] && meta.og['og:url'] !== url) {
    fail(name, `og:url is ${meta.og['og:url']}, not ${url}`);
  }
  if (meta.twitterCard !== 'summary_large_image') {
    fail(name, 'is missing twitter:card summary_large_image');
  }
  for (const image of [meta.og['og:image'], meta.twitterImage]) {
    if (!image) {
      continue;
    }
    if (!image.startsWith(`${SITE}/`)) {
      fail(name, `preview image ${image} isn't an absolute URL on ${SITE}`);
    } else if (!(await exists(join(root, 'public', decodeURIComponent(new URL(image).pathname))))) {
      fail(name, `preview image ${image} doesn't exist in public/`);
    }
  }

  const expected = url.includes('/writing/') ? 'BlogPosting' : 'Person';
  const required =
    expected === 'BlogPosting' ? ['headline', 'description', 'datePublished', 'image', 'url', 'author'] : ['name', 'url'];
  const data = meta.jsonLd.flatMap((text) => {
    try {
      return [JSON.parse(text)];
    } catch {
      fail(name, 'has JSON-LD that does not parse');
      return [];
    }
  });
  const entry = data.find((item) => item['@type'] === expected);
  if (!entry) {
    fail(name, `has no ${expected} JSON-LD`);
  } else {
    for (const field of required) {
      if (!entry[field]) {
        fail(name, `${expected} JSON-LD is missing ${field}`);
      }
    }
  }
};

for (const url of urls) {
  const path = new URL(url).pathname;
  const name = path;
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  const errors = [];
  page.on('console', (message) => message.type() === 'error' && errors.push(message.text()));
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('response', (response) => {
    if (response.url().startsWith(LOCAL) && response.status() >= 400) {
      errors.push(`${response.status()} for ${response.url().slice(LOCAL.length)}`);
    }
  });

  const response = await page.goto(LOCAL + path, { waitUntil: 'load' });
  if (response.status() !== 200) {
    fail(name, `returned ${response.status()}`);
    await context.close();
    continue;
  }

  // Scroll to the bottom so lazy images load, then let them finish.
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += window.innerHeight / 2) {
      window.scrollTo(0, y);
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
    await Promise.all([...document.images].map((image) => image.decode().catch(() => {})));
    window.scrollTo(0, 0);
  });

  const broken = await page.evaluate(() =>
    [...document.images].filter((image) => !image.complete || image.naturalWidth === 0).map((image) => image.getAttribute('src')),
  );
  for (const src of broken) {
    fail(name, `image ${src} did not load`);
  }

  for (const error of errors) {
    fail(name, `console error: ${error}`);
  }

  const { violations } = await new AxeBuilder({ page }).analyze();
  for (const violation of violations) {
    const where = violation.nodes
      .slice(0, 3)
      .map((node) => node.target.join(' '))
      .join(', ');
    fail(name, `accessibility: ${violation.help} (${violation.id}, ${violation.nodes.length} found, at ${where})`);
  }

  await checkMetadata(page, url, name);
  await context.close();
  console.log(`Checked ${name}`);
}

await browser.close();
server.kill();

for (const message of warnings) {
  console.log(`Warning: ${message}`);
}
if (failures.length) {
  console.error(`\n${failures.length} problem${failures.length === 1 ? '' : 's'} found:`);
  for (const message of failures) {
    console.error(`  ${message}`);
  }
  process.exit(1);
}
console.log(`\nAll ${urls.length} pages passed.`);
