/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define(
    'courseLevels',
    {
      id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        field: 'id'
      },
      courseLevelsName: {
        type: DataTypes.STRING(200),
        allowNull: false,
        field: 'courseLevelsName'
      },
      order: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
        defaultValue: 0,
        field: 'order'
      },
      courseGroupsId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        field: 'courseGroupsId'
      },

      countExercises: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
        defaultValue: 0,
        field: 'countExercises'
      },
      countCourses: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
        defaultValue: 0,
        field: 'countCourses'
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
      tableName: 'courseLevels',
      timestamps: false
    }
  );
};
