// Serves the built site from public/ the way Vercel does, for checks in
// CI: clean URLs, the redirects and headers in vercel.json, and a stand-in
// for the now-playing API, which needs Spotify credentials.
//
//   node scripts/serve.mjs [port]

import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const config = JSON.parse(await readFile(join(root, 'vercel.json'), 'utf8'));
const port = Number(process.argv[2] ?? process.env.PORT ?? 4173);

const types = {
  '.avif': 'image/avif',
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.xml': 'application/xml',
};

// vercel.json sources here are either exact paths or end in (.*).
const matches = (source, path) =>
  source.endsWith('(.*)') ? path.startsWith(source.slice(0, -4)) : path === source;

createServer(async (request, response) => {
  const path = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);

  if (path === '/api/now-playing') {
    response.writeHead(200, { 'content-type': 'application/json' }).end('{"playing":false}');
    return;
  }

  // Host-based redirects send other domains to www, which doesn't apply here.
  const redirect = config.redirects.find((rule) => !rule.has && rule.source === path);
  if (redirect) {
    response.writeHead(redirect.permanent ? 308 : 307, { location: redirect.destination }).end();
    return;
  }
  if (config.trailingSlash === false && path.length > 1 && path.endsWith('/')) {
    response.writeHead(308, { location: path.slice(0, -1) }).end();
    return;
  }

  const headers = {};
  for (const rule of config.headers) {
    if (matches(rule.source, path)) {
      for (const { key, value } of rule.headers) {
        headers[key.toLowerCase()] = value;
      }
    }
  }

  let file = path === '/' ? '/index.html' : path;
  if (!extname(file)) {
    file += '.html';
  }
  const target = normalize(join(root, 'public', file));
  if (!target.startsWith(join(root, 'public'))) {
    response.writeHead(403).end();
    return;
  }

  try {
    const body = await readFile(target);
    response.writeHead(200, { ...headers, 'content-type': types[extname(file)] ?? 'application/octet-stream' }).end(body);
  } catch {
    response.writeHead(404, { 'content-type': 'text/plain' }).end('Not found');
  }
}).listen(port, () => console.log(`Serving public/ at http://localhost:${port}`));
