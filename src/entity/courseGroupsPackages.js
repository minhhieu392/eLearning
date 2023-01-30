/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define(
    'courseGroupsPackages',
    {
      id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        field: 'id'
      },
      courseGroupsPackagesName: {
        type: DataTypes.STRING(200),
        allowNull: false,
        field: 'courseGroupsPackagesName'
      },
      code: {
        type: DataTypes.STRING(200),
        allowNull: false,
        field: 'code'
      },
      numberOfDays: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
        field: 'numberOfDays'
      },
      promotionalMoney: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
        field: 'promotionalMoney'
      },
      money: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
        field: 'money'
      },
      courseGroupsId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        field: 'courseGroupsId'
      },
      userCreatorsId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        field: 'userCreatorsId'
      },
      dateCreated: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
        field: 'dateCreated'
      },
      dateUpdated: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
        field: 'dateUpdated'
      },
      status: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'status'
      }
    },
    {
      tableName: 'courseGroupsPackages',
      timestamps: false
    }
  );
};
