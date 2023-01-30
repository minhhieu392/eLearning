import ValidateJoi, { noArguments } from '../../utils/validateJoi';
import viMessage from '../../locales/vi';
import { sequelize } from '../../db/db';
import { parseSortVer2 } from '../../utils/helper';

const DEFAULT_SCHEMA = {
  name: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.sites.name']
  }),
  url: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.sites.url']
  }),
  seoKeywords: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage.seoKeywords,
    allow: ['', null]
  }),
  seoDescriptions: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage.seoDescriptions,
    allow: ['', null]
  }),
  templatesId: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage.templatesId
  }),
  placesId: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage.placesId
  }),
  groupSitesId: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage.groupSitesId
  }),
  usersCreatorId: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage.usersCreatorId
  }),
  status: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage.status
  })
};

export default {
  authenCreate: (req, res, next) => {
    // console.log("validate authenCreate")
    const usersCreatorId = req.auth.userId;

    const { name, url, seoKeywords, seoDescriptions, templatesId, placesId, groupSitesId, status } = req.body;
    const site = {
      name,
      url,
      seoKeywords,
      seoDescriptions,
      templatesId,
      placesId,
      groupSitesId,
      status,
      usersCreatorId
    };

    const SCHEMA = ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
      name: {
        max: 100,
        required: noArguments
      },
      url: {
        max: 100
      },
      seoKeywords: {
        max: 200
      },
      seoDescriptions: {
        max: 200
      },
      groupSitesId: {
        required: noArguments
      },
      templatesId: {
        required: noArguments
      },
      placesId: {
        required: noArguments
      },
      usersCreatorId: {
        required: noArguments
      },
      status: {
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
    // console.log("validate authenUpdate")

    const { name, url, seoKeywords, seoDescriptions, templatesId, placesId, groupSitesId, status } = req.body;
    const site = { name, url, seoKeywords, seoDescriptions, templatesId, placesId, groupSitesId, status };

    const SCHEMA = ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
      name: {
        max: 100
      },
      url: {
        max: 100
      },
      seoKeywords: {
        max: 200
      },
      seoDescriptions: {
        max: 200
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
    // console.log("validate authenFilter")
    const { filter, sort, range, attributes, notIds } = req.query;

    res.locals.sort = parseSortVer2(sort, 'sites');
    res.locals.range = range ? JSON.parse(range) : [0, 49];
    res.locals.attributes = attributes;
    res.locals.notIds = notIds;
    if (filter) {
      const {
        id,
        name,
        url,
        seoKeywords,
        seoDescriptions,
        templatesId,
        placesId,
        groupSitesId,
        status,
        usersCreatorId,
        FromDate,
        ToDate
      } = JSON.parse(filter);
      const site = {
        id,
        name,
        url,
        seoKeywords,
        seoDescriptions,
        templatesId,
        placesId,
        groupSitesId,
        status,
        usersCreatorId,
        FromDate,
        ToDate
      };

      // console.log(site)
      const SCHEMA = {
        id: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.sites.id'],
          regex: /(^\d+(,\d+)*$)|(^\d*$)/
        }),
        ...DEFAULT_SCHEMA,
        templatesId: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage.templatesId,
          regex: /(^\d+(,\d+)*$)|(^\d*$)/
        }),
        placesId: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage.placesId,
          regex: /(^\d+(,\d+)*$)|(^\d*$)/
        }),
        groupSitesId: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage.groupSitesId,
          regex: /(^\d+(,\d+)*$)|(^\d*$)/
        }),
        usersCreatorId: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage.usersCreatorId,
          regex: /(^\d+(,\d+)*$)|(^\d*$)/
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
          if (templatesId) {
            ValidateJoi.transStringToArray(data, 'templatesId');
          }
          if (placesId) {
            ValidateJoi.transStringToArray(data, 'placesId');
          }
          if (groupSitesId) {
            ValidateJoi.transStringToArray(data, 'groupSitesId');
          }
          if (usersCreatorId) {
            ValidateJoi.transStringToArray(data, 'usersCreatorId');
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
  }
};
