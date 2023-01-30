// import moment from 'moment'
import models from '../entity/index';
import Model from './../models/models';
import _ from 'lodash';
// import errorCode from '../utils/errorCode';
import * as ApiErrors from '../errors';
import ErrorHelpers from '../helpers/errorHelpers';
import filterHelpers from '../helpers/filterHelpers';
import preCheckHelpers, { TYPE_CHECK } from '../helpers/preCheckHelpers';
import lodashHelpers from '../helpers/lodashHelpers';

const { Op, users, sites, templates, templateLayouts, templateLayoutTemplates, categoriesTemplateLayouts } = models;

export default {
  get_list: param =>
    new Promise(async (resolve, reject) => {
      try {
        const { filter, range, sort, attributes } = param;

        let whereFilter = _.pick(filter, [
          'name',
          'folder',
          'status',
          'usersCreatorId',
          'typesId',
          'ToDate',
          'FromDate'
        ]);
        let whereTemplate = _.pick(filter, ['templatesId']);

        whereTemplate = lodashHelpers.rename(whereTemplate, [['templatesId', 'id']]);
        let templateRequired = false;

        if (Object.keys(whereTemplate).length > 0) {
          templateRequired = true;
        }
        try {
          whereFilter = filterHelpers.combineFromDateWithToDate(whereFilter);
        } catch (error) {
          reject(error);
        }
        if (filter.excludedId) {
          whereFilter = { ...whereFilter, id: filter.excludedId };
        }
        const perPage = range[1] - range[0] + 1;
        const page = Math.floor(range[0] / perPage);

        whereFilter = await filterHelpers.makeStringFilterRelatively(
          ['name', 'folder'],
          whereFilter,
          'templateLayouts'
        );

        if (!whereFilter) {
          whereFilter = { ...filter };
        }
        const att = filterHelpers.atrributesHelper(attributes);

        console.log('where', whereFilter);

        await Model.findAndCountAll(templateLayouts, {
          where: whereFilter,
          order: sort,
          offset: range[0],
          attributes: att,
          limit: perPage,
          distinct: true,
          logging: true,
          include: [
            { model: users, as: 'usersCreator', attributes: { exclude: ['password'] } },
            { model: templates, as: 'templates', where: whereTemplate, required: false }
          ]
        })
          .then(result => {
            console.log('result', result);
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
        const att = filterHelpers.atrributesHelper(param.attributes, ['usersCreatorId']);

        Model.findOne(templateLayouts, {
          where: { id: id },
          logging: true,
          attributes: att,
          include: [
            { model: templates, as: 'templates', required: false }
            // { model: users, as: 'usersCreator', attributes: { exclude : ['password'] } },
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
            reject(ErrorHelpers.errorReject(err, 'getInfoError', 'TemplateLayoutService'));
          });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'getInfoError', 'TemplateLayoutService'));
      }
    }),
  create: async param => {
    let finnalyResult;

    try {
      const entity = param.entity;
      const newEntity = _.pick(entity, ['name', 'folder', 'status', 'typesId', 'usersCreatorId']);

      let whereFilter = {
        name: entity.name
      };

      whereFilter = await filterHelpers.makeStringFilterAbsolutely(['name'], whereFilter, 'templateLayouts');

      const dupTemplateLayout = await preCheckHelpers.createPromiseCheckNew(
        Model.findOne(templateLayouts, { attributes: ['id'], where: whereFilter }),
        !!entity.name,
        TYPE_CHECK.CHECK_DUPLICATE,
        { parent: 'api.templateLayouts.name' }
      );

      if (!preCheckHelpers.check([dupTemplateLayout])) {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'getInfoError',
          message: 'Không xác thực được thông tin gửi lên'
        });
      }

      finnalyResult = await Model.create(templateLayouts, newEntity).catch(error => {
        console.log('error', error);
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudError',
          error
        });
      });
      // console.log('finnalyResult',finnalyResult);
      if (!finnalyResult) {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudInfo'
        });
      } else {
        if (entity && entity.templates && Array.isArray(entity.templates)) {
          await Promise.all(
            entity.templates.map(async template => {
              const foundTemplate = await Model.findOne(templates, {
                where: {
                  id: template.id || -1
                }
              });

              if (foundTemplate && foundTemplate.id) {
                const templateLayoutTemplateEntity = _.pick(template, ['imagesResize', 'imagePreview']);

                await Model.createOrUpdate(
                  templateLayoutTemplates,
                  {
                    templatesId: foundTemplate.id,
                    templateLayoutsId: finnalyResult.id,
                    ...templateLayoutTemplateEntity
                  },
                  {
                    where: {
                      templatesId: foundTemplate.id,
                      templateLayoutsId: finnalyResult.id
                    }
                  }
                );
              }
            })
          );
        }
      }
    } catch (error) {
      ErrorHelpers.errorThrow(error, 'crudError', 'TemplateLayoutService');
    }

    return { result: finnalyResult };
  },
  create_old: async param => {
    let finnalyResult;

    try {
      const entity = param.entity;

      const dupTemplateLayout = await Model.findOne(templateLayouts, {
        where: {
          name: entity.name
        }
      }).catch(error => {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'getInfoError',
          error
        });
      });

      if (dupTemplateLayout) {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudExisted',
          message: 'Tên thư viện giao diện phải là duy nhất'
        });
      } else {
        finnalyResult = await Model.create(templateLayouts, param.entity).catch(error => {
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
      }
    } catch (error) {
      ErrorHelpers.errorThrow(error, 'crudError', 'TemplateLayoutService');
    }

    return { result: finnalyResult };
  },
  update: async param => {
    let finnalyResult;

    try {
      const entity = param.entity;
      const newEntity = _.pick(entity, ['name', 'folder', 'status', 'typesId']);
      console.log('TemplateLayout update: ', entity);

      const foundTemplateLayout = await Model.findOne(templateLayouts, {
        where: {
          id: param.id
        }
      }).catch(error => {
        throw preCheckHelpers.createErrorCheck(
          { typeCheck: TYPE_CHECK.GET_INFO, modelStructure: { parent: 'templateLayouts' } },
          error
        );
      });

      if (foundTemplateLayout) {
        let whereFilter = {
          id: { $ne: param.id },
          name: entity.name
        };

        whereFilter = await filterHelpers.makeStringFilterAbsolutely(['name'], whereFilter, 'templateLayouts');

        const dupTemplateLayout = await preCheckHelpers.createPromiseCheckNew(
          Model.findOne(templateLayouts, { attributes: ['id'], where: whereFilter }),
          entity.name ? true : false,
          TYPE_CHECK.CHECK_DUPLICATE,
          { parent: 'api.templateLayouts.name' }
        );

        if (!preCheckHelpers.check([dupTemplateLayout])) {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'getInfoError',
            message: 'Không xác thực được thông tin gửi lên'
          });
        }

        await Model.update(templateLayouts, newEntity, { where: { id: parseInt(param.id) } }).catch(error => {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'crudError',
            error
          });
        });

        finnalyResult = await Model.findOne(templateLayouts, { where: { id: param.id } }).catch(error => {
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
        } else {
          if (entity && entity.templates && Array.isArray(entity.templates)) {
            await Promise.all(
              entity.templates.map(async template => {
                const foundTemplate = await Model.findOne(templates, {
                  where: {
                    id: template.id
                  }
                });

                if (foundTemplate && template.isDelete === true) {
                  await Model.destroy(templateLayoutTemplates, {
                    where: {
                      templateLayoutsId: finnalyResult && finnalyResult.dataValues.id,
                      templatesId: foundTemplate.id
                    }
                  });
                } else if (foundTemplate && !template.isDelete) {
                  const templateLayoutTemplateEntity = _.pick(template, ['imagesResize', 'imagePreview']);

                  await Model.createOrUpdate(
                    templateLayoutTemplates,
                    {
                      templatesId: foundTemplate.id,
                      templateLayoutsId: finnalyResult.id,
                      ...templateLayoutTemplateEntity
                    },
                    {
                      where: {
                        templatesId: foundTemplate.id,
                        templateLayoutsId: finnalyResult.id
                      }
                    }
                  );
                }
              })
            );
          }
        }
      } else {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudNotExisted'
        });
      }
    } catch (error) {
      ErrorHelpers.errorThrow(error, 'crudError', 'TemplateLayoutService');
    }

    return { result: finnalyResult };
  },
  update_status: param =>
    new Promise((resolve, reject) => {
      try {
        console.log('block id', param.id);
        const id = param.id;
        const entity = param.entity;

        Model.findOne(templateLayouts, {
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
              Model.update(templateLayouts, entity, {
                where: { id: id }
              })
                .then(() => {
                  // console.log("rowsUpdate: ", rowsUpdate)
                  Model.findOne(templateLayouts, { where: { id: param.id } })
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
                      reject(ErrorHelpers.errorReject(err, 'crudError', 'templateLayoutsServices'));
                    });
                })
                .catch(err => {
                  reject(ErrorHelpers.errorReject(err, 'crudError', 'templateLayoutsServices'));
                });
            }
          })
          .catch(err => {
            reject(ErrorHelpers.errorReject(err, 'crudError', 'templateLayoutsServices'));
          });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'crudError', 'templateLayoutsServices'));
      }
    }),
  get_all: param =>
    new Promise(async (resolve, reject) => {
      try {
        const { filter, sort } = param;
        let whereFilter = _.pick(filter, [
          'name',
          'folder',
          'status',
          'usersCreatorId',
          'typesId',
          'FromDate',
          'ToDate'
        ]);
        let whereTemplate = _.pick(filter, ['templatesId']);
        let templateRequired = false;
        if (Object.keys(whereTemplate).length > 0) {
          templateRequired = true;
        }
        whereTemplate = lodashHelpers.rename(whereTemplate, [['templatesId', 'id']]);
        whereFilter = await filterHelpers.makeStringFilterRelatively(
          ['name', 'folder'],
          whereFilter,
          'templateLayouts'
        );
        try {
          whereFilter = filterHelpers.combineFromDateWithToDate(whereFilter);
        } catch (error) {
          reject(error);
        }
        console.log('whereFilter', whereFilter);
        Model.findAll(templateLayouts, {
          where: whereFilter,
          order: sort,
          distinct: true,
          include: [
            { model: users, as: 'usersCreator', attributes: { exclude: ['password'] } },
            { model: templates, as: 'templates', where: whereTemplate, required: templateRequired }
          ]
        })
          .then(result => {
            resolve(result);
          })
          .catch(err => {
            reject(ErrorHelpers.errorReject(err, 'getListError', 'TemplateService'));
          });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'getListError', 'TemplateService'));
      }
    })
};
