import Model from '../../models/models';
// import ErrorHelpers from '../../helpers/errorHelpers';
import models from '../../entity/index';
import myRedis from '../../db/myRedis';
import CONFIG from '../../config';
import Wit from '../../services/wit';

import firstEntityValue from '../../services/wit/firstEntityValue';
import redisService from '../../services/redisService';
import clinicQueueService from './clinicQueueService';
import _ from 'lodash';
import moment from 'moment-timezone';
import axios from 'axios';
import templateCompiled from '../../utils/templateCompiled';
import filterHelpers from '../../helpers/filterHelpers';
import { chatbotBlockIntent } from '../../utils/helper';
import { checkValidate, convertCards } from '../../utils/chatbot';
import Zalo from '../../services/zalo/index';
const tz = 'ASIA/Ho_Chi_Minh';
_.templateSettings.interpolate = /{{([\s\S]+?)}}/g;

const { chatbotTemplates, chatbotBlocks, chatbotCards, socialChannels, chatbotRegexs, clinicQueues } = models;

export default {

  /**
   * @param {Object} params
   * */
  postWebhook: async params => {
    console.log(params);
    const finalResult = {
      message: null,
      isNext: false
    };
    const provider = 'zalo';
    // const event = params['event'];
    // const appId = params['appid'];
    let text = '';
    let sender = '';
    let recipient = '1';
    const { message } = params;

    if (Object.keys(params).length <= 1) {
      return finalResult;
    }
    try {
      text = message['text'];
      sender = params['sender']['id'];
      recipient = params['recipient']['id'];

    } catch (e) {
      text = message['text'];
      sender = params['fromuid'];
      recipient = params['oaid'];
    }

    let currentSession = await myRedis.getWithoutModel(CONFIG.REDIS_PREFIX_KEY, {
      sender: sender,
      recipient: recipient,
      provider
    });

    // console.log('currentSession:', currentSession);
    currentSession = JSON.parse(currentSession);
    console.log('currentSession',currentSession);
    if (currentSession && currentSession.directContact && currentSession.directContactExpired) {
      if (new Date(currentSession.directContactExpired).getTime() < new Date().getTime()) {
        currentSession.directContact = false;
        currentSession = await redisService.setAndGetCurrentSession({
          prefixKey: CONFIG.REDIS_PREFIX_KEY,
          value: currentSession,
          filter: {
            sender: sender,
            recipient: recipient,
            provider
          }
        });
      } else {
        finalResult.message = 'Chuyển sang liên hệ trực tiếp';
        finalResult.isNext = true;

        return finalResult;
      }
    }
    if (text) {
      const foundSocialChannel = await Model.findOne(socialChannels, {
        where: {
          link: recipient
        },
        include: [{ model: chatbotTemplates, as: 'chatbotTemplates' }]
      });

      // console.log('foundSocialChannel: ', foundSocialChannel);

      if (!foundSocialChannel) {

        finalResult.message = 'Không tồn tại page';
        // finalResult.isNext = true;

        return finalResult;
      }

      const foundChatbotTemplate = foundSocialChannel.chatbotTemplates;

      if (!foundChatbotTemplate) {
        finalResult.isNext = true;
        finalResult.message = 'Không tồn tại chatbotTemplate';

        return finalResult;
      }
      let currentSession = await myRedis.getWithoutModel(CONFIG.REDIS_PREFIX_KEY, {
        sender: sender,
        recipient: recipient,
        provider
      });

      // console.log('currentSession:', currentSession);
      currentSession = JSON.parse(currentSession);

      if (
        !currentSession ||
        (currentSession.preQuestion === null && currentSession.cards && currentSession.cards.length === 0)
      ) {
        const { intents } = await Wit.getMessage({
          accessToken: foundChatbotTemplate.aiInfor[0].access_token,
          text: text
        });

        console.log('intents: ', intents);
        let intentValue = chatbotBlockIntent('Mở đầu');

        if (intents && Array.isArray(intents) && intents[0] && intents[0].name && intents[0].confidence) {
          intentValue = Number(intents[0].confidence) > 0.7 ? intents[0].name : intentValue;
        }

        console.log('intentValue: ', intentValue);

        let whereFilter = {
          chatbotTemplateId: foundChatbotTemplate.id,
          intent: intentValue,
          status: true
        };

        whereFilter = awaitfilterHelpers.makeStringFilterRelatively(['intent'], whereFilter,'chatbotBlocks');

        const foundChatbotBlock = await Model.findOne(chatbotBlocks, {
          where: whereFilter,
          order: [[{ model: chatbotCards, as: 'chatbotCards' }, 'numericalOrder', 'asc']],
          include: [{ model: chatbotCards, as: 'chatbotCards', attributes: ['numericalOrder', 'dataUsers'] }]
          // logging: console.log
        });

        if (!foundChatbotBlock) {

          finalResult.message = 'Không tồn tại chatbotBlock';

          return finalResult;
        }

        const cards = convertCards(foundChatbotBlock.chatbotCards);

        console.log('card: ', cards);
        currentSession = {};
        currentSession.attributes = {};
        currentSession.preQuestion = null;
        currentSession.cards = cards;
        currentSession = await redisService.setAndGetCurrentSession({
          prefixKey: CONFIG.REDIS_PREFIX_KEY,
          value: currentSession,
          filter: {
            sender: sender,
            recipient: recipient,
            provider
          }
        });

        // condition directContact
        if (currentSession && foundChatbotBlock && foundChatbotBlock.intent === chatbotBlockIntent('Liên hệ trực tiếp')) {
          currentSession.directContact = true;
          currentSession.directContactExpired = new Date(
            new Date().getTime() + Number(CONFIG.DIRECT_CONTACT_EXPIRED)
          );
          await redisService.setAndGetCurrentSession({
            prefixKey: CONFIG.REDIS_PREFIX_KEY,
            value: currentSession,
            filter: {
              sender: sender,
              recipient: recipient,
              provider
            }
          });
        }
      }

      if (typeof currentSession === 'object') {
        // console.log('currentSession.cards: ', currentSession.cards);
        // console.log('currentSession.cards[0]', currentSession.cards[0]);

        if (currentSession.preQuestion && currentSession.cards && currentSession.cards.length === 0) {
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
                  provider
                }
              });

              return finalResult;
            } else {
              // eslint-disable-next-line no-await-in-loop
              await Zalo.sendText({
                accessToken: foundSocialChannel.token,
                userId: sender,
                text: currentSession.preQuestion['questionToUser']
              });

              return finalResult;
            }
          } else {
            console.log('text not validate: ', text);
            currentSession.attributes[currentSession.preQuestion['key']] = text;
            if (currentSession.preQuestion.hasOwnProperty('quickReplies')) {
              console.log('currentSession.preQuestion.quickReplies: ', currentSession.preQuestion.quickReplies);
              const btnBlock = currentSession.preQuestion.quickReplies.find(quickReply => chatbotBlockIntent(quickReply.buttonName).localeCompare(chatbotBlockIntent(text)) === 0);

              console.log('btnBlock: ', btnBlock);

              if (btnBlock) {
                currentSession.attributes[currentSession.preQuestion['key']] = text;
                // eslint-disable-next-line no-await-in-loop
                const foundChatbotBlock = await Model.findOne(chatbotBlocks, {
                  where: {
                    chatbotTemplateId: foundChatbotTemplate.id,
                    id: parseInt(btnBlock.redirectToBlock),
                    status: true
                  },
                  order: [[{ model: chatbotCards, as: 'chatbotCards' }, 'numericalOrder', 'asc']],
                  include: [
                    { model: chatbotCards, as: 'chatbotCards', attributes: ['numericalOrder', 'dataUsers'] }
                  ]
                });

                // console.log("foundChatbotBlock: ", foundChatbotBlock);
                if (!foundChatbotBlock) {
                  // eslint-disable-next-line no-await-in-loop
                  await Zalo.sendText({
                    accessToken: foundSocialChannel.token,
                    userId: sender,
                    text: 'Khối bạn vừa chuyển không khả dụng!!! Xin lỗi vùng lòng thử lại sau!'
                  });

                  return finalResult;
                }

                if (currentSession && foundChatbotBlock && foundChatbotBlock.intent === chatbotBlockIntent('Liên hệ trực tiếp')) {
                  currentSession.directContact = true;
                  currentSession.directContactExpired = new Date(new Date().getTime() + Number(CONFIG.DIRECT_CONTACT_EXPIRED));
                }
                const cards = convertCards(foundChatbotBlock.chatbotCards);

                console.log('cards: ', cards);
                currentSession.attributes = {};
                currentSession.preQuestion = null;
                currentSession.cards = cards;
                // eslint-disable-next-line no-await-in-loop
                currentSession = await redisService.setAndGetCurrentSession({
                  prefixKey: CONFIG.REDIS_PREFIX_KEY,
                  value: currentSession,
                  filter: {
                    sender: sender,
                    recipient: recipient,
                    provider
                  }
                });
                console.log('currentSession quickRelies:', currentSession);
              } else {
                console.log('Cards: ', currentSession);
                currentSession.cards.unshift(currentSession.preQuestion);
                currentSession.preQuestion = null;
                console.log('XU LI SAU');
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
                  provider
                }
              });

              // eslint-disable-next-line no-await-in-loop
              await Zalo.sendText({
                accessToken: foundSocialChannel.token,
                userId: sender,
                text: 'Xin chào quý khách!!!'
              });

              return finalResult;
            }
          }
        }
        while (currentSession.cards && currentSession.cards.length > 0 && currentSession.cards[0]) {
          // Luu lai gia tri cua cau hoi cuoi cung co key truoc khi chuyen sang card khac
          if (currentSession.preQuestion && currentSession.preQuestion.hasOwnProperty('key') && !currentSession.cards[0].hasOwnProperty('key') && !currentSession.cards[0].hasOwnProperty('url')) {
            if (currentSession.preQuestion['chatbotRegexsId']) {
              console.log('TH CAU HOI TRUOC CO VALIDATE VA CAU HOI TIEP THEO KHONG TON TAI KEY');
              // TH pass validate
              // eslint-disable-next-line no-await-in-loop
              if (await checkValidate(text, currentSession.preQuestion['chatbotRegexsId'])) {
                console.log('PASS VALIDATE');
                currentSession.attributes[currentSession.preQuestion['key']] = text;
                currentSession.preQuestion = null;
              } else {
                // TH ko pass validate
                console.log('KHONG PASS VALIDATE');

                // eslint-disable-next-line no-await-in-loop
                await Zalo.sendText({
                  accessToken: foundSocialChannel.token,
                  userId: sender,
                  text:
                    'sai định dạng! Vui lòng nhập lại ' +
                    templateCompiled(currentSession.preQuestion['questionToUser'], currentSession.attributes)
                });

                return finalResult;
              }
            } else {
              // TH Câu hỏi trước khong co validate
              console.log('TH CAU HOI TRUOC KO CO VALIDATE TH 1');
              currentSession.attributes[currentSession.preQuestion['key']] = text;
              currentSession.preQuestion = null;
            }
          }
          // Trường hợp có key thì hỏi lần lượt
          if (currentSession.cards[0].hasOwnProperty('key') && !currentSession.cards[0].hasOwnProperty('quickReplies') && !currentSession.cards[0].hasOwnProperty('redirectToBlock') && !currentSession.cards[0].hasOwnProperty('url')) {
            // Câu hỏi đầu tiên của list co key
            if (!currentSession.preQuestion) {
              console.log('TH KHONG CO CAU HOI TRUOC');
              // eslint-disable-next-line no-await-in-loop
              await Zalo.sendText({
                accessToken: foundSocialChannel.token,
                userId: sender,
                text: templateCompiled(currentSession.cards[0]['questionToUser'], currentSession.attributes)
              });
              currentSession.preQuestion = currentSession.cards[0];
              currentSession.cards.shift();

              // eslint-disable-next-line no-await-in-loop
              currentSession = await redisService.setAndGetCurrentSession({
                prefixKey: CONFIG.REDIS_PREFIX_KEY,
                value: currentSession,
                filter: {
                  sender: sender,
                  recipient: recipient,
                  provider
                }
              });

              return finalResult;
            } else {
              // TH Có câu hỏi trước thì validate nếu ko qua thì gửi lại câu hỏi nếu qua thì gửi câu hỏi tiếp theo
              // TH Câu hỏi trước có validate
              if (currentSession.preQuestion['chatbotRegexsId']) {
                console.log('TH CAU HOI TRUOC CO VALIDATE');
                // TH pass validate
                // eslint-disable-next-line no-await-in-loop
                if (await checkValidate(text, currentSession.preQuestion['chatbotRegexsId'])) {
                  console.log('PASS VALIDATE');
                  // eslint-disable-next-line no-await-in-loop
                  await Zalo.sendText({
                    accessToken: foundSocialChannel.token,
                    userId: sender,
                    text: templateCompiled(currentSession.cards[0]['questionToUser'], currentSession.attributes)
                  });

                  currentSession.attributes[currentSession.preQuestion['key']] = text;
                  currentSession.preQuestion = currentSession.cards.shift();

                  // eslint-disable-next-line no-await-in-loop
                  currentSession = await redisService.setAndGetCurrentSession({
                    prefixKey: CONFIG.REDIS_PREFIX_KEY,
                    value: currentSession,
                    filter: {
                      sender: sender,
                      recipient: recipient,
                      provider
                    }
                  });

                  return finalResult;
                } else {
                  // TH ko pass validate
                  console.log('KHONG PASS VALIDATE');
                  console.log('currentSession.preQuestion: ', currentSession.preQuestion);
                  // eslint-disable-next-line no-await-in-loop
                  await Zalo.sendText({
                    accessToken: foundSocialChannel.token,
                    userId: sender,
                    text:
                      'sai định dạng! Vui lòng nhập lại ' +
                      templateCompiled(currentSession.preQuestion['questionToUser'], currentSession.attributes)
                  });

                  return finalResult;
                }
              } else {
                // TH Câu hỏi trước khong co validate
                console.log('TH CAU HOI TRUOC KO CO VALIDATE');
                console.log('currentSession.preQuestion: ', currentSession.preQuestion);
                if (currentSession.preQuestion.hasOwnProperty('quickReplies')) {
                  // TH CAU HOI TRUOC LA QUICK RELIES THI BAT DAP AN DE CHUYEN BLOCK
                  console.log('currentSession.preQuestion.quickReplies: ', currentSession.preQuestion.quickReplies);
                  const btnBlock = currentSession.preQuestion.quickReplies.find(
                    quickReply => quickReply.buttonName.trim().localeCompare(text.trim()) === 0
                  );

                  console.log('btnBlock: ', btnBlock);

                  if (btnBlock) {
                    console.log('Thanh cong=====================');
                    currentSession.attributes[currentSession.preQuestion['key']] = text;

                    // eslint-disable-next-line no-await-in-loop
                    const foundChatbotBlock = await Model.findOne(chatbotBlocks, {
                      where: {
                        chatbotTemplateId: foundChatbotTemplate.id,
                        id: parseInt(btnBlock.redirectToBlock),
                        status: true
                      },
                      order: [[{ model: chatbotCards, as: 'chatbotCards' }, 'numericalOrder', 'asc']],
                      include: [
                        { model: chatbotCards, as: 'chatbotCards', attributes: ['numericalOrder', 'dataUsers'] }
                      ]
                    });

                    console.log('foundChatbotBlock: ', foundChatbotBlock);
                    if (!foundChatbotBlock) {
                      // eslint-disable-next-line no-await-in-loop
                      await Zalo.sendText({
                        accessToken: foundSocialChannel.token,
                        userId: sender,
                        text: 'Khối bạn vừa chuyển không khả dụng!!! Xin lỗi vùng lòng thử lại sau!'
                      });

                      return finalResult;
                    }
                    const cards = convertCards(foundChatbotBlock.chatbotCards);

                    console.log('cards: ', cards);
                    currentSession.attributes = {};
                    currentSession.preQuestion = null;
                    currentSession.cards = cards;
                    // eslint-disable-next-line no-await-in-loop
                    currentSession = await redisService.setAndGetCurrentSession({
                      prefixKey: CONFIG.REDIS_PREFIX_KEY,
                      value: currentSession,
                      filter: {
                        sender: sender,
                        recipient: recipient,
                        provider
                      }
                    });
                    console.log('currentSession QUicl relies:', currentSession);

                    return finalResult;
                  } else {
                    console.log('XU LI SAU');
                    console.log('currentSession==============: ', currentSession);
                    currentSession.cards.unshift(currentSession.preQuestion);
                    currentSession.preQuestion = null;
                  }
                } else {
                  currentSession.attributes[currentSession.preQuestion['key']] = text;
                  currentSession.preQuestion = null;
                  // currentSession.cards.shift();
                }
              }
            }
          } else if (currentSession.cards[0].hasOwnProperty('messageToUser')) {
            console.log('TH MESSAGE TO USER');
            // eslint-disable-next-line no-await-in-loop
            await Zalo.sendText({
              accessToken: foundSocialChannel.token,
              userId: sender,
              text: templateCompiled(currentSession.cards[0]['messageToUser'], currentSession.attributes)
            });
            currentSession.cards.shift();
          } else if (currentSession.cards[0].hasOwnProperty('path')) {
            // eslint-disable-next-line no-await-in-loop
            await Zalo.sendFile({
              accessToken: foundSocialChannel.token,
              userId: sender,
              url: currentSession.cards[0]['path']
            });
            currentSession.cards.shift();
          } else if (currentSession.cards[0].hasOwnProperty('redirectToBlock')) {
            // eslint-disable-next-line no-await-in-loop
            await Model.findOne(chatbotBlocks, {
              where: {
                chatbotTemplateId: foundChatbotTemplate.id,
                id: currentSession.cards[0]['redirectToBlock'],
                status: true
              },
              order: [[{ model: chatbotCards, as: 'chatbotCards' }, 'numericalOrder', 'asc']],
              include: [{ model: chatbotCards, as: 'chatbotCards', attributes: ['numericalOrder', 'dataUsers'] }]
            }).then(async foundChatbotBlock => {
              // console.log('foundChatbotBlock: ', foundChatbotBlock);
              if (foundChatbotBlock && foundChatbotBlock['dataValues']) {
                const cards = convertCards(foundChatbotBlock.chatbotCards);

                currentSession = await redisService.setAndGetCurrentSession({
                  prefixKey: CONFIG.REDIS_PREFIX_KEY,
                  value: {
                    attributes: {},
                    preQuestion: null,
                    cards: cards
                  },
                  filter: {
                    sender: sender,
                    recipient: recipient,
                    provider
                  }
                });

                console.log('curentSescction redirect: ', currentSession);
              } else {
                await Zalo.sendText({
                  accessToken: foundSocialChannel.token,
                  userId: sender,
                  text: 'Khối để chuyển không khả dụng! Vui lòng thử lại sau!'
                });
                currentSession.cards.shift();
                currentSession = await redisService.setAndGetCurrentSession({
                  prefixKey: CONFIG.REDIS_PREFIX_KEY,
                  value: currentSession,
                  filter: {
                    sender: sender,
                    recipient: recipient,
                    provider
                  }
                });
              }
            });
          } else if (currentSession.cards[0].hasOwnProperty('quickReplies')) {
            console.log('hello world');
            currentSession.preQuestion = currentSession.cards[0];
            // eslint-disable-next-line no-await-in-loop
            await Zalo
              .sendQuickReplies({
                accessToken: foundSocialChannel.token,
                userId: sender,
                text: 'Mời lựa chọn: ',
                quickReplies: currentSession.cards[0]['quickReplies'].map(e => e.buttonName)
              })
              .then(async dataQuick => {
                console.log('dataQuick: ', dataQuick);
                currentSession.cards.shift();
                currentSession = await redisService.setAndGetCurrentSession({
                  prefixKey: CONFIG.REDIS_PREFIX_KEY,
                  value: currentSession,
                  filter: {
                    sender: sender,
                    recipient: recipient,
                    provider
                  }
                });
                // console.log('currentSession dataUsers: ', currentSession.cards[0]);
              });

            return finalResult;
          } else if (currentSession.cards[0].hasOwnProperty('url')) {
            // TH LA DAT LICH
            if (currentSession.cards[0].url === CONFIG.CLINIC_QUEUES_API) {
              const method = currentSession.cards[0].method.toLowerCase();

              console.log('prequestion URLL ', currentSession.preQuestion);

              if (currentSession.preQuestion && currentSession.preQuestion.hasOwnProperty('key') && !currentSession.preQuestion.hasOwnProperty('index')) {
                if (currentSession.preQuestion['chatbotRegexsId']) {
                  // TH pass validate
                  // eslint-disable-next-line no-await-in-loop
                  if (await checkValidate(text, currentSession.preQuestion['chatbotRegexsId'])) {
                    console.log('PASS VALIDATE');
                    currentSession.attributes[currentSession.preQuestion['key']] = text;
                    currentSession.preQuestion = null;
                  } else {
                    // TH ko pass validate
                    console.log('KHONG PASS VALIDATE');

                    // eslint-disable-next-line no-await-in-loop
                    await Zalo.sendText({
                      accessToken: foundSocialChannel.token,
                      userId: sender,
                      text:
                        'sai định dạng! Vui lòng nhập lại ' +
                        templateCompiled(currentSession.preQuestion['questionToUser'], currentSession.attributes)
                    });

                    return finalResult;
                  }
                } else {
                  // TH Câu hỏi trước khong co validate
                  console.log('TH CAU HOI TRUOC KO CO VALIDATE TH 1');
                  currentSession.attributes[currentSession.preQuestion['key']] = text;
                  currentSession.preQuestion = null;
                }
              }
              if (method === 'post') {
                console.log('DAT LICH');
                const questionGPP = [
                  { index: 0, key: 'servicesId', questionToUser: 'Mời bạn chọn dịch vụ:', chatbotRegexsId: 29 },
                  {
                    index: 1,
                    key: 'servicePackagesId',
                    questionToUser: 'Mời bạn chọn gói dịch vụ:',
                    chatbotRegexsId: 29
                  },
                  { index: 2, key: 'dateScheduled', questionToUser: 'Mời bạn chọn ngày khám:', chatbotRegexsId: 6 },
                  {
                    index: 3,
                    key: 'timeScheduled',
                    questionToUser: 'Mời bạn chọn giờ khám:',
                    chatbotRegexsId: 28
                  }
                ];

                // HOI CAU HOI DAU TIEN CUA DAT LICH
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
                      provider
                    }
                  });

                  console.log('currentSession: ', currentSession);
                  // eslint-disable-next-line no-await-in-loop
                  await clinicQueueService.send_quick_relies_service_zalo(
                    foundSocialChannel.placesId,
                    questionGPP[0].questionToUser,
                    foundSocialChannel.token,
                    sender
                  );

                  return finalResult;
                }

                while (parseInt(currentSession.preQuestion.index) <= 3) {
                  console.log('Vao th tiep theo cua question');
                  if (currentSession.preQuestion['chatbotRegexsId']) {
                    console.log('===================REGEX====================');
                    // eslint-disable-next-line no-await-in-loop
                    if (await checkValidate(text, currentSession.preQuestion['chatbotRegexsId']) || text === 'xemthem' || text === 'trolai') {
                      console.log('=================Vao TH pass validate=============');
                      // currentSession.attributes[currentSession.preQuestion['key']] = text;
                      if (currentSession.preQuestion.key === 'servicesId') {
                        const arrayService = _.split(text, '.', 2);

                        currentSession.attributes.services = arrayService[1];
                        currentSession.attributes.servicesId = arrayService[0];
                        currentSession.preQuestion = questionGPP[parseInt(currentSession.preQuestion.index) + 1]; // tiep tuc cau hoi tiep theo
                        // eslint-disable-next-line no-await-in-loop
                        await clinicQueueService.send_quick_relies_service_package_zalo(
                          foundSocialChannel.placesId,
                          currentSession.attributes['servicesId'],
                          questionGPP[1].questionToUser,
                          foundSocialChannel.token,
                          sender
                        );

                      } else if (currentSession.preQuestion.key === 'servicePackagesId') {
                        const arrayServicePackages = _.split(text, '.', 3);

                        currentSession.attributes.servicePackages = arrayServicePackages[2];
                        currentSession.attributes.usersDoctorId = arrayServicePackages[1];
                        currentSession.attributes.servicePackagesId = arrayServicePackages[0];
                        currentSession.preQuestion = questionGPP[parseInt(currentSession.preQuestion.index) + 1]; // tiep tuc cau hoi tiep theo
                        // eslint-disable-next-line no-await-in-loop
                        await clinicQueueService.send_date_scheduled_zalo(
                          questionGPP[2].questionToUser,
                          foundSocialChannel.token,
                          sender,
                          foundSocialChannel.placesId
                        );

                      } else if (currentSession.preQuestion.key === 'dateScheduled') {
                        // eslint-disable-next-line no-await-in-loop
                        const checkDateScheduled = await clinicQueueService.check_date_scheduled(text, foundSocialChannel.placesId);

                        if (!checkDateScheduled) {

                          // eslint-disable-next-line no-await-in-loop
                          await clinicQueueService.send_date_scheduled(
                            'Ngày bạn nhập không đúng hoặc nhà thuốc không làm việc, mời bạn chọn lại',
                            foundSocialChannel.token,
                            sender,
                            foundSocialChannel.placesId
                          );
                          return finalResult;
                        }
                        currentSession.attributes[currentSession.preQuestion['key']] = text;
                        const date = currentSession.attributes['dateScheduled'];
                        const servicePackagesId = currentSession.attributes['servicePackagesId'];

                        currentSession.preQuestion = questionGPP[parseInt(currentSession.preQuestion.index) + 1]; // tiep tuc cau hoi tiep theo
                        // eslint-disable-next-line no-await-in-loop
                        const rely = await clinicQueueService.send_time_scheduled_zalo(
                          date,
                          foundSocialChannel.id,
                          foundSocialChannel.placesId,
                          questionGPP[3].questionToUser,
                          foundSocialChannel.token,
                          sender,
                          servicePackagesId
                        );

                        currentSession.indexOfSchedileTime = 1;

                        console.log('rely: ', rely);
                        currentSession.rely = rely;

                        // return finalResult;
                      } else if (currentSession.preQuestion.key === 'timeScheduled') {
                        console.log('arrayTime text =====================', text);
                        if (text === 'xemthem') {
                          const relyParent = currentSession.rely || [];
                          const indexOfList = currentSession.indexOfSchedileTime;
                          let rely;

                          if (indexOfList > relyParent.length) {
                            rely = _.slice(relyParent, 0, 12);
                            rely.push('xemthem');
                            currentSession.indexOfSchedileTime = 0;
                          } else {
                            rely = _.slice(relyParent, indexOfList + 12, indexOfList + 23);
                            currentSession.indexOfSchedileTime = indexOfList + 11;
                            rely.unshift('trolai');
                            rely.push('xemthem');
                          }

                          // eslint-disable-next-line no-await-in-loop
                          await Zalo
                            .sendQuickReplies({
                              accessToken: foundSocialChannel.token,
                              userId: sender,
                              text: templateCompiled(text, currentSession.attributes),
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
                                  provider
                                }
                              });
                            });

                          return finalResult;
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
                          await Zalo
                            .sendQuickReplies({
                              accessToken: foundSocialChannel.token,
                              userId: sender,
                              text: templateCompiled(text, currentSession.attributes),
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
                                  provider
                                }
                              });
                            });

                          return finalResult;
                        } else {
                          const arrayTime = _.split(text, '.', 2);

                          currentSession.attributes.ordinalNumber = arrayTime[0];
                          currentSession.attributes.time = arrayTime[1];
                          const secondsToMinutes = arrayTime[1];

                          console.log('book.time', arrayTime[1]);

                          const minutes = parseInt(secondsToMinutes.split(':')[1]);
                          const hours = parseInt(secondsToMinutes.split(':')[0]);

                          currentSession.attributes.dateScheduled = moment(currentSession.attributes.dateScheduled, 'DD/MM/YYYY').add(hours - 7, 'hours').add(minutes, 'minutes').toDate();

                          const data = currentSession.attributes;

                          console.log('data: ', data);
                          console.log('data.dateScheduled: ', data.dateScheduled);
                          const fieldValues = currentSession.cards[0].body;
                          const body = {
                            name: templateCompiled(fieldValues['name'], currentSession.attributes),
                            mobile: templateCompiled(fieldValues['mobile'], currentSession.attributes),
                            usersCreatorId: 1,
                            placesId: foundSocialChannel.placesId,
                            birthday: moment(data['birthday'], 'DD/MM/YYYY').toDate(),
                            usersDoctorId: data.usersDoctorId,
                            ordinalNumber: data.ordinalNumber,
                            descriptions: templateCompiled(fieldValues['descriptions'], currentSession.attributes) || ' ',
                            servicePackagesId: data.servicePackagesId,
                            dateScheduled: data.dateScheduled,
                            status: 0,
                            channelsId: foundSocialChannel.id,
                            recipientId: sender
                          };

                          console.log('body: ', body);
                          // console.log("data: ", data1);
                          // eslint-disable-next-line no-await-in-loop
                          await axios({
                            method: currentSession.cards[0]['method'],
                            url: currentSession.cards[0]['url'],
                            data: body,
                            headers: {
                              'Content-Type': 'application/json'
                            }
                          }).then(async dataExios => {
                            console.log('data exios: ', dataExios);
                            console.log('data exios request: ', dataExios.request);
                            console.log('data exios request.data: ', dataExios.data);
                            console.log('data exios res.data.result: ', dataExios.data.result);
                            // console.log('data exios: ', dataExios.request.res.data.result);
                            if (dataExios.status === 200) {
                              currentSession.preQuestion = null; // tiep tuc cau hoi tiep theo
                              currentSession = await redisService.setAndGetCurrentSession({
                                prefixKey: CONFIG.REDIS_PREFIX_KEY,
                                value: currentSession,
                                filter: {
                                  sender: sender,
                                  recipient: recipient,
                                  provider
                                }
                              });
                              currentSession.cards.shift();

                              console.log('currentSession: ', currentSession);
                              if (dataExios && dataExios.data && dataExios.data.result && dataExios.data.result.message) {
                                await Zalo.sendText({
                                  accessToken: foundSocialChannel.token,
                                  userId: sender,
                                  text: dataExios.data.result.message + ` vào thời gian ${moment(dataExios.data.result.data.dateScheduled).tz(tz).format('YYYY-MM-DD HH:mm:ss')}. Vui lòng đặt lịch vào ngày khác hoặc sử dụng dịch vụ cập nhật lịch`
                                });
                              } else {
                                await Zalo.sendText({
                                  accessToken: foundSocialChannel.token,
                                  userId: sender,
                                  text: 'Bạn đặt lịch thành công'
                                });
                              }
                            } else {
                              currentSession.cards.shift();
                              await Zalo.sendText({
                                accessToken: foundSocialChannel.token,
                                userId: sender,
                                text: 'Bạn đặt lịch không thành công'
                              });
                            }
                          });
                          console.log('Thoat ra khoi while 3 phan tu');
                          break;
                        }
                      }

                      // eslint-disable-next-line no-await-in-loop
                      currentSession = await redisService.setAndGetCurrentSession({
                        prefixKey: CONFIG.REDIS_PREFIX_KEY,
                        value: currentSession,
                        filter: {
                          sender: sender,
                          recipient: recipient,
                          provider
                        }
                      });

                      return finalResult;
                    } else {
                      if (currentSession.preQuestion.key === 'servicesId') {
                        console.log('Vao TH  not pass validate');
                        // eslint-disable-next-line no-await-in-loop
                        await clinicQueueService.send_quick_relies_service_zalo(
                          foundSocialChannel.placesId,
                          currentSession.preQuestion.questionToUser,
                          foundSocialChannel.token,
                          sender
                        );

                        return finalResult;
                      } else if (currentSession.preQuestion.key === 'servicePackagesId') {
                        console.log('Vao TH  not pass validate');
                        // eslint-disable-next-line no-await-in-loop
                        await clinicQueueService.send_quick_relies_service_package_zalo(
                          foundSocialChannel.placesId,
                          currentSession.attributes['servicesId'],
                          currentSession.preQuestion.questionToUser,
                          foundSocialChannel.token,
                          sender
                        );

                        return finalResult;
                      } else if (currentSession.preQuestion.key === 'dateScheduled') {
                        // eslint-disable-next-line no-await-in-loop
                        await clinicQueueService.send_date_scheduled_zalo(
                          currentSession.preQuestion.questionToUser,
                          foundSocialChannel.token,
                          sender,
                          foundSocialChannel.placesId
                        );

                        return finalResult;
                      } else if (currentSession.preQuestion.key === 'timeScheduled') {
                        const date = currentSession.attributes['dateScheduled'];

                        const servicePackagesId = currentSession.attributes['servicePackagesId'];

                        // eslint-disable-next-line no-await-in-loop
                        const rely = await clinicQueueService.send_time_scheduled_zalo(
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
                            provider
                          }
                        });

                        return finalResult;
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
                        await Zalo
                          .sendQuickReplies({
                            accessToken: foundSocialChannel.token,
                            userId: sender,
                            text: templateCompiled(text, currentSession.attributes),
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
                                provider
                              }
                            });
                          });

                        return finalResult;
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
                        await Zalo
                          .sendQuickReplies({
                            accessToken: foundSocialChannel.token,
                            userId: sender,
                            text: templateCompiled(text, currentSession.attributes),
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
                                provider
                              }
                            });
                          });

                        return finalResult;
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
                          .add(hours - 7, 'hours')
                          .add(minutes, 'minutes')
                          .toDate();
                        const data = currentSession.attributes;
                        const fieldValues = currentSession.cards[0].body;
                        const body = {
                          name: templateCompiled(fieldValues['name'], currentSession.attributes),
                          mobile: templateCompiled(fieldValues['mobile'], currentSession.attributes),
                          usersCreatorId: 1,
                          placesId: foundSocialChannel.placesId,
                          birthday: moment(data['birthday'], 'DD/MM/YYYY').toDate(),
                          usersDoctorId: data.usersDoctorId,
                          ordinalNumber: data.ordinalNumber,
                          descriptions: templateCompiled(fieldValues['descriptions'], currentSession.attributes) || ' ',
                          servicePackagesId: data.servicePackagesId,
                          dateScheduled: data.dateScheduled,
                          status: 1,
                          channelsId: foundSocialChannel.id,
                          recipientId: sender
                        };

                        console.log('body: ', body);
                        // eslint-disable-next-line no-await-in-loop
                        await axios({
                          method: currentSession.cards[0]['method'],
                          url: currentSession.cards[0]['url'],
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
                                provider
                              }
                            });
                            currentSession.cards.shift();

                            console.log('currentSession: ', currentSession);
                            await Zalo.sendText({
                              accessToken: foundSocialChannel.token,
                              userId: sender,
                              text: 'Bạn đặt lịch thành công'
                            });
                          } else {
                            currentSession.cards.shift();
                            await Zalo.sendText({
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
                        provider
                      }
                    });

                    if (currentSession.preQuestion.key === 'servicePackagesId') {
                      // eslint-disable-next-line no-await-in-loop
                      await clinicQueueService.send_quick_relies_service_package_zalo(
                        foundSocialChannel.placesId,
                        currentSession.attributes['servicesId'],
                        currentSession.preQuestion.questionToUser,
                        foundSocialChannel.token,
                        sender
                      );

                      return finalResult;
                    } else if (currentSession.preQuestion.key === 'dateScheduled') {
                      // eslint-disable-next-line no-await-in-loop
                      await clinicQueueService.send_date_scheduled_zalo(
                        currentSession.preQuestion.questionToUser,
                        foundSocialChannel.token,
                        sender,
                        foundSocialChannel.placesId
                      );

                      return finalResult;
                    } else if (currentSession.preQuestion.key === 'timeScheduled') {
                      const date = currentSession.attributes['dateScheduled'];
                      const servicePackagesId = currentSession.attributes['servicePackagesId'];

                      // eslint-disable-next-line no-await-in-loop
                      const rely = await clinicQueueService.send_time_scheduled_zalo(
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
                          provider
                        }
                      });

                      return finalResult;
                    }
                  }
                }
              } else if (method === 'get') {
                console.log('XEM LICH');
                const fieldValues = currentSession.cards[0].body;
                const mobile = templateCompiled(fieldValues['mobile'], currentSession.attributes);
                const date = templateCompiled(fieldValues['dateScheduled'], currentSession.attributes);

                console.log('mobile: ', mobile);
                console.log('date: ', date);

                // eslint-disable-next-line no-await-in-loop
                await clinicQueueService.check_schedule_queue_zalo(
                  date,
                  mobile,
                  foundSocialChannel.placesId,
                  foundSocialChannel.token,
                  sender
                );
                currentSession.cards.shift();
              } else if (method === 'put') {
                console.log('DOI LICH');
                const fieldValues = currentSession.cards[0].body;
                const date = templateCompiled(fieldValues['dateScheduled'], currentSession.attributes);
                const datetime =
                  moment(date, 'DD/MM/YYYY').format('YYYY-MM-DD') ||
                  moment(date).format('YYYY-MM-DD') ||
                  moment().format('YYYY-MM-DD');
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
                      status: 0
                    }
                  },
                  filterSocial: {
                    recipientId: sender,
                    channelsId: foundSocialChannel.id
                  }
                };
                const checkExist = await clinicQueueService.check_exists(param);

                if (!checkExist) {
                  await Zalo.sendText({
                    accessToken: foundSocialChannel.token,
                    userId: sender,
                    text: 'Cập nhật không thành công! Không tồn tại lịch khám'
                  });

                  currentSession.cards.shift();
                  currentSession.preQuestion = null;

                  currentSession = await redisService.setAndGetCurrentSession({
                    prefixKey: CONFIG.REDIS_PREFIX_KEY,
                    value: currentSession,
                    filter: {
                      sender: sender,
                      recipient: recipient,
                      provider
                    }
                  });

                  return finalResult;
                }
                const checkDateScheduled = await clinicQueueService.check_date_scheduled(date, foundSocialChannel.placesId);

                if (!checkDateScheduled) {
                  // eslint-disable-next-line no-await-in-loop
                  await clinicQueueService.send_date_scheduled(
                    'Ngày bạn nhập không đúng hoặc nhà thuốc không làm việc, mời bạn chọn lại',
                    foundSocialChannel.token,
                    sender,
                    foundSocialChannel.placesId
                  );
                  return finalResult;
                }
                // eslint-disable-next-line no-await-in-loop
                const arrayTime = _.split(text, '.', 2);

                console.log('text: ', text);
                console.log('arrayTime: ', arrayTime);
                console.log('dateScheduled: ', date);
                console.log(
                  'currentSession.cards[0].dataUsers[0].body[\'dateScheduled\']: ',
                  currentSession.cards[0].body['dateScheduled']
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
                    rely = _.slice(relyParent, indexOfList + 12, indexOfList + 23);
                    currentSession.indexOfSchedileTime = indexOfList + 11;
                    rely.unshift('trolai');
                    rely.push('xemthem');
                  }

                  // eslint-disable-next-line no-await-in-loop
                  await Zalo
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
                          provider
                        }
                      });
                    });

                  return finalResult;
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
                  await Zalo
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
                          provider
                        }
                      });
                    });

                  return finalResult;
                } else if (text && Array.isArray(arrayTime) && arrayTime.length === 2) {
                  const secondsToMinutes = arrayTime[1];
                  const minutes = secondsToMinutes.split(':')[1];
                  const hours = secondsToMinutes.split(':')[0];

                  const dateScheduled = moment(date, 'DD/MM/YYYY')
                    .add(hours - 7, 'hours')
                    .add(minutes, 'minutes')
                    .toDate();

                  console.log('dateScheduled: ', dateScheduled);
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
                    // console.log('clinicQueuesFound', clinicQueuesFound);
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
                            await Zalo
                              .sendText({
                                accessToken: foundSocialChannel.token,
                                userId: sender,
                                text: 'Cập nhật lịch khám thành công! Xin cảm ơn quý khách <3'
                              })
                              .then(dataSendText => {
                                console.log('dataSendText: ', dataSendText);
                                currentSession.cards.shift();
                                currentSession.preQuestion = null;
                              });
                          } else {
                            await Zalo
                              .sendText({
                                accessToken: foundSocialChannel.token,
                                userId: sender,
                                text: 'Cập nhật lịch khám không thành công! Xin cảm ơn quý khách <3'
                              })
                              .then(dataSendText => {
                                console.log('dataSendText: ', dataSendText);
                                currentSession.cards.shift();
                                currentSession.preQuestion = null;
                              });
                          }
                        });
                    } else {
                      await Zalo
                        .sendText({
                          accessToken: foundSocialChannel.token,
                          userId: sender,
                          text: 'Không tìm thấy quý khách trong hệ thống vui lòng đặt lịch!'
                        })
                        .then(dataSendText => {
                          console.log('dataSendText: ', dataSendText);
                          currentSession.cards.shift();
                          currentSession.preQuestion = null;
                        });
                    }
                  });
                } else {
                  console.log('Vao TH sai ngay thang');
                  // eslint-disable-next-line no-await-in-loop
                  const rely = await clinicQueueService.update_schedule_queue_zalo(
                    date,
                    foundSocialChannel.placesId,
                    foundSocialChannel.token,
                    sender,
                    foundSocialChannel.id
                  );

                  console.log('rely: ', rely);
                  currentSession.rely = rely;
                  currentSession.indexOfSchedileTime = 0;

                  // eslint-disable-next-line no-await-in-loop
                  currentSession = await redisService.setAndGetCurrentSession({
                    prefixKey: CONFIG.REDIS_PREFIX_KEY,
                    value: currentSession,
                    filter: {
                      sender: sender,
                      recipient: recipient,
                      provider
                    }
                  });

                  return finalResult;
                }
              } else if (method === 'delete') {
                console.log('HUY LICH');
                const fieldValues = currentSession.cards[0].body;

                const date = templateCompiled(fieldValues['dateScheduled'], currentSession.attributes);
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
                      status: 0
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
                        await Zalo
                          .sendText({
                            accessToken: foundSocialChannel.token,
                            userId: sender,
                            text:
                              'Hủy lịch thành công!Hẹn gặp lại quý khách! Vui lòng nhắn tin để sử dụng tiếp dịch vụ'
                          })
                          .then(dataSendText => {
                            console.log('dataSendText: ', dataSendText);
                            currentSession.cards.shift();
                            currentSession.preQuestion = null;
                          });
                      } else {
                        await Zalo
                          .sendText({
                            accessToken: foundSocialChannel.token,
                            userId: sender,
                            text:
                              'Hủy lịch không thành công!Hẹn gặp lại quý khách! Vui lòng nhắn tin để sử dụng tiếp dịch vụ'
                          })
                          .then(dataSendText => {
                            console.log('dataSendText: ', dataSendText);
                            currentSession.cards.shift();
                            currentSession.preQuestion = null;
                          });
                      }
                    });
                  // eslint-disable-next-line no-await-in-loop
                } else {
                  // eslint-disable-next-line no-await-in-loop
                  await Zalo
                    .sendText({
                      accessToken: foundSocialChannel.token,
                      userId: sender,
                      text:
                        'Hủy lịch không thành công!Hẹn gặp lại quý khách! Vui lòng nhắn tin để sử dụng tiếp dịch vụ'
                    })
                    .then(dataSendText => {
                      console.log('dataSendText: ', dataSendText);
                      currentSession.cards.shift();
                      currentSession.preQuestion = null;
                    });
                }
              } else {
                console.log('KHONG XU LY');
              }
            } else {
              console.log('BEN THU 3');
              // eslint-disable-next-line no-await-in-loop
              const method = templateCompiled(currentSession.cards[0]['method'], currentSession.attributes);
              const url = templateCompiled(currentSession.cards[0]['url'], currentSession.attributes);
              const data = JSON.parse(
                templateCompiled(JSON.stringify(currentSession.cards[0]['body']), currentSession.attributes)
              );
              const headers = templateCompiled(currentSession.cards[0]['headers'], currentSession.attributes);

              // eslint-disable-next-line no-await-in-loop
              await axios({
                method,
                url,
                data,
                headers:
                  {
                    'Content-Type': 'application/json'
                  } || headers
              })
                .then(async function(response) {
                  // console.log("kết thúc response -----------------------------------------------------------------",response.data);
                  console.log('Ket noi thanh cong**********************************');

                  // return  { data: response.data };
                  await Zalo
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

                  await Zalo
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
          } else if (Array.isArray(currentSession.cards[0]) && currentSession.cards[0].length > 0) {
            // eslint-disable-next-line no-await-in-loop
            await Zalo.sendAlbum({
              accessToken: foundSocialChannel.token,
              userId: sender,
              templates: currentSession.cards[0]
            });
            currentSession.cards.shift();
          }
          // eslint-disable-next-line no-await-in-loop
          currentSession = await redisService.setAndGetCurrentSession({
            prefixKey: CONFIG.REDIS_PREFIX_KEY,
            value: currentSession,
            filter: {
              sender: sender,
              recipient: recipient,
              provider
            }
          });
          if (currentSession.cards.length === 0) {
            // eslint-disable-next-line no-await-in-loop
            return finalResult;
          }
        }
      }
    } else {
      const foundSocialChannel = await Model.findOne(socialChannels, {
        where: {
          link: recipient
        },
        include: [{ model: chatbotTemplates, as: 'chatbotTemplates' }]
      });

      // console.log('foundSocialChannel: ', foundSocialChannel);

      if (!foundSocialChannel) {

        finalResult.message = 'Không tồn tại page';

        return finalResult;
      }
      await Zalo
        .sendText({
          accessToken: foundSocialChannel.token,
          userId: sender,
          text: 'Chatbot không hỗ trợ định dạng dữ liệu này!'
        });
    }
  }
};

