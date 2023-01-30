import ValidateJoi, { noArguments } from '../utils/validateJoi';
import viMessage from '../locales/vi';

import regexPattern from '../utils/regexPattern';
import { parseSort } from '../utils/helper';

const DEFAULT_SCHEMA = {
  servicesName: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.services.servicesName']
  }),
  servicesCode: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.services.servicesCode']
  }),
  money: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage['api.services.money']
  }),
  promotionalMoney: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage['api.services.promotionalMoney'],
    allow: [null]
  }),
  descriptions: ValidateJoi.createSchemaProp({
    string: noArguments,
    allow: ['', null]
  }),
  userCreatorsId: ValidateJoi.createSchemaProp({
    number: noArguments
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
  })
};

export default {
  authenCreate: (req, res, next) => {
    const userCreatorsId = req.auth.userId;

    const { servicesName, money, promotionalMoney, descriptions, status } = req.body;
    const services = {
      servicesName,
      money,
      promotionalMoney,
      descriptions,
      status,
      userCreatorsId
    };

    const SCHEMA = Object.assign(
      ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
        servicesName: {
          max: 200,
          required: noArguments
        },
        descriptions: {
          max: 1000
        },
        status: {
          required: noArguments
        }
      }),
      {}
    );

    ValidateJoi.validate(services, SCHEMA)
      .then(data => {
        res.locals.body = data;
        next();
      })
      .catch(error => next({ ...error, message: 'Định dạng gửi đi không đúng' }));
  },
  authenUpdate: (req, res, next) => {
    const { servicesName, money, promotionalMoney, descriptions, status } = req.body;
    const services = {
      servicesName,
      money,
      promotionalMoney,
      descriptions,
      status
    };

    const SCHEMA = Object.assign(
      ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
        servicesName: {
          max: 200
        },
        descriptions: {
          max: 1000
        }
      }),
      {}
    );

    ValidateJoi.validate(services, SCHEMA)
      .then(data => {
        res.locals.body = data;
        next();
      })
      .catch(error => next({ ...error, message: 'Định dạng gửi đi không đúng' }));
  },
  authenFilter: (req, res, next) => {
    const { filter, sort, range, attributes } = req.query;

    res.locals.sort = parseSort(sort);
    res.locals.range = range ? JSON.parse(range) : [0, 49];
    res.locals.attributes = attributes;

    if (filter) {
      const {
        id,
        servicesName,
        money,
        promotionalMoney,
        servicesCode,
        descriptions,
        status,
        FromDate,
        ToDate
      } = JSON.parse(filter);
      const services = {
        id,
        servicesName,
        servicesCode,
        money,
        promotionalMoney,
        descriptions,
        status,
        FromDate,
        ToDate
      };

      const SCHEMA = {
        id: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.services.id'],
          regex: regexPattern.listIds
        }),
        ...DEFAULT_SCHEMA,

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

      ValidateJoi.validate(services, SCHEMA)
        .then(data => {
          if (id) {
            ValidateJoi.transStringToArray(data, 'id');
          }

          res.locals.filter = data;

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
    const { status } = req.body;
    const services = { status };

    const SCHEMA = {
      status: ValidateJoi.createSchemaProp({
        number: noArguments,
        required: noArguments,
        label: viMessage.status
      })
    };

    ValidateJoi.validate(services, SCHEMA)
      .then(data => {
        res.locals.body = data;
        next();
      })
      .catch(error => next({ ...error, message: 'Định dạng gửi đi không đúng' }));
  }
};
