import { NetlifyHandler } from '../types';
import * as spotify from '../services/spotify';
import * as user from '../services/user';

export const handler: NetlifyHandler = async (event, context, callback) => {
  try {
    const result = await user.getUser();

    if (!result) {
      callback(new Error('no user'), {
        statusCode: 500,
        body: 'no user'
      });

      return;
    }

    spotify.setTokens(result.access_token, result.refresh_token);

    const [current, me] = await Promise.all([
      spotify.getCurrentlyPlaying(),
      spotify.getMe()
    ]);

    if (current === null) {
      callback(null, {
        statusCode: 200,
        body: '{}',
      });

      return;
    }

    const details = {
      artist: current.item.artists[0].name,
      album: current.item.album.name,
      image: current.item.album.images[0].url,
      track: current.item.name,
      profile: me.external_urls.spotify
    };

    callback(null, {
      statusCode: 200,
      body: JSON.stringify(details),
    });
  } catch (err) {
    console.log(err);

    callback(null, {
      statusCode: 500,
      body: JSON.stringify(err),
    });
  }
}
