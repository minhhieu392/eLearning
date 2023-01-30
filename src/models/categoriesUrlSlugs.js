import models from '../entity/index';
import Promise from '../utils/promise';
import * as ApiErrors from '../errors';

const { categoriesUrlSlugs } = models;

/**
 * ArticleEntity Class
 */
class categoriesUrlSlugsEntity {
  /**
   *
   * @param {Object} options
   */
  static count(options) {
    return Promise.try(() => {
      return categoriesUrlSlugs.count(options)
    }).catch(error => {
      throw new ApiErrors.BaseError({
        statusCode: 202,
        type: 'getListError',
        error,
        name: 'categoriesUrlSlugsEntity'
      })
    })
  }

  /**
   *
   * @param {Object} options
   */
  static findAndCountAll(options) {
    return Promise.try(() => {
      return categoriesUrlSlugs.findAndCountAll(options)
    }).catch(error => {
      throw new ApiErrors.BaseError({
        statusCode: 202,
        type: 'getListError',
        error,
        name: 'categoriesUrlSlugsEntity'
      })
    })
  }

  /**
   *
   * @param {Object} entity
   */
  static create(entity) {
    return Promise.try(() => {
      return categoriesUrlSlugs.create(entity)
    })
      .catch(error => {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudError',
          error,
          name: 'categoriesUrlSlugsEntity'
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
      return categoriesUrlSlugs.update(entity, options)
        .catch(error => {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'crudError',
            error,
            name: 'categoriesUrlSlugsEntity'
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
      return categoriesUrlSlugs.destroy(options)
    }).catch(error => {
      throw new ApiErrors.BaseError({
        statusCode: 202,
        type: 'deleteError',
        error,
        name: 'categoriesUrlSlugsEntity'
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
      return categoriesUrlSlugs.findOne(options)
    })
      .catch(error => {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'getInfoError',
          error,
          name: 'categoriesUrlSlugsEntity'
        })
      })
  }

  /**
   *
   * @param {Object} options
   */
  static findAll(options) {
    return Promise.try(() => {
      return categoriesUrlSlugs.findAll(options)
    })
      .catch(error => {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'getListError',
          error,
          name: 'categoriesUrlSlugsEntity'
        })
      })
  }

  /**
   *
   * @param {*} options
   */
  static findOrCreate(options) {
    return Promise.try(() => {
      return categoriesUrlSlugs.findOrCreate(options)
      // .spread(async (findReportImExCreate, created) => {
    }).catch(error => {
      throw new ApiErrors.BaseError({
        statusCode: 202,
        type: 'getListError',
        error,
        name: 'categoriesUrlSlugsEntity'
      })
    })
  }
}

export default categoriesUrlSlugsEntity;
