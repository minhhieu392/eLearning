import CONFIG from '../../../config';
import axios from 'axios';
import { regUrl } from '../../../utils/helper';
export default async params => {
  const accessToken = params.accessToken;
  const userId = params.userId;
  const url = params.url || '';
  console.log('url', params);
  const data = {
    chat_id: userId,
    // 'https://img.nhathuocgpp.com.vn/connectcare/' + url
    photo: (url && url.match(regUrl) && url.match(regUrl).length > 0 ) ? url : CONFIG['CONNECTCARE_IMAGES_URL'] + url
  };

  let result;

  await axios({
    method: 'POST',
    url: `${CONFIG['TELEGRAM_API_URL']}${accessToken}/sendPhoto`,
    data: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then(response => {
      result = response.data;
    })
    .catch(e => {
      result = e.response.data;
    });

  return result;
};
