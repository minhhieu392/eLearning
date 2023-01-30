// import moment from 'moment'
import Model from '../../models/models';
// import placeModel from '../models/places'
import models from '../../entity/index';
import _ from 'lodash';
// import errorCode from '../utils/errorCode';
import * as ApiErrors from '../../errors';
import ErrorHelpers from '../../helpers/errorHelpers';
import filterHelpers from '../../helpers/filterHelpers';
import preCheckHelpers, { TYPE_CHECK } from '../../helpers/preCheckHelpers';
import lodashHelpers from '../../helpers/lodashHelpers';
import { Op } from '../../db/db';
const {
  /* sequelize, Op, */ users,
  productsCatalog,
  sites,
  ecommerceProducts,
  categories,
  article,
  places,
  languages
} = models;

export default {
  get_list: async param => {
    let finnalyResult;

    try {
      const { filter, sort /* , auth */, range, attributes } = param;

      const perPage = range[1] - range[0] + 1;
      const page = Math.floor(range[0] / perPage);

      let whereFilter = filter;
      console.log('whereFilter', whereFilter);

      let whereSite = _.pick(whereFilter, ['sitesId']);

      whereSite = lodashHelpers.rename(whereSite, [['sitesId', 'id']]);

      console.log(whereSite);
      const att = filterHelpers.atrributesHelper(attributes);

      delete whereFilter['sitesId'];

      try {
        whereFilter = filterHelpers.combineFromDateWithToDate(whereFilter);
      } catch (error) {
        throw error;
      }
      whereFilter = await filterHelpers.makeStringFilterRelatively(
        ['name', 'description'],
        whereFilter,
        'productsCatalog'
      );

      if (!whereFilter) {
        whereFilter = { ...filter };
      }

      const result = await Model.findAndCountAll(productsCatalog, {
        where: whereFilter,
        order: sort,
        offset: range[0],
        limit: perPage,
        distinct: true,
        attributes: att,
        logging: true,
        include: [
          { model: users, as: 'usersCreator', attributes: ['id', 'username', 'fullname'] },
          {
            model: languages,
            as: 'languages',
            attributes: ['id', 'languageName', 'languageCode', 'icon']
          },
          {
            model: categories,
            as: 'categories',
            attributes: ['id', 'name', 'image', 'sitesId', 'orderBy', 'parentId'],
            required: true,
            include: {
              model: sites,
              as: 'sites',
              attributes: ['id', 'name'],
              where: { ...whereSite },
              required: true
            }
          }
        ]
      }).catch(err => {
        ErrorHelpers.errorThrow(err, 'getListError', 'productsCatalogervice');
      });

      finnalyResult = {
        ...result,
        page: page + 1,
        perPage
      };
    } catch (err) {
      ErrorHelpers.errorThrow(err, 'getListError', 'productsCatalogervice');
    }

    return finnalyResult;
  },
  get_one: async param => {
    let finnalyResult;

    try {
      const { id /* , auth */, attributes } = param;
      const att = filterHelpers.atrributesHelper(attributes);

      const whereFilter = { id: id };

      let catalog = await Model.findOne(productsCatalog, {
        where: whereFilter,
        attributes: att,
        include: [
          { model: users, as: 'usersCreator', attributes: ['id', 'username', 'fullname'] },
          {
            model: languages,
            as: 'languages',
            attributes: ['id', 'languageName', 'languageCode', 'icon']
          },
          {
            model: categories,
            as: 'categories',
            attributes: ['id', 'name', 'image', 'sitesId', 'orderBy', 'parentId', 'typesId'],

            include: {
              model: sites,
              as: 'sites',
              attributes: ['id', 'name']
            }
          }
        ]
      }).catch(err => {
        ErrorHelpers.errorThrow(err, 'getListError', 'productsCatalogervice');
      });

      if (!catalog) {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudNotExisted'
        });
      }
      console.log(catalog.categories);
      let whereProduct = catalog.listId;

      if (Number(catalog.categories.typesId) === 2) {
        const products = await Model.findAll(ecommerceProducts, {
          where: {
            id: { [Op.in]: whereProduct || [] }
          },
          distinct: true,
          offset: 0,
          attributes: ['id', 'name', 'shortDescription', 'images', 'price', 'dealPrice']
        }).catch(err => {
          console.log(err);
        });

        finnalyResult = { result: { catalog, products } };
      } else if (Number(catalog.categories.typesId) === 1) {
        const articles = await Model.findAll(article, {
          where: {
            id: { [Op.in]: whereProduct || [] }
            // categoriesId: catalog.categoriesId
          },
          offset: 0,
          distinct: true
        }).catch(err => {
          console.log(err);
        });

        finnalyResult = { result: { catalog, articles } };
      }
    } catch (err) {
      ErrorHelpers.errorThrow(err, 'getInfoError', 'productsCatalogervice');
    }

    return finnalyResult;
  },
  create: async param => {
    let finnalyResult;

    try {
      const { entity /* , auth  */ } = param;
      let productsCatalogEntity = _.pick(entity, [
        'name',
        'categoriesId',
        'usersCreatorId',
        'listId',
        'status',
        'description'
      ]);
      const site = await Model.findOne(categories, {
        where: {
          id: Number(entity.categoriesId)
          // status: productsCatalogEntity.status || true
        }
      }).catch(err => {
        ErrorHelpers.errorThrow(err, 'getListError', 'productsCatalogervice');
      });
      // console.log(' create: ', productsCatalogEntity);

      if (!site) {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'getInfoError',
          message: 'Site không tồn tại với categories ID'
        });
      }

      const catagoriesID = await Model.findAll(categories, {
        where: {
          sitesId: Number(site.sitesId)
          // status: productsCatalogEntity.status || true
        }
      }).catch(err => {
        ErrorHelpers.errorThrow(err, 'getListError', 'productsCatalogervice');
      });

      let arr = [];

      await catagoriesID.forEach(e => {
        arr.push(e.id);
      });

      console.log('d', arr);
      let whereFilter = {
        name: entity.name,
        categoriesId: { [Op.in]: arr || [] }
      };

      whereFilter = await filterHelpers.makeStringFilterAbsolutely(['name'], whereFilter, 'productsCatalog');
      const dupProduct = await Model.findOne(productsCatalog, {
        where: whereFilter
      }).catch(err => {
        ErrorHelpers.errorThrow(err, 'getListError', 'productsCatalogervice');
      });

      if (dupProduct) {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'getInfoError',
          message: 'Tên danh mục trong cùng site bị trùng'
        });
      }

      const catalogs = await Model.findAndCountAll(productsCatalog, {
        distinct: true,
        include: [
          { model: users, as: 'usersCreator', attributes: [] },
          {
            model: categories,
            as: 'categories',
            attributes: ['id', 'name', 'image', 'sitesId', 'orderBy', 'parentId', 'typesId'],
            where: { id: productsCatalogEntity.categoriesId },
            include: {
              model: sites,
              as: 'sites',
              attributes: ['id', 'name'],
              required: true
            }
          }
        ]
      }).catch(err => {
        ErrorHelpers.errorThrow(err, 'getListError', 'productsCatalogervice');
      });

      await productsCatalogEntity.listId.map(e => {
        return Number(e);
      });

      productsCatalogEntity.orderBy = Number(catalogs.count) + 1;

      console.log({ productsCatalogEntity });

      finnalyResult = await Model.create(productsCatalog, productsCatalogEntity).catch(error => {
        console.log('error', error);
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudError',
          error
        });
      });

      if (!finnalyResult) {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudInfo'
        });
      }
    } catch (error) {
      ErrorHelpers.errorThrow(error, 'crudError', 'productsCatalogervice');
    }

    return { result: finnalyResult };
  },
  update: async param => {
    let finnalyResult;

    try {
      const { id, entity } = param;

      console.log('productsCatalogervice update: ', entity);

      const foundproductsCatalog = await Model.findOne(productsCatalog, {
        where: {
          id: id
        }
      }).catch(error => {
        throw preCheckHelpers.createErrorCheck(
          {
            typeCheck: TYPE_CHECK.GET_INFO,
            modelStructure: { parent: 'productsCatalog' }
          },
          error
        );
      });

      if (foundproductsCatalog) {
        const site = await Model.findOne(categories, {
          where: {
            id: entity.catagoriesId ? Number(entity.catagoriesId) : Number(foundproductsCatalog.categoriesId)
            // status: productsCatalogEntity.status || true
          }
        }).catch(err => {
          ErrorHelpers.errorThrow(err, 'getListError', 'productsCatalogervice');
        });
        // console.log(' create: ', productsCatalogEntity);

        if (!site) {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'getInfoError',
            message: 'Site không tồn tại với categories ID hoặc không tồn tại Site'
          });
        }

        const catagoriesID = await Model.findAll(categories, {
          where: {
            sitesId: Number(site.sitesId)
            // status: productsCatalogEntity.status || true
          }
        }).catch(err => {
          ErrorHelpers.errorThrow(err, 'getListError', 'productsCatalogervice');
        });

        let arr = [];

        await catagoriesID.forEach(e => {
          arr.push(e.id);
        });

        console.log('d', arr);
        let whereFilter = {
          name: entity.name ? entity.name : null,
          categoriesId: { [Op.in]: arr || [] },
          id: { [Op.not]: foundproductsCatalog.id }
        };

        whereFilter = await filterHelpers.makeStringFilterAbsolutely(['name'], whereFilter, 'productsCatalog');
        const dupProduct = await Model.findOne(productsCatalog, {
          where: whereFilter
        }).catch(err => {
          ErrorHelpers.errorThrow(err, 'getListError', 'productsCatalogervice');
        });

        if (dupProduct) {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'getInfoError',
            message: 'Tên danh mục trong cùng site bị trùng'
          });
        }

        await Model.update(productsCatalog, entity, { where: { id: Number(id) } }).catch(error => {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'crudError',
            error
          });
        });

        finnalyResult = await Model.findOne(productsCatalog, { where: { Id: id } }).catch(error => {
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
      ErrorHelpers.errorThrow(error, 'crudError', 'productsCatalogervice');
    }

    return { result: finnalyResult };
  },
  // delete: async param => {
  //     try {
  //         console.log('delete id', param.id);

  //         const foundMedGroupCustomer = await medGroupCustomerModel.findOne({
  //             where: {
  //                 "id": param.id
  //             }
  //         }).catch((error) => {
  //             throw new ApiErrors.BaseError({
  //                 statusCode: 202,
  //                 type: 'getInfoError',
  //                 error
  //             })
  //         });

  //         if (!foundMedGroupCustomer) {
  //             throw new ApiErrors.BaseError({
  //                 statusCode: 202,
  //                 type: 'crudNotExisted',
  //             });
  //         } else {
  //             await medGroupCustomerModel.destroy(
  //                 { where: { id: parseInt(param.id) } }
  //             );

  //             const medGroupCustomerAfterDelete = await medGroupCustomerModel.findOne({ where: { Id: param.id } })
  //                 .catch(err => {
  //                     ErrorHelpers.errorThrow(err, 'crudError', 'MedGroupCustomerService');
  //                 });

  //             if (medGroupCustomerAfterDelete) {
  //                 throw new ApiErrors.BaseError({
  //                     statusCode: 202,
  //                     type: 'deleteError',
  //                 });
  //             }
  //         }

  //     } catch (err) {
  //         ErrorHelpers.errorThrow(err, 'crudError', 'MedGroupCustomerService');
  //     }

  //     return { status: 1 };
  // },
  get_all_site: async param => {
    let finnalyResult;

    try {
      console.log('whereFilter', param);

      const { filter, sort /* , auth */, range, limitPerCatalog } = param;

      const perPage = range[1] - range[0] + 1;
      const page = Math.floor(range[0] / perPage);

      let whereFilter = filter;

      const limit = limitPerCatalog ? Number(limitPerCatalog) : 20;

      let whereSite = _.pick(whereFilter, ['sitesId']);

      whereSite = lodashHelpers.rename(whereSite, [['sitesId', 'id']]);

      console.log(whereSite);

      delete whereFilter['sitesId'];
      try {
        whereFilter = filterHelpers.combineFromDateWithToDate(whereFilter);
      } catch (error) {
        throw error;
      }
      whereFilter = await filterHelpers.makeStringFilterRelatively(
        ['name', 'description'],
        whereFilter,
        productsCatalog
      );

      if (!whereFilter) {
        whereFilter = { ...filter };
      }
      let result = [];

      console.log('whereFilter===', whereFilter);
      console.log('whereSite===', whereSite);
      result = await Model.findAndCountAll(productsCatalog, {
        where: whereFilter,
        order: sort,
        offset: page,
        limit: perPage,
        logging: true,
        include: [
          { model: users, as: 'usersCreator', attributes: ['id', 'username', 'fullname'] },
          {
            model: categories,
            as: 'categories',
            attributes: ['id', 'name', 'image', 'sitesId', 'orderBy', 'parentId', 'typesId'],
            required: true,
            include: {
              model: sites,
              as: 'sites',
              attributes: ['id', 'name'],
              required: true,
              where: { ...whereSite }
            }
          }
        ]
      })
        .catch(err => {
          ErrorHelpers.errorThrow(err, 'getListError', 'productsCatalogervice');
        })
        .then(async res => {
          let finalRes = [];
          // console.log(res.rows[0]);

          for await (const item of res.rows) {
            const whereProduct = item.listId;

            console.log('whereProduct===', whereProduct);
            if (Number(item.categories.typesId) === 2) {
              // const products = await Model.findAll(ecommerceProducts, {
              //   where: {
              //     id: { [Op.in]: whereProduct || [] },
              //     status: true,
              //   },
              //   distinct: true,
              //   offset: 0,
              //   limit: limit,
              //   attributes: ['id', 'name', 'shortDescription', 'images', 'price', 'dealPrice'],
              //   include: { model: categories, as: 'categories', attributes: ['id', 'name', 'url'] },
              //   logging: console.log
              // }).catch(err => {
              //   console.log(err);
              // })
              // let productsCategories = [];
              // products.forEach(e => {
              //   console.log(e);
              //   productsCategories.push(e.categories);
              // });
              // finalRes.push({ catalogs: item, products: products, productsCategories });
            }
          }
        })
        .catch(err => {
          ErrorHelpers.errorThrow(err, 'getListError', 'productsCatalogervice');
        })
        .then(async res => {
          let finalRes = [];
          // console.log(res.rows[0]);

          for await (const item of res.rows) {
            const whereProduct = item.listId;

            console.log('whereProduct===', whereProduct);
            if (Number(item.categories.typesId) === 2) {
              const products = await Model.findAll(ecommerceProducts, {
                where: {
                  id: { [Op.in]: whereProduct || [] },
                  status: true
                },
                distinct: true,
                offset: 0,
                limit: limit,
                attributes: [
                  'id',
                  'name',
                  'shortDescription',
                  'images',
                  'imagesSizeConversionTable',
                  'price',
                  'dealPrice'
                ],
                include: { model: categories, as: 'categories', attributes: ['id', 'name', 'url'] },
                logging: console.log
              }).catch(err => {
                console.log(err);
              });

              finalRes.push({ catalogs: item, products: products });
            } else if (Number(item.categories.typesId) === 1) {
              const articles = await Model.findAll(article, {
                where: {
                  id: { [Op.in]: whereProduct || [] },
                  status: true
                  // categoriesId: item.categoriesId
                },
                offset: 0,
                distinct: true,
                limit: limit,
                include: { model: categories, as: 'categories', attributes: ['id', 'name', 'url'] },
                logging: console.log
              }).catch(err => {
                console.log(err);
              });
              let articlesCategories = [];

              articles.forEach(e => {
                // console.log(e);
                articlesCategories.push(e.categories);
              });
              finalRes.push({ catalogs: item, articles: articles, articlesCategories });
            }
          }

          return finalRes;
        });

      // onsole.log('stop');
      // console.log('finalRes', result);

      finnalyResult = {
        result: result,
        page: page + 1,
        perPage
      };
    } catch (err) {
      ErrorHelpers.errorThrow(err, 'getListError', 'productsCatalogervice');
    }

    return finnalyResult;
  }
};
