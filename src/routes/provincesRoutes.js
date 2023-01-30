import { Router } from 'express';

import provincesValidate from '../validates/provincesValidate';
import provincesController from '../controllers/provincesController';
// import { findUser, userValidator } from '../validators/userValidator';

const router = Router();

router.put('/centerPoint/all', provincesController.update_all_centerPoint);

router.get('/', provincesValidate.authenFilter, provincesController.get_list);
router.get('/multi/array', provincesValidate.authen_GetAll, provincesController.get_list_multi);
router.get('/:id', provincesController.get_one);
router.post('/bulkCreate', provincesValidate.authenBulkCreateOrUpdate, provincesController.bulk_create);
router.post('/', provincesValidate.authenCreate, provincesController.create);
router.put('/:id', provincesValidate.authenUpdate, provincesController.update);
router.put('/update-status/:id', provincesValidate.authenUpdate_status, provincesController.update_status);

export default router;
