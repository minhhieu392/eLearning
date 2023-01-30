import _ from 'lodash';
import models from '../entity/index';
import * as ApiErrors from '../errors';
import filterHelpers from '../helpers/filterHelpers';

const { sequelize, Op, users, menus, roles, sites } = models;

export default {
  get_list: param =>
    new Promise((resolve, rejects) => {
      try {
        const filter = param.filter;
        const range = param.range;
        const perPage = range[1] - range[0] + 1;
        // const page = (range[0] / perPage)
        const sort = param.sort;
        const att = filterHelpers.atrributesHelper(param.attributes);

        console.log('filter: ', filter);

        roles
          .findAndCountAll({
            where: filter,
            order: sort,
            offset: range[0],
            attributes: att,
            limit: perPage,
            distinct: true,
            include: [
              { model: users, as: 'users', required: true },
              { model: sites, as: 'sites', required: true, where: { status: true } },
              { model: menus, as: 'menus', required: true }
            ],
            logging: console.log
          })
          .then(result => {
            // console.log("Result: ", result);
            resolve(result);
          })
          .catch(error => {
            rejects(error);
          });
      } catch (error) {
        rejects(error);
      }
    }),
  get_one: param =>
    new Promise((resolve, rejects) => {
      try {
        // console.log("BloArticle Model param: %o | id: ", param, param.id)
        const id = param.id;
        const att = filterHelpers.atrributesHelper(param.attributes);

        roles
          .findById(id, {
            attributes: att,
            include: [
              { model: users, as: 'users', required: true },
              { model: sites, as: 'sites', required: true },
              { model: menus, as: 'menus', required: true }
            ]
          })
          .then(result => {
            resolve(result);
          })
          .catch(error => {
            rejects(error);
          });
      } catch (error) {
        rejects(error);
      }
    }),
  create: param =>
    new Promise((resolve, rejects) => {
      try {
        roles
          .create(param.entity)
          .then(result => {
            resolve(result);
          })
          .catch(error => {
            rejects(error);
          });
      } catch (error) {
        rejects(error);
      }
    }),
  update: param =>
    new Promise((resolve, rejects) => {
      try {
        // console.log("param: ", param)
        roles
          .update(param.entity, { where: { ID: parseInt(param.id) } })
          .then(() => {
            // console.log("rowsUpdate: ", rowsUpdate)
            users.findById(param.id).then(result => {
              resolve(result);
            });
          })
          .catch(error => {
            rejects(error);
          });
      } catch (error) {
        rejects(error);
      }
    }),
  get_many: param =>
    new Promise((resolve, rejects) => {
      try {
        console.log('filter:', param.filter);
        const ids = param.filter.id;

        roles
          .findAll({
            where: {
              id: {
                [Op.in]: ids
              }
            },
            include: [
              { model: users, as: 'users', required: true },
              { model: sites, as: 'sites', required: true },
              { model: menus, as: 'menus', required: true }
            ]
          })
          .then(result => {
            // console.log("result: ", result)
            resolve(result);
          })
          .catch(error => {
            rejects(error);
          });
      } catch (error) {
        rejects(error);
      }
    }),
  find_all: param =>
    new Promise((resolve, reject) => {
      try {
        console.log('param: ', param);
        const filter = param.filter;

        console.log('filter.menuName', filter.menuName);
        // if (!param.range) {
        sequelize
          .query('call userGroupRoles_GetAllByGroupUserId_NewCms(:userGroupsId,:menuName,:in_siteId)', {
            replacements: {
              userGroupsId: filter.userGroupsId ? filter.userGroupsId : -1,
              menuName: filter.menuName ? filter.menuName : '',
              in_siteId: filter.sitesId || 1
            },
            type: sequelize.QueryTypes.SELECT
          })
          .then(result => {
            // console.log(result)
            // console.log(Object.values(_.slice(result, 0, 1)[0]))
            // console.log(Object.values(_.slice(result, 1)[0]))
            let data;
            let count;

            delete result[0].meta;
            if (result && result.length > 0) {
              try {
                /* count = Object.values(_.slice(result, 0, 1)[0])[0].count;
              data = Object.values(_.slice(result, )[0]); */
                data = Object.values(_.slice(result)[0]);
                // console.log('role data ', data);
                count = (data || []).length;
              } catch (error) {
                count = 0;
                data = [];
              }
            }
            const newData = data.map(item => {
              return {
                ...item,
                isViewed: item.isViewed.toString('utf8') === '1',
                isDeleted: item.isDeleted.toString('utf8') === '1',
                isUpdated: item.isUpdated.toString('utf8') === '1',
                isAdded: item.isAdded.toString('utf8') === '1',
                isBlocked: item.isBlocked.toString('utf8') === '1',
                isApproved: item.isApproved.toString('utf8') === '1'
              };
            });
            // console.log("role newData ", newData);
            resolve({ rows: newData, count });
          })
          .catch(error => {
            reject(
              new ApiErrors.BaseError({
                statusCode: 202,
                type: 'getListError',
                error
              })
            );
          });
        // }
      } catch (error) {
        reject(
          new ApiErrors.BaseError({
            statusCode: 202,
            type: 'getListError',
            error
          })
        );
      }
    }),
  bulk_update: param =>
    new Promise((resolve, reject) => {
      try {
        console.log('param: ', JSON.stringify(param.roles));
        sequelize
          .query('call userGroupRoles_Update_NewCms(:json,:inUserGroupsId)', {
            replacements: {
              json: JSON.stringify(param.roles),
              inUserGroupsId: param.userGroupsId
            },
            type: sequelize.QueryTypes.SELECT
          })
          .then(result => {
            console.log('Insert roles return result: ', result);
            let dataReturn = [];

            try {
              dataReturn = Object.values(result[0]);
              // eslint-disable-next-line no-empty
            } catch (error) {}
            resolve(dataReturn);
          })
          .catch(error => {
            reject(error);
          });
      } catch (error) {
        reject(error);
      }
    }),
  get_all: param =>
    new Promise((resolve, reject) => {
      try {
        // console.log("filter:", JSON.parse(param.filter))
        let filter = {};
        let sort = [['id', 'ASC']];

        if (param.filter) filter = param.filter;

        if (param.sort) sort = param.sort;

        roles
          .findAll({
            where: filter,
            order: sort
          })
          .then(result => {
            // console.log("result: ", result)
            resolve(result);
          })
          .catch(error => {
            reject(error);
          });
      } catch (error) {
        reject(error);
      }
    })
};
