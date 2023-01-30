import ValidateJoi, { noArguments } from '../utils/validateJoi';
import viMessage from '../locales/vi';

import regexPattern from '../utils/regexPattern';
import { parseSort } from '../utils/helper';

const DEFAULT_SCHEMA = {
  courseGroupsId: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage['api.courseGroups.id']
  }),
  usersId: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage['api.users.id']
  }),
  teachersId: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.users.id']
  }),
  servicesId: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage['api.services.id']
  })
};

export default {
  authenCreate: (req, res, next) => {
    // console.log("validate authenCreate")

    const {
      // money,
      teachersId,
      usersId,
      servicesId,
      courseGroupsId
      // userCreatorsId,
    } = req.body;
    const district = {
      // money,
      teachersId,
      usersId,
      servicesId,
      courseGroupsId
    };

    const SCHEMA = Object.assign(
      ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
        courseGroupsId: {
          required: noArguments
        },
        servicesId: {
          required: noArguments
        },
        usersId: {
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
      // money,
      teachersId,
      usersId,
      servicesId,
      courseGroupsId
    } = req.body;
    const district = {
      // money,
      usersId,
      teachersId,
      servicesId,
      courseGroupsId
    };

    const SCHEMA = Object.assign(
      ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
        courseGroupsId: {
          required: noArguments
        },
        servicesId: {
          required: noArguments
        },
        usersId: {
          required: noArguments
        },
        teachersId: {
          required: noArguments
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
      const { id, usersId, teachersId, servicesId, courseGroupsId, checkTime } = JSON.parse(filter);
      const district = {
        id,
        usersId,
        teachersId,
        checkTime,
        servicesId,
        courseGroupsId
      };

      // console.log(district)
      const SCHEMA = {
        id: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.purchasedCourseGroups.id'],
          regex: regexPattern.listIds
        }),
        checkTime: ValidateJoi.createSchemaProp({
          number: noArguments,
          label: '1: chỉ lấy những dịch vụ đi kèm khóa học còn hạn'
        }),
        ...DEFAULT_SCHEMA
      };

      // console.log('input: ', input);
      ValidateJoi.validate(district, SCHEMA)
        .then(data => {
          if (id) {
            ValidateJoi.transStringToArray(data, 'id');
          }
          if (usersId) {
            ValidateJoi.transStringToArray(data, 'usersId');
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
  }
};
