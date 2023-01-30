import CONFIG from '../../config';
import facebook from '../services/facebookV2/index';
// import wit from '../../services/wit/index';
import loggerHelpers from '../../helpers/loggerHelpers';
// import myRedis from '../../db/myRedis';
// import socialChannelService from '../services/socialChannelService';
// import facebookServiceV2 from '../services/facebookServiceV2';
import facebookServiceV3 from '../services/facebookServiceV3';
import chatbotService from '../services/chatbotService';
// import Model from '../../models/models';
// import models from '../../entity/index';
// import * as ApiErrors from '../../errors';
// const { socialChannels, chatbotTemplates } = models;

export default {
  getWebhook: (req, res) => {
    console.log(JSON.stringify(req.body));
    const VERIFY_TOKEN = CONFIG.FB_VERIFY_TOKEN;
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
  postWebhook: async(req, res, next) => {
    const data = req.body;
    const query = req.query;

    // console.log(data);
    console.log('req.body',JSON.stringify(data));
    // console.log('req.query',JSON.stringify(query));

    // res.json({}).status(200);
    // await chatbotService.post_webhook(data);


    await chatbotService
      .post_webhook(data)
      .then(data => {
        if (data.isNext) {
          next();
        } else {
          res.json(data);
        }
      })
      .catch(error => {
        console.log('[!]error', error);
      });
  },
  getCallback: (req, res) => {
    console.log(req.query, req.body);
    res
      .json({
        success: true
      })
      .status(200);
  },
  sendText: async (req, res, next) => {
    try {
      const params = req.body;

      await facebook.sendText(params).then(data => {
        res.send(data);
        loggerHelpers.logInfo(req, res, {
          dataParam: req.params,
          dataQuery: req.query
        });
      });
    } catch (error) {
      error.dataQuery = req.query;
      next(error);
    }
  },
  postWebhookUserEvent: (req, res) => {
    console.log('req.query', JSON.stringify(req.query));
    console.log('req.body', JSON.stringify(req.body));
    res
      .json({
        success: true
      })
      .status(200);
  },
  sendBroadcashMessages: async (req, res, next) => {
    try {
      const params = req.body;

      await facebook.sendBroadcastMessage(params).then(data => {
        res.send(data);
        loggerHelpers.logInfor(req, res, {
          dataParam: req.params,
          dataQuery: req.query
        });
      });
    } catch (error) {
      error.dataQuery = req.query;
      next(error);
    }
  },

  sendQuickReplies: async (req, res, next) => {
    try {
      const params = req.body;

      await facebook.sendQuickReplies(params).then(data => {
        res.send(data);
        loggerHelpers.logInfor(req, res, {
          dataParam: req.params,
          dataQuery: req.query
        });
      });
    } catch (error) {
      error.dataQuery = req.query;
      next(error);
    }
  },

  sendQuickPhoneRely: async (req, res, next) => {
    try {
      const params = req.body;

      await facebook.sendQuickPhoneRely(params).then(data => {
        res.send(data);
        loggerHelpers.logInfor(req, res, {
          dataParam: req.params,
          dataQuery: req.query
        });
      });
    } catch (error) {
      error.dataQuery = req.query;
      next(error);
    }
  },

  markReadMessage: (req, res, next) => {
    try {
      const params = req.body;

      facebook.markReadMessage(params).then(data => {
        res.send(data);
        loggerHelpers.logInfor(req, res, {
          dataParam: req.params,
          dataQuery: req.query
        });
      });
    } catch (error) {
      error.dataQuery = req.query;
      next(error);
    }
  },

  getAllMessages: (req, res, next) => {
    try {
      const params = req.body;

      facebook.getAllMessages(params).then(data => {
        res.send(data);
        loggerHelpers.logInfor(req, res, {
          dataParam: req.params,
          dataQuery: req.query
        });
      });
    } catch (error) {
      error.dataQuery = req.query;
      next(error);
    }
  },

  getAllUnreadMessage: async (req, res, next) => {
    try {
      const params = req.body;

      await facebook.getAllUnreadMessage(params).then(data => {
        res.send(data);
        loggerHelpers.logInfor(req, res, {
          dataParam: req.params,
          dataQuery: req.query
        });
      });
    } catch (error) {
      error.dataQuery = req.query;
      next(error);
    }
  },

  getConversationId: async (req, res, next) => {
    try {
      const params = req.body;

      await facebook.getConversationId(params).then(data => {
        res.send(data);
        loggerHelpers.logInfor(req, res, {
          dataParam: req.params,
          dataQuery: req.query
        });
      });
    } catch (error) {
      error.dataQuery = req.query;
      next(error);
    }
  },

  getLongLiveUserAccessToken: async (req, res, next) => {
    try {
      const params = req.body;

      await facebook.getLongLiveUserAccessToken(params).then(data => {
        res.send(data);
        loggerHelpers.logInfor(req, res, {
          dataParam: req.params,
          dataQuery: req.query
        });
      });
    } catch (error) {
      error.dataQuery = req.query;
      next(error);
    }
  },

  getMessagesFromUser: async (req, res, next) => {
    try {
      const params = req.body;
      // console.log('req',req.body);

      await facebook.getMessagesFromUser(params).then(data => {
        res.send(data);
        loggerHelpers.logInfor(req, res, {
          dataParam: req.params,
          dataQuery: req.query
        });
      });
    } catch (error) {
      error.dataQuery = req.query;
      next(error);
    }
  },

  getPageAccessToken: async (req, res, next) => {
    try {
      const params = req.body;

      await facebook.getPageAccessToken(params).then(data => {
        res.send(data);
        loggerHelpers.logInfor(req, res, {
          dataParam: req.params,
          dataQuery: req.query
        });
      });
    } catch (error) {
      error.dataQuery = req.query;
      next(error);
    }
  },

  getPageId: async (req, res, next) => {
    try {
      const params = req.body;

      await facebook.getPageId(params).then(data => {
        res.send(data);
        loggerHelpers.logInfor(req, res, {
          dataParam: req.params,
          dataQuery: req.query
        });
      });
    } catch (error) {
      error.dataQuery = req.query;
      next(error);
    }
  },

  getPageInfo: async (req, res, next) => {
    try {
      const params = req.body;

      await facebook.getPageInfo(params).then(data => {
        res.send(data);
        loggerHelpers.logInfor(req, res, {
          dataParam: req.params,
          dataQuery: req.query
        });
      });
    } catch (error) {
      error.dataQuery = req.query;
      next(error);
    }
  },

  getUserAccessToken: async (req, res, next) => {
    try {
      const params = req.body;

      await facebook.getUserAccessToken(params).then(data => {
        res.send(data);
        loggerHelpers.logInfor(req, res, {
          dataParam: req.params,
          dataQuery: req.query
        });
      });
    } catch (error) {
      error.dataQuery = req.query;
      next(error);
    }
  },
  getPagePosts: async (req, res, next) => {
    try {
      const params = req.query;
      console.log(params);
      await facebook.getPagePosts(params).then(data => {
        res.send(data);
        loggerHelpers.logInfor(req, res, {
          dataParam: req.params,
          dataQuery: req.query
        });
      });
    } catch (error) {
      error.dataQuery = req.query;
      next(error);
    }
  },
  getPostComments: async (req, res, next) => {
    try {
      const params = req.query;
      console.log(params);
      await facebook.getPostComments(params).then(data => {
        res.send(data);
        loggerHelpers.logInfor(req, res, {
          dataParam: req.params,
          dataQuery: req.query
        });
      });
    } catch (error) {
      error.dataQuery = req.query;
      next(error);
    }
  },
  hideComment: async (req, res, next) => {
    try {
      const params = req.query;
      console.log(params);
      await facebook.hideComment(params).then(data => {
        res.send(data);
        loggerHelpers.logInfor(req, res, {
          dataParam: req.params,
          dataQuery: req.query
        });
      });
    } catch (error) {
      error.dataQuery = req.query;
      next(error);
    }
  },
  getCommentDetail: async (req, res, next) => {
    try {
      const params = req.query;
      console.log(params);
      await facebook.getCommentDetail(params).then(data => {
        res.send(data);
        loggerHelpers.logInfor(req, res, {
          dataParam: req.params,
          dataQuery: req.query
        });
      });
    } catch (error) {
      error.dataQuery = req.query;
      next(error);
    }
  },
  deleteComment: async (req, res, next) => {
    try {
      const params = req.query;
      console.log(params);
      await facebook.deleteComment(params).then(data => {
        res.send(data);
        loggerHelpers.logInfor(req, res, {
          dataParam: req.params,
          dataQuery: req.query
        });
      });
    } catch (error) {
      error.dataQuery = req.query;
      next(error);
    }
  },
  replyComment: async (req, res, next) => {
    try {
      const params = req.query;
      console.log(params);
      await facebook.replyComment(params).then(data => {
        res.send(data);
        loggerHelpers.logInfor(req, res, {
          dataParam: req.params,
          dataQuery: req.query
        });
      });
    } catch (error) {
      error.dataQuery = req.query;
      next(error);
    }
  }
};
