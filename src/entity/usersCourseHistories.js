/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define(
    'usersCourseHistories',
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
      coursesId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        field: 'coursesId'
      },
      status: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
        field: 'status'
      }
    },
    {
      tableName: 'usersCourseHistories',
      timestamps: false
    }
  );
};
