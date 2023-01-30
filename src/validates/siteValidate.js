import ValidateJoi, { noArguments } from '../utils/validateJoi';
import viMessage from '../locales/vi';
import { sequelize } from '../db/db';
import regexPattern from '../utils/regexPattern';
import { parseSortVer2 } from '../utils/helper';
const DEFAULT_SCHEMA = {
  name: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.sites.name'],
  }),
  url: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.sites.url'],
  }),
  seoKeywords: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage.seoKeywords,
    allow: ['', null],
  }),
  seoDescriptions: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage.seoDescriptions,
    allow: ['', null],
  }),
  templatesId: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage.templatesId,
  }),
  groupSitesId: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage.groupSitesId,
  }),
  usersCreatorId: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage.usersCreatorId,
  }),
  status: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage.status,
  }),
  logo: ValidateJoi.createSchemaProp({
    array: noArguments,
    label: viMessage.logo,
    allow: ['', null],
  }),
  icon: ValidateJoi.createSchemaProp({
    object: noArguments,
    label: viMessage.icon,
    allow: ['', null],
  }),
};


const PROFILE_SCHEMA_UPDATE = ValidateJoi.createArraySchema(
  ValidateJoi.createObjectSchema({
    id: ValidateJoi.createSchemaProp({
      number: noArguments,
      label: viMessage.id
    }),
    hotline: ValidateJoi.createSchemaProp({
      string: noArguments,
      label: viMessage['api.siteProfile.hotline'],
      allow: ['', null],
    }),
    socialChannelFacebookId: ValidateJoi.createSchemaProp({
      string: noArguments,
      label: viMessage['api.siteProfile.socialChannelFacebook'],
      allow: ['', null],
    }),
    socialChannelZaloId: ValidateJoi.createSchemaProp({
      string: noArguments,
      label: viMessage['api.siteProfile.socialChannelZalo'],
      allow: ['', null],
    }),
    email: ValidateJoi.createSchemaProp({
      string: noArguments,
      label: viMessage.email,
      allow: ['', null],
    }),
    address: ValidateJoi.createSchemaProp({
      string: noArguments,
      label: viMessage.address,
      allow: ['', null],
    }),
    chatbox: ValidateJoi.createSchemaProp({
      string: noArguments,
      label: viMessage.chatbox,
      allow: ['', null],
    }),
    employee: ValidateJoi.createSchemaProp({
      array: noArguments,
      label: viMessage['api.siteProfile.employee'],
      allow: ['', null],
    }),
    addressHere: ValidateJoi.createSchemaProp({
      array: noArguments,
      label: viMessage.addressHere,
      allow: ['', null],
    }),
    languagesId: ValidateJoi.createSchemaProp({
      number: noArguments,
      label: viMessage['api.languages.id']
    }),
    flag: ValidateJoi.createSchemaProp({
      number: noArguments,
      label: 'Cờ phân biệt sửa/xóa'
    })
  }))
;

const PROFILE_SCHEMA =ValidateJoi.createArraySchema(
  ValidateJoi.createObjectSchema({
    hotline: ValidateJoi.createSchemaProp({
      string: noArguments,
      label: viMessage['api.siteProfile.hotline'],
      allow: ['', null],
    }),
    socialChannelFacebookId: ValidateJoi.createSchemaProp({
      string: noArguments,
      label: viMessage['api.siteProfile.socialChannelFacebook'],
      allow: ['', null],
    }),
    socialChannelZaloId: ValidateJoi.createSchemaProp({
      string: noArguments,
      label: viMessage['api.siteProfile.socialChannelZalo'],
      allow: ['', null],
    }),
    email: ValidateJoi.createSchemaProp({
      string: noArguments,
      label: viMessage.email,
      allow: ['', null],
    }),
    address: ValidateJoi.createSchemaProp({
      string: noArguments,
      label: viMessage.address,
      allow: ['', null],
    }),
    chatbox: ValidateJoi.createSchemaProp({
      string: noArguments,
      label: viMessage.chatbox,
      allow: ['', null],
    }),
    employee: ValidateJoi.createSchemaProp({
      array: noArguments,
      label: viMessage['api.siteProfile.employee'],
      allow: ['', null],
    }),
    addressHere: ValidateJoi.createSchemaProp({
      array: noArguments,
      label: viMessage.addressHere,
      allow: ['', null],
    }),
    languagesId: ValidateJoi.createSchemaProp({
      number: noArguments,
      label: viMessage['api.languages.id']
    })
  }))
;

export default {
  authenCreate: (req, res, next) => {
    console.log("validate authenCreate")
    const usersCreatorId = req.auth.userId;

    const { name, url, seoKeywords, seoDescriptions, templatesId, groupSitesId, status
      , logo, icon, siteProfiles
    } = req.body;
    const site = {
      name, url, seoKeywords, seoDescriptions, templatesId, groupSitesId,
      status, usersCreatorId, logo, icon, siteProfiles
    };

    const SCHEMA = Object.assign(ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
      name: {
        max: 100,
        required: noArguments
      },
      url: {
        max: 100,
      },
      seoKeywords: {
        max: 200,
      },
      seoDescriptions: {
        max: 200,
      },
      groupSitesId: {
        required: noArguments
      },
      templatesId: {
        required: noArguments
      },
      usersCreatorId: {
        required: noArguments
      },
      status: {
        required: noArguments
      },

    }), { siteProfiles: PROFILE_SCHEMA });

    // console.log('input: ', input);
    ValidateJoi.validate(site, SCHEMA)
      .then((data) => {
        res.locals.body = data;
        next()
      })
      .catch(error => next({ ...error, message: "Định dạng gửi đi không đúng" }
      ));
  },
  authenUpdate: (req, res, next) => {
    console.log("validate authenUpdate")

    const { name, url, seoKeywords, seoDescriptions, templatesId, groupSitesId, status, logo, icon, siteProfiles } = req.body;
    const site = { name, url, seoKeywords, seoDescriptions, templatesId, groupSitesId, status, logo, icon, siteProfiles };

    const SCHEMA = Object.assign(ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
      name: {
        max: 100,
      },
      url: {
        max: 100,
      },
      seoKeywords: {
        max: 200,
      },
      seoDescriptions: {
        max: 200,
      },


    }), { siteProfiles: PROFILE_SCHEMA_UPDATE });

    ValidateJoi.validate(site, SCHEMA)
      .then((data) => {
        res.locals.body = data;
        next()
      })
      .catch(error => next({ ...error, message: "Định dạng gửi đi không đúng" }
      ));
  },
  authenFilter: (req, res, next) => {
    console.log("validate authenFilter")
    const { filter, sort, range, attributes,notIds } = req.query;

    res.locals.sort = parseSortVer2(sort,'sites');
    res.locals.range = range ? JSON.parse(range) : [0, 49];
    res.locals.attributes = attributes;
    res.locals.notIds = notIds;
    if (filter) {
      const { id, name, url, seoKeywords, seoDescriptions, templatesId, groupSitesId, status, usersCreatorId, FromDate, ToDate } = JSON.parse(filter);
      const site = { id, name, url, seoKeywords, seoDescriptions, templatesId, groupSitesId, status, usersCreatorId, FromDate, ToDate };

      console.log(site)
      const SCHEMA = {
        id: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.sites.id'],
          regex: regexPattern.listIds
        }),
        ...DEFAULT_SCHEMA,
        templatesId: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage.templatesId,
          regex: regexPattern.listIds
        }),
        groupSitesId: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage.groupSitesId,
          regex: regexPattern.listIds
        }),
        usersCreatorId: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage.usersCreatorId,
          regex: regexPattern.listIds
        }),
        FromDate: ValidateJoi.createSchemaProp({
          date: noArguments,
          label: viMessage.FromDate,
        }),
        ToDate: ValidateJoi.createSchemaProp({
          date: noArguments,
          label: viMessage.ToDate,
        }),
      };

      // console.log('input: ', input);
      ValidateJoi.validate(site, SCHEMA)
        .then((data) => {
          if (id) {
            ValidateJoi.transStringToArray(data, 'id');
          }
          if (templatesId) {
            ValidateJoi.transStringToArray(data, 'templatesId');
          }
          if (groupSitesId) {
            ValidateJoi.transStringToArray(data, 'groupSitesId');
          }
          if (usersCreatorId) {
            ValidateJoi.transStringToArray(data, 'usersCreatorId');
          }

          res.locals.filter = data;
          console.log('locals.filter', res.locals.filter);
          next();
        })
        .catch(error => {
          next({ ...error, message: "Định dạng gửi đi không đúng" })
        });
    } else {
      res.locals.filter = {};
      next()
    }
  },
  authenUpdate_status: (req, res, next) => {
    // console.log("validate authenCreate")
    const usersCreatorsId = req.auth.userId;
    console.log("validate authenCreate",usersCreatorsId)
    const { status, dateUpdated } = req.body;
    const userGroup = { status, dateUpdated, usersCreatorsId };

    const SCHEMA = {
      status: ValidateJoi.createSchemaProp({
        number: noArguments,
        required: noArguments,
        label: viMessage.status,
      }),
      dateUpdated: ValidateJoi.createSchemaProp({
        date: noArguments,
        required: noArguments,
        label: viMessage.dateUpdated,
      }),
      usersCreatorsId:ValidateJoi.createSchemaProp({
        number: noArguments,
        required: noArguments,
        label: viMessage.usersCreatorId,
      }),
    };

    ValidateJoi.validate(userGroup, SCHEMA)
      .then(data => {
        res.locals.body = data;
        next();
      })
      .catch(error => next({ ...error, message: 'Định dạng gửi đi không đúng' }));
  },
}
