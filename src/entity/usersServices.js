/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define(
    'usersServices',
    {
      id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        field: 'id'
      },
      courseGroupsId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        field: 'courseGroupsId'
      },
      servicesId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        defaultValue: 0,
        field: 'servicesId'
      },
      usersId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        defaultValue: 0,
        field: 'usersId'
      },
      teachersId: {
        type: DataTypes.BIGINT,
        allowNull: true,
        defaultValue: 0,
        field: 'teachersId'
      },
      expiredDate: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'expiredDate'
      }
    },
    {
      tableName: 'usersServices',
      timestamps: false
    }
  );
};
