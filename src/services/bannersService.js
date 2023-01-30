// import moment from 'moment'
import MODELS from '../models/models';
import models from '../entity/index';
// import _ from 'lodash';
import * as ApiErrors from '../errors';
import ErrorHelpers from '../helpers/errorHelpers';
import filterHelpers from '../helpers/filterHelpers';
import preCheckHelpers, { TYPE_CHECK } from '../helpers/preCheckHelpers';

const { sequelize, users, banners /* tblGatewayEntity, Roles */ } = models;

export default {
  get_list: param =>
    new Promise(async (resolve, reject) => {
      try {
        const { filter, range, sort, attributes } = param;

        let whereFilter = filter;
        const att = filterHelpers.atrributesHelper(attributes);

        try {
          whereFilter = filterHelpers.combineFromDateWithToDate(whereFilter);
        } catch (error) {
          reject(error);
        }

        const perPage = range[1] - range[0] + 1;
        const page = Math.floor(range[0] / perPage);

        whereFilter = await filterHelpers.makeStringFilterRelatively(['title'], whereFilter, 'banners');

        if (!whereFilter) {
          whereFilter = { ...filter };
        }

        console.log('where', whereFilter);

        if (att && att.length > 0) {
          const findIndexCountCourseGroups = att.findIndex(e => e === 'countCourseGroups');

          if (findIndexCountCourseGroups > 0) {
            att[findIndexCountCourseGroups] = [
              sequelize.literal('fn_get_countCourseGroups_by_bannersId(banners.id)  '),
              'countCourseGroups'
            ];
          }
        }
        MODELS.findAndCountAll(banners, {
          where: whereFilter,
          order: sort,
          attributes: att,
          offset: range[0],
          limit: perPage,
          // distinct: true,
          logging: true,
          include: [{ model: users, as: 'userCreators', required: true, attributes: ['id', 'username', 'fullname'] }]
        })
          .then(result => {
            resolve({
              ...result,
              page: page + 1,
              perPage
            });
          })
          .catch(err => {
            reject(ErrorHelpers.errorReject(err, 'getListError', 'bannerservice'));
          });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'getListError', 'bannerservice'));
      }
    }),

  get_one: param =>
    new Promise((resolve, reject) => {
      try {
        // console.log("Menu Model param: %o | id: ", param, param.id)
        const id = param.id;
        const att = filterHelpers.atrributesHelper(param.attributes, ['usersCreatorId']);

        if (att && att.length > 0) {
          const findIndexCountCourseGroups = att.findIndex(e => e === 'countCourseGroups');

          if (findIndexCountCourseGroups > 0) {
            att[findIndexCountCourseGroups] = [
              sequelize.literal('fn_get_countCourseGroups_by_bannersId(banners.id)  '),
              'countCourseGroups'
            ];
          }
        }
        MODELS.findOne(banners, {
          where: { id: id },
          attributes: att,
          include: [{ model: users, as: 'userCreators', required: true, attributes: ['id', 'username', 'fullname'] }]
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
            reject(ErrorHelpers.errorReject(err, 'getInfoError', 'bannerservice'));
          });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'getInfoError', 'bannerservice'));
      }
    }),

  create: async param => {
    let finnalyResult;

    try {
      const entity = param.entity;

      console.log('provinceModel create: ', entity);
      let whereFilter = {
        title: entity.title
      };
      // api.banners.identificationCode

      whereFilter = await filterHelpers.makeStringFilterAbsolutely(['title'], whereFilter, 'banners');

      const infoArr = Array.from(
        await Promise.all([
          preCheckHelpers.createPromiseCheckNew(
            MODELS.findOne(banners, { attributes: ['id'], where: whereFilter }),
            entity.title ? true : false,
            TYPE_CHECK.CHECK_DUPLICATE,
            { parent: 'api.banners.title' }
          )
        ])
      );

      if (!preCheckHelpers.check(infoArr)) {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'getInfoError',
          message: 'Không xác thực được thông tin gửi lên'
        });
      }

      finnalyResult = await MODELS.create(banners, entity).catch(error => {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudError',
          error
        });
      });

      if (!finnalyResult) {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudInfo'
        });
      }
    } catch (error) {
      console.log('err', error);
      ErrorHelpers.errorThrow(error, 'crudError', 'bannerservice');
    }

    return { result: finnalyResult };
  },
  update: async param => {
    let finnalyResult;

    try {
      const entity = param.entity;

      console.log('Province update: ');

      const foundProvince = await MODELS.findOne(banners, {
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
        let whereFilter = {
          id: { $ne: param.id },
          title: entity.title
        };

        whereFilter = await filterHelpers.makeStringFilterAbsolutely(['title'], whereFilter, 'banners');

        const infoArr = Array.from(
          await Promise.all([
            preCheckHelpers.createPromiseCheckNew(
              MODELS.findOne(banners, { attributes: ['id'], where: whereFilter }),
              entity.title ? true : false,
              TYPE_CHECK.CHECK_DUPLICATE,
              { parent: 'api.banners.title' }
            )
          ])
        );

        if (!preCheckHelpers.check(infoArr)) {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'getInfoError',
            message: 'Không xác thực được thông tin gửi lên'
          });
        }

        await MODELS.update(banners, { ...entity, dateUpdated: new Date() }, { where: { id: Number(param.id) } }).catch(
          error => {
            throw new ApiErrors.BaseError({
              statusCode: 202,
              type: 'crudError',
              error
            });
          }
        );

        finnalyResult = await MODELS.findOne(banners, { where: { id: param.id } }).catch(error => {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'crudInfo',
            message: 'Lấy thông tin sau khi thay đổi thất bại',
            error
          });
        });

        if (!finnalyResult) {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'crudInfo',
            message: 'Lấy thông tin sau khi thay đổi thất bại'
          });
        }
      } else {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudNotExisted'
        });
      }
    } catch (error) {
      ErrorHelpers.errorThrow(error, 'crudError', 'bannerservice');
    }

    return { result: finnalyResult };
  },
  update_status: param =>
    new Promise((resolve, reject) => {
      try {
        console.log('block id', param.id);
        const id = param.id;
        const entity = param.entity;

        MODELS.findOne(banners, {
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
                banners,
                { ...entity, dateUpdated: new Date() },
                {
                  where: { id: id }
                }
              )
                .then(() => {
                  // console.log("rowsUpdate: ", rowsUpdate)
                  MODELS.findOne(banners, { where: { id: param.id } })
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
