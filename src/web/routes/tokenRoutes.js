import { Router } from 'express';

import tokenController from '../../controllers/tokenController';

const router = Router();

router.post("/createToken", tokenController.createToken)
router.get("/verifyToken", tokenController.verifyToken)
export default router;

