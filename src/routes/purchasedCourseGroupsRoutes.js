import { Router } from 'express';

import purchasedCourseGroupsValidate from '../validates/purchasedCourseGroupsValidate';
import purchasedCourseGroupsController from '../controllers/purchasedCourseGroupsController';
// import { findUser, userValidator } from '../validators/userValidator';

const router = Router();

router.get('/', purchasedCourseGroupsValidate.authenFilter, purchasedCourseGroupsController.get_list);

router.get('/:id', purchasedCourseGroupsController.get_one);

router.post('/', purchasedCourseGroupsValidate.authenCreate, purchasedCourseGroupsController.create);
router.put('/:id', purchasedCourseGroupsValidate.authenUpdate, purchasedCourseGroupsController.update);
router.put(
  '/update-status/:id',
  purchasedCourseGroupsValidate.authenUpdate_status,
  purchasedCourseGroupsController.update_status
);

export default router;
