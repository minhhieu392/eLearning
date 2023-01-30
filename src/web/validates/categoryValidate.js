import ValidateJoi, { noArguments } from '../../utils/validateJoi';
import viMessage from '../../locales/vi';
import { sequelize } from '../../db/db';
import { parseSortVer2 } from '../../utils/helper';


const DEFAULT_SCHEMA = {
  name: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.category.name'],
  }),
  sitesId: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage.sitesId,
  }),
  url: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.category.url'],
    allow: ['', null],
  }),
  image: ValidateJoi.createSchemaProp({
    array: noArguments,
    label: viMessage['api.category.images'],
    allow: ['', null],
  }),
  parentId: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage['api.category.parentId'],
  }),
  templateLayoutsId: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage.templateLayoutsId,
  }),
  seoKeywords: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage.seoKeywords,
    allow: ['', null],
  }),
  seoDescriptions: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage.seoDescriptions,
    allow: ['', null],
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
  isHome: ValidateJoi.createSchemaProp({
    boolean: noArguments,
    label: viMessage['api.category.isHome'],
  }),
};

export default {
  // authenCreate : (req, res, next) => {
  //   console.log("validate authenCreate")
  //   const usersCreatorId = req.auth.userId;

  //   const { name, url, images, seoKeywords, seoDescriptions, sitesId, templateLayoutsId, parentId, status } = req.body;
  //   const district = { name, url, images, seoKeywords, seoDescriptions, sitesId, templateLayoutsId, parentId, status, usersCreatorId };

  //   const SCHEMA = ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
  //     name: {
  //       max: 100,
  //       required: noArguments
  //     },
  //     url: {
  //       max: 300,
  //     },
  //     images: {
  //       max: 300,
  //     },
  //     sitesId: {
  //       required: noArguments
  //     },
  //     parentId: {
  //       required: noArguments
  //     },
  //     templateLayoutsId: {
  //       required: noArguments
  //     },
  //     status: {
  //       required: noArguments
  //     },
  //   });

  //   // console.log('input: ', input);
  //   ValidateJoi.validate(district, SCHEMA)
  //     .then((data) => {
  //       res.locals.body = data;
  //       next()
  //     })
  //     .catch(error => next({ ...error, message: "Định dạng gửi đi không đúng" }
  //     ));
  // },
  // authenUpdate: (req, res, next) => {
  //   console.log("validate authenUpdate")

  //   const { name, url, images, seoKeywords, seoDescriptions, sitesId, templateLayoutsId, parentId, status } = req.body;
  //   const district = { name, url, images, seoKeywords, seoDescriptions, sitesId, templateLayoutsId, parentId, status };

  //   const SCHEMA = ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
  //     name: {
  //       max: 100,
  //     },
  //     url: {
  //       max: 300,
  //     },
  //     images: {
  //       max: 300,
  //     },
  //   });

  //   ValidateJoi.validate(district, SCHEMA)
  //     .then((data) => {
  //       res.locals.body = data;
  //       next()
  //     })
  //     .catch(error => next({ ...error, message: "Định dạng gửi đi không đúng" }
  //     ));
  // },
  authenFilter: (req, res, next) => {
    console.log("validate authenFilter")
    const { filter, sort, range, attributes } = req.query;

    res.locals.sort = parseSortVer2(sort,'categories');
    res.locals.range = range ? JSON.parse(range) : [0, 49];
    res.locals.attributes = attributes;
    if (filter) {
      const { id, name, seoKeywords, seoDescriptions, languagesId, parentId, sitesId, templateLayoutsId, status, isHome, FromDate, ToDate, urlSlugs } = JSON.parse(filter);
      const district = { id, name, seoKeywords, seoDescriptions, languagesId, parentId, sitesId, templateLayoutsId, status, isHome, FromDate, ToDate, urlSlugs };

      // console.log(district)
      const SCHEMA = {
        id: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.category.id'],
          regex: /(^\d+(,\d+)*$)|(^\d*$)/
        }),
        ...DEFAULT_SCHEMA,
        parentId: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.category.parentId'],
          regex: /(^\d+(,\d+)*$)|(^\d*$)/
        }),
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
        templateLayoutsId: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage.templateLayoutsId,
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
        urlSlugs: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage.UrlSlugs,
        }),
      };

      // console.log('input: ', input);
      ValidateJoi.validate(district, SCHEMA)
        .then((data) => {
          if (id) {
            ValidateJoi.transStringToArray(data, 'id');
          }
          if (parentId) {
            ValidateJoi.transStringToArray(data, 'parentId');
          }
          if (sitesId) {
            ValidateJoi.transStringToArray(data, 'sitesId');
          }
          if (templateLayoutsId) {
            ValidateJoi.transStringToArray(data, 'templateLayoutsId');
          }
          if (languagesId) {
            ValidateJoi.transStringToArray(data, 'languagesId');
          }
          if (urlSlugs) {
            ValidateJoi.CategoryUrlSlugsToArray(data, 'urlSlugs');
            //ValidateJoi.transStringToArray(data, 'urlSlugs');
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
    console.log("validate authenFilter")
    const { filter, attributes, sort } = req.query;

    res.locals.sort = parseSortVer2(sort,'categories');
    res.locals.attributes = attributes ? JSON.parse(attributes) : null;


    if (filter) {
      const { id, name, seoKeywords, seoDescriptions, parentId, sitesId, templateLayoutsId, status, isHome, FromDate, ToDate, urlSlugs } = JSON.parse(filter);
      const district = { id, name, seoKeywords, seoDescriptions, parentId, sitesId, templateLayoutsId, status, isHome, FromDate, ToDate, urlSlugs };

      // console.log(district)
      const SCHEMA = {
        id: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.category.id'],
          regex: /(^\d+(,\d+)*$)|(^\d*$)/
        }),
        ...DEFAULT_SCHEMA,
        parentId: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.category.parentId'],
          regex: /(^\d+(,\d+)*$)|(^\d*$)/
        }),
        sitesId: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage.sitesId,
          regex: /(^\d+(,\d+)*$)|(^\d*$)/
        }),
        templateLayoutsId: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage.templateLayoutsId,
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
        urlSlugs: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage.UrlSlugs,
        }),
      };

      // console.log('input: ', input);
      ValidateJoi.validate(district, SCHEMA)
        .then((data) => {
          if (id) {
            ValidateJoi.transStringToArray(data, 'id');
          }
          if (parentId) {
            ValidateJoi.transStringToArray(data, 'parentId');
          }
          if (sitesId) {
            ValidateJoi.transStringToArray(data, 'sitesId');
          }
          if (templateLayoutsId) {
            ValidateJoi.transStringToArray(data, 'templateLayoutsId');
          }

          if (urlSlugs) {
            ValidateJoi.CategoryUrlSlugsToArray(data, 'urlSlugs');
            //ValidateJoi.transStringToArray(data, 'urlSlugs');
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
  authenTreeFilter: (req, res, next) => {
    console.log("validate authenTreeFilter")
    const { filter, sort, range } = req.query;

    res.locals.sort = parseSortVer2(sort,'categories');
    res.locals.range = range ? JSON.parse(range) : [0, 49];

    if (filter) {
      const { id, name, seoKeywords, seoDescriptions, parentId, languagesId, sitesId, templateLayoutsId, status, isHome, FromDate, ToDate, urlSlugs } = JSON.parse(filter);
      const district = { id, name, seoKeywords, seoDescriptions, parentId, languagesId, sitesId, templateLayoutsId, status, isHome, FromDate, ToDate, urlSlugs };

      // console.log(district)
      const SCHEMA = {
        id: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.category.id'],
          regex: /(^\d+(,\d+)*$)|(^\d*$)/
        }),
        ...DEFAULT_SCHEMA,
        parentId: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.category.parentId'],
          regex: /(^\d+(,\d+)*$)|(^\d*$)/
        }),
        sitesId: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage.sitesId,
          regex: /(^\d+(,\d+)*$)|(^\d*$)/
        }),
        templateLayoutsId: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage.templateLayoutsId,
          regex: /(^\d+(,\d+)*$)|(^\d*$)/
        }),
        languagesId: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.languages.id'],
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
        urlSlugs: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage.UrlSlugs,
        }),
      };

      console.log('inputasdadadsa');
      ValidateJoi.validate(district, SCHEMA)
        .then((data) => {
          if (id) {
            ValidateJoi.transStringToArray(data, 'id');
          }
          if (parentId) {
            ValidateJoi.transStringToArray(data, 'parentId');
          }
          if (sitesId) {
            ValidateJoi.transStringToArray(data, 'sitesId');
          }
          if (templateLayoutsId) {
            ValidateJoi.transStringToArray(data, 'templateLayoutsId');
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
