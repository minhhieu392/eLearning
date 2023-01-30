import axios from 'axios';
import _ from 'lodash';
// import _ from 'lodash';
// eslint-disable-next-line require-jsdoc
const setOptions = (userId, text) => {
  const body = {
    recipient: {
      id: `${userId}`
    },
    message: {
      text: `${text}`
    },
    messaging_type: 'MESSAGE_TAG',
    tag: 'ACCOUNT_UPDATE'
  };

  return {
    body: JSON.stringify(body)
  };
};

// eslint-disable-next-line require-jsdoc
const makeRequest = async (accessToken, arrayRecipientId, text) => {
  const output = [];

  await axios
    .all(arrayRecipientId.map(e => {
      const inputOptions = setOptions(e, text);

      return axios({
        method: 'post',
        url: 'https://graph.facebook.com/v5.0/me/messages?access_token=' + accessToken,
        data: inputOptions.body,
        headers: {
          'Content-Type': 'application/json'
        }
      })
        // eslint-disable-next-line handle-callback-err
        .catch(error => null)
    }))
    .then(
      axios.spread((...responses) => {
        for (let i = 0; i < responses.length; i++) {
          console.log('response' + i + '==================' + responses[i]);
          if (!responses[i]) {
            output.push({
              data: arrayRecipientId[i],
              success: false
            })
          } else {
            output.push({
              data: responses[i].data,
              success: true
            });
          }
        }

        // use/access the results
      })
    )

  return output;
};

export default async params => {
  let out;

  const accessToken = params.accessToken;
  const text = params.text || '';

  // console.log('Data: ', accessToken, text);

  if (text !== '') {
    let arrayRecipientId = params.recipientId;

    arrayRecipientId = _.uniq(arrayRecipientId);

    const length = arrayRecipientId.length;

    if (length < 250) {
      console.log('make request: ', length);
      out = makeRequest(accessToken, arrayRecipientId, text);
    } else {
      const countSendRequest = length / 250;

      for (let i = 0; i < countSendRequest; i++) {
        const subarrayRecipientId = arrayRecipientId.slice(i * 250, (i + 1) * 250);

        out = makeRequest(accessToken, subarrayRecipientId, text);
      }
    }
  } else {
    console.log('something else');
  }

  return out;
};
