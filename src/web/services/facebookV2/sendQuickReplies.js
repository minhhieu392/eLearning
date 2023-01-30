import axios from 'axios';
import _ from 'lodash';
// eslint-disable-next-line require-jsdoc
const setOptions = (userId, text, quickReplies) => {

  let body = {};

  // console.log({
  //   task: 'set quickReplies options',
  //   quickReplies
  // });

  if (!_.isEmpty(quickReplies)) {
  
    quickReplies = quickReplies.map(item => {
      const _item = {
        content_type: 'text',
        title: item.buttonName,
      }

      _item.payload = item.payload ? { title: item.buttonName, type:'quickReplies', ...item.payload } : { title: item.buttonName, type:'quickReplies'}
      _item.payload = JSON.stringify(_item.payload);
      // console.log({_item});

      return _item;
    });
  }

  if (!_.isEmpty(quickReplies)) {
    body = {
      recipient: {
        id: `${userId}`
      },
      message: {
        text: `${text}`,
        quick_replies: quickReplies
      },
      messaging_type: 'RESPONSE'
    };
  } else {
    body = {
      recipient: {
        id: `${userId}`
      },
      message: {
        text: `${text}`
      },
      messaging_type: 'RESPONSE'
    };
  }
  // console.log("body",body)

  return {
    body: JSON.stringify(body)
  };

};

export default async params => {
  let output = {};

  const accessToken = params.accessToken;
  const userId = params.userId;
  const text = params.text || '';
  const quickReplies = params.quickReplies;

  if (text !== '') {
    // console.log('accessToken=%s || userId=%s || text=%s || quickReplies=%s ', accessToken, userId, text, quickReplies)
    const options = setOptions(userId, text, quickReplies);

    // console.log('options   ', options)
    // console.log('options body   ', options.body)
    // return new Promise((resolve, reject) => {
    await axios({
      method: 'post',
      url: 'https://graph.facebook.com/v5.0/me/messages?access_token=' + accessToken,
      data: options.body,
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(function(response) {
        // console.log(options.body,response.data);
        output = {
          data: response.data
        };
      })
      .catch(function(error) {
        // console.log('Ket noi that bai**********************************');
        // console.log('kết thúc error -----------------------------------------------------------------', error.response.data.error);

        output = {
          data: error.response.data.error
        };
      });
    // );
  }

  return output;
};
