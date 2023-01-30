// import _ from 'lodash';
import Model from '../../models/models';
// import ErrorHelpers from '../../helpers/errorHelpers';
import models from '../../entity/index';
import myRedis from '../../db/myRedis';
import CONFIG from '../../config';
import Wit from '../../services/wit';
import Facebook from '../services/facebookV2/index';
import firstEntityValue from '../../services/wit/firstEntityValue';
import redisService from '../../services/redisService';
import facebookV2 from '../services/facebookV2/index';
import clinicQueueService from './clinicQueueService';
import _ from 'lodash';
import moment from 'moment-timezone';
import axios from 'axios';
import templateCompiled from '../../utils/templateCompiled';
import template from '../../locales/vi-Vn/template';
_.templateSettings.interpolate = /{{([\s\S]+?)}}/g;
// import escapeStringRegexp from 'escape-string-regexp'

// import chatbotBlockService from '../../services/chatbotBlockService';

// eslint-disable-next-line require-jsdoc

const { chatbotTemplates, chatbotBlocks, chatbotCards, socialChannels, chatbotRegexs, clinicQueues } = models;

// eslint-disable-next-line require-jsdoc
function regExpFromString(q) {
  let flags = q.replace(/.*\/([gimuy]*)$/, '$1');

  if (flags === q) flags = '';
  const pattern = flags ? q.replace(new RegExp('^/(.*?)/' + flags + '$'), '$1') : q;

  try {
    return new RegExp(pattern, flags);
  } catch (e) {
    return null;
  }
}

// eslint-disable-next-line require-jsdoc
async function checkValidate(text, chatbotRegexsId) {
  let isCheck = false;

  await Model.findOne(chatbotRegexs, {
    where: {
      id: parseInt(chatbotRegexsId)
    }
  })
    .then(data => {
      // console.log("chatbotRegexs: ", data);
      if (data && data['dataValues']) {
        if (text.match(regExpFromString(data.regex))) {
          console.log('true');

          isCheck = true;
        } else {
          console.log('false regex');
          isCheck = false;
        }
      } else {
        console.log('false find');
        isCheck = false;
      }
    })
    .catch(error => {
      console.log('false catch');
      isCheck = false;
    });

  return isCheck;
}

export default {
  postWebhookUserEvent : (data) => {

    return;
  },
  post_webhook: async data => {
    if (data.object && data.object === 'page') {
      const entry = data.entry[0];
      const event = entry.messaging[0];

      if (event.message && !event.message.is_echo) {
        const sender = event.sender.id;
        const recipient = event.recipient.id;
        const { text, attachments } = event.message;
        const foundSocialChannel = await Model.findOne(socialChannels, {
          where: {
            link: recipient
          },
          include: [{ model: chatbotTemplates, as: 'chatbotTemplates' }]
        });

        // console.log('foundSocialChannel: ', foundSocialChannel);

        if (!foundSocialChannel) {
          return 'Khong tim thay page';
        }

        const foundChatbotTemplate = foundSocialChannel.chatbotTemplates;
        let currentSession = await myRedis.getWithoutModel(CONFIG.REDIS_PREFIX_KEY, {
          sender: sender,
          recipient: recipient,
          provider: 'facebook'
        });

        // console.log('currentSession:', currentSession);
        currentSession = JSON.parse(currentSession);

        if (
          !currentSession ||
          (currentSession.preQuestion === null && currentSession.cards && currentSession.cards.length === 0)
        ) {
          const { entities } = await Wit.getMessage({
            accessToken: foundChatbotTemplate.aiInfor[0].access_token,
            text: text
          });

          // console.log("entities: ", entities);
          const intentValue = firstEntityValue(entities, 'intent');

          console.log('intentValue: ', intentValue);
          const foundChatbotBlock = await Model.findOne(chatbotBlocks, {
            where: {
              chatbotTemplateId: foundChatbotTemplate.id,
              name: intentValue || 'default'
            },
            order: [[{ model: chatbotCards, as: 'chatbotCards' }, 'numericalOrder', 'asc']],
            include: [{ model: chatbotCards, as: 'chatbotCards', attributes: ['numericalOrder', 'dataUsers'] }]
          });

          // console.log('foundChatbotBlock: ', foundChatbotBlock);
          if (!foundChatbotBlock) {
            return 'Khong tim thay block';
          }
          currentSession = await redisService.setAndGetCurrentSession({
            prefixKey: CONFIG.REDIS_PREFIX_KEY,
            value: {
              attributes: {},
              preQuestion: null,
              cards: foundChatbotBlock.chatbotCards
            },
            filter: {
              sender: sender,
              recipient: recipient,
              provider: 'facebook'
            }
          });
        }

        if (typeof currentSession === 'object') {
          console.log('currentSession.cards: ', currentSession.cards);
          console.log('currentSession.cards[0]', currentSession.cards[0]);
          // console.log(currentSession.cards[0].dataUsers && currentSession.cards[0].dataUsers[0]);
          // console.log("currentSession.cards.length: ", parseInt(currentSession.cards[0].dataUsers.length) );
          if (
            (currentSession.preQuestion &&
              currentSession.cards &&
              currentSession.cards.length > 0 &&
              parseInt(currentSession.cards[0].dataUsers.length === 0)) ||
            (currentSession.preQuestion && currentSession.cards && currentSession.cards.length === 0)
          ) {
            currentSession.cards.shift();
            console.log('VAO TH HET QUESTION');

            if (currentSession.preQuestion['chatbotRegexsId']) {
              // eslint-disable-next-line no-await-in-loop
              if (await checkValidate(text, currentSession.preQuestion['chatbotRegexsId'])) {
                currentSession.attributes[currentSession.preQuestion['key']] = text;
                currentSession.preQuestion = null;

                // eslint-disable-next-line no-await-in-loop
                currentSession = await redisService.setAndGetCurrentSession({
                  prefixKey: CONFIG.REDIS_PREFIX_KEY,
                  value: currentSession,
                  filter: {
                    sender: sender,
                    recipient: recipient,
                    provider: 'facebook'
                  }
                });

                return;
              } else {
                // eslint-disable-next-line no-await-in-loop
                await Facebook.sendText({
                  accessToken: foundSocialChannel.token,
                  userId: sender,
                  text: currentSession.preQuestion['questionToUser']
                });

                return;
              }
            } else {
              console.log('text not validate: ', text);
              currentSession.attributes[currentSession.preQuestion['key']] = text;
              if (currentSession.preQuestion.hasOwnProperty('quickReplies')) {
                for (let i = 0; i < currentSession.preQuestion.quickReplies.length; i++) {
                  if (currentSession.preQuestion.quickReplies[i]['buttonName'] === text) {
                    // eslint-disable-next-line no-await-in-loop
                    const foundChatbotBlock = await Model.findOne(chatbotBlocks, {
                      where: {
                        chatbotTemplateId: foundChatbotTemplate.id,
                        name: currentSession.preQuestion.quickReplies[i]['buttonName'] || 'default'
                      },
                      order: [[{ model: chatbotCards, as: 'chatbotCards' }, 'numericalOrder', 'asc']],
                      include: [
                        { model: chatbotCards, as: 'chatbotCards', attributes: ['numericalOrder', 'dataUsers'] }
                      ]
                    });

                    // console.log('foundChatbotBlock: ', foundChatbotBlock);
                    if (!foundChatbotBlock) {
                      return 'Khong tim thay block';
                    }
                    // eslint-disable-next-line no-await-in-loop
                    currentSession = await redisService.setAndGetCurrentSession({
                      prefixKey: CONFIG.REDIS_PREFIX_KEY,
                      value: {
                        attributes: currentSession.attributes,
                        preQuestion: null,
                        cards: foundChatbotBlock.chatbotCards
                      },
                      filter: {
                        sender: sender,
                        recipient: recipient,
                        provider: 'facebook'
                      }
                    });
                    console.log('currentSession QUicl relies:', currentSession);
                    break;
                  }
                }
              } else {
                currentSession.preQuestion = null;

                // eslint-disable-next-line no-await-in-loop
                currentSession = await redisService.setAndGetCurrentSession({
                  prefixKey: CONFIG.REDIS_PREFIX_KEY,
                  value: currentSession,
                  filter: {
                    sender: sender,
                    recipient: recipient,
                    provider: 'facebook'
                  }
                });

                // eslint-disable-next-line no-await-in-loop
                await Facebook.sendText({
                  accessToken: foundSocialChannel.token,
                  userId: sender,
                  text: 'Xin chào quý khách!!!'
                });

                return;
              }
            }
          }
          while (currentSession.cards && currentSession.cards[0]) {
            // console.log('currentSession.cards',currentSession.cards);
            // console.log('currentSession.cards[0]',currentSession.cards[0]);
            // console.log('currentSession.cards[0].dataUsers[0]',currentSession.cards[0].dataUsers[0]);
            while (
              currentSession.cards[0] &&
              currentSession.cards[0].dataUsers &&
              currentSession.cards[0].dataUsers[0]
            ) {
              // console.log('currentSession.cards[0].dataUsers',currentSession.cards[0].dataUsers);
              // console.log('currentSession.cards[0].dataUsers[0]',currentSession.cards[0].dataUsers[0]);
              if (
                currentSession.cards[0].dataUsers[0].hasOwnProperty('key') &&
                !currentSession.cards[0].dataUsers[0].hasOwnProperty('quickReplies') &&
                !currentSession.cards[0].dataUsers[0].hasOwnProperty('redirectToBlock')
              ) {
                if (!currentSession.preQuestion) {
                  // eslint-disable-next-line no-await-in-loop
                  await Facebook.sendText({
                    accessToken: foundSocialChannel.token,
                    userId: sender,
                    text: templateCompiled(currentSession.cards[0].dataUsers[0]['questionToUser'],currentSession.attributes)
                  });
                  currentSession.preQuestion = currentSession.cards[0].dataUsers[0];
                  currentSession.cards[0].dataUsers.shift();
                  // eslint-disable-next-line no-await-in-loop
                  currentSession = await redisService.setAndGetCurrentSession({
                    prefixKey: CONFIG.REDIS_PREFIX_KEY,
                    value: currentSession,
                    filter: {
                      sender: sender,
                      recipient: recipient,
                      provider: 'facebook'
                    }
                  });

                  return;
                } else {
                  if (currentSession.preQuestion['chatbotRegexsId']) {
                    // eslint-disable-next-line no-await-in-loop
                    if (await checkValidate(text, currentSession.preQuestion['chatbotRegexsId'])) {
                      console.log('text have validate: ');
                      currentSession.attributes[currentSession.preQuestion['key']] = text;
                      currentSession.preQuestion = currentSession.cards[0].dataUsers.shift();

                      // eslint-disable-next-line no-await-in-loop
                      currentSession = await redisService.setAndGetCurrentSession({
                        prefixKey: CONFIG.REDIS_PREFIX_KEY,
                        value: currentSession,
                        filter: {
                          sender: sender,
                          recipient: recipient,
                          provider: 'facebook'
                        }
                      });

                      // eslint-disable-next-line no-await-in-loop
                      await Facebook.sendText({
                        accessToken: foundSocialChannel.token,
                        userId: sender,
                        text: templateCompiled(currentSession.preQuestion['questionToUser'],currentSession.attributes)
                      });

                      return;
                    } else {
                      // eslint-disable-next-line no-await-in-loop
                      await Facebook.sendText({
                        accessToken: foundSocialChannel.token,
                        userId: sender,
                        text: 'sai định dạng! Vui lòng nhập lại ' + templateCompiled(currentSession.preQuestion['questionToUser'],currentSession.attributes)
                      });

                      return;
                    }
                  } else {
                    console.log('text not validate: ', currentSession.preQuestion);

                    currentSession.attributes[currentSession.preQuestion['key']] = text;
                    if (currentSession.preQuestion.hasOwnProperty('quickReplies')) {
                      for (let i = 0; i < currentSession.preQuestion.quickReplies.length; i++) {
                        if (currentSession.preQuestion.quickReplies[i]['buttonName'] === text) {
                          // eslint-disable-next-line no-await-in-loop
                          const foundChatbotBlock = await Model.findOne(chatbotBlocks, {
                            where: {
                              chatbotTemplateId: foundChatbotTemplate.id,
                              name: currentSession.preQuestion.quickReplies[i]['buttonName'] || 'default'
                            },
                            order: [[{ model: chatbotCards, as: 'chatbotCards' }, 'numericalOrder', 'asc']],
                            include: [
                              { model: chatbotCards, as: 'chatbotCards', attributes: ['numericalOrder', 'dataUsers'] }
                            ]
                          });

                          // console.log('foundChatbotBlock: ', foundChatbotBlock);
                          if (!foundChatbotBlock) {
                            return 'Khong tim thay block';
                          }
                          // eslint-disable-next-line no-await-in-loop
                          currentSession = await redisService.setAndGetCurrentSession({
                            prefixKey: CONFIG.REDIS_PREFIX_KEY,
                            value: {
                              attributes: {},
                              preQuestion: null,
                              cards: foundChatbotBlock.chatbotCards
                            },
                            filter: {
                              sender: sender,
                              recipient: recipient,
                              provider: 'facebook'
                            }
                          });
                          console.log('currentSession QUicl relies:', currentSession);

                          return;
                        }
                      }
                    } else {
                      currentSession.preQuestion = currentSession.cards[0].dataUsers.shift();
                    }

                    // eslint-disable-next-line no-await-in-loop
                    currentSession = await redisService.setAndGetCurrentSession({
                      prefixKey: CONFIG.REDIS_PREFIX_KEY,
                      value: currentSession,
                      filter: {
                        sender: sender,
                        recipient: recipient,
                        provider: 'facebook'
                      }
                    });

                    // eslint-disable-next-line no-await-in-loop
                    await Facebook.sendText({
                      accessToken: foundSocialChannel.token,
                      userId: sender,
                      text: templateCompiled(currentSession.preQuestion['questionToUser'],currentSession.attributes)
                    });

                    return;
                  }
                }
              } else if (
                currentSession.cards[0].dataUsers[0].hasOwnProperty('messageToUser') ||
                currentSession.cards[0].dataUsers[0].hasOwnProperty('path') ||
                currentSession.cards[0].dataUsers[0].hasOwnProperty('redirectToBlock') ||
                currentSession.cards[0].dataUsers[0].hasOwnProperty('quickReplies')
              ) {
                console.log('not key');
                if (currentSession.cards[0].dataUsers[0]['messageToUser']) {
                  console.log('Da vao messageToUser ======================');
                  // eslint-disable-next-line no-await-in-loop
                  await Facebook.sendText({
                    accessToken: foundSocialChannel.token,
                    userId: sender,
                    text: templateCompiled(currentSession.cards[0].dataUsers[0]['messageToUser'], currentSession.attributes)
                  });
                  currentSession.cards[0].dataUsers.shift();
                  console.log('currentSession dataUsers: ', currentSession.cards[0]);
                } else if (currentSession.cards[0].dataUsers[0]['path']) {
                  // eslint-disable-next-line no-await-in-loop
                  await Facebook.sendFile({
                    accessToken: foundSocialChannel.token,
                    userId: sender,
                    url: currentSession.cards[0].dataUsers[0]['path']
                  });
                  currentSession.cards[0].dataUsers.shift();
                } else if (currentSession.cards[0].dataUsers[0]['redirectToBlock']) {
                  // eslint-disable-next-line no-await-in-loop
                  console.log('da vao redirectToBlock');
                  console.log('currentSession.cards', currentSession.cards);
                  // eslint-disable-next-line no-await-in-loop
                  await Model.findOne(chatbotBlocks, {
                    where: {
                      chatbotTemplateId: foundChatbotTemplate.id,
                      name: currentSession.cards[0].dataUsers[0]['redirectToBlock']
                    },
                    order: [[{ model: chatbotCards, as: 'chatbotCards' }, 'numericalOrder', 'asc']],
                    include: [{ model: chatbotCards, as: 'chatbotCards', attributes: ['numericalOrder', 'dataUsers'] }]
                  }).then(async foundChatbotBlock => {
                    // console.log('foundChatbotBlock: ', foundChatbotBlock);
                    if (foundChatbotBlock && foundChatbotBlock['dataValues']) {
                      currentSession = await redisService.setAndGetCurrentSession({
                        prefixKey: CONFIG.REDIS_PREFIX_KEY,
                        value: {
                          attributes: currentSession.attributes || {},
                          preQuestion: null,
                          cards: foundChatbotBlock.chatbotCards
                        },
                        filter: {
                          sender: sender,
                          recipient: recipient,
                          provider: 'facebook'
                        }
                      });
                    } else {
                      await Facebook.sendText({
                        accessToken: foundSocialChannel.token,
                        userId: sender,
                        text: 'Xin chào bạn!'
                      });

                      currentSession.cards.shift();
                      currentSession = await redisService.setAndGetCurrentSession({
                        prefixKey: CONFIG.REDIS_PREFIX_KEY,
                        value: currentSession,
                        filter: {
                          sender: sender,
                          recipient: recipient,
                          provider: 'facebook'
                        }
                      });
                    }
                  });
                } else if (currentSession.cards[0].dataUsers[0]['quickReplies']) {
                  console.log('Da vao QUICK RELIES ======================');
                  currentSession.preQuestion = currentSession.cards[0].dataUsers[0];
                  // eslint-disable-next-line no-await-in-loop
                  await facebookV2
                    .sendQuickReplies({
                      accessToken: foundSocialChannel.token,
                      userId: sender,
                      text: 'Mời lựa chọn: ',
                      quickReplies: currentSession.cards[0].dataUsers[0]['quickReplies'].map(e => e.buttonName)
                    })
                    .then(dataQuick => {
                      console.log('dataQuick: ', dataQuick);
                      currentSession.cards[0].dataUsers.shift();
                      console.log('currentSession dataUsers: ', currentSession.cards[0]);
                    });
                }

                if (currentSession.cards && currentSession.cards[0] && currentSession.cards[0].dataUsers.length === 0) {
                  console.log('currentSession.cards[0].dataUsers.length === 0');
                  currentSession.cards.shift();
                }
                // eslint-disable-next-line no-await-in-loop
                currentSession = await redisService.setAndGetCurrentSession({
                  prefixKey: CONFIG.REDIS_PREFIX_KEY,
                  value: currentSession,
                  filter: {
                    sender: sender,
                    recipient: recipient,
                    provider: 'facebook'
                  }
                });

                // console.log("currentSession dataUsers: ", currentSession.cards[0].dataUsers);
              } else if (currentSession.cards[0].dataUsers[0].hasOwnProperty('url')) {
                console.log('Vao TH co url: ');
                if (
                  currentSession.cards[0].dataUsers[0]['url'] === CONFIG.CLINIC_QUEUES_API
                ) {
                  if (currentSession.cards[0].dataUsers[0].method === 'post') {
                    console.log('Vao TH co url  nha thuoc: ');
                    const questionGPP = [
                      { index: 0, key: 'servicesId', questionToUser: 'Mời bạn chọn dịch vụ:' },
                      { index: 1, key: 'servicePackagesId', questionToUser: 'Mời bạn chọn gói dịch vụ:' },
                      { index: 2, key: 'dateScheduled', questionToUser: 'Mời bạn chọn ngày khám:', chatbotRegexsId: 6 },
                      {
                        index: 3,
                        key: 'timeScheduled',
                        questionToUser: 'Mời bạn chọn giờ khám:',
                        chatbotRegexsId: null
                      }
                    ];

                    if (
                      !currentSession.preQuestion ||
                      (currentSession.preQuestion && !currentSession.preQuestion.hasOwnProperty('index'))
                    ) {
                      console.log('Vao Th khong cos preQuestion');
                      currentSession.preQuestion = questionGPP[0];

                      // eslint-disable-next-line no-await-in-loop
                      currentSession = await redisService.setAndGetCurrentSession({
                        prefixKey: CONFIG.REDIS_PREFIX_KEY,
                        value: currentSession,
                        filter: {
                          sender: sender,
                          recipient: recipient,
                          provider: 'facebook'
                        }
                      });
                      // eslint-disable-next-line no-await-in-loop
                      await clinicQueueService.send_quick_relies_service(
                        foundSocialChannel.placesId,
                        questionGPP[0].questionToUser,
                        foundSocialChannel.token,
                        sender
                      );

                      return;
                    }

                    while (parseInt(currentSession.preQuestion.index) <= 3) {
                      console.log('Vao th tiep theo cua question');
                      if (currentSession.preQuestion['chatbotRegexsId']) {
                        // eslint-disable-next-line no-await-in-loop
                        if (await checkValidate(text, currentSession.preQuestion['chatbotRegexsId'])) {
                          console.log('Vao TH pass validate');
                          currentSession.attributes[currentSession.preQuestion['key']] = text;
                          currentSession.preQuestion = questionGPP[parseInt(currentSession.preQuestion.index) + 1]; // tiep tuc cau hoi tiep theo
                          // eslint-disable-next-line no-await-in-loop
                          currentSession = await redisService.setAndGetCurrentSession({
                            prefixKey: CONFIG.REDIS_PREFIX_KEY,
                            value: currentSession,
                            filter: {
                              sender: sender,
                              recipient: recipient,
                              provider: 'facebook'
                            }
                          });

                          if (currentSession.preQuestion.key === 'servicePackagesId') {
                            // eslint-disable-next-line no-await-in-loop
                            await clinicQueueService.send_quick_relies_service_package(
                              foundSocialChannel.placesId,
                              currentSession.attributes['servicesId'],
                              currentSession.preQuestion.questionToUser,
                              foundSocialChannel.token,
                              sender
                            );

                            return;
                          } else if (currentSession.preQuestion.key === 'dateScheduled') {
                            // eslint-disable-next-line no-await-in-loop
                            await clinicQueueService.send_date_scheduled(
                              currentSession.preQuestion.questionToUser,
                              foundSocialChannel.token,
                              sender
                            );

                            return;
                          } else if (currentSession.preQuestion.key === 'timeScheduled') {
                            const date = currentSession.attributes['dateScheduled'];
                            const servicePackagesId = currentSession.attributes['servicePackagesId'];

                            // eslint-disable-next-line no-await-in-loop
                            const rely = await clinicQueueService.send_time_scheduled(
                              date,
                              foundSocialChannel.id,
                              foundSocialChannel.placesId,
                              currentSession.preQuestion.questionToUser,
                              foundSocialChannel.token,
                              sender,
                              servicePackagesId
                            );

                            console.log('rely: ', rely);
                            currentSession.rely = rely;
                            currentSession.indexOfSchedileTime = 1;

                            // eslint-disable-next-line no-await-in-loop
                            currentSession = await redisService.setAndGetCurrentSession({
                              prefixKey: CONFIG.REDIS_PREFIX_KEY,
                              value: currentSession,
                              filter: {
                                sender: sender,
                                recipient: recipient,
                                provider: 'facebook'
                              }
                            });

                            return;
                          }
                        } else {
                          if (currentSession.preQuestion.key === 'servicesId') {
                            console.log('Vao TH  not pass validate');
                            // eslint-disable-next-line no-await-in-loop
                            await clinicQueueService.send_quick_relies_service(
                              foundSocialChannel.placesId,
                              currentSession.preQuestion.questionToUser,
                              foundSocialChannel.token,
                              sender
                            );
                          } else if (currentSession.preQuestion.key === 'servicePackagesId') {
                            console.log('Vao TH  not pass validate');
                            // eslint-disable-next-line no-await-in-loop
                            await clinicQueueService.send_quick_relies_service_package(
                              foundSocialChannel.placesId,
                              currentSession.attributes['servicesId'],
                              currentSession.preQuestion.questionToUser,
                              foundSocialChannel.token,
                              sender
                            );
                          } else if (currentSession.preQuestion.key === 'dateScheduled') {
                            // eslint-disable-next-line no-await-in-loop
                            await clinicQueueService.send_date_scheduled(
                              currentSession.preQuestion.questionToUser,
                              foundSocialChannel.token,
                              sender
                            );
                          } else if (currentSession.preQuestion.key === 'timeScheduled') {
                            const date = currentSession.attributes['dateScheduled'];
                            const servicePackagesId = currentSession.attributes['servicePackagesId'];

                            // eslint-disable-next-line no-await-in-loop
                            const rely = await clinicQueueService.send_time_scheduled(
                              date,
                              foundSocialChannel.id,
                              foundSocialChannel.placesId,
                              currentSession.preQuestion.questionToUser,
                              foundSocialChannel.token,
                              sender,
                              servicePackagesId
                            );

                            currentSession.indexOfSchedileTime = 1;

                            console.log('rely: ', rely);
                            currentSession.rely = rely;

                            // eslint-disable-next-line no-await-in-loop
                            currentSession = await redisService.setAndGetCurrentSession({
                              prefixKey: CONFIG.REDIS_PREFIX_KEY,
                              value: currentSession,
                              filter: {
                                sender: sender,
                                recipient: recipient,
                                provider: 'facebook'
                              }
                            });
                          }
                        }
                      } else {
                        console.log('Vao Th khong cos validate');

                        // lay gia tri cua cac cau hoi
                        if (currentSession.preQuestion.key === 'servicesId') {
                          const arrayService = _.split(text, '.', 2);

                          currentSession.attributes.services = arrayService[1];
                          currentSession.attributes.servicesId = arrayService[0];
                        } else if (currentSession.preQuestion.key === 'servicePackagesId') {
                          const arrayServicePackages = _.split(text, '.', 3);

                          currentSession.attributes.servicePackages = arrayServicePackages[2];
                          currentSession.attributes.usersDoctorId = arrayServicePackages[1];
                          currentSession.attributes.servicePackagesId = arrayServicePackages[0];
                        } else if (currentSession.preQuestion.key === 'timeScheduled') {
                          console.log('arrayTime text', text);
                          if (text === 'xemthem') {
                            const relyParent = currentSession.rely || [];
                            const indexOfList = currentSession.indexOfSchedileTime;
                            let rely;

                            if (indexOfList > relyParent.length) {
                              rely = _.slice(relyParent, 0, 12);
                              rely.push('xemthem');
                              currentSession.indexOfSchedileTime = 0;
                            } else {
                              currentSession;
                              rely = _.slice(relyParent, indexOfList, indexOfList + 11);
                              currentSession.indexOfSchedileTime = indexOfList + 11;
                              rely.unshift('trolai');
                              rely.push('xemthem');
                            }

                            // eslint-disable-next-line no-await-in-loop
                            await facebookV2
                              .sendQuickReplies({
                                accessToken: foundSocialChannel.token,
                                userId: sender,
                                text:templateCompiled(text,currentSession.attributes),
                                quickReplies: rely
                              })
                              .then(async dataQuick => {
                                console.log('dataQuick: ', dataQuick);
                                currentSession = await redisService.setAndGetCurrentSession({
                                  prefixKey: CONFIG.REDIS_PREFIX_KEY,
                                  value: currentSession,
                                  filter: {
                                    sender: sender,
                                    recipient: recipient,
                                    provider: 'facebook'
                                  }
                                });
                              });

                            return;
                          } else if (text === 'trolai') {
                            const relyParent = currentSession.rely;
                            let rely;
                            const indexOfList = currentSession.indexOfSchedileTime;

                            if (indexOfList === 0) {
                              rely = _.slice(relyParent, 0, 12);
                              rely.push('xemthem');
                            } else {
                              rely = _.slice(relyParent, indexOfList - 11, indexOfList);
                              currentSession.indexOfSchedileTime = indexOfList - 11;
                              rely.unshift('trolai');
                              rely.push('xemthem');
                            }

                            // eslint-disable-next-line no-await-in-loop
                            await facebookV2
                              .sendQuickReplies({
                                accessToken: foundSocialChannel.token,
                                userId: sender,
                                text:templateCompiled(text,currentSession.attributes),
                                quickReplies: rely
                              })
                              .then(async dataQuick => {
                                console.log('dataQuick: ', dataQuick);
                                currentSession = await redisService.setAndGetCurrentSession({
                                  prefixKey: CONFIG.REDIS_PREFIX_KEY,
                                  value: currentSession,
                                  filter: {
                                    sender: sender,
                                    recipient: recipient,
                                    provider: 'facebook'
                                  }
                                });
                              });

                            return;
                          } else {
                            const arrayTime = _.split(text, '.', 2);

                            currentSession.attributes.ordinalNumber = arrayTime[0];
                            currentSession.attributes.time = arrayTime[1];
                            const secondsToMinutes = arrayTime[1];

                            console.log('book.time', arrayTime[1]);

                            const minutes = secondsToMinutes.split(':')[1];
                            const hours = secondsToMinutes.split(':')[0];

                            currentSession.attributes.dateScheduled = moment(
                              currentSession.attributes.dateScheduled,
                              'DD/MM/YYYY'
                            )
                              .add(hours, 'hours')
                              .add(minutes, 'minutes')
                              .toDate();
                            const data = currentSession.attributes;
                            const body = {
                              name: data.name,
                              mobile: data.mobile,
                              usersCreatorId: 1,
                              placesId: foundSocialChannel.placesId,
                              // birthday: Date.now(),
                              usersDoctorId: data.usersDoctorId,
                              ordinalNumber: data.ordinalNumber,
                              descriptions: data.descriptions || ' ',
                              servicePackagesId: data.servicePackagesId,
                              dateScheduled: data.dateScheduled,
                              status: 1,
                              channelsId: foundSocialChannel.id,
                              recipientId: sender,
                              birthday:
                                moment(data.birthday, 'DD/MM/YYYY').format('YYYY-MM-DD') ||
                                moment(data.birthday, 'DD-MM-YYYY').format('YYYY-MM-DD') ||
                                moment()
                            };

                            console.log('body: ', body);
                            // eslint-disable-next-line no-await-in-loop
                            await axios({
                              method: currentSession.cards[0].dataUsers[0]['method'],
                              url: currentSession.cards[0].dataUsers[0]['url'],
                              data: body,
                              headers: {
                                'Content-Type': 'application/json'
                              }
                            }).then(async dataExios => {
                              console.log('data exios: ', dataExios);
                              console.log('currentSession: ', currentSession);
                              console.log('currentSession 1 : ', currentSession.cards[0]);
                              console.log('currentSession 2: ', currentSession.cards[1]);
                              if (dataExios.status === 200) {
                                currentSession = await redisService.setAndGetCurrentSession({
                                  prefixKey: CONFIG.REDIS_PREFIX_KEY,
                                  value: currentSession,
                                  filter: {
                                    sender: sender,
                                    recipient: recipient,
                                    provider: 'facebook'
                                  }
                                });
                                currentSession.cards[0].dataUsers.shift();

                                console.log('currentSession: ', currentSession);
                                await Facebook.sendText({
                                  accessToken: foundSocialChannel.token,
                                  userId: sender,
                                  text: 'Bạn đặt lịch thành công'
                                });
                              } else {
                                currentSession.cards[0].dataUsers.shift();
                                await Facebook.sendText({
                                  accessToken: foundSocialChannel.token,
                                  userId: sender,
                                  text: 'Bạn đặt lịch không thành công'
                                });
                              }
                            });
                            console.log('Thoat ra khoi while 3 phan tu');
                            break;
                          }
                        } else {
                          currentSession.attributes[currentSession.preQuestion['key']] = text;
                        }
                        console.log('Thoat ra khoi while 3 khong thanh cong neu in dong nay');
                        currentSession.preQuestion = questionGPP[parseInt(currentSession.preQuestion.index) + 1]; // tiep tuc cau hoi tiep theo
                        // eslint-disable-next-line no-await-in-loop
                        currentSession = await redisService.setAndGetCurrentSession({
                          prefixKey: CONFIG.REDIS_PREFIX_KEY,
                          value: currentSession,
                          filter: {
                            sender: sender,
                            recipient: recipient,
                            provider: 'facebook'
                          }
                        });

                        if (currentSession.preQuestion.key === 'servicePackagesId') {
                          // eslint-disable-next-line no-await-in-loop
                          await clinicQueueService.send_quick_relies_service_package(
                            foundSocialChannel.placesId,
                            currentSession.attributes['servicesId'],
                            currentSession.preQuestion.questionToUser,
                            foundSocialChannel.token,
                            sender
                          );

                          return;
                        } else if (currentSession.preQuestion.key === 'dateScheduled') {
                          // eslint-disable-next-line no-await-in-loop
                          await clinicQueueService.send_date_scheduled(
                            currentSession.preQuestion.questionToUser,
                            foundSocialChannel.token,
                            sender
                          );

                          return;
                        } else if (currentSession.preQuestion.key === 'timeScheduled') {
                          const date = currentSession.attributes['dateScheduled'];
                          const servicePackagesId = currentSession.attributes['servicePackagesId'];

                          // eslint-disable-next-line no-await-in-loop
                          const rely = await clinicQueueService.send_time_scheduled(
                            date,
                            foundSocialChannel.id,
                            foundSocialChannel.placesId,
                            currentSession.preQuestion.questionToUser,
                            foundSocialChannel.token,
                            sender,
                            servicePackagesId
                          );

                          currentSession.indexOfSchedileTime = 1;
                          currentSession.rely = rely;

                          // eslint-disable-next-line no-await-in-loop
                          currentSession = await redisService.setAndGetCurrentSession({
                            prefixKey: CONFIG.REDIS_PREFIX_KEY,
                            value: currentSession,
                            filter: {
                              sender: sender,
                              recipient: recipient,
                              provider: 'facebook'
                            }
                          });

                          return;
                        }
                      }
                    }
                  } else if (currentSession.cards[0].dataUsers[0].method === 'get') {
                    const mobile = currentSession.attributes[currentSession.cards[0].dataUsers[0].body['mobile']];
                    const date = currentSession.attributes[currentSession.cards[0].dataUsers[0].body['dateScheduled']];

                    console.log('mobile: ', mobile);
                    console.log('date: ', date);

                    // eslint-disable-next-line no-await-in-loop
                    await clinicQueueService.check_schedule_queue(
                      date,
                      mobile,
                      foundSocialChannel.placesId,
                      foundSocialChannel.token,
                      sender
                    );
                    currentSession.cards[0].dataUsers.shift();
                  } else if (currentSession.cards[0].dataUsers[0].method === 'put') {
                    const date = currentSession.attributes[currentSession.cards[0].dataUsers[0].body['dateScheduled']];
                    // eslint-disable-next-line no-await-in-loop
                    const arrayTime = _.split(text, '.', 2);

                    console.log('text: ', text);
                    console.log('arrayTime: ', arrayTime);
                    console.log('dateScheduled: ', date);
                    console.log(
                      "currentSession.cards[0].dataUsers[0].body['dateScheduled']: ",
                      currentSession.cards[0].dataUsers[0].body['dateScheduled']
                    );
                    console.log('currentSession.attributes: ', currentSession.attributes);
                    if (text === 'xemthem') {
                      const relyParent = currentSession.rely || [];
                      const indexOfList = currentSession.indexOfSchedileTime;
                      let rely;

                      if (indexOfList > relyParent.length) {
                        rely = _.slice(relyParent, 0, 12);
                        rely.push('xemthem');
                        currentSession.indexOfSchedileTime = 0;
                      } else {
                        currentSession;
                        rely = _.slice(relyParent, indexOfList, indexOfList + 11);
                        currentSession.indexOfSchedileTime = indexOfList + 11;
                        rely.unshift('trolai');
                        rely.push('xemthem');
                      }

                      // eslint-disable-next-line no-await-in-loop
                      await facebookV2
                        .sendQuickReplies({
                          accessToken: foundSocialChannel.token,
                          userId: sender,
                          text: 'Mời bạn chọn giờ khám: ',
                          quickReplies: rely
                        })
                        .then(async dataQuick => {
                          console.log('dataQuick: ', dataQuick);
                          currentSession = await redisService.setAndGetCurrentSession({
                            prefixKey: CONFIG.REDIS_PREFIX_KEY,
                            value: currentSession,
                            filter: {
                              sender: sender,
                              recipient: recipient,
                              provider: 'facebook'
                            }
                          });
                        });

                      return;
                    } else if (text === 'trolai') {
                      const relyParent = currentSession.rely;
                      let rely;
                      const indexOfList = currentSession.indexOfSchedileTime;

                      if (indexOfList === 0) {
                        rely = _.slice(relyParent, 0, 12);
                        rely.push('xemthem');
                      } else {
                        rely = _.slice(relyParent, indexOfList - 11, indexOfList);
                        currentSession.indexOfSchedileTime = indexOfList - 11;
                        rely.unshift('trolai');
                        rely.push('xemthem');
                      }

                      // eslint-disable-next-line no-await-in-loop
                      await facebookV2
                        .sendQuickReplies({
                          accessToken: foundSocialChannel.token,
                          userId: sender,
                          text: 'Mời bạn chọn giờ khám: ',
                          quickReplies: rely
                        })
                        .then(async dataQuick => {
                          console.log('dataQuick: ', dataQuick);
                          currentSession = await redisService.setAndGetCurrentSession({
                            prefixKey: CONFIG.REDIS_PREFIX_KEY,
                            value: currentSession,
                            filter: {
                              sender: sender,
                              recipient: recipient,
                              provider: 'facebook'
                            }
                          });
                        });

                      return;
                    } else if (text && Array.isArray(arrayTime) && arrayTime.length === 2) {
                      const secondsToMinutes = arrayTime[1];
                      const minutes = secondsToMinutes.split(':')[1];
                      const hours = secondsToMinutes.split(':')[0];

                      const dateScheduled = moment(date, 'DD/MM/YYYY')
                        .add(hours, 'hours')
                        .add(minutes, 'minutes')
                        .toDate();

                      const ordinalNumber = arrayTime[0];

                      // eslint-disable-next-line no-await-in-loop
                      const param = {
                        filterSocial: {
                          recipientId: sender,
                          channelsId: foundSocialChannel.id
                        }
                      };

                      // eslint-disable-next-line no-await-in-loop
                      await clinicQueueService.check_exists(param).then(async clinicQueuesFound => {
                        console.log('clinicQueuesFound', clinicQueuesFound);
                        if (clinicQueuesFound) {
                          await clinicQueues
                            .update(
                              {
                                dateScheduled,
                                ordinalNumber
                              },
                              { where: { id: clinicQueuesFound.id } }
                            )
                            .then(async dataUpdate => {
                              if (dataUpdate[0] === 1) {
                                await facebookV2
                                  .sendText({
                                    accessToken: foundSocialChannel.token,
                                    userId: sender,
                                    text: 'Cập nhật lịch khám thành công! Xin cảm ơn quý khách <3'
                                  })
                                  .then(dataSendText => {
                                    console.log('dataSendText: ', dataSendText);
                                    currentSession.cards[0].dataUsers.shift();
                                    currentSession.preQuestion = null;
                                  });
                              } else {
                                await facebookV2
                                  .sendText({
                                    accessToken: foundSocialChannel.token,
                                    userId: sender,
                                    text: 'Cập nhật lịch khám không thành công! Xin cảm ơn quý khách <3'
                                  })
                                  .then(dataSendText => {
                                    console.log('dataSendText: ', dataSendText);
                                    currentSession.cards[0].dataUsers.shift();
                                    currentSession.preQuestion = null;
                                  });
                              }
                            });
                        } else {
                          await facebookV2
                            .sendText({
                              accessToken: foundSocialChannel.token,
                              userId: sender,
                              text: 'Không tìm thấy quý khách trong hệ thống vui lòng đặt lịch!'
                            })
                            .then(dataSendText => {
                              console.log('dataSendText: ', dataSendText);
                              currentSession.cards[0].dataUsers.shift();
                              currentSession.preQuestion = null;
                            });
                        }
                      });
                    } else {
                      console.log('Vao TH sai ngay thang');
                      // eslint-disable-next-line no-await-in-loop
                      const rely = await clinicQueueService.update_schedule_queue(
                        date,
                        foundSocialChannel.placesId,
                        foundSocialChannel.token,
                        sender,
                        foundSocialChannel.id
                      );

                      console.log('rely: ', rely);
                      currentSession.rely = rely;
                      currentSession.indexOfSchedileTime = 1;

                      // eslint-disable-next-line no-await-in-loop
                      currentSession = await redisService.setAndGetCurrentSession({
                        prefixKey: CONFIG.REDIS_PREFIX_KEY,
                        value: currentSession,
                        filter: {
                          sender: sender,
                          recipient: recipient,
                          provider: 'facebook'
                        }
                      });

                      return;
                    }

                    /* else if (currentSession.cards[0].dataUsers[0].method === 'delete') {

                  } */
                  } else if (currentSession.cards[0].dataUsers[0].method === 'delete') {
                    const date = currentSession.attributes[currentSession.cards[0].dataUsers[0].body['dateScheduled']];
                    const datetime = moment(date, 'DD/MM/YYYY').format('YYYY-MM-DD');

                    console.log('datetime: ', datetime);
                    const param = {
                      filter: {
                        $and: {
                          dateScheduled: {
                            $gte: moment(datetime)
                              .add(0, 'seconds')
                              .add(0, 'minutes')
                              .add(0, 'hours')
                              .format('YYYY-MM-DD HH:mm:ss'),
                            $lte: moment(datetime)
                              .add(59, 'seconds')
                              .add(59, 'minutes')
                              .add(23, 'hours')
                              .format('YYYY-MM-DD HH:mm:ss')
                          },
                          placesId: foundSocialChannel.placesId,
                          status: true
                        }
                      },
                      filterSocial: {
                        recipientId: sender,
                        channelsId: foundSocialChannel.id
                      }
                    };

                    console.log('param test ', param);
                    // eslint-disable-next-line no-await-in-loop
                    const clinicQueuesFound = await clinicQueueService.check_exists(param);

                    console.log('clinicQueuesFound ', clinicQueuesFound);
                    if (clinicQueuesFound) {
                      // eslint-disable-next-line no-await-in-loop
                      await clinicQueues
                        .update({ status: -1 }, { where: { id: clinicQueuesFound.id } })
                        .then(async dataUpdate => {
                          console.log('dataUpdate: ', dataUpdate);
                          if (dataUpdate[0] === 1) {
                            await facebookV2
                              .sendText({
                                accessToken: foundSocialChannel.token,
                                userId: sender,
                                text:
                                  'Hủy lịch thành công!Hẹn gặp lại quý khách! Vui lòng nhắn tin để sử dụng tiếp dịch vụ'
                              })
                              .then(dataSendText => {
                                console.log('dataSendText: ', dataSendText);
                                currentSession.cards[0].dataUsers.shift();
                                currentSession.preQuestion = null;
                              });
                          } else {
                            await facebookV2
                              .sendText({
                                accessToken: foundSocialChannel.token,
                                userId: sender,
                                text:
                                  'Hủy lịch không thành công!Hẹn gặp lại quý khách! Vui lòng nhắn tin để sử dụng tiếp dịch vụ'
                              })
                              .then(dataSendText => {
                                console.log('dataSendText: ', dataSendText);
                                currentSession.cards[0].dataUsers.shift();
                                currentSession.preQuestion = null;
                              });
                          }
                        });
                      // eslint-disable-next-line no-await-in-loop
                    } else {
                      // eslint-disable-next-line no-await-in-loop
                      await facebookV2
                        .sendText({
                          accessToken: foundSocialChannel.token,
                          userId: sender,
                          text:
                            'Hủy lịch không thành công!Hẹn gặp lại quý khách! Vui lòng nhắn tin để sử dụng tiếp dịch vụ'
                        })
                        .then(dataSendText => {
                          console.log('dataSendText: ', dataSendText);
                          currentSession.cards[0].dataUsers.shift();
                          currentSession.preQuestion = null;
                        });
                    }
                  }
                } else {
                  // eslint-disable-next-line no-await-in-loop
                  const method = templateCompiled(currentSession.cards[0].dataUsers[0]['method'],currentSession.attributes);
                  const url = templateCompiled(currentSession.cards[0].dataUsers[0]['url'],currentSession.attributes);
                  const data = JSON.parse(templateCompiled(JSON.stringify(currentSession.cards[0].dataUsers[0]['body']),currentSession.attributes));
                  const headers = templateCompiled(currentSession.cards[0].dataUsers[0]['headers'],currentSession.attributes);

                  await axios({
                    method,
                    url,
                    data,
                    headers: {
                      'Content-Type': 'application/json'
                    } || headers
                  })
                    .then(async function(response) {
                      // console.log("kết thúc response -----------------------------------------------------------------",response.data);
                      console.log('Ket noi thanh cong**********************************');

                      // return  { data: response.data };
                      await facebookV2
                        .sendText({
                          accessToken: foundSocialChannel.token,
                          userId: sender,
                          text: templateCompiled(response.data, currentSession.attributes)
                        })
                        .then(dataSendText => {
                          console.log('dataSendText: ', dataSendText);
                        });
                    })
                    .catch(async function(error) {
                      console.log('Ket noi that bai**********************************');
                      console.log(
                        'kết thúc error -----------------------------------------------------------------',
                        error.response.data.error
                      );

                      await facebookV2
                        .sendText({
                          accessToken: foundSocialChannel.token,
                          userId: sender,
                          text: error.data
                        })
                        .then(dataSendText => {
                          console.log('dataSendText: ', dataSendText);
                        });
                    });
                }
              }
            }
            console.log('in currentSession while trong truoc: ', currentSession);
            currentSession.cards.shift();

            if (currentSession.preQuestion) {
              currentSession.attributes[currentSession.preQuestion['key']] = text;
            }

            // eslint-disable-next-line no-await-in-loop
            currentSession = await redisService.setAndGetCurrentSession({
              prefixKey: CONFIG.REDIS_PREFIX_KEY,
              value: currentSession,
              filter: {
                sender: sender,
                recipient: recipient,
                provider: 'facebook'
              }
            });

            console.log('in currentSession while trong sau: ', currentSession);
            if (currentSession.cards.length === 0) {
              // eslint-disable-next-line no-await-in-loop
              return;
            }
          }
        }
      }
    }
  }
};
