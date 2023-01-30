import { Router } from 'express';

import languagesValidate from '../validates/languagesValidate';
import languagesController from '../controllers/languagesController';

const router = Router();

router.get("/", languagesValidate.authenFilter, languagesController.get_list)
router.get("/:id", languagesController.get_one)
router.post("/", languagesValidate.authenCreate, languagesController.create)
router.put("/:id", languagesValidate.authenUpdate, languagesController.update)

export default router;

