/* eslint-disable require-jsdoc */
import * as redis from 'redis';

import { fnCachedKey } from '../utils/helper';
import CONFIG from '../config';
import _ from 'lodash';
import { resolve } from 'bluebird';

let connectStatus = false;

let redisClient;
const config = {};

config['host'] = CONFIG.CACHED_REDIS_HOST;
config['port'] = CONFIG.CACHED_REDIS_PORT;
config['auth_pass'] = CONFIG.REDIS_AUTH_PASS;
config['db'] = CONFIG.REDIS_DATABASE;
const connect = () =>
  new Promise(async (resolve, reject) => {
    redisClient = redis.createClient(config);

    redisClient.on('error', error => {
      connectStatus = false;
      // console.log('er');

      return resolve();
    });

    redisClient.on('end', async error => {
      connectStatus = false;
    });

    redisClient.on('ready', async error => {
      connectStatus = true;
    });

    await redisClient.connect();

    return resolve();
  });

// connect();
// const ttl = Number(CONFIG.CACHED_DB_MINUTES) * 60;

export default {
  // eslint-disable-next-line require-jsdoc
  getWithoutModel: async ({ prefixKey = CONFIG['REDIS_PREFIX_KEY'], router, infoFilter }) => {
    let finnalyResult;

    if (CONFIG.CACHED_DB_RESDIS === 'true') {
      if (prefixKey && infoFilter && router) {
        if (!redisClient || !connectStatus) {
          await connect();
        }

        if (redisClient && connectStatus) {
          console.log('a2');
          let cachedKey = `${prefixKey}_${router}_${JSON.stringify(infoFilter)}`;

          cachedKey = fnCachedKey(cachedKey);
          finnalyResult = await redisClient.get(cachedKey);
        } else {
          console.log('kết nối redis thất bại');
        }
      }
    }

    return finnalyResult;
  },

  setWithoutModel: async ({ prefixKey = CONFIG['REDIS_PREFIX_KEY'], router, infoFilter, value }) => {
    let finnalyResult;

    if (CONFIG.CACHED_DB_RESDIS === 'true') {
      if (prefixKey && value && infoFilter && router) {
        if (!redisClient || !connectStatus) {
          await connect();
        }

        if (redisClient && connectStatus) {
          let cachedKey = `${prefixKey}_${router}_${JSON.stringify(infoFilter)}`;

          cachedKey = fnCachedKey(cachedKey);

          if (typeof value !== 'string') {
            value = JSON.stringify(value);
          }
          // redisClient.setAsync(cachedKey, value, 'EX', ttl).then(console.log);
          await redisClient.set(
            cachedKey,
            value,
            {
              EX: Number(CONFIG['CACHED_DB_MINUTES']) * 60
              // NX: true
            },
            function(error, result) {
              if (error) {
                throw new Error('setWithoutModel - Failed');
              }
              finnalyResult = result;
            }
          );

          // await redisClient.expireat(cachedKey, 1000);

          return finnalyResult;
        } else {
          console.log('kết nối redis thất bại');
        }
      }
    }
  },
  // eslint-disable-next-line require-jsdoc
  delWithoutModel: async ({ prefixKey = CONFIG['REDIS_PREFIX_KEY'], router, infoFilter }) => {
    let finnalyResult;

    if (CONFIG.CACHED_DB_RESDIS === 'true') {
      if (prefixKey && infoFilter && router) {
        if (!redisClient || !connectStatus) {
          await connect();
        }

        if (redisClient && connectStatus) {
          let cachedKey = `${prefixKey}_${router}_${JSON.stringify(infoFilter)}`;

          cachedKey = fnCachedKey(cachedKey);
          finnalyResult = await redisClient.del(cachedKey);
        } else {
          console.log('kết nối redis thất bại');
        }
      }
    }

    return finnalyResult;
  },

  deleteKey: async ({ prefixKey = CONFIG['REDIS_PREFIX_KEY'], router, infoFilter }) => {
    let arr;
    let keyword = prefixKey;

    if (CONFIG.CACHED_DB_RESDIS === 'true') {
      if (!redisClient || !connectStatus) {
        await connect();
      }

      if (router) {
        keyword = keyword + `_${router}`;
      }

      if (infoFilter) {
        keyword = keyword + `_${JSON.stringify(infoFilter)}`;
      }

      const keys = await redisClient.keys(`${keyword}*`);

      await Promise.all(
        keys.map(element => {
          redisClient.del(element);
        })
      );
    }

    return arr;
  },

  getKeyList: async ({ prefixKey = CONFIG['REDIS_PREFIX_KEY'], router, infoFilter }) => {
    let finnalyResult;
    let keyword = prefixKey;

    console.log('1a');
    if (CONFIG.CACHED_DB_RESDIS === 'true') {
      console.log('1b');
      // if (!redisClient || !connectStatus) {
      //   await connect();
      // }
      console.log('1c', connectStatus);
      if (redisClient && connectStatus) {
        if (router) {
          keyword = keyword + `_${router}`;
        }
        if (infoFilter) {
          keyword = keyword + `_${JSON.stringify(infoFilter)}`;
        }

        const keys = await redisClient.keys(`${keyword}*`);

        finnalyResult = keys;
      } else {
        console.log('kết nối redis thất bại');
      }
    }
    console.log('1d');

    return finnalyResult;
  }
};
