import axios from 'axios';
import CONFIG from '../../../config';
export default {
  connectFacebookApi: async data => {
    let output = {};

    console.log('data: ', data);

    const code = data.entity.code;
    const redirectUri = data.entity.redirectUri;


    const host = CONFIG.FB_GRAPH_HOST;
    const appId = CONFIG.FB_CLIENT_ID;
    const appSecret = CONFIG.FB_CLIENT_SECRET;

    const url = `${host}/oauth/access_token?client_id=${appId}&redirect_uri=${redirectUri}&client_secret=${appSecret}&code=${code}`;

    // return new Promise((resolve, reject) => {
    await axios({
      method: 'get',
      url: url,
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(function(response) {
        output = {
          data: response.data
        };
      })
      .catch(function(error) {
        console.log('error: ', error);

        output = {
          data: null
        };
      });

    return output;
  }
};
