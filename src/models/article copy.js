import models from '../entity/index';
import Promise from '../utils/promise';
import * as ApiErrors from '../errors';

const { article } = models;

/**
 * ArticleEntity Class
 */
class ArticleEntity {
  /**
   *
   * @param {Object} options
   */
  static count(options) {
    return Promise.try(() => {
      return article.count(options)
    }).catch(error => {
      throw new ApiErrors.BaseError({
        statusCode: 202,
        type: 'getListError',
        error,
        name: 'ArticleEntity'
      })
    })
  }

  /**
   *
   * @param {Object} options
   */
  static findAndCountAll(options) {
    return Promise.try(() => {
      return article.findAndCountAll(options)
    }).catch(error => {
      throw new ApiErrors.BaseError({
        statusCode: 202,
        type: 'getListError',
        error,
        name: 'ArticleEntity'
      })
    })
  }

  /**
   *
   * @param {Object} entity
   */
  static create(entity) {
    return Promise.try(() => {
      return article.create(entity)
    })
      .catch(error => {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudError',
          error,
          name: 'ArticleEntity'
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
      return article.update(entity, options)
        .catch(error => {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'crudError',
            error,
            name: 'ArticleEntity'
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
      return article.destroy(options)
    }).catch(error => {
      throw new ApiErrors.BaseError({
        statusCode: 202,
        type: 'deleteError',
        error,
        name: 'ArticleEntity'
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
      return article.findOne(options)
    })
      .catch(error => {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'getInfoError',
          error,
          name: 'ArticleEntity'
        })
      })
  }

  /**
   *
   * @param {Object} options
   */
  static findAll(options) {
    return Promise.try(() => {
      return article.findAll(options)
    })
      .catch(error => {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'getListError',
          error,
          name: 'ArticleEntity'
        })
      })
  }

  /**
   *
   * @param {*} options
   */
  static findOrCreate(options) {
    return Promise.try(() => {
      return article.findOrCreate(options)
      // .spread(async (findReportImExCreate, created) => {
    }).catch(error => {
      throw new ApiErrors.BaseError({
        statusCode: 202,
        type: 'getListError',
        error,
        name: 'ArticleEntity'
      })
    })
  }
}

export default ArticleEntity;
