import models from '../entity/index';
import Promise from '../utils/promise';
import * as ApiErrors from '../errors';

const { menus } = models;

/**
 * MenuEntity Class
 */
class MenuEntity {
  /**
   *
   * @param {Object} options
   */
  static count(options) {
    return Promise.try(() => {
      return menus.count(options)
    }).catch(error => {
      throw new ApiErrors.BaseError({
        statusCode: 202,
        type: 'getListError',
        error,
        name: 'UserEntity'
      })
    })
  }

  /**
   *
   * @param {Object} options
   */
  static findAndCountAll(options) {
    return Promise.try(() => {
      return menus.findAndCountAll(options)
    }).catch(error => {
      throw new ApiErrors.BaseError({
        statusCode: 202,
        type: 'getListError',
        error,
        name: 'UserEntity'
      })
    })
  }

  /**
   *
   * @param {Object} entity
   */
  static create(entity) {
    return Promise.try(() => {
      return menus.create(entity)
    }).catch(error => {
      throw new ApiErrors.BaseError({
        statusCode: 202,
        type: 'crudError',
        error,
        name: 'UserEntity'
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
      return menus.update(entity, options)
        .catch(error => {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'crudError',
            error,
            name: 'UserEntity'
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
      return menus.destroy(options)
    }).catch(error => {
      throw new ApiErrors.BaseError({
        statusCode: 202,
        type: 'deleteError',
        error,
        name: 'UserEntity'
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
      return menus.findOne(options)
    }).catch(error => {
      throw new ApiErrors.BaseError({
        statusCode: 202,
        type: 'getInfoError',
        error,
        name: 'UserEntity'
      })
    })
  }

  /**
   *
   * @param {Object} options
   */
  static findAll(options) {
    return Promise.try(() => {
      return menus.findAll(options)
    }).catch(error => {
      throw new ApiErrors.BaseError({
        statusCode: 202,
        type: 'getListError',
        error,
        name: 'UserEntity'
      })
    })
  }
}

export default MenuEntity;
