export default models => {
  // eslint-disable-next-line no-empty-pattern
  const {
    ads,
    adsPositions,
    adsType,
    sites,
    categories,
    languages,
    templates,
    templateGroups,
    templateLayouts,
    categoriesTemplateLayouts,
    users,
    menuPositions,
    menus,
    groupSites,
    categoriesUrlSlugs,
    templateLayoutTemplates,
    siteProfiles,
    userGroupRoles,
    userGroups,
    article,
    articlesUrlSlugs,
    //  tinh-thanhpho
    provinces,
    wards,
    districts,
    villages,
    userTokens,
    courseGroups,
    courseLevels,
    courses,
    purchasedCourseGroups,
    questions,
    questionSuggestions,
    doQuestions,
    loginHistories,
    courseTypes,
    usersBookmarks,
    usersCourseHistories,
    doQuestionsHistories,
    exercises,
    notifications,
    usersNotifications,
    bankAccounts,
    bankAccountTypes,
    banners,
    userTokenOfNotifications,
    courseGroupsPackages,
    usersCourseGroups,
    services,
    purchasedCourseGroupsDetails,
    contents,
    contentGroups,
    usersServices
    //
  } = models;

  // NHÓM NGƯỜI DÙNG
  userGroups.belongsTo(users, {
    foreignKey: 'userCreatorsId',
    as: 'userCreators'
  });
  // Quyền
  userGroupRoles.belongsTo(menus, {
    foreignKey: 'menusId',
    as: 'menus'
  });
  userGroupRoles.belongsTo(userGroups, {
    foreignKey: 'userGroupsId',
    as: 'userGroups'
  });

  menus.belongsTo(menus, {
    foreignKey: 'parentId',
    as: 'parent'
  });
  menus.belongsTo(menuPositions, {
    foreignKey: 'menuPositionsId',
    as: 'menuPositions'
  });
  menus.belongsTo(users, {
    foreignKey: 'usersCreatorId',
    as: 'usersCreator'
  });
  menus.belongsTo(sites, {
    foreignKey: 'sitesId',
    as: 'sites'
  });

  menus.hasMany(userGroupRoles, {
    foreignKey: 'menusId',
    as: 'userGroupRoles'
  });
  menuPositions.belongsTo(users, {
    foreignKey: 'usersCreatorId',
    as: 'usersCreator'
  });

  sites.belongsTo(templates, {
    foreignKey: 'templatesId',
    as: 'templates'
  });
  sites.belongsTo(groupSites, {
    foreignKey: 'groupSitesId',
    as: 'groupSites'
  });
  sites.belongsTo(users, {
    foreignKey: 'usersCreatorId',
    as: 'usersCreator'
  });

  templateLayouts.belongsTo(users, {
    foreignKey: 'usersCreatorId',
    as: 'usersCreator'
  });

  templates.belongsTo(users, {
    foreignKey: 'usersCreatorId',
    as: 'usersCreator'
  });

  users.belongsTo(userGroups, {
    foreignKey: 'userGroupsId',
    as: 'userGroups'
  });
  users.belongsTo(users, {
    foreignKey: 'userCreatorsId',
    as: 'usersCreators'
  });

  adsPositions.belongsTo(sites, {
    foreignKey: 'sitesId',
    as: 'sites'
  });
  adsPositions.belongsTo(users, {
    foreignKey: 'usersCreatorId',
    as: 'usersCreator'
  });

  ads.belongsTo(sites, {
    foreignKey: 'sitesId',
    as: 'sites'
  });
  ads.belongsTo(adsPositions, {
    foreignKey: 'adsPositionsId',
    as: 'adsPositions'
  });
  ads.belongsTo(adsType, {
    foreignKey: 'adsTypeId',
    as: 'adsType'
  });
  ads.belongsTo(users, {
    foreignKey: 'usersCreatorId',
    as: 'usersCreator'
  });

  adsType.belongsTo(sites, {
    foreignKey: 'sitesId',
    as: 'sites'
  });
  adsType.belongsTo(users, {
    foreignKey: 'usersCreatorId',
    as: 'usersCreator'
  });

  // categories.belongsTo(templateLayouts, { foreignKey: 'templateLayoutsId', as: 'templateLayouts' });

  // categories.belongsTo(categoriesTemplateLayouts, { foreignKey: 'categoriesId', as: 'categories' });
  categories.belongsToMany(templateLayouts, {
    through: { model: categoriesTemplateLayouts, unique: false },
    foreignKey: 'categoriesId',
    as: 'templateLayouts'
  });
  categories.hasMany(categoriesTemplateLayouts, {
    foreignKey: 'categoriesId',
    as: 'categoriesTemplateLayout'
  });

  templateLayouts.belongsToMany(categories, {
    through: { model: categoriesTemplateLayouts, unique: false },
    foreignKey: 'templateLayoutsId',
    as: 'categories'
  });
  categoriesTemplateLayouts.belongsTo(templateLayouts, {
    foreignKey: 'templateLayoutsId',
    as: 'templateLayouts'
  });
  categories.hasMany(categoriesUrlSlugs, {
    foreignKey: 'categoriesId',
    as: 'categoriesUrlSlugs'
  });

  categories.belongsTo(sites, {
    foreignKey: 'sitesId',
    as: 'sites'
  });
  categories.belongsTo(categories, {
    foreignKey: 'parentId',
    as: 'parent'
  });
  categories.belongsTo(users, {
    foreignKey: 'usersCreatorId',
    as: 'usersCreator'
  });

  groupSites.belongsTo(users, {
    foreignKey: 'usersCreatorId',
    as: 'usersCreator'
  });

  templates.belongsTo(templateGroups, {
    foreignKey: 'templateGroupsId',
    as: 'templateGroups'
  });
  templates.hasOne(sites, {
    foreignKey: 'templatesId',
    as: 'sites'
  });
  templateGroups.belongsTo(users, {
    foreignKey: 'usersCreatorId',
    as: 'usersCreator'
  });

  templateLayouts.belongsToMany(templates, {
    through: { model: templateLayoutTemplates, unique: false },
    foreignKey: 'templateLayoutsId',
    as: 'templates'
  });

  templates.belongsToMany(templateLayouts, {
    through: { model: templateLayoutTemplates, unique: false },
    foreignKey: 'templatesId',
    as: 'templateLayouts'
  });

  templates.hasMany(templateLayoutTemplates, {
    foreignKey: 'templatesId',
    as: 'templateLayoutTemplates'
  });

  siteProfiles.belongsTo(sites, {
    foreignKey: 'sitesId',
    as: 'sites'
  });

  sites.hasMany(siteProfiles, {
    foreignKey: 'sitesId',
    as: 'siteProfiles'
  });

  ads.belongsTo(languages, {
    foreignKey: 'languagesId',
    as: 'languages'
  });

  categories.belongsTo(languages, {
    foreignKey: 'languagesId',
    as: 'languages'
  });
  menus.belongsTo(languages, {
    foreignKey: 'languagesId',
    as: 'languages'
  });
  siteProfiles.belongsTo(languages, {
    foreignKey: 'languagesId',
    as: 'languages'
  });

  article.belongsTo(categories, {
    foreignKey: 'categoriesId',
    as: 'categories'
  });
  article.belongsTo(users, {
    foreignKey: 'usersCreatorId',
    as: 'usersCreator'
  });
  article.hasMany(articlesUrlSlugs, {
    foreignKey: 'articlesId',
    as: 'articlesUrlSlugs'
  });

  // tinh -tp
  villages.belongsTo(wards, {
    foreignKey: 'wardsId',
    as: 'wards'
  });
  villages.belongsTo(users, {
    foreignKey: 'userCreatorsId',
    as: 'userCreators'
  });
  wards.hasMany(villages, {
    foreignKey: 'wardsId',
    as: 'villages'
  });

  wards.belongsTo(districts, {
    foreignKey: 'districtsId',
    as: 'districts'
  });
  wards.belongsTo(users, {
    foreignKey: 'userCreatorsId',
    as: 'userCreators'
  });
  districts.belongsTo(provinces, {
    foreignKey: 'provincesId',
    as: 'provinces'
  });
  districts.hasMany(wards, {
    foreignKey: 'districtsId',
    as: 'wards'
  });
  districts.belongsTo(users, {
    foreignKey: 'userCreatorsId',
    as: 'userCreators'
  });
  provinces.belongsTo(users, {
    foreignKey: 'userCreatorsId',
    as: 'userCreators'
  });
  users.hasMany(userTokens, {
    foreignKey: 'usersId',
    as: 'userTokens'
  });

  userTokens.belongsTo(users, {
    foreignKey: 'usersId',
    as: 'users'
  });

  //

  courseTypes.belongsTo(users, {
    foreignKey: 'userCreatorsId',
    as: 'userCreators'
  });
  courseGroups.belongsTo(users, {
    foreignKey: 'userCreatorsId',
    as: 'userCreators'
  });
  courseGroups.belongsTo(courseTypes, {
    foreignKey: 'courseTypesId',
    as: 'courseTypes'
  });
  courseGroups.hasMany(courseLevels, {
    foreignKey: 'courseGroupsId',
    as: 'courseLevels'
  });
  courseLevels.belongsTo(users, {
    foreignKey: 'userCreatorsId',
    as: 'userCreators'
  });
  courseLevels.belongsTo(courseGroups, {
    foreignKey: 'courseGroupsId',
    as: 'courseGroups'
  });

  courseLevels.hasMany(exercises, {
    foreignKey: 'courseLevelsId',
    as: 'exercises'
  });
  courses.belongsTo(courseLevels, {
    foreignKey: 'courseLevelsId',
    as: 'courseLevels'
  });
  courseLevels.hasMany(courses, {
    foreignKey: 'courseLevelsId',
    as: 'courses'
  });
  courses.belongsTo(users, {
    foreignKey: 'userCreatorsId',
    as: 'userCreators'
  });
  courses.hasOne(usersCourseHistories, {
    foreignKey: 'coursesId',
    as: 'viewed'
  });
  exercises.hasMany(questions, {
    foreignKey: 'exercisesId',
    as: 'questions'
  });
  exercises.belongsTo(courseLevels, {
    foreignKey: 'courseLevelsId',
    as: 'courseLevels'
  });
  questions.hasMany(questionSuggestions, {
    foreignKey: 'questionsId',
    as: 'questionSuggestions'
  });
  questions.hasOne(doQuestions, {
    foreignKey: 'questionsId',
    as: 'doQuestions'
  });
  questionSuggestions.hasOne(doQuestions, {
    foreignKey: 'questionSuggestionsId',
    as: 'doQuestions'
  });

  courseGroups.hasMany(purchasedCourseGroups, {
    foreignKey: 'courseGroupsId',
    as: 'purchasedCourseGroups'
  });

  purchasedCourseGroups.hasMany(purchasedCourseGroupsDetails, {
    foreignKey: 'purchasedCourseGroupsId',
    as: 'purchasedCourseGroupsDetails'
  });

  services.hasOne(usersServices, {
    foreignKey: 'servicesId',
    as: 'usersServices'
  });

  usersServices.belongsTo(users, {
    foreignKey: 'usersId',
    as: 'users'
  });

  usersServices.belongsTo(users, {
    foreignKey: 'teachersId',
    as: 'teachers'
  });

  usersServices.belongsTo(services, {
    foreignKey: 'servicesId',
    as: 'services'
  });

  usersServices.belongsTo(courseGroups, {
    foreignKey: 'courseGroupsId',
    as: 'courseGroups'
  });

  courseGroups.hasOne(usersBookmarks, {
    foreignKey: 'courseGroupsId',
    as: 'bookmark'
  });

  users.hasMany(purchasedCourseGroups, {
    foreignKey: 'usersId',
    as: 'purchasedCourseGroups'
  });
  users.hasMany(userTokenOfNotifications, {
    foreignKey: 'usersId',
    as: 'userTokenOfNotifications'
  });
  userTokenOfNotifications.belongsTo(users, {
    foreignKey: 'usersId',
    as: 'users'
  });
  purchasedCourseGroups.belongsTo(users, {
    foreignKey: 'usersId',
    as: 'users'
  });
  loginHistories.belongsTo(users, {
    foreignKey: 'usersId',
    as: 'users'
  });
  doQuestionsHistories.belongsTo(users, {
    foreignKey: 'usersId',
    as: 'users'
  });
  doQuestionsHistories.belongsTo(exercises, {
    foreignKey: 'exercisesId',
    as: 'exercises'
  });
  exercises.hasOne(doQuestionsHistories, {
    foreignKey: 'exercisesId',
    as: 'doQuestionsHistories'
  });

  doQuestions.belongsTo(questions, {
    foreignKey: 'questionsId',
    as: 'questions'
  });

  purchasedCourseGroups.belongsTo(users, {
    foreignKey: 'userCreatorsId',
    as: 'userCreators'
  });

  purchasedCourseGroupsDetails.belongsTo(services, {
    foreignKey: 'servicesId',
    as: 'services'
  });

  purchasedCourseGroups.belongsTo(courseGroups, {
    foreignKey: 'courseGroupsId',
    as: 'courseGroups'
  });
  purchasedCourseGroups.belongsTo(courseGroupsPackages, {
    foreignKey: 'courseGroupsPackagesId',
    as: 'courseGroupsPackages'
  });

  notifications.hasMany(usersNotifications, {
    foreignKey: 'notificationsId',
    as: 'usersNotifications'
  });

  usersNotifications.belongsTo(users, {
    foreignKey: 'usersId',
    as: 'users'
  });

  bankAccounts.belongsTo(users, {
    foreignKey: 'userCreatorsId',
    as: 'userCreators'
  });
  bankAccounts.belongsTo(bankAccountTypes, {
    foreignKey: 'bankAccountTypesId',
    as: 'bankAccountTypes'
  });
  bankAccountTypes.belongsTo(users, {
    foreignKey: 'userCreatorsId',
    as: 'userCreators'
  });
  banners.belongsTo(users, {
    foreignKey: 'userCreatorsId',
    as: 'userCreators'
  });

  courseGroupsPackages.belongsTo(users, {
    foreignKey: 'userCreatorsId',
    as: 'userCreators'
  });
  courseGroupsPackages.belongsTo(courseGroups, {
    foreignKey: 'courseGroupsId',
    as: 'courseGroups'
  });

  courseGroups.hasMany(courseGroupsPackages, {
    foreignKey: 'courseGroupsId',
    as: 'courseGroupsPackages'
  });
  courseGroups.hasOne(usersCourseGroups, {
    foreignKey: 'courseGroupsId',
    as: 'purchased'
  });

  courseGroups.hasMany(usersCourseGroups, {
    foreignKey: 'courseGroupsId',
    as: 'usersCourseGroups'
  });

  users.hasMany(usersCourseGroups, {
    foreignKey: 'usersId',
    as: 'usersCourseGroups'
  });

  purchasedCourseGroups.hasOne(usersCourseGroups, {
    foreignKey: 'courseGroupsId',
    as: 'usersCourseGroups',
    sourceKey: 'courseGroupsId'
  });

  purchasedCourseGroupsDetails.belongsTo(purchasedCourseGroups, {
    foreignKey: 'purchasedCourseGroupsId',
    as: 'purchasedCourseGroups'
  });

  users.hasOne(usersNotifications, {
    foreignKey: 'usersId',
    as: 'usersNotifications'
  });

  services.belongsTo(users, {
    foreignKey: 'userCreatorsId',
    as: 'userCreators'
  });

  contents.belongsTo(contentGroups, {
    foreignKey: 'contentGroupsId',
    as: 'contentGroups'
  });

  contents.belongsTo(users, {
    foreignKey: 'userCreatorsId',
    as: 'userCreators'
  });

  contentGroups.belongsTo(users, {
    foreignKey: 'userCreatorsId',
    as: 'userCreators'
  });
};
