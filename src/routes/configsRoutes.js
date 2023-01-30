import { Router } from 'express';

import configsValidate from '../validates/configsValidate';
import configsController from '../controllers/configsController';
// import { findUser, userValidator } from '../validators/userValidator';

const router = Router();

router.get('/', configsValidate.authenFilter, configsController.get_list);

router.get('/:id', configsController.get_one);

router.post('/', configsValidate.authenCreate, configsController.create);
router.put('/:id', configsValidate.authenUpdate, configsController.update);

export default router;
