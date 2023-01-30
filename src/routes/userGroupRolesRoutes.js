import { Router } from 'express';

import userGroupRolesController from '../controllers/userGroupRolesController';
// import { findUser, userValidator } from '../validators/userValidator';

const router = Router();

router.get("/", userGroupRolesController.get_list)
router.get("/:id", userGroupRolesController.get_one)
// router.post("/", userGroupRolesController.create)
// router.put("/:id", userGroupRolesController.update)
// router.delete("/:id", roleController.delete)
// router.get("/find/all", userGroupRolesController.find_all)
router.post("/bulk/update/:userGroupsId", userGroupRolesController.bulk_update)
// router.get("/getAll", userGroupRolesController.get_all)

export default router;
