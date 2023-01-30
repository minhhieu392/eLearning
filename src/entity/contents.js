/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define(
    'contents',
    {
      id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        field: 'id'
      },
      contentsName: {
        type: DataTypes.STRING(500),
        allowNull: false,
        field: 'contentsName'
      },
      url: {
        type: DataTypes.STRING(500),
        allowNull: true,
        field: 'url'
      },
      contentGroupsId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        field: 'contentGroupsId'
      },

      shortDescriptions: {
        type: DataTypes.TEXT,
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
        allowNull: false,
        field: 'images',
        defaultValue: '[]'
      },

      userCreatorsId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        field: 'userCreatorsId'
      },
      dateCreated: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
        field: 'dateCreated'
      },
      dateUpdated: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
        field: 'dateUpdated'
      },
      status: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'status'
      }
    },
    {
      tableName: 'contents',
      timestamps: false
    }
  );
};
