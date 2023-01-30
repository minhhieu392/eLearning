import { Router } from 'express';

import menuController from '../controllers/menuController';
import menuValidate from '../validates/menuValidate';

const router = Router();

router.get("/", menuValidate.authenFilter, menuController.get_list)
router.get("/:id", menuController.get_one)
router.get("/find/list/parent-child", menuValidate.authenFilter, menuController.find_list_parentChild)
router.get("/find/all/parent-child", menuValidate.authenFilter, menuController.find_all_parentChild)
router.get("/make/menu", menuController.get_menu)

export default router;

