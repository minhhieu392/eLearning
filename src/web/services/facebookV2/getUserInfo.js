import axios from 'axios';
import CONFIG from '../../../config';

export default async data => {
    let output = {};
    console.log(data);
    const userId = data.userId;
    const access_token = data.access_token;
    const version = CONFIG.FB_GRAPH_VERSION;
    const host = CONFIG.FB_GRAPH_HOST;

    const url = `${host}/${version}/${userId}?fields=profile_pic,name&access_token=${access_token}`;

    // return new Promise((resolve, reject) => {
    await axios({
      method: 'get',
      url: url,
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(function(response) {
        output = response.data;
      })
      .catch(function(error) {
        console.log('error: ', error.response.data.error);

        output = error.response.data.error;
      });
    return output;
  }

