/* jshint indent: 1 */

module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    'categoriesTemplateLayouts',
    {
      id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        field: 'id'
      },
      templateLayoutsId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        field: 'templateLayoutsId'
      },
      categoriesId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        field: 'categoriesId'
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
      isHome: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        field: 'isHome'
      },
      status: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        field: 'status'
      }
    },
    {
      tableName: 'categories_TemplateLayouts',
      timestamps: false
    }
  );
};
