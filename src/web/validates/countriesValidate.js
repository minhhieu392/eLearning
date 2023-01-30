import ValidateJoi, { noArguments } from '../../utils/validateJoi';
import viMessage from '../../locales/vi';
import { parseSortVer3 } from '../../utils/helper';
import { parseSort } from '../../utils/helper';
export default {
  authenFilterCountriesVisa: (req, res, next) => {
    console.log('validate authenFilter');
    const { filter, sort, range, attributes } = req.query;

    res.locals.sort = parseSortVer3(sort);
    res.locals.range = range ? JSON.parse(range) : [0, 49];
    res.locals.attributes = attributes;
    if (filter) {
      const { countrieName, isInternational } = JSON.parse(filter);
      const user = {
        countrieName,
        isInternational
      };

      console.log(user);
      const SCHEMA = {
        countrieName: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.countries.countrieName']
        }),
        isInternational: ValidateJoi.createSchemaProp({
          number: noArguments,
          label: viMessage.isInternational
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
  },
  authenFilter: (req, res, next) => {
    console.log('validate authenFilter');
    const { filter, sort, range, attributes } = req.query;

    res.locals.sort = parseSort(sort);
    res.locals.range = range ? JSON.parse(range) : [0, 49];
    res.locals.attributes = attributes;
    if (filter) {
      const { id, countrieName, status, userCreatorsId, FromDate, ToDate } = JSON.parse(filter);
      const province = { id, countrieName, status, userCreatorsId, FromDate, ToDate };

      const SCHEMA = {
        id: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.countries.id'],
          regex: regexPattern.listIds
        }),
        ...DEFAULT_SCHEMA,
        userCreatorsId: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage.usersCreatorId,
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
      ValidateJoi.validate(province, SCHEMA)
        .then(data => {
          if (id) {
            ValidateJoi.transStringToArray(data, 'id');
          }
          if (userCreatorsId) {
            ValidateJoi.transStringToArray(data, 'userCreatorsId');
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
