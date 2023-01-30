import axios from 'axios';
import CONFIG from '../../../config'
export default async params => {
  let output = {};

  console.log('data: ', params);

  const accessToken = params.accessToken;
  const pageId = params.pageId;
  const userId = params.userId;

  const tempUrl = 'conversations?user_id='

  await axios({
    method: 'get',
    url: CONFIG.FB_GRAPH_HOST + '/' + CONFIG.FB_GRAPH_VERSION + '/' + pageId + '/' + tempUrl + userId + '&' + 'access_token=' + accessToken,
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
