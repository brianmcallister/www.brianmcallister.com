import { NetlifyHandler } from '../types';
import * as spotify from '../services/spotify';

const { PASSWORD } = process.env;

export const handler: NetlifyHandler = (event, context, callback) => {
  const { password } = event.queryStringParameters;

  if (password !== PASSWORD) {
    callback(null, {
      statusCode: 400,
      body: '😰',
    });

    return;
  }

  callback(null, {
    statusCode: 302,
    body: '',
    headers: {
      location: spotify.getAuthUrl().toString(),
    }
  });
}

