import { Router } from 'express';

import templateGroupController from '../controllers/templateGroupController';
import templateGroupValidate from '../validates/templateGroupValidate';
const router = Router();

router.put("/update/list", templateGroupValidate.authenBulkUpdate, templateGroupController.bulkUpdate);
router.get("/",templateGroupValidate.authenFilter, templateGroupController.get_list);
router.get("/:id",templateGroupValidate.authenFilter, templateGroupController.get_one);
router.post("/", templateGroupValidate.authenCreate,templateGroupController.create);

router.put("/:id", templateGroupValidate.authenUpdate,templateGroupController.update);
// router.get("/get/all", templateGroupValidate.authenFilter,templateGroupController.get_all);
router.get("/find/list/parent-child", templateGroupValidate.authenFilter, templateGroupController.find_list_parentChild)
router.get("/find/list/parent-child-one", templateGroupValidate.authenFilter, templateGroupController.find_list_parentChild_one)
// router.get("/find/all/parent-child", templateGroupValidate.authenFilter, templateGroupController.find_all_parentChild)
router.get("/make/template-group", templateGroupController.get_template_group);
router.put("/update/orders", templateGroupValidate.authenUpdateOrder, templateGroupController.updateOrder);
router.put("/update-status/:id", templateGroupValidate.authenUpdate_status, templateGroupController.update_status)

export default router;

