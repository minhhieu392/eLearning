import Model from '../../models/models';
// import sitesModel from '../models/sites'
// import templateLayoutsModel from '../models/templateLayouts'
import models from '../../entity/index';
import MODEL from '../../models/models';
import * as ApiErrors from '../../errors';
import ErrorHelpers from '../../helpers/errorHelpers';
import filterHelpers from '../../helpers/filterHelpers';
import _ from 'lodash';
import lodashHelpers from '../../helpers/lodashHelpers';
// import categories from '../../entity/categories';

const {
  /* sequelize, categories, */ sequelize,
  categoriesUrlSlugs,
  templateLayouts,
  categoriesTemplateLayouts,
  categories,
  sites,
  languages,
  templates,productsCatalog
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
      const { filter, range, sort /* , auth */, attributes } = param;
      let whereSite = _.pick(filter, ['sitesId']);

      let whereTemplateLayout = _.pick(filter, ['templateLayoutsId']);

      whereTemplateLayout = lodashHelpers.rename(whereTemplateLayout, [['templateLayoutsId', 'id']]);

      whereSite = lodashHelpers.rename(whereSite, [['sitesId', 'id']]);
      let whereFilter = _.omit(filter, ['urlSlugs']);
      const whereFilterurlSlugs = _.pick(filter, ['urlSlugs']);

      console.log(filter);
      console.log('whereTemplateLayout', whereTemplateLayout);

      whereFilter = { ...whereFilter, ...{ status: true } };
      try {
        whereFilter = await filterHelpers.combineFromDateWithToDate(whereFilter);
      } catch (error) {
        throw error;
      }

      const perPage = range[1] - range[0] + 1;
      const page = Math.floor(range[0] / perPage);
      const att = filterHelpers.atrributesHelper(attributes);

      whereFilter = await filterHelpers.makeStringFilterRelatively(['name'], whereFilter, 'categories');

      if (!whereFilter) {
        whereFilter = { ..._.omit(filter, ['urlSlugs']) };
      }
      if (whereFilterurlSlugs) {
        whereFilter = { ...whereFilter, ...whereFilterurlSlugs.urlSlugs };
      }
      console.log('where', whereFilter);
      const resultSites = await MODEL.findOne(sites, {
        where: whereSite
      });
      const whereTemplate = { id: resultSites && resultSites.templatesId ? resultSites.templatesId : '' };

      console.log('whereTemplate', whereTemplate);

      const result = await Model.findAndCountAll(categories, {
        where: whereFilter,
        order: sort,
        offset: range[0],
        limit: perPage,
        distinct: true,
        logging: console.log,
        attributes: [
          'id',
          'name',
          'sitesId',
          'url',
          'image',
          'seoKeywords',
          'seoDescriptions',
          'isHome',
          'descriptions',
          'orderBy',
          'urlSlugs',
          'typesId',
          'orderHome',
          [
            sequelize.literal(
              'case when categories.typesId=1 then (select count(*) from article where article.categoriesId = categories.id) else (select count(*) from ecommerceProducts where ecommerceProducts .categoriesId = categories.id) end'
            ),
            'Total'
          ]
        ],
        include: [
          {
            model: categoriesTemplateLayouts,
            required: true,
            attributes: ['id', 'isHome'],
            as: 'categoriesTemplateLayout',
            include: [
              {
                model: templateLayouts,
                as: 'templateLayouts',
                // where: whereTemplateLayout,
                attributes: ['id', 'name', 'folder'],
                include: [
                  {
                    model: templates,
                    as: 'templates',
                    attributes: ['id', 'name', 'folder'],
                    required: false,
                    where: whereTemplate
                  }
                ]
              }
            ]
          },
          
          {
            model: productsCatalog,
            as: 'productsCatalog',
            attributes: ['id', 'name']
          },
          {
            model: categoriesUrlSlugs,
            as: 'categoriesUrlSlugs',
            required: true,
            attributes: ['id', 'urlSlug', 'status']
          },
          {
            model: languages,
            as: 'languages',
            attributes: ['id', 'languageName', 'languageCode']
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
  get_one: async param => {
    let finnalyResult;

    try {
      // console.log("Menu Model param: %o | id: ", param, param.id)
      const { id /* , auth */, attributes } = param;
      let whereFilter = { id: id };

      whereFilter = { ...whereFilter, ...{ status: true } };

      let whereFilterUrlSlugs = {
        $and: sequelize.literal(
          "EXISTS (select id from categories_urlSlugs as t where t.urlSlug='" +
            id +
            "' and t.categoriesId=categories.id)"
        )
      };

      whereFilterUrlSlugs = { ...whereFilterUrlSlugs, ...{ status: true } };

      // let whereTemplate = { id: resultSites && resultSites.templatesId ? resultSites.templatesId : -1 };
      const att = filterHelpers.atrributesHelper(attributes);

      //  console.log('whereFilter', Number.isInteger(Number(id)));
      if (Number.isInteger(Number(id))) {
        const resultCategories = await Model.findOne(categories, {
          where: whereFilter,
          attributes: ['sitesId']
        });

        if (resultCategories) {
          const resultSites = await MODEL.findOne(sites, {
            where: { id: resultCategories.sitesId },
            attributes: ['templatesId']
          });
          const whereTemplate = { id: resultSites && resultSites.templatesId ? resultSites.templatesId : '' };

          const result = await Model.findOne(categories, {
            where: whereFilter,
            logging: console.log,
            attributes: [
              'id',
              'name',
              'sitesId',
              'url',
              'image',
              'seoKeywords',
              'seoDescriptions',
              'isHome',
              'descriptions',
              'orderBy',
              'urlSlugs',
              'typesId',
              'orderHome',
              'parentId',
              [
                sequelize.literal(
                  'case when categories.typesId=1 then (select count(*) from article where article.categoriesId = categories.id) else (select count(*) from ecommerceProducts where ecommerceProducts .categoriesId = categories.id) end'
                ),
                'Total'
              ]
            ],
            include: [
              {
                model: categoriesTemplateLayouts,
                required: true,
                attributes: ['id', 'isHome'],
                as: 'categoriesTemplateLayout',
                include: [
                  {
                    model: templateLayouts,
                    as: 'templateLayouts',
                    // where: whereTemplateLayout,
                    attributes: ['id', 'name', 'folder'],
                    include: [
                      {
                        model: templates,
                        as: 'templates',
                        attributes: ['id', 'name', 'folder'],
                        where: whereTemplate,
                        required: false
                      }
                    ]
                  }
                ]
              },
              {
                model: categoriesUrlSlugs,
                as: 'categoriesUrlSlugs',
                required: true,
                attributes: ['id', 'urlSlug', 'status']
              }
            ]
          }).catch(err => {
            ErrorHelpers.errorThrow(err, 'getInfoError', 'CategoriesService');
          });

          if (!result) {
            throw new ApiErrors.BaseError({
              statusCode: 202,
              type: 'crudNotExisted'
            });
          }

          finnalyResult = result;
        } else {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'crudNotExisted'
          });
        }
      } else {
        console.log('whereFilter', whereFilter);
        const resultCategories = await Model.findOne(categories, {
          where: whereFilterUrlSlugs
        });

        console.log('resultCategories', resultCategories);
        let resultSites;

        if (resultCategories) {
          resultSites = await MODEL.findOne(sites, {
            where: { id: resultCategories.sitesId }
          });
        }

        const whereTemplate = { id: resultSites && resultSites.templatesId ? resultSites.templatesId : '' };

        const result = await Model.findOne(categories, {
          where: whereFilterUrlSlugs,
          logging: console.log,
          attributes: [
            'id',
            'name',
            'sitesId',
            'url',
            'image',
            'seoKeywords',
            'seoDescriptions',
            'isHome',
            'descriptions',
            'orderBy',
            'urlSlugs',
            'typesId',
            'orderHome',
            'parentId',
            [
              sequelize.literal(
                'case when categories.typesId=1 then (select count(*) from article where article.categoriesId = categories.id) else (select count(*) from ecommerceProducts where ecommerceProducts .categoriesId = categories.id) end'
              ),
              'Total'
            ]
          ],
          include: [
            {
              model: categoriesTemplateLayouts,
              required: true,
              attributes: ['id', 'isHome'],
              as: 'categoriesTemplateLayout',
              include: [
                {
                  model: templateLayouts,
                  as: 'templateLayouts',
                  // where: whereTemplateLayout,
                  attributes: ['id', 'name', 'folder'],
                  include: [
                    {
                      model: templates,
                      as: 'templates',
                      attributes: ['id', 'name', 'folder'],
                      required: false,
                      where: whereTemplate
                    }
                  ]
                }
              ]
            },
            {
              model: categoriesUrlSlugs,
              as: 'categoriesUrlSlugs',
              required: true,
              attributes: ['id', 'urlSlug', 'status']
            }
          ]
        }).catch(err => {
          ErrorHelpers.errorThrow(err, 'getInfoError', 'CategoriesService');
        });

        if (!result) {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'crudNotExisted'
          });
        }

        finnalyResult = result;
      }
    } catch (err) {
      ErrorHelpers.errorThrow(err, 'getInfoError', 'CategoriesService');
    }

    return finnalyResult;
  },
  find_list_parent_child: async param => {
    let finnalyResult;
    const { filter, range, sort /* , auth */ } = param;
    let whereSite = _.pick(filter, ['sitesId']);
    const perPage = range[1] - range[0] + 1;
    const page = Math.floor(range[0] / perPage);
    const filterStatus = _.pick(filter, ['status']);
    let whereFilter = _.omit(filter, ['urlSlugs', 'id']);
    let whereFilterurlSlugs = _.pick(filter, ['urlSlugs']);

    console.log('whereFilterurlSlugs.', whereFilterurlSlugs);
    const Filtercategories = _.pick(filter, ['id']);
    let whereCategories;
    let whereAnd = [];

    if (Filtercategories.id) {
      whereCategories = {
        $and: sequelize.literal(
          '(categories.id=' + Filtercategories.id + ' or categories.parentId=' + Filtercategories.id + ')'
        )
      };
      whereAnd.push(whereCategories);
    }

    if (_.pick(filter, ['urlSlugs']).urlSlugs) {
      whereFilterurlSlugs = {
        $and: sequelize.literal(
          "EXISTS (select id from categories_urlSlugs as t where t.urlSlug='" +
            _.pick(filter, ['urlSlugs']).urlSlugs +
            "' and (t.categoriesId=categories.id or t.categoriesId=categories.parentId)) "
        )
      };
      whereAnd.push(whereFilterurlSlugs);
    }
    // console.log(filter);
    try {
      whereFilter = await filterHelpers.combineFromDateWithToDate(whereFilter);
    } catch (error) {
      throw error;
    }

    whereFilter = await filterHelpers.makeStringFilterRelatively(['name'], whereFilter, 'categories');

    whereFilter = { ...whereFilter, ...{ $and: whereAnd } };

    whereSite = lodashHelpers.rename(whereSite, [['sitesId', 'id']]);
    const resultSites = await MODEL.findOne(sites, {
      where: whereSite
    });
    const whereTemplate = { id: resultSites && resultSites.templatesId ? resultSites.templatesId : '' };

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
      await filterHelpers.makeTreeArrayChildSearch(resultSearch, arrTreeSearchId, categories, filterStatus);
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

    console.log('whereFilter=====', whereFilter);
    try {
      const result = await Model.findAndCountAll(categories, {
        where: whereFilter,
        order: sort,
        logging: console.log,
        attributes: [
          'id',
          'name',
          'sitesId',
          'url',
          'image',
          'parentId',
          'status',
          'seoKeywords',
          'seoDescriptions',
          'isHome',
          'descriptions',
          'orderBy',
          'urlSlugs',
          'typesId',
          'orderHome',
          [
            sequelize.literal(
              'case when categories.typesId=1 then (select count(*) from article where article.categoriesId = categories.id and article.status=1) else (select count(*) from ecommerceProducts where ecommerceProducts .categoriesId = categories.id and ecommerceProducts .status=1) end'
            ),
            'Total'
          ]
        ],
        include: [
          {
            model: categoriesTemplateLayouts,
            required: true,
            attributes: ['id', 'isHome'],
            as: 'categoriesTemplateLayout',
            include: [
              {
                model: templateLayouts,
                as: 'templateLayouts',
                // where: whereTemplateLayout,
                attributes: ['id', 'name', 'folder'],
                include: [
                  {
                    model: templates,
                    as: 'templates',
                    attributes: ['id', 'name', 'folder'],
                    required: false,
                    where: whereTemplate
                  }
                ]
              }
            ]
          },
          {
            model: categoriesUrlSlugs,
            as: 'categoriesUrlSlugs',
            required: true,
            attributes: ['id', 'urlSlug', 'status']
          }
        ]
      }).catch(error => {
        throw error;
      });
      //  console.log("result",result)

      if (result) {
        const dataTree = makeTreeArray(result.rows, { id: 0 }, []);
        let tree = dataTree.tree;
        const arrTreeId = dataTree.arrTreeId;

        console.log('arrTreeId: ', arrTreeId);
        if (arrTreeId.length > 0) {
          const newResult = result.rows.filter(item => {
            // console.log("arrTreeId.indexOf(item.id): ", arrTreeId.indexOf(item.id))
            if (arrTreeId.indexOf(item.id) === -1) {
              return item;
            }
          });

          console.log('newResult', newResult);
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
      ErrorHelpers.errorThrow(error, 'getListError', 'CategoryService');
    }

    return finnalyResult;
  },
  find_getbycategories_parentChild: async param => {
    let finnalyResult;
    const { filter, sort /* , auth */ } = param;
    let whereSite = _.pick(filter, ['sitesId']);
    const whereCategoriesTree = _.pick(filter, ['status']);
    let whereFilter = filter;

    console.log({
      whereFilter
    });
    try {
      whereFilter = await filterHelpers.combineFromDateWithToDate(whereFilter);
    } catch (error) {
      throw error;
    }
    const resultGetOne = await Model.findOne(categories, {
      where: whereFilter,
      // attributes:['id','parentId'],
      order: sort
    }).catch(error => {
      throw error;
    });

    console.log('resultGetOne: ', resultGetOne);

    filterHelpers.makeStringFilterRelatively(['name'], whereFilter);

    console.log('whereFilter: ', whereFilter);
    // { "SiteId": { $not: 3 } }
    whereSite = lodashHelpers.rename(whereSite, [['sitesId', 'id']]);
    const resultSites = await MODEL.findOne(sites, {
      where: whereSite
    });
    const whereTemplate = { id: resultSites && resultSites.templatesId ? resultSites.templatesId : '' };

    console.log('whereTemplate', whereTemplate);

    try {
      const arrTreeSearchId = typeof arrTreeId !== 'undefined' ? arrTreeSearchId : [];
      const resultSearch = await Model.findAndCountAll(categories, {
        where: whereFilter,
        // attributes:['id','parentId'],
        order: sort
      }).catch(error => {
        throw error;
      });

      console.log('resultSearch.rows', resultSearch.rows);
      await filterHelpers.makeTreeArrayParentSearch(
        resultSearch.rows,
        arrTreeSearchId,
        categories,
        whereCategoriesTree
      );
      console.log('arrTreeSearchId', arrTreeSearchId);
      const result = await Model.findAndCountAll(categories, {
        where: {
          id: {
            $in: arrTreeSearchId
          }
        },
        order: sort,
        attributes: [
          'id',
          'name',
          'sitesId',
          'url',
          'image',
          'parentId',
          'status',
          [
            sequelize.literal(
              'case when categories.typesId=1 then (select count(*) from article where article.categoriesId = categories.id) else (select count(*) from ecommerceProducts where ecommerceProducts .categoriesId = categories.id) end'
            ),
            'Total'
          ]
        ],
        include: [
          // {
          //   model: categoriesTemplateLayouts,
          //   required: true,
          //   attributes: ['id','isHome'],
          //   as: 'categoriesTemplateLayout',
          //   include: [
          //     {
          //       model: templateLayouts,
          //       as: 'templateLayouts',
          //       // where: whereTemplateLayout,
          //       attributes: ['id','name','folder'],
          //       include: [
          //         { model: templates, as: 'templates',  attributes: ['id','name','folder'],
          //         required: false, where: whereTemplate }
          //       ]
          //     }
          //   ]
          // },
          {
            model: categoriesUrlSlugs,
            as: 'categoriesUrlSlugs',
            required: true,
            attributes: ['id', 'urlSlug', 'status']
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
        finnalyResult = { rows: tree, count: result.count, page: 1, perPage: result.count };
      }
    } catch (error) {
      ErrorHelpers.errorThrow(error, 'getListError', 'CategoryService');
    }

    return finnalyResult;
  }
};
