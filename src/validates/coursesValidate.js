import ValidateJoi, { noArguments } from '../utils/validateJoi';
import viMessage from '../locales/vi';

import regexPattern from '../utils/regexPattern';
import { parseSort } from '../utils/helper';

const DEFAULT_SCHEMA = {
  coursesName: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.courses.coursesName']
  }),

  descriptions: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.courses.descriptions'],
    allow: [null, '']
  }),
  image: ValidateJoi.createSchemaProp({
    object: noArguments,
    label: viMessage['api.courses.image'],
    allow: [null]
  }),

  order: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage['api.courses.order'],
    allow: [null, '']
  }),
  courseLevelsId: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage['api.courseLevels.id']
  }),
  videoLength: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage['api.courses.videoLength'],
    allow: [null]
  }),
  link: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.courses.link']
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

const ORDER_SCHEMA = ValidateJoi.createArraySchema({
  id: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage['api.questions.id'],
    required: noArguments
  }),

  order: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage['api.questions.order'],
    required: noArguments
  })
});

export default {
  authenCreate: (req, res, next) => {
    // console.log("validate authenCreate")
    const userCreatorsId = req.auth.userId;

    const {
      coursesName,
      descriptions,
      image,
      courseLevelsId,
      videoLength,

      order,
      // countUsers,
      link,
      // userCreatorsId,
      status
    } = req.body;
    const district = {
      coursesName,
      descriptions,
      image,
      courseLevelsId,
      videoLength,

      order,
      // countUsers,
      link,
      userCreatorsId,
      status
    };

    const SCHEMA = Object.assign(
      ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
        coursesName: {
          min: 1,
          max: 200,
          required: noArguments
        },
        courseLevelsId: {
          required: noArguments
        },
        status: {
          required: noArguments
        }
      }),
      {}
    );

    // console.log('input: ', input);
    ValidateJoi.validate(district, SCHEMA)
      .then(data => {
        res.locals.body = data;
        next();
      })
      .catch(error => next({ ...error, message: 'Định dạng gửi đi không đúng' }));
  },
  authenUpdateOrder: (req, res, next) => {
    // console.log("validate authenCreate")

    const { courses } = req.body;
    const district = {
      courses
    };

    const SCHEMA = Object.assign(
      ValidateJoi.assignSchema(
        {
          courses: ValidateJoi.createSchemaProp({
            array: noArguments,
            min: 1,
            label: 'Mảng id và order'
          })
        },
        {}
      ),
      { courses: ORDER_SCHEMA }
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
      coursesName,
      descriptions,
      image,
      courseLevelsId,
      videoLength,

      order,
      // countUsers,
      link,
      // userCreatorsId,
      status
    } = req.body;
    const district = {
      coursesName,
      descriptions,
      image,
      courseLevelsId,
      videoLength,

      order,
      // countUsers,
      link,
      // userCreatorsId,
      status
    };

    const SCHEMA = Object.assign(
      ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
        coursesName: {
          max: 200
        }
      }),
      {}
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
        coursesName,
        descriptions,
        image,
        courseLevelsId,
        videoLength,
        usersId,
        viewed,
        order,
        status,
        FromDate,
        ToDate,
        courseGroupsId
      } = JSON.parse(filter);
      const district = {
        id,
        coursesName,
        descriptions,
        image,
        courseLevelsId,
        videoLength,
        usersId,
        viewed,
        order,
        status,
        FromDate,
        ToDate,
        courseGroupsId
      };

      // console.log(district)
      const SCHEMA = {
        id: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.courses.id'],
          regex: regexPattern.listIds
        }),
        ...DEFAULT_SCHEMA,

        usersId: ValidateJoi.createSchemaProp({
          number: noArguments,
          label: viMessage.usersId
        }),
        courseGroupsId: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.courseGroups.id'],
          regex: regexPattern.listIds
        }),
        courseLevelsId: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.courseLevels.id'],
          regex: regexPattern.listIds
        }),
        viewCompleted: ValidateJoi.createSchemaProp({
          number: noArguments,
          label: '1 : đã xem hết , -1: chưa xem hết, 0: cả 2'
        }),
        questionCompleted: ValidateJoi.createSchemaProp({
          number: noArguments,
          label: '1 : đã làm hết , -1: chưa làm hết, 0: cả 2'
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
          if (courseLevelsId) {
            ValidateJoi.transStringToArray(data, 'courseLevelsId');
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
