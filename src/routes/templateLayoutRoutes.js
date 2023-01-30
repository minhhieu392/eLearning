import { Router } from 'express';

import templateLayoutValidate from '../validates/templateLayoutValidate';
import templateLayoutController from '../controllers/templateLayoutController';
// import { findUser, userValidator } from '../validators/userValidator';

const router = Router();

router.get('/', templateLayoutValidate.authenFilter, templateLayoutController.get_list);
router.get('/:id', templateLayoutController.get_one);
router.post('/', templateLayoutValidate.authenCreate, templateLayoutController.create);
router.put('/:id', templateLayoutValidate.authenUpdate, templateLayoutController.update);
router.get('/get/all', templateLayoutValidate.authenFilter, templateLayoutController.get_all);
router.put('/update-status/:id', templateLayoutValidate.authenUpdate_status, templateLayoutController.update_status);
export default router;
