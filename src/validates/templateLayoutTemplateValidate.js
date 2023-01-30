import ValidateJoi, { noArguments } from '../utils/validateJoi';
import viMessage from '../locales/vi';
import regexPattern from '../utils/regexPattern';
import { parseSortVer2 } from '../utils/helper';
const DEFAULT_SCHEMA = {
  templatesId: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage.templatesId,
  }),
  templateLayoutsId: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage.templateLayoutsId,
  }),
  imagesResize : ValidateJoi.createSchemaProp({
    array: noArguments,
    label: viMessage['api.templateLayoutTemplates.imagesResize'],
  }),
};

export default {
  authenCreate: (req, res, next) => {
    // console.log("validate authenCreate")
    // const usersCreatorId = req.auth.userId;
    const { templatesId, templateLayoutsId, imagesResize } = req.body;
    const templateLayoutTemplate = { templatesId, templateLayoutsId, imagesResize };

    const SCHEMA = ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
      templateLayoutsId: {
        required: noArguments
      },
      templatesId: {
        required: noArguments
      }
    });

    ValidateJoi.validate(templateLayoutTemplate, SCHEMA)
      .then((data) => {
        res.locals.body = data;
        next()
      })
      .catch(error => next({ ...error, message: "Định dạng gửi đi không đúng" }
      ));
  },
  authenUpdate: (req, res, next) => {
    console.log("validate authenUpdate")

    const { templatesId, templateLayoutsId, imagesResize } = req.body;
    const templateLayoutTemplate = { templatesId, templateLayoutsId, imagesResize };

    const SCHEMA = ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
    });

    ValidateJoi.validate(templateLayoutTemplate, SCHEMA)
      .then((data) => {
        res.locals.body = data;
        next()
      })
      .catch(error => next({ ...error, message: "Định dạng gửi đi không đúng" }
      ));
  },
  authenFilter: (req, res, next) => {
    console.log("validate authenFilter")
    const { filter, sort, range, attributes } = req.query;

    res.locals.sort = parseSortVer2(sort,'templateLayoutTemplates');
    res.locals.range = range ? JSON.parse(range) : [0, 49];
    res.locals.attributes = attributes;
    if (filter) {
      const { id, templatesId, templateLayoutsId } = JSON.parse(filter);
      const templateLayoutTemplate = { id, templatesId, templateLayoutsId };
      const SCHEMA = {
        id: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.templateLayouts.id'],
          regex: regexPattern.listIds
        }),
        ...DEFAULT_SCHEMA,
      };
      ValidateJoi.validate(templateLayoutTemplate, SCHEMA)
        .then((data) => {
          if (id) {
            ValidateJoi.transStringToArray(data, 'id');
          }
          if (templatesId) {
            ValidateJoi.transStringToArray(data, 'templatesId');
          }
          if (templateLayoutsId) {
            ValidateJoi.transStringToArray(data,'templateLayoutsId')
          }
          res.locals.filter = data;
          console.log('locals.filter', res.locals.filter);
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
}
