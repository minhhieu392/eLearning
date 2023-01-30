import ValidateJoi, { noArguments } from '../utils/validateJoi';
import viMessage from '../locales/vi';
import { sequelize } from '../db/db';
import regexPattern from '../utils/regexPattern';
import { parseSortVer2 } from '../utils/helper';

const DEFAULT_SCHEMA = {
  name: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.adsPosition.name'],
  }),
  sitesId: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage.sitesId,
  }),
  usersCreatorId: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage.usersCreatorId,
  }),
  createDate: ValidateJoi.createSchemaProp({
    date: noArguments,
    label: viMessage.createDate,
  }),
  status: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage.status,
  }),
};

export default {
  authenCreate: (req, res, next) => {
    // console.log("validate authenCreate")
    const usersCreatorId = req.auth.userId;

    const { name, sitesId, status } = req.body;
    const district = { name, sitesId, status, usersCreatorId };

    const SCHEMA = ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
      name: {
        max: 100,
        required: noArguments
      },
      sitesId: {
        required: noArguments
      },
      status: {
        required: noArguments
      },
    });

    // console.log('input: ', input);
    ValidateJoi.validate(district, SCHEMA)
      .then((data) => {
        res.locals.body = data;
        next()
      })
      .catch(error => next({ ...error, message: "Định dạng gửi đi không đúng" }
      ));
  },
  authenUpdate: (req, res, next) => {
    // console.log("validate authenUpdate")

    const { name, sitesId, status } = req.body;
    const district = { name, sitesId, status };

    const SCHEMA = ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
      name: {
        max: 100,
      },
    });

    ValidateJoi.validate(district, SCHEMA)
      .then((data) => {
        res.locals.body = data;
        next()
      })
      .catch(error => next({ ...error, message: "Định dạng gửi đi không đúng" }
      ));
  },
  authenFilter: (req, res, next) => {
    // console.log("validate authenFilter")
    const { filter, sort, range , attributes} = req.query;

    res.locals.sort = parseSortVer2(sort,'adsPositions');
    res.locals.range = range ? JSON.parse(range) : [0, 49];
    res.locals.attributes = attributes;

    if (filter) {
      const { id, name, sitesId, createDate, usersCreatorId, status, FromDate, ToDate, placesId } = JSON.parse(filter);
      const district = { id, name, sitesId, createDate, usersCreatorId, status, FromDate, ToDate, placesId };

      console.log(district)
      const SCHEMA = {
        id: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.adsPosition.id'],
          regex: regexPattern.listIds
        }),
        ...DEFAULT_SCHEMA,
        sitesId: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage.sitesId,
          regex: regexPattern.listIds
        }),
        placesId: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage.placesId,
          regex: regexPattern.listIds
        }),
        FromDate: ValidateJoi.createSchemaProp({
          date: noArguments,
          label: viMessage.FromDate,
        }),
        ToDate: ValidateJoi.createSchemaProp({
          date: noArguments,
          label: viMessage.ToDate,
        }),
      };

      // console.log('input: ', input);
      ValidateJoi.validate(district, SCHEMA)
        .then((data) => {
          if (id) {
            ValidateJoi.transStringToArray(data, 'id');
          }
          if (sitesId) {
            ValidateJoi.transStringToArray(data, 'sitesId');
          }
          res.locals.filter = data;
          // console.log('locals.filter', res.locals.filter);
          next();
        })
        .catch(error => {
          next({ ...error, message: "Định dạng gửi đi không đúng" })
        });
    } else {
      res.locals.filter = {};
      next()
    }
  },
  authenUpdate_status: (req, res, next) => {
    // console.log("validate authenCreate")
    const usersCreatorsId = req.auth.userId;
    console.log("validate authenCreate",usersCreatorsId)
    const { status, dateUpdated } = req.body;
    const userGroup = { status, dateUpdated, usersCreatorsId };

    const SCHEMA = {
      status: ValidateJoi.createSchemaProp({
        number: noArguments,
        required: noArguments,
        label: viMessage.status,
      }),
      dateUpdated: ValidateJoi.createSchemaProp({
        date: noArguments,
        required: noArguments,
        label: viMessage.dateUpdated,
      }),
      usersCreatorsId:ValidateJoi.createSchemaProp({
        number: noArguments,
        required: noArguments,
        label: viMessage.usersCreatorId,
      }),
    };

    ValidateJoi.validate(userGroup, SCHEMA)
      .then(data => {
        res.locals.body = data;
        next();
      })
      .catch(error => next({ ...error, message: 'Định dạng gửi đi không đúng' }));
  },
}
