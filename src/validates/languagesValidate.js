import ValidateJoi, { noArguments } from '../utils/validateJoi';
import viMessage from '../locales/vi';
import { sequelize } from '../db/db';
import regexPattern from '../utils/regexPattern';
import {  parseSortVer2 } from '../utils/helper';
const DEFAULT_SCHEMA = {
  languageName: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.languages.languageName'],
  }),
  languageCode: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.languages.languageCode']
  }),
  icon: ValidateJoi.createSchemaProp({
    object: noArguments,
    label: viMessage['api.languages.icon']
  })
};

export default {
  authenCreate: (req, res, next) => {
    // console.log("validate authenCreate")
    const usersCreatorId = req.auth.userId;

    const { languageName, languageCode, icon } = req.body;
    const languages = { languageName, languageCode, icon };

    const SCHEMA = ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
      languageName: {
        max:100,
        required: noArguments
      },
      languageCode: {
        max: 10,
        required: noArguments
      }
    });

    // console.log('input: ', input);
    ValidateJoi.validate(languages, SCHEMA)
      .then((data) => {
        res.locals.body = data;
        next()
      })
      .catch(error => next({ ...error, message: "Định dạng gửi đi không đúng" }
      ));
  },
  authenUpdate: (req, res, next) => {
    // console.log("validate authenUpdate")

    const { languageName, languageCode, icon } = req.body;
    const languages = { languageName, languageCode, icon };

    const SCHEMA = ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
      languageName: {
        max:100,
        required: noArguments
      },
      languageCode: {
        max: 10,
        required: noArguments
      }
    });

    ValidateJoi.validate(languages, SCHEMA)
      .then((data) => {
        res.locals.body = data;
        next()
      })
      .catch(error => next({ ...error, message: "Định dạng gửi đi không đúng" }
      ));
  },
  authenFilter: (req, res, next) => {
    // console.log("validate authenFilter")
    const { filter, sort, range, attributes } = req.query;

    res.locals.sort = parseSortVer2(sort,'languages');
    res.locals.range = range ? JSON.parse(range) : [0, 49];
    res.locals.attributes = attributes;
    if (filter) {
      const { id, languageName, languageCode } = JSON.parse(filter);
      const languages = { id, languageName, languageCode };

      // console.log(district)
      const SCHEMA = {
        id: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.languages.id'],
          regex: regexPattern.listIds
        }),
        ...DEFAULT_SCHEMA,
        languageName: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.languages.languageName'],
          regex: regexPattern.name
        }),
        languageCode: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.languages.languageCode'],
          regex: regexPattern.name
        })
      };

      // console.log('input: ', input);
      ValidateJoi.validate(languages, SCHEMA)
        .then((data) => {
          if (id) {
            ValidateJoi.transStringToArray(data, 'id');
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
  authenGetAll: (req, res, next) => {
    // console.log("validate authenFilter")
    const { filter, attributes, sort } = req.query;

    res.locals.sort = parseSortVer2(sort,'languages');
    res.locals.attributes = attributes ? JSON.parse(attributes) : null;

    if (filter) {
      const { id, title, url, sitesId, languagesTypeId, languagesPositionsId, status, FromDate, ToDate, descriptions, placesId } = JSON.parse(filter);
      const district = { id, title, url, sitesId, languagesTypeId, languagesPositionsId, status, FromDate, ToDate, descriptions, placesId };

      // console.log(district)
      const SCHEMA = {
        id: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.languages.id'],
          regex: regexPattern.listIds
        }),
        ...DEFAULT_SCHEMA,
        sitesId: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage.sitesId,
          regex: regexPattern.listIds
        }),
        languagesTypeId: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage.languagesTypeId,
          regex: regexPattern.listIds
        }),
        placesId: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage.placesId,
          regex: regexPattern.listIds
        }),
        languagesPositionsId: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage.languagesPositionsId,
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
          if (placesId) {
            ValidateJoi.transStringToArray(data, 'placesId');
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
  }
}
