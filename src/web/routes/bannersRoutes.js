import { Router } from 'express';

import bannersValidate from '../../validates/bannersValidate';
import bannersController from '../../controllers/bannersController';
// import { findUser, userValidator } from '../validators/userValidator';

const router = Router();

router.get('/', bannersValidate.authenFilter, bannersController.get_list);

router.get('/:id', bannersController.get_one);

export default router;
