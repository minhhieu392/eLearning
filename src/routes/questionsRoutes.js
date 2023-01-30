import { Router } from 'express';

import questionsValidate from '../validates/questionsValidate';
import questionsController from '../controllers/questionsController';
// import { findUser, userValidator } from '../validators/userValidator';

const router = Router();

router.get('/', questionsValidate.authenFilter, questionsController.get_list);
router.get('/:id', questionsController.get_one);
router.post('/', questionsValidate.authenCreate, questionsController.create);
router.put('/:id', questionsValidate.authenUpdate, questionsController.update);
router.delete('/:id', questionsController.delete);

export default router;
