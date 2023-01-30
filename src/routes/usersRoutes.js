import { Router } from 'express';

import userController from '../controllers/usersController';
import usersValidate from '../validates/usersValidate';
// import { findUser, userValidator } from '../validators/userValidator';

const router = Router();

router.get('/', usersValidate.authenFilter, userController.get_list);
// router.get("/export", usersValidate.authenFilter, userController.get_list_export)
router.get('/:id', userController.get_one);
router.post('/', usersValidate.authenCreate, userController.create);
router.post('/register', usersValidate.authenCreate, userController.register);
router.put('/:id', usersValidate.authenUpdate, userController.update);
router.put('/update-status/:id', usersValidate.authenUpdate_status, userController.update_status);
router.put('/changePass/:id', userController.changePass);
router.put('/resetPass/:id', userController.resetPass);
router.post('/requestForgetPass', usersValidate.authenRequestForgetPass, userController.requestForgetPass);
router.get('/getlist/getByUserGroups', usersValidate.authenFilterbyUserGroups, userController.getByUserGroups);
router.post('/logout', userController.logout);
router.put(
  '/settingNotifications/:id',
  usersValidate.authenUpdate_status,
  userController.update_userTokenOfNotifications_status
);

export default router;
