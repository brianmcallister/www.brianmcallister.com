import { NowRequest, NowResponse } from '@vercel/node';
import HttpStatusCodes from 'http-status-codes';

import * as spotify from './services/spotify';
import * as user from './services/user';

export default async (_: NowRequest, res: NowResponse): Promise<void> => {
  try {
    const result = await user.getUser();

    if (!result) {
      res
        .status(HttpStatusCodes.INTERNAL_SERVER_ERROR)
        .send(HttpStatusCodes.getStatusText(HttpStatusCodes.INTERNAL_SERVER_ERROR));

      return;
    }

    spotify.setTokens(result.access_token, result.refresh_token);

    const [current, me] = await Promise.all([spotify.getCurrentlyPlaying(), spotify.getMe()]);

    if (current === null || me === null) {
      res.status(HttpStatusCodes.OK).json({});
      return;
    }

    const details = {
      artist: current.item.artists[0].name,
      album: current.item.album.name,
      image: current.item.album.images[0].url,
      track: current.item.name,
      profile: me.external_urls.spotify,
    };

    res.status(HttpStatusCodes.OK).json(details);
  } catch (err) {
    console.log(err);

    res
      .status(HttpStatusCodes.INTERNAL_SERVER_ERROR)
      .send(HttpStatusCodes.getStatusText(HttpStatusCodes.INTERNAL_SERVER_ERROR));
  }
};
