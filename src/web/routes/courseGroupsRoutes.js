import { Router } from 'express';

import courseGroupsValidate from '../../validates/courseGroupsValidate';
import courseGroupsController from '../../controllers/courseGroupsController';
// import { findUser, userValidator } from '../validators/userValidator';

const router = Router();

router.get('/', courseGroupsValidate.authenFilter, courseGroupsController.get_list);

router.get('/:id', courseGroupsController.get_one);

export default router;
