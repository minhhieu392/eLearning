import categoryService from '../services/categoryService';
import loggerHelpers from '../../helpers/loggerHelpers';
import { recordStartTime } from '../../utils/loggerFormat';
import { codeMessage } from '../../utils';
import errorCode from '../../utils/errorCode';
// import * as ApiErrors from '../errors';

export default {
  get_list: (req, res, next) => {
    recordStartTime.call(req);
    console.log("locals", res.locals);
    try {
      const { sort, range, filter,attributes } = res.locals;
      const param = {
        sort,
        range,
        filter,
        auth: req.auth,
        attributes
      };

      categoryService.get_list(param).then(data => {
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
      const param = { id, auth: req.auth, attributes };

      categoryService.get_one(param).then(data => {
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
  find_list_parentChild: (req, res, next) => {
    recordStartTime.call(req);
    try {
      const { sort, range, filter } = res.locals;

      const param = {
        sort,
        filter,
        range,
        auth: req.auth
      };

      console.log("filter",filter)
      categoryService.find_list_parent_child(param).then(data => {
        res.send({
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
        });

        recordStartTime.call(res);
        loggerHelpers.logInfor(req, res, {
          dataParam: req.params,
          dataQuery: req.query,
        });
      }).catch(err => {
        next(err)
      })
    } catch (error) {
      next(error)
    }
  },
  find_getbycategories_parentChild: (req, res, next) => {
    recordStartTime.call(req);
    try {
      const { sort, range, filter } = res.locals;

      const param = {
        sort,
        filter,
        range,
        auth: req.auth
      };

      categoryService.find_getbycategories_parentChild(param).then(data => {
        res.send({
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
        });

        recordStartTime.call(res);
        loggerHelpers.logInfor(req, res, {
          dataParam: req.params,
          dataQuery: req.query,
        });
      }).catch(err => {
        next(err)
      })
    } catch (error) {
      next(error)
    }
  },
  get_all: (req, res, next) => {
    try {
      recordStartTime.call(req);
      const { sort, attributes, filter } = res.locals;

      let param;

      try {
        param = {
          sort,
          filter,
          attributes,
          auth: req.auth
        };

        categoryService.get_all(param).then(data => {
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
