import { NowRequest, NowResponse } from '@vercel/node';
import HttpStatusCodes from 'http-status-codes';

import * as user from './services/user';
import * as spotify from './services/spotify';

export default async (req: NowRequest, res: NowResponse): Promise<void> => {
  const { code } = req.query;
  const requestCode = Array.isArray(code) ? code[0] : code;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const { access_token, refresh_token } = await spotify.getAccessTokens(
    requestCode,
  );

  if (!access_token) {
    res
      .status(HttpStatusCodes.BAD_REQUEST)
      .send(HttpStatusCodes.getStatusText(HttpStatusCodes.BAD_REQUEST));
    return;
  }

  try {
    await user.updateUser('freebowlofsoup', { access_token, refresh_token });

    res.setHeader('location', '/');
    res.status(HttpStatusCodes.TEMPORARY_REDIRECT).send('');
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
