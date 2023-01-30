/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define(
    'exercises',
    {
      id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        field: 'id'
      },
      exercisesName: {
        type: DataTypes.TEXT,
        allowNull: false,
        field: 'exercisesName'
      },
      descriptions: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'descriptions'
      },
      courseLevelsId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        field: 'courseLevelsId'
      },
      order: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
        defaultValue: 0,
        field: 'order'
      },
      time: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
        defaultValue: 0,
        field: 'time'
      },
      countQuestions: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
        defaultValue: 0,
        field: 'countQuestions'
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
      },
      countQuestionsStatus: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
        field: 'countQuestionsStatus'
      },
      type: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
        field: 'type'
      },
      linkVideo: {
        type: DataTypes.STRING(500),
        allowNull: true,
        field: 'linkVideo'
      },
      files: {
        type: DataTypes.JSON,
        allowNull: true,
        field: 'files'
      }
    },
    {
      tableName: 'exercises',
      timestamps: false
    }
  );
};
