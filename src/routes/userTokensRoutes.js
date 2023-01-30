import { Router } from 'express';

import userTokensValidate from '../validates/userTokensValidate';
import userTokensController from '../controllers/userTokensController';
// import { findUser, userValidator } from '../validators/userValidator';

const router = Router();

router.get('/', userTokensValidate.authenFilter, userTokensController.get_list);

export default router;
