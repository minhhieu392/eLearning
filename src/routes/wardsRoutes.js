import { Router } from 'express';

import wardsValidate from '../validates/wardsValidate';
import wardsController from '../controllers/wardsController';
// import { findUser, userValidator } from '../validators/userValidator';

const router = Router();

router.put('/centerPoint/all', wardsController.update_all_centerPoint);

router.get('/', wardsValidate.authenFilter, wardsController.get_list);
router.get('/:id', wardsController.get_one);
router.post('/', wardsValidate.authenCreate, wardsController.create);
router.post('/bulkCreate', wardsValidate.authenBulkCreateOrUpdate, wardsController.bulk_create);
router.put('/:id', wardsValidate.authenUpdate, wardsController.update);
router.put('/update-status/:id', wardsValidate.authenUpdate_status, wardsController.update_status);
export default router;
