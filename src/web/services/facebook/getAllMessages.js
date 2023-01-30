import axios from 'axios';
import CONFIG from '../../../config';
export default {
  connectFacebookApi: async data => {
    let output = {};

    console.log('data: ', data);

    const accessToken = data.entity.accessToken;
    const pageId = data.entity.pageId;
    const messageSize = data.entity.messageSize;
    const pageSize = data.entity.pageSize;

    let tempUrl1 = 'fields=conversations'
    let tempUrl2 = '{message_count,participants,unread_count,messages'
    const tempMessageSize = `.limit(${messageSize}){message,from}`
    const tempPageSize = `.limit(${pageSize})`
    
    if (pageSize) {
        tempUrl1 += tempPageSize
    }
    if (messageSize) {
        tempUrl2 += tempMessageSize
    }
    // return new Promise((resolve, reject) => {
    await axios({
      method: 'get',
      url: CONFIG.FB_GRAPH_HOST + '/' + CONFIG.FB_GRAPH_VERSION + '/' + pageId + '?' +  tempUrl1 + tempUrl2 + '}&' + 'access_token=' + accessToken,
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
