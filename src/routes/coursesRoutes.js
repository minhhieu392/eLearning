import { Router } from 'express';

import coursesValidate from '../validates/coursesValidate';
import coursesController from '../controllers/coursesController';
// import { findUser, userValidator } from '../validators/userValidator';

const router = Router();

router.get('/', coursesValidate.authenFilter, coursesController.get_list);

router.get('/:id', coursesController.get_one);
router.put('/order', coursesValidate.authenUpdateOrder, coursesController.updateOrder);

router.post('/', coursesValidate.authenCreate, coursesController.create);
router.put('/:id', coursesValidate.authenUpdate, coursesController.update);
router.put('/update-status/:id', coursesValidate.authenUpdate_status, coursesController.update_status);
router.post('/histories', coursesController.create_histories);

export default router;
