import ValidateJoi, { noArguments } from '../utils/validateJoi';
import viMessage from '../locales/vi';

import regexPattern from '../utils/regexPattern';
import { parseSort } from '../utils/helper';

const DEFAULT_SCHEMA = {
  courseGroupsPackagesName: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.courseGroupsPackages.courseGroupsPackagesName']
  }),

  money: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage['api.courseGroupsPackages.money']
  }),
  promotionalMoney: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage['api.courseGroupsPackages.promotionalMoney']
  }),
  numberOfDays: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage['api.courseGroupsPackages.numberOfDays'],
    allow: [null]
  }),
  code: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage['api.courseGroupsPackages.code'],
    allow: [null, '']
  }),
  courseGroupsId: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage['api.courseGroups.id']
  }),

  userCreatorsId: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage.userCreatorsId
  }),
  dateCreated: ValidateJoi.createSchemaProp({
    date: noArguments,
    label: viMessage.createDate
  }),
  dateUpdated: ValidateJoi.createSchemaProp({
    date: noArguments,
    label: viMessage.dateUpdated
  }),
  status: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage.status
  })
};

export default {
  authenCreate: (req, res, next) => {
    // console.log("validate authenCreate")
    const userCreatorsId = req.auth.userId;

    const {
      courseGroupsPackagesName,
      courseGroupsId,

      money,
      promotionalMoney,

      // countUsers,
      numberOfDays,
      // userCreatorsId,
      status,
      questions
    } = req.body;
    const district = {
      courseGroupsPackagesName,
      courseGroupsId,

      money,
      promotionalMoney,

      // countUsers,
      numberOfDays,
      userCreatorsId,
      status,
      questions
    };

    const SCHEMA = Object.assign(
      ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
        courseGroupsPackagesName: {
          min: 1,
          max: 200,
          required: noArguments
        },
        courseGroupsId: {
          required: noArguments
        },
        status: {
          required: noArguments
        },
        money: {
          required: noArguments
        }
      })
    );

    // console.log('input: ', input);
    ValidateJoi.validate(district, SCHEMA)
      .then(data => {
        res.locals.body = data;
        next();
      })
      .catch(error => next({ ...error, message: 'Định dạng gửi đi không đúng' }));
  },
  authenUpdate: (req, res, next) => {
    // console.log("validate authenUpdate")

    const {
      courseGroupsPackagesName,
      courseGroupsId,
      money,
      promotionalMoney,

      // countUsers,
      numberOfDays,
      // userCreatorsId,
      status,
      questions
    } = req.body;
    const district = {
      courseGroupsPackagesName,
      courseGroupsId,

      money,
      promotionalMoney,

      // countUsers,
      numberOfDays,
      // userCreatorsId,
      status,
      questions
    };

    const SCHEMA = Object.assign(
      ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
        courseGroupsPackagesName: {
          max: 200
        }
      })
    );

    ValidateJoi.validate(district, SCHEMA)
      .then(data => {
        console.log('data  ', data);
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
      const {
        id,
        courseGroupsPackagesName,
        courseGroupsId,
        money,
        promotionalMoney,
        status,
        FromDate,
        ToDate
      } = JSON.parse(filter);
      const district = {
        id,
        courseGroupsPackagesName,
        courseGroupsId,
        money,
        promotionalMoney,
        status,
        FromDate,
        ToDate
      };

      // console.log(district)
      const SCHEMA = {
        id: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.courseGroupsPackages.id'],
          regex: regexPattern.listIds
        }),
        ...DEFAULT_SCHEMA,
        courseGroupsId: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.courseGroups.id'],
          regex: regexPattern.listIds
        }),
        userCreatorsId: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage.userCreatorsId,
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
      ValidateJoi.validate(district, SCHEMA)
        .then(data => {
          if (id) {
            ValidateJoi.transStringToArray(data, 'id');
          }
          if (courseGroupsId) {
            ValidateJoi.transStringToArray(data, 'courseGroupsId');
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
  authenUpdate_status: (req, res, next) => {
    // console.log("validate authenCreate")

    const { status } = req.body;
    const userGroup = { status };

    const SCHEMA = {
      status: ValidateJoi.createSchemaProp({
        number: noArguments,
        required: noArguments,
        label: viMessage.status
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
