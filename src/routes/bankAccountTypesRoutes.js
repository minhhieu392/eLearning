import { Router } from 'express';

import bankAccountTypesValidate from '../validates/bankAccountTypesValidate';
import bankAccountTypesController from '../controllers/bankAccountTypesController';
// import { findUser, userValidator } from '../validators/userValidator';

const router = Router();

router.get('/', bankAccountTypesValidate.authenFilter, bankAccountTypesController.get_list);

router.get('/:id', bankAccountTypesController.get_one);

router.post('/', bankAccountTypesValidate.authenCreate, bankAccountTypesController.create);
router.put('/:id', bankAccountTypesValidate.authenUpdate, bankAccountTypesController.update);
router.put(
  '/update-status/:id',
  bankAccountTypesValidate.authenUpdate_status,
  bankAccountTypesController.update_status
);

export default router;
