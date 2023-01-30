import ValidateJoi, { noArguments } from '../utils/validateJoi';
import viMessage from '../locales/vi';

import regexPattern from '../utils/regexPattern';
import { parseSort } from '../utils/helper';

const DEFAULT_SCHEMA = {
  bankAccountsName: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.bankAccounts.bankAccountsName']
  }),
  bankAccountsNumber: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.bankAccounts.bankAccountsNumber']
  }),
  bankName: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.bankAccounts.bankName']
  }),
  QRcode: ValidateJoi.createSchemaProp({
    object: noArguments,
    label: viMessage['api.bankAccounts.QRcode'],
    allow: [null, '']
  }),
  bankAccountTypesId: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage['api.bankAccountTypes.id']
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
  })
};

export default {
  authenCreate: (req, res, next) => {
    // console.log("validate authenCreate")
    const userCreatorsId = req.auth.userId;

    const { bankAccountsName, bankAccountsNumber, bankName, QRcode, status, bankAccountTypesId } = req.body;
    const district = {
      bankAccountsName,
      bankAccountsNumber,
      bankName,
      QRcode,
      status,
      userCreatorsId,
      bankAccountTypesId
    };

    const SCHEMA = Object.assign(
      ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
        bankAccountsName: {
          min: 1,
          max: 200,
          required: noArguments
        },
        bankAccountsNumber: {
          min: 1,
          max: 45,
          required: noArguments
        },
        bankName: {
          min: 1,
          max: 500,
          required: noArguments
        },
        bankAccountTypesId: {
          required: noArguments
        },
        status: {
          required: noArguments
        }
      }),
      {}
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

    const { bankAccountsName, bankAccountsNumber, bankName, QRcode, status, bankAccountTypesId } = req.body;
    const district = {
      bankAccountsName,
      bankAccountsNumber,
      bankName,
      QRcode,
      status,
      bankAccountTypesId
    };

    const SCHEMA = Object.assign(
      ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
        bankAccountsName: {
          max: 200
        },
        bankAccountsNumber: {
          max: 45
        },
        bankName: {
          max: 500
        }
      }),
      {}
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
    res.locals.range = range ? JSON.parse(range) : [0, 49];
    res.locals.attributes = attributes;

    if (filter) {
      const {
        id,
        bankAccountsName,
        bankAccountsNumber,
        bankName,
        status,
        FromDate,
        bankAccountTypesId,
        ToDate,
        search
      } = JSON.parse(filter);
      const district = {
        id,
        bankAccountsName,
        bankName,
        bankAccountsNumber,
        bankAccountTypesId,
        status,
        FromDate,
        ToDate,
        search
      };

      // console.log(district)
      const SCHEMA = {
        id: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.bankAccounts.id'],
          regex: regexPattern.listIds
        }),
        ...DEFAULT_SCHEMA,

        search: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: 'search'
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
