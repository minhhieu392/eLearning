import { Router } from 'express';

import groupSiteValidate from '../validates/groupSiteValidate';
import groupSiteController from '../controllers/groupSiteController';
// import { findUser, userValidator } from '../validators/userValidator';

const router = Router();

router.get("/", groupSiteValidate.authenFilter, groupSiteController.get_list)
router.get("/:id", groupSiteController.get_one)
router.post("/", groupSiteValidate.authenCreate, groupSiteController.create)
router.put("/:id", groupSiteValidate.authenUpdate, groupSiteController.update)
router.put("/update-status/:id", groupSiteValidate.authenUpdate_status, groupSiteController.update_status)

export default router;

