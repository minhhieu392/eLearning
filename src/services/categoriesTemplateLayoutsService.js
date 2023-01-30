import Model from '../models/models'
import _ from 'lodash';
import models from '../entity/index'
import * as ApiErrors from '../errors';
import ErrorHelpers from '../helpers/errorHelpers';
import viMessage from '../locales/vi';
import filterHelpers from '../helpers/filterHelpers';
import preCheckHelpers, { TYPE_CHECK } from '../helpers/preCheckHelpers';

const {  sequelize, categories, users, sites,categoriesTemplateLayouts /* places, groupPlaces */ } = models;

export default {
  create: async param => {
    let finnalyResult;

    try {
      const entity = param.entity;

      console.log("cateogriesTemplateLayouts create: ", entity)

      finnalyResult = await Model.create(categoriesTemplateLayouts,param.entity).catch(error => {
        throw (new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudError',
          error,
        }));
      });

      if (!finnalyResult) {
        throw (new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudInfo',
          message: viMessage['api.message.infoAfterCreateError'],
        }));
      }

    } catch (error) {
      ErrorHelpers.errorThrow(error, 'crudError', 'cateogriesTemplateLayoutsService');
    }

    return { result: finnalyResult };
  },
  update: async param => {
    let finnalyResult;

    try {
      const entity = param.entity;

      console.log("cateogriesTemplateLayoutsService update: ", entity)

      const foundGateway = await Model.findOne(categoriesTemplateLayouts,{
        where: {
          "id": param.id
        }
      }).catch(error => { throw preCheckHelpers.createErrorCheck({ typeCheck: TYPE_CHECK.GET_INFO, modelStructure: { parent: 'categoriesTemplateLayouts' } }, error) });

      if (foundGateway) {
        await Model.update(categoriesTemplateLayouts,
          entity,
          { where: { id: parseInt(param.id) } }
        ).catch(error => {
          throw (new ApiErrors.BaseError({
            statusCode: 202,
            type: 'crudError',
            error,
          }));
        });

        finnalyResult = await Model.findOne(categoriesTemplateLayouts,{ where: { Id: param.id } }).catch(error => {
          throw (new ApiErrors.BaseError({
            statusCode: 202,
            type: 'crudInfo',
            message: viMessage['api.message.infoAfterEditError'],
            error,
          }));
        })

        if (!finnalyResult) {
          throw (new ApiErrors.BaseError({
            statusCode: 202,
            type: 'crudInfo',
            message: viMessage['api.message.infoAfterEditError'],
          }));
        }

      } else {
        throw (new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudNotExisted',
          message: viMessage['api.message.notExisted'],
        }));
      }
    } catch (error) {
      ErrorHelpers.errorThrow(error, 'crudError', 'ArticleService');
    }

    return { result: finnalyResult };
  },
  createOrUpdate: async param => {
    let finnalyResult;

    try {
      const entity = param.entity;
      const {categoriesId} = entity;

      // console.log("cateogriesTemplateLayouts create: ", entity)
      // console.log("cateogriesTemplateLayouts _.omit(entity,['id']): ", _.omit(entity,['id']))
      finnalyResult = await Model.createOrUpdate(categoriesTemplateLayouts,_.omit(entity,['id']),
      {where: {id:entity.id}})
      .then(
        data => {
          console.log("Dgdfgdgdf",data)
        }

      )
      .catch(error => {
        throw (new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudError',
          error,
        }));
      });
     /* console.log("finnalyResult",finnalyResult)
      if (!finnalyResult) {
        throw (new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudInfo',
          message: viMessage['api.message.infoAfterCreateError'],
        }));
      }
      */
     finnalyResult = await Model.findOne(categoriesTemplateLayouts,{
       where: { categoriesId }

    }).catch(err => {
        ErrorHelpers.errorThrow(err, 'getInfoError', 'categoriesTemplateLayoutsService')
      });
    } catch (error) {
      ErrorHelpers.errorThrow(error, 'crudError', 'cateogriesTemplateLayoutsService');
    }

    console.log("finnalyResult",finnalyResult)
    return { result: finnalyResult };
  },
  update_status: param =>
  new Promise((resolve, reject) => {
    try {
      console.log('block id', param.id);
      const id = param.id;
      const entity = param.entity;

      Model.findOne(categoriesTemplateLayouts, {
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
            Model.update(categoriesTemplateLayouts, entity, {
              where: { id: id }
            })
              .then(() => {
                // console.log("rowsUpdate: ", rowsUpdate)
                Model.findOne(categoriesTemplateLayouts, { where: { id: param.id } })
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
                    reject(ErrorHelpers.errorReject(err, 'crudError', 'categoriesTemplateLayoutsServices'));
                  });
              })
              .catch(err => {
                reject(ErrorHelpers.errorReject(err, 'crudError', 'categoriesTemplateLayoutsServices'));
              });
          }
        })
        .catch(err => {
          reject(ErrorHelpers.errorReject(err, 'crudError', 'categoriesTemplateLayoutsServices'));
        });
    } catch (err) {
      reject(ErrorHelpers.errorReject(err, 'crudError', 'categoriesTemplateLayoutsServices'));
    }
  }),
}
