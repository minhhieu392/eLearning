import telegramService from '../services/telegramChatbotService';

export default {
  postWebhook: async (req, res, next) => {
    try {
      const entity = req.body;

      const params = { entity };

      entity['message']['recipient'] = {};
      entity['message']['recipient']['id'] = req.params.id;
      res.entity = entity;
      //console.log(JSON.stringify(params));
      await telegramService.postWebhook(params)
        .then(data => {
          console.log('telegramService data ',data);
          if (data && data.isNext) {
            next();
          } else {
            res.json({});
          }
        }).catch((error) => {
          console.log('[!]error', error);
        });
    } catch (e) {
      res.json({});
    }
  }

};
