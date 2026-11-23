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
scripts/make-texture.py   makes the patchwork texture behind posts
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

To embed a YouTube video, add it as an HTML block using the privacy-enhanced `youtube-nocookie.com` address, which is the only video host the post pages' Content-Security-Policy in `vercel.json` allows:

```html
<figure class="video">
  <iframe src="https://www.youtube-nocookie.com/embed/VIDEO_ID" title="Video title" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
</figure>
```

Posts aren't listed automatically. To link one from the home page, add it under Writing in `public/index.html` with a path like `/writing/my-post`. In browsers that support cross-document view transitions, the link then animates into the post's title, and back again.

The patchwork at the top of posts is made from squares of sky in the home page's photo. It hangs from the top with a ragged bottom edge, shallow behind the text and deeper at the sides. To make a new arrangement, run `python3 scripts/make-texture.py` with a different number, which needs Pillow and NumPy.

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
