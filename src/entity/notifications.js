/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define(
    'notifications',
    {
      id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        field: 'id'
      },
      title: {
        type: DataTypes.STRING(200),
        allowNull: false,
        field: 'title'
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'message'
      },
      sendAll: {
        type: DataTypes.INTEGER(1),
        allowNull: true,
        defaultValue: 0,
        field: 'sendAll'
      },
      userCreatorsId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        field: 'userCreatorsId'
      },
      notInUsersId: {
        type: DataTypes.JSON,
        allowNull: true,
        field: 'notInUsersId'
      },
      courseGroupsId: {
        type: DataTypes.JSON,
        allowNull: true,
        field: 'courseGroupsId'
      },
      dateCreated: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
        field: 'dateCreated'
      },
      notificationTime: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
        field: 'notificationTime'
      },
      status: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'status'
      },
      sendStatus: {
        type: DataTypes.INTEGER(1),
        allowNull: true,
        defaultValue: 0,
        field: 'sendStatus'
      }
    },
    {
      tableName: 'notifications',
      timestamps: false
    }
  );
};
