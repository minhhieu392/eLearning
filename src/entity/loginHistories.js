/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define(
    'loginHistories',
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
      dateCreated: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
        field: 'dateCreated'
      },
      loginDate: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
        field: 'loginDate'
      }
    },
    {
      tableName: 'loginHistories',
      timestamps: false
    }
  );
};
