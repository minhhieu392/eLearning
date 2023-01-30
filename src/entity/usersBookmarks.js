/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define(
    'usersBookmarks',
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
      }
    },
    {
      tableName: 'usersBookmarks',
      timestamps: false
    }
  );
};
