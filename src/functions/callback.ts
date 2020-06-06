import { NetlifyHandler } from '../types';
import * as user from '../services/user';
import * as spotify from '../services/spotify';

export const handler: NetlifyHandler = async (event, context, callback) => {
  const { code } = event.queryStringParameters;
  const { access_token, refresh_token } = await spotify.getAccessTokens(code);

  if (!access_token) {
    callback(null, {
      statusCode: 400,
      body: 'bad request',
    });

    return;
  }

  try {
    await user.updateUser('freebowlofsoup', { access_token, refresh_token });

    callback(null, {
      statusCode: 302,
      body: '',
      headers: {
        location: 'http://localhost:8888/.netlify/functions/me',
      },
    });
  } catch (err) {
    callback(err, {
      statusCode: 500,
      body: err.message,
    });
  }
}
