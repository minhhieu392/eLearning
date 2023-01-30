import Model from '../models/models';
import models from '../entity/index';
import * as ApiErrors from '../errors';
import ErrorHelpers from '../helpers/errorHelpers';
import filterHelpers from '../helpers/filterHelpers';
import preCheckHelpers, { TYPE_CHECK } from '../helpers/preCheckHelpers';

const { /* sequelize, Op, */ users, menuPositions /* Users, tblGatewayEntity, Roles */ } = models;

export default {
  get_list: param =>
    new Promise(async (resolve, reject) => {
      try {
        const { filter, range, sort, attributes } = param;
        let whereFilter = filter;

        console.log(filter);
        try {
          whereFilter = filterHelpers.combineFromDateWithToDate(whereFilter);
        } catch (error) {
          reject(error);
        }
        const att = filterHelpers.atrributesHelper(attributes);

        const perPage = range[1] - range[0] + 1;
        const page = Math.floor(range[0] / perPage);

        whereFilter = await filterHelpers.makeStringFilterRelatively(['name'], whereFilter, 'menuPositions');

        if (!whereFilter) {
          whereFilter = { ...filter };
        }

        console.log('where', whereFilter);

        Model.findAndCountAll(menuPositions, {
          where: whereFilter,
          order: sort,
          attributes: att,
          offset: range[0],
          limit: perPage,
          include: [{ model: users, as: 'usersCreator', attributes: ['id', 'fullname', 'username'] }]
        })
          .then(result => {
            resolve({
              ...result,
              page: page + 1,
              perPage
            });
          })
          .catch(err => {
            reject(ErrorHelpers.errorReject(err, 'crudError', 'MenuPositionService'));
          });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'crudError', 'MenuPositionService'));
      }
    }),
  get_one: param =>
    new Promise((resolve, reject) => {
      try {
        // console.log("Menu Model param: %o | id: ", param, param.id)
        const id = param.id;
        const att = filterHelpers.atrributesHelper(param.attributes, ['usersCreatorId']);

        Model.findOne(menuPositions, {
          where: { id: id },
          attributes: att
          // include: [
          //   { model: users, as: 'usersCreator', attributes: { exclude: ['password'] } },
          // ]
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
            reject(ErrorHelpers.errorReject(err, 'crudError', 'MenuPositionService'));
          });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'crudError', 'MenuPositionService'));
      }
    }),
  create: async param => {
    let finnalyResult;

    try {
      const entity = param.entity;

      console.log('tblGateway create: ', entity);
      let whereFilter = {
        name: entity.name
      };

      whereFilter = await filterHelpers.makeStringFilterAbsolutely(['name'], whereFilter, 'menuPositions');

      const dupMenuPosition = await preCheckHelpers.createPromiseCheckNew(
        Model.findOne(menuPositions, { attributes: ['id'], where: whereFilter }),
        entity.name ? true : false,
        TYPE_CHECK.CHECK_DUPLICATE,
        { parent: 'api.menuPositions.name' }
      );

      if (!preCheckHelpers.check([dupMenuPosition])) {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'getInfoError',
          message: 'Không xác thực được thông tin gửi lên'
        });
      }

      finnalyResult = await Model.create(menuPositions, param.entity).catch(error => {
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
      ErrorHelpers.errorThrow(error, 'crudError', 'MenuPositionService');
    }

    return { result: finnalyResult };
  },
  update: async param => {
    let finnalyResult;

    try {
      const { id, entity } = param;
      // const entity = param.entity;

      console.log('MenuPosition update: ', entity);
      console.log('MenuPosition update param.id: ', id);
      const foundMenuPosition = await Model.findOne(menuPositions, {
        where: {
          id: id
        }
      }).catch(error => {
        throw preCheckHelpers.createErrorCheck(
          { typeCheck: TYPE_CHECK.GET_INFO, modelStructure: { parent: 'menuPositions' } },
          error
        );
      });

      let whereFilter = {};

      if (foundMenuPosition) {
        let whereFilter = {
          name: entity.name
        };

        whereFilter = await filterHelpers.makeStringFilterAbsolutely(
          ['name'],
          {
            name: entity.name,
            id: { $ne: id }
          },
          'menuPositions'
        );

        const dupMenuPosition = await preCheckHelpers.createPromiseCheckNew(
          Model.findOne(menuPositions, { attributes: ['id'], where: whereFilter }),
          entity.name ? true : false,
          TYPE_CHECK.CHECK_DUPLICATE,
          { parent: 'api.menuPositions.name' }
        );

        if (!preCheckHelpers.check([dupMenuPosition])) {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'getInfoError',
            message: 'Không xác thực được thông tin gửi lên'
          });
        }

        await Model.update(menuPositions, entity, { where: { id: parseInt(param.id) } }).catch(error => {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'crudError',
            error
          });
        });

        finnalyResult = await Model.findOne(menuPositions, { where: { Id: param.id } }).catch(error => {
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
      ErrorHelpers.errorThrow(error, 'crudError', 'MenuPositionService');
    }

    return { result: finnalyResult };
  },
  update_status: param =>
    new Promise((resolve, reject) => {
      try {
        console.log('block id', param.id);
        const id = param.id;
        const entity = param.entity;

        Model.findOne(menuPositions, {
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
              Model.update(menuPositions, entity, {
                where: { id: id }
              })
                .then(() => {
                  // console.log("rowsUpdate: ", rowsUpdate)
                  Model.findOne(menuPositions, { where: { id: param.id } })
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
                      reject(ErrorHelpers.errorReject(err, 'crudError', 'groupSiteServices'));
                    });
                })
                .catch(err => {
                  reject(ErrorHelpers.errorReject(err, 'crudError', 'groupSiteServices'));
                });
            }
          })
          .catch(err => {
            reject(ErrorHelpers.errorReject(err, 'crudError', 'groupSiteServices'));
          });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'crudError', 'groupSiteServices'));
      }
    })
};
