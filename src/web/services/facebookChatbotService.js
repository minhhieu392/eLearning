import Model from '../../models/models';
import _ from 'lodash';
import models from '../../entity/index';
import myRedis from '../../db/myRedis';
import CONFIG from '../../config';
import Wit from '../../services/wit';
import Facebook from '../services/facebookV2/index';
import redisService from '../../services/redisService';
import axios from 'axios';
import templateCompiled from '../../utils/templateCompiled';
import filterHelpers from '../../helpers/filterHelpers';
import { chatbotBlockIntent } from '../../utils/helper';
import { checkValidate, convertCards } from '../../utils/chatbot';
import hideComment from '../../services/facebook/hideComment';
import getComment from '../../services/facebook/getComment';
import replyComment from '../../services/facebook/replyComments';
import logger from '../../utils/logger';
_.templateSettings.interpolate = /{{([\s\S]+?)}}/g;

const configPlatform = {
  provider: 'facebook',
  tz: 'ASIA/Ho_Chi_Minh',
  priviousButtonName: 'Trước',
  seeMoreButtonName: 'Xem thêm',
  pleaseChoose: 'Mời bạn chọn:',
  indexButtonCount: 12 - 3,
  indexTemplateCount: 10 - 3,
  maxButton: 12,
  maxTemplate: 10,
  gettingStartedButtonName: 'Mở đầu',
  blockNotFound: 'Không tìm thấy block',
  templateNotFound: 'Không tìm thấy template',
  socialChannelNotFound: 'Không tìm thấy socialChannel',
  directContact: 'Liên hệ trực tiếp',
  notSupportFormat: 'Chatbot không hỗ trợ định dạng này',
  wrongFormat: 'Sai định dạng, vui lòng nhập lại!',
  getting: 'Xin chào quý khách',
  error: 'Lỗi'

}

const { chatbotTemplates, chatbotBlocks, chatbotCards, socialChannels, chatbotRegexs, clinicQueues, socialChannelProps, socialGroupChannels } = models;

export default {
  /**
   * @param {Object} data
   * @param {Object} data.object
   * @param {Array} data.entry
   * @param {Array} data.entry.messaging
   * */
  post_webhook: async data => {
    const finalResult = {
      message: null,
      isNext: false
    };
    console.log(JSON.stringify(data, null, 2));
    if (data && data.object && data.object === 'page' && data.entry && data.entry[0] && data.entry[0].messaging && data.entry[0].messaging[0]) {
      const entry = data.entry[0];
      const event = entry.messaging[0];

      const sender = event.sender.id;
      const recipient = event.recipient.id;
      let currentSession = await myRedis.getWithoutModel(CONFIG['REDIS_PREFIX_KEY'], {
        sender: sender,
        recipient: recipient,
        provider: configPlatform.provider
      });
      // console.log('currentSession:', currentSession);

      currentSession = JSON.parse(currentSession);
      // console.log('currentSession', currentSession);
      if (currentSession && currentSession.directContact && currentSession.directContactExpired) {
        if (new Date(currentSession.directContactExpired).getTime() < new Date().getTime()) {
          currentSession.directContact = false;
          currentSession = await redisService.setAndGetCurrentSession({
            prefixKey: CONFIG['REDIS_PREFIX_KEY'],
            value: currentSession,
            filter: {
              sender: sender,
              recipient: recipient,
              provider: configPlatform.provider
            }
          });
        } else {
          finalResult.message = configPlatform.directContact;
          finalResult.isNext = true;

          return finalResult;
        }
      }
      if ((event.message && !event.message['is_echo'] && event.message.text) || event['postback']) {
        let text;

        if (event.message && event.message.text) {
          text = event.message.text;
        }
        if (event['postback']) {
          text = event['postback'].payload || event['postback'].title;
        }
        text = (event.message && event.message['quick_reply'] && event.message['quick_reply']['payload']) ? event.message['quick_reply']['payload'] : text;
        console.log('text => ', text);
        const foundSocialChannel = await Model.findOne(socialChannels, {
          where: {
            link: recipient
          },
          include: [{ model: chatbotTemplates, as: 'chatbotTemplates' }]
        });
        // console.log('foundSocialChannel: ', foundSocialChannel);

        if (!foundSocialChannel) {
          finalResult.message = configPlatform.socialChannelNotFound;
          // finalResult.isNext = true;

          return finalResult;
        }
        const foundChatbotTemplate = foundSocialChannel['chatbotTemplates'];

        if (!foundChatbotTemplate) {
          finalResult.message = configPlatform.templateNotFound;
          finalResult.isNext = true;

          return finalResult;
        }
        if (!currentSession || (currentSession.preQuestion === null && currentSession.cards && currentSession.cards.length === 0)) {
          const { intents } = await Wit.getMessage({
            accessToken: foundChatbotTemplate.aiInfor[0].access_token,
            text: text
          });

          console.log('intents: ', intents);

          let intentValue = chatbotBlockIntent(configPlatform.gettingStartedButtonName);

          if (intents && Array.isArray(intents) && intents[0] && intents[0].name && intents[0].confidence) {
            intentValue = Number(intents[0].confidence) > 0.85 ? intents[0].name : intentValue;
          }

          console.log('intentValue: ', intentValue);

          let whereFilter = {
            chatbotTemplateId: foundChatbotTemplate.id,
            intent: intentValue,
            status: true
          };

          whereFilter = await filterHelpers.makeStringFilterRelatively(['intent'], whereFilter, 'chatbotBlocks');

          const foundChatbotBlock = await Model.findOne(chatbotBlocks, {
            where: whereFilter,
            order: [[{ model: chatbotCards, as: 'chatbotCards' }, 'numericalOrder', 'asc']],
            include: [{ model: chatbotCards, as: 'chatbotCards', attributes: ['numericalOrder', 'dataUsers'] }]
            // logging: console.log
          });

          if (!foundChatbotBlock) {
            finalResult.message = configPlatform.blockNotFound;

            return finalResult;
          }

          const cards = convertCards(foundChatbotBlock.chatbotCards);

          console.log('card: ', cards);
          currentSession = {};
          currentSession.attributes = {};
          currentSession.preQuestion = null;
          currentSession.cards = cards;
          currentSession.attributes.placesId = foundSocialChannel.placesId;
          currentSession.attributes.channelsId = foundSocialChannel.id;
          currentSession.attributes.recipientId = sender;
          currentSession.indexQuickReplies = 0;
          currentSession.indexTemplates = 0;
          currentSession = await redisService.setAndGetCurrentSession({
            prefixKey: CONFIG['REDIS_PREFIX_KEY'],
            value: currentSession,
            filter: {
              sender: sender,
              recipient: recipient,
              provider: configPlatform.provider
            }
          });
          // condition directContact
          if (currentSession && foundChatbotBlock && foundChatbotBlock.intent === chatbotBlockIntent(configPlatform.directContact)) {
            currentSession.directContact = true;
            currentSession.directContactExpired = new Date(
              new Date().getTime() + Number(CONFIG['DIRECT_CONTACT_EXPIRED'])
            );
            await redisService.setAndGetCurrentSession({
              prefixKey: CONFIG['REDIS_PREFIX_KEY'],
              value: currentSession,
              filter: {
                sender: sender,
                recipient: recipient,
                provider: configPlatform.provider
              }
            });
          }
        }

        if (typeof currentSession === 'object') {
          // console.log('currentSession.cards: ', currentSession.cards);
          // console.log('currentSession.cards[0]', currentSession.cards[0]);

          if (currentSession.preQuestion && currentSession.cards) {
            if (currentSession.preQuestion['chatbotRegexsId']) {
              // eslint-disable-next-line no-await-in-loop
              if (await checkValidate(text, currentSession.preQuestion['chatbotRegexsId'])) {
                currentSession.attributes[currentSession.preQuestion['key']] = text;
                currentSession.preQuestion = null;
                // currentSession.preQuestion = currentSession.cards.shift();
                // eslint-disable-next-line no-await-in-loop
                currentSession = await redisService.setAndGetCurrentSession({
                  prefixKey: CONFIG['REDIS_PREFIX_KEY'],
                  value: currentSession,
                  filter: {
                    sender: sender,
                    recipient: recipient,
                    provider: configPlatform.provider
                  }
                });

              } else {
                // eslint-disable-next-line no-await-in-loop
                await Facebook.sendText({
                  accessToken: foundSocialChannel.token,
                  userId: sender,
                  text: `${configPlatform.wrongFormat} ${templateCompiled(currentSession.preQuestion['questionToUser'], currentSession.attributes)}`
                });

                return finalResult;
              }
            } else {
              console.log('text not validate: ', text);
              currentSession.attributes[currentSession.preQuestion['key']] = text;
              if (currentSession.preQuestion.hasOwnProperty('quickReplies')) {
                console.log('currentSession.preQuestion.quickReplies', currentSession.preQuestion.quickReplies);
                currentSession.preQuestion.quickReplies.map((quickReply) => {
                  console.log(chatbotBlockIntent(quickReply['buttonName'].toString()), '-', chatbotBlockIntent(text));
                });
                const btnBlock = currentSession.preQuestion.quickReplies.find(quickReply => chatbotBlockIntent(quickReply['buttonName'].toString()) === chatbotBlockIntent(text));

                console.log('btnBlock: ', btnBlock);
                currentSession.attributes[currentSession.preQuestion['key']] = text;
                if (btnBlock && btnBlock.redirectToBlock) {
                  console.log('btnBlock && btnBlock.redirectToBlock');

                  // eslint-disable-next-line no-await-in-loop
                  const foundChatbotBlock = await Model.findOne(chatbotBlocks, {
                    where: {
                      chatbotTemplateId: foundChatbotTemplate.id,
                      id: Number(btnBlock.redirectToBlock),
                      status: true
                    },
                    order: [[{ model: chatbotCards, as: 'chatbotCards' }, 'numericalOrder', 'asc']],
                    include: [{ model: chatbotCards, as: 'chatbotCards', attributes: ['numericalOrder', 'dataUsers'] }]
                  });

                  // console.log("foundChatbotBlock: ", foundChatbotBlock);
                  if (!foundChatbotBlock) {
                    // eslint-disable-next-line no-await-in-loop
                    await Facebook.sendText({
                      accessToken: foundSocialChannel.token,
                      userId: sender,
                      text: configPlatform.blockNotFound
                    });

                    return finalResult;
                  }

                  if (currentSession && foundChatbotBlock && foundChatbotBlock.intent === chatbotBlockIntent(configPlatform.directContact)) {
                    currentSession.directContact = true;
                    currentSession.directContactExpired = new Date(new Date().getTime() + Number(CONFIG['DIRECT_CONTACT_EXPIRED']));
                  }
                  const cards = convertCards(foundChatbotBlock.chatbotCards);

                  console.log('cards: ', cards);
                  currentSession.attributes = {};
                  currentSession.attributes.placesId = foundSocialChannel.placesId;
                  currentSession.attributes.channelsId = foundSocialChannel.id;
                  currentSession.attributes.recipientId = sender;
                  currentSession.preQuestion = null;
                  currentSession.cards = cards;
                  currentSession.indexTemplates = 0;
                  currentSession.indexQuickReplies = 0;
                  // eslint-disable-next-line no-await-in-loop
                  currentSession = await redisService.setAndGetCurrentSession({
                    prefixKey: CONFIG['REDIS_PREFIX_KEY'],
                    value: currentSession,
                    filter: {
                      sender: sender,
                      recipient: recipient,
                      provider: configPlatform.provider
                    }
                  });
                } else if (btnBlock && !btnBlock.redirectToBlock) {
                  console.log('btnBlock && !btnBlock.redirectToBlock');
                  console.log('currentSession.indexQuickReplies', currentSession.indexQuickReplies);
                  if (btnBlock['returnButton']) {
                    currentSession.indexQuickReplies -= configPlatform.indexButtonCount;
                  } else if (btnBlock['moreButton']) {
                    currentSession.indexQuickReplies += configPlatform.indexButtonCount;
                  }
                  console.log('currentSession.indexQuickReplies', currentSession.indexQuickReplies);
                } else {
                  if (chatbotBlockIntent(text) === chatbotBlockIntent(configPlatform.seeMoreButtonName)) {
                    currentSession.indexQuickReplies += configPlatform.indexButtonCount;
                  } else if (chatbotBlockIntent(text) === chatbotBlockIntent(configPlatform.priviousButtonName)) {
                    currentSession.indexQuickReplies -= configPlatform.indexButtonCount;
                  }
                  currentSession.cards.unshift(currentSession.preQuestion);
                  currentSession.preQuestion = null;

                  console.log('XU LI SAU');
                }
              } else if (currentSession.preQuestion.hasOwnProperty('questionToUser')) {
                // await Facebook.sendText({
                //   accessToken: foundSocialChannel.token,
                //   userId: sender,
                //   text: templateCompiled(currentSession.preQuestion['questionToUser'].toString(), currentSession.attributes)
                // });
              } else if (currentSession.preQuestion.hasOwnProperty('templates')) {
                console.log('currentSession.preQuestion.templates', currentSession.preQuestion.templates);
                currentSession.attributes[currentSession.preQuestion['key']] = text;

                if (chatbotBlockIntent(text) === chatbotBlockIntent(configPlatform.seeMoreButtonName)) {
                  currentSession.indexTemplates += configPlatform.indexTemplateCount;
                } else if (chatbotBlockIntent(text) === chatbotBlockIntent(configPlatform.priviousButtonName)) {
                  currentSession.indexTemplates -= configPlatform.indexTemplateCount;
                }
                // currentSession.cards.unshift(currentSession.preQuestion);
                currentSession.preQuestion = null;
              } else {
                currentSession.preQuestion = null;
                // eslint-disable-next-line no-await-in-loop
                currentSession = await redisService.setAndGetCurrentSession({
                  prefixKey: CONFIG['REDIS_PREFIX_KEY'],
                  value: currentSession,
                  filter: {
                    sender: sender,
                    recipient: recipient,
                    provider: configPlatform.provider
                  }
                });
                return finalResult;
              }
            }
          } else {
            console.log('th thieu - currentSession', currentSession);
          }
          while (currentSession.cards && currentSession.cards.length > 0 && currentSession.cards[0]) {
            // Luu lai gia tri cua cau hoi cuoi cung co key truoc khi chuyen sang card khac
            if (currentSession.preQuestion && currentSession.preQuestion.hasOwnProperty('key')) {
              console.log('cau hoi truoc co key');
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
                  await Facebook.sendText({
                    accessToken: foundSocialChannel.token,
                    userId: sender,
                    text:
                      configPlatform.wrongFormat + templateCompiled(currentSession.preQuestion['questionToUser'].toString(), currentSession.attributes)
                  });

                  return finalResult;
                }
              } else {
                // TH Câu hỏi trước khong co validate
                console.log('TH CAU HOI TRUOC KO CO VALIDATE TH 1');
                currentSession.attributes[currentSession.preQuestion['key']] = text;
                currentSession.preQuestion = null;

                currentSession = await redisService.setAndGetCurrentSession({

                  prefixKey: CONFIG['REDIS_PREFIX_KEY'],
                  value: currentSession,
                  filter: {
                    sender: sender,
                    recipient: recipient,
                    provider: configPlatform.provider
                  }
                });
              }
            } else {
              console.log('khong co cau hoi truoc || khong co key ');
              console.log('Warning 1 - currentSession', currentSession);
            }
            // Trường hợp có key thì hỏi lần lượt
            if (currentSession.cards[0].hasOwnProperty('url')) {
              console.log('found url');
              console.log('currentSession.cards[0]', currentSession.cards[0]);
              // TH LA DAT LICH
              // api json
              const method = currentSession.cards[0]['method'];
              const url = templateCompiled(currentSession.cards[0]['url'], currentSession.attributes);
              const key = currentSession.cards[0].key;
              const requestElements = ['params', 'body', 'headers'];

              requestElements.forEach(element => {

                if (currentSession.cards[0][element] && typeof currentSession.cards[0][element] === 'object') {
                  Object.keys(currentSession.cards[0][element]).forEach((key) => {
                    currentSession.cards[0][element][key] = JSON.parse(templateCompiled(JSON.stringify(currentSession.cards[0][element][key]), currentSession.attributes));
                  })
                }
                if (typeof currentSession.cards[0][element] === 'object') {
                  currentSession.cards[0][element] = templateCompiled(JSON.stringify(currentSession.cards[0][element]), currentSession.attributes);
                  if (typeof currentSession.cards[0][element] !== 'object') {
                    currentSession.cards[0][element] = JSON.parse(currentSession.cards[0][element]);
                  }
                }
              })

              // const params = ;
              // const data = templateCompiled(JSON.stringify(currentSession.cards[0]['body']), currentSession.attributes);
              // const headers = templateCompiled(JSON.stringify(currentSession.cards[0]['headers']), currentSession.attributes);
              const params = currentSession.cards[0]['params'];
              const data = currentSession.cards[0]['body'];
              const headers = currentSession.cards[0]['headers'];

              logger.warn(JSON.stringify({
                params,
                data,
                headers
              }));

              await axios({
                method,
                url: encodeURI(url),
                params,
                data,
                headers
              })

                .then(function (response) {
                  console.log('response.data', response.data);
                  if (response.data && response.data.result && response.data.result.hasOwnProperty('attributes') && Array.isArray(response.data.result.attributes) && currentSession.cards[0]['response']) {
                    Object.keys(response.data.result.attributes).forEach(_key => {
                      const foundKey = _.filter(currentSession.cards[0]['response'], function (o) { return o.key === _key; });
                      if (foundKey) {
                        currentSession.attributes[foundKey.value] = response.data.result.attributes[foundKey.key]
                      }
                    });


                  }

                  if (currentSession.cards[0].responseType === 'quickReplies') {
                    const quickReplies = [];

                    if (response.data && response.data.result && response.data.result.list && Array.isArray(response.data.result.list)) {
                      response.data.result.list.forEach(button => {
                        quickReplies.push({
                          buttonName: button
                        });
                      });
                    }
                    currentSession.indexQuickReplies = 0;
                    if (quickReplies.length > 0) {
                      quickReplies[0].start = true;
                      quickReplies[quickReplies.length - 1].end = true;
                    }

                    currentSession.cards.shift();
                    currentSession.cards.unshift({
                      key,
                      quickReplies
                    });
                  } else if (currentSession.cards[0].responseType === 'text') {
                    currentSession.cards.shift();
                    if (response.data && response.data.result && response.data.result.list && response.data.result.list) {
                      response.data.result.list.map(_message => {
                        console.log("_message", _message);
                        currentSession.cards.unshift({
                          messageToUser: _message
                        });
                      });
                    }
                  } else if (['templates', 'genericTemplate', 'listTemplate'].indexOf(currentSession.cards[0].responseType) !== -1) {
                    const templates = [];

                    if (response.data && response.data.result && response.data.result.list && Array.isArray(response.data.result.list)) {
                      console.log(JSON.stringify(response.data.result.list, null, 2));
                      response.data.result.list.forEach(template => {
                        templates.push({
                          ...template
                        });
                      });
                    }
                    currentSession.indexTemplates = 0;
                    if (templates.length > 0) {
                      templates[0].start = true;
                      templates[templates.length - 1].end = true;
                    }

                    currentSession.cards.shift();
                    currentSession.cards.unshift({
                      key,
                      templates
                    });
                  }
                })
                .catch(async function (error) {
                  console.log('err', error);
                  currentSession.cards.shift();
                  await Facebook.sendText({
                    accessToken: foundSocialChannel.token,
                    userId: sender,
                    text: configPlatform.error
                  });
                });
              currentSession = await redisService.setAndGetCurrentSession({
                prefixKey: CONFIG['REDIS_PREFIX_KEY'],
                value: currentSession,
                filter: {
                  sender: sender,
                  recipient: recipient,
                  provider: configPlatform.provider
                }
              });
            } else if (currentSession.cards[0].hasOwnProperty('key')) {
              console.log('cau hoi hien tai co key');
              // Câu hỏi đầu tiên của list co key
              if (!currentSession.preQuestion) {
                console.log('TH KHONG CO CAU HOI TRUOC');
                // eslint-disable-next-line no-await-in-loop
                if (currentSession.cards[0] && currentSession.cards[0]['questionToUser']) {
                  await Facebook.sendText({
                    accessToken: foundSocialChannel.token,
                    userId: sender,
                    text: templateCompiled(currentSession.cards[0]['questionToUser'].toString(), currentSession.attributes)
                  });
                }

                if (currentSession.cards[0] && currentSession.cards[0]['quickReplies']) {

                  currentSession.preQuestion = currentSession.cards[0];
                  // eslint-disable-next-line no-await-in-loop
                  const currentQuickReplies = currentSession.cards[0]['quickReplies'];
                  console.log('currentQuickReplies', currentQuickReplies);
                  console.log('currentSession.indexQuickReplies', currentSession.indexQuickReplies);
                  const finalQuickReplies = _.slice(currentQuickReplies, currentSession.indexQuickReplies, currentSession.indexQuickReplies + (configPlatform.maxButton - 3));
                  console.log('finalQuickReplies', finalQuickReplies);
                  if (finalQuickReplies && finalQuickReplies[finalQuickReplies.length - 1] && !finalQuickReplies[finalQuickReplies.length - 1].end && currentQuickReplies.length > (configPlatform.maxButton - 2)) {
                    finalQuickReplies.push({
                      buttonName: configPlatform.seeMoreButtonName,
                      moreButton: true
                    });
                    console.log('seeMoreButtonName');
                  }
                  // currentSession.preQuestion['quickReplies'] = _.slice(currentQuickReplies,currentSession.indexQuickReplies + configPlatform.indexButtonCount,currentQuickReplies.length - 1);

                  if (finalQuickReplies && finalQuickReplies[0] && !finalQuickReplies[0].start && currentSession.indexQuickReplies !== 0) {

                    finalQuickReplies.unshift({
                      buttonName: configPlatform.priviousButtonName,
                      returnButton: true
                    });
                    console.log('priviousButtonName');
                  }
                  console.log('quickReplies 1', finalQuickReplies.map(e => e['buttonName']));
                  await Facebook.sendQuickReplies({
                    accessToken: foundSocialChannel.token,
                    userId: sender,
                    text: configPlatform.pleaseChoose,
                    quickReplies: finalQuickReplies.map(e => e['buttonName'])
                  }).then(() => {

                  });
                } else if (currentSession.cards[0] && currentSession.cards[0]['templates']) {

                  currentSession.preQuestion = currentSession.cards[0];
                  // eslint-disable-next-line no-await-in-loop
                  const currentTemplates = currentSession.cards[0]['templates'];
                  console.log('currentTemplates', currentTemplates);
                  console.log('currentSession.indexTemplates', currentSession.indexTemplates);
                  const finalTemplates = _.slice(currentTemplates, currentSession.indexTemplates, currentSession.indexTemplates + (configPlatform.maxTemplate - 3));
                  console.log('finalTemplates', finalTemplates);
                  if (finalTemplates && finalTemplates[finalTemplates.length - 1] && !finalTemplates[finalTemplates.length - 1].end && currentTemplates.length > (configPlatform.maxTemplate - 2)) {
                    finalTemplates.push({
                      buttons: [
                        {
                          type: "postback",
                          title: configPlatform.seeMoreButtonName,
                          payload: configPlatform.seeMoreButtonName
                        }
                      ],
                      moreButton: true
                    })
                    console.log('seeMoreButtonName');
                  }
                  // currentSession.preQuestion['quickReplies'] = _.slice(currentQuickReplies,currentSession.indexQuickReplies + configPlatform.indexButtonCount,currentQuickReplies.length - 1);

                  if (finalTemplates && finalTemplates[0] && !finalTemplates[0].start && currentSession.indexTemplates !== 0) {
                    finalTemplates.unshift({
                      buttons: [
                        {
                          type: "postback",
                          title: configPlatform.priviousButtonName,
                          payload: configPlatform.priviousButtonName
                        }
                      ],
                      returnButton: true
                    })
                    console.log('priviousButtonName');
                  }
                  // console.log('templates 1', finalTemplates.map(e => e['']));
                  await Facebook.sendTemplates({
                    accessToken: foundSocialChannel.token,
                    userId: sender,
                    text: configPlatform.pleaseChoose,
                    templates: finalTemplates
                  }).then(() => {

                  });
                }
                currentSession.preQuestion = currentSession.cards[0];
                currentSession.cards.shift();

                // eslint-disable-next-line no-await-in-loop
                currentSession = await redisService.setAndGetCurrentSession({
                  prefixKey: CONFIG['REDIS_PREFIX_KEY'],
                  value: currentSession,
                  filter: {
                    sender: sender,
                    recipient: recipient,
                    provider: configPlatform.provider
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
                    await Facebook.sendText({
                      accessToken: foundSocialChannel.token,
                      userId: sender,
                      text: templateCompiled(currentSession.cards[0]['questionToUser'], currentSession.attributes)
                    });

                    currentSession.attributes[currentSession.preQuestion['key']] = text;
                    currentSession.preQuestion = currentSession.cards.shift();

                    // eslint-disable-next-line no-await-in-loop
                    currentSession = await redisService.setAndGetCurrentSession({
                      prefixKey: CONFIG['REDIS_PREFIX_KEY'],
                      value: currentSession,
                      filter: {
                        sender: sender,
                        recipient: recipient,
                        provider: configPlatform.provider
                      }
                    });

                    // return finalResult;
                  } else {
                    // TH ko pass validate
                    console.log('KHONG PASS VALIDATE');
                    // eslint-disable-next-line no-await-in-loop
                    await Facebook.sendText({
                      accessToken: foundSocialChannel.token,
                      userId: sender,
                      text:
                        configPlatform.wrongFormat + templateCompiled(currentSession.preQuestion['questionToUser'], currentSession.attributes)
                    });

                    return finalResult;
                  }
                }
                else {
                  // TH Câu hỏi trước khong co validate
                  console.log('TH CAU HOI TRUOC KHONG CO VALIDATE');
                  if (currentSession.preQuestion.hasOwnProperty('quickReplies')) {
                    // TH CAU HOI TRUOC LA QUICK RELIES THI BAT DAP AN DE CHUYEN BLOCK

                    console.log('currentSession.preQuestion.quickReplies', currentSession.preQuestion.quickReplies);
                    currentSession.preQuestion.quickReplies.map((quickReply) => {
                      console.log(chatbotBlockIntent(quickReply['buttonName'].toString()), '-', chatbotBlockIntent(text));
                    });
                    const btnBlock = currentSession.preQuestion.quickReplies.find(quickReply => chatbotBlockIntent(quickReply['buttonName'].toString()) === chatbotBlockIntent(text));

                    console.log('btnBlock: ', btnBlock);

                    if (btnBlock && btnBlock.redirectToBlock) {
                      console.log('btnBlock && btnBlock.redirectToBlock');
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
                        await Facebook.sendText({
                          accessToken: foundSocialChannel.token,
                          userId: sender,
                          text: configPlatform.blockNotFound
                        });

                        return finalResult;
                      }
                      const cards = convertCards(foundChatbotBlock.chatbotCards);

                      console.log('cards: ', cards);
                      currentSession.attributes = {};
                      currentSession.indexQuickReplies = 0;
                      currentSession.indexTemplates = 0;
                      currentSession.attributes.placesId = foundSocialChannel.placesId;
                      currentSession.attributes.channelsId = foundSocialChannel.id;
                      currentSession.attributes.recipientId = sender;
                      currentSession.preQuestion = null;
                      currentSession.cards = cards;
                      // eslint-disable-next-line no-await-in-loop
                      currentSession = await redisService.setAndGetCurrentSession({
                        prefixKey: CONFIG['REDIS_PREFIX_KEY'],
                        value: currentSession,
                        filter: {
                          sender: sender,
                          recipient: recipient,
                          provider: configPlatform.provider
                        }
                      });
                      console.log('currentSession quick replies:', currentSession);

                      return finalResult;
                    } else if (btnBlock && !btnBlock.redirectToBlock) {
                      console.log('currentSession.indexQuickReplies', currentSession.indexQuickReplies);
                      if (btnBlock['returnButton']) {
                        currentSession.indexQuickReplies -= configPlatform.indexButtonCount;
                      } else if (btnBlock['moreButton']) {
                        currentSession.indexQuickReplies += configPlatform.indexButtonCount;
                      }
                      console.log('currentSession.indexQuickReplies', currentSession.indexQuickReplies);
                    } else {
                      if (chatbotBlockIntent(text) === chatbotBlockIntent(configPlatform.seeMoreButtonName)) {
                        currentSession.indexQuickReplies += configPlatform.indexButtonCount;
                      } else if (chatbotBlockIntent(text) === chatbotBlockIntent(configPlatform.priviousButtonName)) {
                        currentSession.indexQuickReplies -= configPlatform.indexButtonCount;
                      }
                      currentSession.cards.unshift(currentSession.preQuestion);
                      currentSession.preQuestion = null;
                      console.log('XU LI SAU');

                    }
                  } else if (currentSession.preQuestion.hasOwnProperty('templates')) {
                    currentSession.attributes[currentSession.preQuestion['key']] = text;
                    if (chatbotBlockIntent(text) === chatbotBlockIntent(configPlatform.seeMoreButtonName)) {
                      currentSession.indexTemplates += configPlatform.indexTemplateCount;
                    } else if (chatbotBlockIntent(text) === chatbotBlockIntent(configPlatform.priviousButtonName)) {
                      currentSession.indexTemplates -= configPlatform.indexTemplateCount;
                    }
                  } else {
                    currentSession.attributes[currentSession.preQuestion['key']] = text;
                    currentSession.preQuestion = null;
                    // currentSession.cards.shift();
                  }
                }
              }
            } else if (currentSession.cards[0].hasOwnProperty('messageToUser')) {
              // eslint-disable-next-line no-await-in-loop
              await Facebook.sendText({
                accessToken: foundSocialChannel.token,
                userId: sender,
                text: templateCompiled(currentSession.cards[0]['messageToUser'].toString(), currentSession.attributes)
              });
              currentSession.cards.shift();
            } else if (currentSession.cards[0].hasOwnProperty('path')) {
              // eslint-disable-next-line no-await-in-loop
              await Facebook.sendFile({
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

                  currentSession.attributes = {};
                  currentSession.indexQuickReplies = 0;
                  currentSession.indexTemplates = 0;
                  currentSession.attributes.placesId = foundSocialChannel.placesId;
                  currentSession.attributes.channelsId = foundSocialChannel.id;
                  currentSession.attributes.recipientId = sender;
                  currentSession.preQuestion = null;
                  currentSession.cards = cards;
                  currentSession = await redisService.setAndGetCurrentSession({
                    prefixKey: CONFIG['REDIS_PREFIX_KEY'],
                    value: currentSession,
                    filter: {
                      sender: sender,
                      recipient: recipient,
                      provider: configPlatform.provider
                    }
                  });

                  console.log('curentSescction redirect: ', currentSession);
                } else {
                  await Facebook.sendText({
                    accessToken: foundSocialChannel.token,
                    userId: sender,
                    text: configPlatform.blockNotFound
                  });
                  currentSession.cards.shift();
                  currentSession = await redisService.setAndGetCurrentSession({
                    prefixKey: CONFIG['REDIS_PREFIX_KEY'],
                    value: currentSession,
                    filter: {
                      sender: sender,
                      recipient: recipient,
                      provider: configPlatform.provider
                    }
                  });
                }
              });
            } else if (currentSession.cards[0].hasOwnProperty('quickReplies')) {
              console.log('current card - quickReplies');
              currentSession.preQuestion = currentSession.cards[0];
              const currentQuickReplies = currentSession.preQuestion['quickReplies'];
              const finalQuickReplies = _.slice(currentQuickReplies, currentSession.indexQuickReplies, currentSession.indexQuickReplies + configPlatform.maxButton - configPlatform.indexButtonCount);

              if (finalQuickReplies && finalQuickReplies[finalQuickReplies.length - 1] && !finalQuickReplies[finalQuickReplies.length - 1].end) {
                finalQuickReplies.push({
                  buttonName: configPlatform.seeMoreButtonName,
                  moreButton: true
                });
              }
              // currentSession.preQuestion['quickReplies'] = _.slice(currentQuickReplies,currentSession.indexQuickReplies + configPlatform.indexButtonCount,currentQuickReplies.length - 1);

              if (finalQuickReplies && finalQuickReplies[0] && !finalQuickReplies[0].start) {
                finalQuickReplies.unshift({
                  buttonName: configPlatform.priviousButtonName,
                  returnButton: true
                });
              }
              console.log('sendQuickReplies 2', finalQuickReplies.map(e => e['buttonName']));
              await Facebook.sendQuickReplies({
                accessToken: foundSocialChannel.token,
                userId: sender,
                text: configPlatform.pleaseChoose,
                quickReplies: finalQuickReplies.map(e => e['buttonName'])
              })
                .then(async () => {
                  // add
                  console.log('set current card');
                  currentSession.preQuestion['quickReplies'] = currentSession.cards[0]['quickReplies'];
                  currentSession.cards.shift();
                  currentSession = await redisService.setAndGetCurrentSession({
                    prefixKey: CONFIG['REDIS_PREFIX_KEY'],
                    value: currentSession,
                    filter: {
                      sender: sender,
                      recipient: recipient,
                      provider: configPlatform.provider
                    }
                  });
                  // console.log('currentSession dataUsers: ', currentSession.cards[0]);
                });

              return finalResult;
            } else if (currentSession.cards[0].hasOwnProperty('templates')) {
              console.log('current card - templates');
              currentSession.preQuestion = currentSession.cards[0];
              const currentTemplates = currentSession.preQuestion['templates'];
              const finalTemplates = _.slice(currentTemplates, currentSession.indexTemplates, currentSession.indexTemplates + configPlatform.maxButton - configPlatform.indexTemplateCount);

              if (finalTemplates && finalTemplates[finalTemplates.length - 1] && !finalTemplates[finalTemplates.length - 1].end) {
                finalTemplates.push({
                  buttonName: configPlatform.seeMoreButtonName,
                  moreButton: true
                });
              }
              // currentSession.preQuestion['quickReplies'] = _.slice(currentQuickReplies,currentSession.indexQuickReplies + configPlatform.indexButtonCount,currentQuickReplies.length - 1);

              if (finalTemplates && finalTemplates[0] && !finalTemplates[0].start) {
                finalTemplates.push({
                  buttons: [
                    {
                      type: "postback",
                      title: configPlatform.seeMoreButtonName,
                      payload: configPlatform.seeMoreButtonName
                    }
                  ],
                  moreButton: true
                })
              }
              console.log('finalTemplates ', JSON.stringify(finalTemplates, null, 2));
              await Facebook.sendTemplates({
                accessToken: foundSocialChannel.token,
                userId: sender,
                text: configPlatform.pleaseChoose,
                templates: finalTemplates
              })
                .then(async () => {
                  // add
                  console.log('set current card');
                  currentSession.preQuestion['templates'] = currentSession.cards[0]['templates'];
                  currentSession.cards.shift();
                  currentSession = await redisService.setAndGetCurrentSession({
                    prefixKey: CONFIG['REDIS_PREFIX_KEY'],
                    value: currentSession,
                    filter: {
                      sender: sender,
                      recipient: recipient,
                      provider: configPlatform.provider
                    }
                  });
                });

              return finalResult;
            } else if (Array.isArray(currentSession.cards[0]) && currentSession.cards[0].length > 0) {
              // eslint-disable-next-line no-await-in-loop
              await Facebook.sendAlbum({
                accessToken: foundSocialChannel.token,
                userId: sender,
                templates: currentSession.cards[0]
              });
              currentSession.cards.shift();
            } else {
              console.log('warning 2');
            }
            // eslint-disable-next-line no-await-in-loop
            currentSession = await redisService.setAndGetCurrentSession({
              prefixKey: CONFIG['REDIS_PREFIX_KEY'],
              value: currentSession,
              filter: {
                sender: sender,
                recipient: recipient,
                provider: configPlatform.provider
              }
            });
            if (currentSession.cards.length === 0) {

              return finalResult;
            }
          }
        }
      } else {

        const recipient = event.recipient.id;
        const foundSocialChannel = await Model.findOne(socialChannels, {
          where: {
            link: recipient
          },
          include: [{ model: chatbotTemplates, as: 'chatbotTemplates' }]
        });

        // console.log('foundSocialChannel: ', foundSocialChannel);

        if (!foundSocialChannel) {
          return configPlatform.socialChannelNotFound;
        }
        const sender = event.sender.id;

        await Facebook.sendText({
          accessToken: foundSocialChannel.token,
          userId: sender,
          text: configPlatform.notSupportFormat
        });
      }
    } else if (data && data.object === 'page' && data.entry && data.entry[0] && data.entry[0].changes && data.entry[0].changes[0] && data.entry[0].changes[0]['value'] && data.entry[0].changes[0]['value']['comment_id'] && data.entry[0].changes[0]['value']['item'] === 'comment' && data.entry[0].changes[0]['value']['verb'] === 'add') {
      console.log('comment', JSON.stringify(data, null, 2));
      const entry = data.entry[0];
      const event = entry.changes[0];
      const pageId = data.entry[0].id;
      const commentId = entry.changes[0]['value']['comment_id'];
      const foundSocialChannel = await Model.findOne(socialChannels, {
        where: {
          link: pageId
        },
        attributes: ['id', 'token', 'placesId', 'link'],
        include: [{ model: socialGroupChannels, as: 'socialGroupChannels', attributes: ['name'], required: true }]
      }).catch(err => {
        console.log(err);
      });
      const socialChannelsId = foundSocialChannel.id ? foundSocialChannel.id : '';

      const foundProps = await Model.findOne(socialChannelProps, {
        where: {
          socialChannelsId: socialChannelsId
        },
        attributes: ['autoHideComment', 'autoReplyComment'],
      }).catch(err => {
        console.log('error', err);
      });
      const comment = await getComment({
        pageId,
        commentId
      }).catch(error => console.log(error));
      console.log('comment ', comment);
      if (foundProps && comment && comment['from'] && comment['from']['id'] !== foundSocialChannel['link']) {
        if (Number(foundProps.autoHideComment.status) === 1 && comment['can_hide'] === true) {
          const result = await hideComment({ pageId: pageId, commentId: commentId }).catch(err => {
            console.log('error auto hide comment', err);
          })
          console.log('hide success', result);
        }

        if (Number(foundProps.autoReplyComment.status) === 1 && comment['can_reply_privately'] === true) {
          const message = foundProps.autoReplyComment.message || '';
          const result = await replyComment({ pageId: pageId, message: message, objectId: commentId }).catch(err => {
            console.log('error auto reply comment', err);
          })
          console.log('reply success', result);
        }
      }
    }
    console.log('finalResult', finalResult);

    return finalResult;
  }
};
