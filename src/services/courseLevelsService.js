/* eslint-disable camelcase */
// import moment from 'moment'
import MODELS from '../models/models';
import models from '../entity/index';
import _ from 'lodash';
import * as ApiErrors from '../errors';
import ErrorHelpers from '../helpers/errorHelpers';
import filterHelpers from '../helpers/filterHelpers';

const {
  sequelize,
  users,
  courseLevels,
  courses,
  usersCourseHistories,
  courseGroups
  // questions,
  // questionSuggestions,
  // doQuestions
  /* tblGatewayEntity, Roles */
} = models;

export default {
  get_list: param =>
    new Promise(async (resolve, reject) => {
      try {
        const { filter, range, sort, attributes } = param;

        let whereFilter = _.omit(filter, ['checkTime', 'usersId', 'viewCompleted', 'questionCompleted']);
        const att = filterHelpers.atrributesHelper(attributes);

        try {
          whereFilter = filterHelpers.combineFromDateWithToDate(whereFilter);
        } catch (error) {
          reject(error);
        }
        let parseResult = false;
        const perPage = range[1] - range[0] + 1;
        const page = Math.floor(range[0] / perPage);

        whereFilter = await filterHelpers.makeStringFilterRelatively(['courseLevelsName'], whereFilter, 'courseLevels');

        console.log('att', att);

        if (att && att.length > 0) {
          const findIndexTotalVideoLength = att.findIndex(e => e === 'detailInfo');

          if (findIndexTotalVideoLength > 0) {
            att[findIndexTotalVideoLength] = [
              sequelize.literal('fn_get_courseLevels_detail(courseLevels.id)  '),
              'detailInfo'
            ];
            parseResult = true;
          }

          const findIndexUsersDetailInfo = att.findIndex(e => e === 'usersDetailInfo');

          if (findIndexUsersDetailInfo > 0) {
            if (Number(filter.usersId) > 0) {
              att[findIndexUsersDetailInfo] = [
                sequelize.literal(`fn_get_courseLevels_users_detail(courseLevels.id,${filter.usersId})  `),
                'usersDetailInfo'
              ];
              parseResult = true;
            } else {
              att.splice(findIndexUsersDetailInfo, 1);
            }
          }
        }

        if (Number(filter.viewCompleted) === 1 && Number(filter.usersId) > 0) {
          whereFilter[`$and`] = sequelize.literal(`
               JSON_EXTRACT(fn_get_courseLevels_detail(courseLevels.id), '$.countCourses')=JSON_EXTRACT(fn_get_courseLevels_users_detail(courseLevels.id, ${filter.usersId}), '$.countCompleteCourses')
          `);
        }
        if (Number(filter.viewCompleted) === -1 && Number(filter.usersId) > 0) {
          whereFilter[`$and`] = sequelize.literal(`
               JSON_EXTRACT(fn_get_courseLevels_detail(courseLevels.id), '$.countCourses') <> JSON_EXTRACT(fn_get_courseLevels_users_detail(courseLevels.id, ${filter.usersId}), '$.countCompleteCourses')
          `);
        }

        if (Number(filter.questionCompleted) === 1 && Number(filter.usersId) > 0) {
          whereFilter[`$and`] = sequelize.literal(`
               JSON_EXTRACT(fn_get_courseLevels_users_detail(courseLevels.id, ${filter.usersId}), '$.countNotCorrectQuestions') = 0
          `);
        }
        if (Number(filter.questionCompleted) === -1 && Number(filter.usersId) > 0) {
          whereFilter[`$and`] = sequelize.literal(`
                 JSON_EXTRACT(fn_get_courseLevels_users_detail(courseLevels.id, ${filter.usersId}), '$.countNotCorrectQuestions') > 0
          `);
        }

        console.log('att', att);

        console.log('where2', whereFilter);

        MODELS.findAndCountAll(courseLevels, {
          where: whereFilter,
          order: sort,
          attributes: att,
          offset: range[0],
          limit: perPage,
          distinct: true,
          logging: true,
          include: [
            { model: users, as: 'userCreators', required: true, attributes: ['id', 'username', 'fullname'] },
            {
              model: courseGroups,
              as: 'courseGroups',
              required: true,
              attributes: ['id', 'courseGroupsName']
            }
          ]
        })
          .then(result => {
            // console.log('re', result);
            if (parseResult) {
              result.rows = result.rows.map(e => {
                console.log('e', e.dataValues.detailInfo);
                if (e.dataValues.detailInfo) {
                  e.dataValues.detailInfo = JSON.parse(e.dataValues.detailInfo);
                }
                if (e.dataValues.usersDetailInfo) {
                  e.dataValues.usersDetailInfo = JSON.parse(e.dataValues.usersDetailInfo);
                  e.dataValues.usersDetailInfo.countCorrectQuestions =
                    e.dataValues.detailInfo.countQuestions || 0 - e.dataValues.usersDetailInfo.countNotCorrectQuestions;
                }

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
            reject(ErrorHelpers.errorReject(err, 'getListError', 'courseLevelservice'));
          });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'getListError', 'courseLevelservice'));
      }
    }),

  get_one: param =>
    new Promise((resolve, reject) => {
      try {
        // console.log("Menu Model param: %o | id: ", param, param.id)
        const id = param.id;
        const att = filterHelpers.atrributesHelper(param.attributes, ['usersCreatorId']);

        if (att && att.length > 0) {
          const findIndexTotalVideoLength = att.findIndex(e => e === 'detailInfo');

          if (findIndexTotalVideoLength > 0) {
            att[findIndexTotalVideoLength] = [
              sequelize.literal('fn_get_courseLevels_detail(courseLevels.id)  '),
              'detailInfo'
            ];
          }
          const findIndexUsersDetailInfo = att.findIndex(e => e === 'usersDetailInfo');

          if (findIndexUsersDetailInfo > 0) {
            if (Number(param.usersId) > 0) {
              att[findIndexUsersDetailInfo] = [
                sequelize.literal(`fn_get_courseLevels_users_detail(courseLevels.id,${param.usersId})  `),
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
            model: usersCourseHistories,
            as: 'viewed',
            required: false,
            attributes: ['id', 'status'],
            where: {
              usersId: param.usersId
            }
          });
        }
        console.log('att', att, include);
        MODELS.findOne(courseLevels, {
          where: { id: id },
          attributes: att,
          order: [[sequelize.literal('`courses`.`order`'), 'asc']],
          logging: true,
          include: [
            { model: users, as: 'userCreators', required: true, attributes: ['id', 'username', 'fullname'] },
            {
              model: courses,
              as: 'courses',
              required: false,
              attributes: ['id', 'coursesName', 'order', 'link', 'videoLength'],
              where: { status: 1 },
              include: include
            },
            {
              model: courseGroups,
              as: 'courseGroups',
              required: true,
              attributes: ['id', 'courseGroupsName']
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
            if (result.dataValues.detailInfo) result.dataValues.detailInfo = JSON.parse(result.dataValues.detailInfo);
            if (result.dataValues.usersDetailInfo)
              result.dataValues.usersDetailInfo = JSON.parse(result.dataValues.usersDetailInfo);
            resolve(result);
          })
          .catch(err => {
            reject(ErrorHelpers.errorReject(err, 'getInfoError', 'courseLevelservice'));
          });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'getInfoError', 'courseLevelservice'));
      }
    }),
  create: async param => {
    let finnalyResult;

    try {
      const entity = param.entity;

      console.log('provinceModel create: ', entity);

      await sequelize.transaction(async t => {
        finnalyResult = await MODELS.create(courseLevels, entity, { transaction: t }).catch(error => {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'crudError',
            error
          });
        });

        if (Number(entity.status) === 1) {
          await MODELS.update(
            courseGroups,
            {
              countCourseLevels: sequelize.literal(
                `(select count(courseLevels.id) from courseLevels where courseLevels.courseGroupsId = ${finnalyResult.courseGroupsId} and status = 1 )`
              )
            },
            { where: { id: finnalyResult.courseGroupsId }, transaction: t }
          );
        }
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
      ErrorHelpers.errorThrow(error, 'crudError', 'courseLevelservice');
    }

    return { result: finnalyResult };
  },

  updateOrder: async param => {
    try {
      const entity = param.entity;

      console.log('provinceModel create: ', entity);

      await sequelize.transaction(async t => {
        await Promise.all(
          entity.courseLevels.map(async e => {
            await MODELS.update(courseLevels, { order: e.order }, { where: { id: e.id }, transaction: t }).catch(
              error => {
                throw new ApiErrors.BaseError({
                  statusCode: 202,
                  type: 'crudError',
                  error
                });
              }
            );
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
  update: async param => {
    let finnalyResult;

    try {
      const entity = param.entity;

      console.log('Province update: ');

      const foundProvince = await MODELS.findOne(courseLevels, {
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
            courseLevels,
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

          finnalyResult = await MODELS.findOne(courseLevels, { where: { id: param.id }, transaction: t }).catch(
            error => {
              throw new ApiErrors.BaseError({
                statusCode: 202,
                type: 'crudInfo',
                message: 'Lấy thông tin sau khi thay đổi thất bại',
                error
              });
            }
          );

          if (!finnalyResult) {
            throw new ApiErrors.BaseError({
              statusCode: 202,
              type: 'crudInfo',
              message: 'Lấy thông tin sau khi thay đổi thất bại'
            });
          }
          if (Number(entity.status) !== Number(foundProvince.status)) {
            await MODELS.update(
              courseGroups,
              {
                countCourseLevels: sequelize.literal(
                  `(select count(courseLevels.id) from courseLevels where courseLevels.courseGroupsId = ${finnalyResult.courseGroupsId} and status = 1 )`
                )
              },
              { where: { id: finnalyResult.courseGroupsId }, transaction: t }
            );
          }
          // await setting_questions(finnalyResult.id, entity.questions, t);
        });
      } else {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudNotExisted'
        });
      }
    } catch (error) {
      ErrorHelpers.errorThrow(error, 'crudError', 'courseLevelservice');
    }

    return { result: finnalyResult };
  },

  update_status: param =>
    new Promise((resolve, reject) => {
      try {
        console.log('block id', param.id);
        const id = param.id;
        const entity = param.entity;

        MODELS.findOne(courseLevels, {
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
              MODELS.update(
                courseLevels,
                { ...entity, dateUpdated: new Date() },
                {
                  where: { id: id }
                }
              )
                .then(() => {
                  // console.log("rowsUpdate: ", rowsUpdate)

                  MODELS.findOne(courseLevels, { where: { id: param.id } })
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
