/* eslint-disable global-require */
import { Sequelize } from 'sequelize';
// import fs from 'fs';
// import path from 'path';
import associate from './references';
import { sequelize } from '../db/db';
import CachedRedis from '../db/myRedis';
import CONFIG from '../config';

// const basename = path.basename(__filename)
// const env = process.env.NODE_ENV || 'development'
const models = {};

/* fs.readdirSync(__dirname)
  .filter(function(file) {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  .forEach(function(file) {
    var model = sequelize['import'](path.join("./../src/models", file));
    db[model.name] = model;
  });

Object.keys(db).forEach(function(modelName) {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
}); */

const modules = [
  require('./ads'),
  require('./adsPositions'),
  require('./adsType'),
  require('./categories'),
  require('./groupSites'),
  require('./sites'),
  require('./menuPositions'),
  require('./menus'),
  require('./templateLayouts'),
  require('./templates'),
  require('./templateGroups'),
  require('./templateReceiptPrints'),
  require('./users'),
  require('./categoriesTemplateLayouts'),
  require('./categoriesUrlSlugs'),
  require('./templateLayoutTemplates'),
  require('./siteProfiles'),
  require('./languages'),
  require('./userGroups'),
  require('./userGroupRoles'),
  require('./article'),
  require('./articlesUrlSlugs'),
  // tinh thanh pho
  require('./districts'),
  require('./provinces'),
  require('./wards'),
  require('./villages'),
  require('./userTokens'),
  //
  require('./userTokenOfNotifications'),
  require('./notifications'),
  require('./usersNotifications'),
  //
  require('./courseGroups'),
  require('./courseLevels'),
  require('./courses'),
  require('./purchasedCourseGroups'),
  require('./exercises'),
  require('./questions'),
  require('./questionSuggestions'),
  require('./doQuestions'),
  require('./loginHistories'),
  require('./courseTypes'),
  require('./usersBookmarks'),
  require('./usersCourseHistories'),
  require('./doQuestionsHistories'),
  require('./bankAccounts'),
  require('./bankAccountTypes'),
  require('./banners'),
  require('./courseGroupsPackages'),
  require('./usersCourseGroups'),
  require('./configs'),
  require('./services'),
  require('./purchasedCourseGroupsDetails'),
  require('./usersServices'),
  require('./contents'),
  require('./contentGroups')
];

// Initialize models
modules.forEach(module => {
  const model = module(sequelize, Sequelize);

  console.log('model name ', model.name);
  // model.sync({
  //   alter: true,
  //   force: false
  // });
  models[model.name] = model;
});
// console.log("models db: ", db)

associate(models);
/* Object.keys(models).forEach(function (modelName) {
  // console.log("modelName: ", modelName)
  if ('associate' in models[modelName]) {
    models[modelName].associate(models);
  }
}); */

if (CONFIG['CACHED_DB_RESDIS'] === 'true') {
  // for (const model of models) {
  for (let index = 0; index < models.length; index++) {
    const model = models[index];

    const { sequelizeRedis } = new CachedRedis().initCached();
    const cachedSeconds = Number(CONFIG['CACHED_DB_MINUTES']) * 60;
    const modelCached = sequelizeRedis.getModel(model, {
      ttl: Number(cachedSeconds)
    });
    // const modelCached = model;

    models[index] = modelCached;
  }
}

models.sequelize = sequelize;
models.Sequelize = Sequelize;
models.Op = Sequelize.Op;

export default models;
