import { Router } from 'express';

import provincesValidate from '../../validates/provincesValidate';
import provincesController from '../../controllers/provincesController';

const router = Router();

router.get('/', provincesValidate.authenFilter, provincesController.get_list);
router.get('/:id', provincesController.get_one);

export default router;
