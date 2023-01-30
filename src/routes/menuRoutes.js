import { Router } from 'express';

import menuController from '../controllers/menuController';
import menuValidate from '../validates/menuValidate';

const router = Router();

router.get("/", menuValidate.authenFilter, menuController.get_list)
router.get("/:id", menuController.get_one)
router.post("/", menuValidate.authenCreate, menuController.create)
router.put("/update/list", menuValidate.authenBulkUpdate, menuController.bulkUpdate);
router.put("/:id", menuValidate.authenUpdate,menuController.update)
router.get("/find/list/parent-child", menuValidate.authenFilter, menuController.find_list_parentChild)
router.get("/find/list/parent-child-one", menuValidate.authenFilter, menuController.find_list_parent_child_one)
router.put("/update/orders", menuValidate.authenUpdateOrder, menuController.updateOrder)
router.put("/update-status/:id", menuValidate.authenUpdate_status, menuController.update_status)
export default router;

