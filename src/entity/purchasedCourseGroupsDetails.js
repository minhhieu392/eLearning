/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define(
    'purchasedCourseGroupsDetails',
    {
      id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        field: 'id'
      },
      purchasedCourseGroupsId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        field: 'purchasedCourseGroupsId'
      },

      servicesId: {
        type: DataTypes.BIGINT,
        allowNull: true,
        defaultValue: 0,
        field: 'servicesId'
      },
      money: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
        field: 'money'
      }
    },
    {
      tableName: 'purchasedCourseGroupsDetails',
      timestamps: false
    }
  );
};
