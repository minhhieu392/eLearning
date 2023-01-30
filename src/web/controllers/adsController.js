import adsService from '../services/adsService'
import loggerHelpers from '../../helpers/loggerHelpers';
import { recordStartTime } from '../../utils/loggerFormat';
import { codeMessage } from '../../utils';
import errorCode from '../../utils/errorCode';

export default {
  get_list: (req, res, next) => {
    recordStartTime.call(req);
    console.log("locals", res.locals);
    try {
      const { sort, range, filter, attributes } = res.locals;
      const param = {
        sort,
        range,
        filter,
        auth: req.auth, attributes
      };

      adsService.get_list(param).then(data => {
        const dataOutput = {
          result: {
            list: data.rows,
            pagination: {
              current: data.page,
              pageSize: data.perPage,
              total: data.count
            }
          },
          success: true,
          errors: [],
          messages: []
        };

        res.header('Content-Range', `sclSocialAccounts ${range}/${data.count}`);
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
  get_one: (req, res, next) => {
    recordStartTime.call(req);
    try {
      const { id } = req.params;
      const { attributes } = req.query;
      const param = { id, auth: req.auth,attributes }

      // console.log("adsService param: ", param)
      adsService.get_one(param).then(data => {
        res.send(data);

        recordStartTime.call(res);
        loggerHelpers.logInfor(req, res, {
          dataParam: req.params,
          dataQuery: req.query,
        });
      }).catch(error => {
        next(error)
      })
    } catch (error) {
      error.dataParams = req.params;
      next(error)
    }
  },
  get_all: (req, res, next) => {
    try {
      recordStartTime.call(req);
      const { attributes } = req.query;
      const { sort, filter } = res.locals;

      try {
        const param = {
          sort,
          attributes: attributes ? JSON.parse(attributes) : null,
          filter,
          auth: req.auth
        };

        adsService.get_all(param).then(data => {
          res.send({
            result: data,
            success: true,
            errors: null,
            messages: null
          });

          recordStartTime.call(res);
          loggerHelpers.logInfor(req, res, { data });
        }).catch(err => {
          next(err)
        })
      } catch (error) {
        const { code } = errorCode.paramError;
        const statusCode = 406
        const errMsg = new Error(error).message;

        recordStartTime.call(res);
        loggerHelpers.logError(req, res, { errMsg });
        res.send({
          result: null,
          success: false,
          errors: [{ code, message: errorCode.paramError.messages[0] }],
          messages: [codeMessage[statusCode], errMsg]
        })
      }
    } catch (error) {
      next(error)
    }
  },
};
