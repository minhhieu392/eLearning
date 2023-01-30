import Model from '../models/models';
import models from '../entity/index';
import * as ApiErrors from '../errors';
import ErrorHelpers from '../helpers/errorHelpers';
import viMessage from '../locales/vi';
import filterHelpers from '../helpers/filterHelpers';
import preCheckHelpers, { TYPE_CHECK } from '../helpers/preCheckHelpers';
import _ from 'lodash';
import promise, { Promise } from '../utils/promise';

const { Op, templateGroups, users, sequelize } = models;

const unflattenEntities = (entities, parent = { id: null }, tree = []) =>
  new Promise(resolve => {
    const children = entities.filter(entity => entity.dataValues.templateGroupParentId === parent.id);

    if (!_.isEmpty(children)) {
      if (parent.id === null) {
        tree = children;
      } else {
        // parent['children'] = children
        parent = _.assign(parent, { dataValues: { ...parent.dataValues, children } });
      }
      children.map(child => unflattenEntities(entities, child));
    }

    resolve(tree);
  });

const makeArraySearch = (array, arrTreeId) => {
  return new Promise(async (resolve, reject) => {
    try {
      arrTreeId = typeof arrTreeId !== 'undefined' ? arrTreeId : [];

      await Promise.all(
        array.map(async child => {
          console.log('child.id', child.id);

          arrTreeId.push(child.id);
          if (child.parentId || Number(child.parentId) !== 0) {
            const data = await Model.findOne(templateGroups, {
              where: { id: child.parentId }
            });

            if (data) {
              const arrayChild = [];
              // console.log("data.dataValues",data.dataValues)
              arrayChild.push(data.dataValues);
              // console.log("data === arrayChild==",arrayChild)
              await makeArraySearch(arrayChild, arrTreeId);
            }
          }
        })
      );

      console.log('arrTreeId', arrTreeId);

      return resolve(arrTreeId);
    } catch (error) {
      reject(error);
    }
  });
  // console.log("arrTreeId====",arrTreeId)
};
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
const makeTreeArrayIncludeParent = (array, parent, tree, arrTreeId) => {
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

export default {
  get_list: async param => {
    let finnalyResult;

    try {
      const { filter, range, sort, attributes } = param;
      let whereFilter = filter;

      console.log('whereFilter', filter);
      try {
        whereFilter = await filterHelpers.combineFromDateWithToDate(whereFilter);
      } catch (error) {
        throw error;
      }
      const att = filterHelpers.atrributesHelper(attributes);

      const perPage = range[1] - range[0] + 1;
      const page = Math.floor(range[0] / perPage);

      whereFilter = await filterHelpers.makeStringFilterRelatively(['name'], whereFilter, 'templateGroups');

      if (!whereFilter) {
        whereFilter = { ...filter };
      }

      console.log('where', whereFilter);

      const result = await Model.findAndCountAll(templateGroups, {
        where: whereFilter,
        order: sort,
        offset: range[0],
        attributes: att,
        limit: perPage
        // include
      }).catch(err => {
        ErrorHelpers.errorThrow(err, 'getListError', 'templateGroupService');
      });

      finnalyResult = {
        ...result,
        page: page + 1,
        perPage
      };
    } catch (err) {
      ErrorHelpers.errorThrow(err, 'getListError', 'templateGroupService');
    }

    return finnalyResult;
  },

  get_one: async param => {
    let finnalyResult;
    const { id, attributes } = param;
    const att = filterHelpers.atrributesHelper(attributes, ['placesId']);

    try {
      const result = await Model.findOne(templateGroups, {
        where: { id },
        logging: console.log,
        attributes: att,
        include: [
          // {
          //   model: templateGroups,
          //   as: 'parent',
          //   required: false
          // },
          {
            model: users,
            required: true,
            attributes: ['id', 'username', 'fullname'],
            as: 'usersCreator'
          }
        ]
      });

      if (!result) {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'getInfoNoPermision'
        });
      }

      finnalyResult = result;
    } catch (err) {
      ErrorHelpers.errorThrow(err, 'getInfoError', 'CategoriesService');
    }

    return finnalyResult;
  },

  create: async param => {
    let finnalyResult;

    try {
      const entity = param.entity;
      console.log('templateGroupService create: ', entity);
      let whereFilter = {
        parentId: entity.parentId || 0,
        name: entity.name
      };
      whereFilter = await filterHelpers.makeStringFilterAbsolutely(['name'], whereFilter, 'templateGroups');

      const infoArr = Array.from(
        await Promise.all([
          preCheckHelpers.createPromiseCheckNew(
            Model.findOne(templateGroups, { attributes: ['id'], where: whereFilter }),
            !!entity.name,
            TYPE_CHECK.CHECK_DUPLICATE,
            { parent: 'api.templateGroups.name' }
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

      // const _result = await Model.findOne(templateGroups, {
      //   where: {
      //     parentId: entity.parentId || 0,
      //     name: entity.name
      //   }
      // });
      //
      // if (_result) {
      //     throw new ApiErrors.BaseError({
      //       statusCode: 202,
      //       type: 'crudExisted',
      //       message: 'Tên nhóm giao diện đã tồn tại'
      //     });
      // }

      finnalyResult = await Model.create(templateGroups, param.entity).catch(error => {
        ErrorHelpers.errorThrow(error, 'crudError', 'templateGroupService', 202);
      });
    } catch (error) {
      ErrorHelpers.errorThrow(error, 'crudError', 'templateGroupService');
    }

    return { result: finnalyResult };
  },

  bulkUpdate: async param => {
    let finnalyResult;
    let transaction;

    try {
      const { filter, entity } = param;
      const whereFilter = _.pick(filter, ['id']);

      console.log({
        whereFilter,
        entity
      });
      await templateGroups.update(entity, { where: whereFilter }).then(_result => {
        finnalyResult = _result;
      });
      // transaction = await sequelize.transaction();

      // await transaction.commit();
    } catch (error) {
      if (transaction) await transaction.rollback();
      throw new ApiErrors.BaseError({
        statusCode: 202,
        type: 'crudInfo',
        message: viMessage['api.message.infoAfterEditError'],
        error
      });
    }

    return { result: finnalyResult };
  },

  update: async param => {
    let finnalyResult;

    try {
      const entity = param.entity;

      console.log('templateGroupService update: ', entity);
      console.log(Number(entity.parentId) > 0);
      const foundTemplateGroup = await Model.findOne(templateGroups, {
        where: {
          id: param.id
        }
      }).catch(error => {
        throw preCheckHelpers.createErrorCheck(
          {
            typeCheck: TYPE_CHECK.GET_INFO,
            modelStructure: { parent: 'templateGroups' }
          },
          error
        );
      });
      // console.log("foundTemplateGroup",foundTemplateGroup);

      if (foundTemplateGroup) {
        let whereFilter = {
          id: { $ne: param.id },
          parentId: entity.parentId || foundTemplateGroup.parentId,
          name: entity.name || foundTemplateGroup.name
        };
        whereFilter = await filterHelpers.makeStringFilterAbsolutely(['name'], whereFilter, 'templateGroups');

        const infoArr = Array.from(
          await Promise.all([
            preCheckHelpers.createPromiseCheckNew(
              templateGroups.findOne({ attributes: ['id'], where: whereFilter }),
              !!(entity.name || entity.parentId),
              TYPE_CHECK.CHECK_DUPLICATE,
              { parent: 'api.templateGroups.name' }
            )
          ])
        );
        // console.log("infoArr",infoArr);

        if (!preCheckHelpers.check(infoArr)) {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'getInfoError',
            message: 'Không xác thực được thông tin gửi lên'
          });
        }
        console.log('bug0', foundTemplateGroup);
        if (entity.hasOwnProperty('status')) {
          const arrTreeId = [];
          const array = [foundTemplateGroup];

          if (entity.status === Number(0)) {
            await filterHelpers.makeTreeArrayChildSearch(array, arrTreeId, templateGroups);
          } else if (entity.status === Number(1)) {
            await filterHelpers.makeTreeArrayParentSearch(array, arrTreeId, templateGroups);
          }
          await Model.update(
            templateGroups,
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

        // await Promise.all(
        await Model.update(templateGroups, entity, { where: { id: Number(param.id) } }).catch(error => {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'crudError',
            error
          });
        });
        console.log('bug1');
        finnalyResult = await Model.findOne(templateGroups, {
          where: { id: param.id },
          include: [
            // {
            //   model: templateGroups,
            //   as: 'parent',
            //   required: false
            // },
            {
              model: users,
              required: true,
              attributes: ['id', 'username', 'fullname'],
              as: 'usersCreator'
            }
          ]
        }).catch(error => {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'crudInfo',
            message: viMessage['api.message.infoAfterEditError'],
            error
          });
        });

        if (!finnalyResult) {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'crudInfo',
            message: viMessage['api.message.infoAfterEditError']
          });
        }
      } else {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudNotExisted',
          message: viMessage['api.message.notExisted']
        });
      }
    } catch (error) {
      ErrorHelpers.errorThrow(error, 'crudError', 'templateGroupService');
    }

    return { result: finnalyResult };
  },

  delete: param =>
    new Promise((resolve, reject) => {
      try {
        console.log('delete id', param.id);
        const id = param.id;

        Model.findOne(templateGroups, {
          where: {
            id
          }
        })
          .then(findEntity => {
            // console.log("findPlace: ", findPlace)
            if (!findEntity) {
              reject(
                new ApiErrors.BaseError({
                  statusCode: 202,
                  type: 'crudNotExisted'
                })
              );
            } else {
              Model.destroy(templateGroups, { where: { id: parseInt(param.id) } })
                .then(() => {
                  // console.log("rowsUpdate: ", rowsUpdate)
                  Model.findOne(templateGroups, { where: { Id: param.id } })
                    .then(result => {
                      if (result) {
                        reject(
                          new ApiErrors.BaseError({
                            statusCode: 202,
                            type: 'deleteError'
                          })
                        );
                      } else resolve({ status: 1 });
                    })
                    .catch(err => {
                      reject(ErrorHelpers.errorReject(err, 'crudError', 'templateGroupService'));
                    });
                })
                .catch(err => {
                  reject(ErrorHelpers.errorReject(err, 'crudError', 'templateGroupService'));
                });
            }
          })
          .catch(err => {
            reject(ErrorHelpers.errorReject(err, 'crudError', 'templateGroupService'));
          });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'crudError', 'templateGroupService'));
      }
    }),
  get_all: async param => {
    let finnalyResult;

    try {
      // console.log("filter:", JSON.parse(param.filter))
      let filter = {};
      let sort = [['id', 'ASC']];

      if (param.filter) filter = param.filter;

      if (param.sort) sort = param.sort;

      const result = await Model.findAll(templateGroups, {
        where: filter,
        order: sort
        // include
      }).catch(err => {
        ErrorHelpers.errorThrow(err, 'getListError', 'templateGroupService');
      });

      finnalyResult = result;
    } catch (err) {
      ErrorHelpers.errorThrow(err, 'getListError', 'templateGroupService');
    }

    return finnalyResult;
  },

  find_all_parent_child: async param => {
    let finnalyResult;
    const { filter, sort } = param;

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

    console.log('whereFilter: ', whereFilter);

    try {
      const result = await Model.findAndCountAll(templateGroups, {
        where: whereFilter,
        order: sort,
        include: [
          {
            model: users,
            as: 'usersCreator'
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
  updateOrder: async param => {
    let finnalyResult;

    try {
      const entity = param.entity;

      console.log('templateGroupService updateOrders: ', entity.orders);

      const updateArr = Array.from(
        await Promise.all(
          entity.orders.map(item =>
            Model.update(
              templateGroups,
              {
                orderBy: item.orderBy
              },
              { where: { id: parseInt(item.id) } }
            )
          )
        ).catch(error => {
          ErrorHelpers.errorThrow(error, 'crudError', 'templateGroupService');
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
      ErrorHelpers.errorThrow(error, 'crudError', 'templateGroupService');
    }

    return { result: finnalyResult };
  },
  get_template_group: async param => {
    let finnalyResult;

    const filter = param.filter;
    const filterChild = param.filterChild;
    const sort = param.sort;
    const filterStatus = _.pick(filter, ['status']);

    console.log('get_mennu filter: ', filter); // { "SiteId": { $not: 3 } }
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
    const include = [
      {
        model: users,
        as: 'usersCreator',
        where: filterChild,
        required: true
      }
    ];

    // include.push({
    //   model: roles, as: 'roles',
    //   // attributes: ['id'],
    //   where: filterChild,
    //   required: true
    // });

    try {
      const result = await templateGroups
        .findAndCountAll({
          where: filter,
          order: sort,
          include
        })
        .catch(error => {
          console.log('get_menu error: ', error);
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'getListError',
            error
          });
        });

      if (result) {
        // console.log("result: ", result.rows)
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

        return { rows: tree, count: result.count, page: 1, perPage: result.count };
      } else {
        finnalyResult = {};
      }
    } catch (error) {
      throw new ApiErrors.BaseError({
        statusCode: 202,
        type: 'getListError',
        error
      });
    }

    return finnalyResult;
  },
  find_list_parent_child_one: async param => {
    let finnalyResult;
    const { filter, range, sort, auth } = param;
    const perPage = range[1] - range[0] + 1;
    const page = Math.floor(range[0] / perPage);
    const filterStatus = _.pick(filter, ['status', 'sitesId']);
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

    console.log('whereFilter: ', whereFilter);

    try {
      const arrTreeSearchId = [];

      if (!_.isEmpty(whereFilter)) {
        const resultSearch = await templateGroups
          .findAndCountAll({
            where: whereFilter,
            attributes: ['id', 'name', 'parentId']
            // order: sort
          })
          .catch(error => {
            throw error;
          });

        await filterHelpers.makeTreeParentChildrenArraySearch(
          resultSearch.rows,
          arrTreeSearchId,
          templateGroups,
          filterStatus
        );

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

      const result = await templateGroups
        .findAndCountAll({
          where: whereFilter,
          order: sort
        })
        .catch(error => {
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
  find_list_parent_child: async param => {
    let finnalyResult;
    const { filter, range, sort, auth } = param;
    const perPage = range[1] - range[0] + 1;
    const page = Math.floor(range[0] / perPage);
    const filterStatus = _.pick(filter, ['status', 'sitesId']);
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

    console.log('whereFilter: ', whereFilter);

    try {
      const arrTreeSearchId = [];

      if (!_.isEmpty(whereFilter)) {
        const resultSearch = await templateGroups
          .findAndCountAll({
            where: whereFilter,
            attributes: ['id', 'name', 'parentId']
            // order: sort
          })
          .catch(error => {
            throw error;
          });

        await filterHelpers.makeTreeArrayParentSearch(resultSearch.rows, arrTreeSearchId, templateGroups, filterStatus);

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
      console.log('whereFilter================', whereFilter);
      const result = await templateGroups
        .findAndCountAll({
          where: whereFilter,
          order: sort
        })
        .catch(error => {
          throw error;
        });
      console.log('result', result);
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
  update_status: param =>
    new Promise((resolve, reject) => {
      try {
        console.log('block id', param.id);
        const id = param.id;
        const entity = param.entity;

        Model.findOne(templateGroups, {
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

                if (entity.status === Number(0)) {
                  await filterHelpers.makeTreeArrayChildSearch(array, arrTreeId, templateGroups);
                } else if (entity.status === Number(1)) {
                  await filterHelpers.makeTreeArrayParentSearch(array, arrTreeId, templateGroups);
                }
                await Model.update(
                  templateGroups,
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

              Model.update(templateGroups, entity, {
                where: { id: id }
              })
                .then(() => {
                  Model.findOne(templateGroups, { where: { id: param.id } })
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
                      reject(ErrorHelpers.errorReject(err, 'crudError', 'templateGroupsServices'));
                    });
                })
                .catch(err => {
                  reject(ErrorHelpers.errorReject(err, 'crudError', 'templateGroupsServices'));
                });
            }
          })
          .catch(err => {
            reject(ErrorHelpers.errorReject(err, 'crudError', 'templateGroupsServices'));
          });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'crudError', 'templateGroupsServices'));
      }
    })
};
