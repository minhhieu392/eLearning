import UserService from '../services/userService';
// import logger from '../utils/logger';
import loggerHelpers from '../helpers/loggerHelpers';
import { codeMessage } from '../utils';
import errorCode from '../utils/errorCode';
import { /* loggerFormat, */ recordStartTime } from '../utils/loggerFormat';

export default {
  get_list: (req, res, next) => {
    try {
      recordStartTime.call(req);
      const { sort, range, filter, attributes } = res.locals;
      const { userId } = req.auth;

      // if (!range) {
      //   param = { filter: filter, userId, auth: req.auth }
      //   UserService.get_many(param).then(data => {
      //     // res.header('Content-Range', `articles ${range}/${data.count}`);
      //     res.send(data);

      //     recordStartTime.call(res);
      //     loggerHelpers.logInfor(req, res, {
      //       dataParam: req.params,
      //       dataQuery: req.query,
      //     });
      //   }).catch(error => {
      //     next(error)
      //   })
      // } else {
      const whereFilter = filter ? filter : {};

      const param = {
        sort: sort ? sort : ['id', 'asc'],
        range: range ? range : [0, 50],
        filter: whereFilter,
        userId,
        auth: req.auth,
        attributes
      };

      UserService.get_list(param)
        .then(data => {
          const response = {
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

          res.send(response);

          // write log
          recordStartTime.call(res);
          loggerHelpers.logInfor(req, res, {
            dataParam: req.params,
            dataQuery: req.query
          });
        })
        .catch(err => {
          next(err);
        });
      // }
    } catch (error) {
      next(error);
    }
  },
  get_one: (req, res, next) => {
    try {
      recordStartTime.call(req);
      const { id } = req.params;
      const { attributes } = req.query;
      const param = { id, auth: req.auth, attributes };

      // console.log("UserService param: ", param)
      UserService.get_one(param)
        .then(data => {
          // res.header('Content-Range', `articles ${range}/${data.count}`);
          res.send(data);

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
    try {
      recordStartTime.call(req);
      const entity = res.locals.body;
      const param = { entity };

      UserService.create(param)
        .then(data => {
          if (data && data.status === 1) {
            // res.send(data.result);
            res.send({
              result: data.result,
              success: true,
              errors: [],
              messages: []
            });

            recordStartTime.call(res);
            loggerHelpers
              .logCreate(req, res, {
                dataQuery: req.query,
                dataOutput: data.result
              })
              .catch(error => console.log(error));
          } else if (data && data.status === 0) {
            const errMsg = 'Tài khoản này đã tồn tại';

            res.send({ success: false, message: errMsg });

            recordStartTime.call(res);
            loggerHelpers.logError(req, res, {
              dataParam: req.params,
              dataQuery: req.query,
              errMsg
            });
          } else if (data && data.status === -2) {
            // const errMsg = "Bạn phải điền đẩy các trường"
            res.send({ success: false, message: data.message });

            recordStartTime.call(res);
            loggerHelpers.logError(req, res, {
              dataParam: req.params,
              dataQuery: req.query
            });
          } else {
            const errMsg = 'Đã có lỗi xảy ra';

            res.send({ success: false, message: errMsg });

            recordStartTime.call(res);
            loggerHelpers.logError(req, res, {
              dataParam: req.params,
              dataQuery: req.query,
              errMsg
            });
          }
        })
        .catch(err => {
          next(err);
        });
    } catch (err) {
      next(err);
    }
  },
  update: (req, res, next) => {
    try {
      recordStartTime.call(req);
      const { id } = req.params;
      const entity = res.locals.body;
      const param = { id, entity };

      UserService.update(param)
        .then(data => {
          if (data && data.status === 1) {
            // res.send(data.result);
            res.send({
              result: data.result,
              success: true,
              errors: [],
              messages: []
            });

            recordStartTime.call(res);
            loggerHelpers
              .logUpdate(req, res, {
                dataQuery: req.query,
                dataOutput: data.result
              })
              .catch(error => console.log(error));
          } else if (data && data.status === 0) {
            const errMsg = 'Tài khoản này đã tồn tại';

            res.send({ success: false, message: errMsg });

            recordStartTime.call(res);
            loggerHelpers.logError(req, res, {
              dataParam: req.params,
              dataQuery: req.query,
              errMsg
            });
          } else if (data && data.status === -2) {
            // const errMsg = "Bạn phải điền đẩy các trường"
            res.send({ success: false, message: data.message });

            recordStartTime.call(res);
            loggerHelpers.logError(req, res, {
              dataParam: req.params,
              dataQuery: req.query
            });
          } else {
            const errMsg = 'Đã có lỗi xảy ra';

            res.send({ success: false, message: errMsg });

            recordStartTime.call(res);
            loggerHelpers.logError(req, res, {
              dataParam: req.params,
              dataQuery: req.query,
              errMsg
            });
          }
        })
        .catch(err => {
          next(err);
        });
    } catch (error) {
      next(error);
    }
  },
  update_users_places: (req, res, next) => {
    try {
      recordStartTime.call(req);
      const { id } = req.params;
      const entity = res.locals.body;
      const param = { id, entity };

      UserService.update_users_places(param)
        .then(data => {
          res.send({
            result: data,
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
  delete: (req, res, next) => {
    try {
      const { id } = req.params;
      const entity = { Status: 0 };
      const param = { id, entity };

      UserService.update(param)
        .then(data => {
          // res.header('Content-Range', `articles ${range}/${data.count}`);
          res.send(data);

          recordStartTime.call(res);
          loggerHelpers.logInfor(req, res, {});
        })
        .catch(err => {
          next(err);
        });
    } catch (error) {
      next(error);
    }
  },
  find_one: user =>
    new Promise((resovle, reject) => {
      try {
        UserService.find_one(user)
          .then(data => {
            resovle(data);
          })
          .catch(error => {
            reject(error);
          });
      } catch (error) {
        reject(error);
      }
    }),
  find: filter =>
    new Promise((resovle, reject) => {
      try {
        UserService.find(filter)
          .then(data => {
            resovle(data);
          })
          .catch(error => {
            reject(error);
          });
      } catch (error) {
        reject(error);
      }
    }),
  get_user_parent: (req, res, next) => {
    try {
      recordStartTime.call(req);

      const { parentId } = req.params;
      const param = { parentId };

      UserService.get_user_parent(param)
        .then(data => {
          res.send(data);

          recordStartTime.call(res);
          loggerHelpers.logInfor(req, res, { data });
        })
        .catch(err => {
          next(err);
        });
    } catch (error) {
      next(error);
    }
  },
  changePass: (req, res, next) => {
    try {
      recordStartTime.call(req);

      const { id } = req.params;
      const entity = req.body;
      const param = { id, entity };

      UserService.changePass(param)
        .then(data => {
          console.log('changePass dataReturn: ', data);
          res.send(data);

          recordStartTime.call(res);
          loggerHelpers.logInfor(req, res, { data });
        })
        .catch(err => {
          next(err);
        });
    } catch (error) {
      next(error);
    }
  },
  resetPass: (req, res, next) => {
    try {
      recordStartTime.call(req);

      const { id } = req.params;
      const entity = req.body;
      const param = { id, entity };

      UserService.resetPass(param)
        .then(data => {
          res.send(data);

          recordStartTime.call(res);
          loggerHelpers.logInfor(req, res, { data });
        })
        .catch(err => {
          next(err);
        });
    } catch (error) {
      next(error);
    }
  },
  get_all: (req, res, next) => {
    try {
      recordStartTime.call(req);
      const { userId } = req.auth;
      const { sort, attributes, filter } = res.locals;

      let param;

      try {
        param = {
          sort,
          filter,
          attributes,
          auth: req.auth
        };
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

      UserService.get_all(param)
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
      next(error);
    }
  }
};
