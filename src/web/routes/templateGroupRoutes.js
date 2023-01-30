import { Router } from 'express';

import templateGroupController from '../../controllers/templateGroupController';
import templateGroupValidate from '../../validates/templateGroupValidate';
const router = Router();

router.get("/", templateGroupValidate.authenFilter, templateGroupController.get_list);
router.get("/:id", templateGroupValidate.authenFilter, templateGroupController.get_one);
router.get("/find/list/parent-child", templateGroupValidate.authenFilter, templateGroupController.find_list_parentChild);
export default router;

