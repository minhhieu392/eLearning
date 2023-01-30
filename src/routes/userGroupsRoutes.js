import { Router } from 'express';

import userGroupsValidate from '../validates/userGroupsValidate';
import userGroupsController from '../controllers/userGroupsController';
// import { findUser, userValidator } from '../validators/userValidator';

const router = Router();

router.get("/", userGroupsValidate.authenFilter, userGroupsController.get_list)
router.get("/:id", userGroupsController.get_one)
router.post("/", userGroupsValidate.authenCreate, userGroupsController.create)
router.put("/:id", userGroupsValidate.authenUpdate, userGroupsController.update)
router.put("/update-status/:id", userGroupsValidate.authenUpdate_status, userGroupsController.update_status)
// router.delete("/:id", groupUserController.delete)
// router.get("/get/all",userGroupsValidate.authenFilter, userGroupsController.get_all)

export default router;

