import { Router } from 'express';

import districtsValidate from '../validates/districtsValidate';
import districtsController from '../controllers/districtsController';
// import { findUser, userValidator } from '../validators/userValidator';

const router = Router();

router.put('/centerPoint/all', districtsController.update_all_centerPoint);

router.get('/', districtsValidate.authenFilter, districtsController.get_list);
router.get('/multi/array', districtsValidate.authen_GetAll, districtsController.get_list_multi);
router.get('/:id', districtsController.get_one);
router.post('/', districtsValidate.authenCreate, districtsController.create);
router.post('/bulkCreate', districtsValidate.authenBulkCreateOrUpdate, districtsController.bulk_create);
router.put('/:id', districtsValidate.authenUpdate, districtsController.update);
router.put('/update-status/:id', districtsValidate.authenUpdate_status, districtsController.update_status);

export default router;
