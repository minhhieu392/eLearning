import { Router } from 'express';

import categoryValidate from '../validates/categoryValidate';
import categoryController from '../controllers/categoryController';
// import { findUser, userValidator } from '../validators/userValidator';

const router = Router();

router.get('/', categoryValidate.authenFilter, categoryController.get_list);
router.get('/:id', categoryController.get_one);
router.post('/', categoryValidate.authenCreate, categoryController.create);
router.put('/update/list', categoryValidate.authenBulkUpdate, categoryController.bulkUpdate);
router.put('/:id', categoryValidate.authenUpdate, categoryController.update);
// router.delete("/:id", categoryController.delete)
// router.get("/get/all",categoryValidate.authenFilter, categoryController.get_all);
router.get('/find/list/parent-child', categoryValidate.authenFilter, categoryController.find_list_parentChild);
router.get('/find/list/parent-child-one', categoryValidate.authenFilter, categoryController.find_list_parent_child_one);
// router.get("/find/all/parent-child", categoryValidate.authenFilter, categoryController.find_all_parentChild)
router.get('/test/tree', categoryValidate.authenFilter, categoryController.test_tree);
router.put('/update/orders', categoryValidate.authenUpdateOrder, categoryController.updateOrder);
router.put('/update/updateOrderHome', categoryValidate.authenUpdateOrderHome, categoryController.updateOrderHome);
router.put('/update-status/:id', categoryValidate.authenUpdate_status, categoryController.update_status);
export default router;
