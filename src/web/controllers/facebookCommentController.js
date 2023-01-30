import facebookCommentService from '../services/facebookCommentService';
import CONFIG from '../../config';

export default {
  post: async (req, res, next) => {
    const entity = req.body;
    const params = { entity };

    res.json({});
    try {
      await facebookCommentService.post(params);
    } catch(error) {
      next(error);
    }
  },
  get: (req, res) => {
    console.log(JSON.stringify(req.body));
    const VERIFY_TOKEN = CONFIG['FB_VERIFY_TOKEN'];
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode && token) {
      if (mode === 'subscribe' && token === VERIFY_TOKEN) {
        res.status(200).send(challenge);
      } else {
        res.sendStatus(403);
      }
    } else {
      res.sendStatus(403);
    }
  },
}
