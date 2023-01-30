/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define(
    'questions',
    {
      id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        field: 'id'
      },
      questionsName: {
        type: DataTypes.TEXT,
        allowNull: false,
        field: 'questionsName'
      },
      exercisesId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        field: 'exercisesId'
      },
      order: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
        defaultValue: 0,
        field: 'order'
      }
    },
    {
      tableName: 'questions',
      timestamps: false
    }
  );
};
