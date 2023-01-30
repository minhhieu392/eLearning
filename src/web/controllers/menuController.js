import MenuService from '../services/menuService';
import loggerHelpers from '../../helpers/loggerHelpers';
import { codeMessage } from '../../utils';
import errorCode from '../../utils/errorCode';
import { recordStartTime } from '../../utils/loggerFormat';
// import * as ApiErrors from '../errors';

export default {
  get_list: (req, res, next) => {
    try {
      recordStartTime.call(req);

      const { sort, range, filter, attributes } = res.locals;
      const param = {
        sort,
        range,
        filter,
        auth: req.auth,
        attributes
      };

      MenuService.get_list(param)
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
      next(error);
    }
  },
  get_one: (req, res, next) => {
    try {
      recordStartTime.call(req);
      const { id } = req.params;
      const { attributes } = req.query;
      const param = { id, auth: req.auth, attributes };

      // console.log("MenuService param: ", param)
      MenuService.get_one(param)
        .then(data => {
          // res.header('Content-Range', `articles ${range}/${data.count}`);
          res.send(data);

          recordStartTime.call(res);
          loggerHelpers.logInfor(req, res, { data });
        })
        .catch(error => {
          next(error);
        });
    } catch (error) {
      // console.log(error)
      next(error);
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

      MenuService.find_list_parent_child(param)
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
        })
        .catch(err => {
          next(err);
        });
    } catch (error) {
      next(error);
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

      MenuService.find_all_parent_child(param)
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
        })
        .catch(err => {
          next(err);
        });
    } catch (error) {
      next(error);
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
      };

      MenuService.get_menu(param)
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
  }
};
