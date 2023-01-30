/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define(
    'purchasedCourseGroups',
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
      courseGroupsPackagesId: {
        type: DataTypes.BIGINT,
        allowNull: true,
        defaultValue: 0,
        field: 'courseGroupsPackagesId'
      },

      courseGroupsId: {
        type: DataTypes.BIGINT,
        allowNull: true,
        defaultValue: 0,
        field: 'courseGroupsId'
      },
      expiredDate: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
        field: 'expiredDate'
      },
      code: {
        type: DataTypes.STRING(200),
        allowNull: true,
        field: 'code'
      },
      money: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
        field: 'money'
      },
      purchasedCourseGroupsMoney: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
        field: 'purchasedCourseGroupsMoney'
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
      tableName: 'purchasedCourseGroups',
      timestamps: false
    }
  );
};
