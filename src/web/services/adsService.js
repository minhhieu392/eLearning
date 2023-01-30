import Model from '../../models/models'
import models from '../../entity/index'
import * as ApiErrors from '../../errors';
import ErrorHelpers from '../../helpers/errorHelpers';
import filterHelpers from '../../helpers/filterHelpers';

const { /* sequelize, */ sites, users, languages,ads, adsPositions, adsType } = models;

export default {
  get_list: async param => {
    let finnalyResult;

    try {
      const { filter, range, sort/* , auth */, attributes } = param;
      let whereFilter = filter;

      console.log(filter);
      try {
        whereFilter = await filterHelpers.combineFromDateWithToDate(whereFilter);
      } catch (error) {
        throw error;
      }

      // const perPage = (range[1] - range[0]) + 1
      // const page = Math.floor(range[0] / perPage);

      const { perPage, page } = filterHelpers.paginationOfSchema(range);

      console.log("perPage, page", perPage, page);

      whereFilter = await filterHelpers.makeStringFilterRelatively(['title', 'url', 'contents'], whereFilter, 'ads');

      if (!whereFilter) {
        whereFilter = { ...filter }
      }

      console.log('where', whereFilter);
      const att = filterHelpers.atrributesHelper(attributes);

      const result = await Model.findAndCountAll(ads,{
        where: whereFilter,
        order: sort,
        offset: range[0],
        attributes: att,
        limit: perPage, distinct: true,
        include: [
          {
            model: sites,
            as: 'sites',
          },
          {
            model: users,
            as: 'usersCreator',
            attributes: {
              exclude: ['password']
            }
          },
          {
            model: adsPositions,
            as: 'adsPositions'
          },
          {
            model: languages,
            as: 'languages'
          },
          {
            model: adsType,
            as: 'adsType'
          }
        ]
      }).catch(err => {
        ErrorHelpers.errorThrow(err, 'getListError', 'AdsService');
      })

      finnalyResult = {
        ...result,
        page: page + 1,
        perPage
      }
    } catch (err) {
      ErrorHelpers.errorThrow(err, 'getListError', 'AdsService');
    }

    return finnalyResult;
  },
  get_one: param => new Promise((resolve, reject) => {
    try {
      // console.log("Menu Model param: %o | id: ", param, param.id)
      const id = param.id;

      const att = filterHelpers.atrributesHelper(param.attributes, ['usersCreatorId']);

      Model.findOne(ads,{
        where: { id },
        attributes: att,
        include: [
          {
            model: sites,
            as: 'sites',
          },
          {
            model: users,
            as: 'usersCreator',
            attributes: {
              exclude: ['password']
            }
          },
          {
            model: adsPositions,
            as: 'adsPositions'
          },
          {
            model: adsType,
            as: 'adsType'
          }
        ]
      }).then(result => {
        if (!result) {
          reject(new ApiErrors.BaseError({
            statusCode: 202,
            type: 'crudNotExisted',
          }));
        }
        resolve(result)

      }).catch(err => {
        reject(ErrorHelpers.errorReject(err, 'getInfoError', 'AdsService'))
      });
    } catch (err) {
      reject(ErrorHelpers.errorReject(err, 'getInfoError', 'AdsService'))
    }
  }),
  get_all: param => new Promise(async (resolve, reject) => {
    try {
      // console.log("filter:", JSON.parse(param.filter))
      let filter = {}; let sort = [["id", "ASC"]]

      filter = filterHelpers.combineFromDateWithToDate(filter);

      filter = await filterHelpers.makeStringFilterRelatively(['title', 'url', 'contents'], filter, 'ads');
      if (param.filter)
        filter = param.filter

      if (param.sort)
        sort = param.sort

      Model.findAll(ads,{
        where: filter,
        order: sort,
        include: [
          {
            model: sites,
            as: 'sites',
          },
          {
            model: users,
            as: 'usersCreator',
            attributes: {
              exclude: ['password']
            }
          },
          {
            model: adsPositions,
            as: 'adsPositions'
          },
          {
            model: adsType,
            as: 'adsType'
          }
        ]
      }).then(result => {
        // console.log("result: ", result)
        resolve(result)
      }).catch(err => {
        reject(ErrorHelpers.errorReject(err, 'getListError', 'AdsService'))
      });
    } catch (err) {
      reject(ErrorHelpers.errorReject(err, 'getListError', 'AdsService'))
    }
  }),
}
