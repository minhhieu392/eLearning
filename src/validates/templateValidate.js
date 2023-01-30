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
  folder: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.templates.folder'],
    allow: [null, '']
  }),
  usersCreatorId: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage.usersCreatorId
  }),
  status: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage.status
  }),
  templateGroupsId: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage.templateGroupsId,
    allow: [null, '']
  }),
  shortDescriptions: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.templates.shortDescriptions'],
    allow: [null, '']
  }),
  descriptions: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.templates.descriptions'],
    allow: [null, '']
  }),
  images: ValidateJoi.createSchemaProp({
    array: noArguments,
    label: viMessage['api.templates.images'],
    allow: [null, '']
  }),
  promotionPrice: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage['api.templates.promotionPrice'],
    allow: [null, '']
  }),
  price: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage['api.templates.price'],
    allow: [null, '']
  }),
  link: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.templates.link'],
    allow: [null, '']
  }),
  excludedId: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['excludedId'],
    allow: [null, '']
  })
};

export default {
  authenCreate: (req, res, next) => {
    console.log('validate authenCreate');
    const usersCreatorId = req.auth.userId;

    const {
      name,
      folder,
      status,
      shortDescriptions,
      descriptions,
      price,
      promotionPrice,
      images,
      templateGroupsId,
      link
    } = req.body;
    const template = {
      name,
      folder,
      status,
      usersCreatorId,
      shortDescriptions,
      descriptions,
      price,
      promotionPrice,
      images,
      templateGroupsId,
      link
    };

    const SCHEMA = ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
      name: {
        max: 200,
        required: noArguments
      },
      folder: {
        max: 200,
        required: noArguments
      },
      usersCreatorId: {
        required: noArguments
      },
      status: {
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

    const {
      name,
      folder,
      status,
      shortDescriptions,
      descriptions,
      price,
      promotionPrice,
      images,
      templateGroupsId,
      link
    } = req.body;
    const template = {
      name,
      folder,
      status,
      shortDescriptions,
      descriptions,
      price,
      promotionPrice,
      images,
      templateGroupsId,
      link
    };

    const SCHEMA = ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
      name: {
        max: 200
      },
      folder: {
        max: 200
      }
    });

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

    res.locals.sort = parseSortVer2(sort, 'templates');
    res.locals.range = range ? JSON.parse(range) : [0, 49];
    res.locals.attributes = attributes;
    if (filter) {
      console.log(filter);
      const {
        id,
        name,
        folder,
        status,
        usersCreatorId,
        FromDate,
        ToDate,
        shortDescriptions,
        descriptions,
        price,
        promotionPrice,
        images,
        templateGroupsId,
        templatesId,
        templateLayoutsId,
        sitesId,
        link,
        excludedId
      } = JSON.parse(filter);
      const template = {
        id,
        name,
        folder,
        status,
        usersCreatorId,
        FromDate,
        ToDate,
        shortDescriptions,
        descriptions,
        price,
        promotionPrice,
        images,
        templateGroupsId,
        templatesId,
        templateLayoutsId,
        sitesId,
        link,
        excludedId
      };

      console.log(template);
      const SCHEMA = {
        id: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.templates.id'],
          regex: regexPattern.listIds
        }),
        templatesId: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage.templatesId,
          regex: regexPattern.listIds
        }),
        sitesId: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage.sitesId,
          regex: regexPattern.listIds
        }),
        templateLayoutsId: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage.templateLayoutsId,
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
          if (templatesId) {
            ValidateJoi.transStringToArray(data, 'templatesId');
          }
          if (templateLayoutsId) {
            ValidateJoi.transStringToArray(data, 'templateLayoutsId');
          }
          if (excludedId) {
            ValidateJoi.transStringToExcludedArray(data, 'excludedId');
          }
          if (templateGroupsId) {
            ValidateJoi.TemplateGetByTemplateGroupParentToArray(data, 'templateGroupsId');
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
