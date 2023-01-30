/* eslint-disable camelcase */

// import groupcustomersModel from '../models/groupcustomers';
import models from '../entity/index';

// import errorCode from '../utils/errorCode';
import Promise from '../utils/promise';

import ErrorHelpers from '../helpers/errorHelpers';
import moment from 'moment';

const { sequelize } = models;

export default {
  khoa_hoc_top: param =>
    new Promise(async (resolve, reject) => {
      try {
        const { filter, range } = param;

        console.log('sort', param);
        const perPage = range[1] - range[0] + 1;
        const page = Math.floor(range[0] / perPage);

        console.log('filter', {
          in_FromDate: filter.FromDate ? moment(filter.FromDate).format('YYYY-MM-DD HH:mm:ss') : '1970-01-01',
          in_ToDate: filter.ToDate
            ? moment(filter.ToDate).format('YYYY-MM-DD HH:mm:ss')
            : moment().format('YYYY-MM-DD HH:mm:ss'),
          in_orderBy: filter.orderBy || 1,
          in_start_page: range[0],
          in_end_page: range[1] - range[0] + 1
        });

        const result = await sequelize
          .query('call sp_courseGroups_get_top(:in_FromDate,:in_ToDate,:in_orderBy,:in_start_page,:in_end_page)', {
            replacements: {
              in_FromDate: filter.FromDate ? moment(filter.FromDate).format('YYYY-MM-DD HH:mm:ss') : '1970-01-01',
              in_ToDate: filter.ToDate
                ? moment(filter.ToDate).format('YYYY-MM-DD HH:mm:ss')
                : moment().format('YYYY-MM-DD HH:mm:ss'),
              in_orderBy: filter.orderBy || 1,
              in_start_page: range[0],
              in_end_page: range[1] - range[0] + 1
            },
            type: sequelize.QueryTypes.SELECT
          })
          .catch(err => {
            console.log('err', err);
          });

        // console.log('rows', result);
        const rows = Object.values(result[0]);

        resolve({
          rows,
          count: result[result.length - 2]['0'].count || 0
        });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'getListError', 'Groupstorieservice'));
      }
    }),
  khoa_hoc_ty_le_hoan_thanh: param =>
    new Promise(async (resolve, reject) => {
      try {
        const { filter, range } = param;

        console.log('sort', param);
        const perPage = range[1] - range[0] + 1;
        const page = Math.floor(range[0] / perPage);

        console.log('filter', {
          in_start_page: range[0],
          in_end_page: range[1] - range[0] + 1
        });

        const result = await sequelize
          .query('call sp_courseGroups_get_ty_le_hoan_thanh(:in_start_page,:in_end_page)', {
            replacements: {
              in_start_page: range[0],
              in_end_page: range[1] - range[0] + 1
            },
            type: sequelize.QueryTypes.SELECT
          })
          .catch(err => {
            console.log('err', err);
          });

        delete result[0].meta;
        // console.log('rows', result);
        const rows = Object.values(result[0]);

        resolve({
          rows,
          page: page + 1,
          perPage,
          count: result[result.length - 2]['0'].count || 0
        });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'getListError', 'Groupstorieservice'));
      }
    }),
  hoc_vien_moi: param =>
    new Promise(async (resolve, reject) => {
      try {
        const { filter, sortBy } = param;

        console.log('sort', sortBy);

        console.log('filter', {
          in_FromDate: filter.FromDate ? moment(filter.FromDate).format('YYYY-MM-DD') : '1970-01-01',
          in_ToDate: filter.ToDate ? moment(filter.ToDate).format('YYYY-MM-DD') : moment().format('YYYY-MM-DD'),
          in_timeType: filter.timeType || 4
        });

        const result = await sequelize
          .query('call sp_hoc_vien_moi(:in_FromDate,:in_ToDate,:in_timeType)', {
            replacements: {
              in_FromDate: filter.FromDate ? moment(filter.FromDate).format('YYYY-MM-DD') : '1970-01-01',
              in_ToDate: filter.ToDate ? moment(filter.ToDate).format('YYYY-MM-DD') : moment().format('YYYY-MM-DD'),
              in_timeType: filter.timeType || 4
            },
            type: sequelize.QueryTypes.SELECT
          })
          .catch(err => {
            console.log('err', err);
          });

        // console.log('rows', result);
        delete result[0].meta;
        const rows = Object.values(result[0]);

        resolve({
          rows,
          detail: result[result.length - 2]['0']
        });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'getListError', 'Groupstorieservice'));
      }
    }),
  hoc_vien_dang_ky: param =>
    new Promise(async (resolve, reject) => {
      try {
        const { filter, sortBy } = param;

        console.log('sort', sortBy);

        console.log('filter', {
          in_FromDate: filter.FromDate ? moment(filter.FromDate).format('YYYY-MM-DD') : '1970-01-01',
          in_ToDate: filter.ToDate ? moment(filter.ToDate).format('YYYY-MM-DD') : moment().format('YYYY-MM-DD'),
          in_timeType: filter.timeType || 4
        });

        const result = await sequelize
          .query('call sp_statics_hoc_vien_dang_ky(:in_FromDate,:in_ToDate,:in_timeType)', {
            replacements: {
              in_FromDate: filter.FromDate ? moment(filter.FromDate).format('YYYY-MM-DD') : '1970-01-01',
              in_ToDate: filter.ToDate ? moment(filter.ToDate).format('YYYY-MM-DD') : moment().format('YYYY-MM-DD'),
              in_timeType: filter.timeType || 4
            },
            type: sequelize.QueryTypes.SELECT
          })
          .catch(err => {
            console.log('err', err);
          });

        // console.log('rows', result);
        delete result[0].meta;
        const rows = Object.values(result[0]);

        resolve({
          rows,
          detail: result[result.length - 2]['0']
        });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'getListError', 'Groupstorieservice'));
      }
    }),
  doanh_thu: param =>
    new Promise(async (resolve, reject) => {
      try {
        const { filter, sortBy } = param;

        console.log('sort', sortBy);

        console.log('filter', {
          in_FromDate: filter.FromDate ? moment(filter.FromDate).format('YYYY-MM-DD') : '1970-01-01',
          in_ToDate: filter.ToDate ? moment(filter.ToDate).format('YYYY-MM-DD') : moment().format('YYYY-MM-DD'),
          in_timeType: filter.timeType || 4
        });

        const result = await sequelize
          .query('call sp_statics_doanh_thu(:in_FromDate,:in_ToDate,:in_timeType)', {
            replacements: {
              in_FromDate: filter.FromDate ? moment(filter.FromDate).format('YYYY-MM-DD') : '1970-01-01',
              in_ToDate: filter.ToDate ? moment(filter.ToDate).format('YYYY-MM-DD') : moment().format('YYYY-MM-DD'),
              in_timeType: filter.timeType || 4
            },
            type: sequelize.QueryTypes.SELECT
          })
          .catch(err => {
            console.log('err', err);
          });

        console.log('rows', result);
        delete result[0].meta;
        const rows = Object.values(result[0]);

        resolve({
          rows,
          detail: result[result.length - 2]['0']
        });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'getListError', 'Groupstorieservice'));
      }
    }),
  top_dich_vu: param =>
    new Promise(async (resolve, reject) => {
      try {
        const { filter, range } = param;

        console.log('filter', {
          in_FromDate: filter.FromDate ? moment(filter.FromDate).format('YYYY-MM-DD') : '1970-01-01',
          in_ToDate: filter.ToDate ? moment(filter.ToDate).format('YYYY-MM-DD') : moment().format('YYYY-MM-DD')
        });

        const result = await sequelize
          .query(
            'call elearning.sp_service_get_top(:in_FromDate,:in_ToDate,:in_orderBy, :in_start_page, :in_end_page)',
            {
              replacements: {
                in_FromDate: filter.FromDate ? moment(filter.FromDate).format('YYYY-MM-DD') : '1970-01-01',
                in_ToDate: filter.ToDate ? moment(filter.ToDate).format('YYYY-MM-DD') : '2030-01-01',
                in_orderBy: filter.orderBy || 1,
                in_start_page: range[0],
                in_end_page: range[1] - range[0] + 1
              },
              type: sequelize.QueryTypes.SELECT
            }
          )
          .catch(err => {
            console.log('err', err);
          });

        delete result[0].meta;
        delete result[1].meta;
        const rows = Object.values(result[0]);
        const total = Object.values(result[1]);

        resolve({
          rows,
          total,
          detail: result[result.length - 2]['0']
        });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'getListError', 'Groupstorieservice'));
      }
    }),
  top_khoa_hoc: param =>
    new Promise(async (resolve, reject) => {
      try {
        const { filter, range } = param;

        console.log('filter', {
          in_FromDate: filter.FromDate ? moment(filter.FromDate).format('YYYY-MM-DD') : '1970-01-01',
          in_ToDate: filter.ToDate ? moment(filter.ToDate).format('YYYY-MM-DD') : moment().format('YYYY-MM-DD')
        });

        const result = await sequelize
          .query(
            'call elearning.sp_course_get_top(:in_FromDate,:in_ToDate,:in_orderBy, :in_start_page, :in_end_page)',
            {
              replacements: {
                in_FromDate: filter.FromDate ? moment(filter.FromDate).format('YYYY-MM-DD') : '1970-01-01',
                in_ToDate: filter.ToDate ? moment(filter.ToDate).format('YYYY-MM-DD') : '2030-01-01',
                in_orderBy: filter.orderBy || 1,
                in_start_page: range[0],
                in_end_page: range[1] - range[0] + 1
              },
              type: sequelize.QueryTypes.SELECT
            }
          )
          .catch(err => {
            console.log('err', err);
          });

        delete result[0].meta;
        delete result[1].meta;
        const rows = Object.values(result[0]);
        const total = Object.values(result[1]);

        resolve({
          rows,
          total,
          detail: result[result.length - 2]['0']
        });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'getListError', 'Groupstorieservice'));
      }
    })
};
