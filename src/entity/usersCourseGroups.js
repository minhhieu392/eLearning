/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define(
    'usersCourseGroups',
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
      courseGroupsId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        field: 'courseGroupsId'
      },
      expiredDate: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
        field: 'expiredDate'
      }
    },
    {
      tableName: 'usersCourseGroups',
      timestamps: false
    }
  );
};
