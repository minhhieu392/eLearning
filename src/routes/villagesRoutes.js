import { Router } from 'express';

import villagesValidate from '../validates/villagesValidate';
import villagesController from '../controllers/villagesController';

const router = Router();

router.get('/', villagesValidate.authenFilter, villagesController.get_list);
router.get('/multi/array', villagesValidate.authen_GetAll, villagesController.get_list_multi);
router.post('/bulkCreate', villagesValidate.authenBulkCreateOrUpdate, villagesController.bulk_create);
router.get('/:id', villagesController.get_one);
router.post('/', villagesValidate.authenCreate, villagesController.create);
router.put('/:id', villagesValidate.authenUpdate, villagesController.update);
router.put('/update-status/:id', villagesValidate.authenUpdate_status, villagesController.update_status);
export default router;
