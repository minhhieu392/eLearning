/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define(
    'userTokenOfNotifications',
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
        allowNull: true,
        field: 'usersId'
      },
      clientId: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'clientId'
      },
      status: {
        type: DataTypes.INTEGER(1),
        allowNull: true,
        defaultValue: 1,
        field: 'status'
      }
    },
    {
      tableName: 'userTokenOfNotifications',
      timestamps: false
    }
  );
};
