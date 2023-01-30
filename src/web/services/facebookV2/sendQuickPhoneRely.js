import axios from 'axios';
// import _ from 'lodash';
// eslint-disable-next-line require-jsdoc
const setOptions = (userId, text) => {
  const quickReplies = [{
    content_type: 'user_phone_number'
  }];
  const body = {
    recipient: {
      id: `${userId}`
    },
    message: {
      text: `${text}`,
      quick_replies: quickReplies
    },
    messaging_type: 'RESPONSE'
  };

  return {
    body: JSON.stringify(body)
  };
};

export default async params => {
  let output = {};

  // console.log('data: ', data);

  const accessToken = params.accessToken;
  const userId = params.userId;
  const text = params.text || '';

  if (text !== '') {
    console.log('accessToken=%s || userId=%s || text=%s', accessToken, userId, text);
    const options = setOptions(userId, text);

    console.log('options   ', options);
    console.log('options body   ', options.body);
    // return new Promise((resolve, reject) => {
    await axios({
      method: 'post',
      url: 'https://graph.facebook.com/v5.0/me/messages?access_token=' + accessToken,
      data: options.body,
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(function (response) {
        console.log('kết thúc response ', response.data);

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
  }

  return output;
};
