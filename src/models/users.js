/* eslint-disable no-return-await */
import models from '../entity/index';
import Promise from '../utils/promise';
import * as ApiErrors from '../errors';
import CONFIG from '../config';
import CachedRedis from '../db/sequelize-redis';
import { fnCachedKey } from '../utils/helper';

const { users } = models;

let Users = users;
let MySequelizeRedis = null;

// if (CONFIG.CACHED_DB_RESDIS === 'true') {
//   MySequelizeRedis = CachedRedis.getInstance();

//   Users = MySequelizeRedis.sequelizeRedis.getModel(users, { ttl: Number(CONFIG.CACHED_DB_MINUTES) * 60 });
// }

/**
 * UserEntity Class
 */
class UserEntity {
  /**
   *
   */
  static redisClient() {
    if (CONFIG.CACHED_DB_RESDIS === 'true') {
      return new CachedRedis().redisClient;
    }

    return null;
  }

  /**
   *
   * @param {Object} options
   */
  static findAndCountAll(options) {
    return Promise.try(async () => {
      // let cachedKey = `user_findAndCountAll_${options.offset}_${options.limit}_${JSON.stringify(
      //   options.order
      // )}_${JSON.stringify(options.where)}`;

      // cachedKey = fnCachedKey(cachedKey);

      // if (CONFIG.CACHED_DB_RESDIS !== 'true') {
      //   if (UserEntity.redisClient()) UserEntity.redisClient().del(cachedKey);

      //   return await users.findAndCountAll(options);
      // }

      // const [userlist, cacheHit] = await Users.findAndCountAllCached(cachedKey, options);

      // console.log('cachedKey %o || cacheHit: ', cachedKey, cacheHit);

      //return userlist;
      return await users.findAndCountAll(options);
    }).catch(error => {
      throw new ApiErrors.BaseError({
        statusCode: 202,
        type: 'getListError',
        error,
        name: 'UserEntity'
      });
    });
  }

  /**
   *
   * @param {Object} entity
   */
  static create(entity) {
    return Promise.try(() => {
      // if (CONFIG.CACHED_DB_RESDIS === 'true') {
      //   if (MySequelizeRedis !== null) {
      //     const redisClient = MySequelizeRedis.redisClient;

      //     CachedRedis.unlinkWithPattern('user*', redisClient);
      //   }
      // }

      return users.create(entity);
    }).catch(error => {
      throw new ApiErrors.BaseError({
        statusCode: 202,
        type: 'crudError',
        error,
        name: 'UserEntity'
      });
    });
  }

  /**
   *
   * @param {Object} entity
   * @param {Object} options
   */
  static update(entity, options) {
    return Promise.try(() => {
      // if (CONFIG.CACHED_DB_RESDIS === 'true') {
      //   if (MySequelizeRedis !== null) {
      //     const redisClient = MySequelizeRedis.redisClient;

      //     CachedRedis.unlinkWithPattern('user*', redisClient);
      //   }
      // }

      return users.update(entity, options).catch(error => {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudError',
          error,
          name: 'UserEntity'
        });
      });
    });
  }

  /**
   *
   * @param {Object} options
   */
  static destroy(options) {
    return Promise.try(() => {
      return users.destroy(options);
    }).catch(error => {
      throw new ApiErrors.BaseError({
        statusCode: 202,
        type: 'deleteError',
        error,
        name: 'UserEntity'
      });
    });
  }

  /**
   *
   * @param {Object} options
   */
  static count(options) {
    return Promise.try(() => {
      return users.count(options);
    }).catch(error => {
      throw new ApiErrors.BaseError({
        statusCode: 202,
        type: 'getListError',
        error,
        name: 'UserEntity'
      });
    });
  }

  /**
   * Find one.
   *
   * @param {Object} options
   */
  static findOne(options) {
    return Promise.try(async () => {
      const { where } = options;
      // let cachedKey = `user_findOne_${JSON.stringify(where)}`;

      // cachedKey = fnCachedKey(cachedKey);

      // if (CONFIG.CACHED_DB_RESDIS !== 'true') {
      //   if (UserEntity.redisClient()) UserEntity.redisClient().del(cachedKey);

      //   return await users.findOne(options);
      // }

      // const [data, cacheHit] = await Users.findOneCached(cachedKey, options);

      // console.log('cachedKey %o || cacheHit: ', cachedKey, cacheHit);
     //  console.log("options===",options)
      const inforuser = await users.findOne(options);
      // console.log("inforuser===",inforuser)
      return inforuser
    }).catch(error => {
      console.log("error==",error)
      throw new ApiErrors.BaseError({
        statusCode: 202,
        type: 'getInfoError',
        error,
        name: 'UserEntity'
      });
    });
  }

  /**
   *
   * @param {Object} options
   */
  static findAll(options) {
    return Promise.try(async () => {
      const { where, limit } = options;
      // let cachedKey = `user_findAll_${JSON.stringify(where)}_${limit ? limit : ''}`;

      // cachedKey = fnCachedKey(cachedKey);

      // if (CONFIG.CACHED_DB_RESDIS !== 'true') {
      //   if (UserEntity.redisClient()) UserEntity.redisClient().del(cachedKey);

      //   return await users.findAll(options);
      // }

      // const [data, cacheHit] = await Users.findAllCached(cachedKey, options);

      // console.log('cachedKey %o || cacheHit: ', cachedKey, cacheHit);

      return await users.findAll(options);
    }).catch(error => {
      throw new ApiErrors.BaseError({
        statusCode: 202,
        type: 'getListError',
        error,
        name: 'UserEntity'
      });
    });
  }

  /**
   *
   * @param {*} options
   */
  static findOrCreate(options) {
    return Promise.try(() => {
      return users.findOrCreate(options);
      // .spread(async (findReportImExCreate, created) => {
    }).catch(error => {
      throw new ApiErrors.BaseError({
        statusCode: 202,
        type: 'getListError',
        error,
        name: 'UserEntity'
      });
    });
  }
}

export default UserEntity;
