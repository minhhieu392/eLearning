import axios from 'axios';
import CONFIG from '../../../config'
export default async params => {
    let output = {};
    console.log('data: ', params);

    const accessToken = params.accessToken;
    const version = CONFIG.FB_GRAPH_VERSION;
    const host = CONFIG.FB_GRAPH_HOST;
    const postId = params.postId;
    const url = `${host}/${version}/${postId}/comments?summary=1&filter=stream&access_token=${accessToken}`;
    console.log(url);
    await axios({
        method: 'get',
        url: url,
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(function (response) {
            output = response.data
        })
        .catch(function (error) {
            console.log('error: ', error.response.data.error);

            output = error.response.data.error
        });

    return output;
};
