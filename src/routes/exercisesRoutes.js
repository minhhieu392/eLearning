import { Router } from 'express';

import exercisesValidate from '../validates/exercisesValidate';
import exercisesController from '../controllers/exercisesController';
// import { findUser, userValidator } from '../validators/userValidator';

const router = Router();

router.get('/', exercisesValidate.authenFilter, exercisesController.get_list);
router.get('/:id', exercisesController.get_one);
router.post('/', exercisesValidate.authenCreate, exercisesController.create);
router.put('/order', exercisesValidate.authenUpdateOrder, exercisesController.updateOrder);

router.put('/:id', exercisesValidate.authenUpdate, exercisesController.update);
router.delete('/:id', exercisesController.delete);
router.put('/update-status/:id', exercisesValidate.authenUpdate_status, exercisesController.update_status);

export default router;
