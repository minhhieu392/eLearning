import { Router } from 'express';

import ownersValidate from '../validates/ownersValidate';
import ownersController from '../controllers/ownersController';
// import { findUser, userValidator } from '../validators/userValidator';

const router = Router();

router.get('/', ownersValidate.authenFilter, ownersController.get_list);

router.get('/detail/:id', ownersController.get_detail);
router.get('/:id', ownersController.get_one);
router.post('/bulkCreate', ownersValidate.authenBulkCreateOrUpdate, ownersController.bulk_create);
router.post('/', ownersValidate.authenCreate, ownersController.create);
router.put('/:id', ownersValidate.authenUpdate, ownersController.update);
router.put('/update-status/:id', ownersValidate.authenUpdate_status, ownersController.update_status);

export default router;
