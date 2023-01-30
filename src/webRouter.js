import { Router } from 'express';
import tokenRoutes from './web/routes/tokenRoutes';
import menuRoutes from './web/routes/menuRoutes';
import categoryRoutes from './web/routes/categoryRoutes';
import adsRoutes from './web/routes/adsRoutes';
import siteRoutes from './web/routes/siteRoutes';
import templateRoutes from './web/routes/templateRoutes';
import templateLayoutRoutes from './web/routes/templateLayoutRoutes';
import templateGroupRoutes from './web/routes/templateGroupRoutes';
import usersRoutes from './web/routes/usersRoutes';
import articleRoutes from './web/routes/articleRoutes';

//
import provincesRoutes from './web/routes/provincesRoutes';
import districtsRoutes from './web/routes/districtsRoutes';
import wardsRoutes from './web/routes/wardsRoutes';
//
import courseTypesRoutes from './routes/courseTypesRoutes';
import courseGroupsRoutes from './web/routes/courseGroupsRoutes';
import courseLevelsRoutes from './web/routes/courseLevelsRoutes';
import coursesRoutes from './web/routes/coursesRoutes';
import bannersRoutes from './web/routes/bannersRoutes';
import configsRoutes from './web/routes/configsRoutes';
import exercisesRoutes from './web/routes/exercisesRoutes';
import contentsRoutes from './web/routes/contents';
import contentGroupsRoutes from './web/routes/contentGroups';

/**
/**
 * Contains all API routes for the application.
 */
const router = Router();

router.use('/c/token', tokenRoutes);
router.use('/c/menus', menuRoutes);
router.use('/c/ads', adsRoutes);
router.use('/c/categories', categoryRoutes);
router.use('/c/sites', siteRoutes);
router.use('/c/templateGroups', templateGroupRoutes);
router.use('/c/templateLayouts', templateLayoutRoutes);
router.use('/c/templates', templateRoutes);
router.use('/c/users', usersRoutes);
router.use('/c/articles', articleRoutes);
router.use('/c/exercises', exercisesRoutes);

//
router.use('/c/provinces', provincesRoutes);
router.use('/c/districts', districtsRoutes);
router.use('/c/wards', wardsRoutes);
//
router.use('/c/courseTypes', courseTypesRoutes);
router.use('/c/courseGroups', courseGroupsRoutes);
router.use('/c/courseLevels', courseLevelsRoutes);
router.use('/c/courses', coursesRoutes);
router.use('/c/banners', bannersRoutes);
router.use('/c/configs', configsRoutes);
router.use('/c/contentGroups', contentGroupsRoutes);
router.use('/c/contents', contentsRoutes);

export default router;
