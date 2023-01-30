import r from 'rethinkdb';
import ErrorHelpers from '../../helpers/errorHelpers';
import Model from '../../models/models';
import models from '../../entity/index';
import getUserInfo from '../../services/facebook/getUserInfo';
import CONFIG from '../../config';
import Facebook from '../services/facebookV2/index';
// import { connectionRethinkDb } from '../../index';
const { socialChannels, socialGroupChannels, medCustomersSocialChannels, medCustomers } = models;

export default {
  postEntry: async param => {
    const { entity } = param;
    let finnalyResult = {};

    console.log(JSON.stringify(entity));
    const entry = entity.entry[0];
    const event = entry.messaging[0];
    const newEntry = {
      pageId: entry.id,
      sender: { id: event.sender.id },
      recipient: { id: event.recipient.id },
      message: {
        text: event.message.text ? event.message.text : '',
        attachments: event.message.attachments ? event.message.attachments : []
      },
      time: new Date().getTime(),
      status: true,
      placeId: '',
      conversationId: entry.id + '_' + event.sender.id,
      userInfo: { profile_pic: '', name: '' }
    };
    console.log('time userToPage ', newEntry.time);

    const foundSocialChannel = await Model.findOne(socialChannels, {
      where: {
        link: newEntry.pageId
      },
      required: true,
      include: [{ model: socialGroupChannels, as: 'socialGroupChannels' }],
      attributes: ['id','placesId', 'token','avatar', 'name']
    });


    if (foundSocialChannel) {
      console.log(foundSocialChannel);
      newEntry.channelId = foundSocialChannel.id;
      newEntry.pageInfo = {
        profile_pic: foundSocialChannel && foundSocialChannel.avatar ? foundSocialChannel.avatar : null,
        name: foundSocialChannel && foundSocialChannel.name ? foundSocialChannel.name : null
      };
      const foundCustomerSocialChannel = await Model.findOne(medCustomersSocialChannels, {
        where: {
          $and: {
            recipientId: event.sender.id,
            channelsId: foundSocialChannel.id
          }
        },
        include: [
          {
            model: medCustomers, required: true, as: 'medCustomers'
          }
        ]
      });
      const userInfo = await getUserInfo.getUserInfo({
        userId: event.sender.id,
        access_token: foundSocialChannel.token
      });

      newEntry.userInfo = { profile_pic: userInfo && userInfo['profile_pic'] ? userInfo['profile_pic'] : null , name: userInfo && userInfo['name'] ? userInfo['name'] : null};
      if (foundCustomerSocialChannel) {
        await Model.update(medCustomersSocialChannels,{
          pictureProfile: newEntry.userInfo.profile_pic,
          name: newEntry.userInfo.name
        }, {
          where: {
            id: foundCustomerSocialChannel.id
          }
        });
      }



      console.log('newEntry',newEntry);
      if (foundSocialChannel && foundSocialChannel.socialGroupChannels && foundSocialChannel.socialGroupChannels.name) {
        newEntry.socialGroupChannels = foundSocialChannel.socialGroupChannels.name.toLowerCase();
        newEntry.placeId = foundSocialChannel.placesId;

      }
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
