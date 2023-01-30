import ValidateJoi, { noArguments } from '../utils/validateJoi';
import viMessage from '../locales/vi';

import regexPattern from '../utils/regexPattern';
import { parseSort } from '../utils/helper';

const DEFAULT_SCHEMA = {
  title: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.notifications.title']
  }),
  message: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.notifications.message']
  }),
  sendAll: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage['api.notifications.sendAll']
  }),
  notificationTime: ValidateJoi.createSchemaProp({
    date: noArguments,
    label: viMessage['api.notifications.notificationTime']
  }),
  notInUsersId: ValidateJoi.createSchemaProp({
    array: noArguments,
    label: 'notInUsersId',
    allow: [null]
  }),
  courseGroupsId: ValidateJoi.createSchemaProp({
    array: noArguments,
    label: 'courseGroupsId',
    allow: [null]
  }),

  userCreatorsId: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage.userCreatorsId
  }),
  dateCreated: ValidateJoi.createSchemaProp({
    date: noArguments,
    label: viMessage.createDate
  }),
  dateUpdated: ValidateJoi.createSchemaProp({
    date: noArguments,
    label: viMessage.dateUpdated
  }),
  status: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage.status
  }),

  usersNotifications: ValidateJoi.createSchemaProp({
    array: noArguments,
    label: ' list usersId'
  })
};

export default {
  authenCreate: (req, res, next) => {
    // console.log("validate authenCreate")
    const userCreatorsId = req.auth.userId;

    const {
      title,
      notificationTime,
      message,
      sendAll,
      // userCreatorsId,
      status,
      usersNotifications,
      notInUsersId,
      courseGroupsId
    } = req.body;
    const district = {
      title,
      notificationTime,
      message,
      sendAll,
      userCreatorsId,
      status,

      notInUsersId,
      courseGroupsId,
      usersNotifications
    };

    const SCHEMA = Object.assign(
      ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
        title: {
          min: 1,
          max: 200,
          required: noArguments
        },

        status: {
          required: noArguments
        }
      })
    );

    // console.log('input: ', input);
    ValidateJoi.validate(district, SCHEMA)
      .then(data => {
        res.locals.body = data;
        next();
      })
      .catch(error => next({ ...error, message: 'Định dạng gửi đi không đúng' }));
  },
  authenUpdate: (req, res, next) => {
    // console.log("validate authenUpdate")

    const {
      title,
      notificationTime,
      message,
      sendAll,
      // userCreatorsId,
      status,
      usersNotifications,
      notInUsersId,
      courseGroupsId
    } = req.body;
    const district = {
      title,
      notificationTime,
      message,
      sendAll,

      // userCreatorsId,
      status,
      usersNotifications,
      notInUsersId,
      courseGroupsId
    };

    const SCHEMA = Object.assign(
      ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
        title: {
          max: 200
        }
      })
    );

    ValidateJoi.validate(district, SCHEMA)
      .then(data => {
        console.log('data  ', data);
        res.locals.body = data;
        next();
      })
      .catch(error => next({ ...error, message: 'Định dạng gửi đi không đúng' }));
  },
  authenFilter: (req, res, next) => {
    // console.log("validate authenFilter")
    const { filter, sort, range, attributes } = req.query;

    res.locals.sort = parseSort(sort);
    res.locals.sortBy = sort ? JSON.parse(sort) : ['id', 'desc'];
    res.locals.range = range ? JSON.parse(range) : [0, 49];
    res.locals.attributes = attributes;

    if (filter) {
      const { id, title, notificationTime, sendStatus, usersId, status, FromDate, ToDate, sendAll } = JSON.parse(
        filter
      );
      const district = {
        id,
        title,
        sendStatus,
        notificationTime,
        usersId,
        status,
        FromDate,
        ToDate,
        sendAll
      };

      // console.log(district)
      const SCHEMA = {
        id: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.notifications.id'],
          regex: regexPattern.listIds
        }),
        ...DEFAULT_SCHEMA,
        sendStatus: ValidateJoi.createSchemaProp({
          number: noArguments,
          label: '1: đã gửi, 0 chưa gửi'
        }),
        usersId: ValidateJoi.createSchemaProp({
          number: noArguments,
          label: viMessage.usersId
        }),
        userCreatorsId: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage.userCreatorsId,
          regex: regexPattern.listIds
        }),
        FromDate: ValidateJoi.createSchemaProp({
          date: noArguments,
          label: viMessage.FromDate
        }),
        ToDate: ValidateJoi.createSchemaProp({
          date: noArguments,
          label: viMessage.ToDate
        })
      };

      // console.log('input: ', input);
      ValidateJoi.validate(district, SCHEMA)
        .then(data => {
          if (id) {
            ValidateJoi.transStringToArray(data, 'id');
          }

          res.locals.filter = data;
          // console.log('locals.filter', res.locals.filter);
          next();
        })
        .catch(error => {
          next({ ...error, message: 'Định dạng gửi đi không đúng' });
        });
    } else {
      res.locals.filter = {};
      next();
    }
  },
  authenFilterUsers: (req, res, next) => {
    // console.log("validate authenFilter")
    const { filter, sort, range, attributes } = req.query;

    res.locals.sort = parseSort(sort);
    res.locals.sortBy = sort ? JSON.parse(sort) : ['id', 'desc'];
    res.locals.range = range ? JSON.parse(range) : [0, 49];
    res.locals.attributes = attributes;

    if (filter) {
      const { notificationsId, fullname } = JSON.parse(filter);
      const district = {
        notificationsId,
        fullname
      };

      // console.log(district)
      const SCHEMA = {
        notificationsId: ValidateJoi.createSchemaProp({
          number: noArguments,
          label: viMessage['api.notifications.id'],
          required: noArguments
        }),
        fullname: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.users.fullname']
        })
      };

      // console.log('input: ', input);
      ValidateJoi.validate(district, SCHEMA)
        .then(data => {
          res.locals.filter = data;
          // console.log('locals.filter', res.locals.filter);
          next();
        })
        .catch(error => {
          next({ ...error, message: 'Định dạng gửi đi không đúng' });
        });
    } else {
      res.locals.filter = {};
      next();
    }
  },
  authenUpdate_status: (req, res, next) => {
    // console.log("validate authenCreate")

    const { status } = req.body;
    const userGroup = { status };

    const SCHEMA = {
      status: ValidateJoi.createSchemaProp({
        number: noArguments,
        required: noArguments,
        label: viMessage.status
      })
    };

    ValidateJoi.validate(userGroup, SCHEMA)
      .then(data => {
        res.locals.body = data;
        next();
      })
      .catch(error => next({ ...error, message: 'Định dạng gửi đi không đúng' }));
  }
};
