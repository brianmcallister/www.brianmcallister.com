// Gets a Spotify refresh token from the browser, so there's nothing to
// run locally. Visit /api/spotify-auth, approve access on Spotify, and
// this page shows the refresh token to save as SPOTIFY_REFRESH_TOKEN.
//
// The Spotify app must list this URL as a redirect URI:
//
//   https://www.brianmcallister.com/api/spotify-auth
//
// This is safe to leave deployed. A state cookie ties each callback to
// the browser that started it. The token only goes back to whoever
// approved access on Spotify, and a Spotify app in development mode
// only lets accounts on its user list approve at all.

import { randomBytes, timingSafeEqual } from 'node:crypto';

const SCOPES = 'user-read-currently-playing user-read-playback-state';
const STATE_COOKIE = 'spotify_auth_state';

const page = (title, body, { status = 200, headers = {} } = {}) =>
  new Response(
    `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <meta name="robots" content="noindex" />
    <title>${title}</title>
    <style>
      body { font: 16px/1.5 system-ui, sans-serif; margin: 40px auto; max-width: 640px; padding: 0 16px; }
      textarea { box-sizing: border-box; font: 14px ui-monospace, monospace; padding: 8px; width: 100%; }
    </style>
  </head>
  <body>
    <h1>${title}</h1>
    ${body}
  </body>
</html>`,
    {
      status,
      headers: {
        'cache-control': 'no-store',
        'content-type': 'text/html; charset=utf-8',
        'referrer-policy': 'no-referrer',
        ...headers,
      },
    },
  );

const escape = (text) =>
  String(text).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

const readCookie = (request, name) =>
  request.headers
    .get('cookie')
    ?.split(';')
    .map((part) => part.trim().split('='))
    .find(([key]) => key === name)?.[1];

const sameString = (a, b) =>
  typeof a === 'string' &&
  typeof b === 'string' &&
  a.length === b.length &&
  timingSafeEqual(Buffer.from(a), Buffer.from(b));

export async function GET(request) {
  const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET } = process.env;

  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
    return page(
      'Not configured',
      '<p>Set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET in Vercel first.</p>',
      { status: 500 },
    );
  }

  const url = new URL(request.url);
  const redirectUri = `${url.origin}${url.pathname}`;
  const code = url.searchParams.get('code');
  const error = url.searchParams.get('error');
  const clearCookie = `${STATE_COOKIE}=; Path=${url.pathname}; Max-Age=0; HttpOnly; Secure; SameSite=Lax`;

  // Step 1: send the browser to Spotify's approval page.
  if (!code && !error) {
    const state = randomBytes(16).toString('hex');
    const authUrl = new URL('https://accounts.spotify.com/authorize');

    authUrl.search = new URLSearchParams({
      response_type: 'code',
      client_id: SPOTIFY_CLIENT_ID,
      scope: SCOPES,
      redirect_uri: redirectUri,
      state,
      show_dialog: 'true',
    }).toString();

    return new Response(null, {
      status: 302,
      headers: {
        'cache-control': 'no-store',
        location: authUrl.toString(),
        'set-cookie': `${STATE_COOKIE}=${state}; Path=${url.pathname}; Max-Age=600; HttpOnly; Secure; SameSite=Lax`,
      },
    });
  }

  // Step 2: Spotify sent the browser back here.
  if (error) {
    return page('Spotify said no', `<p>${escape(error)}</p>`, {
      status: 400,
      headers: { 'set-cookie': clearCookie },
    });
  }

  if (!sameString(url.searchParams.get('state'), readCookie(request, STATE_COOKIE))) {
    return page(
      'Start again',
      '<p>This sign-in link expired or came from a different browser. <a href="?">Try again</a>.</p>',
      { status: 400, headers: { 'set-cookie': clearCookie } },
    );
  }

  const credentials = Buffer.from(
    `${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`,
  ).toString('base64');

  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { authorization: `Basic ${credentials}` },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
    }),
  });

  if (!res.ok) {
    console.error('Token exchange failed', res.status, await res.text());
    return page('Token exchange failed', '<p>Check the function logs in Vercel.</p>', {
      status: 502,
      headers: { 'set-cookie': clearCookie },
    });
  }

  const { refresh_token: refreshToken } = await res.json();

  return page(
    'Your refresh token',
    `<p>Save this in Vercel as <code>SPOTIFY_REFRESH_TOKEN</code>, then redeploy.</p>
    <textarea rows="5" readonly onclick="this.select()">${escape(refreshToken)}</textarea>
    <p>Don't share it. It gives read access to what you're playing.</p>`,
    { headers: { 'set-cookie': clearCookie } },
  );
}
