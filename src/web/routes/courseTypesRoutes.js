import { Router } from 'express';

import courseTypesValidate from '../../validates/courseTypesValidate';
import courseTypesController from '../../controllers/courseTypesController';
// import { findUser, userValidator } from '../validators/userValidator';

const router = Router();

router.get('/', courseTypesValidate.authenFilter, courseTypesController.get_list);

router.get('/:id', courseTypesController.get_one);

export default router;
