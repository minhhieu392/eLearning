import _ from 'lodash';
import models from '../entity/index';
import * as ApiErrors from '../errors';
import ErrorHelpers from '../helpers/errorHelpers';
import filterHelpers from '../helpers/filterHelpers';
import preCheckHelpers, { TYPE_CHECK } from '../helpers/preCheckHelpers';
import Model from '../models/models';
const {
  /* sequelize, Op, */ users,

  sites,
  groupSites,

  siteProfiles
} = models;

export default {
  get_list: async param => {
    let finnalyResult;

    try {
      const { filter, range, sort, auth, attributes, notIds } = param;
      let whereFilter = filter;

      console.log(filter);
      try {
        whereFilter = filterHelpers.combineFromDateWithToDate(whereFilter);
      } catch (error) {
        throw error;
      }
      const att = filterHelpers.atrributesHelper(attributes);
      const perPage = range[1] - range[0] + 1;
      const page = Math.floor(range[0] / perPage);

      whereFilter = await filterHelpers.makeStringFilterRelatively(
        ['name', 'seoKeywords', 'seoDescriptions'],
        whereFilter,
        'sites'
      );

      // whereFilter = await filterHelpers.createWhereWithAuthorization(auth, whereFilter).catch(error => {
      //   ErrorHelpers.errorThrow(error);
      // });

      if (!whereFilter) {
        whereFilter = { ...filter };
      }
      if (notIds) {
        const notIdList = notIds.split(',');
        console.log('notIds', notIdList);
        whereFilter.id = { $not: notIdList };
      }
      console.log('where', whereFilter);

      const result = await Model.findAndCountAll(sites, {
        where: whereFilter,
        order: sort,
        offset: range[0],
        limit: perPage,
        attributes: att,
        logging: true,
        include: [
          { model: groupSites, as: 'groupSites', required: false, attributes: ['id', 'name'] },
          { model: users, as: 'usersCreator', attributes: ['id', 'username', 'fullname'] }
        ]
      }).catch(err => {
        ErrorHelpers.errorThrow(err, 'getListError', 'SiteService');
      });

      finnalyResult = {
        ...result,
        page: page + 1,
        perPage
      };
    } catch (err) {
      ErrorHelpers.errorThrow(err, 'getListError', 'SiteService');
    }

    return finnalyResult;
  },
  get_one: async param => {
    let finnalyResult;

    try {
      // console.log("Menu Model param: %o | id: ", param, param.id)
      const { id, auth, attributes } = param;
      const att = filterHelpers.atrributesHelper(attributes, ['usersCreatorId']);
      // console.log(att);
      const whereFilter = { id: id };

      // whereFilter = await filterHelpers.createWhereWithAuthorization(auth, whereFilter).catch(error => {
      //   ErrorHelpers.errorThrow(error);
      // });

      const result = await Model.findOne(sites, {
        where: whereFilter,
        attributes: att,
        include: [
          { model: groupSites, as: 'groupSites', required: false, attributes: ['id', 'name'] },
          { model: siteProfiles, as: 'siteProfiles', required: false }
        ]
      }).catch(err => {
        ErrorHelpers.errorThrow(err, 'getInfoError', 'SiteService');
      });

      if (!result) {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudNotExisted'
        });
      }

      finnalyResult = result;
    } catch (err) {
      ErrorHelpers.errorThrow(err, 'getInfoError', 'SiteService');
    }

    return finnalyResult;
  },
  create: async param => {
    let finnalyResult;
    let socialChannelResult;
    let socialChannelParam;

    try {
      const entity = param.entity;
      let whereFilter = {
        name: entity.name
      };

      whereFilter = await filterHelpers.makeStringFilterAbsolutely(['name'], whereFilter, 'sites');

      const infoArr = Array.from(
        await Promise.all([
          preCheckHelpers.createPromiseCheckNew(
            Model.findOne(sites, { attributes: ['id'], where: whereFilter }),
            entity.name ? true : false,
            TYPE_CHECK.CHECK_DUPLICATE,
            { parent: 'api.sites.name' }
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

      finnalyResult = await Model.create(sites, param.entity).catch(error => {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudError',
          error
        });
      });

      if (entity.siteProfiles && entity.siteProfiles.length > 0) {
        for (const e of entity.siteProfiles) {
          let newSiteProfile;

          // if (e.hotline) {

          newSiteProfile = Model.create(siteProfiles, {
            ...e,
            siteId: finnalyResult.dataValues.id
          });
          // }
          // else
          // {
          //   newSiteProfile =  Model.create(siteProfiles, {
          //     address: '',
          //     hotline: '',
          //     email: '',
          //     chatbox: '',
          //     languagesId: 1,
          //     siteId: finnalyResult.dataValues.id
          //   });
          // }

          if (!finnalyResult) {
            throw new ApiErrors.BaseError({
              statusCode: 202,
              type: 'crudInfo'
            });
          }

          if (newSiteProfile) {
            const foundSiteProfile = Model.findOne(siteProfiles, {
              where: {
                id:
                  (newSiteProfile &&
                    newSiteProfile.result &&
                    newSiteProfile.result.dataValues &&
                    newSiteProfile.result.dataValues.id) ||
                  -1
              }
            });

            console.log('foundSiteProfile', foundSiteProfile);
          }
        }
      }
    } catch (error) {
      ErrorHelpers.errorThrow(error, 'crudError', 'SiteService');
    }

    return { result: finnalyResult };
  },
  update: async param => {
    let finnalyResult;

    try {
      const entity = param.entity;

      console.log('Site update: ', entity);

      const foundSite = await Model.findOne(sites, {
        where: {
          id: param.id
        },
        logging: console.log,
        include: [
          {
            model: siteProfiles,
            as: 'siteProfiles'
          }
        ]
      }).catch(error => {
        throw preCheckHelpers.createErrorCheck(
          { typeCheck: TYPE_CHECK.GET_INFO, modelStructure: { parent: 'sites' } },
          error
        );
      });

      if (!foundSite) {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudNotExisted'
        });
      }
      if (entity.siteProfiles && foundSite) {
        await _.each(entity.siteProfiles, async function(object) {
          if (object.flag === 1) {
            await Model.createOrUpdate(
              siteProfiles,
              {
                ...object,
                ...{ sitesId: foundSite.id }
              },
              {
                where: { id: object.id }
              }
            );
            const foundSiteProfile = await Model.findOne(siteProfiles, {
              where: {
                id: object.id || -1
              },
              logging: console.log
            });
          } else {
            await Model.destroy(siteProfiles, {
              where: { id: object.id }
            });
          }
        });
      }
      let whereFilter = {
        id: { $ne: param.id },
        name: entity.name
      };

      whereFilter = await filterHelpers.makeStringFilterAbsolutely(['name'], whereFilter, 'sites');

      const infoArr = Array.from(
        await Promise.all([
          preCheckHelpers.createPromiseCheckNew(
            Model.findOne(sites, { attributes: ['id'], where: whereFilter }),
            entity.name ? true : false,
            TYPE_CHECK.CHECK_DUPLICATE,
            { parent: 'api.sites.name' }
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

      await Model.update(sites, entity, { where: { id: parseInt(param.id) } }).catch(error => {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudError',
          error
        });
      });

      finnalyResult = await Model.findOne(sites, {
        where: { id: param.id },
        include: { model: siteProfiles, as: 'siteProfiles', require: false }
      }).catch(error => {
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
    } catch (error) {
      ErrorHelpers.errorThrow(error, 'crudError', 'SiteService');
    }

    return { result: finnalyResult };
  },
  update_old: async param => {
    let finnalyResult;

    try {
      const entity = param.entity;

      console.log('Site update: ', entity);

      const foundSite = await Model.findOne(sites, {
        where: {
          id: param.id
        }
      }).catch(error => {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'getInfoError',
          message: 'Lấy thông tin của website thất bại!',
          error
        });
      });

      if (foundSite) {
        const arrPromise = [];

        arrPromise.push(
          Model.findOne(sites, {
            where: {
              id: { $ne: param.id },
              name: entity.name || foundSite.name,
              templatesId: entity.templatesId || foundSite.templatesId
            }
          })
        );

        arrPromise.push(
          groupSites.findOne({
            where: {
              id: entity.groupSitesId || foundSite.groupSitesId
            }
          })
        );

        const infoArr = Array.from(await Promise.all(arrPromise));

        if (infoArr[0] || !infoArr[1]) {
          if (infoArr[0]) {
            throw new ApiErrors.BaseError({
              statusCode: 202,
              type: 'crudNotExisted',
              message: `Tên website và mẫu website phải là duy nhất`
            });
          }
          if (!infoArr[1]) {
            throw new ApiErrors.BaseError({
              statusCode: 202,
              type: 'crudExisted',
              message: `Mẫu website không tồn tại`
            });
          }
        } else {
          await Model.update(sites, entity, { where: { id: parseInt(param.id) } }).catch(error => {
            throw new ApiErrors.BaseError({
              statusCode: 202,
              type: 'crudError',
              error
            });
          });

          finnalyResult = await Model.findOne(sites, { where: { Id: param.id } }).catch(error => {
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
        }
      } else {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudNotExisted'
        });
      }
    } catch (error) {
      ErrorHelpers.errorThrow(error, 'crudError', 'SiteService');
    }

    return { result: finnalyResult };
  },
  delete: async param => {
    try {
      console.log('delete id', param.id);

      const foundSite = await Model.findOne(sites, {
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

      if (!foundSite) {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudNotExisted'
        });
      } else {
        await Model.destroy(sites, { where: { id: parseInt(param.id) } });
        await Model.destroy(siteProfiles, { where: { siteId: parseInt(param.id) } });

        const siteAfterDelete = await Model.findOne(sites, { where: { Id: param.id } }).catch(err => {
          ErrorHelpers.errorThrow(err, 'crudError', 'SiteService');
        });

        if (siteAfterDelete) {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'deleteError'
          });
        }
      }
    } catch (err) {
      ErrorHelpers.errorThrow(err, 'crudError', 'SiteService');
    }

    return { status: 1 };
  },
  get_all: async param => {
    let finnalyResult;

    try {
      // console.log("filter:", JSON.parse(param.filter))
      const { filter, auth } = param;

      const whereFilter = filter || {};

      // whereFilter = await filterHelpers.createWhereWithAuthorization(auth, whereFilter).catch(error => {
      //   ErrorHelpers.errorThrow(error);
      // });

      // const { placesId } = await filterHelpers.getInfoAuthorization(auth, { placesId: filter.placesId }, true);

      // if (placesId) {
      //   whereFilter.placesId = placesId;
      // }

      const sort = param.sort || ['id', 'DESC'];

      finnalyResult = await Model.findAll(sites, {
        where: whereFilter,
        order: sort
      }).catch(err => {
        ErrorHelpers.errorThrow(err, 'getListError', 'SiteService');
      });
    } catch (err) {
      ErrorHelpers.errorThrow(err, 'getListError', 'SiteService');
    }

    return finnalyResult;
  }
};
