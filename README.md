# www.brianmcallister.com

My personal site. It's a static page plus one serverless function on Vercel, with no framework, build step or dependencies.

```
public/              the site: index.html, style.css, now-playing.js, images
api/now-playing.js   returns the track currently playing on Spotify
api/spotify-auth.js  gets a Spotify refresh token, all in the browser
```

To change the content, edit `public/index.html`.

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
