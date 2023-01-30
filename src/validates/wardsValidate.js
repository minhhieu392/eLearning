/* eslint-disable camelcase */
import ValidateJoi, { noArguments } from '../utils/validateJoi';
import viMessage from '../locales/vi';

import regexPattern from '../utils/regexPattern';
import { parseSortVer2 } from '../utils/helper';
const DEFAULT_SCHEMA = {
  wardName: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.wards.name']
  }),
  wardIdentificationCode: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.wards.identificationCode'],
    allow: ['', null]
  }),
  districtsId: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage.districtsId
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
  }),
  polygonCafe: ValidateJoi.createSchemaProp({
    object: noArguments,
    label: viMessage.points
  })
};

const list_SCHEMA = ValidateJoi.createArraySchema({
  wardName: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.wards.name'],
    required: noArguments
  }),
  wardIdentificationCode: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.wards.identificationCode'],
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

    const {
      wardName,
      districtsId,
      wardIdentificationCode,
      status,
      dateCreated,
      dateUpdated,
      points,
      polygonCafe
    } = req.body;
    const ward = {
      wardName,
      districtsId,
      wardIdentificationCode,
      status,
      dateCreated,
      dateUpdated,
      points,
      polygonCafe,
      userCreatorsId
    };

    const SCHEMA = ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
      wardName: {
        max: 200,
        required: noArguments
      },
      wardIdentificationCode: {
        max: 200
      },
      districtsId: {
        required: noArguments
      },
      userCreatorsId: {
        required: noArguments
      },
      status: {
        required: noArguments
      }
    });

    // console.log('input: ', input);
    ValidateJoi.validate(ward, SCHEMA)
      .then(data => {
        res.locals.body = data;
        next();
      })
      .catch(error => next({ ...error, message: 'Định dạng gửi đi không đúng' }));
  },
  authenBulkCreateOrUpdate: (req, res, next) => {
    console.log('validate authenCreate');
    const userCreatorsId = req.auth.userId;

    const { districtsId, wards } = req.body;
    const ward = {
      wards,
      districtsId,
      userCreatorsId
    };

    const SCHEMA = Object.assign(
      ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
        districtsId: {
          required: noArguments
        }
      }),
      {
        wards: list_SCHEMA
      }
    );

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

    const {
      wardName,
      districtsId,
      wardIdentificationCode,
      status,
      dateCreated,
      dateUpdated,
      points,
      polygonCafe
    } = req.body;
    const ward = {
      wardName,
      wardIdentificationCode,
      districtsId,
      status,
      dateCreated,
      dateUpdated,
      points,
      polygonCafe
    };

    const SCHEMA = ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
      wardName: {
        max: 200,
        required: true
      },
      wardIdentificationCode: {
        max: 200
      },
      districtsId: {
        required: noArguments
      }
    });

    ValidateJoi.validate(ward, SCHEMA)
      .then(data => {
        res.locals.body = data;
        next();
      })
      .catch(error => next({ ...error, message: 'Định dạng gửi đi không đúng' }));
  },
  authenUpdate_status: (req, res, next) => {
    // console.log("validate authenCreate")
    const userCreatorsId = req.auth.userId;

    const { status, dateUpdated } = req.body;
    const userGroup = { status, dateUpdated, userCreatorsId };

    const SCHEMA = ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
      status: {
        required: noArguments
      },
      dateUpdated: {
        required: noArguments
      }
    });

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

    res.locals.sort = parseSortVer2(sort, 'wards');
    res.locals.range = range ? JSON.parse(range) : [0, 49];
    res.locals.attributes = attributes;
    if (filter) {
      const {
        id,
        wardName,
        districtsId,
        wardIdentificationCode,
        status,
        userCreatorsId,
        provincesId,
        FromDate,
        ToDate
      } = JSON.parse(filter);
      const ward = {
        id,
        wardName,
        districtsId,
        wardIdentificationCode,
        status,
        userCreatorsId,
        provincesId,
        FromDate,
        ToDate
      };

      console.log(ward);
      const SCHEMA = {
        id: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.wards.id'],
          regex: regexPattern.listIds
        }),
        ...DEFAULT_SCHEMA,
        provincesId: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage.provincesId,
          regex: regexPattern.listIds
        }),
        wardIdentificationCode: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.wards.identificationCode'],
          regex: regexPattern.name
        }),
        districtsId: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage.districtsId,
          regex: regexPattern.listIds
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
      ValidateJoi.validate(ward, SCHEMA)
        .then(data => {
          if (id) {
            ValidateJoi.transStringToArray(data, 'id');
          }
          if (userCreatorsId) {
            ValidateJoi.transStringToArray(data, 'userCreatorsId');
          }
          if (provincesId) {
            ValidateJoi.transStringToArray(data, 'provincesId');
          }
          if (districtsId) {
            ValidateJoi.transStringToArray(data, 'districtsId');
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

    res.locals.sort = parseSortVer2(sort);
    res.locals.attributes = attributes;

    if (filter) {
      const { id } = JSON.parse(filter);
      const province = { id };

      const SCHEMA = {
        id: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.wards.id'],
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
