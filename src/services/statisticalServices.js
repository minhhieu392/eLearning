// import moment from 'moment'
import MODELS from '../models/models';
import models from '../entity/index';
import _ from 'lodash';
import * as ApiErrors from '../errors';
import ErrorHelpers from '../helpers/errorHelpers';
import filterHelpers from '../helpers/filterHelpers';
import preCheckHelpers, { TYPE_CHECK } from '../helpers/preCheckHelpers';

const { sequelize, Op, users, individuals /* tblGatewayEntity, Roles */, owners, species } = models;

export default {
  individualsByOwner: param =>
    new Promise(async (resolve, reject) => {
      try {
        const { filter, range } = param;

        const perPage = range[1] - range[0] + 1;
        const page = Math.floor(range[0] / perPage);
        let result = await sequelize.query(
          'call sp_individuals_exportExcel_by_owners(:in_ownersId,:in_villagesId,:in_wardsId,:in_districtsId,:in_provincesId,:in_speciesGroupsId,:in_speciesId,:in_individualsStatus,:in_pageIndex,:in_pageSize,:in_speciesName,:in_individualsName,:in_ownersName,@out_rowCount);select @out_rowCount;',
          {
            replacements: {
              in_ownersId: filter.ownersId || 0,
              in_villagesId: filter.villagesId || 0,
              in_wardsId: filter.wardsId || 0,
              in_districtsId: filter.districtsId || 0,
              in_provincesId: filter.provincesId || 0,
              in_speciesGroupsId: filter.speciesGroupsId || 0,
              in_speciesId: filter.speciesId || 0,
              in_individualsStatus: filter.individualsStatus || 1,
              in_pageIndex: page + 1,
              in_pageSize: perPage,
              in_speciesName: filter.speciesName || '',
              in_individualsName: filter.individualsName || '',
              in_ownersName: filter.ownersName || ''
            },
            type: sequelize.QueryTypes.SELECT
          }
        );

        delete result[0].meta;

        const rows = Object.values(result[0]);

        result = result.map(e => e['0']);

        const outOutput = result[2]['@out_rowCount'];

        resolve({
          rows,
          page: page + 1,
          perPage,
          count: outOutput
        });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'getListError', 'GroupstoryUserStarervice'));
      }
    }),
  individualsByDVHC: param =>
    new Promise(async (resolve, reject) => {
      try {
        const { filter, range } = param;

        const perPage = range[1] - range[0] + 1;
        const page = Math.floor(range[0] / perPage);
        let result = await sequelize.query(
          'call sp_individuals_exportExcel_by_dvHanhChinh(:in_ownersId,:in_villagesId,:in_wardsId,:in_districtsId,:in_provincesId,:in_speciesGroupsId,:in_speciesId,:in_individualsStatus,:in_pageIndex,:in_pageSize,:in_speciesName,:in_individualsName,:in_ownersName,@out_rowCount);select @out_rowCount;',
          {
            replacements: {
              in_ownersId: filter.ownersId || 0,
              in_villagesId: filter.villagesId || 0,
              in_wardsId: filter.wardsId || 0,
              in_districtsId: filter.districtsId || 0,
              in_provincesId: filter.provincesId || 0,
              in_speciesGroupsId: filter.speciesGroupsId || 0,
              in_speciesId: filter.speciesId || 0,
              in_individualsStatus: filter.individualsStatus || 1,
              in_pageIndex: page + 1,
              in_pageSize: perPage,
              in_speciesName: filter.speciesName || '',
              in_individualsName: filter.individualsName || '',
              in_ownersName: filter.ownersName || ''
            },
            type: sequelize.QueryTypes.SELECT
          }
        );

        delete result[0].meta;
        let rows = Object.values(result[0]);

        console.log('rows', rows);
        rows = rows.map(item => {
          item.owners = item.individuals.reduce((pre, current) => {
            // console.log('pre', pre);
            // console.log('current', current);
            const findOwner = pre.find(e => e.ownersId === current.ownersId);

            if (findOwner) {
              findOwner.individuals.push({
                ..._.omit(current, ['ownersId', 'ownersName'])
              });
            } else {
              pre.push({
                ownersId: current.ownersId,
                ownersName: current.ownersName,
                individuals: [
                  {
                    ..._.omit(current, ['ownersId', 'ownersName'])
                  }
                ]
              });
            }

            return pre;
          }, []);
          delete item.individuals;

          return item;
        });
        console.log('rows', rows);
        result = result.map(e => e['0']);

        const outOutput = result[2]['@out_rowCount'];

        resolve({
          rows,
          page: page + 1,
          perPage,
          count: outOutput
        });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'getListError', 'GroupstoryUserStarervice'));
      }
    }),
  individualsBySpeciesGroups: param =>
    new Promise(async (resolve, reject) => {
      try {
        const { filter, range } = param;

        const perPage = range[1] - range[0] + 1;
        const page = Math.floor(range[0] / perPage);
        let result = await sequelize.query(
          'call sp_individuals_exportExcel_by_speciesGroups(:in_ownersId,:in_villagesId,:in_wardsId,:in_districtsId,:in_provincesId,:in_speciesGroupsId,:in_speciesId,:in_individualsStatus,:in_pageIndex,:in_pageSize,:in_speciesName,:in_individualsName,:in_ownersName,@out_rowCount);select @out_rowCount;',
          {
            replacements: {
              in_ownersId: filter.ownersId || 0,
              in_villagesId: filter.villagesId || 0,
              in_wardsId: filter.wardsId || 0,
              in_districtsId: filter.districtsId || 0,
              in_provincesId: filter.provincesId || 0,
              in_speciesGroupsId: filter.speciesGroupsId || 0,
              in_speciesId: filter.speciesId || 0,
              in_individualsStatus: filter.individualsStatus || 1,
              in_pageIndex: page + 1,
              in_pageSize: perPage,
              in_speciesName: filter.speciesName || '',
              in_individualsName: filter.individualsName || '',
              in_ownersName: filter.ownersName || ''
            },
            type: sequelize.QueryTypes.SELECT
          }
        );

        delete result[0].meta;

        let rows = Object.values(result[0]);

        rows = rows.map(item => {
          item.species = item.individuals.reduce((pre, current) => {
            // console.log('pre', pre);
            // console.log('current', current);
            const findOwner = pre.find(e => e.speciesId === current.speciesId);

            if (findOwner) {
              findOwner.individuals.push({
                ..._.omit(current, ['speciesName', 'speciesId', 'speciesGroupsName'])
              });
            } else {
              pre.push({
                speciesName: current.speciesName,
                speciesId: current.speciesId,
                individuals: [
                  {
                    ..._.omit(current, ['speciesName', 'speciesId', 'speciesGroupsName'])
                  }
                ]
              });
            }

            return pre;
          }, []);
          delete item.individuals;

          return item;
        });
        console.log('rows', rows);
        result = result.map(e => e['0']);

        const outOutput = result[2]['@out_rowCount'];

        resolve({
          rows,
          page: page + 1,
          perPage,
          count: outOutput
        });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'getListError', 'GroupstoryUserStarervice'));
      }
    }),
  get_one: param =>
    new Promise((resolve, reject) => {
      try {
        // console.log("Menu Model param: %o | id: ", param, param.id)
        const id = param.id;
        const att = filterHelpers.atrributesHelper(param.attributes, ['usersCreatorId']);

        MODELS.findOne(individuals, {
          where: { id: id },
          attributes: att,
          include: [
            { model: owners, as: 'owners', attributes: ['id', 'name'] },
            { model: species, as: 'species', required: true, attributes: ['id', 'name'] }
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
            reject(ErrorHelpers.errorReject(err, 'getInfoError', 'individualservice'));
          });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'getInfoError', 'individualservice'));
      }
    }),
  create: async param => {
    let finnalyResult;

    try {
      const entity = param.entity;

      console.log('provinceModel create: ', entity);
      const whereFilter = {
        code: entity.code
      };
      // api.individuals.identificationCode

      const infoArr = Array.from(
        await Promise.all([
          preCheckHelpers.createPromiseCheckNew(
            MODELS.findOne(individuals, { attributes: ['id'], where: whereFilter }),
            entity.code ? true : false,
            TYPE_CHECK.CHECK_DUPLICATE,
            { parent: 'api.individuals.code' }
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

      finnalyResult = await MODELS.create(individuals, entity).catch(error => {
        console.log('err', error);
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudError',
          error
        });
      });

      if (!finnalyResult) {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudInfo'
        });
      }
    } catch (error) {
      ErrorHelpers.errorThrow(error, 'crudError', 'individualservice');
    }

    return { result: finnalyResult };
  },
  update: async param => {
    let finnalyResult;

    try {
      const entity = param.entity;

      console.log('Province update: ');

      const foundProvince = await MODELS.findOne(individuals, {
        where: {
          id: param.id
        }
      }).catch(error => {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'getInfoError',
          message: 'Lấy thông tin của Tỉnh/Thành phố thất bại!',
          error
        });
      });

      if (foundProvince) {
        const whereFilter = {
          id: { $ne: param.id },
          code: entity.code
        };

        const infoArr = Array.from(
          await Promise.all([
            preCheckHelpers.createPromiseCheckNew(
              MODELS.findOne(individuals, { attributes: ['id'], where: whereFilter }),
              entity.code ? true : false,
              TYPE_CHECK.CHECK_DUPLICATE,
              { parent: 'api.individuals.code' }
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

        await MODELS.update(
          individuals,
          { ...entity, dateUpdated: new Date() },
          { where: { id: Number(param.id) } }
        ).catch(error => {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'crudError',
            error
          });
        });

        finnalyResult = await MODELS.findOne(individuals, { where: { id: param.id } }).catch(error => {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'crudInfo',
            message: 'Lấy thông tin sau khi thay đổi thất bại',
            error
          });
        });

        if (!finnalyResult) {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'crudInfo',
            message: 'Lấy thông tin sau khi thay đổi thất bại'
          });
        }
      } else {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudNotExisted'
        });
      }
    } catch (error) {
      ErrorHelpers.errorThrow(error, 'crudError', 'individualservice');
    }

    return { result: finnalyResult };
  },
  update_status: param =>
    new Promise((resolve, reject) => {
      try {
        console.log('block id', param.id);
        const id = param.id;
        const entity = param.entity;

        MODELS.findOne(individuals, {
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
                individuals,
                { ...entity, dateUpdated: new Date() },
                {
                  where: { id: id }
                }
              )
                .then(() => {
                  // console.log("rowsUpdate: ", rowsUpdate)
                  MODELS.findOne(individuals, { where: { id: param.id } })
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
                      reject(ErrorHelpers.errorReject(err, 'crudError', 'UserServices'));
                    });
                })
                .catch(err => {
                  reject(ErrorHelpers.errorReject(err, 'crudError', 'UserServices'));
                });
            }
          })
          .catch(err => {
            reject(ErrorHelpers.errorReject(err, 'crudError', 'UserServices'));
          });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'crudError', 'UserServices'));
      }
    }),
  delete: async param => {
    try {
      console.log('delete id', param.id);

      const foundProvince = await MODELS.findOne(individuals, {
        where: {
          id: param.id
        }
      }).catch(error => {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'getInfoError',
          error
        });
      });

      if (!foundProvince) {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudNotExisted'
        });
      } else {
        await MODELS.destroy(individuals, { where: { id: parseInt(param.id) } });

        const provinceAfterDelete = await MODELS.findOne(individuals, { where: { Id: param.id } }).catch(err => {
          ErrorHelpers.errorThrow(err, 'crudError', 'individualservice');
        });

        if (provinceAfterDelete) {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'deleteError'
          });
        }
      }
    } catch (err) {
      ErrorHelpers.errorThrow(err, 'crudError', 'individualservice');
    }

    return { status: 1 };
  },

  bulk_create: async param => {
    let finnalyResult;

    try {
      const entity = param.entity;

      if (entity.individuals) {
        finnalyResult = await Promise.all(
          entity.individuals.map(element => {
            return MODELS.createOrUpdate(
              individuals,
              {
                ..._.omit(element, ['id'])
              },
              {
                where: {
                  id: element.id
                }
              }
            ).catch(error => {
              throw new ApiErrors.BaseError({
                statusCode: 202,
                type: 'crudError',
                error
              });
            });
          })
        );
      }
    } catch (error) {
      ErrorHelpers.errorThrow(error, 'crudError', 'WardService');
    }

    return { result: finnalyResult ? true : false };
  }
};
