/* eslint-disable camelcase */
// import moment from 'moment'
import MODELS from '../models/models';
import models from '../entity/index';
// import _ from 'lodash';
import * as ApiErrors from '../errors';
import ErrorHelpers from '../helpers/errorHelpers';
import filterHelpers from '../helpers/filterHelpers';
import preCheckHelpers, { TYPE_CHECK } from '../helpers/preCheckHelpers';

const {
  services,
  users
  /* tblGatewayEntity, Roles */
} = models;

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

        whereFilter = await filterHelpers.makeStringFilterRelatively(['servicesName'], whereFilter, 'services');

        if (!whereFilter) {
          whereFilter = { ...filter };
        }

        console.log('where', whereFilter);

        MODELS.findAndCountAll(services, {
          where: whereFilter,
          order: sort,
          attributes: att,
          offset: range[0],
          limit: perPage,
          distinct: true,
          logging: console.log,
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
            reject(ErrorHelpers.errorReject(err, 'getListError', 'servicesService'));
          });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'getListError', 'servicesService'));
      }
    }),

  get_one: param =>
    new Promise((resolve, reject) => {
      try {
        const id = param.id;
        const att = filterHelpers.atrributesHelper(param.attributes, ['usersCreatorId']);

        MODELS.findOne(services, {
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
            reject(ErrorHelpers.errorReject(err, 'getInfoError', 'servicesService'));
          });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'getInfoError', 'servicesService'));
      }
    }),

  create: async param => {
    let finnalyResult;

    try {
      const entity = param.entity;

      console.log('services create: ', entity);
      let whereFilter = {
        servicesName: entity.servicesName
      };

      whereFilter = await filterHelpers.makeStringFilterAbsolutely(['servicesName'], whereFilter, 'services');

      const infoArr = Array.from(
        await Promise.all([
          preCheckHelpers.createPromiseCheckNew(
            MODELS.findOne(services, { attributes: ['id'], where: whereFilter }),
            entity.servicesName ? true : false,
            TYPE_CHECK.CHECK_DUPLICATE,
            { parent: 'api.services.servicesName' }
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
      if (!entity.servicesCode) {
        const servicesLast = await MODELS.findOne(services, {
          order: [['id', 'desc']]
        });

        entity.servicesCode = `DV` + String((Number(servicesLast.id) || 0) + 1).padStart(3, '0');
      }

      finnalyResult = await MODELS.create(services, entity).catch(error => {
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
      ErrorHelpers.errorThrow(error, 'crudError', 'servicesService');
    }

    return { result: finnalyResult };
  },
  update: async param => {
    let finnalyResult;

    try {
      const entity = param.entity;

      const foundServices = await MODELS.findOne(services, {
        where: {
          id: param.id
        }
      }).catch(error => {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'getInfoError',
          message: 'Lấy thông tin của App thất bại!',
          error
        });
      });

      if (foundServices) {
        let whereFilter = {
          id: { $ne: param.id },
          servicesName: entity.servicesName
        };

        whereFilter = await filterHelpers.makeStringFilterAbsolutely(['servicesName'], whereFilter, 'services');

        const infoArr = Array.from(
          await Promise.all([
            preCheckHelpers.createPromiseCheckNew(
              MODELS.findOne(services, { attributes: ['id'], where: whereFilter }),
              entity.servicesName ? true : false,
              TYPE_CHECK.CHECK_DUPLICATE,
              { parent: 'api.services.servicesName' }
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

        await MODELS.update(
          services,
          { ...entity, dateUpdated: new Date() },
          { where: { id: Number(param.id) } }
        ).catch(error => {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'crudError',
            error
          });
        });

        finnalyResult = await MODELS.findOne(services, { where: { id: param.id } }).catch(error => {
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
      ErrorHelpers.errorThrow(error, 'crudError', 'servicesService');
    }

    return { result: finnalyResult };
  },
  update_status: param =>
    new Promise((resolve, reject) => {
      try {
        const id = param.id;
        const entity = param.entity;

        MODELS.findOne(services, {
          where: {
            id
          },
          logging: console.log
        })
          .then(findEntity => {
            if (!findEntity) {
              reject(
                new ApiErrors.BaseError({
                  statusCode: 202,
                  type: 'crudNotExisted'
                })
              );
            } else {
              MODELS.update(
                services,
                { ...entity, dateUpdated: new Date() },
                {
                  where: { id: id }
                }
              )
                .then(() => {
                  MODELS.findOne(services, { where: { id: param.id } })
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
                      reject(ErrorHelpers.errorReject(err, 'crudError', 'servicesService'));
                    });
                })
                .catch(err => {
                  reject(ErrorHelpers.errorReject(err, 'crudError', 'servicesService'));
                });
            }
          })
          .catch(err => {
            reject(ErrorHelpers.errorReject(err, 'crudError', 'servicesService'));
          });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'crudError', 'servicesService'));
      }
    })
};
