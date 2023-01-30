import { Router } from 'express';

import contentGroupsValidate from '../../validates/contentGroupsValidate';
import contentGroupsController from '../../controllers/contentGroupsController';

const router = Router();

router.get('/', contentGroupsValidate.authenFilter, contentGroupsController.get_list);

router.get('/:id', contentGroupsController.get_one);

export default router;
