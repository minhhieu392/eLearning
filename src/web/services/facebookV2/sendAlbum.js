import axios from 'axios';
import CONFIG from '../../../config';

// eslint-disable-next-line require-jsdoc
const setOptions = (userId, templates) => {
  const body = {
    recipient: {
      id: userId
    },
    message: {
      attachment: {
        type: 'template',
        payload: {
          template_type: 'generic',
          elements: templates.map(template => {
            return {
              title: template.heading || 'Nhà thuốc GPP',
              image_url: "https://img.nhathuocgpp.com.vn/connectcare/" + template.image,
              subtitle: template.description || 'Nhà thuốc GPP',
              default_action: {
                type: 'web_url',
                url: template.url|| 'https://nhathuocgpp.com.vn',
                webview_height_ratio: 'tall'
              },
              buttons: [
                {
                  type: 'web_url',
                  url: template.url|| 'https://nhathuocgpp.com.vn',
                  title: 'Xem Website'
                },
                // {
                //   type: 'postback',
                //   title: 'Bắt đầu chat',
                //   payload: 'DEVELOPER_DEFINED_PAYLOAD'
                // }
              ]
            };
          })
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

  console.log('data: ', params);

  const accessToken = params.accessToken;
  const userId = params.userId;
  const templates = params.templates || [];

  // console.log('Data: ', accessToken, userId, url);

  if (templates !== null || templates !== undefined) {
    // console.log('accessToken=%s || userId=%s || text=%s', accessToken, userId, text);
    const options = setOptions(userId, templates);

    // console.log('options   ', options);
    // console.log('options body   ', options.body);
    // return new Promise((resolve, reject) => {
    await axios({
      method: 'post',
      url: `${CONFIG.FB_GRAPH_HOST}/v2.6/me/messages?access_token=${accessToken}`,
      data: options.body,
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(function(response) {
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
