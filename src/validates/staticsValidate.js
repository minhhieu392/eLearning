/* eslint-disable camelcase */
import ValidateJoi, { noArguments } from '../utils/validateJoi';
import viMessage from '../locales/vi';

import { parseSort } from '../utils/helper';

export default {
  bao_cao: (req, res, next) => {
    // console.log("validate authenFilter")
    const { filter, sort, range, attributes, detail } = req.query;

    res.locals.sortBy = sort ? JSON.parse(sort) : ['id', 'desc'];
    res.locals.sort = parseSort(sort);
    res.locals.range = range ? JSON.parse(range) : [0, 9];
    res.locals.attributes = attributes;
    res.locals.detail = detail;
    if (filter) {
      const { FromDate, ToDate, timeType, orderBy } = JSON.parse(filter);

      const district = {
        FromDate,
        timeType,
        ToDate,
        orderBy
      };
      // console.log(district)
      const SCHEMA = {
        orderBy: ValidateJoi.createSchemaProp({
          number: noArguments,
          label: 'orderBy : 1 -- theo doanh thu orderBy: 2theo số lượng'
        }),
        timeType: ValidateJoi.createSchemaProp({
          number: noArguments,
          label: '1: theo ngày, 2 theo tháng , 3 theo quý, 4 theo năm'
        }),
        FromDate: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage.FromDate,
          allow: ['']
        }),
        ToDate: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage.ToDate,
          allow: ['']
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
  }
};
