import MODELS from '../models/models';
import models from '../entity/index';
import _ from 'lodash';
import * as ApiErrors from '../errors';
import ErrorHelpers from '../helpers/errorHelpers';
import filterHelpers from '../helpers/filterHelpers';
import preCheckHelpers, { TYPE_CHECK } from '../helpers/preCheckHelpers';
import { required } from 'joi';

const { sequelize, /* Op, */ users, districts, provinces, wards } = models;

export default {
  update_all_centerPoint: async () => {
    const result = await sequelize
      .query(
        `SELECT  id, ST_AsText(ST_Centroid(ST_GeomFromText(ST_AsText(ST_GeomFromGeoJson(wards.points))))) AS centerPoint  from wards  `,
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
          `UPDATE wards SET centerPoint = '{"Lat":${arrayPoint[1]},"Long":${arrayPoint[0]}}' WHERE (id = ${e.id})	;`
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
        const att = filterHelpers.atrributesHelper(attributes);

        console.log(filter);
        try {
          whereFilter = filterHelpers.combineFromDateWithToDate(whereFilter);
        } catch (error) {
          reject(error);
        }

        const perPage = range[1] - range[0] + 1;
        const page = Math.floor(range[0] / perPage);

        whereFilter = await filterHelpers.makeStringFilterRelatively(['wardName'], whereFilter, 'wards');

        if (!whereFilter) {
          whereFilter = { ...filter };
        }

        let whereDistrictFilter;

        if (whereFilter.provincesId) {
          whereDistrictFilter = {
            provincesId: whereFilter.provincesId
          };

          whereFilter = _.omit(whereFilter, ['provincesId']);
        }

        console.log('where', whereFilter);

        MODELS.findAndCountAll(wards, {
          where: whereFilter,
          order: sort,
          attributes: att,
          offset: range[0],
          limit: perPage,
          distinct: true,
          include: [
            {
              model: districts,
              as: 'districts',
              where: whereDistrictFilter,
              attributes: ['id', 'districtName'],
              required: true,
              include: [{ model: provinces, as: 'provinces', required: true, attributes: ['id', 'provinceName'] }]
            },
            { model: users, required: true, as: 'userCreators', attributes: ['id', 'username', 'fullname'] }
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
            reject(ErrorHelpers.errorReject(err, 'getListError', 'WardService'));
          });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'getListError', 'WardService'));
      }
    }),
  get_list_multi: param =>
    new Promise(async (resolve, reject) => {
      try {
        const { filter, attributes } = param;
        let whereFilter = filter;
        const att = filterHelpers.atrributesHelper(attributes);
        console.log('where', whereFilter);
        MODELS.findAndCountAll(wards, {
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

        MODELS.findOne(wards, {
          where: { id: id },
          attributes: att,
          include: [
            {
              model: districts,
              as: 'districts',
              required: true,
              attributes: ['id', 'districtName', 'points'],
              include: [
                {
                  model: provinces,
                  as: 'provinces',
                  required: true,
                  attributes: ['id', 'provinceName', 'points']
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
            reject(ErrorHelpers.errorReject(err, 'getInfoError', 'WardService'));
          });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'getInfoError', 'WardService'));
      }
    }),
  create: async param => {
    let finnalyResult;

    try {
      let entity = param.entity;

      if (entity.points && entity.points !== '' && entity.points !== null) {
        entity = { ...entity, ...{ points: JSON.parse(entity.points) } };
      }
      console.log('wardModel create: ', entity);
      let whereFilter = {
        wardName: entity.wardName,
        districtsId: entity.districtsId
      };

      whereFilter = await filterHelpers.makeStringFilterAbsolutely(['wardName'], whereFilter, 'wards');

      const whereFilterwardIdentificationCode = {
        wardIdentificationCode: entity.wardIdentificationCode
        // districtsId: entity.districtsId
      };

      const infoArr = Array.from(
        await Promise.all([
          preCheckHelpers.createPromiseCheckNew(
            MODELS.findOne(wards, { attributes: ['id'], where: whereFilter }),
            entity.wardIdentificationCode ? true : false,
            TYPE_CHECK.CHECK_DUPLICATE,
            { parent: 'api.wards.name' }
          ),
          preCheckHelpers.createPromiseCheckNew(
            MODELS.findOne(wards, { attributes: ['id'], where: whereFilterwardIdentificationCode }),
            entity.wardName ? true : false,
            TYPE_CHECK.CHECK_DUPLICATE,
            { parent: 'api.wards.identificationCode' }
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

      finnalyResult = await MODELS.create(wards, entity).catch(error => {
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
      ErrorHelpers.errorThrow(error, 'crudError', 'WardService');
    }

    return { result: finnalyResult };
  },
  bulk_create: async param => {
    let finnalyResult;

    try {
      const entity = param.entity;

      if (entity.wards) {
        finnalyResult = await Promise.all(
          entity.wards.map(element => {
            return MODELS.createOrUpdate(
              wards,
              {
                districtsId: entity.districtsId,
                wardName: element.wardName,
                userCreatorsId: entity.userCreatorsId,
                status: element.status,
                wardIdentificationCode: element.wardIdentificationCode
              },
              {
                where: { wardName: element.wardName, districtsId: entity.districtsId }
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
  },
  update: async param => {
    let finnalyResult;

    try {
      let entity = param.entity;

      if (entity.points && entity.points !== '' && entity.points !== null) {
        entity = { ...entity, ...{ points: JSON.parse(entity.points) } };
      }
      console.log('Ward update: ', entity);

      const foundWard = await MODELS.findOne(wards, {
        where: {
          id: param.id
        }
      }).catch(error => {
        throw preCheckHelpers.createErrorCheck(
          { typeCheck: TYPE_CHECK.GET_INFO, modelStructure: { parent: 'wards' } },
          error
        );
      });

      if (foundWard) {
        let whereFilter = {
          id: { $ne: param.id },
          wardName: entity.wardName || foundWard.wardName,
          districtsId: entity.districtsId || foundWard.districtsId
        };

        //   whereFilter = await filterHelpers.makeStringFilterAbsolutely(['wardName'], whereFilter, 'wards');

        const infoArr = Array.from(
          await Promise.all([
            preCheckHelpers.createPromiseCheckNew(
              MODELS.findOne(wards, { attributes: ['id'], where: whereFilter }),
              entity.wardName || entity.districtsId ? true : false,
              TYPE_CHECK.CHECK_DUPLICATE,
              { parent: 'api.wards.name' }
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
        console.log('===update xong====', entity);
        await MODELS.update(wards, entity, { where: { id: Number(param.id) } }).catch(error => {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'crudError',
            error
          });
        });

        finnalyResult = await MODELS.findOne(wards, { where: { id: param.id } }).catch(error => {
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
      ErrorHelpers.errorThrow(error, 'crudError', 'WardService');
    }

    return { result: finnalyResult };
  },
  update_status: param =>
    new Promise((resolve, reject) => {
      try {
        // console.log('block id', param.id);
        const id = param.id;
        const entity = param.entity;

        MODELS.findOne(wards, {
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
              MODELS.update(wards, entity, {
                where: { id: id }
              })
                .then(() => {
                  // console.log("rowsUpdate: ", rowsUpdate)
                  MODELS.findOne(wards, { where: { id: param.id } })
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

      const foundWard = await MODELS.findOne(wards, {
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

      if (!foundWard) {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudNotExisted'
        });
      } else {
        await MODELS.destroy(wards, { where: { id: parseInt(param.id) } });

        const wardAfterDelete = await MODELS.findOne(wards, { where: { Id: param.id } }).catch(err => {
          ErrorHelpers.errorThrow(err, 'crudError', 'WardService');
        });

        if (wardAfterDelete) {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'deleteError'
          });
        }
      }
    } catch (err) {
      ErrorHelpers.errorThrow(err, 'crudError', 'WardService');
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

        MODELS.findAll(wards, {
          where: filter,
          order: sort
        })
          .then(result => {
            // console.log("result: ", result)
            resolve(result);
          })
          .catch(err => {
            reject(ErrorHelpers.errorReject(err, 'getListError', 'WardService'));
          });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'getListError', 'WardService'));
      }
    })
};
