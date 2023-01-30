import { Router } from 'express';

import menuPositionValidate from '../validates/menuPositionValidate';
import menuPositionController from '../controllers/menuPositionController';
// import { findUser, userValidator } from '../validators/userValidator';

const router = Router();

router.get("/", menuPositionValidate.authenFilter, menuPositionController.get_list)
router.get("/:id", menuPositionController.get_one)
router.post("/", menuPositionValidate.authenCreate, menuPositionController.create)
router.put("/:id", menuPositionValidate.authenUpdate, menuPositionController.update)
router.put("/update-status/:id", menuPositionValidate.authenUpdate_status, menuPositionController.update_status)
export default router;

