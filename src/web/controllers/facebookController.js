import facebookService from '../services/facebookService';
import loggerHelpers from '../../helpers/loggerHelpers';
import { recordStartTime } from '../../utils/loggerFormat';
// import { codeMessage } from '../../utils';
// import errorCode from '../../utils/errorCode';
// import * as ApiErrors from '../../errors';
import CONFIG from '../../config'
import sendQuickReplies from '../services/facebook/sendQuickReplies';
import sendText from '../services/facebook/sendText';
import sendQuickPhoneRely from '../services/facebook/sendQuickPhoneRely';
import markReadMessage from '../services/facebook/markReadMessage';
import getAllMessages from '../services/facebook/getAllMessages';
import getAllUnreadMessage from '../services/facebook/getAllUnreadMessage';
import getConversationId from '../services/facebook/getConversationId';
import getLongLiveUserAccessToken from '../services/facebook/getLongLiveUserAccessToken';
import getMessagesFromUser from '../services/facebook/getMessagesFromUser';
import getPageId from '../services/facebook/getPageId';
import getPageAccessToken from '../services/facebook/getPageAccessToken';
import getPageInfo from '../services/facebook/getPageInfo';
import getUserAccessToken from '../services/facebook/getUserAccessToken';
import sendBroadcashMessages from '../services/facebook/sendBroadcashMessages';


export default {
  get: (req, res) => {
    console.log(JSON.stringify(req.body));
    const VERIFY_TOKEN = CONFIG.FB_VERIFY_TOKEN;

    // const VERIFY_TOKEN = 'nbm@@2020';

    const arrayVERIFY = VERIFY_TOKEN.split(',')

    console.log("VERIFY_TOKEN", arrayVERIFY);

    // console.log("req.query". req.query);
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    let checkToken = false;

    for (let i = 0; i < arrayVERIFY.length; i++) {
      if (arrayVERIFY[i] === token) {
        checkToken = true;
        break;
      }
    }

    if (mode && token) {
      if (mode === 'subscribe' && checkToken) {
        console.log('WEBHOOK_VERIFIED');
        res.status(200).send(challenge);
      } else {
        res.sendStatus(403);
      }
    } else {
      res.sendStatus(403);
    }

  },

  sendText: (req, res, next) => {
    try {
      const entity = req.body;

      const param = { entity };

      sendText
        .connectFacebookApi(param)
        // write log
        .then(data => {
          res.send(data);
          loggerHelpers.logInfor(req, res, {
            dataParam: req.params,
            dataQuery: req.query
          });
        })
    } catch (error) {
      error.dataQuery = req.query;
      next(error);
    }
  },

  sendBroadcashMessages: (req, res, next) => {
    try {
      const entity = req.body;

      const param = { entity };

      sendBroadcashMessages
        .connectFacebookApi(param)
        // write log
        .then(data => {
          res.send(data);
          loggerHelpers.logInfor(req, res, {
            dataParam: req.params,
            dataQuery: req.query
          });
        })
    } catch (error) {
      error.dataQuery = req.query;
      next(error);
    }
  },

  sendQuickReplies: (req, res, next) => {
    try {
      const entity = req.body;

      // const param = entity; 

      sendQuickReplies
        .connectFacebookApi(entity)
        // write log
        .then(data => {
          res.send(data);
          loggerHelpers.logInfor(req, res, {
            dataParam: req.params,
            dataQuery: req.query
          });
        })
    } catch (error) {
      error.dataQuery = req.query;
      next(error);
    }
  },

  sendQuickPhoneRely: (req, res, next) => {
    try {
      const entity = req.body;

      const param = { entity };

      sendQuickPhoneRely
        .connectFacebookApi(param)
        // write log
        .then(data => {
          res.send(data);
          loggerHelpers.logInfor(req, res, {
            dataParam: req.params,
            dataQuery: req.query
          });
        })
    } catch (error) {
      error.dataQuery = req.query;
      next(error);
    }
  },

  markReadMessage: (req, res, next) => {
    try {
      const entity = req.body;

      const param = { entity };

      console.log("param: ", param);


      markReadMessage
        .connectFacebookApi(param)
        // write log
        .then(data => {
          res.send(data);
          loggerHelpers.logInfor(req, res, {
            dataParam: req.params,
            dataQuery: req.query
          });
        })
    } catch (error) {
      error.dataQuery = req.query;
      next(error);
    }
  },

  getAllMessages: (req, res, next) => {
    try {
      const entity = req.body;

      const param = { entity };

      console.log("param: ", param);


      getAllMessages
        .connectFacebookApi(param)
        // write log
        .then(data => {
          res.send(data);
          loggerHelpers.logInfor(req, res, {
            dataParam: req.params,
            dataQuery: req.query
          });
        })
    } catch (error) {
      error.dataQuery = req.query;
      next(error);
    }
  },

  getAllUnreadMessage: (req, res, next) => {
    try {
      const entity = req.body;

      const param = { entity };

      console.log("param: ", param);


      getAllUnreadMessage
        .connectFacebookApi(param)
        // write log
        .then(data => {
          res.send(data);
          loggerHelpers.logInfor(req, res, {
            dataParam: req.params,
            dataQuery: req.query
          });
        })
    } catch (error) {
      error.dataQuery = req.query;
      next(error);
    }
  },

  getConversationId: (req, res, next) => {
    try {
      const entity = req.body;

      const param = { entity };

      console.log("param: ", param);


      getConversationId
        .connectFacebookApi(param)
        // write log
        .then(data => {
          res.send(data);
          loggerHelpers.logInfor(req, res, {
            dataParam: req.params,
            dataQuery: req.query
          });
        })
    } catch (error) {
      error.dataQuery = req.query;
      next(error);
    }
  },

  getLongLiveUserAccessToken: (req, res, next) => {
    try {
      const entity = req.body;

      const param = { entity };

      console.log("param: ", param);


      getLongLiveUserAccessToken
        .connectFacebookApi(param)
        // write log
        .then(data => {
          res.send(data);
          loggerHelpers.logInfor(req, res, {
            dataParam: req.params,
            dataQuery: req.query
          });
        })
    } catch (error) {
      error.dataQuery = req.query;
      next(error);
    }
  },

  getMessagesFromUser: (req, res, next) => {
    try {
      const entity = req.body;

      const param = { entity };

      console.log("param: ", param);


      getMessagesFromUser
        .connectFacebookApi(param)
        // write log
        .then(data => {
          res.send(data);
          loggerHelpers.logInfor(req, res, {
            dataParam: req.params,
            dataQuery: req.query
          });
        })
    } catch (error) {
      error.dataQuery = req.query;
      next(error);
    }
  },

  getPageAccessToken: (req, res, next) => {
    try {
      const entity = req.body;

      const param = { entity };

      console.log("param: ", param);


      getPageAccessToken
        .connectFacebookApi(param)
        // write log
        .then(data => {
          res.send(data);
          loggerHelpers.logInfor(req, res, {
            dataParam: req.params,
            dataQuery: req.query
          });
        })
    } catch (error) {
      error.dataQuery = req.query;
      next(error);
    }
  },

  getPageId: (req, res, next) => {
    try {
      const entity = req.body;

      const param = { entity };

      console.log("param: ", param);


      getPageId
        .connectFacebookApi(param)
        // write log
        .then(data => {
          res.send(data);
          loggerHelpers.logInfor(req, res, {
            dataParam: req.params,
            dataQuery: req.query
          });
        })
    } catch (error) {
      error.dataQuery = req.query;
      next(error);
    }
  },

  getPageInfo: (req, res, next) => {
    try {
      const entity = req.query;

      const param = { entity };

      console.log("param: ", param);


      getPageInfo
        .connectFacebookApi(param)
        // write log
        .then(data => {
          res.send(data);
          loggerHelpers.logInfor(req, res, {
            dataParam: req.params,
            dataQuery: req.query
          });
        })
    } catch (error) {
      error.dataQuery = req.query;
      next(error);
    }
  },

  getUserAccessToken: (req, res, next) => {
    try {
      const entity = req.body;

      const param = { entity };

      console.log("param: ", param);


      getUserAccessToken
        .connectFacebookApi(param)
        // write log
        .then(data => {
          res.send(data);
          loggerHelpers.logInfor(req, res, {
            dataParam: req.params,
            dataQuery: req.query
          });
        })
    } catch (error) {
      error.dataQuery = req.query;
      next(error);
    }
  },

  post_webhook: (req, res, next) => {
    recordStartTime.call(req);

    try {
      // const { sort, range, filter } = res.locals;

      const entity = req.body;

      console.log('entity', entity);
      // const {  id,time, messaging } = entity;
      const param = { entity };
      // const param = {
      //     id,time, messaging,
      //     auth: req.auth
      // };

      facebookService
        .post_webhook(param)
        .then(data => {
          const dataOutput = {
            result: {
              list: data.result
              /* pagination: {
                    current: data.page,
                    pageSize: data.perPage,
                    total: data.count
                }*/
            },
            success: true,
            // errors: [],
            messages: 'ok'
          };
          // console.log("dataOutput", dataOutput);
          // let accessToken = "EAAFbAeFEZAToBAIxiUnx6aRRyM1FlBYmhfuXJzTZARMKC6cRQopfCZCDgTZBpUNZBbLY7JyZBe0SZBXDLyZBRsBIHZCLMKjX7H4S42PH7SUIFKn2uZBbZBwHMg7l6RSNet7uEJp0MBnVkZBNZCGUZAk9TREXGuQxUuRp3eehy2PtHo6DiOgq25HTZBIXM6SgFVK5PEeIxQskUSyQuvbCExdPPNLYpTUnJmWvOshbkGYVp3nHdCApgZDZD";
          // let accessToken =
          //   'EAAFbAeFEZAToBABWHxWNAhlhaMAyvAUoBVEM7I1THfYTTDPnQ1y57lMYRgrT2dDZCs8wBH7VZABi48Wn8rnZCvIQyvHtDRpkeyzUylFtA4Pc64Bmd5kUSdV5HK0fVWen6Ox6UTNM1LRRA9J40CmdDRZABnKCoZCiersZA9C0ko7BA3C4woLaSlg';
          // sendQuickReplies(accessToken1, senderId, questionsOfTemplate[0].content, ["Có", "Không"]);
          // res.header('Content-Range', `clinicQueues ${range}/${data.count}`);

          sendQuickReplies.connectFacebookApi(data.result);
          // .then(data => {
          //   console.log(data);
          // })

          res.send(dataOutput);
          // write log
          recordStartTime.call(res);
          loggerHelpers.logInfor(req, res, {
            dataParam: req.params,
            dataQuery: req.query
          });
        })
        .catch(error => {
          error.dataQuery = req.query;
          next(error);
        });
    } catch (error) {
      error.dataQuery = req.query;
      next(error);
    }
  }
};
