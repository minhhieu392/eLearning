import { Router } from 'express';
import adsPositionRoutes from './routes/adsPositionRoutes';
import adsRoutes from './routes/adsRoutes';
import adsTypeRoutes from './routes/adsTypeRoutes';
import categoryRoutes from './routes/categoryRoutes';
import currentUserRoutes from './routes/currentUserRoutes';
import groupSiteRoutes from './routes/groupSiteRoutes';
import menuPositionRoutes from './routes/menuPositionRoutes';
import menuRoutes from './routes/menuRoutes';
import siteProfileRoutes from './routes/siteProfileRoutes';
import siteRoutes from './routes/siteRoutes';
import templateGroupRoutes from './routes/templateGroupRoutes';
import templateLayoutRoutes from './routes/templateLayoutRoutes';
import templateRoutes from './routes/templateRoutes';
import tokenRoutes from './routes/tokenRoutes';
import userGroupRolesRoutes from './routes/userGroupRolesRoutes';
import userGroupsRoutes from './routes/userGroupsRoutes';
import userPassRoutes from './routes/userPassRoutes';
import usersRoutes from './routes/usersRoutes';
import swaggerSpec from './utils/swagger';
import languagesRoutes from './routes/languagesRoutes';
import articleRoutes from './routes/articleRoutes';
import userTokensRoutes from './routes/userTokensRoutes';
//
import provincesRoutes from './routes/provincesRoutes';
import districtsRoutes from './routes/districtsRoutes';
import wardsRoutes from './routes/wardsRoutes';
import villagesRoutes from './routes/villagesRoutes';
//
import courseTypesRoutes from './routes/courseTypesRoutes';
import courseGroupsRoutes from './routes/courseGroupsRoutes';
import courseLevelsRoutes from './routes/courseLevelsRoutes';
import coursesRoutes from './routes/coursesRoutes';
import exercisesRoutes from './routes/exercisesRoutes';
import questionsRoutes from './routes/questionsRoutes';
import doQuestionsRoutes from './routes/doQuestionsRoutes';
import purchasedCourseGroupsRoutes from './routes/purchasedCourseGroupsRoutes';
import notificationsRoutes from './routes/notificationsRoutes';

import bankAccountsRoutes from './routes/bankAccountsRoutes';
import bankAccountTypesRoutes from './routes/bankAccountTypesRoutes';
import bannersRoutes from './routes/bannersRoutes';

import staticsRoutes from './routes/staticsRoutes';
import courseGroupsPackagesRoutes from './routes/courseGroupsPackagesRoutes';
import configsRoutes from './routes/configsRoutes';
import servicesRoutes from './routes/servicesRoutes';
import contentGroupsRoutes from './routes/contentGroupsRoutes';
import contentsRoutes from './routes/contentsRoutes';
import usersServicesRoutes from './routes/usersServicesRoutes';

/**
 * Contains all API routes for the application.
 */
const router = Router();

/**
 * GET /swagger.json
 */
router.get('/swagger.json', (req, res) => {
  res.json(swaggerSpec);
});

/**
 * GET /api
 */
router.get('/', (req, res) => {
  res.json({
    app: req.app.locals.title,
    apiVersion: req.app.locals.version
  });
});

router.use('/c/token', tokenRoutes);
router.use('/c/currentUser', currentUserRoutes);
router.use('/c/users', usersRoutes);
router.use('/c/userspass', userPassRoutes);
router.use('/c/menus', menuRoutes);
router.use('/c/adsPositions', adsPositionRoutes);
router.use('/c/adsTypes', adsTypeRoutes);
router.use('/c/ads', adsRoutes);
router.use('/c/categories', categoryRoutes);
router.use('/c/groupSites', groupSiteRoutes);
router.use('/c/menuPositions', menuPositionRoutes);
router.use('/c/sites', siteRoutes);
router.use('/c/templateLayouts', templateLayoutRoutes);
router.use('/c/templates', templateRoutes);
router.use('/c/templateGroups', templateGroupRoutes);
router.use('/c/siteProfiles', siteProfileRoutes);
router.use('/c/userGroups', userGroupsRoutes);
router.use('/c/userGroupRoles', userGroupRolesRoutes);
router.use('/c/languages', languagesRoutes);
router.use('/c/articles', articleRoutes);
router.use('/c/configs', configsRoutes);
//
router.use('/c/provinces', provincesRoutes);
router.use('/c/villages', villagesRoutes);
router.use('/c/districts', districtsRoutes);
router.use('/c/wards', wardsRoutes);
router.use('/c/userTokens', userTokensRoutes);
router.use('/c/notifications', notificationsRoutes);

//
router.use('/c/courseTypes', courseTypesRoutes);
router.use('/c/courseGroups', courseGroupsRoutes);
router.use('/c/courseGroupsPackages', courseGroupsPackagesRoutes);
router.use('/c/courseLevels', courseLevelsRoutes);
router.use('/c/courses', coursesRoutes);
router.use('/c/exercises', exercisesRoutes);
router.use('/c/questions', questionsRoutes);
router.use('/c/doQuestions', doQuestionsRoutes);
router.use('/c/purchasedCourseGroups', purchasedCourseGroupsRoutes);
router.use('/c/bankAccounts', bankAccountsRoutes);
router.use('/c/bankAccountTypes', bankAccountTypesRoutes);
router.use('/c/banners', bannersRoutes);
router.use('/c/statics', staticsRoutes);
router.use('/c/services', servicesRoutes);
router.use('/c/contentGroups', contentGroupsRoutes);
router.use('/c/contents', contentsRoutes);
router.use('/c/usersServices', usersServicesRoutes);
export default router;
