import templateGroupService from '../services/templateGroupService'
import logger from '../utils/logger';
import loggerFormat, { recordStartTime } from '../utils/loggerFormat';
import { codeMessage } from '../utils';
import errorCode from '../utils/errorCode';
import * as ApiErrors from '../errors';
import MenuService from '../services/menuService';
import loggerHelpers from '../helpers/loggerHelpers';

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

      templateGroupService.get_list(param).then(data => {
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
      templateGroupService.get_one(param).then(data => {
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

      templateGroupService.create(param).then(data => {
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

      templateGroupService.update(param).then(data => {
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
  find_list_parentChild: (req, res, next) => {
    try {
      const { sort, range, filter } = res.locals;
      const param = {
        sort,
        range,
        filter,
        auth: req.auth
      };

      templateGroupService.find_list_parent_child(param).then(data => {
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
      }).catch(err => {
        next(err)
      })
    } catch (error) {
      next(error)
    }
  },
  find_list_parentChild_one: (req, res, next) => {
    try {
      const { sort, range, filter } = res.locals;
      const param = {
        sort,
        range,
        filter,
        auth: req.auth
      };

      templateGroupService.find_list_parent_child_one(param).then(data => {
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
      }).catch(err => {
        next(err)
      })
    } catch (error) {
      next(error)
    }
  },
  find_all_parentChild: (req, res, next) => {
    try {
      const { sort, range, filter } = res.locals;
      const param = {
        sort,
        range,
        filter,
        auth: req.auth
      };

      templateGroupService.find_all_parent_child(param).then(data => {
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
      }).catch(err => {
        next(err)
      })
    } catch (error) {
      next(error)
    }
  },
  updateOrder: (req, res, next) => {
    recordStartTime.call(req);
    try {
      const entity = res.locals.body
      // const entity = req.body
      const param = { entity }

      templateGroupService.updateOrder(param).then(data => {
        if (data && data.result) {
          const dataOutput = {
            result: data.result,
            success: true,
            errors: [],
            messages: []
          };

          res.send(dataOutput);

          recordStartTime.call(res);
          loggerHelpers.logUpdate(req, res, {
            dataQuery: req.query,
            dataOutput: data.result,
          }).catch(error => console.log(error));
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
  get_template_group: (req, res, next) => {
    try {
      recordStartTime.call(req);
      const { sort, range, filter, filterChild } = req.query;
      const filterWithI18n = filter ? Object.assign(JSON.parse(filter)) : {};
      const param = {
        sort: sort ? JSON.parse(sort) : ['createDate', 'DESC'],
        range: range ? JSON.parse(range) : [],
        filter: filterWithI18n,
        filterChild: filterChild ? JSON.parse(filterChild) : null
      }

      templateGroupService.get_template_group(param).then(data => {
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
  bulkUpdate: (req, res, next) => {
    recordStartTime.call(req);
    try {
      const { filter, body } = res.locals;
      const entity = body;
      const param = { filter, entity }
      console.log({ param });
      templateGroupService.bulkUpdate(param).then(data => {
        if (data && data.result) {
          const dataOutput = {
            result: data.result,
            success: true,
            errors: [],
            messages: []
          };

          res.send(dataOutput);

          recordStartTime.call(res);
          loggerHelpers.logUpdate(req, res, {
            dataQuery: req.query,
            dataOutput: data.result,
          }).catch(error => console.log(error));
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
  update_status: (req, res, next) => {
    recordStartTime.call(req);
    try {
      const { id } = req.params
      const entity = res.locals.body
      // const entity = req.body
      const param = { id, entity }

      templateGroupService.update_status(param).then(data => {
        if (data && data.result) {
          const dataOutput = {
            result: data.result,
            success: true,
            errors: [],
            messages: []
          };

          res.send(dataOutput);

          recordStartTime.call(res);
          loggerHelpers.logBLOCKDED(req, res, {
            dataReqBody: req.body,
            dataReqQuery: req.query,
            dataRes: dataOutput
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
};
