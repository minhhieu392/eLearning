import { Router } from 'express';

import contentsValidate from '../../validates/contentsValidate';
import contentsController from '../../controllers/contentsController';

const router = Router();

router.get('/', contentsValidate.authenFilter, contentsController.get_list);

router.get('/:id', contentsController.get_one);

export default router;
