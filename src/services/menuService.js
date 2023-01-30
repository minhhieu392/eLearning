import Model from '../models/models';
import models from '../entity/index';
import _ from 'lodash';
import ErrorHelpers from '../helpers/errorHelpers';
import filterHelpers from '../helpers/filterHelpers';
import * as ApiErrors from '../errors';
import preCheckHelpers, { TYPE_CHECK } from '../helpers/preCheckHelpers';
// import logger from '../utils/logger';

const { sequelize, Op, users, menus, userGroupRoles, sites, menuPositions, languages } = models;

/**
 *
 * @param {*} entities
 * @param {*} parent
 * @param {*} tree
 */
/* const unflattenEntities = (entities, parent = { id: null }, tree = []) =>
  new Promise(resolve => {

    const children = entities.filter(entity => entity.dataValues.MenuParentId === parent.id)

    if (!_.isEmpty(children)) {
      if (parent.id == null) {
        tree = children
      } else {
        // parent['children'] = children
        parent = _.assign(parent, { dataValues: { ...parent.dataValues, children } })
      }
      children.map(child => unflattenEntities(entities, child))
    }

    resolve(tree)
  }) */

/**
 *
 * @param {Array} array
 * @param {Object} parent
 * @param {Array} tree
 * @param {Number} arrTreeId
 */
const makeTreeArray = (array, parent, tree, arrTreeId) => {
  arrTreeId = typeof arrTreeId !== 'undefined' ? arrTreeId : [];
  tree = typeof tree !== 'undefined' ? tree : [];
  parent = typeof parent !== 'undefined' ? parent : { id: 0 };

  const children = _.filter(array, function(child) {
    // console.log("child.MenuParentID: %o, parent.id", child.MenuParentId, parent.id)
    const ok = Number(child.parentId) === Number(parent.id);

    if (ok) arrTreeId.push(child.id);

    return Number(child.parentId) === Number(parent.id);
  });

  if (!_.isEmpty(children)) {
    if (Number(parent.id) === 0) {
      tree = children;
    } else {
      tree = children;
      // parent['children'] = children;
      parent = _.assign(parent, { dataValues: { ...parent.dataValues, children } });
      // console.log("parent: ", parent.dataValues)
    }
    _.each(children, function(child) {
      makeTreeArray(array, child, tree, arrTreeId);
    });
  }

  return {
    tree,
    arrTreeId
  };
};

/**
 *
 * @param {Array} array
 * @param {Object} parent
 * @param {Array} tree
 * @param {Number} arrTreeId
 */
/* const makeTreeArrayIncludeParent = (array, parent, tree, arrTreeId) => {
  arrTreeId = typeof arrTreeId !== 'undefined' ? arrTreeId : [];
  tree = typeof tree !== 'undefined' ? tree : [];
  parent = typeof parent !== 'undefined' ? parent : { id: 0 };

  const children = _.filter(array, function (child) {
    // console.log("child.MenuParentID: %o, parent.id", child.MenuParentId, parent.id)
    const ok = Number(child.parentId) === Number(parent.id);

    if (ok)
      arrTreeId.push(child.id)

    return Number(child.parentId) === Number(parent.id);
  });

  if (!_.isEmpty(children)) {
    if (Number(parent.id) === 0) {
      tree = children;
    } else {
      tree = children;
      // parent['children'] = children;
      parent = _.assign(parent, { dataValues: { ...parent.dataValues, children } })
      // console.log("parent: ", parent.dataValues)
    }
    _.each(children, function (child) { makeTreeArray(array, child, tree, arrTreeId) });
  }

  return {
    tree, arrTreeId
  };
}; */

export default {
  get_list: param =>
    new Promise((resolve, reject) => {
      try {
        const filter = param.filter;
        const range = param.range;
        const att = filterHelpers.atrributesHelper(param.attributes);

        const perPage = range[1] - range[0] + 1;
        // const page = (range[0] / perPage)
        const sort = param.sort || ['id', 'asc'];

        console.log('get_all filter: ', filter);
        let whereFilter, nameFilter;

        if (filter.name) {
          nameFilter = {
            name: { $like: sequelize.literal(`CONCAT('%','${filter.name}','%')`) }
          };
          whereFilter = _.assign(filter, nameFilter);
        }

        if (!whereFilter) {
          whereFilter = { ...filter };
        }

        Model.findAndCountAll(menus, {
          where: whereFilter,
          order: sort,
          offset: range[0],
          attibutes: att,
          limit: perPage,
          distinct: true
          // include: [
          //   {
          //     model: menuPositions, as: 'menuPositions'
          //   }
          // 	// { model: Menu, as: 'MenuParent', required: false },
          // ]
        })
          .then(result => {
            resolve(result);
          })
          .catch(error => {
            reject(error);
          });
      } catch (error) {
        reject(error);
      }
    }),
  get_one: async param => {
    let finnalyResult;

    try {
      // console.log("Menu Model param: %o | id: ", param, param.id)
      const { id, auth, attributes } = param;
      const att = filterHelpers.atrributesHelper(attributes);

      // const include = await filterHelpers.createIncludeWithAuthorization(auth, [
      //   [
      //     {
      //       model: sites,
      //       as: 'sites'
      //     }
      //   ],
      //   [
      //     {
      //       model: users,
      //       as: 'usersCreator'
      //     }
      //   ],
      //   [
      //     {
      //       model: languages,
      //       as: 'languages'
      //     }
      //   ]
      // ]);
      const include = [
        {
          model: sites,
          as: 'sites',
          attributes: ['id', 'name', 'url']
        },
        {
          model: users,
          as: 'usersCreator',
          attributes: ['id', 'fullname', 'username']
        },
        {
          model: languages,
          as: 'languages',
          attributes: ['id', 'languageName', 'languageCode']
        }
      ];

      include.push({
        model: menuPositions,
        as: 'menuPositions'
      });

      const result = await Promise.all([
        menus.findOne({
          where: { id },
          attributes: att,
          include
        })
        // menus.findOne({
        //   where: { id },
        //   attributes: att,
        //   // include
        // })
      ]).catch(error => {
        throw error;
      });

      if (!result[0]) {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudNotExisted'
        });
      }

      // if (!result[1]) {
      //   throw new ApiErrors.BaseError({
      //     statusCode: 202,
      //     type: 'getInfoNoPermision'
      //   });
      // }

      finnalyResult = result[0];
    } catch (error) {
      ErrorHelpers.errorThrow(error, 'getListError', 'MenuService');
    }

    return finnalyResult;
  },
  create: async param => {
    let finnalyResult;

    try {
      const entity = param.entity;

      console.log('MenusService create: ', entity);
      let whereFilter = {
        sitesId: entity.sitesId,
        name: entity.name,
        menuPositionsId: entity.menuPositionsId
      };

      whereFilter = await filterHelpers.makeStringFilterAbsolutely(['name'], whereFilter, 'menus');

      const infoArr = Array.from(
        await Promise.all([
          preCheckHelpers.createPromiseCheckNew(
            Model.findOne(menus, { attributes: ['id'], where: whereFilter }),
            entity.name || entity.sitesId ? true : false,
            TYPE_CHECK.CHECK_DUPLICATE,
            { parent: 'api.menus.name' }
          ),
          preCheckHelpers.createPromiseCheckNew(
            Model.findOne(menus, {
              attributes: ['id'],
              where: {
                id: entity.parentId,
                sitesId: entity.sitesId,
                menuPositionsId: entity.menuPositionsId
              }
            }),
            Number(entity.parentId) ? true : false,
            TYPE_CHECK.CHECK_EXISTS,
            { parent: 'api.menus.parent' }
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

      finnalyResult = await Model.create(menus, entity).catch(error => {
        ErrorHelpers.errorThrow(error, 'crudError', 'MenusService', 202);
      });

      if (!finnalyResult) {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudInfo'
        });
      }
    } catch (error) {
      ErrorHelpers.errorThrow(error, 'crudError', 'MenusService');
    }

    return { result: finnalyResult };
  },
  create_old: async param => {
    let finnalyResult;

    try {
      const entity = param.entity;

      console.log('MenusService create: ', entity);
      let whereFilter = {
        name: entity.name,
        sitesId: entity.sitesId
      };

      whereFilter = await filterHelpers.makeStringFilterAbsolutely(['name'], whereFilter, 'menuPositions');
      const infoArr = Array.from(
        await Promise.all([
          entity.parentId > 0
            ? Model.findOne(menus, {
                where: {
                  id: entity.parentId
                }
              })
            : Promise.resolve(0),
          Model.findOne(menus, {
            where: whereFilter
          })
        ]).catch(error => {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'getInfoError',
            error
          });
        })
      );

      if (entity.parentId > 0 && !infoArr[0]) {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudNotExisted'
        });
      } else if (infoArr[1]) {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudExisted'
        });
      } else {
        finnalyResult = await Model.create(menus, param.entity).catch(error => {
          ErrorHelpers.errorThrow(error, 'crudError', 'MenusService', 202);
        });

        if (!finnalyResult) {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'crudInfo'
          });
        }
      }
    } catch (error) {
      ErrorHelpers.errorThrow(error, 'crudError', 'MenusService');
    }

    return { result: finnalyResult };
  },
  update: async param => {
    let finnalyResult;

    try {
      const entity = param.entity;

      console.log('MenusService update: ', entity);

      const foundMenu = await Model.findOne(menus, {
        where: {
          id: param.id
        }
      }).catch(error => {
        throw preCheckHelpers.createErrorCheck(
          { typeCheck: TYPE_CHECK.GET_INFO, modelStructure: { parent: 'menus' } },
          error
        );
      });

      if (foundMenu) {
        let whereFilter = {
          id: { $ne: param.id },
          sitesId: entity.sitesId || foundMenu.sitesId,
          name: entity.name || foundMenu.name,
          menuPositionsId: entity.menuPositionsId || foundMenu.menuPositionsId
        };

        whereFilter = await filterHelpers.makeStringFilterAbsolutely(['name'], whereFilter, 'menus');

        const infoArr = Array.from(
          await Promise.all([
            preCheckHelpers.createPromiseCheckNew(
              Model.findOne(menus, { attributes: ['id'], where: whereFilter }),
              entity.name || entity.sitesId ? true : false,
              TYPE_CHECK.CHECK_DUPLICATE,
              { parent: 'api.menus.name' }
            ),
            preCheckHelpers.createPromiseCheckNew(
              Model.findOne(menus, {
                attributes: ['id'],
                where: {
                  id: entity.parentId || foundMenu.parentId,
                  sitesId: entity.sitesId || foundMenu.sitesId,
                  menuPositionsId: entity.menuPositionsId || foundMenu.menuPositionsId
                }
              }),

              Number(entity.parentId) ? true : false,
              TYPE_CHECK.CHECK_EXISTS,
              { parent: 'api.menus.parent' }
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
        if (entity.hasOwnProperty('status')) {
          const arrTreeId = [];
          const array = [foundMenu];

          if (entity.status === Number(0)) {
            await filterHelpers.makeTreeArrayChildSearch(array, arrTreeId, menus);
          } else if (entity.status === Number(1)) {
            await filterHelpers.makeTreeArrayParentSearch(array, arrTreeId, menus);
          }
          await menus.update(
            { status: entity.status },
            {
              where: {
                id: {
                  [Op.in]: arrTreeId
                }
              }
            }
          );
        }
        await Model.update(menus, entity, { where: { id: parseInt(param.id) } }).catch(error => {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'crudError',
            error
          });
        });

        finnalyResult = await Model.findOne(menus, { where: { Id: param.id } }).catch(error => {
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
      } else {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudNotExisted'
        });
      }
    } catch (error) {
      console.log('error: ', error);
      ErrorHelpers.errorThrow(error, 'crudError', 'MenusService');
    }

    return { result: finnalyResult };
  },
  update_old: async param => {
    let finnalyResult;

    try {
      const entity = param.entity;

      console.log('MenusService update: ', entity);

      const foundMenu = await Model.findOne(menus, {
        where: {
          id: param.id
        }
      }).catch(error => {
        console.log('1');
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'getInfoError',
          error
        });
      });

      if (foundMenu) {
        if (entity.sitesId) {
          let whereFilter = {
            id: { $ne: param.id },
            sitesId: entity.sitesId || foundMenu.sitesId,
            name: entity.name || foundMenu.name
          };

          whereFilter = await filterHelpers.makeStringFilterAbsolutely(['name'], whereFilter, 'menuPositions');
          const infoArr = Array.from(
            await Promise.all([
              entity.parentId > 0
                ? Model.findOne(menus, {
                    where: {
                      id: entity.parentId || foundMenu.parentId
                    }
                  })
                : Promise.resolve(0),
              Model.findOne(menus, {
                where: whereFilter
              })
            ]).catch(error => {
              throw new ApiErrors.BaseError({
                statusCode: 202,
                type: 'getInfoError',
                error
              });
            })
          );

          if (entity.parentId > 0 && !infoArr[0]) {
            throw new ApiErrors.BaseError({
              statusCode: 202,
              type: 'crudNotExisted'
            });
          } else if (infoArr[1]) {
            throw new ApiErrors.BaseError({
              statusCode: 202,
              type: 'crudExisted'
            });
          } else {
            await Model.update(menus, entity, { where: { id: parseInt(param.id) } }).catch(error => {
              throw new ApiErrors.BaseError({
                statusCode: 202,
                type: 'crudError',
                error
              });
            });

            finnalyResult = await Model.findOne(menus, { where: { Id: param.id } }).catch(error => {
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
          await Model.update(menus, entity, { where: { id: parseInt(param.id) } }).catch(error => {
            throw new ApiErrors.BaseError({
              statusCode: 202,
              type: 'crudError',
              error
            });
          });

          finnalyResult = await Model.findOne(menus, { where: { id: param.id } }).catch(error => {
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
      console.log('error: ', error);
      ErrorHelpers.errorThrow(error, 'crudError', 'MenusService');
    }

    return { result: finnalyResult };
  },
  get_many: async param => {
    let finnalyResult;

    try {
      console.log('get_many filter:', param.filter);
      const { filter, /* range, sort, */ auth } = param;
      let whereFilter = filter;

      try {
        whereFilter = await filterHelpers.combineFromDateWithToDate(whereFilter);
      } catch (error) {
        throw error;
      }

      whereFilter = await filterHelpers.makeStringFilterRelatively(['name'], whereFilter, 'menus');

      // const perPage = (range[1] - range[0]) + 1
      // const page = Math.floor(range[0] / perPage);

      if (!whereFilter) {
        whereFilter = { ...filter };
      }

      const include = await filterHelpers.createIncludeWithAuthorization(auth, [
        [
          {
            model: sites,
            as: 'sites'
          }
        ],
        [
          {
            model: users,
            as: 'usersCreator'
          }
        ]
      ]);

      include.push({
        model: menus,
        as: 'parent'
      });
      include.push({
        model: menuPositions,
        as: 'menuPositions'
      });
      const result = await menus
        .findAll({
          where: whereFilter,
          include
        })
        .catch(error => {
          throw error;
        });

      finnalyResult = result;
    } catch (error) {
      throw error;
    }

    return finnalyResult;
  },
  get_many_old: param =>
    new Promise((resolve, reject) => {
      try {
        console.log('get_many filter:', param.filter);
        const ids = param.filter.id || [];

        menus
          .findAll({
            where: {
              id: {
                [Op.in]: ids
              }
            },
            include: [
              { model: users, as: 'User' },
              { model: menus, as: 'MenuParent', required: false }
            ]
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
    }),
  find_list_parent_child: async param => {
    let finnalyResult;
    const { filter, range, sort, auth } = param;
    const perPage = range[1] - range[0] + 1;
    const page = Math.floor(range[0] / perPage);
    let whereFilter = filter,
      nameFilter;
    const filterStatus = _.pick(filter, ['status', 'sitesId']);

    try {
      whereFilter = await filterHelpers.combineFromDateWithToDate(whereFilter);
    } catch (error) {
      throw error;
    }

    if (filter.name) {
      nameFilter = {
        name: { $like: sequelize.literal(`CONCAT('%','${filter.name}','%')`) }
      };
      whereFilter = _.assign(whereFilter, nameFilter);
    }
    const userCreatorsId = (auth && auth.userId) || 0;

    if (Number(userCreatorsId) !== 1) {
      whereFilter = {
        ...whereFilter,
        ...{
          $not: {
            id: [1, 2],
            parentId: [2]
          }
        }
      };
    }

    console.log('whereFilter: ', whereFilter);

    let whereSites = {};

    try {
      const arrTreeSearchId = typeof arrTreeId !== 'undefined' ? arrTreeSearchId : [];

      if (!_.isEmpty(whereFilter)) {
        const resultSearch = await menus
          .findAndCountAll({
            where: whereFilter,
            // attributes:['id','parentId'],
            order: sort
          })
          .catch(error => {
            throw error;
          });

        await filterHelpers.makeTreeArrayParentSearch(resultSearch.rows, arrTreeSearchId, menus, filterStatus);
        if (whereFilter) {
          whereFilter = {
            $or: [
              {
                id: {
                  $in: arrTreeSearchId
                }
              },
              { ...whereFilter }
            ]
          };
        }
      }

      console.log('arrTreeSearchId', arrTreeSearchId);
      const result = await Model.findAndCountAll(menus, {
        where: whereFilter,
        order: sort,
        distinct: true,
        logging: console.log,
        include: [
          {
            model: sites,
            as: 'sites',
            required: true,
            attributes: ['id', 'name'],
            where: { status: true, ...whereSites }
          },
          {
            model: users,
            as: 'usersCreator',
            attributes: ['id', 'fullname'],
            required: true
          },
          {
            model: languages,
            as: 'languages',
            attributes: ['id', 'languageName', 'languageCode'],
            required: true
          },
          {
            model: menuPositions,
            as: 'menuPositions'
          }
        ]
      }).catch(error => {
        throw error;
      });

      if (result) {
        const dataTree = makeTreeArray(result.rows, { id: 0 }, []);
        let tree = dataTree.tree;
        const arrTreeId = dataTree.arrTreeId;

        // console.log("dataTree: ", dataTree)
        if (arrTreeId.length > 0) {
          const newResult = result.rows.filter(item => {
            // console.log("arrTreeId.indexOf(item.id): ", arrTreeId.indexOf(item.id))
            if (arrTreeId.indexOf(item.id) === -1) {
              return item;
            }
          });

          newResult.forEach(item => {
            const treeTemp = makeTreeArray(result.rows, { id: item.parentId }, []);

            console.log('treeTemp: ', treeTemp);
            treeTemp.tree.forEach(item => {
              let isCo = false;

              tree.forEach(item1 => {
                if (item.id === item1.id) {
                  isCo = true;
                }
              });
              if (!isCo) tree = [...tree, item];
            });
          });
        } else {
          const arrChild = [];

          result.rows.forEach(item => {
            const treeTemp = makeTreeArray(result.rows, { id: item.id }, []);

            // console.log("treeTemp: ", treeTemp.tree)
            let isCo = false;
            const newItem = {
              ...item.dataValues,
              children: treeTemp.tree
            };

            treeTemp.tree.forEach(c => arrChild.push(c.id));

            tree.forEach(item1 => {
              if (item.id === item1.id) {
                isCo = true;
              }
            });
            if (!isCo) tree = [...tree, newItem];
          });

          // console.log("arrChild: ", arrChild)
          tree = tree.filter(c => arrChild.indexOf(c.id) === -1);
        }
        // console.log("tree: ", tree)
        finnalyResult = {
          rows: tree.slice(range[0], range[1] + 1),
          count: tree.length, // result.count,
          page: page + 1,
          perPage: perPage
        };
      }
    } catch (error) {
      ErrorHelpers.errorThrow(error, 'getListError', 'MenuService');
    }

    return finnalyResult;
  },
  find_list_parent_child_one: async param => {
    let finnalyResult;
    const { filter, range, sort, auth } = param;
    const perPage = range[1] - range[0] + 1;
    const page = Math.floor(range[0] / perPage);
    let whereFilter = filter,
      nameFilter;
    const filterStatus = _.pick(filter, ['status', 'sitesId']);

    try {
      whereFilter = await filterHelpers.combineFromDateWithToDate(whereFilter);
    } catch (error) {
      throw error;
    }

    if (filter.name) {
      nameFilter = {
        name: { $like: sequelize.literal(`CONCAT('%','${filter.name}','%')`) }
      };
      whereFilter = _.assign(whereFilter, nameFilter);
    }
    // if (filter.placesId) {
    //   whereFilter = _.omit(whereFilter, ['placesId']);
    // }
    console.log('whereFilter: ', whereFilter);
    let whereSites = {};

    /* const { placesId } = await filterHelpers.getInfoAuthorization(auth, { placesId: filter.placesId }, true);


    if (placesId) {
      whereSites.placesId = placesId;
    }
*/
    try {
      const arrTreeSearchId = typeof arrTreeId !== 'undefined' ? arrTreeSearchId : [];

      if (!_.isEmpty(whereFilter)) {
        const resultSearch = await menus
          .findAndCountAll({
            where: whereFilter,
            // attributes:['id','parentId'],
            order: sort
          })
          .catch(error => {
            throw error;
          });

        console.log('arrTreeSearchId', arrTreeSearchId);

        await filterHelpers.makeTreeParentChildrenArraySearch(resultSearch.rows, arrTreeSearchId, menus, filterStatus);
        if (whereFilter) {
          whereFilter = {
            $or: [
              {
                id: {
                  $in: arrTreeSearchId
                }
              },
              { ...whereFilter }
            ]
          };
        }
      }

      console.log('arrTreeSearchId', arrTreeSearchId);
      const result = await Model.findAndCountAll(menus, {
        where: whereFilter,
        order: sort,
        distinct: true,
        include: [
          {
            model: sites,
            as: 'sites',
            required: true,
            attributes: ['id', 'name'],
            where: { status: true, ...whereSites }
          },
          {
            model: users,
            as: 'usersCreator',
            attributes: ['id', 'fullname'],
            required: true
          },
          {
            model: menuPositions,
            as: 'menuPositions'
          },
          {
            model: languages,
            as: 'languages',
            attributes: ['id', 'languageName', 'languageCode'],
            required: true
          }
        ]
      }).catch(error => {
        throw error;
      });

      if (result) {
        const dataTree = makeTreeArray(result.rows, { id: 0 }, []);
        let tree = dataTree.tree;
        const arrTreeId = dataTree.arrTreeId;

        // console.log("dataTree: ", dataTree)
        if (arrTreeId.length > 0) {
          const newResult = result.rows.filter(item => {
            // console.log("arrTreeId.indexOf(item.id): ", arrTreeId.indexOf(item.id))
            if (arrTreeId.indexOf(item.id) === -1) {
              return item;
            }
          });

          newResult.forEach(item => {
            const treeTemp = makeTreeArray(result.rows, { id: item.parentId }, []);

            console.log('treeTemp: ', treeTemp);
            treeTemp.tree.forEach(item => {
              let isCo = false;

              tree.forEach(item1 => {
                if (item.id === item1.id) {
                  isCo = true;
                }
              });
              if (!isCo) tree = [...tree, item];
            });
          });
        } else {
          const arrChild = [];

          result.rows.forEach(item => {
            const treeTemp = makeTreeArray(result.rows, { id: item.id }, []);

            // console.log("treeTemp: ", treeTemp.tree)
            let isCo = false;
            const newItem = {
              ...item.dataValues,
              children: treeTemp.tree
            };

            treeTemp.tree.forEach(c => arrChild.push(c.id));

            tree.forEach(item1 => {
              if (item.id === item1.id) {
                isCo = true;
              }
            });
            if (!isCo) tree = [...tree, newItem];
          });

          // console.log("arrChild: ", arrChild)
          tree = tree.filter(c => arrChild.indexOf(c.id) === -1);
        }
        // console.log("tree: ", tree)
        finnalyResult = {
          rows: tree.slice(range[0], range[1] + 1),
          count: tree.length, // result.count,
          page: page + 1,
          perPage: perPage
        };
      }
    } catch (error) {
      ErrorHelpers.errorThrow(error, 'getListError', 'MenuService');
    }

    return finnalyResult;
  },
  find_all_parent_child: async param => {
    let finnalyResult;
    const { filter, sort, auth } = param;

    let whereFilter = filter,
      nameFilter;

    try {
      whereFilter = await filterHelpers.combineFromDateWithToDate(whereFilter);
    } catch (error) {
      throw error;
    }

    if (filter.name) {
      nameFilter = {
        name: { $like: sequelize.literal(`CONCAT('%','${filter.name}','%')`) }
      };
      whereFilter = _.assign(whereFilter, nameFilter);
    }
    if (filter.placesId) {
      whereFilter = _.omit(whereFilter, ['placesId']);
    }
    console.log('whereFilter: ', whereFilter);
    // { "SiteId": { $not: 3 } }
    /*  const include = await filterHelpers.createIncludeWithAuthorization(auth, [
        [{
          model: sites,
          as: 'sites',
        }],
        [{
          model: users,
          as: 'usersCreator',
        }],
      ]);
  */
    // const { placesId } = await filterHelpers.getInfoAuthorization(auth, { placesId: filter.placesId }, true);
    let whereSites = {};

    // if (placesId) {
    //   whereSites.placesId = placesId;
    // }
    try {
      const result = await Model.findAndCountAll(menus, {
        where: whereFilter,
        order: sort,
        logging: true,
        include: [
          {
            model: menuPositions,
            as: 'menuPositions'
          },
          {
            model: sites,
            as: 'sites',
            required: true,
            attributes: ['id', 'name'],
            where: whereSites
          },
          {
            model: users,
            as: 'usersCreator',
            attributes: ['id', 'fullname'],
            required: true
          },
          {
            model: menuPositions,
            as: 'menuPositions',
            required: true
          },
          {
            model: languages,
            as: 'languages',
            attributes: ['id', 'languageName', 'languageCode'],
            required: true
          }
        ]
      }).catch(error => {
        throw error;
      });

      if (result) {
        // logger.debug("", { message: 'find_all_parent_child result', result })
        const dataTree = makeTreeArray(result.rows, { id: 0 }, []);
        let tree = dataTree.tree;
        const arrTreeId = dataTree.arrTreeId;

        // console.log("dataTree: ", dataTree)
        if (arrTreeId.length > 0) {
          const newResult = result.rows.filter(item => {
            // console.log("arrTreeId.indexOf(item.id): ", arrTreeId.indexOf(item.id))
            if (arrTreeId.indexOf(item.id) === -1) {
              return item;
            }
          });

          newResult.forEach(item => {
            const treeTemp = makeTreeArray(result.rows, { id: item.parentId }, []);

            console.log('treeTemp: ', treeTemp);
            treeTemp.tree.forEach(item => {
              let isCo = false;

              tree.forEach(item1 => {
                if (item.id === item1.id) {
                  isCo = true;
                }
              });
              if (!isCo) tree = [...tree, item];
            });
          });
        } else {
          const arrChild = [];

          result.rows.forEach(item => {
            const treeTemp = makeTreeArray(result.rows, { id: item.id }, []);

            // console.log("treeTemp: ", treeTemp.tree)
            let isCo = false;
            const newItem = {
              ...item.dataValues,
              children: treeTemp.tree
            };

            treeTemp.tree.forEach(c => arrChild.push(c.id));

            tree.forEach(item1 => {
              if (item.id === item1.id) {
                isCo = true;
              }
            });
            if (!isCo) tree = [...tree, newItem];
          });

          // console.log("arrChild: ", arrChild)
          tree = tree.filter(c => arrChild.indexOf(c.id) === -1);
        }
        // console.log("tree: ", tree)
        finnalyResult = { rows: tree, count: result.count, page: 1, perPage: result.count };
      }
    } catch (error) {
      console.log('error: ', error);
      ErrorHelpers.errorThrow(error, 'getListError', 'MenuService');
    }

    return finnalyResult;
  },
  find_list_parent_child_old: param =>
    new Promise((resolve, reject) => {
      const filter = param.filter;
      const sort = param.sort;

      let whereFilter = filter,
        nameFilter;

      if (filter.name) {
        nameFilter = {
          name: { $like: sequelize.literal(`CONCAT('%','${filter.name}','%')`) }
        };
        whereFilter = _.assign(whereFilter, nameFilter);
      }

      console.log('whereFilter: ', whereFilter);
      // { "SiteId": { $not: 3 } }
      try {
        Model.findAndCountAll(menus, {
          where: whereFilter,
          order: sort,
          include: [
            { model: menuPositions, as: 'menuPositions' },
            { model: users, as: 'usersCreator', required: false },
            { model: sites, as: 'sites', required: false }
          ]
        })
          .then(result => {
            // console.log("result: ", result.rows)
            if (result) {
              const dataTree = makeTreeArray(result.rows, { id: 0 }, []);
              let tree = dataTree.tree;
              const arrTreeId = dataTree.arrTreeId;

              // console.log("dataTree: ", dataTree)
              if (arrTreeId.length > 0) {
                const newResult = result.rows.filter(item => {
                  // console.log("arrTreeId.indexOf(item.id): ", arrTreeId.indexOf(item.id))
                  if (arrTreeId.indexOf(item.id) === -1) {
                    return item;
                  }
                });

                newResult.forEach(item => {
                  const treeTemp = makeTreeArray(result.rows, { id: item.parentId }, []);

                  console.log('treeTemp: ', treeTemp);
                  treeTemp.tree.forEach(item => {
                    let isCo = false;

                    tree.forEach(item1 => {
                      if (item.id === item1.id) {
                        isCo = true;
                      }
                    });
                    if (!isCo) tree = [...tree, item];
                  });
                });
              } else {
                const arrChild = [];

                result.rows.forEach(item => {
                  const treeTemp = makeTreeArray(result.rows, { id: item.id }, []);

                  // console.log("treeTemp: ", treeTemp.tree)
                  let isCo = false;
                  const newItem = {
                    ...item.dataValues,
                    children: treeTemp.tree
                  };

                  treeTemp.tree.forEach(c => arrChild.push(c.id));

                  tree.forEach(item1 => {
                    if (item.id === item1.id) {
                      isCo = true;
                    }
                  });
                  if (!isCo) tree = [...tree, newItem];
                });

                // console.log("arrChild: ", arrChild)
                tree = tree.filter(c => arrChild.indexOf(c.id) === -1);
              }
              // console.log("tree: ", tree)
              resolve({ rows: tree, count: result.count, page: 1, perPage: result.count });
            }
          })
          .catch(error => {
            reject(error);
            /* reject({
          statusCode: 202,
          code: errorCode.getListError.code,
          error: [new Error(errorCode.getListError.messages[0]), error]
        }) */
          });
      } catch (error) {
        reject(error);
      }
    }),

  get_menu: async param => {
    let finnalyResult;
    const { filter, range, sort, auth, filterChild } = param;
    const perPage = range[1] - range[0] + 1;
    const page = Math.floor(range[0] / perPage);
    let whereFilter = filter,
      nameFilter;
    const filterStatus = _.pick(filter, ['status', 'sitesId']);

    try {
      whereFilter = await filterHelpers.combineFromDateWithToDate(whereFilter);
    } catch (error) {
      throw error;
    }

    if (filter.name) {
      nameFilter = {
        name: { $like: sequelize.literal(`CONCAT('%','${filter.name}','%')`) }
      };
      whereFilter = _.assign(whereFilter, nameFilter);
    }

    console.log('whereFilter: ', whereFilter);

    // const { placesId } = await filterHelpers.getInfoAuthorization(auth, { placesId: filter.placesId }, true);
    let whereSites = {};

    // if (placesId) {
    //   whereSites.placesId = placesId;
    // }

    try {
      const arrTreeSearchId = typeof arrTreeId !== 'undefined' ? arrTreeSearchId : [];

      /*
      if (!_.isEmpty(whereFilter)) {
        const resultSearch = await menus
          .findAndCountAll({
            where: whereFilter,
           attributes:['id','name','parentId','url','urlSlugs','orderBy'],
            order: sort
          })
          .catch(error => {
            throw error;
          });

        await filterHelpers.makeTreeArrayParentSearch(resultSearch.rows, arrTreeSearchId, menus, filterStatus);
        if (whereFilter) {
          whereFilter = {
            $or: [
              {
                id: {
                  $in: arrTreeSearchId
                }
              },
              { ...whereFilter }
            ]
          };
        }
      }
*/
      console.log('whereFilter*****', whereFilter);
      console.log('whereSites*****', whereSites);
      const result = await Model.findAndCountAll(menus, {
        where: whereFilter,
        order: sort,
        // distinct: true,
        logging: true,
        attributes: ['id', 'name', 'parentId', 'url', 'urlSlugs', 'orderBy', 'status', 'icon', 'displayChild'],
        include: [
          {
            model: sites,
            as: 'sites',
            required: true,
            attributes: ['id', 'name'],
            where: {
              status: true,
              ...whereSites
            }
          },
          {
            model: userGroupRoles,
            as: 'userGroupRoles',
            where: filterChild,
            required: true
          }
        ]
      }).catch(error => {
        throw error;
      });

      if (result) {
        const dataTree = makeTreeArray(result.rows, { id: 0 }, []);
        let tree = dataTree.tree;
        const arrTreeId = dataTree.arrTreeId;

        // console.log("dataTree: ", dataTree)
        if (arrTreeId.length > 0) {
          const newResult = result.rows.filter(item => {
            // console.log("arrTreeId.indexOf(item.id): ", arrTreeId.indexOf(item.id))
            if (arrTreeId.indexOf(item.id) === -1) {
              return item;
            }
          });

          newResult.forEach(item => {
            const treeTemp = makeTreeArray(result.rows, { id: item.parentId }, []);

            console.log('treeTemp: ', treeTemp);
            treeTemp.tree.forEach(item => {
              let isCo = false;

              tree.forEach(item1 => {
                if (item.id === item1.id) {
                  isCo = true;
                }
              });
              if (!isCo) tree = [...tree, item];
            });
          });
        } else {
          const arrChild = [];

          result.rows.forEach(item => {
            const treeTemp = makeTreeArray(result.rows, { id: item.id }, []);

            // console.log("treeTemp: ", treeTemp.tree)
            let isCo = false;
            const newItem = {
              ...item.dataValues,
              children: treeTemp.tree
            };

            treeTemp.tree.forEach(c => arrChild.push(c.id));

            tree.forEach(item1 => {
              if (item.id === item1.id) {
                isCo = true;
              }
            });
            if (!isCo) tree = [...tree, newItem];
          });

          // console.log("arrChild: ", arrChild)
          tree = tree.filter(c => arrChild.indexOf(c.id) === -1);
        }
        // console.log("tree: ", tree)
        finnalyResult = {
          rows: tree.slice(range[0], range[1] + 1),
          count: tree.length, // result.count,
          page: page + 1,
          perPage: perPage
        };
      }
    } catch (error) {
      ErrorHelpers.errorThrow(error, 'getListError', 'MenuService');
    }

    return finnalyResult;
  },

  updateOrder: async param => {
    let finnalyResult;

    try {
      const entity = param.entity;

      console.log('MenuService updateOrder: ', entity.orders);

      const updateArr = Array.from(
        await Promise.all(
          entity.orders.map(item =>
            Model.update(
              menus,
              {
                orderBy: item.orderBy
              },
              { where: { id: parseInt(item.id) } }
            )
          )
        ).catch(error => {
          ErrorHelpers.errorThrow(error, 'crudError', 'MenusService');
        })
      );

      console.log('updateArr ', updateArr);
      if (!updateArr[0]) {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudError'
        });
      } else if (!updateArr[1]) {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudError'
        });
      }

      return { result: updateArr };
    } catch (error) {
      ErrorHelpers.errorThrow(error, 'crudError', 'MenusService');
    }

    return { result: finnalyResult };
  },

  bulkUpdate: async param => {
    let finnalyResult;
    let transaction;

    try {
      const { filter, entity } = param;
      const whereFilter = _.pick(filter, ['id']);

      transaction = await sequelize.transaction();

      await Model.update(menus, entity, { where: whereFilter, transaction }).then(_result => {
        finnalyResult = _result;
      });

      await transaction.commit();
    } catch (error) {
      if (transaction) await transaction.rollback();
      ErrorHelpers.errorThrow(error, 'crudError', 'MenusService');
    }

    return { result: finnalyResult };
  },
  update_status: param =>
    new Promise(async (resolve, reject) => {
      try {
        console.log('block id', param.id);
        const id = param.id;
        const entity = param.entity;

        await Model.findOne(menus, {
          where: {
            id
          },
          logging: console.log
        })
          .then(async findEntity => {
            // console.log("findPlace: ", findPlace)
            if (!findEntity) {
              reject(
                new ApiErrors.BaseError({
                  statusCode: 202,
                  type: 'crudNotExisted'
                })
              );
            } else {
              if (entity.hasOwnProperty('status')) {
                const arrTreeId = [];
                const array = [findEntity];

                console.log('array', array);

                if (entity.status === Number(0)) {
                  await filterHelpers.makeTreeArrayChildSearch(array, arrTreeId, menus);
                } else if (entity.status === Number(1)) {
                  await filterHelpers.makeTreeArrayParentSearch(array, arrTreeId, menus);
                }
                await menus.update(
                  { status: entity.status },
                  {
                    where: {
                      id: {
                        [Op.in]: arrTreeId
                      }
                    }
                  }
                );
              }

              Model.update(menus, entity, {
                where: { id: id }
              })
                .then(() => {
                  // console.log("rowsUpdate: ", rowsUpdate)
                  Model.findOne(menus, { where: { id: param.id } })
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
                      reject(ErrorHelpers.errorReject(err, 'crudError', 'menusServices'));
                    });
                })
                .catch(err => {
                  reject(ErrorHelpers.errorReject(err, 'crudError', 'menusServices'));
                });
            }
          })
          .catch(err => {
            reject(ErrorHelpers.errorReject(err, 'crudError', 'menusServices'));
          });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'crudError', 'menusServices'));
      }
    })
};
