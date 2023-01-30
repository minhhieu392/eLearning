import Model from '../../models/models';
import models from '../../entity/index';
import _ from 'lodash';
import * as ApiErrors from '../../errors';
import ErrorHelpers from '../../helpers/errorHelpers';
import filterHelpers from '../../helpers/filterHelpers';
import lodashHelpers from '../../helpers/lodashHelpers';

const { /* sequelize, */article, sequelize, articlesUrlSlugs, languages, categories, users, sites, places, categoriesTemplateLayouts, templateLayouts, /* groupPlaces */ } = models;

export default {
  get_list: async param => {
    let finnalyResult;

    try {
      const { filter, range, sort/* , auth */, attributes } = param;
      console.log("filter=====", filter);
      let whereFilter = _.omit(filter, ['sitesId', 'categoriesId', 'urlSlugs']);
      let whereFilterurlSlugs;
      let whereCategoryIdFilter = _.pick(filter, ['categoriesId', 'sitesId']);
      console.log("whereCategoryIdFilter=====", whereCategoryIdFilter);
      whereCategoryIdFilter = lodashHelpers.rename(whereCategoryIdFilter, [['categoriesId', 'id']])

      const whereCategory = _.pick(filter, ['sitesId']);

      whereFilter = { ...whereFilter, ...{ status: true } }
      console.log("whereFilter=====", whereFilter);
      try {
        whereFilter = await filterHelpers.combineFromDateWithToDate(whereFilter);
      } catch (error) {
        throw error;
      }

      const perPage = (range[1] - range[0]) + 1
      const page = Math.floor(range[0] / perPage);

      whereFilter = await filterHelpers.makeStringFilterRelatively(['title', 'shortDescription', 'description', 'tag', 'seoKeywords', 'seoDescriptions'], whereFilter,'article');

      /* if (!whereFilter) {
        whereFilter = { ...filter }
      }*/
      if (_.pick(filter, ['urlSlugs']).urlSlugs) {
        whereFilterurlSlugs = { "$and": sequelize.literal("EXISTS (select id from articles_urlSlugs as t where t.urlSlug='" + _.pick(filter, ['urlSlugs']).urlSlugs + "' and t.articlesId=article.id)") }
        console.log("whereFilterurlSlugs", whereFilterurlSlugs)
      }

      console.log("whereCategoryIdFilter=============", whereCategoryIdFilter)

      const arrTreeSearchId = typeof arrTreeId !== 'undefined' ? arrTreeSearchId : [];

      if (!_.isEmpty(whereCategoryIdFilter)) {

        const resultSearch = await categories.findAll({
          where: whereCategoryIdFilter,
          attributes: ['id', 'name', 'parentId'],
        }).catch(error => {
          throw error;
        });

        await filterHelpers.makeTreeArrayChildSearch(resultSearch, arrTreeSearchId, categories);

        if (whereCategoryIdFilter) {
          whereFilter = {
            ...whereFilter,
            ...{
              categoriesId: {
                $in: arrTreeSearchId
              }
            }
          }
        }
      }
      else {
        if (whereCategoryIdFilter) {
          whereFilter = {
            ...whereFilter
          }
        }
      }

      if (whereFilterurlSlugs) {
        whereFilter = { ...whereFilter, ...whereFilterurlSlugs }
      }
      console.log('where', whereFilter);
      console.log('whereCategoryIdFilter', whereCategoryIdFilter);
      console.log('whereCategory', whereCategory);
      // if(whereFilterurlSlugs)
      // {
      //   whereFilter = {...whereFilter,...whereFilterurlSlugs.urlSlugs  }
      // }
      const att = filterHelpers.atrributesHelper(attributes);


      console.log("att==",att);
      const result = await Model.findAndCountAll(article,{
        where: whereFilter,
        order: sort,
        offset: range[0],
        limit: perPage,
        attributes: att,
        distinct: true,
        logging: console.log,
        include: [
          {
            model: categories,
            required: true,
            as: 'categories',
            where: whereCategory,
            include: [
              {
                model: sites,
                required: true,
                as: 'sites',
                // include: [
                //   {
                //     model: places,
                //     required : true,
                //     as: 'places'
                //   }
                // ]
              },
              {
                model: languages,
                as: 'languages',
                attributes: ['id','languageName','languageCode']
              },
              {
                model: categoriesTemplateLayouts,
                // required : true,
                as: 'categoriesTemplateLayout',
                include:
                  [
                    {
                      model: templateLayouts,
                      as: 'templateLayouts',
                      attributes: ['id', 'name', 'folder'],
                    }
                  ]
              }
            ]
          },
          // {
          //   model: users,
          //   as: 'usersCreator',
          //   required : true,
          //   attributes: ['id','fullname'],
          // },
          {
            model: articlesUrlSlugs,
            as: 'articlesUrlSlugs',
            // required : true,
            attributes: ['id', 'urlSlug', 'status'],
          }
        ]
      }).catch(err => {
        ErrorHelpers.errorThrow(err, 'getListError', 'ArticleService');
      })

      finnalyResult = {
        ...result,
        page: page + 1,
        perPage
      }
    } catch (err) {
      ErrorHelpers.errorThrow(err, 'getListError', 'ArticleService');
    }

    return finnalyResult;
  },
  get_one: async param => {
    let finnalyResult;

    try {
      // console.log("Menu Model param: %o | id: ", param, param.id)
      const { id/* , auth  */, attributes } = param
      let whereFilter = { id: id };

      whereFilter = { ...whereFilter, ...{ status: true } }

      let whereFilterUrlSlugs = { "$and": sequelize.literal("EXISTS (select id from articles_urlSlugs as t where t.urlSlug='" + id + "' and t.articlesId=article.id)") };

      whereFilterUrlSlugs = { ...whereFilterUrlSlugs, ...{ status: true } }
      const att = filterHelpers.atrributesHelper(attributes, ['usersCreatorId']);

      if (Number.isInteger(Number(id))) {
        const result = await Model.findOne(article,{
          where: whereFilter,
          attributes: att,
          include: [
            {
              model: categories,
              as: 'categories',
              required: true,
              include: [
                // {
                //   model: sites,
                //   as: 'sites',
                //   required : true,
                //   include: [
                //     {
                //       model: places,
                //       required : true,
                //       as: 'places'
                //     }
                //   ]
                // },
                {
                  model: categoriesTemplateLayouts,
                  required: true,
                  as: 'categoriesTemplateLayout',
                  include:
                    [
                      {
                        model: templateLayouts,
                        as: 'templateLayouts',
                        attributes: ['id', 'name', 'folder'],
                      }
                    ]
                }
              ]
            },
            // {
            //   model: users,
            //   as: 'usersCreator',
            //   required : true,
            //   attributes: ['id','fullname'],
            // },
            {
              model: articlesUrlSlugs,
              as: 'articlesUrlSlugs',
              // required : true,
              attributes: ['id', 'urlSlug', 'status'],
            }
          ]
        }).catch(err => {
          ErrorHelpers.errorThrow(err, 'getInfoError', 'ArticleService')
        });

        if (!result) {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'crudNotExisted',
          });
        }

        finnalyResult = result;
      }
      else {
        const result = await Model.findOne(article,{
          where: whereFilterUrlSlugs,
          include: [
            {
              model: categories,
              as: 'categories',
              required: true,
              include: [
                // {
                //   model: sites,
                //   as: 'sites',
                //   required : true,
                //   include: [
                //     {
                //       model: places,
                //       required : true,
                //       as: 'places'
                //     }
                //   ]
                // },
                {
                  model: categoriesTemplateLayouts,
                  required: true,
                  as: 'categoriesTemplateLayout',
                  include:
                    [
                      {
                        model: templateLayouts,
                        as: 'templateLayouts',
                        attributes: ['id', 'name', 'folder'],
                      }
                    ]
                }
              ]
            },
            // {
            //   model: users,
            //   as: 'usersCreator',
            //   required : true,
            //   attributes: ['id','fullname'],
            // },
            {
              model: articlesUrlSlugs,
              as: 'articlesUrlSlugs',
              // required : true,
              attributes: ['id', 'urlSlug', 'status'],
            }
          ]
        }).catch(err => {
          ErrorHelpers.errorThrow(err, 'getInfoError', 'ArticleService')
        });

        if (!result) {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'crudNotExisted',
          });
        }

        finnalyResult = result;
      }
    } catch (err) {
      ErrorHelpers.errorThrow(err, 'getInfoError', 'ArticleService')
    }

    return finnalyResult
  },
 
}
