import axios from 'axios';
import CONFIG from '../../../config'
export default async params => {
  let output = {};

  console.log('data: ', params);

  const accessToken = params.accessToken;
  const pageId = params.pageId;
  const version = CONFIG.FB_GRAPH_VERSION;
  const host = CONFIG.FB_GRAPH_HOST;

  const url = `${host}/${version}/${pageId}?fields=access_token&access_token=${accessToken}`;

  // return new Promise((resolve, reject) => {
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
      console.log('error: ', error);

      output = error.response.data.error
    });

  return output;
};
