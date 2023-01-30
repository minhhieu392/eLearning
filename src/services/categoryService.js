import Model from '../models/models';
// import sitesModel from '../models/sites'

import models from '../entity/index';
import MODEL from '../models/models';
import * as ApiErrors from '../errors';
import ErrorHelpers from '../helpers/errorHelpers';
import viMessage from '../locales/vi';
import filterHelpers from '../helpers/filterHelpers';
import DataUtils from '../utils/dataUtils';
import preCheckHelpers, { TYPE_CHECK } from '../helpers/preCheckHelpers';

import _ from 'lodash';

// import { where } from 'sequelize/types';

const {
  Op,
  sequelize,
  categoriesUrlSlugs,
  categories,

  users,
  sites,
  languages
} = models;

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
  // console.log("array",array);
  const children = _.filter(array, function(child) {
    // console.log("child.MenuParentID: %o, parent.id", child.parentId, parent.id)
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
      const { filter, range, sort } = param;
      console.log('params', param.attributes);
      const att = filterHelpers.atrributesHelper(param.attributes);
      let whereFilter = filter;

      console.log(filter);
      try {
        whereFilter = await filterHelpers.combineFromDateWithToDate(whereFilter);
      } catch (error) {
        throw error;
      }

      const perPage = range[1] - range[0] + 1;
      const page = Math.floor(range[0] / perPage);

      whereFilter = await filterHelpers.makeStringFilterRelatively(['name'], whereFilter, 'categories');

      if (!whereFilter) {
        whereFilter = { ...filter };
      }
      // if (filter.placesId) {
      //   whereFilter = _.omit(whereFilter, ['placesId'])
      // }
      // console.log('where', whereFilter);

      /*
      const include = await filterHelpers.createIncludeWithAuthorization(auth, [
        [
          {
            model: sites,
            as: 'sites',
            required: true
          }
        ],
        [
          {
            model: users,
            as: 'usersCreator',
            required: true
          }
        ],
        [
          {
            model: categoriesUrlSlugs,
            as: 'categoriesUrlSlugs',
            // required: true
          }
        ]
      ]);*/

      // const { placesId } = await filterHelpers.getInfoAuthorization(auth, { placesId: filter.placesId }, true);
      let whereSites = {};

      // if (placesId) {
      //   whereSites.placesId = placesId;
      // }

      console.log('whereSites: ', att);

      const result = await Model.findAndCountAll(categories, {
        where: whereFilter,
        attributes: att,
        order: sort,
        offset: range[0],
        limit: perPage,
        distinct: true,

        logging: true,
        include: [
          {
            model: sites,
            as: 'sites',
            attributes: ['id', 'name', 'templatesId'],
            required: true,
            where: { status: true, ...whereSites }
          },
          {
            model: users,
            attributes: ['id', 'fullname'],
            as: 'usersCreator',
            required: true
          },
          {
            model: languages,
            attributes: ['id', 'languageName', 'languageCode'],
            as: 'languages',
            required: true
          },
          {
            model: categoriesUrlSlugs,
            as: 'categoriesUrlSlugs'
            // required: true
          }
        ]
      }).catch(err => {
        ErrorHelpers.errorThrow(err, 'getListError', 'CategoryService');
      });

      finnalyResult = {
        ...result,
        page: page + 1,
        perPage
      };
    } catch (err) {
      ErrorHelpers.errorThrow(err, 'getListError', 'CategoryService');
    }

    return finnalyResult;
  },
  get_list_old: param =>
    new Promise((resolve, reject) => {
      try {
        const { filter, range, sort } = param;
        let whereFilter = filter;

        console.log(filter);
        try {
          whereFilter = filterHelpers.combineFromDateWithToDate(whereFilter);
        } catch (error) {
          reject(error);
        }

        const perPage = range[1] - range[0] + 1;
        const page = Math.floor(range[0] / perPage);

        filterHelpers.makeStringFilterRelatively(['name'], whereFilter);

        if (!whereFilter) {
          whereFilter = { ...filter };
        }

        console.log('where', whereFilter);

        Model.findAndCountAll(categories, {
          where: whereFilter,
          order: sort,
          offset: range[0],
          limit: perPage,
          distinct: true,
          include: [
            {
              model: categories,
              as: 'parent',
              required: false
            },

            {
              model: users,
              as: 'usersCreator',
              required: true
            },
            {
              model: categoriesUrlSlugs,
              as: 'categoriesUrlSlugs'
              // required: true
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
            reject(ErrorHelpers.errorReject(err, 'getListError', 'CategoriesService'));
          });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'getListError', 'CategoriesService'));
      }
    }),
  get_one: async param => {
    let finnalyResult;

    try {
      // console.log("Menu Model param: %o | id: ", param, param.id)
      const { id } = param;
      const att = filterHelpers.atrributesHelper(param.attributes);
      const result = await Model.findOne(categories, {
        where: { id },
        logging: console.log,
        attributes: att,
        include: [
          {
            model: categoriesUrlSlugs,
            as: 'categoriesUrlSlugs'
            // required: true
          },
          {
            model: sites,
            as: 'sites',
            required: true,
            attributes: ['id', 'name', 'templatesId']
          },
          {
            model: languages,
            as: 'languages',
            required: true,
            attributes: ['id', 'languageName', 'languageCode']
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
  find_list_parent_child: async param => {
    let finnalyResult;
    const { filter, range, sort } = param;
    const filterStatus = _.pick(filter, ['status']);
    const perPage = range[1] - range[0] + 1;
    const page = Math.floor(range[0] / perPage);
    let whereFilter = filter;

    console.log(filter);
    try {
      whereFilter = await filterHelpers.combineFromDateWithToDate(whereFilter);
    } catch (error) {
      throw error;
    }

    whereFilter = await filterHelpers.makeStringFilterRelatively(['name'], whereFilter, 'categories');
    // if (filter.placesId) {
    //   whereFilter = _.omit(whereFilter, ['placesId'])
    // }
    console.log('whereFilter: ', whereFilter);

    try {
      //  const { placesId } = await filterHelpers.getInfoAuthorization(auth, { placesId: filter.placesId }, true);
      let whereSites = {};

      // if (placesId) {
      //   whereSites.placesId = placesId;
      // }

      const arrTreeSearchId = typeof arrTreeId !== 'undefined' ? arrTreeSearchId : [];

      console.log('whereFilter=====+++===', whereFilter);

      if (!_.isEmpty(whereFilter)) {
        const resultSearch = await Model.findAll(categories, {
          where: whereFilter,
          attributes: ['id', 'name', 'parentId']
          // order: sort
        }).catch(error => {
          throw error;
        });

        console.log('resultSearch===', resultSearch);
        await filterHelpers.makeTreeArrayParentSearch(resultSearch, arrTreeSearchId, categories, filterStatus);
        console.log('arrTreeSearchId=====+++===', arrTreeSearchId);
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
      console.log('whereFilter-----', whereFilter);

      console.log('whereFilter+++++', whereFilter);
      const result = await Model.findAndCountAll(categories, {
        where: whereFilter,
        order: sort,
        distinct: true,
        attributes: [
          'id',
          'name',
          'sitesId',
          'url',
          'image',
          'seoKeywords',
          'parentId',
          'seoDescriptions',
          'isHome',
          'descriptions',
          'orderBy',
          'urlSlugs',
          'typesId',
          'orderHome',
          'status',
          'createDate'
        ],
        include: [
          {
            model: sites,
            as: 'sites',
            attributes: ['id', 'name', 'templatesId'],
            required: true,
            where: { status: true, ...whereSites }
          },
          {
            model: users,
            attributes: ['id', 'fullname'],
            as: 'usersCreator',
            required: true
          },
          {
            model: categoriesUrlSlugs,
            as: 'categoriesUrlSlugs',
            attributes: ['urlSlug']
            // required: true
          },

          {
            model: languages,
            as: 'languages',
            attributes: ['id', 'languageName', 'languageCode']
          }
        ],
        logging: console.log
      }).catch(error => {
        throw error;
      });

      if (result) {
        // console.log("result.rows: ", result.rows)
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

            // console.log("treeTemp: ", treeTemp)
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
      ErrorHelpers.errorThrow(error, 'getListError', 'CategoryService');
    }

    return finnalyResult;
  },
  find_list_parent_child_one: async param => {
    let finnalyResult;
    const { filter, range, sort } = param;
    const filterStatus = _.pick(filter, ['status']);
    const perPage = range[1] - range[0] + 1;
    const page = Math.floor(range[0] / perPage);
    let whereFilter = filter;

    console.log('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', filter);
    try {
      whereFilter = await filterHelpers.combineFromDateWithToDate(whereFilter);
    } catch (error) {
      throw error;
    }

    whereFilter = await filterHelpers.makeStringFilterRelatively(['name'], whereFilter, 'categories');
    if (filter.placesId) {
      whereFilter = _.omit(whereFilter, ['placesId']);
    }
    console.log('whereFilter: ', whereFilter);

    try {
      //  const { placesId } = await filterHelpers.getInfoAuthorization(auth, { placesId: filter.placesId }, true);
      let whereSites = {};

      // if (placesId) {
      //   whereSites.placesId = placesId;
      // }

      const arrTreeSearchId = typeof arrTreeId !== 'undefined' ? arrTreeSearchId : [];

      // console.log('whereFilter=====+++===', whereFilter);

      if (!_.isEmpty(whereFilter)) {
        const resultSearch = await Model.findAll(categories, {
          where: whereFilter,
          attributes: ['id', 'name', 'parentId', 'status']
          // order: sort
        }).catch(error => {
          throw error;
        });

        // console.log('resultSearch===', resultSearch);
        await filterHelpers.makeTreeParentChildrenArraySearch(resultSearch, arrTreeSearchId, categories, filterStatus);
        // console.log('arrTreeSearchId=====+++===', arrTreeSearchId);
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

      // console.log('whereFilter-----', whereFilter);

      //  console.log('whereFilter+++++', whereFilter);
      const result = await Model.findAndCountAll(categories, {
        where: whereFilter,
        order: sort,
        distinct: true,
        attributes: [
          'id',
          'name',
          'sitesId',
          'url',
          'image',
          'seoKeywords',
          'parentId',
          'seoDescriptions',
          'isHome',
          'descriptions',
          'orderBy',
          'urlSlugs',
          'typesId',
          'orderHome',
          'status',
          'createDate'
        ],
        include: [
          {
            model: sites,
            as: 'sites',
            attributes: ['id', 'name', 'templatesId'],
            required: true,
            where: { status: true, ...whereSites }
          },
          {
            model: languages,
            as: 'languages',
            attributes: ['id', 'languageName', 'languageCode']
          },
          {
            model: users,
            attributes: ['id', 'fullname'],
            as: 'usersCreator',
            required: true
          },
          {
            model: categoriesUrlSlugs,
            as: 'categoriesUrlSlugs',
            attributes: ['urlSlug']
            // required: true
          }
        ],
        logging: console.log
      }).catch(error => {
        throw error;
      });

      if (result) {
        // console.log("result.rows: ", result.rows)
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

            // console.log("treeTemp: ", treeTemp)
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
      ErrorHelpers.errorThrow(error, 'getListError', 'CategoryService');
    }

    return finnalyResult;
  },
  test_tree: async param => {
    let finnalyResult;
    const { filter, range, sort } = param;

    const perPage = range[1] - range[0] + 1;
    const page = Math.floor(range[0] / perPage);
    let whereFilter = filter;

    console.log(filter);
    try {
      whereFilter = await filterHelpers.combineFromDateWithToDate(whereFilter);
    } catch (error) {
      throw error;
    }

    whereFilter = await filterHelpers.makeStringFilterRelatively(['name'], whereFilter, 'categories');

    console.log('whereFilter: ', whereFilter);

    try {
      const result = await Model.findAndCountAll(categories, {
        where: whereFilter,
        order: sort,
        include: [
          {
            model: sites,
            as: 'sites',
            attributes: ['id', 'name', 'templatesId'],
            where: {
              status: true
            },
            required: true
          },
          {
            model: users,
            attributes: ['id', 'fullname'],
            as: 'usersCreator',
            required: true
          },
          {
            model: languages,
            as: 'languages',
            attributes: ['id', 'languageName', 'languageCode']
          },
          {
            model: categoriesUrlSlugs,
            as: 'categoriesUrlSlugs'
            // required: true
          }
        ]
      }).catch(error => {
        throw error;
      });

      if (result) {
        const tree = DataUtils.makeTree(
          '0',
          result.rows.map(e => e.dataValues)
        );

        console.log('tree: ', tree);
        finnalyResult = {
          rows: tree,
          count: tree.length, // result.count,
          page: page + 1,
          perPage: perPage
        };
      }
    } catch (error) {
      ErrorHelpers.errorThrow(error, 'getListError', 'CategoryService');
    }

    return finnalyResult;
  },
  find_all_parent_child: async param => {
    let finnalyResult;
    const { filter, sort } = param;

    let whereFilter = filter;

    try {
      whereFilter = await filterHelpers.combineFromDateWithToDate(whereFilter);
    } catch (error) {
      throw error;
    }

    whereFilter = await filterHelpers.makeStringFilterRelatively(['name'], whereFilter, 'categories');
    if (filter.placesId) {
      whereFilter = _.omit(whereFilter, ['placesId']);
    }
    console.log('whereFilter: ', whereFilter);

    try {
      // const { placesId } = await filterHelpers.getInfoAuthorization(auth, { placesId: filter.placesId }, true);
      const whereSites = {};

      // if (placesId) {
      //   whereSites.placesId = placesId;
      // }

      const result = await Model.findAndCountAll(categories, {
        where: whereFilter,
        order: sort,
        attributes: [
          'id',
          'name',
          'sitesId',
          'url',
          'image',
          'seoKeywords',
          'parentId',
          'seoDescriptions',
          'isHome',
          'descriptions',
          'orderBy',
          'urlSlugs',
          'typesId',
          'orderHome',
          'status'
        ],
        include: [
          {
            model: sites,
            as: 'sites',
            attributes: ['id', 'name', 'templatesId'],
            required: true,
            where: { status: true, ...whereSites }
          },
          {
            model: users,
            attributes: ['id', 'fullname'],
            as: 'usersCreator',
            required: true
          },
          {
            model: categoriesUrlSlugs,
            as: 'categoriesUrlSlugs'
            // required: true
          }
        ],
        logging: console.log
      }).catch(error => {
        throw error;
      });

      if (result) {
        const dataTree = makeTreeArray(result.rows, { id: 0 }, []);
        let tree = dataTree.tree;
        const arrTreeId = dataTree.arrTreeId;
        // console.log("arrTreeId: ", arrTreeId)
        // console.log("dataTree: ", dataTree)

        if (arrTreeId.length > 0) {
          const newResult = result.rows.filter(item => {
            console.log('arrTreeId.indexOf(item.id): ', arrTreeId.indexOf(item.id));
            if (arrTreeId.indexOf(item.id) === -1) {
              return item;
            }
          });
          console.log('newResult: ', newResult);
          newResult.forEach(item => {
            const treeTemp = makeTreeArray(result.rows, { id: item.parentId }, []);

            // console.log("treeTemp: ", treeTemp)
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
      ErrorHelpers.errorThrow(error, 'getListError', 'CategoryService');
    }

    return finnalyResult;
  },
  find_list_parent_child_old: param =>
    new Promise((resolve, reject) => {
      const filter = param.filter;
      const sort = param.sort;

      let whereFilter = filter,
        nameFilter;

      if (filter.Name) {
        nameFilter = {
          name: { $like: sequelize.literal(`CONCAT('%','${filter.name}','%')`) }
        };
        whereFilter = _.assign(whereFilter, nameFilter);
      }

      console.log('whereFilter: ', whereFilter);
      // { "SiteId": { $not: 3 } }
      try {
        Model.findAndCountAll(categories, {
          where: whereFilter,
          order: sort,
          include: [{ model: sites, as: 'sites', required: false }]
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
                  const treeTemp = makeTreeArray(result.rows, { id: item.ParentId }, []);

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
  create: async param => {
    let finnalyResult;
    let finnalyResultVer2;

    try {
      const entity = param.entity;

      console.log('CategoriesService create: ', entity);
      let whereFilter = {
        sitesId: entity.sitesId,
        name: entity.name
      };
      whereFilter = await filterHelpers.makeStringFilterAbsolutely(['name'], whereFilter, 'categories');

      const infoArr = Array.from(
        await Promise.all([
          preCheckHelpers.createPromiseCheckNew(
            Model.findOne(categories, {
              attributes: ['id'],
              where: whereFilter
            }),
            entity.name || entity.sitesId ? true : false,
            TYPE_CHECK.CHECK_DUPLICATE,
            { parent: 'api.category.name' }
          ),
          preCheckHelpers.createPromiseCheckNew(
            Model.findOne(categories, {
              attributes: ['id'],
              where: {
                id: entity.parentId,
                sitesId: entity.sitesId
              }
            }),
            Number(entity.parentId) ? true : false,
            TYPE_CHECK.CHECK_EXISTS,
            { parent: 'api.category.parent' }
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

      finnalyResult = await Model.create(categories, param.entity).catch(error => {
        ErrorHelpers.errorThrow(error, 'crudError', 'CategoriesService', 202);
      });

      const result = sequelize.query('call sp_categories_urlSlugs(:in_sitesId, :in_categoriesId, :in_urlSlug)', {
        replacements: {
          in_sitesId: entity.sitesId || 0,
          in_categoriesId: finnalyResult.id || 0,
          in_urlSlug: entity.urlSlugs || ''
        },
        type: sequelize.QueryTypes.SELECT
      });

      // const row = Object.values(result[0]);
      delete result[0].meta;
      console.log('result', result[0]);

      console.log('finnalyResult', finnalyResult);
      await Promise.all(
        (finnalyResultVer2 = await Model.findOne(categories, {
          where: { id: finnalyResult.id }
        }).catch(error => {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'crudInfo',
            message: viMessage['api.message.infoAfterEditError'],
            error
          });
        }))
      );

      if (!finnalyResult) {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudInfo',
          message: viMessage['api.message.infoAfterCreateError']
        });
      } else {
        if (parseInt(finnalyResult.parentId) === 0) {
          finnalyResult.url += `-${finnalyResult.id}`;
        } else {
          finnalyResult.url += `_${finnalyResult.id}`;
        }
        await finnalyResult.save().catch(error => {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'crudError',
            error
          });
        });
      }
    } catch (error) {
      ErrorHelpers.errorThrow(error, 'crudError', 'CategoriesService');
    }

    return { result: finnalyResultVer2 };
  },
  update: async param => {
    let finnalyResult;

    try {
      const entity = param.entity;

      console.log('CategoriesService update: ', entity);
      console.log(Number(entity.parentId) > 0);
      const foundCategory = await Model.findOne(categories, {
        where: {
          id: param.id
        }
      }).catch(error => {
        throw preCheckHelpers.createErrorCheck(
          { typeCheck: TYPE_CHECK.GET_INFO, modelStructure: { parent: 'categories' } },
          error
        );
      });
      // console.log("foundCategory",foundCategory);

      if (foundCategory) {
        let whereFilter = {
          id: { $ne: param.id },
          sitesId: entity.sitesId || foundCategory.sitesId,
          name: entity.name || foundCategory.name
        };

        whereFilter = await filterHelpers.makeStringFilterAbsolutely(['name'], whereFilter, 'categories');

        const infoArr = Array.from(
          await Promise.all([
            preCheckHelpers.createPromiseCheckNew(
              Model.findOne(categories, {
                attributes: ['id'],
                where: whereFilter
              }),
              entity.name || entity.sitesId ? true : false,
              TYPE_CHECK.CHECK_DUPLICATE,
              { parent: 'api.category.name' }
            ),
            preCheckHelpers.createPromiseCheckNew(
              Model.findOne(categories, {
                attributes: ['id'],
                where: {
                  id: entity.parentId || foundCategory.parentId,
                  sitesId: entity.sitesId || foundCategory.sitesId
                }
              }),
              Number(entity.parentId) ? true : false,
              TYPE_CHECK.CHECK_EXISTS,
              { parent: 'api.category.parent' }
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

        if (entity.hasOwnProperty('status')) {
          const arrTreeId = [];
          const array = [foundCategory];

          if (entity.status === Number(0)) {
            await filterHelpers.makeTreeArrayChildSearch(array, arrTreeId, categories);
          } else if (entity.status === Number(1)) {
            await filterHelpers.makeTreeArrayParentSearch(array, arrTreeId, categories);
          }
          await Model.update(
            categories,
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
        await Model.update(categories, entity, { where: { id: Number(param.id) } }).catch(error => {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'crudError',
            error
          });
        });

        if (entity.urlSlugs && entity.sitesId) {
          await sequelize.query('call sp_categories_urlSlugs(:in_sitesId, :in_categoriesId, :in_urlSlug)', {
            replacements: {
              in_sitesId: entity.sitesId || 0,
              in_categoriesId: param.id || 0,
              in_urlSlug: entity.urlSlugs || ''
            },
            type: sequelize.QueryTypes.SELECT
          });
        }

        finnalyResult = await Model.findOne(categories, {
          where: { id: param.id }
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
      ErrorHelpers.errorThrow(error, 'crudError', 'CategoriesService');
    }

    return { result: finnalyResult };
  },
  update_old: async param => {
    let finnalyResult;

    try {
      const entity = param.entity;

      console.log('CategoriesService update: ', entity);

      const foundCategory = await Model.findOne(categories, {
        where: {
          id: param.id
        }
      }).catch(error => {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'getInfoError',
          message: viMessage['api.message.infoError'],
          error
        });
      });

      if (foundCategory) {
        if (entity.sitesId) {
          const infoArr = Array.from(
            await Promise.all([
              entity.parentId > 0
                ? Model.findOne(categories, {
                    where: {
                      parentId: entity.parentId || foundCategory.parentId
                    }
                  })
                : Promise.resolve(0),
              Model.findOne(categories, {
                where: {
                  id: { $ne: param.id },
                  sitesId: entity.sitesId || foundCategory.sitesId,
                  name: entity.name || foundCategory.name
                }
              })
            ]).catch(error => {
              throw new ApiErrors.BaseError({
                statusCode: 202,
                type: 'getInfoError',
                message: viMessage['api.message.infoError'],
                error
              });
            })
          );

          if (entity.parentId > 0 && !infoArr[0]) {
            throw new ApiErrors.BaseError({
              statusCode: 202,
              type: 'crudNotExisted',
              message: viMessage['api.categoryParent.message.notExisted']
            });
          } else if (infoArr[1]) {
            throw new ApiErrors.BaseError({
              statusCode: 202,
              type: 'crudExisted',
              message: viMessage['api.category.message.existed']
            });
          } else {
            await Model.update(categories, entity, { where: { id: parseInt(param.id) } }).catch(error => {
              throw new ApiErrors.BaseError({
                statusCode: 202,
                type: 'crudError',
                error
              });
            });

            finnalyResult = await Model.findOne(categories, { where: { id: param.id } }).catch(error => {
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
          }
        } else {
          await Model.update(categories, entity, { where: { id: parseInt(param.id) } }).catch(error => {
            throw new ApiErrors.BaseError({
              statusCode: 202,
              type: 'crudError',
              error
            });
          });

          finnalyResult = await Model.findOne(categories, { where: { id: param.id } }).catch(error => {
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
        }
      } else {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudNotExisted',
          message: viMessage['api.message.notExisted']
        });
      }
    } catch (error) {
      ErrorHelpers.errorThrow(error, 'crudError', 'CategoriesService');
    }

    return { result: finnalyResult };
  },
  delete: param =>
    new Promise((resolve, reject) => {
      try {
        console.log('delete id', param.id);
        const id = param.id;

        Model.findOne(categories, {
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
              Model.destroy(categories, { where: { id: parseInt(param.id) } })
                .then(() => {
                  // console.log("rowsUpdate: ", rowsUpdate)
                  Model.findOne(categories, { where: { Id: param.id } })
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
                      reject(ErrorHelpers.errorReject(err, 'crudError', 'CategoriesService'));
                    });
                })
                .catch(err => {
                  reject(ErrorHelpers.errorReject(err, 'crudError', 'CategoriesService'));
                });
            }
          })
          .catch(err => {
            reject(ErrorHelpers.errorReject(err, 'crudError', 'CategoriesService'));
          });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'crudError', 'CategoriesService'));
      }
    }),
  get_all: async param => {
    let finnalyResult;
    const { filter, sort, auth } = param;

    try {
      // console.log("filter:", JSON.parse(param.filter))

      /*  const include = await filterHelpers.createIncludeWithAuthorization(param.auth, [
          [
            {
              model: sites,
              as: 'sites',
              required: true
            }
          ],
          [
            {
              model: users,
              as: 'usersCreator',
              required: true
            }
          ]
        ]);
  */
      let whereFilter = filter;

      console.log(filter);
      try {
        whereFilter = await filterHelpers.combineFromDateWithToDate(whereFilter);
      } catch (error) {
        throw error;
      }

      whereFilter = await filterHelpers.makeStringFilterRelatively(['name'], whereFilter, 'categories');
      if (filter.placesId) {
        whereFilter = _.omit(whereFilter, ['placesId']);
      }
      console.log('whereFilter: ', whereFilter);

      const { placesId } = await filterHelpers.getInfoAuthorization(auth, { placesId: filter.placesId }, true);
      let whereSites = {};

      if (placesId) {
        whereSites.placesId = placesId;
      }
      const result = await Model.findAll(categories, {
        where: whereFilter,
        order: sort,
        include: [
          {
            model: sites,
            as: 'sites',
            attributes: ['id', 'name', 'templatesId'],
            required: true,
            where: { status: true, ...whereSites }
          },
          {
            model: users,
            attributes: ['id', 'fullname'],
            as: 'usersCreator',
            required: true
          },
          {
            model: categoriesUrlSlugs,
            as: 'categoriesUrlSlugs'
            // required: true
          }
        ]
      }).catch(err => {
        ErrorHelpers.errorThrow(err, 'getListError', 'CategoriesService');
      });

      finnalyResult = result;
    } catch (err) {
      ErrorHelpers.errorThrow(err, 'getListError', 'CategoriesService');
    }

    return finnalyResult;
  },
  updateOrder: async param => {
    let finnalyResult;

    try {
      const entity = param.entity;

      console.log('CategoriesService updateOrder: ', entity.orders);

      const updateArr = Array.from(
        await Promise.all(
          entity.orders.map(item =>
            Model.update(
              categories,
              {
                orderBy: item.orderBy
              },
              { where: { id: parseInt(item.id) } }
            )
          )
        ).catch(error => {
          ErrorHelpers.errorThrow(error, 'crudError', 'CategoriesService');
        })
      );

      console.log('CategoriesService updateArr ', updateArr);
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
      ErrorHelpers.errorThrow(error, 'crudError', 'CategoriesService');
    }

    return { result: finnalyResult };
  },
  updateOrderHome: async param => {
    let finnalyResult;

    try {
      const entity = param.entity;

      console.log('CategoriesService updateOrder: ', entity.orderHomes);

      const updateArr = Array.from(
        await Promise.all(
          entity.orderHomes.map(item =>
            Model.update(
              categories,
              {
                orderHome: item.orderHome
              },
              { where: { id: parseInt(item.id) } }
            )
          )
        ).catch(error => {
          ErrorHelpers.errorThrow(error, 'crudError', 'CategoriesService');
        })
      );

      console.log('CategoriesService updateArr ', updateArr);
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
      ErrorHelpers.errorThrow(error, 'crudError', 'CategoriesService');
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

      await categories.update(entity, { where: whereFilter, transaction }).then(_result => {
        finnalyResult = _result;
      });

      await transaction.commit();
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
  update_status: param =>
    new Promise((resolve, reject) => {
      try {
        console.log('block id', param.id);
        const id = param.id;
        const entity = param.entity;

        Model.findOne(categories, {
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
                  await filterHelpers.makeTreeArrayChildSearch(array, arrTreeId, categories);
                } else if (entity.status === Number(1)) {
                  await filterHelpers.makeTreeArrayParentSearch(array, arrTreeId, categories);
                }
                await Model.update(
                  categories,
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

              Model.update(categories, entity, {
                where: { id: id }
              })
                .then(() => {
                  // console.log("rowsUpdate: ", rowsUpdate)
                  Model.findOne(categories, { where: { id: param.id } })
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
                      reject(ErrorHelpers.errorReject(err, 'crudError', 'categoriesServices'));
                    });
                })
                .catch(err => {
                  reject(ErrorHelpers.errorReject(err, 'crudError', 'categoriesServices'));
                });
            }
          })
          .catch(err => {
            reject(ErrorHelpers.errorReject(err, 'crudError', 'categoriesServices'));
          });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'crudError', 'categoriesServices'));
      }
    }),
  get_categoriesFilter: param =>
    new Promise(async (resolve, reject) => {
      try {
        console.log('param==', param);
        const result = await sequelize.query('call sp_categoriesFilter_get(:in_productName,:in_categories);', {
          replacements: {
            in_productName: param.filter.productName || '',
            in_categories: param.filter.categories ? JSON.stringify(param.filter.categories) : '[]'
          },
          type: sequelize.QueryTypes.SELECT
        });
        // console.log("result===",result)

        delete result[0].meta;
        const rows = Object.values(result[0]);

        resolve(rows);
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'getListError', 'userAddresservice'));
      }
    })
};
