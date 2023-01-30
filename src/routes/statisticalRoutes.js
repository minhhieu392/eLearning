import { Router } from 'express';

import statisticalServicesValidate from '../validates/statisticalServicesValidate';
import statisticalController from '../controllers/statisticalController';
// import { findUser, userValidator } from '../validators/userValidator';

const router = Router();

router.get(
  '/individuals/byOwner',
  statisticalServicesValidate.authenFilterIndividuals,
  statisticalController.individualsByOwner
);

router.get(
  '/individuals/byDVHC',
  statisticalServicesValidate.authenFilterIndividuals,
  statisticalController.individualsByDVHC
);

router.get(
  '/individuals/bySpeciesGroups',
  statisticalServicesValidate.authenFilterIndividuals,
  statisticalController.individualsBySpeciesGroups
);
export default router;
