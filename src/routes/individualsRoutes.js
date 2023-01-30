import { Router } from 'express';

import individualsValidate from '../validates/individualsValidate';
import individualsController from '../controllers/individualsController';
// import { findUser, userValidator } from '../validators/userValidator';

const router = Router();

router.get('/', individualsValidate.authenFilter, individualsController.get_list);
router.get('/map', individualsValidate.authenFilter, individualsController.get_all_map);

router.get('/:id', individualsController.get_one);
router.post('/bulkCreate', individualsValidate.authenBulkCreateOrUpdate, individualsController.bulk_create);
router.post('/', individualsValidate.authenCreate, individualsController.create);
router.put('/:id', individualsValidate.authenUpdate, individualsController.update);
router.put('/update-status/:id', individualsValidate.authenUpdate_status, individualsController.update_status);

export default router;
