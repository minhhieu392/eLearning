import directContactService from '../services/directContactServiceFacebook';
import directContactServiceZalo from '../services/directContactServiceZalo';
import directContactServiceTelegram from '../services/directContactServiceTelegram';
import loggerHelpers from '../../helpers/loggerHelpers';
import { recordStartTime } from '../../utils/loggerFormat';
import * as ApiErrors from '../../errors';
export default {
  postEntry: (req, res, next) => {
    res.json({
      message: 'socketPoint'
    });
    recordStartTime.call(req);
    try {

      const entity = req.body;
      const param = { entity};

      directContactService
        .postEntry(param)
        .then(data => {
          if (data && data.result) {
            // const dataOutput = {
            //   result: data.result,
            //   success: true,
            //   errors: [],
            //   messages: []
            // };
            // recordStartTime.call(res);
            loggerHelpers
              .logCreate(req, res, {
                dataQuery: req.query,
                dataOutput: data.result
              })
              .catch(error => console.log(error));
            console.log(data.result);
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
  setAsRead: (req, res, next) => {
    try {
      const { accessToken, conversationId, pageSize } = req.query;

      const entity = {
        accessToken,
        conversationId,
        pageSize
      };

      const param = { entity };

      console.log('param: ', param);

      directContactService
        .setAsRead(param)
        // write log
        .then(data => {
          res.send(data);
          loggerHelpers.logInfor(req, res, {
            dataParam: req.params,
            dataQuery: req.query
          });
        });
    } catch (error) {
      error.dataQuery = req.query;
      next(error);
    }
  },
  postEntryZalo: (req, res,next) => {
    res.json({
      message: 'socketPoint'
    });
    recordStartTime.call(req);
    try {
      console.log('getOne Request-Body:', req.query);

      const entity = req.body;
      const param = { entity, auth: req.auth };

      directContactServiceZalo
        .postEntry(param)
        .then(data => {
          if (data && data.result) {
            // const dataOutput = {
            //   result: data.result,
            //   success: true,
            //   errors: [],
            //   messages: []
            // };
            // recordStartTime.call(res);
            loggerHelpers
              .logCreate(req, res, {
                dataQuery: req.query,
                dataOutput: data.result
              })
              .catch(error => console.log(error));
            console.log(data.result);
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
  postEntryTelegram: (req, res, next) => {

    recordStartTime.call(req);
    try {
      console.log('Request-Body:', req.query);

      const entity = res.entity;
      const param = { entity, auth: req.auth };

      directContactServiceTelegram
        .postEntry(param)
        .then(data => {
          if (data && data.result) {
            res.json({
              message: 'socketPoint'
            });
            // const dataOutput = {
            //   result: data.result,
            //   success: true,
            //   errors: [],
            //   messages: []
            // };
            // recordStartTime.call(res);
            loggerHelpers
              .logCreate(req, res, {
                dataQuery: req.query,
                dataOutput: data.result
              })
              .catch(error => console.log(error));
            console.log(data.result);
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
  }
};
