// import moment from 'moment'
import MODELS from '../models/models';
import models from '../entity/index';
import _ from 'lodash';
import * as ApiErrors from '../errors';
import ErrorHelpers from '../helpers/errorHelpers';
import filterHelpers from '../helpers/filterHelpers';

const { sequelize, users, usersServices /* tblGatewayEntity, Roles */, services, courseGroups } = models;

export default {
  get_list: param =>
    new Promise(async (resolve, reject) => {
      try {
        const { filter, range, sort, attributes } = param;

        let whereFilter = _.omit(filter, ['checkTime']);
        const att = filterHelpers.atrributesHelper(attributes);

        const perPage = range[1] - range[0] + 1;
        const page = Math.floor(range[0] / perPage);

        whereFilter = await filterHelpers.makeStringFilterRelatively(
          ['usersServicesName'],
          whereFilter,
          'usersServices'
        );

        if (!whereFilter) {
          whereFilter = { ...filter };
        }

        console.log('where', whereFilter);

        if (Number(filter.checkTime) === 1) {
          whereFilter[`$and`] = sequelize.literal('(isnull(expiredDate) or expiredDate>=   current_date() )');
        }

        MODELS.findAndCountAll(usersServices, {
          where: whereFilter,
          order: sort,
          attributes: att,
          offset: range[0],
          limit: perPage,
          // distinct: true,
          logging: true,
          include: [
            {
              model: services,
              as: 'services',
              required: true,
              attributes: ['id', 'servicesName']
            },
            {
              model: courseGroups,
              as: 'courseGroups',
              required: true,
              attributes: ['id', 'courseGroupsName']
            },
            {
              model: users,
              as: 'teachers',
              required: false,
              attributes: ['id', 'fullname', 'mobile', 'image']
            },
            {
              model: users,
              as: 'users',
              required: false,
              attributes: ['id', 'fullname', 'mobile', 'image']
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
            reject(ErrorHelpers.errorReject(err, 'getListError', 'usersServiceservice'));
          });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'getListError', 'usersServiceservice'));
      }
    }),

  get_one: param =>
    new Promise((resolve, reject) => {
      try {
        // console.log("Menu Model param: %o | id: ", param, param.id)
        const id = param.id;
        const att = filterHelpers.atrributesHelper(param.attributes, ['usersCreatorId']);

        MODELS.findOne(usersServices, {
          where: { id: id },
          attributes: att,
          include: [
            {
              model: services,
              as: 'services',
              required: true,
              attributes: ['id', 'servicesName']
            },
            {
              model: courseGroups,
              as: 'courseGroups',
              required: true,
              attributes: ['id', 'courseGroupsName']
            },
            {
              model: users,
              as: 'teachers',
              required: false,
              attributes: ['id', 'fullname', 'mobile', 'image']
            },
            {
              model: users,
              as: 'users',
              required: false,
              attributes: ['id', 'fullname', 'mobile', 'image']
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
            reject(ErrorHelpers.errorReject(err, 'getInfoError', 'usersServiceservice'));
          });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'getInfoError', 'usersServiceservice'));
      }
    }),

  create: async param => {
    let finnalyResult;

    try {
      const entity = param.entity;

      console.log('provinceModel create: ', entity);
      finnalyResult = await MODELS.findOne(usersServices, {
        where: {
          usersId: entity.usersId,
          servicesId: entity.servicesId,
          courseGroupsId: entity.courseGroupsId
        }
      }).catch(error => {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudError',
          error
        });
      });
      if (finnalyResult) {
        finnalyResult = await MODELS.update(usersServices, entity, {
          where: {
            id: finnalyResult.id
          }
        }).catch(error => {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'crudError',
            error
          });
        });
      } else {
        finnalyResult = await MODELS.create(usersServices, entity).catch(error => {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'crudError',
            error
          });
        });
      }

      if (!finnalyResult) {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudInfo'
        });
      }
    } catch (error) {
      console.log('err', error);
      ErrorHelpers.errorThrow(error, 'crudError', 'usersServiceservice');
    }

    return { result: finnalyResult };
  },
  update: async param => {
    let finnalyResult;

    try {
      const entity = param.entity;

      console.log('Province update: ');

      const foundProvince = await MODELS.findOne(usersServices, {
        where: {
          usersId: entity.usersId,
          servicesId: entity.servicesId,
          courseGroupsId: entity.courseGroupsId
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
        await MODELS.update(
          usersServices,
          { teachersId: entity.teachersId },
          { where: { id: foundProvince.id } }
        ).catch(error => {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'crudError',
            error
          });
        });

        finnalyResult = await MODELS.findOne(usersServices, { where: { id: foundProvince.id } }).catch(error => {
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
      ErrorHelpers.errorThrow(error, 'crudError', 'usersServiceservice');
    }

    return { result: finnalyResult };
  }
};
