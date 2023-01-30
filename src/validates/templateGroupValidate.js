import ValidateJoi, { noArguments } from '../utils/validateJoi';
import viMessage from '../locales/vi';
import regexPattern from '../utils/regexPattern';
import { sequelize } from '../db/db';
import { parseSortVer2 } from '../utils/helper';
const DEFAULT_SCHEMA = {
  name: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.templates.name']
  }),
  parentId: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage['api.templateGroups.parentId']
  }),
  orderBy: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage.orderBy
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
    label: viMessage['api.templateGroups.urlSlugs']
  }),
  images: ValidateJoi.createSchemaProp({
    array: noArguments,
    label: viMessage.images,
    allow: ['', null]
  })
};

export default {
  authenCreate: (req, res, next) => {
    console.log('validate authenCreate');
    const usersCreatorId = req.auth.userId;

    const { name, parentId, orderBy, status, urlSlugs, images } = req.body;
    const template = { name, parentId, orderBy, usersCreatorId, status, urlSlugs, images };

    const SCHEMA = ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
      name: {
        max: 200,
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
      urlSlugs: {
        required: noArguments
      }
    });

    // console.log('input: ', input);
    ValidateJoi.validate(template, SCHEMA)
      .then(data => {
        res.locals.body = data;
        next();
      })
      .catch(error => next({ ...error, message: 'Định dạng gửi đi không đúng' }));
  },
  authenUpdate: (req, res, next) => {
    console.log('validate authenUpdate');

    const { name, parentId, orderBy, status, urlSlugs, images } = req.body;
    const template = { name, parentId, orderBy, status, urlSlugs, images };

    const SCHEMA = ValidateJoi.assignSchema(DEFAULT_SCHEMA, {});

    ValidateJoi.validate(template, SCHEMA)
      .then(data => {
        res.locals.body = data;
        next();
      })
      .catch(error => next({ ...error, message: 'Định dạng gửi đi không đúng' }));
  },
  authenFilter: (req, res, next) => {
    console.log('validate authenFilter');
    const { filter, sort, range, attributes } = req.query;

    res.locals.sort = parseSortVer2(sort, 'templateGroups');
    res.locals.range = range ? JSON.parse(range) : [0, 49];
    res.locals.attributes = attributes;
    if (filter) {
      const { name, parentId, orderBy, status, urlSlugs, id, usersCreatorId, FromDate, ToDate } = JSON.parse(filter);
      const template = { id, usersCreatorId, name, parentId, orderBy, status, urlSlugs, FromDate, ToDate };

      console.log(template);
      const SCHEMA = {
        id: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.templates.id'],
          regex: regexPattern.listIds
        }),
        ...DEFAULT_SCHEMA,
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
      ValidateJoi.validate(template, SCHEMA)
        .then(data => {
          if (id) {
            ValidateJoi.transStringToArray(data, 'id');
          }
          if (usersCreatorId) {
            ValidateJoi.transStringToArray(data, 'usersCreatorId');
          }

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
  },
  authenUpdateOrder: (req, res, next) => {
    // console.log("validate authenUpdateOrder")

    const { orders } = req.body;
    const templateGroup = { orders };

    const SCHEMA = {
      orders: ValidateJoi.createSchemaProp({
        array: noArguments,
        label: viMessage['api.templateGroups.orderBy']
      })
    };

    ValidateJoi.validate(templateGroup, SCHEMA)
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
      const templateGroup = { status };
      const { id } = JSON.parse(filter);
      const whereFilter = { id };

      const SCHEMA = {
        id: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.templates.id'],
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

      await ValidateJoi.validate(templateGroup, SCHEMA)
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
