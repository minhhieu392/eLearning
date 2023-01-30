import ValidateJoi, { noArguments } from '../utils/validateJoi';
import viMessage from '../locales/vi';

import regexPattern from '../utils/regexPattern';
import { parseSort } from '../utils/helper';

const DEFAULT_SCHEMA = {
  usersId: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage['api.users.id']
  }),
  exercisesId: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage['api.exercises.id']
  })
};

const DOQUESTIONS_SCHEMA = ValidateJoi.createArraySchema({
  questionsId: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage['api.questions.id']
  }),
  questionSuggestionsId: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage['api.questionSuggestions.id']
  })
});

export default {
  authenCreate: (req, res, next) => {
    // console.log("validate authenCreate")
    const userCreatorsId = req.auth.userId;

    const { doQuestions, exercisesId } = req.body;
    const district = {
      usersId: userCreatorsId,
      doQuestions,
      exercisesId
    };

    const SCHEMA = Object.assign(
      ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
        exercisesId: {
          required: noArguments
        }
      }),
      {
        doQuestions: DOQUESTIONS_SCHEMA
      }
    );

    // console.log('input: ', input);
    ValidateJoi.validate(district, SCHEMA)
      .then(data => {
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
      const { usersId, exercisesId, courseGroupsId, FromDate, ToDate } = JSON.parse(filter);
      const district = {
        usersId,
        exercisesId,
        courseGroupsId,
        FromDate,
        ToDate
      };

      // console.log(district)
      const SCHEMA = {
        id: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.exercises.id'],
          regex: regexPattern.listIds
        }),
        ...DEFAULT_SCHEMA,
        courseGroupsId: ValidateJoi.createSchemaProp({
          number: noArguments,
          label: viMessage['api.courseGroups.id']
        }),
        FromDate: ValidateJoi.createSchemaProp({
          date: noArguments,
          label: viMessage.FromDate
        }),
        ToDate: ValidateJoi.createSchemaProp({
          date: noArguments,
          label: viMessage.ToDate
        }),
        userCreatorsId: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage.userCreatorsId,
          regex: regexPattern.listIds
        })
      };

      // console.log('input: ', input);
      ValidateJoi.validate(district, SCHEMA)
        .then(data => {
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
