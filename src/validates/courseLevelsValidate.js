import ValidateJoi, { noArguments } from '../utils/validateJoi';
import viMessage from '../locales/vi';

import regexPattern from '../utils/regexPattern';
import { parseSort } from '../utils/helper';

const DEFAULT_SCHEMA = {
  courseLevelsName: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.courseLevels.courseLevelsName']
  }),

  order: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage['api.courseLevels.order'],
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

const QUESTIONS_SCHEMA = ValidateJoi.createArraySchema({
  id: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage['api.questions.id']
  }),
  flag: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: '1 Thêm /sửa . -1  xóa'
  }),
  questionsName: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.questions.questionsName']
  }),
  order: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage['api.questions.order']
  }),
  questionSuggestions: ValidateJoi.createSchemaProp({
    array: noArguments,
    label: viMessage['api.questions.order']
  })
});

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
  authenUpdateOrder: (req, res, next) => {
    // console.log("validate authenCreate")

    const { courseLevels } = req.body;
    const district = {
      courseLevels
    };

    const SCHEMA = Object.assign(
      ValidateJoi.assignSchema(
        {
          courseLevels: ValidateJoi.createSchemaProp({
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
  authenCreate: (req, res, next) => {
    // console.log("validate authenCreate")
    const userCreatorsId = req.auth.userId;

    const {
      courseLevelsName,
      courseGroupsId,

      order,

      // countUsers,
      money,
      // userCreatorsId,
      status,
      questions
    } = req.body;
    const district = {
      courseLevelsName,
      courseGroupsId,

      order,

      // countUsers,
      money,
      userCreatorsId,
      status,
      questions
    };

    const SCHEMA = Object.assign(
      ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
        courseLevelsName: {
          min: 1,
          max: 200,
          required: noArguments
        },
        courseGroupsId: {
          required: noArguments
        },
        status: {
          required: noArguments
        }
      }),
      { questions: QUESTIONS_SCHEMA }
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
      courseLevelsName,
      courseGroupsId,
      order,

      // countUsers,
      money,
      // userCreatorsId,
      status,
      questions
    } = req.body;
    const district = {
      courseLevelsName,
      courseGroupsId,

      order,

      // countUsers,
      money,
      // userCreatorsId,
      status,
      questions
    };

    const SCHEMA = Object.assign(
      ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
        courseLevelsName: {
          max: 200
        }
      }),
      { questions: QUESTIONS_SCHEMA }
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
        courseLevelsName,
        courseGroupsId,

        order,

        status,
        FromDate,
        ToDate,
        usersId,
        viewCompleted,
        questionCompleted
      } = JSON.parse(filter);
      const district = {
        id,
        courseLevelsName,
        courseGroupsId,
        order,

        status,
        usersId,
        FromDate,
        ToDate,
        viewCompleted,
        questionCompleted
      };

      // console.log(district)
      const SCHEMA = {
        id: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.courseLevels.id'],
          regex: regexPattern.listIds
        }),
        ...DEFAULT_SCHEMA,
        courseGroupsId: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.courseGroups.id'],
          regex: regexPattern.listIds
        }),
        usersId: ValidateJoi.createSchemaProp({
          number: noArguments,
          label: viMessage.usersId
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
