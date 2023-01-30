/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define(
    'templates',
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
      folder: {
        type: DataTypes.STRING(300),
        allowNull: false,
        field: 'folder'
      },
      usersCreatorId: {
        type: DataTypes.BIGINT(20),
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
      templateGroupsId: {
        type: DataTypes.BIGINT(20),
        allowNull: true,
        defaultValue: 0,
        field: 'templateGroupsId'
      },
      shortDescriptions: {
        type: DataTypes.STRING(500),
        allowNull: true,
        field: 'shortDescriptions'
      },
      descriptions: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'descriptions'
      },
      images: {
        type: DataTypes.JSON,
        allowNull: true,
        field: 'images'
      },
      price: {
        type: DataTypes.BIGINT(20),
        allowNull: true,
        field: 'price'
      },
      promotionPrice: {
        type: DataTypes.BIGINT(20),
        allowNull: true,
        field: 'promotionPrice'
      },
      link: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'link'
      }
    },
    {
      tableName: 'templates',
      timestamps: false
    }
  );
};
