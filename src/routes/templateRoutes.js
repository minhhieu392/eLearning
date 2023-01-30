import { Router } from 'express';

import templateValidate from '../validates/templateValidate';
import templateController from '../controllers/templateController';
// import { findUser, userValidator } from '../validators/userValidator';

const router = Router();

router.get("/", templateValidate.authenFilter, templateController.get_list);
router.get("/:id", templateController.get_one);
router.post("/", templateValidate.authenCreate, templateController.create);
router.put("/:id", templateValidate.authenUpdate, templateController.update);
router.put("/update-status/:id", templateValidate.authenUpdate_status, templateController.update_status)
export default router;

