import viMessage from '../locales/vi';
import { parseSort } from '../utils/helper';
import regexPattern from '../utils/regexPattern';
import ValidateJoi, { noArguments } from '../utils/validateJoi';
const DEFAULT_SCHEMA = {
  name: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.owners.name']
  }),
  ethnic: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.owners.ethnic'],
    allow: [null, '']
  }),
  note: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.owners.note'],
    allow: ['', null]
  }),
  villagesId: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage['api.village.id']
  }),
  points: ValidateJoi.createSchemaProp({
    array: noArguments,
    label: viMessage.points,
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
  status: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage.status
  })
};

const LIST_SCHEMA = ValidateJoi.createArraySchema({
  id: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage['api.owners.id'],
    required: noArguments
  }),
  name: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.owners.name']
  }),

  note: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.owners.note'],
    allow: ['', null]
  }),
  villagesId: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage['api.village.id']
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
  status: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage.status
  })
});

export default {
  authenCreate: (req, res, next) => {
    console.log('validate authenCreate');
    const userCreatorsId = req.auth.userId;

    const { name, ethnic, note, points, villagesId, dateCreated, dateUpdated, status } = req.body;
    const province = {
      name,
      ethnic,
      note,
      villagesId,
      dateCreated,
      points,
      dateUpdated,
      status,
      userCreatorsId
    };

    const SCHEMA = ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
      name: {
        max: 200,
        required: noArguments
      },
      villagesId: {
        required: noArguments
      },
      status: {
        required: noArguments
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
    console.log('validate authenBulkCreateOrUpdate 2', req.body);

    const { owners } = req.body;
    const ward = {
      owners
    };

    const SCHEMA = Object.assign(ValidateJoi.assignSchema(DEFAULT_SCHEMA, {}), {
      owners: LIST_SCHEMA
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

    const { name, ethnic, note, points, villagesId, dateCreated, dateUpdated, status } = req.body;
    const province = {
      name,
      ethnic,
      note,
      villagesId,
      dateCreated,
      points,
      dateUpdated,
      status
    };

    const SCHEMA = ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
      name: {
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
      const {
        id,
        name,
        ethnic,
        note,
        villagesId,
        wardsId,
        districtsId,
        provincesId,
        dateCreated,
        dateUpdated,
        status,
        FromDate,
        ToDate,
        individualsId,
        speciesId,
        speciesGroupsId,
        individualsName,

        individualsCode,
        speciesName
      } = JSON.parse(filter);
      const province = {
        id,
        name,
        ethnic,

        note,
        villagesId,
        wardsId,
        districtsId,
        provincesId,
        dateCreated,
        dateUpdated,
        status,
        FromDate,
        ToDate,
        individualsId,
        speciesId,
        speciesGroupsId,
        individualsName,

        individualsCode,
        speciesName
      };

      console.log(province);
      const SCHEMA = {
        id: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.owners.id'],
          regex: regexPattern.listIds
        }),
        ...DEFAULT_SCHEMA,

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
        }),
        wardsId: ValidateJoi.createSchemaProp({
          number: noArguments,
          label: viMessage['api.wards.id']
        }),
        villagesId: ValidateJoi.createSchemaProp({
          number: noArguments,
          label: viMessage['api.village.id']
        }),
        provincesId: ValidateJoi.createSchemaProp({
          number: noArguments,
          label: viMessage['api.provinces.id']
        }),
        districtsId: ValidateJoi.createSchemaProp({
          number: noArguments,
          label: viMessage['api.district.id']
        }),
        individualsId: ValidateJoi.createSchemaProp({
          number: noArguments,
          label: viMessage['api.individuals.id']
        }),
        speciesId: ValidateJoi.createSchemaProp({
          number: noArguments,
          label: viMessage['api.species.id']
        }),
        speciesGroupsId: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.speciesGroups.id'],
          regex: regexPattern.listIds
        }),
        individualsName: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.individuals.name']
        }),
        individualsCode: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.individuals.code']
        }),
        speciesName: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.species.name']
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
          label: viMessage['api.owners.id'],
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
