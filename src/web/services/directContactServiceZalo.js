import axios from 'axios';
import CONFIG from '../../config';
import r from 'rethinkdb';
import ErrorHelpers from '../../helpers/errorHelpers';
import Model from '../../models/models';
import models from '../../entity/index';
// import { connectionRethinkDb } from '../../index';
const { socialChannels, socialGroupChannels,medCustomersSocialChannels,medCustomers} = models;

import getInfoUser from '../../services/zalo/getInfoUser';
import Zalo from '../../services/zalo/index';
export default {
  postEntry: async param => {
    const { entity } = param;
    let finnalyResult = {};

    console.log('entity', JSON.stringify(entity));

    const newEntry = {
      pageId: entity.recipient.id,
      sender: { id: entity.sender.id },
      recipient: { id: entity.recipient.id },
      message: {
        text: entity.message.text ? entity.message.text : '',
        attachments: entity.message.attachments ? entity.message.attachments : []
      },
      time: new Date().getTime(),
      status: true,
      placeId: '',
      conversationId: entity.recipient.id + '_' + entity.sender.id,
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


    if (foundSocialChannel) {
      newEntry.channelId = foundSocialChannel.id;
      newEntry.pageInfo = {
        profile_pic : foundSocialChannel && foundSocialChannel.avatar ? foundSocialChannel.avatar: null,
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

      const userInfo = await Zalo.getInfoUser({ accessToken: foundSocialChannel.token, userId: entity.sender.id });
      console.log('userInfo',userInfo);
      newEntry.userInfo = {
        profile_pic: userInfo && userInfo['data'] && userInfo['data']['avatar']  ? userInfo['data']['avatar'] :null,
        name: userInfo && userInfo['data'] && userInfo['data']['display_name'] ? userInfo.data['display_name']: null
      };
      if (foundCustomerSocialChannel) {
        await Model.update(medCustomersSocialChannels, {
          pictureProfile: newEntry.userInfo.profile_pic,
          name: newEntry.userInfo.name
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
      console.log('newEntry',newEntry);
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
