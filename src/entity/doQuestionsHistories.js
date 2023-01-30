/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define(
    'doQuestionsHistories',
    {
      id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        field: 'id'
      },
      usersId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        field: 'usersId'
      },
      exercisesId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        field: 'exercisesId'
      },
      dateCreated: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
        field: 'dateCreated'
      },
      doQuestionsHistoriesDate: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
        field: 'doQuestionsHistoriesDate'
      }
    },
    {
      tableName: 'doQuestionsHistories',
      timestamps: false
    }
  );
};
