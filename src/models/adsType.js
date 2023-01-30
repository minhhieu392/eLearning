import models from '../entity/index';
import Promise from '../utils/promise';
import * as ApiErrors from '../errors';

const { adsType } = models;

/**
 * AdsTypeEntity Class
 */
class AdsTypeEntity {
  /**
   *
   * @param {Object} options
   */
  static count(options) {
    return Promise.try(() => {
      return adsType.count(options)
    }).catch(error => {
      throw new ApiErrors.BaseError({
        statusCode: 202,
        type: 'getListError',
        error,
        name: 'AdsTypeEntity'
      })
    })
  }

  /**
   *
   * @param {Object} options
   */
  static findAndCountAll(options) {
    return Promise.try(() => {
      return adsType.findAndCountAll(options)
    }).catch(error => {
      throw new ApiErrors.BaseError({
        statusCode: 202,
        type: 'getListError',
        error,
        name: 'AdsTypeEntity'
      })
    })
  }

  /**
   *
   * @param {Object} entity
   */
  static create(entity) {
    return Promise.try(() => {
      return adsType.create(entity)
    })
      .catch(error => {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudError',
          error,
          name: 'AdsTypeEntity'
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
      return adsType.update(entity, options)
        .catch(error => {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'crudError',
            error,
            name: 'AdsTypeEntity'
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
      return adsType.destroy(options)
    }).catch(error => {
      throw new ApiErrors.BaseError({
        statusCode: 202,
        type: 'deleteError',
        error,
        name: 'AdsTypeEntity'
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
      return adsType.findOne(options)
    })
      .catch(error => {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'getInfoError',
          error,
          name: 'AdsTypeEntity'
        })
      })
  }

  /**
   *
   * @param {Object} options
   */
  static findAll(options) {
    return Promise.try(() => {
      return adsType.findAll(options)
    })
      .catch(error => {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'getListError',
          error,
          name: 'AdsTypeEntity'
        })
      })
  }

  /**
   *
   * @param {*} options
   */
  static findOrCreate(options) {
    return Promise.try(() => {
      return adsType.findOrCreate(options)
      // .spread(async (findReportImExCreate, created) => {
    }).catch(error => {
      throw new ApiErrors.BaseError({
        statusCode: 202,
        type: 'getListError',
        error,
        name: 'AdsTypeEntity'
      })
    })
  }
}

export default AdsTypeEntity;
