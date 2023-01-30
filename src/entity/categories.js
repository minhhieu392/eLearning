/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define(
    'categories',
    {
      id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        field: 'id'
      },
      name: {
        type: DataTypes.STRING(200),
        allowNull: false,
        field: 'name'
      },
      sitesId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        field: 'sitesId'
      },
      url: {
        type: DataTypes.STRING(500),
        allowNull: true,
        field: 'url'
      },
      image: {
        type: DataTypes.JSON,
        allowNull: true,
        field: 'image',
        defaultValue: []
      },
      seoKeywords: {
        type: DataTypes.STRING(200),
        allowNull: true,
        field: 'seoKeywords'
      },
      seoDescriptions: {
        type: DataTypes.STRING(200),
        allowNull: true,
        field: 'seoDescriptions'
      },
      parentId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        field: 'parentId'
      },
      // templateLayoutsId: {
      // 	type: DataTypes.BIGINT,
      // 	allowNull: false,
      // 	field: 'template_layouts_id'
      // },
      usersCreatorId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        field: 'usersCreatorId'
      },
      createDate: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
        field: 'createDate'
      },
      status: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        field: 'status'
      },
      isHome: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        field: 'isHome'
      },
      descriptions: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'descriptions'
      },
      orderBy: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'orderBy'
      },
      urlSlugs: {
        type: DataTypes.STRING(500),
        allowNull: true,
        field: 'urlSlugs'
      },
      typesId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'typesId'
      },
      orderHome: {
        type: DataTypes.STRING(20),
        allowNull: true,
        field: 'orderHome'
      },
      languagesId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        field: 'languagesId'
      }
    },
    {
      tableName: 'categories',
      timestamps: false
    }
  );
};
