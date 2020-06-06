import fetch from 'node-fetch';
import assert from 'assert';

import * as user from './user';

interface Tokens {
  access_token: string | null;
  refresh_token: string | null;
}

const {
  SPOTIFY_CLIENT_ID,
  SPOTIFY_CLIENT_SECRET,
  REDIRECT_URI,
} = process.env;
const SCOPES = "user-read-currently-playing user-read-playback-state";
// const REDIRECT_URI = `https://${PROJECT_DOMAIN}.glitch.me/result`;
const SPOTIFY_ACCOUNTS_URL = "https://accounts.spotify.com";
const SPOTIFY_API_BASE_URL = "https://api.spotify.com";
const tokens: Tokens = {
  access_token: null,
  refresh_token: null
};

export const setTokens = (
  access_token: Tokens['access_token'],
  refresh_token: Tokens['refresh_token'],
) => {
  if (access_token) {
    tokens.access_token = access_token;
  }

  if (refresh_token) {
    tokens.refresh_token = refresh_token;
  }
};

const makeRequest = async (apiUrl: string): Promise<any> => {
  const url = new URL(`v1/${apiUrl}`, SPOTIFY_API_BASE_URL);
  const req = await fetch(url, {
    headers: {
      authorization: `Bearer ${tokens.access_token}`
    }
  });

  // Spotify will send back 204 if a response is
  // "empty" (i.e. you ask for the currently playing track
  // but nothing is playing)
  if (req.status === 204) {
    return null;
  }

  const json = await req.json();

  if (!req.ok && req.status === 401 && json.error.message === 'The access token expired') {
    const { access_token } = await refreshAccessToken();

    module.exports.setTokens(access_token);
    user.updateUser('freebowlofsoup', { access_token, refresh_token: tokens.refresh_token });

    return makeRequest(apiUrl);
  }

  return json;
};

export const getCurrentlyPlaying = async () =>
  makeRequest("me/player/currently-playing");

export const getMe = async () => makeRequest("me");

export const getAuthUrl = () => {
  assert(REDIRECT_URI);

  const url = new URL("authorize", SPOTIFY_ACCOUNTS_URL);

  url.search = (new URLSearchParams({
    response_type: "code",
    client_id: SPOTIFY_CLIENT_ID as string,
    scope: SCOPES,
    redirect_uri: REDIRECT_URI
  })).toString();

  return url;
};

export const getAccessTokens = async (code: string) => {
  assert(SPOTIFY_CLIENT_ID);
  assert(SPOTIFY_CLIENT_SECRET);
  assert(REDIRECT_URI);

  const tokenUrl = new URL("api/token", SPOTIFY_ACCOUNTS_URL);
  const req = await fetch(tokenUrl, {
    method: "POST",
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: REDIRECT_URI,
      client_id: SPOTIFY_CLIENT_ID,
      client_secret: SPOTIFY_CLIENT_SECRET
    })
  });

  return req.json();
};

export const refreshAccessToken = async () => {
  assert(tokens.refresh_token);

  const tokenUrl = new URL("api/token", SPOTIFY_ACCOUNTS_URL);
  const client = Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`);
  const authorization = `Basic ${client.toString("base64")}`;
  const req = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      authorization
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: tokens.refresh_token
    })
  });

  return req.json();
};
