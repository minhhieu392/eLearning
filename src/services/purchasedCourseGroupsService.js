// import moment from 'moment'
import MODELS from '../models/models';
import models from '../entity/index';
import _ from 'lodash';
import * as ApiErrors from '../errors';
import ErrorHelpers from '../helpers/errorHelpers';
import filterHelpers from '../helpers/filterHelpers';
import moment from 'moment';
// import preCheckHelpers, { TYPE_CHECK } from '../helpers/preCheckHelpers';
import notificationsServices from '../services/notificationsServices';
const {
  sequelize,
  users,
  purchasedCourseGroups,
  courseGroups,
  usersCourseGroups,
  courseGroupsPackages,
  purchasedCourseGroupsDetails,
  usersServices,
  services /* tblGatewayEntity, Roles */
} = models;

export default {
  get_list: param =>
    new Promise(async (resolve, reject) => {
      try {
        const { filter, range, sort, attributes } = param;

        let whereFilter = _.omit(filter, [
          'usersSearch',
          'courseGroupsSearch',
          'fullname',
          'usersCode',
          'courseGroupsCode',
          'courseGroupsName',

          'servicesId'
        ]);

        const whereUsers = {};
        const whereCourseGroups = {};
        const whereServices = {};

        try {
          whereFilter = filterHelpers.combineFromDateWithToDate(whereFilter);
        } catch (error) {
          reject(error);
        }

        const perPage = range[1] - range[0] + 1;
        const page = Math.floor(range[0] / perPage);

        whereFilter = await filterHelpers.makeStringFilterRelatively(['code'], whereFilter, 'purchasedCourseGroups');

        let queryStringUsers;

        if (filter.fullname) {
          queryStringUsers = filterHelpers.makeStringFilterRelativelyVer2('fullname', filter, 'users', ['fullname']);
        }
        if (filter.usersCode) {
          queryStringUsers = filterHelpers.makeStringFilterRelativelyVer2('usersCode', filter, 'users', ['usersCode']);
        }
        if (filter.usersSearch) {
          queryStringUsers = filterHelpers.makeStringFilterRelativelyVer2('usersSearch', filter, 'users', [
            'usersCode',
            'fullname'
          ]);
        }
        if (queryStringUsers) {
          whereUsers[`$and`] = sequelize.literal(queryStringUsers);
        }

        // courseGroups

        {
          let queryStringcourseGroups;
          // tìm kiếm khóa học

          if (filter.courseGroupsName) {
            queryStringcourseGroups = filterHelpers.makeStringFilterRelativelyVer2(
              'courseGroupsName',
              filter,
              'courseGroups',
              ['courseGroupsName']
            );
          }
          if (filter.courseGroupsCode) {
            queryStringcourseGroups = filterHelpers.makeStringFilterRelativelyVer2(
              'courseGroupsCode',
              filter,
              'courseGroups',
              ['courseGroupsCode']
            );
          }
          if (filter.courseGroupsSearch) {
            queryStringcourseGroups = filterHelpers.makeStringFilterRelativelyVer2(
              'courseGroupsSearch',
              filter,
              'courseGroups',
              ['courseGroupsCode', 'courseGroupsName']
            );
          }
          if (queryStringcourseGroups) {
            whereCourseGroups[`$and`] = sequelize.literal(queryStringcourseGroups);
          }
        }

        {
          let queryStringservices;
          // tìm kiếm dịch vụ

          if (filter.servicesName) {
            queryStringservices = filterHelpers.makeStringFilterRelativelyVer2('servicesName', filter, 'services', [
              'servicesName'
            ]);
          }
          if (filter.servicesCode) {
            queryStringservices = filterHelpers.makeStringFilterRelativelyVer2('servicesCode', filter, 'services', [
              'servicesCode'
            ]);
          }
          if (filter.servicesSearch) {
            queryStringservices = filterHelpers.makeStringFilterRelativelyVer2('servicesSearch', filter, 'services', [
              'servicesCode',
              'servicesName'
            ]);
          }
          if (queryStringservices) {
            whereServices[`$and`] = sequelize.literal(queryStringservices);
          }
        }
        if (!whereFilter) {
          whereFilter = { ...filter };
        }

        let att = filterHelpers.atrributesHelper(attributes, ['usersCreatorId']);

        console.log('param', param);
        att =
          att && att.length > 0
            ? att
            : ['id', 'usersId', 'dateCreated', 'money', 'status', 'dateUpdated', 'userCreatorsId', 'code'];

        console.log('where', whereFilter);

        MODELS.findAndCountAll(purchasedCourseGroups, {
          where: whereFilter,
          order: sort,
          attributes: att,
          offset: range[0],
          limit: perPage,
          // distinct: true,
          logging: true,
          include: [
            {
              model: courseGroups,
              as: 'courseGroups',
              // required: false,
              required: _.isEmpty(whereCourseGroups) ? false : true,
              where: whereCourseGroups,
              attributes: ['id', 'courseGroupsName', 'courseGroupsCode']
            },
            // { model: users, as: 'userCreators', required: true, attributes: ['id', 'username', 'fullname'] },

            {
              model: courseGroupsPackages,
              as: 'courseGroupsPackages',
              required: false,
              attributes: ['id', 'courseGroupsPackagesName', 'code', 'numberOfDays']
            },
            {
              model: purchasedCourseGroupsDetails,
              as: 'purchasedCourseGroupsDetails',
              // required: true,
              include: [
                {
                  model: services,
                  as: 'services',
                  required: false,
                  // required: _.isEmpty(whereServices) ? false : true,
                  attributes: ['id', 'servicesName', 'servicesCode']
                }
              ]
            },
            {
              model: users,
              as: 'users',
              required: true,
              attributes: ['id', 'fullname', 'usersCode', 'mobile', 'email'],
              where: whereUsers
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
            reject(ErrorHelpers.errorReject(err, 'getListError', 'purchasedCourseGroupservice'));
          });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'getListError', 'purchasedCourseGroupservice'));
      }
    }),

  get_one: param =>
    new Promise((resolve, reject) => {
      try {
        // console.log("Menu Model param: %o | id: ", param, param.id)
        const id = param.id;
        const att = filterHelpers.atrributesHelper(param.attributes, ['usersCreatorId']);

        MODELS.findOne(purchasedCourseGroups, {
          where: { id: id },
          attributes: att,
          include: [
            { model: users, as: 'userCreators', required: true, attributes: ['id', 'username', 'fullname'] },
            {
              model: users,
              as: 'users',
              required: true,
              attributes: ['id', 'fullname', 'usersCode', 'mobile', 'email']
            },
            {
              model: courseGroups,
              as: 'courseGroups',

              required: true,
              attributes: ['id', 'courseGroupsName', 'courseGroupsCode']
            },
            {
              model: courseGroupsPackages,
              as: 'courseGroupsPackages',
              required: false,
              attributes: ['id', 'courseGroupsPackagesName', 'code', 'numberOfDays']
            },
            {
              model: purchasedCourseGroupsDetails,
              as: 'purchasedCourseGroupsDetails',
              required: false,
              include: [
                {
                  model: services,
                  as: 'services',
                  required: false,
                  // required: _.isEmpty(whereServices) ? false : true,
                  attributes: ['id', 'servicesName', 'servicesCode']
                }
              ]
            }
          ]
        })
          .then(result => {
            if (!result) {
              reject(
                new ApiErrors.BaseError({
                  statusCode: 202,
                  type: 'crudNotExisted'
                })
              );
            }
            resolve(result);
          })
          .catch(err => {
            reject(ErrorHelpers.errorReject(err, 'getInfoError', 'purchasedCourseGroupservice'));
          });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'getInfoError', 'purchasedCourseGroupservice'));
      }
    }),

  create: async param => {
    let finnalyResult;

    try {
      const entity = param.entity;

      console.log('entity', entity);
      const { usersId, userCreatorsId, courseGroupsPackagesId, courseGroupsId, status } = entity;

      let findCourseGroupsPackages;
      let findCourseGroups;
      let money;

      if (Number(courseGroupsPackagesId) > 0) {
        findCourseGroupsPackages = await MODELS.findOne(courseGroupsPackages, {
          where: {
            id: courseGroupsPackagesId
          },
          include: [
            { model: users, as: 'userCreators', required: true, attributes: ['id', 'username', 'fullname'] },
            {
              model: courseGroups,
              as: 'courseGroups',
              required: true,
              attributes: ['id', 'courseGroupsName', 'courseGroupsCode']
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
        if (!findCourseGroupsPackages) {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            message: 'Không tìm thấy gói khóa học'
          });
        }

        money = Number(
          findCourseGroupsPackages.promotionalMoney !== null
            ? findCourseGroupsPackages.promotionalMoney
            : findCourseGroupsPackages.money || 0
        );
      } else if (Number(courseGroupsId) > 0) {
        findCourseGroups = await MODELS.findOne(courseGroups, {
          where: {
            id: courseGroupsId
          }
        }).catch(error => {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'getInfoError',
            message: 'Lấy thông tin khóa học thất bại',
            error
          });
        });
        if (!findCourseGroups) {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            message: 'Không tìm thấy khóa học'
          });
        }
      }

      const foundUsers = await MODELS.findOne(users, {
        where: {
          id: usersId
        }
      }).catch(error => {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'getInfoError',
          message: 'Lấy thông tin học viên thất bại',
          error
        });
      });

      if (!foundUsers) {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          message: 'Không tìm thấy học viên'
        });
      }

      const foundUsersCreator = await MODELS.findOne(users, {
        where: {
          id: userCreatorsId
        }
      }).catch(error => {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'getInfoError',
          message: 'Lấy thông tin người tạo thất bại',
          error
        });
      });

      if (
        Number(entity.status) === 1 &&
        (!foundUsersCreator ||
          !(Number(foundUsersCreator.userGroupsId) === 1 || Number(foundUsersCreator.userGroupsId) === 18))
      ) {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          message: 'Bạn không có quyền thực hiện thao tác này'
        });
      }

      {
        // const wherebillTypes = {
        //   id:
        // }
        const findLastusers = await sequelize.query(
          `select count(*) as count from purchasedCourseGroups where usersId = ${usersId}`
        );

        entity.code =
          foundUsers.usersCode + 'M' + String((Number(findLastusers[0][0].count) || 0) + 1).padStart(3, '0');
      }

      if (
        findCourseGroupsPackages &&
        Number(
          findCourseGroupsPackages.promotionalMoney !== null
            ? findCourseGroupsPackages.promotionalMoney
            : findCourseGroupsPackages.money || 0
        ) === 0 &&
        Number(foundUsersCreator.userGroupsId) !== 1
      ) {
        const findOtherPurchasedCourseGroups = await MODELS.findOne(purchasedCourseGroups, {
          where: {
            usersId: usersId,
            courseGroupsPackagesId: courseGroupsPackagesId,
            purchasedCourseGroupsMoney: 0,
            status: 1
          }
        });

        if (findOtherPurchasedCourseGroups) {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'crudError',
            message: 'bạn đã mua gói dùng thử này rồi'
          });
        }
      }

      let join = false;
      let expiredDate;

      await sequelize.transaction(async t => {
        if (entity.purchasedCourseGroupsDetails) {
          await Promise.all(
            entity.purchasedCourseGroupsDetails.map(async detailElement => {
              const findServices = await MODELS.findOne(services, {
                where: {
                  id: detailElement.servicesId
                }
              });

              if (!findServices) {
                throw new ApiErrors.BaseError({
                  statusCode: 202,
                  message: 'Không tìm thấy dịch vụ'
                });
              }

              money = money + (findServices.promotionalMoney || findServices.money);
              detailElement.money = findServices.promotionalMoney || findServices.money;
            })
          );
        }

        if (status === 1 && findCourseGroupsPackages) {
          const findUsersCourseGroups = await MODELS.findOne(usersCourseGroups, {
            where: {
              usersId: usersId,
              courseGroupsId: findCourseGroupsPackages.courseGroupsId
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
                  id: findCourseGroupsPackages.courseGroupsId
                }
              }
            ).catch(error => {
              throw new ApiErrors.BaseError({
                statusCode: 202,
                type: 'crudError',
                error
              });
            });

            if (findCourseGroupsPackages.numberOfDays > 0) {
              expiredDate = moment()
                .add(findCourseGroupsPackages.numberOfDays, 'd')
                .format('YYYY-MM-DD');
            }
            await MODELS.create(
              usersCourseGroups,
              {
                usersId: usersId,
                courseGroupsId: findCourseGroupsPackages.courseGroupsId,
                expiredDate: expiredDate
              },
              { transaction: t }
            );
          } else {
            if (findCourseGroupsPackages.numberOfDays > 0 && findCourseGroupsPackages.expiredDate !== null) {
              expiredDate = moment(findCourseGroupsPackages.expiredDate)
                .add(findCourseGroupsPackages.numberOfDays, 'd')
                .format('YYYY-MM-DD');
            }
            await MODELS.update(
              usersCourseGroups,
              {
                usersId: usersId,
                courseGroupsId: findCourseGroupsPackages.courseGroupsId,
                expiredDate: expiredDate
              },
              {
                where: { id: findUsersCourseGroups.id }
              },
              { transaction: t }
            );
          }

          join = true;

          if (entity.purchasedCourseGroupsDetails && entity.purchasedCourseGroupsDetails.length > 0) {
            await MODELS.bulkCreate(
              usersServices,
              entity.purchasedCourseGroupsDetails.map(e => {
                return {
                  usersId: usersId,
                  courseGroupsId: courseGroupsId,
                  servicesId: e.servicesId,
                  expiredDate: expiredDate
                };
              }),
              { transaction: t }
            );
          }
        }

        finnalyResult = await MODELS.create(
          purchasedCourseGroups,
          {
            usersId,
            courseGroupsPackagesId,
            courseGroupsId: Number(courseGroupsId) || findCourseGroupsPackages.courseGroupsId,
            money: money,
            purchasedCourseGroupsMoney: findCourseGroupsPackages
              ? findCourseGroupsPackages.promotionalMoney !== null
                ? findCourseGroupsPackages.promotionalMoney
                : findCourseGroupsPackages.money || 0
              : 0,
            status: status,
            code: entity.code,
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

        if (entity.purchasedCourseGroupsDetails) {
          await MODELS.bulkCreate(
            purchasedCourseGroupsDetails,
            entity.purchasedCourseGroupsDetails.map(e => {
              return {
                ...e,
                purchasedCourseGroupsId: finnalyResult.id
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

      if (join) {
        // notificationsServices.sendMessage(
        //   'Hãy tham gia khóa học ngay và học thật nhiều kiến thức bổ ích',
        //   `Mua khóa học ${findsCourseGroupsPackages.courseGroups.courseGroupsName} (${findCourseGroupsPackages.courseGroups.courseGroupsCode} ) thành công !`,
        //   [entity.usersId]
        // );

        notificationsServices.create({
          entity: {
            userCreatorsId: finnalyResult.userCreatorsId,
            usersNotifications: [finnalyResult.usersId],
            sendAll: 0,
            status: 1,
            notificationTime: new Date(),
            message: 'Hãy tham gia khóa học ngay và học thật nhiều kiến thức bổ ích',
            title: `Mua khóa học ${
              findCourseGroupsPackages
                ? findCourseGroupsPackages.courseGroups.courseGroupsName
                : findCourseGroups.courseGroupsName
            } (${
              findCourseGroupsPackages
                ? findCourseGroupsPackages.courseGroups.courseGroupsCode
                : findCourseGroups.courseGroupsCode
            } ) thành công !`
          }
        });
      }
    } catch (error) {
      console.log('err', error);
      ErrorHelpers.errorThrow(error, 'crudError', 'purchasedCourseGroupservice');
    }

    return { result: finnalyResult };
  },
  update: async param => {
    let finnalyResult;

    try {
      const entity = param.entity;

      console.log('Province update: ', entity);

      const foundUsersCreator = await MODELS.findOne(users, {
        where: {
          id: entity.userCreatorsId
        }
      }).catch(error => {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'getInfoError',
          message: 'Lấy thông tin người tạo thất bại',
          error
        });
      });

      if (
        !foundUsersCreator ||
        !(Number(foundUsersCreator.userGroupsId) === 1 || Number(foundUsersCreator.userGroupsId) === 18)
      ) {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          message: 'Bạn không có quyền thực hiện thao tác này'
        });
      }
      const foundProvince = await MODELS.findOne(purchasedCourseGroups, {
        where: {
          id: param.id
        },
        include: [
          {
            model: courseGroups,
            as: 'courseGroups',
            required: true,
            attributes: ['id', 'courseGroupsName', 'courseGroupsCode']
          },
          {
            model: courseGroupsPackages,
            as: 'courseGroupsPackages',
            required: true,
            attributes: ['id', 'numberOfDays', 'money', 'promotionalMoney']
          }
        ]
      }).catch(error => {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'getInfoError',
          message: 'Lấy lịch sử mua thất bại',
          error
        });
      });

      if (Number(foundProvince.status) === 1) {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'getInfoError',
          message: 'Không thể cập nhật đơn đăng ký khóa học ở trạng thái hoàn thành'
        });
      }
      let join = false;

      let money = Number(foundProvince.purchasedCourseGroupsMoney);

      if (foundProvince) {
        await sequelize.transaction(async t => {
          let expiredDate = null;

          if (entity.purchasedCourseGroupsDetails) {
            await MODELS.destroy(purchasedCourseGroupsDetails, {
              where: {
                purchasedCourseGroupsId: foundProvince.id
              },
              transaction: t
            });
            await Promise.all(
              entity.purchasedCourseGroupsDetails.map(async detailElement => {
                const findServices = await MODELS.findOne(services, {
                  where: {
                    id: detailElement.servicesId
                  }
                });

                if (!findServices) {
                  throw new ApiErrors.BaseError({
                    statusCode: 202,
                    message: 'Không tìm thấy dịch vụ'
                  });
                }

                money = money + (findServices.promotionalMoney || findServices.money);
                detailElement.money = findServices.promotionalMoney || findServices.money;
              })
            );

            await MODELS.bulkCreate(
              purchasedCourseGroupsDetails,
              entity.purchasedCourseGroupsDetails.map(e => {
                return {
                  ...e,
                  purchasedCourseGroupsId: foundProvince.id
                };
              }),
              { transaction: t }
            );
          }

          console.log('1', 1);

          const findUsersCourseGroups = await MODELS.findOne(usersCourseGroups, {
            where: {
              usersId: foundProvince.usersId,
              courseGroupsId: foundProvince.courseGroupsId
            },
            transaction: t
          });

          if (findUsersCourseGroups) {
            console.log('đã tg');
            // đã tham gia khóa học
            if (Number(entity.status) === 1 && Number(entity.status) !== Number(foundProvince.status)) {
              // gia hạn
              join = true;
              if (foundProvince.courseGroupsPackages.numberOfDays > 0 && findUsersCourseGroups.expiredDate !== null) {
                expiredDate =
                  new Date(findUsersCourseGroups.expiredDate) > new Date()
                    ? moment(findUsersCourseGroups.expiredDate)
                        .add(foundProvince.courseGroupsPackages.numberOfDays, 'd')
                        .format('YYYY-MM-DD')
                    : moment(findUsersCourseGroups.expiredDate)
                        .add(foundProvince.courseGroupsPackages.numberOfDays, 'd')
                        .format('YYYY-MM-DD');
              }
              await MODELS.update(
                usersCourseGroups,
                {
                  usersId: foundProvince.usersId,
                  courseGroupsId: foundProvince.courseGroupsId,
                  expiredDate: expiredDate,
                  oldExpiredDate: findUsersCourseGroups.expiredDate
                },
                {
                  where: { id: findUsersCourseGroups.id }
                },
                { transaction: t }
              );
            } else if (Number(foundProvince.status) === 1 && Number(foundProvince.status) !== Number(entity.status)) {
              // đảo ngược gia hạn
              console.log('rời lớp');
              const findOtherpurchasedCourseGroups = await MODELS.findOne(purchasedCourseGroups, {
                where: {
                  id: { $ne: foundProvince.id },
                  usersId: foundProvince.usersId,
                  courseGroupsId: foundProvince.courseGroupsId,
                  status: 1
                },
                order: [['dateUpdated', 'desc']]
              });

              if (!findOtherpurchasedCourseGroups) {
                // xóa
                await MODELS.update(
                  courseGroups,
                  {
                    countUsers: sequelize.literal('countUsers - 1')
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

                await MODELS.destroy(usersCourseGroups, {
                  where: {
                    id: findUsersCourseGroups.id
                  },
                  transaction: t
                }).catch(error => {
                  throw new ApiErrors.BaseError({
                    statusCode: 202,
                    type: 'crudError',
                    error
                  });
                });
              } else {
                await MODELS.update(
                  usersCourseGroups,
                  { expiredDate: findOtherpurchasedCourseGroups.expiredDate },
                  {
                    where: {
                      id: findUsersCourseGroups.id
                    },
                    transaction: t
                  }
                );
              }
            }
          } else {
            // chưa tham gia khóa học
            console.log('chưa tg');

            if (Number(entity.status) === 1 && Number(entity.status) !== Number(foundProvince.status)) {
              // mua mới
              join = true;
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
              if (foundProvince.courseGroupsPackages.numberOfDays > 0) {
                expiredDate = moment()
                  .add(foundProvince.courseGroupsPackages.numberOfDays, 'd')
                  .format('YYYY-MM-DD');
              }
              console.log('expiredDate', expiredDate, foundProvince.courseGroupsPackages.numberOfDays);
              await MODELS.create(
                usersCourseGroups,
                {
                  usersId: foundProvince.usersId,
                  courseGroupsId: foundProvince.courseGroupsId,
                  expiredDate: expiredDate
                },
                { transaction: t }
              );
            }
          }

          console.log('a', {
            ...entity,
            dateUpdated: new Date(),
            expiredDate: foundProvince.expiredDate || expiredDate
          });
          await MODELS.update(
            purchasedCourseGroups,
            { ...entity, money: money, dateUpdated: new Date(), expiredDate: foundProvince.expiredDate || expiredDate },
            {
              where: { id: Number(param.id) },
              transaction: t
            }
          ).catch(error => {
            throw new ApiErrors.BaseError({
              statusCode: 202,
              type: 'crudError',
              error
            });
          });

          finnalyResult = await MODELS.findOne(purchasedCourseGroups, {
            where: { id: param.id },
            transaction: t
          }).catch(error => {
            throw new ApiErrors.BaseError({
              statusCode: 202,
              type: 'crudInfo',
              message: 'Lấy thông tin sau khi thay đổi thất bại',
              error
            });
          });
        });

        if (!finnalyResult) {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'crudInfo',
            message: 'Lấy thông tin sau khi thay đổi thất bại'
          });
        }

        if (join) {
          notificationsServices.sendMessage(
            'Hãy tham gia khóa học ngay và học thật nhiều kiến thức bổ ích',
            `Mua khóa học ${foundProvince.courseGroups.courseGroupsName} (${foundProvince.courseGroups.courseGroupsCode} ) thành công !`,
            [foundProvince.usersId]
          );
        }
      } else {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudNotExisted'
        });
      }
    } catch (error) {
      ErrorHelpers.errorThrow(error, 'crudError', 'purchasedCourseGroupservice');
    }

    return { result: finnalyResult };
  },
  update_status: async param => {
    let finnalyResult;

    try {
      const entity = param.entity;

      console.log('Province update: ', entity);

      const foundUsersCreator = await MODELS.findOne(users, {
        where: {
          id: entity.userCreatorsId
        }
      }).catch(error => {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'getInfoError',
          message: 'Lấy thông tin người tạo thất bại',
          error
        });
      });

      const foundProvince = await MODELS.findOne(purchasedCourseGroups, {
        where: {
          id: param.id
        },
        include: [
          {
            model: courseGroups,
            as: 'courseGroups',
            required: true,
            attributes: ['id', 'courseGroupsName', 'courseGroupsCode']
          },
          {
            model: courseGroupsPackages,
            as: 'courseGroupsPackages',
            required: true,
            attributes: ['id', 'numberOfDays', 'money', 'promotionalMoney']
          },
          {
            model: purchasedCourseGroupsDetails,
            as: 'purchasedCourseGroupsDetails',
            required: false
          }
        ]
      }).catch(error => {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'getInfoError',
          message: 'Lấy lịch sử mua thất bại',
          error
        });
      });

      if (
        !(
          Number(foundProvince.status) !== 1 &&
          Number(entity.status) !== 1 &&
          Number(entity.userCreatorsId) === Number(foundProvince.userCreatorsId)
        )
      ) {
        if (
          !foundUsersCreator ||
          !(Number(foundUsersCreator.userGroupsId) === 1 || Number(foundUsersCreator.userGroupsId) === 18)
        ) {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            message: 'Bạn không có quyền thực hiện thao tác này'
          });
        }
      }
      let join = false;

      if (foundProvince) {
        await sequelize.transaction(async t => {
          let expiredDate = null;

          console.log('1', 1);

          const findUsersCourseGroups = await MODELS.findOne(usersCourseGroups, {
            where: {
              usersId: foundProvince.usersId,
              courseGroupsId: foundProvince.courseGroupsId
            },
            transaction: t
          });

          if (findUsersCourseGroups) {
            // đã tham gia khóa học
            console.log('đã tg');

            if (Number(entity.status) === 1 && Number(entity.status) !== Number(foundProvince.status)) {
              // gia hạn
              join = true;
              if (foundProvince.courseGroupsPackages.numberOfDays > 0 && findUsersCourseGroups.expiredDate !== null) {
                expiredDate =
                  new Date(findUsersCourseGroups.expiredDate) > new Date()
                    ? moment(findUsersCourseGroups.expiredDate)
                        .add(foundProvince.courseGroupsPackages.numberOfDays, 'd')
                        .format('YYYY-MM-DD')
                    : moment(findUsersCourseGroups.expiredDate)
                        .add(foundProvince.courseGroupsPackages.numberOfDays, 'd')
                        .format('YYYY-MM-DD');
              }

              await MODELS.update(
                usersCourseGroups,
                {
                  usersId: foundProvince.usersId,
                  courseGroupsId: foundProvince.courseGroupsId,
                  expiredDate: expiredDate,
                  oldExpiredDate: findUsersCourseGroups.expiredDate
                },
                {
                  where: { id: findUsersCourseGroups.id }
                },
                { transaction: t }
              );

              await MODELS.update(
                usersServices,
                { expiredDate: expiredDate },
                {
                  transaction: t,
                  where: {
                    usersId: foundProvince.usersId,
                    courseGroupsId: foundProvince.courseGroupsId
                  }
                }
              );
            } else if (Number(foundProvince.status) === 1 && Number(foundProvince.status) !== Number(entity.status)) {
              // đảo ngược gia hạn - hoặc rời khỏi lớp
              console.log('rời lớp');
              const findOtherpurchasedCourseGroups = await MODELS.findOne(purchasedCourseGroups, {
                where: {
                  id: { $ne: foundProvince.id },
                  usersId: foundProvince.usersId,
                  courseGroupsId: foundProvince.courseGroupsId,
                  status: 1
                },
                logging: true,
                order: [['dateUpdated', 'desc']]
              });

              if (!findOtherpurchasedCourseGroups) {
                // rời khỏi lớp
                console.log('rời lơps');
                await MODELS.update(
                  courseGroups,
                  {
                    countUsers: sequelize.literal('countUsers - 1')
                  },
                  {
                    where: {
                      id: foundProvince.courseGroupsId
                    },
                    transaction: t
                  }
                ).catch(error => {
                  throw new ApiErrors.BaseError({
                    statusCode: 202,
                    type: 'crudError',
                    error
                  });
                });

                await MODELS.destroy(usersCourseGroups, {
                  where: {
                    id: findUsersCourseGroups.id
                  },
                  transaction: t
                }).catch(error => {
                  throw new ApiErrors.BaseError({
                    statusCode: 202,
                    type: 'crudError',
                    error
                  });
                });

                await MODELS.destroy(usersServices, {
                  where: {
                    usersId: foundProvince.usersId,
                    courseGroupsId: foundProvince.courseGroupsId
                  },
                  transaction: t
                });
              } else {
                // đảo ngược gia hạn
                console.log('đảo ngược');
                await MODELS.update(
                  usersCourseGroups,
                  { expiredDate: findOtherpurchasedCourseGroups.expiredDate },
                  {
                    where: {
                      id: findUsersCourseGroups.id
                    },
                    transaction: t
                  }
                );
                await MODELS.update(
                  usersServices,
                  { expiredDate: findOtherpurchasedCourseGroups.expiredDate },
                  {
                    transaction: t,
                    where: {
                      usersId: foundProvince.usersId,
                      courseGroupsId: foundProvince.courseGroupsId
                    }
                  }
                );
              }
            }
          } else {
            // chưa tham gia khóa học
            console.log('chưa tg');

            if (Number(entity.status) === 1 && Number(entity.status) !== Number(foundProvince.status)) {
              // mua mới
              join = true;
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
              if (foundProvince.courseGroupsPackages.numberOfDays > 0) {
                expiredDate = moment()
                  .add(foundProvince.courseGroupsPackages.numberOfDays, 'd')
                  .format('YYYY-MM-DD');
              }
              console.log('expiredDate', expiredDate, foundProvince.courseGroupsPackages.numberOfDays);
              await MODELS.create(
                usersCourseGroups,
                {
                  usersId: foundProvince.usersId,
                  courseGroupsId: foundProvince.courseGroupsId,
                  expiredDate: expiredDate
                },
                { transaction: t }
              );

              if (foundProvince.purchasedCourseGroupsDetails && foundProvince.purchasedCourseGroupsDetails.length > 0) {
                await MODELS.bulkCreate(
                  usersServices,
                  foundProvince.purchasedCourseGroupsDetails.map(e => {
                    return {
                      usersId: foundProvince.usersId,
                      courseGroupsId: foundProvince.courseGroupsId,
                      servicesId: e.servicesId,
                      expiredDate: expiredDate
                    };
                  }),
                  { transaction: t }
                );
              }
            }
          }

          await MODELS.update(
            purchasedCourseGroups,
            { ...entity, dateUpdated: new Date(), expiredDate: expiredDate },
            {
              where: { id: Number(param.id) },
              transaction: t
            }
          ).catch(error => {
            throw new ApiErrors.BaseError({
              statusCode: 202,
              type: 'crudError',
              error
            });
          });
          finnalyResult = await MODELS.findOne(purchasedCourseGroups, {
            where: { id: param.id },
            transaction: t
          }).catch(error => {
            throw new ApiErrors.BaseError({
              statusCode: 202,
              type: 'crudInfo',
              message: 'Lấy thông tin sau khi thay đổi thất bại',
              error
            });
          });
        });

        if (!finnalyResult) {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'crudInfo',
            message: 'Lấy thông tin sau khi thay đổi thất bại'
          });
        }

        if (join) {
          // notificationsServices.sendMessage(
          //   'Hãy tham gia khóa học ngay và học thật nhiều kiến thức bổ ích',
          //   `Mua khóa học ${foundProvince.courseGroups.courseGroupsName} (${foundProvince.courseGroups.courseGroupsCode} ) thành công !`,
          //   [foundProvince.usersId]
          // );
          notificationsServices.create({
            entity: {
              userCreatorsId: finnalyResult.userCreatorsId,
              usersNotifications: [finnalyResult.usersId],
              sendAll: 0,
              status: 1,
              notificationTime: new Date(),
              message: 'Hãy tham gia khóa học ngay và học thật nhiều kiến thức bổ ích',
              title: `Mua khóa học ${foundProvince.courseGroups.courseGroupsName} (${foundProvince.courseGroups.courseGroupsCode} ) thành công !`
            }
          });
        }
      } else {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudNotExisted'
        });
      }
    } catch (error) {
      ErrorHelpers.errorThrow(error, 'crudError', 'purchasedCourseGroupservice');
    }

    return { result: finnalyResult };
  }
};
