import CONFIG from '../../../config'
import axios from 'axios';
import convertKeyboard2D from './convertKeyboard2D';
export default async (params) => {
  const accessToken = params.accessToken;
  const text = params.text || 'Mời lựa chọn:';
  const userId = params.userId;
  const photo = params.photo || '';

  const quickReplies = params.quickReplies;
  const data = {
    "chat_id": userId,
    "text": text,
    "photo": photo
  };

  if (quickReplies) {
    data["reply_markup"] = {
      "one_time_keyboard": true,
      "keyboard" : convertKeyboard2D(quickReplies)
      // "keyboard" : convertKeyboard2D(quickReplies)
    }
  }
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
