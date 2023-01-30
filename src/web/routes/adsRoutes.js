import { Router } from 'express';

import adsValidate from '../validates/adsValidate';
import adsController from '../controllers/adsController';

const router = Router();

router.get("/", adsValidate.authenFilter, adsController.get_list)
router.get("/:id", adsController.get_one)
// router.get("/get/all",adsValidate.authenFilter, adsValidate.authenFilter, adsController.get_all)

export default router;

