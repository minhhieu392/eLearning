import { Router } from 'express';

import bankAccountsValidate from '../validates/bankAccountsValidate';
import bankAccountsController from '../controllers/bankAccountsController';
// import { findUser, userValidator } from '../validators/userValidator';

const router = Router();

router.get('/', bankAccountsValidate.authenFilter, bankAccountsController.get_list);
router.get('/:id', bankAccountsController.get_one);
router.post('/', bankAccountsValidate.authenCreate, bankAccountsController.create);
router.put('/:id', bankAccountsValidate.authenUpdate, bankAccountsController.update);
router.put('/update-status/:id', bankAccountsValidate.authenUpdate_status, bankAccountsController.update_status);

export default router;
