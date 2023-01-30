import ValidateJoi, { noArguments } from '../../utils/validateJoi';
import viMessage from '../../locales/vi';
import { sequelize } from '../../db/db';
import { parseSortVer2 } from '../../utils/helper';

const DEFAULT_SCHEMA = {
  title: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.article.title'],
    max: 100,
  }),
  shortDescription: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.article.shortDescription'],
    allow: ['', null],
    max: 500,
  }),
  description: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.article.description'],
    allow: ['', null],
  }),
  author: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.article.author'],
    allow: ['', null],
    max: 100,
  }),
  tag: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.article.tag'],
    allow: ['', null],
    max: 300,
  }),
  image: ValidateJoi.createSchemaProp({
    array: noArguments,
    label: viMessage['api.article.image'],
    allow: ['', null],
  }),
  source: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.article.source'],
    allow: ['', null],
    max: 100,
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
  categoriesId: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage.categoriesId,
  }),
  usersCreatorId: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage.usersCreatorId,
  }),
  sitesId: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage.sitesId,
  }),
  createDate: ValidateJoi.createSchemaProp({
    date: noArguments,
    label: viMessage.createDate,
  }),
  status: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage.status,
  }),
  urlSlugs: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage.UrlSlugs,
  }),
};

export default {
  /* authenCreate: (req, res, next) => {
    console.log("validate authenCreate")
    const usersCreatorId = req.auth.userId;

    const { title, shortDescription, description, image, author, source, tag, seoKeywords, seoDescriptions, categoriesId, status } = req.body;
    const district = { title, shortDescription, description, image, author, source, tag, seoKeywords, seoDescriptions, categoriesId, status, usersCreatorId };

    const SCHEMA = ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
      title: {
        required: noArguments
      },
      categoriesId: {
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

    const { title, shortDescription, description, image, author, source, tag, seoKeywords, seoDescriptions, categoriesId, status } = req.body;
    const district = { title, shortDescription, description, image, author, source, tag, seoKeywords, seoDescriptions, categoriesId, status };

    const SCHEMA = DEFAULT_SCHEMA;

    ValidateJoi.validate(district, SCHEMA)
      .then((data) => {
        res.locals.body = data;
        next()
      })
      .catch(error => next({ ...error, message: "Định dạng gửi đi không đúng" }
      ));
  }, */
  authenFilter: (req, res, next) => {

    const { filter, sort, range, attributes } = req.query;

    //console.log("validate authenFilter",filter)
    res.locals.sort = parseSortVer2(sort,'article');
    res.locals.range = range ? JSON.parse(range) : [0, 49];
    res.locals.attributes = attributes;
    if (filter) {
      const { id, title, categoriesId, shortDescription, languagesId, description, author, source, tag, status, FromDate, ToDate, urlSlugs, sitesId } = JSON.parse(filter);
      const district = { id, title, categoriesId, shortDescription, languagesId, description, author, source, tag, status, FromDate, ToDate, urlSlugs, sitesId };

      console.log(district)
      const SCHEMA = {
        id: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.article.id'],
          regex: /(^\d+(,\d+)*$)|(^\d*$)/
        }),
        ...DEFAULT_SCHEMA,
        categoriesId: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage.categoriesId,
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
      };

      // console.log('input: ', input);
      ValidateJoi.validate(district, SCHEMA)
        .then((data) => {
          if (id) {
            ValidateJoi.transStringToArray(data, 'id');
          }
          if (categoriesId) {
            ValidateJoi.transStringToArray(data, 'categoriesId');
            // ValidateJoi.ArticleGetByCategoriesParentToArray(data,'categoriesId');
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
      //console.log("validate authenFilter ", JSON.parse(sort))
    } else {
      res.locals.filter = {};
      next()
    }
  }
}
