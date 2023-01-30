import ValidateJoi, { noArguments } from '../utils/validateJoi';
import viMessage from '../locales/vi';
import regexPattern from '../utils/regexPattern';
import { parseSortVer2 } from '../utils/helper';
const DEFAULT_SCHEMA = {
  contentsName: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.contents.contentsName']
  }),
  contentGroupsId: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.contentGroups.id']
  }),
  url: ValidateJoi.createSchemaProp({
    string: noArguments,
    // label: viMessage['api.documents.url'],
    allow: ['', null]
  }),
  descriptions: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.contents.descriptions'],
    allow: ['', null]
  }),
  shortDescriptions: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.contents.shortDescriptions'],
    allow: ['', null]
  }),
  images: ValidateJoi.createSchemaProp({
    array: noArguments,
    label: viMessage['api.contents.images']
  }),

  userCreatorsId: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage.usersCreatorId
  }),
  dateCreated: ValidateJoi.createSchemaProp({
    date: noArguments,
    label: viMessage.createDate
  }),
  dateUpdated: ValidateJoi.createSchemaProp({
    date: noArguments,
    label: viMessage.dateUpdated,
    allow: ['', null]
  }),
  status: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage.status
  })
};

export default {
  authenCreate: (req, res, next) => {
    // console.log("validate authenCreate")
    const userCreatorsId = req.auth.userId;

    const {
      contentsName,
      author,
      source,
      url,
      descriptions,
      shortDescriptions,
      images,
      contentGroupsId,
      status,
      dateCreated,
      dateUpdated
    } = req.body;
    const content = {
      contentsName,
      author,
      source,
      url,
      contentGroupsId,
      descriptions,
      shortDescriptions,
      images,

      status,
      dateCreated,
      dateUpdated,
      userCreatorsId
    };

    const SCHEMA = Object.assign(
      ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
        contentsName: {
          max: 500,
          required: noArguments
        },

        status: {
          required: noArguments
        }
      }),
      {}
    );

    // console.log('input: ', input);
    ValidateJoi.validate(content, SCHEMA)
      .then(data => {
        res.locals.body = data;
        next();
      })
      .catch(error => next({ ...error, message: 'Định dạng gửi đi không đúng' }));
  },
  authenUpdate: (req, res, next) => {
    // console.log("validate authenUpdate")

    const {
      contentsName,
      //   author,
      //   source,
      url,
      contentGroupsId,
      descriptions,
      shortDescriptions,
      images,
      status,
      dateCreated,
      dateUpdated
    } = req.body;

    const content = {
      contentsName,
      //   author,
      //   source,
      url,
      contentGroupsId,
      descriptions,
      shortDescriptions,
      images,

      status,
      dateCreated,
      dateUpdated
    };

    const SCHEMA = ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
      contentsName: {
        max: 500
        // required: noArguments
      }
    });

    ValidateJoi.validate(content, SCHEMA)
      .then(data => {
        res.locals.body = data;
        next();
      })
      .catch(error => next({ ...error, message: 'Định dạng gửi đi không đúng' }));
  },
  authenUpdate_status: (req, res, next) => {
    // console.log("validate authenCreate")
    const userCreatorsId = req.auth.userId;

    const { status, dateUpdated } = req.body;
    const userGroup = { status, dateUpdated, userCreatorsId };

    const SCHEMA = ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
      status: {
        required: noArguments
      },
      dateUpdated: {
        required: noArguments
      }
    });

    ValidateJoi.validate(userGroup, SCHEMA)
      .then(data => {
        res.locals.body = data;
        next();
      })
      .catch(error => next({ ...error, message: 'Định dạng gửi đi không đúng' }));
  },
  authenFilter: (req, res, next) => {
    // console.log("validate authenFilter")
    const { filter, sort, range, attributes } = req.query;

    res.locals.sort = parseSortVer2(sort, 'contents');
    res.locals.range = range ? JSON.parse(range) : [0, 49];
    res.locals.attributes = attributes;
    if (filter) {
      const {
        id,
        contentsName,
        // author,
        // source,
        url,
        notInContentGroupsId,
        contentGroupsId,
        status,
        FromDate,
        ToDate,
        notInId
      } = JSON.parse(filter);
      const content = {
        id,
        contentGroupsId,
        notInContentGroupsId,
        contentsName,
        // author,
        // source,
        url,
        status,
        FromDate,
        ToDate,
        notInId
      };

      // console.log(district)
      const SCHEMA = {
        id: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.contents.id'],
          regex: regexPattern.listIds
        }),
        notInId: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.contents.id'],
          regex: regexPattern.listIds
        }),
        ...DEFAULT_SCHEMA,
        contentsName: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.contents.contentsName'],
          regex: regexPattern.name
        }),
        contentGroupsId: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.contentGroups.id'],
          regex: regexPattern.listIds
        }),
        notInContentGroupsId: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.contentGroups.id'],
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
      ValidateJoi.validate(content, SCHEMA)
        .then(data => {
          if (id) {
            ValidateJoi.transStringToArray(data, 'id');
          }
          if (contentGroupsId) {
            ValidateJoi.transStringToArray(data, 'contentGroupsId');
          }
          // if (notInContentGroupsId) {
          //   ValidateJoi.transStringToArray(data, 'notInContentGroupsId');
          // }
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
