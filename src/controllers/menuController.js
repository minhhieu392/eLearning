import MenuService from '../services/menuService'
import loggerHelpers from '../helpers/loggerHelpers';
import { codeMessage } from '../utils';
import errorCode from '../utils/errorCode';
import { recordStartTime } from '../utils/loggerFormat';
import * as ApiErrors from '../errors';

export default {
  get_list: (req, res, next) => {
    try {
      recordStartTime.call(req);

      const { sort, range, filter, attributes } = res.locals;
      const param = {
        sort,
        range,
        filter,
        auth: req.auth, attributes
      };

      MenuService.get_many(param).then(data => {

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
      next(error)
    }
  },
  get_one: (req, res, next) => {
    try {
      recordStartTime.call(req);
      const { id } = req.params;
      const { attributes } = req.query;
      const param = { id, auth: req.auth, attributes }

      // console.log("MenuService param: ", param)
      MenuService.get_one(param).then(data => {
        // res.header('Content-Range', `articles ${range}/${data.count}`);
        res.send(data);

        recordStartTime.call(res);
        loggerHelpers.logInfor(req, res, { data });
      }).catch(error => {
        next(error)
      })
    } catch (error) {
      // console.log(error)
      next(error)
    }
  },
  create: (req, res, next) => {
    recordStartTime.call(req);
    try {
      console.log("Request-Body:", res.locals.body);
      const entity = res.locals.body;
      const param = { entity }

      MenuService.create(param).then(data => {

        if (data && data.result) {
          const dataOutput = {
            result: data.result,
            success: true,
            errors: [],
            messages: []
          };

          res.send(dataOutput);
          recordStartTime.call(res);
          loggerHelpers.logCreate(req, res, {
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

      MenuService.update(param).then(data => {
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
  delete: (req, res, next) => {
    try {
      recordStartTime.call(req);
      const { id } = req.params;
      const entity = { Status: 0 }
      let param = { id, entity, auth: req.auth }

      MenuService.get_one(param).then(data1 => {
        param = { ...param, entity: { ...data1, Status: !data1.Status } }
        MenuService.update(param).then(data => {
          res.send(data);

          recordStartTime.call(res);
          loggerHelpers.logInfor(req, res, {});
        }).catch(error => {
          next(error)
        })
      }).catch(error => {
        next(error)
      })
    } catch (error) {
      next(error)
    }
  },
  find_list_parent_child_one: (req, res, next) => {
    try {
      const { sort, range, filter } = res.locals;
      const param = {
        sort,
        range,
        filter,
        auth: req.auth
      };

      MenuService.find_list_parent_child_one(param).then(data => {
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
  find_list_parentChild: (req, res, next) => {
    try {
      const { sort, range, filter } = res.locals;
      const param = {
        sort,
        range,
        filter,
        auth: req.auth
      };

      MenuService.find_list_parent_child(param).then(data => {
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

      MenuService.find_all_parent_child(param).then(data => {
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
  get_menu: (req, res, next) => {
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

      MenuService.get_menu(param).then(data => {
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
      const { sort, range, attributes, filter } = req.query;

      let param;

      try {
        // param = {
        //   sort: sort ? JSON.parse(sort) : ["id", "asc"],
        //   filter: filter ? JSON.parse(filter) : {},
        //   attributes: attributes ? JSON.parse(attributes) : null,
        //   auth: req.auth
        // }
        param = {
          sort,
          filter,
          attributes: attributes ? JSON.parse(attributes) : null,
          auth: req.auth
        }
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
        });
      }
      MenuService.get_all(param).then(data => {
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
  updateOrder: (req, res, next) => {
    recordStartTime.call(req);
    try {
      const entity = res.locals.body
      // const entity = req.body
      const param = { entity }

      MenuService.updateOrder(param).then(data => {
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
  bulkUpdate: (req, res, next) => {
    recordStartTime.call(req);
    try {
      const { filter, body } = res.locals;
      const entity = body;
      const param = { filter, entity }

      MenuService.bulkUpdate(param).then(data => {
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

      MenuService.update_status(param).then(data => {
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
