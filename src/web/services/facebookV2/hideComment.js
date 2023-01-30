import axios from 'axios';
import CONFIG from '../../../config'
export default async params => {
    let output = {};

    console.log('data: ', params);

    const accessToken = params.accessToken;
    const version = CONFIG.FB_GRAPH_VERSION;
    const host = CONFIG.FB_GRAPH_HOST;
    const commentId = params.commentId;
    const url = `${host}/${version}/${commentId}?access_token=${accessToken}&is_hidden=true`;

    await axios({
        method: 'post',
        url: url,
        data: {},
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
