import CONFIG from '../../../config'
import axios from 'axios';
export default async (params) => {
  const accessToken = params.accessToken;
  const userId = params.userId;
  const data = {
    "chat_id": userId,
  };


  let result;

  await axios({
    method:'GET',
    url: `${CONFIG.TELEGRAM_API_URL}${accessToken}/getChat`,
    params: {
      ...data
    }
  }).then((response) => {
    result = response.data;
  }).catch((e) => {
    result = e.response.data
  });

  return result;
}
