import UserService from '../services/usersService';
import loggerHelpers from '../helpers/loggerHelpers';

import { /* loggerFormat, */ recordStartTime } from '../utils/loggerFormat';
// import { createTemplateUser } from '../utils/helper';

export default {
  get_list: (req, res, next) => {
    try {
      recordStartTime.call(req);
      const { sort, range, filter, attributes } = res.locals;
      const { userId } = req.auth;

      const whereFilter = filter ? filter : {};

      const param = {
        sort: sort ? sort : ['id', 'asc'],
        range: range ? range : [0, 50],
        filter: whereFilter,
        userId,
        auth: req.auth,
        attributes
      };

      console.log('param', param);
      UserService.get_list(param)
        .then(data => {
          const response = {
            result: {
              list: data.rows,
              pagination: {
                current: data.page,
                pageSize: data.perPage,
                total: data.count
              }
            },
            success: true,
            errors: [],
            messages: []
          };

          res.send(response);

          // write log
          recordStartTime.call(res);
          loggerHelpers.logVIEWED(req, res, {
            dataReqBody: req.body,
            dataReqQuery: req.query,
            dataRes: response
          });
        })
        .catch(err => {
          next(err);
        });
      // }
    } catch (error) {
      next(error);
    }
  },
  // get_list_export: (req, res, next) => {
  //   try {
  //     recordStartTime.call(req);
  //     const { sort, range, filter, attributes } = res.locals;
  //     const { userId } = req.auth;

  //     const whereFilter = filter ? filter : {}

  //     const param = {
  //       sort: sort ? sort : ["id", "asc"],
  //       range: range ? range : [0, 50],
  //       filter: whereFilter,
  //       userId,
  //       auth: req.auth, attributes
  //     }

  //     UserService.get_list(param).then(data => {

  //       const workbook = new Excel.Workbook();

  //       const font = { name: 'Times New Roman', size: 11, color: { argb: '000000' } };
  //       const headerKeyProduct = [
  //         {
  //           key: 'no',
  //           width: 8,
  //           style: { alignment: { vertical: 'middle', horizontal: 'center' }, font: font }
  //         },
  //         {
  //           key: 'dateCreated',
  //           width: 12,
  //           style: { alignment: { vertical: 'middle', horizontal: 'left', wrapText: true }, font: font }
  //         },
  //         {
  //           key: 'username',
  //           width: 15,
  //           style: {alignment: { vertical: 'middle', horizontal: 'center' }, font: font }
  //         },
  //         {
  //           key: 'fullname',
  //           width: 15,
  //           style: {  alignment: { vertical: 'middle', horizontal: 'center' }, font: font }
  //         },
  //         {
  //           key: 'mobile',
  //           width: 10,
  //           style: { alignment: { vertical: 'middle', horizontal: 'center' }, font: font }
  //         },
  //         {
  //           key: 'usersCode',
  //           width: 10,
  //           style: {alignment: { vertical: 'middle', horizontal: 'center' }, font: font }
  //         },
  //         {
  //           key: 'email',
  //           width: 15,
  //           style: {alignment: { vertical: 'middle', horizontal: 'center' }, font: font }
  //         },
  //         {
  //           key: 'userGroupName',
  //           width: 13,
  //           style: {alignment: { vertical: 'middle', horizontal: 'center' }, font: font }
  //         },
  //       ];

  //       param.filter.FromDate =
  //       moment(param.filter.FromDate)
  //         .tz(tz)
  //         .format('DD-MM-YYYY') || moment().format('DD-MM-YYYY');
  //       param.filter.ToDate =
  //         moment(param.filter.ToDate)
  //           .tz(tz)
  //           .format('DD-MM-YYYY') || moment().format('DD-MM-YYYY');
  //       // console.log('filter', param.filter);

  //       const headerTitleProduct = [
  //         'STT',
  //         'Ngày',
  //         'Tài khoản',
  //         'Họ và tên',
  //         'Số điện thoại',
  //         'Đơn vị công tác',
  //         'hòm thư',
  //         'Nhóm tài khoản'
  //       ];

  //       const startRow = 6;
  //             const worksheet = createTemplateUser(workbook, {
  //               startRow,
  //               headerKey: headerKeyProduct,
  //               headerTitle: headerTitleProduct,
  //               reportName: 'DANH SÁCH NGƯỜI DÙNG',
  //               param: { ...param, lastCol: 'H' }
  //             });
  //       let currentRow = 7;

  //       _.forEach(data.rows, (item, index) => {
  //         // for (var i = 0; i <= 4; i ++){
  //         const newItem = [
  //           index + 1,
  //           moment(item.dateCreated )
  //           .tz(tz)
  //           .format('DD-MM-YYYY'),
  //           item.username,
  //           item.fullname,
  //           item.mobile,
  //           item.usersCode,
  //           item.email,
  //           item.userGroups.userGroupName
  //         ];

  //         worksheet.spliceRows(currentRow, 0, newItem);
  //         const row = worksheet.getRow(currentRow);

  //         row.eachCell(cell => {
  //           cell.border = {
  //             top: { style: 'thin' },
  //             left: { style: 'thin' },
  //             bottom: { style: 'thin' },
  //             right: { style: 'thin' }
  //           };
  //         });

  //         // if(currentRow % 30 === 0)
  //         // {
  //         //    row.addPageBreak();
  //         // }
  //         currentRow += 1;
  //         // }
  //       });

  //       // data.rows.length > 0 && worksheet.mergeCells(`A${currentRow}:B${currentRow}`);
  //             // worksheet.getCell(`A${currentRow}`).value = 'Tổng cộng';
  //             // worksheet.getCell(`A${currentRow}`).fill = {
  //             //   type: 'pattern',
  //             //   pattern: 'darkTrellis',
  //             //   fgColor: { argb: 'FFFFFF00' },
  //             //   bgColor: { argb: 'f2f2f2f2' }
  //             // };
  //             // worksheet.getCell(`C${currentRow}`).value = data.rows.username;
  //             // worksheet.getCell(`D${currentRow}`).value = data.rows.fullname;
  //             // worksheet.getCell(`E${currentRow}`).value = data.rows.mobile;
  //             // worksheet.getCell(`F${currentRow}`).value = data.rows.usersCode;
  //             // worksheet.getCell(`G${currentRow}`).value = data.rows.email;
  //             // worksheet.getCell(`H${currentRow}`).value = data.rows.userGroupName;
  //             // worksheet.getRow(currentRow).height = 30;
  //             // worksheet.getRow(currentRow).eachCell({ includeEmpty: true }, cell => {
  //             //   cell.alignment = { vertical: 'middle', horizontal: 'center' };
  //             //   cell.font = { size: 12, bold: true, color: { argb: '993300' } };
  //             //   cell.border = {
  //             //     top: { style: 'thin' },
  //             //     left: { style: 'thin' },
  //             //     bottom: { style: 'thin' },
  //             //     right: { style: 'thin' }
  //             //   };
  //             // });
  //             // worksheet.mergeCells(`I${currentRow + 2}:J${currentRow + 2}`);
  //             // worksheet.getCell(`I${currentRow + 2}`).value = 'Người phê duyệt';
  //             // worksheet.getCell(`I${currentRow + 2}`).font = {
  //             //   name: 'Times New Roman',
  //             //   size: 12,
  //             //   bold: true,
  //             //   color: { argb: '000000' }
  //             // };
  //             // worksheet.mergeCells(`I${currentRow + 3}:J${currentRow + 3}`);
  //             // worksheet.getCell(`I${currentRow + 3}`).value = '(Ký và ghi rõ họ tên)';
  //             // worksheet.getCell(`I${currentRow + 3}`).font = {
  //             //   name: 'Times New Roman',
  //             //   size: 12,
  //             //   italic: true,
  //             //   color: { argb: '000000' }
  //             // };

  //             workbook.xlsx.writeBuffer().then(function (s) {
  //               res.send(s.toString('base64'));
  //             });

  //           })
  //           .catch(error => {
  //             // const statusCode = 480;

  //             // res.status(statusCode).send({ status: false, message: error.message, stack: error.stack })
  //             next(error);
  //           });
  //       // const response = {
  //       //   result: {
  //       //     list: data.rows,
  //       //     pagination: {
  //       //       current: data.page,
  //       //       pageSize: data.perPage,
  //       //       total: data.count
  //       //     }
  //       //   },
  //       //   success: true,
  //       //   errors: [],
  //       //   messages: []
  //       // };

  //       // res.send(response);

  //       // // write log
  //       // recordStartTime.call(res);
  //       // loggerHelpers.logInfor(req, res, {
  //       //   dataParam: req.params,
  //       //   dataQuery: req.query,
  //       // });
  //     // }
  //   } catch (error) {
  //     next(error)
  //   }
  // },
  get_one: (req, res, next) => {
    try {
      recordStartTime.call(req);
      const { id } = req.params;
      const { attributes } = req.query;
      const param = { id, auth: req.auth, attributes };

      // console.log("UserService param: ", param)
      UserService.get_one(param)
        .then(data => {
          // res.header('Content-Range', `articles ${range}/${data.count}`);
          res.send(data);

          recordStartTime.call(res);
          loggerHelpers.logVIEWED(req, res, {
            dataReqBody: req.body,
            dataReqQuery: req.query,
            dataRes: data
          });
        })
        .catch(err => {
          next(err);
        });
    } catch (error) {
      next(error);
    }
  },
  find_one: user =>
    new Promise((resovle, reject) => {
      try {
        UserService.find_one(user)
          .then(data => {
            resovle(data);
          })
          .catch(error => {
            reject(error);
          });
      } catch (error) {
        reject(error);
      }
    }),
  find: filter =>
    new Promise((resovle, reject) => {
      try {
        UserService.find(filter)
          .then(data => {
            resovle(data);
          })
          .catch(error => {
            reject(error);
          });
      } catch (error) {
        reject(error);
      }
    }),
  create: (req, res, next) => {
    try {
      recordStartTime.call(req);
      const entity = res.locals.body;
      const param = { entity };

      UserService.create(param)
        .then(data => {
          if (data && data.status === 1) {
            // res.send(data.result);
            res.send({
              result: data.result,
              success: true,
              errors: [],
              messages: []
            });

            recordStartTime.call(res);
            loggerHelpers.logCreate(req, res, {
              dataReqBody: req.body,
              dataReqQuery: req.query,
              dataRes: {
                result: data.result,
                success: true,
                errors: [],
                messages: []
              }
            });
          } else if (data && data.status === 0) {
            const errMsg = 'Tài khoản này đã tồn tại';

            res.send({ success: false, message: errMsg });

            recordStartTime.call(res);
            loggerHelpers.logError(req, res, {
              dataParam: req.params,
              dataQuery: req.query,
              errMsg
            });
          } else if (data && data.status === -2) {
            // const errMsg = "Bạn phải điền đẩy các trường"
            res.send({ success: false, message: data.message });

            recordStartTime.call(res);
            loggerHelpers.logError(req, res, {
              dataParam: req.params,
              dataQuery: req.query
            });
          } else {
            const errMsg = 'Đã có lỗi xảy ra';

            res.send({ success: false, message: errMsg });

            recordStartTime.call(res);
            loggerHelpers.logError(req, res, {
              dataParam: req.params,
              dataQuery: req.query,
              errMsg
            });
          }
        })
        .catch(err => {
          next(err);
        });
    } catch (err) {
      next(err);
    }
  },
  register: (req, res, next) => {
    try {
      recordStartTime.call(req);
      const entity = res.locals.body;
      const param = { entity };

      UserService.register(param)
        .then(data => {
          if (data && data.status === 1) {
            // res.send(data.result);
            res.send({
              result: data.result,
              success: true,
              errors: [],
              messages: []
            });

            recordStartTime.call(res);
            loggerHelpers.logCreate(req, res, {
              dataReqBody: req.body,
              dataReqQuery: req.query,
              dataRes: {
                result: data.result,
                success: true,
                errors: [],
                messages: []
              }
            });
          } else if (data && data.status === 0) {
            const errMsg = 'Tài khoản này đã tồn tại';

            res.send({ success: false, message: errMsg });

            recordStartTime.call(res);
            loggerHelpers.logError(req, res, {
              dataParam: req.params,
              dataQuery: req.query,
              errMsg
            });
          } else if (data && data.status === -2) {
            // const errMsg = "Bạn phải điền đẩy các trường"
            res.send({ success: false, message: data.message });

            recordStartTime.call(res);
            loggerHelpers.logError(req, res, {
              dataParam: req.params,
              dataQuery: req.query
            });
          } else {
            const errMsg = 'Đã có lỗi xảy ra';

            res.send({ success: false, message: errMsg });

            recordStartTime.call(res);
            loggerHelpers.logError(req, res, {
              dataParam: req.params,
              dataQuery: req.query,
              errMsg
            });
          }
        })
        .catch(err => {
          next(err);
        });
    } catch (err) {
      next(err);
    }
  },
  registerByOtp: (req, res, next) => {
    try {
      recordStartTime.call(req);
      const { otp, usersId } = req.body;
      const param = { otp: otp, usersId: usersId };

      UserService.registerByOtp(param)
        .then(data => {
          if (data && data.status === 1) {
            // res.send(data.result);
            res.send({
              result: data.result,
              success: true,
              errors: [],
              messages: []
            });

            recordStartTime.call(res);
            loggerHelpers.logCreate(req, res, {
              dataReqBody: req.body,
              dataReqQuery: req.query,
              dataRes: {
                result: data.result,
                success: true,
                errors: [],
                messages: []
              }
            });
          } else if (data && data.status === 0) {
            const errMsg = 'Tài khoản này đã tồn tại';

            res.send({ success: false, message: errMsg });

            recordStartTime.call(res);
            loggerHelpers.logError(req, res, {
              dataParam: req.params,
              dataQuery: req.query,
              errMsg
            });
          } else if (data && data.status === -2) {
            // const errMsg = "Bạn phải điền đẩy các trường"
            res.send({ success: false, message: data.message });

            recordStartTime.call(res);
            loggerHelpers.logError(req, res, {
              dataParam: req.params,
              dataQuery: req.query
            });
          } else {
            const errMsg = 'Đã có lỗi xảy ra';

            res.send({ success: false, message: errMsg });

            recordStartTime.call(res);
            loggerHelpers.logError(req, res, {
              dataParam: req.params,
              dataQuery: req.query,
              errMsg
            });
          }
        })
        .catch(err => {
          next(err);
        });
    } catch (err) {
      next(err);
    }
  },
  createNewOtp: (req, res, next) => {
    try {
      recordStartTime.call(req);
      const { usersId } = req.body;
      const param = { usersId: usersId };

      UserService.createNewOtp(param)
        .then(data => {
          if (data && data.status === 1) {
            // res.send(data.result);
            res.send({
              result: data.result,
              success: true,
              errors: [],
              messages: []
            });

            recordStartTime.call(res);
            loggerHelpers.logCreate(req, res, {
              dataReqBody: req.body,
              dataReqQuery: req.query,
              dataRes: {
                result: data.result,
                success: true,
                errors: [],
                messages: []
              }
            });
          } else if (data && data.status === 0) {
            const errMsg = 'Tài khoản này đã tồn tại';

            res.send({ success: false, message: errMsg });

            recordStartTime.call(res);
            loggerHelpers.logError(req, res, {
              dataParam: req.params,
              dataQuery: req.query,
              errMsg
            });
          } else if (data && data.status === -2) {
            // const errMsg = "Bạn phải điền đẩy các trường"
            res.send({ success: false, message: data.message });

            recordStartTime.call(res);
            loggerHelpers.logError(req, res, {
              dataParam: req.params,
              dataQuery: req.query
            });
          } else {
            const errMsg = 'Đã có lỗi xảy ra';

            res.send({ success: false, message: errMsg });

            recordStartTime.call(res);
            loggerHelpers.logError(req, res, {
              dataParam: req.params,
              dataQuery: req.query,
              errMsg
            });
          }
        })
        .catch(err => {
          next(err);
        });
    } catch (err) {
      next(err);
    }
  },
  update: (req, res, next) => {
    try {
      recordStartTime.call(req);
      const { id } = req.params;
      const entity = res.locals.body;
      const param = { id, entity };

      UserService.update(param)
        .then(data => {
          if (data && data.status === 1) {
            // res.send(data.result);
            res.send({
              result: data.result,
              success: true,
              errors: [],
              messages: []
            });

            recordStartTime.call(res);
            loggerHelpers.logUpdate(req, res, {
              dataReqBody: req.body,
              dataReqQuery: req.query,
              dataRes: {
                result: data.result,
                success: true,
                errors: [],
                messages: []
              }
            });
          } else if (data && data.status === 0) {
            const errMsg = 'Tài khoản này đã tồn tại';

            res.send({ success: false, message: errMsg });

            recordStartTime.call(res);
            loggerHelpers.logUpdate(req, res, {
              dataReqBody: req.body,
              dataReqQuery: req.query,
              dataRes: {
                result: data.result,
                success: false,
                errors: [],
                messages: errMsg
              }
            });
          } else if (data && data.status === -2) {
            // const errMsg = "Bạn phải điền đẩy các trường"
            res.send({ success: false, message: data.message });

            recordStartTime.call(res);
            loggerHelpers.logUpdate(req, res, {
              dataReqBody: req.body,
              dataReqQuery: req.query,
              dataRes: {
                result: data.result,
                success: false,
                errors: [],
                messages: data.message
              }
            });
          } else {
            const errMsg = 'Đã có lỗi xảy ra';

            res.send({ success: false, message: errMsg });

            recordStartTime.call(res);
            loggerHelpers.logCreate(req, res, {
              dataReqBody: req.body,
              dataReqQuery: req.query,
              dataRes: {
                success: false,
                errors: [],
                messages: errMsg
              }
            });
          }
        })
        .catch(err => {
          next(err);
        });
    } catch (error) {
      next(error);
    }
  },
  update_status: (req, res, next) => {
    try {
      recordStartTime.call(req);
      const { id } = req.params;
      const entity = res.locals.body;
      const param = { id, entity };

      UserService.update_status(param)
        .then(data => {
          if (data && data.status === 1) {
            // res.send(data.result);
            res.send({
              result: data.result,
              success: true,
              errors: [],
              messages: []
            });

            recordStartTime.call(res);
            loggerHelpers.logUpdate(req, res, {
              dataReqBody: req.body,
              dataReqQuery: req.query,
              dataRes: {
                result: data.result,
                success: true,
                errors: [],
                messages: []
              }
            });
          } else if (data && data.status === 0) {
            const errMsg = 'Tài khoản này đã tồn tại';

            res.send({ success: false, message: errMsg });

            recordStartTime.call(res);
            loggerHelpers.logUpdate(req, res, {
              dataReqBody: req.body,
              dataReqQuery: req.query,
              dataRes: {
                result: data.result,
                success: false,
                errors: [],
                messages: errMsg
              }
            });
          } else if (data && data.status === -2) {
            // const errMsg = "Bạn phải điền đẩy các trường"
            res.send({ success: false, message: data.message });

            recordStartTime.call(res);
            loggerHelpers.logUpdate(req, res, {
              dataReqBody: req.body,
              dataReqQuery: req.query,
              dataRes: {
                result: data.result,
                success: true,
                errors: [],
                messages: data.message
              }
            });
          } else {
            const errMsg = 'Đã có lỗi xảy ra';

            res.send({ success: false, message: errMsg });

            recordStartTime.call(res);
            loggerHelpers.logUpdate(req, res, {
              dataReqBody: req.body,
              dataReqQuery: req.query,
              dataRes: {
                result: data.result,
                success: true,
                errors: [],
                messages: errMsg
              }
            });
          }
        })
        .catch(err => {
          next(err);
        });
    } catch (error) {
      next(error);
    }
  },
  update_userTokenOfNotifications_status: (req, res, next) => {
    try {
      recordStartTime.call(req);
      const { id } = req.params;
      const entity = res.locals.body;
      const param = { id, entity };

      UserService.update_userTokenOfNotifications_status(param)
        .then(data => {
          if (data && data.status === 1) {
            // res.send(data.result);
            res.send({
              result: data.result,
              success: true,
              errors: [],
              messages: []
            });

            recordStartTime.call(res);
            loggerHelpers.logUpdate(req, res, {
              dataReqBody: req.body,
              dataReqQuery: req.query,
              dataRes: {
                result: data.result,
                success: true,
                errors: [],
                messages: []
              }
            });
          } else if (data && data.status === 0) {
            const errMsg = 'Tài khoản này đã tồn tại';

            res.send({ success: false, message: errMsg });

            recordStartTime.call(res);
            loggerHelpers.logUpdate(req, res, {
              dataReqBody: req.body,
              dataReqQuery: req.query,
              dataRes: {
                result: data.result,
                success: false,
                errors: [],
                messages: errMsg
              }
            });
          } else if (data && data.status === -2) {
            // const errMsg = "Bạn phải điền đẩy các trường"
            res.send({ success: false, message: data.message });

            recordStartTime.call(res);
            loggerHelpers.logUpdate(req, res, {
              dataReqBody: req.body,
              dataReqQuery: req.query,
              dataRes: {
                result: data.result,
                success: true,
                errors: [],
                messages: data.message
              }
            });
          } else {
            const errMsg = 'Đã có lỗi xảy ra';

            res.send({ success: false, message: errMsg });

            recordStartTime.call(res);
            loggerHelpers.logUpdate(req, res, {
              dataReqBody: req.body,
              dataReqQuery: req.query,
              dataRes: {
                result: data.result,
                success: true,
                errors: [],
                messages: errMsg
              }
            });
          }
        })
        .catch(err => {
          next(err);
        });
    } catch (error) {
      next(error);
    }
  },
  changePass: (req, res, next) => {
    try {
      recordStartTime.call(req);

      const { id } = req.params;
      const entity = req.body;
      const param = { id, entity };

      UserService.changePass(param)
        .then(data => {
          console.log('changePass dataReturn: ', data);
          res.send(data);

          recordStartTime.call(res);
          loggerHelpers.logUpdate(req, res, {
            dataReqBody: req.body,
            dataReqQuery: req.query,
            dataRes: data
          });
        })
        .catch(err => {
          next(err);
        });
    } catch (error) {
      next(error);
    }
  },
  changePassByOtp: (req, res, next) => {
    try {
      recordStartTime.call(req);
      const { otp, usersId, password } = req.body;
      const param = { otp: otp, usersId: usersId, password: password };

      UserService.changePassByOtp(param)
        .then(data => {
          console.log('changePass dataReturn: ', data);
          res.send(data);

          recordStartTime.call(res);
          loggerHelpers.logUpdate(req, res, {
            dataReqBody: req.body,
            dataReqQuery: req.query,
            dataRes: data
          });
        })
        .catch(err => {
          next(err);
        });
    } catch (err) {
      next(err);
    }
  },
  accessOtp: (req, res, next) => {
    try {
      recordStartTime.call(req);
      const { otp, usersId } = req.body;
      const param = { otp: otp, usersId: usersId };

      UserService.accessOtp(param)
        .then(data => {
          console.log('changePass dataReturn: ', data);
          res.send(data);

          recordStartTime.call(res);
          loggerHelpers.logUpdate(req, res, {
            dataReqBody: req.body,
            dataReqQuery: req.query,
            dataRes: data
          });
        })
        .catch(err => {
          next(err);
        });
    } catch (err) {
      next(err);
    }
  },
  resetPass: (req, res, next) => {
    try {
      recordStartTime.call(req);

      const { id } = req.params;
      const entity = req.body;
      const param = { id, entity };

      UserService.resetPass(param)
        .then(data => {
          res.send(data);

          recordStartTime.call(res);
          loggerHelpers.logUpdate(req, res, {
            dataReqBody: req.body,
            dataReqQuery: req.query,
            dataRes: data
          });
        })
        .catch(err => {
          next(err);
        });
    } catch (error) {
      next(error);
    }
  },
  requestForgetPass: (req, res, next) => {
    try {
      recordStartTime.call(req);

      const param = req.body;

      UserService.requestForgetPass(param)
        .then(data => {
          res.send(data);

          recordStartTime.call(res);
          loggerHelpers.logUpdate(req, res, {
            dataReqBody: req.body,
            dataReqQuery: req.query,
            dataRes: data
          });
        })
        .catch(err => {
          next(err);
        });
    } catch (error) {
      next(error);
    }
  },
  loginByEmail: (req, res, next) => {
    try {
      recordStartTime.call(req);

      const param = res.locals.body;

      UserService.loginByEmail(param)
        .then(data => {
          res.send(data);

          recordStartTime.call(res);
          loggerHelpers.logUpdate(req, res, {
            dataReqBody: res.body,
            dataReqQuery: req.query,
            dataRes: data
          });
        })
        .catch(err => {
          next(err);
        });
    } catch (error) {
      next(error);
    }
  },
  loginWithSocical: (req, res, next) => {
    try {
      recordStartTime.call(req);

      const param = res.locals.body;

      UserService.loginWithSocical(param)
        .then(data => {
          res.send(data);
          recordStartTime.call(res);
          loggerHelpers.logUpdate(req, res, {
            dataReqBody: res.body,
            dataReqQuery: req.query,
            dataRes: data
          });
        })
        .catch(err => {
          next(err);
        });
    } catch (error) {
      next(error);
    }
  },
  getByUserGroups: (req, res, next) => {
    try {
      recordStartTime.call(req);
      const { sort, range, filter, attributes } = res.locals;

      console.log('res.locals==', JSON.stringify(res.locals));
      const whereFilter = filter ? filter : {};

      const param = {
        sort: sort ? sort : ['id', 'asc'],
        range: range ? range : [0, 50],
        filter: whereFilter,
        auth: req.auth,
        attributes
      };

      UserService.getByUserGroups(param)
        .then(data => {
          const response = {
            result: {
              list: data.result,
              pagination: {
                current: data.page,
                pageSize: data.perPage,
                total: data.count
              }
            },
            success: true,
            errors: [],
            messages: []
          };

          res.send(response);

          // write log
          recordStartTime.call(res);
          loggerHelpers.logVIEWED(req, res, {
            dataReqBody: req.body,
            dataReqQuery: req.query,
            dataRes: response
          });
        })
        .catch(err => {
          next(err);
        });
      // }
    } catch (error) {
      next(error);
    }
  },
  sp_usersApprovedLocations_getByUsersSellerId: (req, res, next) => {
    try {
      recordStartTime.call(req);
      const { sort, range, filter, attributes } = res.locals;

      console.log('res.locals==', JSON.stringify(res.locals));
      const whereFilter = filter ? filter : {};

      const param = {
        sort: sort ? sort : ['id', 'asc'],
        range: range ? range : [0, 50],
        filter: whereFilter,
        auth: req.auth,
        attributes
      };

      UserService.sp_usersApprovedLocations_getByUsersSellerId(param)
        .then(data => {
          const response = {
            result: {
              list: data.result,
              pagination: {
                current: data.page,
                pageSize: data.perPage,
                total: data.count
              }
            },
            success: true,
            errors: [],
            messages: []
          };

          res.send(response);

          // write log
          recordStartTime.call(res);
          loggerHelpers.logVIEWED(req, res, {
            dataReqBody: req.body,
            dataReqQuery: req.query,
            dataRes: response
          });
        })
        .catch(err => {
          next(err);
        });
      // }
    } catch (error) {
      next(error);
    }
  },
  logout: (req, res, next) => {
    try {
      recordStartTime.call(req);
      const { clientId } = req.body;

      const param = { auth: req.auth, clientId };

      UserService.logout(param)
        .then(data => {
          if (data) {
            // res.send(data.result);
            res.send({
              success: true,
              errors: [],
              messages: []
            });

            recordStartTime.call(res);
            loggerHelpers.logUpdate(req, res, {
              dataReqBody: req.body,
              dataReqQuery: req.query,
              dataRes: {
                result: data.result,
                success: true,
                errors: [],
                messages: []
              }
            });
          }
        })
        .catch(err => {
          next(err);
        });
    } catch (error) {
      next(error);
    }
  }
};
