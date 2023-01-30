/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define(
    'menus',
    {
      id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        field: 'id'
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: 'name'
      },
      sitesId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        field: 'sitesId'
      },
      url: {
        type: DataTypes.STRING(300),
        allowNull: true,
        field: 'url'
      },
      displayChild: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: true,
        field: 'displayChild'
      },
      icon: {
        type: DataTypes.STRING(20),
        allowNull: true,
        field: 'icon'
      },
      parentId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        field: 'parentId'
      },
      menuPositionsId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        field: 'menuPositionsId'
      },
      orderBy: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        field: 'orderBy'
      },
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
      urlSlugs: {
        type: DataTypes.STRING(500),
        allowNull: true,
        field: 'urlSlugs'
      },
      languagesId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        field: 'languagesId'
      }
    },
    {
      tableName: 'menus',
      timestamps: false
    }
  );
};
