# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Brian's personal site, deployed on Vercel. It is static pages in `public/` plus two serverless functions in `api/`, with no framework. The only build step is `scripts/build-writing.js`, which turns Markdown posts in `writing/` into HTML. `README.md` is the detailed reference for post syntax, images, code highlighting, video embeds, the patchwork header and the Spotify setup, so read it before changing any of those.

## Commands

- `npm run build` builds posts into `public/writing/` and writes `public/sitemap.xml` and `public/feed.xml`. All three are generated and gitignored, so never edit them by hand.
- `npm run dev` runs `vercel dev`, serving the pages and functions together. It needs the Vercel CLI and a linked project, and `vercel env pull` brings down the Spotify environment variables.
- `python3 scripts/make-patchwork.py <seed>` cuts a new `public/patchwork.webp` tile sheet. It needs Pillow and NumPy.
- `npm run check` serves the built site and checks every page in the sitemap for accessibility violations, console and Content-Security-Policy errors, broken images, and missing or wrong search metadata. Run `npm run build` first, and `npx playwright install chromium` once.
- `npm run lighthouse` scores every page with Lighthouse CI against the built site.

CI runs both on every pull request and push to `main`, in `.github/workflows/site-checks.yml`, and publishes the Lighthouse scores to the `badges` branch for the README's badges. There is no linter or formatter. After changing the build script, run `npm run build` and `npm run check`.

## Architecture

**Posts.** `scripts/build-writing.js` is a self-contained Markdown renderer, not a library. It parses front matter, renders a deliberately small Markdown subset, highlights fenced code at build time with `@pierre/diffs` into declarative shadow DOM, reads image dimensions from the files under `public/images/<slug>/` and fails the build if an image is missing, and emits the full page template, meta tags, JSON-LD, sitemap and RSS feed. A post's file name is its slug and URL. Drafts are included unless `VERCEL_ENV` is `production`. New Markdown features belong in `renderMarkdown` and `renderInline` in that script.

**Home page.** `public/index.html` is hand-written. Posts are not listed automatically, so a new post must be linked there by hand under Writing.

**Client scripts.** `public/now-playing.js` polls `/api/now-playing` for the home page, `public/patchwork.js` draws the tile header on posts, and `public/video.js` swaps a YouTube still for the player on click. Styles are split across `base.css`, `style.css` for the home page and `writing.css` for posts.

**Functions.** `api/now-playing.js` exchanges `SPOTIFY_REFRESH_TOKEN` for an access token, cached in memory while the instance is warm, and responds with a 15 second edge cache. `api/spotify-auth.js` is a one-time OAuth page that shows a refresh token to copy into Vercel.

**`vercel.json`** sets `public/` as the output directory, clean URLs without trailing slashes, apex and `vercel.app` redirects to `www`, and security headers. Each page type has its own Content-Security-Policy: the home page allows no inline scripts or styles, and posts allow inline styles plus YouTube's image host and `youtube-nocookie.com` frames. Any new external resource or inline script needs a matching CSP change there.

## Workflow

Always work on a feature branch off `main` and open a pull request into `main`. Never commit directly to `main`.

## Writing style

These apply to posts, the README, commit messages and PR descriptions.

- Use sentence case for titles and headers.
- Use en dashes only for ranges and em dashes only for interruptions, never for asides.
- Keep parenthetical statements rare.
- Don't use ALL CAPS for emphasis. Use bold or a header instead.
