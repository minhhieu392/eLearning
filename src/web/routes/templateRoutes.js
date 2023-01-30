import { Router } from 'express';

import templateController from '../../controllers/templateController';
import templateValidate from '../../validates/templateValidate';
const router = Router();

router.get("/",templateValidate.authenFilter, templateController.get_list);
router.get("/:id",templateValidate.authenFilter, templateController.get_one);
// router.get("/get/all",templateValidate.authenFilter, templateController.get_all);


export default router;

