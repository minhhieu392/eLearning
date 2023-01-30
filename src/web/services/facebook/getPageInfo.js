import axios from 'axios';
import CONFIG from '../../../config';
import models from '../../../entity/index';
import Model from '../../../models/models';
const { socialChannels, socialGroupChannels } = models;

export default {
  connectFacebookApi: async data => {
    let output = {};

    console.log('data: ', data);

    const pageId = data.entity.pageId;
    const version = CONFIG.FB_GRAPH_VERSION;
    const host = CONFIG.FB_GRAPH_HOST;
    const foundSocialChannel = await Model.findOne(socialChannels, {
      where: {
        link: pageId
      },
      attributes: ['id', 'token', 'placesId', 'link'],
      include: [{ model: socialGroupChannels, as: 'socialGroupChannels', attributes: ['name'], required: true }]
    }).catch(err => {
      output = err;
    });

    const accessToken = foundSocialChannel ? foundSocialChannel.token : '';
    const url = `${host}/${version}/${pageId}?fields=picture,description,name&access_token=${accessToken}`;

    // return new Promise((resolve, reject) => {
    await axios({
      method: 'get',
      url: url,
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(function (response) {
        output = {
          data: response.data
        };
      })
      .catch(function (error) {
        console.log("error: ", error);

        output = {
          data: null
        };
      });

    return output;
  }
};
