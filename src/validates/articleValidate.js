import ValidateJoi, { noArguments } from '../utils/validateJoi';
import viMessage from '../locales/vi';
import { sequelize } from '../db/db';
import regexPattern from '../utils/regexPattern';
import { parseSortVer2, parseSortVer3 } from '../utils/helper';
const DEFAULT_SCHEMA = {
  title: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.article.title'],
    max: 200
  }),
  shortDescription: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.article.shortDescription'],
    allow: ['', null],
    max: 500
  }),
  description: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.article.description'],
    allow: ['', null]
  }),
  author: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.article.author'],
    allow: ['', null],
    max: 100
  }),
  tag: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.article.tag'],
    allow: ['', null],
    max: 300
  }),
  image: ValidateJoi.createSchemaProp({
    array: noArguments,
    label: viMessage['api.article.image'],
    allow: ['', null]
  }),
  source: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.article.source'],
    allow: ['', null],
    max: 100
  }),
  seoKeywords: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage.seoKeywords,
    allow: ['', null]
  }),
  seoDescriptions: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage.seoDescriptions,
    allow: ['', null]
  }),
  categoriesId: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage.categoriesId
  }),
  usersCreatorId: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage.usersCreatorId
  }),
  createDate: ValidateJoi.createSchemaProp({
    date: noArguments,
    label: viMessage.createDate
  }),
  status: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage.status
  }),
  urlSlugs: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage.UrlSlugs
    // allow: ['', null],
  }),
  languagesId: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage['api.languages.id']
  })
};

export default {
  authenCreate: (req, res, next) => {
    // console.log("validate authenCreate")
    const usersCreatorId = req.auth.userId;

    const {
      provincesId,
      title,
      shortDescription,
      description,
      languagesId,
      image,
      author,
      source,
      tag,
      seoKeywords,
      seoDescriptions,
      categoriesId,
      status,
      urlSlugs
    } = req.body;
    const district = {
      provincesId,
      title,
      shortDescription,
      description,
      languagesId,
      image,
      author,
      source,
      tag,
      seoKeywords,
      seoDescriptions,
      categoriesId,
      status,
      usersCreatorId,
      urlSlugs
    };

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
      languagesId: {
        //  required: noArguments
      }
    });

    // console.log('input: ', input);
    ValidateJoi.validate(district, SCHEMA)
      .then(data => {
        res.locals.body = data;
        next();
      })
      .catch(error => next({ ...error, message: 'Định dạng gửi đi không đúng' }));
  },
  authenUpdate: (req, res, next) => {
    // console.log("validate authenUpdate")

    const {
      provincesId,
      title,
      shortDescription,
      description,
      languagesId,
      image,
      author,
      source,
      tag,
      seoKeywords,
      seoDescriptions,
      categoriesId,
      status,
      urlSlugs
    } = req.body;
    const district = {
      provincesId,
      title,
      shortDescription,
      description,
      languagesId,
      image,
      author,
      source,
      tag,
      seoKeywords,
      seoDescriptions,
      categoriesId,
      status,
      urlSlugs
    };

    const SCHEMA = ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
      title: {
        required: noArguments
      },
      status: {
        required: noArguments
      }
    });

    ValidateJoi.validate(district, SCHEMA)
      .then(data => {
        res.locals.body = data;
        next();
      })
      .catch(error => next({ ...error, message: 'Định dạng gửi đi không đúng' }));
  },
  authenFilter: (req, res, next) => {
    // console.log("validate authenFilter")
    const { filter, sort, range, attributes } = req.query;

    res.locals.sort = parseSortVer2(sort, 'article');
    res.locals.range = range ? JSON.parse(range) : [0, 49];
    res.locals.attributes = attributes;
    if (filter) {
      const {
        id,
        title,
        dataForOne,
        categoriesId,
        shortDescription,
        languagesId,
        description,
        author,
        source,
        tag,
        status,
        sitesId,
        FromDate,
        ToDate,
        provincesId
      } = JSON.parse(filter);
      const district = {
        id,
        title,
        dataForOne,
        categoriesId,
        categoriesForOne: categoriesId,
        shortDescription,
        languagesId,
        description,
        author,
        source,
        tag,
        status,
        sitesId,
        FromDate,
        ToDate,
        provincesId
      };

      // console.log(district)
      const SCHEMA = {
        id: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.article.id'],
          regex: regexPattern.listIds
        }),
        ...DEFAULT_SCHEMA,
        dataForOne: ValidateJoi.createSchemaProp({
          boolean: noArguments,
          label: 'nếu true thì chỉ lấy artice cho thằng cha, nếu false hoặc không có thì lấy cho cả cấp con'
        }),
        sitesId: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage.sitesId,
          regex: regexPattern.listIds
        }),
        categoriesId: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage.categoriesId,
          regex: regexPattern.listIds
        }),
        categoriesForOne: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage.categoriesId,
          regex: regexPattern.listIds
        }),
        languagesId: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.languages.id'],
          regex: regexPattern.listIds
        }),
        FromDate: ValidateJoi.createSchemaProp({
          date: noArguments,
          label: viMessage.FromDate
        }),
        ToDate: ValidateJoi.createSchemaProp({
          date: noArguments,
          label: viMessage.ToDate
        })
      };

      // console.log('input: ', input);
      ValidateJoi.validate(district, SCHEMA)
        .then(data => {
          if (id) {
            ValidateJoi.transStringToArray(data, 'id');
          }
          if (categoriesId) {
            //ValidateJoi.transStringToArray(data, 'categoriesId');
            ValidateJoi.ArticleGetByCategoriesParentToArray(data, 'categoriesId');
          }
          if (sitesId) {
            ValidateJoi.transStringToArray(data, 'sitesId');
          }
          if (languagesId) {
            ValidateJoi.transStringToArray(data, 'languagesId');
          }
          if (provincesId) {
            ValidateJoi.transStringToArray(data, 'provincesId');
          }

          res.locals.filter = data;
          // console.log('locals.filter', res.locals.filter);
          next();
        })
        .catch(error => {
          next({ ...error, message: 'Định dạng gửi đi không đúng' });
        });
    } else {
      res.locals.filter = {};
      next();
    }
  },
  authenUpdate_status: (req, res, next) => {
    // console.log("validate authenCreate")
    const usersCreatorsId = req.auth.userId;
    console.log('validate authenCreate', usersCreatorsId);
    const { status, dateUpdated } = req.body;
    const userGroup = { status, dateUpdated, usersCreatorsId };

    const SCHEMA = {
      status: ValidateJoi.createSchemaProp({
        number: noArguments,
        required: noArguments,
        label: viMessage.status
      }),
      dateUpdated: ValidateJoi.createSchemaProp({
        date: noArguments,
        required: noArguments,
        label: viMessage.dateUpdated
      }),
      usersCreatorsId: ValidateJoi.createSchemaProp({
        number: noArguments,
        required: noArguments,
        label: viMessage.usersCreatorId
      })
    };

    ValidateJoi.validate(userGroup, SCHEMA)
      .then(data => {
        res.locals.body = data;
        next();
      })
      .catch(error => next({ ...error, message: 'Định dạng gửi đi không đúng' }));
  },
  authenFilterArticle_get: (req, res, next) => {
    console.log('validate authenFilter');
    const { filter, sort, range, attributes } = req.query;

    res.locals.sort = parseSortVer3(sort);
    res.locals.range = range ? JSON.parse(range) : [0, 49];
    res.locals.attributes = attributes;
    if (filter) {
      const {
        title,
        locations,
        status,
        categories,
        productsCatalogCategoriesId,
        isInternational,
        categoriesProductsCatalogStatus
      } = JSON.parse(filter);
      const user = {
        title,
        locations,
        status,
        categories,
        productsCatalogCategoriesId,
        isInternational,
        categoriesProductsCatalogStatus
      };

      console.log(user);
      const SCHEMA = {
        title: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.article.title']
        }),
        locations: ValidateJoi.createSchemaProp({
          object: noArguments,
          label: viMessage.locations
        }),
        categories: ValidateJoi.createSchemaProp({
          array: noArguments,
          label: viMessage['api.category.id']
        }),
        status: ValidateJoi.createSchemaProp({
          number: noArguments,
          label: viMessage.status
        }),

        productsCatalogCategoriesId: ValidateJoi.createSchemaProp({
          number: noArguments,
          label: viMessage['api.productsCatalog.id']
        }),
        isInternational: ValidateJoi.createSchemaProp({
          number: noArguments,
          label: viMessage.isInternational
        }),
        categoriesProductsCatalogStatus: ValidateJoi.createSchemaProp({
          number: noArguments,
          label: viMessage['api.productsCatalog.status']
        })
      };

      // console.log('input: ', input);
      ValidateJoi.validate(user, SCHEMA)
        .then(data => {
          res.locals.filter = data;
          console.log('locals.filter', res.locals.filter);
          next();
        })
        .catch(error => {
          next({ ...error, message: 'Định dạng gửi đi không đúng' });
        });
    } else {
      res.locals.filter = {};
      next();
    }
  }
};
