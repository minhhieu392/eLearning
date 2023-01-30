import { Router } from 'express';

import userController from '../controllers/usersController';
import usersValidate from '../validates/usersValidate';
// import { findUser, userValidator } from '../validators/userValidator';

const router = Router();

router.post("/changepass/:id", userController.changePass)
router.post("/resetpass/:id", userController.resetPass)
router.post("/loginByEmail",usersValidate.authenLoginEmail, userController.loginByEmail)

export default router;
