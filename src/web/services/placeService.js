// import moment from 'moment'
import placeModel from '../../models/places'
import models from '../../entity/index'
import _ from 'lodash';
// import errorCode from '../utils/errorCode';
import * as ApiErrors from '../../errors';
import ErrorHelpers from '../../helpers/errorHelpers';
import filterHelpers from '../../helpers/filterHelpers';
// import preCheckHelpers, { TYPE_CHECK } from '../helpers/preCheckHelpers';

const { /* sequelize, Op, */ users, wards, groupPlaces, districts, provinces /* tblGatewayEntity, Roles */ } = models;

export default {
  get_list: param => new Promise(async (resolve, reject) => {
    try {
      const { filter, range, sort, attributes } = param;
      let whereFilter = _.omit(filter, ['districtsId', 'provincesId']);

      console.log(filter);
      try {
        whereFilter = filterHelpers.combineFromDateWithToDate(whereFilter);
      } catch (error) {
        reject(error);
      }
      const att = filterHelpers.atrributesHelper(attributes, ['taxCode', 'placeCode', 'usernameOfPlace', 'passwordOfPlace']);

      const perPage = (range[1] - range[0]) + 1
      const page = Math.floor(range[0] / perPage);

      whereFilter = await filterHelpers.makeStringFilterRelatively(['name', 'mobile', 'address', 'representative', 'phoneOfRepresentative', 'taxCode', 'placeCode', 'usernameOfPlace'], whereFilter, 'places');

      if (!whereFilter) {
        whereFilter = { ...filter }
      }

      console.log('where', whereFilter);

      placeModel.findAndCountAll({
        where: whereFilter,
        order: sort,
        offset: range[0],
        limit: perPage, distinct: true,
        attributes: att,
        include: [
          {
            model: wards, as: 'wards', where: _.pick(filter, ['districtsId']), include: [{
              model: districts, as: 'districts', where: _.pick(filter, ['provincesId']), include: [{
                model: provinces, as: 'provinces'
              }]
            }]
          },
          { model: groupPlaces, as: 'groupPlaces' },
          { model: users, as: 'usersCreator', attributes: { exclude: ['password'] } },
        ]
      }).then(result => {
        resolve({
          ...result,
          page: page + 1,
          perPage
        })
      }).catch(err => {
        reject(ErrorHelpers.errorReject(err, 'getListError', 'PlaceService'))
      });
    } catch (err) {
      reject(ErrorHelpers.errorReject(err, 'getListError', 'PlaceService'))
    }
  }),
  get_one: param => new Promise((resolve, reject) => {
    try {
      // console.log("Menu Model param: %o | id: ", param, param.id)
      const id = param.id
      const att = filterHelpers.atrributesHelper(param.attributes, ['taxCode', 'placeCode', 'usernameOfPlace', 'passwordOfPlace']);

      placeModel.findOne({
        where: { 'id': id },
        attributes: att,
        include: [
          {
            model: wards, as: 'wards', include: [{
              model: districts, as: 'districts', include: [{
                model: provinces, as: 'provinces'
              }]
            }]
          },
          { model: groupPlaces, as: 'groupPlaces' },
          { model: users, as: 'usersCreator', attributes: { exclude: ['password'] } },
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
        reject(ErrorHelpers.errorReject(err, 'getInfoError', 'PlaceService'))
      });
    } catch (err) {
      reject(ErrorHelpers.errorReject(err, 'getInfoError', 'PlaceService'))
    }
  }),
  get_all: param => new Promise(async (resolve, reject) => {
    try {
      // console.log("filter:", JSON.parse(param.filter))
      const { filter, sort } = param;
      let whereFilter = _.omit(filter, ['districtsId', 'provincesId']);

      console.log(filter);
      try {
        whereFilter = filterHelpers.combineFromDateWithToDate(whereFilter);
      } catch (error) {
        reject(error);
      }

      whereFilter = await filterHelpers.makeStringFilterRelatively(['name', 'mobile', 'address', 'representative', 'phoneOfRepresentative', 'taxCode', 'placeCode', 'usernameOfPlace'], whereFilter, 'places');

      if (!whereFilter) {
        whereFilter = { ...filter }
      }

      placeModel.findAll({
        where: filter,
        order: sort,
        attributes: { exclude: ['taxCode', 'placeCode', 'usernameOfPlace', 'passwordOfPlace'] },
        include: [
          {
            model: wards, as: 'wards', where: _.pick(filter, ['districtsId']), include: [{
              model: districts, as: 'districts', where: _.pick(filter, ['provincesId']), include: [{
                model: provinces, as: 'provinces'
              }]
            }]
          },
          { model: groupPlaces, as: 'groupPlaces' },
          { model: users, as: 'usersCreator', attributes: { exclude: ['password'] } },
        ]
      }).then(result => {
        // console.log("result: ", result)
        resolve(result)
      }).catch(err => {
        reject(ErrorHelpers.errorReject(err, 'getListError', 'PlaceService'))
      });
    } catch (err) {
      reject(ErrorHelpers.errorReject(err, 'getListError', 'PlaceService'))
    }
  }),
}
