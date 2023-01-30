import tokenSerivce from '../services/tokenSerivce';
import { recordStartTime } from '../utils/loggerFormat';
import loggerHelpers from '../helpers/loggerHelpers';
export default {
    createToken: (req, res, next) => {
        recordStartTime.call(req);
        console.log("locals", req.body);
        try {
          const param = req.body;
    
          tokenSerivce.createToken(param).then(data => {
            const dataOutput = {
              result: {
                data,
              },
              success: true,
              errors: [],
              messages: []
            };
    
            res.header('Content-Range', `createToken`);
            res.send(dataOutput);
            // write log
            recordStartTime.call(res);
            loggerHelpers.logInfor(req, res, {
              dataParam: req.params,
              dataQuery: req.query,
            });
          }).catch(error => {
            error.dataQuery = req.query;
            next(error)
          })
        } catch (error) {
          error.dataQuery = req.query;
          next(error)
        }
      },
      verifyToken: (req, res, next) => {
        recordStartTime.call(req);
        console.log("locals", req.query);
        try {
          const {token} = req.query;
    
          tokenSerivce.verifyToken(token).then(data => {
            const dataOutput = {
              result: {
                data,
              },
              success: true,
              errors: [],
              messages: []
            };
    
            res.header('Content-Range', `createToken`);
            res.send(dataOutput);
            // write log
            recordStartTime.call(res);
            loggerHelpers.logInfor(req, res, {
              dataParam: req.params,
              dataQuery: req.query,
            });
          }).catch(error => {
            error.dataQuery = req.query;
            next(error)
          })
        } catch (error) {
          error.dataQuery = req.query;
          next(error)
        }
      },
}