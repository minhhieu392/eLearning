// import moment from 'moment'
import models from '../entity/index';
import _ from 'lodash';
// import errorCode from '../utils/errorCode';
import Model from '../models/models';
// import errorCode from '../utils/errorCode';
import * as ApiErrors from '../errors';
import ErrorHelpers from '../helpers/errorHelpers';
import filterHelpers from '../helpers/filterHelpers';
import preCheckHelpers, { TYPE_CHECK } from '../helpers/preCheckHelpers';
const { /* sequelize, Op, */ siteProfiles, sites, places, socialChannels, socialGroupChannels, languages } = models;

export default {
  get_list: async param => {
    let finnalyResult;

    try {
      const { filter, range, sort, attributes } = param;
      let whereFilter = filter;
      const att = filterHelpers.atrributesHelper(attributes);

      console.log(filter);
      try {
        whereFilter = filterHelpers.combineFromDateWithToDate(whereFilter);
      } catch (error) {
        throw error;
      }

      const perPage = range[1] - range[0] + 1;
      const page = Math.floor(range[0] / perPage);

      whereFilter = await filterHelpers.makeStringFilterRelatively(['hotline', 'siteId'], whereFilter, 'siteProfiles');
      if (!whereFilter) {
        whereFilter = { ...filter };
      }

      console.log('where', whereFilter);

      const result = await Model.findAndCountAll(siteProfiles, {
        where: whereFilter,
        order: sort,
        offset: range[0],
        limit: perPage,
        attributes: att,
        distinct: true,
        include: [
          { model: sites, as: 'sites', attributes: ['id', 'name'], require: false },
          {
            model: languages,
            as: 'languages',
            attributes: ['id', 'languageName', 'languageCode']
          }
        ]
      }).catch(err => {
        ErrorHelpers.errorThrow(err, 'getListError', 'siteProfileService');
      });

      finnalyResult = {
        ...result,
        page: page + 1,
        perPage
      };
    } catch (err) {
      ErrorHelpers.errorThrow(err, 'getListError', 'siteProfileService');
    }

    return finnalyResult;
  },
  get_one: async param => {
    let finnalyResult;

    try {
      // console.log("Menu Model param: %o | id: ", param, param.id)
      const { id, auth, attributes } = param;

      const whereFilter = { id: id };

      // whereFilter = await filterHelpers.createWhereWithAuthorization(auth, whereFilter).catch(error => {
      //   ErrorHelpers.errorThrow(error);
      // });
      const att = filterHelpers.atrributesHelper(attributes);

      const result = await Model.findOne(siteProfiles, {
        where: whereFilter,
        attributes: att,
        include: [
          { model: sites, as: 'sites', attributes: ['id', 'name'], require: false },
          {
            model: languages,
            as: 'languages',
            attributes: ['id', 'languageName', 'languageCode']
          }
        ]
        // include: [
        //   { model: templates, as: 'templates' },
        //   { model: places, as: 'places' },
        //   { model: groupsiteProfiles, as: 'groupsiteProfiles' },
        //   { model: users, as: 'usersCreator', attributes: { exclude : ['password'] } },
        // ]
      }).catch(err => {
        ErrorHelpers.errorThrow(err, 'getInfoError', 'siteProfileService');
      });

      if (!result) {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudNotExisted'
        });
      }

      finnalyResult = result;
    } catch (err) {
      ErrorHelpers.errorThrow(err, 'getInfoError', 'siteProfileService');
    }

    return finnalyResult;
  },
  create: async param => {
    let finnalyResult;

    try {
      const entity = param;

      console.log('siteProfileModel create: ', entity);
      const infoArr = await preCheckHelpers.createPromiseCheckNew(
        Model.findOne(siteProfiles, {
          attributes: ['id'],
          where: {
            siteId: entity.siteId
          }
        }),
        entity.siteId ? true : false,
        TYPE_CHECK.CHECK_DUPLICATE,
        { parent: 'api.sites.id' }
      );

      if (!preCheckHelpers.check([infoArr])) {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'getInfoError',
          message: 'Không xác thực được thông tin gửi lên'
        });
      }
      finnalyResult = await Model.create(siteProfiles, param).catch(error => {
        console.log(error);
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
      ErrorHelpers.errorThrow(error, 'crudError', 'siteProfileService');
    }

    return { result: finnalyResult };
  },
  update: async param => {
    let finnalyResult;

    try {
      const entity = param.entity;

      console.log('siteProfile update: ', entity, param.id);

      const foundsiteProfile = await Model.findOne(siteProfiles, {
        where: {
          siteId: param.id
        }
      }).catch(error => {
        throw preCheckHelpers.createErrorCheck(
          { typeCheck: TYPE_CHECK.GET_INFO, modelStructure: { parent: 'siteProfiles' } },
          error
        );
      });

      if (!foundsiteProfile) {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudNotExisted'
        });
      }

      await Model.update(siteProfiles, entity, { where: { siteId: parseInt(param.id) } }).catch(error => {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudError',
          error
        });
      });

      finnalyResult = await Model.findOne(siteProfiles, { where: { siteId: param.id } }).catch(error => {
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
      ErrorHelpers.errorThrow(error, 'crudError', 'siteProfileService');
    }

    return { result: finnalyResult };
  },
  delete: async param => {
    try {
      console.log('delete id', param.id);

      const foundsiteProfile = await Model.findOne(siteProfiles, {
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

      if (!foundsiteProfile) {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudNotExisted'
        });
      } else {
        await siteProfileModel.destroy({ where: { id: parseInt(param.id) } });

        const siteProfileAfterDelete = await Model.findOne(siteProfiles, { where: { Id: param.id } }).catch(err => {
          ErrorHelpers.errorThrow(err, 'crudError', 'siteProfileService');
        });

        if (siteProfileAfterDelete) {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'deleteError'
          });
        }
      }
    } catch (err) {
      ErrorHelpers.errorThrow(err, 'crudError', 'siteProfileService');
    }

    return { status: 1 };
  }
};
