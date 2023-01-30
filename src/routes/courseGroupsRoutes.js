import { Router } from 'express';

import courseGroupsValidate from '../validates/courseGroupsValidate';
import courseGroupsController from '../controllers/courseGroupsController';
// import { findUser, userValidator } from '../validators/userValidator';

const router = Router();

router.get('/', courseGroupsValidate.authenFilter, courseGroupsController.get_list);

router.get('/:id', courseGroupsController.get_one);

router.post('/', courseGroupsValidate.authenCreate, courseGroupsController.create);
router.put('/:id', courseGroupsValidate.authenUpdate, courseGroupsController.update);
router.put('/update-status/:id', courseGroupsValidate.authenUpdate_status, courseGroupsController.update_status);

router.post('/bookmark', courseGroupsController.create_bookmark);
// router.post('/purchased', courseGroupsController.create_purchased);
router.delete('/bookmark', courseGroupsController.delete_bookmark);
// router.delete('/purchased', courseGroupsController.delete_purchased);

export default router;
