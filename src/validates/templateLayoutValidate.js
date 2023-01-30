import ValidateJoi, { noArguments } from '../utils/validateJoi';
import viMessage from '../locales/vi';
import regexPattern from '../utils/regexPattern';
import { sequelize } from '../db/db';
import { parseSortVer2 } from '../utils/helper';
const DEFAULT_SCHEMA = {
  name: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.templateLayouts.name']
  }),
  folder: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.templateLayouts.folder']
  }),
  usersCreatorId: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage.usersCreatorId
  }),
  status: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage.status
  }),
  typesId: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage.typesId
  }),
  templatesId: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage.templatesId
  }),
  excludedId: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage.templatesId
  })
};
const TEMPLATE_SCHEMA = ValidateJoi.createArraySchema(
  ValidateJoi.createObjectSchema({
    id: ValidateJoi.createSchemaProp({
      string: noArguments,
      label: viMessage.templatesId
    }),
    // templatesId: ValidateJoi.createSchemaProp({
    //   string: noArguments,
    //   label: viMessage.templatesId
    // }),
    // templateLayoutsId: ValidateJoi.createSchemaProp({
    //   string: noArguments,
    //   label: viMessage.templateLayoutsId
    // }),
    imagePreview: ValidateJoi.createSchemaProp({
      array: noArguments,
      label: viMessage['api.templateLayouts.imagePreview'],
      allow: ['', null]
    }),
    imagesResize: ValidateJoi.createSchemaProp({
      array: noArguments,
      label: viMessage.imagesResize
    }),
    isDelete: ValidateJoi.createSchemaProp({
      boolean: noArguments,
      label: viMessage.isDelete
    })
  })
);

export default {
  authenCreate: (req, res, next) => {
    console.log('validate authenCreate');
    const usersCreatorId = req.auth.userId;

    const { name, folder, status, typesId, templates } = req.body;
    const templateLayout = { name, folder, status, usersCreatorId, typesId, templates };
    console.log('validate templateLayout', templateLayout);
    const SCHEMA = Object.assign(
      ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
        // name: {
        //   max: 200,
        //   required: noArguments
        // },
        // folder: {
        //   max: 200,
        //   required: noArguments
        // },
        usersCreatorId: {
          required: noArguments
        },
        status: {
          required: noArguments
        }
      }),
      {
        templates: TEMPLATE_SCHEMA
      }
    );

    // console.log('input: ', input);
    ValidateJoi.validate(templateLayout, SCHEMA)
      .then(data => {
        res.locals.body = data;
        next();
      })
      .catch(error => next({ ...error, message: 'Định dạng gửi đi không đúng' }));
  },
  authenUpdate: (req, res, next) => {
    console.log('validate authenUpdate');

    const { name, folder, status, typesId, templates } = req.body;
    const templateLayout = { name, folder, status, typesId, templates };

    const SCHEMA = Object.assign(ValidateJoi.assignSchema(DEFAULT_SCHEMA, {}), {
      templates: TEMPLATE_SCHEMA
    });

    ValidateJoi.validate(templateLayout, SCHEMA)
      .then(data => {
        res.locals.body = data;
        next();
      })
      .catch(error => next({ ...error, message: 'Định dạng gửi đi không đúng' }));
  },
  authenFilter: (req, res, next) => {
    console.log('validate authenFilter');
    const { filter, sort, range, attributes } = req.query;

    res.locals.sort = parseSortVer2(sort, 'templateLayouts');
    res.locals.range = range ? JSON.parse(range) : [0, 49];
    res.locals.attributes = attributes;
    if (filter) {
      const {
        id,
        name,
        folder,
        status,
        usersCreatorId,
        FromDate,
        ToDate,
        templatesId,
        typesId,
        excludedId
      } = JSON.parse(filter);
      const templateLayout = {
        id,
        name,
        folder,
        status,
        usersCreatorId,
        FromDate,
        ToDate,
        templatesId,
        typesId,
        excludedId
      };

      console.log(templateLayout);
      const SCHEMA = {
        id: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.templateLayouts.id'],
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
      ValidateJoi.validate(templateLayout, SCHEMA)
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
          if (typesId) {
            ValidateJoi.transStringToArray(data, 'typesId');
          }
          if (excludedId) {
            ValidateJoi.transStringToExcludedArray(data, 'excludedId');
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
