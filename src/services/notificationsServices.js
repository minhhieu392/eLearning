// import moment from 'moment'
import MODELS from '../models/models';
import models from '../entity/index';
import _ from 'lodash';
import * as ApiErrors from '../errors';
import ErrorHelpers from '../helpers/errorHelpers';
import filterHelpers from '../helpers/filterHelpers';
import moment from 'moment';
import { Expo } from 'expo-server-sdk';

const {
  users /* tblGatewayEntity, Roles */,
  notifications,
  sequelize,
  usersNotifications,
  userTokenOfNotifications,
  courseGroups,
  usersCourseGroups
} = models;

const sendMessage = async (message, title, listUsersId, currentId = null) => {
  const expo = new Expo({
    // accessToken: process.env.EXPO_ACCESS_TOKEN
  });

  console.log('vô đâys', message, listUsersId);

  let listNoti = [];

  if (currentId === null) {
    const where = {
      status: 1
    };

    if (listUsersId && listUsersId.length > 0) {
      where.usersId = {
        $in: listUsersId
      };
    }
    const listTokenUser = await MODELS.findAll(userTokenOfNotifications, {
      logging: true,
      where: where
    });

    console.log('listUsersId', listUsersId);
    if (!listTokenUser) return false;

    listNoti = listTokenUser.map(tokenExpo => {
      console.log('tokenExpo', JSON.stringify(tokenExpo));

      return {
        to: tokenExpo.clientId,
        sound: 'default',
        body: message,
        data: { id: tokenExpo.id },
        sticky: true,
        title: title
      };
    });
  } else {
    console.log('111');
    const currentNoti = await MODELS.findOne(notifications, {
      where: { id: currentId }
    });

    if (Number(currentNoti.sendStatus) === 1) {
      return;
    }

    await MODELS.update(
      notifications,
      { sendStatus: 1 },
      {
        where: { id: currentId }
      }
    );

    const include = [];
    const whereFilter = {};

    if (currentNoti.notInUsersId && currentNoti.notInUsersId.length > 0) {
      whereFilter.id = {
        $notIn: currentNoti.notInUsersId
      };
    }
    if (
      Number(currentNoti.sendAll) === 2 &&
      Number(currentNoti.courseGroupsId) &&
      Number(currentNoti.courseGroupsId).length >= 1
    ) {
      include.push({
        model: usersCourseGroups,
        as: 'usersCourseGroups',
        required: true,
        attributes: [],
        where: {
          courseGroupsId: {
            $in: currentNoti.courseGroupsId
          }
        }
      });
    }

    if (Number(currentNoti.sendAll) === 0) {
      include.push({
        model: usersNotifications,
        as: 'usersNotifications',
        required: true,
        attributes: [],
        where: {
          notificationsId: currentNoti.id
        }
      });
    }

    const listTokenUser = await MODELS.findAll(userTokenOfNotifications, {
      logging: true,
      where: {
        status: 1
      },
      include: [
        {
          model: users,
          as: 'users',
          required: true,
          where: whereFilter,
          include: include
        }
      ]
    });

    console.log('listUsersId1', listUsersId);
    if (!listTokenUser) return false;
    const listUserNhan = await MODELS.findAll(users, {
      where: whereFilter,

      attributes: ['id', 'fullname', 'mobile', 'image', 'usersCode', 'email'],

      include: include,
      logging: true
    });

    listNoti = listTokenUser.map(tokenExpo => {
      console.log('tokenExpo', JSON.stringify(tokenExpo));

      return {
        to: tokenExpo.clientId,
        sound: 'default',
        body: message,
        data: { id: tokenExpo.id },
        sticky: true,
        title: title
      };
    });

    console.log(
      'listUserNhan',
      listUserNhan.map(e => {
        return {
          usersId: e.id,
          notificationsId: currentId
        };
      })
    );
    if (Number(currentNoti.sendAll) !== 0) {
      await MODELS.destroy(usersNotifications, {
        where: { id: currentId }
      });
      await MODELS.bulkCreate(
        usersNotifications,
        listUserNhan.map(e => {
          return {
            usersId: e.id,
            notificationsId: currentId
          };
        })
      );
    }
  }

  console.log('listNoti', listNoti);
  if (listNoti.length > 0) {
    const chunks = expo.chunkPushNotifications(listNoti);

    console.log('chunks', chunks);
    const ticketChunk = await expo.sendPushNotificationsAsync(chunks[0]);

    console.log('ticketChunk', ticketChunk);
    ticketChunk.forEach((e, index) => {
      if (e.status === 'error') {
        MODELS.destroy(userTokenOfNotifications, {
          where: {
            id: listNoti[index].data.id
          }
        });
      }
    });
  }
};

export default {
  sendMessage: sendMessage,
  get_list: param =>
    new Promise(async (resolve, reject) => {
      try {
        const { filter, range, sortBy, auth } = param;

        console.log('auth', auth);
        let attributes = param.attributes || '';

        const findCurrentUsers = await MODELS.findOne(users, {
          where: { id: auth.userId }
        });

        console.log('findCurrentUsers', findCurrentUsers);

        if (Number(findCurrentUsers.userGroupsId) === 1 || Number(findCurrentUsers.userGroupsId) === 18) {
          filter.usersId = filter.usersId || 0;
        } else {
          filter.usersId = findCurrentUsers.id;
          filter.sendStatus = 1;
          filter.status = 1;
        }
        if (attributes) {
          const otherAttributes = ['owners', 'species', 'provinces', 'districts', 'wards', 'villages'];

          attributes = attributes
            .split(',')
            .map(e => {
              if (!otherAttributes.includes(e)) return 'individuals.' + e;

              return e;
            })
            .join(',');
        }
        // +param.attributes.replace(/,/gims, ',individuals.');
        let orderBy;
        let order;

        const perPage = range[1] - range[0] + 1;
        const page = Math.floor(range[0] / perPage);

        console.log('attributes', filter);

        console.log('sort', sortBy);
        if (sortBy) {
          orderBy = sortBy[0];
          order = sortBy[1] || 'desc';
        }
        console.log('filter', {
          in_usersId: filter.usersId || 0,
          in_sendAll: filter.usersId > 0 ? -99 : Number(filter.sendAll) >= 0 ? filter.sendAll : -99,
          in_sendStatus: Number(filter.sendStatus) >= 0 ? filter.status : -99,
          in_status: Number(filter.status) >= 0 ? filter.sendStatus : -99,

          in_title: filter.title || '',
          in_FromDate: filter.FromDate ? moment(filter.FromDate).format('YYYY-MM-DD') : '',
          in_ToDate: filter.ToDate ? moment(filter.ToDate).format('YYYY-MM-DD') : '',

          in_orderBy: orderBy,
          in_order: order,
          in_start_page: range[0],
          in_end_page: range[1] - range[0] + 1
        });

        const result = await sequelize
          .query(
            'call sp_notifications_get_list(:in_usersId ,:in_sendAll ,:in_title ,:in_sendStatus,:in_status,:in_FromDate, :in_ToDate, :in_orderBy, :in_order ,:in_start_page ,:in_end_page)',
            {
              replacements: {
                in_usersId: filter.usersId || 0,

                in_sendAll: filter.usersId > 0 ? -99 : Number(filter.sendAll) >= 0 ? filter.sendAll : -99,
                in_title: filter.title || '',
                in_sendStatus: Number(filter.sendStatus) >= 0 ? filter.sendStatus : -99,
                in_status: Number(filter.status) >= 0 ? filter.status : -99,
                in_FromDate: filter.FromDate ? moment(filter.FromDate).format('YYYY-MM-DD') : '',
                in_ToDate: filter.ToDate ? moment(filter.ToDate).format('YYYY-MM-DD') : '',
                in_orderBy: orderBy,
                in_order: order,
                in_start_page: range[0],
                in_end_page: range[1] - range[0] + 1
              },

              type: sequelize.QueryTypes.SELECT
            }
          )
          .catch(err => {
            console.log('err', err);
          });

        delete result[0].meta;
        // delete result[1].meta;
        const rows = Object.values(result[0]);

        // const outOutput = result[0]['0']['count(*)'];
        // const countList = Object.values(result[1]);

        resolve({
          count: result[result.length - 2]['0'].count,
          rows,
          page: page + 1,
          perPage
        });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'getListError', 'Groupstorieservice'));
      }
    }),

  get_list_users: param =>
    new Promise(async (resolve, reject) => {
      try {
        const { filter, range, sort, attributes } = param;

        let whereFilter = _.omit(filter, ['notificationsId']);
        const att = filterHelpers.atrributesHelper(attributes);

        try {
          whereFilter = filterHelpers.combineFromDateWithToDate(whereFilter);
        } catch (error) {
          reject(error);
        }

        const notificationsResult = await MODELS.findOne(notifications, {
          where: { id: filter.notificationsId }
        });

        if (!notificationsResult) {
          reject(ErrorHelpers.errorReject('', 'getListError', 'courseTypeservice', 202, 'Không tìm thấy thông báo'));
        }

        const perPage = range[1] - range[0] + 1;
        const page = Math.floor(range[0] / perPage);

        whereFilter = await filterHelpers.makeStringFilterRelatively(['courseTypesName'], whereFilter, 'courseTypes');
        whereFilter.userGroupsId = 2;

        if (!whereFilter) {
          whereFilter = { ...filter };
        }

        console.log('where', whereFilter);
        const include = [];

        console.log(
          'a',
          notificationsResult.notificationTime > moment().format('YYYY-MM-DD HH:mm:ss'),
          notificationsResult.notificationTime,
          moment().format('YYYY-MM-DD HH:mm:ss')
        );

        if (Number(notificationsResult.sendStatus) === 0) {
          // chưa gửi
          if (notificationsResult.notInUsersId && notificationsResult.notInUsersId.length > 0) {
            whereFilter.id = {
              $notIn: notificationsResult.notInUsersId
            };
          }
          if (
            Number(notificationsResult.sendAll) === 2 &&
            Number(notificationsResult.courseGroupsId) &&
            Number(notificationsResult.courseGroupsId).length >= 1
          ) {
            include.push({
              model: usersCourseGroups,
              as: 'usersCourseGroups',
              required: true,
              attributes: [],
              where: {
                courseGroupsId: {
                  $in: notificationsResult.courseGroupsId
                }
              }
            });
          }

          if (Number(notificationsResult.sendAll) === 0) {
            include.push({
              model: usersNotifications,
              as: 'usersNotifications',
              required: true,
              attributes: [],
              where: {
                notificationsId: filter.notificationsId
              }
            });
          }
        } else {
          include.push({
            model: usersNotifications,
            as: 'usersNotifications',
            required: true,
            attributes: [],
            where: {
              notificationsId: filter.notificationsId
            }
          });
        }

        MODELS.findAndCountAll(users, {
          where: whereFilter,
          order: sort,

          attributes: ['id', 'fullname', 'mobile', 'image', 'usersCode', 'email'],
          offset: range[0],
          limit: perPage,
          include: [...include],
          logging: true
        })
          .then(result => {
            resolve({
              ...result,
              page: page + 1,
              perPage
            });
          })
          .catch(err => {
            reject(ErrorHelpers.errorReject(err, 'getListError', 'courseTypeservice'));
          });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'getListError', 'courseTypeservice'));
      }
    }),
  get_one: param =>
    new Promise((resolve, reject) => {
      try {
        // console.log("Menu Model param: %o | id: ", param, param.id)
        const id = param.id;
        const att = filterHelpers.atrributesHelper(param.attributes, ['usersCreatorId']);

        MODELS.findOne(notifications, {
          where: { id: id },
          attributes: [
            'id',
            'title',
            'message',
            'userCreatorsId',
            'dateCreated',
            'status',
            'sendAll',
            'notificationTime',
            'notInUsersId',
            'courseGroupsId'
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

            if (result.courseGroupsId && result.courseGroupsId.length > 0) {
              const findCourseGroups = await MODELS.findAll(courseGroups, {
                where: { id: { $in: result.courseGroupsId } },
                attributes: ['id', 'courseGroupsName']
              });

              if (findCourseGroups) result.dataValues.courseGroups = findCourseGroups;
            } else {
              result.dataValues.courseGroups = null;
            }

            if (result.notInUsersId && result.notInUsersId.length > 0) {
              const findCourseGroups = await MODELS.findAll(users, {
                where: { id: { $in: result.notInUsersId } },
                attributes: ['id', 'fullname', 'mobile', 'image', 'usersCode', 'email']
              });

              if (findCourseGroups) result.dataValues.notInUsers = findCourseGroups;
            } else {
              result.dataValues.notInUsers = null;
            }
            resolve(result);
          })
          .catch(err => {
            reject(ErrorHelpers.errorReject(err, 'getInfoError', 'notificationsService'));
          });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'getInfoError', 'notificationsService'));
      }
    }),
  create: async param => {
    let finnalyResult;

    try {
      const entity = param.entity;

      console.log('noti create: ', entity);
      const listUsersId = [];

      await sequelize.transaction(async t => {
        if (Number(entity.sendAll) === 0 && (!entity.usersNotifications || entity.usersNotifications.length < 1)) {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            message: 'thông báo phải gửi cho ít nhất 1 người'
          });
        }

        finnalyResult = await MODELS.create(notifications, entity, { transaction: t }).catch(error => {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'crudError',
            error
          });
        });

        if (Number(entity.sendAll) === 0) {
          console.log(
            'listUserTao',
            entity.usersNotifications.map(e => {
              return {
                usersId: e,
                notificationsId: finnalyResult.id
              };
            })
          );

          await MODELS.bulkCreate(
            usersNotifications,
            entity.usersNotifications.map(e => {
              listUsersId.push(e);

              return {
                usersId: e,
                notificationsId: finnalyResult.id
              };
            }),
            { transaction: t }
          ).catch(error => {
            console.log('err', error);
            throw new ApiErrors.BaseError({
              statusCode: 202,
              type: 'crudError',
              error
            });
          });
        }
      });

      if (!finnalyResult) {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudInfo'
        });
      }
      console.log('finnalyResult.message', finnalyResult.message);

      const countTime =
        new Date(finnalyResult.notificationTime) - new Date() > 0
          ? new Date(finnalyResult.notificationTime) - new Date()
          : 0;

      console.log(new Date(finnalyResult.notificationTime) - new Date(), countTime);
      setTimeout(() => {
        sendMessage(finnalyResult.message, finnalyResult.title, listUsersId, finnalyResult.id);
      }, countTime);
    } catch (error) {
      ErrorHelpers.errorThrow(error, 'crudError', 'notificationsService');
    }

    return { result: finnalyResult };
  },
  update: async param => {
    let finnalyResult;

    try {
      const entity = param.entity;

      console.log('Province update: ');

      const foundProvince = await MODELS.findOne(notifications, {
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
      const listUsersId = [];

      if (foundProvince) {
        await sequelize.transaction(async t => {
          await MODELS.update(
            notifications,
            { ...entity, dateUpdated: new Date() },
            { where: { id: Number(param.id) } }
          ).catch(error => {
            throw new ApiErrors.BaseError({
              statusCode: 202,
              type: 'crudError',
              error
            });
          });

          finnalyResult = await MODELS.findOne(notifications, { where: { id: param.id } }).catch(error => {
            throw new ApiErrors.BaseError({
              statusCode: 202,
              type: 'crudInfo',
              message: 'Lấy thông tin sau khi thay đổi thất bại',
              error
            });
          });
          await MODELS.destroy(usersNotifications, { where: { notificationsId: param.id } }).catch(error => {
            throw new ApiErrors.BaseError({
              statusCode: 202,
              type: 'crudInfo',
              message: 'Lấy thông tin sau khi thay đổi thất bại',
              error
            });
          });

          await MODELS.bulkCreate(
            usersNotifications,
            entity.usersNotifications.map(e => {
              listUsersId.push(e);

              return {
                usersId: e,
                notificationsId: finnalyResult.id
              };
            }),
            { transaction: t }
          ).catch(error => {
            throw new ApiErrors.BaseError({
              statusCode: 202,
              type: 'crudError',
              error
            });
          });
        });
        console.log('2');
        console.log('finnalyResult', finnalyResult.message);

        if (!finnalyResult) {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'crudInfo',
            message: 'Lấy thông tin sau khi thay đổi thất bại'
          });
        }

        if (Number(finnalyResult.sendStatus) === 0) {
          const countTime =
            new Date(finnalyResult.notificationTime) - new Date() > 0
              ? new Date(finnalyResult.notificationTime) - new Date()
              : 0;

          console.log(new Date(finnalyResult.notificationTime) - new Date());
          setTimeout(() => {
            sendMessage(finnalyResult.message, finnalyResult.title, [], finnalyResult.id);
          }, countTime);
        }
      } else {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudNotExisted'
        });
      }
    } catch (error) {
      ErrorHelpers.errorThrow(error, 'crudError', 'notificationservice');
    }

    return { result: finnalyResult };
  },
  update_status: param =>
    new Promise((resolve, reject) => {
      try {
        console.log('block id', param.id);
        const id = param.id;
        const entity = param.entity;

        MODELS.findOne(notifications, {
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
                notifications,
                { ...entity, dateUpdated: new Date() },
                {
                  where: { id: id }
                }
              )
                .then(() => {
                  // console.log("rowsUpdate: ", rowsUpdate)
                  MODELS.findOne(notifications, { where: { id: param.id } })
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
