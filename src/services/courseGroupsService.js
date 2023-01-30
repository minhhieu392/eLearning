/* eslint-disable camelcase */
/* eslint-disable no-await-in-loop */
// import moment from 'moment'
import MODELS from '../models/models';
import models from '../entity/index';
import _ from 'lodash';
import * as ApiErrors from '../errors';
import ErrorHelpers from '../helpers/errorHelpers';
import filterHelpers from '../helpers/filterHelpers';
import preCheckHelpers, { TYPE_CHECK } from '../helpers/preCheckHelpers';
import moment from 'moment';

const {
  sequelize,
  users,
  courseGroups,
  courseLevels,
  courses /* tblGatewayEntity, Roles */,
  purchasedCourseGroups,
  courseTypes,
  usersBookmarks,
  usersCourseGroups,
  courseGroupsPackages,
  services,
  usersServices
} = models;

export default {
  get_list: param =>
    new Promise(async (resolve, reject) => {
      try {
        const { filter, range, sort, attributes } = param;

        console.log('filter', filter);
        let whereFilter = _.omit(filter, [
          'usersId',
          'bookmark',
          'purchasedUsersId',
          'purchased',
          'viewCompleted',
          'questionCompleted',
          'FromMoney',
          'ToMoney',
          'courseGroupsPackagesStatus'
        ]);
        let att = filterHelpers.atrributesHelper(attributes);

        try {
          whereFilter = filterHelpers.combineFromDateWithToDate(whereFilter);
        } catch (error) {
          reject(error);
        }
        let parseResult = false;

        att =
          att && att.length > 0
            ? att
            : [
                'id',
                'courseGroupsName',
                'image',
                'courseGroupsCode',
                'type',
                'descriptions',
                'countUsers',
                'money',
                'userCreatorsId',
                'status',
                'dateCreated',
                'dateUpdated',
                'courseTypesId',
                'countCourseLevels',
                'level',
                'age'
              ];
        const findIndexDetail = att.findIndex(e => e === 'detailInfo');

        if (findIndexDetail > 0) {
          att[findIndexDetail] = [sequelize.literal('fn_get_courseGroups_detail(courseGroups.id)  '), 'detailInfo'];
          parseResult = true;
        }

        const findIndexUsersDetailInfo = att.findIndex(e => e === 'usersDetailInfo');

        if (findIndexUsersDetailInfo > 0) {
          if (Number(filter.usersId) > 0) {
            att[findIndexUsersDetailInfo] = [
              sequelize.literal(`fn_get_courseGroups_users_detail(courseGroups.id,${filter.usersId})  `),
              'usersDetailInfo'
            ];
            parseResult = true;
          } else {
            att.splice(findIndexUsersDetailInfo, 1);
          }
        }

        console.log('attt', att);
        const include = [];

        if (Number(filter.usersId) > 0) {
          include.push({
            model: usersBookmarks,
            as: 'bookmark',
            required: Number(filter.bookmark) === 1 ? true : false,
            attributes: ['id'],
            where: {
              usersId: filter.usersId
            }
          });
        }

        if (Number(filter.purchasedUsersId) > 0) {
          const where = { usersId: filter.purchasedUsersId };

          if (Number(filter.purchased) === 1) {
            where['$and'] = sequelize.literal(`(isnull(expiredDate) or expiredDate >= current_date())`);
          }

          include.push({
            model: usersCourseGroups,
            as: 'purchased',
            required: Number(filter.purchased) === 1 ? true : false,
            attributes: ['id', 'expiredDate', [sequelize.literal('1'), 'status']],
            where: where
          });
        }
        const perPage = range[1] - range[0] + 1;
        const page = Math.floor(range[0] / perPage);

        whereFilter = await filterHelpers.makeStringFilterRelatively(['courseGroupsName'], whereFilter, 'courseGroups');

        if (Number(filter.viewCompleted) === 1 && Number(filter.usersId) > 0) {
          whereFilter[`$and`] = sequelize.literal(`
               JSON_EXTRACT(fn_get_courseGroups_detail(courseGroups.id), '$.countCourses')=JSON_EXTRACT(fn_get_courseGroups_users_detail(courseGroups.id, ${filter.usersId}), '$.countCompleteCourses')
          `);
        }
        if (Number(filter.viewCompleted) === -1 && Number(filter.usersId) > 0) {
          whereFilter[`$and`] = sequelize.literal(`
               JSON_EXTRACT(fn_get_courseGroups_detail(courseGroups.id), '$.countCourses') <> JSON_EXTRACT(fn_get_courseGroups_users_detail(courseGroups.id, ${filter.usersId}), '$.countCompleteCourses')
          `);
        }

        const wherCourseGroupsPackages = {};

        if (Number(filter.FromMoney) > 0 && Number(filter.ToMoney) > 0) {
          wherCourseGroupsPackages.money = {
            $and: {
              $gte: filter.FromMoney,
              $lte: filter.ToMoney
            }
          };
        } else if (Number(filter.FromMoney) > 0) {
          wherCourseGroupsPackages.money = {
            $gte: filter.FromMoney
          };
        } else if (Number(filter.ToMoney) > 0) {
          wherCourseGroupsPackages.money = {
            $lte: filter.ToMoney
          };
        }

        console.log('where', whereFilter);
        console.log('att', att);

        MODELS.findAndCountAll(courseGroups, {
          where: whereFilter,
          order: sort,
          attributes: att,
          offset: range[0],
          limit: perPage,
          distinct: true,
          logging: true,
          include: [
            { model: users, as: 'userCreators', required: true, attributes: ['id', 'username', 'fullname'] },
            { model: courseTypes, as: 'courseTypes', required: true, attributes: ['id', 'courseTypesName'] },
            {
              model: courseGroupsPackages,
              as: 'courseGroupsPackages',
              required: Number(filter.courseGroupsPackagesStatus) === 1 ? true : false,
              attributes: ['id', 'courseGroupsPackagesName', 'numberOfDays', 'money', 'status', 'promotionalMoney'],
              where: { status: 1, ...wherCourseGroupsPackages }
            },
            ...include
          ]
        })
          .then(result => {
            if (parseResult) {
              result.rows = result.rows.map(e => {
                console.log('e', e.dataValues.detailInfo);
                if (e.dataValues.detailInfo) {
                  e.dataValues.detailInfo = JSON.parse(e.dataValues.detailInfo);
                }
                if (e.dataValues.usersDetailInfo)
                  e.dataValues.usersDetailInfo = JSON.parse(e.dataValues.usersDetailInfo);

                return e;
              });
            }
            resolve({
              ...result,
              page: page + 1,
              perPage
            });
          })
          .catch(err => {
            reject(ErrorHelpers.errorReject(err, 'getListError', 'courseGroupservice'));
          });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'getListError', 'courseGroupservice'));
      }
    }),

  get_one: param =>
    new Promise((resolve, reject) => {
      try {
        // console.log("Menu Model param: %o | id: ", param, param.id)
        const id = param.id;
        let att = filterHelpers.atrributesHelper(param.attributes, ['usersCreatorId']);

        console.log('param', param);
        att =
          att && att.length > 0
            ? att
            : [
                'id',
                'courseGroupsName',
                'image',
                'courseGroupsCode',
                'type',
                'descriptions',
                'countUsers',
                'money',
                'userCreatorsId',
                'status',
                'dateCreated',
                'dateUpdated',
                'courseTypesId',
                'countCourseLevels',
                'level',
                'age'
              ];
        const include = [];
        const findIndexTotalVideoLength = att.findIndex(e => e === 'detailInfo');

        if (findIndexTotalVideoLength > 0) {
          att[findIndexTotalVideoLength] = [
            sequelize.literal('fn_get_courseGroups_detail(courseGroups.id)  '),
            'detailInfo'
          ];
        }

        const findIndexUsersDetailInfo = att.findIndex(e => e === 'usersDetailInfo');

        if (findIndexUsersDetailInfo > 0) {
          if (Number(param.usersId) > 0) {
            att[findIndexUsersDetailInfo] = [
              sequelize.literal(`fn_get_courseGroups_users_detail(courseGroups.id,${param.usersId})  `),
              'usersDetailInfo'
            ];
          } else {
            att.splice(findIndexUsersDetailInfo, 1);
          }
        }
        if (Number(param.purchasedUsersId) > 0) {
          include.push({
            model: usersCourseGroups,
            as: 'purchased',
            required: false,
            attributes: ['id', 'expiredDate'],
            where: {
              usersId: param.purchasedUsersId
            }
          });
        }

        if (Number(param.usersId) > 0) {
          include.push({
            model: usersBookmarks,
            as: 'bookmark',
            required: false,
            attributes: ['id'],
            where: {
              usersId: param.usersId
            }
          });
        }

        MODELS.findOne(courseGroups, {
          where: { id: id },
          attributes: att,
          logging: true,
          order: [
            [sequelize.literal('`courseLevels`.`order`'), 'asc'],
            [sequelize.literal('`courseLevels->courses`.`order`'), 'asc']
          ],
          include: [
            ...include,
            { model: courseTypes, as: 'courseTypes', required: true, attributes: ['id', 'courseTypesName'] },
            { model: users, as: 'userCreators', required: true, attributes: ['id', 'username', 'fullname'] },
            {
              model: courseGroupsPackages,
              as: 'courseGroupsPackages',
              required: false,
              attributes: ['id', 'courseGroupsPackagesName', 'numberOfDays', 'money', 'status', 'promotionalMoney'],
              where: { status: 1 }
            },
            {
              model: courseLevels,
              as: 'courseLevels',
              required: false,
              attributes: ['id', 'courseLevelsName', 'order'],
              where: { status: 1 },
              include: [
                {
                  model: courses,
                  as: 'courses',
                  required: false,
                  attributes: ['id', 'coursesName', 'order', 'link', 'videoLength'],
                  where: { status: 1 }
                }
              ]
            }
          ]
        })
          .then(async result => {
            if (!result) {
              reject(
                new ApiErrors.BaseError({
                  statusCode: 202,
                  type: 'crudNotExisted'
                })
              );
            }

            console.log('');
            if (
              result.purchased &&
              (result.purchased.expiredDate === null || new Date(result.purchased.expiredDate) >= new Date())
            ) {
              result.purchased.dataValues.status = 1;
            } else if (param.usersId > 0) {
              const find_dang_ky_mua = await MODELS.findOne(purchasedCourseGroups, {
                where: {
                  usersId: param.usersId,
                  status: 0,
                  courseGroupsId: result.id
                },

                order: [['id', 'desc']]
              });

              if (find_dang_ky_mua) {
                result.dataValues.purchased = {
                  id: find_dang_ky_mua.id,
                  status: find_dang_ky_mua.status,
                  expiredDate: null
                };
              } else if (result.purchased && new Date(result.purchased.expiredDate) < new Date()) {
                result.purchased.dataValues.status = 1;
              }
            }

            if (
              result.purchased &&
              (Number(result.purchased?.dataValues?.status) === 1 ||
                Number(result.purchased?.status) === 1 ||
                Number(result?.dataValues.purchased?.status) === 1)
            ) {
              const find_dang_ky_dich_vu = await MODELS.findAll(usersServices, {
                attributes: [
                  `servicesId`,
                  [sequelize.literal('services.servicesName'), 'servicesName'],
                  [sequelize.literal('services.servicesCode'), 'servicesCode']
                ],
                where: {
                  courseGroupsId: result.id,
                  $and: sequelize.literal('(isnull(expiredDate) or expiredDate>=   current_date() )'),
                  usersId: param.usersId
                },
                include: [
                  {
                    model: services,
                    as: 'services',
                    required: true,
                    attributes: []
                  },
                  {
                    model: users,
                    as: 'teachers',
                    required: false,
                    attributes: ['id', 'fullname', 'mobile', 'image']
                  }
                ],
                logging: true
              });

              result.dataValues.services = find_dang_ky_dich_vu;
            }

            console.log('a', result.purchased);
            if (result.dataValues.detailInfo) result.dataValues.detailInfo = JSON.parse(result.dataValues.detailInfo);
            if (result.dataValues.usersDetailInfo)
              result.dataValues.usersDetailInfo = JSON.parse(result.dataValues.usersDetailInfo);

            resolve(result);
          })
          .catch(err => {
            reject(ErrorHelpers.errorReject(err, 'getInfoError', 'courseGroupservice'));
          });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'getInfoError', 'courseGroupservice'));
      }
    }),
  create: async param => {
    let finnalyResult;

    try {
      const entity = param.entity;

      console.log('provinceModel create: ', entity);
      let whereFilter = {
        courseGroupsName: entity.courseGroupsName
      };
      // api.courseGroups.identificationCode

      whereFilter = await filterHelpers.makeStringFilterAbsolutely(['courseGroupsName'], whereFilter, 'courseGroups');

      const infoArr = Array.from(
        await Promise.all([
          preCheckHelpers.createPromiseCheckNew(
            MODELS.findOne(courseGroups, { attributes: ['id'], where: whereFilter }),
            entity.courseGroupsName ? true : false,
            TYPE_CHECK.CHECK_DUPLICATE,
            { parent: 'api.courseGroups.courseGroupsName' }
          ),
          preCheckHelpers.createPromiseCheckNew(
            MODELS.findOne(courseGroups, {
              attributes: ['id'],
              where: {
                courseGroupsCode: entity.courseGroupsCode
              }
            }),
            entity.courseGroupsCode ? true : false,
            TYPE_CHECK.CHECK_DUPLICATE,
            { parent: 'api.courseGroups.courseGroupsCode' }
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

      if (!entity.courseGroupsCode) {
        const courseGroupsLast = await MODELS.findOne(courseGroups, {
          order: [['id', 'desc']]
        });

        entity.courseGroupsCode = `K` + String((Number(courseGroupsLast.id) || 0) + 1).padStart(4, '0');
      }

      await sequelize.transaction(async t => {
        finnalyResult = await MODELS.create(courseGroups, entity, { transaction: t }).catch(error => {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'crudError',
            error
          });
        });

        if (entity.courseGroupsPackages && entity.courseGroupsPackages.length > 0) {
          await MODELS.bulkCreate(
            courseGroupsPackages,
            entity.courseGroupsPackages.map((e, index) => {
              return {
                ..._.omit(e, ['id', 'courseGroupsId', 'code']),
                money: e.money || 0,
                courseGroupsId: finnalyResult.id,
                code: entity.courseGroupsCode + 'G' + String(index + 1).padStart(2, '0'),
                userCreatorsId: entity.userCreatorsId
              };
            }),
            { transaction: t }
          );
        }
      });
      if (!finnalyResult) {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudInfo'
        });
      }
    } catch (error) {
      console.log('err', error);
      ErrorHelpers.errorThrow(error, 'crudError', 'courseGroupservice');
    }

    return { result: finnalyResult };
  },
  update: async param => {
    let finnalyResult;

    try {
      const entity = param.entity;

      console.log('Province update: ');

      const foundProvince = await MODELS.findOne(courseGroups, {
        where: {
          id: param.id
        }
      }).catch(error => {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'getInfoError',
          message: 'Lấy thông tin của Tỉnh/Thành phố thất bại!',
          error
        });
      });

      if (foundProvince) {
        let whereFilter = {
          id: { $ne: param.id },
          courseGroupsName: entity.courseGroupsName || foundProvince.courseGroupsName
        };

        whereFilter = await filterHelpers.makeStringFilterAbsolutely(['courseGroupsName'], whereFilter, 'courseGroups');

        const infoArr = Array.from(
          await Promise.all([
            preCheckHelpers.createPromiseCheckNew(
              MODELS.findOne(courseGroups, { attributes: ['id'], where: whereFilter }),
              entity.courseGroupsName ? true : false,
              TYPE_CHECK.CHECK_DUPLICATE,
              { parent: 'api.courseGroups.courseGroupsName' }
            ),
            preCheckHelpers.createPromiseCheckNew(
              MODELS.findOne(courseGroups, {
                attributes: ['id'],
                where: {
                  id: { $ne: param.id },
                  courseGroupsCode: entity.courseGroupsCode || foundProvince.courseGroupsCode
                }
              }),
              entity.courseGroupsCode ? true : false,
              TYPE_CHECK.CHECK_DUPLICATE,
              { parent: 'api.courseGroups.courseGroupsCode' }
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

        console.log('ent', entity);
        await MODELS.update(
          courseGroups,
          { ...entity, dateUpdated: new Date() },
          { where: { id: Number(param.id) } }
        ).catch(error => {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'crudError',
            error
          });
        });
        await sequelize.transaction(async t => {
          finnalyResult = await MODELS.findOne(courseGroups, { where: { id: param.id } }, { transaction: t }).catch(
            error => {
              throw new ApiErrors.BaseError({
                statusCode: 202,
                type: 'crudInfo',
                message: 'Lấy thông tin sau khi thay đổi thất bại',
                error
              });
            }
          );

          if (!finnalyResult) {
            throw new ApiErrors.BaseError({
              statusCode: 202,
              type: 'crudInfo',
              message: 'Lấy thông tin sau khi thay đổi thất bại'
            });
          }

          if (entity.courseGroupsPackages && entity.courseGroupsPackages.length > 0) {
            for (let i = 0; i < entity.courseGroupsPackages.length; i++) {
              const courseGroupsPackagesElement = entity.courseGroupsPackages[i];

              if (courseGroupsPackagesElement.id > 0) {
                await MODELS.update(
                  courseGroupsPackages,
                  {
                    ..._.omit(courseGroupsPackagesElement, ['id']),
                    money: courseGroupsPackagesElement.money || 0
                  },
                  { where: { id: courseGroupsPackagesElement.id }, transaction: t }
                );
              } else {
                const findLastusers = await sequelize.query(
                  `select count(*) as count from courseGroupsPackages where courseGroupsId = ${foundProvince.id}`,
                  {
                    transaction: t
                  }
                );

                console.log('findLastusers', findLastusers, String((Number(findLastusers[0][0].count) || 0) + 1));
                courseGroupsPackagesElement.code =
                  finnalyResult.courseGroupsCode +
                  'G' +
                  String((Number(findLastusers[0][0].count) || 0) + 1).padStart(2, '0');

                await MODELS.create(
                  courseGroupsPackages,
                  {
                    ..._.omit(courseGroupsPackagesElement, ['id']),
                    money: courseGroupsPackagesElement.money || 0,
                    courseGroupsId: foundProvince.id,
                    userCreatorsId: foundProvince.userCreatorsId
                  },
                  { transaction: t }
                );
              }
            }
          }
        });
      } else {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudNotExisted'
        });
      }
    } catch (error) {
      ErrorHelpers.errorThrow(error, 'crudError', 'courseGroupservice');
    }

    return { result: finnalyResult };
  },
  create_purchased: async param => {
    let code;

    try {
      const { usersId, userCreatorsId, courseGroupsPackagesId } = param;

      console.log('Province update: ');

      const foundProvince = await MODELS.findOne(courseGroupsPackages, {
        where: {
          id: courseGroupsPackagesId
        },
        include: [
          {
            model: courseGroups,
            as: 'courseGroups',
            required: true,
            attributes: ['id', 'courseGroupsName']
          }
        ]
      }).catch(error => {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'getInfoError',
          message: 'Lấy thông tin khóa học thất bại',
          error
        });
      });

      const foundUsers = await MODELS.findOne(users, {
        where: {
          id: usersId
        }
      }).catch(error => {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'getInfoError',
          message: 'Lấy thông tin khóa học thất bại',
          error
        });
      });

      if (!foundProvince) {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          message: 'Không tìm thấy khóa học'
        });
      }
      if (!foundUsers) {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          message: 'Không tìm thấy học viên'
        });
      }

      code = foundUsers.usersCode + foundProvince.code;

      console.log('code', code);

      await sequelize.transaction(async t => {
        const status = foundProvince.money > 0 ? 0 : 1;

        console.log('1');

        let expiredDate = null;

        if (status === 1) {
          const findOtherPurchasedCourseGroups = await MODELS.findOne(purchasedCourseGroups, {
            where: {
              usersId: usersId,
              courseGroupsId: foundProvince.courseGroupsId,
              status: 1
            },
            transaction: t
          });

          if (findOtherPurchasedCourseGroups) {
            throw new ApiErrors.BaseError({
              statusCode: 202,
              type: 'crudError',
              message: 'bạn đã mua gói dùng thử này rồi'
            });
          }

          const findUsersCourseGroups = await MODELS.findOne(usersCourseGroups, {
            where: {
              usersId: usersId,
              courseGroupsId: foundProvince.courseGroupsId
            },
            transaction: t
          });

          if (!findUsersCourseGroups) {
            await MODELS.update(
              courseGroups,
              {
                countUsers: sequelize.literal('countUsers + 1')
              },
              {
                where: {
                  id: foundProvince.courseGroupsId
                }
              }
            ).catch(error => {
              throw new ApiErrors.BaseError({
                statusCode: 202,
                type: 'crudError',
                error
              });
            });
            if (foundProvince.numberOfDays > 0) {
              expiredDate = moment()
                .add(foundProvince.numberOfDays, 'd')
                .format('YYYY-MM-DD');
            }
            await MODELS.create(
              usersCourseGroups,
              {
                usersId: usersId,
                courseGroupsId: foundProvince.courseGroupsId,
                expiredDate: expiredDate
              },
              { transaction: t }
            );
          } else {
            if (foundProvince.numberOfDays > 0 && foundProvince.expiredDate !== null) {
              expiredDate =
                new Date(findUsersCourseGroups.expiredDate) > new Date()
                  ? moment(findUsersCourseGroups.expiredDate)
                      .add(foundProvince.numberOfDays, 'd')
                      .format('YYYY-MM-DD')
                  : moment(findUsersCourseGroups.expiredDate)
                      .add(foundProvince.numberOfDays, 'd')
                      .format('YYYY-MM-DD');
            }
            await MODELS.update(
              usersCourseGroups,
              {
                usersId: usersId,
                courseGroupsId: foundProvince.courseGroupsId,
                expiredDate: expiredDate,
                oldExpiredDate: foundProvince.expiredDate
              },
              {
                where: { id: findUsersCourseGroups.id }
              },
              { transaction: t }
            );
          }
        }

        console.log('expiredDate', expiredDate);
        await MODELS.create(
          purchasedCourseGroups,
          {
            usersId,
            courseGroupsPackagesId,
            courseGroupsId: foundProvince.courseGroupsId,
            money: foundProvince.money,
            status: status,
            code: code,
            userCreatorsId: userCreatorsId,
            expiredDate: expiredDate
          },
          { transaction: t }
        ).catch(error => {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'crudError',
            error
          });
        });
      });
    } catch (error) {
      console.log('er', error);
      ErrorHelpers.errorThrow(error, 'crudError', 'GroupSiteService');
    }

    return { success: true, code: code };
  },
  create_bookmark: async param => {
    // let finnalyResult;

    try {
      const usersId = param.usersId;
      const courseGroupsId = param.courseGroupsId;

      console.log('Province update: ');

      const foundProvince = await MODELS.findOne(courseGroups, {
        where: {
          id: param.courseGroupsId
        }
      }).catch(error => {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'getInfoError',
          message: 'Lấy thông tin của Tỉnh/Thành phố thất bại!',
          error
        });
      });

      if (foundProvince) {
        await MODELS.createOrUpdate(
          usersBookmarks,
          {
            usersId,
            courseGroupsId
          },
          { where: { usersId, courseGroupsId } }
        ).catch(error => {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'crudError',
            error
          });
        });
      } else {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudNotExisted'
        });
      }
    } catch (error) {
      ErrorHelpers.errorThrow(error, 'crudError', 'courseGroupservice');
    }

    return { success: true };
  },
  delete_purchased: async param => {
    try {
      const usersId = param.usersId;
      const courseGroupsId = param.courseGroupsId;

      console.log('Province update: ');

      const foundProvince = await MODELS.findOne(courseGroups, {
        where: {
          id: param.courseGroupsId
        }
      }).catch(error => {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'getInfoError',
          message: 'Lấy thông tin của Tỉnh/Thành phố thất bại!',
          error
        });
      });

      if (foundProvince) {
        const findpurchased = await MODELS.findOne(purchasedCourseGroups, {
          where: { usersId, courseGroupsId }
        }).catch(error => {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'crudError',
            error
          });
        });

        if (findpurchased) {
          await MODELS.destroy(purchasedCourseGroups, {
            where: {
              id: findpurchased.id
            }
          }).catch(error => {
            throw new ApiErrors.BaseError({
              statusCode: 202,
              type: 'crudError',
              error
            });
          });
          await MODELS.update(
            courseGroups,
            {
              countUsers: sequelize.literal('countUsers - 1')
            },
            {
              where: {
                id: courseGroupsId
              }
            }
          ).catch(error => {
            throw new ApiErrors.BaseError({
              statusCode: 202,
              type: 'crudError',
              error
            });
          });
        } else {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            message: 'Học viên chưa mua khóa học'
          });
        }
      } else {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudNotExisted'
        });
      }
    } catch (error) {
      ErrorHelpers.errorThrow(error, 'crudError', 'courseGroupservice');
    }

    return { success: true };
  },
  delete_bookmark: async param => {
    // let finnalyResult;

    try {
      const usersId = param.usersId;
      const courseGroupsId = param.courseGroupsId;

      console.log('Province update: ');

      const foundProvince = await MODELS.findOne(courseGroups, {
        where: {
          id: param.courseGroupsId
        }
      }).catch(error => {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'getInfoError',
          message: 'Lấy thông tin của Tỉnh/Thành phố thất bại!',
          error
        });
      });

      if (foundProvince) {
        await MODELS.destroy(usersBookmarks, { where: { usersId, courseGroupsId } }).catch(error => {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'crudError',
            error
          });
        });
      } else {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudNotExisted'
        });
      }
    } catch (error) {
      ErrorHelpers.errorThrow(error, 'crudError', 'courseGroupservice');
    }

    return { success: true };
  },
  update_status: param =>
    new Promise((resolve, reject) => {
      try {
        console.log('block id', param.id);
        const id = param.id;
        const entity = param.entity;

        MODELS.findOne(courseGroups, {
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
              MODELS.update(
                courseGroups,
                { ...entity, dateUpdated: new Date() },
                {
                  where: { id: id }
                }
              )
                .then(() => {
                  // console.log("rowsUpdate: ", rowsUpdate)
                  MODELS.findOne(courseGroups, { where: { id: param.id } })
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
                      reject(ErrorHelpers.errorReject(err, 'crudError', 'UserServices'));
                    });
                })
                .catch(err => {
                  reject(ErrorHelpers.errorReject(err, 'crudError', 'UserServices'));
                });
            }
          })
          .catch(err => {
            reject(ErrorHelpers.errorReject(err, 'crudError', 'UserServices'));
          });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'crudError', 'UserServices'));
      }
    })
};
