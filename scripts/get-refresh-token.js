// One-time helper that authorizes your Spotify account and prints a
// refresh token. Save that token as SPOTIFY_REFRESH_TOKEN in Vercel.
//
// Before running it, add this redirect URI to your app in the Spotify
// developer dashboard:
//
//   http://127.0.0.1:8888/callback
//
// Then run, with SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET in .env:
//
//   npm run get-refresh-token

import { createServer } from 'node:http';

const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET } = process.env;
const PORT = 8888;
const REDIRECT_URI = `http://127.0.0.1:${PORT}/callback`;
const SCOPES = 'user-read-currently-playing user-read-playback-state';

if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
  console.error('Set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET first.');
  process.exit(1);
}

const authUrl = new URL('https://accounts.spotify.com/authorize');
authUrl.search = new URLSearchParams({
  response_type: 'code',
  client_id: SPOTIFY_CLIENT_ID,
  scope: SCOPES,
  redirect_uri: REDIRECT_URI,
}).toString();

const exchangeCode = async (code) => {
  const credentials = Buffer.from(
    `${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`,
  ).toString('base64');

  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { authorization: `Basic ${credentials}` },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: REDIRECT_URI,
    }),
  });

  if (!res.ok) {
    throw new Error(`${res.status} ${await res.text()}`);
  }

  return res.json();
};

const server = createServer(async (req, res) => {
  const url = new URL(req.url, REDIRECT_URI);

  if (url.pathname !== '/callback') {
    res.writeHead(404).end();
    return;
  }

  const code = url.searchParams.get('code');

  if (!code) {
    res.writeHead(400).end(`Authorization failed: ${url.searchParams.get('error')}`);
    server.close();
    return;
  }

  try {
    const { refresh_token: refreshToken } = await exchangeCode(code);

    res.end('Done. You can close this tab and go back to the terminal.');
    console.log('\nYour refresh token:\n');
    console.log(refreshToken);
    console.log('\nSave it in Vercel as SPOTIFY_REFRESH_TOKEN.');
  } catch (err) {
    res.writeHead(500).end('Token exchange failed. See the terminal.');
    console.error(err);
  } finally {
    server.close();
  }
});

server.listen(PORT, '127.0.0.1', () => {
  console.log('Open this URL in your browser and approve access:\n');
  console.log(authUrl.toString());
});
