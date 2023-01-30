import ValidateJoi, { noArguments } from '../utils/validateJoi';
import viMessage from '../locales/vi';

import regexPattern from '../utils/regexPattern';
import { parseSort } from '../utils/helper';

const DEFAULT_SCHEMA = {
  courseGroupsName: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.courseGroups.courseGroupsName']
  }),
  level: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage['api.courseGroups.level'],
    allow: [null]
  }),
  courseGroupsCode: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.courseGroups.courseGroupsCode'],
    allow: [null, '']
  }),
  courseTypesId: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage['api.courseTypes.id']
  }),
  descriptions: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.courseGroups.descriptions'],
    allow: [null, '']
  }),
  age: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: 'age',
    allow: [null, '']
  }),
  image: ValidateJoi.createSchemaProp({
    object: noArguments,
    label: viMessage['api.courseGroups.image'],
    allow: [null]
  }),
  type: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage['api.courseGroups.type'],
    allow: [null]
  }),
  money: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage['api.courseGroups.money'],
    allow: [null]
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

const COURSEGROUPSPACKAGES_SCHEMA = ValidateJoi.createArraySchema({
  id: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.courseGroupsPackages.id']
  }),

  courseGroupsPackagesName: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.courseGroupsPackages.courseGroupsPackagesName']
  }),

  money: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage['api.courseGroupsPackages.money'],
    allow: [null],
    required: true
  }),
  promotionalMoney: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage['api.courseGroupsPackages.promotionalMoney'],
    allow: [null]
  }),
  numberOfDays: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage['api.courseGroupsPackages.numberOfDays'],
    allow: [null]
  }),

  status: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage.status
  })
});

export default {
  authenCreate: (req, res, next) => {
    // console.log("validate authenCreate")
    const userCreatorsId = req.auth.userId;

    const {
      courseGroupsName,
      level,
      courseTypesId,
      image,
      courseGroupsCode,
      type,
      descriptions,
      // countUsers,
      money,
      // userCreatorsId,
      status,
      courseGroupsPackages,
      age
    } = req.body;
    const district = {
      courseGroupsName,
      level,
      courseTypesId,
      image,
      courseGroupsCode,
      type,
      descriptions,
      // countUsers,
      money,
      userCreatorsId,
      status,
      courseGroupsPackages,
      age
    };

    const SCHEMA = Object.assign(
      ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
        courseGroupsName: {
          min: 1,
          max: 200,
          required: noArguments
        },
        courseTypesId: {
          required: noArguments
        },
        status: {
          required: noArguments
        }
      }),
      { courseGroupsPackages: COURSEGROUPSPACKAGES_SCHEMA }
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
      courseGroupsName,
      level,
      courseTypesId,
      image,
      courseGroupsCode,
      type,
      descriptions,
      // countUsers,
      money,
      // userCreatorsId,
      status,
      courseGroupsPackages,
      age
    } = req.body;
    const district = {
      courseGroupsName,
      level,
      courseTypesId,
      image,
      courseGroupsCode,
      type,
      descriptions,
      // countUsers,
      money,
      // userCreatorsId,
      status,
      courseGroupsPackages,
      age
    };

    const SCHEMA = Object.assign(
      ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
        courseGroupsName: {
          max: 200
        }
      }),
      { courseGroupsPackages: COURSEGROUPSPACKAGES_SCHEMA }
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
        courseGroupsName,
        level,
        courseTypesId,
        image,
        courseGroupsCode,
        type,
        descriptions,
        status,
        FromDate,
        ToDate,
        usersId,
        bookmark,
        purchased,
        purchasedUsersId,
        viewCompleted,
        questionCompleted,
        FromMoney,
        ToMoney,
        countCoursesStatus,
        courseGroupsPackagesStatus,
        userCreatorsId
      } = JSON.parse(filter);
      const district = {
        id,
        courseGroupsName,
        level,
        courseTypesId,
        image,
        courseGroupsCode,
        type,
        descriptions,
        status,
        FromDate,
        ToDate,
        usersId,
        bookmark,
        purchased,
        viewCompleted,
        questionCompleted,
        purchasedUsersId: purchasedUsersId || usersId,
        FromMoney,
        ToMoney,
        countCoursesStatus,
        courseGroupsPackagesStatus,
        userCreatorsId
      };

      console.log('district', district);
      // console.log(district)
      const SCHEMA = {
        id: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.courseGroups.id'],
          regex: regexPattern.listIds
        }),
        ...DEFAULT_SCHEMA,
        courseTypesId: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.courseTypes.id'],
          regex: regexPattern.listIds
        }),
        countCoursesStatus: ValidateJoi.createSchemaProp({
          number: noArguments,
          label: '1: khóa học có bài giảng'
        }),
        courseGroupsPackagesStatus: ValidateJoi.createSchemaProp({
          number: noArguments,
          label: '1: phải có ít nhất 1 gói'
        }),
        usersId: ValidateJoi.createSchemaProp({
          number: noArguments,
          label: viMessage.usersId
        }),
        purchasedUsersId: ValidateJoi.createSchemaProp({
          number: noArguments,
          label: viMessage.usersId
        }),
        bookmark: ValidateJoi.createSchemaProp({
          number: noArguments,
          label: '1 : lấy những khóa học đã theo dõi'
        }),
        viewCompleted: ValidateJoi.createSchemaProp({
          number: noArguments,
          label: '1 : đã xem hết , -1: chưa xem hết, 0: cả 2'
        }),
        questionCompleted: ValidateJoi.createSchemaProp({
          number: noArguments,
          label: '1 : đã làm hết , -1: chưa làm hết, 0: cả 2'
        }),
        purchased: ValidateJoi.createSchemaProp({
          number: noArguments,
          label: '1 : lấy những khóa học đã theo dõi'
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
        }),

        FromMoney: ValidateJoi.createSchemaProp({
          date: noArguments,
          label: 'FromMoney'
        }),
        ToMoney: ValidateJoi.createSchemaProp({
          date: noArguments,
          label: 'ToMoney'
        })
      };

      // console.log('input: ', input);
      ValidateJoi.validate(district, SCHEMA)
        .then(data => {
          if (id) {
            ValidateJoi.transStringToArray(data, 'id');
          }
          if (courseTypesId) {
            ValidateJoi.transStringToArray(data, 'courseTypesId');
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
