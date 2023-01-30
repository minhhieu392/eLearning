import MODELS from '../models/models';
// import sitesModel from '../models/sites'
// import languagesTypeModel from '../models/languagesType'
// import languagesPositionsModel from '../models/languagesPositions'
import models from '../entity/index';
import * as ApiErrors from '../errors';
import ErrorHelpers from '../helpers/errorHelpers';
import lodashHelpers from '../helpers/lodashHelpers';
import _ from 'lodash';
import viMessage from '../locales/vi';
import filterHelpers from '../helpers/filterHelpers';
import preCheckHelpers, { TYPE_CHECK } from '../helpers/preCheckHelpers';

const { /* sequelize, */ sites, users, languagesPositions, languagesType, languages } = models;

export default {
  get_list: async param => {
    let finnalyResult;

    try {
      const { filter, range, sort, auth, attributes } = param;
      let whereFilter = filter;

      console.log(attributes);

      const perPage = range[1] - range[0] + 1;
      const page = Math.floor(range[0] / perPage);

      whereFilter = await filterHelpers.makeStringFilterRelatively(['languageName'], whereFilter, 'languages');

      if (!whereFilter) {
        whereFilter = { ...filter };
      }
      const att = filterHelpers.atrributesHelper(attributes);

      console.log('where', whereFilter);

      const result = await MODELS.findAndCountAll(languages, {
        where: whereFilter,
        order: sort,
        offset: range[0],
        limit: perPage,
        attributes: att,
        logging: true
      }).catch(err => {
        ErrorHelpers.errorThrow(err, 'getListError', 'languagesService');
      });

      finnalyResult = {
        ...result,
        page: page + 1,
        perPage
      };
    } catch (err) {
      ErrorHelpers.errorThrow(err, 'getListError', 'languagesService');
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

        whereFilter = await filterHelpers.makeStringFilterRelatively(
          ['title', 'url', 'contents'],
          whereFilter,
          'languages'
        );

        if (!whereFilter) {
          whereFilter = { ...filter };
        }

        console.log('where', whereFilter);

        languagesModel
          .findAndCountAll({
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
            reject(ErrorHelpers.errorReject(err, 'getListError', 'languagesService'));
          });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'getListError', 'languagesService'));
      }
    }),
  get_one: param =>
    new Promise((resolve, reject) => {
      try {
        // console.log("Menu Model param: %o | id: ", param, param.id)
        const id = param.id;

        const att = filterHelpers.atrributesHelper(param.attributes, ['usersCreatorId']);

        MODELS.findOne(languages, {
          where: { id },
          attributes: att
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
            reject(ErrorHelpers.errorReject(err, 'getInfoError', 'languagesService'));
          });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'getInfoError', 'languagesService'));
      }
    }),
  create: async param => {
    let finnalyResult;

    try {
      const entity = param.entity;
      let whereFilter = {
        languageName: entity.languageName
      };
      let whereFilterCode = {
        languageCode: entity.languageCode
      };
      console.log('languagesService create: ', entity);
      whereFilter = await filterHelpers.makeStringFilterAbsolutely(['languageName'], whereFilter, 'languages');
      whereFilterCode = await filterHelpers.makeStringFilterAbsolutely(['languageCode'], whereFilterCode, 'languages');

      const infoArr = Array.from(
        await Promise.all([
          preCheckHelpers.createPromiseCheckNew(
            MODELS.findOne(languages, { attributes: ['id'], where: whereFilter }),
            entity.languageName ? true : false,
            TYPE_CHECK.CHECK_DUPLICATE,
            { parent: 'api.languages.languageName' }
          ),
          preCheckHelpers.createPromiseCheckNew(
            MODELS.findOne(languages, { attributes: ['id'], where: whereFilterCode }),
            entity.languageCode ? true : false,
            TYPE_CHECK.CHECK_DUPLICATE,
            { parent: 'api.languages.languageCode' }
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

      finnalyResult = await MODELS.create(languages, param.entity).catch(error => {
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
      ErrorHelpers.errorThrow(error, 'crudError', 'languagesService');
    }

    return { result: finnalyResult };
  },
  update: async param => {
    let finnalyResult;

    try {
      const entity = param.entity;

      console.log('languagesService update: ', entity);

      const foundGateway = await MODELS.findOne(languages, {
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
          languageName: entity.languageName
        };
        let whereFilterCode = {
          id: { $ne: param.id },
          languageCode: entity.languageCode
        };
        whereFilter = await filterHelpers.makeStringFilterAbsolutely(['languageName'], whereFilter, 'languages');
        whereFilterCode = await filterHelpers.makeStringFilterAbsolutely(
          ['languageCode'],
          whereFilterCode,
          'languages'
        );

        const infoArr = Array.from(
          await Promise.all([
            preCheckHelpers.createPromiseCheckNew(
              MODELS.findOne(languages, { attributes: ['id'], where: whereFilter }),
              entity.languageName ? true : false,
              TYPE_CHECK.CHECK_DUPLICATE,
              { parent: 'api.languages.languageName' }
            ),
            preCheckHelpers.createPromiseCheckNew(
              MODELS.findOne(languages, { attributes: ['id'], where: whereFilterCode }),
              entity.languageCode ? true : false,
              TYPE_CHECK.CHECK_DUPLICATE,
              { parent: 'api.languages.languageCode' }
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

        await MODELS.update(languages, entity, { where: { id: parseInt(param.id) } }).catch(error => {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'crudError',
            error
          });
        });

        finnalyResult = await MODELS.findOne(languages, { where: { Id: param.id } }).catch(error => {
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
      ErrorHelpers.errorThrow(error, 'crudError', 'languagesService');
    }

    return { result: finnalyResult };
  },
  delete: param =>
    new Promise((resolve, reject) => {
      try {
        console.log('delete id', param.id);
        const id = param.id;

        languagesModel
          .findOne({
            where: {
              id
            }
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
              languagesModel
                .destroy({ where: { id: parseInt(param.id) } })
                .then(() => {
                  // console.log("rowsUpdate: ", rowsUpdate)
                  languagesModel
                    .findOne({ where: { Id: param.id } })
                    .then(result => {
                      if (result) {
                        reject(
                          new ApiErrors.BaseError({
                            statusCode: 202,
                            type: 'deleteError'
                          })
                        );
                      } else resolve({ status: 1 });
                    })
                    .catch(err => {
                      reject(ErrorHelpers.errorReject(err, 'crudError', 'languagesService'));
                    });
                })
                .catch(err => {
                  reject(ErrorHelpers.errorReject(err, 'crudError', 'languagesService'));
                });
            }
          })
          .catch(err => {
            reject(ErrorHelpers.errorReject(err, 'crudError', 'languagesService'));
          });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'crudError', 'languagesService'));
      }
    }),
  get_all: param =>
    new Promise((resolve, reject) => {
      try {
        // console.log("filter:", JSON.parse(param.filter))
        let filter = {};
        let sort = [['id', 'ASC']];

        if (param.filter) filter = param.filter;

        if (param.sort) sort = param.sort;

        languagesModel
          .findAll({
            where: filter,
            order: sort
          })
          .then(result => {
            // console.log("result: ", result)
            resolve(result);
          })
          .catch(err => {
            reject(ErrorHelpers.errorReject(err, 'getListError', 'languagesService'));
          });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'getListError', 'languagesService'));
      }
    })
};
