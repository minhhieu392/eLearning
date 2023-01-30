import { Router } from 'express';

import courseTypesValidate from '../validates/courseTypesValidate';
import courseTypesController from '../controllers/courseTypesController';
// import { findUser, userValidator } from '../validators/userValidator';

const router = Router();

router.get('/', courseTypesValidate.authenFilter, courseTypesController.get_list);

router.get('/:id', courseTypesController.get_one);

router.post('/', courseTypesValidate.authenCreate, courseTypesController.create);
router.put('/:id', courseTypesValidate.authenUpdate, courseTypesController.update);
router.put('/update-status/:id', courseTypesValidate.authenUpdate_status, courseTypesController.update_status);

export default router;
