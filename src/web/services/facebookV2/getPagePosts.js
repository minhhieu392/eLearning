import axios from 'axios';
import CONFIG from '../../../config'
export default async params => {
    let output = {};
    console.log('data: ', params);

    const accessToken = params.accessToken;
    const version = CONFIG.FB_GRAPH_VERSION;
    const host = CONFIG.FB_GRAPH_HOST;
    const pageId = params.pageId;
    let url = `${host}/${version}/${pageId}/posts?access_token=${accessToken}`;

    if (params.before) url = url + `&before=${params.before}`;
    else if (params.after) url = url + `&after${params.after}`;

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
