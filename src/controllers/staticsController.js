import staticsService from '../services/staticsService';
import loggerHelpers from '../helpers/loggerHelpers';
import { recordStartTime } from '../utils/loggerFormat';

export default {
  khoa_hoc_top: (req, res, next) => {
    recordStartTime.call(req);
    console.log('locals', res.locals);
    try {
      const { sort, range, filter, attributes, sortBy } = res.locals;
      const param = {
        sort,
        range,
        filter,
        auth: req.auth,
        attributes,
        sortBy
      };

      staticsService
        .khoa_hoc_top(param)
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
          loggerHelpers.logVIEWED(req, res, {
            dataReqBody: req.body,
            dataReqQuery: req.query,
            dataRes: dataOutput
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
  khoa_hoc_ty_le_hoan_thanh: (req, res, next) => {
    recordStartTime.call(req);
    console.log('locals', res.locals);
    try {
      const { sort, range, filter, attributes, sortBy } = res.locals;
      const param = {
        sort,
        range,
        filter,
        auth: req.auth,
        attributes,
        sortBy
      };

      staticsService
        .khoa_hoc_ty_le_hoan_thanh(param)
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
          loggerHelpers.logVIEWED(req, res, {
            dataReqBody: req.body,
            dataReqQuery: req.query,
            dataRes: dataOutput
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
  doanh_thu: (req, res, next) => {
    recordStartTime.call(req);
    console.log('locals', res.locals);
    try {
      const { sort, range, filter, attributes, sortBy } = res.locals;
      const param = {
        sort,
        range,
        filter,
        auth: req.auth,
        attributes,
        sortBy
      };

      staticsService
        .doanh_thu(param)
        .then(data => {
          const dataOutput = {
            result: {
              list: data.rows,
              detail: data.detail
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
  hoc_vien_moi: (req, res, next) => {
    recordStartTime.call(req);
    console.log('locals', res.locals);
    try {
      const { sort, range, filter, attributes, sortBy } = res.locals;
      const param = {
        sort,
        range,
        filter,
        auth: req.auth,
        attributes,
        sortBy
      };

      staticsService
        .hoc_vien_moi(param)
        .then(data => {
          const dataOutput = {
            result: {
              list: data.rows,
              detail: data.detail
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
  hoc_vien_dang_ky: (req, res, next) => {
    recordStartTime.call(req);
    console.log('locals', res.locals);
    try {
      const { sort, range, filter, attributes, sortBy } = res.locals;
      const param = {
        sort,
        range,
        filter,
        auth: req.auth,
        attributes,
        sortBy
      };

      staticsService
        .hoc_vien_dang_ky(param)
        .then(data => {
          const dataOutput = {
            result: {
              list: data.rows,
              detail: data.detail
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
  top_dich_vu: (req, res, next) => {
    recordStartTime.call(req);
    console.log('locals', res.locals);
    try {
      const { sort, range, filter, attributes, sortBy } = res.locals;
      const param = {
        sort,
        range,
        filter,
        auth: req.auth,
        attributes,
        sortBy
      };

      staticsService
        .top_dich_vu(param)
        .then(data => {
          const dataOutput = {
            result: {
              list: data.rows,
              total: data.total,
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
  top_khoa_hoc: (req, res, next) => {
    recordStartTime.call(req);
    console.log('locals', res.locals);
    try {
      const { sort, range, filter, attributes, sortBy } = res.locals;
      const param = {
        sort,
        range,
        filter,
        auth: req.auth,
        attributes,
        sortBy
      };

      staticsService
        .top_khoa_hoc(param)
        .then(data => {
          const dataOutput = {
            result: {
              list: data.rows,
              total: data.total,
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
