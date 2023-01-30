import viMessage from '../locales/vi';
import { parseSort } from '../utils/helper';
import regexPattern from '../utils/regexPattern';
import ValidateJoi, { noArguments } from '../utils/validateJoi';
const DEFAULT_SCHEMA = {
  questionsName: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.questions.questionsName']
  }),
  order: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage['api.questions.order']
  }),
  exercisesId: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage['api.exercises.id'],
    allow: [null]
  })
};

const QUESTIONSSUGGESTIONS_SCHEMA = ValidateJoi.createArraySchema({
  questionSuggestionsName: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.questionSuggestions.questionSuggestionsName']
  }),
  correctAnswer: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage['api.questionSuggestions.correctAnswer'],
    required: noArguments
  })
});

export default {
  authenCreate: (req, res, next) => {
    console.log('validate authenCreate');

    const { questionsName, exercisesId, order, questionSuggestions } = req.body;
    const province = {
      questionsName,
      exercisesId,
      order,
      questionSuggestions
    };

    const SCHEMA = Object.assign(
      ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
        questionsName: {
          max: 200,
          required: noArguments
        },
        exercisesId: {
          required: noArguments
        }
      }),
      {
        questionSuggestions: QUESTIONSSUGGESTIONS_SCHEMA
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

  authenUpdate: (req, res, next) => {
    console.log('validate authenUpdate');

    const { questionsName, exercisesId, order, questionSuggestions } = req.body;
    const province = { questionsName, exercisesId, order, questionSuggestions };

    const SCHEMA = Object.assign(
      ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
        questionsName: {
          max: 200
        }
      }),
      {
        questionSuggestions: QUESTIONSSUGGESTIONS_SCHEMA
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

    const { exercisesId, dateUpdated } = req.body;
    const userGroup = { exercisesId, dateUpdated, usersCreatorsId };

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

    const currentUserId = req.query.userId;

    res.locals.sort = parseSort(sort);
    res.locals.range = range ? JSON.parse(range) : [0, 49];
    res.locals.attributes = attributes;
    if (filter) {
      const { id, questionsName, usersId, type, exercisesId } = JSON.parse(filter);
      const province = { id, questionsName, type, usersId: usersId || currentUserId, exercisesId };

      console.log(province);
      const SCHEMA = {
        id: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.questions.id'],
          regex: regexPattern.listIds
        }),

        ...DEFAULT_SCHEMA,
        usersId: ValidateJoi.createSchemaProp({
          number: noArguments,
          label: 'usersId'
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
