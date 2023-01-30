/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define(
    'questionSuggestions',
    {
      id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        field: 'id'
      },
      questionSuggestionsName: {
        type: DataTypes.STRING(200),
        allowNull: false,
        field: 'questionSuggestionsName'
      },
      questionsId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        field: 'questionsId'
      },
      correctAnswer: {
        type: DataTypes.INTEGER(1),
        allowNull: true,
        defaultValue: 0,
        field: 'correctAnswer'
      }
    },
    {
      tableName: 'questionSuggestions',
      timestamps: false
    }
  );
};
