import models from '../../../entity/index';

const { chatbotQuestions, chatbotIntents, chatbotScenarioStep, chatbotScenarios } = models;

export default {
  getArrayQuestion: async () => {
    let output = [];

    try {
      await chatbotQuestions
        .findAll()
        .then(data => {
          // console.log("data: ", data);
          const question = data.map(e => {
            // console.log("e: ", e);

            return {
              id: parseInt(e['dataValues'].id),
              content: e['dataValues'].name,
              status: e['dataValues'].status
            };
          });

          output.push(question);
        })
        .catch(err => {
          output = [
            {
              id: null,
              content: null,
              status: false
            }
          ];
        });
    } catch (error) {
      output = [
        {
          id: null,
          content: null,
          status: false
        }
      ];
    }

    console.log('output: ', output);

    return output;
  },

  getArrayTemplates: async () => {
    let output;

    try {
      await chatbotIntents
        .findAll()
        .then(data => {
          // console.log("data: ", data);
          const question = data.map(e => {
            // console.log("e: ", e);

            return {
              id: parseInt(e['dataValues'].id),
              category: e['dataValues'].name
            };
          });

          output = question;
        })
        .catch(err => {
          output = [
            {
              id: null,
              category: null
            }
          ];
        });
    } catch (error) {
      output = [
        {
          id: null,
          category: null
        }
      ];
    }

    return output;
  },

  getQuestionByItents: async id => {
    let output = [];

    try {
      await chatbotScenarioStep
        .findAll({
          include: [
            {
              model: chatbotQuestions,
              required: true,
              as: 'questions'
            },
            {
              model: chatbotScenarios,
              required: true,
              as: 'scenarios',
              include: [
                {
                  model: chatbotIntents,
                  required: true,
                  as: 'intents',
                  where: {
                    id: id
                  }
                }
              ]
            }
          ],
        })
        .then(data => {

          output =  data.map((e , index) => {
            const temp = e['dataValues'].questions['dataValues'];
            let quickReplies = [];

            if (e.name === 'getGender') {
                quickReplies = ['1.Nam', '2.Nữ'];
            } else if (e.name === 'getConfirm') {
                quickReplies = ['có', 'không'];
            } else if (e.name === 'getCancelResult') {
                quickReplies = ['1.Đặt lịch', '2.Xem lịch', '3.Cập nhật lịch', '4.Huỷ lịch'];
            } else {
                quickReplies = []
            }

            return {
              id: parseInt(temp.id),
              content: temp.name,
              index: index,
              quickReplies: quickReplies,
              templateId: id,
              name: e.name
            };
          });
        })
        .catch(err => {
          // console.log("error: ", err);
          output = [
            {
              id: null,
              content: null,
              index: null,
              quickReplies: [],
              templateId: null,
              name: null
            }
          ];
        });
    } catch (error) {
      output = [
        {
          id: null,
          content: null,
          index: null,
          quickReplies: [],
          templateId: null,
          name: null
        }
      ];
    }

    return output;
  }
};
