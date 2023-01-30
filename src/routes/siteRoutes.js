import { Router } from 'express';

import siteValidate from '../validates/siteValidate';
import siteController from '../controllers/siteController';
// import { findUser, userValidator } from '../validators/userValidator';

const router = Router();

router.get("/", siteValidate.authenFilter, siteController.get_list)
router.get("/:id", siteController.get_one)
router.post("/", siteValidate.authenCreate, siteController.create)
router.put("/:id", siteValidate.authenUpdate, siteController.update)
router.put("/update-status/:id", siteValidate.authenUpdate_status, siteController.update_status)

export default router;

