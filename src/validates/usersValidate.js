import ValidateJoi, { noArguments } from '../utils/validateJoi';
import viMessage from '../locales/vi';

import regexPattern from '../utils/regexPattern';
import { parseSort, parseSortVer3 } from '../utils/helper';
const DEFAULT_SCHEMA = {
  username: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.users.username']
  }),
  password: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.users.password']
  }),
  fullname: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.users.fullname']
  }),
  usersCode: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.users.usersCode'],
    allow: [null, '']
  }),
  image: ValidateJoi.createSchemaProp({
    object: noArguments,
    label: viMessage['api.users.image'],
    allow: ['', null]
  }),
  email: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.users.email'],
    allow: ['', null]
  }),
  mobile: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.users.mobile'],
    allow: ['', null]
  }),
  referralSocial: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage.referralSocial,
    allow: ['', null]
  }),
  userGroupsId: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage.groupUserId
  }),
  userCreatorsId: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage['api.users.parentId']
  }),
  status: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage.status
  }),
  dateUpdated: ValidateJoi.createSchemaProp({
    date: noArguments,
    label: viMessage['api.users.dateUpdated']
  }),
  dateCreated: ValidateJoi.createSchemaProp({
    date: noArguments,
    label: viMessage['api.users.dateCreated']
  }),
  idSocial: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.users.idSocial']
  })
};

export default {
  authenCreate: (req, res, next) => {
    console.log('validate authenCreate');
    const userCreatorsId = 1;

    const {
      username,
      fullname,
      usersCode,
      email,
      image,
      mobile,
      userGroupsId,
      status,
      dateUpdated,
      dateCreated,
      password,
      referralSocial,
      userAddress,
      idSocial
    } = req.body;

    const user = {
      username,
      fullname,
      usersCode,
      email,
      image,
      mobile,
      userGroupsId,
      status,
      dateUpdated,
      dateCreated,
      userCreatorsId,
      password,
      referralSocial,
      userAddress,
      idSocial
    };

    const SCHEMA = Object.assign(
      ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
        username: {
          regex: /\w/i,
          max: 100,
          required: true
        },
        password: {
          min: 6,
          max: 200
        },
        fullname: {
          max: 200
        },
        email: {
          regex: /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/i,
          max: 200
        },
        mobile: {
          regex: /^[0-9]+$/i,
          max: 15
        },
        userGroupsId: {
          required: noArguments
        },
        status: {
          required: noArguments
        }
      }),
      {}
    );

    // console.log('input: ', input);
    ValidateJoi.validate(user, SCHEMA)
      .then(data => {
        res.locals.body = data;
        next();
      })
      .catch(error => next({ ...error, message: 'Định dạng gửi đi không đúng' }));
  },
  authenUpdate: (req, res, next) => {
    console.log('validate authenUpdate');

    const {
      username,
      fullname,
      usersCode,
      email,
      image,
      mobile,
      userGroupsId,
      status,
      dateUpdated,
      dateCreated,
      referralSocial,
      userAddress,
      idSocial
    } = req.body;

    const user = {
      username,
      fullname,
      usersCode,
      email,
      image,
      mobile,
      userGroupsId,
      status,
      dateUpdated,
      dateCreated,
      referralSocial,
      userAddress,
      idSocial
    };

    const SCHEMA = Object.assign(
      ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
        username: {
          regex: /\w/i,
          max: 100,
          required: true
        },
        fullname: {
          max: 200
        },
        email: {
          regex: /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/i,
          max: 200
        },
        mobile: {
          regex: /^[0-9]+$/i,
          max: 15
        }
      }),
      {}
    );

    ValidateJoi.validate(user, SCHEMA)
      .then(data => {
        res.locals.body = data;
        next();
      })
      .catch(error => next({ ...error, message: 'Định dạng gửi đi không đúng' }));
  },
  authenUpdate_status: (req, res, next) => {
    // console.log("validate authenCreate")
    const userCreatorsId = req.auth.userId || 0;

    const { status, dateUpdated } = req.body;
    const userGroup = { status, dateUpdated, userCreatorsId };

    const SCHEMA = ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
      status: {
        required: noArguments
      }
      // dateUpdated: {
      //   required: noArguments
      // }
    });

    ValidateJoi.validate(userGroup, SCHEMA)
      .then(data => {
        res.locals.body = data;
        next();
      })
      .catch(error => next({ ...error, message: 'Định dạng gửi đi không đúng' }));
  },
  authenFilter: (req, res, next) => {
    console.log('validate authenFilter');
    const { filter, sort, range, attributes } = req.query;

    res.locals.sort = parseSort(sort);
    res.locals.range = range ? JSON.parse(range) : [0, 49];
    res.locals.attributes = attributes;
    if (filter) {
      const {
        id,
        username,
        fullname,
        usersCode,
        email,
        mobile,
        userGroupsId,
        status,
        FromDate,
        ToDate,
        referralSocial,
        courseGroupsId
      } = JSON.parse(filter);
      const user = {
        id,
        username,
        fullname,
        usersCode,
        email,
        mobile,
        userGroupsId,
        status,
        FromDate,
        ToDate,
        referralSocial,
        courseGroupsId
      };

      console.log(user);
      const SCHEMA = {
        ...DEFAULT_SCHEMA,
        id: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.users.id'],
          regex: regexPattern.listIds
        }),
        courseGroupsId: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.courseGroups.id'],
          regex: regexPattern.listIds
        }),
        provincesId: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage.provincesId,
          regex: regexPattern.listIds
        }),
        userGroupsId: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage.groupUserId,
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
      ValidateJoi.validate(user, SCHEMA)
        .then(data => {
          if (id) {
            ValidateJoi.transStringToArray(data, 'id');
          }
          if (userGroupsId) {
            ValidateJoi.transStringToArray(data, 'userGroupsId');
          }
          if (courseGroupsId) {
            ValidateJoi.transStringToArray(data, 'courseGroupsId');
          }
          res.locals.filter = data;
          console.log('locals.filter', res.locals.filter);
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
  authenRequestForgetPass: (req, res, next) => {
    console.log('validate authenUpdate');

    const { email } = req.body;
    const user = { email };

    const SCHEMA = ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
      email: {
        regex: /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/i,
        max: 200
      }
    });

    ValidateJoi.validate(user, SCHEMA)
      .then(data => {
        res.locals.body = data;
        next();
      })
      .catch(error => next({ ...error, message: 'Định dạng gửi đi không đúng' }));
  },
  authenLoginEmail: (req, res, next) => {
    console.log('validate authenLoginEmail', req.body);
    let token;

    if (req.headers['x-token']) {
      token = req.headers['x-token'];
    }
    console.log('token', token);
    const { email } = req.body;

    const user = {
      email,
      token
    };

    const SCHEMA = {
      email: ValidateJoi.createSchemaProp({
        string: noArguments,
        label: viMessage['api.users.email'],
        required: true
      }),
      token: ValidateJoi.createSchemaProp({
        string: noArguments,
        label: viMessage.token,
        required: true
      })
    };

    // console.log('input: ', input);
    ValidateJoi.validate(user, SCHEMA)
      .then(data => {
        res.locals.body = data;
        console.log('locals.filter', res.locals.filter);
        next();
      })
      .catch(error => {
        next({ ...error, message: 'Định dạng gửi đi không đúng' });
      });
  },
  authenLoginSocical: (req, res, next) => {
    console.log('validate authenLoginSocical', req.body);
    let token;

    if (req.headers['x-token']) {
      token = req.headers['x-token'];
    }
    console.log('token', token);
    const { email, idSocial, referralSocial, mobile, clientId } = req.body;

    const user = {
      mobile,
      email,
      token,
      idSocial,
      referralSocial,
      clientId
    };

    const SCHEMA = {
      email: ValidateJoi.createSchemaProp({
        string: noArguments,
        label: viMessage['api.users.email'],
        allow: [null, '']
      }),
      mobile: ValidateJoi.createSchemaProp({
        string: noArguments,
        label: viMessage['api.users.mobile'],
        allow: [null, '']
      }),
      idSocial: ValidateJoi.createSchemaProp({
        string: noArguments,
        label: viMessage['api.users.idSocial'],
        required: true
      }),
      referralSocial: ValidateJoi.createSchemaProp({
        string: noArguments,
        label: viMessage['api.users.referralSocial'],
        required: true
      }),
      clientId: ValidateJoi.createSchemaProp({
        string: noArguments,
        label: 'clientId'
      }),
      token: ValidateJoi.createSchemaProp({
        string: noArguments,
        label: viMessage.token,
        required: true
      })
    };

    // console.log('input: ', input);
    ValidateJoi.validate(user, SCHEMA)
      .then(data => {
        res.locals.body = data;
        console.log('locals.filter', res.locals.filter);
        next();
      })
      .catch(error => {
        next({ ...error, message: 'Định dạng gửi đi không đúng' });
      });
  },
  authenFilterbyUserGroups: (req, res, next) => {
    console.log('validate authenLoginSocical', req.body);
    const { filter, sort, range } = req.query;

    res.locals.sort = parseSortVer3(sort, 'ecommerceProducts');
    res.locals.range = range ? JSON.parse(range) : [0, 49];

    if (filter) {
      const { fullname, usersCode, userGroupsId, locations } = JSON.parse(filter);

      const user = {
        fullname,
        usersCode,
        userGroupsId,
        locations
      };

      const SCHEMA = {
        fullname: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.users.fullname']
        }),
        userGroupsId: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.groupUser.id'],
          required: true
        }),
        locations: ValidateJoi.createSchemaProp({
          array: noArguments,
          label: viMessage.address
        })
      };

      // console.log('input: ', input);
      ValidateJoi.validate(user, SCHEMA)
        .then(data => {
          res.locals.filter = data;
          console.log('locals.filter', res.locals.filter);
          next();
        })
        .catch(error => {
          next({ ...error, message: 'Định dạng gửi đi không đúng' });
        });
    } else {
      res.locals.filter = {};
      next();
    }
  }
};
