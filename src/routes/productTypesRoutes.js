import { Router } from 'express';

import productTypesValidate from '../validates/productTypesValidate';
import productTypesController from '../controllers/productTypesController';
// import { findUser, userValidator } from '../validators/userValidator';

const router = Router();

router.get('/', productTypesValidate.authenFilter, productTypesController.get_list);
router.get('/:id', productTypesController.get_one);
router.post('/', productTypesValidate.authenCreate, productTypesController.create);
router.put('/:id', productTypesValidate.authenUpdate, productTypesController.update);
router.put('/update-status/:id', productTypesValidate.authenUpdate_status, productTypesController.update_status);

export default router;
