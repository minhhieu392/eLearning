import { Router } from 'express';

import adsPositionValidate from '../validates/adsPositionValidate';
import adsPositionController from '../controllers/adsPositionController';
// import { findUser, userValidator } from '../validators/userValidator';

const router = Router();

router.get("/", adsPositionValidate.authenFilter, adsPositionController.get_list)
router.get("/:id", adsPositionController.get_one)
router.post("/", adsPositionValidate.authenCreate, adsPositionController.create)
router.put("/:id", adsPositionValidate.authenUpdate, adsPositionController.update)
router.put("/update-status/:id", adsPositionValidate.authenUpdate_status, adsPositionController.update_status)
export default router;

