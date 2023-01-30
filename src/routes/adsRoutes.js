import { Router } from 'express';

import adsValidate from '../validates/adsValidate';
import adsController from '../controllers/adsController';
// import { findUser, userValidator } from '../validators/userValidator';

const router = Router();

router.get("/", adsValidate.authenFilter, adsController.get_list)
router.get("/:id", adsController.get_one)
router.post("/", adsValidate.authenCreate, adsController.create)
router.put("/:id", adsValidate.authenUpdate, adsController.update)
router.put("/update-status/:id", adsValidate.authenUpdate_status, adsController.update_status)
router.put("/update/orders", adsValidate.authenUpdateOrder, adsController.updateOrder)
export default router;

