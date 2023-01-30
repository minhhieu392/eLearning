import axios from 'axios';
import CONFIG from '../../../config';
export default {
  connectFacebookApi: async data => {
    let output = {};

    console.log('data: ', data);

    const accessToken = data.entity.accessToken;
    const conversationId = data.entity.conversationId;
    const pageSize = data.entity.pageSize;
    const version = CONFIG.FB_GRAPH_VERSION;
    const host = CONFIG.FB_GRAPH_HOST;

    const url = `${host}/${version}/${conversationId}?fields=messages.limit(${pageSize || 10}){message,from}&access_token=${accessToken}`;



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
      .catch(function(error) {
        console.log("error: ", error);

        output = {
          data: null
        };
      });

    return output;
  }
};
