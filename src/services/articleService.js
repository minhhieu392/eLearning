import Model from '../models/models';
import _ from 'lodash';
import models from '../entity/index';
import * as ApiErrors from '../errors';
import ErrorHelpers from '../helpers/errorHelpers';
import viMessage from '../locales/vi';
import filterHelpers from '../helpers/filterHelpers';
import preCheckHelpers, { TYPE_CHECK } from '../helpers/preCheckHelpers';

const {
  sequelize,
  articlesUrlSlugs,
  categories,
  users,
  sites,
  languages,
  article,
  provinces,
  countries /* places, groupPlaces */
} = models;

export default {
  get_list: async param => {
    let finnalyResult;
    console.log('vô đây');
    try {
      const { filter, range, sort, auth, attributes } = param;
      let whereFilter = _.omit(filter, ['sitesId', 'categoriesId', 'dataForOne', 'categoriesForOne']);
      const whereCategoryFilter = _.pick(filter, ['sitesId']);
      const whereCategoryIdFilter = _.pick(filter, ['categoriesId']);

      console.log(filter);
      console.log('vào category filter', whereCategoryFilter);
      console.log('vào category id filter', whereCategoryIdFilter);
      try {
        whereFilter = await filterHelpers.combineFromDateWithToDate(whereFilter, 'createDate', ['FromDate', 'ToDate']);
      } catch (error) {
        throw error;
      }

      const perPage = range[1] - range[0] + 1;
      const page = Math.floor(range[0] / perPage);

      whereFilter = await filterHelpers.makeStringFilterRelatively(
        ['title', 'shortDescription', 'description', 'tag', 'seoKeywords', 'seoDescriptions'],
        whereFilter,
        'article'
      );

      whereFilter = { ...whereFilter, ...whereCategoryIdFilter.categoriesId };
      console.log('where', whereFilter);

      // const { placesId, userParentId } = await filterHelpers.getInfoAuthorization(auth, { placesId: filter.placesId }, false);

      const whereSiteFilter = (filter['sitesId'] && { id: filter['sitesId'] }) || {};
      const whereUserFilter = {};

      const att = filterHelpers.atrributesHelper(attributes);

      console.log('whereFilter-------------------------', whereFilter);
      if (filter.dataForOne && filter.categoriesForOne) {
        whereFilter.categoriesId = filter.categoriesForOne;
      }
      const result = await Model.findAndCountAll(article, {
        where: whereFilter,
        // sequelize.literal("EXISTS (select id from categories as t where (t.parent_id=21 or t.id=21) and t.id =article.categories_id)")
        order: sort,
        offset: range[0],
        limit: perPage,
        subQuery: false,
        distinct: true,
        logging: console.log,
        attributes: att,
        include: [
          {
            model: categories,
            as: 'categories',
            where: { status: true, ...whereCategoryFilter },
            attributes: ['name', 'sitesId'],
            required: true,
            include: [
              {
                model: sites,
                as: 'sites',
                attributes: ['id', 'name'],
                where: { status: true, ...whereSiteFilter },
                required: true
              }
            ]
          },
          {
            model: users,
            as: 'usersCreator',
            attributes: ['username', 'fullname', 'id'],
            where: whereUserFilter,
            required: true
          }
        ]
      }).catch(err => {
        ErrorHelpers.errorThrow(err, 'getListError', 'ArticleService');
      });

      finnalyResult = {
        ...result,
        page: page + 1,
        perPage
      };
    } catch (err) {
      ErrorHelpers.errorThrow(err, 'getListError', 'ArticleService');
    }

    return finnalyResult;
  },
  get_one: async param => {
    let finnalyResult;

    try {
      // console.log("Menu Model param: %o | id: ", param, param.id)
      const { id, auth, attributes } = param;

      console.log('ok');
      let whereFilterUrlSlugs = {
        $and: sequelize.literal(
          "EXISTS (select id from articles_urlSlugs as t where t.urlSlug='" + id + "' and t.articlesId=article.id)"
        )
      };

      whereFilterUrlSlugs = { ...whereFilterUrlSlugs, ...{ status: true } };
      console.log('wherefilter', whereFilterUrlSlugs);

      const whereSiteFilter = {};
      const whereUserFilter = {};

      /* if (placesId) {
        whereSiteFilter['placesId'] = placesId
      }
      if (userParentId) {
        whereUserFilter["$or"] = [
          { id: { $eq: auth.userId } },
          { parentId: { $eq: userParentId } }
        ]
      }
*/
      let result;
      const att = filterHelpers.atrributesHelper(attributes, ['usersCreatorId']);

      if (Number.isInteger(Number(id))) {
        console.log('vao day');
        result = await Promise.all([
          Model.findOne(article, {
            where: { id: id },
            attributes: att,
            include: [
              {
                model: categories,
                as: 'categories',
                required: true,
                include: [
                  {
                    model: sites,
                    as: 'sites',
                    where: { ...whereSiteFilter },
                    required: true
                  }
                ]
              },
              {
                model: users,
                as: 'usersCreator',
                where: whereUserFilter,
                attributes: ['id', 'username', 'fullname'],
                required: true
              },
              {
                model: articlesUrlSlugs,
                as: 'articlesUrlSlugs',
                // required : true,
                where: {
                  status: 1
                },
                attributes: ['id', 'urlSlug', 'status']
              }
            ]
          }),
          Model.findOne(article, {
            where: { id }
          })
        ]).catch(err => {
          ErrorHelpers.errorThrow(err, 'getInfoError', 'ArticleService');
        });
        console.log('result', result);
        // if (!result[1]) {
        //   throw new ApiErrors.BaseError({
        //     statusCode: 202,
        //     type: 'crudNotExisted'
        //   });
        // }

        if (!result[0]) {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'getInfoNoPermision'
          });
        }
      } else {
        result = await Promise.all([
          Model.findOne(article, {
            where: whereFilterUrlSlugs,
            attributes: att,
            include: [
              {
                model: categories,
                as: 'categories',
                required: true,
                include: [
                  {
                    model: sites,
                    as: 'sites',
                    where: { ...whereSiteFilter },
                    required: true
                  }
                ]
              },
              {
                model: users,
                as: 'usersCreator',
                where: whereUserFilter,
                attributes: ['id', 'username', 'fullname'],
                required: true
              },
              {
                model: articlesUrlSlugs,
                as: 'articlesUrlSlugs',
                // required : true,
                where: {
                  status: 1
                },
                attributes: ['id', 'urlSlug', 'status']
              }
            ]
          }),
          Model.findOne(article, {
            where: { id }
          })
        ]).catch(err => {
          ErrorHelpers.errorThrow(err, 'getInfoError', 'ArticleService');
        });
        console.log('result', result);
        // if (!result[1]) {
        //   throw new ApiErrors.BaseError({
        //     statusCode: 202,
        //     type: 'crudNotExisted'
        //   });
        // }

        if (!result[0]) {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'getInfoNoPermision'
          });
        }
      }

      finnalyResult = result[0];
    } catch (err) {
      ErrorHelpers.errorThrow(err, 'getInfoError', 'ArticleService');
    }

    return finnalyResult;
  },
  create: async param => {
    let finnalyResult;

    try {
      const entity = param.entity;

      console.log('ArticleService create: ', entity);
      let whereFilter = {
        categoriesId: entity.categoriesId,
        title: entity.title
      };

      whereFilter = await filterHelpers.makeStringFilterAbsolutely(['title'], whereFilter, 'article');

      const infoArr = Array.from(
        await Promise.all([
          preCheckHelpers.createPromiseCheckNew(
            Model.findOne(article, {
              attributes: ['id'],
              where: whereFilter
            }),
            entity.title ? true : false,
            TYPE_CHECK.CHECK_DUPLICATE,
            { parent: 'api.article.title' }
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

      finnalyResult = await Model.create(article, param.entity).catch(error => {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudError',
          error
        });
      });
      const resultArticleSlugs = sequelize.query(
        'call sp_article_urlSlugs(:in_categoriesId,:in_articleId, :in_urlSlug)',
        {
          replacements: {
            in_categoriesId: entity.categoriesId || 0,
            in_articleId: finnalyResult.id || 0,
            in_urlSlug: entity.urlSlugs || ''
          },
          type: sequelize.QueryTypes.SELECT
        }
      );

      if (!finnalyResult) {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudInfo',
          message: viMessage['api.message.infoAfterCreateError']
        });
      }
    } catch (error) {
      ErrorHelpers.errorThrow(error, 'crudError', 'ArticleService');
    }

    return { result: finnalyResult };
  },
  update: async param => {
    let finnalyResult;

    try {
      const entity = param.entity;

      console.log('ArticleService update: ', entity);

      const foundGateway = await Model.findOne(article, {
        where: {
          id: param.id
        }
      }).catch(error => {
        throw preCheckHelpers.createErrorCheck(
          { typeCheck: TYPE_CHECK.GET_INFO, modelStructure: { parent: 'articles' } },
          error
        );
      });

      if (foundGateway) {
        let whereFilter = {
          id: { $ne: param.id },
          categoriesId: entity.categoriesId || foundGateway.categoriesId,
          title: entity.title || foundGateway.title
        };

        whereFilter = await filterHelpers.makeStringFilterAbsolutely(['title'], whereFilter, 'article');

        const infoArr = Array.from(
          await Promise.all([
            preCheckHelpers.createPromiseCheckNew(
              Model.findOne(article, {
                attributes: ['id'],
                where: whereFilter
              }),
              entity.title || entity.categoriesId ? true : false,
              TYPE_CHECK.CHECK_DUPLICATE,
              { parent: 'api.article.title' }
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

        await Model.update(article, entity, { where: { id: Number(param.id) } }).catch(error => {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'crudError',
            error
          });
        });
        if (entity.urlSlugs && entity.categoriesId) {
          const resultArticleSlugs = sequelize.query(
            'call sp_article_urlSlugs(:in_categoriesId,:in_articleId, :in_urlSlug)',
            {
              replacements: {
                in_categoriesId: entity.categoriesId || 0,
                in_articleId: param.id || 0,
                in_urlSlug: entity.urlSlugs || ''
              },
              type: sequelize.QueryTypes.SELECT
            }
          );
        }

        finnalyResult = await Model.findOne(article, { where: { Id: param.id } }).catch(error => {
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
      ErrorHelpers.errorThrow(error, 'crudError', 'ArticleService');
    }

    return { result: finnalyResult };
  },
  update_status: param =>
    new Promise((resolve, reject) => {
      try {
        console.log('block id', param.id);
        const id = param.id;
        const entity = param.entity;

        Model.findOne(article, {
          where: {
            id
          },
          logging: console.log
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
              Model.update(article, entity, {
                where: { id: id }
              })
                .then(() => {
                  // console.log("rowsUpdate: ", rowsUpdate)
                  Model.findOne(article, { where: { id: param.id } })
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
                      reject(ErrorHelpers.errorReject(err, 'crudError', 'articleServices'));
                    });
                })
                .catch(err => {
                  reject(ErrorHelpers.errorReject(err, 'crudError', 'articleServices'));
                });
            }
          })
          .catch(err => {
            reject(ErrorHelpers.errorReject(err, 'crudError', 'articleServices'));
          });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'crudError', 'articleServices'));
      }
    }),
  get_article_get: param =>
    new Promise(async (resolve, reject) => {
      try {
        const { filter, range, sort, auth } = param;
        console.log('filter2', filter, filter.isInternational);
        const perPage = range[1] - range[0] + 1;
        const page = Math.floor(range[0] / perPage) + 1;
        let arrTreeSearchId;

        if (filter.categories) {
          const resultSearch = await Model.findAll(categories, {
            where: {
              id: {
                $in: filter.categories || []
              }
            },
            attributes: ['id', 'name', 'parentId']
            // order: sort
          }).catch(error => {
            throw error;
          });

          console.log('resultSearch===', resultSearch);
          await filterHelpers.makeTreeArrayChildSearch(resultSearch, arrTreeSearchId, categories, { status: 1 });
          console.log('arrTreeSearchId===', arrTreeSearchId);
        }

        console.log('filter.categoriesProductsCatalogStatus===', filter.categoriesProductsCatalogStatus);
        let result = await sequelize.query(
          'call sp_article_get(:in_title,:in_locations,:in_status,:in_categories,:in_categoriesProductsCatalog,:in_orderby,:in_pageIndex,:in_pageSize,:in_isInternational,:in_categoriesProductsCatalogStatus,@out_rowCount);select @out_rowCount;',
          {
            replacements: {
              in_title: filter.title || '',
              in_locations: filter.locations ? JSON.stringify(filter.locations) : '{}',
              in_categories: arrTreeSearchId ? JSON.stringify(arrTreeSearchId) : '[]',
              in_status: filter.status || -99,
              in_categoriesProductsCatalog: filter.productsCatalogCategoriesId || 0,
              in_orderby: sort || 'id desc',
              in_pageIndex: page,
              in_pageSize: perPage,
              in_isInternational: filter.isInternational || -99,
              in_categoriesProductsCatalogStatus: filter.categoriesProductsCatalogStatus || -99
            },
            type: sequelize.QueryTypes.SELECT
          }
        );

        delete result[0].meta;
        // console.log("result===",result)
        const rows = Object.values(result[0]);

        result = result.map(e => e['0']);

        // console.log("rows===",rows)
        const outOutput = result[2]['@out_rowCount'];

        resolve({
          rows,
          page: page,
          perPage,
          count: outOutput
        });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'getListError', 'ArticleService'));
      }
    }),
  get_one_byId: async param => {
    let finnalyResult;

    try {
      const { id } = param;

      const result = await sequelize.query('call sp_article_get_Byid(:in_id);', {
        replacements: {
          in_id: id || 0
        },
        type: sequelize.QueryTypes.SELECT
      });
      console.log('result===', result);

      delete result[0].meta;
      const rows = Object.values(result[0]);
      console.log('rows===', rows);
      finnalyResult = rows[0];
      if (!finnalyResult) {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudNotExisted'
        });
      }
    } catch (err) {
      ErrorHelpers.errorThrow(err, 'getInfoError', 'ArticleService');
    }
    console.log('finnalyResult===', finnalyResult);

    return finnalyResult || {};
  }
};
