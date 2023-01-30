import ValidateJoi, { noArguments } from '../../utils/validateJoi';
import viMessage from '../../locales/vi';
import { sequelize } from '../../db/db';
import { parseSortVer2 } from '../../utils/helper';
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
    string: noArguments,
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
};

export default {
  /* authenCreate : (req, res, next) => {
    console.log("validate authenCreate")
    const usersCreatorId = req.auth.userId;

    const { title, url, contents, sitesId, adsTypeId, adsPositionsId, status } = req.body;
    const district = { title, url, contents, sitesId, adsTypeId, adsPositionsId, status, usersCreatorId };

    const SCHEMA = ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
      title: {
        max: 100,
        required: noArguments
      },
      url: {
        max: 100,
      },
      contents: {
        max: 500,
      },
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
    console.log("validate authenUpdate")

    const { title, url, contents, sitesId, adsTypeId, adsPositionsId, status } = req.body;
    const district = { title, url, contents, sitesId, adsTypeId, adsPositionsId, status };

    const SCHEMA = ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
      title: {
        max: 100,
      },
      url: {
        max: 100,
      },
      contents: {
        max: 500,
      },
    });

    ValidateJoi.validate(district, SCHEMA)
      .then((data) => {
        res.locals.body = data;
        next()
      })
      .catch(error => next({ ...error, message: "Định dạng gửi đi không đúng" }
      ));
  }, */
  authenFilter: (req, res, next) => {
    // console.log("validate authenFilter")
    const { filter, sort, range, attributes } = req.query;

    res.locals.sort = parseSortVer2(sort,'ads');
    res.locals.range = range ? JSON.parse(range) : [0, 49];
    res.locals.attributes = attributes;
    if (filter) {
      const { id, title, url, sitesId, adsTypeId, languagesId, adsPositionsId, status, FromDate, ToDate } = JSON.parse(filter);
      const district = { id, title, url, sitesId, adsTypeId, languagesId, adsPositionsId, status, FromDate, ToDate };

      // console.log(district)
      const SCHEMA = {
        id: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.ads.id'],
          regex: /(^\d+(,\d+)*$)|(^\d*$)/
        }),
        ...DEFAULT_SCHEMA,
        sitesId: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage.sitesId,
          regex: /(^\d+(,\d+)*$)|(^\d*$)/
        }),
        languagesId: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.languages.id'],
          regex: /(^\d+(,\d+)*$)|(^\d*$)/
        }),
        adsTypeId: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage.adsTypeId,
          regex: /(^\d+(,\d+)*$)|(^\d*$)/
        }),
        adsPositionsId: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage.adsPositionsId,
          regex: /(^\d+(,\d+)*$)|(^\d*$)/
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
  }
}
