import ValidateJoi, { noArguments } from '../utils/validateJoi';
import viMessage from '../locales/vi';

import regexPattern from '../utils/regexPattern';
import { parseSort } from '../utils/helper';

const DEFAULT_SCHEMA = {
  money: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage['api.purchasedCourseGroups.money']
  }),
  courseGroupsPackagesId: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.courseGroupsPackages.id']
  }),
  courseGroupsId: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.courseGroups.id']
  }),
  code: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.purchasedCourseGroups.code']
  }),

  usersId: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.users.id']
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

const DETAILS_SCHEMA = ValidateJoi.createArraySchema({
  servicesId: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.services.id']
  }),
  money: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage['api.purchasedCourseGroups.money']
  })
});

export default {
  authenCreate: (req, res, next) => {
    // console.log("validate authenCreate")
    const userCreatorsId = req.auth.userId;

    const {
      // money,
      purchasedCourseGroupsDetails,
      usersId,
      courseGroupsPackagesId,
      courseGroupsId,
      // userCreatorsId,
      status
    } = req.body;
    const district = {
      // money,
      purchasedCourseGroupsDetails,
      usersId,
      userCreatorsId,
      status,
      courseGroupsPackagesId,
      courseGroupsId
    };

    const SCHEMA = Object.assign(
      ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
        status: {
          required: noArguments
        },
        courseGroupsPackagesId: {
          required: noArguments
        },
        usersId: {
          required: noArguments
        }
      }),
      { purchasedCourseGroupsDetails: DETAILS_SCHEMA }
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
    const userCreatorsId = req.auth.userId;

    const {
      // money,
      usersId,
      courseGroupsPackagesId,
      courseGroupsId,
      // userCreatorsId,
      status,
      purchasedCourseGroupsDetails
    } = req.body;
    const district = {
      // money,
      usersId,
      courseGroupsPackagesId,
      courseGroupsId,
      userCreatorsId,
      status,
      purchasedCourseGroupsDetails
    };

    const SCHEMA = Object.assign(ValidateJoi.assignSchema(DEFAULT_SCHEMA, {}), {
      purchasedCourseGroupsDetails: DETAILS_SCHEMA
    });

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
        money,
        code,

        courseGroupsPackagesId,
        courseGroupsId,
        servicesId,
        usersId,
        usersSearch,
        courseGroupsSearch,
        courseGroupsName,
        courseGroupsCode,
        fullname,
        usersCode,
        status,
        FromDate,
        ToDate
      } = JSON.parse(filter);
      const district = {
        id,
        money,
        code,
        courseGroupsPackagesId,
        usersId,
        usersSearch,
        courseGroupsSearch,
        courseGroupsName,
        courseGroupsCode,
        fullname,
        usersCode,
        status,
        courseGroupsId,
        servicesId,
        FromDate,
        ToDate
      };

      // console.log(district)
      const SCHEMA = {
        id: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.purchasedCourseGroups.id'],
          regex: regexPattern.listIds
        }),
        ...DEFAULT_SCHEMA,

        usersSearch: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: 'search'
        }),
        courseGroupsSearch: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: 'search'
        }),
        courseGroupsName: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: 'search'
        }),
        courseGroupsCode: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: 'search'
        }),
        fullname: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: 'search'
        }),
        usersCode: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: 'search'
        }),
        courseGroupsPackagesId: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.courseGroupsPackages.id'],
          regex: regexPattern.listIds
        }),
        courseGroupsId: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.courseGroups.id'],
          regex: regexPattern.listIds
        }),
        servicesId: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.services.id'],
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
          if (courseGroupsPackagesId) {
            ValidateJoi.transStringToArray(data, 'courseGroupsPackagesId');
          }
          if (courseGroupsId) {
            ValidateJoi.transStringToArray(data, 'courseGroupsId');
          }
          if (servicesId) {
            ValidateJoi.transStringToArray(data, 'servicesId');
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
    const userCreatorsId = req.auth.userId;

    const { status } = req.body;
    const userGroup = { status, userCreatorsId };

    const SCHEMA = {
      status: ValidateJoi.createSchemaProp({
        number: noArguments,
        required: noArguments,
        label: viMessage.status
      }),
      userCreatorsId: ValidateJoi.createSchemaProp({
        number: noArguments,
        required: noArguments,
        label: viMessage.userCreatorsId
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
