import userGroupsService from '../services/userGroupsService'
import loggerHelpers from '../helpers/loggerHelpers';
import { recordStartTime } from '../utils/loggerFormat';
import * as ApiErrors from '../errors';

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

      userGroupsService.get_list(param).then(data => {
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
        loggerHelpers.logVIEWED(req, res, {
          dataReqBody: req.body,
          dataReqQuery: req.query,
          dataRes: dataOutput
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
      const param = { id, attributes };

      // console.log("groupUserService param: ", param)
      userGroupsService.get_one(param).then(data => {
        res.send(data);

        recordStartTime.call(res);
        loggerHelpers.logVIEWED(req, res, {
          dataReqBody: req.body,
          dataReqQuery: req.query,
          dataRes: data
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

      userGroupsService.create(param).then(data => {

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

      userGroupsService.update(param).then(data => {
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
  update_status: (req, res, next) => {
    recordStartTime.call(req);
    try {
      const { id } = req.params
      const entity = res.locals.body
      // const entity = req.body
      const param = { id, entity }

      userGroupsService.update_status(param).then(data => {
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
