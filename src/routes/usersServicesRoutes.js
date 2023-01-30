import { Router } from 'express';

import usersServicesValidate from '../validates/usersServicesValidate';
import usersServicesController from '../controllers/usersServicesController';
// import { findUser, userValidator } from '../validators/userValidator';

const router = Router();

router.get('/', usersServicesValidate.authenFilter, usersServicesController.get_list);

router.get('/:id', usersServicesController.get_one);

// router.post('/', usersServicesValidate.authenCreate, usersServicesController.create);
router.put('/', usersServicesValidate.authenUpdate, usersServicesController.update);

export default router;
