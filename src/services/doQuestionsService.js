/* eslint-disable camelcase */
// import moment from 'moment';
import MODELS from '../models/models';
import models from '../entity/index';
import _ from 'lodash';
import * as ApiErrors from '../errors';
import ErrorHelpers from '../helpers/errorHelpers';
import filterHelpers from '../helpers/filterHelpers';

const {
  sequelize,
  questions,
  doQuestions,
  doQuestionsHistories,
  users,
  exercises,
  courseLevels
  /* tblGatewayEntity, Roles */
} = models;

export default {
  get_list: param =>
    new Promise((resolve, reject) => {
      try {
        const { filter, range, sort, attributes } = param;
        let whereFilter = _.omit(filter, ['courseLevelsId']);

        const whereexercises = _.pick(filter, ['courseLevelsId']);

        console.log('filter', filter);
        try {
          whereFilter = filterHelpers.combineFromDateWithToDate(whereFilter, 'doQuestionsHistoriesDate');
        } catch (error) {
          reject(error);
        }

        const perPage = range[1] - range[0] + 1;
        const page = Math.floor(range[0] / perPage);
        const att = filterHelpers.atrributesHelper(attributes);

        // whereFilter = await filterHelpers.makeStringFilterRelatively(['districtName'], whereFilter, 'districts');

        if (!whereFilter) {
          whereFilter = { ...filter };
        }

        console.log('where', whereFilter);

        MODELS.findAndCountAll(doQuestionsHistories, {
          where: whereFilter,
          order: sort,
          offset: range[0],
          limit: perPage,
          logging: true,
          attributes: att,
          include: [
            {
              model: users,
              as: 'users',
              attributes: ['id', 'fullname'],
              required: true
            },
            {
              model: exercises,
              as: 'exercises',
              attributes: ['id', 'exercisesName', 'courseLevelsId'],
              where: whereexercises,
              required: true,
              include: [
                {
                  model: courseLevels,
                  as: 'courseLevels',
                  attributes: ['id', 'courseLevelsName'],

                  required: true
                }
              ]
            }
          ]
        })
          .then(result => {
            resolve({
              ...result,
              page: page + 1,
              perPage
            });
          })
          .catch(err => {
            reject(ErrorHelpers.errorReject(err, 'getListError', 'DistrictService'));
          });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'getListError', 'DistrictService'));
      }
    }),

  get_one: param =>
    new Promise(async (resolve, reject) => {
      try {
        // console.log("Menu Model param: %o | id: ", param, param.id)

        const result = await sequelize
          .query('call sp_doQuestionsHistories_get_one(:in_doQuestionsHistoriesId)', {
            replacements: {
              in_doQuestionsHistoriesId: param.id
            },

            type: sequelize.QueryTypes.SELECT
          })
          .catch(err => {
            console.log('err', err);
          });

        const rows = Object.values(result[0]);

        resolve(rows);
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'getInfoError', 'surveyservice'));
      }
    }),

  create: async param => {
    let finnalyResult;

    try {
      const entity = param.entity;
      const usersId = entity.usersId;
      const exercisesId = entity.exercisesId;

      console.log('provinceModel create: ', entity);

      if (entity.doQuestions && entity.doQuestions.length > 0) {
        await sequelize.transaction(async t => {
          const findexercisesDoquestion = await MODELS.findAll(doQuestions, {
            logging: true,
            where: {
              usersId: usersId
            },
            include: [
              {
                model: questions,
                as: 'questions',
                required: true,
                where: {
                  exercisesId: exercisesId
                }
              }
            ],
            transaction: t
          });

          const oldDoQuestions = findexercisesDoquestion ? JSON.parse(JSON.stringify(findexercisesDoquestion)) : [];

          const newDoQuestions = entity.doQuestions;

          console.log('newDoQuestions', newDoQuestions);
          console.log('oldDoQuestions', oldDoQuestions);
          const deleteDoQuestions = [];
          let createDoQuestions = [];

          oldDoQuestions.forEach(oldDoQS => {
            const findDoQuestions = newDoQuestions.find(
              newDoQS => Number(oldDoQS.questionSuggestionsId) === Number(newDoQS.questionSuggestionsId)
            );

            console.log('findDoQuestions', findDoQuestions);
            if (findDoQuestions) {
              findDoQuestions.findStatus = true;
            } else {
              deleteDoQuestions.push(oldDoQS.id);
            }
          });

          createDoQuestions = newDoQuestions.filter(e => !e.findStatus);
          console.log('deleteDoQuestions', deleteDoQuestions);
          console.log('createDoQuestions', createDoQuestions);

          if (createDoQuestions.length > 0 || deleteDoQuestions.length > 0) {
            await MODELS.destroy(
              doQuestionsHistories,
              {
                where: {
                  usersId: usersId,
                  exercisesId: exercisesId
                }
              },
              { transaction: t }
            );
            finnalyResult = await MODELS.create(
              doQuestionsHistories,
              {
                usersId: usersId,
                exercisesId: exercisesId
              },
              { transaction: t }
            );
            if (createDoQuestions.length > 0) {
              await MODELS.bulkCreate(
                doQuestions,
                createDoQuestions.map(e => {
                  return {
                    ..._.omit(e, ['id']),
                    usersId: usersId
                  };
                }),
                { transaction: t }
              ).catch(error => {
                throw new ApiErrors.BaseError({
                  statusCode: 202,
                  type: 'crudError',
                  error
                });
              });
            }
            if (deleteDoQuestions.length > 0) {
              await MODELS.destroy(
                doQuestions,

                {
                  transaction: t,
                  where: {
                    id: { $in: deleteDoQuestions }
                  }
                }
              ).catch(error => {
                throw new ApiErrors.BaseError({
                  statusCode: 202,
                  type: 'crudError',
                  error
                });
              });
            }
          } else {
            finnalyResult = await MODELS.findOne(doQuestionsHistories, {
              where: {
                usersId: usersId,
                exercisesId: exercisesId
              },
              order: [['id', 'desc']]
            });
          }
        });
      } else {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'Phải hoàn thành ít nhất 1 câu hỏi'
        });
      }
    } catch (error) {
      console.log('err', error);
      ErrorHelpers.errorThrow(error, 'crudError', 'surveyservice');
    }

    return { result: finnalyResult };
  }
};
