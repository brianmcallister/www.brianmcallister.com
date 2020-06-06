import { NowRequest, NowResponse } from '@vercel/node';
import HttpStatusCodes from 'http-status-codes';

import * as spotify from './services/spotify';

const { PASSWORD } = process.env;

export default (req: NowRequest, res: NowResponse): void => {
  const { password } = req.query;

  if (PASSWORD !== password) {
    res
      .status(HttpStatusCodes.BAD_REQUEST)
      .send(HttpStatusCodes.getStatusText(HttpStatusCodes.BAD_REQUEST));
  }

  res.setHeader('location', spotify.getAuthUrl().toString());

  res.status(HttpStatusCodes.TEMPORARY_REDIRECT).send('');
};
