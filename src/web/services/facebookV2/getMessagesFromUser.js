import axios from 'axios';
import CONFIG from '../../../config'
export default async params => {
  let output = {};

  console.log('data: ', params);

  const accessToken = params.accessToken;
  const conversationId = params.conversationId;
  const pageSize = params.pageSize;
  const version = CONFIG.FB_GRAPH_VERSION;
  const host = CONFIG.FB_GRAPH_HOST;

  const url = `${host}/${version}/${conversationId}?fields=participants,messages.limit(${pageSize || 10}){message,from}&access_token=${accessToken}`;

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
