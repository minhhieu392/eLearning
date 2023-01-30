import { Router } from 'express';

import siteValidate from '../validates/siteValidate';
import siteController from '../controllers/siteController';
// import { findUser, userValidator } from '../validators/userValidator';

const router = Router();

router.get("/", siteValidate.authenFilter, siteController.get_list)
router.get("/:id", siteController.get_one)
router.get("/get/all", siteValidate.authenFilter, siteController.get_all)

export default router;

