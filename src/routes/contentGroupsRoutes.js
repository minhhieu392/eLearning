import { Router } from 'express';

import contentGroupsValidate from '../validates/contentGroupsValidate';
import contentGroupsController from '../controllers/contentGroupsController';
// import { findUser, userValidator } from '../validators/userValidator';

const router = Router();

router.get('/', contentGroupsValidate.authenFilter, contentGroupsController.get_list);

router.get('/:id', contentGroupsController.get_one);

router.post('/', contentGroupsValidate.authenCreate, contentGroupsController.create);
router.put('/:id', contentGroupsValidate.authenUpdate, contentGroupsController.update);
router.put('/update-status/:id', contentGroupsValidate.authenUpdate_status, contentGroupsController.update_status);

export default router;
