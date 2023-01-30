import axios from 'axios';
import CONFIG from '../../../config'
export default async params => {
  let output = {};
  const accessToken = params.accessToken;
  const pageId = params.pageId;
  const messageSize = params.messageSize;
  const pageSize = params.pageSize;

  let tempUrl1 = 'fields=conversations'
  let tempUrl2 = '{message_count,participants,unread_count,messages'
  const tempMessageSize = `.limit(${messageSize}){message,from}`
  const tempPageSize = `.limit(${pageSize})`

  console.log('data: ', accessToken, pageId, messageSize, pageSize);

  if (pageSize) {
    tempUrl1 += tempPageSize
  }
  if (messageSize) {
    tempUrl2 += tempMessageSize
  }
  // return new Promise((resolve, reject) => {
  await axios({
    method: 'get',
    url: CONFIG.FB_GRAPH_HOST + '/' + CONFIG.FB_GRAPH_VERSION + '/' + pageId + '?' + tempUrl1 + tempUrl2 + '}&' + 'access_token=' + accessToken
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
