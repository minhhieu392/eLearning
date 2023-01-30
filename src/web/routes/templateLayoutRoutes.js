import { Router } from 'express';

import templateLayoutController from '../../controllers/templateLayoutController';
import templateLayoutValidate from '../../validates/templateLayoutValidate';

const router = Router();

router.get("/",templateLayoutValidate.authenFilter, templateLayoutController.get_list);
router.get("/:id",templateLayoutValidate.authenFilter, templateLayoutController.get_one);
// router.get("/get/all", templateLayoutValidate.authenFilter,templateLayoutController.get_all);


export default router;

