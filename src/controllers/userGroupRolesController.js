import RoleDetailService from '../services/userGroupRolesService';
import userGroupsService from '../services/userGroupsService';
import { recordStartTime } from '../utils/loggerFormat';
import * as ApiErrors from '../errors';
import loggerHelpers from '../helpers/loggerHelpers';

export default {
  get_list: (req, res, next) => {
    try {
      const { sort, range, filter, attributes } = req.query;

      const param = {
        sort: sort ? JSON.parse(sort) : ['id', 'asc'],
        range: range ? JSON.parse(range) : [0, 100],
        filter: filter ? JSON.parse(filter) : {},
        attributes
      };

      // RoleDetailService.get_list(param).then(data => {
      RoleDetailService.find_all(param)
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
          loggerHelpers.logVIEWED(req, res, {
            dataReqBody: req.body,
            dataReqQuery: req.query,
            dataRes: data
          });
        })
        .catch(err => {
          next(err);
        });
    } catch (error) {
      next(error);
    }
  },
  get_one: (req, res, next) => {
    try {
      const { id } = req.params;
      const { attributes } = req.query;
      const param = { id, attributes };

      // console.log("RoleDetailService param: ", param)
      RoleDetailService.get_one(param)
        .then(data => {
          // res.header('Content-Range', `articles ${range}/${data.count}`);
          res.send(data);
          loggerHelpers.logVIEWED(req, res, {
            dataReqBody: req.body,
            dataReqQuery: req.query,
            dataRes: data
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
      const entity = req.body;
      const param = { entity };

      RoleDetailService.create(param)
        .then(data => {
          // res.header('Content-Range', `articles ${range}/${data.count}`);
          res.send(data);
          loggerHelpers.logCreate(req, res, {
            dataReqBody: req.body,
            dataReqQuery: req.query,
            dataRes: data
          });
        })
        .catch(err => {
          next(err);
        });
    } catch (error) {
      next(error);
    }
  },
  update: (req, res, next) => {
    try {
      const { id } = req.params;
      const entity = req.body;
      const param = { id, entity };

      RoleDetailService.update(param)
        .then(data => {
          // res.header('Content-Range', `articles ${range}/${data.count}`);
          res.send(data);
          loggerHelpers.logUpdate(req, res, {
            dataReqBody: req.body,
            dataReqQuery: req.query,
            dataRes: data
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

      RoleDetailService.update(param)
        .then(data => {
          // res.header('Content-Range', `articles ${range}/${data.count}`);
          res.send(data);
          loggerHelpers.logDelete(req, res, {
            dataReqBody: req.body,
            dataReqQuery: req.query,
            dataRes: data
          });
        })
        .catch(err => {
          next(err);
        });
    } catch (error) {
      next(error);
    }
  },
  find_all: (req, res, next) => {
    try {
      const { sort, range, filter } = req.query;
      const param = {
        sort: sort ? JSON.parse(sort) : [],
        range: range ? JSON.parse(range) : [],
        filter: filter ? JSON.parse(filter) : {}
      };

      RoleDetailService.find_all(param)
        .then(data => {
          if (range) {
            res.header('Content-Range', `roles ${range}/${data.count}`);
            res.send(data.rows);
          } else {
            res.send(data);
          }
        })
        .catch(err => {
          next(err);
        });
    } catch (error) {
      next(error);
    }
  },
  bulk_update: (req, res, next) => {
    try {
      const { userGroupsId } = req.params;
      const roles = req.body;
      const param = { userGroupsId, roles };
      // console.log("userGroupsId",userGroupsId)

      RoleDetailService.bulk_update(param)
        .then(data => {
          // console.log("data role: ", data)
          // res.header('Content-Range', `articles ${range}/${data.count}`);
          res.send(data);
          loggerHelpers.logUpdate(req, res, {
            dataReqBody: req.body,
            dataReqQuery: req.query,
            dataRes: data
          });
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
      const { sort, filter } = req.query;

      const param = { filter: JSON.parse(filter), sort: JSON.parse(sort) };

      RoleDetailService.get_all(param)
        .then(data => {
          res.send(data);
        })
        .catch(err => {
          next(err);
        });
    } catch (error) {
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

      userGroupsService
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
              dataRes: data
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
  }
};
