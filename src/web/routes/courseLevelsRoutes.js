import { Router } from 'express';

import courseLevelsValidate from '../../validates/courseLevelsValidate';
import courseLevelsController from '../../controllers/courseLevelsController';
// import { findUser, userValidator } from '../validators/userValidator';

const router = Router();

router.get('/', courseLevelsValidate.authenFilter, courseLevelsController.get_list);

router.get('/:id', courseLevelsController.get_one);

export default router;
