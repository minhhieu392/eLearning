import CONFIG from '../../../config'
import axios from 'axios';
export default async (params) => {
  const accessToken = params.accessToken;
  const data = params.data;
  let result;

  await axios({
    url: `${CONFIG.FACEBOOK_GRAPH_URL}/message`,
    data: JSON.stringify(data),
    params: {
      access_token: accessToken
    }
  }).then((response) => {
    result = response.data;
  }).catch((e) => {
    result = e.response.data
  })

  return result;
}
