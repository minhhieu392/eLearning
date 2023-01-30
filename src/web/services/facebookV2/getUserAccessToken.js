import axios from 'axios';
import CONFIG from '../../../config'
export default async params => {
  let output = {};

  console.log('data: ', params);

  const code = params.code;
  const redirectUri = params.redirectUri;

  const host = CONFIG.FB_GRAPH_HOST;
  const appId = CONFIG.FB_CLIENT_ID;
  const appSecret = CONFIG.FB_CLIENT_SECRET;

  const url = `${host}/oauth/access_token?client_id=${appId}&redirect_uri=${redirectUri}&client_secret=${appSecret}&code=${code}`;

  await axios({
    method: 'get',
    url: url,
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then(function (response) {
      output = response.data
    })
    .catch(function (error) {
      console.log('error: ', error.response.data.error);

      output = error.response.data.error
    });

  return output;
};
