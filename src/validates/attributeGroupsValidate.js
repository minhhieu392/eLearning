import viMessage from '../locales/vi';
import { parseSort } from '../utils/helper';
import regexPattern from '../utils/regexPattern';
import ValidateJoi, { noArguments } from '../utils/validateJoi';
const DEFAULT_SCHEMA = {
  attributeGroupsName: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.attributeGroups.attributeGroupsName']
  }),
  type: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage['api.attributeGroups.type'],
    allow: [null]
  }),
  speciesGroupsId: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage['api.speciesGroups.id'],
    allow: [null]
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

export default {
  authenCreate: (req, res, next) => {
    console.log('validate authenCreate');
    const userCreatorsId = req.auth.userId;

    const { attributeGroupsName, dateCreated, dateUpdated, status, speciesGroupsId, type } = req.body;
    const province = {
      attributeGroupsName,
      dateCreated,
      dateUpdated,
      status,
      speciesGroupsId,
      userCreatorsId,
      type
    };

    const SCHEMA = ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
      attributeGroupsName: {
        max: 200,
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

  authenUpdate: (req, res, next) => {
    console.log('validate authenUpdate');

    const { attributeGroupsName, dateCreated, dateUpdated, status, speciesGroupsId, type } = req.body;
    const province = { attributeGroupsName, dateCreated, dateUpdated, status, speciesGroupsId, type };

    const SCHEMA = ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
      attributeGroupsName: {
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

    const { status, speciesGroupsId, dateUpdated } = req.body;
    const userGroup = { status, speciesGroupsId, dateUpdated, usersCreatorsId };

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
      const { id, attributeGroupsName, status, speciesGroupsId, userCreatorsId, FromDate, ToDate } = JSON.parse(filter);
      const province = { id, attributeGroupsName, status, speciesGroupsId, userCreatorsId, FromDate, ToDate };

      console.log(province);
      const SCHEMA = {
        id: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.attributeGroups.id'],
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
  authenFilterCount: (req, res, next) => {
    console.log('validate authenFilter');
    const { filter } = req.query;

    if (filter) {
      const {
        villagesId,
        wardsId,
        districtsId,
        provincesId,

        ownersId
      } = JSON.parse(filter);
      const province = {
        villagesId,
        wardsId,
        districtsId,
        provincesId,

        ownersId
      };

      console.log(province);
      const SCHEMA = {
        villagesId: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.village.id'],
          regex: regexPattern.listIds
        }),
        wardsId: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.wards.id'],
          regex: regexPattern.listIds
        }),
        districtsId: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.district.id'],
          regex: regexPattern.listIds
        }),
        provincesId: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.provinces.id'],
          regex: regexPattern.listIds
        }),

        ownersId: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.owners.id'],
          regex: regexPattern.listIds
        })
      };

      // console.log('input: ', input);
      ValidateJoi.validate(province, SCHEMA)
        .then(data => {
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
          label: viMessage['api.attributeGroups.id'],
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
