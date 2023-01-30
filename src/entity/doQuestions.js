/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define(
    'doQuestions',
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
      questionsId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        field: 'questionsId'
      },
      questionSuggestionsId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        field: 'questionSuggestionsId'
      },
      dateCreated: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
        field: 'dateCreated'
      }
    },
    {
      tableName: 'doQuestions',
      timestamps: false
    }
  );
};
