/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define(
    'templateGroups',
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
      parentId: {
        type: DataTypes.STRING(300),
        field: 'parentId'
      },
      orderBy: {
        type: DataTypes.INTEGER(11),
        field: 'orderBy'
      },
      createDate: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
        field: 'createDate'
      },
      usersCreatorId: {
        type: DataTypes.BIGINT,
        field: 'usersCreatorId'
      },
      status: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        field: 'status'
      },
      urlSlugs: {
        type: DataTypes.STRING(500),
        field: 'urlSlugs'
      },
      images: {
        type: DataTypes.JSON,
        field: 'images'
      }
    },
    {
      tableName: 'templateGroups',
      timestamps: false
    }
  );
};
