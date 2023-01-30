import { Router } from 'express';

import siteProfileValidate from '../validates/siteProfileValidate';
import siteProfileController from '../controllers/siteProfileController';
// import { findUser, userValidator } from '../validators/userValidator';

const router = Router();

router.get("/", siteProfileValidate.authenFilter, siteProfileController.get_list)
router.get("/:id", siteProfileController.get_one)
router.post("/", siteProfileValidate.authenCreate, siteProfileController.create)
router.put("/:id", siteProfileValidate.authenUpdate, siteProfileController.update)

export default router;

