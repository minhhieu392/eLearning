// import moment from 'moment'
import Model from '../../models/models';
import models from '../../entity/index';
// import _ from 'lodash';
// import errorCode from '../utils/errorCode';
import * as ApiErrors from '../../errors';
import ErrorHelpers from '../../helpers/errorHelpers';
import filterHelpers from '../../helpers/filterHelpers';
// import preCheckHelpers, { TYPE_CHECK } from '../helpers/preCheckHelpers';

const {
  /* sequelize, Op, */ users,
  sites,
  templates,
  places,
  groupSites,
  socialChannels,
  /* tblGatewayEntity, Roles */ siteProfiles
} = models;

export default {
  get_list: async param => {
    let finnalyResult;

    try {
      const { filter, range, sort, /*  auth */ attributes, notIds } = param;
      let whereFilter = filter;

      console.log(filter);
      try {
        whereFilter = filterHelpers.combineFromDateWithToDate(whereFilter);
      } catch (error) {
        throw error;
      }
      const att = filterHelpers.atrributesHelper(attributes, ['placesId']);

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
        attributes: att,
        limit: perPage,
        distinct: true,
        include: [
          {
            model: siteProfiles,
            as: 'siteProfiles',
            require: false
            // include: [
            //   { model: socialChannels, as: 'socialChannelFacebook', attributes: ['link', 'name', 'avatar'] },
            //   { model: socialChannels, as: 'socialChannelZalo', attributes: ['link', 'name', 'avatar'] }
            // ]
          },
          { model: templates, required: true, as: 'templates', attributes: ['id', 'name', 'folder'] },
          // {
          //   model: places,
          //   required: true,
          //   as: 'places',
          //   attributes: ['id', 'name', 'mobile', 'address', 'email', 'placeHere', 'taxCode']
          // },
          { model: groupSites, as: 'groupSites', required: true, attributes: ['id', 'name'] },
          { model: users, as: 'usersCreator', required: true, attributes: ['id', 'fullname'] }
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
      const { id, /* auth  */ attributes } = param;

      const whereFilter = { id: id };

      // whereFilter = await filterHelpers.createWhereWithAuthorization(auth, whereFilter).catch(error => {
      //   ErrorHelpers.errorThrow(error);
      // });
      const att = filterHelpers.atrributesHelper(attributes, ['placesId']);

      const result = await Model.findOne(sites, {
        where: whereFilter,
        attributes: att,
        include: [
          {
            model: siteProfiles,
            as: 'siteProfiles',
            require: false
          },
          { model: templates, as: 'templates', attributes: ['id', 'name', 'folder'] },
          { model: groupSites, as: 'groupSites', attributes: ['id', 'name'] },
          { model: users, as: 'usersCreator', attributes: ['id', 'fullname'] }
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
  get_all: param =>
    new Promise(async (resolve, reject) => {
      try {
        // console.log("filter:", JSON.parse(param.filter))
        const { filter, sort } = param;
        let whereFilter = filter;

        console.log(filter);
        try {
          whereFilter = filterHelpers.combineFromDateWithToDate(whereFilter);
        } catch (error) {
          reject(error);
        }

        whereFilter = await filterHelpers.makeStringFilterRelatively(
          ['name', 'url', 'seoKeywords', 'seoDescriptions'],
          whereFilter,
          'sites'
        );

        if (!whereFilter) {
          whereFilter = { ...filter };
        }

        Model.findAll(sites, {
          where: filter,
          order: sort,
          include: [
            { model: templates, as: 'templates' },
            { model: places, as: 'places' },
            { model: groupSites, as: 'groupSites' },
            { model: users, as: 'usersCreator', attributes: { exclude: ['password'] } }
          ]
        })
          .then(result => {
            // console.log("result: ", result)
            resolve(result);
          })
          .catch(err => {
            reject(ErrorHelpers.errorReject(err, 'getListError', 'SiteService'));
          });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'getListError', 'SiteService'));
      }
    })
};
