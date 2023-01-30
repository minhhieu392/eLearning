import { Router } from 'express';

import staticsValidate from '../validates/staticsValidate';
import staticsController from '../controllers/staticsController';

const router = Router();

router.get('/doanh_thu', staticsValidate.bao_cao, staticsController.doanh_thu);
router.get('/khoa_hoc/top', staticsValidate.bao_cao, staticsController.khoa_hoc_top);
router.get('/khoa_hoc/top_khoa_hoc', staticsValidate.bao_cao, staticsController.top_khoa_hoc);
router.get('/hoc_vien/moi', staticsValidate.bao_cao, staticsController.hoc_vien_moi);
router.get('/hoc_vien/dang_ky', staticsValidate.bao_cao, staticsController.hoc_vien_dang_ky);
router.get('/khoa_hoc/ty_le_hoan_thanh', staticsValidate.bao_cao, staticsController.khoa_hoc_ty_le_hoan_thanh);
router.get('/dich_vu/top_dich_vu', staticsValidate.bao_cao, staticsController.top_dich_vu);

export default router;
