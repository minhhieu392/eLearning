import { Router } from 'express';

import wardsValidate from '../../validates/wardsValidate';
import wardsController from '../../controllers/wardsController';
// import { findUser, userValidator } from '../validators/userValidator';

const router = Router();

router.get('/', wardsValidate.authenFilter, wardsController.get_list);
router.get('/:id', wardsController.get_one);
export default router;
