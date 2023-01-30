import MODELS from '../models/models';
// import provinceModel from '../models/provinces'
import models from '../entity/index';
import * as ApiErrors from '../errors';
import ErrorHelpers from '../helpers/errorHelpers';
import lodashHelpers from '../helpers/lodashHelpers';
import _ from 'lodash';
import viMessage from '../locales/vi';
import filterHelpers from '../helpers/filterHelpers';
import preCheckHelpers, { TYPE_CHECK } from '../helpers/preCheckHelpers';

const { sequelize, provinces, users, districts, wards } = models;

export default {
  update_all_centerPoint: async () => {
    const result = await sequelize
      .query(
        `SELECT  id, ST_AsText(ST_Centroid(ST_GeomFromText(ST_AsText(ST_GeomFromGeoJson(districts.points))))) AS centerPoint  from districts  `,
        {
          type: sequelize.QueryTypes.SELECT
        }
      )
      .catch(err => {
        console.log('err', err);
      });

    console.log('result', result);
    result.map(async e => {
      if (e.centerPoint) {
        const newPoint = e.centerPoint.replace('POINT(', '').replace(')', '');
        const arrayPoint = newPoint.split(' ');

        await sequelize.query(
          `UPDATE districts SET centerPoint = '{"Lat":${arrayPoint[1]},"Long":${arrayPoint[0]}}' WHERE (id = ${e.id})	;`
        );
      }
    });

    return true;
  },
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

        const perPage = range[1] - range[0] + 1;
        const page = Math.floor(range[0] / perPage);
        const att = filterHelpers.atrributesHelper(attributes);

        whereFilter = await filterHelpers.makeStringFilterRelatively(['districtName'], whereFilter, 'districts');

        if (!whereFilter) {
          whereFilter = { ...filter };
        }

        console.log('where', whereFilter);

        MODELS.findAndCountAll(districts, {
          where: whereFilter,
          order: sort,
          offset: range[0],
          limit: perPage,
          distinct: true,
          attributes: att,
          include: [
            {
              model: provinces,
              as: 'provinces',
              attributes: ['id', 'provinceName'],
              required: true
            },
            // {
            //   model: wards,
            //   as: 'wards',
            //   attributes:['id','wardName','points','polygonCafe'],
            //   required: true
            // },
            {
              model: users,
              as: 'userCreators',
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
            reject(ErrorHelpers.errorReject(err, 'getListError', 'DistrictService'));
          });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'getListError', 'DistrictService'));
      }
    }),
  get_list_multi: param =>
    new Promise(async (resolve, reject) => {
      try {
        const { filter, attributes } = param;
        let whereFilter = filter;
        const att = filterHelpers.atrributesHelper(attributes);
        console.log('where', whereFilter);
        MODELS.findAndCountAll(districts, {
          where: whereFilter,
          attributes: ['points'],
          logging: console.log,
          include: [{ model: users, as: 'userCreators', required: true, attributes: ['id', 'username', 'fullname'] }]
        })
          .then(result => {
            if (result.count > 0) {
              let points;
              let typePolygon = 0;

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
            reject(ErrorHelpers.errorReject(err, 'getListError', 'ProvinceService'));
          });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'getListError', 'ProvinceService'));
      }
    }),
  get_one: param =>
    new Promise((resolve, reject) => {
      try {
        // console.log("Menu Model param: %o | id: ", param, param.id)
        const id = param.id;
        const att = filterHelpers.atrributesHelper(param.attributes, ['usersCreatorId']);

        MODELS.findOne(districts, {
          where: { id },
          attributes: att,
          include: [
            {
              model: provinces,
              as: 'provinces',
              attributes: ['id', 'provinceName'],
              required: true
            },
            {
              model: users,
              as: 'userCreators',
              attributes: ['id', 'username', 'fullname'],
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
            reject(ErrorHelpers.errorReject(err, 'getInfoError', 'DistrictService'));
          });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'getInfoError', 'DistrictService'));
      }
    }),
  create: async param => {
    let finnalyResult;

    try {
      let entity = param.entity;

      if (entity.points && entity.points !== '' && entity.points !== null) {
        entity = { ...entity, ...{ points: JSON.parse(entity.points) } };
      }

      console.log('DistrictService create: ', entity);
      let whereFilter = {
        districtName: entity.districtName,
        provincesId: entity.provincesId
      };

      whereFilter = await filterHelpers.makeStringFilterAbsolutely(['districtName'], whereFilter, 'districts');

      let whereFilterdistrictIdentificationCode = {
        districtIdentificationCode: entity.districtIdentificationCode
        // provincesId: entity.provincesId
      };

      const infoArr = Array.from(
        await Promise.all([
          preCheckHelpers.createPromiseCheckNew(
            MODELS.findOne(districts, {
              attributes: ['id'],
              where: whereFilter
            }),
            entity.districtName ? true : false,
            TYPE_CHECK.CHECK_DUPLICATE,
            { parent: 'api.district.name' }
          ),
          preCheckHelpers.createPromiseCheckNew(
            MODELS.findOne(districts, {
              attributes: ['id'],
              where: whereFilterdistrictIdentificationCode
            }),
            entity.districtIdentificationCode ? true : false,
            TYPE_CHECK.CHECK_DUPLICATE,
            { parent: 'api.district.identificationCode' }
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

      finnalyResult = await MODELS.create(districts, entity).catch(error => {
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
      ErrorHelpers.errorThrow(error, 'crudError', 'DistrictService');
    }

    return { result: finnalyResult };
  },
  update: async param => {
    let finnalyResult;

    try {
      let entity = param.entity;

      if (entity.points && entity.points !== '' && entity.points !== null) {
        entity = { ...entity, ...{ points: JSON.parse(entity.points) } };
      }
      console.log('DistrictService update: ', entity);

      const foundGateway = await MODELS.findOne(districts, {
        where: {
          id: param.id
        }
      }).catch(error => {
        throw preCheckHelpers.createErrorCheck(
          { typeCheck: TYPE_CHECK.GET_INFO, modelStructure: { parent: 'districts' } },
          error
        );
      });

      if (foundGateway) {
        let whereFilter = {
          id: { $ne: param.id },
          districtName: entity.districtName || foundGateway.districtName,
          provincesId: entity.provincesId || foundGateway.provincesId
        };

        whereFilter = await filterHelpers.makeStringFilterAbsolutely(['districtName'], whereFilter, 'districts');

        const whereFilterdistrictIdentificationCode = {
          id: { $ne: param.id },
          districtIdentificationCode: entity.districtIdentificationCode || foundGateway.districtIdentificationCode
          // provincesId: entity.provincesId || foundGateway.provincesId,
        };

        const infoArr = Array.from(
          await Promise.all([
            preCheckHelpers.createPromiseCheckNew(
              MODELS.findOne(districts, {
                attributes: ['id'],
                where: whereFilter
              }),
              entity.districtName || entity.provincesId ? true : false,
              TYPE_CHECK.CHECK_DUPLICATE,
              { parent: 'api.district.name' }
            )
            // preCheckHelpers.createPromiseCheckNew(
            //   MODELS.findOne(districts, {
            //     where: whereFilterdistrictIdentificationCode
            //   }),
            //   entity.districtIdentificationCode || entity.provincesId ? true : false,
            //   TYPE_CHECK.CHECK_DUPLICATE,
            //   { parent: 'api.district.identificationCode' }
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

        await MODELS.update(districts, entity, { where: { id: parseInt(param.id) } }).catch(error => {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'crudError',
            error
          });
        });

        finnalyResult = await MODELS.findOne(districts, { where: { id: param.id } }).catch(error => {
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
      ErrorHelpers.errorThrow(error, 'crudError', 'DistrictService');
    }

    return { result: finnalyResult };
  },
  update_status: param =>
    new Promise((resolve, reject) => {
      try {
        // console.log('block id', param.id);
        const id = param.id;
        const entity = param.entity;

        MODELS.findOne(districts, {
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
              MODELS.update(districts, entity, {
                where: { id: id }
              })
                .then(() => {
                  // console.log("rowsUpdate: ", rowsUpdate)
                  MODELS.findOne(districts, { where: { id: param.id } })
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
  delete: param =>
    new Promise((resolve, reject) => {
      try {
        console.log('delete id', param.id);
        const id = param.id;

        MODELS.findOne(districts, {
          where: {
            id
          }
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
              MODELS.destroy(districts, { where: { id: Number(param.id) } })
                .then(() => {
                  // console.log("rowsUpdate: ", rowsUpdate)
                  MODELS.findOne(districts, { where: { id: param.id } })
                    .then(result => {
                      if (result) {
                        reject(
                          new ApiErrors.BaseError({
                            statusCode: 202,
                            type: 'deleteError'
                          })
                        );
                      } else resolve({ status: 1 });
                    })
                    .catch(err => {
                      reject(ErrorHelpers.errorReject(err, 'crudError', 'DistrictService'));
                    });
                })
                .catch(err => {
                  reject(ErrorHelpers.errorReject(err, 'crudError', 'DistrictService'));
                });
            }
          })
          .catch(err => {
            reject(ErrorHelpers.errorReject(err, 'crudError', 'DistrictService'));
          });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'crudError', 'DistrictService'));
      }
    }),
  bulk_create: async param => {
    let finnalyResult;

    try {
      const entity = param.entity;
      console.log('entity', entity);
      if (entity.districts) {
        finnalyResult = await Promise.all(
          entity.districts.map(element => {
            console.log('status', element.status);

            return MODELS.createOrUpdate(
              districts,
              {
                provincesId: entity.provincesId,
                districtName: element.districtName,
                userCreatorsId: entity.userCreatorsId,
                status: element.status,
                districtIdentificationCode: element.districtIdentificationCode
              },
              {
                where: { districtName: element.districtName, provincesId: entity.provincesId }
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
