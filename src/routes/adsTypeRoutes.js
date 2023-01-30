import { Router } from 'express';

import adsTypeValidate from '../validates/adsTypeValidate';
import adsTypeController from '../controllers/adsTypeController';
// import { findUser, userValidator } from '../validators/userValidator';

const router = Router();

router.get("/", adsTypeValidate.authenFilter, adsTypeController.get_list)
router.get("/:id", adsTypeController.get_one)
router.post("/", adsTypeValidate.authenCreate, adsTypeController.create)
router.put("/:id", adsTypeValidate.authenUpdate, adsTypeController.update)
router.put("/update-status/:id", adsTypeValidate.authenUpdate_status, adsTypeController.update_status)
export default router;

