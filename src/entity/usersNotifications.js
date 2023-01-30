/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define(
    'usersNotifications',
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
      notificationsId: {
        type: DataTypes.BIGINT,
        allowNull: true,
        field: 'notificationsId'
      }
    },
    {
      tableName: 'usersNotifications',
      timestamps: false
    }
  );
};
