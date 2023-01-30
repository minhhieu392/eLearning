import CONFIG from '../../../config'
import axios from 'axios';
export default async (params) => {
  const accessToken = params.accessToken;
  const templates = params.templates;
  const userId = params.userId;
  console.log(JSON.stringify(templates));

  let result;

  for await (const template of templates) {
      const data = {
        "chat_id": userId,
        "photo": "https://img.nhathuocgpp.com.vn/connectcare/"+template.image,
        "caption": `${template.url}\n\n${template.heading}\n\n${template.description}`
      };
      console.log(JSON.stringify(data));
      axios({
        method:'POST',
        url: `${CONFIG.TELEGRAM_API_URL}${accessToken}/sendPhoto`,
        data: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json'
        }
    }).then((response) => {
      result = response.data;
      console.log(result);
    }).catch((e) => {
      console.log(e.response.data.error);
      result = e.response.data
    });
  }

  return result;
}
