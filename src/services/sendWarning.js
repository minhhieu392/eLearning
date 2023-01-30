/* eslint-disable camelcase */
// import moment from 'moment'
import MODELS from '../models/models';
import models from '../entity/index';
// import _ from 'lodash';
// import * as ApiErrors from '../errors';
import moment from 'moment';
import ErrorHelpers from '../helpers/errorHelpers';
import warringHistoriesServices from './warringHistoriesServices';
import { Expo } from 'expo-server-sdk';
const { users, userTokenOfNotifications, usersWarings } = models;

// import sendEmailService from './sendEmailService';

const expo = new Expo({ accessToken: process.env.EXPO_ACCESS_TOKEN || 'WKfutT1JVEy7PIUexwx7ISuZMYAyy0CO01SOnlT8' });

const sendMessageExpo = async (title, message, data, listClientId) => {
  await Promise.all(
    listClientId.map(async tokenExpo => {
      console.log('tokenExpo', {
        to: tokenExpo,
        sound: 'default',
        body: message,
        data: data,
        sticky: true,
        title: title
      });
      data.icon = JSON.stringify(data.icon);
      data.listId = JSON.stringify(data.listId);
      data.name = JSON.stringify(data.name);
      console.log('data', data);
      const chunks = expo.chunkPushNotifications([
        {
          to: tokenExpo,
          sound: 'default',
          body: message,
          data: data,
          sticky: true,
          title: title
        }
      ]);

      const ticketChunk = await expo.sendPushNotificationsAsync(chunks[0]);

      console.log('ticketChunk', ticketChunk);
      if (
        ticketChunk &&
        ticketChunk[0] &&
        (ticketChunk[0].message === 'The recipient device is not registered with FCM.' ||
          ticketChunk[0].status === 'error')
      ) {
        MODELS.destroy(userTokenOfNotifications, {
          where: {
            clientId: tokenExpo
          }
        });
      }
    })
  );
};

export default {
  send: async (time, usersId) => {
    try {
      console.log('time', time, usersId);
      const listWaring = await warringHistoriesServices.get_all_by_time(time);

      if (listWaring && listWaring.list.length > 0) {
        listWaring.list.map(async warning => {
          const title = `${warning.dataClassGroupsName} - ${moment(warning.time).format('YYYY-MM-DD HH:mm:ss')} :`;
          const title2 = `${warning.dataClassGroupsName}`;
          const messages = `${warning.name.join(',')}.`;
          const data = warning;
          const findUsers = await MODELS.findAll(usersWarings, {
            where: {
              dataClassGroupsId: warning.dataClassGroupsId
            },
            include: [
              {
                model: users,
                as: 'users',
                attributes: ['id', 'email'],
                required: true,
                include: [
                  {
                    model: userTokenOfNotifications,
                    as: 'userTokenOfNotifications',
                    attributes: ['id', 'usersId', 'clientId'],
                    required: false
                  }
                ]
              }
            ]
          });

          if (findUsers && findUsers.length > 0) {
            const listClientId = [];

            findUsers.forEach(currentUsers => {
              console.log('title', JSON.stringify(title));
              console.log('currentUsers', JSON.stringify(currentUsers));
              console.log('isapp', Number(currentUsers.isApp));
              console.log('isMail', Number(currentUsers.isMail));

              if (currentUsers && currentUsers.users && Number(currentUsers.users.id) === Number(usersId)) {
                if (currentUsers.users.email && Number(currentUsers.isMail) === 1) {
                  // sendEmailService.sendGmail({
                  //   emailTo: currentUsers.users.email,
                  //   subject: "Cảnh báo thiên tai tỉnh (PDMS)",
                  //   sendTypeMail: "html",
                  //   body: title + `<br/>` + messages,
                  // });
                }
                if (currentUsers.users.userTokenOfNotifications && Number(currentUsers.isApp) === 1) {
                  console.log('123');
                  currentUsers.users.userTokenOfNotifications.forEach(TokenUsers => {
                    listClientId.push(TokenUsers.clientId);
                  });
                }
              }
            });

            if (listClientId.length > 0) {
              sendMessageExpo(title2, messages, data, listClientId);
            }

            console.log('listClientId', listClientId);
          }
        });
      }
    } catch (error) {
      ErrorHelpers.errorThrow(error, 'crudError', 'notificationsQueueService');
    }

    return;
  }
};
