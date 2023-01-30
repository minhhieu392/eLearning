import ecommerceProductCollectionService from '../services/ecommerceProductCollectionService'
import logger from '../../utils/logger';
import loggerFormat, { recordStartTime } from '../../utils/loggerFormat';
import { codeMessage } from '../../utils';
import errorCode from '../../utils/errorCode';
import * as ApiErrors from '../../errors';

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

      ecommerceProductCollectionService.get_list(param).then(data => {
        const objLogger = loggerFormat(req, res);
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
        logger.info('', {
          ...objLogger,
          dataQuery: req.query,
          // dataOutput: CONFIG.LOGGING_DATA_OUTPUT === 'true' ? dataOutput : null
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
      const param = { id, attributes }

      // console.log("districtsService param: ", param)
      ecommerceProductCollectionService.get_one(param).then(data => {
        const objLogger = loggerFormat(req, res);

        res.send(data);
        recordStartTime.call(res);
        logger.info('', {
          ...objLogger,
          dataParams: req.params,
          // data
        });
      }).catch(error => {
        next(error)
      })
    } catch (error) {
      error.dataParams = req.params;
      next(error)
    }
  },
  create: (req, res, next) => {
    recordStartTime.call(req);
    try {
      console.log("Request-Body:", req.body);
      const entity = res.locals.body;
      const param = { entity }

      ecommerceProductCollectionService.create(param).then(data => {
        const objLogger = loggerFormat(req, res);

        if (data && data.result) {
          const dataOutput = {
            result: data.result,
            success: true,
            errors: [],
            messages: []
          };

          res.send(dataOutput);
          recordStartTime.call(res);
          logger.info('', {
            ...objLogger,
            dataInput: req.body,
            // dataOutput
          });
        } else {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'crudNotExisted',
          });
        }
      }).catch(error => {
        next(error)
      })
    } catch (error) {
      next(error)
    }
  },
  update: (req, res, next) => {
    recordStartTime.call(req);
    try {
      const { id } = req.params
      const entity = res.locals.body
      // const entity = req.body
      const param = { id, entity }

      ecommerceProductCollectionService.update(param).then(data => {
        const objLogger = loggerFormat(req, res);

        if (data && data.result) {
          const dataOutput = {
            result: data.result,
            success: true,
            errors: [],
            messages: []
          };

          res.send(dataOutput);

          recordStartTime.call(res);
          logger.info('', {
            ...objLogger,
            dataParams: req.params,
            dataInput: req.body,
            // dataOutput: CONFIG.LOGGING_DATA_OUTPUT ? dataOutput : null
          });
        } else {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'crudNotExisted',
          });
        }
      }).catch(error => {
        error.dataInput = req.body;
        error.dataParams = req.params;
        next(error)
      })
    } catch (error) {
      error.dataInput = req.body;
      error.dataParams = req.params;
      next(error)
    }
  },
  delete: (req, res, next) => {
    recordStartTime.call(req);
    try {
      const { id } = req.params;
      // const entity = { Status: 0 }
      const param = { id }

      ecommerceProductCollectionService.delete(param).then(data => {
        const objLogger = loggerFormat(req, res);

        if (data && data.status === 1) {
          const dataOutput = {
            result: null,
            success: true,
            errors: [],
            messages: []
          };

          res.send(dataOutput);

          recordStartTime.call(res);
          logger.info('', {
            ...objLogger,
            dataParams: req.params,
            // dataOutput
          });
        }
        else {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'deleteError',
          });
        }
      }).catch(error => {
        error.dataParams = req.params;
        next(error)
      })
    } catch (error) {
      error.dataParams = req.params;
      next(error)
    }
  },
  get_all: (req, res, next) => {
    try {
      const { sort, range, attributes, filter } = res.locals;
      // param = {
      //   sort: sort ? JSON.parse(sort) : ["id", "asc"],
      //   filter: filter ? JSON.parse(filter) : {},
      //   attributes: attributes ? JSON.parse(attributes) : null,
      //   auth: req.auth
      // };
      let param;

      try {

        param = {
          sort,
          range,
          filter,
          auth: req.auth
        };

      } catch (error) {
        const { code } = errorCode.paramError;
        const statusCode = 406
        const errMsg = new Error(error).message;

        logger.error(errMsg);
        res.send({
          result: null,
          success: false,
          errors: [{ code, message: errorCode.paramError.messages[0] }],
          messages: [codeMessage[statusCode], errMsg]
        })
      }
      ecommerceProductCollectionService.get_all(param).then(data => {
        res.send({
          result: data,
          success: true,
          errors: null,
          messages: null
        });
      }).catch(err => {
        next(err)
      })
    } catch (error) {
      next(error)
    }
  },
};
