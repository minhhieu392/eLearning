import axios from 'axios';
import CONFIG from '../../config';
import r from 'rethinkdb';
import ErrorHelpers from '../../helpers/errorHelpers';
import Model from '../../models/models';
import models from '../../entity/index';
// import { connectionRethinkDb } from '../../index';
const { socialChannels, socialGroupChannels, medCustomersSocialChannels, medCustomers} = models;

import Telegram from './telegram/index';
// import getInfoUser from '../../services/telegram/getInfoUser';

export default {
  postEntry: async param => {
    const { entity } = param;
    let finnalyResult = {};

    console.log('entity', JSON.stringify(entity));

    const newEntry = {
      pageId: entity['message']['recipient']['id'],
      sender: { id: `${entity['message']['from']['id']}` },
      recipient: { id: entity['message']['recipient']['id'] },
      message: {
        text: entity.message.text ? entity.message.text : '',
        attachments: entity.message.attachments ? entity.message.attachments : []
      },
      time: new Date().getTime(),
      status: true,
      conversationId: entity['message']['recipient']['id'] + '_' + entity['message']['from']['id'],
      userInfo: { profile_pic: '', name: '' }
    };
    const foundSocialChannel = await Model.findOne(socialChannels, {
      where: {
        link: newEntry.pageId
      },
      required: true,
      include: [{ model: socialGroupChannels, as: 'socialGroupChannels' }],
      attributes: ['id','placesId', 'token','avatar', 'name']
    });

    newEntry.pageInfo = {profile_pic: null, name: null};
    if (foundSocialChannel) {
      newEntry.channelId = foundSocialChannel.id;
      newEntry.pageInfo = {
        profile_pic : null,
        name: foundSocialChannel && foundSocialChannel.name ? foundSocialChannel.name : null
      };
      const foundCustomerSocialChannel = await Model.findOne(medCustomersSocialChannels, {
        where: {
          $and: {
            recipientId: newEntry.sender.id,
            channelsId: foundSocialChannel.id
          }
        },
        include: [
          {
            model: medCustomers, required: true, as: 'medCustomers'
          }
        ]
      });
      console.log('foundCustomerSocialChannel',foundCustomerSocialChannel);
      const userInfo = await Telegram.getUserInfo({
        accessToken: foundSocialChannel.token,
        userId: newEntry.sender.id
      }).then(data => {
        const finalResult = {
          name: null,
          profile_pic: null
        };

        finalResult.name = data && data['result'] && data['result']['first_name'] && data['result']['last_name'] ? `${data['result']['first_name']} ${data['result']['last_name']}`: null;

        return finalResult;
      });

      newEntry.userInfo = {
        profile_pic: userInfo.profile_pic,
        name: userInfo.name
      };

      if (foundCustomerSocialChannel) {
        await Model.update(medCustomersSocialChannels, {
          name: userInfo.name
        },{
          where: {
            id: foundCustomerSocialChannel.id
          }
        });

      }

      if (foundSocialChannel && foundSocialChannel.socialGroupChannels && foundSocialChannel.socialGroupChannels.name) {
        newEntry.socialGroupChannels = foundSocialChannel.socialGroupChannels.name.toLowerCase();
        newEntry.placeId = foundSocialChannel.placesId;
      }
      console.log('new', newEntry);
      try {
        r.connect({ host: CONFIG.RETHINKDB_SERVER, port: CONFIG.RETHINKDB_PORT, db: CONFIG.RETHINKDB_DB }, function(err, conn) {
          if (err) throw err;
          r.table('faceMessage')
            .insert(newEntry)
            .run(conn, function(err, result) {
              if (err) {
                console.log('DB---->Insert failed] %s:%s\n%s', err.name, err.msg, err.message);
              }
              finnalyResult = JSON.stringify(result, null, 2);
              console.log('finnaly result', finnalyResult);
            });
        });
        finnalyResult = { transaction: true };

        return { result: finnalyResult };
      } catch (error) {
        ErrorHelpers.errorThrow(error, 'crudError', 'ArticleService');
      }
    }
  }
};
