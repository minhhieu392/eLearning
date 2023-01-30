import { Router } from 'express';

import courseLevelsValidate from '../validates/courseLevelsValidate';
import courseLevelsController from '../controllers/courseLevelsController';
// import { findUser, userValidator } from '../validators/userValidator';

const router = Router();

router.get('/', courseLevelsValidate.authenFilter, courseLevelsController.get_list);

router.get('/:id', courseLevelsController.get_one);

router.post('/', courseLevelsValidate.authenCreate, courseLevelsController.create);
router.put('/order', courseLevelsValidate.authenUpdateOrder, courseLevelsController.updateOrder);
router.put('/:id', courseLevelsValidate.authenUpdate, courseLevelsController.update);
router.put('/update-status/:id', courseLevelsValidate.authenUpdate_status, courseLevelsController.update_status);

export default router;
