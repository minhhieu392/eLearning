import { Router } from 'express';

import coursesValidate from '../../validates/coursesValidate';
import coursesController from '../../controllers/coursesController';
// import { findUser, userValidator } from '../validators/userValidator';

const router = Router();

router.get('/', coursesValidate.authenFilter, coursesController.get_list);

router.get('/:id', coursesController.get_one);

export default router;
