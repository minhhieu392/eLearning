import axios from 'axios';
import CONFIG from '../../../config'
// import _ from 'lodash';
// eslint-disable-next-line require-jsdoc

export default async params => {
  let output = {};

  console.log('data: ', params);

  const version = CONFIG.FB_GRAPH_VERSION;
  const host = CONFIG.FB_GRAPH_HOST;

  const pageId = params.pageId;
  const accessToken = params.accessToken;

  console.log('data 1: ', pageId, accessToken);

  // return new Promise((resolve, reject) => {
  await axios({
    method: 'post',
    url: `${host}/${version}/${pageId}/subscribed_apps?subscribed_fields=messages&access_token=${accessToken}`,
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then(function (response) {
      console.log('kết thúc response', response.data);

      output = {
        data: response.data
      };
    })
    .catch(function (error) {
      console.log(error.response.data.error);

      output = {
        data: error.response.data.error
      };
    });
  return output;
};
