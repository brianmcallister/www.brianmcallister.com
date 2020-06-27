import { NowRequest, NowResponse } from '@vercel/node';
import HttpStatusCodes from 'http-status-codes';

import * as spotify from './services/spotify';
import * as user from './services/user';

export interface SpotifyPayload {
  artist: string;
  album: string;
  image: string;
  track: string;
}

export default async (_: NowRequest, res: NowResponse): Promise<void> => {
  try {
    const result = await user.getUser();

    if (!result) {
      res
        .status(HttpStatusCodes.INTERNAL_SERVER_ERROR)
        .send(
          HttpStatusCodes.getStatusText(HttpStatusCodes.INTERNAL_SERVER_ERROR),
        );

      return;
    }

    spotify.setTokens(result.access_token, result.refresh_token);

    const current = await spotify.getCurrentlyPlaying();

    if (current === null) {
      res.status(HttpStatusCodes.NO_CONTENT).json({});

      return;
    }

    const details: SpotifyPayload = {
      artist: current.item.artists[0].name,
      album: current.item.album.name,
      image: current.item.album.images[0].url,
      track: current.item.name,
    };

    res.status(HttpStatusCodes.OK).json(details);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.log(err);

    res
      .status(HttpStatusCodes.INTERNAL_SERVER_ERROR)
      .send(
        HttpStatusCodes.getStatusText(HttpStatusCodes.INTERNAL_SERVER_ERROR),
      );
  }
};
