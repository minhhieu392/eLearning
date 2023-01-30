import categoryService from '../services/categoryService';
import loggerHelpers from '../helpers/loggerHelpers';
import { recordStartTime } from '../utils/loggerFormat';
import { codeMessage } from '../utils';
import errorCode from '../utils/errorCode';
import * as ApiErrors from '../errors';

export default {
  get_list: (req, res, next) => {
    recordStartTime.call(req);
    console.log('locals', res.locals);
    try {
      const { sort, range, filter, attributes } = res.locals;
      const param = {
        sort,
        range,
        filter,
        auth: req.auth,
        attributes
      };

      categoryService
        .get_list(param)
        .then(data => {
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
  },
  get_one: (req, res, next) => {
    recordStartTime.call(req);
    try {
      const { id } = req.params;
      const { attributes } = req.query;
      const param = { id, auth: req.auth, attributes };
      categoryService
        .get_one(param)
        .then(data => {
          res.send(data);

          recordStartTime.call(res);
          loggerHelpers.logInfor(req, res, {
            dataParam: req.params,
            dataQuery: req.query
          });
        })
        .catch(error => {
          next(error);
        });
    } catch (error) {
      error.dataParams = req.params;
      next(error);
    }
  },
  test_tree: (req, res, next) => {
    recordStartTime.call(req);
    try {
      const { sort, range, filter } = res.locals;

      const param = {
        sort,
        filter,
        range,
        auth: req.auth
      };

      categoryService
        .test_tree(param)
        .then(data => {
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
            dataQuery: req.query
          });
        })
        .catch(err => {
          next(err);
        });
    } catch (error) {
      next(error);
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

      categoryService
        .find_list_parent_child(param)
        .then(data => {
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
            dataQuery: req.query
          });
        })
        .catch(err => {
          next(err);
        });
    } catch (error) {
      next(error);
    }
  },
  find_list_parent_child_one: (req, res, next) => {
    recordStartTime.call(req);
    try {
      const { sort, range, filter } = res.locals;

      const param = {
        sort,
        filter,
        range,
        auth: req.auth
      };

      categoryService
        .find_list_parent_child_one(param)
        .then(data => {
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
            dataQuery: req.query
          });
        })
        .catch(err => {
          next(err);
        });
    } catch (error) {
      next(error);
    }
  },
  find_all_parentChild: (req, res, next) => {
    recordStartTime.call(req);
    try {
      const { sort, range, filter } = res.locals;

      const param = {
        sort,
        filter,
        range,
        auth: req.auth
      };

      categoryService
        .find_all_parent_child(param)
        .then(data => {
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
            dataQuery: req.query
          });
        })
        .catch(err => {
          next(err);
        });
    } catch (error) {
      next(error);
    }
  },
  create: (req, res, next) => {
    recordStartTime.call(req);
    try {
      console.log('Request-Body:', res.locals.body);
      const entity = res.locals.body;
      const param = { entity };

      categoryService
        .create(param)
        .then(data => {
          if (data && data.result) {
            const dataOutput = {
              result: data.result,
              success: true,
              errors: [],
              messages: []
            };

            res.send(dataOutput);
            recordStartTime.call(res);
            loggerHelpers
              .logCreate(req, res, {
                dataQuery: req.query,
                dataOutput: data.result
              })
              .catch(error => console.log(error));
          } else {
            throw new ApiErrors.BaseError({
              statusCode: 202,
              type: 'crudNotExisted'
            });
          }
        })
        .catch(error => {
          next(error);
        });
    } catch (error) {
      next(error);
    }
  },
  update: (req, res, next) => {
    recordStartTime.call(req);
    try {
      const { id } = req.params;
      const entity = res.locals.body;
      // const entity = req.body
      const param = { id, entity };

      categoryService
        .update(param)
        .then(data => {
          if (data && data.result) {
            const dataOutput = {
              result: data.result,
              success: true,
              errors: [],
              messages: []
            };

            res.send(dataOutput);

            recordStartTime.call(res);
            loggerHelpers
              .logUpdate(req, res, {
                dataQuery: req.query,
                dataOutput: data.result
              })
              .catch(error => console.log(error));
          } else {
            throw new ApiErrors.BaseError({
              statusCode: 202,
              type: 'crudNotExisted'
            });
          }
        })
        .catch(error => {
          error.dataInput = req.body;
          error.dataParams = req.params;
          next(error);
        });
    } catch (error) {
      error.dataInput = req.body;
      error.dataParams = req.params;
      next(error);
    }
  },
  delete: (req, res, next) => {
    recordStartTime.call(req);
    try {
      const { id } = req.params;
      // const entity = { Status: 0 }
      const param = { id, auth: req.auth };

      categoryService
        .delete(param)
        .then(data => {
          if (data && data.status === 1) {
            const dataOutput = {
              result: null,
              success: true,
              errors: [],
              messages: []
            };

            res.send(dataOutput);

            recordStartTime.call(res);
            loggerHelpers.logInfor(req, res, {});
          } else {
            throw new ApiErrors.BaseError({
              statusCode: 202,
              type: 'deleteError'
            });
          }
        })
        .catch(error => {
          error.dataParams = req.params;
          next(error);
        });
    } catch (error) {
      error.dataParams = req.params;
      next(error);
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

        categoryService
          .get_all(param)
          .then(data => {
            res.send({
              result: data,
              success: true,
              errors: null,
              messages: null
            });

            recordStartTime.call(res);
            loggerHelpers.logInfor(req, res, { data });
          })
          .catch(err => {
            next(err);
          });
      } catch (error) {
        const { code } = errorCode.paramError;
        const statusCode = 406;
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
    } catch (error) {
      next(error);
    }
  },
  updateOrder: (req, res, next) => {
    recordStartTime.call(req);
    try {
      const entity = res.locals.body;
      // const entity = req.body
      const param = { entity };

      categoryService
        .updateOrder(param)
        .then(data => {
          if (data && data.result) {
            const dataOutput = {
              result: data.result,
              success: true,
              errors: [],
              messages: []
            };

            res.send(dataOutput);

            recordStartTime.call(res);
            loggerHelpers
              .logUpdate(req, res, {
                dataQuery: req.query,
                dataOutput: data.result
              })
              .catch(error => console.log(error));
          } else {
            throw new ApiErrors.BaseError({
              statusCode: 202,
              type: 'crudNotExisted'
            });
          }
        })
        .catch(error => {
          error.dataInput = req.body;
          error.dataParams = req.params;
          next(error);
        });
    } catch (error) {
      error.dataInput = req.body;
      error.dataParams = req.params;
      next(error);
    }
  },
  updateOrderHome: (req, res, next) => {
    recordStartTime.call(req);
    try {
      const entity = res.locals.body;
      // const entity = req.body
      const param = { entity };

      categoryService
        .updateOrderHome(param)
        .then(data => {
          if (data && data.result) {
            const dataOutput = {
              result: data.result,
              success: true,
              errors: [],
              messages: []
            };

            res.send(dataOutput);

            recordStartTime.call(res);
            loggerHelpers
              .logUpdate(req, res, {
                dataQuery: req.query,
                dataOutput: data.result
              })
              .catch(error => console.log(error));
          } else {
            throw new ApiErrors.BaseError({
              statusCode: 202,
              type: 'crudNotExisted'
            });
          }
        })
        .catch(error => {
          error.dataInput = req.body;
          error.dataParams = req.params;
          next(error);
        });
    } catch (error) {
      error.dataInput = req.body;
      error.dataParams = req.params;
      next(error);
    }
  },
  bulkUpdate: (req, res, next) => {
    recordStartTime.call(req);
    try {
      const { filter, body } = res.locals;
      const entity = body;
      const param = { filter, entity };

      categoryService
        .bulkUpdate(param)
        .then(data => {
          if (data && data.result) {
            const dataOutput = {
              result: data.result,
              success: true,
              errors: [],
              messages: []
            };

            res.send(dataOutput);

            recordStartTime.call(res);
            loggerHelpers
              .logUpdate(req, res, {
                dataQuery: req.query,
                dataOutput: data.result
              })
              .catch(error => console.log(error));
          } else {
            throw new ApiErrors.BaseError({
              statusCode: 202,
              type: 'crudNotExisted'
            });
          }
        })
        .catch(error => {
          error.dataInput = req.body;
          error.dataParams = req.params;
          next(error);
        });
    } catch (error) {
      error.dataInput = req.body;
      error.dataParams = req.params;
      next(error);
    }
  },
  update_status: (req, res, next) => {
    recordStartTime.call(req);
    try {
      const { id } = req.params;
      const entity = res.locals.body;
      // const entity = req.body
      const param = { id, entity };

      categoryService
        .update_status(param)
        .then(data => {
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
              type: 'crudNotExisted'
            });
          }
        })
        .catch(error => {
          error.dataInput = req.body;
          error.dataParams = req.params;
          next(error);
        });
    } catch (error) {
      error.dataInput = req.body;
      error.dataParams = req.params;
      next(error);
    }
  },
  get_categoriesFilter: (req, res, next) => {
    recordStartTime.call(req);

    console.log('req.auth=', req.auth);
    console.log('locals', res.locals);
    try {
      const { filter } = res.locals;
      const param = {
        filter,
        auth: req.auth
      };

      categoryService
        .get_categoriesFilter(param)
        .then(data => {
          const dataOutput = {
            result: {
              list: data
            },
            success: true,
            errors: [],
            messages: []
          };

          res.send(dataOutput);
          // write log
          recordStartTime.call(res);
          // loggerHelpers.logVIEWED(req, res, {
          //   dataReqBody: req.body,
          //   dataReqQuery: req.query,
          //   dataRes: dataOutput
          // });
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
