// Returns the track currently playing on Spotify.
//
// Needs three environment variables:
//   SPOTIFY_CLIENT_ID
//   SPOTIFY_CLIENT_SECRET
//   SPOTIFY_REFRESH_TOKEN  (visit /api/spotify-auth once to get it)
//
// Access tokens last an hour, so one is kept in memory and reused for
// as long as this function instance stays warm. There's no database:
// the refresh token never changes, so it lives in the environment.

const TOKEN_URL = 'https://accounts.spotify.com/api/token';
const NOW_PLAYING_URL = 'https://api.spotify.com/v1/me/player/currently-playing';

// An error whose reason is safe to send to the browser. It never includes
// tokens or secrets, just enough to tell what went wrong.
class NowPlayingError extends Error {
  constructor(reason, detail) {
    super(detail ? `${reason}: ${detail}` : reason);
    this.reason = reason;
  }
}

// Spotify error bodies look like {"error":"invalid_grant"} or
// {"error":{"status":403,"message":"..."}}. Pull out the short part.
const spotifyError = async (res) => {
  const text = await res.text();

  try {
    const { error, error_description: description } = JSON.parse(text);
    return typeof error === 'string'
      ? [error, description].filter(Boolean).join(': ')
      : error?.message ?? text;
  } catch {
    return text.slice(0, 200);
  }
};

let cachedToken = null;
let cachedTokenExpiresAt = 0;

const getAccessToken = async () => {
  if (cachedToken && Date.now() < cachedTokenExpiresAt) {
    return cachedToken;
  }

  const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REFRESH_TOKEN } =
    process.env;

  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET || !SPOTIFY_REFRESH_TOKEN) {
    const missing = Object.entries({
      SPOTIFY_CLIENT_ID,
      SPOTIFY_CLIENT_SECRET,
      SPOTIFY_REFRESH_TOKEN,
    })
      .filter(([, value]) => !value)
      .map(([name]) => name);

    throw new NowPlayingError('missing_env', missing.join(', '));
  }

  const credentials = Buffer.from(
    `${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`,
  ).toString('base64');

  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { authorization: `Basic ${credentials}` },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: SPOTIFY_REFRESH_TOKEN.trim(),
    }),
  });

  if (!res.ok) {
    throw new NowPlayingError(
      'token_refresh_failed',
      `${res.status} ${await spotifyError(res)}`,
    );
  }

  const { access_token: accessToken, expires_in: expiresIn } = await res.json();

  cachedToken = accessToken;
  // Refresh a minute early so a token never expires mid-request.
  cachedTokenExpiresAt = Date.now() + (expiresIn - 60) * 1000;

  return accessToken;
};

const json = (body, { status = 200, cache = true } = {}) =>
  Response.json(body, {
    status,
    headers: {
      'cache-control': cache
        ? 'public, max-age=0, s-maxage=15, stale-while-revalidate=15'
        : 'no-store',
    },
  });

export async function GET() {
  try {
    const token = await getAccessToken();
    const res = await fetch(NOW_PLAYING_URL, {
      headers: { authorization: `Bearer ${token}` },
    });

    // A token can be revoked before it expires. Drop it so the next
    // request fetches a new one.
    if (res.status === 401) {
      cachedToken = null;
    }

    // 204 means nothing is playing.
    if (res.status === 204) {
      return json({ playing: false });
    }

    if (!res.ok) {
      throw new NowPlayingError(
        'spotify_error',
        `${res.status} ${await spotifyError(res)}`,
      );
    }

    const data = await res.json();
    const { item } = data;

    // `item` is null for ads and some podcast episodes.
    if (!data.is_playing || !item || item.type !== 'track') {
      return json({ playing: false });
    }

    return json({
      playing: true,
      artist: item.artists.map((artist) => artist.name).join(', '),
      album: item.album.name,
      track: item.name,
      // Spotify sends 640px, 300px and 64px versions, largest first.
      image:
        (item.album.images.find((img) => img.width <= 300) ?? item.album.images[0])
          ?.url ?? null,
      url: item.external_urls?.spotify ?? null,
    });
  } catch (err) {
    console.error(err);

    const error = err instanceof NowPlayingError ? err.message : 'unexpected';

    return json({ playing: false, error }, { status: 500, cache: false });
  }
}
