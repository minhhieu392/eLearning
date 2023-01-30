import ValidateJoi, { noArguments } from '../utils/validateJoi';
import viMessage from '../locales/vi';
import { sequelize } from '../db/db';
import regexPattern from '../utils/regexPattern';
import { parseSort, parseSortVer2 } from '../utils/helper';
const DEFAULT_SCHEMA = {
  name: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.menus.name']
  }),
  url: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.menus.url'],
    allow: ['', null]
  }),
  component: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.menus.component'],
    allow: ['', null]
  }),
  icon: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.menus.icon'],
    allow: ['', null]
  }),
  sitesId: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage.sitesId
  }),
  parentId: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage['api.menus.parentId']
  }),
  menuPositionsId: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage.menuPositionsId
  }),
  orderBy: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage['api.menus.orderBy']
  }),
  usersCreatorId: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage.usersCreatorId
  }),
  status: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage.status
  }),
  urlSlugs: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage.UrlSlugs
  }),
  placesId: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage.placesId,
    allow: ['', null]
  }),
  languagesId: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage['api.languages.id']
  }),
  displayChild: ValidateJoi.createSchemaProp({
    boolean: noArguments,
    label: viMessage['api.menus.displayChild']
  })
};

export default {
  authenCreate: (req, res, next) => {
    // console.log("validate authenCreate")
    const usersCreatorId = req.auth.userId;

    const {
      name,
      url,
      component,
      languagesId,
      icon,
      sitesId,
      parentId,
      menuPositionsId,
      orderBy,
      status,
      urlSlugs,
      displayChild
    } = req.body;
    const menu = {
      name,
      url,
      component,
      icon,
      languagesId,
      sitesId,
      parentId,
      menuPositionsId,
      orderBy,
      status,
      usersCreatorId,
      urlSlugs,
      displayChild
    };

    const SCHEMA = ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
      name: {
        max: 100,
        required: noArguments
      },
      url: {
        max: 300
      },
      component: {
        max: 100
      },
      // icon: {
      //   max: 20,
      // },
      sitesId: {
        required: noArguments
      },
      parentId: {
        required: noArguments
      },
      menuPositionsId: {
        required: noArguments
      },
      orderBy: {
        required: noArguments
      },
      usersCreatorId: {
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
    ValidateJoi.validate(menu, SCHEMA)
      .then(data => {
        res.locals.body = data;
        next();
      })
      .catch(error => next({ ...error, message: 'Định dạng gửi đi không đúng' }));
  },
  authenUpdate: (req, res, next) => {
    // console.log("validate authenUpdate")

    const {
      name,
      url,
      component,
      languagesId,
      icon,
      sitesId,
      parentId,
      menuPositionsId,
      orderBy,
      status,
      urlSlugs,
      displayChild
    } = req.body;
    const menu = {
      name,
      url,
      component,
      icon,
      languagesId,
      sitesId,
      parentId,
      menuPositionsId,
      orderBy,
      status,
      urlSlugs,
      displayChild
    };

    const SCHEMA = ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
      name: {
        max: 100
      },
      url: {
        max: 300
      },
      component: {
        max: 100
      }
      // icon: {
      //   max: 20,
      // },
    });

    ValidateJoi.validate(menu, SCHEMA)
      .then(data => {
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
        url,
        component,
        languagesId,
        icon,
        sitesId,
        parentId,
        menuPositionsId,
        orderBy,
        status,
        usersCreatorId,
        FromDate,
        ToDate,
        placesId
      } = JSON.parse(filter);
      const menu = {
        id,
        name,
        url,
        component,
        languagesId,
        icon,
        sitesId,
        parentId,
        menuPositionsId,
        orderBy,
        status,
        usersCreatorId,
        FromDate,
        ToDate,
        placesId
      };

      // console.log(menu)
      const SCHEMA = {
        id: ValidateJoi.createSchemaProp({
          any: noArguments,
          label: viMessage['api.menus.id']
          // regex: /(^\d+(,\d+)*$)|(^\d*$)/
        }),
        ...DEFAULT_SCHEMA,
        sitesId: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage.sitesId,
          regex: regexPattern.listIds
        }),
        parentId: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.menus.parentId'],
          regex: regexPattern.listIds
        }),
        languagesId: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.languages.id'],
          regex: regexPattern.listIds
        }),
        menuPositionsId: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage.menuPositionsId,
          regex: regexPattern.listIds
        }),
        usersCreatorId: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage.usersCreatorId,
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
      ValidateJoi.validate(menu, SCHEMA)
        .then(data => {
          if (id) {
            ValidateJoi.transStringToArray(data, 'id');
          }
          if (sitesId) {
            ValidateJoi.transStringToArray(data, 'sitesId');
          }
          if (parentId) {
            ValidateJoi.transStringToArray(data, 'parentId');
          }
          if (menuPositionsId) {
            ValidateJoi.transStringToArray(data, 'menuPositionsId');
          }
          if (usersCreatorId) {
            ValidateJoi.transStringToArray(data, 'usersCreatorId');
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
    const menu = { orders };

    const SCHEMA = {
      orders: ValidateJoi.createSchemaProp({
        array: noArguments,
        label: viMessage['api.menus.orders']
      })
    };

    ValidateJoi.validate(menu, SCHEMA)
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
      const menu = { status };
      const { id } = JSON.parse(filter);
      const whereFilter = { id };

      const SCHEMA = {
        id: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.menus.id'],
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

      await ValidateJoi.validate(menu, SCHEMA)
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
