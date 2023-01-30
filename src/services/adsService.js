import Model from '../models/models';
import models from '../entity/index';
import * as ApiErrors from '../errors';
import ErrorHelpers from '../helpers/errorHelpers';
import viMessage from '../locales/vi';
import filterHelpers from '../helpers/filterHelpers';
import preCheckHelpers, { TYPE_CHECK } from '../helpers/preCheckHelpers';

const { /* sequelize, */ sites, users, ads, adsPositions, adsType, languages } = models;

export default {
  get_list: async param => {
    let finnalyResult;

    try {
      const { filter, range, sort, auth, attributes } = param;
      let whereFilter = filter;

      console.log(attributes);
      try {
        whereFilter = await filterHelpers.combineFromDateWithToDate(whereFilter);
      } catch (error) {
        throw error;
      }

      const perPage = range[1] - range[0] + 1;
      const page = Math.floor(range[0] / perPage);

      whereFilter = await filterHelpers.makeStringFilterRelatively(['title', 'url', 'contents'], whereFilter, 'ads');

      if (!whereFilter) {
        whereFilter = { ...filter };
      }
      const att = filterHelpers.atrributesHelper(attributes);

      console.log(att);
      // let whereSite = _.pick(whereFilter, ['placesId', 'sitesId']);

      //  whereSite = lodashHelpers.rename(whereSite, [['sitesId', 'id']]);

      // delete whereFilter['sitesId'];
      delete whereFilter['placesId'];

      console.log('where', whereFilter);
      /* if(whereSite)
      {
        whereSite ={...whereSite,...{status:true}}
      }*/

      // console.log('whereSite====', whereSite);
      // const include = await filterHelpers.createIncludeWithAuthorization(auth, [
      //   [
      //     {
      //       model: sites,
      //       as: 'sites',
      //       attributes: ['id', 'name'],
      //       required: true,
      //     }
      //   ],
      //   [
      //     { model: users, as: 'usersCreator', attributes: ["id", "username", "fullname"] },
      //   ],
      //   [
      //     {
      //       model: adsPositions,
      //       as: 'adsPositions',
      //       attributes: ['id', 'name'],
      //       required: true
      //     }
      //   ],
      //   [
      //     {
      //       model: adsType,
      //       attributes: ['id', 'name'],
      //       as: 'adsType',
      //       required: true
      //     }
      //   ],
      //   [
      //     {
      //       model: languages,
      //       attributes: ['id', 'languageName','languageCode'],
      //       as: 'languages',
      //       required: true
      //     }
      //   ]
      // ]);

      const result = await Model.findAndCountAll(ads, {
        where: whereFilter,
        order: sort,
        offset: range[0],
        limit: perPage,
        attributes: att,
        logging: true,
        include: [
          {
            model: sites,
            as: 'sites',
            attributes: ['id', 'name'],
            required: true
          },
          { model: users, as: 'usersCreator', attributes: ['id', 'username', 'fullname'] },
          {
            model: adsPositions,
            as: 'adsPositions',
            attributes: ['id', 'name'],
            required: true
          },
          {
            model: adsType,
            attributes: ['id', 'name'],
            as: 'adsType',
            required: true
          },
          {
            model: languages,
            attributes: ['id', 'languageName', 'languageCode'],
            as: 'languages',
            required: true
          }
        ]
      }).catch(err => {
        ErrorHelpers.errorThrow(err, 'getListError', 'AdsService');
      });

      finnalyResult = {
        ...result,
        page: page + 1,
        perPage
      };
    } catch (err) {
      ErrorHelpers.errorThrow(err, 'getListError', 'AdsService');
    }

    return finnalyResult;
  },
  get_list_old: param =>
    new Promise(async (resolve, reject) => {
      try {
        const { filter, range, sort } = param;
        let whereFilter = filter;

        console.log(filter);
        try {
          whereFilter = filterHelpers.combineFromDateWithToDate(whereFilter);
        } catch (error) {
          reject(error);
        }

        const perPage = range[1] - range[0] + 1;
        const page = Math.floor(range[0] / perPage);

        whereFilter = await filterHelpers.makeStringFilterRelatively(['title', 'url', 'contents'], whereFilter, 'ads');

        if (!whereFilter) {
          whereFilter = { ...filter };
        }

        console.log('where', whereFilter);

        Model.findAndCountAll(ads, {
          where: whereFilter,
          order: sort,
          offset: range[0],
          limit: perPage,
          distinct: true,
          include: [
            {
              model: sites,
              as: 'sites',
              /* where: whereGroupGateway, */
              required: true
            },
            {
              model: users,
              as: 'usersCreator',
              /* where: whereGroupGateway, */
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
            reject(ErrorHelpers.errorReject(err, 'getListError', 'AdsService'));
          });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'getListError', 'AdsService'));
      }
    }),
  get_one: param =>
    new Promise((resolve, reject) => {
      try {
        // console.log("Menu Model param: %o | id: ", param, param.id)
        const id = param.id;

        const att = filterHelpers.atrributesHelper(param.attributes, ['usersCreatorId']);

        Model.findOne(ads, {
          where: { id },
          attributes: att,
          include: [
            {
              model: sites,
              as: 'sites',
              attributes: ['id', 'name'],
              required: true
            },
            {
              model: adsPositions,
              as: 'adsPositions',
              attributes: ['id', 'name'],
              required: true
            },
            {
              model: adsType,
              attributes: ['id', 'name'],
              as: 'adsType',
              required: true
            },
            {
              model: languages,
              attributes: ['id', 'languageName', 'languageCode'],
              as: 'languages',
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
            reject(ErrorHelpers.errorReject(err, 'getInfoError', 'AdsService'));
          });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'getInfoError', 'AdsService'));
      }
    }),
  create: async param => {
    let finnalyResult;

    try {
      const entity = param.entity;
      let whereFilter = {
        sitesId: entity.sitesId,
        title: entity.title
      };
      console.log('AdsService create: ', entity);
      whereFilter = await filterHelpers.makeStringFilterAbsolutely(['title'], whereFilter, 'ads');

      const infoArr = Array.from(
        await Promise.all([
          preCheckHelpers.createPromiseCheckNew(
            Model.findOne(ads, {
              attributes: ['id'],
              where: whereFilter
            }),
            entity.title ? true : false,
            TYPE_CHECK.CHECK_DUPLICATE,
            { parent: 'api.ads.title' }
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

      finnalyResult = await Model.create(ads, param.entity).catch(error => {
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
      ErrorHelpers.errorThrow(error, 'crudError', 'AdsService');
    }

    return { result: finnalyResult };
  },
  update: async param => {
    let finnalyResult;

    try {
      const entity = param.entity;

      console.log('AdsService update: ', entity);

      const foundGateway = await Model.findOne(ads, {
        where: {
          id: param.id
        }
      }).catch(error => {
        throw preCheckHelpers.createErrorCheck(
          { typeCheck: TYPE_CHECK.GET_INFO, modelStructure: { parent: 'sites' } },
          error
        );
      });

      if (foundGateway) {
        let whereFilter = {
          id: { $ne: param.id },
          sitesId: entity.sitesId || foundGateway.sitesId,
          title: entity.title || foundGateway.title
        };

        whereFilter = await filterHelpers.makeStringFilterAbsolutely(['title'], whereFilter, 'ads');

        const infoArr = Array.from(
          await Promise.all([
            preCheckHelpers.createPromiseCheckNew(
              Model.findOne(ads, {
                attributes: ['id'],
                where: whereFilter
              }),
              entity.title || entity.sitesId ? true : false,
              TYPE_CHECK.CHECK_DUPLICATE,
              { parent: 'api.ads.title' }
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

        await Model.update(ads, entity, { where: { id: parseInt(param.id) } }).catch(error => {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'crudError',
            error
          });
        });

        finnalyResult = await Model.findOne(ads, { where: { Id: param.id } }).catch(error => {
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
      ErrorHelpers.errorThrow(error, 'crudError', 'AdsService');
    }

    return { result: finnalyResult };
  },
  update_status: param =>
    new Promise((resolve, reject) => {
      try {
        console.log('block id', param.id);
        const id = param.id;
        const entity = param.entity;

        Model.findOne(ads, {
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
              Model.update(ads, entity, {
                where: { id: id }
              })
                .then(() => {
                  // console.log("rowsUpdate: ", rowsUpdate)
                  Model.findOne(ads, { where: { id: param.id } })
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
                      reject(ErrorHelpers.errorReject(err, 'crudError', 'adsServices'));
                    });
                })
                .catch(err => {
                  reject(ErrorHelpers.errorReject(err, 'crudError', 'adsServices'));
                });
            }
          })
          .catch(err => {
            reject(ErrorHelpers.errorReject(err, 'crudError', 'adsServices'));
          });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'crudError', 'adsServices'));
      }
    }),
  updateOrder: async param => {
    let finnalyResult;

    try {
      const entity = param.entity;

      console.log('MenuService updateOrder: ', entity.orders);

      const updateArr = Array.from(
        await Promise.all(
          entity.orders.map(item =>
            Model.update(
              ads,
              {
                orderBy: item.orderBy
              },
              { where: { id: Number(item.id) } }
            )
          )
        ).catch(error => {
          ErrorHelpers.errorThrow(error, 'crudError', 'MenusService');
        })
      );

      console.log('updateArr ', updateArr);
      if (!updateArr[0]) {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudError'
        });
      } else if (!updateArr[1]) {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudError'
        });
      }

      return { result: updateArr };
    } catch (error) {
      ErrorHelpers.errorThrow(error, 'crudError', 'MenusService');
    }

    return { result: finnalyResult };
  }
};
