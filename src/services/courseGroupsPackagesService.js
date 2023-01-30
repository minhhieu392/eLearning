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
  users,
  courseGroupsPackages,

  courseGroups
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

        const perPage = range[1] - range[0] + 1;
        const page = Math.floor(range[0] / perPage);

        whereFilter = await filterHelpers.makeStringFilterRelatively(
          ['courseGroupsPackagesName'],
          whereFilter,
          'courseGroupsPackages'
        );

        console.log('att', att);

        console.log('where2', whereFilter);

        MODELS.findAndCountAll(courseGroupsPackages, {
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
            resolve({
              ...result,
              page: page + 1,
              perPage
            });
          })
          .catch(err => {
            console.log('Err', err);
            reject(ErrorHelpers.errorReject(err, 'getListError', 'courseGroupsPackageservice'));
          });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'getListError', 'courseGroupsPackageservice'));
      }
    }),

  get_one: param =>
    new Promise((resolve, reject) => {
      try {
        // console.log("Menu Model param: %o | id: ", param, param.id)
        const id = param.id;
        const att = filterHelpers.atrributesHelper(param.attributes, ['usersCreatorId']);

        MODELS.findOne(courseGroupsPackages, {
          where: { id: id },
          attributes: att,
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
            reject(ErrorHelpers.errorReject(err, 'getInfoError', 'courseGroupsPackageservice'));
          });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'getInfoError', 'courseGroupsPackageservice'));
      }
    }),
  create: async param => {
    let finnalyResult;

    try {
      const entity = param.entity;

      const findCourseGroups = await MODELS.findOne(courseGroups, {
        where: {
          id: entity.courseGroupsId
        }
      });

      if (!findCourseGroups) {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudError',
          message: 'Không tìm thấy khóa học'
        });
      }
      if (!entity.code) {
        // const wherebillTypes = {
        //   id:
        // }
        const findLastusers = await sequelize.query(
          `select count(*) as count from courseGroupsPackages where courseGroupsId = ${entity.courseGroupsId}`
        );

        console.log('findLastusers', findLastusers, String((Number(findLastusers[0][0].count) || 0) + 1));
        entity.code =
          findCourseGroups.courseGroupsCode +
          'G' +
          String((Number(findLastusers[0][0].count) || 0) + 1).padStart(2, '0');
      }

      await sequelize.transaction(async t => {
        finnalyResult = await MODELS.create(courseGroupsPackages, entity, { transaction: t }).catch(error => {
          console.log('e', error);
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'crudError',
            error
          });
        });

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
      ErrorHelpers.errorThrow(error, 'crudError', 'courseGroupsPackageservice');
    }

    return { result: finnalyResult };
  },

  update: async param => {
    let finnalyResult;

    try {
      const entity = param.entity;

      console.log('Province update: ');

      const foundProvince = await MODELS.findOne(courseGroupsPackages, {
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
            courseGroupsPackages,
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

          finnalyResult = await MODELS.findOne(courseGroupsPackages, { where: { id: param.id }, transaction: t }).catch(
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

          // await setting_questions(finnalyResult.id, entity.questions, t);
        });
      } else {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudNotExisted'
        });
      }
    } catch (error) {
      ErrorHelpers.errorThrow(error, 'crudError', 'courseGroupsPackageservice');
    }

    return { result: finnalyResult };
  },

  update_status: param =>
    new Promise((resolve, reject) => {
      try {
        console.log('block id', param.id);
        const id = param.id;
        const entity = param.entity;

        MODELS.findOne(courseGroupsPackages, {
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
                courseGroupsPackages,
                { ...entity, dateUpdated: new Date() },
                {
                  where: { id: id }
                }
              )
                .then(() => {
                  // console.log("rowsUpdate: ", rowsUpdate)

                  MODELS.findOne(courseGroupsPackages, { where: { id: param.id } })
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
