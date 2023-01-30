import MODELS from '../models/models';
// import templateLayoutsModel from '../models/templateLayouts'
import models from '../entity/index';

import ErrorHelpers from '../helpers/errorHelpers';

import filterHelpers from '../helpers/filterHelpers';

const { /* sequelize, */ users, userTokens } = models;

export default {
  get_list: param =>
    new Promise((resolve, reject) => {
      try {
        const { filter, range, sort, attributes } = param;
        let whereFilter = filter;

        console.log('filter====', filter);

        const perPage = range[1] - range[0] + 1;
        const page = Math.floor(range[0] / perPage);

        if (!whereFilter) {
          whereFilter = { ...filter };
        }

        console.log('where', whereFilter);

        const att = filterHelpers.atrributesHelper(attributes);

        MODELS.findAndCountAll(userTokens, {
          where: whereFilter,
          order: sort,
          offset: range[0],
          limit: perPage,
          attributes: att,
          logging: true,
          include: [
            {
              model: users,
              as: 'users',
              attributes: ['id', 'fullname', 'username', 'mobile', 'email'],
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
            reject(ErrorHelpers.errorReject(err, 'getListError', 'GroupUserService'));
          });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'getListError', 'GroupUserService'));
      }
    })
};
