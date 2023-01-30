import { Router } from 'express';

import courseGroupsPackagesValidate from '../validates/courseGroupsPackagesValidate';
import courseGroupsPackagesController from '../controllers/courseGroupsPackagesController';
// import { findUser, userValidator } from '../validators/userValidator';

const router = Router();

router.get('/', courseGroupsPackagesValidate.authenFilter, courseGroupsPackagesController.get_list);

router.get('/:id', courseGroupsPackagesController.get_one);

router.post('/', courseGroupsPackagesValidate.authenCreate, courseGroupsPackagesController.create);
router.put('/:id', courseGroupsPackagesValidate.authenUpdate, courseGroupsPackagesController.update);
router.put(
  '/update-status/:id',
  courseGroupsPackagesValidate.authenUpdate_status,
  courseGroupsPackagesController.update_status
);

export default router;
