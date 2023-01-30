import axios from 'axios';
import CONFIG from '../../../config';
export default {
  connectFacebookApi: async data => {
    let output = {};

    console.log('data: ', data);

    const accessToken = data.entity.accessToken;


    const tempUrl1 = '/oauth/access_token?grant_type=fb_exchange_token&client_id=';
    const tempUrl2 = '&client_secret=';
    const tempUrl3 = '&fb_exchange_token=';

    // return new Promise((resolve, reject) => {
    //     fetch(`${host}/oauth/access_token?
    // grant_type=fb_exchange_token&
    // client_id=${appId}&
    // client_secret=${appSecret}&
    // fb_exchange_token=${accessToken}`)
    //     .then(response => response.json())
    //     .then(data => data)
    await axios({
      method: 'get',
      url: CONFIG.FB_GRAPH_HOST + tempUrl1 + CONFIG.FB_CLIENT_ID + tempUrl2 + CONFIG.FB_CLIENT_SECRET + tempUrl3 + accessToken,
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(function (response) {
        output = {
          data: response.data
        };
      })
      .catch(function(error) {
        console.log("error: ", error);

        output = {
          data: null
        };
      });

    return output;
  }
};
