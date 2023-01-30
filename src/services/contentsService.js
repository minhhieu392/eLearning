import MODELS from '../models/models';
// import provinceModel from '../models/provinces'
import models from '../entity/index';
import _ from 'lodash';
import * as ApiErrors from '../errors';
import ErrorHelpers from '../helpers/errorHelpers';
import viMessage from '../locales/vi';
import filterHelpers from '../helpers/filterHelpers';
import preCheckHelpers, { TYPE_CHECK } from '../helpers/preCheckHelpers';

const { sequelize, users, contents, contentGroups } = models;

export default {
  get_list: param =>
    new Promise(async (resolve, reject) => {
      try {
        const { filter, range, sort, attributes } = param;
        let whereFilter = _.omit(filter, ['notInContentGroupsId', 'notInId']);

        try {
          whereFilter = filterHelpers.combineFromDateWithToDate(whereFilter);
        } catch (error) {
          reject(error);
        }

        const perPage = range[1] - range[0] + 1;
        const page = Math.floor(range[0] / perPage);
        const att = filterHelpers.atrributesHelper(attributes);

        whereFilter = await filterHelpers.makeStringFilterRelatively(['contentsName'], whereFilter, 'contents');

        if (!whereFilter) {
          whereFilter = { ...filter };
        }

        if (filter.notInContentGroupsId) {
          whereFilter.contentGroupsId = { $notIn: filter.notInContentGroupsId.split(',') };
        }
        if (filter.notInId) {
          whereFilter.id = { $notIn: filter.notInId.split(',') };
        }
        console.log('where', whereFilter, filter);
        MODELS.findAndCountAll(contents, {
          where: whereFilter,
          order: sort,
          offset: range[0],
          limit: perPage,
          distinct: true,
          attributes: att,
          include: [
            {
              model: users,
              as: 'userCreators',
              attributes: ['id', 'username', 'fullname'],
              required: true
            },
            {
              model: contentGroups,
              as: 'contentGroups',
              attributes: ['id', 'contentGroupsName'],
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
            reject(ErrorHelpers.errorReject(err, 'getListError', 'contentsService'));
          });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'getListError', 'contentsService'));
      }
    }),

  get_one: param =>
    new Promise((resolve, reject) => {
      try {
        // console.log("Menu Model param: %o | id: ", param, param.id)
        const id = param.id;
        const att = filterHelpers.atrributesHelper(param.attributes, ['usersCreatorId']);

        const where = {};

        if (isNaN(Number(id))) {
          where.url = id;
        } else {
          where.id = id;
        }

        MODELS.findOne(contents, {
          where: where,
          attributes: att,
          include: [
            {
              model: users,
              as: 'userCreators',
              attributes: ['id', 'username', 'fullname'],
              required: true
            },
            {
              model: contentGroups,
              as: 'contentGroups',
              attributes: ['id', 'contentGroupsName'],
              required: true
            }
          ]
        })

          .then(values => {
            if (!values) {
              reject(
                new ApiErrors.BaseError({
                  statusCode: 202,
                  type: 'crudNotExisted'
                })
              );
            }
            resolve(values);
          })
          .catch(err => {
            reject(ErrorHelpers.errorReject(err, 'getInfoError', 'contentsService'));
          });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'getInfoError', 'contentsService'));
      }
    }),

  create: async param => {
    let finnalyResult;

    try {
      const entity = param.entity;

      if (entity.url) {
        const findUrl = await MODELS.findOne(contents, { where: { url: entity.url }, order: [['id', 'desc']] }).catch(
          error => {
            throw new ApiErrors.BaseError({
              statusCode: 202,
              type: 'crudError',
              error
            });
          }
        );

        if (findUrl) {
          const countChild = await sequelize.query(`select count(*) as count from contents   `);

          entity.url = entity.url + '-' + countChild[0][0].count;
        }
      }

      finnalyResult = await MODELS.create(contents, param.entity).catch(error => {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudError',
          error
        });
      });

      // thêm contentDisasterGroups

      if (!finnalyResult) {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudInfo',
          message: viMessage['api.message.infoAfterCreateError']
        });
      }
    } catch (error) {
      ErrorHelpers.errorThrow(error, 'crudError', 'contentsService');
    }

    return { result: finnalyResult };
  },

  update: async param => {
    let finnalyResult;

    try {
      const entity = param.entity;

      console.log('DistrictService update: ', entity);

      const foundGateway = await MODELS.findOne(contents, {
        where: {
          id: param.id
        }
      }).catch(error => {
        throw preCheckHelpers.createErrorCheck(
          { typeCheck: TYPE_CHECK.GET_INFO, modelStructure: { parent: 'contents' } },
          error
        );
      });

      if (foundGateway) {
        if (entity.url) {
          const findUrl = await MODELS.findOne(contents, {
            where: { url: entity.url, id: { $ne: param.id } },
            order: [['id', 'desc']]
          }).catch(error => {
            console.log('error', error);
            throw new ApiErrors.BaseError({
              statusCode: 202,
              type: 'crudError',
              error
            });
          });

          if (findUrl) {
            const countChild = await sequelize.query(`select count(*) as count from contents   `);

            entity.url = entity.url + '-' + countChild[0][0].count;
          }
        }

        await MODELS.update(contents, entity, { where: { id: parseInt(param.id) } }).catch(error => {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'crudError',
            error
          });
        });

        // thêm contentDisasterGroups

        finnalyResult = await MODELS.findOne(contents, {
          where: { id: param.id },
          include: []
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
      ErrorHelpers.errorThrow(error, 'crudError', 'contentsService');
    }

    return { result: finnalyResult };
  },

  update_status: param =>
    new Promise((resolve, reject) => {
      try {
        // console.log('block id', param.id);
        const id = param.id;
        const entity = param.entity;

        MODELS.findOne(contents, {
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
              MODELS.update(contents, entity, {
                where: { id: id }
              })
                .then(() => {
                  // console.log("rowsUpdate: ", rowsUpdate)
                  MODELS.findOne(contents, { where: { id: param.id } })
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
                      reject(ErrorHelpers.errorReject(err, 'crudError', 'contentsService'));
                    });
                })
                .catch(err => {
                  reject(ErrorHelpers.errorReject(err, 'crudError', 'contentsService'));
                });
            }
          })
          .catch(err => {
            reject(ErrorHelpers.errorReject(err, 'crudError', 'contentsService'));
          });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'crudError', 'contentsService'));
      }
    }),
  delete: param =>
    new Promise((resolve, reject) => {
      try {
        console.log('delete id', param.id);
        const id = param.id;

        MODELS.findOne(contents, {
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
              MODELS.destroy(contents, { where: { id: Number(param.id) } })
                .then(() => {
                  // console.log("rowsUpdate: ", rowsUpdate)
                  MODELS.findOne(contents, { where: { id: param.id } })
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
                      reject(ErrorHelpers.errorReject(err, 'crudError', 'contentsService'));
                    });
                })
                .catch(err => {
                  reject(ErrorHelpers.errorReject(err, 'crudError', 'contentsService'));
                });
            }
          })
          .catch(err => {
            reject(ErrorHelpers.errorReject(err, 'crudError', 'contentsService'));
          });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'crudError', 'contentsService'));
      }
    })
};
