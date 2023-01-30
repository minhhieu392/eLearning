import { Router } from 'express';

import articleValidate from '../validates/articleValidate';
import articleController from '../controllers/articleController';
// import { findUser, userValidator } from '../validators/userValidator';

const router = Router();

router.get("/", articleValidate.authenFilter, articleController.get_list)
router.get("/:id", articleController.get_one)
router.post("/", articleValidate.authenCreate, articleController.create)
router.put("/:id", articleValidate.authenUpdate, articleController.update)
router.put("/update-status/:id", articleValidate.authenUpdate_status, articleController.update_status)
router.get(
    '/getlist/articles',
    articleValidate.authenFilterArticle_get,
    articleController.get_article_get
  );
export default router;

