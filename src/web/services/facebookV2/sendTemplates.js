/* eslint-disable require-jsdoc */
import axios from 'axios';
import _ from 'lodash';
// eslint-disable-next-line require-jsdoc

const setButtons = (buttons) => {

  return buttons.map(button => {
    if (button.url) {
      return {
        type: "web_url",
        url: button.url,
        title: button.title || button.url
      }

    } else {
      // if (typeof button.payload === 'string') {
      //   button.payload = { title: button.title, type:'templates', payload: button.payload};
      // } else if (typeof button.payload === 'object'){
      //   button.payload = { title: button.title, type:'templates', payload:button.payload } 
      // }

      return {

        type: "postback",
        title: button.title || "Bắt đầu chat",
        payload: button.payload
        // payload: button.payload || button.title || '',
        // payload :  JSON.stringify(button.payload)
      }
    }
  });
}

const setTemplates = (templates) => {
  return templates.map(template => {
    return {
      "title": template.title || 'Lựa chọn',
      "image_url": template.imageUrl || 'https://img.nhathuocgpp.com.vn/get/images/connectcare/userfiles/admin_web/images/20200407/2020_04_07_15_19_41_858_20200312173759602nopathcopy14.png?widthImage=400',
      "subtitle": template.subtitle || 'cung cấp bởi nhathuocgpp',
      "buttons": setButtons(template.buttons)
    }
  });
}

const setOptions = (userId, templates) => {
  let body = {
    "recipient": {
      "id": userId
    },
    "message": {
      "attachment": {
        "type": "template",
        "payload": {
          "template_type": "generic",
          "elements": setTemplates(templates)
        }
      }
    }
  }
  return {
    body: JSON.stringify(body)
  };
};

export default async (params) => {
  let output = {};
  console.log('param', params);
  const accessToken = params.accessToken;
  const userId = params.userId;
  const templates = params.templates;
  const options = setOptions(userId, templates);
  console.log('options body', options.body);
  await axios({
    method: 'post',
    url: 'https://graph.facebook.com/v8.0/me/messages?access_token=' + accessToken,
    data: options.body,
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then(function (response) {
      console.log(options.body, response.data);
      output = {
        data: response.data
      };
    })
    .catch(function (error) {
      console.log('error', error.response.data.error);

      output = {
        data: error.response.data.error
      };
    });
  return output;
};
