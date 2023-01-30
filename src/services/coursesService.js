// import moment from 'moment'
import MODELS from '../models/models';
import models from '../entity/index';
import _ from 'lodash';
import * as ApiErrors from '../errors';
import ErrorHelpers from '../helpers/errorHelpers';
import filterHelpers from '../helpers/filterHelpers';
import preCheckHelpers, { TYPE_CHECK } from '../helpers/preCheckHelpers';

const {
  sequelize,
  users,
  courses,
  usersCourseHistories,
  courseLevels /* tblGatewayEntity, Roles */,
  courseGroups
} = models;

export default {
  get_list: param =>
    new Promise(async (resolve, reject) => {
      try {
        const { filter, range, sort, attributes } = param;

        console.log('filter', filter);
        let whereFilter = _.omit(filter, ['courseGroupsId', 'usersId']);
        const whereCourseLevels = _.pick(filter, ['courseGroupsId']);
        const att = filterHelpers.atrributesHelper(attributes);

        try {
          whereFilter = filterHelpers.combineFromDateWithToDate(whereFilter);
        } catch (error) {
          reject(error);
        }

        const perPage = range[1] - range[0] + 1;
        const page = Math.floor(range[0] / perPage);

        whereFilter = await filterHelpers.makeStringFilterRelatively(['coursesName'], whereFilter, 'courses');

        if (!whereFilter) {
          whereFilter = { ...filter };
        }

        const include = [];

        if (Number(filter.usersId) > 0) {
          include.push({
            model: usersCourseHistories,
            as: 'viewed',
            required: Number(filter.viewed) === 1 ? true : false,
            attributes: ['id', 'status'],
            where: {
              usersId: filter.usersId
            }
          });
        }

        console.log('where', whereFilter);
        sort.unshift([sequelize.literal('`courseLevels`.`order`'), 'asc']);
        console.log('filter', filter, sort, include);
        MODELS.findAndCountAll(courses, {
          where: whereFilter,
          order: sort,
          attributes: att,
          offset: range[0],
          limit: perPage,
          // distinct: true,
          logging: true,
          include: [
            { model: users, as: 'userCreators', required: true, attributes: ['id', 'username', 'fullname'] },
            {
              model: courseLevels,
              as: 'courseLevels',
              required: true,
              where: whereCourseLevels,
              attributes: ['id', 'courseLevelsName', 'courseGroupsId'],
              include: [
                {
                  model: courseGroups,
                  as: 'courseGroups',
                  required: true,
                  attributes: ['id', 'courseGroupsName']
                }
              ]
            },
            ...include
          ]
        })
          .then(result => {
            resolve({
              ...result,
              page: page + 1,
              perPage
            });
          })
          .catch(err => {
            reject(ErrorHelpers.errorReject(err, 'getListError', 'courseservice'));
          });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'getListError', 'courseservice'));
      }
    }),
  get_one: param =>
    new Promise((resolve, reject) => {
      try {
        // console.log("Menu Model param: %o | id: ", param, param.id)
        const id = param.id;
        let att = filterHelpers.atrributesHelper(param.attributes, ['usersCreatorId']);

        console.log('param', param);
        att =
          att && att.length > 0
            ? att
            : [
                'id',
                'coursesName',
                'order',
                'courseLevelsId',
                'status',
                'userCreatorsId',
                'dateCreated',
                'dateUpdated',
                'link',
                'videoLength',
                'descriptions',
                'image'
              ];

        const findnextCourses = att.findIndex(e => e === 'nextCourses');

        if (findnextCourses > 0) {
          att[findnextCourses] = [sequelize.literal('fn_get_next_courses(courses.id)  '), 'nextCourses'];
        }

        const findpreviousCourses = att.findIndex(e => e === 'previousCourses');

        if (findpreviousCourses > 0) {
          att[findpreviousCourses] = [sequelize.literal('fn_get_previous_courses  (courses.id)  '), 'previousCourses'];
        }

        const include = [];

        if (Number(param.usersId) > 0) {
          include.push({
            model: usersCourseHistories,
            as: 'viewed',
            required: Number(param.viewed) === 1 ? true : false,
            attributes: ['id', 'status'],
            where: {
              usersId: param.usersId
            }
          });
        }

        MODELS.findOne(courses, {
          where: { id: id },
          attributes: att,
          include: [
            { model: users, as: 'userCreators', required: true, attributes: ['id', 'username', 'fullname'] },
            {
              model: courseLevels,
              as: 'courseLevels',
              required: true,

              attributes: ['id', 'courseLevelsName', 'courseGroupsId'],
              include: [
                {
                  model: courseGroups,
                  as: 'courseGroups',
                  required: true,
                  attributes: ['id', 'courseGroupsName']
                }
              ]
            },
            ...include
          ]
        })
          .then(result => {
            if (!result) {
              reject(
                new ApiErrors.BaseError({
                  statusCode: 202,
                  type: 'crudNotExisted'
                })
              );
            }
            if (result.dataValues.nextCourses)
              result.dataValues.nextCourses = JSON.parse(result.dataValues.nextCourses);
            if (result.dataValues.previousCourses)
              result.dataValues.previousCourses = JSON.parse(result.dataValues.previousCourses);
            resolve(result);
          })
          .catch(err => {
            reject(ErrorHelpers.errorReject(err, 'getInfoError', 'courseservice'));
          });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'getInfoError', 'courseservice'));
      }
    }),
  create: async param => {
    let finnalyResult;

    try {
      const entity = param.entity;

      console.log('provinceModel create: ', entity);
      // let whereFilter = {
      //   coursesName: entity.coursesName
      // };
      // // api.courses.identificationCode

      // whereFilter = await filterHelpers.makeStringFilterAbsolutely(['coursesName'], whereFilter, 'courses');

      // const infoArr = Array.from(
      //   await Promise.all([
      //     preCheckHelpers.createPromiseCheckNew(
      //       MODELS.findOne(courses, { attributes: ['id'], where: whereFilter }),
      //       entity.coursesName ? true : false,
      //       TYPE_CHECK.CHECK_DUPLICATE,
      //       { parent: 'api.courses.coursesName' }
      //     )
      //   ])
      // );

      // if (!preCheckHelpers.check(infoArr)) {
      //   throw new ApiErrors.BaseError({
      //     statusCode: 202,
      //     type: 'getInfoError',
      //     message: 'Không xác thực được thông tin gửi lên'
      //   });
      // }

      if (!entity.order) {
        const findLastusers = await sequelize.query(
          `select \`order\`    from courses where courseLevelsId = ${entity.courseLevelsId} order by \`order\` desc`
        );

        console.log('findLastusers', findLastusers);

        console.log(
          'findLastusers',
          findLastusers,
          String(
            (Number(findLastusers && findLastusers[0] && findLastusers[0][0] && findLastusers[0][0].count) || 0) + 1
          )
        );
        entity.order =
          (Number(findLastusers && findLastusers[0] && findLastusers[0][0] && findLastusers[0][0].order) || 0) + 1;
      }

      finnalyResult = await MODELS.create(courses, entity).catch(error => {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudError',
          error
        });
      });

      if (Number(entity.status) === 1) {
        await MODELS.update(
          courseLevels,
          {
            countCourses: sequelize.literal(
              `(select count(courses.id) from courses where courses.courseLevelsId = ${finnalyResult.courseLevelsId} and status = 1 )`
            )
          },
          { where: { id: finnalyResult.courseLevelsId } }
        );

        await MODELS.update(
          courseGroups,
          {
            countCoursesStatus: 1
          },
          {
            where: sequelize.literal(
              `id = (select courseGroupsId from courseLevels where courseLevels.id =  ${finnalyResult.courseLevelsId})`
            ),
            logging: true
          }
        );
      }
      if (!finnalyResult) {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudInfo'
        });
      }
    } catch (error) {
      console.log('err', error);
      ErrorHelpers.errorThrow(error, 'crudError', 'courseservice');
    }

    return { result: finnalyResult };
  },
  update: async param => {
    let finnalyResult;

    try {
      const entity = param.entity;

      console.log('Province update: ');

      const foundProvince = await MODELS.findOne(courses, {
        where: {
          id: param.id
        }
      }).catch(error => {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'getInfoError',
          message: 'Lấy thông tin của Tỉnh/Thành phố thất bại!',
          error
        });
      });

      if (foundProvince) {
        // let whereFilter = {
        //   id: { $ne: param.id },
        //   coursesName: entity.coursesName
        // };

        // whereFilter = await filterHelpers.makeStringFilterAbsolutely(['coursesName'], whereFilter, 'courses');

        // const infoArr = Array.from(
        //   await Promise.all([
        //     preCheckHelpers.createPromiseCheckNew(
        //       MODELS.findOne(courses, { attributes: ['id'], where: whereFilter }),
        //       entity.coursesName ? true : false,
        //       TYPE_CHECK.CHECK_DUPLICATE,
        //       { parent: 'api.courses.coursesName' }
        //     )
        //   ])
        // );

        // if (!preCheckHelpers.check(infoArr)) {
        //   throw new ApiErrors.BaseError({
        //     statusCode: 202,
        //     type: 'getInfoError',
        //     message: 'Không xác thực được thông tin gửi lên'
        //   });
        // }

        await MODELS.update(courses, { ...entity, dateUpdated: new Date() }, { where: { id: Number(param.id) } }).catch(
          error => {
            throw new ApiErrors.BaseError({
              statusCode: 202,
              type: 'crudError',
              error
            });
          }
        );

        finnalyResult = await MODELS.findOne(courses, { where: { id: param.id } }).catch(error => {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'crudInfo',
            message: 'Lấy thông tin sau khi thay đổi thất bại',
            error
          });
        });

        if (!finnalyResult) {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'crudInfo',
            message: 'Lấy thông tin sau khi thay đổi thất bại'
          });
        }

        if (Number(entity.status) !== Number(foundProvince.status)) {
          await MODELS.update(
            courseLevels,
            {
              countCourses: sequelize.literal(
                `(select count(courses.id) from courses where courses.courseLevelsId = ${finnalyResult.courseLevelsId} and status = 1 )`
              )
            },
            { where: { id: finnalyResult.courseLevelsId } }
          );
        }
      } else {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudNotExisted'
        });
      }
    } catch (error) {
      ErrorHelpers.errorThrow(error, 'crudError', 'courseservice');
    }

    return { result: finnalyResult };
  },
  updateOrder: async param => {
    try {
      const entity = param.entity;

      console.log('provinceModel create: ', entity);

      await sequelize.transaction(async t => {
        await Promise.all(
          entity.courses.map(async e => {
            await MODELS.update(courses, { order: e.order }, { where: { id: e.id }, transaction: t }).catch(error => {
              throw new ApiErrors.BaseError({
                statusCode: 202,
                type: 'crudError',
                error
              });
            });
          })
        );

        // await setting_questions(finnalyResult.id, entity.questions, t);
      });
    } catch (error) {
      console.log('err', error);
      ErrorHelpers.errorThrow(error, 'crudError', 'courseLevelservice');
    }

    return { result: { success: true } };
  },
  create_histories: async param => {
    try {
      const usersId = param.usersId;
      const coursesId = param.coursesId;
      const status = param.status;

      console.log('histories create:', param);

      const foundProvince = await MODELS.findOne(courses, {
        where: {
          id: param.coursesId
        }
      }).catch(error => {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'getInfoError',
          message: 'Lấy thông tin bài giảng thất bại',
          error
        });
      });

      if (foundProvince) {
        await MODELS.createOrUpdate(
          usersCourseHistories,
          {
            usersId,
            coursesId,
            status: Number(status) || 0
          },
          { where: { usersId, coursesId } }
        ).catch(error => {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'crudError',
            error
          });
        });
      } else {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudNotExisted'
        });
      }
    } catch (error) {
      ErrorHelpers.errorThrow(error, 'crudError', 'courseGroupservice');
    }

    return { success: true };
  },
  update_status: param =>
    new Promise((resolve, reject) => {
      try {
        console.log('block id', param.id);
        const id = param.id;
        const entity = param.entity;

        MODELS.findOne(courses, {
          where: {
            id
          },
          logging: console.log
        })
          .then(findEntity => {
            // console.log("findPlace: ", findPlace)
            if (!findEntity) {
              reject(
                new ApiErrors.BaseError({
                  statusCode: 202,
                  type: 'crudNotExisted'
                })
              );
            } else {
              MODELS.update(
                courses,
                { ...entity, dateUpdated: new Date() },
                {
                  where: { id: id }
                }
              )
                .then(() => {
                  console.log('rowsUpdate: ', Number(entity.status), Number(findEntity.status));
                  if (Number(entity.status) !== Number(findEntity.status)) {
                    MODELS.update(
                      courseLevels,
                      {
                        countCourses: sequelize.literal(
                          `(select count(courses.id) from courses where courses.courseLevelsId = ${findEntity.courseLevelsId} and status = 1 )`
                        )
                      },
                      {
                        where: { id: findEntity.courseLevelsId },
                        logging: true
                      }
                    );
                  }
                  MODELS.findOne(courses, { where: { id: param.id } })
                    .then(result => {
                      if (!result) {
                        reject(
                          new ApiErrors.BaseError({
                            statusCode: 202,
                            type: 'deleteError'
                          })
                        );
                      } else resolve({ status: 1, result: result });
                    })
                    .catch(err => {
                      reject(ErrorHelpers.errorReject(err, 'crudError', 'UserServices'));
                    });
                })
                .catch(err => {
                  reject(ErrorHelpers.errorReject(err, 'crudError', 'UserServices'));
                });
            }
          })
          .catch(err => {
            reject(ErrorHelpers.errorReject(err, 'crudError', 'UserServices'));
          });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'crudError', 'UserServices'));
      }
    })
};
