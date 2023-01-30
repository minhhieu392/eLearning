import axios from 'axios';
import CONFIG from '../../../config';
export default {
  connectFacebookApi: async data => {
    let output = {};

    console.log('data: ', data);

    const accessToken = data.entity.accessToken;
    const pageId = data.entity.pageId;
    const userId = data.entity.userId;


    const tempUrl = 'conversations?user_id='

    // return new Promise((resolve, reject) => {
    await axios({
      method: 'get',
      url: CONFIG.FB_GRAPH_HOST + '/' + CONFIG.FB_GRAPH_VERSION + '/' + pageId + '/'  + tempUrl + userId +  '&' + 'access_token=' + accessToken,
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
