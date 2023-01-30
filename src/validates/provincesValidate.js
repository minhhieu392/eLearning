import ValidateJoi, { noArguments } from '../utils/validateJoi';
import viMessage from '../locales/vi';
import { sequelize } from '../db/db';
import regexPattern from '../utils/regexPattern';
import { parseSort } from '../utils/helper';
const DEFAULT_SCHEMA = {
  provinceName: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.provinces.name']
  }),
  provinceIdentificationCode: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.provinces.identificationCode'],
    allow: ['', null]
  }),
  userCreatorsId: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage.usersCreatorId
  }),
  dateCreated: ValidateJoi.createSchemaProp({
    date: noArguments,
    label: viMessage.createDate
  }),
  dateUpdated: ValidateJoi.createSchemaProp({
    date: noArguments,
    label: viMessage.dateUpdated,
    allow: ['', null]
  }),
  points: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage.points,
    allow: ['', null]
  }),
  status: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage.status
  })
};

const list_SCHEMA = ValidateJoi.createArraySchema({
  provinceName: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.provinces.name'],
    required: noArguments
  }),
  provinceIdentificationCode: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.provinces.identificationCode'],
    allow: ['', null]
  }),
  dateUpdated: ValidateJoi.createSchemaProp({
    date: noArguments,
    label: viMessage.dateUpdated,
    allow: ['', null]
  }),

  status: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage.status,
    required: noArguments
  })
});

export default {
  authenCreate: (req, res, next) => {
    console.log('validate authenCreate');
    const userCreatorsId = req.auth.userId;

    const { provinceName, dateCreated, dateUpdated, points, status, provinceIdentificationCode } = req.body;
    const province = {
      provinceName,
      dateCreated,
      dateUpdated,
      points,
      status,
      userCreatorsId,
      provinceIdentificationCode
    };

    const SCHEMA = ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
      provinceName: {
        max: 200,
        required: noArguments
      },
      provinceIdentificationCode: {
        max: 200
      }
    });

    // console.log('input: ', input);
    ValidateJoi.validate(province, SCHEMA)
      .then(data => {
        res.locals.body = data;
        next();
      })
      .catch(error => next({ ...error, message: 'Định dạng gửi đi không đúng' }));
  },
  authenBulkCreateOrUpdate: (req, res, next) => {
    console.log('validate authenBulkCreateOrUpdate');
    const userCreatorsId = req.auth.userId;

    const { provinces } = req.body;
    const ward = {
      provinces,

      userCreatorsId
    };

    const SCHEMA = Object.assign(ValidateJoi.assignSchema(DEFAULT_SCHEMA, {}), {
      provinces: list_SCHEMA
    });

    // console.log('input: ', input);
    ValidateJoi.validate(ward, SCHEMA)
      .then(data => {
        res.locals.body = data;
        next();
      })
      .catch(error => next({ ...error, message: 'Định dạng gửi đi không đúng' }));
  },
  authenUpdate: (req, res, next) => {
    console.log('validate authenUpdate');

    const { provinceName, dateCreated, dateUpdated, points, status, provinceIdentificationCode } = req.body;
    const province = { provinceName, dateCreated, dateUpdated, points, status, provinceIdentificationCode };

    const SCHEMA = ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
      provinceName: {
        max: 200,
        required: noArguments
      },
      provinceIdentificationCode: {
        max: 200
      }
    });

    ValidateJoi.validate(province, SCHEMA)
      .then(data => {
        res.locals.body = data;
        next();
      })
      .catch(error => {
        next({ ...error, message: 'Định dạng gửi đi không đúng' });
      });
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
  authenFilter: (req, res, next) => {
    console.log('validate authenFilter');
    const { filter, sort, range, attributes } = req.query;

    res.locals.sort = parseSort(sort);
    res.locals.range = range ? JSON.parse(range) : [0, 49];
    res.locals.attributes = attributes;
    if (filter) {
      const { id, provinceName, provinceIdentificationCode, status, userCreatorsId, FromDate, ToDate } = JSON.parse(
        filter
      );
      const province = { id, provinceName, provinceIdentificationCode, status, userCreatorsId, FromDate, ToDate };

      console.log(province);
      const SCHEMA = {
        id: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.provinces.id'],
          regex: regexPattern.listIds
        }),
        ...DEFAULT_SCHEMA,
        provinceIdentificationCode: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.provinces.identificationCode'],
          regex: regexPattern.name
        }),
        userCreatorsId: ValidateJoi.createSchemaProp({
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
      ValidateJoi.validate(province, SCHEMA)
        .then(data => {
          if (id) {
            ValidateJoi.transStringToArray(data, 'id');
          }
          if (userCreatorsId) {
            ValidateJoi.transStringToArray(data, 'userCreatorsId');
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
  authen_GetAll: (req, res, next) => {
    console.log('validate authenFilter');
    const { filter, attributes, sort } = req.query;

    res.locals.sort = parseSort(sort);
    res.locals.attributes = attributes;

    if (filter) {
      const { id } = JSON.parse(filter);
      const province = { id };

      const SCHEMA = {
        id: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.provinces.id'],
          regex: regexPattern.listIds
        })
      };

      // console.log('input: ', input);
      ValidateJoi.validate(province, SCHEMA)
        .then(data => {
          if (id) {
            ValidateJoi.transStringToArray(data, 'id');
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
  }
};
