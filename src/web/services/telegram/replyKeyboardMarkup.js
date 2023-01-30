import CONFIG from '../../../config'
import axios from 'axios';
export default async (params) => {
  const accessToken = params.accessToken;
  const text = params.text;
  const userId = params.userId;
  const keyboard = params.keyboard;
  const data = {
    "chat_id": userId,
    "text": text,
    "reply_markup": {
      "one_time_keyboard": true,
      "keyboard" : keyboard
    }
  };
  let result;

  await axios({
    method:'POST',
    url: `${CONFIG.TELEGRAM_API_URL}${accessToken}/sendMessage`,
    data: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json'
    }
  }).then((response) => {
    result = response.data;
  }).catch((e) => {
    result = e.response.data
  });

  return result;
}
