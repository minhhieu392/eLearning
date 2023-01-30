import { Router } from 'express';

import bannersValidate from '../validates/bannersValidate';
import bannersController from '../controllers/bannersController';
// import { findUser, userValidator } from '../validators/userValidator';

const router = Router();

router.get('/', bannersValidate.authenFilter, bannersController.get_list);

router.get('/:id', bannersController.get_one);

router.post('/', bannersValidate.authenCreate, bannersController.create);
router.put('/:id', bannersValidate.authenUpdate, bannersController.update);
router.put('/update-status/:id', bannersValidate.authenUpdate_status, bannersController.update_status);

export default router;
