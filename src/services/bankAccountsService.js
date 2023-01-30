import MODELS from '../models/models';
// import templateLayoutsModel from '../models/templateLayouts'
import models from '../entity/index';
import * as ApiErrors from '../errors';
import ErrorHelpers from '../helpers/errorHelpers';
import viMessage from '../locales/vi';
import filterHelpers from '../helpers/filterHelpers';
import preCheckHelpers, { TYPE_CHECK } from '../helpers/preCheckHelpers';
import _ from 'lodash';

const { sequelize, users, bankAccounts, bankAccountTypes } = models;

export default {
  get_list: param =>
    new Promise(async (resolve, reject) => {
      try {
        const { filter, range, sort, attributes } = param;
        let whereFilter = _.omit(filter, ['search']);

        console.log('filter====', filter);
        try {
          whereFilter = filterHelpers.combineFromDateWithToDate(whereFilter);
        } catch (error) {
          reject(error);
        }

        const perPage = range[1] - range[0] + 1;
        const page = Math.floor(range[0] / perPage);

        whereFilter = await filterHelpers.makeStringFilterRelatively(
          ['bankAccountsNumber', 'bankName', 'bankAccountsNumber'],
          whereFilter,
          'bankAccounts'
        );

        let queryStringUsers;

        if (filter.search) {
          queryStringUsers = filterHelpers.makeStringFilterRelativelyVer2('search', filter, 'bankAccounts', [
            'bankAccountsName',
            'bankAccountsNumber'
          ]);
        }
        if (queryStringUsers) {
          whereFilter[`$and`] = sequelize.literal(queryStringUsers);
        }

        if (!whereFilter) {
          whereFilter = { ...filter };
        }

        console.log('where', whereFilter);

        const att = filterHelpers.atrributesHelper(attributes);

        MODELS.findAndCountAll(bankAccounts, {
          where: whereFilter,
          order: sort,
          offset: range[0],
          limit: perPage,
          attributes: att,
          logging: true,
          include: [
            { model: users, required: true, as: 'userCreators', attributes: ['id', 'fullname'] },
            {
              model: bankAccountTypes,
              required: true,
              as: 'bankAccountTypes',
              attributes: ['id', 'bankAccountTypesName', 'image', 'descriptions']
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
            reject(ErrorHelpers.errorReject(err, 'getListError', 'bankAccountsService'));
          });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'getListError', 'bankAccountsService'));
      }
    }),
  get_one: param =>
    new Promise((resolve, reject) => {
      try {
        // console.log("Menu Model param: %o | id: ", param, param.id)
        const id = param.id;
        const att = filterHelpers.atrributesHelper(param.attributes, ['userCreatorsId']);

        MODELS.findOne(bankAccounts, {
          where: { id },
          attributes: att,
          include: [
            { model: users, required: true, as: 'userCreators', attributes: ['id', 'fullname'] },
            {
              model: bankAccountTypes,
              required: true,
              as: 'bankAccountTypes',
              attributes: ['id', 'bankAccountTypesName', 'image', 'descriptions']
            }
          ]
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
            reject(ErrorHelpers.errorReject(err, 'getInfoError', 'bankAccountsService'));
          });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'getInfoError', 'bankAccountsService'));
      }
    }),
  create: async param => {
    let finnalyResult;

    try {
      const entity = param.entity;

      console.log('bankAccountsService create: ', entity);

      const whereFilter = {
        bankAccountsNumber: entity.bankAccountsNumber
      };

      console.log('whereFilter====', whereFilter);
      const dupbankAccounts = await preCheckHelpers.createPromiseCheckNew(
        MODELS.findOne(bankAccounts, { attributes: ['id'], where: whereFilter }),
        entity.bankAccountsNumber ? true : false,
        TYPE_CHECK.CHECK_DUPLICATE,
        { parent: 'api.bankAccounts.bankAccountsNumber' }
      );

      if (!preCheckHelpers.check([dupbankAccounts])) {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'getInfoError',
          message: 'Không xác thực được thông tin gửi lên'
        });
      }

      finnalyResult = await MODELS.create(bankAccounts, param.entity).catch(error => {
        ErrorHelpers.errorThrow(error, 'crudError', 'bankAccountsService', 202);
      });

      if (!finnalyResult) {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudInfo',
          message: viMessage['api.message.infoAfterCreateError']
        });
      }
    } catch (error) {
      ErrorHelpers.errorThrow(error, 'crudError', 'bankAccountsService');
    }

    return { result: finnalyResult };
  },
  update: async param => {
    let finnalyResult;

    try {
      const entity = param.entity;

      console.log('bankAccountsService update: ', entity);

      const foundGateway = await MODELS.findOne(bankAccounts, {
        where: {
          id: param.id
        }
      }).catch(error => {
        throw preCheckHelpers.createErrorCheck(
          { typeCheck: TYPE_CHECK.GET_INFO, modelStructure: { parent: 'groupsUsers' } },
          error
        );
      });

      if (foundGateway) {
        const whereFilter = {
          id: { $ne: param.id },
          bankAccountsNumber: entity.bankAccountsNumber
        };

        console.log('whereFilter====', whereFilter);
        const dupbankAccounts = await preCheckHelpers.createPromiseCheckNew(
          MODELS.findOne(bankAccounts, { attributes: ['id'], where: whereFilter }),
          entity.bankAccountsNumber ? true : false,
          TYPE_CHECK.CHECK_DUPLICATE,
          { parent: 'api.bankAccounts.bankAccountsNumber' }
        );

        if (!preCheckHelpers.check([dupbankAccounts])) {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'getInfoError',
            message: 'Không xác thực được thông tin gửi lên'
          });
        }

        await MODELS.update(
          bankAccounts,
          { ...entity, dateUpdated: new Date() },
          { where: { id: parseInt(param.id) } }
        ).catch(error => {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'crudError',
            error
          });
        });

        finnalyResult = await MODELS.findOne(bankAccounts, { where: { Id: param.id } }).catch(error => {
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
      ErrorHelpers.errorThrow(error, 'crudError', 'bankAccountsService');
    }

    return { result: finnalyResult };
  },
  update_status: param =>
    new Promise((resolve, reject) => {
      try {
        // console.log('block id', param.id);
        const id = param.id;
        const entity = param.entity;

        MODELS.findOne(bankAccounts, {
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
              MODELS.update(
                bankAccounts,
                { ...entity, dateUpdated: new Date() },
                {
                  where: { id: id }
                }
              )
                .then(() => {
                  // console.log("rowsUpdate: ", rowsUpdate)
                  MODELS.findOne(bankAccounts, { where: { id: param.id } })
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
                      reject(ErrorHelpers.errorReject(err, 'crudError', 'bankAccountsService'));
                    });
                })
                .catch(err => {
                  reject(ErrorHelpers.errorReject(err, 'crudError', 'bankAccountsService'));
                });
            }
          })
          .catch(err => {
            reject(ErrorHelpers.errorReject(err, 'crudError', 'bankAccountsService'));
          });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'crudError', 'bankAccountsService'));
      }
    })
};
