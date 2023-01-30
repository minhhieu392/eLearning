import { Router } from 'express';

import servicesValidate from '../validates/servicesValidate';
import servicesController from '../controllers/servicesController';
const router = Router();

router.get('/', servicesValidate.authenFilter, servicesController.get_list);
router.get('/:id', servicesController.get_one);
router.post('/', servicesValidate.authenCreate, servicesController.create);
router.put('/:id', servicesValidate.authenUpdate, servicesController.update);
// router.delete('/:id', servicesController.delete);
router.put('/update-status/:id', servicesValidate.authenUpdate_status, servicesController.update_status);

export default router;
