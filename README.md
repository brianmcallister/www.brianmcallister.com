<picture>
  <source media="(prefers-color-scheme: dark)" srcset=".github/logo-dark.svg" />
  <img src=".github/logo.svg" alt="Brian Wm. McAllister" height="200" />
</picture>

# www.brianmcallister.com

My personal site. It's static pages plus one serverless function on Vercel, with no framework or dependencies. A small build script turns the posts in `writing/` into pages.

```
public/                   the site: pages, styles, scripts and images
writing/                  posts, as Markdown files
scripts/build-writing.js  builds the posts into public/writing/
scripts/make-patchwork.py makes the tile sheet for the patchwork at the top of posts
api/now-playing.js        returns the track currently playing on Spotify
api/spotify-auth.js       gets a Spotify refresh token, all in the browser
```

To change the home page, edit `public/index.html`.

## Writing

Each post is a Markdown file in `writing/`, and its file name becomes its URL, so `writing/my-post.md` is served at `/writing/my-post`. It starts with a short header:

```
---
title: My post
date: 2026-11-22
description: Optional, for search results and link previews.
draft: true
---
```

Drafts are built locally and in preview deployments, but never in production. Remove the `draft` line to publish. The build script supports headings, emphasis, links, images, inline and fenced code, lists, block quotes and rules, and a block that starts with an HTML tag is passed through as is. Straight quotes and apostrophes become curly ones, except in code. A paragraph that is only a bold note like `**[Image: the first slide]**` shows as a 16:9 placeholder box until the note is replaced with an image.

To add an image, put the file under `public/images/`, in a folder named after the post, like `public/images/my-post/chart.png`, and add it to the post in a paragraph of its own: `![A description of the image](/images/my-post/chart.png)`. The description is the alt text that screen readers announce. The build reads the image's size so the page doesn't jump while it loads, and stops with an error if the file is missing. Images uploaded through GitHub's web editor are stored on GitHub, not in the repository, so they won't work on the site.

Fenced code blocks are highlighted when the site builds, with [`@pierre/diffs`](https://diffs.com/), and sent as finished HTML in declarative shadow DOM, so they display with no JavaScript and nothing shifts while the page loads. Name the language after the opening fence, and optionally a file name to show it in a header: ` ```json contract.schema.json `. Token colors too faint for the code background are darkened until they meet WCAG AA contrast.

To embed a YouTube video, put a link to it in a paragraph of its own, like `[Video title](https://www.youtube.com/watch?v=VIDEO_ID)`. The post shows the video's still with a play button, and YouTube's player only loads when it's pressed. The post pages' Content-Security-Policy in `vercel.json` allows YouTube's image host and its privacy-enhanced `youtube-nocookie.com` player.

Posts aren't listed automatically. To link one from the home page, add it under Writing in `public/index.html` with a path like `/writing/my-post`.

The patchwork at the top of each post is drawn by `public/patchwork.js` from tiles of the home page's photo in `public/patchwork.webp`: pale and mid blue-grays softened from the sea, and the island's rock near the edges. Behind the text it always stops above the title, and toward the edges it reaches a little over two-fifths of the way down the screen, darkest toward the bottom of the side columns. The squares appear one by one from the top, then drift slightly away from a nearby mouse pointer on springs, and the layout is seeded from the post's address, so it stays the same between visits. To cut a new set of tiles, run `python3 scripts/make-patchwork.py` with a different number, which needs Pillow and NumPy.

To build the posts locally:

```bash
npm run build
```

## Now playing

The function swaps a long-lived Spotify refresh token for a short-lived access token, then asks Spotify what's playing. Responses are cached at Vercel's edge for 15 seconds, so traffic to the site doesn't turn into traffic to Spotify.

It needs three environment variables in Vercel:

- `SPOTIFY_CLIENT_ID`
- `SPOTIFY_CLIENT_SECRET`
- `SPOTIFY_REFRESH_TOKEN`

### Getting a refresh token

You only need to do this once, or again if you revoke the app's access.

1. In the [Spotify developer dashboard](https://developer.spotify.com/dashboard), add `https://www.brianmcallister.com/api/spotify-auth` to the app's redirect URIs.
2. Make sure `SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET` are set in Vercel.
3. Visit [www.brianmcallister.com/api/spotify-auth](https://www.brianmcallister.com/api/spotify-auth) and approve access.
4. Copy the token it shows into Vercel as `SPOTIFY_REFRESH_TOKEN` and redeploy.

## Local development

```bash
npm run dev
```

This runs `vercel dev`, which serves the page and the function together. It needs the [Vercel CLI](https://vercel.com/docs/cli) and a linked project. Running `vercel env pull` copies the environment variables down.
