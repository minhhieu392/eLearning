import { Router } from 'express';
import jwt from 'jsonwebtoken';
import userController from '../controllers/usersController';
import ErrorHelpers from '../helpers/errorHelpers';
// import { getUserId } from '../utils';
import CONFIG from '../config';

const router = Router();

// router.get('/', async (req, res, next) => {
//   try {
//     console.log("currentUser req: ", req.headers)
//     const id = getUserId(req.headers['x-auth-key']);

//     if (id === -9999) {
//       res.send({ status: 401 })
//     } else {
//       const userInfo = await userController.find({ id })

//       // res.send({ status: 401 })
//       res.send(userInfo)
//     }
//   } catch (error) {
//     next(error)
//   }
//   // console.log("currentUser userInfo: ", userInfo)
// })

router.get('/', async (req, res, next) => {
  try {
    console.log('auth req: ', req.auth);
    const { auth } = req;

    if (auth && auth.userId) {
      const id = auth.userId;

      const userInfo = await userController.find({ id });

      // res.send({ status: 401 })
      res.send(userInfo);
    } else {
      const err = new Error('Not Authorized');

      err.code = 401;
      err.status = 401;
      err.message = 'Bạn chưa đăng nhập';

      next(err);
    }
  } catch (error) {
    next(error);
  }
  // console.log("currentUser userInfo: ", userInfo)
});

router.get('/refreshToken', async (req, res, next) => {
  try {
    const { auth } = req;
    const { userId } = auth;

    if (!auth || !userId) {
      const err = new Error('Not Authorized');

      err.code = 401;
      err.status = 401;
      err.message = 'Bạn chưa đăng nhập';

      throw err;
    }

    const userInfo = await await userController.find({ id: userId }).catch(err => {
      ErrorHelpers.errorThrow(err, 'userNotFoundError', 'Login', 202);
    });

    if (!userInfo) {
      const err = new Error('Not Authorized');

      err.code = 401;
      err.status = 401;
      err.message = 'Tài khoản không tồn tại';

      throw err;
    }

    try {
      const dataToken = {
        user: userInfo.username,
        userId: userInfo.id
        // groupUserId: userInfo.groupUserId,
        // placesIds: userInfo.places.map(e => e.id)
      };
      const token = jwt.sign(
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
        res.status(200).json({ success: true, status: 'ok', token, ...dataToken });
      } else {
        res
          .status(200)
          .json({
            success: false,
            message: 'Đăng nhập thất bại',
            status: 'error',
            token: null,
            currentAuthority: 'guest'
          });
      }
    } catch (err) {
      ErrorHelpers.errorThrow(err);
    }
  } catch (error) {
    next(error);
  }
});

export default router;
