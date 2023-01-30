import { Router } from 'express';

import articleValidate from '../../validates/articleValidate';
import articleController from '../../controllers/articleController';

const router = Router();

router.get("/", articleValidate.authenFilter, articleController.get_list)
router.get("/:id", articleController.get_one)
// router.get("/get/all", articleValidate.authenFilter, articleController.get_all)
router.get(
    '/getlist/articles',
    articleValidate.authenFilterArticle_get,
    articleController.get_article_get
  );
router.get("/byid/:id", articleController.get_one_byId)
export default router;

