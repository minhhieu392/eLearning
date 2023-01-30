import ValidateJoi, { noArguments } from '../utils/validateJoi';
import viMessage from '../locales/vi';
import regexPattern from '../utils/regexPattern';
import { parseSort } from '../utils/helper';
const DEFAULT_SCHEMA = {
  villageName: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.village.name']
  }),
  villageIdentificationCode: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.village.villageIdentificationCode'],
    allow: ['', null]
  }),
  wardsId: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage['api.village.wardsId']
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
    object: noArguments,
    label: viMessage.points,
    allow: [{}, null]
  }),
  status: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage.status
  })
};
const list_SCHEMA = ValidateJoi.createArraySchema({
  villageName: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.wards.name'],
    required: noArguments
  }),
  villageIdentificationCode: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.village.villageIdentificationCode'],
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

    const { villageName, wardsId, villageIdentificationCode, status, dateCreated, dateUpdated, points } = req.body;
    const village = {
      villageName,
      wardsId,
      villageIdentificationCode,
      status,
      dateCreated,
      dateUpdated,
      points,
      userCreatorsId
    };

    const SCHEMA = ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
      villageName: {
        max: 200,
        required: noArguments
      },
      villageIdentificationCode: {
        max: 200
        // required: noArguments
      },
      wardsId: {
        required: noArguments
      },
      userCreatorsId: {
        required: noArguments
      },
      status: {
        required: noArguments
      }
    });

    console.log('input: ');
    ValidateJoi.validate(village, SCHEMA)
      .then(data => {
        console.log('data', data);
        res.locals.body = data;
        next();
      })
      .catch(error => next({ ...error, message: 'Định dạng gửi đi không đúng' }));
  },
  authenBulkCreateOrUpdate: (req, res, next) => {
    console.log('validate authenCreate');
    const userCreatorsId = req.auth.userId;

    const { wardsId, villages } = req.body;
    const ward = {
      villages,
      wardsId,
      userCreatorsId
    };

    const SCHEMA = Object.assign(
      ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
        wardsId: {
          required: noArguments
        }
      }),
      {
        villages: list_SCHEMA
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
    const userCreatorsId = req.auth.userId;
    const { villageName, wardsId, villageIdentificationCode, status, dateCreated, dateUpdated, points } = req.body;
    const village = {
      villageName,
      wardsId,
      villageIdentificationCode,
      status,
      dateCreated,
      dateUpdated,
      points,
      userCreatorsId
    };

    const SCHEMA = ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
      villageName: {
        max: 200
        // required: noArguments
      },
      villageIdentificationCode: {
        max: 200
        // required: noArguments
      },
      wardsId: {
        // required: noArguments
      },
      userCreatorsId: {
        // required: noArguments
      },
      status: {
        // required: noArguments
      }
    });

    ValidateJoi.validate(village, SCHEMA)
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

    res.locals.sort = parseSort(sort);
    res.locals.range = range ? JSON.parse(range) : [0, 49];
    res.locals.attributes = attributes;
    if (filter) {
      const {
        id,
        villageName,
        provincesId,
        districtsId,
        wardsId,
        villageIdentificationCode,
        status,
        userCreatorsId,
        FromDate,
        ToDate
      } = JSON.parse(filter);
      const village = {
        id,
        villageName,
        provincesId,
        districtsId,
        wardsId,
        villageIdentificationCode,
        status,
        userCreatorsId,
        FromDate,
        ToDate
      };

      console.log(village);
      const SCHEMA = {
        id: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.wards.id'],
          regex: regexPattern.listIds
        }),
        ...DEFAULT_SCHEMA,
        wardsId: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage.wardsId,
          regex: regexPattern.listIds
        }),
        provincesId: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage.provincesId,
          regex: regexPattern.listIds
        }),
        districtsId: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage.districtsId,
          regex: regexPattern.listIds
        }),
        villageIdentificationCode: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.village.villageIdentificationCode'],
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
      ValidateJoi.validate(village, SCHEMA)
        .then(data => {
          if (id) {
            ValidateJoi.transStringToArray(data, 'id');
          }
          if (userCreatorsId) {
            ValidateJoi.transStringToArray(data, 'userCreatorsId');
          }
          if (wardsId) {
            ValidateJoi.transStringToArray(data, 'wardsId');
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
          label: viMessage['api.village.id'],
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
