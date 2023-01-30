import { Router } from 'express';
import jwt from 'jsonwebtoken';
import Joi from '../utils/joi/lib';
// import moment from 'moment';
import CONFIG from '../config';
import validate from '../utils/validate';
import usersController from '../controllers/usersController';
import MODELS from '../models/models';
import { encryptedString, verifyPasswordMd5 } from '../utils/crypto';
import * as ApiErrors from '../errors';
import ErrorHelpers from '../helpers/errorHelpers';
import models from '../entity/index';

// import _ from 'lodash';

const { /* sequelize, */ userTokenOfNotifications, sequelize } = models;

const router = Router();

router.get('/generate/data/login', async (req, res, next) => {
  const { userName, password } = req.body;
  const data = await encryptedString(`${userName}|${password}`, 'nbm@2018');

  console.log('data: ', data);
  res.send(data);
});

/**
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
const validateAuthen = (req, res, next) => {
  // console.log("validateAuthen")
  const { userName, password } = req.body;
  const user = {
    userName,
    password
  };
  const SCHEMA = {
    userName: Joi.string()
      .label('userName')
      .min(3)
      .max(100)
      .required(),
    password: Joi.string()
      .label('password')
      .required()
  };

  // console.log('input: ', input);
  validate(user, SCHEMA)
    .then(() => next())
    .catch(err =>
      next(
        new ApiErrors.BaseError({
          statusCode: 400,
          type: 'loginError',
          error: err,
          name: 'Login'
        })
      )
    );
};

router.post('/student', validateAuthen, async (req, res, next) => {
  try {
    console.log('authenticate body: ', req.body);
    const { userName, password, type, clientId } = req.body;
    // const passEncrypt = 'nbm@2018'
    // var encrypted = await encryptedString('hethong@gmail.com|AL7h8Jx4r8a8PjS5', passEncrypt)
    // 1bc2fef9ac032e211503b5690137d9e9addd3bfa8198d5b6f1d06513ec406190c0a7e282d83f648c7f47484b0e68b730
    // const decrypted = await decryptedString(data, passEncrypt)

    const user = {
      userName: userName,
      password,
      userGroupsId: 2
    };

    // if (decrypted && decrypted.split('|').length === 2) {
    //   user = { user: decrypted.split('|')[0], password: decrypted.split('|')[1] }
    // }

    let token;
    let dataToken;
    // let role;

    if (user && user.userName) {
      const userInfo = await usersController.find_one(user).catch(err => {
        ErrorHelpers.errorThrow(err, 'userNotFoundError', 'Login', 202);
        /* throw new ApiErrors.BaseError({
          statusCode: 200,
          type: 'userNotFoundError',
          error: err,
          name: 'Login'
        }) */

        // return;
      });

      // // const conditionExpire = moment(userInfo.dateExpire).format('YYYY-MM-DD HH:mm:ss') > Date.now() ?  true : false;

      // console.log("dateExpire: ", userInfo.dateExpire);
      // console.log("dateExpire: ", );
      const conditionExpire = false;

      if (!userInfo) {
        throw new ApiErrors.BaseError({
          statusCode: 200,
          type: 'userNotFoundError',
          name: 'Login'
        });
      }

      /* if (userInfo && userInfo.dateExpire) {
        console.log('Vao if kiem tra: ');
        conditionExpire = moment(userInfo.dateExpire).isAfter(moment());
      }

      console.log('conditionExpire: ', conditionExpire);
      */
      if (userInfo && userInfo.status === 1) {
        const passOk = await verifyPasswordMd5(user.password, userInfo.password);

        if (passOk) {
          dataToken = {
            user: userName,
            userId: userInfo.id,
            consultantOrganizations: userInfo.consultantOrganizations
          };
          token = jwt.sign(
            {
              ...dataToken
            },
            process.env.JWT_SECRET,
            {
              expiresIn: `${CONFIG.TOKEN_LOGIN_EXPIRE}`
              // algorithm: 'RS256'
            }
          );

          if (token) {
            if (clientId) {
              const findToken = await MODELS.findOne(userTokenOfNotifications, {
                where: {
                  usersId: userInfo.id,
                  clientId: clientId
                }
              });

              if (!findToken) {
                const countUsersId = await sequelize.query(
                  `select count(*) as count  from userTokenOfNotifications where usersId = ${userInfo.id}`
                );
                const count = countUsersId[0][0].count;

                if (count >= 5) {
                  res.status(200).json({
                    success: false,
                    message: 'Đăng nhập thất bại. Vượt quá thiết bị cho phép',
                    status: 'error',
                    token: null,
                    role: {},
                    type,
                    currentAuthority: 'guest'
                  });

                  return;
                }

                console.log('countUsersId', count);
                await MODELS.create(userTokenOfNotifications, {
                  usersId: userInfo.id,
                  clientId: clientId
                });
              }
            }

            res.status(200).json({
              success: true,
              status: 'ok',
              token,
              role: [],
              type,
              currentAuthority: [],
              ...dataToken
            });
          } else {
            res.status(200).json({
              success: false,
              message: 'Đăng nhập thất bại',
              status: 'error',
              token: null,
              role: {},
              type,
              currentAuthority: 'guest'
            });
          }
        } else {
          // next(new Error("Mật khẩu không đúng!"));
          throw new ApiErrors.BaseError({
            statusCode: 200,
            type: 'loginPassError',
            name: 'Login'
          });
        }
      } else {
        if (!userInfo.status) {
          throw new ApiErrors.BaseError({
            statusCode: 200,
            type: 'userInactiveError',
            name: 'Login'
          });
        } else if (!conditionExpire) {
          throw new ApiErrors.BaseError({
            statusCode: 200,
            type: 'userExpireError',
            name: 'Login'
          });
        }
      }
    }
  } catch (error) {
    // throw new ApiErrors.BaseError({
    //   statusCode: 200,
    //   type: 'loginError',
    //   error,
    //   name: 'Login'
    // })
    // console.log(error)
    next(error);
    // res.status(200).send(new Error(error).message)
  }
});

router.post('/', validateAuthen, async (req, res, next) => {
  try {
    console.log('authenticate body: ', req.body);
    const { userName, password, type, clientId } = req.body;
    // const passEncrypt = 'nbm@2018'
    // var encrypted = await encryptedString('hethong@gmail.com|AL7h8Jx4r8a8PjS5', passEncrypt)
    // 1bc2fef9ac032e211503b5690137d9e9addd3bfa8198d5b6f1d06513ec406190c0a7e282d83f648c7f47484b0e68b730
    // const decrypted = await decryptedString(data, passEncrypt)

    const user = {
      userName: userName,
      password,
      userGroupsId: { $in: [1, 3, 18] }
    };

    // if (decrypted && decrypted.split('|').length === 2) {
    //   user = { user: decrypted.split('|')[0], password: decrypted.split('|')[1] }
    // }

    let token;
    let dataToken;
    // let role;

    if (user && user.userName) {
      const userInfo = await usersController.find_one(user).catch(err => {
        ErrorHelpers.errorThrow(err, 'userNotFoundError', 'Login', 202);
        /* throw new ApiErrors.BaseError({
          statusCode: 200,
          type: 'userNotFoundError',
          error: err,
          name: 'Login'
        }) */

        // return;
      });

      // // const conditionExpire = moment(userInfo.dateExpire).format('YYYY-MM-DD HH:mm:ss') > Date.now() ?  true : false;

      // console.log("dateExpire: ", userInfo.dateExpire);
      // console.log("dateExpire: ", );
      const conditionExpire = false;

      if (!userInfo) {
        throw new ApiErrors.BaseError({
          statusCode: 200,
          type: 'userNotFoundError',
          name: 'Login'
        });
      }

      /* if (userInfo && userInfo.dateExpire) {
        console.log('Vao if kiem tra: ');
        conditionExpire = moment(userInfo.dateExpire).isAfter(moment());
      }

      console.log('conditionExpire: ', conditionExpire);
      */
      if (userInfo && userInfo.status === 1) {
        const passOk = await verifyPasswordMd5(user.password, userInfo.password);

        if (passOk) {
          dataToken = {
            user: userName,
            userId: userInfo.id,
            consultantOrganizations: userInfo.consultantOrganizations
          };
          token = jwt.sign(
            {
              ...dataToken
            },
            process.env.JWT_SECRET,
            {
              expiresIn: `${CONFIG.TOKEN_LOGIN_EXPIRE}`
              // algorithm: 'RS256'
            }
          );

          if (token) {
            if (clientId) {
              const findToken = await MODELS.findOne(userTokenOfNotifications, {
                where: {
                  usersId: userInfo.id,
                  clientId: clientId
                }
              });

              if (!findToken) {
                const countUsersId = await sequelize.query(
                  `select count(*) as count  from userTokenOfNotifications where usersId = ${userInfo.id}`
                );
                const count = countUsersId[0][0].count;

                if (count >= 5) {
                  res.status(200).json({
                    success: false,
                    message: 'Đăng nhập thất bại. Vượt quá thiết bị cho phép',
                    status: 'error',
                    token: null,
                    role: {},
                    type,
                    currentAuthority: 'guest'
                  });
                }

                console.log('countUsersId', count);
                await MODELS.create(userTokenOfNotifications, {
                  usersId: userInfo.id,
                  clientId: clientId
                });
              }
            }

            res.status(200).json({
              success: true,
              status: 'ok',
              token,
              role: [],
              type,
              currentAuthority: [],
              ...dataToken
            });
          } else {
            res.status(200).json({
              success: false,
              message: 'Đăng nhập thất bại',
              status: 'error',
              token: null,
              role: {},
              type,
              currentAuthority: 'guest'
            });
          }
        } else {
          // next(new Error("Mật khẩu không đúng!"));
          throw new ApiErrors.BaseError({
            statusCode: 200,
            type: 'loginPassError',
            name: 'Login'
          });
        }
      } else {
        if (!userInfo.status) {
          throw new ApiErrors.BaseError({
            statusCode: 200,
            type: 'userInactiveError',
            name: 'Login'
          });
        } else if (!conditionExpire) {
          throw new ApiErrors.BaseError({
            statusCode: 200,
            type: 'userExpireError',
            name: 'Login'
          });
        }
      }
    }
  } catch (error) {
    // throw new ApiErrors.BaseError({
    //   statusCode: 200,
    //   type: 'loginError',
    //   error,
    //   name: 'Login'
    // })
    // console.log(error)
    next(error);
    // res.status(200).send(new Error(error).message)
  }
});

export default router;
