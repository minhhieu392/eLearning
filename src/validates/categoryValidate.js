import ValidateJoi, { noArguments } from '../utils/validateJoi';
import viMessage from '../locales/vi';

import regexPattern from '../utils/regexPattern';
import { parseSort } from '../utils/helper';

const DEFAULT_SCHEMA = {
  name: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.category.name']
  }),
  sitesId: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage.sitesId
  }),
  url: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.category.url'],
    allow: ['', null]
  }),
  image: ValidateJoi.createSchemaProp({
    array: noArguments,
    label: viMessage['api.category.images'],
    allow: ['', null]
  }),
  parentId: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage['api.category.parentId']
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
  isHome: ValidateJoi.createSchemaProp({
    boolean: noArguments,
    label: viMessage['api.category.isHome']
  }),
  descriptions: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage.descriptions,
    allow: ['', null]
  }),
  orderBy: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage.orderBy
  }),
  orderHome: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage.orderHome
  }),
  urlSlugs: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage.UrlSlugs
    // allow: ['', null],
  }),

  typesId: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage.typesId,
    allow: ['', null]
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
      name,
      url,
      languagesId,
      image,
      seoKeywords,
      seoDescriptions,
      sitesId,
      templateLayoutsId,
      parentId,
      status,
      isHome,
      descriptions,
      orderBy,

      urlSlugs,
      typesId,
      orderHome
    } = req.body;
    const district = {
      name,
      url,
      languagesId,
      image,
      seoKeywords,
      seoDescriptions,
      sitesId,
      templateLayoutsId,
      parentId,
      status,
      isHome,
      usersCreatorId,
      descriptions,
      orderBy,

      urlSlugs,
      typesId,
      orderHome
    };

    const SCHEMA = Object.assign(
      ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
        name: {
          min: 1,
          max: 100,
          required: noArguments
        },
        url: {
          max: 500
        },
        // image: {
        //   max: 300,
        // },
        sitesId: {
          required: noArguments
        },
        // templateLayoutsId: {
        //   required: noArguments
        // },
        status: {
          required: noArguments
        },
        languagesId: {
          required: noArguments
        }
      }),
      {}
    );

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
    const usersCreatorId = req.auth.userId;
    const {
      name,
      url,
      image,
      languagesId,
      seoKeywords,
      seoDescriptions,
      sitesId,
      templateLayoutsId,
      parentId,
      status,
      isHome,
      descriptions,
      orderBy,

      urlSlugs,
      typesId,
      orderHome
    } = req.body;
    const district = {
      name,
      url,
      image,
      languagesId,
      seoKeywords,
      seoDescriptions,
      sitesId,
      templateLayoutsId,
      parentId,
      status,
      isHome,
      descriptions,
      orderBy,

      usersCreatorId,
      urlSlugs,
      typesId,
      orderHome
    };

    const SCHEMA = Object.assign(
      ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
        name: {
          max: 100
        },
        url: {
          max: 500
        }
        // image: {
        //   max: 300,
        // },
      }),
      {}
    );

    ValidateJoi.validate(district, SCHEMA)
      .then(data => {
        console.log('data  ', data);
        res.locals.body = data;
        next();
      })
      .catch(error => next({ ...error, message: 'Định dạng gửi đi không đúng' }));
  },
  authenFilter: (req, res, next) => {
    // console.log("validate authenFilter")
    const { filter, sort, range, attributes } = req.query;

    res.locals.sort = parseSort(sort);
    res.locals.range = range ? JSON.parse(range) : [0, 49];
    res.locals.attributes = attributes;

    if (filter) {
      const {
        id,
        name,
        languagesId,
        seoKeywords,
        seoDescriptions,
        parentId,
        sitesId,
        templateLayoutsId,
        status,
        isHome,
        FromDate,
        ToDate,
        orderBy,
        placesId,
        typesId,
        orderHome
      } = JSON.parse(filter);
      const district = {
        id,
        name,
        seoKeywords,
        languagesId,
        seoDescriptions,
        parentId,
        sitesId,
        templateLayoutsId,
        status,
        isHome,
        FromDate,
        ToDate,
        orderBy,
        placesId,
        typesId,
        orderHome
      };

      // console.log(district)
      const SCHEMA = {
        id: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.category.id'],
          regex: regexPattern.listIds
        }),
        ...DEFAULT_SCHEMA,
        parentId: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.category.parentId'],
          regex: regexPattern.listIds
        }),
        sitesId: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage.sitesId,
          regex: regexPattern.listIds
        }),
        languagesId: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.languages.id'],
          regex: regexPattern.listIds
        }),
        templateLayoutsId: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage.templateLayoutsId,
          regex: regexPattern.listIds
        }),
        FromDate: ValidateJoi.createSchemaProp({
          date: noArguments,
          label: viMessage.FromDate
        }),
        ToDate: ValidateJoi.createSchemaProp({
          date: noArguments,
          label: viMessage.ToDate
        }),
        orderBy: ValidateJoi.createSchemaProp({
          number: noArguments,
          label: viMessage.orderBy
        }),
        orderHome: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage.orderHome
        }),
        typesId: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage.typesId,
          regex: regexPattern.listIds
        })
      };

      // console.log('input: ', input);
      ValidateJoi.validate(district, SCHEMA)
        .then(data => {
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
          next({ ...error, message: 'Định dạng gửi đi không đúng' });
        });
    } else {
      res.locals.filter = {};
      next();
    }
  },
  authenUpdateOrder: (req, res, next) => {
    // console.log("validate authenUpdateOrder")

    const { orders } = req.body;
    const categories = { orders };

    const SCHEMA = {
      orders: ValidateJoi.createSchemaProp({
        array: noArguments,
        label: viMessage['api.menus.orders']
      })
    };

    ValidateJoi.validate(categories, SCHEMA)
      .then(data => {
        res.locals.body = data;
        next();
      })
      .catch(error => next({ ...error, message: 'Định dạng gửi đi không đúng' }));
  },
  authenUpdateOrderHome: (req, res, next) => {
    // console.log("validate authenUpdateOrder")

    const { orderHomes } = req.body;
    const categories = { orderHomes };

    const SCHEMA = {
      orderHomes: ValidateJoi.createSchemaProp({
        array: noArguments,
        label: viMessage['api.menus.orderHome']
      })
    };

    ValidateJoi.validate(categories, SCHEMA)
      .then(data => {
        res.locals.body = data;
        next();
      })
      .catch(error => next({ ...error, message: 'Định dạng gửi đi không đúng' }));
  },
  authenBulkUpdate: async (req, res, next) => {
    try {
      console.log('validate authenBulkUpdate', req.query, req.body);
      const { filter } = req.query;
      const { status } = req.body;
      const category = { status };
      const { id } = JSON.parse(filter);
      const whereFilter = { id };

      const SCHEMA = {
        id: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.category.id'],
          regex: regexPattern.listIds
        }),
        ...DEFAULT_SCHEMA
      };

      if (filter) {
        const { id } = JSON.parse(filter);

        await ValidateJoi.validate(whereFilter, SCHEMA)
          .then(data => {
            if (id) {
              ValidateJoi.transStringToArray(data, 'id');
            }
            res.locals.filter = data;

            console.log('locals.filter', res.locals.filter);
          })

          .catch(error => {
            console.log(error);

            return next({ error, message: 'Định dạng gửi đi không đúng' });
          });
      }

      await ValidateJoi.validate(category, SCHEMA)
        .then(data => {
          res.locals.body = data;

          console.log('locals.body', res.locals.body);
        })
        .catch(error => {
          console.log(error);

          return next({ error, message: 'Định dạng gửi đi không đúng' });
        });

      return next();
    } catch (error) {
      console.log(error);

      return next({ error });
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
  }
};
