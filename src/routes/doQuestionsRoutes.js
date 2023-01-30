import { Router } from 'express';

import doQuestionsValidate from '../validates/doQuestionsValidate';
import doQuestionsController from '../controllers/doQuestionsController';
// import { findUser, userValidator } from '../validators/userValidator';

const router = Router();

router.get('/', doQuestionsValidate.authenFilter, doQuestionsController.get_list);
// router.get('/:id', doQuestionsController.get_one);
router.post('/', doQuestionsValidate.authenCreate, doQuestionsController.create);

export default router;
