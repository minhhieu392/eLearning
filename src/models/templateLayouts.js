import models from '../entity/index';
import Promise from '../utils/promise';
import * as ApiErrors from '../errors';

const { templateLayouts } = models;

/**
 * TemplateLayoutEntity Class
 */
class TemplateLayoutEntity {
  /**
   *
   * @param {Object} options
   */
  static count(options) {
    return Promise.try(() => {
      return templateLayouts.count(options)
    }).catch(error => {
      throw new ApiErrors.BaseError({
        statusCode: 202,
        type: 'getListError',
        error,
        name: 'TemplateLayoutEntity'
      })
    })
  }

  /**
   *
   * @param {Object} options
   */
  static findAndCountAll(options) {
    return Promise.try(() => {
      return templateLayouts.findAndCountAll(options)
    }).catch(error => {
      throw new ApiErrors.BaseError({
        statusCode: 202,
        type: 'getListError',
        error,
        name: 'TemplateLayoutEntity'
      })
    })
  }

  /**
   *
   * @param {Object} entity
   */
  static create(entity) {
    return Promise.try(() => {
      return templateLayouts.create(entity)
    })
      .catch(error => {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudError',
          error,
          name: 'TemplateLayoutEntity'
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
      return templateLayouts.update(entity, options)
        .catch(error => {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'crudError',
            error,
            name: 'TemplateLayoutEntity'
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
      return templateLayouts.destroy(options)
    }).catch(error => {
      throw new ApiErrors.BaseError({
        statusCode: 202,
        type: 'deleteError',
        error,
        name: 'TemplateLayoutEntity'
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
      return templateLayouts.findOne(options)
    })
      .catch(error => {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'getInfoError',
          error,
          name: 'TemplateLayoutEntity'
        })
      })
  }

  /**
   *
   * @param {Object} options
   */
  static findAll(options) {
    return Promise.try(() => {
      return templateLayouts.findAll(options)
    })
      .catch(error => {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'getListError',
          error,
          name: 'TemplateLayoutEntity'
        })
      })
  }

  /**
   *
   * @param {*} options
   */
  static findOrCreate(options) {
    return Promise.try(() => {
      return templateLayouts.findOrCreate(options)
      // .spread(async (findReportImExCreate, created) => {
    }).catch(error => {
      throw new ApiErrors.BaseError({
        statusCode: 202,
        type: 'getListError',
        error,
        name: 'TemplateLayoutEntity'
      })
    })
  }
}

export default TemplateLayoutEntity;
