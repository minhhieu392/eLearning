import Model from '../../models/models'
import models from '../../entity/index'
import _ from 'lodash';
import ErrorHelpers from '../../helpers/errorHelpers';
import filterHelpers from '../../helpers/filterHelpers';
import * as ApiErrors from '../../errors';

const { sequelize, /* Op, */ users, menus, roles, sites, languages } = models;


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

  const children = _.filter(array, function (child) {
    // console.log("child.MenuParentID: %o, parent.id", child.MenuParentId, parent.id)
    const ok = Number(child.parentId) === Number(parent.id);

    if (ok)
      arrTreeId.push(child.id)

    return Number(child.parentId) === Number(parent.id);
  });

  // console.log(children);
  // console.log("-------------------------------------------")

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
  get_list: param => new Promise((resolve, reject) => {
    try {
      const attributes = param.attributes
      const filter = param.filter
      const range = param.range
      const perPage = (range[1] - range[0]) + 1
      // const page = (range[0] / perPage)
      const sort = param.sort || ["id", "asc"]

      console.log("get_all filter: ", filter)
      let whereFilter, nameFilter
      const att = filterHelpers.atrributesHelper(attributes);
      if (filter.name) {
        nameFilter = {
          "name": { "$like": sequelize.literal(`CONCAT('%','${filter.name}','%')`) }
        }
        whereFilter = _.assign(filter, nameFilter)
      }

      if (!whereFilter) {
        whereFilter = { ...filter }
      }

      Model.findAndCountAll(menus,{
        where: whereFilter,
        order: sort,
        attributes:att,
        offset: range[0],
        limit: perPage, distinct: true,
        include: [
          {
            model: sites,
            as: 'sites',
          },
          {
            model: menus,
            as: 'parent',
          },
          {
            model: languages,
            as: 'languages',
          },
          {
            model: users,
            as: 'usersCreator',
            attributes: {
              exclude: ['password']
            }
          }
        ]
      }).then(result => {
        resolve(result)
      }).catch(error => {
        reject(error)
      });
    } catch (error) {
      reject(error)
    }
  }),
  get_one: async param => {
    let finnalyResult;

    try {
      // console.log("Menu Model param: %o | id: ", param, param.id)
      const { id /* , auth */, attributes } = param;
      const att = filterHelpers.atrributesHelper(attributes);
      const result = await Model.findOne(menus, {
        attributes: att,
        where: { id: id }
      }).catch(error => {
        throw error;
      });

      if (!result) {
        throw (new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudNotExisted',
        }));
      }

      finnalyResult = result;

    } catch (error) {
      ErrorHelpers.errorThrow(error, 'getListError', 'MenuService');
    }

    return finnalyResult;
  },
  get_many: async param => {
    let finnalyResult;

    try {
      console.log("get_many filter:", param.filter)
      const { filter, /* range, sort, auth */ } = param;
      let whereFilter = filter;

      try {
        whereFilter = await filterHelpers.combineFromDateWithToDate(whereFilter);
      } catch (error) {
        throw (error);
      } ``

      whereFilter = await filterHelpers.makeStringFilterRelatively(['name'], whereFilter, menus);

      // const perPage = (range[1] - range[0]) + 1
      // const page = Math.floor(range[0] / perPage);

      if (!whereFilter) {
        whereFilter = { ...filter }
      }

      const result = await menus.findAll(
        {
          where: whereFilter,
          include: [
            {
              model: sites,
              as: 'sites',
            },
            {
              model: menus,
              as: 'parent',
            },
            {
              model: users,
              as: 'usersCreator',
              attributes: {
                exclude: ['password']
              }
            }
          ]
        }
      ).catch(error => {
        throw (error)
      });

      finnalyResult = result;
    } catch (error) {
      throw (error)
    }

    return finnalyResult;
  },
  find_list_parent_child: async param => {
    let finnalyResult;
    const { filter, range, sort/* , auth */ } = param;
    const perPage = (range[1] - range[0]) + 1;
    const page = Math.floor(range[0] / perPage);
    let whereFilter = filter, nameFilter

    try {
      whereFilter = await filterHelpers.combineFromDateWithToDate(whereFilter);
    } catch (error) {
      throw error;
    }

    if (filter.name) {
      nameFilter = {
        "name": { "$like": sequelize.literal(`CONCAT('%','${filter.name}','%')`) }
      }
      whereFilter = _.assign(whereFilter, nameFilter)
    }

    console.log("whereFilter: ", whereFilter)

    try {
      const result = await Model.findAndCountAll(menus,{
        where: whereFilter,
        order: sort,
        include: [
          {
            model: sites,
            as: 'sites',
          },
          {
            model: languages,
            as: 'languages'
          },
          {
            model: users,
            as: 'usersCreator',
            attributes: {
              exclude: ['password']
            }
          }
        ]
      }).catch(error => {
        throw error;
      });

      console.log(result);

      if (result) {
        const dataTree = makeTreeArray(result.rows, { id: 0 }, [])
        let tree = dataTree.tree
        const arrTreeId = dataTree.arrTreeId

        // console.log("dataTree: ", dataTree)
        if (arrTreeId.length > 0) {
          const newResult = result.rows.filter(item => {
            // console.log("arrTreeId.indexOf(item.id): ", arrTreeId.indexOf(item.id))
            if (arrTreeId.indexOf(item.id) === -1) {
              return item
            }
          })

          newResult.forEach(item => {
            const treeTemp = makeTreeArray(result.rows, { id: item.parentId }, [])

            console.log("treeTemp: ", treeTemp)
            treeTemp.tree.forEach((item) => {
              let isCo = false

              tree.forEach((item1) => {
                if (item.id === item1.id) {
                  isCo = true
                }
              })
              if (!isCo) tree = [...tree, item]
            })
          })
        } else {
          const arrChild = [];

          result.rows.forEach(item => {
            const treeTemp = makeTreeArray(result.rows, { id: item.id }, [])

            // console.log("treeTemp: ", treeTemp.tree)
            let isCo = false;
            const newItem = {
              ...item.dataValues,
              children: treeTemp.tree
            }

            treeTemp.tree.forEach(c => arrChild.push(c.id));

            tree.forEach((item1) => {
              if (item.id === item1.id) {
                isCo = true;
              }
            })
            if (!isCo) tree = [...tree, newItem]
          })

          // console.log("arrChild: ", arrChild)
          tree = tree.filter(c => arrChild.indexOf(c.id) === -1)
        }
        // console.log("tree: ", tree)
        finnalyResult = ({
          rows: tree.slice(range[0], range[1] + 1),
          count: tree.length, // result.count,
          page: page + 1,
          perPage: perPage
        })
      }
    } catch (error) {
      ErrorHelpers.errorThrow(error, 'getListError', 'MenuService');
    }

    return finnalyResult
  },
  find_all_parent_child: async param => {
    let finnalyResult;
    const { filter, sort/* , auth */ } = param;

    let whereFilter = filter, nameFilter;

    try {
      whereFilter = await filterHelpers.combineFromDateWithToDate(whereFilter);
    } catch (error) {
      throw error;
    }

    if (filter.name) {
      nameFilter = {
        "name": { "$like": sequelize.literal(`CONCAT('%','${filter.name}','%')`) }
      }
      whereFilter = _.assign(whereFilter, nameFilter)
    }

    console.log("whereFilter: ", whereFilter)
    // { "SiteId": { $not: 3 } }

    try {
      const result = await Model.findAndCountAll(menus,{
        where: whereFilter,
        order: sort,
        include: [
          {
            model: sites,
            as: 'sites',
          },
          {
            model: menus,
            as: 'parent',
          },
          {
            model: languages,
            as: 'languages',
          },
          {
            model: users,
            as: 'usersCreator',
            attributes: {
              exclude: ['password']
            }
          }
        ]
      }).catch(error => {
        throw error;
      });

      // console.log(result);

      if (result) {
        // logger.debug("", { message: 'find_all_parent_child result', result })
        const dataTree = makeTreeArray(result.rows, { id: 0 }, [])
        let tree = dataTree.tree
        const arrTreeId = dataTree.arrTreeId

        // console.log("dataTree: ", dataTree)
        if (arrTreeId.length > 0) {
          const newResult = result.rows.filter(item => {
            // console.log("arrTreeId.indexOf(item.id): ", arrTreeId.indexOf(item.id))
            if (arrTreeId.indexOf(item.id) === -1) {
              return item
            }
          })

          newResult.forEach(item => {
            const treeTemp = makeTreeArray(result.rows, { id: item.parentId }, [])

            console.log("treeTemp: ", treeTemp)
            treeTemp.tree.forEach((item) => {
              let isCo = false

              tree.forEach((item1) => {
                if (item.id === item1.id) {
                  isCo = true
                }
              })
              if (!isCo) tree = [...tree, item]
            })
          })
        } else {
          const arrChild = [];

          result.rows.forEach(item => {
            const treeTemp = makeTreeArray(result.rows, { id: item.id }, [])

            // console.log("treeTemp: ", treeTemp.tree)
            let isCo = false;
            const newItem = {
              ...item.dataValues,
              children: treeTemp.tree
            }

            treeTemp.tree.forEach(c => arrChild.push(c.id));

            tree.forEach((item1) => {
              if (item.id === item1.id) {
                isCo = true;
              }
            })
            if (!isCo) tree = [...tree, newItem]
          })

          // console.log("arrChild: ", arrChild)
          tree = tree.filter(c => arrChild.indexOf(c.id) === -1)
        }
        // console.log("tree: ", tree)
        finnalyResult = ({ rows: tree, count: result.count, page: 1, perPage: result.count })
      }
    } catch (error) {
      console.log("error: ", error)
      ErrorHelpers.errorThrow(error, 'getListError', 'MenuService');
    }

    return finnalyResult
  },
  get_menu: async param => {
    let finnalyResult;

    const filter = param.filter
    const filterChild = param.filterChild
    const sort = param.sort

    console.log("get_mennu filter: ", filter) // { "SiteId": { $not: 3 } }
    /* const include = await filterHelpers.createIncludeWithAuthorization(param.auth, [
      [{
        model: sites,
        as: 'sites',
      }],
      [{
        model: users,
        as: 'usersCreator',
      }],
    ]); */
    const include =
      [{
        model: sites,
        as: 'sites',
      }];

    include.push({
      model: roles, as: 'roles',
      // attributes: ['id'],
      where: filterChild,
      required: true
    });

    try {
      const result = await Model.findAndCountAll(menus,{
        where: filter,
        order: sort,
        include
      }).catch(error => {
        console.log("get_menu error: ", error)
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'getListError',
          error
        });
      });

      if (result) {
        // console.log("result: ", result.rows)
        const dataTree = makeTreeArray(result.rows, { id: 0 }, [])

        let tree = dataTree.tree
        const arrTreeId = dataTree.arrTreeId

        // console.log("dataTree: ", dataTree)
        if (arrTreeId.length > 0) {
          const newResult = result.rows.filter(item => {
            // console.log("arrTreeId.indexOf(item.id): ", arrTreeId.indexOf(item.id))
            if (arrTreeId.indexOf(item.id) === -1) {
              return item
            }
          })

          newResult.forEach(item => {
            const treeTemp = makeTreeArray(result.rows, { id: item.parentId }, [])

            console.log("treeTemp: ", treeTemp)
            treeTemp.tree.forEach((item) => {
              let isCo = false

              tree.forEach((item1) => {
                if (item.id === item1.id) {
                  isCo = true
                }
              })
              if (!isCo) tree = [...tree, item]
            })
          })
        } else {
          const arrChild = [];

          result.rows.forEach(item => {
            const treeTemp = makeTreeArray(result.rows, { id: item.id }, [])

            // console.log("treeTemp: ", treeTemp.tree)
            let isCo = false;
            const newItem = {
              ...item.dataValues,
              children: treeTemp.tree
            }

            treeTemp.tree.forEach(c => arrChild.push(c.id));

            tree.forEach((item1) => {
              if (item.id === item1.id) {
                isCo = true;
              }
            })
            if (!isCo) tree = [...tree, newItem]
          })

          // console.log("arrChild: ", arrChild)
          tree = tree.filter(c => arrChild.indexOf(c.id) === -1)
        }
        // console.log("tree: ", tree)

        return { rows: tree, count: result.count, page: 1, perPage: result.count }
      } else {
        finnalyResult = {};
      }

    } catch (error) {
      throw (new ApiErrors.BaseError({
        statusCode: 202,
        type: 'getListError',
        error
      }))
    }

    return finnalyResult;
  },
}
