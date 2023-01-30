import axios from 'axios';
// import _ from 'lodash';
// eslint-disable-next-line require-jsdoc
const setOptions = userId => {
  const body = {
    recipient: {
      id: `${userId}`
    },
    sender_action: 'mark_seen'
  };

  return {
    body: JSON.stringify(body)
  };
};

export default async params => {
  let output = {};

  console.log('data: ', params);

  const accessToken = params.accessToken;
  const recipient = params.recipient;

  console.log('Data: ', accessToken, recipient);

  console.log('accessToken=%s || recipient=%s', accessToken, recipient);
  const options = setOptions(recipient);

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
      // console.log("Response: ", response);
      output = response.data
    })
    .catch(function (error) {
      console.log('error: ', error.response.data.error);

      output = error.response.data.error
    });

  return output;
};
