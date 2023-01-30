import chatbotService from '../services/chatbotService';

export default {
  postWebhook: async (req, res, next) => {
    const params = req.body;
    // await chatbotService.post_webhook(params)
    //   .then(data => {
    //     console.log(data);
    //     if (data.isNext) {
    //       next();
    //     } else {
    //       res.json(data);
    //     }
    //   }).catch((error) => {
    //     console.log('[!]error', error);
    //   })
    const result = await chatbotService.post_webhook(params);
    console.log({result});
    if (result && result.isNext === true) {
      next();
    } else {
      res.json(result);
    }
  },
  getWebhook: async (req, res) => {
    res.send('ok').status(200);
    const params = req.query;
    // console.log(JSON.stringify(params));
    // await chatbotService.getWebhook(params)
    //   .then(data => {
    //     console.log('[ok]data', data);
    //   }).catch((error) => {
    //     console.log('[!]error', error);
    //   })
  }
}
