/* eslint-disable camelcase */
// import moment from 'moment'
import MODELS from '../models/models';
import models from '../entity/index';
import _ from 'lodash';
import * as ApiErrors from '../errors';
import ErrorHelpers from '../helpers/errorHelpers';
import filterHelpers from '../helpers/filterHelpers';
// import preCheckHelpers, { TYPE_CHECK } from '../helpers/preCheckHelpers';

const {
  sequelize,
  // users,
  questions,
  // courses,
  questionSuggestions,
  doQuestions,
  exercises
  /* tblGatewayEntity, Roles */
} = models;

export default {
  get_list: param =>
    new Promise(async (resolve, reject) => {
      try {
        const { filter, range, sort, attributes } = param;

        let whereFilter = _.omit(filter, ['usersId', 'questionCompleted']);
        const att = filterHelpers.atrributesHelper(attributes);

        console.log('filter', filter);
        try {
          whereFilter = filterHelpers.combineFromDateWithToDate(whereFilter);
        } catch (error) {
          reject(error);
        }

        const perPage = range[1] - range[0] + 1;
        const page = Math.floor(range[0] / perPage);

        whereFilter = await filterHelpers.makeStringFilterRelatively(['questionsName'], whereFilter, 'questions');

        if (!whereFilter) {
          whereFilter = { ...filter };
        }

        const include = [];

        if (filter.usersId > 0) {
          include.push({
            model: doQuestions,
            as: 'doQuestions',
            required: false,

            where: {
              usersId: filter.usersId
            }
          });
        }
        MODELS.findAndCountAll(questions, {
          where: whereFilter,
          order: sort,
          attributes: att,
          offset: range[0],
          limit: perPage,
          distinct: true,
          logging: true,
          include: [
            {
              model: questionSuggestions,
              as: 'questionSuggestions',
              required: false
            },
            ...include
          ]
        })
          .then(result => {
            // console.log('re', result);

            resolve({
              ...result,
              page: page + 1,
              perPage
            });
          })
          .catch(err => {
            console.log('Err', err);
            reject(ErrorHelpers.errorReject(err, 'getListError', 'questionservice'));
          });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'getListError', 'questionservice'));
      }
    }),

  get_one: param =>
    new Promise((resolve, reject) => {
      try {
        // console.log("Menu Model param: %o | id: ", param, param.id)
        const id = param.id;
        const att = filterHelpers.atrributesHelper(param.attributes, ['usersCreatorId']);

        console.log('att', att);
        MODELS.findOne(questions, {
          where: { id: id },
          attributes: att,
          logging: true,
          include: [
            {
              model: questionSuggestions,
              as: 'questionSuggestions',
              required: false
            }
          ]
        })
          .then(result => {
            if (!result) {
              reject(
                new ApiErrors.BaseError({
                  statusCode: 202,
                  type: 'crudNotExisted'
                })
              );
            }

            resolve(result);
          })
          .catch(err => {
            reject(ErrorHelpers.errorReject(err, 'getInfoError', 'questionservice'));
          });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'getInfoError', 'questionservice'));
      }
    }),
  create: async param => {
    let finnalyResult;

    try {
      const entity = param.entity;

      console.log('provinceModel create: ', entity);

      await sequelize.transaction(async t => {
        finnalyResult = await MODELS.create(questions, entity, { transaction: t }).catch(error => {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'crudError',
            error
          });
        });

        if (entity.questionSuggestions && entity.questionSuggestions.length > 0) {
          await MODELS.bulkCreate(
            questionSuggestions,
            entity.questionSuggestions.map(e => {
              return {
                ...e,
                questionsId: finnalyResult.id
              };
            }),

            { transaction: t }
          );
        }
        await MODELS.update(
          exercises,
          {
            countQuestions: sequelize.literal(
              `(select count(questions.id) from questions where questions.exercisesId = ${finnalyResult.id}  )`
            ),
            countQuestionsStatus: 1
          },

          { where: { id: finnalyResult.exercisesId }, transaction: t }
        );
        // await setting_questions(finnalyResult.id, entity.questions, t);
      });
      if (!finnalyResult) {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudInfo'
        });
      }
    } catch (error) {
      console.log('err', error);
      ErrorHelpers.errorThrow(error, 'crudError', 'questionservice');
    }

    return { result: finnalyResult };
  },

  update: async param => {
    let finnalyResult;

    try {
      const entity = param.entity;

      console.log('Province update: ');

      const foundProvince = await MODELS.findOne(questions, {
        where: {
          id: param.id
        },
        include: [
          {
            model: questionSuggestions,
            as: 'questionSuggestions',
            required: false
          }
        ]
      }).catch(error => {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'getInfoError',
          message: 'Lấy thông tin của Tỉnh/Thành phố thất bại!',
          error
        });
      });

      if (foundProvince) {
        await sequelize.transaction(async t => {
          await MODELS.update(
            questions,
            { ...entity, dateUpdated: new Date() },
            { where: { id: Number(param.id) }, transaction: t }
          ).catch(error => {
            console.log('e', error);
            throw new ApiErrors.BaseError({
              statusCode: 202,
              type: 'crudError',
              error
            });
          });

          finnalyResult = await MODELS.findOne(questions, { where: { id: param.id }, transaction: t }).catch(error => {
            throw new ApiErrors.BaseError({
              statusCode: 202,
              type: 'crudInfo',
              message: 'Lấy thông tin sau khi thay đổi thất bại',
              error
            });
          });

          {
            entity.questionSuggestions = entity.questionSuggestions || [];

            const oldquestionSuggestions = foundProvince.questionSuggestions
              ? JSON.parse(JSON.stringify(foundProvince.questionSuggestions))
              : [];

            const newquestionSuggestions = entity.questionSuggestions;
            const updatequestionSuggestions = [];
            const deletequestionSuggestionsId = [];

            console.log('oldquestionSuggestions', oldquestionSuggestions);
            console.log('newquestionSuggestions', newquestionSuggestions);
            oldquestionSuggestions.forEach(oldAtt => {
              const findquestionSuggestions = newquestionSuggestions.find(
                newAtt => oldAtt.questionSuggestionsName === newAtt.questionSuggestionsName
              );

              if (findquestionSuggestions) {
                findquestionSuggestions.findStatus = true;
                if (Number(oldAtt.correctAnswer) !== Number(findquestionSuggestions.correctAnswer)) {
                  updatequestionSuggestions.push({
                    id: oldAtt.id,
                    attributeSuggestionsId: findquestionSuggestions.attributeSuggestionsId,
                    correctAnswer: findquestionSuggestions.correctAnswer
                  });
                }
              } else {
                deletequestionSuggestionsId.push(oldAtt.id);
              }
            });

            const createquestionSuggestions = newquestionSuggestions.filter(e => !e.findStatus);

            console.log('deletequestionSuggestionsId', deletequestionSuggestionsId);
            console.log('createquestionSuggestions', createquestionSuggestions);
            console.log('updatequestionSuggestions', updatequestionSuggestions);

            if (deletequestionSuggestionsId.length > 0) {
              await MODELS.destroy(questionSuggestions, {
                where: {
                  id: { $in: deletequestionSuggestionsId }
                },
                transaction: t
              }).catch(e => {
                console.log('e1');
                throw e;
              });
            }

            if (createquestionSuggestions.length > 0) {
              await MODELS.bulkCreate(
                questionSuggestions,
                createquestionSuggestions.map(e => {
                  return {
                    ...e,
                    questionSuggestionsName: e.questionSuggestionsName,
                    questionsId: foundProvince.id
                  };
                }),
                {
                  transaction: t
                }
              ).catch(e => {
                console.log('e2');
                throw e;
              });
            }

            if (updatequestionSuggestions.length > 0) {
              await Promise.all(
                updatequestionSuggestions.map(async updateElement => {
                  await MODELS.update(
                    questionSuggestions,
                    {
                      correctAnswer: updateElement.correctAnswer
                    },
                    {
                      where: {
                        id: updateElement.id
                      },
                      transaction: t
                    }
                  );
                })
              ).catch(e => {
                console.log('e3');
                throw e;
              });
            }
          }

          await MODELS.update(
            exercises,
            {
              countQuestions: sequelize.literal(
                `(select count(questions.id) from questions where questions.exercisesId = ${finnalyResult.id}  )`
              ),
              countQuestionsStatus: 1
            },

            { where: { id: finnalyResult.exercisesId }, transaction: t }
          );
          if (!finnalyResult) {
            throw new ApiErrors.BaseError({
              statusCode: 202,
              type: 'crudInfo',
              message: 'Lấy thông tin sau khi thay đổi thất bại'
            });
          }
        });
      } else {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudNotExisted'
        });
      }
    } catch (error) {
      ErrorHelpers.errorThrow(error, 'crudError', 'questionservice');
    }

    return { result: finnalyResult };
  },

  delete: async param => {
    try {
      console.log('Province update: ');

      const foundProvince = await MODELS.findOne(questions, {
        where: {
          id: param.id
        }
      }).catch(error => {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'getInfoError',
          message: 'Không tồn tại câu hỏi này',
          error
        });
      });

      if (foundProvince) {
        await sequelize.transaction(async t => {
          await MODELS.destroy(questionSuggestions, {
            where: {
              questionsId: param.id
            },
            transaction: t
          });
          await MODELS.destroy(doQuestions, {
            where: {
              questionsId: param.id
            },
            transaction: t
          });
        });
      } else {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudNotExisted'
        });
      }
    } catch (error) {
      ErrorHelpers.errorThrow(error, 'crudError', 'questionservice');
    }

    return { result: { success: true } };
  }
};
