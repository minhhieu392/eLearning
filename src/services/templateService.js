// import moment from 'moment'
import Model from '../models/models';
import models from '../entity/index';
import _ from 'lodash';
// import errorCode from '../utils/errorCode';
import * as ApiErrors from '../errors';
import ErrorHelpers from '../helpers/errorHelpers';
import filterHelpers from '../helpers/filterHelpers';
import preCheckHelpers, { TYPE_CHECK } from '../helpers/preCheckHelpers';
import templateLayout from '../locales/vi-Vn/templateLayout';
import lodashHelpers from '../helpers/lodashHelpers';
const {
  /* sequelize, Op, */ users,
  templateGroups,
  templates,
  templateLayouts,
  templateLayoutTemplates,
  sites /* tblGatewayEntity, Roles */
} = models;

export default {
  get_list: param =>
    new Promise(async (resolve, reject) => {
      try {
        const { filter, range, sort, attributes } = param;

        console.log('filter', filter);

        const att = filterHelpers.atrributesHelper(attributes);

        let whereTemplateNameFilter = _.pick(filter, ['name']);
        let whereTemplateGroupsNameFilter = _.pick(filter, ['name']);
        const whereTemplateGroupsIdFilter = _.pick(filter, ['templateGroupsId']);
        let whereFilter = _.pick(filter, [
          'id',
          'folder',
          'usersCreatorId',
          'FromDate',
          'ToDate',
          'status',
          'price',
          'promotionPrice',
          'link'
        ]);

        if (filter.excludedId) {
          whereFilter = { ...whereFilter, id: filter.excludedId };
        }
        // let whereSite = _.pick(filter,['sitesId']);
        // whereSite = lodashHelpers.rename(whereSite,[['sitesId','id']]);

        console.log('whereFilter', whereFilter);

        try {
          whereFilter = filterHelpers.combineFromDateWithToDate(whereFilter);
        } catch (error) {
          reject(error);
        }

        const perPage = range[1] - range[0] + 1;
        const page = Math.floor(range[0] / perPage);

        whereFilter = await filterHelpers.makeStringFilterRelatively(['folder'], whereFilter, 'templates');
        whereTemplateNameFilter = await filterHelpers.makeStringFilterRelatively(
          ['name'],
          whereTemplateNameFilter,
          'templates'
        );
        whereTemplateGroupsNameFilter = await filterHelpers.makeStringFilterRelatively(
          ['name'],
          whereTemplateGroupsNameFilter,
          'templateGroups'
        );

        if (!whereFilter) {
          whereFilter = { ...filter };
        }
        if (whereTemplateGroupsIdFilter) {
          whereFilter = { ...whereFilter, ...whereTemplateGroupsIdFilter.templateGroupsId };
        }
        console.log('whereTemplateNameFilter=', whereTemplateNameFilter);
        console.log('whereTemplateGroupsNameFilter=', whereTemplateGroupsNameFilter);
        if (!_.isEmpty(whereTemplateNameFilter, true) && !_.isEmpty(whereTemplateGroupsNameFilter, true)) {
          whereFilter['$or'] = [whereTemplateNameFilter, whereTemplateGroupsNameFilter];
          console.log('Sfdsfsfdsfsd');
        }

        // console.log('whereTemplateGroupsNameFilter', whereTemplateGroupsNameFilter);
        console.log('where', whereFilter);

        Model.findAndCountAll(templates, {
          where: whereFilter,
          order: sort,
          offset: range[0],
          limit: perPage,
          attributes: att,
          distinct: true,
          logging: true,
          include: [
            { model: users, as: 'usersCreator', attributes: ['id', 'fullname'], required: false },
            { model: templateGroups, as: 'templateGroups', required: false }
            // { model: templateLayouts, as: 'templateLayouts' }
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
            reject(ErrorHelpers.errorReject(err, 'getListError', 'TemplateService'));
          });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'getListError', 'TemplateService'));
      }
    }),
  get_one: param =>
    new Promise((resolve, reject) => {
      try {
        // console.log("Menu Model param: %o | id: ", param, param.id)
        const id = param.id;
        const att = filterHelpers.atrributesHelper(param.attributes);

        Model.findOne(templates, {
          attributes: att,
          where: { id: id },
          include: [
            { model: users, as: 'usersCreator', attributes: ['id', 'fullname'] },
            { model: templateGroups, as: 'templateGroups', required: false },
            { model: templateLayoutTemplates, as: 'templateLayoutTemplates', required: false }
            // { model: templateLayouts, as: 'templateLayouts' }
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
            reject(ErrorHelpers.errorReject(err, 'getInfoError', 'TemplateService'));
          });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'getInfoError', 'TemplateService'));
      }
    }),
  create: async param => {
    let finnalyResult;

    try {
      const entity = param.entity;

      let whereFilter = {
        name: entity.name
        // templateGroupsId: entity.templateGroupsId || 0
      };

      whereFilter = await filterHelpers.makeStringFilterAbsolutely(['name'], whereFilter, 'templates');

      const dupTemplate = await preCheckHelpers.createPromiseCheckNew(
        templates.findOne({ attributes: ['id'], where: whereFilter }),
        !!entity.name,
        TYPE_CHECK.CHECK_DUPLICATE,
        { parent: 'api.templates.name' }
      );

      if (!preCheckHelpers.check([dupTemplate])) {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'getInfoError',
          message: 'Không xác thực được thông tin gửi lên'
        });
      }
      const newEntity = _.omit(entity, ['templateLayouts']);

      finnalyResult = await Model.create(templates, newEntity).catch(error => {
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
      } else {
        if (param.entity && param.entity.templateLayouts && Array.isArray(param.entity.templateLayouts)) {
          await Promise.all(
            param.entity.templateLayouts.map(async templateLayout => {
              const templateLayoutEntity = _.pick(templateLayout, ['name', 'folder', 'status', 'typesId']);

              await Model.createOrUpdate(templateLayouts, templateLayoutEntity, {
                where: {
                  name: templateLayout.name
                }
              });
              const foundTemplateLayout = await Model.findOne(templateLayout, {
                where: {
                  name: templateLayout.name
                }
              });
              const templateLayoutTemplateEntity = _.pick(templateLayout, [
                'imagesResize',
                'folder',
                'status',
                'typesId'
              ]);

              await Model.createOrUpdate(
                templateLayoutTemplates,
                {
                  templatesId: finnalyResult.id,
                  templateLayoutsId: foundTemplateLayout.id,
                  ...templateLayoutTemplateEntity
                },
                {
                  where: {
                    templatesId: finnalyResult.id,
                    templateLayoutsId: foundTemplateLayout.id
                  }
                }
              );
            })
          );
        }
      }
    } catch (error) {
      ErrorHelpers.errorThrow(error, 'crudError', 'TemplateService');
    }

    return { result: finnalyResult };
  },
  update: async param => {
    let finnalyResult;

    try {
      const entity = param.entity;
      const newEntity = _.omit(entity, ['templateLayouts']);

      console.log('Template update: ', entity);

      const foundTemplate = await Model.findOne(templates, {
        where: {
          id: param.id
        }
      }).catch(error => {
        throw preCheckHelpers.createErrorCheck(
          { typeCheck: TYPE_CHECK.GET_INFO, modelStructure: { parent: 'templates' } },
          error
        );
      });

      if (foundTemplate) {
        let whereFilter = {
          id: { $ne: param.id },
          name: entity.name
        };

        whereFilter = await filterHelpers.makeStringFilterAbsolutely(['name'], whereFilter, 'templates');

        const dupTemplate = await preCheckHelpers.createPromiseCheckNew(
          Model.findOne(templates, { attributes: ['id'], where: whereFilter }),
          !!entity.name,
          TYPE_CHECK.CHECK_DUPLICATE,
          { parent: 'api.templates.name' }
        );

        if (!preCheckHelpers.check([dupTemplate])) {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'getInfoError',
            message: 'Không xác thực được thông tin gửi lên'
          });
        }

        await Model.update(templates, newEntity, { where: { id: parseInt(param.id) } }).catch(error => {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'crudError',
            error
          });
        });

        finnalyResult = await Model.findOne(templates, { where: { Id: param.id } }).catch(error => {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'crudInfo',
            error
          });
        });

        if (!finnalyResult) {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'crudInfo'
          });
        }
        if (param.entity && param.entity.templateLayouts && Array.isArray(param.entity.templateLayouts)) {
          await Promise.all(
            param.entity.templateLayouts.map(async templateLayout => {
              if (templateLayout && templateLayout.isDelete === true && templateLayout.id) {
                await Model.destroy(templateLayoutTemplates, {
                  where: {
                    templatesId: finnalyResult.id,
                    templateLayoutsId: templateLayout.id
                  }
                });
              } else {
                const templateLayoutEntity = _.pick(templateLayout, ['name', 'folder', 'status', 'typesId']);

                await Model.createOrUpdate(templateLayouts, templateLayoutEntity, {
                  where: {
                    name: templateLayout.name
                  }
                });
                const foundTemplateLayout = await Model.findOne(templateLayout, {
                  where: {
                    name: templateLayout.name
                  }
                });
                const templateLayoutTemplateEntity = _.pick(templateLayout, [
                  'imagesResize',
                  'folder',
                  'status',
                  'typesId'
                ]);

                await Model.createOrUpdate(
                  templateLayoutTemplates,
                  {
                    templatesId: finnalyResult.id,
                    templateLayoutsId: foundTemplateLayout.id,
                    ...templateLayoutTemplateEntity
                  },
                  {
                    where: {
                      templatesId: finnalyResult.id,
                      templateLayoutsId: foundTemplateLayout.id
                    }
                  }
                );
              }
            })
          );
        }
      } else {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudNotExisted'
        });
      }
    } catch (error) {
      ErrorHelpers.errorThrow(error, 'crudError', 'TemplateService');
    }

    return { result: finnalyResult };
  },
  update_old: async param => {
    let finnalyResult;

    try {
      const entity = param.entity;

      console.log('Template update: ', entity);

      const foundTemplate = await Model.findOne(templates, {
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

      if (foundTemplate) {
        const dupTemplate = await Model.findOne(templates, {
          where: {
            id: { $ne: param.id },
            name: entity.name || foundTemplate.name
          }
        }).catch(error => {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'getInfoError',
            error
          });
        });

        if (dupTemplate) {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'crudExisted',
            message: 'Tên mẫu chuyên mục phải là duy nhất'
          });
        } else {
          await Model.update(templates, entity, { where: { id: parseInt(param.id) } }).catch(error => {
            throw new ApiErrors.BaseError({
              statusCode: 202,
              type: 'crudError',
              error
            });
          });

          finnalyResult = await Model.findOne(templates, { where: { Id: param.id } }).catch(error => {
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
        }
      } else {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudNotExisted'
        });
      }
    } catch (error) {
      ErrorHelpers.errorThrow(error, 'crudError', 'TemplateService');
    }

    return { result: finnalyResult };
  },
  delete: async param => {
    try {
      console.log('delete id', param.id);

      const foundTemplate = await Model.findOne(templates, {
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

      if (!foundTemplate) {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudNotExisted'
        });
      } else {
        await Model.destroy(templates, { where: { id: parseInt(param.id) } });

        const templateAfterDelete = await Model.findOne(templates, { where: { Id: param.id } }).catch(err => {
          ErrorHelpers.errorThrow(err, 'crudError', 'TemplateService');
        });

        if (templateAfterDelete) {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'deleteError'
          });
        }
      }
    } catch (err) {
      ErrorHelpers.errorThrow(err, 'crudError', 'TemplateService');
    }

    return { status: 1 };
  },
  update_status: param =>
    new Promise((resolve, reject) => {
      try {
        console.log('block id', param.id);
        const id = param.id;
        const entity = param.entity;

        Model.findOne(templates, {
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
              Model.update(templates, entity, {
                where: { id: id }
              })
                .then(() => {
                  // console.log("rowsUpdate: ", rowsUpdate)
                  Model.findOne(templates, { where: { id: param.id } })
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
                      reject(ErrorHelpers.errorReject(err, 'crudError', 'templatesServices'));
                    });
                })
                .catch(err => {
                  reject(ErrorHelpers.errorReject(err, 'crudError', 'templatesServices'));
                });
            }
          })
          .catch(err => {
            reject(ErrorHelpers.errorReject(err, 'crudError', 'templatesServices'));
          });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'crudError', 'templatesServices'));
      }
    })
};
