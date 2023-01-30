// import moment from 'moment'
import openSheduleModel from '../../models/openShedules';
// import placeModel from '../../models/places';
import models from '../../entity/index';
// import _ from 'lodash';
// import errorCode from '../utils/errorCode';
// import * as ApiErrors from '../../errors';
import ErrorHelpers from '../../helpers/errorHelpers';
// import filterHelpers from '../../helpers/filterHelpers';
// import preCheckHelpers, { TYPE_CHECK } from '../../helpers/preCheckHelpers';

const { /* sequelize, /* Op, users, */ places /* tblGatewayEntity, Roles */ } = models;

export default {
  get_by_places: param =>
    new Promise((resolve, reject) => {
      try {
        // console.log("Menu Model param: %o | id: ", param, param.id)
        const id = param.id;

        openSheduleModel
          .findAll({
            where: { placesId: id },
            order: [
              ['id', 'DESC'],
            ],
            include: [
              {
                model: places,
                as: 'places',
                attributes: [
                  'name',
                  'mobile',
                  'address',
                  'representative',
                  'phoneOfRepresentative',
                  'taxCode',
                  'placeCode',
                  'status'
                ],

              }
            ]
          })
          .then(result => {
            // if (!result) {
            //   reject(new ApiErrors.BaseError({
            //     statusCode: 202,
            //     type: 'crudNotExisted',
            //   }));
            // }
            resolve(result || []);
          })
          .catch(err => {
            reject(ErrorHelpers.errorReject(err, 'getInfoError', 'OpenSheduleService'));
          });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'getInfoError', 'OpenSheduleService'));
      }
    }),
};
