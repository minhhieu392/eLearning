/* eslint-disable camelcase */
import ValidateJoi, { noArguments } from '../utils/validateJoi';
import viMessage from '../locales/vi';

import { parseSortVer2 } from '../utils/helper';
const DEFAULT_SCHEMA = {
  usersId: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage['api.users.id']
  }),
  userTokenCode: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage['api.userTokens.userTokenCode']
  }),
  dateExpired: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage['api.userTokens.dateExpired']
  }),
  type: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage['api.userTokens.type']
  })
};

export default {
  authenFilter: (req, res, next) => {
    console.log('validate authenFilter');
    const { filter, sort, range, attributes } = req.query;

    res.locals.sort = parseSortVer2(sort, 'userTokens');
    res.locals.range = range ? JSON.parse(range) : [0, 49];
    res.locals.attributes = attributes;
    if (filter) {
      const { id, usersId, type, dateExpired, userTokenCode } = JSON.parse(filter);
      const province = {
        id,
        usersId,
        type,
        dateExpired,
        userTokenCode
      };

      const SCHEMA = {
        ...DEFAULT_SCHEMA
      };

      // console.log('input: ', input);
      ValidateJoi.validate(province, SCHEMA)
        .then(data => {
          if (id) {
            ValidateJoi.transStringToArray(data, 'id');
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
