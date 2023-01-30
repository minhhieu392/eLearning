import ValidateJoi, { noArguments } from '../utils/validateJoi';
import viMessage from '../locales/vi';
import { sequelize } from '../db/db';
import regexPattern from '../utils/regexPattern';
import { parseSort } from '../utils/helper';
const DEFAULT_SCHEMA = {
  districtName: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.district.name']
  }),
  districtIdentificationCode: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.district.identificationCode'],
    allow: ['', null]
  }),
  provincesId: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage.provincesId
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
    // object: noArguments,
    string: noArguments,
    label: viMessage.points,
    allow: ['', null]
  }),
  status: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage.status
  }),
  polygonCafe: ValidateJoi.createSchemaProp({
    // object: noArguments,
    object: noArguments,
    label: viMessage.points,
    allow: ['', null]
  })
};
const list_SCHEMA = ValidateJoi.createArraySchema({
  districtName: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.wards.name'],
    required: noArguments
  }),
  districtIdentificationCode: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.district.identificationCode'],
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
    // console.log("validate authenCreate")
    const userCreatorsId = req.auth.userId;

    const {
      districtName,
      districtIdentificationCode,
      dateCreated,
      dateUpdated,
      provincesId,
      points,
      status,
      polygonCafe
    } = req.body;
    const district = {
      districtName,
      districtIdentificationCode,
      dateCreated,
      dateUpdated,
      provincesId,
      points,
      status,
      polygonCafe,
      userCreatorsId
    };

    const SCHEMA = ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
      districtName: {
        max: 200,
        required: noArguments
      },
      districtIdentificationCode: {
        max: 200
      },
      provincesId: {
        required: noArguments
      },
      status: {
        required: noArguments
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
  authenBulkCreateOrUpdate: (req, res, next) => {
    console.log('validate authenCreate');
    const userCreatorsId = req.auth.userId;

    const { provincesId, districts } = req.body;
    const ward = {
      districts,
      provincesId,
      userCreatorsId
    };

    const SCHEMA = Object.assign(
      ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
        provincesId: {
          required: noArguments
        }
      }),
      {
        districts: list_SCHEMA
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
    // console.log("validate authenUpdate")

    const {
      districtName,
      districtIdentificationCode,
      dateCreated,
      dateUpdated,
      provincesId,
      points,
      polygonCafe,
      status
    } = req.body;
    const district = {
      districtName,
      districtIdentificationCode,
      dateCreated,
      dateUpdated,
      provincesId,
      points,
      polygonCafe,
      status
    };

    const SCHEMA = ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
      districtName: {
        max: 200
      },
      districtIdentificationCode: {
        max: 200
      }
    });

    ValidateJoi.validate(district, SCHEMA)
      .then(data => {
        res.locals.body = data;
        next();
      })
      .catch(error => next({ ...error, message: 'Định dạng gửi đi không đúng' }));
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
    // console.log("validate authenFilter")
    const { filter, sort, range, attributes } = req.query;

    res.locals.sort = parseSort(sort);
    res.locals.range = range ? JSON.parse(range) : [0, 49];
    res.locals.attributes = attributes;
    if (filter) {
      const { id, districtName, districtIdentificationCode, provincesId, status, FromDate, ToDate } = JSON.parse(
        filter
      );
      const district = { id, districtName, districtIdentificationCode, provincesId, status, FromDate, ToDate };

      // console.log(district)
      const SCHEMA = {
        id: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.district.id'],
          regex: regexPattern.listIds
        }),
        ...DEFAULT_SCHEMA,
        provincesId: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage.provincesId,
          regex: regexPattern.listIds
        }),
        districtIdentificationCode: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.district.identificationCode'],
          regex: regexPattern.name
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
          label: viMessage['api.district.id'],
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
