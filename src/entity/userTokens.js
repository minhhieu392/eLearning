/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define(
    'userTokens',
    {
      id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        field: 'id'
      },
      userTokenCode: {
        type: DataTypes.STRING(4),
        allowNull: false,
        field: 'userTokenCode'
      },
      usersId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        field: 'usersId'
      },
      dateExpired: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
        field: 'dateExpired'
      },
      type: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'type'
      },
      resultId: {
        type: DataTypes.BIGINT,
        allowNull: true,
        defaultValue: 0,
        field: 'resultId'
      },
      status: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
        field: 'status'
      }
    },
    {
      tableName: 'userTokens',
      timestamps: false
    }
  );
};
