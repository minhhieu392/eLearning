import { Router } from 'express';

import notificationsValidate from '../validates/notificationsValidate';
import notificationsController from '../controllers/notificationsController';
// import { findUser, userValidator } from '../validators/userValidator';

const router = Router();

router.get('/users', notificationsValidate.authenFilterUsers, notificationsController.get_list_users);

router.get('/', notificationsValidate.authenFilter, notificationsController.get_list);
router.get('/:id', notificationsController.get_one);
router.post('/', notificationsValidate.authenCreate, notificationsController.create);
router.put('/:id', notificationsValidate.authenUpdate, notificationsController.update);
router.put('/update-status/:id', notificationsValidate.authenUpdate_status, notificationsController.update_status);

export default router;
