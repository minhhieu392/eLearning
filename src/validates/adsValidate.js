import ValidateJoi, { noArguments } from '../utils/validateJoi';
import viMessage from '../locales/vi';
import { sequelize } from '../db/db';
import regexPattern from '../utils/regexPattern';
import {  parseSortVer2 } from '../utils/helper';
const DEFAULT_SCHEMA = {
  title: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.ads.title'],
  }),
  url: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.ads.url'],
    allow: ['', null],
  }),
  contents: ValidateJoi.createSchemaProp({
    array: noArguments,
    label: viMessage['api.ads.contents'],
    allow: ['', null],
  }),
  sitesId: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage.sitesId,
  }),
  adsTypeId: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage.adsTypeId,
  }),
  adsPositionsId: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage.adsPositionsId,
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
  descriptions: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.ads.descriptions'],
    allow: ['', null],
  }),
  languagesId: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage['api.languages.id']
  }),
  orderBy: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage['api.ads.orderBy']
  }),
};

export default {
  authenCreate: (req, res, next) => {
    // console.log("validate authenCreate")
    const usersCreatorId = req.auth.userId;

    const { title, url, contents, languagesId, sitesId, adsTypeId, adsPositionsId, status, descriptions,orderBy } = req.body;
    const district = { title, url, contents, languagesId, sitesId, adsTypeId, adsPositionsId, status, usersCreatorId, descriptions ,orderBy};

    const SCHEMA = ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
      title: {
        max: 200,
        required: noArguments
      },
      url: {
        max: 500,
      },
      // contents: {
      //   max: 500,
      // },
      sitesId: {
        required: noArguments
      },
      adsTypeId: {
        required: noArguments
      },
      adsPositionsId: {
        required: noArguments
      },
      status: {
        required: noArguments
      },
      languagesId: {
        required: noArguments
      }
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

    const { title, url, contents, languagesId, sitesId, adsTypeId, adsPositionsId, status, descriptions,orderBy } = req.body;
    const district = { title, url, contents, languagesId, sitesId, adsTypeId, adsPositionsId, status, descriptions,orderBy };

    const SCHEMA = ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
      title: {
        max: 200,
      },
      url: {
        max: 500,
      },
      // contents: {
      //   max: 500,
      // },
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
    const { filter, sort, range, attributes } = req.query;

    res.locals.sort = parseSortVer2(sort,'ads');
    res.locals.range = range ? JSON.parse(range) : [0, 49];
    res.locals.attributes = attributes;
    if (filter) {
      const { id, title, url, sitesId, adsTypeId, languagesId, adsPositionsId, status, FromDate, ToDate, descriptions, placesId } = JSON.parse(filter);
      const district = { id, title, url, sitesId, languagesId, adsTypeId, adsPositionsId, status, FromDate, ToDate, descriptions, placesId };

      // console.log(district)
      const SCHEMA = {
        id: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.ads.id'],
          regex: regexPattern.listIds
        }),
        ...DEFAULT_SCHEMA,
        sitesId: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage.sitesId,
          regex: regexPattern.listIds
        }),
        adsTypeId: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage.adsTypeId,
          regex: regexPattern.listIds
        }),
        languagesId: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.languages.id'],
          regex: regexPattern.listIds
        }),
        placesId: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage.placesId,
          regex: regexPattern.listIds
        }),
        adsPositionsId: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage.adsPositionsId,
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
          if (languagesId) {
            ValidateJoi.transStringToArray(data, 'languagesId');
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
  authenUpdateOrder: (req, res, next) => {
    // console.log("validate authenUpdateOrder")

    const { orders } = req.body;
    const menu = { orders };

    const SCHEMA = {
      orders: ValidateJoi.createSchemaProp({
        array: noArguments,
        label: viMessage['api.ads.orderBy'],
      })
    };

    ValidateJoi.validate(menu, SCHEMA)
      .then((data) => {
        res.locals.body = data;
        next()
      })
      .catch(error => next({ ...error, message: "Định dạng gửi đi không đúng" }
      ));
  },
}
