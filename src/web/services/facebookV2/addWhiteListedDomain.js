import axios from 'axios';
import CONFIG from '../../../config'
export default async params => {
    let output = {};
    const whiteListedDomain = params.whiteListedDomain || [];
    const accessToken = params.accessToken;
    const version = CONFIG.FB_GRAPH_VERSION;
    const host = CONFIG.FB_GRAPH_HOST;

    const url = `${host}/${version}/me/messenger_profile?access_token=${accessToken}`;

    await axios({
        method: 'post',
        url: url,
        headers: {
            'Content-Type': 'application/json'
        },
        data: {
            whitelisted_domains: whiteListedDomain
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
