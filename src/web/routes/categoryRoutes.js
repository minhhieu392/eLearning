import { Router } from 'express';

import categoryValidate from '../validates/categoryValidate';
import categoryController from '../controllers/categoryController';

const router = Router();

router.get("/", categoryValidate.authenFilter, categoryController.get_list)
router.get("/:id", categoryController.get_one)
// router.get("/get/all", categoryValidate.authenFilter, categoryController.get_all)
router.get("/find/list/parent-child", categoryValidate.authenTreeFilter, categoryController.find_list_parentChild)
router.get("/find/getbycategories/parent-child", categoryValidate.authenTreeFilter, categoryController.find_getbycategories_parentChild)
export default router;

