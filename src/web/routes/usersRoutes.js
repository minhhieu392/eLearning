import { Router } from 'express';

import userController from '../../controllers/usersController';
import usersValidate from '../../validates/usersValidate';
const router = Router();

router.post('/register', usersValidate.authenCreate, userController.register);
router.post('/registerByOtp', userController.registerByOtp);
router.post('/loginByEmail', usersValidate.authenLoginEmail, userController.loginByEmail);
router.post('/loginWithSocial', usersValidate.authenLoginSocical, userController.loginWithSocical);
router.post('/requestForgetPass', usersValidate.authenRequestForgetPass, userController.requestForgetPass);
router.post('/changePassByOpt', userController.changePassByOtp);
router.post('/accessOtp', userController.accessOtp);
router.get('/getlist/getByUserGroups', usersValidate.authenFilterbyUserGroups, userController.getByUserGroups);
export default router;
