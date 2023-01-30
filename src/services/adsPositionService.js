import Model from '../models/models';
// import sitesModel from '../models/sites'
import models from '../entity/index';
import * as ApiErrors from '../errors';
import ErrorHelpers from '../helpers/errorHelpers';
import _ from 'lodash';
import viMessage from '../locales/vi';
import lodashHelpers from '../helpers/lodashHelpers';
import filterHelpers from '../helpers/filterHelpers';
import preCheckHelpers, { TYPE_CHECK } from '../helpers/preCheckHelpers';
// import _ from 'lodash';

const { /* sequelize, */ sites, users, adsPositions } = models;

export default {
  get_list: param =>
    new Promise(async (resolve, reject) => {
      try {
        const { filter, range, sort, attributes } = param;
        let whereFilter = filter;
        console.log('whereFilter', whereFilter);

        const att = filterHelpers.atrributesHelper(attributes);
        let whereSite = _.pick(whereFilter, ['sitesId']);

        whereSite = lodashHelpers.rename(whereSite, [['sitesId', 'id']]);

        delete whereFilter['sitesId'];

        console.log(filter);
        try {
          whereFilter = filterHelpers.combineFromDateWithToDate(whereFilter);
        } catch (error) {
          reject(error);
        }

        // console.log("get_all filter: ", filter)
        // let nameFilter
        const perPage = range[1] - range[0] + 1;
        const page = Math.floor(range[0] / perPage);

        /* if (filter.status) {
        const statusFilter = {
          "status": { "$like": sequelize.literal(`CONCAT('%','${filter.status}','%')`) }
        }

        whereFilter = _.assign(whereFilter, statusFilter)
      } */

        whereFilter = await filterHelpers.makeStringFilterRelatively(['name'], whereFilter, 'adsPositions');

        if (!whereFilter) {
          whereFilter = { ...filter };
        }

        console.log('where', whereFilter, att);

        Model.findAndCountAll(adsPositions, {
          where: whereFilter,
          order: sort,
          offset: range[0],
          limit: perPage,
          distinct: true,
          attributes: att,
          include: [
            {
              model: sites,
              as: 'sites',
              attributes: ['id', 'name'],
              where: { ...whereSite, status: true },
              required: true
            },
            {
              model: users,
              as: 'usersCreator',
              attributes: ['id', 'username', 'fullname'],
              required: true
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
            reject(ErrorHelpers.errorReject(err, 'getListError', 'AdsPositionsService'));
          });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'getListError', 'AdsPositionsService'));
      }
    }),
  get_one: param =>
    new Promise((resolve, reject) => {
      try {
        // console.log("Menu Model param: %o | id: ", param, param.id)
        const id = param.id;
        const att = filterHelpers.atrributesHelper(param.attributes, ['usersCreatorId']);

        Model.findOne(adsPositions, {
          where: { id },
          attributes: att,
          include: [
            {
              model: sites,
              as: 'sites',
              attributes: ['id', 'name'],
              required: true
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
            reject(ErrorHelpers.errorReject(err, 'getInfoError', 'AdsPositionsService'));
          });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'getInfoError', 'AdsPositionsService'));
      }
    }),
  create: async param => {
    let finnalyResult;

    try {
      const entity = param.entity;

      console.log('AdsPositionService create: ', entity);
      let whereFilter = {
        sitesId: entity.sitesId,
        name: entity.name
      };

      whereFilter = await filterHelpers.makeStringFilterAbsolutely(['name'], whereFilter, 'adsPositions');
      console.log('whereFilter==', whereFilter);
      const infoArr = Array.from(
        await Promise.all([
          preCheckHelpers.createPromiseCheckNew(
            Model.findOne(adsPositions, { attributes: ['id'], where: whereFilter }),
            entity.name || entity.sitesId ? true : false,
            TYPE_CHECK.CHECK_DUPLICATE,
            { parent: 'api.adsPosition.name' }
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

      finnalyResult = await Model.create(adsPositions, param.entity).catch(error => {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudError',
          error
        });
      });

      if (!finnalyResult) {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudInfo',
          message: viMessage['api.message.infoAfterCreateError']
        });
      }
    } catch (error) {
      ErrorHelpers.errorThrow(error, 'crudError', 'AdsPositionsService');
    }

    return { result: finnalyResult };
  },
  update: async param => {
    let finnalyResult;

    try {
      const entity = param.entity;

      console.log('AdsPositionService update: ', entity);

      const foundGateway = await Model.findOne(adsPositions, {
        where: {
          id: param.id
        }
      }).catch(error => {
        throw preCheckHelpers.createErrorCheck(
          { typeCheck: TYPE_CHECK.GET_INFO, modelStructure: { parent: 'adsPositions' } },
          error
        );
      });

      let whereFilter = {
        id: { $ne: param.id },
        sitesId: entity.sitesId || foundGateway.sitesId,
        name: entity.name || foundGateway.name
      };

      whereFilter = await filterHelpers.makeStringFilterAbsolutely(['name'], whereFilter, 'adsPositions');

      if (foundGateway) {
        const infoArr = Array.from(
          await Promise.all([
            preCheckHelpers.createPromiseCheckNew(
              Model.findOne(adsPositions, {
                attributes: ['id'],
                where: whereFilter
              }),
              entity.name || entity.sitesId ? true : false,
              TYPE_CHECK.CHECK_DUPLICATE,
              { parent: 'api.adsPosition.name' }
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

        await Model.update(adsPositions, entity, { where: { id: parseInt(param.id) } }).catch(error => {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'crudError',
            error
          });
        });

        finnalyResult = await Model.findOne(adsPositions, { where: { Id: param.id } }).catch(error => {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'crudInfo',
            message: viMessage['api.message.infoAfterEditError'],
            error
          });
        });

        if (!finnalyResult) {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'crudInfo',
            message: viMessage['api.message.infoAfterEditError']
          });
        }
      } else {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudNotExisted',
          message: viMessage['api.message.notExisted']
        });
      }
    } catch (error) {
      ErrorHelpers.errorThrow(error, 'crudError', 'AdsPositionsService');
    }

    return { result: finnalyResult };
  },
  update_status: param =>
    new Promise((resolve, reject) => {
      try {
        console.log('block id', param.id);
        const id = param.id;
        const entity = param.entity;

        Model.findOne(adsPositions, {
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
              Model.update(adsPositions, entity, {
                where: { id: id }
              })
                .then(() => {
                  // console.log("rowsUpdate: ", rowsUpdate)
                  Model.findOne(adsPositions, { where: { id: param.id } })
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
