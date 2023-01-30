/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define(
    'courses',
    {
      id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        field: 'id'
      },
      coursesName: {
        type: DataTypes.STRING(200),
        allowNull: false,
        field: 'coursesName'
      },
      order: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
        defaultValue: 0,
        field: 'order'
      },
      videoLength: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
        defaultValue: 0,
        field: 'videoLength'
      },
      descriptions: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'descriptions'
      },
      image: {
        type: DataTypes.JSON,
        allowNull: true,
        field: 'image'
      },
      link: {
        type: DataTypes.STRING(500),
        allowNull: true,

        field: 'link'
      },
      courseLevelsId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        field: 'courseLevelsId'
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
      tableName: 'courses',
      timestamps: false
    }
  );
};
