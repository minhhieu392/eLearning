import models from '../entity/index';
import Promise from '../utils/promise';
import * as ApiErrors from '../errors';
import _ from 'lodash';

const { categoriesTemplateLayouts } = models;

/**
 * categoriesTemplateLayouts Class
 */
class categoriesTemplateLayoutsEntity {
  /**
   *
   * @param {Object} options
   */
  static count(options) {
    return Promise.try(() => {
      return categoriesTemplateLayouts.count(options)
    }).catch(error => {
      throw new ApiErrors.BaseError({
        statusCode: 202,
        type: 'getListError',
        error,
        name: 'categoriesTemplateLayoutsEntity'
      })
    })
  }

  /**
   *
   * @param {Object} options
   */
  static findAndCountAll(options) {
    return Promise.try(() => {
      return categoriesTemplateLayouts.findAndCountAll(options)
    }).catch(error => {
      throw new ApiErrors.BaseError({
        statusCode: 202,
        type: 'getListError',
        error,
        name: 'categoriesTemplateLayoutsEntity'
      })
    })
  }

  /**
   *
   * @param {Object} entity
   */
  static create(entity) {
    return Promise.try(() => {
      return categoriesTemplateLayouts.create(entity)
    })
      .catch(error => {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudError',
          error,
          name: 'categoriesTemplateLayoutsEntity'
        })
      })
  }

  /**
   *
   * @param {Object} entity
   * @param {Object} options
   */
  static update(entity, options) {
    return Promise.try(() => {
      return categoriesTemplateLayouts.update(entity, options)
        .catch(error => {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'crudError',
            error,
            name: 'categoriesTemplateLayoutsEntity'
          })
        })
    })
  }

  /**
   *
   * @param {Object} options
   */
  static destroy(options) {
    return Promise.try(() => {
      return categoriesTemplateLayouts.destroy(options)
    }).catch(error => {
      throw new ApiErrors.BaseError({
        statusCode: 202,
        type: 'deleteError',
        error,
        name: 'categoriesTemplateLayoutsEntity'
      })
    })
  }

  /**
   * Find one.
   *
   * @param {Object} options
   */
  static findOne(options) {
    return Promise.try(() => {
      return categoriesTemplateLayouts.findOne(options)
    })
      .catch(error => {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'getInfoError',
          error,
          name: 'categoriesTemplateLayoutsEntity'
        })
      })
  }

  /**
   *
   * @param {Object} options
   */
  static findAll(options) {
    return Promise.try(() => {
      return categoriesTemplateLayouts.findAll(options)
    })
      .catch(error => {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'getListError',
          error,
          name: 'categoriesTemplateLayoutsEntity'
        })
      })
  }

  /**
   *
   * @param {*} options
   */
  static findOrCreate(options) {
    return Promise.try(() => {
      return categoriesTemplateLayouts.findOrCreate(options)
      // .spread(async (findReportImExCreate, created) => {
    }).catch(error => {
      throw new ApiErrors.BaseError({
        statusCode: 202,
        type: 'getListError',
        error,
        name: 'categoriesTemplateLayoutsEntity'
      })
    })
  }

  /**
   *
   * @param {Object} entity
   * @param {Object} options
   */
  static createOrUpdate(entity, options) {
    return Promise.try(() => {
      console.log("entity, options: ", entity, options);

      return categoriesTemplateLayouts.findOne(options).then(foundItem => {

        // console.log("foundItem: ", foundItem);
        if (!foundItem) {
          const entityNew = _.omit(entity,['id']);

          return categoriesTemplateLayouts.create(entityNew).then(item => {
            return { item: item, created: true };
          });
        }
        else{
          if(entity.status === false)
          {
            console.log("delete: ", entity, options)

            return categoriesTemplateLayouts.destroy(options).then(item => {

              return { item: item, delete: true };
            });
          }
          else{
            return categoriesTemplateLayouts.update(_.omit(entity,['usersCreatorId']), options).then(item => {
              console.log("update: ", entity, options)
              return { item: item, created: false };
            });
          }

        }

      });
      // .spread(async (findReportImExCreate, created) => {
    }).catch(error => {
      throw new ApiErrors.BaseError({
        statusCode: 202,
        type: 'crudError',
        error,
        name: 'VaccinationQueueDetailsEntity'
      });
    });
  }

}

export default categoriesTemplateLayoutsEntity;
