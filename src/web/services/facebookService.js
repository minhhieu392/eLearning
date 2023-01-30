import _ from 'lodash';
import moment from 'moment-timezone';
import Moment from 'moment';
import { extendMoment } from 'moment-range';
import * as ApiErrors from '../../errors';
import ErrorHelpers from '../../helpers/errorHelpers';
import regexPattern from '../../utils/regexPattern';
import models from '../../entity/index';
import clinicServicePackageService from './clinicServicePackageService';
import socialChannelService from './socialChannelService';
import clinicServiceService from '../../services/clinicServiceService';
import crenatiosChatbot from './facebook/crenatiosChatbot';
import clinicQueueService from './clinicQueueService';

const momentRange = extendMoment(Moment);
const { medCustomers, clinicQueues } = models;
const tz = 'ASIA/Ho_Chi_Minh';
const users = [{ id: null, name: null, phone: null, dateOfBirth: null, gender: null }];
const sessions = [
  { userId: null, questionId: null, accessToken: null, placesId: null, services: null, channelsId: null }
];
const books = [
  {
    userId: null,
    descriptions: null,
    date: null,
    time: null,
    status: null,
    servicesId: null,
    services: null,
    servicePackagesId: null,
    servicePackages: null,
    ordinalNumber: null,
    doctorsId: null,
    quickScheduleTime: null,
    indexOfSchedileTime: null
  }
];

let questions = [];

let templates = [];

// eslint-disable-next-line require-jsdoc
const findOrCreateBook = userId => {
  let check = -1;

  for (let i = 0; i < books.length; i++) {
    if (books[i].userId === userId) {
      check = i;

      return i;
    }
  }
  if (check === -1) {
    books.push({
      userId,
      descriptions: null,
      date: null,
      time: null,
      status: null,
      services: null,
      servicePackages: null
    });

    return books.length - 1;
  }
};

// eslint-disable-next-line require-jsdoc
const findUser = id => {
  for (let i = 0; i < users.length; i++) {
    if (users[i].id === id) {
      return i;
    }
  }

  return -1;
};

// eslint-disable-next-line require-jsdoc
const findBook = userId => {
  for (let i = 0; i < books.length; i++) {
    if (books[i].userId === userId) {
      return i;
    }
  }

  return null;
};

// eslint-disable-next-line require-jsdoc
const getSession = userId => {
  for (let i = 0; i < sessions.length; i++) {
    if (sessions[i].userId === userId) {
      return sessions[i];
    }
  }

  return null;
};

// const getTemplateIdByCategory = (category) => {
//   for (let i = 0; i < templates.length; i++) {
//     if (category === templates[i].category) {
//       return templates[i].id;
//     }
//   }
//   return null;
// };

// eslint-disable-next-line require-jsdoc
const getTemplateIdByQuestionId = questionId => {
  for (let i = 0; i < questions.length; i++) {
    if (questionId === questions[i].id) {
      return questions[i].templateId;
    }
  }

  return null;
};

// eslint-disable-next-line require-jsdoc
const getQuestionsOfTemplate = templateId => {
  const ql = [];

  // console.log("questions ", questions.length)
  for (let i = 0; i < questions.length; i++) {
    if (templateId === questions[i].templateId) {
      ql.push(questions[i]);
      // onsole.log("ql = ", ql)
    } else {
      // console.log("ql111 = ", questions[i])
    }
  }
  // console.log("ql = ", ql)

  return ql;
};

// eslint-disable-next-line require-jsdoc
const getNextQuestionId = (templateId, questionId) => {
  const questionsOfTemplate = getQuestionsOfTemplate(templateId);

  for (let i = 0; i < questionsOfTemplate.length; i++) {
    if (questionsOfTemplate[i].id === questionId) {
      if (i === questionsOfTemplate.length - 1) {
        return null;
      }

      return questionsOfTemplate[i + 1].id;
    }
  }

  return null;
};

// eslint-disable-next-line require-jsdoc
const setSession = (userId, questionId) => {
  for (let i = 0; i < sessions.length; i++) {
    if (sessions[i].userId === userId) {
      sessions[i].questionId = questionId;
      // sessions[i].accessToken = accessToken;
    }
  }
};

// eslint-disable-next-line require-jsdoc
const setSessionAccesstoken = (userId, accessToken, placesId, channelsId) => {
  for (let i = 0; i < sessions.length; i++) {
    if (sessions[i].userId === userId) {
      sessions[i].accessToken = accessToken;
      sessions[i].placesId = placesId;
      sessions[i].channelsId = channelsId;
    }
  }
};
// eslint-disable-next-line require-jsdoc
const getQuestion = questionId => {
  for (let i = 0; i < questions.length; i++) {
    if (questions[i].id === questionId) {
      return questions[i];
    }
  }

  return null;
};

// const sessionManager = (userId, question) => {
//   const category = classifier(question);
//   const templateId = getTemplateIdByCategory(category);
//   const questionsOfTemplate = getQuestionsOfTemplate(templateId);
//   const currentSession = getSession(userId);

//   if (currentSession === null) {
//     sessions.push(userId, questionsOfTemplate[0].id);
//   } else {
//     getNextQuestionId(templateId, currentSession.questionId);
//   }
// };

// eslint-disable-next-line require-jsdoc
const getCategoryByTemplateId = templateId => {
  for (let i = 0; i < templates.length; i++) {
    if (templates[i].id === templateId) {
      return templates[i].category;
    }
  }

  return null;
};

// eslint-disable-next-line require-jsdoc
const compareDate = date => {
  // get current date
  let today = new Date();
  const dd = String(today.getDate()).padStart(2, '0');
  const mm = String(today.getMonth() + 1).padStart(2, '0'); // January is 0!
  const yyyy = today.getFullYear();

  today = `${dd}/${mm}/${yyyy}`;

  today = today.split('/');
  const currentDate = new Date(today[2], today[1], today[0]);

  // eslint-disable-next-line no-param-reassign
  date = date.split('/');
  const scheduleDate = new Date(date[2], date[1], date[0]);

  if (currentDate.getTime() < scheduleDate.getTime()) {
    return true;
  }

  return false;
};

// eslint-disable-next-line require-jsdoc
const endConversation = async senderId => {
  // const questionsOfTemplate = getQuestionsOfTemplate(8);
  setSession(senderId, null);
  // await sendQuickReplies(accessToken, senderId, questionsOfTemplate[0].content, ["Có", "Không"]);
};
let accessToken = '';

export default {
  post_webhook: async param => {
    let finnalyResult;
    let indexOfQuestion = 0;
    let questionsOfTemplate;
    let channelsId, channelsToken, placesId;

    try {
      templates = await crenatiosChatbot.getArrayTemplates();

      console.log("templates: ======================", templates)

      for (let i = 0; i < templates.length; i++) {
        const id = parseInt(templates[i].id);

        // eslint-disable-next-line no-await-in-loop
        await crenatiosChatbot.getQuestionByItents(id).then(data => {
          // console.log('==========================question==============================', data);
          const questionIntent = data.map(e => {
            return {
              ...e,
              id: indexOfQuestion++
            };
          });

          questions.push(...questionIntent);
        });
      }

      const { entity } = param;

      console.log('facebookService post_webhook: ', entity);
      const { entry } = entity || {};
      const [messaging] = entry[0].messaging || [];

      console.log('messaging', messaging);
      const { sender, recipient, timestamp, message } = messaging || {};
      const { mid, text, reply_to } = message || {};
      const attachments = [];

      if ((message !== null) & (message !== undefined)) {
        if (message.attachments !== null && message.attachments !== undefined) {
          attachments = message.attachments;
        }
      }

      const { type, payload, title, URL } = attachments || {};
      const senderId = sender.id;
      const pageId = recipient.id;

      if (findUser(senderId) === -1) {
        users.push({ id: senderId, name: null, phone: null, dateOfBirth: null, gender: null });
        sessions.push({ userId: senderId, questionId: null, accessToken: null, placesId: null });
      }

      const currentSession = getSession(sender.id);

      console.log(
        '==============currentSession=%s ========== users=%s ======== book=%s',
        currentSession,
        users[findUser(senderId)],
        books[findUser(senderId)]
      );
      accessToken = currentSession.accessToken;
      // có tin nhắn
      if (message) {
        const param = {
          property: {
            link: pageId
          }
        };

        // get socialChannel
        const resultOneSocialChannels = await socialChannelService.check_exists(param);

        // console.log("resultOneSocialChannels", resultOneSocialChannels)

        channelsId = resultOneSocialChannels.id;
        channelsToken = resultOneSocialChannels.token;
        placesId = resultOneSocialChannels.placesId;
        setSessionAccesstoken(senderId, channelsToken, placesId, channelsId);

        console.log('accessToken: --------------------------- ', accessToken);

        if (text !== null && text !== undefined) {
          if (currentSession.questionId === null) {
            // Khách đang đặt câu hỏi chưa kết thúc cuộc nói chuyện
            switch (text.toLowerCase()) {
              case '1.đặt lịch':
                {
                  questionsOfTemplate = getQuestionsOfTemplate(2);

                  console.log("====================questionsOfTemplate================, ", questionsOfTemplate);
                  setSession(senderId, questionsOfTemplate[0].id);
                  finnalyResult = {
                    userId: senderId,
                    text: questionsOfTemplate[0].content,
                    accessToken: accessToken,
                    quickReplies: questionsOfTemplate[0].quickReplies,
                    success: true,
                    errors: [],
                    messages: 'ok'
                  };
                }
                break;
              case '2.xem lịch':
                {
                  questionsOfTemplate = getQuestionsOfTemplate(4);
                  console.log("====================questionsOfTemplate================, ", questionsOfTemplate);
                  setSession(senderId, questionsOfTemplate[0].id);
                  finnalyResult = {
                    userId: senderId,
                    text: questionsOfTemplate[0].content,
                    accessToken: accessToken,
                    quickReplies: questionsOfTemplate[0].quickReplies,
                    success: true,
                    errors: [],
                    messages: 'ok'
                  };
                }
                break;
              case '3.cập nhật lịch':
                {
                  questionsOfTemplate = getQuestionsOfTemplate(3);
                  console.log("====================questionsOfTemplate================, ", questionsOfTemplate);
                  setSession(senderId, questionsOfTemplate[0].id);
                  finnalyResult = {
                    userId: senderId,
                    text: questionsOfTemplate[0].content,
                    accessToken: accessToken,
                    quickReplies: questionsOfTemplate[0].quickReplies,
                    success: true,
                    errors: [],
                    messages: 'ok'
                  };
                }
                break;
              case '4.huỷ lịch':
                {
                  questionsOfTemplate = getQuestionsOfTemplate(5);

                  console.log("====================questionsOfTemplate================, ", questionsOfTemplate);
                  setSession(senderId, questionsOfTemplate[0].id);
                  // await sendText(accessToken, senderId, questionsOfTemplate[0].content);

                  // setTimeout(() => setSession(senderId, null), 900000);
                  finnalyResult = {
                    userId: senderId,
                    text: questionsOfTemplate[0].content,
                    accessToken: accessToken,
                    quickReplies: [],
                    success: true,
                    errors: [],
                    messages: 'ok'
                  };
                }
                break;
              default:
                {
                  console.log('currentSession.questionId === null ', currentSession);
                  questionsOfTemplate = getQuestionsOfTemplate(1);
                  console.log("====================questionsOfTemplate================, ", questionsOfTemplate);
                  // setSession(senderId, questionsOfTemplate[0].id);

                  finnalyResult = {
                    userId: senderId,
                    text: questionsOfTemplate[0].content,
                    accessToken: currentSession.accessToken,
                    quickReplies: questionsOfTemplate[0].quickReplies,
                    success: true,
                    errors: [],
                    messages: 'ok'
                  };
                }
                break;
            }
          } else if (text === 'end') {
            finnalyResult = {
              userId: senderId,
              text: 'Kết thúc cuộc trò chuyện! Hẹn gặp lại',
              accessToken: accessToken,
              quickReplies: [],
              success: true,
              errors: [],
              messages: 'ok'
            };
            setSession(senderId, null);
            endConversation(senderId);
          } else {
            // console.log("session lan dau")
            const templateId = getTemplateIdByQuestionId(currentSession.questionId);
            const category = getCategoryByTemplateId(templateId);
            const nextQuestionId = getNextQuestionId(templateId, currentSession.questionId);
            const currentQuestion = getQuestion(currentSession.questionId);
            const question = getQuestion(nextQuestionId);

            console.log(
              'templateId=%s || category=%s || nextQuestionId=%s || currentQuestion=%s',
              templateId,
              category,
              nextQuestionId,
              currentQuestion.name
            );
            if (question !== null) {
              console.log("category: ", category);
              switch (category) {
                case 'book':
                  {
                    console.log("getName: ", currentQuestion.name);
                    if (currentQuestion.name === 'getName') {
                      users[findUser(senderId)].name = text;
                      setSession(senderId, nextQuestionId);
                      // await sendQuickPhoneReply(accessToken, senderId, question.content);
                      finnalyResult = {
                        userId: senderId,
                        text: question.content,
                        accessToken: accessToken,
                        quickReplies: question.quickReplies,
                        success: true,
                        errors: [],
                        messages: 'ok'
                      };
                    } else if (currentQuestion.name === 'getPhone') {
                      if (text.match(regexPattern.phoneNumberVie) === null) {
                        // await sendText(accessToken, senderId, 'Định dạng dữ liệu cho số điện thoại bị sai, vui lòng nhập lại!!');
                        // await sendQuickPhoneReply(accessToken, senderId, currentQuestion.content);
                        finnalyResult = {
                          userId: senderId,
                          text: 'Định dạng dữ liệu cho số điện thoại bị sai, vui lòng nhập lại!!',
                          accessToken: accessToken,
                          quickReplies: question.quickReplies,
                          success: true,
                          errors: [],
                          messages: 'ok'
                        };
                      } else {
                        const phone = text;

                        users[findUser(senderId)].phone = phone;
                        setSession(senderId, question.id);
                        // await sendText(accessToken, senderId, question.content);
                        finnalyResult = {
                          userId: senderId,
                          text: question.content,
                          accessToken: accessToken,
                          quickReplies: question.quickReplies,
                          success: true,
                          errors: [],
                          messages: 'ok'
                        };
                      }
                    } else if (currentQuestion.name === 'getGender') {
                      console.log('books[findOrCreateBook(senderId)] getGender', books[findOrCreateBook(senderId)]);

                      // const arrayServicesNew = Object.keys(uniqueSetServices).map(i => uniqueSetServices[i]);
                      if (text.toLowerCase() === '1.nam') {
                        users[findUser(senderId)].gender = text;
                        setSession(senderId, question.id);
                        finnalyResult = {
                          userId: senderId,
                          text: question.content,
                          accessToken: accessToken,
                          quickReplies: [],
                          success: true,
                          errors: [],
                          messages: 'ok'
                        };
                      } else if (text.toLowerCase() === '2.nữ') {
                        users[findUser(senderId)].gender = text;
                        setSession(senderId, question.id);
                        finnalyResult = {
                          userId: senderId,
                          text: question.content,
                          accessToken: accessToken,
                          quickReplies: [],
                          success: true,
                          errors: [],
                          messages: 'ok'
                        };
                      } else {
                        finnalyResult = {
                          userId: senderId,
                          text: currentQuestion.content,
                          accessToken: accessToken,
                          quickReplies: currentQuestion.quickReplies,
                          success: true,
                          errors: [],
                          messages: 'ok'
                        };
                      }
                    } else if (currentQuestion.name === 'getdateOfBirth') {
                      console.log('ddddddddddddddddddddddddd');
                      const filter = {
                        status: true,
                        placesId: currentSession.placesId
                        // servicesId: books[findOrCreateBook(senderId)].servicesId
                      };
                      const range = [0, 11];
                      const sort = [['id', 'ASC']];

                      const param = {
                        range,
                        sort,
                        filter
                      };
                      const resultServices = await clinicServiceService.get_list(param);

                      console.log(
                        '-------------------------******************resultServices*********************----------------------'
                      );
                      console.log('-------------------------resultServices----------------------', resultServices);

                      const arrayServices = resultServices.rows.reduce((o, e) => {
                        const arrayE = _.pick(e, ['id', 'name']);

                        // console.log("arrayE",arrayE.hourFrame);
                        o.push(arrayE.id + '.' + arrayE.name);
                        // console.log("oooooooooo" ,o);

                        return o;
                      }, []);
                      // const uniqueSetServices = new Set(arrayServices);
                      const uniqueSetServices = _.uniq(arrayServices);

                      console.log('uniqueSetServices', uniqueSetServices);
                      if (message.text.match(regexPattern.formatdateVie) === null) {
                        // await sendText(accessToken, senderId, 'Ngày tháng năm bị sai, vui lòng điền theo đúng định dạng ngày/tháng/năm');
                        // await sendText(accessToken, senderId, currentQuestion.content);
                        finnalyResult = {
                          userId: senderId,
                          text:
                            '(*) Ngày sinh bị sai định dạng, vui lòng điền theo đúng định dạng ngày/tháng/năm' +
                            '\n' +
                            question.content,
                          accessToken: accessToken,
                          quickReplies: uniqueSetServices,
                          success: true,
                          errors: [],
                          messages: 'ok'
                        };
                      } else {
                        users[findUser(senderId)].dateOfBirth = text;
                        setSession(senderId, question.id);

                        // await sendText(accessToken, senderId, question.content);
                        finnalyResult = {
                          userId: senderId,
                          text: question.content,
                          accessToken: accessToken,
                          quickReplies: uniqueSetServices,
                          success: true,
                          errors: [],
                          messages: 'ok'
                        };
                      }
                    } else if (currentQuestion.name === 'getServices') {
                      console.log('books[findOrCreateBook(senderId)] getServices', books[findOrCreateBook(senderId)]);
                      const arrayService = _.split(text, '.', 2);

                      books[findOrCreateBook(senderId)].services = arrayService[1];
                      books[findOrCreateBook(senderId)].servicesId = arrayService[0];

                      const filter = {
                        status: true,
                        placesId: currentSession.placesId,
                        servicesId: books[findOrCreateBook(senderId)].servicesId
                      };
                      const range = [0, 11];
                      const sort = [['id', 'ASC']];
                      const param = {
                        range,
                        sort,
                        filter
                      };
                      const resultServicePackages = await clinicServicePackageService.get_list(param);

                      console.log(
                        '-------------------------******************resultServicePackages******************----------------------',
                        resultServicePackages
                      );
                      console.log(
                        '-------------------------******************resultServicePackages******************----------------------'
                      );
                      const arrayPackageServices = resultServicePackages.rows.reduce((o, e) => {
                        const arrayE = _.pick(e, ['id', 'name', 'usersDoctorId']);

                        o.push(arrayE.id + '.' + arrayE.usersDoctorId + '.' + arrayE.name);

                        return o;
                      }, []);
                      // const uniqueSetPackageServices = new Set(arrayPackageServices);
                      const uniqueSetPackageServices = _.uniq(arrayPackageServices);

                      console.log('uniqueSetPackageServices ', uniqueSetPackageServices);
                      // console.log("getService ", currentQuestion)
                      // users[findUser(senderId)].name = text;
                      setSession(senderId, nextQuestionId);
                      finnalyResult = {
                        userId: senderId,
                        text: question.content,
                        accessToken: accessToken,
                        quickReplies: uniqueSetPackageServices,
                        success: true,
                        errors: [],
                        messages: 'ok'
                      };
                    } else if (currentQuestion.name === 'getPackageServices') {
                      const arrayServicePackages = _.split(text, '.', 3);

                      books[findOrCreateBook(senderId)].servicePackages = arrayServicePackages[2];
                      books[findOrCreateBook(senderId)].doctorsId = arrayServicePackages[1];
                      books[findOrCreateBook(senderId)].servicePackagesId = arrayServicePackages[0];
                      // console.log("books[findOrCreateBook(senderId)] getPackageServices", books[findOrCreateBook(senderId)])
                      // console.log("getPackageServices ", currentQuestion)
                      // users[findUser(senderId)].name = text;
                      setSession(senderId, nextQuestionId);

                      finnalyResult = {
                        userId: senderId,
                        text: question.content,
                        accessToken: accessToken,
                        quickReplies: [],
                        success: true,
                        errors: [],
                        messages: 'ok'
                      };
                    } else if (currentQuestion.name === 'getReason') {
                      books[findOrCreateBook(senderId)].descriptions = text;
                      setSession(senderId, question.id);

                      const startDate = new Date();
                      const rangeDate = momentRange.range(
                        momentRange(startDate),
                        momentRange(startDate).add(3, 'days')
                      );
                      const acc = Array.from(rangeDate.by('days'));
                      const lstRangeDate = acc.map(m => m.format('DD/MM/YYYY'));

                      console.log('lstRangeDate', lstRangeDate);

                      finnalyResult = {
                        userId: senderId,
                        text: question.content,
                        accessToken: accessToken,
                        quickReplies: lstRangeDate,
                        success: true,
                        errors: [],
                        messages: 'ok'
                      };
                    } else if (currentQuestion.name === 'getDate') {
                      // eslint-disable-next-line no-useless-escape
                      if (message.text.match(regexPattern.formatdateVie) === null) {
                        // await sendText(accessToken, senderId, 'Ngày tháng năm bị sai, vui lòng điền theo đúng định dạng ngày/tháng/năm');
                        // await sendText(accessToken, senderId, currentQuestion.content);
                        finnalyResult = {
                          userId: senderId,
                          text:
                            '(*) Ngày tháng năm bị sai, vui lòng điền theo đúng định dạng ngày/tháng/năm' +
                            '\n' +
                            question.content,
                          accessToken: accessToken,
                          quickReplies: question.quickReplies,
                          success: true,
                          errors: [],
                          messages: 'ok'
                        };
                      } else {
                        const date = text;
                        // if (compareDate(date) === true)
                        // {
                        const datetime = moment(date, 'DD/MM/YYYY').format('YYYY-MM-DD HH:mm:ss');

                        console.log('datetime', datetime);

                        const param = {
                          filter: {
                            placesId: currentSession.placesId || '0',
                            servicesPackagesId: books[findOrCreateBook(senderId)].servicePackagesId || '0',
                            inDay: datetime
                          }
                        };

                        const resultGetClinicQueuesScheduleTime = await clinicQueueService.clinic_queues_schedule_time_get(
                          param
                        );

                        console.log(
                          '---------------------------------------------resultGetClinicQueuesScheduleTime----------------------------------------',
                          resultGetClinicQueuesScheduleTime
                        );
                        console.log(
                          '---------------------------------------------resultGetClinicQueuesScheduleTime----------------------'
                        );

                        const arrayQueuesScheduleTime = resultGetClinicQueuesScheduleTime.rows.reduce((o, e) => {
                          const arrayE = _.pick(e, [
                            'ordinalNumber',
                            'servicePackageId',
                            'servicePackageName',
                            'hourFrame'
                          ]);

                          o.push(arrayE.ordinalNumber + '.' + moment(arrayE.hourFrame, 'HH:mm:ss').format('HH:mm'));

                          return o;
                        }, []);

                        console.log('arrayQueuesScheduleTime', arrayQueuesScheduleTime);
                        const uniqueQueuesScheduleTime = _.uniq(arrayQueuesScheduleTime);

                        books[findOrCreateBook(senderId)].date = date;
                        books[findOrCreateBook(senderId)].quickScheduleTime = uniqueQueuesScheduleTime;
                        let rely;

                        if (uniqueQueuesScheduleTime.length > 13) {
                          rely = _.slice(uniqueQueuesScheduleTime, 0, 12);
                          rely.push('xemthem');
                        } else {
                          rely = uniqueQueuesScheduleTime;
                        }
                        books[findOrCreateBook(senderId)].indexOfSchedileTime = rely.length;

                        setSession(senderId, question.id);
                        finnalyResult = {
                          userId: senderId,
                          text: question.content,
                          accessToken: accessToken,
                          quickReplies: rely,
                          success: true,
                          errors: [],
                          messages: 'ok'
                        };
                        /* }
                                        else
                                        {
                                            sendText(accessToken, senderId, 'Lịch hiện tại đã vượt qua lịch đặt của bạn, xin vui lòng điền lại ngày hẹn!!');
                                            await sendText(accessToken, senderId, currentQuestion.content);
                                        }*/
                      }
                    } else if (currentQuestion.name === 'getTime') {
                      console.log('arrayTime text', text);
                      const arrayTime = _.split(text, '.', 2);

                      console.log('arrayTime', arrayTime[1]);
                      console.log('arrayTime', arrayTime[0]);

                      if (arrayTime[0].toLowerCase() === 'xemthem') {
                        const book = books[findOrCreateBook(senderId)];

                        console.log('||||||||||||||||||||||quickScheduleTime: ', book.quickScheduleTime);

                        const relyParent = book.quickScheduleTime;
                        let rely;
                        const indexOfList = book.indexOfSchedileTime;

                        if (indexOfList > relyParent.length) {
                          rely = _.slice(relyParent, 0, 12);
                          rely.push('xemthem');
                          books[findOrCreateBook(senderId)].indexOfSchedileTime = 0;
                        } else {
                          rely = _.slice(relyParent, indexOfList, indexOfList + 11);
                          books[findOrCreateBook(senderId)].indexOfSchedileTime = indexOfList + 11;
                          rely.unshift('trolai');
                          rely.push('xemthem');
                        }

                        console.log('rely: ', rely);

                        finnalyResult = {
                          userId: senderId,
                          text: questions[10].content,
                          accessToken: accessToken,
                          quickReplies: rely,
                          success: true,
                          errors: [],
                          messages: 'ok'
                        };
                      } else if (arrayTime[0].toLowerCase() === 'trolai') {
                        const book = books[findOrCreateBook(senderId)];

                        console.log('||||||||||||||||||||||quickScheduleTime: ', book.quickScheduleTime);

                        const relyParent = book.quickScheduleTime;
                        let rely;
                        const indexOfList = book.indexOfSchedileTime;

                        if (indexOfList === 0) {
                          rely = _.slice(relyParent, 0, 12);
                          rely.push('xemthem');
                        } else {
                          rely = _.slice(relyParent, indexOfList - 11, indexOfList);
                          books[findOrCreateBook(senderId)].indexOfSchedileTime = indexOfList - 11;
                          rely.unshift('trolai');
                          rely.push('xemthem');
                        }

                        finnalyResult = {
                          userId: senderId,
                          text: questions[10].content,
                          accessToken: accessToken,
                          quickReplies: rely,
                          success: true,
                          errors: [],
                          messages: 'ok'
                        };
                      } else if (arrayTime[1].match(/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/g) === null) {
                        // await sendText(accessToken, senderId, 'Thời gian bị sai, vui lòng điền theo định dạng Giờ:Phút (01:00)');
                        // await sendText(accessToken, senderId, currentQuestion.content);
                        finnalyResult = {
                          userId: senderId,
                          text:
                            'Thời gian bị sai, vui lòng điền theo định dạng Giờ:Phút (01:00) ' +
                            '\n' +
                            question.content,
                          accessToken: accessToken,
                          quickReplies: question.quickReplies,
                          success: true,
                          errors: [],
                          messages: 'ok'
                        };
                      } else {
                        books[findOrCreateBook(senderId)].ordinalNumber = arrayTime[0];
                        books[findOrCreateBook(senderId)].time = arrayTime[1];
                        setSession(senderId, question.id);
                        // await sendText(accessToken, senderId, question.content);
                        console.log(' users[findUser(senderId)]', users[findUser(senderId)]);
                        const user = users[findUser(senderId)];
                        const book = books[findBook(senderId)];

                        console.log('book', book);
                        console.log('user', user);
                        const secondsToMinutes = book.time;

                        console.log('book.time', book.time);
                        const minutes = secondsToMinutes.split(':')[1];
                        const hours = secondsToMinutes.split(':')[0];
                        const dateScheduled = moment(book.date, 'DD/MM/YYYY')
                          .add(hours, 'hours')
                          .add(minutes, 'minutes')
                          .toDate();

                        user.dateOfBirth = moment(user.dateOfBirth, 'DD/MM/YYYY')
                          .add(0, 'hours')
                          .add(0, 'minutes')
                          .add(0, 'seconds')
                          .toDate();

                        console.log('user.dateOfBirth: ', user.dateOfBirth);

                        const param = {
                          entity: {
                            name: user.name,
                            mobile: user.phone,
                            usersCreatorId: 1,
                            placesId: currentSession.placesId,
                            birthday: user.dateOfBirth,
                            ordinalNumber: book.ordinalNumber,
                            descriptions: book.descriptions,
                            servicePackagesId: book.servicePackagesId,
                            dateScheduled: dateScheduled,
                            status: true,
                            channelsId: currentSession.channelsId,
                            recipientId: currentSession.userId
                          }
                        };

                        console.log('param queue: ', param);

                        const resultClinicQueues = await clinicQueueService.create(param);

                        console.log('resultClinicQueues: -------------------', resultClinicQueues);

                        console.log('resultClinicQueues find: ', resultClinicQueues.result[0]);
                        console.log('resultClinicQueues create: ', resultClinicQueues.result[1]);
                        if (!resultClinicQueues.result[1]) {
                          const data = resultClinicQueues.result.data;
                          const raw = `Người khám: ${user.name}. Số điện thoại: ${user.phone}. Lý do khám: ${
                            data.descriptions
                          }. Thời gian:  ${moment(data.dateScheduled)
                            .tz(tz)
                            .format('YYYY-MM-DD HH:mm:ss')}`;

                          finnalyResult = {
                            userId: senderId,
                            text:
                              'Khách hàng đã đặt lịch từ trước trong ngày hôm nay tại hệ thống! Lịch của bạn là ' + raw,
                            accessToken: accessToken,
                            quickReplies: questions.quickReplies,
                            success: true,
                            errors: [],
                            messages: 'ok'
                          };
                        } else {
                          const raw = `Người khám: ${user.name}. Số điện thoại: ${user.phone}. Lý do khám: ${book.descriptions}. Thời gian: ${book.time} ${book.date}`;

                          console.log('user', user);
                          console.log('book', book);
                          finnalyResult = {
                            userId: senderId,
                            text: raw,
                            accessToken: accessToken,
                            quickReplies: questions.quickReplies,
                            success: true,
                            errors: [],
                            messages: 'ok'
                          };
                        }
                        setSession(senderId, null);
                        endConversation(senderId);
                      }
                    }
                  }
                  break;
                case 'update':
                  {
                    if (currentQuestion.name === 'getDate') {
                      if (message.text.match(regexPattern.formatdateVie) === null) {
                        finnalyResult = {
                          userId: senderId,
                          text:
                            '(*) Ngày tháng năm bị sai, vui lòng điền theo đúng định dạng ngày/tháng/năm' +
                            '\n' +
                            question.content,
                          accessToken: accessToken,
                          quickReplies: question.quickReplies,
                          success: true,
                          errors: [],
                          messages: 'ok'
                        };
                      } else {
                        const date = text;

                        const datetime = moment(date, 'DD/MM/YYYY').format('YYYY-MM-DD');

                        console.log('datetime', datetime);

                        const param = {
                          filterSocial: {
                            recipientId: senderId,
                            channelsId: currentSession.channelsId
                          }
                        };

                        // xác định xem khách hàng đã có lịch trên hệ thống chưa
                        const resultClinicQueues = await clinicQueueService.check_exists(param);

                        console.log('cancel resultClinicQueues', resultClinicQueues);
                        if (resultClinicQueues) {
                          // lấy list time

                          const param = {
                            filter: {
                              placesId: currentSession.placesId,
                              servicesPackagesId: resultClinicQueues.servicePackagesId,
                              inDay: datetime
                            }
                          };

                          const resultGetClinicQueuesScheduleTime = await clinicQueueService.clinic_queues_schedule_time_get(
                            param
                          );

                          if (resultGetClinicQueuesScheduleTime) {
                            console.log(
                              '---------------------------------------------resultGetClinicQueuesScheduleTime----------------------------------------',
                              resultGetClinicQueuesScheduleTime
                            );
                            console.log(
                              '---------------------------------------------resultGetClinicQueuesScheduleTime----------------------'
                            );

                            const arrayQueuesScheduleTime = resultGetClinicQueuesScheduleTime.rows.reduce((o, e) => {
                              const arrayE = _.pick(e, [
                                'ordinalNumber',
                                'servicePackageId',
                                'servicePackageName',
                                'hourFrame'
                              ]);

                              o.push(arrayE.ordinalNumber + '.' + moment(arrayE.hourFrame, 'HH:mm:ss').format('HH:mm'));

                              return o;
                            }, []);

                            console.log('arrayQueuesScheduleTime', arrayQueuesScheduleTime);
                            const uniqueQueuesScheduleTime = _.uniq(arrayQueuesScheduleTime);

                            books[findOrCreateBook(senderId)].date = date;
                            setSession(senderId, question.id);

                            finnalyResult = {
                              userId: senderId,
                              text: question.content,
                              accessToken: accessToken,
                              quickReplies: uniqueQueuesScheduleTime,
                              success: true,
                              errors: [],
                              messages: 'ok'
                            };
                          } else {
                            finnalyResult = {
                              userId: senderId,
                              text: 'Lỗi ngày hay cái lỗi servicePackagesId ấy',
                              accessToken: accessToken,
                              quickReplies: [],
                              success: true,
                              errors: [],
                              messages: 'ok'
                            };
                          }
                        } else {
                          finnalyResult = {
                            userId: senderId,
                            text: 'Quý khách chưa có lịch khám trên hệ thống! Vui lòng đặt lịch khám.',
                            accessToken: accessToken,
                            quickReplies: currentQuestion.quickReplies,
                            success: true,
                            errors: [],
                            messages: 'ok'
                          };
                        }
                      }
                    } else if (currentQuestion.name === 'getTime') {
                      console.log('arrayTime text', text);
                      const arrayTime = _.split(text, '.', 2);

                      console.log('arrayTime', arrayTime[1]);
                      if (arrayTime[1].match(/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/g) === null) {
                        // await sendText(accessToken, senderId, 'Thời gian bị sai, vui lòng điền theo định dạng Giờ:Phút (01:00)');
                        // await sendText(accessToken, senderId, currentQuestion.content);
                        finnalyResult = {
                          userId: senderId,
                          text:
                            'Thời gian bị sai, vui lòng điền theo định dạng Giờ:Phút (01:00) ' +
                            '\n' +
                            question.content,
                          accessToken: accessToken,
                          quickReplies: question.quickReplies,
                          success: true,
                          errors: [],
                          messages: 'ok'
                        };
                      } else {
                        books[findOrCreateBook(senderId)].ordinalNumber = arrayTime[0];
                        books[findOrCreateBook(senderId)].time = arrayTime[1];
                        setSession(senderId, question.id);
                        // await sendText(accessToken, senderId, question.content);
                        // console.log(' users[findUser(senderId)]', users[findUser(senderId)]);
                        // const user = users[findUser(senderId)];
                        const book = books[findBook(senderId)];

                        console.log('book', book);
                        // console.log('user', user);
                        // const secondsToMinutes = book.time;

                        // console.log('book.time', book.time);
                        // const minutes = secondsToMinutes.split(':')[1];
                        // const hours = secondsToMinutes.split(':')[0];
                        // const dateScheduled = moment(book.date, 'DD/MM/YYYY')
                        //   .add(hours, 'hours')
                        //   .add(minutes, 'minutes')
                        //   .toDate();
                        const raw = book.time + ' ' + book.date;

                        finnalyResult = {
                          userId: senderId,
                          text: 'Bạn có chắc chắn cập nhật lịch khám vào: ' + raw + ' không?',
                          accessToken: accessToken,
                          quickReplies: question.quickReplies,
                          success: true,
                          errors: [],
                          messages: 'ok'
                        };
                      }
                    } else if (currentQuestion.name === 'getConfirm') {
                      if (text.toLowerCase() === 'có') {
                        console.log('cancel getConfirm có', books[findOrCreateBook(senderId)].date);
                        // await sendText(accessToken, senderId, question.content);
                        // console.log(' users[findUser(senderId)]', users[findUser(senderId)]);
                        // const user = users[findUser(senderId)];
                        const book = books[findBook(senderId)];

                        console.log('book', book);
                        const secondsToMinutes = book.time;

                        console.log('book.time', book.time);
                        const minutes = secondsToMinutes.split(':')[1];
                        const hours = secondsToMinutes.split(':')[0];
                        const dateScheduled = moment(book.date, 'DD/MM/YYYY')
                          .add(hours, 'hours')
                          .add(minutes, 'minutes')
                          .toDate();
                        const ordinalNumber = book.ordinalNumber;

                        // define param input for check clinicQueue
                        const param = {
                          filterSocial: {
                            recipientId: senderId,
                            channelsId: currentSession.channelsId
                          }
                        };

                        await clinicQueueService.check_exists(param).then(function(clinicQueuesFound) {
                          // console.log("clinicQueuesFound",clinicQueuesFound)
                          if (clinicQueuesFound) {
                            clinicQueues.update(
                              {
                                dateScheduled,
                                ordinalNumber
                              },
                              { where: { id: clinicQueuesFound.id } }
                            );
                          }
                        });
                        console.log('Cập nhật thành công', question);

                        finnalyResult = {
                          userId: senderId,
                          text: question.content,
                          accessToken: accessToken,
                          quickReplies: question.quickReplies,
                          success: true,
                          errors: [],
                          messages: 'ok'
                        };
                      } else {
                        console.log('Không cập nhật ----------------------');
                        finnalyResult = {
                          userId: senderId,
                          text: 'Đã hủy không cập nhật! Mời bạn chọn dịch vụ!',
                          accessToken: accessToken,
                          quickReplies: question.quickReplies,
                          success: true,
                          errors: [],
                          messages: 'ok'
                        };
                      }
                      setSession(senderId, null);
                      endConversation(senderId);
                    }
                  }
                  break;
                case 'check':
                  {
                    if (currentQuestion.name === 'getPhone') {
                      if (text.match(regexPattern.phoneNumberVie) === null) {
                        finnalyResult = {
                          userId: senderId,
                          text: 'Định dạng dữ liệu cho số điện thoại bị sai, vui lòng nhập lại!!',
                          accessToken: accessToken,
                          quickReplies: question.quickReplies,
                          success: true,
                          errors: [],
                          messages: 'ok'
                        };
                      } else {
                        console.log('check getPhone', question);
                        const phone = text;

                        users[findUser(senderId)].phone = phone;
                        setSession(senderId, question.id);
                        // await sendText(accessToken, senderId, question.content);
                        finnalyResult = {
                          userId: senderId,
                          text: question.content,
                          accessToken: accessToken,
                          quickReplies: question.quickReplies,
                          success: true,
                          errors: [],
                          messages: 'ok'
                        };
                      }
                    } else if (currentQuestion.name === 'getDate') {
                      if (message.text.match(regexPattern.formatdateVie) === null) {
                        finnalyResult = {
                          userId: senderId,
                          text:
                            '(*) Ngày tháng năm bị sai, vui lòng điền theo đúng định dạng ngày/tháng/năm' +
                            '\n' +
                            question.content,
                          accessToken: accessToken,
                          quickReplies: question.quickReplies,
                          success: true,
                          errors: [],
                          messages: 'ok'
                        };
                      } else {
                        const date = text;
                        const datetime = moment(date, 'DD/MM/YYYY').format('YYYY-MM-DD');

                        console.log('datetime', datetime);

                        const customerFound = await medCustomers.findOne({
                          where: {
                            $and: {
                              // name: entity.name,
                              mobile: users[findUser(senderId)].phone,
                              placesId: currentSession.placesId,
                              status: true
                            }
                          }
                        });

                        console.log('check customerFound', customerFound);
                        if (customerFound) {
                          const param = {
                            filter: {
                              $and: {
                                placesId: currentSession.placesId,
                                customersId: customerFound.id,
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
                                status: true
                              }
                            }
                          };
                          const resultClinicQueues = await clinicQueueService.check_exists(param);

                          console.log('resultClinicQueues', resultClinicQueues);
                          if (resultClinicQueues) {
                            const raw = `Người khám: ${customerFound.name}. Số điện thoại: ${
                              users[findUser(senderId)].phone
                            }. Lý do khám: ${resultClinicQueues.descriptions}. Thời gian:  ${moment(
                              resultClinicQueues.dateScheduled
                            )
                              .tz(tz)
                              .format('YYYY-MM-DD HH:mm:ss')}`;

                            finnalyResult = {
                              userId: senderId,
                              text: 'Lịch khám của bạn là ' + raw,
                              accessToken: accessToken,
                              quickReplies: question.quickReplies,
                              success: true,
                              errors: [],
                              messages: 'ok'
                            };
                          } else {
                            finnalyResult = {
                              userId: senderId,
                              text:
                                'Khách hàng chưa có lịch khám ngày ' +
                                datetime +
                                ' trên hệ thống! Vui lòng nhắn tin tiếp để  đặt lịch khám!',
                              accessToken: accessToken,
                              quickReplies: question.quickReplies,
                              success: true,
                              errors: [],
                              messages: 'ok'
                            };
                          }
                        } else {
                          finnalyResult = {
                            userId: senderId,
                            text: 'SDT khách hàng chưa có tên trong hệ thống!',
                            accessToken: accessToken,
                            quickReplies: question.quickReplies,
                            success: true,
                            errors: [],
                            messages: 'ok'
                          };
                        }
                        setSession(senderId, null);
                        endConversation(senderId);
                      }
                    }
                  }
                  break;
                case 'cancel':
                  {
                    if (currentQuestion.name === 'getDate') {
                      console.log('cancel getDate');
                      if (message.text.match(regexPattern.formatdateVie) === null) {
                        finnalyResult = {
                          userId: senderId,
                          text:
                            '(*) Ngày tháng năm bị sai, vui lòng điền theo đúng định dạng ngày/tháng/năm' +
                            '\n' +
                            question.content,
                          accessToken: accessToken,
                          quickReplies: question.quickReplies,
                          success: true,
                          errors: [],
                          messages: 'ok'
                        };
                      } else {
                        const date = text;
                        const datetime = moment(date, 'DD/MM/YYYY').format('YYYY-MM-DD');

                        console.log('datetime', datetime);
                        books[findOrCreateBook(senderId)].date = date;
                        setSession(senderId, question.id);

                        // define param input for check clinicQueue
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
                              placesId: currentSession.placesId,
                              status: true
                            }
                          },
                          filterSocial: {
                            recipientId: senderId,
                            channelsId: currentSession.channelsId
                          }
                        };

                        console.log('param test ', param);
                        const clinicQueuesFound = await clinicQueueService.check_exists(param);

                        console.log('cancel clinicQueuesFound', clinicQueuesFound);
                        if (clinicQueuesFound) {
                          const raw = `  ${moment(clinicQueuesFound.dateScheduled)
                            .tz(tz)
                            .format('YYYY-MM-DD HH:mm:ss')}`;

                          finnalyResult = {
                            userId: senderId,
                            text: 'Bạn có chắc chắn huỷ lịch khám vào: ' + raw + ' không?',
                            accessToken: accessToken,
                            quickReplies: question.quickReplies,
                            success: true,
                            errors: [],
                            messages: 'ok'
                          };
                        } else {
                          finnalyResult = {
                            userId: senderId,
                            text:
                              'Huỷ lịch khám không thành công! Vì bạn chưa đặt lịch khám tại phòng khám! Mời bạn chọn tiếp dịch vụ',
                            accessToken: accessToken,
                            quickReplies: questions[0].quickReplies,
                            success: true,
                            errors: [],
                            messages: 'ok'
                          };
                          setSession(senderId, null);
                          endConversation(senderId);
                        }
                      }
                    } else if (currentQuestion.name === 'getConfirm') {
                      if (text.toLowerCase() === 'có') {
                        console.log('cancel getConfirm có', books[findOrCreateBook(senderId)].date);
                        const datetime = moment(books[findOrCreateBook(senderId)].date, 'DD/MM/YYYY').format(
                          'YYYY-MM-DD'
                        );

                        // define param input for check clinicQueue
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
                              placesId: currentSession.placesId,
                              status: true
                            }
                          },
                          filterSocial: {
                            recipientId: senderId,
                            channelsId: currentSession.channelsId
                          }
                        };

                        await clinicQueueService.check_exists(param).then(function(clinicQueuesFound) {
                          // console.log("clinicQueuesFound",clinicQueuesFound)
                          if (clinicQueuesFound) {
                            clinicQueues.update({ status: -1 }, { where: { id: clinicQueuesFound.id } });
                          }
                        });
                        console.log('cancel thành công', question);
                        finnalyResult = {
                          userId: senderId,
                          text: question.content,
                          accessToken: accessToken,
                          quickReplies: question.quickReplies,
                          success: true,
                          errors: [],
                          messages: 'ok'
                        };
                        setSession(senderId, null);
                        endConversation(senderId);
                      } else {
                        console.log('cancel getConfirm không');
                        finnalyResult = {
                          userId: senderId,
                          text: 'Hủy lịch không thành công! Mời bạn chọn tiếp dịch vụ!',
                          accessToken: accessToken,
                          quickReplies: question.quickReplies,
                          success: true,
                          errors: [],
                          messages: 'ok'
                        };
                      }
                      setSession(senderId, null);
                      endConversation(senderId);
                    }
                  }
                  break;
                default:
                  break;
              }
            } else {
              console.log('bat dau vao chat va dc server response');
              questionsOfTemplate = getQuestionsOfTemplate(0);
              // setSession(senderId, questionsOfTemplate[0].id);
              finnalyResult = {
                userId: senderId,
                text: questionsOfTemplate[0].content,
                accessToken: accessToken,
                quickReplies: questionsOfTemplate[0].quickReplies,
                success: true,
                errors: [],
                messages: 'ok'
              };
            }
          }
        }
      } else {
        finnalyResult = {
          userId: senderId,
          text: '',
          accessToken: accessToken,
          quickReplies: [],
          success: true,
          errors: [],
          messages: 'ok'
        };
      }
      console.log('finnalyResult', finnalyResult);
      if (!finnalyResult) {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudInfo'
        });
      }
    } catch (error) {
      ErrorHelpers.errorThrow(error, 'crudError', 'facebookService');
    }
    questions = [];

    return { result: finnalyResult };
  }
};
