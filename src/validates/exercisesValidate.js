import viMessage from '../locales/vi';
import { parseSort } from '../utils/helper';
import regexPattern from '../utils/regexPattern';
import ValidateJoi, { noArguments } from '../utils/validateJoi';
const DEFAULT_SCHEMA = {
  exercisesName: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.exercises.exercisesName']
  }),

  descriptions: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.exercises.descriptions'],
    allow: [null, '']
  }),
  order: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage['api.exercises.order']
  }),
  time: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage['api.exercises.time'],
    allow: [null]
  }),
  courseLevelsId: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage['api.courseLevels.id'],
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
  }),
  type: ValidateJoi.createSchemaProp({
    number: noArguments,
    allow: [0]
  }),
  linkVideo: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.questions.linkvideo'],
    allow: [null]
  }),
  files: ValidateJoi.createSchemaProp({
    array: noArguments,
    label: viMessage['api.questions.files'],
    allow: [null]
  })
};

const QUESTIONS_SCHEMA = ValidateJoi.createArraySchema({
  questionsName: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.questions.questionsName'],
    required: noArguments
  }),
  id: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage['api.questions.id'],
    required: noArguments
  }),
  flag: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: 'flag: 1 thêm/sửa , :-1 xóa',
    required: noArguments
  }),
  order: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage['api.questions.order'],
    required: noArguments
  }),
  type: ValidateJoi.createSchemaProp({
    number: noArguments
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
  authenCreate: (req, res, next) => {
    console.log('validate authenCreate');
    const userCreatorsId = req.auth.userId;

    const {
      exercisesName,
      descriptions,
      courseLevelsId,
      order,
      time,
      questions,
      status,
      type,
      linkVideo,
      files
    } = req.body;
    const province = {
      exercisesName,
      descriptions,

      courseLevelsId,
      type,
      order,
      time,
      questions,
      userCreatorsId,
      status,
      linkVideo,
      files
    };

    const SCHEMA = Object.assign(
      ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
        exercisesName: {
          max: 200,
          required: noArguments
        },
        courseLevelsId: {
          required: noArguments
        }
      }),
      {
        questions: QUESTIONS_SCHEMA
      }
    );

    // console.log('input: ', input);
    ValidateJoi.validate(province, SCHEMA)
      .then(data => {
        res.locals.body = data;
        next();
      })
      .catch(error => next({ ...error, message: 'Định dạng gửi đi không đúng' }));
  },

  authenUpdateOrder: (req, res, next) => {
    // console.log("validate authenCreate")

    const { exercises } = req.body;
    const district = {
      exercises
    };

    const SCHEMA = Object.assign(
      ValidateJoi.assignSchema(
        {
          exercises: ValidateJoi.createSchemaProp({
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
    console.log('validate authenUpdate');

    const {
      exercisesName,
      descriptions,
      courseLevelsId,
      order,
      time,
      questions,
      status,
      type,
      linkVideo,
      files
    } = req.body;
    const province = {
      exercisesName,
      descriptions,
      courseLevelsId,
      order,
      time,
      questions,
      status,
      type,
      linkVideo,
      files
    };

    const SCHEMA = Object.assign(
      ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
        exercisesName: {
          max: 200
        }
      }),
      {
        questions: QUESTIONS_SCHEMA
      }
    );

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

    const { courseLevelsId, dateUpdated, status, linkVideo, files } = req.body;
    const userGroup = { courseLevelsId, dateUpdated, usersCreatorsId, status, linkVideo, files };

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
    const { filter, sort, range, attributes, linkVideo, files } = req.query;

    res.locals.sort = parseSort(sort);
    res.locals.range = range ? JSON.parse(range) : [0, 49];
    res.locals.attributes = attributes;
    if (filter) {
      const {
        id,
        exercisesName,
        descriptions,
        usersId,
        courseLevelsId,
        questionCompleted,
        courseGroupsId,
        status,
        type,
        purchased,
        countQuestionsStatus,
        doQuestionsHistories
      } = JSON.parse(filter);
      const province = {
        id,
        exercisesName,
        descriptions,
        usersId: usersId,
        courseLevelsId,
        questionCompleted,
        courseGroupsId,
        status,
        purchased,
        countQuestionsStatus,
        doQuestionsHistories,
        type,
        linkVideo,
        files
      };

      console.log(province);
      const SCHEMA = {
        id: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.exercises.id'],
          regex: regexPattern.listIds
        }),

        doQuestionsHistories: ValidateJoi.createSchemaProp({
          number: noArguments,
          label: '1: đã từng làm bài'
        }),
        ...DEFAULT_SCHEMA,
        usersId: ValidateJoi.createSchemaProp({
          number: noArguments,
          label: 'usersId'
        }),
        purchased: ValidateJoi.createSchemaProp({
          number: noArguments,
          label: 'purchased'
        }),
        questionCompleted: ValidateJoi.createSchemaProp({
          number: noArguments,
          label: '1 : đã làm hết , -1: chưa làm hết, 0: cả 2'
        }),
        courseGroupsId: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.courseGroups.id'],
          regex: regexPattern.listIds
        }),
        countQuestionsStatus: ValidateJoi.createSchemaProp({
          number: noArguments,
          label: '1: khóa học có bài giảng'
        }),
        courseLevelsId: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.courseLevels.id'],
          regex: regexPattern.listIds
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
      ValidateJoi.validate(province, SCHEMA)
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
          console.log('locals.filter', res.locals.filter);
          next();
        })
        .catch(error => {
          console.log('err', error);
          next({ ...error, message: 'Định dạng gửi đi không đúng' });
        });
    } else {
      res.locals.filter = {};
      next();
    }
  }
};
