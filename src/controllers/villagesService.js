import MODELS from '../models/models';
import models from '../entity/index';
import _ from 'lodash';
import * as ApiErrors from '../errors';
import ErrorHelpers from '../helpers/errorHelpers';
import filterHelpers from '../helpers/filterHelpers';
import preCheckHelpers, { TYPE_CHECK } from '../helpers/preCheckHelpers';

const { /* sequelize, Op, */ users, districts, provinces, villages, wards } = models;

export default {
  get_list: param =>
    new Promise(async (resolve, reject) => {
      try {
        const { filter, range, sort, attributes } = param;
        let whereFilter = filter;
        const att = filterHelpers.atrributesHelper(attributes);

        console.log(filter);
        try {
          whereFilter = filterHelpers.combineFromDateWithToDate(whereFilter);
        } catch (error) {
          reject(error);
        }

        const perPage = range[1] - range[0] + 1;
        const page = Math.floor(range[0] / perPage);

        whereFilter = await filterHelpers.makeStringFilterRelatively(['villageName'], whereFilter, 'villages');

        if (!whereFilter) {
          whereFilter = { ...filter };
        }

        let whereDistrictsId;

        if (whereFilter.districtsId) {
          whereDistrictsId = {
            districtsId: whereFilter.districtsId
          };

          whereFilter = _.omit(whereFilter, ['districtsId']);
        }

        let whereProvincesId;

        if (whereFilter.provincesId) {
          whereProvincesId = {
            provincesId: whereFilter.provincesId
          };

          whereFilter = _.omit(whereFilter, ['provincesId']);
        }

        console.log('where', whereFilter);

        MODELS.findAndCountAll(villages, {
          where: whereFilter,
          order: sort,
          attributes: att,
          offset: range[0],
          limit: perPage,
          distinct: true,
          include: [
            {
              model: wards,
              as: 'wards',
              where: whereDistrictsId,
              attributes: ['id', 'wardName'],
              required: true,
              include: [
                {
                  model: districts,
                  as: 'districts',
                  attributes: ['id', 'districtName'],
                  required: true,
                  where: whereProvincesId,
                  include: [{ model: provinces, as: 'provinces', attributes: ['id', 'provinceName'] }]
                }
              ]
            },
            { model: users, as: 'userCreators', attributes: ['id', 'username', 'fullname'] }
          ],
          logging: console.log
        })
          .then(result => {
            resolve({
              ...result,
              page: page + 1,
              perPage
            });
          })
          .catch(err => {
            reject(ErrorHelpers.errorReject(err, 'getListError', 'villageService'));
          });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'getListError', 'villageService'));
      }
    }),
  get_list_multi: param =>
    new Promise((resolve, reject) => {
      try {
        const { filter, attributes } = param;
        const whereFilter = filter;
        const att = filterHelpers.atrributesHelper(attributes);

        console.log('where', whereFilter);

        MODELS.findAndCountAll(villages, {
          where: whereFilter,
          attributes: att,
          logging: console.log,
          include: [{ model: users, as: 'userCreators', required: true, attributes: ['id', 'username', 'fullname'] }]
        })
          .then(result => {
            if (result.count > 0) {
              let points;
              let typePolygon = 0;

              console.log('typePolygon', typePolygon);
              _.forEach(result.rows, function(item) {
                let itemPoints;

                if (item.dataValues.points.type === 'MultiPolygon') {
                  itemPoints = item.dataValues.points.coordinates;
                  typePolygon = 1;
                } else {
                  itemPoints = [item.dataValues.points.coordinates];
                }

                if (points) {
                  points = _.concat(points, itemPoints);
                } else {
                  points = itemPoints;
                }
              });
              // if( _.size(points) < 2 && typePolygon === 0)
              // {
              //   resolve(
              //     {
              //       "type": "Polygon",
              //       "coordinates":points
              //     }
              //   )
              // }
              // else{
              resolve({
                type: 'MultiPolygon',
                coordinates: points
              });
              // }
            } else {
              resolve({});
            }
          })
          .catch(err => {
            reject(ErrorHelpers.errorReject(err, 'getListError', 'VillageService'));
          });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'getListError', 'VillageService'));
      }
    }),
  get_one: param =>
    new Promise((resolve, reject) => {
      try {
        // console.log("Menu Model param: %o | id: ", param, param.id)
        const id = param.id;
        // const att = filterHelpers.atrributesHelper(param.attributes, ['usersCreatorId']);

        MODELS.findOne(villages, {
          where: { id: id },
          include: [
            {
              model: wards,
              as: 'wards',
              required: true,
              attributes: ['id', 'wardName', 'points'],
              include: [
                {
                  model: districts,
                  as: 'districts',
                  required: true,
                  attributes: ['id', 'districtName', 'points'],
                  include: [{ model: provinces, as: 'provinces', attributes: ['id', 'provinceName'] }]
                }
              ]
            }
            // { model: users, as: 'usersCreator', attributes: { exclude: ['password'] } },
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
            reject(ErrorHelpers.errorReject(err, 'getInfoError', 'villageService'));
          });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'getInfoError', 'villageService'));
      }
    }),
  create: async param => {
    let finnalyResult;

    try {
      const entity = param.entity;

      console.log('villageModel create: ', entity);
      let whereFilter = {
        villageName: entity.villageName,
        wardsId: entity.wardsId
      };

      whereFilter = await filterHelpers.makeStringFilterAbsolutely(['villageName'], whereFilter, 'villages');

      // const whereFiltervillageIdentificationCode = {
      //   villageIdentificationCode: entity.villageIdentificationCode
      //   // districtsId: entity.districtsId
      // };

      const infoArr = Array.from(
        await Promise.all([
          preCheckHelpers.createPromiseCheckNew(
            MODELS.findOne(villages, {
              where: whereFilter
            }),
            entity.villageIdentificationCode ? true : false,
            TYPE_CHECK.CHECK_DUPLICATE,
            { parent: 'api.village.name' }
          )
          // preCheckHelpers.createPromiseCheckNew(
          //   MODELS.findOne(villages, {
          //     where: whereFiltervillageIdentificationCode
          //   }),
          //   entity.villageName ? true : false,
          //   TYPE_CHECK.CHECK_DUPLICATE,
          //   { parent: 'api.village.identificationCode' }
          // )
        ])
      );

      if (!preCheckHelpers.check(infoArr)) {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'getInfoError',
          message: 'Không xác thực được thông tin gửi lên'
        });
      }

      finnalyResult = await MODELS.create(villages, entity).catch(error => {
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
      ErrorHelpers.errorThrow(error, 'crudError', 'villageService');
    }

    return { result: finnalyResult };
  },
  update: async param => {
    let finnalyResult;

    try {
      const entity = param.entity;

      const foundVillage = await MODELS.findOne(villages, {
        where: {
          id: param.id
        }
      }).catch(error => {
        throw preCheckHelpers.createErrorCheck(
          { typeCheck: TYPE_CHECK.GET_INFO, modelStructure: { parent: 'villages' } },
          error
        );
      });

      if (foundVillage) {
        let whereFilter = {
          id: { $ne: param.id },
          villageName: entity.villageName || foundVillage.villageName,
          wardsId: entity.wardsId || foundVillage.wardsId
        };

        // whereFilter = await filterHelpers.makeStringFilterAbsolutely(['villageName'], whereFilter, 'villages');

        // const whereFiltervillageIdentificationCode = {
        //   id: { $ne: param.id },
        //   villageIdentificationCode: entity.villageIdentificationCode || foundVillage.villageIdentificationCode
        //   // districtsId: entity.districtsId || foundvillage.districtsId,
        // };

        const infoArr = Array.from(
          await Promise.all([
            preCheckHelpers.createPromiseCheckNew(
              MODELS.findOne(villages, {
                where: whereFilter
              }),
              entity.villageName || entity.wardsId ? true : false,
              TYPE_CHECK.CHECK_DUPLICATE,
              { parent: 'api.village.name' }
            )
            // preCheckHelpers.createPromiseCheckNew(
            //   MODELS.findOne(villages, {
            //     where: whereFiltervillageIdentificationCode
            //   }),
            //   entity.villageIdentificationCode || entity.districtsId ? true : false,
            //   TYPE_CHECK.CHECK_DUPLICATE,
            //   { parent: 'api.village.identificationCode' }
            // )
          ])
        );

        if (!preCheckHelpers.check(infoArr)) {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'getInfoError',
            message: 'Không xác thực được thông tin gửi lên'
          });
        }
        console.log('===update xong====', entity);
        await MODELS.update(villages, entity, { where: { id: Number(param.id) } }).catch(error => {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'crudError',
            error
          });
        });

        finnalyResult = await MODELS.findOne(villages, { where: { id: param.id } }).catch(error => {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'crudInfo',
            error
          });
        });

        if (!finnalyResult) {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'crudInfo'
          });
        }
      } else {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudNotExisted'
        });
      }
    } catch (error) {
      ErrorHelpers.errorThrow(error, 'crudError', 'villageService');
    }

    return { result: finnalyResult };
  },
  update_status: param =>
    new Promise((resolve, reject) => {
      try {
        // console.log('block id', param.id);
        const id = param.id;
        const entity = param.entity;

        MODELS.findOne(villages, {
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
              MODELS.update(villages, entity, {
                where: { id: id }
              })
                .then(() => {
                  // console.log("rowsUpdate: ", rowsUpdate)
                  MODELS.findOne(villages, { where: { id: param.id } })
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
    }),
  delete: async param => {
    try {
      console.log('delete id', param.id);

      const foundvillage = await MODELS.findOne(villages, {
        where: {
          id: param.id
        }
      }).catch(error => {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'getInfoError',
          message: 'Lấy thông tin của địa điểm thất bại!',
          error
        });
      });

      if (!foundvillage) {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudNotExisted'
        });
      } else {
        await MODELS.destroy(villages, { where: { id: parseInt(param.id) } });

        const villageAfterDelete = await MODELS.findOne(villages, { where: { Id: param.id } }).catch(err => {
          ErrorHelpers.errorThrow(err, 'crudError', 'villageService');
        });

        if (villageAfterDelete) {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'deleteError'
          });
        }
      }
    } catch (err) {
      ErrorHelpers.errorThrow(err, 'crudError', 'villageService');
    }

    return { status: 1 };
  },
  get_all: param =>
    new Promise((resolve, reject) => {
      try {
        // console.log("filter:", JSON.parse(param.filter))
        let filter = {};
        let sort = [['id', 'ASC']];

        if (param.filter) filter = param.filter;

        if (param.sort) sort = param.sort;

        MODELS.findAll(villages, {
          where: filter,
          order: sort
        })
          .then(result => {
            // console.log("result: ", result)
            resolve(result);
          })
          .catch(err => {
            reject(ErrorHelpers.errorReject(err, 'getListError', 'villageService'));
          });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'getListError', 'villageService'));
      }
    }),
  bulk_create: async param => {
    let finnalyResult;

    try {
      const entity = param.entity;
      console.log('emtity', entity);
      if (entity.villages) {
        finnalyResult = await Promise.all(
          entity.villages.map(element => {
            console.log('status', element.status, entity.villageIdentificationCode);

            return MODELS.createOrUpdate(
              villages,
              {
                wardsId: entity.wardsId,
                villageName: element.villageName,
                userCreatorsId: entity.userCreatorsId,
                status: element.status,
                villageIdentificationCode: element.villageIdentificationCode
              },
              {
                where: {
                  villageName: element.villageName,
                  wardsId: entity.wardsId
                }
              }
            ).catch(error => {
              throw new ApiErrors.BaseError({
                statusCode: 202,
                type: 'crudError',
                error
              });
            });
          })
        );
      }
    } catch (error) {
      ErrorHelpers.errorThrow(error, 'crudError', 'WardService');
    }

    return { result: finnalyResult ? true : false };
  }
};
