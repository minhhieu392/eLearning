import ValidateJoi, { noArguments } from '../utils/validateJoi';
import viMessage from '../locales/vi';
import { sequelize } from '../db/db';
import regexPattern from '../utils/regexPattern';
import { parseSortVer2 } from '../utils/helper';
const DEFAULT_SCHEMA = {
  employee: ValidateJoi.createSchemaProp({
    array: noArguments,
    label: viMessage['api.siteProfile.employee'],
    allow: ['', null]
  }),
  hotline: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.siteProfile.hotline'],
    allow: ['', null]
  }),
  socialChannelFacebookId: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.siteProfile.socialChannelFacebook'],
    allow: ['', null]
  }),
  socialChannelZaloId: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.siteProfile.socialChannelZalo'],
    allow: ['', null]
  }),
  email: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage.email,
    allow: ['', null]
  }),
  address: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage.address,
    allow: ['', null]
  }),
  chatbox: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage.chatbox,
    allow: ['', null]
  }),
  siteId: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage.sitesId
  }),
  addressHere: ValidateJoi.createSchemaProp({
    array: noArguments,
    label: viMessage.addressHere,
    allow: ['', null]
  }),
  languagesId: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage['api.languages.id']
  })
};

export default {
  authenCreate: (req, res, next) => {
    console.log('validate authenCreate');
    const usersCreatorId = req.auth.userId;

    const { hotline, email, chatbox, languagesId, siteId, address, socialChannelFacebookId, socialChannelZaloId, employee, addressHere, longitude, latitude } = req.body;
    const site = {
      hotline,
      email,
      chatbox,
      siteId,
      address,
      socialChannelFacebookId,
      socialChannelZaloId,
      employee,
      addressHere,
      longitude,
      latitude,
      languagesId
    };

    const SCHEMA = ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
      hotline: {
        max: 20
      },
      email: {
        max: 100
      },
      siteId: {
        required: noArguments
      },
      languagesId: {
        required: noArguments
      }
    });

    // console.log('input: ', input);
    ValidateJoi.validate(site, SCHEMA)
      .then(data => {
        res.locals.body = data;
        next();
      })
      .catch(error => next({ ...error, message: 'Định dạng gửi đi không đúng' }));
  },
  authenUpdate: (req, res, next) => {
    console.log('validate authenUpdate');

    const { hotline, email, chatbox, languagesId, siteId, address, socialChannelFacebookId, socialChannelZaloId, zalo, employee, addressHere, longitude, latitude } = req.body;
    const site = {
      hotline,
      email,
      chatbox,
      siteId,
      address,
      socialChannelFacebookId,
      socialChannelZaloId,
      employee,
      addressHere,
      languagesId,
      longitude, latitude
    };

    const SCHEMA = ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
      hotline: {
        max: 20
      },
      email: {
        max: 100
      }
    });

    ValidateJoi.validate(site, SCHEMA)
      .then(data => {
        res.locals.body = data;
        next();
      })
      .catch(error => next({ ...error, message: 'Định dạng gửi đi không đúng' }));
  },
  authenFilter: (req, res, next) => {
    console.log('validate authenFilter');
    const { filter, sort, range, attributes } = req.query;

    res.locals.sort = parseSortVer2(sort,'siteProfiles');
    res.locals.range = range ? JSON.parse(range) : [0, 49];
    res.locals.attributes = attributes;
    if (filter) {
      const { id, hotline, email, languagesId, chatbox, siteId, address, socialChannelFacebookId, socialChannelZaloId, FromDate, ToDate } = JSON.parse(filter);
      const site = { id, hotline, email, languagesId, chatbox, siteId, address, socialChannelFacebookId, socialChannelZaloId, FromDate, ToDate };

      console.log(site);
      const SCHEMA = {
        id: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.sites.id'],
          regex: regexPattern.listIds
        }),
        ...DEFAULT_SCHEMA,
        siteId: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage.sitesId,
          regex: regexPattern.listIds
        }),
        languagesId: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.languages.id'],
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
      ValidateJoi.validate(site, SCHEMA)
        .then(data => {
          if (id) {
            ValidateJoi.transStringToArray(data, 'id');
          }
          if (siteId) {
            ValidateJoi.transStringToArray(data, 'siteId');
          }
          if (languagesId) {
            ValidateJoi.transStringToArray(data, 'languagesId');
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
  }
};
