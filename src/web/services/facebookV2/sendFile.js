import axios from 'axios';
import CONFIG from '../../../config';
import { regUrl } from '../../../utils/helper';

// eslint-disable-next-line require-jsdoc
const setOptions = (userId, url) => {
  const body = {
    recipient: {
      id: `${userId}`
    },
    message: {
      attachment: {
        type: 'image',
        payload: {
          url: (url && url.match(regUrl) && url.match(regUrl).length > 0 ) ? url : CONFIG['CONNECTCARE_IMAGES_URL'] + url,
          is_reusable: true
        }
      }
    }
  };

  return {
    body: JSON.stringify(body)
  };
};

export default async params => {
  let output = {};

  const accessToken = params.accessToken;
  const userId = params.userId;
  const url = params.url || '';

  // console.log('Data: ', accessToken, userId, url);

  if (url !== null || true) {
    // console.log('accessToken=%s || userId=%s || text=%s', accessToken, userId, text);
    const options = setOptions(userId, url);

    // console.log('options   ', options);
    // console.log('options body   ', options.body);
    // return new Promise((resolve, reject) => {
    await axios({
      method: 'post',
      url: `${CONFIG['FB_GRAPH_HOST']}/${CONFIG['FB_GRAPH_VERSION']}/me/messages?access_token=${accessToken}`,
      data: options.body,
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(function(response) {
        console.log('response',response);
        // console.log('kết thúc response', response.data);

        output = {
          data: response.data
        };

        return output;
      })
      .catch(function(error) {
        console.log(error);
        output = {
          data: null
        };

        return output;
      });
  }
};
