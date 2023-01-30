import axios from 'axios';
// import CONFIG from '../../../config';

// eslint-disable-next-line require-jsdoc
const setOptions = (userId, text) => {
  const body = {
    recipient: {
      id: `${userId}`
    },
    message: {
      text: `${text}`
    },    messaging_type: 'MESSAGE_TAG',
    tag: 'ACCOUNT_UPDATE'
  };

  return {
    body: JSON.stringify(body)
  };
};

export default async params => {
  let output = {};
  let result;
  // console.log('data: ', params);

  const accessToken = params.accessToken;
  const userId = params.userId;
  const text = params.text || '';

  // console.log('Data: ', accessToken, userId, text);

  // eslint-disable-next-line no-constant-condition
  if (text !== null || true) {
    // console.log('accessToken=%s || userId=%s || text=%s', accessToken, userId, text);
    const options = setOptions(userId, text);


    // console.log('options   ', options);
    // console.log('options body   ', options.body);
    // return new Promise((resolve, reject) => {
    result = await axios({
      method: 'post',
      url: 'https://graph.facebook.com/v5.0/me/messages?access_token=' + accessToken,
      data: options.body,
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(function(response) {
        // console.log('kết thúc response', response.data);

        output= {
          data: response.data
        };

        return output;

      })
      .catch(function(error) {
        console.log(error);
        output = {
          error
        };

        return output;
      });
  }

  return result;
};
