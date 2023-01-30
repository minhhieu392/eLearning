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
  exercises,
  courseLevels,
  courseGroups,
  usersCourseGroups,
  doQuestionsHistories
  /* tblGatewayEntity, Roles */
} = models;

const create = async (exercisesId, listQuestion, transaction) => {
  const errorList = [];

  try {
    await Promise.all(
      listQuestion.map(async e => {
        const findQuestions = await MODELS.findOne(questions, {
          where: {
            exercisesId: exercisesId,
            $and: sequelize.literal(`lower(questionsName) like  CONVERT(lower("${e.questionsName}"), BINARY)`)
          },
          logging: true,
          transaction: transaction
        });

        if (findQuestions) {
          e.exercisesId = exercisesId;
          errorList.push({
            messageError: `Câu hỏi ${e.questionsName} chỉ được phép xuất hiện 1 lần trong 1 bài học ${e.exercisesId} `
          });
        } else {
          e.exercisesId = Number(exercisesId);
          delete e.id;

          await MODELS.create(questions, { ...e }, { transaction: transaction }).catch(err => {
            throw err;
          });
        }
      })
    );
  } catch (error) {
    ErrorHelpers.errorThrow(error, 'crudError', 'customerservices');
  }

  return { errorList: errorList };
};

const setting_questions = async (exercisesId, questionsList, transaction) => {
  console.log('questionsList', questionsList);
  if (questionsList && questionsList.length > 0) {
    await Promise.all(
      questionsList.map(async questionsElement => {
        let questionsResult;

        if (Number(questionsElement.flag) === 1) {
          if (Number(questionsElement.id) <= 0) {
            questionsResult = await MODELS.create(
              questions,
              {
                ..._.omit(questionsElement, ['id', 'flag', 'questionSuggestions']),
                exercisesId: exercisesId
              },
              { transaction: transaction }
            ).catch(err => {
              console.log('err1a', exercisesId, err);
              throw new ApiErrors.BaseError({
                statusCode: 202,
                message: 'Tạo thuộc tính xảy ra lỗi'
              });
            });

            if (questionsElement.questionSuggestions) {
              await MODELS.bulkCreate(
                questionSuggestions,
                questionsElement.questionSuggestions.map(questionSuggestionsElement => {
                  return {
                    ..._.omit(questionSuggestionsElement, ['id']),
                    questionsId: questionsResult.id
                  };
                }),
                {
                  transaction: transaction
                }
              ).catch(err => {
                console.log('err1b', err);
                throw new ApiErrors.BaseError({
                  statusCode: 202,
                  message: 'Tạo gợi ý đáp án xảy ra lỗi'
                });
              });
            }
          } else {
            console.log('b');
            questionsResult = await MODELS.findOne(questions, {
              transaction: transaction,
              where: {
                id: questionsElement.id,
                exercisesId: exercisesId
              },
              include: [
                {
                  model: questionSuggestions,
                  as: 'questionSuggestions'
                }
              ]
            }).catch(err => {
              console.log('err1c', err);
              throw new ApiErrors.BaseError({
                statusCode: 202,
                message: 'Tìm đáp án xảy ra lỗi'
              });
            });

            if (!questionsResult) {
              throw new ApiErrors.BaseError({
                statusCode: 202,
                message: 'Không tìm thấy đáp án'
              });
            } else {
              console.log('questionsElement', questionsElement);
              await MODELS.update(
                questions,
                {
                  ..._.omit(questionsElement, ['id', 'flag', 'questionSuggestions'])
                },
                { where: { id: questionsElement.id }, transaction: transaction }
              ).catch(err => {
                console.log('err1d', { id: questionsElement.id });
                console.log('err1d', err);
                throw new ApiErrors.BaseError({
                  statusCode: 202,
                  message: 'Cập nhật nhóm đáp án xảy ra lỗi'
                });
              });

              if (questionsElement.questionSuggestions) {
                const oldquestionSuggestions = questionsResult.questionSuggestions
                  ? JSON.parse(JSON.stringify(questionsResult.questionSuggestions))
                  : [];

                const newquestionSuggestions = questionsElement.questionSuggestions;
                const updatequestionSuggestions = [];
                const deletequestionSuggestionsId = [];

                oldquestionSuggestions.forEach(oldAtt => {
                  const findquestionSuggestions = newquestionSuggestions.find(
                    newAtt =>
                      oldAtt.questionSuggestionsName.trim().toLocaleLowerCase() ===
                      newAtt.questionSuggestionsName.trim().toLocaleLowerCase()
                  );

                  if (findquestionSuggestions) {
                    findquestionSuggestions.findStatus = true;
                    if (Number(oldAtt.correctAnswer) !== Number(findquestionSuggestions.correctAnswer)) {
                      updatequestionSuggestions.push({
                        id: oldAtt.id,
                        correctAnswer: findquestionSuggestions.correctAnswer
                      });
                    }
                  } else {
                    deletequestionSuggestionsId.push(oldAtt.id);
                  }
                });

                const createquestionSuggestions = newquestionSuggestions.filter(e => !e.findStatus);

                console.log('createquestionSuggestions', createquestionSuggestions);
                console.log('updatequestionSuggestions', updatequestionSuggestions);
                console.log('deletequestionSuggestionsId', deletequestionSuggestionsId);

                if (deletequestionSuggestionsId.length > 0) {
                  await MODELS.destroy(questionSuggestions, {
                    where: {
                      id: {
                        $in: deletequestionSuggestionsId
                      }
                    },
                    transaction: transaction
                  }).catch(err => {
                    console.log('err6', err);
                    throw new ApiErrors.BaseError({
                      statusCode: 202,
                      message: 'Xóa gợi ý đáp án thất bại'
                    });
                  });
                }

                if (createquestionSuggestions.length > 0) {
                  await MODELS.bulkCreate(
                    questionSuggestions,
                    createquestionSuggestions.map(questionSuggestionsElement => {
                      return {
                        ..._.omit(questionSuggestionsElement, ['id']),
                        questionsId: questionsResult.id
                      };
                    }),
                    {
                      transaction: transaction
                    }
                  ).catch(err => {
                    console.log('err1e', err);
                    throw new ApiErrors.BaseError({
                      statusCode: 202,
                      message: 'Tạo gợi ý đáp án xảy ra lỗi'
                    });
                  });
                }

                if (updatequestionSuggestions.length > 0) {
                  await Promise.all(
                    updatequestionSuggestions.map(async updateSuggestionsElement => {
                      await MODELS.update(
                        questionSuggestions,
                        {
                          correctAnswer: updateSuggestionsElement.correctAnswer
                        },
                        {
                          where: {
                            id: updateSuggestionsElement.id
                          },
                          transaction: transaction
                        }
                      );
                    })
                  );
                }
              }
            }
          }
        } else if (Number(questionsElement.flag) === -1) {
          questionsResult = await MODELS.findOne(questions, {
            transaction: transaction,
            where: {
              id: questionsElement.id,
              exercisesId: exercisesId
            }
          }).catch(err => {
            console.log('err1', err);
            throw new ApiErrors.BaseError({
              statusCode: 202,
              message: 'Tìm đáp án xảy ra lỗi'
            });
          });

          if (!questionsResult) {
            throw new ApiErrors.BaseError({
              statusCode: 202,
              message: `Không tìm thấy đáp án, đáp án có thể bị xóa trước đó (questions.id: ${questionsElement.id})`
            });
          }

          await MODELS.destroy(questions, {
            where: {
              id: questionsResult.id
            },
            transaction: transaction
          }).catch(err => {
            console.log('err4', err);
            throw new ApiErrors.BaseError({
              statusCode: 202,
              message: 'Xóa đáp án thất bại'
            });
          });
          await MODELS.destroy(doQuestions, {
            where: {
              questionsId: questionsResult.id
            },
            transaction: transaction
          }).catch(err => {
            console.log('err5', err);
            throw new ApiErrors.BaseError({
              statusCode: 202,
              message: 'Xóa đáp án thất bại'
            });
          });
          await MODELS.destroy(questionSuggestions, {
            where: {
              questionsId: questionsResult.id
            },
            transaction: transaction
          }).catch(err => {
            console.log('err6', err);
            throw new ApiErrors.BaseError({
              statusCode: 202,
              message: 'Xóa gợi ý thuộc tính thất bại'
            });
          });
        }
      })
    );
  }
};

export default {
  get_list: param =>
    new Promise(async (resolve, reject) => {
      try {
        const { filter, range, sort, attributes } = param;

        const whereCourseLevels = _.pick(filter, ['courseGroupsId']);
        let whereFilter = _.omit(filter, [
          'usersId',
          'questionCompleted',
          'courseGroupsId',
          'purchased',
          'doQuestionsHistories'
        ]);
        const att = filterHelpers.atrributesHelper(attributes);

        try {
          whereFilter = filterHelpers.combineFromDateWithToDate(whereFilter);
        } catch (error) {
          reject(error);
        }

        let parseResult = false;

        sort.unshift([sequelize.literal('`courseLevels.order`'), 'asc']);
        console.log('filter', filter, sort);

        if (att && att.length > 0) {
          const findIndexUsersDetailInfo = att.findIndex(e => e === 'usersDetailInfo');

          if (findIndexUsersDetailInfo > 0) {
            if (Number(filter.usersId) > 0) {
              att[findIndexUsersDetailInfo] = [
                sequelize.literal(`fn_get_exercises_users_detail(exercises.id,${filter.usersId})  `),
                'usersDetailInfo'
              ];
              parseResult = true;
            } else {
              att.splice(findIndexUsersDetailInfo, 1);
            }
          }
        }

        const perPage = range[1] - range[0] + 1;
        const page = Math.floor(range[0] / perPage);

        whereFilter = await filterHelpers.makeStringFilterRelatively(['exercisesName'], whereFilter, 'exercises');

        if (!whereFilter) {
          whereFilter = { ...filter };
        }

        const includeCourseGroups = [];
        const include = [];
        const whereCourseGroups = {};
        let query = '';

        if (filter.usersId > 0) {
          const where = { usersId: filter.usersId };

          whereCourseGroups.status = 1;

          if (Number(filter.purchased) === 1) {
            query = query
              ? query + ` and ` + ` (isnull(expiredDate) or expiredDate >= current_date()) `
              : ` (isnull(expiredDate) or expiredDate >= current_date()) `;
          }
          includeCourseGroups.push({
            model: usersCourseGroups,
            as: 'purchased',
            attributes: ['id', 'expiredDate'],
            required: Number(filter.purchased) === 1 ? true : false,
            where: where
          });

          if (Number(filter.doQuestionsHistories) === -1) {
            query = query ? query + ` and ` + ` isnull(doQuestionsHistories.id) ` : ` isnull(doQuestionsHistories.id) `;
          }

          include.push({
            model: doQuestionsHistories,
            as: 'doQuestionsHistories',
            attributes: ['id', 'dateCreated'],
            required: Number(filter.doQuestionsHistories) === 1 ? true : false,
            where: {
              usersId: filter.usersId
            },
            order: [['id', 'desc']]
          });
        }

        if (Number(filter.questionCompleted) === 1 && Number(filter.usersId) > 0) {
          whereFilter[`$and`] = sequelize.literal(`
               fn_get_count_correctQuestions_by_exercisesId(exercises.id, ${filter.usersId}) = exercises.countQuestions
          `);
          query = query
            ? query +
              ` and ` +
              `
               fn_get_count_correctQuestions_by_exercisesId(exercises.id, ${filter.usersId}) = exercises.countQuestions
          `
            : `
               fn_get_count_correctQuestions_by_exercisesId(exercises.id, ${filter.usersId}) = exercises.countQuestions
          `;
        }
        if (Number(filter.questionCompleted) === -1 && Number(filter.usersId) > 0) {
          query = query
            ? query +
              ` and ` +
              ` fn_get_count_correctQuestions_by_exercisesId(exercises.id, ${filter.usersId}) <> exercises.countQuestions `
            : ` fn_get_count_correctQuestions_by_exercisesId(exercises.id, ${filter.usersId}) <> exercises.countQuestions `;
        }

        if (Number(whereFilter.countQuestionsStatus) === 1) {
          query = query
            ? query + ` and ` + ` (countQuestionsStatus = 1   or  exercises.type <>0) `
            : ` (countQuestionsStatus = 1   or  exercises.type <>0) `;
          delete whereFilter.countQuestionsStatus;
        }

        console.log('query', query);
        if (query) {
          whereFilter[`$and`] = sequelize.literal(`(${query})`);
        }

        console.log(`whereFilter`, whereFilter);
        MODELS.findAndCountAll(exercises, {
          where: whereFilter,
          order: sort,
          attributes: att,
          offset: range[0],
          limit: perPage,
          distinct: true,

          include: [
            {
              model: courseLevels,
              as: 'courseLevels',
              attributes: ['id', 'courseLevelsName', 'courseGroupsId', 'order'],
              required: true,
              where: whereCourseLevels,
              include: {
                model: courseGroups,
                as: 'courseGroups',
                where: whereCourseGroups,
                attributes: ['id', 'courseGroupsName'],
                required: true,
                include: includeCourseGroups
              }
            },
            ...include
          ]
        })
          .then(result => {
            // console.log('re', result);
            if (parseResult) {
              result.rows = result.rows.map(e => {
                console.log('e', e.dataValues.detailInfo);

                if (e.dataValues.usersDetailInfo)
                  e.dataValues.usersDetailInfo = JSON.parse(e.dataValues.usersDetailInfo);

                return e;
              });
            }
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

        if (att && att.length > 0) {
          const findIndexUsersDetailInfo = att.findIndex(e => e === 'usersDetailInfo');

          if (findIndexUsersDetailInfo > 0) {
            if (Number(param.usersId) > 0) {
              att[findIndexUsersDetailInfo] = [
                sequelize.literal(`fn_get_exercises_users_detail(exercises.id,${param.usersId})  `),
                'usersDetailInfo'
              ];
            } else {
              att.splice(findIndexUsersDetailInfo, 1);
            }
          }
        }
        const include = [];

        if (Number(param.usersId) > 0) {
          include.push({
            model: doQuestions,
            as: 'doQuestions',
            attributes: ['id'],
            required: false,
            where: {
              usersId: param.usersId
            }
          });
        }
        console.log('att', att);
        MODELS.findOne(exercises, {
          where: { id: id },
          attributes: att,
          order: [[sequelize.literal('`questions`.`order`'), 'asc']],

          logging: true,
          include: [
            {
              model: courseLevels,
              as: 'courseLevels',
              attributes: ['id', 'courseLevelsName', 'courseGroupsId'],
              required: true,
              include: [
                {
                  model: courseGroups,
                  as: 'courseGroups',
                  attributes: ['id', 'courseGroupsName'],
                  required: true
                }
              ]
            },
            {
              model: questions,
              as: 'questions',
              required: false,
              include: [
                {
                  model: questionSuggestions,
                  as: 'questionSuggestions',
                  required: false,
                  include: include
                }
              ]
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
            if (result.dataValues.usersDetailInfo)
              result.dataValues.usersDetailInfo = JSON.parse(result.dataValues.usersDetailInfo);
            resolve(result);
          })
          .catch(err => {
            reject(ErrorHelpers.errorReject(err, 'getInfoError', 'questionservice'));
          });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'getInfoError', 'questionservice'));
      }
    }),
  updateOrder: async param => {
    try {
      // const exercisesId = param.entity;
      const entity = param.entity;

      console.log('provinceModel create: ', entity);

      await sequelize.transaction(async t => {
        await Promise.all(
          entity.exercises.map(async e => {
            await MODELS.update(exercises, { order: e.order }, { where: { id: e.id }, transaction: t }).catch(error => {
              throw new ApiErrors.BaseError({
                statusCode: 202,
                type: 'crudError',
                error
              });
            });
          })
        );

        // await setting_questions(finnalyResult.id, entity.questions, t);
      });
    } catch (error) {
      console.log('err', error);
      ErrorHelpers.errorThrow(error, 'crudError', 'courseLevelservice');
    }

    return { result: { success: true } };
  },
  create: async param => {
    let finnalyResult;
    let createQuestion;

    try {
      const entity = param.entity;

      await sequelize.transaction(async t => {
        finnalyResult = await MODELS.create(exercises, entity, { transaction: t }).catch(error => {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'crudError',
            error
          });
        });

        if (entity.type === 0 && entity.questions && entity.questions.length > 0) {
          await setting_questions(finnalyResult.id, entity.questions, t);

          await MODELS.update(
            exercises,
            {
              countQuestions: sequelize.literal(
                `(select count(questions.id) from questions where questions.exercisesId = ${finnalyResult.id}  )`
              ),
              countCoursesStatus: 1
            },
            { where: { id: finnalyResult.id }, transaction: t }
          );
        }
        if (entity.type === 1 && entity.questions && entity.questions.length > 0) {
          createQuestion = await create(finnalyResult.id, entity.questions, t);

          await MODELS.update(
            exercises,
            {
              countQuestions: sequelize.literal(
                `(select count(questions.id) from questions where questions.exercisesId = ${finnalyResult.id}  )`
              ),
              countCoursesStatus: 1
            },
            { where: { id: finnalyResult.id }, transaction: t }
          ).catch(err => {
            ErrorHelpers.errorThrow(err, 'crudError', 'customerservices');
          });
        }

        if (Number(entity.status) === 1) {
          await MODELS.update(
            courseLevels,
            {
              countExercises: sequelize.literal(
                `(select count(exercises.id) from exercises where exercises.courseLevelsId = ${finnalyResult.courseLevelsId} and status = 1 )`
              )
            },
            { where: { id: finnalyResult.courseLevelsId }, transaction: t }
          );
        }
      });

      if (!finnalyResult) {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudInfo'
        });
      }
    } catch (error) {
      ErrorHelpers.errorThrow(error, 'crudError', 'questionservice');
    }

    return { result: finnalyResult, errorList: createQuestion };
  },

  update: async param => {
    let finnalyResult;

    try {
      const entity = param.entity;

      console.log('Province update: ');

      const foundProvince = await MODELS.findOne(exercises, {
        where: {
          id: param.id
        }
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
            exercises,
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

          finnalyResult = await MODELS.findOne(exercises, { where: { id: param.id }, transaction: t }).catch(error => {
            throw new ApiErrors.BaseError({
              statusCode: 202,
              type: 'crudInfo',
              message: 'Lấy thông tin sau khi thay đổi thất bại',
              error
            });
          });

          if (entity.questions && entity.questions.length > 0) {
            await setting_questions(finnalyResult.id, entity.questions, t);
            await MODELS.update(
              exercises,
              {
                countQuestions: sequelize.literal(
                  `(select count(questions.id) from questions where questions.exercisesId = ${finnalyResult.id}  )`
                ),
                countQuestionsStatus: 1
              },

              { where: { id: finnalyResult.id }, transaction: t }
            );
          }

          if (Number(entity.status) !== Number(foundProvince.status)) {
            await MODELS.update(
              courseLevels,
              {
                countExercises: sequelize.literal(
                  `(select count(exercises.id) from exercises where exercises.courseLevelsId = ${finnalyResult.courseLevelsId} and status = 1 )`
                )
              },
              { where: { id: finnalyResult.courseLevelsId }, transaction: t }
            );
          }

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
  update_status: param =>
    new Promise((resolve, reject) => {
      try {
        // console.log('block id', param.id);
        const id = param.id;
        const entity = param.entity;

        MODELS.findOne(exercises, {
          where: {
            id
          },
          logging: console.log
        })
          .then(findEntity => {
            // console.log("findPlace: ", findPlace)
            if (!findEntity) {
              reject(
                new ApiErrors.BaseError({
                  statusCode: 202,
                  type: 'crudNotExisted'
                })
              );
            } else {
              MODELS.update(exercises, entity, {
                where: { id: id }
              })
                .then(() => {
                  // console.log("rowsUpdate: ", rowsUpdate)
                  if (Number(entity.status) !== Number(findEntity.status)) {
                    MODELS.update(
                      courseLevels,
                      {
                        countExercises: sequelize.literal(
                          `(select count(exercises.id) from exercises where exercises.courseLevelsId = ${findEntity.courseLevelsId} and status = 1 )`
                        )
                      },
                      { where: { id: findEntity.courseLevelsId } }
                    );
                  }
                  MODELS.findOne(exercises, { where: { id: param.id } })
                    .then(result => {
                      if (!result) {
                        reject(
                          new ApiErrors.BaseError({
                            statusCode: 202,
                            type: 'deleteError'
                          })
                        );
                      } else resolve({ status: 1, result: result });
                    })
                    .catch(err => {
                      reject(ErrorHelpers.errorReject(err, 'crudError', 'UserServices'));
                    });
                })
                .catch(err => {
                  reject(ErrorHelpers.errorReject(err, 'crudError', 'UserServices'));
                });
            }
          })
          .catch(err => {
            reject(ErrorHelpers.errorReject(err, 'crudError', 'UserServices'));
          });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'crudError', 'UserServices'));
      }
    })
};
