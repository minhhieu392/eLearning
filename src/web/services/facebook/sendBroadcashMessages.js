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
    }
  };

  return {
    body: JSON.stringify(body)
  };
};

// eslint-disable-next-line require-jsdoc
const makeRequest = async (accessToken, arrayRecipientId, text, output) => {
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
    }))
    .then(
      axios.spread((...responses) => {
        console.log('send success', responses);

        output.success = [...responses];

        // use/access the results
      })
    )
    .catch(
      axios.spread((...error) => {

        console.log('=======================================================');
        console.log('send error', error);

        output.error = [...error];

        // use/access the results
      })
    );
};

export default {
  connectFacebookApi: async data => {
    let output = {};

    console.log('data: ', data);

    const accessToken = data.entity.accessToken;
    const text = data.entity.text || '';

    // console.log('Data: ', accessToken, text);

    if (text !== '') {

          let arrayRecipientId = data.entity.recipientId;

          arrayRecipientId = _.uniq(arrayRecipientId);

          const length = arrayRecipientId.length;

          if (length < 250) {
            makeRequest(accessToken, arrayRecipientId, text, output);
          } else {
            const countSendRequest = length / 250;

            for (let i = 0; i < countSendRequest; i++) {

              const subarrayRecipientId = arrayRecipientId.slice(i*250, (i+1)*250);

              makeRequest(accessToken, subarrayRecipientId, text, output);
            }
          }
      } else {
        console.log('something else');
      }

    return output;
  }
};
